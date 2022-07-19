import axios from "axios";

export async function getData(data, state, setState) {
  var promises = []
  var tempState = JSON.parse(JSON.stringify(state))
  var course = state.courseId
  var courseData = {}
  for (const config of data) {
    //console.log(JSON.parse(config.data)['documents'][0]['id'])
    promises.push(await axios(config).then(function (response) {
        console.log(response.statusText)
        var d = JSON.parse(response.data)
        console.log(d)
        var key = Object.keys(d)[0]
        var value = d[key]
        console.log("key", key)
        tempState[key] = value
        courseData[key] = value
        tempState["display"] = true
        tempState["disableCourse"] = true
        tempState["showInfoBox"] = false
        if (key === "studentData") {
          if (Object.keys(value[0]).includes("adapt") && value[0]["adapt"] !== false) {
            tempState["hasAdapt"] = true
            courseData["hasAdapt"] = true
            var columns = {
              "All": true,
              "LT Unique Pages Accessed": true,
              "LT Total Page Views": true,
              "LT Most Recent Page Load": true,
              "LT Unique Interaction Days": true,
              "Adapt Unique Interaction Days": true,
              "Adapt Unique Assignments": true,
              "Adapt Most Recent Page Load": true,
            };
            var checks = Object.keys(columns);
            tempState["tableColumns"] = columns;
            tempState["checkedValues"] = checks;
            courseData["tableColumns"] = columns;
            courseData["checkedValues"] = checks;
          } else {
            var columns = {
              "All": true,
              "LT Unique Pages Accessed": true,
              "LT Total Page Views": true,
              "LT Most Recent Page Load": true,
              "LT Unique Interaction Days": true,
            };
            var checks = Object.keys(columns);
            tempState["tableColumns"] = columns;
            tempState["checkedValues"] = checks;
            courseData["tableColumns"] = columns;
            courseData["checkedValues"] = checks;
          }
        } else if (key === "adaptLevels") {
          var levels = {};
          value.forEach((a) => {
            var names = [];
            a.level_name.forEach((o) => names.push(o.replaceAll('"', "")));
            levels[a._id.replaceAll('"', "")] = names;
          });
          tempState["adaptLevels"] = levels;
          courseData["adaptLevels"] = levels;
        } else if (key === "allStudents") {
          var students = []
          var encryptedStudents = []
          value.forEach((v) => {
            students.push(v._id)
            encryptedStudents.push(v.displayModeStudent);
          })
          tempState["encryptedStudents"] = encryptedStudents;
          courseData["encryptedStudents"] = encryptedStudents;
          tempState["allStudents"] = students;
          courseData["allStudents"] = students;
        } else if (key === "pageTimelineData") {
          var pages = []
          value.forEach((p) => {
            if (p.pageTitle !== undefined) {
              pages.push(p.pageTitle);
            } else {
              pages.push(p._id);
            }
          })
          tempState["allPages"] = pages;
          courseData["allPages"] = pages;
        } else if (key === "adaptStudents") {
          var students = []
          value.forEach(v => {
            students.push(v._id)
          })
          tempState["allStudents"] = students;
          courseData["allStudents"] = students;
        } else if (key === "chapters") {
          var courseStructure = calculateCourseStructure(value);
          tempState["allChapters"] = courseStructure;
          courseData["allChapters"] = courseStructure;
        }
        //setState(tempState)
        //console.log(response.data)
      }).catch(function (error) {
        console.log(error)
      })
    )
  }
  tempState[course] = courseData;
  Promise.all(promises).then(() => setState({...tempState}));
}

function getAxiosCall(url, data, state) {
  var config = {
    method: "post",
    url: state.homepage+url,
    headers: {
      "Content-Type": "application/json",
    },
    data:  data
  }
  return config
}

export function getAllDataQuery(state, setState, type) {
  console.log("state", state)
  if (type === "student") {
    var group = "$actor.id"
  } else if (type === "page") {
    var group = "$object.id"
  }
  var data = {
    startDate: state.start,
    endDate: state.end,
    course: state.course,
    courseId: state.courseId,
    path: state.dataPath,
    groupBy: group,
    tagType: state.tagType,
    tagTitle: state.tagTitle,
    adaptLevelGroup: state.levelGroup,
    adaptLevelName: state.levelName,
    ltCourse: state.ltCourse,
    adaptCourse: state.adaptCourse
  }
  var config = getAxiosCall("/data", data, state)
  return config;
}

export function allStudentsQuery(state, setState) {
  var data = {
    courseId: state.courseId
  }
  var config = getAxiosCall("/allstudents", data, state)
  return config;
}

