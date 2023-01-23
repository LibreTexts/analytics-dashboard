//helper functions to clear some state variables, write to localStorage, create grommet grids, etc
import cookies from "js-cookie";

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
    grids.push({ name: "timeline", start: [0, 2], end: [1, 2] });
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
  } else if (!state.ltCourse && state.adaptCourse) {
    grids.push({
      name: "studentAdaptEngagement",
      start: [0, 3],
      end: [1, 3],
    });
  }
  return grids;
}

//create rows for a grid based on whether there is libretext or adapt data
export function reactRows(state) {
  var rows = ["23%", "22%", "27%", "28%"];
  if (state.ltCourse && state.adaptCourse) {
    rows = ["18%", "18%", "20%", "21%", "21%"];
    //["23%", "22%", "27%", "28%"]
  } else if (state.ltCourse && !state.adaptCourse) {
    rows = ["30%", "33%", "36%"];
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
    localStorage.getItem(state.courseId + "-"+state.start+"-filters")
  );
  courseData["start"] = state.startDate;
  courseData["end"] = state.endDate;
  writeToLocalStorage(state.courseId + "-"+state.start+"-filters", courseData);
}

//clears the chosen metatag
export function clearTags(state, setState) {
  setState({
    ...state,
    chosenTag: null,
    disable: false,
  });
  var courseData = JSON.parse(
    localStorage.getItem(state.courseId + "-"+state.start+"-filters")
  );
  courseData["chosenTag"] = null;
  writeToLocalStorage(state.courseId + "-"+state.start+"-filters", courseData);
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
    // start: null,
    // end: null,
    disableFilterReset: false,
    chosenTag: null,
  });
  var courseData = JSON.parse(
    localStorage.getItem(state.courseId + "-"+state.start+"-filters")
  );
  courseData["chosenPaths"] = null;
  courseData["dataPath"] = null;
  // courseData["start"] = null;
  // courseData["end"] = null;
  courseData["chosenTag"] = null;
  localStorage.setItem(state.courseId + "-"+state.start+"-filters", JSON.stringify(courseData));
}

export function setCourseFromConductor(state, setState, courseId, adaptCourseID, realCourses, queryVariables) {
  var value = null;
  if ((courseId && adaptCourseID) || courseId) {
    value = Object.keys(realCourses).find(courseName => realCourses[courseName].courseId === courseId);
  } else if (adaptCourseID) {
    value = Object.keys(realCourses).find(courseName => realCourses[courseName].courseId === adaptCourseID);
  }
  var courseData = {};
  if (Object.keys(localStorage).includes(courseId + "-"+state.start+"-filters")) {
    courseData = JSON.parse(localStorage.getItem(courseId + "-"+state.start+"-filters"));
  }
  var courseInfo = JSON.parse(
    sessionStorage.getItem(
      cookies.get("analytics_conductor_course_id") + "-info"
    )
  );
  //for now, send the students in the conductor roster as an array, eventually just use the array of objects given
  var enrollmentData = JSON.parse(
    sessionStorage.getItem(
      cookies.get("analytics_conductor_course_id") + "-enrollment"
    )
  );
  var enrolledStudents =
    enrollmentData && enrollmentData.length > 0
      ? enrollmentData.map((d) => d.email)
      : null;
  courseData["start"] =
    courseInfo && courseInfo.start
      ? new Date(courseInfo.start)
      : realCourses[value].startDate
      ? new Date(realCourses[value].startDate)
      : null;
  courseData["end"] =
    courseInfo && courseInfo.end
      ? new Date(courseInfo.end)
      : realCourses[value].endDate
      ? new Date(realCourses[value].endDate)
      : null;
  localStorage.setItem(
    realCourses[value].courseId + "-"+state.start+"-filters",
    JSON.stringify(courseData)
  );
  var tempState = {
    ...state,
    page: null,
    student: null,
    disablePage: false,
    courseName: courseInfo && courseInfo.title ? courseInfo.title : value,
    courseId: courseId ? courseId : adaptCourseID,
    adaptCourseID: adaptCourseID,
    course: courseInfo && courseInfo.title ? courseInfo.title : value,
    disableCourse: false,
    chosenPaths: null,
    dataPath: null,
    start:
      courseInfo && courseInfo.start
        ? new Date(courseInfo.start)
        : realCourses[value].startDate
        ? new Date(realCourses[value].startDate)
        : null,
    end:
      courseInfo && courseInfo.end
        ? new Date(courseInfo.end)
        : realCourses[value].endDate
        ? new Date(realCourses[value].endDate)
        : null,
    startDate:
      courseInfo && courseInfo.start
        ? new Date(courseInfo.start)
        : realCourses[value].startDate
        ? new Date(realCourses[value].startDate)
        : null,
    endDate:
      courseInfo && courseInfo.end
        ? new Date(courseInfo.end)
        : realCourses[value].endDate
        ? new Date(realCourses[value].endDate)
        : null,
    roster: enrolledStudents,
    conductorRoster: enrollmentData && enrollmentData.length > 0 ? true : false,
    ltCourse: courseInfo && courseInfo.textbookID ? true : false,
    adaptCourse: courseInfo && courseInfo.adaptCourseID ? true : false,
    hasAdapt: realCourses[value].adaptCourse,
    index: 0,
    tab: "student",
    studentTab: true,
    pageTab: false,
    assignmentTab: false,
    filterTab: false,
    noDataAvailable: false,
  }
  queryVariables.setClick(false);
  return tempState;
}
