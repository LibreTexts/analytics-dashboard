

function allAdaptCoursesQuery(dbInfo) {
  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$group": {
          '_id': "$class_name",
          'course': {'$first': "$class"},
          'students': {'$addToSet': "$anon_student_id"}
        }
      },
      {
        "$addFields": {
          'adaptCourse': true
        }
      }
    ]
  }
  return data;
}

module.exports = allAdaptCoursesQuery
