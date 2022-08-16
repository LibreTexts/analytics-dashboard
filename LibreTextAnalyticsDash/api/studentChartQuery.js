//find the data for the bar chart on the student tab
//look at an attribute and find the number of students per x axis element

function studentChartQuery(params, dbInfo) {
  var group = '$'+params.groupBy
  //look at the main lt collection
  var data = {
    "collection": dbInfo.coll,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [
              {'$eq': ["$verb", "read"]},
              {'$eq': ["$actor.courseName", params.courseId]}
            ]
          }
        }
      },
      //format the date
      {
        '$addFields': {
          "newDate": {'$dateFromString': {'dateString': '$object.timestamp'}},
          'date': {'$dateTrunc': {
              'date': { '$toDate': '$object.timestamp'},
              'unit': 'day'
            }
          }
        }
      },
      //group by student, find attributes such as most unique interaction days, pages accessed, and most recent page load
      {
        "$group": {
          "_id": '$actor.id',
          "courseName": {'$addToSet': '$actor.courseName'},
          "timestamp": {'$addToSet':'$object.timestamp'},
          "max": { '$max': "$newDate" },
          "uniqueDates": {'$addToSet': '$date'},
          "objects": {"$addToSet": '$object.id'},
          "timeStudied": {'$sum': "$object.timeMe"},
        }
      },
      {
        "$addFields": {
          "durationInMinutes": {'$trunc': [{'$divide': ['$durationInSeconds', 60]}, 1]},
          "timeStudied": {'$trunc': [{'$divide': ['$timeStudied', 3600]}, 0]},
          "objectCount": {'$size': "$objects"},
          "viewCount": {'$size': "$timestamp"},
          "percentAvg": {'$trunc': [{'$avg': "$percent"}, 1]},
          "totalViews": {'$size': "$timestamp"},
          "dateCount": {'$size': '$uniqueDates'},
          "lastDate": {'$dateTrunc': {
              'date': { '$toDate': '$max'},
              'unit': 'day'
            }
          }
        }
      },
      //further group by x axis attribute to count the number of students that fit
      {
        "$group": {
          '_id': group,
          'students': {'$addToSet': '$_id'},
          'dates': {'$push': '$uniqueDates'}
        }
      },
      {
        "$addFields": {
          'count': {'$size': '$students'}
        }
      },
      {
        "$sort": {
          "_id": 1
        }
      }
    ]
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

  var lookup = {
    "$lookup": {
      "from": dbInfo.pageColl,
      "localField": "object.id",
      "foreignField": "id",
      "as": "pageInfo"
    }
  }

  var unwind = {
    "$unwind": {
      'path': '$pageInfo'
    }
  }

  var addFields = {
    '$addFields': {
      'course': '$pageInfo.courseName'
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
  if (params.start) {
    filterMatch['$match']['$expr']['$and'].push({'$gte': ['$date', {'$dateFromString': {'dateString': params.start}}]})
    matchesUsed = true
  }
  if (params.end) {
    filterMatch['$match']['$expr']['$and'].push({'$lte': ['$date', {'$dateFromString': {'dateString': params.end}}]})
    matchesUsed = true
  }
  if (matchesUsed && params.courseId) {
    data['pipeline'].splice(2, 0, filterMatch)
  } else if (matchesUsed && !params.courseId) {
    data['pipeline'].splice(2, 0, filterMatch)
  }

  if (!params.courseId || (params.path && params.courseId)) {
    data['pipeline'].splice(1, 0, lookup)
    data['pipeline'].splice(2, 0, unwind)
  }
  if (!params.courseId) {
    data['pipeline'].splice(1, 0, initMatch)
    data['pipeline'].splice(4, 0, addFields)
    data['pipeline'].splice(5, 0, courseMatch)
  }
  // if (params.courseId) {
  //   match['$match']['$expr']['$and'].push({'$eq': ['$actor.courseName', params.courseId]})
  //   data['pipeline'].splice(0, 0, match)
  // }
  if (params.path) {
    pathMatch['$match']['$expr']['$and'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]})
    data['pipeline'].splice(4, 0, pathMatch)
  }
  return data;
}

module.exports = { studentChartQuery }
