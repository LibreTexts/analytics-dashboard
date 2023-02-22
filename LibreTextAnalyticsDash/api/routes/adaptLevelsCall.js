const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const adaptLevelsCall = async (
  req,
  res,
  environment
) => {
  let queryString = queries.adaptLevelQuery(
    validateInput.validateInput("adaptlevels", req.body),
    dbInfo,
    environment
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["adaptLevels"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
};

module.exports = adaptLevelsCall;
