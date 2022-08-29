

function assignmentCountQuery(dbInfo) {

  var data = {
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$group': {
          '_id': "$class",
          'assignments': {
            '$addToSet': '$level_name'
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
