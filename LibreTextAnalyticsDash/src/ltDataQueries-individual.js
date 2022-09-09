import axios from "axios";
import { writeToLocalStorage } from "./helperFunctions.js";

export async function getStudentChartData(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  //state.setStudentChartData(null);
  setState({
    ...state,
    studentChart: null,
  });
  tempState = {
    ...tempState,
    studentChart: null,
  };
  var courseData = {};
  if (Object.keys(localStorage).includes(state.courseId+"-chart")) {
    courseData = JSON.parse(localStorage.getItem(state.courseId+"-chart"));
  }
  var adaptAxisValue = state.adaptStudentChartVal ? "adapt" : "lt";
  if (
    !Object.keys(courseData).includes(
      adaptAxisValue + state.barXAxis + "studentChart"
    )
  ) {
    await axios({
      method: "post",
      url: state.homepage + "/studentchart",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        course: state.course,
        courseId: state.courseId,
        groupBy: state.barXAxis,
        start: state.start,
        end: state.end,
        path: state.dataPath,
        hasAdapt: state.hasAdapt,
        adaptAxisValue: state.adaptStudentChartVal,
        tagFilter: state.chosenTag
      },
    }).then((response) => {
      // setState({
      //   ...state,
      //   studentChartData: JSON.parse(response.data)["documents"]
      // })
      courseData[adaptAxisValue + state.barXAxis + "studentChart"] = JSON.parse(
        response.data
      )["studentChart"];
      if (
        state.adaptStudentChartVal === false &&
        state.barXAxis === "dateCount"
      ) {
        courseData["studentChart"] = JSON.parse(response.data)["studentChart"];
      }
      //localStorage.setItem(state.courseId, JSON.stringify(courseData))
      writeToLocalStorage(state.courseId+"-chart", courseData);

      tempState = {
        ...tempState,
        studentChart: JSON.parse(response.data)["studentChart"],
      };
      setState({
        ...tempState,
      });
      //state.setStudentChartData(JSON.parse(response.data)["documents"]);
    });
  } else {
    tempState["studentChart"] =
      courseData[adaptAxisValue + state.barXAxis + "studentChart"];
    setState({
      ...tempState,
    });
    courseData["studentChart"] =
      courseData[adaptAxisValue + state.barXAxis + "studentChart"];
    writeToLocalStorage(state.courseId+"-chart", courseData);
    //localStorage.setItem(state.courseId, JSON.stringify(courseData))
  }
  return tempState;
}

export async function getPageViewData(state, setState) {
  //state.setTotalPageViews(null);
  var tempState = JSON.parse(JSON.stringify(state));

  tempState = {
    ...tempState,
    pageViews: null,
  };
  setState({
    ...tempState,
  });
  var courseData = {};
  if (Object.keys(localStorage).includes(state.courseId+"-chart")) {
    courseData = JSON.parse(localStorage.getItem(state.courseId+"-chart"));
  }
  if (!Object.keys(courseData).includes("aggregate" + state.bin + state.unit)) {
    await axios({
      method: "post",
      url: state.homepage + "/pageviews",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        bin: state.bin,
        unit: state.unit,
        course: state.course,
        courseId: state.courseId,
        start: state.start,
        end: state.end,
        path: state.dataPath,
        tagFilter: state.chosenTag,
      },
    }).then((response) => {
      tempState = {
        ...tempState,
        pageViews: JSON.parse(response.data)["pageViews"],
      };
      courseData["aggregate" + state.bin + state.unit] = JSON.parse(
        response.data
      )["pageViews"];
      courseData["pageViews"] = JSON.parse(response.data)["pageViews"];
      writeToLocalStorage(state.courseId+"-chart", courseData);
      //localStorage.setItem(state.courseId, JSON.stringify(courseData))
      setState({
        ...tempState,
      });
    });
  } else {
    tempState["pageViews"] = courseData["aggregate" + state.bin + state.unit];
    setState({
      ...tempState,
    });
    courseData["pageViews"] = courseData["aggregate" + state.bin + state.unit];
    writeToLocalStorage(state.courseId+"-chart", courseData);
    //localStorage.setItem(state.courseId, JSON.stringify(courseData))
  }
  return tempState;
}

