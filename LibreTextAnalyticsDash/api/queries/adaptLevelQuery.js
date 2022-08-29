//query to find the level groups and assignments of an adapt course

function adaptLevelQuery(params, adaptCodes, dbInfo) {
    //look up the adapt code based on the lt course id
    var codeFound = adaptCodes.find(o => o.course === params.courseId)
    var course = codeFound;
    if (!codeFound) {
      course = params.courseId
    } else {
      course = codeFound.code
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
                {'$eq': ["$class", course]}
              ]
            }
          }
        },
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$ne': ['$level_group', null]},
                {'$ne': ['$level_group', ""]}
              ]
            }
          }
        },
        //group by level group and name in case there are assignments in different groups with the same name
        {
          '$group': {
            '_id': {
              'level_group': '$level_group',
              'level_name': '$level_name'
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
