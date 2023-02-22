const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const individualPageViewsCall = async (
  req,
  res,
  dbInfo,
  environment
) => {
  let queryString = req.body.type === "pages" ? queries.individualPageViewsQuery(
    validateInput.validateInput("individualpageviews", req.body),
    dbInfo
  ) : queries.individualAssignmentSubmissionsQuery(
    validateInput.validateInput("individualassignmentsubmissions", req.body),
    dbInfo,
    environment
  )
  // console.log("QUERY STRING")
  // console.log(queryString)
  let config = helperFunctions.getRequest(queryString);
  //console.log(config)
  axios(config)
    .then(function (response) {
      let newData = response.data;
      if (req.body.individual && req.body.type === "pages") {
        newData["individualPageViews"] = newData["documents"];
      } else if (req.body.individual && req.body.type === "assignments") {
        newData["individualAssignmentSubmissions"] = newData["documents"];
      } else {
        newData["individualAssignmentViews"] = newData["documents"];
      }
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = individualPageViewsCall;
