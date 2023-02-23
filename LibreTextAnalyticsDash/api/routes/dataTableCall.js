const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const validateInput = require("../validateInput.js");
const gradesQuery = require("../queries/averageGradesFromGradebookQuery.js");
const express = require("express");
const axios = require("axios");
const moment = require("moment");

const dataTableCall = async (
  req,
  res,
  environment
) => {
  var promises = [];
  if (req.body.adaptCourse) {
    var assignmentsAvailableConfig = helperFunctions.getRequest(
      queries.assignmentCountQuerySpecificCourse(
        req.body,
        dbInfo,
        req.body.ltCourse ? req.body.adaptCourseID : req.body.courseId,
        req.body.endDate
      )
    );
    promises.push(await axios(assignmentsAvailableConfig));
    var enrollmentConfig = helperFunctions.getRequest(lookupQueries.enrollmentQuery);
    promises.push(await axios(enrollmentConfig));
    var gradesConfig = helperFunctions.getRequest(gradesQuery(req.body.ltCourse ? req.body.adaptCourseID : req.body.courseId, dbInfo));
    promises.push(await axios(gradesConfig));
  }
  Promise.all(promises).then(async function (responses) {
    var assignmentCount = responses.length > 0 ? responses[0].data : null;
    var enrollmentData = responses.length > 1 ? responses[1].data['documents'] : null;
    var averageScores = Object.keys(responses[2]).includes('data') ? responses[2].data['documents'] : [];
    let queryString = queries.dataTableQuery(
      validateInput.validateInput("data", req.body),
      dbInfo,
      environment,
      assignmentCount
    );
    if (req.body.adaptCourse && !req.body.ltCourse) {
      queryString = queries.adaptDataTableQuery(
        validateInput.validateInput("data", req.body),
        dbInfo,
        environment,
        assignmentCount
      );
    }
    let config = helperFunctions.getRequest(queryString);
    var tab = "";
    if (req.body.groupBy === "$actor.id") {
      tab = "student";
    } else {
      tab = "page";
    }
    var start = req.body.startDate;
    var end = req.body.endDate;
    var adaptCourse = req.body.adaptCourse;
    //get all students enrolled in the course
    var enrollment = await helperFunctions.findEnrollmentData(
      enrollmentData,
      req.body.courseId,
      req.body.adaptCourseID,
      environment
    );
    var studentEnrollment = JSON.parse(JSON.stringify(enrollment));
    var rosterData = req.body.roster;
    var rosterDataCopy = JSON.parse(JSON.stringify(rosterData));
    var requests = [config];
    // axios
    //   .all(requests)
    //   .then(
    //     axios.spread((...responses) => {
    axios(config)
      .then(function async(response) {
        let newData = response.data;
        if (tab === "student") {
          var hasAdapt = false;
          newData["documents"].forEach((student, index) => {
            if (Object.keys(student).includes("adapt") || adaptCourse) {
              hasAdapt = true;
            }
            if (adaptCourse) {
              newData["documents"][index]["adapt"] = true;
            }
            if (averageScores.length > 0) {
              var studentScore = averageScores.find(s => s._id === student._id);
              if (studentScore) {
                newData["documents"][index]["adaptAvgPercentScore"] = studentScore.avgPercent;
              }
            }
            var date = new Date(student["max"]);
            if (start) {
              var diff = moment(new Date(end)).diff(moment(date), "days");
            } else {
              var diff = moment().diff(moment(date), "days");
            }
            newData["documents"][index]["diff"] = diff;
            //check if there is enrollment data for the course
            //console.log(studentEnrollment)
            var encryptedStudent = student._id;
            var decryptedStudent = helperFunctions.decryptStudent(student._id);
            //decrypting students from the roster and leaving the rest
            if (rosterData) {
              if (rosterData.includes(decryptedStudent)) {
                newData["documents"][index]["isEnrolled"] = true;
                newData["documents"][index]._id = decryptedStudent;
                rosterDataCopy.find((s, index) => {
                  if (s === decryptedStudent) {
                    rosterDataCopy.splice(index, 1);
                  }
                });
              } else {
                newData["documents"][index]["isEnrolled"] = false;
                newData["documents"][index]._id = encryptedStudent;
              }
            } else if (enrollment.length > 0) {
              //check to see if the student is enrolled
              if (studentEnrollment.includes(encryptedStudent)) {
                //mark the student as enrolled
                newData["documents"][index]["isEnrolled"] = true;
                //if the student is in the course, remove that student from the enrollment list
                studentEnrollment.find((s, index) => {
                  if (s === encryptedStudent) {
                    studentEnrollment.splice(index, 1);
                  }
                });
                newData["documents"][index]._id = decryptedStudent;
              } else {
                //mark the student as not enrolled
                newData["documents"][index]["isEnrolled"] = false;
                newData["documents"][index]._id = encryptedStudent;
              }
              //add true to all students if there is no enrollment data so the entire table isn't grayed out
            } else if (enrollment.length === 0) {
              newData["documents"][index]["isEnrolled"] = "N/A";
            }
            newData["documents"][index]["hasData"] = true;
            newData["documents"][index]["displayModeStudent"] =
              encryptedStudent;
          });
        }
        //if there is an enrolled student that has no data, add them to the table
        if (
          (enrollment.length > 0 ||
            (rosterDataCopy && rosterDataCopy.length > 0)) &&
          tab === "student"
        ) {
          if (rosterData) {
            rosterDataCopy.forEach((s) => {
              newData["documents"].splice(0, 0, {
                _id: s,
                isEnrolled: true,
                hasData: false,
                adapt: hasAdapt,
                displayModeStudent: helperFunctions.encryptStudent(s),
              });
            });
          } else {
            studentEnrollment.forEach((s) => {
              newData["documents"].splice(0, 0, {
                _id: helperFunctions.decryptStudent(s),
                isEnrolled: true,
                hasData: false,
                adapt: hasAdapt,
                displayModeStudent: s,
              });
            });
          }
        }
        if (tab === "student") {
          helperFunctions.calculatePercentile(
            newData["documents"].filter(
              (student) =>
                student.isEnrolled === true || student.isEnrolled === "N/A"
            )
          );
          newData["studentData"] = newData["documents"];
        } else {
          newData["pageData"] = newData["documents"];
        }
        delete newData["documents"];
        newData = JSON.stringify(newData);
        res.json(newData);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
};

module.exports = dataTableCall;
