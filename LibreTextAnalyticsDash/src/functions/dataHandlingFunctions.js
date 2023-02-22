//functions that are called when getting all data from mongoDB
//handles extra steps that need to be taken with the data before it gets put into state or localStorage

//creates the data table column values to show or hide
export function handleStudentData(key, value, tempState, courseData, allData) {
  //percentile(value.filter(student => student.isEnrolled === true || student.isEnrolled === "N/A"));
  if (tempState.adaptCourse && tempState.ltCourse) {
    tempState["hasAdapt"] = true;
    courseData["hasAdapt"] = true;
    allData["hasAdapt"] = true;
    var columns = {
      All: true,
      "LT Unique Pages Accessed": true,
      "LT Total Page Views": true,
      "LT Most Recent Page Load": true,
      "LT Unique Interaction Days": true,
      "LT Hours on Site": true,
      "ADAPT Unique Interaction Days": true,
      "ADAPT Unique Assignments": true,
      "ADAPT Most Recent Page Load": true,
      "ADAPT Average Percent Per Assignment": true,
      "ADAPT Average Attempts Per Assignment": false,
      "ADAPT Class Percentile": true
    };
  } else if (tempState.adaptCourse && !tempState.ltCourse) {
    tempState["hasAdapt"] = true;
    courseData["hasAdapt"] = true;
    allData["hasAdapt"] = true;
    columns = {
      All: true,
      "ADAPT Unique Interaction Days": true,
      "ADAPT Unique Assignments": true,
      "ADAPT Most Recent Page Load": true,
      "ADAPT Average Percent Per Assignment": true,
      "ADAPT Average Attempts Per Assignment": false,
      "ADAPT Class Percentile": true
    };
  } else {
    columns = {
      All: true,
      "LT Unique Pages Accessed": true,
      "LT Total Page Views": true,
      "LT Most Recent Page Load": true,
      "LT Unique Interaction Days": true,
      "LT Hours on Site": true,
    };
  }
  var checks = Object.keys(columns);
  tempState["tableColumns"] = columns;
  tempState["checkedValues"] = checks;
  courseData["tableColumns"] = columns;
  courseData["checkedValues"] = checks;
  allData["tableColumns"] = columns;
  allData["checkedValues"] = checks;
  courseData[key] = value;
}

//creates a structure to store adapt levels, replaces the quotation marks around the names
export function handleAdaptLevels(value, tempState, courseData, allData) {
  var levels = {};
  value.forEach((a) => {
    var names = [];
    a.level_name.forEach((o) => names.push(o.replaceAll('"', "")));
    levels[a._id.replaceAll('"', "")] = names;
  });
  tempState["adaptLevels"] = levels;
  courseData["adaptLevels"] = levels;
  allData["adaptLevels"] = levels;
}

//stores the students in an array dropdowns
export function handleAllStudents(value, tempState, courseData, allData) {
  var students = [];
  var encryptedStudents = [];
  value.forEach((v) => {
    if (v.isEnrolled) {
      students.push(v._id);
      encryptedStudents.push(v.displayModeStudent);
    }
  });
  tempState["encryptedStudents"] = encryptedStudents;
  courseData["encryptedStudents"] = encryptedStudents;
  tempState["allStudents"] = students;
  courseData["allStudents"] = students;
  allData["encryptedStudents"] = encryptedStudents;
  allData["allStudents"] = students;
}

//stores pages and page ids for dropdowns and to get metatags based on the page ids
export function handlePageTimelineData(value, tempState, courseData, allData) {
  var pages = [];
  var pageIds = [];
  value.forEach((p) => {
    if (p.pageTitle !== undefined) {
      pages.push(p.pageTitle);
    } else {
      pages.push(p._id);
    }
    pageIds.push(p._id);
  });
  tempState["allPages"] = pages;
  tempState["allPageIds"] = pageIds;
  courseData["allPages"] = pages;
  allData["allPages"] = pages;
  courseData["allPageIds"] = pageIds;
}

export function handleAggregateAssignmentViews(
  value,
  tempState,
  courseData,
  allData
) {
  tempState["aggregateAssignmentViews"] = value;
  tempState["aggregateAdaptEngagement"] = value;
  courseData["aggregateAssignmentViews"] = value;
  courseData["aggregateAdaptEngagement"] = value;
  allData["aggregateAssignmentViews"] = value;
  allData["aggregateAdaptEngagement"] = value;
}

export function handlePageViews(key, value, tempState, courseData, allData) {
  tempState[key] = value;
  tempState["aggregateTextbookEngagement"] = value;
  courseData[key] = value;
  courseData["aggregateTextbookEngagement"] = value;
  allData[key] = value;
  allData["aggregateTextbookEngagement"] = value;
}

