const addFilters =  require("../helper/addFilters.js");
//query to get student grades for each adapt assignment, on the student tab

function allAdaptAssignmentsQuery(params, adaptCodes, dbInfo, encryptStudent, environment) {
  //find the adapt code for the lt course id
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }
  if (environment === "production") {
    course = params.adaptCourseID
  }

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
                {'$eq': ["$class", course]}
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
    // var index = 1;
    // addFilters.spliceDateFilter(index, params, data, true);

    return data;
}

module.exports = allAdaptAssignmentsQuery
