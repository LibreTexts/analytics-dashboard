const addFilters =  require("../helper/addFilters.js");

function adaptStudentsQuery(params, dbInfo) {
  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          "class": params.courseId
        }
      },
      {
        "$group": {
          "_id": "$anon_student_id"
        }
      }
    ]
  }
  var index = 1;
  addFilters.spliceDateFilter(index, params, data, true);

  return data;
}

module.exports = adaptStudentsQuery
