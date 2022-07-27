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
  allStudentsQuery
} from "./ltDataQueries.js";
import {
  getAdaptLevels,
  getAdaptData,
  getStudentAssignments,
  getGradesPageViewData
} from "./adaptDataQueries.js";

const FunctionContext = React.createContext();

export function getAllStudents(state) {
  var students = [];
  if (state.displayMode) {
    students =  state.encryptedStudents;
  } else {
    students = state.allStudents;
  }
  return students;
}

export function reactGrids(state) {
  var grids = [
    { name: "table", start: [0, 0], end: [1, 0] },
    { name: "timeline", start: [0, 1], end: [1, 1] }
  ]
  if (state.ltCourse) {
    grids.forEach(g => {
      if (g.name === "timeline") {
        g.start = [0, 2]
        g.end = [1, 2]
      }
    })
    grids.splice(1, 0, { name: "plots", start: [0, 1], end: [1, 1] })
  }
  return grids;
}

export function reactRows(state) {
  var rows = ["2/3", "2/3"]
  if (state.ltCourse) {
    rows.push("1/3")
  }
  return rows;
}

export function sortData(option, state, setState, type, data) {
  //setState({...state, individualAssignmentSortLabel: option})

  if (option === "Alphabetically") {
    data = data.sort((a, b) => {
      return (''+a.level_name).localeCompare(b.level_name)
    })
    setState({...state,
      individualAssignmentSortLabel: option,
      studentAssignments:
        data
    })
  } else if (option === "By Due Date") {
    data = data.sort((a, b) => {
      return (new Date(a.due) - new Date(b.due))
    })
    setState({...state,
      individualAssignmentSortLabel: option,
      studentAssignments:
        data
    })
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
      start: null,
      end: null,
      studentTab: true,
      pageTab: false,
      assignmentTab: false,
      filterTab: false,
      reset: false
    }
    setState(tempState)
    var courseData = JSON.parse(localStorage.getItem(state.courseId))
    if ((!courseData || Object.keys(courseData).length < 1) || type === "refresh" ) {
      var configs = []
      configs.push(getAllDataQuery(tempState, setState, "student"))
      //console.log(state)
      if (state.ltCourse) {
        configs.push(getAllDataQuery(tempState, setState, "page"))
        configs.push(getObjects(tempState, setState, "page"))
      }
      configs.push(studentChartQuery(tempState, setState))
      //if (state.ltCourse) {
        configs.push(allStudentsQuery(tempState, setState))
        //configs.push(getObjects(tempState, setState, "student"))
      // } else {
      //   configs.push(adaptStudentsQuery(tempState, setState))
      // }
      configs.push(pageViewQuery(tempState, setState))
      configs.push(adaptLevels(tempState, setState))
      configs.push(courseStructureDropdown(tempState, setState))
      await getData(configs, tempState, setState)
    } else {
      // var allKeys = Object.keys(tempState[state.courseId])
      var courseData = JSON.parse(localStorage.getItem(state.courseId))
      console.log(courseData)
      var allKeys = Object.keys(courseData)
      allKeys.forEach((key) => {
        tempState[key] = courseData[key]
      })
      setState({
        ...tempState
      })
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
    individualPageViews: null
  }
  if (path) {
    tempState["chosenPath"] = path;
  }
  setState(tempState)

  // getAggregateData(state, setState);
  // getPageViewData(state, setState);
  // getStudentChartData(state, setState);
  // getObjectList(state, setState);

  var courseData = JSON.parse(localStorage.getItem(state.courseId))
  //if () {
    var configs = []
    configs.push(getAllDataQuery(tempState, setState, "student"))
    //console.log(state)
    if (state.ltCourse) {
      configs.push(getAllDataQuery(tempState, setState, "page"))
      configs.push(getObjects(tempState, setState, "page"))
    }

    configs.push(studentChartQuery(tempState, setState))
    //if (state.ltCourse) {
      configs.push(allStudentsQuery(tempState, setState))
      //configs.push(getObjects(tempState, setState, "student"))

    // } else {
    //   configs.push(adaptStudentsQuery(tempState, setState))
    // }
    configs.push(pageViewQuery(tempState, setState))
    configs.push(adaptLevels(tempState, setState))
    configs.push(courseStructureDropdown(tempState, setState))
    await getData(configs, tempState, setState)
  // } else {
  //   // var allKeys = Object.keys(tempState[state.courseId])
  //   var courseData = JSON.parse(localStorage.getItem(state.courseId))
  //   console.log(courseData)
  //   var allKeys = Object.keys(courseData)
  //   allKeys.forEach((key) => {
  //     tempState[key] = courseData[key]
  //   })
  //   setState({
  //     ...tempState
  //   })
  // }
}

