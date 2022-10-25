//query to get all of the units in the course; ie the course structure
//to use in the course structure dropdown

function courseUnitsQuery(params, dbInfo) {
  //looks in the main libretext data collection
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
          '_id': "$object.id"
        }
      },
      //page lookup to connect to find all page paths
      {
        "$lookup": {
          "from": dbInfo.pageColl,
          "localField": "_id",
          "foreignField": "id",
          "as": "pageInfo"
        }
      },
      {
        "$unwind": {
          'path': "$pageInfo"
        }
      },
      {
        '$addFields': {
          'course': '$pageInfo.courseName'
        }
      },
      // group by full path of pages, add the full path split by slashes
      {
        '$group': {
          '_id': '$pageInfo.text',
          'chapter': {'$addToSet': '$pageInfo.path'}
        }
      },
      {
        '$unwind': {
          'path': "$chapter"
        }
      },
      {
        '$addFields': {
          'count': {'$size': '$chapter'}
        }
      },
      {
        '$sort': {
          'count': -1
        }
      }
    ]
  }
  //console.log(data)

  return data
}

module.exports = courseUnitsQuery
