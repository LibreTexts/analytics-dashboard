const ewsModelAdaptQuery = require("./ewsModelAdaptQuery.js");
const ewsDataStandardizedSubQuery = require("./ewsDataStandardizedSubQuery.js");
const addFilters = require("../helper/addFilters.js");
const moment = require("moment");

function ewsModelDataQuery(params, dbInfo, environment, prop_avail_assns, pageCount, courseStartDate, bucket) {
  //gets the adapt course code based on the libretext course id
  //todo: make a dropdown on the frontend to choose specific level groups and names to look at
  var cutoff_date = params.cutoffDate;
  var default_cutoff_date = "2023-01-31";
  var manual_start_date = params.startDate;
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
            "newDate": {'$dateFromString': {'dateString': '$object.timestamp'}},
            'pageTitle': '$pageInfo.title',
            'pageURL': '$pageInfo.url',
            'date': {'$dateTrunc': {
                'date': { '$toDate': '$object.timestamp'},
                'unit': 'day'
              }
            }
          }
        },
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$gte': ["$newDate", {'$dateFromString': {'dateString': manual_start_date ? manual_start_date : courseStartDate}}]},
                {'$lte': ["$newDate", {'$dateFromString': {'dateString': cutoff_date ? cutoff_date : default_cutoff_date}}]}
              ]
            }
          }
        },
        //group by student or page, get attributes for the data table
        {
          "$group": {
            "_id": '$actor.id',
            "courseName": {'$addToSet': '$actor.courseName'},
            // "pageTitle": {'$first': '$pageTitle'},
            // "pageURL": {'$first': '$pageURL'},
            "timestamp": {'$addToSet':'$object.timestamp'},
            "lt_most_recent": { '$max': "$newDate" },
            "uniqueDates": {'$addToSet': '$date'},
            "objects": {"$addToSet": null},
            "durationInSeconds": {"$avg": '$object.timeMe'},
            "timeStudied": {'$sum': "$object.timeMe"},
            "views": {'$push': "$object.id"},
            "uniquePages": {'$addToSet': "$object.id"},
            "percent": {"$push": {'$toDouble': {'$replaceAll': {'input': '$result.percent', 'find': '%', 'replacement': ''}}}}
          }
        },
        //formatting the final attributes, using $size to count the number of elements
        {
          "$addFields": {
            "lt_unique_days": {'$size': '$uniqueDates'},
            "lt_total_pgs": {'$size': '$views'},
            "lt_unique_pgs": {'$size': '$uniquePages'},
            "lt_hours": {'$divide': ['$timeStudied', 3600]},
            "lt_unique_pgs_prop": {'$divide': [{'$size': '$uniquePages'}, pageCount]},
            "lt_hours_since_recent": {'$divide': [{'$subtract': [{'$dateFromString': {'dateString': cutoff_date ? cutoff_date : default_cutoff_date}}, '$lt_most_recent']}, 3600000]},
            "adapt_unique_days": '$adapt.adaptUniqueInteractionDays',
            "adapt_unique_assns": '$adapt.adaptUniqueAssignments',
            "adapt_most_recent": '$adapt.mostRecentAdaptLoad',
            "adapt_attempts_assn": '$adapt.adaptAvgAttempts',
            "adapt_avg_score": '$adapt.adaptAvgPercentScore',
            "adapt_hours_before_due": '$adapt.adaptHoursBeforeDue',
            "adapt_prop_avail_assn": '$adapt.adapt_prop_avail_assn',
            "adapt_hours_since_recent": '$adapt.adapt_hours_since_recent',
            "adaptCourseGrade": '$adapt.courseGrade' //need this for percentile, unlink on frontend
          }
        },
        {
          "$unset": [
            'objects',
            'uniqueDates',
            'timestamp',
            'percent',
            'adaptPercent',
            'adaptAttempts',
            'courseName',
            'durationInSeconds',
            'timeStudied',
            'views',
            'uniquePages',
            'adapt',
            // 'lt_most_recent'
          ]
        }
    ]}

    //getting variables based on whether it's the student or page tab
    //grabs the variable to aggregate by
    //data["pipeline"][2]['$group']['objects']['$addToSet'] = "$object.id"
    var isPage = false

    var index = 1;

    setDataPipeline(index+3, params, data, dbInfo, environment, prop_avail_assns, cutoff_date, default_cutoff_date, courseStartDate, bucket)

    //console.log(data['pipeline'][0]['$match']['$expr']['$and'][2]['$gte'][1])
    return data;
}

function setDataPipeline(index, params, data, dbInfo, environment, prop_avail_assns, cutoff_date, default_cutoff_date, courseStartDate, bucket) {
  if ((environment === "production" && params.adaptCourseID)) {
    var adaptLookup = ewsModelAdaptQuery(params, dbInfo, environment, prop_avail_assns, true, cutoff_date, default_cutoff_date, courseStartDate, bucket)
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
  if ((environment === "production" && params.adaptCourseID)) {
    data['pipeline'].splice(index, 0, adaptLookup)
    data['pipeline'].splice(index+1, 0, adaptUnwind)
    index = index + 2
    var standardizedVariablesPipeline = ewsDataStandardizedSubQuery();
    standardizedVariablesPipeline.forEach((stage) => {
      data['pipeline'].splice(data['pipeline'].length-1, 0, stage);
    })
  }
  data['pipeline'].splice(index+3, 0, unset)
}

module.exports = ewsModelDataQuery
