import axios from "axios";

export async function getAdaptLevels(state, setState) {
  var levels = {};
  var tempState = JSON.parse(JSON.stringify(state));
  await axios({
    method: "post",
    url: state.homepage+"/adaptlevels",
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
    url: state.homepage+"/adapt",
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
  console.log("adapt data")
  console.log(state)
  var tempState = JSON.parse(JSON.stringify(state));
  setState({
    ...state,
    studentAssignments: null
  })
  tempState["studentAssignments"] = null
  axios({
    method: "post",
    url: state.homepage+"/studentassignments",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      course: state.courseId,
      individual: state.student
    },
  }).then((response) => {
    // setState({
    //   ...state,
    //   studentAssignmentData: JSON.parse(response.data)['documents']
    // })
    // tempState = {
    //   ...tempState,
    //   studentAssignmentData: JSON.parse(response.data)['documents']
    // }
    var d = JSON.parse(response.data)
    var key = Object.keys(d)[0]
    var value = d[key]
    tempState[key] = value
    console.log("student assignments", tempState)
    setState({
      ...tempState
    })
    //console.log(tempState.studentAssignments)
    //state.setStudentAssignmentData(JSON.parse(response.data)['documents'])
  });
  return tempState;
}
