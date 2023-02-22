const addFilters =  require("../helper/addFilters.js");
//query to get student grades for each adapt assignment, on the student tab

function allAdaptAssignmentsQuery(params, dbInfo, encryptStudent, environment) {

  var course = params.adaptCourseID ? params.adaptCourseID : params.courseId;
  //grab data from the adapt collection
  var data = {
      "collection": dbInfo.gradesColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        //match by course and by a single student
        {
          "$match": {
            '$expr': {
              '$and': [
                {'$eq': ["$class", course]},
                {'$ne': ["$proportion_correct", null]},
                {'$ne': ["$assignment_due", "Not Found"]}
              ]
            }
          }
        },
        {
          "$group": {
            '_id': '$level_name',
            'percent': {'$avg': '$assignment_percent'},
            'due': {'$first': '$assignment_due'}
          }
        },
        {
          "$addFields": {
            'percent': {'$round': ['$percent', 2]}
          }
        },
        {
          "$sort": {
            'due': 1
          }
        }
      ]
    }
    var index = 1;
    addFilters.spliceDateFilter(index, params, data, false, true);

    return data;
}

module.exports = allAdaptAssignmentsQuery
