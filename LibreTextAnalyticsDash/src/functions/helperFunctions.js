//helper functions to clear some state variables, write to localStorage, create grommet grids, etc

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

//out of use, for generating csv headers
export function generateHeaders(type) {
  var headers = [];
  return headers;
}

//getting an array of all students
export function getAllStudents(state) {
  var students = [];
  if (state.displayMode) {
    students = state.encryptedStudents;
  } else {
    students = state.allStudents;
  }
  return students;
}

//create a grid based on whether there is libretext or adapt data
export function reactGrids(state) {
  var grids = [
    { name: "table", start: [0, 0], end: [1, 0] },
    { name: "plots", start: [0, 1], end: [1, 1] },
    { name: "timeline", start: [0, 2], end: [1, 2] },
  ];
  if (state.ltCourse && state.adaptCourse) {
    grids.push({
      name: "studentTextbookEngagement",
      start: [0, 3],
      end: [1, 3],
    });
    grids.push({
      name: "studentAdaptEngagement",
      start: [0, 4],
      end: [1, 4],
    });
  } else if (state.ltCourse && !state.adaptCourse) {
    grids = [
      { name: "table", start: [0, 0], end: [1, 0] },
      { name: "plots", start: [0, 1], end: [1, 1] },
      { name: "studentTextbookEngagement", start: [0, 2], end: [1, 2] },
    ];
  }
  return grids;
}

//create rows for a grid based on whether there is libretext or adapt data
export function reactRows(state) {
  var rows = ["20%", "25%", "31%", "24%"];
  if (state.ltCourse && state.adaptCourse) {
    rows = ["18%", "18%", "20%", "21%", "21%"];
    //["23%", "22%", "27%", "28%"]
  }
  return rows;
}

//get the dropdown values for the filter on the student chart based on whether there is libretext or adapt data
export function getStudentChartFilters(state) {
  var filters = [];
  if (state.ltCourse) {
    filters.push("LT Unique Pages Accessed");
    filters.push("LT Unique Interaction Days");
    filters.push("LT Most Recent Page Load");
    filters.push("LT Hours on Site");
  }
  if (state.hasAdapt) {
    filters.push("ADAPT Unique Interaction Days");
    filters.push("ADAPT Unique Assignments");
    filters.push("ADAPT Most Recent Page Load");
  }
  return filters;
}

//get rid of the start and end dates, revert back to the dates found in the adapt data if it exists
export function clearDates(state, setState) {
  setState({
    ...state,
    start: state.startDate,
    end: state.endDate,
    disable: false,
  });
  var courseData = JSON.parse(
    localStorage.getItem(state.courseId + "-filters")
  );
  courseData["start"] = state.startDate;
  courseData["end"] = state.endDate;
  writeToLocalStorage(state.courseId + "-filters", courseData);
}

//clears the chosen metatag
export function clearTags(state, setState) {
  setState({
    ...state,
    chosenTag: null,
    disable: false,
  });
  var courseData = JSON.parse(
    localStorage.getItem(state.courseId + "-filters")
  );
  courseData["chosenTag"] = null;
  writeToLocalStorage(state.courseId + "-filters", courseData);
}

//closes and opens the course structure dropdown
export function menuCollapsible(state, setState) {
  setState({
    ...state,
    openFilter: !state.openFilter,
  });
}

//clears the chosen path (unit or chapter of the textbook from the course structure dropdown)
export function clearPath(event, state, setState) {
  setState({
    ...state,
    chosenPaths: null,
    dataPath: null,
    resetPath: true,
  });
}

//called on click of the "Clear All Filters" button, resets the chosen filters
export function filterReset(state, setState) {
  setState({
    ...state,
    reset: true,
    chosenPaths: null,
    dataPath: null,
    start: null,
    end: null,
    disableFilterReset: false,
    chosenTag: null,
  });
  var courseData = JSON.parse(
    localStorage.getItem(state.courseId + "-filters")
  );
  courseData["chosenPaths"] = null;
  courseData["dataPath"] = null;
  courseData["start"] = null;
  courseData["end"] = null;
  courseData["chosenTag"] = null;
  localStorage.setItem(state.courseId + "-filters", JSON.stringify(courseData));
}