export function getObjects(state, setState, type) {
  if (type === "student") {
    var group = "$actor.id"
  } else if (type === "page") {
    var group = "$object.id"
  }
  var data = {
    course: state.course,
    courseId: state.courseId,
    groupBy: group,
    path: state.dataPath,
  }
  var config = getAxiosCall("/timelineData", data, state)
  return config;
}

export function studentChartQuery(state, setState) {
  var data = {
    course: state.course,
    courseId: state.courseId,
    groupBy: state.barXAxis,
    start: state.start,
    end: state.end,
    path: state.dataPath,
  }

  var config = getAxiosCall("/studentchart", data, state)
  return config;
}

export function adaptStudentsQuery(state, setState) {
  var data = {
    courseId: state.courseId
  }
  var config = getAxiosCall("/adaptstudents", data, state)
  return config;
}

export function pageViewQuery(state, setState) {
  var data = {
    bin: state.bin,
    unit: state.unit,
    course: state.course,
    courseId: state.courseId,
    start: state.start,
    end: state.end,
    path: state.dataPath,
  }

  var config = getAxiosCall("/pageviews", data, state)
  return config;
}

export function individualPageViews(state, setState) {
  if (state.tab == "page") {
    //state.setIndividualPageViews(null);
    var p = state.page;
    var lgroup = null;
    var lname = null;
  } else if (state.tab === "assignment") {
    //state.setIndividualAssignmentViews(null);
    var lgroup = state.levelGroup;
    var lname = state.levelName;
    var p = null;
  }

  var data = {
    bin: state.bin,
    unit: state.unit,
    courseId: state.courseId,
    start: state.start,
    end: state.end,
    path: state.dataPath,
    individual: p,
    levelGroup: lgroup,
    levelName: lname,
  }
  var config = getAxiosCall("/individualpageviews", data, state)
  return config;
}

export function adaptLevels(state, setState) {
  var data = {
    courseId: state.courseId
  }
  var config = getAxiosCall("/adaptlevels", data, state)
  return config;
}

export function courseStructureDropdown(state, setState) {
  var data = {
    courseId: state.courseId
  }
  var config = getAxiosCall("/chapters", data, state)
  return config;
}

export async function getAggregateData(state, setState) {
  var d = JSON.parse(JSON.stringify(state.allData)); // deep copy
  var group = "";
  var tempState = JSON.parse(JSON.stringify(state));
  getAllDataQuery(state, setState)

  if (state.tab === "student") {
    group = "$actor.id";
  } else if (state.tab === "page") {
    group = "$object.id";
  }
  var studentResult = null;
  var pageResult = null;
  await axios({
    method: "post",
    url: state.homepage+"/data",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      startDate: state.start,
      endDate: state.end,
      course: state.course,
      courseId: state.courseId,
      path: state.dataPath,
      groupBy: "$actor.id",
      tagType: state.tagType,
      tagTitle: state.tagTitle,
      adaptLevelGroup: state.levelGroup,
      adaptLevelName: state.levelName
    },
  }).then((response) => {
    d["student"] = JSON.parse(response.data)["documents"];
    console.log(JSON.parse(response.data)["documents"]);
    // setState({
    //   ...state,
    //   studentResult: JSON.parse(response.data)["documents"],
    //   display: true
    // })
    studentResult = JSON.parse(response.data)["documents"]
    tempState = {
      ...tempState,
      studentResult: JSON.parse(response.data)["documents"],
      display: true
    }
    // state.setStudentResult(JSON.parse(response.data)["documents"]);
    // state.setDisplay(true);
    if (
      Object.keys(d["student"][0]).includes("adapt") &&
      d["student"][0]["adapt"] !== false
    ) {
      //state.setHasAdapt(true);
      var columns = {
        "All": true,
        "LT Unique Pages Accessed": true,
        "LT Total Page Views": true,
        "LT Most Recent Page Load": true,
        "LT Unique Interaction Days": true,
        "Adapt Unique Interaction Days": true,
        "Adapt Unique Assignments": true,
        "Adapt Most Recent Page Load": true,
      };
      var checks = Object.keys(columns);
      // state.setTableColumns(columns);
      // state.setCheckedValues(checks);
      // setState({
      //   ...state,
      //   hasAdapt: true,
      //   tableColumns: columns,
      //   checkedValues: checks
      // })
      tempState = {
        ...tempState,
        hasAdapt: true,
        tableColumns: columns,
        checkedValues: checks
      }
    } else {
      var columns = {
        "All": true,
        "LT Unique Pages Accessed": true,
        "LT Total Page Views": true,
        "LT Most Recent Page Load": true,
        "LT Unique Interaction Days": true,
      };
      var checks = Object.keys(columns);
      // state.setTableColumns(columns);
      // state.setCheckedValues(checks);
      // setState({
      //   ...state,
      //   tableColumns: columns,
      //   checkedValues: checks
      // })
      tempState = {
        ...tempState,
        tableColumns: columns,
        checkedValues: checks
      }
    }
  });

  await axios({
    method: "post",
    url: state.homepage+"/data",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      startDate: state.start,
      endDate: state.end,
      course: state.course,
      courseId: state.courseId,
      path: state.dataPath,
      groupBy: "$object.id",
      tagType: state.tagType,
      tagTitle: state.tagTitle,
    },
  }).then((response) => {
    d["page"] = JSON.parse(response.data)["documents"];
    // setState({
    //   ...state,
    //   pageResult: JSON.parse(response.data)["documents"],
    //   display: true
    // })
    pageResult = JSON.parse(response.data)["documents"];
    tempState = {
      ...tempState,
      pageResult: JSON.parse(response.data)["documents"],
      display: true
    }
    //console.log(tempState)
    // state.setPageResult(JSON.parse(response.data)["documents"]);
    // state.setDisplay(true);
  });
  // setState({
  //   ...state,
  //   allData: d
  // })
  tempState = {
    ...tempState,
    allData: d
  }
  // console.log("results", studentResult, pageResult)
  // console.log("temp", tempState)
  //state.setAllData(d);
  return tempState
}

