const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const axios = require("axios");

const studentAssignmentsCall = async (
  req,
  res,
  environment
) => {
  let queryString = queries.studentAdaptAssignmentQuery(
      validateInput.validateInput("studentassignments", req.body),
      dbInfo,
      helperFunctions.encryptStudent,
      environment
    );
    let config = helperFunctions.getRequest(queryString);
    axios(config)
      .then(function (response) {
        let newData = response.data;
        // newData["documents"].forEach((d, index) => {
        //   newData["documents"][index]["displayModeStudent"] = d["_id"]["student"];
        //   newData["documents"][index]["_id"]["student"] = helperFunctions.decryptStudent(
        //     d["_id"]["student"]
        //   );
        // });
        newData["studentAssignments"] = newData["documents"];
        delete newData["documents"];
        newData = JSON.stringify(newData);
        res.json(newData);
      })
      .catch(function (error) {
        console.log(error);
      });
}

module.exports = studentAssignmentsCall;
