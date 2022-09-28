import axios from "axios";

//for the AlLAdaptAssignmentsChart on the Student View
export function getStudentAssignments(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  tempState["studentAssignments"] = null;
  var courseData = JSON.parse(localStorage.getItem(state.courseId + "-chart"));
  if (!Object.keys(courseData).includes(state.student)) {
    axios({
      method: "post",
      url: state.homepage + "/studentassignments",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        courseId: state.courseId,
        individual: state.student,
        startDate: state.start,
        endDate: state.end,
      },
    }).then((response) => {
      var d = JSON.parse(response.data);
      var key = Object.keys(d)[0];
      var value = d[key];
      if (value) {
        tempState[key] = value;
        courseData[state.student] = value;
        localStorage.setItem(
          state.courseId + "-chart",
          JSON.stringify(courseData)
        );
        tempState = {
          ...tempState,
          noChartData: false,
          disableStudent: false,
        };
      } else {
        tempState = {
          ...tempState,
          noChartData: true,
          disableStudent: false,
        };
      }
    });
  } else {
    tempState["studentAssignments"] = courseData[state.student];
    tempState["noChartData"] = false;
  }
  return tempState;
}

//for the GradesPageViewsChart
export function getGradesPageViewData(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  tempState = {
    ...tempState,
    gradesPageView: null,
  };
  setState({
    ...tempState,
  });
  var courseData = JSON.parse(localStorage.getItem(state.courseId + "-chart"));
  if (
    !Object.keys(courseData).includes(
      "grades" + state.gradeLevelGroup + state.gradeLevelName
    )
  ) {
    axios({
      method: "post",
      url: state.homepage + "/gradepageviews",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        courseId: state.courseId,
        levelGroup: state.gradeLevelGroup,
        levelName: state.gradeLevelName,
        startDate: state.start,
        endDate: state.end,
      },
    }).then((response) => {
      let grades = JSON.parse(response.data)["documents"];
      if (grades.length === 0) {
        tempState = {
          ...tempState,
          noChartData: true,
        };
      } else {
        tempState = {
          ...tempState,
          noChartData: false,
          gradesPageView: JSON.parse(response.data)["documents"],
        };
        courseData[
          "grades" + state.gradeLevelGroup + state.gradeLevelName
        ] = JSON.parse(response.data)["documents"];
        localStorage.setItem(
          state.courseId + "-chart",
          JSON.stringify(courseData)
        );
      }
      setState({
        ...tempState,
      });
    });
  } else {
    tempState["gradesPageView"] =
      courseData["grades" + state.gradeLevelGroup + state.gradeLevelName];
    setState({
      ...tempState,
      noChartData: false,
    });
  }
}
