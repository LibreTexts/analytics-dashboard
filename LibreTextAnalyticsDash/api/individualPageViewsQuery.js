//query to find views per date for an individual page

function individualPageViewsQuery(params, adaptCodes, dbInfo) {
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }
  //params.individual is for the individual page views chart
  if (params.individual) {
    var data = {
      "collection": dbInfo.coll,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        //match by course
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
        //join to page collection to be able to match by page
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
        //filter down to an individual page
        {
          '$match': {
            'pageInfo.title': params.individual
          }
        },
        //format date
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
        //group by date to create the chart
        {
          "$group": {
            '_id': '$date',
            'students': {'$push': '$actor.id' }
          }
        },
        {
          "$addFields": {
            'count': {'$size': '$students'},
            'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
            'uniqueStudents' : {'$setUnion' : ['$students', []]}
          }
        },
        {
          "$sort": {"_id": 1}
        }
      ]
    }
    //params.levelName is for individual adapt assignments chart
  } else if (params.levelName) {
    //look in the adapt collection
      var data = {
        "collection": dbInfo.adaptColl,
        "database": dbInfo.db,
        "dataSource": dbInfo.dataSource,
        "pipeline": [
          //filter down to the assignment
          {
            '$match': {
              '$expr': {
                '$and': [
                  {'$eq': ['$class', course]},
                  {'$eq': ['$level_group', params.levelGroup]},
                  {'$eq': ['$level_name', params.levelName]}
                ]
              }
            }
          },
          //format date and bin by day, week, or month as shown in frontend filter
          {
            "$addFields": {
              'date': {'$dateTrunc': {
                  'date': { '$toDate': '$time'},
                  'unit': params.unit,
                  'binSize': params.bin
                }
              }
            }
          },
          //group by date, binning it automatically
          {
            "$group": {
              '_id': '$date',
              'students': {'$push': '$anon_student_id' }
            }
          },
          //count the number of students who submitted the assignment by the date
          {
            "$addFields": {
              'count': {'$size': '$students'},
              'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
              'uniqueStudents' : {'$setUnion' : ['$students', []]}
            }
          },
          {
            "$sort": {"_id": 1}
          }
        ]
      }
  }
  //console.log(data)
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
  if (params.start) {
    filterMatch['$match']['$expr']['$and'].push({'$gte': ['$_id', {'$dateFromString': {'dateString': params.start}}]})
    matchesUsed = true
  }
  if (params.end) {
    filterMatch['$match']['$expr']['$and'].push({'$lte': ['$_id', {'$dateFromString': {'dateString': params.end}}]})
    matchesUsed = true
  }
  if (params.path) {
    pathMatch['$match']['$expr']['$and'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]})
    data['pipeline'].splice(5, 0, pathMatch)
  }
  if (matchesUsed && params.courseId) {
    data['pipeline'].splice(6, 0, filterMatch)
  }
  // console.log(data['pipeline'])
  return data;
}

module.exports = { individualPageViewsQuery }
