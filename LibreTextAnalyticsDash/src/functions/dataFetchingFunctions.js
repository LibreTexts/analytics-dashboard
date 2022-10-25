//functions called on click of a button to set state and call the function that will get the necessary data
import {
  getData,
  simpleConfigTemplate,
  getAllDataConfig,
  getAllStudentsConfig,
  getAllPagesConfig,
  getStudentChartConfig,
  getPageViewConfig,
  getAssignmentSubmissionsConfig,
  getConfig,
  getMetaTags,
} from "./dataQueries.js";
import { handleChapterChart } from "./dataHandlingFunctions.js";
import { writeToLocalStorage } from "./helperFunctions.js";
import axios from "axios";

//called when the user hits apply, reloads the course, or clears all of the filters
//gets all of the data for the course from mongoDB or localStorage
export async function handleClick(
  state,
  setState,
  type,
  queryVariables,
  path = false,
  isFilter = false
) {
  if (queryVariables) {
    queryVariables.setClick(true);
  }
  //sets state to what it needs to be depending on whether it's a first click or a refresh
  //generally sets the data to null so if the data is not pulled it won't use the data from the last course
  if (state.courseId) {
    var tempState = JSON.parse(JSON.stringify(state));
    //if it isn't applying filters (course apply, filter or course reset)
    if (!isFilter) {
      if (type === "filterReset") {
        setState({
          ...tempState,
          disableFilterReset: true,
        });
      }
      tempState = {
        ...tempState,
        studentData: null,
        pageData: null,
        showTableFilters: false,
        showInfoBox: false,
        hasAdapt: false,
        studentResult: null,
        pageResult: null,
        student: null,
        studentForChapterChart: null,
        page: null,
        individualPageViews: null,
        adaptLevels: null,
        allChapters: null,
        chosenPath: null,
        dataPath: null,
        disableCourse: true,
        individualAssignmentViews: null,
        allAdaptAssignments: null,
        gradesPageView: null,
        gradeLevelGroup: null,
        gradeLevelName: null,
        disablePage: true,
        disableStudent: true,
        disableAssignment: true,
        disableStudentTextbookEngagement: true,
        disableChapterChart: true,
        index: 0,
        tab: "student",
        levelGroup: null,
        levelName: null,
        studentAssignments: null,
        studentTab: true,
        pageTab: false,
        assignmentTab: false,
        filterTab: false,
        reset: false,
        barXAxis: "dateCount",
        barXAxisLabel: state.ltCourse
          ? "LT Unique Interaction Days"
          : "ADAPT Unique Interaction Days",
        adaptStudentChartVal: state.ltCourse ? false : true,
        studentChart: null,
        aggregateChapterData: null,
        individualChapterData: null,
        textbookEngagementData: null,
        averagePageViews: null,
        tagData: type === "refresh" ? state.tagData : null,
        allPageIds: null,
        studentForTextbookEngagement: null,
        chosenTag: null,
        disableCourseStructureButton: false,
        individualAssignmentSubmissions: null
      };
      if (type === "filterReset") {
        if (state.environment === "development") {
          tempState = {
            ...tempState,
            start: null,
            end: null,
          };
        }
      }
    } else {
      tempState = {
        ...tempState,
        openFilter: false,
        showTableFilters: false,
        resetPath: false,
        disable: true,
        display: false,
        studentResult: null,
        pageResult: null,
        student: null,
        page: null,
        individualPageViews: null,
        disableCourseStructureButton: true,
        disablePage: true,
        disableStudent: true,
        disableAssignment: true,
        disableStudentTextbookEngagement: true,
        studentForChapterChart: null,
        individualChapterData: null,
        textbookEngagementData: null,
        studentAssignments: null,
        rosterFilterApplied: state.rosterFile ? true : false,
      };
      if (path) {
        tempState["chosenPath"] = JSON.stringify(path);
      }
    }

    setState(tempState);
    var courseData = {};
    if (Object.keys(localStorage).includes(state.courseId + "-table")) {
      courseData = JSON.parse(localStorage.getItem(state.courseId + "-table"));
    }
    var dropdownData = {};
    if (Object.keys(localStorage).includes(state.courseId + "-dropdown")) {
      dropdownData = JSON.parse(
        localStorage.getItem(state.courseId + "-dropdown")
      );
    }
    var tagData = Object.keys(dropdownData).includes("tagData")
      ? dropdownData["tagData"]
      : null;

    // Either get the data from local storage, or new request to server
    // A new request if:
    // - no stored data on selected course
    // - user hit refresh in header or reset button in filters
    //
    // Otherwise pull course data from local storage
    if (
      !courseData ||
      Object.keys(courseData).length < 1 ||
      !Object.keys(courseData).includes("studentData") ||
      type === "refresh" ||
      isFilter ||
      type === "filterReset"
    ) {
      var configs = []; // holds a bundle of requests to be run by getData
      configs.push(getAllDataConfig(tempState, setState, "student"));
      if (state.ltCourse) {
        configs.push(getAllDataConfig(tempState, setState, "page"));
        configs.push(getAllPagesConfig(tempState, setState, "page"));
        configs.push(simpleConfigTemplate(tempState, setState, "/pagelookup"));
        configs.push(
          simpleConfigTemplate(tempState, setState, "/aggregatechapterdata")
        );
        configs.push(
          simpleConfigTemplate(tempState, setState, "/coursestructure")
        );
        configs.push(
          getPageViewConfig(tempState, setState, state.bin, state.unit)
        );
      }
      if (state.adaptCourse) {
        configs.push(
          simpleConfigTemplate(tempState, setState, "/alladaptassignments")
        );
        configs.push(simpleConfigTemplate(tempState, setState, "/adaptlevels"));
        configs.push(
          getAssignmentSubmissionsConfig(
            tempState,
            setState,
            state.bin,
            state.unit
          )
        );
        configs.push(
          simpleConfigTemplate(tempState, setState, "/allassignmentgrades")
        );
      }
      configs.push(getStudentChartConfig(tempState, setState));
      var hasRoster = false;
      if (!state.roster) {
        configs.push(getAllStudentsConfig(tempState, setState));
      } else {
        tempState["allStudents"] = state.roster;
        hasRoster = true;
      }
      tempState = await getData(
        configs,
        tempState,
        setState,
        path,
        tagData,
        hasRoster
      );
      if (
        (type === "filterReset" || type === "courseId") &&
        !(state.adaptCourse && !state.ltCourse)
      ) {
        getMetaTags(tempState, setState);
      }
      if (type === "filterReset") {
        localStorage.setItem(state.courseId + "-filters", JSON.stringify({}));
      }
    } else {
      getDataFromLocalStorage(state.courseId + "-table", tempState);
      getDataFromLocalStorage(state.courseId + "-chart", tempState);
      getDataFromLocalStorage(state.courseId + "-dropdown", tempState);
      getDataFromLocalStorage(state.courseId + "-filters", tempState);
      tempState["rosterFilterApplied"] = tempState.rosterFile ? true : false;
      setState({
        ...tempState,
      });
    }
  } else {
    alert("Please choose a course.");
  }
}

