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

var courseQuery = {
  "collection": coll,
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        '_id': '$actor.courseName'
      }
    }
  ]
}

var categoryQuery = {
  "collection": pageColl,
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        '_id': {'$first': '$path'},
        'subjectName': {'$addToSet': {'$arrayElemAt': ['$path', 1]}},
        'courseName': {'$addToSet': {'$arrayElemAt': ['$path', 2]}}
      }
    }
  ]
}

var subjectQuery = {
  "collection": pageColl,
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        '_id': {'$arrayElemAt': ['$path', 1]},
        'courseName': {'$addToSet': {'$arrayElemAt': ['$path', 2]}}
      }
    }
  ]
}

var courseNameQuery = {
  "collection": coll,
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        '_id': '$object.id',
        'course': {'$addToSet': '$actor.courseName'}
      }
    },
    {
      '$lookup': {
        "from": pageColl,
        "localField": "_id",
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
      '$group': {
        '_id': '$pageInfo.courseName',
        'courses': {'$push': '$course'}
      }
    },
    {
      '$project': {
          "items": {
            "$reduce": {
              "input": "$courses",
              "initialValue": [],
              "in": { "$concatArrays": ["$$this", "$$value"] }
            }
          }
        }
    },
    {
      '$project': {
          "courses": {
            "$reduce": {
              "input": "$items",
              "initialValue": [],
              "in": {
                      '$cond':{
                          'if': {'$in': [ "$$this", "$$value"]},
                          'then': "$$value",
                          'else': {'$concatArrays':["$$value",["$$this"]]}
                      }
                   }
            }
          }
        }
    }
  ]
}