//adapt-only courses use a different way of getting their students
export function handleAdaptStudents(value, tempState, courseData, allData) {
  var students = [];
  value.forEach((v) => {
    students.push(v._id);
  });
  tempState["allStudents"] = students;
  courseData["allStudents"] = students;
  allData["allStudents"] = students;
}

//puts the libretext course structure into an object to use for the course structure dropdown
export function handleChapters(value, tempState, courseData, allData) {
  var courseStructure = calculateCourseStructure(value);
  tempState["allChapters"] = courseStructure;
  courseData["allChapters"] = courseStructure;
  allData["allChapters"] = courseStructure;
}

export function handleGradebookData(value, tempState, courseData, allData) {
  tempState["allAssignmentGrades"] = value;
  var fromGradebook = value.filter(v => v.fromGradebook === true);
  tempState["gradesFromGradebook"] = fromGradebook.length > 0 ? true : false;
  courseData["gradesFromGradebook"] = fromGradebook.length > 0 ? true : false;
  allData["gradesFromGradebook"] = fromGradebook.length > 0 ? true : false;
  courseData["allAssignmentGrades"] = value;
  allData["allAssignmentGrades"] = value;
  if (!tempState["gradesFromGradebook"]) {
    tempState["studentData"].forEach((student, index) => {
      tempState["studentData"][index]["adaptCourseGrade"] = value.find(v => v._id === student.displayModeStudent) ? value.find(v => v._id === student.displayModeStudent).score : 0;
      //console.log(tempState["studentData"][index]["adaptCourseGrade"])
    })
    percentile(tempState["studentData"].filter(s => s.isEnrolled === true || s.isEnrolled === "N/A"));
    courseData["studentData"] = tempState["studentData"];
    allData["studentData"] = tempState["studentData"];
  }
}

export function handleChapterChart(
  value,
  tempState,
  courseData,
  allData,
  stateName = "aggregateChapterData",
  individual = false
) {
  var chapterData = tempState[stateName];
  var pages = tempState["pageLookup"];
  var binData = [];
  var chapterNames = [];
  chapterData.forEach((page, index) => {
    var pageInfo = pages.find((v) => v._id === page._id);
    if (pageInfo) {
      chapterData[index]["chapter"] = pageInfo.chapter;
      if (
        !chapterNames.includes(pageInfo.chapter) &&
        pageInfo.chapter !== null
      ) {
        chapterNames.push(pageInfo.chapter);
      }
    } else {
      chapterData[index]["chapter"] = null;
    }
  });
  chapterNames.forEach((chapter, index) => {
    var data = chapterData.filter((p) => p.chapter === chapter);
    var views = 0;
    var uniqueViews = 0;
    //console.log("data", data)
    data.forEach((d, i) => {
      views = views + d.viewCount;
      uniqueViews = uniqueViews + d.uniqueViewCount;
    });
    binData.push({
      _id: chapter,
      viewCount: views,
      uniqueViewCount: uniqueViews,
    });
  });
  tempState[stateName] = binData;
  if (!individual) {
    courseData[stateName] = binData;
    allData[stateName] = binData;
  }
}

export function handlePageLookup(value, tempState, courseData, allData) {
  var pageData = tempState["pageData"];
  pageData.forEach((page, index) => {
    var pageInfo = value.find((v) => v._id === page._id);
    //console.log(pageInfo)
    if (pageInfo) {
      pageData[index]["pageTitle"] = pageInfo["pageTitle"];
      pageData[index]["pageURL"] = pageInfo["pageURL"];
    } else {
      pageData[index]["pageTitle"] = null;
      pageData[index]["pageURL"] = null;
    }
  });
  pageData = pageData.filter((p) => p.pageTitle !== null);
  courseData["pageData"] = pageData;
  tempState["pageData"] = pageData;
  tempState["pageLookup"] = value;
  courseData["pageLookup"] = value;
  allData["pageLookup"] = value;
  allData["pageData"] = pageData;
}

//iterates through the course structure data and formats it
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
}

function percentile(studentData) {
  var i, count, percent;
  var arr = studentData.map(s => s.adaptCourseGrade);
  var n = arr.length;
  for (i = 0; i < n; i++) {
    count = 0;
    for (var j = 0; j < n; j++) {
      if (arr[i] > arr[j]) {
        count++;
      }
    }
    percent = (count * 100) / (n - 1);
    studentData[i]['percentile'] = Math.floor(percent);
    //doesn't score the overall grade linked to the student's email
    // delete studentData[i].adaptCourseGrade
  }
}
