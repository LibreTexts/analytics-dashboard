const addFilters = require("../helper/addFilters.js");

function ewsModelAdaptQuery(params, dbInfo, environment, prop_avail_assns, isLookup=false, cutoff_date, default_cutoff_date, courseStartDate, bucket) {
  var manual_start_date = params.startDate;
  var adaptCall = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource
  }
  var adaptLookup = {
    "$lookup": {
      "from": dbInfo.adaptColl,
      "localField": "_id",
      "foreignField": "anon_student_id",
      "as": "adapt"
    }
  }
  var pipeline = {
    "pipeline": [
      {
        '$match': {
          '$expr': {
            '$and': [
              { '$eq': ["$course_id", params.adaptCourseID ? params.adaptCourseID : params.courseId] },
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
        '$match': {
          '$expr': {
            '$and': [
              {'$gte': ["$time_submitted", {'$dateFromString': {'dateString': manual_start_date ? manual_start_date : courseStartDate}}]},
              {'$lte': ["$time_submitted", {'$dateFromString': {'dateString': cutoff_date ? cutoff_date : default_cutoff_date}}]}
            ]
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
          'times': {'$addToSet': '$time_submitted'},
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
          'timeArrays': {
            '$addToSet': '$times'
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
          'times': {
            '$reduce': {
              'input': '$timeArrays',
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
          'timeArrays': {
            '$push': '$times'
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
          'times': {
            '$reduce': {
              'input': '$timeArrays',
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
          'mostRecentAdaptLoad': {'$max': '$times'},
          'adaptHoursBeforeDue': {'$avg': '$hoursBeforeDue'}
        }
      },
      {
        '$addFields': {
          'adapt_prop_avail_assn': { '$divide': ['$adaptUniqueAssignments', prop_avail_assns] },
          'adapt_hours_since_recent': {'$divide': [{'$subtract': [{'$dateFromString': {'dateString': cutoff_date ? cutoff_date : default_cutoff_date}}, '$mostRecentAdaptLoad']}, 3600000]}
        }
      }
    ]
  }
  //for filtering data by adapt assignment
  if (bucket && bucket.length > 0) {
    var match = {
      '$match': {
        '$expr': {
          '$or': [
          ]
        }
      }
    }
    bucket.forEach((assn) => {
      match['$match']['$expr']['$or'].push({
        '$eq': ['$assignment_group', assn]
      })
    })
    pipeline['pipeline'].splice(1, 0, match)
  }

  if (isLookup) {
    adaptLookup['$lookup']['pipeline'] = pipeline['pipeline']
    return adaptLookup
  } else {
    adaptCall['pipeline'] = pipeline['pipeline']
    return adaptCall
  }
}

module.exports = ewsModelAdaptQuery
