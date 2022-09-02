const addFilters =  require("../helper/addFilters.js");

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
      //group by date, automatically binning it
      {
        "$group": {
          '_id': '$date',
          'pages': {'$push': '$object.id' },
          'uniquePages': {'$addToSet': '$pageInfo.title'}
        }
      },
      //counting the number of pages viewed per date
      {
        "$addFields": {
          'count': {'$size': '$pages'},
          'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
          'uniquePageCount' : {'$size': '$uniquePages'}
        }
      },
      {
        "$sort": {"_id": 1}
      }
    ]
  }
  var index = 2;
  index = addFilters.spliceDateFilter(index, params, data);
  index = addFilters.splicePathFilter(index+2, params, data);
  addFilters.spliceTagFilter(index, params, data);
  console.log(data['pipeline'])
  console.log(data['pipeline'][4]['$match']['$expr'])
  return data;
}

module.exports = studentTextbookEngagementQuery
