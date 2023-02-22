const addFilters = require("../helper/addFilters.js");
const moment = require("moment");

function averageGradesFromGradebookQuery(course, dbInfo, bucket, prop_avail_assns, cutoffDate) {
  var data = {
      "collection": dbInfo.gradesColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ['$class', course]},
                {'$ne': ['$proportion_correct', null]}
              ]
            }
          }
        },
        {
          "$addFields": {
            "formattedDate": {
              $cond: {
                if: {"$ne": ["$assignment_due", "Not Found"]},
                then: {'$dateFromString': {'dateString': '$assignment_due'}},
                else: null
              }
            }
          }
        },
        // {
        //   '$match': {
        //     '$expr': {
        //       '$and': [
        //         // { '$gte': ['$formattedDate', {'$dateFromString': {'dateString': startDate}}] },
        //         { '$lte': ['$formattedDate', {'$dateFromString': {'dateString': cutoffDate}}] }
        //       ]
        //     }
        //   }
        // },
        {
          '$group': {
            '_id': '$email',
            'avgScore': {
              '$avg': '$proportion_correct'
            },
            'assignments': {
              '$addToSet': '$level_name'
            }
          }
        },
        {
          '$addFields': {
            'avgPercent': {
              '$trunc': [
                {
                '$multiply': ['$avgScore', 100]
                },
              1]
            },
            'avg_score': {
              '$multiply': ['$avgScore', 100]
            },
            'assignmentCount': {'$size': '$assignments'},
            'adapt_prop_avail_assn': {'$divide': [{'$size': '$assignments'}, prop_avail_assns]}
          }
        },
        {
          '$group': {
            '_id': '',
            'adapt_avg_score_stddev': {
              '$stdDevPop': '$avg_score'
            },
            'adapt_avg_score_avg': {
              '$avg': '$avg_score'
            },
            'adapt_unique_assns_stddev': {
              '$stdDevPop': '$assignmentCount'
            },
            'adapt_unique_assns_avg': {
              '$avg': '$assignmentCount'
            },
            'adapt_prop_avail_assn_stddev': {
              '$stdDevPop': '$adapt_prop_avail_assn'
            },
            'adapt_prop_avail_assn_avg': {
              '$avg': '$adapt_prop_avail_assn'
            },
            'roots': {
              '$push': '$$ROOT'
            }
          }
        },
        {
          '$unwind': {
            path: '$roots',
            includeArrayIndex: 'allData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          '$project': {
            _id: '$roots._id',
            adapt_avg_score: { $cond: [ '$roots.avg_score', '$roots.avg_score', null ] },
            adapt_avg_score_z: {'$divide': [{'$subtract': ['$roots.avg_score', '$adapt_avg_score_avg']}, '$adapt_avg_score_stddev']},
            avgPercent: '$roots.avgPercent',
            avgScore: '$roots.avgScore',
            adapt_unique_assns: '$roots.assignmentCount',
            adapt_unique_assns_z: {'$divide': [{'$subtract': ['$roots.assignmentCount', '$adapt_unique_assns_avg']}, '$adapt_unique_assns_stddev']},
            adapt_prop_avail_assn: '$roots.adapt_prop_avail_assn',
            adapt_prop_avail_assn_z: {'$divide': [{'$subtract': ['$roots.adapt_prop_avail_assn', '$adapt_prop_avail_assn_avg']}, '$adapt_prop_avail_assn_stddev']}
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
    data['pipeline'].splice(1, 0, match)
  }

  return data;
}

module.exports = averageGradesFromGradebookQuery;
