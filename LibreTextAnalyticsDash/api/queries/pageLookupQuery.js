const addFilters =  require("../helper/addFilters.js");

function pageLookupQuery(params, dbInfo) {
    //look in the main libretext collection to get student and page data
    var data = {
      "collection": dbInfo.pageColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$group': {
            '_id': '$id',
            'pageTitle': {
              '$first': '$title'
            },
            'chapter': {
              '$first': '$chapter'
            },
            'pageURL': {
              '$first': '$url'
            }
          }
        }
      ]
    }

    return data;
}

module.exports = pageLookupQuery;
