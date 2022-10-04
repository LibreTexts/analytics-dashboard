

function assignmentCountQuery(dbInfo) {

  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$group': {
          '_id': "$course_id",
          'assignments': {
            '$addToSet': '$assignment_name'
          }
        }
      },
      {
        '$addFields': {
          "assignmentCount": {
            '$size': '$assignments'
          }
        }
      },
      {
        '$unset': 'assignments'
      }
    ]
  }

  return data;
}

module.exports = assignmentCountQuery
