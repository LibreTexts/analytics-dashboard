//has the function to get all data, using configs that are formed with the functions below
import axios from "axios";
import { writeToLocalStorage } from "./helperFunctions.js";
import {
  handleStudentData,
  handleAdaptLevels,
  handleAllStudents,
  handlePageTimelineData,
  handleAdaptStudents,
  handleChapters,
} from "./dataHandlingFunctions.js";

//gets all of the data from the backend and mongoDB
export async function getData(data, state, setState, path = false, tagData) {
  var promises = [];
  var tempState = JSON.parse(JSON.stringify(state));
  var course = state.courseId;
  //courseData is initialized and filled by me, not by localStorage
  var courseData = {};
  var tableData = {};
  var chartData = {};
  var dropdownData = {};

  if (tagData !== null) {
    dropdownData["tagData"] = tagData;
  }
  //iterates through the configs and stores the data, sometimes calling
  //other functions to do specific things with the data, in dataHandlingFunctions.js
  for (const config of data) {
    promises.push(
      await axios(config)
        .then(function (response) {
          var d = JSON.parse(response.data);
          var key = Object.keys(d)[0];
          var value = d[key];

          tempState[key] = value;
          courseData[key] = value;
          tempState["display"] = true;
          tempState["disableCourse"] = true;
          tempState["showInfoBox"] = false;
          if (key === "studentData") {
            handleStudentData(key, value, tempState, tableData, courseData);
          } else if (key === "adaptLevels") {
            handleAdaptLevels(value, tempState, dropdownData, courseData);
          } else if (key === "allStudents") {
            handleAllStudents(value, tempState, dropdownData, courseData);
          } else if (key === "pageTimelineData") {
            handlePageTimelineData(value, tempState, dropdownData, courseData);
          } else if (key === "adaptStudents") {
            handleAdaptStudents(value, tempState, dropdownData, courseData);
          } else if (key === "chapters") {
            handleChapters(value, tempState, dropdownData, courseData);
          } else {
            chartData[key] = value;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
    );
  }
  if (path) {
    courseData["dataPath"] = JSON.stringify(path);
    courseData["chosenPaths"] = JSON.stringify(path);
  }
  writeToLocalStorage(course + "-table", tableData);
  writeToLocalStorage(course + "-chart", chartData);
  writeToLocalStorage(course + "-dropdown", dropdownData);
  tempState[course] = courseData;
  Promise.all(promises).then(() => setState({ ...tempState }));
  return tempState;
}

function getAxiosCall(url, data, state) {
  var config = {
    method: "post",
    url: state.homepage + url,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };
  return config;
}

//generic config used for multiple data calls, contains the least amount of params needed on the backend
//used for: Textbook Chapter Chart, Course Structure Dropdown, All ADAPT Assignments Chart, ADAPT Levels,
//Single Assignment Views Over Time Chart, and the Assignment Performance Chart
export function simpleConfigTemplate(state, setState, route) {
  var data = {
    courseId: state.courseId,
    startDate: state.start,
    endDate: state.end,
    path: state.dataPath,
    tagFilter: state.chosenTag,
  };

  var config = getAxiosCall(route, data, state);
  return config;
}

export function getAllDataConfig(state, setState, type) {
  var group = "";
  if (type === "student") {
    group = "$actor.id";
  } else if (type === "page") {
    group = "$object.id";
  }
  var data = {
    startDate: state.start,
    endDate: state.end,
    course: state.course,
    courseId: state.courseId,
    path: state.dataPath,
    groupBy: group,
    tagType: state.tagType,
    tagTitle: state.tagTitle,
    adaptLevelGroup: state.levelGroup,
    adaptLevelName: state.levelName,
    ltCourse: state.ltCourse,
    adaptCourse: state.adaptCourse,
    tagFilter: state.chosenTag,
    roster: state.roster,
  };
  var config = getAxiosCall("/data", data, state);
  return config;
}

export function getAllStudentsConfig(state, setState) {
  var data = {
    courseId: state.courseId,
    ltCourse: state.ltCourse,
  };
  var config = getAxiosCall("/allstudents", data, state);
  return config;
}

export function getAllPagesConfig(state, setState, type) {
  var group = "";
  if (type === "student") {
    group = "$actor.id";
  } else if (type === "page") {
    group = "$object.id";
  }
  var data = {
    course: state.course,
    courseId: state.courseId,
    groupBy: group,
    path: state.dataPath,
    tagFilter: state.chosenTag,
  };
  var config = getAxiosCall("/timelineData", data, state);
  return config;
}

export function getStudentChartConfig(state, setState) {
  var data = {
    course: state.course,
    courseId: state.courseId,
    groupBy: state.barXAxis,
    startDate: state.start,
    endDate: state.end,
    path: state.dataPath,
    hasAdapt: state.hasAdapt,
    adaptAxisValue: state.adaptStudentChartVal,
    tagFilter: state.chosenTag,
  };

  var config = getAxiosCall("/studentchart", data, state);
  return config;
}

export function getPageViewConfig(state, setState) {
  var data = {
    bin: state.bin,
    unit: state.unit,
    course: state.course,
    courseId: state.courseId,
    startDate: state.start,
    endDate: state.end,
    path: state.dataPath,
    tagFilter: state.chosenTag,
  };

  var config = getAxiosCall("/pageviews", data, state);
  return config;
}

export function getAveragePageViewsConfig(state, setState) {
  var data = {
    bin: state.bin,
    unit: state.unit,
    course: state.course,
    courseId: state.courseId,
    start: state.start,
    end: state.end,
    path: state.dataPath,
    tagFilter: state.chosenTag,
  };

  var config = getAxiosCall("/averagepageviews", data, state);
  return config;
}

//used for getting views on a single page and on a single assignment, depending on what chart it's called for
export function getIndividualPageViewsConfig(state, setState) {
  var lgroup = null;
  var lname = null;
  var p = null;
  if (state.tab === "page") {
    p = state.page;
  } else if (state.tab === "assignment") {
    lgroup = state.levelGroup;
    lname = state.levelName;
  }

  var data = {
    bin: state.bin,
    unit: state.unit,
    courseId: state.courseId,
    start: state.start,
    end: state.end,
    path: state.dataPath,
    individual: p,
    levelGroup: lgroup,
    levelName: lname,
    tagFilter: state.chosenTag,
  };
  var config = getAxiosCall("/individualpageviews", data, state);
  return config;
}
