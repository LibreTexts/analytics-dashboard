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
      if (newData['documents'].filter(obj => obj._id === null).length > 0) {
        newData['documents'].forEach((doc, index) => {
          if (doc._id === null) {
            if (doc.level_name && doc.level_name.length > 0) {
              doc.level_name.forEach((level) => {
                var entry = {
                  _id: level,
                  level_name: [level]
                }
                newData['documents'].push(entry)
              })
              newData['documents'].splice(index, 1)
            }
          }
        })
      }
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
