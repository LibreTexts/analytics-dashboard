var axios = require('axios');
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
app.use(bodyParser.json());
app.use(cors());
require("dotenv").config();
const basicAuth = require('express-basic-auth')

const coll = process.env.COLL;
const pageColl = process.env.PCOLL;
const adaptColl = process.env.ACOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;
const hashKey = process.env.studentHash;
const userPassword = process.env.userPassword;

app.use(basicAuth({
    users: { 'admin': userPassword },
    challenge: true
}))

function encryptStudent(student) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.studentHash;
  const iv = Buffer.from(key, 'hex');
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  student = cipher.update(student, 'utf8', 'hex')
  student += cipher.final('hex')

  return student;
}

function decryptStudent(student) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.studentHash;
  const iv = Buffer.from(key, 'hex');;

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = '';
  decipher.on('readable', () => {
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk.toString('utf8');
    }
  });

  decipher.write(student, 'hex');
  decipher.end();
  return decrypted
}

var enrollmentQuery = {
  "collection": "enrollments",
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        // '_id': '$email',
        // 'courses': {'$addToSet': '$class'}
        '_id': '$class',
        'students': {'$addToSet': '$email'}
      }
    }
  ]
}

var adaptCodeQuery = {
  "collection": "adaptCodes",
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        '_id': '$url',
        'code': {'$first': '$adaptCode'},
        'course': {'$first': '$courseId'},
        'isInAdapt': {'$first': '$isInAdapt'}
      }
    } //,
    // {
    //   '$lookup': {
    //     'from': 'ltanalytics',
    //     'localField': "_id",
    //     'foreignField': "object.url",
    //     'as': "lt"
    //   }
    // },
    // {
    //   '$addFields': {
    //     'course': {'$first': '$lt.actor.courseName'}
    //   }
    // },
    // {
    //   '$unset': [
    //     'lt'
    //   ]
    // } //,
    // {
    //   '$lookup': {
    //     'from': "adapt",
    //     'localField': "code",
    //     'foreignField': "class",
    //     'as': "adapt",
    //     'pipeline': [
    //       {
    //         '$group': {
    //           '_id': '$class'
    //         }
    //       }
    //     ]
    //   }
    // },
    // {
    //   '$project': {
    //     '_id': '$_id',
    //     'url': '$url',
    //     'course': '$course',
    //     'code': '$code',
    //     'isInAdapt':
    //       {'$cond': {
    //         'if': {
    //           '$gt': [{'$size': '$adapt'}, 0]
    //         },
    //         'then': true,
    //         'else': false
    //       }
    //     }
    //   }
    // }
  ]
}

function adaptLevelQuery(params, adaptCodes) {
  //console.log(params.courseId)
    var codeFound = adaptCodes.find(o => o.course === params.courseId)
    //console.log(codeFound)
    var data = {
      "collection": adaptColl,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ["$class", codeFound.code]}
              ]
            }
          }
        },
        {
          '$group': {
            '_id': {
              'level_group': '$level_group',
              'level_name': '$level_name'
            }
          }
        },
        {
          '$group': {
            '_id': '$_id.level_group',
            'level_name': {'$addToSet': '$_id.level_name'}
          }
        }
      ]
    }
    return data;
}

var realCourseQuery = {
  "collection": coll,
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$addFields': {
        'pageObject': {'$concat': ['$object.subdomain', '-', '$object.id']}
      }
    },
    {
      '$match': {
        '$expr': {
          '$eq':["$actor.courseName", "$pageObject"]
        }
      }
    },
    {
      '$project': {
        'actor': '$actor',
        'course':
          {'$cond': {
            'if': {
              '$eq': [{'$arrayElemAt': [{'$split': ['$object.url', '/']}, -1]}, "Text"]
            },
            'then': {
              '$concat': [
                {'$replaceAll': {'input': {'$arrayElemAt': [{'$split': ['$object.url', '/']}, -2]}, 'find': '%3A', 'replacement': ":"}}, '/',
                {'$arrayElemAt': [{'$split': ['$object.url', '/']}, -1]}
              ]
            },
            'else': {
              '$arrayElemAt': [{'$split': ['$object.url', '/']}, -1]
            }
          }
        }
      }
    },
    {
      '$group': {
        '_id': '$actor.courseName',
        'courseId': {'$addToSet': '$course'}
      }
    },
    {
      '$project': {
        'courses': {
            '$filter': {
                'input': '$courseId',
                'cond': {
                  '$not': {
                    '$or': [
                      {'$regexFind': {'input': '$$this', 'regex': "#"}},
                      {'$regexFind': {'input': '$$this', 'regex': "3A"}}
                    ]
                  }
                }
            }
        }
    }
  },
  {
    '$addFields': {
      'course': {'$replaceAll': {'input': {'$first': '$courses'}, 'find': '_', 'replacement': " "}}
    }
  }
  ]
}

