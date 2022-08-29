const addFilters =  require("../helper/addFilters.js");
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
            '$and': [
              {'$eq': ["$verb", "read"]},
              {'$eq': ["$actor.courseName", params.courseId]}
            ]
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
          'pages': {'$push': '$object.id' },
          'uniquePages': {'$addToSet': '$object.id'}
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
        '$unset': ['pages', 'uniquePages']
      },
      {
        "$sort": {"_id": 1}
      }
    ]
  }

  var index = 1;
  index = addFilters.spliceDateFilter(index, params, data);
  index = addFilters.splicePathFilter(index+2, params, data);
  addFilters.spliceTagFilter(index, params, data);

  return data;
}

module.exports = aggregatePageViewsQuery
