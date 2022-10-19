const addFilters =  require("../helper/addFilters.js");
const helperFunctions = require("../helper/helperFunctions.js");
//query to find views per date for an individual page

function individualAssignmentSubmissionsQuery(params, adaptCodes, dbInfo) {
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }
  var student = params.individual;
  if (student.includes("@")) {
    student = helperFunctions.encryptStudent(params.individual);
  }
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
              {'$eq': ['$anon_student_id', student]}
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
          'submissions': {'$push': '$question_id' },
          'uniqueAssignments': {'$addToSet': '$assignment_name'},
          'uniqueQuestions': {'$addToSet': '$question_id'},
          'due': {'$first': '$due'}
        }
      },
      //count the number of students who submitted the assignment by the date
      {
        "$addFields": {
          'count': {'$size': '$submissions'},
          'assignmentCount': {'$size': '$uniqueAssignments'},
          'dateString': {'$substrBytes': [{'$dateToString': {'date': '$_id'}}, 0, 10]},
          'uniqueSubmissions' : {'$setUnion' : ['$submissions', []]}
        }
      },
      {
        '$unset': "submissions"
      },
      {
        "$sort": {"_id": 1}
      }
    ]
  }

  var index = 1;
  index = addFilters.spliceDateFilter(index, params, data, true);
  if (params.individual) {
    index = addFilters.splicePathFilter(index+1, params, data, true);
    addFilters.spliceTagFilter(index, params, data, index <= 4);
  }
  console.log(data['pipeline'])
  return data;
}

module.exports = individualAssignmentSubmissionsQuery
