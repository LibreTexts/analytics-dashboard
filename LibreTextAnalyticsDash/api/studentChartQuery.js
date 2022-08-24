const addFilters =  require("./addFilters.js");
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
  var index = 1;
  index = addFilters.spliceDateFilter(index, params, data);
  index = addFilters.splicePathFilter(index, params, data, true);
  addFilters.spliceTagFilter(index, params, data, index > 4 ? false : true);

  return data;
}

module.exports = { studentChartQuery }
