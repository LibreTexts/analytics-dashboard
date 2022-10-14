const addFilters =  require("../helper/addFilters.js");
//query to get student grades for each adapt assignment, on the student tab

function studentAdaptAssignmentQuery(params, adaptCodes, dbInfo, encryptStudent) {
  //find the adapt code for the lt course id
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }
  //student on the front end is unencrypted, is encrypted in the database
  //need to encrypt to be able to match
  if (params.individual.includes("@")) {
    var student = encryptStudent(params.individual)
  } else {
    var student = params.individual
  }

  var data = {
    "collection": dbInfo.gradesColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      //match by course and by a single student
      {
        "$match": {
          '$expr': {
            '$and': [
              {'$eq': ["$class", course]},
              {'$eq': ["$email", student]}
            ]
          }
        }
      },
      {
        "$group": {
          '_id': {
            'level_name': '$level_name',
            'student': '$email'
          },
          'percent': {'$avg': '$assignment_percent'},
          'due': {'$first': '$assignment_due'},
          'turned_in_assignment': {'$first': '$turned_in_assignment'}
        }
      },
      {
        "$lookup":
          {
            'from': "adapt",
            'localField': "_id.level_name",
            'foreignField': "assignment_name",
            'as': "adapt",
            'pipeline': [
              {
                '$match': {
                  'anon_student_id': student
                }
              },
              {
                '$group': {
                  '_id': '$assignment_name',
                  'submitted': {
                    '$max': '$submission_time'
                  }
                }
              }
            ]
          }
      },
      {
        "$unwind": {
          'path': '$adapt',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        "$addFields": {
          'percent': {'$round': ['$percent', 2]},
          'submitted': '$adapt.submitted'
        }
      },
      {
        "$sort": {
          'due': 1
        }
      }
    ]
  }

  // //grab data from the adapt collection
  // var data = {
  //     "collection": dbInfo.adaptColl,
  //     "database": dbInfo.db,
  //     "dataSource": dbInfo.dataSource,
  //     "pipeline": [
  //       //match by course and by a single student
  //       {
  //         "$match": {
  //           '$expr': {
  //             '$and': [
  //               {'$eq': ["$course_id", course]},
  //               {'$eq': ["$anon_student_id", student]}
  //             ]
  //           }
  //         }
  //       },
  //       //preserve some adapt attributes, change points to 0 if the outcome was "incorrect"
  //       {
  //         "$project": {
  //           'levelname' : '$assignment_name',
  //           'student' : '$anon_student_id',
  //           'levelpoints' : '$assignment_points',
  //           'problemname' : '$question_id',
  //           'due': '$due',
  //           'time': '$submission_time',
  //           'points' : {
  //             "$cond" : {
  //               'if': {'$and': [{'$ne': ['$question_points', ""]}, {'$eq': ['$outcome', "CORRECT"]}]},
  //               'then': {
  //                 "$convert" : {
  //                   'input' : '$question_points',
  //                   'to': 'double'
  //                 }
  //               },
  //               'else': 0
  //             }
  //           }
  //         }
  //       },
  //       //group by student, assignment, and problem on assignment
  //       //take the student score, found by the maximum points given no partial credit
  //       {
  //         "$group":
  //           {
  //             '_id': {
  //               'student': '$student',
  //               'level_name': '$levelname',
  //               'level_group': '$level_group',
  //               'problem_name': "$problemname"
  //             },
  //             'levelpoints': {
  //               '$first': '$levelpoints'
  //             },
  //             'bestScore': {
  //               '$max': '$points'
  //             },
  //             'due': { '$first': '$due'},
  //             'submitted': {'$first': '$time'}
  //           }
  //       },
  //       //further group by student and assignment
  //       //calculate the total points on the assignment
  //       {
  //         "$group": {
  //           '_id': {
  //             'level' : '$_id.level_name',
  //             'student': '$_id.student'
  //           },
  //           'Sum': {
  //             '$sum': '$bestScore'
  //           },
  //           'due': {
  //             '$first': '$due'
  //           },
  //           'levelpoints': {
  //             '$first' : {'$convert' : {
  //               'input' : '$levelpoints',
  //               'to' : 'double'
  //             }}
  //           },
  //           'submitted': {'$max': '$submitted'}
  //         }
  //       },
  //       //divide the total points earned by the level points to find the score
  //       {
  //         "$addFields": {
  //           'score': {
  //             '$divide' : [
  //               '$Sum',
  //               '$levelpoints'
  //             ]
  //           }
  //         }
  //       },
  //       //calculating percent
  //       {
  //         "$addFields": {
  //           'percent': {
  //             '$round': [{
  //             '$multiply': ['$score', 100]
  //           }, 2]
  //           },
  //           'level_name': '$_id.level'
  //         }
  //       },
  //       {
  //         "$sort": {
  //           'due': 1
  //         }
  //       }
  //     ]
  //   }
  //   var index = 1;
  //   addFilters.spliceDateFilter(index, params, data, true);

    return data;
}

module.exports = studentAdaptAssignmentQuery