export async function getObjectList(state, setState) {
  // console.log("object list")
  // console.log(state)
  // console.log(setState)
  var tempState = JSON.parse(JSON.stringify(state));
  let students = [];
  let pages = [];
  let pageWithTitle = [];
  var obj = {};
  if (state.tab === "student") {
    var group = "$actor.id";
  } else if (state.tab === "page") {
    var group = "$object.id";
  }
  await axios({
    method: "post",
    url: state.homepage+"/timelineData",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      course: state.course,
      courseId: state.courseId,
      groupBy: "$actor.id",
      path: state.dataPath,
    },
  }).then((response) => {
    var d = JSON.parse(response.data)["documents"];
    //state.setStudentDates(d);
    d.forEach((s) => students.push(s._id));
    //state.setAllStudents(students)
    obj["allStudents"] = students;
    //state.setClick(true);
    // setState({
    //   ...state,
    //   studentDates: d,
    //   allStudents: students,
    //   click: true
    // })
    tempState = {
      ...tempState,
      studentDates: d,
      allStudents: students,
      click: true
    }
  });
  await axios({
    method: "post",
    url: state.homepage+"/timelineData",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      course: state.course,
      courseId: state.courseId,
      groupBy: "$object.id",
      path: state.dataPath,
    },
  }).then((response) => {
    var d = JSON.parse(response.data)["documents"];
    d.forEach((s) => {
      if (s.pageTitle !== undefined) {
        pages.push(s.pageTitle);
      } else {
        pages.push(s._id);
      }
    });
    obj["allPages"] = pages;
    // state.setAllPages(pages);
    // state.setClick(true);
    // setState({
    //   ...state,
    //   allPages: pages,
    //   click: true
    // })
    tempState = {
      ...tempState,
      allPages: pages,
      click: true
    }
  });
  return tempState;
}

export async function getStudentChartData(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state))
  //state.setStudentChartData(null);
  // setState({
  //   ...state,
  //   studentChartData: null
  // })
  tempState = {
    ...tempState,
    studentChartData: null
  }
  await axios({
    method: "post",
    url: state.homepage+"/studentchart",
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
    },
  }).then((response) => {
    // setState({
    //   ...state,
    //   studentChartData: JSON.parse(response.data)["documents"]
    // })
    tempState = {
      ...tempState,
      studentChartData: JSON.parse(response.data)["documents"]
    }
    //state.setStudentChartData(JSON.parse(response.data)["documents"]);
  });
  return tempState;
}

export async function getPageViewData(state, setState) {
  //state.setTotalPageViews(null);
  var tempState = JSON.parse(JSON.stringify(state))
  console.log(state.click)
  // setState({
  //   ...state,
  //   totalPageViews: null
  // })
  tempState = {
    ...tempState,
    totalPageViews: null
  }
  await axios({
    method: "post",
    url: state.homepage+"/pageviews",
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
    },
  }).then((response) => {
    // setState({
    //   ...state,
    //   totalPageViews: JSON.parse(response.data)["documents"]
    // })
    tempState = {
      ...tempState,
      totalPageViews: JSON.parse(response.data)["documents"]
    }
    //state.setTotalPageViews(response.data);
  });
  return tempState;
}

