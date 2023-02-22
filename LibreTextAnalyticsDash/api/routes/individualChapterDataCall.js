const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const axios = require("axios");

const individualChapterDataCall = async (
  req,
  res
) => {
  let queryString = queries.chapterChartQuery(req.body, dbInfo, helperFunctions.encryptStudent, helperFunctions.decryptStudent);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["individualChapterData"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
};

module.exports = individualChapterDataCall;
