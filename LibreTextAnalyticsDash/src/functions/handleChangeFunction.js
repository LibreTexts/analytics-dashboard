import React from "react";
import cookies from "js-cookie";
import { writeToLocalStorage } from "./helperFunctions.js";
const FunctionContext = React.createContext();

//handles dropdown values being chosen
export function handleChange(
  type,
  value,
  state,
  setState,
  realCourses,
  queryVariables
) {
  //sets state for the value from a specific dropdown or other input; stores in localStorage
  var courseData = {};
  if (type === "start") {
    courseData = JSON.parse(localStorage.getItem(state.courseId + "-filters"));
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
      writeToLocalStorage(state.courseId + "-filters", courseData);
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
      courseData = JSON.parse(
        localStorage.getItem(state.courseId + "-filters")
      );
      courseData["end"] = value;
      setState({
        ...state,
        end: value,
        disable: false,
      });
      writeToLocalStorage(state.courseId + "-filters", courseData);
    }
  }
  if (type === "chosenTag") {
    courseData = JSON.parse(localStorage.getItem(state.courseId + "-filters"));
    courseData["chosenTag"] = value;
    writeToLocalStorage(state.courseId + "-filters", courseData);
    setState({
      ...state,
      chosenTag: value,
      disable: false,
    });
  }
  if (type === "courseId") {
    if (
      Object.keys(localStorage).includes(
        realCourses[value].courseId + "-filters"
      )
    ) {
      courseData = JSON.parse(
        localStorage.getItem(realCourses[value].courseId + "-filters")
      );
    }
    var courseInfo = JSON.parse(sessionStorage.getItem(cookies.get('analytics_conductor_course_id')+'-info'));
    //for now, send the students in the conductor roster as an array, eventually just use the array of objects given
    var enrollmentData = JSON.parse(sessionStorage.getItem(cookies.get('analytics_conductor_course_id')+'-enrollment'));
    var enrolledStudents = enrollmentData && enrollmentData.length > 0 ? enrollmentData.map(d => d.email) : null;
    courseData["start"] = courseInfo && courseInfo.start
      ? new Date(courseInfo.start)
      : realCourses[value].startDate
      ? new Date(realCourses[value].startDate)
      : null;
    courseData["end"] = courseInfo && courseInfo.end
      ? new Date(courseInfo.end)
      : realCourses[value].endDate
      ? new Date(realCourses[value].endDate)
      : null;
    localStorage.setItem(
      realCourses[value].courseId + "-filters",
      JSON.stringify(courseData)
    );
    setState({
      ...state,
      page: null,
      student: null,
      disablePage: false,
      courseName: value,
      courseId: realCourses[value].courseId,
      course: value,
      disableCourse: false,
      chosenPaths: null,
      dataPath: null,
      start: courseInfo && courseInfo.start
        ? new Date(courseInfo.start)
        : realCourses[value].startDate
        ? new Date(realCourses[value].startDate)
        : null,
      end: courseInfo && courseInfo.end
        ? new Date(courseInfo.end)
        : realCourses[value].endDate
        ? new Date(realCourses[value].endDate)
        : null,
      startDate: courseInfo && courseInfo.start
        ? new Date(courseInfo.start)
        : realCourses[value].startDate
        ? new Date(realCourses[value].startDate)
        : null,
      endDate: courseInfo && courseInfo.end
        ? new Date(courseInfo.end)
        : realCourses[value].endDate
        ? new Date(realCourses[value].endDate)
        : null,
      roster: enrolledStudents,
      conductorRoster: enrollmentData && enrollmentData.length > 0
        ? true
        : false,
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
      disableStudent: false,
    });
  }
  if (type === "studentForChapterChart") {
    setState({
      ...state,
      studentForChapterChart: value,
      disableChapterChart: false,
    });
  }
  if (type === "studentForTextbookEngagement") {
    setState({
      ...state,
      studentForTextbookEngagement: value,
      disableStudentTextbookEngagement: false,
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
        noChartData: false,
      });
    } else {
      setState({
        ...state,
        page: null,
        pageId: pageId,
        disablePage: false,
        noChartData: true,
      });
    }
  } else if (type === "pageLevelGroup") {
    setState({
      ...state,
      levelGroup: value,
      levelName: null,
      disableAssignment: true,
    });
  } else if (type === "pageLevelName") {
    setState({
      ...state,
      levelName: value,
      disableAssignment: false,
    });
  } else if (type === "gradesPageLevelGroup") {
    setState({
      ...state,
      gradeLevelGroup: value,
      gradeLevelName: null,
      disableAssignment: true,
    });
  } else if (type === "gradesPageLevelName") {
    setState({
      ...state,
      gradeLevelName: value,
    });
  }

  if (type === "chapter") {
    setState({
      ...state,
      disable: false,
    });
  }
  if (type === "path") {
    if (Object.keys(localStorage).includes(state.courseId + "-filters")) {
      courseData = JSON.parse(
        localStorage.getItem(state.courseId + "-filters")
      );
    }
    courseData["dataPath"] = value;
    courseData["chosenPaths"] = value;
    localStorage.setItem(
      state.courseId + "-filters",
      JSON.stringify(courseData)
    );
    setState({
      ...state,
      dataPath: value,
      chosenPaths: value,
      disableCourseStructureButton: false,
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
