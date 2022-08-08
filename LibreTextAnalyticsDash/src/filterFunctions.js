import React from "react";
import {
  getAggregateData,
  getObjectList,
  getStudentChartData,
  getPageViewData,
  getIndividualPageViewData,
  getChapters,
  getTagInfo,
  getData,
  getAllDataQuery,
  getObjects,
  studentChartQuery,
  pageViewQuery,
  individualPageViews,
  adaptLevels,
  courseStructureDropdown,
  adaptStudentsQuery,
  allStudentsQuery,
  allAssignmentsChartQuery
} from "./ltDataQueries.js";
import {
  getAdaptLevels,
  getAdaptData,
  getStudentAssignments,
  getGradesPageViewData,
} from "./adaptDataQueries.js";

const FunctionContext = React.createContext();

export function writeToLocalStorage(course, courseData) {
  //check if the user allows local storage use
  var localStorage;
  var success = true;
  try {
    localStorage = window.localStorage;
  } catch (e) {
    console.log(e);
    success = false;
    //do everything without using local storage
  } finally {
    if (success) {
      try {
        localStorage.setItem(course, JSON.stringify(courseData));
      } catch (err) {
        console.log(err.name);
        if (err.name === "QUOTA_EXCEEDED_ERR") {
          console.log(err.name);
        } else {
          console.log("here");
        }
      }
      return true;
    } else {
      return success;
    }
  }
}

export function generateHeaders(type) {
  var headers = [];
  return headers;
}

export function getAllStudents(state) {
  var students = [];
  if (state.displayMode) {
    students = state.encryptedStudents;
  } else {
    students = state.allStudents;
  }
  return students;
}

export function reactGrids(state) {
  var grids = [
    { name: "table", start: [0, 0], end: [1, 0] },
    { name: "timeline", start: [0, 1], end: [1, 1] },
  ];
  if (state.ltCourse) {
    grids.forEach((g) => {
      if (g.name === "timeline") {
        g.start = [0, 2];
        g.end = [1, 2];
      }
    });
    grids.splice(1, 0, { name: "plots", start: [0, 1], end: [1, 1] });
  }
  return grids;
}

export function reactRows(state) {
  var rows = ["2/3", "2/3"];
  if (state.ltCourse) {
    rows.push("1/3");
  }
  return rows;
}

export function sortData(option, state, setState, type, data) {
  //setState({...state, individualAssignmentSortLabel: option})

  if (option === "Alphabetically") {
    data = data.sort((a, b) => {
      return ("" + a._id).localeCompare(b._id);
    });
    setState({
      ...state,
      individualAssignmentSortLabel: option,
      allAdaptAssignments: data,
    });
  } else if (option === "By Due Date") {
    data = data.sort((a, b) => {
      return new Date(a.due) - new Date(b.due);
    });
    setState({
      ...state,
      individualAssignmentSortLabel: option,
      allAdaptAssignments: data,
    });
  }
}

export async function handleClick(state, setState, type, queryVariables) {
  if (queryVariables) {
    queryVariables.setClick(true);
  }
  if (state.courseId) {
    var tempState = JSON.parse(JSON.stringify(state));
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
      hasAdapt: false,
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
      barXAxisLabel: "LT Unique Interaction Days",
      adaptStudentChartVal: false,
      studentChart: null,
    };

    setState(tempState);
    var courseData = {};
    if (Object.keys(localStorage).includes(state.courseId)) {
      var courseData = JSON.parse(localStorage.getItem(state.courseId));
    }
    if (
      !courseData ||
      Object.keys(courseData).length < 1 ||
      !Object.keys(courseData).includes("studentData") ||
      type === "refresh"
    ) {
      var configs = [];
      configs.push(getAllDataQuery(tempState, setState, "student"));
      if (state.ltCourse) {
        configs.push(getAllDataQuery(tempState, setState, "page"));
        configs.push(getObjects(tempState, setState, "page"));
        configs.push(studentChartQuery(tempState, setState));
      }
      if (state.adaptCourse) {
        configs.push(allAssignmentsChartQuery(tempState, setState));
      }
      configs.push(allStudentsQuery(tempState, setState));
      configs.push(pageViewQuery(tempState, setState));
      configs.push(adaptLevels(tempState, setState));
      configs.push(courseStructureDropdown(tempState, setState));
      await getData(configs, tempState, setState);
    } else {
      var courseData = JSON.parse(localStorage.getItem(state.courseId));
      var allKeys = Object.keys(courseData);
      allKeys.forEach((key) => {
        tempState[key] = courseData[key];
      });
      setState({
        ...tempState,
      });
    }
  } else {
    alert("Please choose a course.");
  }
}

