
function studentTextbookEngagementQuery(params, dbInfo, encryptStudent) {
  var student = params.individual
  if (params.individual.includes('@')) {
    student = encryptStudent(params.individual)
  }

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
              {'$eq': ["$actor.courseName", params.courseId]},
              {'$eq': ["$actor.id", student]}
            ]
          }
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

  return data;
}

module.exports = studentTextbookEngagementQuery
