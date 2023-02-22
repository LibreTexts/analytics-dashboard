

function pageCountQuery(dbInfo, courseMatch=false, course, cutoffDate, params) {

  var data = {
    "collection": dbInfo.coll,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$match': {
          'verb': "read"
        }
      },
      {
        "$addFields": {
          "formattedDate": {
            '$dateFromString': {'dateString': '$object.timestamp'}
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
          '_id': "$actor.courseName",
          "pages": {
            "$addToSet": "$object.id"
          }
        }
      },
      {
        '$addFields': {
          "pageCount": {
            "$size": "$pages"
          }
        }
      },
      {
        '$unset': 'pages'
      }
    ]
  }

  if (courseMatch) {
    var match = {
      '$match': {
        'actor.courseName': course
      }
    }
    data['pipeline'].splice(0, 0, match)
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
    data['pipeline'].splice(courseMatch ? 3 : 2, 0, match)
  }

  return data;
}

module.exports = pageCountQuery
