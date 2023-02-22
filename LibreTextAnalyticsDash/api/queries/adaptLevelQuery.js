//query to find the level groups and assignments of an adapt course

function adaptLevelQuery(params, dbInfo, environment) {
    var course = params.adaptCourseID ? params.adaptCourseID : params.courseId ? params.courseId : null;
    //look in the adapt data
    // var data = {
    //   "collection": dbInfo.adaptColl,
    //   "database": dbInfo.db,
    //   "dataSource": dbInfo.dataSource,
    //   "pipeline": [
    //     {
    //       '$match': {
    //         '$expr': {
    //           '$and': [
    //             {'$eq': ["$course_id", course]}
    //           ]
    //         }
    //       }
    //     },
    //     {
    //       '$match': {
    //         '$expr': {
    //           '$and': [
    //             {'$ne': ['$assignment_group', null]},
    //             {'$ne': ['$assignment_group', ""]}
    //           ]
    //         }
    //       }
    //     },
    //     //group by level group and name in case there are assignments in different groups with the same name
    //     {
    //       '$group': {
    //         '_id': {
    //           'level_group': '$assignment_group',
    //           'level_name': '$assignment_name'
    //         }
    //       }
    //     },
    //     //group by level group again to link the groups with all assignments in the level
    //     {
    //       '$group': {
    //         '_id': '$_id.level_group',
    //         'level_name': {'$addToSet': '$_id.level_name'}
    //       }
    //     }
    //   ]
    // }
    var data = {
      "collection": dbInfo.gradesColl,
      "database": dbInfo.db,
      "dataSource": dbInfo.dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ["$class", course]},
                {'$ne': ['$turned_in_assignment', false]}
              ]
            }
          }
        },
        //group by level group and name in case there are assignments in different groups with the same name
        {
          '$group': {
            _id: '$assignment_group',
            level_name: {
              '$addToSet': '$level_name'
            }
          }
        },
        // //group by level group again to link the groups with all assignments in the level
        // {
        //   '$lookup': {
        //     from: 'adapt',
        //     localField: '_id',
        //     foreignField: 'assignment_name',
        //     as: 'adaptData',
        //     pipeline: [
        //       {
        //         '$match': {
        //           course_id: course
        //         }
        //       },
        //       {
        //         '$group': {
        //           _id: '$assignment_name',
        //           level_group: {'$first': '$assignment_group'}
        //         }
        //       }
        //       ]
        //   }
        // },
        // {
        //   '$unwind': {
        //     path: '$adaptData',
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        // {
        //   '$addFields': {
        //     level_group: {
        //       '$cond': {
        //         if: "$adaptData.level_group",
        //         then: "$adaptData.level_group",
        //         else: "$_id"
        //       }
        //     }
        //   }
        // },
        // {
        //   '$addFields': {
        //     level_name: '$_id'
        //   }
        // },
        // {
        //   '$addFields': {
        //     _id: '$level_group'
        //   }
        // },
        // {
        //   '$unset': ['adaptData', 'level_group']
        // }
      ]
    }
    return data;
}

module.exports = adaptLevelQuery
