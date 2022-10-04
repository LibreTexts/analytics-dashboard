const addFilters =  require("../helper/addFilters.js");
//query to find views per date for an individual page

function individualPageViewsQuery(params, adaptCodes, dbInfo) {
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }
  //params.individual is for the individual page views chart
  if (params.individual) {
    var data = {
      "collection": dbInfo.coll,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        //match by course
        {
          "$match": {
            '$expr': {
              '$and': [
                {'$eq': ["$verb", "read"]},
                {'$eq': ["$actor.courseName", params.courseId]}
              ]
            }
          }
        },
        //join to page collection to be able to match by page
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
        //     'path': '$pageInfo'
        //   }
        // },
        // //filter down to an individual page
        // {
        //   '$match': {
        //     'pageInfo.title': params.individual
        //   }
        // },
        {
          "$match": {
            'object.id': params.individual
          }
        },
        //format date
        {
          "$addFields": {
            'date': {'$dateTrunc': {
                'date': { '$toDate': '$object.timestamp'},
                'unit': params.unit,
                'binSize': params.bin
              }
            }
          }
        },
        //group by date to create the chart
        {
          "$group": {
            '_id': '$date',
            'students': {'$push': '$actor.id' },
            'uniqueStudents': {'$addToSet': '$actor.id'}
          }
        },
        {
          "$addFields": {
            'count': {'$size': '$students'},
            'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
            'uniqueStudentCount' : {'$size': '$uniqueStudents'}
          }
        },
        {
          '$unset': ['students', 'uniqueStudents']
        },
        {
          "$sort": {"_id": 1}
        }
      ]
    }
    //params.levelName is for individual adapt assignments chart
  } else if (params.levelName) {
    //look in the adapt collection
      var data = {
        "collection": dbInfo.adaptColl,
        "database": dbInfo.db,
        "dataSource": dbInfo.dataSource,
        "pipeline": [
          //filter down to the assignment
          {
            '$match': {
              '$expr': {
                '$and': [
                  {'$eq': ['$course_id', course]},
                  {'$eq': ['$assignment_group', params.levelGroup]},
                  {'$eq': ['$assignment_name', params.levelName]}
                ]
              }
            }
          },
          //format date and bin by day, week, or month as shown in frontend filter
          {
            "$addFields": {
              'date': {'$dateTrunc': {
                  'date': { '$toDate': '$submission_time'},
                  'unit': params.unit,
                  'binSize': params.bin
                }
              }
            }
          },
          //group by date, binning it automatically
          {
            "$group": {
              '_id': '$date',
              'students': {'$push': '$anon_student_id' },
              'due': {'$first': '$due'}
            }
          },
          //count the number of students who submitted the assignment by the date
          {
            "$addFields": {
              'count': {'$size': '$students'},
              'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
              'uniqueStudents' : {'$setUnion' : ['$students', []]}
            }
          },
          {
            '$unset': "students"
          },
          {
            "$sort": {"_id": 1}
          }
        ]
      }
  }

  var index = 1;
  index = addFilters.spliceDateFilter(index, params, data);
  if (params.individual) {
    index = addFilters.splicePathFilter(index+1, params, data, true);
    addFilters.spliceTagFilter(index, params, data, index <= 4);
  }

  return data;
}

module.exports = individualPageViewsQuery
