const addFilters =  require("../helper/addFilters.js");

function individualGradePageViewsQuery(params, adaptCodes, dbInfo) {
  //find the adapt code for the lt course id
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  var course = codeFound;
  if (!codeFound) {
    course = params.courseId
  } else {
    course = codeFound.code
  }

  var data = {
    "collection": dbInfo.gradesColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$and': [
              {'$eq': ["$class", course]},
              {'$eq': ["$level_name", params.levelName]}
            ]
          }
        }
      },
      {
        "$group": {
          '_id': '$email',
          'score': {'$first': '$assignment_percent'},
          'turned_in': {'$first': '$turned_in_assignment'}
        }
      }
    ]
  }
  // var index = 1;
  // addFilters.spliceDateFilter(index, params, data, true);

  return data;
}

module.exports = individualGradePageViewsQuery
