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
        {
          '$group': {
            '_id': '$object.id'
          }
        },
        //join lt collection to page collection
        {
          '$lookup': {
            "from": dbInfo.pageColl,
            "localField": "_id",
            "foreignField": "id",
            "as": "pageInfo"
          }
        },
        {
          '$unwind': {
            'path': '$pageInfo'
          }
        },
        //grabbing the dates for each student view
        {
          '$addFields': {
            'pageTitle': '$pageInfo.title'
          }
        },
        //group by student or page, grabbing the dates and page information
        {
          '$group': {
            '_id': '$_id',
            "pageTitle": {'$first': '$pageTitle'}
          }
        },
        {
          '$sort': {'_id': 1}
        }
      ]
    }
    var index = 1;
    index = addFilters.spliceDateFilter(index, params, data);
    index = addFilters.splicePathFilter(index+3, params, data);
    addFilters.spliceTagFilter(index, params, data);

    return data;
}

module.exports = individualTimelineQuery
