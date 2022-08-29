const adaptLookupSubQuery = require("./adaptLookupSubQuery.js");

//query to get the data for the main tables, connects the lt data to adapt

function dataTableQuery(params, adaptCodes, dbInfo) {
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
        //group by student or page, get attributes for the data table
        {
          "$group": {
            "_id": params.groupBy,
            "courseName": {'$addToSet': '$actor.courseName'},
            "pageTitle": {'$addToSet': '$pageTitle'},
            "pageURL": {'$addToSet': '$pageURL'},
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
            "mostRecentAdaptLoad": '$adapt.mostRecentAdaptLoad',
            "adaptPercent": '$adapt.adaptPercent',
            "adaptAttempts": '$adapt.adaptAttempts',
            "adaptAvgAttempts": {'$round': ['$adapt.adaptAvgAttempts', 1]},
            "adaptAvgPercentScore": {'$round': [{'$multiply': ['$adapt.adaptAvgPercentScore', 100]}, 1]},
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

    // console.log(data["pipeline"][2]['$group']['objects']['$addToSet'])

    // configures adapt/not adapt, lookup, unwind
    data = setDataPipeline(params, isPage, data, codeFound, dbInfo)

    // Add date filtering into pipeline if needed
    data = setDateFilterAggregation(params, isPage, data, dbInfo)

    // Adds tag aggregations if needed
    data = setTagMatchAggregation(params, data)

    // console.log(data['pipeline'])
    return data;
}

function setDataPipeline(params, isPage, data, codeFound, dbInfo) {
  console.log(params.tagFilter)
  if (codeFound) {
    var adaptLookup = adaptLookupSubQuery.adaptLookupSubQuery(codeFound, params)
    //preserves students who have libretext data but no adapt data
    var adaptUnwind = {
      "$unwind": {
        'path': '$adapt',
        'preserveNullAndEmptyArrays': true
      }
    }
  }
  //page info lookup for the page data table
  var lookup = {
    "$lookup": {
      "from": dbInfo.pageColl,
      "localField": "object.id",
      "foreignField": "id",
      "as": "pageInfo"
    }
  }
  //filter by course unit
  var unitLookup = {
    "$match": {
      '$expr': {
        '$gt': [{ '$indexOfCP': [ "$pageInfo.text", params.path ] }, -1]
      }
    }
  }

  var pageTitle =
  {
    "$addFields": {
      "pageTitle": {'$first': '$pageTitle'},
      "pageURL": {'$first': '$pageURL'}
    }
  }

  var unset = {
    "$unset": ["pageTitle", "pageURL"]
  }

  var pageUnwind = {
    '$unwind': {
      'path': '$pageInfo'
    }
  }

  var tagLookup = {
    '$lookup': {
      "from": dbInfo.metaColl,
      "localField": "pageInfo.id",
      "foreignField": "pageId",
      "as": "metaTags"
    }
  }
  var tagUnwind = {
    '$unwind': {
      'path': '$metaTags'
    }
  }
  var tagMatch = {
    "$match": {
      'metaTags.value': params.tagFilter
    }
  }

  // check the params to set up pipeline

  //insert the adapt aggregation if the course has adapt data
  //need to check .isInAdapt because some courses have an adapt code but no data
  if (codeFound && codeFound.isInAdapt && !isPage) {
    data['pipeline'].splice(3, 0, adaptLookup)
    data['pipeline'].splice(4, 0, adaptUnwind)
  }

  if (isPage) {
    data['pipeline'].splice(1, 0, lookup)
    data['pipeline'].splice(2, 0, pageUnwind)
    if (params.tagFilter) {
      data['pipeline'].splice(3, 0, tagLookup)
      data['pipeline'].splice(4, 0, tagUnwind)
      data['pipeline'].splice(5, 0, tagMatch)
    }
    data['pipeline'].push(pageTitle)
  }

  if (params.path && !isPage) {
    data['pipeline'].splice(2, 0, lookup)
    data['pipeline'].splice(3, 0, pageUnwind)
    data['pipeline'].splice(4, 0, unitLookup)
    data['pipeline'].splice(6, 0, unset)
  } else if (params.path) {
    if (isPage && params.tagFilter) {
      data['pipeline'].splice(6, 0, unitLookup)
    } else {
      data['pipeline'].splice(3, 0, unitLookup)
    }
  }

  return data
}

// Makes boilerplates for date filtering, and checks params to decide whether to add
function setDateFilterAggregation(params, isPage, data, dbInfo) {
  var matchesUsed = false
  var filterMatch = {
    "$match": {
      '$expr': {
        '$and': []
      }
    }
  }
  //page info lookup for the page data table
  var lookup = {
    "$lookup": {
      "from": dbInfo.pageColl,
      "localField": "object.id",
      "foreignField": "id",
      "as": "pageInfo"
    }
  }
  //filter by course unit
  var unitLookup = {
    "$match": {
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

    var unset = {
      "$unset": ["pageTitle", "pageURL"]
    }


  if (params.startDate) {
    filterMatch['$match']['$expr']['$and'].push({'$gte': ['$newDate', {'$dateFromString': {'dateString': params.startDate}}]})
    matchesUsed = true
  }
  if (params.endDate) {
    filterMatch['$match']['$expr']['$and'].push({'$lte': ['$newDate', {'$dateFromString': {'dateString': params.endDate}}]})
    matchesUsed = true
  }

  // check the params to set up pipeline

  if (matchesUsed && !isPage) {
    data['pipeline'].splice(2, 0, filterMatch)
  } else if (matchesUsed && isPage) {
    if (params.tagFilter) {
      data['pipeline'].splice(7, 0, filterMatch)
    } else {
      data['pipeline'].splice(4, 0, filterMatch)
    }
    // console.log(data['pipeline'])
  }

  if (params.path && !isPage) {
    data['pipeline'].splice(2, 0, lookup)
    data['pipeline'].splice(3, 0, unwind)
    data['pipeline'].splice(4, 0, unitLookup)
    data['pipeline'].splice(6, 0, unset)
  } else if (params.path) {
    data['pipeline'].splice(3, 0, unitLookup)
  }
  return data
}

// Makes boilerplates for tag aggregations, and checks params to decide whether to add
function setTagMatchAggregation(params, data) {
    var hasTags = false
    var tagLookup = {
      '$lookup': {
        "from": "metatags",
        "localField": "id",
        "foreignField": "pageInfo.id",
        "as": "tags"
      }
    }
    var tagMatch = {
    '$project': {
        'tags': {
           '$filter': {
            'input': "$tags",
            'as': "item",
            'cond': {
                '$and': []
            }
           }
        },
        'actor': '$actor',
        'object': '$object',
        'verb': '$verb',
        'course': '$course',
        'result': '$result',
        'pageInfo': '$pageInfo'
    }
  }

  // check the params to set up pipeline

  if (params.tagType) {
    if (isPage && params.tagFilter) {
      data['pipeline'].splice(9, 0, tagLookup)
    } else {
      data['pipeline'].splice(6, 0, tagLookup)
    }
    tagMatch['$project']['tags']['$filter']['cond']['$and'].push({'$eq': ['$tags.type', params.tagType]})
    hasTags = true
  }
  if (params.tagTitle) {
    tagMatch['$project']['tags']['$filter']['cond']['$and'].push({'$eq': ['$tags.title', params.tagTitle]})
    hasTags = true
  }
  //console.log(tagMatch['$project']['tags']['$filter'])
  if (hasTags) {
    if (isPage && params.tagFilter) {
      data['pipeline'].splice(10, 0, tagMatch)
    } else {
      data['pipeline'].splice(7, 0, tagMatch)
    }
  }

  return data
}

module.exports = dataTableQuery
