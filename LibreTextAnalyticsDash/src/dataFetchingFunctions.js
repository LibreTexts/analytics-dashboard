import {
  getData,
  simpleConfigTemplate,
  getAllDataConfig,
  getAllStudentsConfig,
  getAllPagesConfig,
  getStudentChartConfig,
  getPageViewConfig,
  getAveragePageViewsConfig
} from "./ltDataQueries.js";
import {
  getPageViewData,
  getIndividualPageViewData,
  getMetaTags
} from "./ltDataQueries-individual.js";
import {
  getStudentAssignments,
  getGradesPageViewData,
} from "./adaptDataQueries.js";

export async function handleClick(state, setState, type, queryVariables, path = false, isFilter = false) {
  if (queryVariables) {
    queryVariables.setClick(true);
  }

  if (state.courseId) {
    var tempState = JSON.parse(JSON.stringify(state));
    if (!isFilter) {
      if (type === "filterReset") {
        setState({
          ...tempState,
          disableFilterReset: true
        })
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
        disableGradesAssignment: false,
        index: 0,
        tab: "student",
        levelGroup: null,
        levelName: null,
        disableAssignment: false,
        studentAssignments: null,
        disableStudent: false,
        studentTab: true,
        pageTab: false,
        assignmentTab: false,
        filterTab: false,
        reset: false,
        barXAxis: "dateCount",
        barXAxisLabel: state.ltCourse ? "LT Unique Interaction Days" : "Adapt Unique Interaction Days",
        adaptStudentChartVal: state.ltCourse ? false : true,
        studentChart: null,
        aggregateChapterData: null,
        individualChapterData: null,
        textbookEngagementData: null,
        averagePageViews: null,
        tagData: null,
        allPageIds: null,
        studentForTextbookEngagement: null,
        chosenTag: null,
        disableCourseStructureButton: false
      };
      if (type === "filterReset") {
        tempState = {
          ...tempState,
          start: null,
          end: null
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
        disablePage: false,
        individualPageViews: null,
        disableCourseStructureButton: true
      };
      if (path) {
        tempState["chosenPath"] = path;
      }
    }

    setState(tempState);
    var courseData = {};
    if (Object.keys(localStorage).includes(state.courseId+"-table")) {
      courseData = JSON.parse(localStorage.getItem(state.courseId+"-table"));
    }
    var dropdownData = {};
    if (Object.keys(localStorage).includes(state.courseId+"-dropdown")) {
      dropdownData = JSON.parse(localStorage.getItem(state.courseId+"-dropdown"));
    }
    var tagData = Object.keys(dropdownData).includes('tagData') ? dropdownData['tagData'] : null;

    if (
      !courseData ||
      Object.keys(courseData).length < 1 ||
      !Object.keys(courseData).includes("studentData") ||
      type === "refresh" || isFilter || type === "filterReset"
    ) {
      var configs = [];
      configs.push(getAllDataConfig(tempState, setState, "student"));
      if (state.ltCourse) {
        configs.push(getAllDataConfig(tempState, setState, "page"));
        configs.push(getAllPagesConfig(tempState, setState, "page"));
        //configs.push(getChapterChartConfig(tempState, setState));
        configs.push(simpleConfigTemplate(tempState, setState, "/aggregatechapterdata"));
        configs.push(simpleConfigTemplate(tempState, setState, "/coursestructure"));
        configs.push(getPageViewConfig(tempState, setState));
        //configs.push(getAveragePageViewsConfig(tempState, setState));
      }
      if (state.adaptCourse) {
        configs.push(simpleConfigTemplate(tempState, setState, "/alladaptassignments"));
        configs.push(simpleConfigTemplate(tempState, setState, "/adaptlevels"));
      }
      configs.push(getStudentChartConfig(tempState, setState));
      configs.push(getAllStudentsConfig(tempState, setState));
      tempState = await getData(configs, tempState, setState, path, tagData);
      console.log(type, state.adaptCourse, state.ltCourse, !(state.adaptCourse && !state.ltCourse))
      if ((type === "filterReset" || type === "courseId") && !(state.adaptCourse && !state.ltCourse)) {
        getMetaTags(tempState, setState)
      }
      if (type === "filterReset") {
        localStorage.setItem(state.courseId+"-filters", JSON.stringify({}));
      }
    } else {
      getDataFromLocalStorage(state.courseId+"-table", tempState);
      getDataFromLocalStorage(state.courseId+"-chart", tempState);
      getDataFromLocalStorage(state.courseId+"-dropdown", tempState);
      getDataFromLocalStorage(state.courseId+"-filters", tempState);
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

export function handleIndividual(state, setState, type) {
  var tempState = JSON.parse(JSON.stringify(state))
  tempState["noChartData"] = false
  if (state.tab === "student") {
    if (!state.student) {
      alert("Please choose a student.");
    } else {
      tempState["studentAssignments"] = null;
      tempState["disableStudent"] = true;
      //setState(tempState)
    }
  } else if (state.tab === "page") {
    tempState["individualPageViews"] = null;
    tempState["disablePage"] = true;
    //setState(tempState)
  } else if (state.tab === "assignment") {
    tempState["individualAssignmentViews"] = null;
    tempState["disableAssignment"] = true;
    //setState(tempState)
  }
  if (type === "studentAssignments") {
    getStudentAssignments(tempState, setState);
  } else {
    getIndividualPageViewData(tempState, setState);
  }
}

export function pageViewCharts(state, setState, type) {
  setState({
    ...state,
    gridHeight: "large",
  });
  if (type === "aggregatePageViews") {
    getPageViewData(state, setState);
  } else if (type === "individualPageViews") {
    getIndividualPageViewData(state, setState);
  }
}

// 7/15 Robert
export function handleGrade(state, setState, type) {
  let tempState = JSON.parse(JSON.stringify(state));
  tempState["disableGradesAssignment"] = true;
  setState({
    ...tempState,
  });
  getGradesPageViewData(tempState, setState);
}
