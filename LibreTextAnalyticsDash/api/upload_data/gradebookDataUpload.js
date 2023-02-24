const helper = require("./helperFunctions.js");
var axios = require("axios");
const { parse } = require("fast-csv");
require("dotenv").config();
const moment = require("moment");

const coll = process.env.GCOLL;
const adaptColl = process.env.ACOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;

// these functions are run with the assumption that the adapt course id will be unique every semester;
//  however, if the students are different this may not matter

// delay the call to get gradebook data by at least 1 second so it doesn't throw errors
function delay(config, percentageConfig, time, course, points) {
  var gradebookCoursesConfig = axios(getGradebookCoursesConfig()).catch((err) => console.log(course+" - gradebook courses error"));
  // axios.all fails if one of the configs fail
  // if the scores endpoint fails for a course, it has no gradebook data
  var configs = [axios(config).catch((err) => console.log(course+" - scores endpoint error")), gradebookCoursesConfig];
  setTimeout(async function() {
    axios.all(configs).then(function (responses) {
      console.log(course, moment().format());
      if (responses[0] !== undefined) {
        configureData(course, responses[0].data, points, responses[1].data['documents'][0].courses.map(c => parseInt(c)), percentageConfig)
      }
    }).catch(function (error) {
      console.log(error)
    })
  }, time*1000);
}

// iterates through each course and creates a config to get the gradebook data
async function getAdaptData(adaptCourses, points) {
  var entries = [];
  for (let i=0; i < adaptCourses.length; i++) {
    var config = {
      method: 'GET',
      url: 'https://adapt.libretexts.org/api/analytics/scores/course/'+adaptCourses[i],
      headers: { Authorization: `Bearer ${process.env.auth}` }
    }
    var percentageConfig = {
      method: 'GET',
      url: 'https://adapt.libretexts.org/api/analytics/proportion-correct-by-assignment/course/'+adaptCourses[i],
      headers: { Authorization: `Bearer ${process.env.auth}` }
    }
    delay(config, percentageConfig, i, adaptCourses[i], points);
  }
}

// gets a list of courses from the adapt collection, sends them to the next function
//  can use the function with no arguments and it'll grab the adapt courses and go through all of them, or
//  can use the function with an array of courses and it'll only cycle through those
async function getAdaptCourses(courses=null) {
  var queryString = {
    "collection": adaptColl,
    "database": db,
    "dataSource": dataSource,
    "pipeline": [
      {
        '$group': {
          '_id': '',
          'courses': {'$addToSet': '$course_id'}
        }
      }
    ]
  }
  var config = {
      method: 'post',
      url: process.env.URL,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(queryString)
  };
  if (courses !== null) {
    courses = courses.map(c => typeof(c) === "number" ? String(c) : c)
    getAdaptLevels(courses)
  } else {
    axios(config).then((response) => {
      let adaptCourses = JSON.parse(JSON.stringify(response.data))['documents'][0]['courses']
      getAdaptLevels(adaptCourses)
    }).catch(err => {
      console.log(err)
    })
  }
}

// grab the assignments and points from the adapt collection to calculate assignment percentages
async function getAdaptLevels(adaptCourses) {
  var queryString = {
    "collection": adaptColl,
    "database": db,
    "dataSource": dataSource,
    "pipeline": [
      {
        "$group": {
          '_id': {
            'level_name': '$assignment_name',
            'class': '$course_id'
            //check here for course start dates?? don't want to grab the wrong data if there are multiple start dates for one class
            // but don't want to accidentally override past data if the numbers are different
            // shouldn't be a problem if courses get a new id every quarter
          },
          'assignment_group': {'$first': '$assignment_group'},
          'points': {'$first': '$assignment_points'},
          'due': {'$max': '$due'} //change to min??
        }
      }
    ]
  }
  var config = {
      method: 'post',
      url: process.env.URL,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(queryString)
  };
  await axios(config).then(function (response) {
    if (JSON.parse(JSON.stringify(response.data))['documents'].length > 0) {
      let points = JSON.parse(JSON.stringify(response.data))['documents']
      getAdaptData(adaptCourses, points)
    } else {
      getAdaptData(null)
    }
  })
}

