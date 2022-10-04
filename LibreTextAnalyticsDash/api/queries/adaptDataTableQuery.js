const addFilters =  require("../helper/addFilters.js");

function adaptDataTableQuery(params, dbInfo) {

  var data = {
    //getting adapt variables
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ["$course_id", params.courseId]}
              ]
            }
          }
        },
        //reformatting the date to be able to use it in a table
        {
          '$addFields': {
            'day': {'$replaceAll': {
              'input': '$submission_time', 'find': '"', 'replacement': ''
            }}
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
        //group by student, find the most recent assignment load for adapt, dates, and assignments
        {
          '$project': {
            'date': '$date',
            'levelname': '$assignment_name',
            'student': '$anon_student_id',
            'levelpoints': '$assignment_points',
            'problemname': '$question_id',
            'page_id': '$page_id',
            'points': {
              '$cond':
              {
                'if': { '$eq': ['$outcome', "CORRECT"] },
                'then': {
                  '$convert': {
                    'input': '$question_points',
                    'to': 'double',
                    'onError': 0,
                    'onNull': 0
                  }
                },
                'else': 0
              }
            }
          }
        },
        {
          '$group': {
            '_id': {
              'student': '$student',
              'level': '$levelname',
              'problemname': '$problemname',
            },
            'dates': {
              '$addToSet': '$date'
            },
            'page_ids': {
              '$addToSet': '$page_id'
            },
            'levelpoints': {
              '$first': '$levelpoints'
            },
            'bestScore': {
              '$max': '$points'
            },
            'attempts': {
              '$sum': 1
            },
          }
        },
        {
          '$group': {
            '_id': {
              'level': '$_id.level',
              'student': '$_id.student',
            },
            'dateArrays': {
              '$addToSet': '$dates'
            },
            'page_idArrays': {
              '$addToSet': '$page_ids'
            },
            'Sum': {
              '$sum': '$bestScore'
            },
            'attemptsPerLevel': {
              '$sum': '$attempts'
            },
            'levelpoints': {
              '$first': {
                '$convert': {
                  'input': '$levelpoints',
                  'to': 'double',
                  'onError': 1,
                  'onNull': 1
                }
              }
            }
          }
        },
        {
          '$addFields': {
            'score': {
              '$divide': [
                '$Sum',
                '$levelpoints'
              ]
            },
            'dates': {
              '$reduce': {
                'input': '$dateArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            },
            'page_ids': {
              '$reduce': {
                'input': '$page_idArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            }
          }
        },
        {
          '$group': {
            '_id': {
              'student': '$_id.student',
            },
            'dateArrays': {
              '$addToSet': '$dates'
            },
            'page_idArrays': {
              '$addToSet': '$page_ids'
            },
            'Sums': {
              '$push': '$Sum'
            },
            'scoresArray': {
              '$push': '$score'
            },
            'attemptsOverall': {
              '$push': '$attemptsPerLevel'
            },
            'assignments': {
              '$addToSet': '$_id.level'
            }
          }
        },
        {
          '$addFields': {
            'adaptAvgPercentScore': {
              '$round': [{'$multiply': [{'$avg': '$scoresArray'}, 100]}, 1]
            },

            'adaptAvgAttempts': {
              '$round': [{'$avg': '$attemptsOverall'}, 1]
            },

            'dates': {
              '$reduce': {
                'input': '$dateArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            },

            'page_ids': {
              '$reduce': {
                'input': '$page_idArrays',
                'initialValue': [],
                'in': { '$setUnion': ["$$value", "$$this"] }
              }
            }
          }
        },
        {
          '$addFields': {
            'mostRecentAdaptLoad': {
              '$max': '$dates'
            },
            'adaptUniqueInteractionDays': {
              '$size': '$dates'
            },
            'adaptUniqueAssignments': {
              '$size': '$assignments'
            },
            'student': '$_id.student'
          }
        },
        {
          '$unset': '_id'
        },
        {
          '$addFields': {
            '_id': '$student'
          }
        },
        {
          '$project': {
            'page_idArrays': 0,
            'dateArrays': 0,
            'scoresArray': 0,
            'attemptsOverall': 0,
            'page_ids': 0,
            'dates': 0,
          }
        }
      ]
    }

    var filterMatch = {
      '$match': {
        '$expr': {
          '$and': []
        }
      }
    }
    var index = 1;
    addFilters.spliceDateFilter(index, params, data, true);

    return data;
}

module.exports = adaptDataTableQuery
