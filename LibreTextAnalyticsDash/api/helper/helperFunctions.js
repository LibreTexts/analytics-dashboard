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
  adaptCodes,
  enrollmentData,
  course,
  allCourses,
  dates
) {
  var codeFound = adaptCodes.find((o) => o.course === course);
  var courseCode = codeFound ? parseInt(codeFound.code) : null;

  var studentEnrollment = [];
  if (codeFound) {
    var studentEnrollment = enrollmentData.find((o) => o._id === courseCode);
    studentEnrollment.dates = studentEnrollment.dates
      .map((d) => new Date(d))
      .sort((a, b) => {
        return a < b;
      });
    var start = new Date(studentEnrollment.dates[0]);
    var end = studentEnrollment.dates.pop();

    //checking the adapt dates against the dates on the lt data to see if it's the right term
    if (allCourses && allCourses.length > 0) {
      var index = Object.keys(allCourses).find(c => allCourses[c]._id === course)
      var date = new Date(JSON.parse(JSON.stringify(allCourses[index])).date)
      const diffTime = Math.abs(date - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 14) {
        return [];
      }
    }
    //work here to find dates and check them against actual lt dates
    //change the enrollment dates to Date objects and compare
    return studentEnrollment["students"];
  } else {
    return [];
  }
}

module.exports = { encryptStudent, decryptStudent, getRequest, findEnrollmentData }
