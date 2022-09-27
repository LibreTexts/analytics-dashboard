//functions called on click of a button to set state and call the function that will get the necessary data
import {
  getStudentAssignments,
  getGradesPageViewData,
} from "./adaptDataQueries.js";
import {
  getData,
  simpleConfigTemplate,
  getAllDataConfig,
  getAllStudentsConfig,
  getAllPagesConfig,
  getStudentChartConfig,
  getPageViewConfig,
} from "./ltDataQueries.js";
import {
  getPageViewData,
  getIndividualPageViewData,
  getMetaTags,
  getStudentTextbookEngagementData,
} from "./ltDataQueries-individual.js";

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
        configs.push(
          simpleConfigTemplate(tempState, setState, "/aggregatechapterdata")
        );
        configs.push(
          simpleConfigTemplate(tempState, setState, "/coursestructure")
        );
        configs.push(getPageViewConfig(tempState, setState));
      }
      if (state.adaptCourse) {
        configs.push(
          simpleConfigTemplate(tempState, setState, "/alladaptassignments")
        );
        configs.push(simpleConfigTemplate(tempState, setState, "/adaptlevels"));
        configs.push(
          simpleConfigTemplate(tempState, setState, "/aggregateassignmentviews")
        );
        configs.push(
          simpleConfigTemplate(tempState, setState, "/allassignmentgrades")
        );
      }
      configs.push(getStudentChartConfig(tempState, setState));
      configs.push(getAllStudentsConfig(tempState, setState));
      tempState = await getData(configs, tempState, setState, path, tagData);
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

//gets the data for all charts on the student tab for an individual student
export function getAllStudentData(state, setState, type) {
  setState({
    ...state,
    disableStudent: true,
  });
  var tempState = JSON.parse(JSON.stringify(state));
  tempState = handleIndividual(tempState, setState, type);
  getStudentTextbookEngagementData(tempState, setState);
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
