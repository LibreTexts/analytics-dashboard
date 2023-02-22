function splicePathFilter(index, params, data, addPageLookup=false) {
  var pathMatch = {
    "$match": {
      '$expr': {
        '$or': []
      }
    }
  }
  if (params.path && params.path.length > 0) {
    params.path.forEach(e => {
      pathMatch["$match"]['$expr']['$or'].push({'$gt': [{ '$indexOfCP': [ "$pageInfo.text", e ] }, -1]})
    });
  }

  if (params.path && params.path.length > 0 && !addPageLookup) {
    data['pipeline'].splice(index, 0, pathMatch)
    index = index + 1;
  } else if (params.path && params.path.length > 0 && addPageLookup) {
    var lookup = {
      '$lookup': {
        "from": "pageinfo",
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
    data['pipeline'].splice(index, 0, lookup)
    data['pipeline'].splice(index+1, 0, unwind)
    data['pipeline'].splice(index+2, 0, pathMatch)
    index = index + 3
  }
  return index;
}

function spliceDateFilter(index, params, data, isAdapt=false, isGradebook=false) {
  var timestamp = '$object.timestamp';
  if (isAdapt) {
    timestamp = '$submission_time'
  }
  if (isGradebook) {
    timestamp = '$assignment_due'
  }
  if (params.startDate || params.endDate) {
    var addFields = {
    "$addFields": {
        "newDate": {'$dateFromString': {'dateString': timestamp}}
      }
    }
    if (isAdapt) {
      addFields = {
        '$addFields': {
            'newDate': {
              $cond: {
                if: {"$ne": [timestamp, isAdapt ? "" : isGradebook ? "Not Found" : null]},
                then: {
                  '$dateFromString': {'dateString': timestamp}
                },
                else: isAdapt ? {'$dateFromString': {'dateString': "$review_time_end"}} : null
            }
          }
        }
      }
    }
    var match = {
      '$match': {
        '$expr': {
          '$and': []
        }
      }
    }
    if (params.startDate) {
      match['$match']['$expr']['$and'].push({'$gte': ['$newDate', {'$dateFromString': {'dateString': params.startDate}}]})
    }
    if (params.endDate) {
      match['$match']['$expr']['$and'].push({'$lte': ['$newDate', {'$dateFromString': {'dateString': params.endDate}}]})
    }
    data['pipeline'].splice(index, 0, addFields)
    data['pipeline'].splice(index + 1, 0, match);
    index = index + 2;
  }
  return index;
}

function spliceTagFilter(index, params, data, addPageLookup=false) {
  var lookup = {
    '$lookup': {
      "from": "metatags",
      "localField": "pageInfo.id",
      "foreignField": "pageId",
      "as": "tags"
    }
  }
  var unwind = {
    '$unwind': {
      'path': '$tags'
    }
  }
  var match = {
    '$match': {
      'tags.value': params.tagFilter
    }
  }
  if (params.tagFilter && !addPageLookup) {
    data['pipeline'].splice(index, 0, lookup)
    data['pipeline'].splice(index+1, 0, unwind)
    data['pipeline'].splice(index+2, 0, match)
    //index = index + 3
    return index+3
  } else if (params.tagFilter && addPageLookup) {
    var pageLookup = {
      '$lookup': {
        "from": "pageinfo",
        "localField": "object.id",
        "foreignField": "id",
        "as": "pageInfo"
      }
    }
    var pageUnwind = {
      '$unwind': {
        'path': '$pageInfo'
      }
    }
    data['pipeline'].splice(index, 0, pageLookup)
    data['pipeline'].splice(index+1, 0, pageUnwind)
    data['pipeline'].splice(index+2, 0, lookup)
    data['pipeline'].splice(index+3, 0, unwind)
    data['pipeline'].splice(index+4, 0, match)
    return index+5
  }
  return index;
}

module.exports = { spliceTagFilter, spliceDateFilter, splicePathFilter }
