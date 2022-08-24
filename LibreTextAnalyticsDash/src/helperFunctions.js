

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
        //make note if it doesn't work
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
  if (state.ltCourse && state.adaptCourse) {
    grids.forEach((g) => {
      if (g.name === "timeline") {
        g.start = [0, 2];
        g.end = [1, 2];
      }
    });
    grids.splice(1, 0, { name: "plots", start: [0, 1], end: [1, 1] });
    grids.push({ name: "studentTextbookEngagement", start: [0, 3], end: [1, 3] });
  } else if (state.ltCourse && !state.adaptCourse) {
    grids = [
      { name: "table", start: [0, 0], end: [1, 0] },
      { name: "plots", start: [0, 1], end: [1, 1] },
      { name: "studentTextbookEngagement", start: [0, 2], end: [1, 2] }
    ]
  }
  return grids;
}

export function reactRows(state) {
  var rows = ["50%", "50%"];
  if (state.ltCourse && state.adaptCourse) {
    rows = ["23%", "22%", "27%", "28%"];
  } else if (state.ltCourse && !state.adaptCourse) {
    rows = ["28%", "33%", "39%"];
  }
  return rows;
}

export function getStudentChartFilters(state) {
  var filters = [
    "LT Unique Pages Accessed",
    "LT Unique Interaction Days",
    "LT Most Recent Page Load",
    "LT Hours on Site"
  ];
  if (state.hasAdapt) {
    filters.push("Adapt Unique Interaction Days");
    filters.push("Adapt Unique Assignments");
    filters.push("Adapt Most Recent Page Load");
  }
  return filters;
}

export function clearDates(state, setState) {
  setState({
    ...state,
    start: state.startDate,
    end: state.endDate,
    disable: false,
  });
}

export function clearTags(state, setState) {
  setState({
    ...state,
    chosenTag: null
  })
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
    disableFilterReset: false,
    chosenTag: null
  });
  var courseData = JSON.parse(localStorage.getItem(state.courseId+"-filters"))
  courseData["chosenPath"] = null;
  courseData["dataPath"] = null;
  courseData["start"] = null;
  courseData["end"] = null;
  courseData["chosenTag"] = null;
  localStorage.setItem(state.courseId+"-filters", JSON.stringify(courseData));
}
