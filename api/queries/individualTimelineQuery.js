const addFilters =  require("../helper/addFilters.js");
//query to find date data for each student or page
//originally for use in the student and page timeline components to have page views by date
//now being used to grab page ids with titles and all students

function individualTimelineQuery(params, dbInfo) {
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
        //join lt collection to page collection
        {
          '$lookup': {
            "from": dbInfo.pageColl,
            "localField": "object.id",
            "foreignField": "id",
            "as": "pageInfo"
          }
        },
        {
          '$unwind': {
            'path': '$pageInfo'
          }
        },
        {
          '$addFields': {
            'course': '$pageInfo.courseName'
          }
        },
        //grabbing the dates for each student view
        {
          '$addFields': {
            // 'startDate': {'$dateFromString': {'dateString': '$object.timestamp'}},
            // 'endDate': {'$add': [{'$dateFromString': {'dateString': '$object.timestamp'}}, '$object.timeMe']},
            'pageTitle': '$pageInfo.title',
            //'pageURL': '$pageInfo.url'
          }
        },
        //group by student or page, grabbing the dates and page information
        {
          '$group': {
            '_id': params.groupBy,
            // 'allStartDates': {'$addToSet': '$startDate'},
            // 'allEndDates': {'$addToSet': '$endDate'},
            "pageTitle": {'$first': '$pageTitle'},
            //"pageURL": {'$addToSet': '$pageURL'}
          }
        },
        {
          '$sort': {'_id': 1}
        }
      ]
    }
    var index = 1;
    index = addFilters.spliceDateFilter(index, params, data);
    index = addFilters.splicePathFilter(index+2, params, data);
    addFilters.spliceTagFilter(index, params, data);

    return data;
}

module.exports = individualTimelineQuery
