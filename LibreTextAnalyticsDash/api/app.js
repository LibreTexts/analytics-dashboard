const dataTable = require("./dataTableQuery.js");
const adaptCode = require("./adaptCodeQuery.js");
const adaptLevel = require("./adaptLevelQuery.js");
const aggregatePageViews = require("./aggregatePageViewsQuery.js");
const allCourses = require("./allCoursesQuery.js");
const courseUnits = require("./courseUnitsQuery.js");
const individualData = require("./individualDataQuery.js");
const individualPageViews = require("./individualPageViewsQuery.js");
const individualGradePageViews = require("./individualGradePageViewsQuery.js");
const individualTimeline = require("./individualTimelineQuery.js");
const studentChart = require("./studentChartQuery.js");
const adaptStudentChart = require("./adaptStudentChartQuery.js");
const studentAdaptAssignment = require("./studentAdaptAssignmentQuery.js");
const allAdaptCourses = require("./allAdaptCoursesQuery.js");
const adaptDataTable = require("./adaptDataTableQuery.js");
const adaptStudents = require("./adaptStudentsQuery.js");
const allStudents = require("./allStudentsQuery.js");
const pageCount = require("./pageCountQuery.js");
const assignmentCount = require("./assignmentCountQuery.js");
const allAdaptAssignments = require("./allAdaptAssignmentsQuery.js");

var axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const moment = require("moment");
app.use(bodyParser.json());
app.use(cors());
require("dotenv").config();
const basicAuth = require("express-basic-auth");

const dbInfo = {
  coll: process.env.COLL,
  pageColl: process.env.PCOLL,
  adaptColl: process.env.ACOLL,
  db: process.env.DB,
  dataSource: process.env.SRC,
};
const hashKey = process.env.studentHash;
const userPassword = process.env.userPassword;

app.use(
  basicAuth({
    users: { admin: userPassword },
    challenge: true,
  })
);

function encryptStudent(student) {
  const algorithm = "aes-256-cbc";
  const key = process.env.studentHash;
  const iv = Buffer.from(key, "hex");
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  student = cipher.update(student, "utf8", "hex");
  student += cipher.final("hex");

  return student;
}

function decryptStudent(student) {
  const algorithm = "aes-256-cbc";
  const key = process.env.studentHash;
  const iv = Buffer.from(key, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = "";
  let chunk;
  decipher.on("readable", () => {
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk.toString("utf8");
    }
  });

  decipher.write(student, "hex");
  decipher.end();
  return decrypted;
}

//get the list of all students enrolled in a given course (found in adapt enrollment data)
var enrollmentQuery = {
  collection: "enrollments",
  database: dbInfo.db,
  dataSource: dbInfo.dataSource,
  pipeline: [
    {
      $group: {
        _id: "$class",
        students: { $addToSet: "$email" },
        dates: { $addToSet: "$created_at" },
      },
    },
  ],
};

var startEndDateQuery = {
  collection: dbInfo.adaptColl,
  database: dbInfo.db,
  dataSource: dbInfo.dataSource,
  pipeline: [
    {
      $group: {
        _id: "$class",
        startDate: {
          $first: "$class_start_date",
        },
        endDate: {
          $max: "$due",
        },
      },
    },
  ],
};

function getRequest(queryString) {
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
  return config;
}

//find a course in the adapt data, find student enrollment
function findEnrollmentData(
  adaptCodes,
  enrollmentData,
  course,
  allCourses,
  dates
) {
  var codeFound = adaptCodes.find((o) => o.course === course);
  var courseCode = codeFound ? parseInt(codeFound.code) : null;
  //console.log(course)

  var studentEnrollment = [];
  if (codeFound) {
    var studentEnrollment = enrollmentData.find((o) => o._id === courseCode);
    studentEnrollment.dates = studentEnrollment.dates
      .map((d) => new Date(d))
      .sort((a, b) => {
        return a < b;
      });
    var start = new Date(studentEnrollment.dates[0]);
    var end = studentEnrollment.dates.pop();
    //checking the adapt dates against the dates on the lt data to see if it's the right term
    if (allCourses) {
      var index = Object.keys(allCourses).find(c => allCourses[c]._id === course)
      var date = new Date(JSON.parse(JSON.stringify(allCourses[index])).date)
      const diffTime = Math.abs(date - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 14) {
        return [];
      }
    }
    //work here to find dates and check them against actual lt dates
    //change the enrollment dates to Date objects and compare
    return studentEnrollment["students"];
  } else {
    return [];
  }
}