export async function handleFilterClick(state, setState, path = false) {
  var tempState = JSON.parse(JSON.stringify(state));
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
  };
  if (path) {
    tempState["chosenPath"] = path;
  }
  setState(tempState);

  var courseData = JSON.parse(localStorage.getItem(state.courseId));

  var configs = [];
  configs.push(getAllDataQuery(tempState, setState, "student"));
  if (state.ltCourse) {
    configs.push(getAllDataQuery(tempState, setState, "page"));
    configs.push(getObjects(tempState, setState, "page"));
  }
  configs.push(studentChartQuery(tempState, setState));
  configs.push(allStudentsQuery(tempState, setState));
  configs.push(pageViewQuery(tempState, setState));
  configs.push(adaptLevels(tempState, setState));
  configs.push(courseStructureDropdown(tempState, setState));
  await getData(configs, tempState, setState);
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

export function changeBarXAxis(option, state, setState) {
  if (option === "LT Unique Interaction Days") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "dateCount",
      adaptStudentChartVal: false,
    });
  } else if (option === "LT Unique Pages Accessed") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "objectCount",
      adaptStudentChartVal: false,
    });
  } else if (option === "LT Most Recent Page Load") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "lastDate",
      adaptStudentChartVal: false,
    });
  } else if (option === "LT Total Hours Studied") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "timeStudied",
      adaptStudentChartVal: false,
    });
  } else if (option === "Adapt Unique Interaction Days") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "dateCount",
      adaptStudentChartVal: true,
    });
  } else if (option === "Adapt Unique Assignments") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "objectCount",
      adaptStudentChartVal: true,
    });
  } else if (option === "Adapt Most Recent Page Load") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "lastDate",
      adaptStudentChartVal: true,
    });
  }
}

export function getStudentChartFilters(state) {
  var filters = [
    "LT Unique Pages Accessed",
    "LT Unique Interaction Days",
    "LT Most Recent Page Load",
    "LT Total Hours Studied"
  ];
  if (state.hasAdapt) {
    filters.push("Adapt Unique Interaction Days");
    filters.push("Adapt Unique Assignments");
    filters.push("Adapt Most Recent Page Load");
    filters.push("Adapt Average Percent Per Assignment");
    filters.push("Adapt Average Attempts Per Assignment");
  }
  return filters;
}

export function changeBinVal(option, state, setState, type) {
  var tempState = JSON.parse(JSON.stringify(state));
  var courseData = JSON.parse(localStorage.getItem(state.courseId));
  var bin = "bin";
  var binLabel = "binLabel";
  var unit = "unit";

  if (type === "individualPageViews") {
    bin = "individualPageBin";
    binLabel = "individualPageBinLabel";
    unit = "individualPageUnit";
  } else if (type === "individualAssignmentViews") {
    bin = "individualAssignmentBin";
    binLabel = "individualAssignmentBinLabel";
    unit = "individualAssignmentUnit";
  }
  if (option === "Day") {
    tempState[bin] = 1;
    tempState[binLabel] = option;
    tempState[unit] = "day";
    setState({
      ...tempState,
    });
  } else if (option === "Week") {
    tempState[bin] = 1;
    tempState[binLabel] = option;
    tempState[unit] = "week";
    setState({
      ...tempState,
    });
  } else if (option === "2 Weeks") {
    tempState[bin] = 2;
    tempState[binLabel] = option;
    tempState[unit] = "week";
    setState({
      ...tempState,
    });
  } else if (option === "Month") {
    tempState[bin] = 1;
    tempState[binLabel] = option;
    tempState[unit] = "month";
    setState({
      ...tempState,
    });
  }
  courseData[bin] = tempState[bin];
  courseData[binLabel] = tempState[binLabel];
  courseData[unit] = tempState[unit];
  localStorage.setItem(state.courseId, JSON.stringify(courseData));
}

