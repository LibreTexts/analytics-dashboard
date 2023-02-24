const enrollment = require("./enrollmentDataUpload.js");
const gradebook = require("./gradebookDataUpload.js");
const adapt = require("./adaptDataUpload.js");
const pageInfo = require("./pageInfoUpload.js");
const metatags = require("./metatagDataUpload.js");
const helper = require("./helperFunctions.js");
require("dotenv").config();

const acoll = process.env.ACOLL;
const gcoll = process.env.GCOLL;
const ecoll = process.env.ECOLL;
const pcoll = process.env.PCOLL;
const tcoll = process.env.TCOLL;

// all of these funtions can be called through a script, or on the command line:
// node -e 'require("./uploadData.js").uploadAdaptData()'

// uploads to the main adapt collection
// downloads the zip file from the analytics endpoint and uploads data where the id of the row is not already in the database
// optionally you can specify an id to start at so that the entire csv file is not parsed
function uploadAdaptData(id = null, csvFilePath = "./analytics.csv", zipFilePath = "./analytics.zip") {
  helper.getAllData(adapt.getAdaptIds, id, csvFilePath, zipFilePath);
}

// deletes all data in the main adapt collection
function deleteAllAdaptData() {
  helper.deleteAll(acoll);
}

// uploads to the gradebook collection
// pulls a list of courses from the adapt collection and calls the scores endpoint
// pulls from the scores endpoint and uses the adapt collection to look up assignment due dates
// optionally you can specify an array of ids to iterate through to get gradebook data for
function uploadGradebookData(courses = null) {
  gradebook.getAdaptCourses(courses);
}

// deletes all data in the gradebook collection
function deleteAllGradebookData() {
  helper.deleteAll(gcoll);
}

// specify a course to delete one course from the gradebook collection
function deleteOneCourseFromGradebookData(course) {
  helper.deleteOneCourse(gcoll, course);
}

// uploads to the enrollment collection
// gets the most recent date from the adapt csv file and goes back week by week to grab the enrollments
function uploadEnrollmentData() {
  enrollment.getLastDate();
}

// deletes all data in the enrollment collection
function deleteAllEnrollmentData() {
  helper.deleteAll(ecoll);
}

// specify a course to delete one course from the enrollment collection
function deleteOneCourseFromEnrollmentData(course) {
  helper.deleteOneCourse(ecoll, course);
}

// uploads to the page info collection
// gets all of the page ids from the libretexts analytics collection and pulls data from the mindtouch api
// uploads the data if the page is not in the collection yet
function uploadPageInfo() {
  pageInfo.getAllPageIDs();
}

// deletes all data in the page info collection
function deleteAllPageInfo() {
  helper.deleteAll(pcoll);
}

// uploads to the metatag collection
// gets all of the page ids from the libretexts analytics collection and pulls data from the mindtouch api
// uploads the data if the page is not in the collection yet
function uploadMetatagData() {
  metatags.getAllPageIDs();
}

// deletes all data in the metatag collection
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
