const addFilters =  require("../helper/addFilters.js");
//find the data for the bar chart on the student tab
//look at an attribute and find the number of students per x axis element

function adaptStudentChartQuery(params, dbInfo, environment) {

  var course = params.adaptCourseID ? params.adaptCourseID : params.courseId;

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
          "newDate": {
            $cond: {
              if: {"$ne": ["$submission_time", ""]},
              then: {'$dateFromString': {'dateString': '$submission_time'}},
              else: {'$dateFromString': {'dateString': '$review_time_end'}}
            }
          },
          'date': {
            $cond: {
              if: {"$ne": ["$submission_time", ""]},
              then: {'$dateTrunc': {
                  'date': { '$toDate': '$submission_time'},
                  'unit': 'day'
                }
              },
              else: {'$dateTrunc': {
                  'date': { '$toDate': '$review_time_end'},
                  'unit': 'day'
                }
              }
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
