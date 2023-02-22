const addFilters =  require("../helper/addFilters.js");

function individualGradePageViewsQuery(params, dbInfo, environment) {
  //find the adapt code for the lt course id
  var course = params.adaptCourseID ? params.adaptCourseID : params.courseId;
  // if (environment === "production") {
  //   course = params.adaptCourseID
  // }

  var data = {
    "collection": dbInfo.gradesColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [
              {'$eq': ["$class", course]},
              {'$eq': ["$level_name", params.levelName]}
            ]
          }
        }
      },
      {
        "$group": {
          '_id': '$email',
          'score': {'$first': '$proportion_correct'},
          // 'score': {'$first': '$assignment_percent'},
          'turned_in': {'$first': '$turned_in_assignment'}
        }
      },
      {
        "$addFields": {
          'score': {'$multiply': ['$score', 100]}
        }
      }
    ]
  }
  var index = 1;
  addFilters.spliceDateFilter(index, params, data, false, true);

  return data;
}

module.exports = individualGradePageViewsQuery
