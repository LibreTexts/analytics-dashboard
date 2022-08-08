//query to find the number of pages viewed by date

function aggregatePageViewsQuery(params, dbInfo) {
  //looks in the lt data collection
  var data = {
    "collection": dbInfo.coll,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [{'$eq': ["$verb", "read"]}]
          }
        }
      },
      //connect lt data to page info
      {
        "$lookup": {
          "from": dbInfo.pageColl,
          "localField": "object.id",
          "foreignField": "id",
          "as": "pageInfo"
        }
      },
      {
        "$unwind": {
          'path': '$pageInfo'
        }
      },
      {
        '$addFields': {
          'course': '$pageInfo.courseName'
        }
      },
      //format date and bin by day, week, or month from the frontend filter
      {
        "$addFields": {
          'date': {'$dateTrunc': {
              'date': { '$toDate': '$object.timestamp'},
              'unit': params.unit,
              'binSize': params.bin
            }
          }
        }
      },
      //group by date, automatically binning it
      {
        "$group": {
          '_id': '$date',
          'pages': {'$push': '$object.id' }
        }
      },
      //counting the number of pages viewed per date
      {
        "$addFields": {
          'count': {'$size': '$pages'},
          'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
          'uniquePages' : {'$setUnion' : ['$pages', []]}
        }
      },
      {
        "$sort": {"_id": 1}
      }
    ]
  }
  var courseMatch = {
    "$match": {
      '$expr': {
        '$and': [
          {'$eq': ['$course', params.course]}
        ]
      }
    }
  }
  if (!params.courseId) {
    data['pipeline'].splice(1, 0, initMatch)
    data['pipeline'].splice(5, 0, courseMatch)
  }

  var match = {
    "$match": {
      '$expr': {
        '$and': []
      }
    }
  }

  var filterMatch = {
    "$match": {
      '$expr': {
        '$and': []
      }
    }
  }

  var pathMatch = {
    "$match": {
      '$expr': {
        '$and': []
      }
    }
  }

  var matchesUsed = false
  if (params.courseId) {
    match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
    data['pipeline'].splice(0, 0, match)
  }
  if (params.start) {
    filterMatch['$match']['$expr']['$and'].push({'$gte': ['$date', {'$dateFromString': {'dateString': params.start}}]})
    matchesUsed = true
  }
  if (params.end) {
    filterMatch['$match']['$expr']['$and'].push({'$lte': ['$date', {'$dateFromString': {'dateString': params.end}}]})
    matchesUsed = true
  }
  if (params.path) {
    pathMatch['$match']['$expr']['$and'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]})
    data['pipeline'].splice(5, 0, pathMatch)
  }
  if (matchesUsed && params.courseId) {
    data['pipeline'].splice(6, 0, filterMatch)
  } else if (matchesUsed && !params.courseId) {
    data['pipeline'].splice(7, 0, filterMatch)
  }
  return data;
}

module.exports = { aggregatePageViewsQuery }
