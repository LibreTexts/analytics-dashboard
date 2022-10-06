const addFilters =  require("../helper/addFilters.js");

function aggregateAssignmentViewsQuery(params, dbInfo, adaptCodes) {
    //find the adapt code for the lt course id
    var codeFound = adaptCodes.find(o => o.course === params.courseId)
    var course = codeFound;
    if (!codeFound) {
      course = params.courseId
    } else {
      course = codeFound.code
    }

    var data = {
      "collection": dbInfo.adaptColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            'course_id': course
          }
        },
        {
          '$addFields': {
              'date': {'$dateTrunc': {
                  'date': { '$toDate': '$submission_time'},
                  'unit': params.unit,
                  'binSize': params.bin
              }
            }
          }
        },
        {
          '$group': {
            '_id': '$date',
            'students': {'$push': '$anon_student_id'}
          }
        },
        {
          '$addFields': {
            'count': {'$size': '$students'},
            'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
          }
        },
        {
          '$unset': 'students'
        },
        {
          "$sort": {"_id": 1}
        }
      ]
    }
    var index = 2;
    addFilters.spliceDateFilter(index, params, data, true);

  return data;
}

module.exports = aggregateAssignmentViewsQuery