export function handleIndividual(state, setState, type) {
  var tempState = JSON.parse(JSON.stringify(state))
  if (state.tab === "student") {
    if (!state.student) {
      alert("Please choose a student.");
    } else {
      tempState["studentAssignments"] = null
      tempState["disableStudent"] = true
      //setState(tempState)
    }
  } else if (state.tab === "page") {
    tempState["individualPageViews"] = null
    tempState["disablePage"] = true
    //setState(tempState)
  } else if (state.tab === "assignment") {
    tempState["individualAssignmentViews"] = null
    tempState["disableAssignment"] = true
    //setState(tempState)
  }
  if (type === "studentAssignments") {
    getStudentAssignments(tempState, setState)
  } else {
    getIndividualPageViewData(tempState, setState)
  }
}

export function changeBarXAxis(option, state, setState) {
  if (option === "Unique Interaction Days") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "dateCount"
    })
  } else if (option === "Unique Pages Accessed") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "objectCount"
    })
  } else if (option === "Most Recent Page Load") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "lastDate"
    })
  }
}

export function changeBarYAxis(option, state, setState) {
  if (option === "Unique Interaction Days") {
    setState({
      ...state,
      barYAxisLabel: option,
      barYAxis: "dateCount"
    })
  } else if (option === "Unique Pages Accessed") {
    setState({
      ...state,
      barYAxisLabel: option,
      barYAxis: "objectCount"
    })
  } else if (option === "Most Recent Page Load") {
    setState({
      ...state,
      barYAxisLabel: option,
      barYAxis: "lastDate"
    })
  }
}

export function changeBinVal(option, state, setState, type) {
  var tempState = JSON.parse(JSON.stringify(state));
  var courseData = JSON.parse(localStorage.getItem(state.courseId));
  var bin = "bin";
  var binLabel = "binLabel";
  var unit = "unit";

  if (type === "individualPageViews") {
    bin = "individualPageBin"
    binLabel = "individualPageBinLabel"
    unit = "individualPageUnit"
  } else if (type === "individualAssignmentViews") {
    bin = "individualAssignmentBin"
    binLabel = "individualAssignmentBinLabel"
    unit = "individualAssignmentUnit"
  }
  if (option === "Day") {
    tempState[bin] = 1
    tempState[binLabel] = option
    tempState[unit] = "day"
    setState({
      ...tempState
    })
  } else if (option === "Week") {
    tempState[bin] = 1
    tempState[binLabel] = option
    tempState[unit] = "week"
    setState({
      ...tempState
    })
  } else if (option === "2 Weeks") {
    tempState[bin] = 2
    tempState[binLabel] = option
    tempState[unit] = "week"
    setState({
      ...tempState
    })
  } else if (option === "Month") {
    tempState[bin] = 1
    tempState[binLabel] = option
    tempState[unit] = "month"
    setState({
      ...tempState
    })
  }
  courseData[bin] = tempState[bin]
  courseData[binLabel] = tempState[binLabel]
  courseData[unit] = tempState[unit]
  localStorage.setItem(state.courseId, JSON.stringify(courseData))
}

export function filterDates(allDates, date, type) {
  if (date) {
    return date;
  } else if (type === "start" && allDates !== null) {
    allDates = allDates.filter((d) => d !== undefined);
    allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return allDates[0];
  } else if (type === "end" && allDates !== null) {
    allDates = allDates.filter((d) => d !== undefined);
    allDates.sort((a, b) => new Date(b) - new Date(a));
    return allDates[0];
  }
}

export function handleChange(type, value, state, setState, realCourses, queryVariables) {
  console.log("handleChange", state)
  var courseData = JSON.parse(localStorage.getItem(state.courseId))
  if (type === "start") {
    setState({
      ...state,
      start: value,
      disable: false
    })
    courseData["start"] = value;
    courseData["filters"].push({start: value})
    courseData["disable"] = false;
    localStorage.setItem(state.courseId, JSON.stringify(courseData));
  }
  if (type === "end") {
    setState({
      ...state,
      end: value,
      disable: false
    })
  }
  if (type === "courseId") {
    console.log(state.disableCourse)
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
      start: null,
      end: null,
      ltCourse: realCourses[value].ltCourse,
      adaptCourse: realCourses[value].adaptCourse,
      hasAdapt: realCourses[value].adaptCourse,
      index: 0,
      tab: "student",
      studentTab: true,
      pageTab: false,
      assignmentTab: false,
      filterTab: false
    })
    queryVariables.setClick(false)
  }
  if (type === "student") {
    setState({
      ...state,
      student: value
    })
  }
  if (type === "studentAssignments") {
    setState({
      ...state,
      student: value,
      disableStudent: false
    })
  }
  if (type === "page") {
    var temp = state.pageData.find((id) => id.pageTitle === value);
    var pageId = temp._id;
    setState({
      ...state,
      page: value,
      pageId: pageId,
      disablePage: false
    })
  } else if (type === "pageLevelGroup") {
    setState({
      ...state,
      levelGroup: value,
      levelName: null
    })
  } else if (type === "pageLevelName") {
    setState({
      ...state,
      //individualAssignmentViews: null,
      levelName: value,
      disableAssignment: false
    })
  } else if (type === "gradesPageLevelGroup") {
    setState({
      ...state,
      gradeLevelGroup: value,
      gradeLevelName: null
    })
  } else if (type === "gradesPageLevelName") {
    setState({
      ...state,
      //gradesPageView: null,
      gradeLevelName: value,
      disableGradesAssignment: false,
    })
  }

  if (type === "chapter") {
    setState({
      ...state,
      disable: false
    })
  }
  if (type === "path") {
    setState({
      ...state,
      dataPath: value
    })
  }
  return (
    <FunctionContext.Provider value={{
      store: state
    }} />
  )
}