function getDataFromLocalStorage(course, tempState) {
  var courseData = JSON.parse(localStorage.getItem(course));
  var allKeys = Object.keys(courseData);
  allKeys.forEach((key) => {
    tempState[key] = courseData[key];
  });
}

export function getFilteredChartData(
  state,
  setState,
  key,
  aggregateFunction,
  individualFunction,
  isConfig,
  individual,
  path,
  payloadAttributes,
  individualPath,
  individualPayloadAttributes,
  bin = null,
  unit = null
) {
  var tempState = JSON.parse(JSON.stringify(state));
  var request1 = axios(getConfig(tempState, path, payloadAttributes));
  var requests = [request1];
  if (individual) {
    var request2 = axios(getConfig(tempState, individualPath, individualPayloadAttributes));
    requests.push(request2);
  }
  axios
    .all(requests)
    .then(
      axios.spread((...responses) => {
        const responseOne = JSON.parse(responses[0].data);
        var val1 = Object.values(responseOne)[0];
        tempState[key] = val1;
        if (individual) {
          const responseTwo = JSON.parse(responses[1].data);
          var key2 = Object.keys(responseTwo)[0];
          var val2 = Object.values(responseTwo)[0];
          tempState[key2] = val2;
        }
        setState({
          ...tempState,
        });
      })
    )
    .catch((errors) => {
      console.log(errors);
    });
}

//gets the data for an individual student, page, or assignment
export function getIndividualData(state, setState, pathsWithAttributes, disable, individual, type) {
  var temp = JSON.parse(JSON.stringify(state));
  temp[disable] = true;
  setState({
    ...temp,
  });
  var courseData = JSON.parse(localStorage.getItem(state.courseId + "-chart"));
  var tempState = JSON.parse(JSON.stringify(state));
  if (!Object.keys(courseData).includes(individual)) {
    var requests = [];
    Object.keys(pathsWithAttributes).forEach(path => {
      requests.push(axios(getConfig(state, path, pathsWithAttributes[path])))
    })
    axios
      .all(requests)
      .then(
        axios.spread((...responses) => {
          var d = {};
          responses.forEach((response, index) => {
            var data = JSON.parse(response.data);
            var key = Object.keys(data)[0];
            var value = Object.values(data)[0];
            if (type === "studentForChapterChart") {
              tempState[key] = value;
              handleChapterChart(value, tempState, courseData, {}, "individualChapterData", true);
            } else {
              tempState[key] = value;
              d[key] = value;
            }
          })
          // temporarily stop writing individual chart data to localstorage
          // - queries are fast and you have to store multiple to account for filtering
          // courseData[individual] = d;
          // writeToLocalStorage(state.courseId + "-chart", courseData);
          tempState[disable] = true
          setState({
            ...tempState,
          });
        })
      )
      .catch((errors) => {
        console.log(errors);
      });
  } else {
    var data = courseData[individual];
    Object.keys(data).forEach((key) => {
      tempState[key] = data[key];
    });
    tempState[disable] = true;
    setState({
      ...tempState,
    });
  }
}
