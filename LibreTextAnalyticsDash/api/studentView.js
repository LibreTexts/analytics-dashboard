import axios from 'axios';
import express from 'express';
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
app.use(bodyParser.json());
app.use(cors());
import dotenv from 'dotenv';
dotenv.config();
import basicAuth from 'express-basic-auth';

const coll = process.env.COLL;
const pageColl = process.env.PCOLL;
const adaptColl = process.env.ACOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;
const hashKey = process.env.studentHash;
const userPassword = process.env.userPassword;

function encryptStudent(student) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.studentHash;
  const iv = Buffer.from(key, 'hex');
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  student = cipher.update(student, 'utf8', 'hex')
  student += cipher.final('hex')

  return student;
}

export function studentChartQuery(params) {
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

export function studentAssignmentQuery(params, adaptCodes) {
  var codeFound = adaptCodes.find(o => o.course === params.course)
  console.log(params)
  console.log(codeFound)
  var student = encryptStudent(params.individual)

  var data = {
      "collection": adaptColl,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          "$match": {
            '$expr': {
              '$and': [
                {'$eq': ["$class", codeFound.code]},
                {'$eq': ["$anon_student_id", student]}
              ]
            }
          }
        },
        {
          "$project": {
            'levelname' : '$level_name',
            'student' : '$anon_student_id',
            'levelpoints' : '$level_points',
            'problemname' : '$problem_name',
            'due': '$due',
            'points' : {
              "$cond" : {
                'if': {'$eq': ['$outcome', "CORRECT"]},
                'then': {
                  "$convert" : {
                    'input' : '$problem_points',
                    'to': 'double'
                  }
                },
                'else': 0
              }
            }
          }
        },
        {
          "$group":
            {
              '_id': {
                'student': '$student',
                'level': '$levelname',
                'levelgroup': '$level_group',
                'problemname': "$problemname"
              },
              'levelpoints': {
                '$first': '$levelpoints'
              },
              'bestScore': {
                '$max': '$points'
              },
              'due': { '$first': '$due'}
            }
        },
        {
          "$group": {
            '_id': {
              'level' : '$_id.level',
              'student': '$_id.student'
            },
            'Sum': {
              '$sum': '$bestScore'
            },
            'due': {
              '$first': '$due'
            },
            'levelpoints': {
              '$first' : {'$convert' : {
                'input' : '$levelpoints',
                'to' : 'double'
              }}
            }
          }
        },
        {
          "$addFields": {
            'score': {
              '$divide' : [
                '$Sum',
                '$levelpoints'
              ]
            }
          }
        },
        {
          "$addFields": {
            'percent': {
              '$round': [{
              '$multiply': ['$score', 100]
            }, 2]
            },
            'level_name': '$_id.level'
          }
        },
        {
          "$sort": {
            'due': 1
          }
        }
      ]
    }

    return data;
}
