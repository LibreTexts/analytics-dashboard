const axios = require("axios");
const express = require("express");
const helperFunctions = require("../helperFunctions.js");
const allCourses = require("../allCoursesQuery.js");
const dbInfo = require("../config/db.config.js");

let realCourseConfig = helperFunctions.getRequest(allCourses.allCoursesQuery(dbInfo));
let realCourseNames = {};
let getRealCourseNames = async () => {
  await axios(realCourseConfig)
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
    });
    console.log(realCourseNames)
    return realCourseNames;
  })
  .catch(function (error) {
    console.log(error);
  });
}

let sendToFrontend = async (req, res) => {
  let courses = await getRealCourseNames();
  console.log(courses)
  res.json(courses);
};
const router = express.Router();

router.get("/realcourses", sendToFrontend);

module.exports = router
