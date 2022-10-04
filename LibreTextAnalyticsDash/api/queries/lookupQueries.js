const dbInfo = require("../config/db.config.js");
//get the list of all students enrolled in a given course (found in adapt enrollment data)
var enrollmentQuery = {
  collection: dbInfo.enrollColl,
  database: dbInfo.db,
  dataSource: dbInfo.dataSource,
  pipeline: [
    {
      $group: {
        _id: "$class",
        students: { $addToSet: "$email" },
        dates: { $addToSet: "$created_at" },
      },
    },
  ],
};

var startEndDateQuery = {
  collection: dbInfo.adaptColl,
  database: dbInfo.db,
  dataSource: dbInfo.dataSource,
  pipeline: [
    {
      $group: {
        _id: "$course_id",
        startDate: {
          $first: "$class_start_date",
        },
        endDate: {
          $max: "$due",
        },
      },
    },
  ],
};

module.exports = { enrollmentQuery, startEndDateQuery }
