//query to find all students

function allStudentsQuery(params, dbInfo) {
    //look in the main libretext collection to get student and page data
    var data = {
      "collection": dbInfo.coll,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ['$verb', 'read']},
                {'$eq': ['$actor.courseName', params.courseId]}
              ]
            }
          }
        },
        {
          '$group': {
            '_id': '$actor.id'
          }
        }
      ]
    }

    return data;
}

module.exports = { allStudentsQuery }
