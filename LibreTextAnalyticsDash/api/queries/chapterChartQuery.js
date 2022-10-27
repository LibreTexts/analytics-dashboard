const addFilters =  require("../helper/addFilters.js");


function chapterChartQuery(params, dbInfo, encryptStudent, decryptStudent) {

  //student on the front end is unencrypted, is encrypted in the database
  //need to encrypt to be able to match
  if (params.individual && params.individual.includes("@")) {
    var student = encryptStudent(params.individual)
  } else {
    var student = params.individual
  }
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
          "$group": {
            '_id': '$object.id',
            'views': {
              '$push': '$actor.id'
            },
            'uniqueViews': {
              '$addToSet': '$actor.id'
            }
          }
        },
        // {
        //   "$lookup": {
        //     "from": dbInfo.pageColl,
        //     "localField": "object.id",
        //     "foreignField": "id",
        //     "as": "pageInfo"
        //   }
        // },
        // {
        //   "$unwind": {
        //     'path': "$pageInfo"
        //   }
        // },
        // {
        //   '$match': {
        //     '$expr': {
        //       '$and': [
        //         {'$ne': ['$pageInfo.chapter', null]}
        //       ]
        //     }
        //   }
        // },
        // {
        //   '$group': {
        //     '_id': '$pageInfo.chapter',
        //     'views': {
        //       '$push': '$actor.id'
        //     },
        //     'uniqueViews': {'$addToSet': '$object.id'}
        //   }
        // },
        {
          '$addFields': {
            'viewCount': {'$size': '$views'},
            'uniqueViewCount': {'$size': '$uniqueViews'}
          }
        },
        {
          '$unset': ['views', 'uniqueViews']
        }
      ]
    }

    var index = 1;
    index = addFilters.spliceDateFilter(index, params, data);

    if (params.individual) {
      data['pipeline'].splice(1, 0, {
        '$match': {
          'actor.id': student
        }
      })
      index = index + 1;
      // var length = data['pipeline'].length;
      // if (params.individual.includes("@")) {
      //   data['pipeline'][length-2]['$addFields']['student'] = params.individual
      //   data['pipeline'][length-2]['$addFields']['displayModeStudent'] = encryptStudent(params.individual)
      // } else {
      //   data['pipeline'][length-2]['$addFields']['student'] = decryptStudent(params.individual)
      //   data['pipeline'][length-2]['$addFields']['displayModeStudent'] = params.individual
      // }
    }
    index = addFilters.splicePathFilter(index, params, data, true)
    addFilters.spliceTagFilter(index, params, data, index <= 4)
  return data;
}

module.exports = chapterChartQuery