export function handleChange(
  type,
  value,
  state,
  setState,
  realCourses,
  queryVariables
) {
  console.log("handleChange", state);
  var courseData = JSON.parse(localStorage.getItem(state.courseId));
  if (type === "start") {
    if (state.startDate && (value < state.startDate || value > state.endDate)) {
      alert(
        "Please choose a date inside the duration of the course: " +
          state.startDate.split("T")[0] +
          " to " +
          state.endDate.split("T")[0]
      );
    } else {
      setState({
        ...state,
        start: value,
        disable: false,
      });
      courseData["start"] = value;
      courseData["filters"].push({ start: value });
      courseData["disable"] = false;
      localStorage.setItem(state.courseId, JSON.stringify(courseData));
    }
  }
  if (type === "end") {
    if (state.endDate && (value > state.endDate || value < state.startDate)) {
      alert(
        "Please choose a date inside the duration of the course: " +
          state.startDate.split("T")[0] +
          " to " +
          state.endDate.split("T")[0]
      );
    } else {
      setState({
        ...state,
        end: value,
        disable: false,
      });
    }
  }
  if (type === "courseId") {
    // console.log(state.disableCourse)
    // console.log(new Date(realCourses[value].startDate))
    setState({
      ...state,
      page: null,
      student: null,
      disablePage: false,
      courseName: value,
      courseId: realCourses[value].courseId,
      course: value,
      disableCourse: false,
      chosenPath: null,
      dataPath: null,
      start: realCourses[value].startDate
        ? new Date(realCourses[value].startDate)
        : null,
      end: realCourses[value].endDate
        ? new Date(realCourses[value].endDate)
        : null,
      startDate: realCourses[value].startDate
        ? new Date(realCourses[value].startDate)
        : null,
      endDate: realCourses[value].endDate
        ? new Date(realCourses[value].endDate)
        : null,
      ltCourse: realCourses[value].ltCourse,
      adaptCourse: realCourses[value].adaptCourse,
      hasAdapt: realCourses[value].adaptCourse,
      index: 0,
      tab: "student",
      studentTab: true,
      pageTab: false,
      assignmentTab: false,
      filterTab: false,
    });
    queryVariables.setClick(false);
  }
  if (type === "student") {
    setState({
      ...state,
      student: value,
    });
  }
  if (type === "studentAssignments") {
    setState({
      ...state,
      student: value,
      disableStudent: false,
    });
  }
  if (type === "page") {
    var temp = state.pageData.find((id) => id.pageTitle === value);
    if (temp) {
      var pageId = temp._id;
      setState({
        ...state,
        page: value,
        pageId: pageId,
        disablePage: false,
        noChartData: false
      })
    } else {
      setState({
        ...state,
        page: null,
        pageId: pageId,
        disablePage: false,
        noChartData: true
      })
    }
    // var temp = state.pageData.find((id) => id.pageTitle === value);
    // var pageId = temp._id;
    // setState({
    //   ...state,
    //   page: value,
    //   pageId: pageId,
    //   disablePage: false,
    // });
  } else if (type === "pageLevelGroup") {
    setState({
      ...state,
      levelGroup: value,
      levelName: null,
    });
  } else if (type === "pageLevelName") {
    setState({
      ...state,
      //individualAssignmentViews: null,
      levelName: value,
      disableAssignment: false,
    });
  } else if (type === "gradesPageLevelGroup") {
    setState({
      ...state,
      gradeLevelGroup: value,
      gradeLevelName: null,
    });
  } else if (type === "gradesPageLevelName") {
    setState({
      ...state,
      //gradesPageView: null,
      gradeLevelName: value,
      disableGradesAssignment: false,
    });
  }

  if (type === "chapter") {
    setState({
      ...state,
      disable: false,
    });
  }
  if (type === "path") {
    setState({
      ...state,
      dataPath: value,
    });
  }
  return (
    <FunctionContext.Provider
      value={{
        store: state,
      }}
    />
  );
}

