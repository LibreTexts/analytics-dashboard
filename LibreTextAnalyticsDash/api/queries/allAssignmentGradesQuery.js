const addFilters =  require("../helper/addFilters.js");
//query to get student grades for each adapt assignment, on the student tab

function allAssignmentGradesQuery(params, dbInfo, environment) {

  var course = params.adaptCourseID ? params.adaptCourseID : params.courseId;
  //grab data from the adapt collection
  var data = {
      "collection": dbInfo.gradesColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        //match by course
        {
          "$match": {
            '$expr': {
              '$and': [
                {'$eq': ["$class", course]}
              ]
            }
          }
        },
        {
          "$group": {
            '_id': '$email',
            'score': {'$first': '$overall_course_percent'},
            'letterGrade': {'$first': '$overall_course_grade'}
          }
        },
        {
          '$addFields': {
            "fromGradebook": true
          }
        }
      ]
    }
    var index = 1;
    addFilters.spliceDateFilter(index, params, data, false, true);

    return data;
}

module.exports = allAssignmentGradesQuery
