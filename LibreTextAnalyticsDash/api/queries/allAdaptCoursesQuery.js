

function allAdaptCoursesQuery(dbInfo) {
  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$group": {
          '_id': "$course_name",
          'course': {'$first': "$course_id"},
          // 'startDate': {'$first': "$course_start_date"},
          // 'endDate': {'$max': "$due"}
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
