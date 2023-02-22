

function assignmentCountQuery(dbInfo) {

  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$group': {
          '_id': "$course_id",
          'assignments': {
            '$addToSet': '$assignment_name'
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
        '$unset': 'assignments'
      }
    ]
  }

  return data;
}

function assignmentCountQuerySpecificCourse(params, dbInfo, course, cutoffDate=null, bucket=null) {
  //filter by dates
  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$match': {
          '$expr': {
            '$and': [
              { '$eq': ['$course_id', course] }
            ]
          }
        }
      },
      {
        "$addFields": {
          "formattedDate": {
            $cond: {
              if: {"$ne": ["$submission_time", ""]},
              then: {'$dateFromString': {'dateString': '$submission_time'}},
              else: {'$dateFromString': {'dateString': '$review_time_end'}}
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
          '_id': "$course_id",
          'assignments': {
            '$addToSet': '$assignment_name'
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
      // {
      //   '$unset': 'assignments'
      // }
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

module.exports = { assignmentCountQuery, assignmentCountQuerySpecificCourse }
