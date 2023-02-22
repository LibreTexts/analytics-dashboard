const addFilters =  require("../helper/addFilters.js");
//query to get student grades for each adapt assignment, on the student tab

function gradesFromAdaptQuery(params, dbInfo, environment) {

  var course = params.adaptCourseID ? params.adaptCourseID : params.courseId;
  //grab data from the adapt collection
  var data = {
      "collection": dbInfo.adaptColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          "$match": {
            '$expr': {
              '$and': [
                {'$eq': ["$course_id", course]}
              ]
            }
          }
        },
        //preserve some adapt attributes, change points to 0 if the outcome was "incorrect"
        {
          "$project": {
            'assignment_name' : '$assignment_name',
            'anon_student_id' : '$anon_student_id',
            'question_id' : '$question_id',
            'assignment_group': '$assignment_group',
            'points' : {
              "$cond" : {
                'if': {'$and': [{'$ne': ['$question_points', ""]}, {'$eq': ['$outcome', "CORRECT"]}]},
                'then': {
                  "$convert" : {
                    'input' : '$question_points',
                    'to': 'double'
                  }
                },
                'else': 0
              }
            },
            'assignment_points': {
              "$cond" : {
                'if': {'$and': [{'$ne': ['$assignment_points', ""]}, {'$eq': ['$outcome', "CORRECT"]}]},
                'then': {
                  "$convert" : {
                    'input' : '$assignment_points',
                    'to': 'double'
                  }
                },
                'else': null
              }
            }
          }
        },
        {
          "$group": {
            '_id': {
              'student': '$anon_student_id',
              'assignment_group': '$assignment_group',
              'assignment_name': '$assignment_name'
            },
            'points_earned': {
              '$sum': '$points'
            },
            'assignment_points': {'$first': '$assignment_points'}
          }
        },
        {
          '$addFields': {
            'score': {
              '$divide': ['$points_earned', '$assignment_points']
            }
          }
        },
        {
          "$group": {
            '_id': '$_id.student',
            'score': {
              '$avg': '$score'
            }
          }
        },
        {
          '$addFields': {
            'score': {
              '$round': [
                {'$multiply': ['$score', 100]}, 2
              ]
            },
            "fromGradebook": false
          }
        }
      ]
    }
    return data;
  }

module.exports = gradesFromAdaptQuery;
