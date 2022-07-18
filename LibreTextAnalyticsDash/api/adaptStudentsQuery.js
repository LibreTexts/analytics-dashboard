
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
  return data;
}

module.exports = { adaptStudentsQuery }