export function getIndividualPageViewData(state, setState) {
  //console.log(state.tab)
  var tempState = JSON.parse(JSON.stringify(state))

  if (state.tab == "page") {
    setState({
      ...state,
      individualPageViews: null
    })
    //state.setIndividualPageViews(null);
    var p = state.page;
    var lgroup = null;
    var lname = null;
  } else if (state.tab === "assignment") {
    setState({
      ...state,
      individualAssignmentViews: null
    })
    //state.setIndividualAssignmentViews(null);
    var lgroup = state.levelGroup;
    var lname = state.levelName;
    var p = null;
  }
  axios({
    method: "post",
    url: state.homepage+"/individualpageviews",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      bin: state.bin,
      unit: state.unit,
      courseId: state.courseId,
      start: state.start,
      end: state.end,
      path: state.dataPath,
      individual: p,
      levelGroup: lgroup,
      levelName: lname,
    },
  }).then((response) => {
      var d = JSON.parse(response.data)
      var key = Object.keys(d)[0]
      var value = d[key]
      tempState[key] = value
      //tempState["disablePage"] = true
      setState(tempState)
  });
  return state;
}

function calculateCourseStructure(data) {

  let chapter = {};
  data.forEach((element, index) => {
    element["chapter"].forEach((e, i) => {
      if (i !== element["chapter"].length - 1 && !(i in chapter)) {
        chapter[i] = {};
      }
      if (i < element["chapter"].length - 1) {
        if (!(e in chapter[i])) {
          if (element["chapter"][i + 1] !== {}) {
            chapter[i][e] = [element["chapter"][i + 1]];
          }
        } else if (!chapter[i][e].includes(element["chapter"][i + 1])) {
          if (element["chapter"][i + 1] !== {}) {
            chapter[i][e].push(element["chapter"][i + 1]);
          }
        }
      }
    });
  });

  return chapter;
  //needed?
  var levels = {};
  Object.keys(chapter).forEach((key) => {
    Object.keys(chapter[key]).forEach((c) => {
      levels[c] = key;
    });
  });
}

export function getChapters(state, setState) {
  let allChapters = [];
  let chapter = {};
  let tree = [];
  var tempState = JSON.parse(JSON.stringify(state))
  axios({
    method: "post",
    url: state.homepage+"/chapters",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      course: state.course,
      courseId: state.courseId,
    },
  }).then((response) => {
    var d = [];
    d = JSON.parse(response.data);
    var longestPath = d[0]["count"];
    tempState["pathLength"] = longestPath;
    // setState({
    //   ...tempState,
    //   pathLength: longestPath
    // })
    //state.setPathLength(longestPath);
    d.forEach((element, index) => {
      element["chapter"].forEach((e, i) => {
        if (i !== element["chapter"].length - 1 && !(i in chapter)) {
          chapter[i] = {};
        }
        if (i < element["chapter"].length - 1) {
          if (!(e in chapter[i])) {
            if (element["chapter"][i + 1] !== {}) {
              chapter[i][e] = [element["chapter"][i + 1]];
            }
          } else if (!chapter[i][e].includes(element["chapter"][i + 1])) {
            if (element["chapter"][i + 1] !== {}) {
              chapter[i][e].push(element["chapter"][i + 1]);
            }
          }
        }
      });
    });

    var levels = {};
    Object.keys(chapter).forEach((key) => {
      Object.keys(chapter[key]).forEach((c) => {
        levels[c] = key;
      });
    });
    tempState["courseLevel"] = levels;
    tempState["allChapters"] = chapter;
    // setState({
    //   ...state,
    //   courseLevel: levels,
    //   allChapters: chapter
    // })
    setState({
      ...tempState
    })
    // state.setCourseLevel(levels);
    // state.setAllChapters(chapter);
  });
  //return state;
}

  export function getTagInfo(state, setState) {
    axios({
      method: "post",
      url: state.homepage+"/tags",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        course: state.course,
        courseId: state.courseId,
        start: state.start,
        end: state.end,
        path: state.dataPath,
      },
    }).then((response) => {
      var data = JSON.parse(response.data)["documents"];
      //state.setTagData(data);
      var types = [];
      var linkedData = {};
      data.forEach((d) => {
        linkedData[d["_id"]] = d["title"];
      });
      if (data.length > 1) {
        data.forEach((d) => {
          types.push(d["_id"]);
        });
        //setTagTypes(types)
      } else {
        //setTagTypes(data[0]['_id'])
        types.push(data[0]["_id"]);
      }
      setState({
        ...state,
        tagData: data,
        tagTypes: linkedData
      })
      //state.setTagTypes(linkedData);
    });
    return state;
  }
