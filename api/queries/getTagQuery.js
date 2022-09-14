function getTagQuery(params, dbInfo) {
  // console.log("getTagQuery", params.pageIds);

  var data = {
    "collection": dbInfo.metaColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$in': [ "$pageId", params.pageIds]
          }
        }
      },
      {
        "$group": {
          '_id': '$value'
        }
      }
    ]
  }
  return data
}

module.exports = getTagQuery