export function clearDates(state, setState) {
  setState({
    ...state,
    start: null,
    end: null,
    disable: false,
  });
}

export function menuCollapsible(state, setState) {
  setState({
    ...state,
    openFilter: !state.openFilter,
  });
}

export function clearPath(event, state, setState) {
  setState({
    ...state,
    chosenPath: null,
    dataPath: null,
    resetPath: true,
  });
}

export function filterReset(state, setState) {
  setState({
    ...state,
    reset: true,
    chosenPath: null,
    dataPath: null,
    start: null,
    end: null,
  });
}

export async function applyReset(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  setState({
    ...state,
    openFilter: false,
    disableCourse: true,
    studentResult: null,
    pageResult: null,
    student: null,
    page: null,
  });
  var configs = [];
  configs.push(getAllDataQuery(tempState, setState, "student"));
  if (state.ltCourse) {
    configs.push(getAllDataQuery(tempState, setState, "page"));
    configs.push(getObjects(tempState, setState, "page"));
    configs.push(studentChartQuery(tempState, setState));
  }
  configs.push(allStudentsQuery(tempState, setState));
  configs.push(pageViewQuery(tempState, setState));
  configs.push(adaptLevels(tempState, setState));
  configs.push(courseStructureDropdown(tempState, setState));
  await getData(configs, tempState, setState);
  setState({
    ...tempState,
    reset: false,
  });
}

export function changeColumns(event, label, state, setState) {
  var columns = JSON.parse(JSON.stringify(state.tableColumns));
  var checked = JSON.parse(JSON.stringify(state.checkedValues));
  if (label === "All" && columns[label]) {
    columns[label] = false;
    checked.find((v, index) => {
      if (v === label) {
        checked.splice(index, 1);
      }
    });
  } else if (label === "All" && !columns[label]) {
    Object.keys(columns).forEach((v) => {
      columns[v] = true;
    });
    checked = Object.keys(columns);
  } else {
    if (columns[label]) {
      columns[label] = false;
      columns["All"] = false;
    } else {
      columns[label] = true;
    }
    if (checked.includes(label)) {
      checked.find((v, index) => {
        if (v === label) {
          checked.splice(index, 1);
        }
      });
      checked.find((v, index) => {
        if (v === "All") {
          checked.splice(index, 1);
        }
      });
    } else {
      checked.push(label);
    }
  }
  setState({
    ...state,
    checkedValues: checked,
    tableColumns: columns,
  });
}

export function changeActivityFilter(option, data, state, setState) {
  setState({
    ...state,
    activityFilter: option,
  });
  // if (option === "No Recent LibreText Activity") {
  //   setActivityFilter(option)
  //   // data.sort((a, b) => {
  //   //   return a - b
  //   // })
  // } else if (option === "No Recent Adapt Activity") {
  //
  // } else if (option === "Low Adapt Performance") {
  //
  // }
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

export function changePropValue(state, setState, prop, option) {
  let tempState = JSON.parse(JSON.stringify(state));
  tempState[prop] = option;
  setState({
    ...tempState,
  });
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
