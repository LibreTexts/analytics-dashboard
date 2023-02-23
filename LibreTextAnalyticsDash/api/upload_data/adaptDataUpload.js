const helper = require("../helper/helperFunctions.js");
var axios = require("axios");
const fs = require("fs");
const { parse } = require("fast-csv");

const coll = process.env.ACOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;

// grab all of the ids in the adapt collection in MongoDB to check against the csv file so rows aren't re-added
async function getAdaptIds(currentId = null) {
  var queryString = {
    collection: coll,
    database: db,
    dataSource: dataSource,
    pipeline: [
      {
        $group: {
          _id: "",
          allIds: { $addToSet: "$id" },
        },
      },
    ],
  };
  var config = {
    method: "post",
    url: process.env.URL,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key": process.env.API_KEY,
    },
    data: JSON.stringify(queryString),
  };
  axios(config).then(function (response) {
    if (JSON.parse(JSON.stringify(response.data))["documents"].length > 0) {
      let ids = JSON.parse(JSON.stringify(response.data))["documents"][0][
        "allIds"
      ].sort(function (a, b) {
        return a - b;
      });
      getAdaptData(ids, currentId);
    } else {
      getAdaptData(null, currentId);
    }
  });
}

// read the analytics csv (either from the beginning or from a specified id), encrypt the student, and
//  upload each row to the database as an object
function getAdaptData(allIds, currentId = null) {
  let rows = [];
  var count = 0;
  var allConfigs = [];
  fs.createReadStream(path.resolve(__dirname, "analytics.csv"))
    .pipe(parse({ headers: true, skipRows: currentId ? currentId : 0 }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      if (allIds.length === 0 || allIds === null || !allIds.includes(row.id)) {
        console.log(row.id);
        row.anon_student_id = helper.encryptStudent(row.anon_student_id);
        if (count < 9000) {
          rows.push(row);
          count = count + 1;
        } else {
          allConfigs.push(helper.getAxiosCall(coll, rows));
          rows = [];
          count = 0;
        }
      }
    })
    .on("end", function (rowCount) {
      if (rows.length > 0) {
        allConfigs.push(helper.getAxiosCall(coll, rows));
      }
      helper.writeToMongoDB(allConfigs);
      console.log(`Parsed ${rowCount} rows`);
      helper.moveFiles();
    });
}

module.exports = { getAdaptIds, getAdaptData }
