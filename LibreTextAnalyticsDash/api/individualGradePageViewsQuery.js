function individualGradePageViewsQuery(params, adaptCodes, dbInfo) {
  var codeFound = adaptCodes.find(o => o.course === params.courseId)

  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [
              { '$eq': ["$class", codeFound.code] },
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
  console.log(data)
  return data;
}

module.exports = { individualGradePageViewsQuery }
