
//query to get the data for the main tables, connects the lt data to adapt

function dataTableQuery(params, adaptCodes, dbInfo) {
  //gets the adapt course code based on the libretext course id
  var codeFound = adaptCodes.find(o => o.course === params.courseId)
  if (codeFound) {
    var adaptLookup = {
      //getting adapt variables
      "$lookup": {
        "from": "adapt",
        "localField": "_id",
        "foreignField": "anon_student_id",
        "as": "adapt",
        "pipeline": [
          {
            '$match': {
              '$expr': {
                '$and': [
                  {'$eq': ["$class", codeFound.code]}
                ]
              }
            }
          },
          //reformatting the date to be able to use it in a table
          {
            '$addFields': {
              'day': {'$replaceAll': {
                'input': '$time', 'find': '"', 'replacement': ''
              }}
            }
          },
          {
            '$addFields': {
              'date': {'$dateTrunc': {
                  'date': { '$toDate': '$day'},
                  'unit': 'day'
                }
              }
            }
          },
          //group by student, find the most recent assignment load for adapt, dates, and assignments
          {
            '$group': {
              '_id': '$anon_student_id',
              'mostRecentAdaptLoad': {'$max': '$day'},
              'dates': {'$addToSet': '$date'},
              'assignments': {'$addToSet': '$page_id'}
            }
          },
          {
            '$addFields': {
              'adaptUniqueInteractionDays': {'$size': '$dates'},
              'adaptUniqueAssignments': {'$size': '$assignments'}
            }
          }
        ]
      }
    }
    //preserves students who have libretext data but no adapt data
    var adaptUnwind = {
      "$unwind": {
        'path': '$adapt',
        'preserveNullAndEmptyArrays': true
      }
    }
  }
  //for filtering data by adapt assignment
  //todo: make a dropdown on the frontend to choose specific level groups and names to look at
  if (params.adaptLevelGroup) {
    adaptLookup['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({'$eq': ['$level_group', params.adaptLevelGroup]})
  }
  if (params.adaptLevelName) {
    adaptLookup['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({'$eq': ['$level_name', params.adaptLevelName]})
  }

  //getting variables based on whether it's the student or page tab
  //grabs the variable to aggregate by
  if (params.groupBy === '$actor.id') {
    var aggregationAttr = "$object.id"
    var isPage = false
  } else if (params.groupBy === '$object.id') {
    var aggregationAttr = "$actor.id"
    var isPage = true
  }

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
            "objects": {"$addToSet": aggregationAttr},
            "durationInSeconds": {"$avg": '$object.timeMe'},
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
            "adaptUniqueInteractionDays": '$adapt.adaptUniqueInteractionDays',
            "adaptUniqueAssignments": '$adapt.adaptUniqueAssignments',
            "mostRecentAdaptLoad": '$adapt.mostRecentAdaptLoad',
            "adaptPercent": '$adapt.adaptPercent',
            "adaptAttempts": '$adapt.adaptAttempts'
          }
        }
    ]}
    //insert the adapt aggregation if the course has adapt data
    //need to check .isInAdapt because some courses have an adapt code but no data
    if (codeFound && codeFound.isInAdapt && !isPage) {
      data['pipeline'].splice(3, 0, adaptLookup)
      data['pipeline'].splice(4, 0, adaptUnwind)
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

    var match = {
      "$match": {
        '$expr': {
          '$and': []
        }
      }
    }

    //filter by date, tag, etc
    var filterMatch = {
      "$match": {
        '$expr': {
          '$and': []
        }
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

    var unwind = {
      '$unwind': {
        'path': '$pageInfo'
      }
    }

    var tagLookup = {
      '$lookup': {
        "from": "metatags",
        "localField": "id",
        "foreignField": "pageInfo.id",
        "as": "tags"
      }
    }
    // var adaptLookup = {
    //   "$lookup": {
    //     "from": "adapt",
    //     "localField": "_id",
    //     "foreignField": "anon_student_id",
    //     "as": "adapt"
    //   }
    // }

    if (isPage) {
      data['pipeline'].splice(1, 0, lookup)
      data['pipeline'].splice(2, 0, unwind)
      data['pipeline'].splice(8, 0, pageTitle)
    } else {
      // data['pipeline'].splice(3, 0, adaptLookup)
      // data['pipeline'].splice(8, 0, unset)
    }

    var matchesUsed = false
    if (params.startDate) {
      filterMatch['$match']['$expr']['$and'].push({'$gte': ['$newDate', {'$dateFromString': {'dateString': params.startDate}}]})
      matchesUsed = true
    }
    if (params.endDate) {
      filterMatch['$match']['$expr']['$and'].push({'$lte': ['$newDate', {'$dateFromString': {'dateString': params.endDate}}]})
      matchesUsed = true
    }

    if (params.path && !isPage) {
      data['pipeline'].splice(2, 0, lookup)
      data['pipeline'].splice(3, 0, unwind)
      data['pipeline'].splice(4, 0, unitLookup)
      data['pipeline'].splice(6, 0, unset)
    } else if (params.path) {
      data['pipeline'].splice(3, 0, unitLookup)
    }

    if (matchesUsed && !isPage) {
      data['pipeline'].splice(2, 0, filterMatch)
    } else if (matchesUsed && isPage) {
      data['pipeline'].splice(5, 0, filterMatch)
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
    var hasTags = false
    if (params.tagType) {
      data['pipeline'].splice(6, 0, tagLookup)
      tagMatch['$project']['tags']['$filter']['cond']['$and'].push({'$eq': ['$tags.type', params.tagType]})
      hasTags = true
    }
    if (params.tagTitle) {
      tagMatch['$project']['tags']['$filter']['cond']['$and'].push({'$eq': ['$tags.title', params.tagTitle]})
      hasTags = true
    }
    //console.log(tagMatch['$project']['tags']['$filter'])
    if (hasTags) {
      data['pipeline'].splice(7, 0, tagMatch)
    }
    //console.log(data['pipeline'])
    return data;
}

module.exports = { dataTableQuery }
