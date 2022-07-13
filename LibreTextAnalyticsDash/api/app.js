import {
  realCourseQuery,
  allDataQuery,
  getTagQuery,
  timelineQuery,
  unitsQuery
} from "./mainFunctions.js";
import {
  studentChartQuery,
  studentAssignmentQuery
} from "./studentView.js";
import {
  pageViewChartQuery,
  individualPageViewChartQuery,
  getIndividual
} from "./pageView.js";
import {
  adaptCodeQuery,
  getAdaptQuery,
  adaptLevelQuery
} from "./assignmentView.js";

import axios from 'axios';
import express from 'express';
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
app.use(bodyParser.json());
app.use(cors());
import dotenv from 'dotenv';
dotenv.config();
import basicAuth from 'express-basic-auth';

const coll = process.env.COLL;
const pageColl = process.env.PCOLL;
const adaptColl = process.env.ACOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;
const hashKey = process.env.studentHash;
const userPassword = process.env.userPassword;

app.use(basicAuth({
    users: { 'admin': userPassword },
    challenge: true
}))

function encryptStudent(student) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.studentHash;
  const iv = Buffer.from(key, 'hex');
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  student = cipher.update(student, 'utf8', 'hex')
  student += cipher.final('hex')

  return student;
}

function decryptStudent(student) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.studentHash;
  const iv = Buffer.from(key, 'hex');;

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = '';
  let chunk;
  decipher.on('readable', () => {
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk.toString('utf8');
    }
  });
  decipher.on('end', () => {
    //console.log(decrypted);
    // Prints: some clear text data
  });

  decipher.write(student, 'hex');
  decipher.end();
  return decrypted
}

var enrollmentQuery = {
  "collection": "enrollments",
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        // '_id': '$email',
        // 'courses': {'$addToSet': '$class'}
        '_id': '$class',
        'students': {'$addToSet': '$email'}
      }
    }
  ]
}

function getRequest(queryString) {
  var config = {
      method: 'post',
      url: process.env.URL,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(queryString)
  };
  return config;
}

  function findEnrollmentData(adaptCodes, enrollmentData, course) {
    //console.log(enrollmentData)
    var codeFound = adaptCodes.find(o => o.course === course)
    //console.log(codeFound)
    var courseCode = codeFound ? parseInt(codeFound.code) : null
    //console.log(courseCode)
    var studentEnrollment = []
    if (codeFound) {
      var studentEnrollment = enrollmentData.find(o => o._id === courseCode)
      return studentEnrollment['students']
    } else {
      return []
    }
    //console.log(studentEnrollment)
  }

  let libretextToAdaptConfig = getRequest(adaptCodeQuery)
  var adaptCodes = {}
  axios(libretextToAdaptConfig).then(function (response) {
    adaptCodes = (response.data['documents'])
    //console.log(adaptCodes)
  }).catch(function (error) {
    console.log(error)
  })

  let enrollmentConfig = getRequest(enrollmentQuery)
  var enrollmentData = {}
  axios(enrollmentConfig).then(function (response) {
    enrollmentData = (response.data['documents'])
    //console.log(enrollmentData)
  }).catch(function (error) {
    console.log(error)
  })

  let realCourseConfig = getRequest(realCourseQuery);
  let realCourseNames = {}
  axios(realCourseConfig)
    .then(function (response) {
      realCourseNames = response.data['documents']
    })
    .catch(function (error) {
      console.log(error)
    });

  app.get('/realcourses', (req, res) => {
    res.json(realCourseNames)
  })

function sendData(endpoint, queryFunction, dataChange, adaptCodes) {
  let queryString = ""
  //console.log(adaptCodes)
  app.post(endpoint, (req,res,next) => {
    let queryString = queryFunction(req.body, adaptCodes);
    let config = getRequest(queryString);
    axios(config)
        .then(function (response) {
          let newData = (response.data)
          dataChange(newData)
          newData = JSON.stringify(newData)
          res.json(newData);
        })
        .catch(function (error) {
            console.log(error);
        });

  });
}

