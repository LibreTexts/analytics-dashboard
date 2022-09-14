//query to find the number of pages viewed by date

function averagePageViewsQuery(params, dbInfo) {
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
      {
        "$group": {
          '_id': {
            'student': '$actor.id',
            'date': '$date'
          },
          'pages': {
            '$push': '$object.id'
          }
        }
      },
      {
        "$addFields": {
          'pageCount': {'$size': '$pages'}
        }
      },
      //group by date, automatically binning it
      {
        "$group": {
          '_id': '$_id.date',
          'pageAvg': {
            '$avg': '$pageCount'
          }
        }
      },
      //counting the number of pages viewed per date
      {
        "$addFields": {
          'count': {
            '$round': ['$pageAvg', 0]
          },
          'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]}
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

  var tagLookup = {
    '$lookup': {
      "from": dbInfo.metaColl,
      "localField": "pageInfo.id",
      "foreignField": "pageId",
      "as": "metaTags"
    }
  }
  var tagUnwind = {
    '$unwind': {
      'path': '$metaTags'
    }
  }
  var tagMatch = {
    "$match": {
      'metaTags.value': params.tagFilter
    }
  }

  var pathMatch = {
    "$match": {
      '$expr': {
        // '$and': []
        '$or': []
      }
    }
  }

  if(params.tagFilter) {
    data['pipeline'].splice(3, 0, tagLookup)
    data['pipeline'].splice(4, 0, tagUnwind)
    data['pipeline'].splice(5, 0, tagMatch)
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
    Object.values(params.path).forEach(e => {
      //console.log(e)
      // pathMatch["$match"]['$expr']['$and'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", e ] }, -1]})
      pathMatch["$match"]['$expr']['$or'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", e ] }, -1]})
    });
    //console.log(JSON.stringify(pathMatch, null, 2))

    if(params.tagFilter) {
      data['pipeline'].splice(8, 0, pathMatch)
    } else {
      data['pipeline'].splice(5, 0, pathMatch)
    }
  }
  if (matchesUsed && params.path) {
    if(params.tagFilter) {
      data['pipeline'].splice(10, 0, filterMatch)
    } else {
      data['pipeline'].splice(7, 0, filterMatch)
    }
  } else if (matchesUsed && !params.path) {
    if(params.tagFilter) {
      data['pipeline'].splice(9, 0, filterMatch)
    } else {
      data['pipeline'].splice(6, 0, filterMatch)
    }
  }
  return data;
}

module.exports = averagePageViewsQuery
