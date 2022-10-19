//functions called on click of a button to set state and call the function that will get the necessary data
import {
  getStudentAssignments,
  getGradesPageViewData,
  getIndividualAssignmentSubmissions,
} from "./adaptDataQueries.js";
import {
  getData,
  simpleConfigTemplate,
  getAllDataConfig,
  getAllStudentsConfig,
  getAllPagesConfig,
  getStudentChartConfig,
  getPageViewConfig,
  getAssignmentSubmissionsConfig,
} from "./ltDataQueries.js";
import {
  getPageViewData,
  getIndividualPageViewData,
  getMetaTags,
  getStudentTextbookEngagementData,
} from "./ltDataQueries-individual.js";
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
  console.log("handle click function", state.courseId)
  //sets state to what it needs to be depending on whether it's a first click or a refresh
  //generally sets the data to null so if the data is not pulled it won't use the data from the last course
  if (state.courseId) {
    console.log("here")
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
        disableGradesAssignment: true,
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
      };
      if (type === "filterReset") {
        tempState = {
          ...tempState,
          start: null,
          end: null,
        };
      }
    } else {
      console.log("here instead")
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
        disableGradesAssignment: true,
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
    console.log("here")
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
      console.log("getting data")
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
        tempState['allStudents'] = state.roster;
        hasRoster = true;
      }
      tempState = await getData(configs, tempState, setState, path, tagData, hasRoster);
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
      console.log("pulling from local storage")
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
  console.log("reached the end of the function 2")
}

function getDataFromLocalStorage(course, tempState) {
  var courseData = JSON.parse(localStorage.getItem(course));
  var allKeys = Object.keys(courseData);
  allKeys.forEach((key) => {
    tempState[key] = courseData[key];
  });
}

// rerenders chart data for
// (Page) Aggregate Page Views Chart: on selecting a page
// (ADAPT) Single Assignment Views Over Time: on selecting a assignment
export function handleIndividual(state, setState, type) {
  var tempState = JSON.parse(JSON.stringify(state));
  tempState["noChartData"] = false;
  if (state.tab === "student") {
    if (!state.student) {
      alert("Please choose a student.");
    } else {
      tempState["studentAssignments"] = null;
      tempState["disableStudent"] = true;
    }
  } else if (state.tab === "page") {
    tempState["individualPageViews"] = null;
    tempState["disablePage"] = true;
  } else if (state.tab === "assignment") {
    tempState["individualAssignmentViews"] = null;
    tempState["disableAssignment"] = true;
  }
  if (type === "studentAssignments") {
    tempState = getStudentAssignments(tempState, setState);
    return tempState;
  } else {
    getIndividualPageViewData(tempState, setState);
  }
}

//get data for the page view charts
export function pageViewCharts(state, setState, type) {
  setState({
    ...state,
    gridHeight: "large",
  });
  //get aggregate data unless type is individual
  if (type === "aggregatePageViews" || type === "textbookEngagement") {
    getPageViewData(state, setState);
  } else if (type === "individualPageViews") {
    getIndividualPageViewData(state, setState);
  }
}

export function getFilteredChartData(
  state,
  setState,
  key,
  aggregateFunction,
  individualFunction,
  isConfig,
  individual,
  bin = null,
  unit = null
) {
  var tempState = JSON.parse(JSON.stringify(state));
  if (isConfig) {
    var request1 = axios(aggregateFunction(tempState, setState, bin, unit));
  } else {
    request1 = aggregateFunction(tempState, setState, bin, unit);
  }
  var requests = [request1];
  if (individual) {
    var request2 = individualFunction(tempState, setState);
    requests.push(request2);
  }
  axios
    .all(requests)
    .then(
      axios.spread((...responses) => {
        const responseOne = JSON.parse(responses[0].data);
        var key1 = Object.keys(responseOne)[0];
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

//gets the data for all charts on the student tab for an individual student
export function getIndividualStudentData(state, setState, type) {
  setState({
    ...state,
    disableStudent: true,
  });
  var courseData = JSON.parse(localStorage.getItem(state.courseId + "-chart"));
  var tempState = JSON.parse(JSON.stringify(state));
  if (!Object.keys(courseData).includes(state.student)) {
    var request1 = getStudentAssignments(tempState, setState);
    var request2 = getStudentTextbookEngagementData(tempState, setState);
    var request3 = getIndividualAssignmentSubmissions(
      tempState,
      setState,
      false
    );
    axios
      .all([request1, request2, request3])
      .then(
        axios.spread((...responses) => {
          const responseOne = JSON.parse(responses[0].data);
          const responseTwo = JSON.parse(responses[1].data);
          const responseThree = JSON.parse(responses[2].data);
          var key1 = Object.keys(responseOne)[0];
          var val1 = Object.values(responseOne)[0];
          var key2 = Object.keys(responseTwo)[0];
          var val2 = Object.values(responseTwo)[0];
          var key3 = Object.keys(responseThree)[0];
          var val3 = Object.values(responseThree)[0];

          tempState[key1] = val1;
          tempState[key2] = val2;
          tempState[key3] = val3;
          var d = {};
          d[key1] = val1;
          d[key2] = val2;
          d[key3] = val3;
          courseData[state.student] = d;
          writeToLocalStorage(state.courseId + "-chart", courseData);
          setState({
            ...tempState,
            disableStudent: true,
          });
        })
      )
      .catch((errors) => {
        console.log(errors);
      });
  } else {
    var data = courseData[state.student];
    Object.keys(data).forEach((key) => {
      tempState[key] = data[key];
    });
    setState({
      ...tempState,
      disableStudent: true,
    });
  }
}

//gets the grades data for an individual assignment
export function handleGrade(state, setState, type) {
  let tempState = JSON.parse(JSON.stringify(state));
  tempState["disableGradesAssignment"] = true;
  setState({
    ...tempState,
  });
  getGradesPageViewData(tempState, setState);
}