function unitsQuery(params, courseData) {

  var data = {
    "collection": coll,
    "database": db,
    "dataSource": dataSource,
    "pipeline": [
      {
        '$match': {
          '$expr': {
            '$and': [
              {'$eq': ['$verb', 'read']},
              {'$eq': ['$actor.courseName', params.courseId]}
            ]
          }
        }
      },
      {
        "$lookup": {
          "from": pageColl,
          "localField": "object.id",
          "foreignField": "id",
          "as": "pageInfo"
        }
      },
      {
        "$unwind": {
          'path': "$pageInfo"
        }
      },
      {
        '$addFields': {
          'course': '$pageInfo.courseName'
        }
      },
      {
        '$group': {
          '_id': '$pageInfo.text',
          'chapter': {'$addToSet': '$pageInfo.path'}
        }
      },
      {
        '$unwind': {
          'path': "$chapter"
        }
      },
      {
        '$addFields': {
          'count': {'$size': '$chapter'}
        }
      },
      {
        '$sort': {
          'count': -1
        }
      }
    ]
  }

  return data
}

function timelineQuery(params, courseData) {

    var data = {
      "collection": coll,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ['$verb', 'read']},
                {'$eq': ['$actor.courseName', params.courseId]}
              ]
            }
          }
        },
        {
          '$lookup': {
            "from": pageColl,
            "localField": "object.id",
            "foreignField": "id",
            "as": "pageInfo"
          }
        },
        {
          '$unwind': {
            'path': '$pageInfo'
          }
        },
        {
          '$addFields': {
            'course': '$pageInfo.courseName'
          }
        },
        {
          '$addFields': {
            'startDate': {'$dateFromString': {'dateString': '$object.timestamp'}},
            'endDate': {'$add': [{'$dateFromString': {'dateString': '$object.timestamp'}}, '$object.timeMe']},
            'pageTitle': '$pageInfo.title',
            'pageURL': '$pageInfo.url'
          }
        },
        {
          '$group': {
            '_id': params.groupBy,
            'allStartDates': {'$addToSet': '$startDate'},
            'allEndDates': {'$addToSet': '$endDate'},
            "pageTitle": {'$addToSet': '$pageTitle'},
            "pageURL": {'$addToSet': '$pageURL'}
          }
        },
        {
          '$sort': {'_id': 1}
        }
      ]
    }
    var match = {
      '$match': {
        '$expr': {
          '$and': []
        }
      }
    }

    var unitLookup = {
      '$match': {
        '$expr': {
          '$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]
        }
      }
    }

    var unwind = {
      '$unwind': {
        'path': '$pageInfo'
      }
    }

    var pageTitle = {
      "$addFields": {
        "pageTitle": {'$first': '$pageTitle'},
        "pageURL": {'$first': '$pageURL'}
      }
    }

    if (params.groupBy === "$object.id") {
      data['pipeline'].splice(8, 0, pageTitle)
      var lookup =
      {
        "$lookup": {
          "from": pageColl,
          "localField": "_id",
          "foreignField": "id",
          "as": "pageInfo"
        }
      }
      var addField = {
        "$addFields": {
          'pageTitle': {"$first": "$pageInfo.title"},
          'pageList': ["$_id", {"$first": "$pageInfo.title"}]
        }
      }
    }
    var unset = {
      '$unset': ["pageTitle", "pageURL"]
    }
    if (params.groupBy === "$actor.id") {
      data['pipeline'].splice(8, 0, unset)
      var lookup = {
        '$lookup': {
          "from": pageColl,
          "localField": "object.id",
          "foreignField": "id",
          "as": "pageInfo"
        }
      }
    }
    if (params.path) {
      data['pipeline'].splice(6, 0, unitLookup)
    }
    return data;
}

function getRequest(queryString) {
  var config = {
      method: 'post',
      url: process.env.URL,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(queryString)
  };
  return config;
}

