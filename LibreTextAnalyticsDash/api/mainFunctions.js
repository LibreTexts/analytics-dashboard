import { createRequire } from 'module'
const require = createRequire(import.meta.url);
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

export var realCourseQuery = {
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

export function allDataQuery(params, adaptCodes) {
  console.log(adaptCodes)
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  if (codeFound) {
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
            "mostRecentAdaptLoad": '$adapt.mostRecentAdaptLoad',
            "adaptPercent": '$adapt.adaptPercent',
            "adaptAttempts": '$adapt.adaptAttempts'
          }
        }
    ]}
    if (codeFound && codeFound.isInAdapt && !isPage) {
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
    if (hasTags) {
      data['pipeline'].splice(7, 0, tagMatch)
    }
    //console.log(data['pipeline'])
    return data;
}

export function getTagQuery(params) {

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

export function timelineQuery(params, courseData) {

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

export function unitsQuery(params, courseData) {

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
