function assignmentCountFromGradebookQuery(dbInfo, course, cutoffDate, bucket, params) {
  //filter by dates
  var data = {
    "collection": dbInfo.gradesColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$match': {
          '$expr': {
            '$and': [
              { '$eq': ['$class', course] },
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
          '_id': "$class",
          'assignments': {
            '$addToSet': '$level_name'
          },
          'startDate': {
            '$first': '$course_start_date'
          }
        }
      },
      {
        '$addFields': {
          "assignmentCount": {
            '$size': '$assignments'
          }
        }
      },
      {
        '$lookup': {
          from: "adapt",
          localField: "_id",
          foreignField: "course_id",
          as: 'result',
          pipeline: [
            {
              '$match': {
                course_id: course
              }
            },
            {
              '$group': {
                '_id': '',
                course_start_date: {'$first': '$course_start_date'}
              }
            }
          ]
        }
      },
      {
        '$unwind': '$result'
      },
      {
        '$addFields': {
          'startDate': '$result.course_start_date'
        }
      },
      {
        '$unset': ['assignments', 'result']
      }
    ]
  }
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

  if (params.cutoffDate || params.startDate || params.endDate) {
    var match = {
      '$match': {
        '$expr': {
          '$and': []
        }
      }
    }
    if (params.cutoffDate) {
      match['$match']['$expr']['$and'].push({ '$lte': ['$formattedDate', {'$dateFromString': {'dateString': cutoffDate}}] })
    }
    if (params.startDate) {
      match['$match']['$expr']['$and'].push({ '$gte': ['$formattedDate', {'$dateFromString': {'dateString': params.startDate}}] })
    }
    if (params.endDate) {
      match['$match']['$expr']['$and'].push({ '$lte': ['$formattedDate', {'$dateFromString': {'dateString': params.endDate}}] })
    }
    data['pipeline'].splice(bucket && bucket.length > 0 ? 3 : 2, 0, match)
  }

  return data;
}

module.exports = assignmentCountFromGradebookQuery;