export function getIndividualPageViewData(state, setState) {
  //console.log(state.tab)
  var tempState = JSON.parse(JSON.stringify(state));
  var p = null;
  var lgroup = null;
  var lname = null;
  var bin = state.bin;
  var unit = state.unit;

  if (state.tab === "page") {
    setState({
      ...state,
      individualPageViews: null,
    });
    //state.setIndividualPageViews(null);
    p = state.page;
  } else if (state.tab === "assignment") {
    setState({
      ...state,
      individualAssignmentViews: null,
    });
    //state.setIndividualAssignmentViews(null);
    lgroup = state.levelGroup;
    lname = state.levelName;
    bin = state.individualAssignmentBin;
    unit = state.individualAssignmentUnit;
  }
  var courseData = {};
  if (Object.keys(localStorage).includes(state.courseId+"-chart")) {
    courseData = JSON.parse(localStorage.getItem(state.courseId+"-chart"));
  }
  if (
    (p !== null && !Object.keys(courseData).includes(bin + unit + p)) ||
    (p === null &&
      !Object.keys(courseData).includes(
        "individual" + bin + unit + lgroup + lname
      ))
  ) {
    console.log("not in local storage");
    axios({
      method: "post",
      url: state.homepage + "/individualpageviews",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        bin: bin,
        unit: unit,
        courseId: state.courseId,
        start: state.start,
        end: state.end,
        path: state.dataPath,
        individual: p,
        levelGroup: lgroup,
        levelName: lname,
        tagFilter: state.chosenTag,
      },
    }).then((response) => {
        var d = JSON.parse(response.data)
        var key = Object.keys(d)[0]
        var value = d[key]
        tempState[key] = value
        console.log(key)
        console.log(tempState[key])
        //tempState["disablePage"] = true
        //setState(tempState)
        if (value) {
          if (p !== null) {
            courseData[bin+unit+p] = value
          } else {
            courseData["individual"+bin+unit+lgroup+lname] = value
          }
          tempState["noChartData"] = false
          // if (state.tab === "page") {
          //   tempState["disablePage"] = false
          // }
          // else if (state.tab === "assignment") {
          //   tempState["disableAssignment"] = false
          // }

          setState(tempState)
          localStorage.setItem(state.courseId+"-chart", JSON.stringify(courseData))
        } else {
          tempState["noChartData"] = true
          // if (state.tab === "page") {
          //   tempState["disablePage"] = false
          // }
          // else if (state.tab === "assignment") {
          //   tempState["disableAssignment"] = false
          // }
        }
    });
  } else {
    console.log("found in local storage");
    if (p !== null) {
      tempState["individualPageViews"] = courseData[bin + unit + p];
      console.log(tempState["individualPageViews"]);
    } else {
      tempState["individualAssignmentViews"] =
        courseData["individual" + bin + unit + lgroup + lname];
      console.log(tempState["individualAssignmentViews"]);
    }
    // if (state.tab === "page") {
    //   tempState["disablePage"] = false
    // } else if (state.tab === "assignment") {
    //   tempState["disableAssignment"] = false
    // }
    setState({
      ...tempState,
      noChartData: false,
    })
  }
}

export function getIndividualChapterData(state, setState) {
  setState({
    ...state,
    disableChapterChart: true
  })
  axios({
    method: "post",
    url: state.homepage + "/individualchapterdata",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      courseId: state.courseId,
      path: state.dataPath,
      individual: state.studentForChapterChart,
      tagFilter: state.chosenTag
    },
  }).then((response) => {
    setState({
      ...state,
      individualChapterData: JSON.parse(response.data)['individualChapterData'],
      disableChapterChart: true
    })
  })
}

export function getStudentTextbookEngagementData(state, setState) {
  // setState({
  //   ...state,
  //   disableStudent: true
  // })
  var courseData = {};
  if (Object.keys(localStorage).includes(state.courseId+"-chart")) {
    courseData = JSON.parse(localStorage.getItem(state.courseId+"-chart"));
  }
  if (!Object.keys(courseData).includes(state.student+state.individualStudentBin+state.individualStudentUnit+"-textbookEngagement")) {
    axios({
      method: "post",
      url: state.homepage + "/studenttextbookengagement",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        courseId: state.courseId,
        path: state.dataPath,
        individual: state.student,
        bin: state.individualStudentBin,
        unit: state.individualStudentUnit,
        tagFilter: state.chosenTag
      },
    }).then((response) => {
      setState({
        ...state,
        textbookEngagementData: JSON.parse(response.data)['textbookEngagementData'],
        disableStudent: true
      })
      courseData[state.student+state.individualStudentBin+state.individualStudentUnit+"-textbookEngagement"] = JSON.parse(response.data)['textbookEngagementData']
      writeToLocalStorage(state.courseId+"-chart", courseData)
    })
  } else {
    setState({
      ...state,
      textbookEngagementData: courseData[state.student+state.individualStudentBin+state.individualStudentUnit+"-textbookEngagement"],
      disableStudent: true
    })
  }
}

export async function getMetaTags(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  // console.log("getMetaTags");

  var courseData = {};
  if (Object.keys(localStorage).includes(state.courseId+"-dropdown")) {
    courseData = JSON.parse(localStorage.getItem(state.courseId+"-dropdown"));
  }
    await axios({
      method: "post",
      url: state.homepage + "/tags",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        pageIds: state.allPageIds
      },
    }).then((response) => {
      var data = JSON.parse(response.data)["tags"];
      var metaTags = []
      data.forEach((tag) => {
        metaTags.push(tag._id)
      })
      tempState["tagData"] = metaTags;
      setState({
        ...tempState,
      });
      courseData["tagData"] = metaTags;
      writeToLocalStorage(state.courseId+"-dropdown", courseData);
    });
  return tempState;
}