function getIndividual(params, courseData) {

    var data = {
        "collection": coll,
        "database": db,
        "dataSource": dataSource,
        "pipeline": [
          {
            "$match": {
              '$expr': {
                '$and': [
                  {'$eq': ['$verb', 'read']},
                  {'$eq': ['$actor.courseName', params.courseId]}
                ]
              }
            }
          },
          {
            '$lookup': {
              "from": pageColl,
              "localField": "object.id",
              "foreignField": "id",
              "as": "pageInfo"
            }
          },
          {
            '$unwind': {
              'path': '$pageInfo'
            }
          },
          {
            '$addFields': {
              'course': '$pageInfo.courseName'
            }
          },
          {
            '$addFields': {
              "newDate": {'$dateFromString': {'dateString': '$object.timestamp'}},
              'pageTitle': '$pageInfo.title',
              'pageURL': '$pageInfo.url'
            }
          },
          {
            '$addFields': {
              'startDate': {'$dateFromString': {'dateString': '$object.timestamp'}},
              'endDate': {'$add': [{'$dateFromString': {'dateString': '$object.timestamp'}}, '$object.timeMe']},
              'page': '$object.id'
            }
          },
          {
            '$addFields': {
              'dateRange': ['$startDate', '$endDate']
            }
          },
          {
            '$group': {
              '_id': params.groupBy,
              'dateRange': {'$push': '$dateRange'},
              'start': {'$push': '$startDate'},
              "pageTitle": {'$addToSet': '$pageTitle'},
              "pageURL": {'$addToSet': '$pageURL'}
            }
          },
          {
            '$addFields': {
              'firstDate': {'$min': '$start'}
            }
          },
          {
            '$sort': {
              'firstDate': 1
            }
          }
        ]
    }

    var match = {
      "$match": {
        '$expr': {
          '$and': [
          ]
        }
      }
    }

    var pathMatch = {
      "$match": {
        '$expr': {
          '$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]
        }
      }
    }

    var unwind = {
      "$unwind": {
        "path": "$pageInfo"
      }
    }

    var pageTitle =
    {
      "$addFields": {
        "pageTitle": {"$first": "$pageInfo.title"},
        "pageURL": {"$first": "$pageInfo.url"}
      }
    }

    var unset = {
      '$unset': ["pageTitle", "pageURL"]
    }

    if (params.path) {
      data['pipeline'].splice(4, 0, pathMatch)
    }
    if (params.type === "page") {
      data['pipeline'].splice(10, 0, unset)
    }

    if (params.type === "student") {
      match['$match']['$expr']['$and'].push({'$eq': ['$actor.id', params.individual]})
    }
    if (params.type === "page") {
      match['$match']['$expr']['$and'].push({'$eq': ['$object.id', params.individual]})
    }
    if (params.startDate) {
      match['$match']['$expr']['$and'].push({'$gte': ['$newDate', {'$dateFromString': {'dateString': params.startDate}}]})
    }
    if (params.endDate) {
      match['$match']['$expr']['$and'].push({'$lte': ['$newDate', {'$dateFromString': {'dateString': params.endDate}}]})
    }
    data['pipeline'].splice(1, 0, match)
    return data;
}

