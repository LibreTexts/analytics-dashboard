const addFilters =  require("../helper/addFilters.js");

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
  var index = 1;
  addFilters.spliceDateFilter(index, params, data, true);

  return data;
}

module.exports = individualGradePageViewsQuery