let libretextToAdaptConfig = getRequest(adaptCode.adaptCodeQuery(dbInfo));
var adaptCodes = {};
axios(libretextToAdaptConfig)
  .then(function (response) {
    adaptCodes = response.data["documents"];
    //console.log(adaptCodes)
  })
  .catch(function (error) {
    console.log(error);
  });

let enrollmentConfig = getRequest(enrollmentQuery);
var enrollmentData = {};
axios(enrollmentConfig)
  .then(function (response) {
    enrollmentData = response.data["documents"];
    //console.log(enrollmentData)
  })
  .catch(function (error) {
    console.log(error);
  });

let dateConfig = getRequest(startEndDateQuery);
var courseDates = [];
axios(dateConfig)
  .then(function (response) {
    courseDates = response.data["documents"];
    //console.log(enrollmentData)
  })
  .catch(function (error) {
    console.log(error);
  });

let pageConfig = getRequest(pageCount.pageCountQuery(dbInfo));
var pageCountData = {};
axios(pageConfig)
  .then(function (response) {
    pageCountData = response.data["documents"];
  })
  .catch(function (error) {
    console.log(error);
  });

let assignmentConfig = getRequest(assignmentCount.assignmentCountQuery(dbInfo));
var assignmentCountData = {};
axios(assignmentConfig)
  .then(function (response) {
    assignmentCountData = response.data["documents"];
  })
  .catch(function (error) {
    console.log(error);
  });

let realCourseConfig = getRequest(allCourses.allCoursesQuery(dbInfo));
let realCourseNames = {};
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