function allDataQuery(params, adaptCodes) {
//console.log(adaptCodes)
  // console.log(params)
  // console.log(adaptCodes)
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  //console.log(codeFound)
  if (codeFound) {
    // var adaptLookup = {
    //   "$lookup": {
    //     "from": "adapt",
    //     "localField": "_id",
    //     "foreignField": "anon_student_id",
    //     "as": "adapt",
    //     "pipeline": [
    //       {
    //         '$match': {
    //           '$expr': {
    //             '$and': [
    //               {'$eq': ["$class", codeFound.code]}
    //             ]
    //           }
    //         }
    //       },
    //       {
    //         '$addFields': {
    //           'day': {'$replaceAll': {
    //             'input': '$time', 'find': '"', 'replacement': ''
    //           }},
    //           'points': {
    //             '$cond': {
    //             'if': {'$eq': ['$outcome', "CORRECT"]},
    //             'then': {
    //               '$convert': {
    //                 'input': '$problem_points',
    //                 'to': 'double'
    //               }
    //             },
    //             'else': 0
    //             }
    //           },
    //           'total_points': {
    //             '$convert': {
    //               'input': '$problem_points',
    //               'to': 'double'
    //             }
    //           }
    //         }
    //       },
    //       {
    //         '$addFields': {
    //           'date': {'$dateTrunc': {
    //               'date': { '$toDate': '$day'},
    //               'unit': 'day'
    //             }
    //           }
    //         }
    //       },
    //       {
    //         '$group': {
    //           '_id': {
    //            'anon_student_id': '$anon_student_id',
    //            'problem_name': '$problem_name'
    //             },
    //           'mostRecentAdaptLoad': {'$max': '$day'},
    //           'date': {'$max': '$date'},
    //           'assignments': {'$addToSet': '$problem_name'},
    //           'total': {'$first': '$total_points'},
    //           'earned': {'$sum': '$points'},
    //           'problem': {
    //             '$addToSet': {
    //               'outcome': '$outcome',
    //               'points': '$points'
    //             }
    //           }
    //         }
    //       },
    //       {
    //         '$addFields': {
    //           'percent': {'$multiply': [{'$divide': ['$earned', '$total']}, 100]},
    //           'attempts': {'$size': '$problem'}
    //         }
    //       },
    //       {
    //         '$group': {
    //           '_id': '$_id.anon_student_id',
    //           'mostRecentAdaptLoad': {'$max': '$mostRecentAdaptLoad'},
    //           'averagePercent': {'$avg': '$percent'},
    //           'dates': {'$addToSet': '$date'},
    //           'assignments': {'$addToSet': '$_id.problem_name'},
    //           'attempts': {'$sum': '$attempts'}
    //         }
    //       },
    //       {
    //         '$addFields': {
    //           'adaptUniqueInteractionDays': {'$size': '$dates'},
    //           'adaptUniqueAssignments': {'$size': '$assignments'},
    //           'adaptPercent': {'$trunc': ['$averagePercent', 1]},
    //           'adaptAttempts': {'$round': [{'$divide': ['$attempts', {'$size': '$assignments'}]}, 1]}
    //         }
    //       }
    //     ]
    //   }
    // }
    var adaptLookup = {
      "$lookup": {
        "from": "adapt",
        "localField": "_id",
        "foreignField": "anon_student_id",
        "as": "adapt",
        "pipeline": [
          {
            '$match': {
              '$expr': {
                '$and': [
                  {'$eq': ["$class", codeFound.code]}
                ]
              }
            }
          },
          {
            '$addFields': {
              'day': {'$replaceAll': {
                'input': '$time', 'find': '"', 'replacement': ''
              }}
            }
          },
          {
            '$addFields': {
              'date': {'$dateTrunc': {
                  'date': { '$toDate': '$day'},
                  'unit': 'day'
                }
              }
            }
          },
          {
            '$group': {
              '_id': '$anon_student_id',
              'mostRecentAdaptLoad': {'$max': '$day'},
              'dates': {'$addToSet': '$date'},
              'assignments': {'$addToSet': '$page_id'}
            }
          },
          {
            '$addFields': {
              'adaptUniqueInteractionDays': {'$size': '$dates'},
              'adaptUniqueAssignments': {'$size': '$assignments'}
            }
          }
        ]
      }
    }
    var adaptUnwind = {
      "$unwind": {
        'path': '$adapt',
        'preserveNullAndEmptyArrays': true
      }
    }
  }
  if (params.adaptLevelGroup) {
    adaptLookup['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({'$eq': ['$level_group', params.adaptLevelGroup]})
  }
  if (params.adaptLevelName) {
    adaptLookup['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({'$eq': ['$level_name', params.adaptLevelName]})
  }
  // console.log(params.courseId)
  // console.log(codeFound)
  if (params.groupBy === '$actor.id') {
    var aggregationAttr = "$object.id"
    var isPage = false
  } else if (params.groupBy === '$object.id') {
    var aggregationAttr = "$actor.id"
    var isPage = true
  }
  //console.log(isPage)
  var data = {
      "collection": coll,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [
              {'$eq': ["$verb", "read"]},
              {'$eq': ["$actor.courseName", params.courseId]}
            ]
          }
        }
      },
        {
          "$addFields": {
            "newDate": {'$dateFromString': {'dateString': '$object.timestamp'}},
            'pageTitle': '$pageInfo.title',
            'pageURL': '$pageInfo.url',
            'date': {'$dateTrunc': {
                'date': { '$toDate': '$object.timestamp'},
                'unit': 'day'
              }
            }
          }
        },
        {
          "$group": {
            "_id": params.groupBy,
            "courseName": {'$addToSet': '$actor.courseName'},
            "pageTitle": {'$addToSet': '$pageTitle'},
            "pageURL": {'$addToSet': '$pageURL'},
            "timestamp": {'$addToSet':'$object.timestamp'},
            "max": { '$max': "$newDate" },
            "uniqueDates": {'$addToSet': '$date'},
            "objects": {"$addToSet": aggregationAttr},
            "durationInSeconds": {"$avg": '$object.timeMe'},
            "percent": {"$push": {'$toDouble': {'$replaceAll': {'input': '$result.percent', 'find': '%', 'replacement': ''}}}}
          }
        },
        {
          "$addFields": {
            "durationInMinutes": {'$trunc': [{'$divide': ['$durationInSeconds', 60]}, 1]},
            "objectCount": {'$size': "$objects"},
            "viewCount": {'$size': "$timestamp"},
            "percentAvg": {'$trunc': [{'$avg': "$percent"}, 1]},
            "totalViews": {'$size': "$timestamp"},
            "dateCount": {'$size': '$uniqueDates'},
            "adaptUniqueInteractionDays": '$adapt.adaptUniqueInteractionDays',
            "adaptUniqueAssignments": '$adapt.adaptUniqueAssignments',
            "mostRecentAdaptLoad": '$adapt.mostRecentAdaptLoad'
          }
        }
    ]}
    if (codeFound && codeFound.isInAdapt && !isPage) {
      //console.log("splicing data")
      data['pipeline'].splice(3, 0, adaptLookup)
      data['pipeline'].splice(4, 0, adaptUnwind)
    }
    //console.log(data['pipeline'])
    var lookup = {
      "$lookup": {
        "from": pageColl,
        "localField": "object.id",
        "foreignField": "id",
        "as": "pageInfo"
      }
    }

    var match = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var filterMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var unitLookup = {
      "$match": {
        '$expr': {
          '$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]
        }
      }
    }

    var pageTitle =
    {
      "$addFields": {
        "pageTitle": {'$first': '$pageTitle'},
        "pageURL": {'$first': '$pageURL'}
      }
    }

    var unset = {
      "$unset": ["pageTitle", "pageURL"]
    }

    var unwind = {
      '$unwind': {
        'path': '$pageInfo'
      }
    }

    var tagLookup = {
      '$lookup': {
        "from": "metatags",
        "localField": "id",
        "foreignField": "pageInfo.id",
        "as": "tags"
      }
    }
    // var adaptLookup = {
    //   "$lookup": {
    //     "from": "adapt",
    //     "localField": "_id",
    //     "foreignField": "anon_student_id",
    //     "as": "adapt"
    //   }
    // }

    if (isPage) {
      data['pipeline'].splice(1, 0, lookup)
      data['pipeline'].splice(2, 0, unwind)
      data['pipeline'].splice(8, 0, pageTitle)
    } else {
      // data['pipeline'].splice(3, 0, adaptLookup)
      // data['pipeline'].splice(8, 0, unset)
    }

    var matchesUsed = false
    if (params.startDate) {
      filterMatch['$match']['$expr']['$and'].push({'$gte': ['$newDate', {'$dateFromString': {'dateString': params.startDate}}]})
      matchesUsed = true
    }
    if (params.endDate) {
      filterMatch['$match']['$expr']['$and'].push({'$lte': ['$newDate', {'$dateFromString': {'dateString': params.endDate}}]})
      matchesUsed = true
    }

    if (params.path && !isPage) {
      data['pipeline'].splice(2, 0, lookup)
      data['pipeline'].splice(3, 0, unwind)
      data['pipeline'].splice(4, 0, unitLookup)
      data['pipeline'].splice(6, 0, unset)
    } else if (params.path) {
      data['pipeline'].splice(3, 0, unitLookup)
    }

    if (matchesUsed && !isPage) {
      data['pipeline'].splice(2, 0, filterMatch)
    } else if (matchesUsed && isPage) {
      data['pipeline'].splice(5, 0, filterMatch)
    }

    var tagMatch = {
      '$project': {
          'tags': {
             '$filter': {
              'input': "$tags",
              'as': "item",
              'cond': {
                  '$and': []
              }
             }
          },
          'actor': '$actor',
          'object': '$object',
          'verb': '$verb',
          'course': '$course',
          'result': '$result',
          'pageInfo': '$pageInfo'
      }
    }
    var hasTags = false
    if (params.tagType) {
      data['pipeline'].splice(6, 0, tagLookup)
      tagMatch['$project']['tags']['$filter']['cond']['$and'].push({'$eq': ['$tags.type', params.tagType]})
      hasTags = true
    }
    if (params.tagTitle) {
      tagMatch['$project']['tags']['$filter']['cond']['$and'].push({'$eq': ['$tags.title', params.tagTitle]})
      hasTags = true
    }
    //console.log(tagMatch['$project']['tags']['$filter'])
    // if (hasTags) {
    //   data['pipeline'].splice(7, 0, tagMatch)
    // }
    //console.log(data['pipeline'])
    return data;
}

  function studentChartQuery(params) {
    var group = '$'+params.groupBy

    var data = {
      "collection": coll,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          "$match": {
            '$expr': {
              '$and': [{'$eq': ["$verb", "read"]}]
            }
          }
        },
        {
          '$addFields': {
            "newDate": {'$dateFromString': {'dateString': '$object.timestamp'}},
            'date': {'$dateTrunc': {
                'date': { '$toDate': '$object.timestamp'},
                'unit': 'day'
              }
            }
          }
        },
        {
          "$group": {
            "_id": '$actor.id',
            "courseName": {'$addToSet': '$actor.courseName'},
            "timestamp": {'$addToSet':'$object.timestamp'},
            "max": { '$max': "$newDate" },
            "uniqueDates": {'$addToSet': '$date'},
            "objects": {"$addToSet": '$object.id'}
          }
        },
        {
          "$addFields": {
            "durationInMinutes": {'$trunc': [{'$divide': ['$durationInSeconds', 60]}, 1]},
            "objectCount": {'$size': "$objects"},
            "viewCount": {'$size': "$timestamp"},
            "percentAvg": {'$trunc': [{'$avg': "$percent"}, 1]},
            "totalViews": {'$size': "$timestamp"},
            "dateCount": {'$size': '$uniqueDates'},
            "lastDate": {'$dateTrunc': {
                'date': { '$toDate': '$max'},
                'unit': 'day'
              }
            }
          }
        },
        {
          "$group": {
            '_id': group,
            'students': {'$addToSet': '$_id'},
            'dates': {'$push': '$uniqueDates'}
          }
        },
        {
          "$addFields": {
            'count': {'$size': '$students'}
          }
        },
        {
          "$sort": {
            "_id": 1
          }
        }
      ]
    }

    var match = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var filterMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var lookup = {
      "$lookup": {
        "from": pageColl,
        "localField": "object.id",
        "foreignField": "id",
        "as": "pageInfo"
      }
    }

    var unwind = {
      "$unwind": {
        'path': '$pageInfo'
      }
    }

    var addFields = {
      '$addFields': {
        'course': '$pageInfo.courseName'
      }
    }

    var pathMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var matchesUsed = false
    if (params.start) {
      filterMatch['$match']['$expr']['$and'].push({'$gte': ['$date', {'$dateFromString': {'dateString': params.start}}]})
      matchesUsed = true
    }
    if (params.end) {
      filterMatch['$match']['$expr']['$and'].push({'$lte': ['$date', {'$dateFromString': {'dateString': params.end}}]})
      matchesUsed = true
    }
    if (matchesUsed && params.courseId) {
      data['pipeline'].splice(2, 0, filterMatch)
    } else if (matchesUsed && !params.courseId) {
      data['pipeline'].splice(2, 0, filterMatch)
    }

    if (!params.courseId || (params.path && params.courseId)) {
      data['pipeline'].splice(1, 0, lookup)
      data['pipeline'].splice(2, 0, unwind)
    }
    if (!params.courseId) {
      data['pipeline'].splice(1, 0, initMatch)
      data['pipeline'].splice(4, 0, addFields)
      data['pipeline'].splice(5, 0, courseMatch)
    }
    if (params.courseId) {
      match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
      data['pipeline'].splice(0, 0, match)
    }
    if (params.path) {
      pathMatch['$match']['$expr']['$and'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]})
      data['pipeline'].splice(4, 0, pathMatch)
    }
    return data;
  }

  function pageViewChartQuery(params, courseData) {

    var data = {
      "collection": coll,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          "$match": {
            '$expr': {
              '$and': [{'$eq': ["$verb", "read"]}]
            }
          }
        },
        {
          "$lookup": {
            "from": pageColl,
            "localField": "object.id",
            "foreignField": "id",
            "as": "pageInfo"
          }
        },
        {
          "$unwind": {
            'path': '$pageInfo'
          }
        },
        {
          '$addFields': {
            'course': '$pageInfo.courseName'
          }
        },
        {
          "$addFields": {
            'date': {'$dateTrunc': {
                'date': { '$toDate': '$object.timestamp'},
                'unit': params.unit,
                'binSize': params.bin
              }
            }
          }
        },
        {
          "$group": {
            '_id': '$date',
            'pages': {'$push': '$object.id' }
          }
        },
        {
          "$addFields": {
            'count': {'$size': '$pages'},
            'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]}
          }
        },
        {
          "$sort": {"_id": 1}
        }
      ]
    }
    var courseMatch = {
      "$match": {
        '$expr': {
          '$and': [
            {'$eq': ['$course', params.course]}
          ]
        }
      }
    }
    if (!params.courseId) {
      data['pipeline'].splice(1, 0, initMatch)
      data['pipeline'].splice(5, 0, courseMatch)
    }

    var match = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var filterMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var pathMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var matchesUsed = false
    if (params.courseId) {
      match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
      data['pipeline'].splice(0, 0, match)
    }
    if (params.start) {
      filterMatch['$match']['$expr']['$and'].push({'$gte': ['$date', {'$dateFromString': {'dateString': params.start}}]})
      matchesUsed = true
    }
    if (params.end) {
      filterMatch['$match']['$expr']['$and'].push({'$lte': ['$date', {'$dateFromString': {'dateString': params.end}}]})
      matchesUsed = true
    }
    if (params.path) {
      pathMatch['$match']['$expr']['$and'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]})
      data['pipeline'].splice(5, 0, pathMatch)
    }
    if (matchesUsed && params.courseId) {
      data['pipeline'].splice(6, 0, filterMatch)
    } else if (matchesUsed && !params.courseId) {
      data['pipeline'].splice(7, 0, filterMatch)
    }
    return data;
  }

  function individualPageViewChartQuery(params, adaptCodes) {
    var codeFound = adaptCodes.find(o => o.course === params.courseId)

    if (params.individual) {
      var data = {
        "collection": coll,
        "database": db,
        "dataSource": dataSource,
        "pipeline": [
          {
            "$match": {
              '$expr': {
                '$and': [
                  {'$eq': ["$verb", "read"]},
                  {'$eq': ["$actor.courseName", params.courseId]}
                ]
              }
            }
          },
          {
            "$lookup": {
              "from": pageColl,
              "localField": "object.id",
              "foreignField": "id",
              "as": "pageInfo"
            }
          },
          {
            "$unwind": {
              'path': '$pageInfo'
            }
          },
          {
            '$match': {
              'pageInfo.title': params.individual
            }
          },
          {
            "$addFields": {
              'date': {'$dateTrunc': {
                  'date': { '$toDate': '$object.timestamp'},
                  'unit': params.unit,
                  'binSize': params.bin
                }
              }
            }
          },
          {
            "$group": {
              '_id': '$date',
              'students': {'$push': '$actor.id' }
            }
          },
          {
            "$addFields": {
              'count': {'$size': '$students'},
              'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]}
            }
          },
          {
            "$sort": {"_id": 1}
          }
        ]
      }
    } else if (params.levelName) {
        var data = {
          "collection": adaptColl,
          "database": db,
          "dataSource": dataSource,
          "pipeline": [
            {
              '$match': {
                '$expr': {
                  '$and': [
                    {'$eq': ['$class', codeFound.code]},
                    {'$eq': ['$level_group', params.levelGroup]},
                    {'$eq': ['$level_name', params.levelName]}
                  ]
                }
              }
            },
            {
              "$addFields": {
                'date': {'$dateTrunc': {
                    'date': { '$toDate': '$time'},
                    'unit': params.unit,
                    'binSize': params.bin
                  }
                }
              }
            },
            {
              "$group": {
                '_id': '$date',
                'students': {'$push': '$anon_student_id' }
              }
            },
            {
              "$addFields": {
                'count': {'$size': '$students'},
                'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]}
              }
            },
            {
              "$sort": {"_id": 1}
            }
          ]
        }
    }
    //console.log(data)
    var match = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var filterMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var pathMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    var matchesUsed = false
    if (params.start) {
      filterMatch['$match']['$expr']['$and'].push({'$gte': ['$date', {'$dateFromString': {'dateString': params.start}}]})
      matchesUsed = true
    }
    if (params.end) {
      filterMatch['$match']['$expr']['$and'].push({'$lte': ['$date', {'$dateFromString': {'dateString': params.end}}]})
      matchesUsed = true
    }
    if (params.path) {
      pathMatch['$match']['$expr']['$and'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]})
      data['pipeline'].splice(5, 0, pathMatch)
    }
    if (matchesUsed && params.courseId) {
      data['pipeline'].splice(6, 0, filterMatch)
    }

    return data;
  }

  function getTagQuery(params) {

    var data = {
      "collection": "metatags",
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          "$lookup": {
            'from': 'pageinfo',
            'localField': 'id',
            'foreignField': 'id',
            'as': 'pageInfo'
          }
        },
        {
          "$unwind": {
            'path': '$pageInfo'
          }
        },
        {
          "$match": {
            '$expr': {
              '$gt': [{ '$indexOfCP': [ "$pageInfo.courseName", params.course ] }, -1]
            }
          }
        },
        {
          "$group": {
            '_id': '$type',
            'title': {'$addToSet': '$title'}
          }
        }
      ]
    }
    return data
  }

  function getAdaptQuery(params) {

    // var arr = params.course.split("_")
    // var index = arr.findIndex(value => /\d/.test(value))
    // var course = arr[index-1]+" "+arr[index]

    var data = {
      "collection": adaptColl,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          "$match": {
            '$expr': {
              '$eq': ['$class', params.course]
            }
          }
        },
        {
          "$group": {
            '_id': '$anon_student_id',
            'adaptLastDate': {'$max': '$time'},
            'adaptObjects': {'$addToSet': '$problem_name'}
          }
        },
        {
          "$addFields": {
            'uniqueAssignments': {'$size': '$objects'}
          }
        }
      ]
    }
    return data
  }

  function findEnrollmentData(adaptCodes, enrollmentData, course) {
    //console.log(enrollmentData)
    var codeFound = adaptCodes.find(o => o.course === course)
    //console.log(codeFound)
    var courseCode = codeFound ? parseInt(codeFound.code) : null
    //console.log(courseCode)
    var studentEnrollment = []
    if (codeFound) {
      var studentEnrollment = enrollmentData.find(o => o._id === courseCode)
      return studentEnrollment['students']
    } else {
      return []
    }
    //console.log(studentEnrollment)
  }

  function mergeLTAdaptData(lt, adapt) {
    console.log(lt)
    console.log(adapt)
    const result = {
      ...lt,
      ...adapt,
    };
    console.log("MERGED")
    console.log(result)
  }

  let libretextToAdaptConfig = getRequest(adaptCodeQuery)
  var adaptCodes = {}
  axios(libretextToAdaptConfig).then(function (response) {
    adaptCodes = (response.data['documents'])
    //console.log(adaptCodes)
  }).catch(function (error) {
    console.log(error)
  })

  let enrollmentConfig = getRequest(enrollmentQuery)
  var enrollmentData = {}
  axios(enrollmentConfig).then(function (response) {
    enrollmentData = (response.data['documents'])
    //console.log(enrollmentData)
  }).catch(function (error) {
    console.log(error)
  })

  let realCourseConfig = getRequest(realCourseQuery);
  let realCourseNames = {}
  axios(realCourseConfig)
    .then(function (response) {
      realCourseNames = response.data['documents']
    })
    .catch(function (error) {
      console.log(error)
    });

  app.get('/realcourses', (req, res) => {
    res.json(realCourseNames)
  })

  // let enrollmentConfig = getRequest(enrollmentQuery);
  // let studentEnrollment = {}
  // axios(enrollmentConfig)
  //   .then(function (response) {
  //     studentEnrollment = response.data['documents']
  //   })
  //   .catch(function (error) {
  //     console.log(error)
  //   });
  //
  // app.get('/enrollment', (req, res) => {
  //   studentEnrollment.forEach((r, index) => {
  //     studentEnrollment[index]._id = decryptStudent(r._id)
  //   })
  //   res.json(studentEnrollment)
  // })

