const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const allStudentsCall = async (
  req,
  res,
  environment
) => {
  var promises = []
  var enrollmentConfig = helperFunctions.getRequest(lookupQueries.enrollmentQuery);
  promises.push(axios(enrollmentConfig))
  Promise.all(promises).then(async function (responses) {
    var enrollmentData = responses[0].data && Object.keys(responses[0].data).includes('documents') ? responses[0].data['documents'] : null;
    let queryString = queries.allStudentsQuery(
      validateInput.validateInput("allstudents", req.body),
      dbInfo
    );
    let config = helperFunctions.getRequest(queryString);
    var studentEnrollment = JSON.parse(
      JSON.stringify(
        helperFunctions.findEnrollmentData(enrollmentData, req.body.courseId, req.body.adaptCourseID, environment)
      )
    );
    axios(config)
      .then(function (response) {
        let newData = response.data;
        newData["documents"].forEach((d, index) => {
          var id = d._id;
          newData["documents"][index]["displayModeStudent"] = d._id;
          if (studentEnrollment.length < 1) {
            newData["documents"][index]["isEnrolled"] = true;
          } else if (studentEnrollment.includes(id)) {
            newData["documents"][index]["isEnrolled"] = true;
            newData["documents"][index]._id = helperFunctions.decryptStudent(d._id);
          } else {
            newData["documents"][index]["isEnrolled"] = false;
          }
        });
        newData["allStudents"] = newData["documents"];
        delete newData["documents"];
        newData = JSON.stringify(newData);
        res.json(newData);
      })
      .catch(function (error) {
        console.log(error);
      });
    })
};

module.exports = allStudentsCall;
