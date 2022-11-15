//query to find the level groups and assignments of an adapt course

function adaptLevelQuery(params, adaptCodes, dbInfo, environment) {
    //look up the adapt code based on the lt course id
    var codeFound = adaptCodes.find(o => o.course === params.courseId)
    var course = codeFound;
    if (!codeFound) {
      course = params.courseId
    } else {
      course = codeFound.code
    }
    if (environment === "production") {
      course = params.adaptCourseID ? params.adaptCourseID : null;
    }
    //look in the adapt data
    var data = {
      "collection": dbInfo.adaptColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ["$course_id", course]}
              ]
            }
          }
        },
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$ne': ['$assignment_group', null]},
                {'$ne': ['$assignment_group', ""]}
              ]
            }
          }
        },
        //group by level group and name in case there are assignments in different groups with the same name
        {
          '$group': {
            '_id': {
              'level_group': '$assignment_group',
              'level_name': '$assignment_name'
            }
          }
        },
        //group by level group again to link the groups with all assignments in the level
        {
          '$group': {
            '_id': '$_id.level_group',
            'level_name': {'$addToSet': '$_id.level_name'}
          }
        }
      ]
    }
    return data;
}

module.exports = adaptLevelQuery