app.post('/timelineData', (req,res,next) => {
  let queryString = timelineQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/data', async (req,res,next) => {
  let queryString = allDataQuery(req.body, await adaptCodes);
  let config = getRequest(queryString);
  //console.log(enrollmentData)
  var studentEnrollment = JSON.parse(JSON.stringify(findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)))
  // console.log("STUDENT ENROLLMENT")
  // console.log(studentEnrollment)
  axios(config)
      .then(function async (response) {
        let newData = (response.data)
        newData['documents'].forEach((student, index) => {
          if (student._id.length >= 20) {
            //console.log(student)
            if (studentEnrollment.length > 0) {
              if (studentEnrollment.includes(student._id)) {
                newData['documents'][index]['isEnrolled'] = true
              //console.log(true)
                studentEnrollment.find((s, index) => {
                  if (s === student._id) {
                    studentEnrollment.splice(index, 1)
                  }
                })
              } else {
                newData['documents'][index]['isEnrolled'] = false
              }
            } else if (studentEnrollment.length === 0) {
              newData['documents'][index]['isEnrolled'] = true
            }
            newData['documents'][index]['hasData'] = true
            newData['documents'][index]._id = decryptStudent(student._id)
        }
        })
        if (studentEnrollment.length > 0 && newData['documents'][0]._id.length >= 20) {
          //console.log(studentEnrollment)
          studentEnrollment.forEach(s => {
            console.log(s)
            newData['documents'].splice(0, 0, {
              _id: decryptStudent(s),
              isEnrolled: true,
              hasData: false,
              adapt: newData['documents'][1].adapt ? true : false
            })
          })
        }
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/individual', (req,res,next) => {
  let queryString = getIndividual(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((s, index) => {
          newData['documents'][index]._id = decryptStudent(s._id)
        })
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/studentchart', (req,res,next) => {
  let queryString = studentChartQuery(req.body);
  let config = getRequest(queryString);
  var studentEnrollment = JSON.parse(JSON.stringify(findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)))
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((student, index) => {
          var allStudents = JSON.parse(JSON.stringify(student.students))
          student.students.forEach((s, i) => {
            if (s.length >= 20) {
              if (!studentEnrollment.includes(s)) {
                allStudents.find((st, n) => {
                  if (st === s) {
                    allStudents.splice(n, 1)
                  }
                })
                newData['documents'][index].count = newData['documents'][index].count - 1
              }
              // else {
              //   newData['documents'][index].students[i] = decryptStudent(s)
              // }
            }
          })
          allStudents.forEach((s, i) => {
            allStudents[i] = decryptStudent(s)
          })
          newData['documents'][index].students = allStudents
        })
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/pageviews', (req,res,next) => {
  let queryString = pageViewChartQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/individualpageviews', (req,res,next) => {
  let queryString = individualPageViewChartQuery(req.body, adaptCodes);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/adapt', (req,res,next) => {
  let queryString = getAdaptQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/adaptlevels', (req,res,next) => {
  let queryString = adaptLevelQuery(req.body, adaptCodes);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/tags', (req,res,next) => {
  let queryString = getTagQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/chapters', (req,res,next) => {
  let queryString = unitsQuery(req.body)
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData = JSON.stringify(newData['documents'])
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
