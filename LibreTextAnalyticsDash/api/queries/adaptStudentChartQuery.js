const addFilters =  require("../helper/addFilters.js");
//find the data for the bar chart on the student tab
//look at an attribute and find the number of students per x axis element

function adaptStudentChartQuery(params, dbInfo, adaptCodes) {
  //find the adapt code for the lt course id
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }

  var group = '$'+params.groupBy
  //look at the adapt collection
  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [{'$eq': ["$course_id", course]}]
          }
        }
      },
      //format the date
      {
        '$addFields': {
          "newDate": {'$dateFromString': {'dateString': '$submission_time'}},
          'date': {'$dateTrunc': {
              'date': { '$toDate': '$submission_time'},
              'unit': 'day'
            }
          }
        }
      },
      //group by student, find attributes such as most unique interaction days, pages accessed, and most recent page load
      {
        "$group": {
          "_id": '$anon_student_id',
          "courseName": {'$addToSet': '$course_id'},
          "timestamp": {'$addToSet':'$submission_time'},
          "max": { '$max': "$newDate" },
          "uniqueDates": {'$addToSet': '$date'},
          "objects": {"$addToSet": '$assignment_name'}
        }
      },
      {
        "$addFields": {
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
  addFilters.spliceDateFilter(index, params, data, true);

  return data;
}

module.exports = adaptStudentChartQuery
