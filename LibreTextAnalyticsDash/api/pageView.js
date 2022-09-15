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
  console.log(data)
  return data;
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

module.exports = { pageViewChartQuery, individualPageViewChartQuery, getIndividual }
