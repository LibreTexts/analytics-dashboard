

function pageCountQuery(dbInfo) {

  var data = {
    "collection": dbInfo.coll,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$match': {
          'verb': "read"
        }
      },
      {
        '$group': {
          '_id': "$actor.courseName",
          "pages": {
            "$addToSet": "$object.id"
          }
        }
      },
      {
        '$addFields': {
          "pageCount": {
            "$size": "$pages"
          }
        }
      },
      {
        '$unset': 'pages'
      }
    ]
  }

  return data;
}

module.exports = pageCountQuery
