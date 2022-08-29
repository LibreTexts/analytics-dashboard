//temporarily out of use

function individualDataQuery(params, dbInfo) {
    var data = {
        "collection": dbInfo.coll,
        "database": dbInfo.db,
        "dataSource": dbInfo.dataSource,
        "pipeline": [
          {
            "$match": {
              '$expr': {
                '$and': [
                  {'$eq': ['$verb', 'read']},
                  {'$eq': ['$actor.courseName', params.courseId]}
                ]
              }
            }
          },
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
          //
          {
            '$lookup': {
              "from": dbInfo.metaColl,
              "localField": "pageInfo.id",
              "foreignField": "pageId",
              "as": "metaTags"
            }
          },
          {
            '$unwind': {
              'path': '$metaTags'
            }
          },
          {
            "$match": {
              '$expr': {
                '$eq': ['$metaTags.value', params.tagFilter]
              }
            }
          },
          //
          {
            '$addFields': {
              'course': '$pageInfo.courseName'
            }
          },
          {
            '$addFields': {
              "newDate": {'$dateFromString': {'dateString': '$object.timestamp'}},
              'pageTitle': '$pageInfo.title',
              'pageURL': '$pageInfo.url'
            }
          },
          {
            '$addFields': {
              'startDate': {'$dateFromString': {'dateString': '$object.timestamp'}},
              'endDate': {'$add': [{'$dateFromString': {'dateString': '$object.timestamp'}}, '$object.timeMe']},
              'page': '$object.id'
            }
          },
          {
            '$addFields': {
              'dateRange': ['$startDate', '$endDate']
            }
          },
          {
            '$group': {
              '_id': params.groupBy,
              'dateRange': {'$push': '$dateRange'},
              'start': {'$push': '$startDate'},
              "pageTitle": {'$addToSet': '$pageTitle'},
              "pageURL": {'$addToSet': '$pageURL'}
            }
          },
          {
            '$addFields': {
              'firstDate': {'$min': '$start'}
            }
          },
          {
            '$sort': {
              'firstDate': 1
            }
          }
        ]
    }

    var match = {
      "$match": {
        '$expr': {
          '$and': [
          ]
        }
      }
    }

    var pathMatch = {
      "$match": {
        '$expr': {
          '$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]
        }
      }
    }

    var unwind = {
      "$unwind": {
        "path": "$pageInfo"
      }
    }

    var pageTitle =
    {
      "$addFields": {
        "pageTitle": {"$first": "$pageInfo.title"},
        "pageURL": {"$first": "$pageInfo.url"}
      }
    }

    var unset = {
      '$unset': ["pageTitle", "pageURL"]
    }

    if (params.path) {
      data['pipeline'].splice(4, 0, pathMatch)
    }
    if (params.type === "page") {
      data['pipeline'].splice(10, 0, unset)
    }

    if (params.type === "student") {
      match['$match']['$expr']['$and'].push({'$eq': ['$actor.id', params.individual]})
    }
    if (params.type === "page") {
      match['$match']['$expr']['$and'].push({'$eq': ['$object.id', params.individual]})
    }
    if (params.startDate) {
      match['$match']['$expr']['$and'].push({'$gte': ['$newDate', {'$dateFromString': {'dateString': params.startDate}}]})
    }
    if (params.endDate) {
      match['$match']['$expr']['$and'].push({'$lte': ['$newDate', {'$dateFromString': {'dateString': params.endDate}}]})
    }
    data['pipeline'].splice(1, 0, match)
    return data;
}

module.exports = individualDataQuery