let adaptCourseConfig = getRequest(
  allAdaptCourses.allAdaptCoursesQuery(dbInfo)
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
        if (courseDates) {
          var dates = courseDates.find((o) => o._id === courses[course]);
        }
        c["_id"] = courses[course];
        c["startDate"] = courseDates ? dates.startDate : null;
        c["endDate"] = courseDates ? dates.endDate : null;
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
  let queryString = allStudents.allStudentsQuery(req.body, dbInfo);
  let config = getRequest(queryString);
  var studentEnrollment = JSON.parse(
    JSON.stringify(
      findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)
    )
  );
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((d, index) => {
        var id = d._id;
        newData["documents"][index]["displayModeStudent"] = d._id;
        newData["documents"][index]._id = decryptStudent(d._id);
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
  let queryString = individualTimeline.individualTimelineQuery(
    req.body,
    dbInfo
  );
  let config = getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      if (newData["documents"].length > 0) {
        newData["documents"].forEach((d, index) => {
          if (d._id.length >= 20) {
            newData["documents"][index]["displayModeStudent"] = d._id;
            newData["documents"][index]._id = decryptStudent(d._id);
          }
        });
        if (newData["documents"][0]._id.includes("@")) {
          newData["studentTimelineData"] = newData["documents"];
        } else {
          newData["pageTimelineData"] = newData["documents"];
        }
      } else {
        newData["studentTimelineData"] = null;
        newData["pageTimelineData"] = null;
      }
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
  let queryString = dataTable.dataTableQuery(
    req.body,
    await adaptCodes,
    dbInfo
  );
  if (req.body.adaptCourse && !req.body.ltCourse) {
    queryString = adaptDataTable.adaptDataTableQuery(req.body, dbInfo);
  }
  let config = getRequest(queryString);
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
  var studentEnrollment = JSON.parse(
    JSON.stringify(
      await findEnrollmentData(
        adaptCodes,
        enrollmentData,
        req.body.courseId,
        realCourseNames,
        courseDates
      )
    )
  );
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
          if (studentEnrollment.length > 0) {
            //check to see if the student is enrolled
            if (studentEnrollment.includes(student._id)) {
              //mark the student as enrolled
              newData["documents"][index]["isEnrolled"] = true;
              //if the student is in the course, remove that student from the enrollment list
              studentEnrollment.find((s, index) => {
                if (s === student._id) {
                  studentEnrollment.splice(index, 1);
                }
              });
            } else {
              //mark the student as not enrolled
              newData["documents"][index]["isEnrolled"] = false;
            }
            //add true to all students if there is no enrollment data so the entire table isn't grayed out
          } else if (studentEnrollment.length === 0) {
            newData["documents"][index]["isEnrolled"] = "N/A";
          }
          newData["documents"][index]["hasData"] = true;
          newData["documents"][index]["displayModeStudent"] = student._id;
          newData["documents"][index]._id = decryptStudent(student._id);
        });
      }
      //if there is an enrolled student that has no data, add them to the table
      if (studentEnrollment.length > 0 && tab === "student") {
        studentEnrollment.forEach((s) => {
          newData["documents"].splice(0, 0, {
            _id: decryptStudent(s),
            isEnrolled: true,
            hasData: false,
            adapt: hasAdapt,
            displayModeStudent: s,
          });
        });
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
  let queryString = individualData.individualDataQuery(req.body, dbInfo);
  let config = getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((s, index) => {
        newData["documents"][index]._id = decryptStudent(s._id);
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
  let queryString = adaptStudents.adaptStudentsQuery(req.body, dbInfo);
  let config = getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((s, index) => {
        newData["documents"][index]._id = decryptStudent(s._id);
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
  let queryString = studentChart.studentChartQuery(req.body, dbInfo);
  var pages = pageCountData.find((o) => o._id === req.body.courseId);
  var maxPageCount = pages.pageCount;
  var isAdaptXAxis = req.body.adaptAxisValue;
  if (isAdaptXAxis) {
    var course = adaptCodes.find((o) => o.course === req.body.courseId);
    course = course.code;
    queryString = adaptStudentChart.adaptStudentChartQuery(
      req.body,
      dbInfo,
      adaptCodes
    );
    var assignments = assignmentCountData.find((o) => o._id === course);
    maxPageCount = assignments.assignmentCount;
  }
  var groupBy = req.body.groupBy;
  let config = getRequest(queryString);
  var studentEnrollment = JSON.parse(
    JSON.stringify(
      findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)
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
        var encryptedStudents = JSON.parse(JSON.stringify(student.students));
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
            //   newData['documents'][index].students[i] = decryptStudent(s)
            // }
          }
        });
        allStudents.forEach((s, i) => {
          allStudents[i] = decryptStudent(s);
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
  let queryString = aggregatePageViews.aggregatePageViewsQuery(
    req.body,
    dbInfo
  );
  let config = getRequest(queryString);
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
  let queryString = individualPageViews.individualPageViewsQuery(
    req.body,
    adaptCodes,
    dbInfo
  );
  // console.log("QUERY STRING")
  // console.log(queryString)
  let config = getRequest(queryString);
  //console.log(config)
  axios(config)
    .then(function (response) {
      let newData = response.data;
      if (req.body.individual) {
        newData["individualPageViews"] = newData["documents"];
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
  let queryString = individualGradePageViews.individualGradePageViewsQuery(
    req.body,
    adaptCodes,
    dbInfo
  );
  // console.log("QUERY STRING")
  // console.log(queryString)
  let config = getRequest(queryString);
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
  let queryString = studentAdaptAssignment.studentAdaptAssignmentQuery(
    req.body,
    adaptCodes,
    dbInfo,
    encryptStudent
  );
  let config = getRequest(queryString);
  axios(config)
    .then(function (response) {
      let newData = response.data;
      newData["documents"].forEach((d, index) => {
        newData["documents"][index]["displayModeStudent"] = d["_id"]["student"];
        newData["documents"][index]["_id"]["student"] = decryptStudent(
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
  let queryString = allAdaptAssignments.allAdaptAssignmentsQuery(
    req.body,
    adaptCodes,
    dbInfo,
    encryptStudent
  );
  let config = getRequest(queryString);
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

// app.post('/adapt', (req,res,next) => {
//   let queryString = assignmentView.getAdaptQuery(req.body);
//   let config = getRequest(queryString);
//   axios(config)
//       .then(function (response) {
//         let newData = (response.data)
//         newData = JSON.stringify(newData)
//         res.json(newData);
//       })
//       .catch(function (error) {
//           console.log(error);
//       });
//
// });

app.post("/adaptlevels", (req, res, next) => {
  let queryString = adaptLevel.adaptLevelQuery(req.body, adaptCodes, dbInfo);
  let config = getRequest(queryString);
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

// app.post('/tags', (req,res,next) => {
//   let queryString = main.getTagQuery(req.body);
//   let config = getRequest(queryString);
//   axios(config)
//       .then(function (response) {
//         let newData = (response.data)
//         newData['tags'] = newData['documents']
//         newData = JSON.stringify(newData)
//         res.json(newData);
//       })
//       .catch(function (error) {
//           console.log(error);
//       });
//
// });

app.post("/chapters", (req, res, next) => {
  let queryString = courseUnits.courseUnitsQuery(req.body, dbInfo);
  let config = getRequest(queryString);
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
