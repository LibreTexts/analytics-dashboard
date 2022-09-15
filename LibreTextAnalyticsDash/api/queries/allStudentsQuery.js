//query to find all students

function allStudentsQuery(params, dbInfo) {
    //look in the main libretext collection to get a list of all students
    var collection = dbInfo.coll
    var aggregationAttr = "$actor.id"
    var courseMatch = '$actor.courseName'
    if (!params.ltCourse) {
      collection = dbInfo.adaptColl
      aggregationAttr = "$anon_student_id"
      var courseMatch = '$class'
    }
    var data = {
      "collection": collection,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': [courseMatch, params.courseId]}
              ]
            }
          }
        },
        {
          '$group': {
            '_id': aggregationAttr
          }
        }
      ]
    }

    return data;
}

module.exports = allStudentsQuery
