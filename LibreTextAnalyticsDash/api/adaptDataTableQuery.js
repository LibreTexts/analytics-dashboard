
function adaptDataTableQuery(params, dbInfo) {

  var data = {
    //getting adapt variables
    "collection": dbInfo.adaptColl,
    "database": dbInfo.db,
    "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ["$class", params.courseId]}
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
    return data;
}

module.exports = { adaptDataTableQuery }
