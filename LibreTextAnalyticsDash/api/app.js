const queries = require("./queries/index.js");
const helperFunctions = require("./helper/helperFunctions.js");
const lookupQueries = require("./queries/lookupQueries.js");
const dbInfo = require("./config/db.config.js");
const validateInput = require("./validateInput.js");

const axios = require("axios");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const moment = require("moment");
require("dotenv").config();
const basicAuth = require("express-basic-auth");
const cookieParser = require('cookie-parser');
const url = require('url');
const randomString = require('randomstring');

const hashKey = process.env.studentHash;
const userPassword = process.env.userPassword;
const CONDUCTOR_API_URL = 'https://commons-staging.libretexts.org/api/v1';

const app = express();
app.use(cors());
app.use(
  basicAuth({
    users: { admin: userPassword },
    challenge: true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

/* Backend routes */
const router = express.Router();

/**
 * Start the auth flow by redirecting to Conductor's OAuth2 'authorize' endpoint.
 * This endpoint could optionally check if valid access tokens are already present and
 * skip straight to the Dashboard instead of generating new tokens.
 */
app.get('/init', (req, res) => {
  /* Generate a nonce to thwart CSRF and save it in browser to check later */
  const stateNonce = randomString.generate(10);
  const cookiesToSet = [
    `analytics_conductor_oauth_state=${stateNonce}; Path=/; Domain=localhost; HttpOnly; Secure;`,
  ]
  console.log(req)
  console.log(req.query)
  if (req.query.courseId) {
    cookiesToSet.push(`analytics_conductor_course_id=${req.query.courseId}; Path=/; Domain=localhost; HttpOnly; Secure;`)
    res.cookie('analytics_conductor_course_id', req.query.courseId)
  }
  res.setHeader('Set-Cookie', cookiesToSet);
  res.cookie('analytics_conductor_oauth_state', stateNonce)
  return res.redirect(`${CONDUCTOR_API_URL}/oauth2.0/authorize?client_id=${process.env.CONDUCTOR_API_CLIENT_ID}&response_type=code&state=${stateNonce}`);
});

/**
 * Receive the authorization code from Conductor and exchange it for access and refresh tokens.
 */
app.get('/oauth2.0/callback', (req, res) => {
  /* Check required values */
  if (!req.query.code) {
    return res.status(400).send({
      msg: 'Missing auth code!',
    });
  }
  if (!req.cookies.analytics_conductor_oauth_state) {
    return res.status(400).send({
      msg: 'Missing state nonce!',
    });
  }

  /* Verify the state nonce is the same -- deny if mismatch */
  if (req.cookies.analytics_conductor_oauth_state !== req.query.state) {
    return res.status(400).send({
      msg: 'Invalid state nonce!',
    });
  }

  /*
   * Build the data to send with the request - use URLSearchParams to
   * send it in the required "application/x-www-form-urlencoded" format.
   *
   * The same data is required when access_token expires; swap 'code' field for
   * 'refresh_token' field and set 'grant_type' to 'refresh_token'. Getting a
   * new access_token using refresh_token also issues a new refresh_token.
   *
   * If the authorization code OR refresh token is expired, the response includes
   * 'expired_grant': true. If the access token for any request is expired for any
   * request, the response includes 'expired_token': true.
   */
  const params = new url.URLSearchParams({
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: 'https://test.libretexts.org/analytics/api/oauth2.0/callback',
    client_id: process.env.CONDUCTOR_API_CLIENT_ID,
    client_secret: process.env.CONDUCTOR_API_CLIENT_SECRET,
  });
  axios.post(
    'https://commons-staging.libretexts.org/api/v1/oauth2.0/accessToken',
    params.toString()
  ).then((conductorRes) => {
    // console.log(conductorRes.data);

    /*
     * Grab the tokens and save them to the browser for later use, then redirect
     * to Dashboard. 'Max-Age' could also be set to the 'expires_in' value
     * to automatically expire the access token.
     * Cookies should be Secure and HttpOnly: requests to Conductor should be routed through
     * the Analytics API to prevent XSS and CORS denial!
     */
    if (typeof (conductorRes.data.access_token) === 'string') {
      res.setHeader('Set-Cookie', [
        `analytics_conductor_access=${conductorRes.data.access_token}; Path=/; Domain=localhost; HttpOnly; Secure;`,
        `analytics_conductor_refresh=${conductorRes.data.refresh_token}; Path=/; Domain=localhost; HttpOnly; Secure;`,
      ]);
      return res.redirect('/analytics');
    }

    /* Something went wrong ... show user an error */
    throw (new Error('unknown'));
  }).catch((err) => {
    if (err.response?.data?.expired_grant) {
      console.error('auth_code_expired'); // start over?
    } else {
      console.error(err);
    }
    return res.status(500).send({
      msg: 'err!',
    });
  });
});

/**
 * Retrieve some information about the user from Conductor API to make sure auth is working.
 */
app.get('/userinfo', (req, res) => {
  if (!req.cookies.analytics_conductor_access || !req.cookies.analytics_conductor_refresh) {
    return res.redirect('/api/init'); // need to sign in
  }

  return axios.get(`${CONDUCTOR_API_URL}/user/basicinfo`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest', // non-auth routes need this header for CSRF protection
      'Authorization': `Bearer ${req.cookies.analytics_conductor_access}`,
    },
  }).then((conductorRes) => {
    if (!conductorRes.data.err) {
      return res.status(200).send({
        firstName: conductorRes.data.user.firstName,
        lastName: conductorRes.data.user.lastName,
      });
    } else {
      throw (new Error(conductorRes.data.errMsg)); // some error happened, more detail in msg
    }
  }).catch((err) => {
    if (err.response?.data?.expired_token) {
      console.error('expired_token'); // get new token and start over
    } else {
      console.error(err);
    }
    return res.status(500).send({
      msg: 'unknown error!',
    });
  });
});

app.use(bodyParser.json());
//setup
let libretextToAdaptConfig = helperFunctions.getRequest(queries.adaptCodeQuery(dbInfo));
var adaptCodes = {};
axios(libretextToAdaptConfig)
  .then(function (response) {
    adaptCodes = response.data["documents"];
    //console.log(adaptCodes)
  })
  .catch(function (error) {
    console.log(error);
  });

let enrollmentConfig = helperFunctions.getRequest(lookupQueries.enrollmentQuery);
var enrollmentData = {};
axios(enrollmentConfig)
  .then(function (response) {
    enrollmentData = response.data["documents"];
    //console.log(enrollmentData)
  })
  .catch(function (error) {
    console.log(error);
  });

let dateConfig = helperFunctions.getRequest(lookupQueries.startEndDateQuery);
var courseDates = [];
axios(dateConfig)
  .then(function (response) {
    courseDates = response.data["documents"];
    //console.log(enrollmentData)
  })
  .catch(function (error) {
    console.log(error);
  });

let pageConfig = helperFunctions.getRequest(queries.pageCountQuery(dbInfo));
var pageCountData = {};
axios(pageConfig)
  .then(function (response) {
    pageCountData = response.data["documents"];
  })
  .catch(function (error) {
    console.log(error);
  });

let assignmentConfig = helperFunctions.getRequest(queries.assignmentCountQuery(dbInfo));
var assignmentCountData = {};
axios(assignmentConfig)
  .then(function (response) {
    assignmentCountData = response.data["documents"];
  })
  .catch(function (error) {
    console.log(error);
  });
//
// const middleware = require("./routes/realCourses.js");
// console.log(middleware)
// app.use("/realcourses", middleware);

let realCourseConfig = helperFunctions.getRequest(queries.allCoursesQuery(dbInfo));
let realCourseNames = [];
axios(realCourseConfig)
  .then(function (response) {
    realCourseNames = response.data["documents"];
    realCourseNames.forEach((c, index) => {
      //console.log(c)
      var codeFound = adaptCodes.find((o) => o.course === c._id);

      if (codeFound && codeFound.isInAdapt) {
        c["adaptCourse"] = true;
        var dates = courseDates.find((o) => o._id === codeFound.code);
        //check to see if the adapt dates are the correct term for the lt data
        if (new Date(dates.startDate) < new Date(c.date) && new Date(c.date) < new Date(dates.endDate)) {
          c["startDate"] = dates.startDate;
          c["endDate"] = dates.endDate;
        }
      } else {
        c["adaptCourse"] = false;
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });

app.get("/realcourses", (req, res) => {
  res.json(realCourseNames);
});

let adaptCourseConfig = helperFunctions.getRequest(
  queries.allAdaptCoursesQuery(dbInfo)
);
let adaptCourses = {};
axios(adaptCourseConfig)
  .then(function (response) {
    // console.log(response.data)
    // console.log(adaptCodes)
    adaptCourses = response.data["documents"];
    let courses = {};
    adaptCourses.forEach((course) => {
      var name = course._id.toLowerCase();
      var demoCourse = false;
      if (
        name.includes("test") ||
        name.includes("demo") ||
        name.includes("sandbox") ||
        course.students.length < 5
      ) {
        demoCourse = true;
      }
      if (course._id !== "" && !demoCourse) {
        courses[course._id] = course.course;
      }
    });
    var allCourses = [];
    Object.keys(courses).forEach((course) => {
      var codeFound = adaptCodes.find((o) => o.code === courses[course]);
      if (codeFound) {
        delete courses[course];
      } else {
        //courses[course]["ltCourse"] = false
        var c = {};
        if (courseDates.length > 0) {
          var dates = courseDates.find((o) => o._id === courses[course]);
        }
        c["_id"] = courses[course];
        c["startDate"] = dates ? dates.startDate : null;
        c["endDate"] = dates ? dates.endDate : null;
        c["course"] = course;
        c["adaptCourse"] = true;
        c["ltCourse"] = false;
        allCourses.push(c);
      }
    });
    adaptCourses = allCourses;
  })
  .catch(function (error) {
    console.log(error);
  });

app.get("/adaptcourses", (req, res) => {
  res.json(adaptCourses);
});

app.post("/allstudents", (req, res, next) => {
  let queryString = queries.allStudentsQuery(
    validateInput.validateInput("allstudents", req.body),
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  var studentEnrollment = JSON.parse(
    JSON.stringify(
      helperFunctions.findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)
    )
  );
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((d, index) => {
        var id = d._id;
        newData["documents"][index]["displayModeStudent"] = d._id;
        newData["documents"][index]._id = helperFunctions.decryptStudent(d._id);
        if (studentEnrollment.length < 1) {
          newData["documents"][index]["isEnrolled"] = true;
        } else if (studentEnrollment.includes(id)) {
          newData["documents"][index]["isEnrolled"] = true;
        } else {
          newData["documents"][index]["isEnrolled"] = false;
        }
      });
      newData["allStudents"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/timelineData", (req, res, next) => {
  let queryString = queries.individualTimelineQuery(
    validateInput.validateInput("timelineData", req.body),
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      // if (newData["documents"].length > 0) {
      //   newData["documents"].forEach((d, index) => {
      //     if (d._id.length >= 20) {
      //       newData["documents"][index]["displayModeStudent"] = d._id;
      //       newData["documents"][index]._id = helperFunctions.decryptStudent(d._id);
      //     }
      //   });
      //   if (newData["documents"][0]._id.includes("@")) {
      //     newData["studentTimelineData"] = newData["documents"];
      //   } else {
          newData["pageTimelineData"] = newData["documents"];
      //   }
      // } else {
      //   newData["studentTimelineData"] = null;
      //   newData["pageTimelineData"] = null;
      // }
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/data", async (req, res, next) => {
  //console.log(req.body)
  let queryString = queries.dataTableQuery(
    validateInput.validateInput("data", req.body),
    await adaptCodes,
    dbInfo
  );
  if (req.body.adaptCourse && !req.body.ltCourse) {
    queryString = queries.adaptDataTableQuery(
      validateInput.validateInput("data", req.body),
      dbInfo
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
  var enrollment =
      await helperFunctions.findEnrollmentData(
        adaptCodes,
        enrollmentData,
        req.body.courseId,
        realCourseNames,
        courseDates
      );
  var studentEnrollment = JSON.parse(JSON.stringify(enrollment))
  var rosterData = req.body.roster
  var rosterDataCopy = JSON.parse(JSON.stringify(rosterData))

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
          var date = new Date(student['max'])
          if (start) {
            var diff = moment(new Date(end)).diff(moment(date), "days")
          } else {
            var diff = moment().diff(moment(date), "days")
          }
          newData["documents"][index]["diff"] = diff
          //check if there is enrollment data for the course
          //console.log(studentEnrollment)
          var encryptedStudent = student._id
          var decryptedStudent = helperFunctions.decryptStudent(student._id)
          //decrypting students from the roster and leaving the rest
          if (rosterData) {
            if (rosterData.includes(decryptedStudent)) {
              newData["documents"][index]["isEnrolled"] = true;
              rosterDataCopy.find((s, index) => {
                if (s === decryptedStudent) {
                  rosterDataCopy.splice(index, 1);
                }
              });
            } else {
              newData["documents"][index]["isEnrolled"] = false;
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
            } else {
              //mark the student as not enrolled
              newData["documents"][index]["isEnrolled"] = false;
            }
            //add true to all students if there is no enrollment data so the entire table isn't grayed out
          } else if (enrollment.length === 0) {
            newData["documents"][index]["isEnrolled"] = "N/A";
          }
          newData["documents"][index]["hasData"] = true;
          newData["documents"][index]["displayModeStudent"] = encryptedStudent;
          newData["documents"][index]._id = decryptedStudent;
        });
      }
      //if there is an enrolled student that has no data, add them to the table
      if ((enrollment.length > 0 || (rosterDataCopy && rosterDataCopy.length > 0)) && tab === "student") {
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

app.post("/individual", (req, res, next) => {
  let queryString = queries.individualDataQuery(
    validateInput.validateInput("individual", req.body),
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((s, index) => {
        newData["documents"][index]._id = helperFunctions.decryptStudent(s._id);
      });
      newData["individual"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/adaptstudents", (req, res, next) => {
  let queryString = queries.adaptStudentsQuery(
    validateInput.validateInput("adaptstudents", req.body),
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((s, index) => {
        newData["documents"][index]._id = helperFunctions.decryptStudent(s._id);
      });
      newData["adaptStudents"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/studentchart", (req, res, next) => {
  let queryString = queries.studentChartQuery(
    validateInput.validateInput("studentchart", req.body),
    dbInfo
  );

  var isAdaptXAxis = req.body.adaptAxisValue;
  if (!isAdaptXAxis) {
    var pages = pageCountData.find((o) => o._id === req.body.courseId);
    var maxPageCount = pages.pageCount;
  }
  if (isAdaptXAxis) {
    var course = adaptCodes.find((o) => o.course === req.body.courseId);
    if (course) {
      course = course.code;
    } else {
      course = req.body.courseId;
    }
    queryString = queries.adaptStudentChartQuery(
      req.body,
      dbInfo,
      adaptCodes
    );
    var assignments = assignmentCountData.find((o) => o._id === course);
    maxPageCount = assignments.assignmentCount;
  }
  var groupBy = req.body.groupBy;
  let config = helperFunctions.getRequest(queryString);
  var studentEnrollment = JSON.parse(
    JSON.stringify(
      helperFunctions.findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)
    )
  );
  axios(config)
    .then(function (response) {
      let newData = response.data;
      //newData["documents"].map(o => console.log(o.students))
      //console.log(newData)
      var hasMaxPage = false;
      newData["documents"].forEach((student, index) => {
        if (groupBy === "objectCount" && student._id === maxPageCount) {
          hasMaxPage = true;
        }
        var allStudents = JSON.parse(JSON.stringify(student.students));
        student.students.forEach((s, i) => {
          if (studentEnrollment.length > 0) {
            if (!studentEnrollment.includes(s)) {
              allStudents.find((st, n) => {
                if (st === s) {
                  allStudents.splice(n, 1);
                }
              });
              newData["documents"][index].count =
                newData["documents"][index].count - 1;
            }
            // else {
            //   newData['documents'][index].students[i] = helperFunctions.decryptStudent(s)
            // }
          }
        });
        var encryptedStudents = JSON.parse(JSON.stringify(allStudents));
        allStudents.forEach((s, i) => {
          allStudents[i] = helperFunctions.decryptStudent(s);
        });
        newData["documents"][index].students = allStudents;
        newData["documents"][index]["displayModeStudents"] = encryptedStudents;
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

app.post("/pageviews", (req, res, next) => {
  let queryString = queries.aggregatePageViewsQuery(
    validateInput.validateInput("pageviews", req.body),
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["pageViews"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/individualpageviews", (req, res, next) => {
  let queryString = req.body.type === "pages" ? queries.individualPageViewsQuery(
    validateInput.validateInput("individualpageviews", req.body),
    adaptCodes,
    dbInfo
  ) : queries.individualAssignmentSubmissionsQuery(
    validateInput.validateInput("individualassignmentsubmissions", req.body),
    adaptCodes,
    dbInfo
  )
  // console.log("QUERY STRING")
  // console.log(queryString)
  let config = helperFunctions.getRequest(queryString);
  //console.log(config)
  axios(config)
    .then(function (response) {
      let newData = response.data;
      if (req.body.individual && req.body.type === "pages") {
        newData["individualPageViews"] = newData["documents"];
      } else if (req.body.individual && req.body.type === "assignments") {
        newData["individualAssignmentSubmissions"] = newData["documents"];
      } else {
        newData["individualAssignmentViews"] = newData["documents"];
      }
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

// Robert Au 7/14/22 -- following refactoring
app.post("/gradepageviews", (req, res, next) => {
  let queryString = queries.individualGradePageViewsQuery(
    validateInput.validateInput("gradepageviews", req.body),
    adaptCodes,
    dbInfo
  );
  // console.log("QUERY STRING")
  // console.log(queryString)
  let config = helperFunctions.getRequest(queryString);
  //console.log(config)
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/studentassignments", (req, res, next) => {
  let queryString = queries.studentAdaptAssignmentQuery(
    validateInput.validateInput("studentassignments", req.body),
    adaptCodes,
    dbInfo,
    helperFunctions.encryptStudent
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((d, index) => {
        newData["documents"][index]["displayModeStudent"] = d["_id"]["student"];
        newData["documents"][index]["_id"]["student"] = helperFunctions.decryptStudent(
          d["_id"]["student"]
        );
      });
      newData["studentAssignments"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/alladaptassignments", (req, res, next) => {
  let queryString = queries.allAdaptAssignmentsQuery(
    req.body,
    adaptCodes,
    dbInfo,
    helperFunctions.encryptStudent
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["allAdaptAssignments"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/adaptlevels", (req, res, next) => {
  let queryString = queries.adaptLevelQuery(
    validateInput.validateInput("adaptlevels", req.body),
    adaptCodes,
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["adaptLevels"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post('/tags', (req,res,next) => {
  let queryString = queries.getTagQuery(
    validateInput.validateInput("tags", req.body),
    dbInfo
  );
  let config = helperFunctions.getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        //console.log(newData)
        newData['tags'] = newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

//         res.json(newData);
//       })
//       .catch(function (error) {
//           console.log(error);
//       });
//
// });

app.post("/aggregatechapterdata", (req, res, next) => {
  let queryString = queries.chapterChartQuery(req.body, dbInfo);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["aggregateChapterData"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/individualchapterdata", (req, res, next) => {
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
});

app.post("/coursestructure", (req, res, next) => {
  let queryString = queries.courseUnitsQuery(req.body, dbInfo);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["chapters"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/pagelookup", (req, res, next) => {
  let queryString = queries.pageLookupQuery(req.body, dbInfo);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["pageLookup"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/studenttextbookengagement", (req, res, next) => {
  let queryString = queries.studentTextbookEngagementQuery(req.body, dbInfo, helperFunctions.encryptStudent);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["textbookEngagementData"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/averagepageviews", (req, res, next) => {
  let queryString = queries.averagePageViewsQuery(req.body, dbInfo);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["averagePageViews"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/aggregateassignmentviews", (req, res, next) => {
  let queryString = queries.aggregateAssignmentViewsQuery(req.body, dbInfo, adaptCodes);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["aggregateAssignmentViews"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/allassignmentgrades", (req, res, next) => {
  let queryString = queries.allAssignmentGradesQuery(req.body, dbInfo, adaptCodes);
  let config = helperFunctions.getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["allAssignmentGrades"] = newData["documents"];
      delete newData["documents"];
      newData = JSON.stringify(newData);
      res.json(newData);
    })
    .catch(function (error) {
      console.log(error);
    });
});
