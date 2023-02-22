const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const realCoursesCall = async (
  req,
  res,
  adaptCodes,
  courseDates
) => {
  var realCourseNames = [];
    let config = helperFunctions.getRequest(queries.allCoursesQuery(dbInfo));
    axios(config)
      .then(function (response) {
        realCourseNames = response.data["documents"];
        realCourseNames.forEach((c, index) => {
          //console.log(c)
          var codeFound = adaptCodes.find((o) => o.course === c._id);

          if (codeFound && codeFound.isInAdapt) {
            c["adaptCourse"] = true;
            var dates = courseDates.find((o) => o._id === codeFound.code);
            //check to see if the adapt dates are the correct term for the lt data
            if (new Date(dates.startDate) < new Date(c.date) && new Date(c.date) < new Date(dates.endDate)) {
              c["startDate"] = dates.startDate;
              c["endDate"] = dates.endDate;
            }
          } else {
            c["adaptCourse"] = false;
          }
        })
        res.json(realCourseNames);
      })
      .catch(function (error) {
        console.log(error);
      });
}

module.exports = realCoursesCall;
