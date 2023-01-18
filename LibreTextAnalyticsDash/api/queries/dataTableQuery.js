const adaptLookupSubQuery = require("./adaptLookupSubQuery.js");
const addFilters = require("../helper/addFilters.js");
const moment = require("moment");

//query to get the data for the main tables, connects the lt data to adapt

function dataTableQuery(params, adaptCodes, dbInfo, environment) {
  //gets the adapt course code based on the libretext course id
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  //todo: make a dropdown on the frontend to choose specific level groups and names to look at
  var data = {
      "collection": dbInfo.coll,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
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
      //date formatting, making it easier to access attributes
      //if this is the student tab the page attributes will be null
      {
        "$addFields": {
            "newDate": {'$dateFromString': {'dateString': '$object.timestamp', 'onError': moment()}},
            'pageTitle': '$pageInfo.title',
            'pageURL': '$pageInfo.url',
            'date': {'$dateTrunc': {
                'date': { '$toDate': '$object.timestamp'},
                'unit': 'day'
              }
            }
          }
        },
        //group by student or page, get attributes for the data table
        {
          "$group": {
            "_id": params.groupBy,
            "courseName": {'$addToSet': '$actor.courseName'},
            // "pageTitle": {'$first': '$pageTitle'},
            // "pageURL": {'$first': '$pageURL'},
            "timestamp": {'$addToSet':'$object.timestamp'},
            "max": { '$max': "$newDate" },
            "uniqueDates": {'$addToSet': '$date'},
            "objects": {"$addToSet": null},
            "durationInSeconds": {"$avg": '$object.timeMe'},
            "timeStudied": {'$sum': "$object.timeMe"},
            "percent": {"$push": {'$toDouble': {'$replaceAll': {'input': '$result.percent', 'find': '%', 'replacement': ''}}}}
          }
        },
        //formatting the final attributes, using $size to count the number of elements
        {
          "$addFields": {
            "durationInMinutes": {'$trunc': [{'$divide': ['$durationInSeconds', 60]}, 1]},
            "objectCount": {'$size': "$objects"},
            "viewCount": {'$size': "$timestamp"},
            "percentAvg": {'$trunc': [{'$avg': "$percent"}, 1]},
            "totalViews": {'$size': "$timestamp"},
            "dateCount": {'$size': '$uniqueDates'},
            "timeStudied": {'$trunc': [{'$divide': ['$timeStudied', 3600]}, 1]},
            "adaptUniqueInteractionDays": '$adapt.adaptUniqueInteractionDays',
            "adaptUniqueAssignments": '$adapt.adaptUniqueAssignments',
            "adaptUniqueProblems": '$adapt.adaptUniqueProblems',
            "mostRecentAdaptLoad": '$adapt.mostRecentAdaptLoad',
            "adaptPercent": '$adapt.adaptPercent',
            "adaptAttempts": '$adapt.adaptAttempts',
            "adaptAvgAttempts": {'$round': ['$adapt.adaptAvgAttempts', 1]},
            "adaptAvgPercentScore": {'$round': ['$adapt.adaptAvgPercentScore', 1]},
            "adaptCourseGrade": '$adapt.courseGrade' //need this for percentile, unlink on frontend
          }
        },
        {
          "$unset": ['objects', 'uniqueDates', 'timestamp', 'percent', 'adaptPercent', 'adaptAttempts', 'courseName']
        }
    ]}

    //getting variables based on whether it's the student or page tab
    //grabs the variable to aggregate by
    if (params.groupBy === '$actor.id') {
      data["pipeline"][2]['$group']['objects']['$addToSet'] = "$object.id"
      var isPage = false
    } else if (params.groupBy === '$object.id') {
      data["pipeline"][2]['$group']['objects']['$addToSet'] = "$actor.id"
      var isPage = true
    }

    var index = 1;
    index = addFilters.spliceDateFilter(index, params, data);
    // if (isPage) {
    //   index = addPageLookup(index, data, dbInfo)
    // }
    index = addFilters.splicePathFilter(index, params, data, true);
    index = addFilters.spliceTagFilter(index, params, data, true && index <= 4)

    if (!isPage) {
      setDataPipeline(index+2, params, data, codeFound, dbInfo, environment)
    }
    return data;
}

function addPageLookup(index, data, dbInfo) {
  var lookup = {
    "$lookup": {
      "from": dbInfo.pageColl,
      "localField": "object.id",
      "foreignField": "id",
      "as": "pageInfo"
    }
  }
  var unwind = {
    '$unwind': {
      'path': '$pageInfo'
    }
  }
  data['pipeline'].splice(index, 0, lookup);
  data['pipeline'].splice(index+1, 0, unwind);
  return index+2;
}

function setDataPipeline(index, params, data, codeFound, dbInfo, environment) {
  if ((environment === "development" && codeFound) || (environment === "production" && params.adaptCourseID)) {
    var adaptLookup = adaptLookupSubQuery.adaptLookupSubQuery(codeFound, params, dbInfo, environment)
    //preserves students who have libretext data but no adapt data
    var adaptUnwind = {
      "$unwind": {
        'path': '$adapt',
        'preserveNullAndEmptyArrays': true
      }
    }
  }

  var unset = {
    "$unset": ["pageTitle", "pageURL"]
  }

  //insert the adapt aggregation if the course has adapt data
  //need to check .isInAdapt because some courses have an adapt code but no data
  if ((environment === "development" && codeFound && codeFound.isInAdapt) || (environment === "production" && params.adaptCourseID)) {
    data['pipeline'].splice(index, 0, adaptLookup)
    data['pipeline'].splice(index+1, 0, adaptUnwind)
    index = index + 2
  }
  data['pipeline'].splice(index+3, 0, unset)
}

module.exports = dataTableQuery
