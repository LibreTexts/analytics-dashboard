const dbInfo = require("../config/db.config.js");

const crypto = require("crypto");

function encryptStudent(student) {
  const algorithm = "aes-256-cbc";
  const key = process.env.studentHash;
  const iv = Buffer.from(key, "hex");
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  student = cipher.update(student, "utf8", "hex");
  student += cipher.final("hex");

  return student;
}

function decryptStudent(student) {
  const algorithm = "aes-256-cbc";
  const key = process.env.studentHash;
  const iv = Buffer.from(key, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = "";
  let chunk;
  decipher.on("readable", () => {
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk.toString("utf8");
    }
  });

  decipher.write(student, "hex");
  decipher.end();
  return decrypted;
}

function getRequest(queryString) {
  var config = {
    method: "post",
    url: process.env.URL,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key": process.env.API_KEY,
    },
    data: JSON.stringify(queryString),
  };
  return config;
}

//find a course in the adapt data, find student enrollment
function findEnrollmentData(
  enrollmentData,
  course,
  adaptCourse,
  environment
) {
  // console.log(course, adaptCourse, environment, courseCode)
  var studentEnrollment = [];
  if (environment === "production" && enrollmentData && (adaptCourse ? adaptCourse : course)) {
    var studentEnrollment = enrollmentData.find((o) => o._id === parseInt(adaptCourse ? adaptCourse : course));
    // console.log(studentEnrollment)
    if (studentEnrollment === undefined) {
      return []
    }
    //work here to find dates and check them against actual lt dates
    //change the enrollment dates to Date objects and compare
    return studentEnrollment["students"];
  } else {
    return [];
  }
}

function calculatePercentile(studentData) {
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

module.exports = { encryptStudent, decryptStudent, getRequest, findEnrollmentData, calculatePercentile }
