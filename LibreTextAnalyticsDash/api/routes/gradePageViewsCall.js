const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const gradePageViewsCall = async (
  req,
  res,
  dbInfo,
  environment
) => {
  let queryString = queries.individualGradePageViewsQuery(
      validateInput.validateInput("gradepageviews", req.body),
      dbInfo,
      environment
    );
    // console.log("QUERY STRING")
    // console.log(queryString)
    let config = helperFunctions.getRequest(queryString);
    //console.log(config)
    axios(config)
      .then(function (response) {
        let newData = response.data;
        newData["gradesPageView"] = newData["documents"];
        delete newData["documents"];
        newData = JSON.stringify(newData);
        res.json(newData);
      })
      .catch(function (error) {
        // console.log(error);
      });
}

module.exports = gradePageViewsCall;
