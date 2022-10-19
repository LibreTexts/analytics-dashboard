function adaptLookupSubQuery(codeFound, params, dbInfo) {
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
                { '$eq': ["$course_id", codeFound.code] }
              ]
            }
          }
        },
        //reformatting the date to be able to use it in a table
        {
          '$addFields': {
            'day': {
              '$replaceAll': {
                'input': '$submission_time', 'find': '"', 'replacement': ''
              }
            }
          }
        },
        {
          '$addFields': {
            'date': {
              '$dateTrunc': {
                'date': { '$toDate': '$day' },
                'unit': 'day'
              }
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
            }
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
            'attempts': {'$avg': '$attempts'}
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
            'pageArrays': {
              '$push': '$pageIds'
            },
            'adaptAvgAttempts': {'$avg': '$attempts'},
            'adaptAvgPercentScore': {'$avg': '$scores.assignment_percent'},
            'courseGrade': {'$max': '$scores.overall_course_percent'}
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
            }
          }
        },
        {
          '$addFields': {
            'adaptUniqueInteractionDays': {'$size': '$dates'},
            'adaptUniqueAssignments': {'$size': '$pageIds'},
            'mostRecentAdaptLoad': {'$max': '$dates'}
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

  return adaptLookup
}

module.exports = { adaptLookupSubQuery }