app.post('/timelineData', (req,res,next) => {
  let queryString = timelineQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((d, index) => {
          if (d._id.length >= 20) {
            newData['documents'][index]._id = decryptStudent(d._id)
          }
        })
        if (newData['documents'][0]._id.includes('@')) {
          newData['studentTimelineData'] = newData['documents']
        } else {
          newData['pageTimelineData'] = newData['documents']
        }
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

// function allDataChange(newData) {
//   newData['documents'].forEach((student, index) => {
//     if (student._id.length >= 20) {
//       //console.log(student)
//       if (studentEnrollment.length > 0) {
//         if (studentEnrollment.includes(student._id)) {
//           newData['documents'][index]['isEnrolled'] = true
//         //console.log(true)
//           studentEnrollment.find((s, index) => {
//             if (s === student._id) {
//               studentEnrollment.splice(index, 1)
//             }
//           })
//         } else {
//           newData['documents'][index]['isEnrolled'] = false
//         }
//       } else if (studentEnrollment.length === 0) {
//         newData['documents'][index]['isEnrolled'] = true
//       }
//       newData['documents'][index]['hasData'] = true
//       newData['documents'][index]._id = decryptStudent(student._id)
//   }
//   })
//   if (studentEnrollment.length > 0 && newData['documents'][0]._id.length >= 20) {
//     //console.log(studentEnrollment)
//     studentEnrollment.forEach(s => {
//       //console.log(s)
//       newData['documents'].splice(0, 0, {
//         _id: decryptStudent(s),
//         isEnrolled: true,
//         hasData: false,
//         adapt: newData['documents'][1].adapt ? true : false
//       })
//     })
//   }
// }
// sendData('/data', allDataQuery, allDataChange, await adaptCodes)
app.post('/data', async (req,res,next) => {
  let queryString = allDataQuery(req.body, await adaptCodes);
  let config = getRequest(queryString);
  //console.log(enrollmentData)
  var studentEnrollment = JSON.parse(JSON.stringify(findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)))
  // console.log("STUDENT ENROLLMENT")
  // console.log(studentEnrollment)
  axios(config)
      .then(function async (response) {
        let newData = (response.data)
        newData['documents'].forEach((student, index) => {
          if (student._id.length >= 20) {
            //console.log(student)
            if (studentEnrollment.length > 0) {
              if (studentEnrollment.includes(student._id)) {
                newData['documents'][index]['isEnrolled'] = true
              //console.log(true)
                studentEnrollment.find((s, index) => {
                  if (s === student._id) {
                    studentEnrollment.splice(index, 1)
                  }
                })
              } else {
                newData['documents'][index]['isEnrolled'] = false
              }
            } else if (studentEnrollment.length === 0) {
              newData['documents'][index]['isEnrolled'] = true
            }
            newData['documents'][index]['hasData'] = true
            newData['documents'][index]._id = decryptStudent(student._id)
        }
        })
        if (studentEnrollment.length > 0 && newData['documents'][0]._id.length >= 20) {
          //console.log(studentEnrollment)
          studentEnrollment.forEach(s => {
            //console.log(s)
            newData['documents'].splice(0, 0, {
              _id: decryptStudent(s),
              isEnrolled: true,
              hasData: false,
              adapt: newData['documents'][1].adapt ? true : false
            })
          })
        }
        if (newData['documents'][0]._id.includes('@')) {
          newData['studentData'] = newData['documents']
        } else {
          newData['pageData'] = newData['documents']
        }
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/individual', (req,res,next) => {
  let queryString = getIndividual(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((s, index) => {
          newData['documents'][index]._id = decryptStudent(s._id)
        })
        newData['individual'] = newData['documents']
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/studentchart', (req,res,next) => {
  let queryString = studentChartQuery(req.body);
  let config = getRequest(queryString);
  var studentEnrollment = JSON.parse(JSON.stringify(findEnrollmentData(adaptCodes, enrollmentData, req.body.courseId)))
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((student, index) => {
          var allStudents = JSON.parse(JSON.stringify(student.students))
          student.students.forEach((s, i) => {
            if (s.length >= 20) {
              if (!studentEnrollment.includes(s)) {
                allStudents.find((st, n) => {
                  if (st === s) {
                    allStudents.splice(n, 1)
                  }
                })
                newData['documents'][index].count = newData['documents'][index].count - 1
              }
              // else {
              //   newData['documents'][index].students[i] = decryptStudent(s)
              // }
            }
          })
          allStudents.forEach((s, i) => {
            allStudents[i] = decryptStudent(s)
          })
          newData['documents'][index].students = allStudents
        })
        newData['studentChart'] = newData['documents']
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/pageviews', (req,res,next) => {
  let queryString = pageViewChartQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['pageViews'] = newData['documents']
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/individualpageviews', (req,res,next) => {
  let queryString = individualPageViewChartQuery(req.body, adaptCodes);
  // console.log("QUERY STRING")
  // console.log(queryString)
  let config = getRequest(queryString);
  //console.log(config)
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        if (req.body.individual) {
          newData['individualPageViews'] = newData['documents']
        } else {
          newData['individualAssignmentViews'] = newData['documents']
        }
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/studentassignments', (req,res,next) => {
  let queryString = studentAssignmentQuery(req.body, adaptCodes);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['documents'].forEach((d, index) => {
          newData['documents'][index]['_id']['student'] = decryptStudent(d['_id']['student'])
        })
        newData['studentAssignments'] = newData['documents']
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });
});


app.post('/adapt', (req,res,next) => {
  let queryString = getAdaptQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/adaptlevels', (req,res,next) => {
  let queryString = adaptLevelQuery(req.body, adaptCodes);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['adaptLevels'] = newData['documents']
        delete newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/tags', (req,res,next) => {
  let queryString = getTagQuery(req.body);
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['tags'] = newData['documents']
        newData = JSON.stringify(newData)
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

app.post('/chapters', (req,res,next) => {
  let queryString = unitsQuery(req.body)
  let config = getRequest(queryString);
  axios(config)
      .then(function (response) {
        let newData = (response.data)
        newData['chapters'] = newData['documents']
        newData = JSON.stringify(newData['documents'])
        res.json(newData);
      })
      .catch(function (error) {
          console.log(error);
      });

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
