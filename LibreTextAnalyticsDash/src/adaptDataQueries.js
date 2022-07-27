import axios from "axios";

export async function getAdaptLevels(state, setState) {
  var levels = {};
  var tempState = JSON.parse(JSON.stringify(state));
  await axios({
    method: "post",
    url: state.homepage + "/adaptlevels",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      courseId: state.courseId,
    },
  }).then((response) => {
    JSON.parse(response.data).forEach((a) => {
      var names = [];
      a.level_name.forEach((o) => names.push(o.replaceAll('"', "")));
      levels[a._id.replaceAll('"', "")] = names;
    });
    // setState({
    //   ...state,
    //   adaptLevels: levels
    // })
    tempState = {
      ...tempState,
      adaptLevels: levels
    }
    //state.setAdaptLevels(levels);
  });
  return tempState;
}

export function getAdaptData(state, setState) {
  axios({
    method: "post",
    url: state.homepage + "/adapt",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      course: state.courseId,
      start: state.start,
      end: state.end,
      path: state.dataPath,
    },
  }).then((response) => {
    state.allData["adapt"] = JSON.parse(response.data)["documents"];
  });
}

export function getStudentAssignments(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  setState({
    ...state,
    studentAssignments: null
  })
  tempState["studentAssignments"] = null
  var courseData = JSON.parse(localStorage.getItem(state.courseId))
  console.log(courseData)
  if (!Object.keys(courseData).includes(state.student)) {
    axios({
      method: "post",
      url: state.homepage + "/studentassignments",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        courseId: state.courseId,
        individual: state.student
      },
    }).then((response) => {
      var d = JSON.parse(response.data)
      var key = Object.keys(d)[0]
      var value = d[key]
      tempState[key] = value
      courseData[state.student] = value
      localStorage.setItem(state.courseId, JSON.stringify(courseData))
      //console.log(tempState)
      setState({
        ...tempState
      })
    });
  } else {
    tempState["studentAssignments"] = courseData[state.student]
    setState({
      ...tempState
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
  var courseData = JSON.parse(localStorage.getItem(state.courseId))
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
        levelName: state.gradeLevelName
      },
    })
    .then(response => {
      tempState = {
        ...tempState,
        gradesPageView: JSON.parse(response.data)["documents"]
      }
      setState(tempState);
      courseData["grades"+state.gradeLevelGroup+state.gradeLevelName] = JSON.parse(response.data)["documents"]
      localStorage.setItem(state.courseId, JSON.stringify(courseData))
    });
  } else {
    tempState["gradesPageView"] = courseData["grades"+state.gradeLevelGroup+state.gradeLevelName]
    setState({
      ...tempState
    })
  }
}
