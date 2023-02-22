const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const studentChartCall = async (
  req,
  res,
  environment
) => {
  var promises = [];
  var isAdaptXAxis = req.body.adaptAxisValue;
  if (!isAdaptXAxis) {
    promises.push(
      await axios(
        helperFunctions.getRequest(
          queries.pageCountQuery(dbInfo, true, req.body.courseId, null, req.body)
        )
      )
    );
  } else {
    promises.push(
      await axios(
        helperFunctions.getRequest(
          queries.assignmentCountQuerySpecificCourse(
            req.body,
            dbInfo,
            req.body.adaptCourseID ? req.body.adaptCourseID : req.body.courseId
          )
        )
      )
    );
  }
  var enrollmentConfig = helperFunctions.getRequest(lookupQueries.enrollmentQuery);
  promises.push(await axios(enrollmentConfig));
  Promise.all(promises).then(async function (responses) {
    let queryString = queries.studentChartQuery(
      validateInput.validateInput("studentchart", req.body),
      dbInfo
    );
    var enrollmentData = responses[1].data && Object.keys(responses[1].data).includes('documents') ? responses[1].data['documents'] : null;
    // var isAdaptXAxis = req.body.adaptAxisValue;
    if (!isAdaptXAxis) {
      // var pages = pageCountData.find((o) => o._id === req.body.courseId);
      // var maxPageCount = pages.pageCount;
      var maxPageCount = responses[0].data["documents"][0].pageCount;
    }
    if (isAdaptXAxis) {
      var course = params.adaptCourseID ? params.adaptCourseID : params.courseId;
      queryString = queries.adaptStudentChartQuery(
        req.body,
        dbInfo,
        environment
      );
      // var assignments = assignmentCountData.find((o) => o._id === course);
      // maxPageCount = assignments.assignmentCount;
      maxPageCount = responses[0].data["documents"][0].assignmentCount;
    }
    var groupBy = req.body.groupBy;
    let config = helperFunctions.getRequest(queryString);
    var studentEnrollment = JSON.parse(
      JSON.stringify(
        helperFunctions.findEnrollmentData(
          enrollmentData,
          req.body.courseId,
          req.body.adaptCourseID,
          environment
        )
      )
    );
    var rosterEnrollment = null;
    if (req.body.roster) {
      rosterEnrollment = req.body.roster.map((s) =>
        helperFunctions.encryptStudent(s)
      );
    }
    axios(config)
      .then(function (response) {
        let newData = response.data;
        //newData["documents"].map(o => console.log(o.students))
        //console.log(newData)
        var hasMaxPage = false;
        newData["documents"].forEach((entry, index) => {
          if (groupBy === "objectCount" && entry._id === maxPageCount) {
            hasMaxPage = true;
          }
          var allStudents = JSON.parse(JSON.stringify(entry.students));
          if (rosterEnrollment && rosterEnrollment.length > 0) {
            entry.students.forEach((s, i) => {
              if (!rosterEnrollment.includes(s)) {
                allStudents.find((st, n) => {
                  if (st === s) {
                    allStudents.splice(n, 1);
                  }
                });
                newData["documents"][index].count =
                  newData["documents"][index].count - 1;
              }
            });
          } else if (studentEnrollment && studentEnrollment.length > 0) {
            entry.students.forEach((s, i) => {
              if (!studentEnrollment.includes(s)) {
                allStudents.find((st, n) => {
                  if (st === s) {
                    allStudents.splice(n, 1);
                  }
                });
                newData["documents"][index].count =
                  newData["documents"][index].count - 1;
              }
            });
          }
          //});
          var encryptedStudents = JSON.parse(JSON.stringify(allStudents));
          if (
            (studentEnrollment && studentEnrollment.length > 0) ||
            rosterEnrollment
          ) {
            allStudents.forEach((s, i) => {
              allStudents[i] = helperFunctions.decryptStudent(s);
            });
          }
          newData["documents"][index].students = allStudents;
          newData["documents"][index]["displayModeStudents"] =
            encryptedStudents;
        });
        if (!hasMaxPage && groupBy === "objectCount") {
          newData["documents"].push({ _id: maxPageCount, count: 0 });
        }
        newData["studentChart"] = newData["documents"];
        delete newData["documents"];
        //console.log(newData)
        newData = JSON.stringify(newData);
        res.json(newData);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
};

module.exports = studentChartCall;