function getGradebookCoursesConfig() {
  var query = {
    "collection": coll,
    "database": db,
    "dataSource": dataSource,
    "pipeline": [
      {
        "$group": {
          '_id': '',
          'courses': {'$addToSet': '$class'}
        }
      }
    ]
  }
  var config = {
    method: 'POST',
    url: process.env.URL,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': process.env.API_KEY
    },
    data: JSON.stringify(query)
  }
  return config
}

function getAxiosFindCall(data) {
  var query = {
    "collection": coll,
    "database": db,
    "dataSource": dataSource,
    "filter": data[0],
    "update": data[1],
    "upsert": true
  }
  var config = {
    method: 'POST',
    url: process.env.updateOneURL,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': process.env.API_KEY
    },
    data: JSON.stringify(query)
  }
  return config
}

// calculate scores and due dates, encrypt the student email and
//   update the entry if a grade has been added, otherwise insert an entry if it doesn't exist
async function configureData(course, data, coursePoints, gradebookCourses, percentageConfig) {
  var assignmentPercentages = await axios(percentageConfig).then(response => response.data).catch((err) => console.log("No proportion correct data available for "+course))
  course = String(course)
  var headers = data[0];
  var entry = {};
  var entries = [];
  console.log(course);
  data.forEach((student, index) => {
    if (index !== 0) {
      var email = helper.encryptStudent(student[0]);
      var courseGrade = parseFloat(student[student.length-2].replaceAll("%", ""));
      var letterGrade = student[student.length-1];
      var courseData = coursePoints.filter(element => element._id.class === course);
      student.forEach((s, i) => {
        if (i !== 0 && i < student.length-2) {
          var score = parseFloat(s)
          var hasScore = true
          if (isNaN(score)) {
            score = 0;
            hasScore = false;
          }
          var points = courseData.find(elem => elem._id.level_name === headers[i])
          var assignmentPercentData = assignmentPercentages && assignmentPercentages.length > 0 ? assignmentPercentages.find(assn => assn.email === student[0] && assn.name === headers[i]) : undefined;
          var proportion_correct = null;
          var assignment_id = null;
          hasScore = false;
          if (assignmentPercentData !== undefined) {
            proportion_correct = parseFloat(assignmentPercentData.proportion_correct);
            assignment_id = assignmentPercentData.assignment_id;
            hasScore = true;
          }
          var points_possible = "Not Found"
          var percent_score = score === 0 ? 0 : "Not Found"
          var due = "Not Found"
          if (points !== undefined) {
            due = points.due;
            points_possible = parseFloat(points.points)
            var percent = score/points_possible;
            if (isNaN(percent)) {
              percent_score = 0
            } else {
              percent_score = parseFloat((percent*100).toFixed(2))
            }
          }
          //use this for inserting
          entry = {
            email: email,
            level_name: headers[i],
            class: course,
            score: score,
            points_possible: points_possible,
            assignment_percent: percent_score,
            turned_in_assignment: hasScore,
            overall_course_percent: courseGrade,
            overall_course_grade: letterGrade,
            assignment_due: due,
            proportion_correct: proportion_correct,
            assignment_id: assignment_id,
            assignment_group: points ? points.assignment_group : headers[i]
          }
          //use this for finding and updating
          var updateObject = [
            {
              email: email,
              level_name: headers[i],
              class: course
            },
            {
              '$set': {
                assignment_due: due,
                score: score,
                points_possible: points_possible,
                assignment_percent: percent_score,
                turned_in_assignment: hasScore,
                overall_course_percent: courseGrade,
                overall_course_grade: letterGrade,
                proportion_correct: proportion_correct,
                assignment_id: assignment_id,
                assignment_group: points ? points.assignment_group : headers[i]
              }
            },
            {
              '$upsert': true
            }
          ]
          var config = getAxiosFindCall(updateObject)
          if (gradebookCourses.includes(parseInt(course))) {
            entries.push(config)
          } else {
            entries.push(entry)
          }
      }
      })
    }
  })
  course = parseInt(course)
  if (!gradebookCourses.includes(course)) {
    //for inserting
    var config = helper.getAxiosCall(coll, entries)
    helper.writeToMongoDB([config]);
    console.log("course not in database -- inserting")
  } else {
    //for finding and updating
    // if (assignmentPercentages !== undefined && assignmentPercentages !== null) {
    helper.writeToMongoDB(entries)
    console.log("course is in database -- updating")
    // }
  }
}

module.exports = { delay, getAdaptData, getAdaptCourses, getAdaptLevels, getAxiosFindCall, configureData }
