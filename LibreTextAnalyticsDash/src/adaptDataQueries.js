import axios from "axios";

export function getStudentAssignments(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  setState({
    ...state,
    studentAssignments: null
  })
  tempState["studentAssignments"] = null
  var courseData = JSON.parse(localStorage.getItem(state.courseId+"-chart"))
  console.log("courseData", courseData)
  console.log("state", state)
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
        start: state.start,
        end: state.end
      },
    }).then((response) => {
      var d = JSON.parse(response.data)
      var key = Object.keys(d)[0]
      var value = d[key]
      if (value) {
        tempState[key] = value
        courseData[state.student] = value
        localStorage.setItem(state.courseId+"-chart", JSON.stringify(courseData))
        setState({
          ...tempState,
          noChartData: false,
          disableStudent: false
        })
      } else {
        setState({
          ...tempState,
          noChartData: true,
          disableStudent: false
        })
      }
      //console.log(tempState)
    });
  } else {
    tempState["studentAssignments"] = courseData[state.student]
    setState({
      ...tempState,
      noChartData: false,
      disableStudent: false
    })
  }
  return tempState;
}

// Robert 7/15
export function getGradesPageViewData(state, setState) {
  console.log("adapt data")
  // console.log(state)
  var tempState = JSON.parse(JSON.stringify(state));
  tempState = {
    ...tempState,
    gradesPageView: null
  }
  setState({
    ...tempState
  })
  var courseData = JSON.parse(localStorage.getItem(state.courseId+"-chart"))
  if (!Object.keys(courseData).includes("grades"+state.gradeLevelGroup+state.gradeLevelName)) {
    axios({
      method: 'post',
      url: '/gradepageviews',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        courseId: state.courseId,
        levelGroup: state.gradeLevelGroup,
        levelName: state.gradeLevelName,
        start: state.start,
        end: state.end
      },
    })
    .then(response => {
      let grades = JSON.parse(response.data)["documents"]
      // console.log("grades", grades)
      if (grades.length == 0) {
        tempState = {
          ...tempState,
          noChartData: true
        }
      } else {
        tempState = {
          ...tempState,
          noChartData: false,
          gradesPageView: JSON.parse(response.data)["documents"]
        }
        courseData["grades"+state.gradeLevelGroup+state.gradeLevelName] = JSON.parse(response.data)["documents"]
        localStorage.setItem(state.courseId+"-chart", JSON.stringify(courseData))
      }
      setState({
        ...tempState,
        disableGradesAssignment: false
      });
    });
  } else {
    tempState["gradesPageView"] = courseData["grades"+state.gradeLevelGroup+state.gradeLevelName]
    setState({
      ...tempState,
      noChartData: false,
      disableGradesAssignment: false
    })
  }
}
