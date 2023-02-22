const addFilters = require("../helper/addFilters.js");

function adaptLookupSubQuery(params, dbInfo, environment) {
  var adaptLookup = {
    //getting adapt variables
    "$lookup": {
      "from": dbInfo.adaptColl,
      "localField": "_id",
      "foreignField": "anon_student_id",
      "as": "adapt",
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                { '$eq': ["$course_id", params.adaptCourseID] },
              ]
            }
          }
        },
        //reformatting the date to be able to use it in a table
        {
          '$addFields': {
              'day': {
                $cond: {
                  if: {"$ne": ["$submission_time", ""]},
                  then: {
                    '$replaceAll': {
                      'input': '$submission_time', 'find': '"', 'replacement': ''
                    }
                  },
                  else: "$review_time_end"
              }
            }
          }
        },
        {
          '$addFields': {
            'assn_due': {'$dateFromString': {'dateString':'$due'}},
            'time_submitted': {'$dateFromString': {'dateString':'$day'}},
            'date': {
              '$dateTrunc': {
                'date': { '$toDate': '$day' },
                'unit': 'day'
              }
            }
          }
        },
        {
          '$addFields': {
            'hoursBeforeDue': {
              '$divide': [
                {'$subtract': ['$assn_due', '$time_submitted']},
                3600000
              ]
            }
          }
        },
        {
          '$group': {
            '_id': {
              'anon_student_id': '$anon_student_id',
              'level_name': '$assignment_name',
              'problem_name': '$question_id'
            },
            'dates': {'$addToSet': '$date'},
            'attempts': {'$sum': 1},
            'page_ids': {
              '$addToSet': '$page_id'
            },
            'hoursBeforeDueArray': { '$push': '$hoursBeforeDue' }
          }
        },
        {
          '$group': {
            '_id': {
              'anon_student_id': '$_id.anon_student_id',
              'level_name': '$_id.level_name'
            },
            'dateArrays': {
              '$addToSet': '$dates'
            },
            'pageArrays': {
              '$addToSet': '$page_ids'
            },
            'attempts': {'$avg': '$attempts'},
            'hoursBeforeDueArrays': { '$push': '$hoursBeforeDueArray' }
          }
        },
        {
          '$addFields': {
            'dates': {
              '$reduce': {
                'input': '$dateArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            },
            'pageIds': {
              '$reduce': {
                'input': '$pageArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            },
            'hoursBeforeDue': {
              '$reduce': {
                'input': '$hoursBeforeDueArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            }
          }
        },
        // should only grab the scores of assignments that have already happened:
        //  need to have data in the adapt collection before any grades are linked to them
        //  causes problems for things like Midterms that are taken in person
        //  might need to run a separate aggregation for the gradebook and connect it later
        {
          '$lookup': {
            "from": dbInfo.gradesColl,
            "localField": "_id.anon_student_id",
            "foreignField": "email",
            "let": {
              'level': '$_id.level_name'
            },
            "pipeline": [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {'$eq': ['$$level', '$level_name']}
                    ]
                  }
                }
              }
            ],
            "as": "scores"
          }
        },
        {
          "$unwind": {
            "path": "$scores",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$group": {
            '_id': '$_id.anon_student_id',
            'dateArrays': {
              '$push': '$dates'
            },
            'pageArrays': {
              '$push': '$pageIds'
            },
            'hoursBeforeDueArrays': {
              '$push': '$hoursBeforeDue'
            },
            'adaptAvgAttempts': {'$avg': '$attempts'},
            'adaptAvgPercentScore': {'$avg': '$scores.assignment_percent'},
            'courseGrade': {'$max': '$scores.overall_course_percent'},
            'uniqueAssignments': {'$addToSet': '$_id.level_name'}
          }
        },
        {
          '$addFields': {
            'dates': {
              '$reduce': {
                'input': '$dateArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            },
            'pageIds': {
              '$reduce': {
                'input': '$pageArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            },
            'hoursBeforeDue': {
              '$reduce': {
                'input': '$hoursBeforeDueArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            }
          }
        },
        {
          '$addFields': {
            'adaptUniqueInteractionDays': {'$size': '$dates'},
            'adaptUniqueAssignments': {'$size': '$uniqueAssignments'},
            'adaptUniqueProblems': {'$size': '$pageIds'},
            'mostRecentAdaptLoad': {'$max': '$dates'},
            'adaptHoursBeforeDue': {'$avg': '$hoursBeforeDue'}
          }
        }
      ]
    }
  }
  //for filtering data by adapt assignment
  if (params.adaptLevelGroup) {
    adaptLookup['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({
      '$eq': ['$level_group', params.adaptLevelGroup]
    })
  }
  if (params.adaptLevelName) {
    adaptLookup['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({
      '$eq': ['$level_name', params.adaptLevelName]
    })
  }
  addFilters.spliceDateFilter(2, params, adaptLookup["$lookup"], true);
  return adaptLookup
}

module.exports = { adaptLookupSubQuery }
