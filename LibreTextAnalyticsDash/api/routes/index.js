const queries = require("../queries/index.js");
const helperFunctions = require("../helper/helperFunctions.js");
const lookupQueries = require("../queries/lookupQueries.js");
const dbInfo = require("../config/db.config.js");
const axios = require("axios");

module.exports = async function(app, environment, env) {

  const COMMONS = "production"; //testing or production -- staging.commons (test site) or real commons site
  //currently configured for commons to be used with the production server
  const CONDUCTOR_API_URL = COMMONS === "testing" ? 'https://staging.commons.libretexts.org/api/v1' : 'https://commons.libretexts.org/api/v1';
  const OAUTH_ACCESS_TOKEN_URL = COMMONS === "testing" ? 'https://staging.commons.libretexts.org/api/v1/oauth2.0/accessToken' : 'https://commons.libretexts.org/api/v1/oauth2.0/accessToken';
  const HOMEPAGE = environment === "development" ? "https://test.libretexts.org/analytics/api/" : "https://analytics.libretexts.org/api/";
  const REDIRECT_URL = environment === "development" ? "/analytics/api/init" : "/api/init";
  const DASHBOARD_URL = environment === "development" ? "/analytics" : "/";

  let libretextToAdaptConfig = helperFunctions.getRequest(queries.adaptCodeQuery(dbInfo));

  var adaptCodes = axios(libretextToAdaptConfig).then((response) => response.data['documents'])

  app.get("/init", function(req, res) {
    require("./conductorInitCall")(req, res, env, CONDUCTOR_API_URL)
  })
  app.get("/oauth2.0/callback", function(req, res) {
    require("./conductorOauthCall")(req, res, env, HOMEPAGE, DASHBOARD_URL)
  })
  app.get("/userinfo", function(req, res) {
    require("./conductorUserInfoCall")(req, res, REDIRECT_URL, CONDUCTOR_API_URL)
  })
  app.get("/courseinfo", function(req, res) {
    require("./conductorCourseInfoCall")(req, res, REDIRECT_URL, CONDUCTOR_API_URL)
  })
  app.get("/conductorEnrollment", function(req, res) {
    require("./conductorEnrollmentCall")(req, res, REDIRECT_URL, CONDUCTOR_API_URL)
  })
  app.get("/realcourses", async function(req, res) {
    require("./realCoursesCall")(req, res, await adaptCodes)
  });
  app.get("/adaptcourses", async function(req, res) {
    require("./adaptCoursesCall")(req, res, await adaptCodes)
  });
  app.post('/data', async function(request, response){
    require("./dataTableCall")(request, response, environment)
  })
  app.post('/ews_data', async function(request, response){
    require("./ewsModelDataCall")(request, response, environment)
  })
  app.post('/timelineData', async function(request, response){
    require("./timelineDataCall")(request, response)
  })
  app.post('/pageLookup', async function(request, response){
    require("./pageLookupCall")(request, response)
  })
  app.post('/aggregateChapterData', async function(request, response){
    require("./aggregateChapterDataCall")(request, response)
  })
  app.post('/individualChapterData', async function(request, response){
    require("./individualChapterDataCall")(request, response)
  })
  app.post('/courseStructure', async function(request, response){
    require("./courseStructureCall")(request, response)
  })
  app.post('/pageViews', async function(request, response){
    require("./pageViewsCall")(request, response)
  })
  app.post('/studentChart', async function(request, response){
    require("./studentChartCall")(request, response, environment)
  })
  app.post('/allStudents', async function(request, response){
    require("./allStudentsCall")(request, response, environment)
  })
  app.post('/tags', async function(request, response){
    require("./metatagCall")(request, response)
  })
  app.post('/allAdaptAssignments', async function(request, response){
    require("./allAdaptAssignmentsCall")(request, response, environment)
  })
  app.post('/adaptLevels', async function(request, response){
    require("./adaptLevelsCall")(request, response, environment)
  })
  app.post('/aggregateAssignmentViews', async function(request, response){
    require("./aggregateAssignmentViewsCall")(request, response, environment)
  })
  app.post('/allAssignmentGrades', async function(request, response){
    require("./allAssignmentGradesCall")(request, response, environment)
  })
  app.post('/individualPageViews', async function(request, response){
    require("./individualPageViewsCall.js")(request, response, dbInfo, environment)
  })
  app.post('/gradePageViews', async function(request, response){
    require("./gradePageViewsCall.js")(request, response, dbInfo, environment)
  })
  app.post('/studentAssignments', async function(request, response){
    require("./studentAssignmentsCall.js")(request, response, environment)
  })
  app.post('/studentTextbookEngagement', async function(request, response){
    require("./studentTextbookEngagementCall.js")(request, response, environment)
  })
}
