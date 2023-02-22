const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const adaptCoursesCall = async (
  req,
  res,
  adaptCodes
) => {
    var promises = []
    let dateConfig = helperFunctions.getRequest(lookupQueries.startEndDateQuery);
    promises.push(axios(dateConfig));
    let config = helperFunctions.getRequest(queries.allAdaptCoursesQuery(dbInfo));
    Promise.all(promises).then(async function (responses) {
      var courseDates = responses[0] && ('data' in responses[0]) && ('documents' in responses[0].data) ? responses[0].data['documents'] : [];
      axios(config)
        .then(function (response) {
          let courses = {};
          var adaptCourses = response.data['documents'];
          //console.log(adaptCourses)
          adaptCourses.forEach((course) => {
            var name = course._id.toLowerCase();
            var demoCourse = false;
            if (
              name.includes("test") ||
              name.includes("demo") ||
              name.includes("sandbox") ||
              course.students.length < 5
            ) {
              demoCourse = true;
            }
            if (course._id !== "" && !demoCourse) {
              courses[course._id] = course.course;
            }
          });
          var allCourses = [];
          Object.keys(courses).forEach((course) => {
            var codeFound = adaptCodes.find((o) => o.code === courses[course]);
            if (codeFound) {
              delete courses[course];
            } else {
              //courses[course]["ltCourse"] = false
              var c = {};
              if (courseDates.length > 0) {
                var dates = courseDates.find((o) => o._id === courses[course]);
              }
              c["_id"] = courses[course];
              c["startDate"] = dates ? dates.startDate : null;
              c["endDate"] = dates ? dates.endDate : null;
              c["course"] = course;
              c["adaptCourse"] = true;
              c["ltCourse"] = false;
              allCourses.push(c);
            }
          });
          adaptCourses = allCourses;
          res.json(adaptCourses);
        })
        .catch(function (error) {
          console.log(error);
        });
      })
    }

module.exports = adaptCoursesCall;
