const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

const ewsModelDataCall = async (
  req,
  res,
  environment
) => {
  var promises = [];
  var assn_bucket1 = req.body.assn_bucket1;
  var assn_bucket2 = req.body.assn_bucket2;
  var buckets = [null];
  if (assn_bucket1 || assn_bucket2) {
    buckets = assn_bucket1 && assn_bucket2 ? [assn_bucket1, assn_bucket2] : assn_bucket1 ? [assn_bucket1] : assn_bucket2 ? [assn_bucket2] : [];
  }
  if (req.body.ltCourse) {
    var pagesAvailableConfig = helperFunctions.getRequest(queries.pageCountQuery(dbInfo, true, req.body.courseId, req.body.cutoffDate, req.body));
    promises.push(await axios(pagesAvailableConfig));
  }
  if (req.body.adaptCourse) {
    var assignmentsAvailableConfig = null;
    var gradesConfig = null;
    buckets.forEach((bucket) => {
      // console.log(bucket)
      assignmentsAvailableConfig = helperFunctions.getRequest(
        queries.assignmentCountFromGradebookQuery(
          dbInfo,
          req.body.ltCourse ? req.body.adaptCourseID : req.body.courseId,
          req.body.cutoffDate,
          bucket,
          req.body
        )
      );
      // console.log(assignmentsAvailableConfig)
      promises.push(axios(assignmentsAvailableConfig));
      // gradesConfig = helperFunctions.getRequest(queries.averageGradesFromGradebookQuery(req.body.ltCourse ? req.body.adaptCourseID : req.body.courseId, dbInfo, bucket));
      // promises.push(axios(gradesConfig));
    })
  }
  var path = req.body.path;
  Promise.all(promises).then(async function (responses) {
    // console.log(responses)
    var pageCount = req.body.ltCourse ? responses[0].data['documents'][0].pageCount : null;
    var assignmentCount = req.body.ltCourse && req.body.adaptCourse ? responses[1].data : req.body.adaptCourse ? responses[0].data : null;
    var assnCountBucket2 = req.body.ltCourse && req.body.adaptCourse && buckets.length > 1 ? responses[3].data : req.body.adaptCourse ? responses[1].data : null;
    // console.log(assignmentCount['documents'][0])
    var courseStartDate = req.body.ltCourse && req.body.adaptCourse ? responses[1].data['documents'][0].startDate : req.body.adaptCourse ? responses[0].data['documents'][0].startDate : null;
    // var avgScoresBucket1 = req.body.adaptCourse && buckets.length > 1 ? responses[responses.length-3].data['documents'] : req.body.adaptCourse ? responses[responses.length-1].data['documents'] : null;
    // var avgScoresBucket2 = req.body.adaptCourse && buckets.length > 1 ? responses[responses.length-1].data['documents'] : null;
    // console.log(responses[responses.length-1].config.data)
    var requests = [];
    var prop_avail_assns = null;
    buckets.forEach((bucket, n) => {
      prop_avail_assns = n === 0 ? assignmentCount['documents'][0].assignmentCount : n === 1 ? assnCountBucket2['documents'][0].assignmentCount : null;
      let queryString = queries.ewsModelDataQuery(
        req.body,
        dbInfo,
        environment,
        prop_avail_assns,
        pageCount,
        courseStartDate,
        bucket
      );
      if (req.body.adaptCourse && !req.body.ltCourse) {
        queryString = queries.ewsModelAdaptQuery(
          req.body,
          dbInfo,
          environment,
          prop_avail_assns,
          false,
          courseStartDate,
          bucket
        );
      }
      let config = helperFunctions.getRequest(queryString);
      requests.push(axios(config));
      gradesConfig = helperFunctions.getRequest(queries.averageGradesFromGradebookQuery(req.body.ltCourse ? req.body.adaptCourseID : req.body.courseId, dbInfo, bucket, prop_avail_assns, req.body.cutoffDate));
      requests.push(axios(gradesConfig));
    })
    var gradebook_attributes = [
      "adapt_avg_score",
      "adapt_avg_score_z",
      "adapt_unique_assns",
      "adapt_unique_assns_z",
      "adapt_prop_avail_assn",
      "adapt_prop_avail_assn_z"
    ]
    axios.all(requests)
      .then(function async(responses) {
        var allData = []
        if (buckets.length > 1) {
          var data1 = responses[0].data['documents']
          var data2 = responses[2].data['documents']
          var avgScoresBucket1 = responses[1].data['documents']
          var avgScoresBucket2 = responses[3].data['documents']
          // console.log(avgScoresBucket1)
          data1.forEach((doc) => {
            var studentInfo = data2.find(obj => obj._id === doc._id)
            // work here to connect scores data to other data
            // calculate standardized variable here
            var obj = {}
            var studentId = doc['_id'];
            for (const attr in doc) {
              if (gradebook_attributes.includes(attr)) {
                obj[attr+1] = avgScoresBucket1.find(s => s._id === studentId) ? avgScoresBucket1.find(s => s._id === studentId)[attr] : null;
              } else if (attr !== "_id") {
                obj[attr+1] = doc[attr]
              } else {
                obj[attr] = doc[attr]
              }
            }
            for (const attr in studentInfo) {
              if (gradebook_attributes.includes(attr)) {
                obj[attr+2] = avgScoresBucket2.find(s => s._id === studentId) ? avgScoresBucket2.find(s => s._id === studentId)[attr] : null;
              } else if (attr !== "_id") {
                obj[attr+2] = studentInfo[attr]
              }
            }
            allData.push(obj);
          })
        } else {
          var avgScoresBucket1 = responses[1].data['documents']
          responses[0].data['documents'].forEach((data, index) => {
            gradebook_attributes.forEach((attr) => {
              responses[0].data['documents'][index][attr] = avgScoresBucket1.find(s => s._id === data._id) ? avgScoresBucket1.find(s => s._id === data._id)[attr] : null;
            })
          })
          allData = responses[0].data['documents']
        }
        // responses.forEach((response, n) => {
          // var num = n+1
          var file = path ? path : "./ews_data_" + moment().format("MM-DD-YY") + ".csv";
          fs.writeFileSync(file, 'id');
          var headers = Object.keys(allData[0]);
          headers.forEach((d, index) => {
            if (index !== 0) {
              fs.appendFileSync(file, ',')
              fs.appendFileSync(file, d)
            }
          })
          // fs.appendFileSync(file, '\n')
          allData.forEach((data) => {
            fs.appendFileSync(file, '\n')
            fs.appendFileSync(file, helperFunctions.decryptStudent(Object.values(data)[0]))
            Object.values(data).forEach((v, i) => {
              if (i !== 0) {
                fs.appendFileSync(file, ',')
                fs.appendFileSync(file, String(v))
              }
            })
          })
        // })
        res.json({});
      })
      .catch(function (error) {
        console.log(error);
      });
  });
};

module.exports = ewsModelDataCall;
