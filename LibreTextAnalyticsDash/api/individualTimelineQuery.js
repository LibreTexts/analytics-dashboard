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
            'startDate': {'$dateFromString': {'dateString': '$object.timestamp'}},
            'endDate': {'$add': [{'$dateFromString': {'dateString': '$object.timestamp'}}, '$object.timeMe']},
            'pageTitle': '$pageInfo.title',
            'pageURL': '$pageInfo.url'
          }
        },
        //group by student or page, grabbing the dates and page information
        {
          '$group': {
            '_id': params.groupBy,
            'allStartDates': {'$addToSet': '$startDate'},
            'allEndDates': {'$addToSet': '$endDate'},
            "pageTitle": {'$addToSet': '$pageTitle'},
            "pageURL": {'$addToSet': '$pageURL'}
          }
        },
        {
          '$sort': {'_id': 1}
        }
      ]
    }
    var match = {
      '$match': {
        '$expr': {
          '$and': []
        }
      }
    }

    //filters down to a specific page path that the user chooses
    var unitLookup = {
      '$match': {
        '$expr': {
          '$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]
        }
      }
    }

    var unwind = {
      '$unwind': {
        'path': '$pageInfo'
      }
    }

    var pageTitle = {
      "$addFields": {
        "pageTitle": {'$first': '$pageTitle'},
        "pageURL": {'$first': '$pageURL'}
      }
    }

    if (params.groupBy === "$object.id") {
      data['pipeline'].splice(8, 0, pageTitle)
      var lookup =
      {
        "$lookup": {
          "from": dbInfo.pageColl,
          "localField": "_id",
          "foreignField": "id",
          "as": "pageInfo"
        }
      }
      var addField = {
        "$addFields": {
          'pageTitle': {"$first": "$pageInfo.title"},
          'pageList': ["$_id", {"$first": "$pageInfo.title"}]
        }
      }
    }
    var unset = {
      '$unset': ["pageTitle", "pageURL"]
    }
    if (params.groupBy === "$actor.id") {
      data['pipeline'].splice(8, 0, unset)
      var lookup = {
        '$lookup': {
          "from": dbInfo.pageColl,
          "localField": "object.id",
          "foreignField": "id",
          "as": "pageInfo"
        }
      }
    }
    if (params.path) {
      data['pipeline'].splice(6, 0, unitLookup)
    }
    return data;
}

module.exports = { individualTimelineQuery }
