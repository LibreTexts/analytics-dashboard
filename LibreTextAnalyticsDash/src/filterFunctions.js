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
  adaptStudentsQuery
} from "./ltDataQueries.js";
import {
  getAdaptLevels,
  getAdaptData,
  getStudentAssignments
} from "./adaptDataQueries.js";

const FunctionContext = React.createContext();

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
    rows.push("auto")
  }
  return rows;
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
      index: 0,
      hasAdapt: false,
      tab: "student",
      levelGroup: null,
      levelName: null,
      disableAssignment: false,
      studentAssignments: null,
      disableStudent: false
    }
    setState(tempState)
    if (!Object.keys(tempState).includes(state.courseId) || type === "refresh") {
      var configs = []
      configs.push(getAllDataQuery(tempState, setState, "student"))
      //console.log(state)
      configs.push(getAllDataQuery(tempState, setState, "page"))
      configs.push(studentChartQuery(tempState, setState))
      if (state.ltCourse) {
        configs.push(getObjects(tempState, setState, "student"))
        configs.push(getObjects(tempState, setState, "page"))
      } else {
        configs.push(adaptStudentsQuery(tempState, setState))
      }
      configs.push(pageViewQuery(tempState, setState))
      configs.push(adaptLevels(tempState, setState))
      configs.push(courseStructureDropdown(tempState, setState))
      await getData(configs, tempState, setState)
    } else {
      var allKeys = Object.keys(tempState[state.courseId])
      allKeys.forEach((key) => {
        tempState[key] = tempState[state.courseId][key]
      })
      setState({
        ...tempState
      })
    }
  } else {
    alert("Please choose a course.");
  }
}

export function handleFilterClick(state, setState, path = false) {
  setState({
    ...state,
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
  })
  if (path) {
    setState({
      ...state,
      chosenPath: path
    })
  }

  getAggregateData(state, setState);
  getPageViewData(state, setState);
  getStudentChartData(state, setState);
  getObjectList(state, setState);
}

export function handleIndividual(state, setState, type) {
  console.log(type)
  var tempState = JSON.parse(JSON.stringify(state))
  //event.preventdefault();
  if (state.tab === "student") {
    console.log(state)
    if (!state.student) {
      alert("Please choose a student.");
    } else {
      // setState({
      //   ...state,
      //   disableStudent: true
      // })
      tempState["studentAssignments"] = null
      tempState["disableStudent"] = true
      setState(tempState)
    }
    //queryVariables.setDisableStudent(true);
  } else if (state.tab === "page") {
    tempState["individualPageViews"] = null
    tempState["disablePage"] = true
    setState(tempState)
  } else if (state.tab === "assignment") {
    // setState({
    //   ...state,
    //   disableAssignment: true
    // })
    tempState["individualAssignmentViews"] = null
    tempState["disableAssignment"] = true
    setState(tempState)
    console.log("assignments")
    //queryVariables.setDisableAssignment(true);
  }
  if (type === "studentAssignments") {
    console.log("here")
    var s = getStudentAssignments(tempState, setState)
    setState(s);
  } else {
    setState(getIndividualPageViewData(tempState, setState));
  }
}

export function changeBarXAxis(option, state, setState) {
  //queryVariables.setBarXAxisLabel(option);
  if (option === "Unique Interaction Days") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "dateCount"
    })
    //queryVariables.setBarXAxis("dateCount");
  } else if (option === "Unique Pages Accessed") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "objectCount"
    })
    //queryVariables.setBarXAxis("objectCount");
  } else if (option === "Most Recent Page Load") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "lastDate"
    })
    //queryVariables.setBarXAxis("lastDate");
  }
}

export function changeBarYAxis(option, state, setState) {
  //queryVariables.setBarYAxisLabel(option);
  if (option === "Unique Interaction Days") {
    setState({
      ...state,
      barYAxisLabel: option,
      barYAxis: "dateCount"
    })
    //queryVariables.setBarYAxis("dateCount");
  } else if (option === "Unique Pages Accessed") {
    setState({
      ...state,
      barYAxisLabel: option,
      barYAxis: "objectCount"
    })
    //queryVariables.setBarYAxis("objectCount");
  } else if (option === "Most Recent Page Load") {
    setState({
      ...state,
      barYAxisLabel: option,
      barYAxis: "lastDate"
    })
    //queryVariables.setBarYAxis("max");
  }
}

