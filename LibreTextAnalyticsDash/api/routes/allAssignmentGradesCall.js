const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const allAssignmentGradesCall = async (
  req,
  res,
  environment
) => {
  let queryString = queries.allAssignmentGradesQuery(req.body, dbInfo, environment);
  let secondQuery = queries.gradesFromAdaptQuery(req.body, dbInfo, environment);
  let config = helperFunctions.getRequest(queryString);
  let secondConfig = helperFunctions.getRequest(secondQuery);
  var configs = [axios(config), axios(secondConfig)];
  axios
      .all(configs)
      .then(
        axios.spread((...responses) => {
          var data = {};
          var value = responses[0].data["documents"];
          var count = value.length;
          var zeroCount = value.filter(v => v.score === 0 || v.letterGrade === "F").length; //switch to checking how many Fs there are

          if (count !== zeroCount) { //&& zeroCount < 10) {
            data["allAssignmentGrades"] = value;
          } else {
            data["allAssignmentGrades"] = responses[1].data["documents"];
          }
          res.json(JSON.stringify(data));
    }))
    .catch(function (error) {
      console.log(error);
    });
};

module.exports = allAssignmentGradesCall;
