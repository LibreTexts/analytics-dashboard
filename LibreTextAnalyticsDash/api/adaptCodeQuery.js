//query to link libretext course ids to adapt course codes, and to see if there is actually any data in adapt

function adaptCodeQuery(dbInfo) {
  var data = {
    "collection": "adaptCodes",
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        '$group': {
          '_id': '$url',
          'code': {'$first': '$adaptCode'},
          'course': {'$first': '$courseId'},
          'isInAdapt': {'$first': '$isInAdapt'}
        }
      }
    ]
  }
  return data;
}

module.exports = { adaptCodeQuery }
