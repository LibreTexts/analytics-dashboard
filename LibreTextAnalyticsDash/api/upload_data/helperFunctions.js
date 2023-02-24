const moment = require("moment");
const { Parse } = require("unzipper");
var axios = require("axios");
const fs = require("fs");
const { createWriteStream, createReadStream } = require("fs");
require("dotenv").config();

const db = process.env.DB;
const dataSource = process.env.SRC;
const token = process.env.auth;

function encryptStudent(student) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.studentHash;
  const iv = Buffer.from(key, 'hex');
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  student = cipher.update(student, 'utf8', 'hex')
  student += cipher.final('hex')

  return student;
}

async function unzipFile(getNextDataFunction, currentId = null) {
  const unzip = () => {
    const stream = createReadStream("analytics.zip").pipe(Parse());

    return new Promise((resolve, reject) => {
      stream.on("entry", (entry) => {
        const writeStream = createWriteStream(`${entry.path}`);
        return entry.pipe(writeStream);
      });
      stream.on("finish", () => {
        resolve();
        console.log("File unzipped");
        getNextDataFunction(currentId);
      });
      stream.on("error", (error) => reject(error));
    });
  };

  (async () => {
    try {
      await unzip();
    } catch (err) {
      console.error(err);
    }
  })();
}

function moveFiles(
  csvPath = "./analytics.csv",
  zipPath = "./analytics.zip",
  newCsvPath = "./Archive/analytics_" + moment().format("MM-DD-YY") + ".csv",
  newZipPath = "./Archive/analytics_" + moment().format("MM-DD-YY") + ".zip"
) {
  if (!fs.existsSync("./Archive")) {
    fs.mkdirSync("./Archive")
  }
  if (fs.existsSync(csvPath)) {
    fs.rename(csvPath, newCsvPath, function (error) {
      if (error) {
        console.log("Error moving analytics.csv");
        throw error;
      } else {
        console.log("analytics.csv file moved");
      }
    });
  }
  if (fs.existsSync(zipPath)) {
    fs.rename(zipPath, newZipPath, function (error) {
      if (error) {
        console.log("Error moving analytics.zip");
        throw error;
      } else {
        console.log("analytics.zip file moved");
      }
    });
  }
}

async function getAllData(
  getNextDataFunction,
  currentId = null,
  path = "./analytics.csv",
  zipPath = "./analytics.zip"
) {
  if (
    !fs.existsSync(path) ||
    (!fs.existsSync(path) && !fs.existsSync(zipPath))
  ) {
    var config = {
      method: "GET",
      url: "https://dev.adapt.libretexts.org/api/analytics",
      responseType: "stream",
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios(config)
      .then(function (response) {
        var stream = response.data.pipe(fs.createWriteStream("analytics.zip"));
        stream.on("finish", function (x) {
          console.log("Analytics zip file downloaded");
          unzipFile(getNextDataFunction, currentId);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  } else if (fs.existsSync(zipPath) && !fs.existsSync(path)) {
    unzipFile(getNextDataFunction, currentId);
  } else {
    getNextDataFunction(getNextDataFunction, currentId);
  }
}

function deleteAll(coll) {
  var queryString = {
    "collection": coll,
    "database": db,
    "dataSource": dataSource,
    "filter": {}
  }
  var config = {
      method: 'post',
      url: process.env.deleteManyURL,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(queryString)
  };
  axios(config).then(function (response) {

  }).catch(function (error) {
    console.log(error)
  })
}

function deleteOneCourse(coll, course) {
  // for now, configured only to delete course data from the gradebook or enrollments collection
  if (course !== null) {
    if (coll === process.env.GCOLL && typeof course === "number") {
      course = String(course)
    } else if (coll === process.env.ECOLL && typeof course === "string") {
      course = parseInt(course)
    }
    // console.log({'class': course})
    var queryString = {
      "collection": coll,
      "database": db,
      "dataSource": dataSource,
      "filter": { 'class': course }
    }
    var config = {
        method: 'post',
        url: process.env.deleteManyURL,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': process.env.API_KEY
        },
        data: JSON.stringify(queryString)
    };
    axios(config).then(function (response) {
      console.log("Deleted course "+course)
    }).catch(function (error) {
      console.log(error)
    })
  } else {
    console.log("Could not delete without a course selected.")
  }
}

async function writeToMongoDB(data) {
  var promises = []
  for (const config of data) {
    //console.log(JSON.parse(config.data)['documents'][0]['email'])
    promises.push(await axios(config).then(function (response) {
        console.log(response.statusText)
        //console.log(response.data)
      }).catch(function (error) {
        console.log(error)
      })
    )
  }
  Promise.all(promises).then(() => console.log("Data uploaded")).catch((err) => console.log(err.response));
}

function getAxiosCall(coll, data) {
  var query = {
    collection: coll,
    database: db,
    dataSource: dataSource,
    documents: data, //change to document (single) when using insertOne
  };
  var config = {
    method: "POST",
    url: process.env.insertManyURL,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key": process.env.API_KEY,
    },
    data: JSON.stringify(query),
  };
  return config;
}

function insertOneAxiosCall(query) {
  // var query = {
  //   collection: coll,
  //   database: db,
  //   dataSource: dataSource,
  //   document: data, //change to document (single) when using insertOne
  // };
  var config = {
    method: "POST",
    url: process.env.insertOneURL,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key": process.env.API_KEY,
    },
    data: JSON.stringify(query),
  };
  return config;
}

module.exports = { encryptStudent, unzipFile, moveFiles, getAllData, deleteAll, writeToMongoDB, getAxiosCall, insertOneAxiosCall, deleteOneCourse }
