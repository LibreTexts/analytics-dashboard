//query to grab all courses from the lt data to make the initial course dropdown
//todo: grab all courses from adapt to add to the dropdown

function allCoursesQuery(dbInfo) {
  var data = {
    "collection": dbInfo.coll,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
    "pipeline": [
      //in the lt data concatenate the subdomain with page id
      {
        '$addFields': {
          'pageObject': {'$concat': ['$object.subdomain', '-', '$object.id']}
        }
      },
      //match to coursename, the matches will be the landing pages for the courses
      {
        '$match': {
          '$expr': {
            '$eq':["$actor.courseName", "$pageObject"]
          }
        }
      },
      //checking for the case that a course has a longer path that includes "Text"
      //need to do this so that the course doesn't come back as "Text"
      //Chem 110A currently has an alternate Chem 110A/Text
      //todo: find out why this case can have a separate landing page
      {
        '$project': {
          'actor': '$actor',
          'course':
            {'$cond': {
              'if': {
                '$eq': [{'$arrayElemAt': [{'$split': ['$object.url', '/']}, -1]}, "Text"]
              },
              'then': {
                '$concat': [
                  {'$replaceAll': {'input': {'$arrayElemAt': [{'$split': ['$object.url', '/']}, -2]}, 'find': '%3A', 'replacement': ":"}}, '/',
                  {'$arrayElemAt': [{'$split': ['$object.url', '/']}, -1]}
                ]
              },
              'else': {
                '$arrayElemAt': [{'$split': ['$object.url', '/']}, -1]
              }
            }
          }
        }
      },
      //group by course
      {
        '$group': {
          '_id': '$actor.courseName',
          'courseId': {'$addToSet': '$course'}
        }
      },
      //replace the courses that have hashes or have changed a colon to 3A
      {
        '$project': {
          'courses': {
              '$filter': {
                  'input': '$courseId',
                  'cond': {
                    '$not': {
                      '$or': [
                        {'$regexFind': {'input': '$$this', 'regex': "#"}},
                        {'$regexFind': {'input': '$$this', 'regex': "3A"}},
                        {'$regexFind': {'input': '$$this', 'regex': "\\?"}}
                      ]
                    }
                  }
              }
          }
      }
    },
    //replace all underscores with spaces to get readable course names
    {
      '$addFields': {
        'course': {'$replaceAll': {'input': {'$first': '$courses'}, 'find': '_', 'replacement': " "}},
        'ltCourse': true
      }
    }
    ]
  }
  return data;
}

module.exports = { allCoursesQuery }
