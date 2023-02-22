const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const pageViewsCall = async (
  req,
  res
) => {
  let queryString = queries.aggregatePageViewsQuery(
    validateInput.validateInput("pageviews", req.body),
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["pageViews"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
};

module.exports = pageViewsCall;