export function handleTabs(value, state, setState, queryVariables) {
  if (state.course && queryVariables.click) {
    //change when tabs can be switched
    if (value === 0) {
      setState({
        ...state,
        tab: "student",
        index: 0
      })
    } else if (value === 1) {
      setState({
        ...state,
        tab: "page",
        index: 1
      })
    } else if (value === 2) {
      setState({
        ...state,
        tab: "assignment",
        index: 2
      })
    }
  } else if (!state.course || !queryVariables.click) {
    if (value === 0) {
      setState({
        ...state,
        tab: "student",
        index: 0
      })
    } else if (value === 1) {
      setState({
        ...state,
        tab: "page",
        index: 1
      })
    } else if (value === 2) {
      setState({
        ...state,
        tab: "assignment",
        index: 2
      })
    }
  } else {
    alert("Please choose a course and hit Apply.");
  }
}

export function clearDates(state, setState) {
  setState({
    ...state,
    start: null,
    end: null,
    disable: false
  })
}

export function menuCollapsible(state, setState) {
  setState({
    ...state,
    openFilter: !state.openFilter
  })
}

export function clearPath(event, state, setState) {
  setState({
    ...state,
    chosenPath: null,
    dataPath: null,
    resetPath: true
  })
}

export function filterReset(state, setState) {
  setState({
    ...state,
    reset: true,
    chosenPath: null,
    dataPath: null,
    start: null,
    end: null
  })
}

export function applyReset(state, setState) {
  setState({
    ...state,
    openFilter: false,
    disableCourse: true,
    studentResult: null,
    pageResult: null,
    student: null,
    page: null
  })

  getAggregateData(state, setState);
  getObjectList(state, setState);
  getStudentChartData(state, setState);
  getPageViewData(state, setState);
  setState({
    ...state,
    reset: false
  })
}

export function changeColumns(option, value, state, setState) {
  var val = option["label"];
  var columns = JSON.parse(JSON.stringify(state.tableColumns));
  var checked = JSON.parse(JSON.stringify(state.checkedValues));
  if (val === "All" && columns[val]) {
    columns[val] = false;
    checked.find((v, index) => {
      if (v === val) {
        checked.splice(index, 1);
      }
    });
  } else if (val === "All" && !columns[val]) {
    Object.keys(columns).forEach((v) => {
      columns[v] = true;
    });
    checked = Object.keys(columns);
  } else {
    if (columns[val]) {
      columns[val] = false;
      columns["All"] = false;
    } else {
      columns[val] = true;
    }
    if (checked.includes(val)) {
      checked.find((v, index) => {
        if (v === val) {
          checked.splice(index, 1);
        }
      });
      checked.find((v, index) => {
        if (v === "All") {
          checked.splice(index, 1);
        }
      });
    } else {
      checked.push(val);
    }
  }
  setState({
    ...state,
    checkedValues: checked,
    tableColumns: columns
  })
}

export function changeActivityFilter(option, data, state, setState) {
  setState({
    ...state,
    activityFilter: option
  })
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
    gridHeight: "large"
  })
  if (type === "aggregatePageViews") {
    getPageViewData(state, setState);
  } else if (type === "individualPageViews") {
    getIndividualPageViewData(state, setState);
  }
}

export function changePropValue(state, setState, prop, option) {
  let tempState = JSON.parse(JSON.stringify(state))
  tempState[prop] = option
  setState({
    ...tempState
  });
}

// 7/15 Robert
export function handleGrade(state, setState, type) {
  let tempState = JSON.parse(JSON.stringify(state))
  tempState["disableGradesAssignment"] = true
  setState({
    ...tempState
  })
  getGradesPageViewData(tempState, setState);
}
