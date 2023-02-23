const enrollment = require("./enrollmentDataUpload.js");
const gradebook = require("./gradebookDataUpload.js");
const adapt = require("./adaptDataUpload.js");
const pageInfo = require("./pageInfoUpload.js");
const metatags = require("./metatagDataUpload.js");
const helper = require("../helper/helperFunctions.js");
require("dotenv").config();

const acoll = process.env.ACOLL;
const gcoll = process.env.GCOLL;
const ecoll = process.env.ECOLL;
const pcoll = process.env.PCOLL;
const tcoll = process.env.TCOLL;

function uploadAdaptData(id = null, csvFilePath = "./analytics.csv", zipFilePath = "./analytics.zip") {
  helper.getAllData(adapt.getAdaptIds, id, csvFilePath, zipFilePath);
}

function deleteAllAdaptData() {
  helper.deleteAll(acoll);
}

function uploadGradebookData(courses = null) {
  gradebook.getAdaptCourses(courses);
}

function deleteAllGradebookData() {
  helper.deleteAll(gcoll);
}

function deleteOneCourseFromGradebookData(course) {
  helper.deleteOneCourse(gcoll, course);
}

function uploadEnrollmentData() {
  enrollment.getLastDate();
}

function deleteAllEnrollmentData() {
  helper.deleteAll(ecoll);
}

function deleteOneCourseFromEnrollmentData(course) {
  helper.deleteOneCourse(ecoll, course);
}

function uploadPageInfo() {
  pageInfo.getAllPageIDs();
}

function deleteAllPageInfo() {
  helper.deleteAll(pcoll);
}

function uploadMetatagData() {
  metatags.getAllPageIDs();
}

function deleteAllMetatagData() {
  helper.deleteAll(tcoll);
}

module.exports = {
  uploadAdaptData,
  deleteAllAdaptData,
  uploadGradebookData,
  deleteAllGradebookData,
  deleteOneCourseFromGradebookData,
  uploadEnrollmentData,
  deleteAllEnrollmentData,
  deleteOneCourseFromEnrollmentData,
  uploadPageInfo,
  deleteAllPageInfo,
  uploadMetatagData,
  deleteAllMetatagData
}