export function changeBinVal(option, state, setState) {
  //queryVariables.setBinLabel(option);
  if (option === "Day") {
    setState({
      ...state,
      binLabel: option,
      unit: "day",
      bin: 1
    })
    // queryVariables.setUnit("day");
    // queryVariables.setBin(1);
  } else if (option === "Week") {
    setState({
      ...state,
      binLabel: option,
      unit: "week",
      bin: 1
    })
    // queryVariables.setUnit("week");
    // queryVariables.setBin(1);
  } else if (option === "2 Weeks") {
    setState({
      ...state,
      binLabel: option,
      unit: "week",
      bin: 2
    })
    // queryVariables.setUnit("week");
    // queryVariables.setBin(2);
  } else if (option === "Month") {
    setState({
      ...state,
      binLabel: option,
      unit: "month",
      bin: 1
    })
    // queryVariables.setUnit("month");
    // queryVariables.setBin(1);
  }
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
  //console.log(event)
  if (type === "start") {
    setState({
      ...state,
      start: value,
      disable: false
    })
    // queryVariables.setStart(value);
    // queryVariables.setDisable(false);
  }
  if (type === "end") {
    setState({
      ...state,
      end: value,
      disable: false
    })
    // queryVariables.setEnd(value);
    // queryVariables.setDisable(false);
  }
  if (type === "courseId") {
    //console.log(realCourses)
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
      hasAdapt: realCourses[value].adaptCourse
    })
    queryVariables.setClick(false)
  }
  if (type === "student") {
    setState({
      ...state,
      student: value
    })
    // queryVariables.setStudent(value);
    // console.log(value)
  }
  if (type === "studentAssignments") {
    setState({
      ...state,
      student: value,
      disableStudent: false
    })
    // queryVariables.setStudent(value);
    // queryVariables.setDisableStudent(false);
  }
  if (type === "page") {
    //queryVariables.setPage(value);
    var temp = state.pageData.find((id) => id.pageTitle === value);
    var pageId = temp._id;
    // queryVariables.setPageId(pageId);
    // queryVariables.setDisablePage(false);
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
    // queryVariables.setLevelGroup(value);
    // queryVariables.setLevelName(null);
  } else if (type === "pageLevelName") {
    setState({
      ...state,
      individualAssignmentViews: null,
      levelName: value,
      disableAssignment: false
    })
    // queryVariables.setIndividualAssignmentViews(null);
    // queryVariables.setLevelName(value);
    // queryVariables.setDisableAssignment(false);
  }
  if (type === "chapter") {
    setState({
      ...state,
      disable: false
    })
    //queryVariables.setDisable(false);
  }
  if (type === "path") {
    setState({
      ...state,
      dataPath: value
    })
    //queryVariables.setDataPath(value);
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
      console.log("student");
      setState({
        ...state,
        tab: "student",
        index: 0
      })
      // queryVariables.setTab("student");
      // queryVariables.setIndex(0);
    } else if (value === 1) {
      console.log("page");
      setState({
        ...state,
        tab: "page",
        index: 1
      })
      // queryVariables.setTab("page");
      // queryVariables.setIndex(1);
    } else if (value === 2) {
      setState({
        ...state,
        tab: "assignment",
        index: 2
      })
      // queryVariables.setTab("assignment");
      // queryVariables.setIndex(2);
    }
  } else if (!state.course || !queryVariables.click) {
    if (value === 0) {
      setState({
        ...state,
        tab: "student",
        index: 0
      })
      // queryVariables.setTab("student");
      // queryVariables.setIndex(0);
    } else if (value === 1) {
      setState({
        ...state,
        tab: "page",
        index: 1
      })
      // queryVariables.setTab("page");
      // queryVariables.setIndex(1);
    } else if (value === 2) {
      setState({
        ...state,
        tab: "assignment",
        index: 2
      })
      // queryVariables.setTab("assignment");
      // queryVariables.setIndex(2);
    }
  } else {
    alert("Please choose a course and hit Apply.");
  }
}

export function clearDates(event, state, setState) {
  //event.preventDefault();
  setState({
    ...state,
    start: null,
    end: null,
    disable: false
  })
  // queryVariables.setStart(null);
  // queryVariables.setEnd(null);
  // queryVariables.setDisable(false);
}

export function menuCollapsible(state, setState) {
  setState({
    ...state,
    openFilter: !state.openFilter
  })
  //queryVariables.setOpenFilter(!queryVariables.openFilter);
}

export function clearPath(event, state, setState) {
  //event.preventdefault();
  setState({
    ...state,
    chosenPath: null,
    dataPath: null,
    resetPath: true
  })
  // queryVariables.setChosenPath(null);
  // queryVariables.setDataPath(null);
  // queryVariables.setResetPath(true);
}

export function filterReset(state, setState) {
  //event.preventdefault();
  setState({
    ...state,
    reset: true,
    chosenPath: null,
    dataPath: null,
    start: null,
    end: null
  })
  // queryVariables.setReset(true);
  // queryVariables.setChosenPath(null);
  // queryVariables.setDataPath(null);
  // queryVariables.setStart(null);
  // queryVariables.setEnd(null);
}

export function applyReset(state, setState) {
  //event.preventdefault();
  // queryVariables.setOpenFilter(false);
  // queryVariables.setDisableCourse(true);
  // queryVariables.setStudentResult(null);
  // queryVariables.setPageResult(null);
  // queryVariables.setStudent(null);
  // queryVariables.setPage(null);
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
  //queryVariables.setReset(false);
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
  // queryVariables.setCheckedValues(checked);
  // queryVariables.setTableColumns(columns);
}

export function changeActivityFilter(option, data, state, setState) {
  //queryVariables.setActivityFilter(option);
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

export function pageViewCharts(state, setState) {
  //queryVariables.setGridHeight("large");
  setState({
    ...state,
    gridHeight: "large"
  })
  getPageViewData(state, setState);
  getIndividualPageViewData(state, setState);
}
