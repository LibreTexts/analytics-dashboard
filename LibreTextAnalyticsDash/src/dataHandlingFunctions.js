

export function handleStudentData(key, value, tempState, courseData, allData) {
  if (
    tempState.adaptCourse &&
    tempState.ltCourse
  ) {
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
      "Adapt Unique Interaction Days": true,
      "Adapt Unique Assignments": true,
      "Adapt Most Recent Page Load": true,
      "Adapt Average Percent Per Assignment": true,
      "Adapt Average Attempts Per Assignment": true
    };
  } else if (
    tempState.adaptCourse &&
    !tempState.ltCourse
  ) {
    tempState["hasAdapt"] = true;
    courseData["hasAdapt"] = true;
    allData["hasAdapt"] = true;
    columns = {
      All: true,
      "Adapt Unique Interaction Days": true,
      "Adapt Unique Assignments": true,
      "Adapt Most Recent Page Load": true,
      "Adapt Average Percent Per Assignment": true,
      "Adapt Average Attempts Per Assignment": true
    }
  } else {
    columns = {
      All: true,
      "LT Unique Pages Accessed": true,
      "LT Total Page Views": true,
      "LT Most Recent Page Load": true,
      "LT Unique Interaction Days": true,
      "LT Hours on Site": true
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

export function handleAdaptStudents(value, tempState, courseData, allData) {
  var students = [];
  value.forEach((v) => {
    students.push(v._id);
  });
  tempState["allStudents"] = students;
  courseData["allStudents"] = students;
  allData["allStudents"] = students;
}

export function handleChapters(value, tempState, courseData, allData) {
  var courseStructure = calculateCourseStructure(value);
  tempState["allChapters"] = courseStructure;
  courseData["allChapters"] = courseStructure;
  allData["allChapters"] = courseStructure
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
}
