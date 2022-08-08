function individualGradePageViewsQuery(params, adaptCodes, dbInfo) {
  //find the adapt code for the lt course id
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }

  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [
              { '$eq': ["$class", course] },
              { '$eq': ["$level_name", params.levelName] }
            ]
          }
        }
      },
      {
        "$project": {
          'levelname': '$level_name',
          'student': '$anon_student_id',
          'levelpoints': '$level_points',
          'problemname': '$problem_name',
          'points': {
            "$cond": {
              'if': { '$eq': ['$outcome', "CORRECT"] },
              'then': {
                "$convert": {
                  'input': '$problem_points',
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
          }
        }
      },
      {
        "$group": {
          '_id': {
            'level': '$_id.level',
            'student': '$_id.student'
          },
          'Sum': {
            '$sum': '$bestScore'
          },
          'levelpoints': {
            '$first': {
              '$convert': {
                'input': '$levelpoints',
                'to': 'double'
              }
            }
          }
        }
      },
      {
        "$addFields": {
          'score': {
            '$divide': [
              '$Sum',
              '$levelpoints'
            ]
          }
        }
      }
    ]
  }

  var filterMatch = {
    "$match": {
      '$expr': {
        '$and': []
      }
    }
  }

  var matchesUsed = false
  if (params.start) {
    filterMatch['$match']['$expr']['$and'].push({'$gte': [{'$dateFromString': {'dateString': '$time'}}, {'$dateFromString': {'dateString': params.start}}]})
    matchesUsed = true
  }
  if (params.end) {
    filterMatch['$match']['$expr']['$and'].push({'$lte': [{'$dateFromString': {'dateString': '$time'}}, {'$dateFromString': {'dateString': params.end}}]})
    matchesUsed = true
  }

  if (matchesUsed && params.courseId) {
    data['pipeline'].splice(1, 0, filterMatch)
  }

  console.log(data)
  return data;
}

module.exports = { individualGradePageViewsQuery }
