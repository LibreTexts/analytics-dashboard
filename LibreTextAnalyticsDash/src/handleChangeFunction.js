import React from "react";
const FunctionContext = React.createContext();

export function handleChange(
  type,
  value,
  state,
  setState,
  realCourses,
  queryVariables
) {
  var courseData = {}
  if (type === "start") {
    courseData = JSON.parse(localStorage.getItem(state.courseId+"-filters"));
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
      localStorage.setItem(state.courseId+"-filters", JSON.stringify(courseData));
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
      courseData = JSON.parse(localStorage.getItem(state.courseId+"-filters"));
      courseData["end"] = value;
      setState({
        ...state,
        end: value,
        disable: false,
      });
      localStorage.setItem(state.courseId+"-filters", JSON.stringify(courseData));
    }
  }
  if (type === "chosenTag") {
    courseData = JSON.parse(localStorage.getItem(state.courseId+"-filters"));
    courseData["chosenTag"] = value;
    localStorage.setItem(state.courseId+"-filters", JSON.stringify(courseData));
    setState({
      ...state,
      chosenTag: value,
      disable: false
    })
  }
  if (type === "courseId") {
    if (Object.keys(localStorage).includes(realCourses[value].courseId+"-filters")) {
      courseData = JSON.parse(localStorage.getItem(realCourses[value].courseId+"-filters"));
    }
    courseData["start"] = realCourses[value].startDate
      ? new Date(realCourses[value].startDate)
      : null;
    courseData["end"] = realCourses[value].endDate
      ? new Date(realCourses[value].endDate)
      : null;
    localStorage.setItem(realCourses[value].courseId+"-filters", JSON.stringify(courseData));
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
      disableStudent: false
    });
  }
  if (type === "studentForChapterChart") {
    setState({
      ...state,
      studentForChapterChart: value,
      disableChapterChart: false
    })
  }
  if (type === "studentForTextbookEngagement") {
    setState({
      ...state,
      studentForTextbookEngagement: value,
      disableStudentTextbookEngagement: false
    })
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
  } else if (type === "pageLevelGroup") {
    setState({
      ...state,
      levelGroup: value,
      levelName: null,
      disableAssignment: true
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
      disableAssignment: true
    });
  } else if (type === "gradesPageLevelName") {
    setState({
      ...state,
      gradeLevelName: value,
      disableGradesAssignment: false,
    });
  }

  if (type === "chapter") {
    setState({
      ...state,
      disable: false
    });
  }
  if (type === "path") {
    if (Object.keys(localStorage).includes(state.courseId+"-filters")) {
      courseData = JSON.parse(localStorage.getItem(state.courseId+"-filters"));
    }
    courseData["dataPath"] = value;
    courseData["chosenPaths"] = value;
    localStorage.setItem(state.courseId+"-filters", JSON.stringify(courseData));
    setState({
      ...state,
      dataPath: value,
      chosenPaths: value,
      disableCourseStructureButton: false
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