function unitsQuery(params, courseData) {
  var alias = courseData.find(o => o._id === params.course)
  var initMatch = {
    "$match": {
      '$expr': {

      }
    }
  }
  if (alias['courses'].length > 1) {
    initMatch['$match']['$expr'] = {'$or': []}
    alias['courses'].forEach(a => {
      initMatch['$match']['$expr']['$or'].push({'$eq': ['$actor.courseName', a]})
    })
  } else {
    initMatch['$match']['$expr'] = {'$and': []}
    initMatch['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', alias['courses'][0]]})
  }

  var data = {
    "collection": coll,
    "database": db,
    "dataSource": dataSource,
    "pipeline": [
      {
        '$match': {
          'verb': 'read'
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
  var courseMatch = {
    "$match": {
      '$expr': {
        '$and': [
          {'$eq': ['$course', params.course]}
        ]
      }
    }
  }
  var match = {
    '$match': {
      '$expr': {
        '$and': []
      }
    }
  }
  if (!params.courseId) {
    data['pipeline'].splice(1, 0, initMatch)
    data['pipeline'].splice(5, 0, courseMatch)
  }
  if (params.courseId) {
    match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
    data['pipeline'].splice(0, 0, match)
  }
  return data
}

function timelineQuery(params, courseData) {

    var alias = courseData.find(o => o._id === params.course)
    var initMatch = {
      "$match": {
        '$expr': {

        }
      }
    }
    if (alias['courses'].length > 1) {
      initMatch['$match']['$expr'] = {'$or': []}
      alias['courses'].forEach(a => {
        initMatch['$match']['$expr']['$or'].push({'$eq': ['$actor.courseName', a]})
      })
    } else {
      initMatch['$match']['$expr'] = {'$and': []}
      initMatch['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', alias['courses'][0]]})
    }

    var data = {
      "collection": coll,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ['$verb', 'read']}
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
    if (params.courseId) {
      match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
      data['pipeline'].splice(0, 0, match)
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
    var alias = courseData.find(o => o._id === params.course)
    var initMatch = {
      "$match": {
        '$expr': {

        }
      }
    }
    if (alias['courses'].length > 1) {
      initMatch['$match']['$expr'] = {'$or': []}
      alias['courses'].forEach(a => {
        initMatch['$match']['$expr']['$or'].push({'$eq': ['$actor.courseName', a]})
      })
    } else {
      initMatch['$match']['$expr'] = {'$and': []}
      initMatch['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', alias['courses'][0]]})
    }

    var data = {
        "collection": coll,
        "database": db,
        "dataSource": dataSource,
        "pipeline": [
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

    var match =
    {
      "$match": {
        '$expr': {
          '$and': [
            {'$eq': ['$verb', 'read']}
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

    if (params.courseId) {
      match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
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
    data['pipeline'].splice(0, 0, match)
    return data;
}

function allDataQuery(params, courseData) {

  var alias = courseData.find(o => o._id === params.course)

  var initMatch = {
    "$match": {
      '$expr': {

      }
    }
  }

  if (alias['courses'].length > 1) {
    initMatch['$match']['$expr'] = {'$or': []}
    alias['courses'].forEach(a => {
      initMatch['$match']['$expr']['$or'].push({'$eq': ['$actor.courseName', a]})
    })
  } else {
    initMatch['$match']['$expr'] = {'$and': []}
    initMatch['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', alias['courses'][0]]})
  }

  if (params.groupBy === '$actor.id') {
    var aggregationAttr = "$object.id"
    var isPage = false
  } else if (params.groupBy === '$object.id') {
    var aggregationAttr = "$actor.id"
    var isPage = true
  }

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
            "dateCount": {'$size': '$uniqueDates'}
          }
        }
    ]}
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

    if (isPage) {
      data['pipeline'].splice(8, 0, pageTitle)
    } else {
      data['pipeline'].splice(8, 0, unset)
    }

    var matchesUsed = false
    if (params.courseId) {
      match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
      data['pipeline'].splice(0, 0, match)
    }
    if (params.startDate) {
      filterMatch['$match']['$expr']['$and'].push({'$gte': ['$newDate', {'$dateFromString': {'dateString': params.startDate}}]})
      matchesUsed = true
    }
    if (params.endDate) {
      filterMatch['$match']['$expr']['$and'].push({'$lte': ['$newDate', {'$dateFromString': {'dateString': params.endDate}}]})
      matchesUsed = true
    }
    if (matchesUsed && params.courseId) {
      data['pipeline'].splice(6, 0, filterMatch)
    } else if (matchesUsed && !params.courseId) {
      data['pipeline'].splice(7, 0, filterMatch)
    }
    if (params.path) {
      data['pipeline'].splice(6, 0, unitLookup)
    }
    return data;
}

  function studentChartQuery(params, courseData) {
    var group = '$'+params.groupBy
    var alias = courseData.find(o => o._id === params.course)

    var initMatch = {
      "$match": {
        '$expr': {

        }
      }
    }

    if (alias['courses'].length > 1) {
      initMatch['$match']['$expr'] = {'$or': []}
      alias['courses'].forEach(a => {
        initMatch['$match']['$expr']['$or'].push({'$eq': ['$actor.courseName', a]})
      })
    } else {
      initMatch['$match']['$expr'] = {'$and': []}
      initMatch['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', alias['courses'][0]]})
    }

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

    var courseMatch = {
      "$match": {
        '$expr': {
          '$and': [
            {'$eq': ['$course', params.course]}
          ]
        }
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

    var alias = courseData.find(o => o._id === params.course)

    var initMatch = {
      "$match": {
        '$expr': {

        }
      }
    }

    if (alias['courses'].length > 1) {
      initMatch['$match']['$expr'] = {'$or': []}
      alias['courses'].forEach(a => {
        initMatch['$match']['$expr']['$or'].push({'$eq': ['$actor.courseName', a]})
      })
    } else {
      initMatch['$match']['$expr'] = {'$and': []}
      initMatch['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', alias['courses'][0]]})
    }

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

  function getAdaptQuery(params) {

    var arr = params.course.split("_")
    var index = arr.findIndex(value => /\d/.test(value))
    var course = arr[index-1]+" "+arr[index]

    var data = {
      "collection": adaptColl,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          "$match": {
            '$expr': {
              '$gt': [{ '$indexOfCP': [ "$class_name", course ] }, -1]
            }
          }
        },
        {
          "$group": {
            '_id': '$anon_student_id',
            'lastDate': {'$max': '$time'},
            'objects': {'$addToSet': '$problem_name'}
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

  let courseAliasConfig = getRequest(courseNameQuery)
  var courseNameData = {}
  axios(courseAliasConfig).then(function (response) {
    courseNameData = (response.data['documents'])
  }).catch(function (error) {
    console.log(error)
  })

let courseConfig = getRequest(courseQuery);
let courseNames = {}
axios(courseConfig)
  .then(function (response) {
    courseNames = response.data['documents']
  })
  .catch(function (error) {
    console.log(error)
  });

app.get('/courses', (req, res) => {
  res.json(courseNames)
})

let catConfig = getRequest(categoryQuery);
let categories = {}
axios(catConfig)
  .then(function (response) {
    categories = response.data['documents']
  })
  .catch(function (error) {
    console.log(error)
  });

app.get('/categories', (req, res) => {
  res.json(categories)
})

let subjConfig = getRequest(subjectQuery);
let subjects = {}
axios(subjConfig)
  .then(function (response) {
    subjects = response.data['documents']
  })
  .catch(function (error) {
    console.log(error)
  });

app.get('/subjects', (req, res) => {
  res.json(subjects)
})


app.post('/timelineData', (req,res,next) => {
  let queryString = timelineQuery(req.body, courseNameData);
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

app.post('/data', (req,res,next) => {
  let queryString = allDataQuery(req.body, courseNameData);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((student, index) => {
          if (student._id.length >= 20) {
            newData['documents'][index]._id = decryptStudent(student._id)
        }
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/individual', (req,res,next) => {
  let queryString = getIndividual(req.body, courseNameData);
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

app.post('/studentchart', (req,res,next) => {
  let queryString = studentChartQuery(req.body, courseNameData);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((student, index) => {
          student.students.forEach((s, i) => {
            if (s.length >= 20) {
              newData['documents'][index].students[i] = decryptStudent(s)
            }
          })

        })
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/pageviews', (req,res,next) => {
  let queryString = pageViewChartQuery(req.body, courseNameData);
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
  let queryString = getAdaptQuery(req.body, courseNameData);
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
  let queryString = unitsQuery(req.body, courseNameData)
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
