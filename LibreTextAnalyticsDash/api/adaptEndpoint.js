var axios = require('axios');
const fs = require('fs');
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());
require("dotenv").config();

const coll = process.env.COLL;
const db = process.env.DB;
const dataSource = process.env.SRC;
const token = process.env.auth;

function getAllData() {
  var config = {
    method: 'GET',
    url: 'https://dev.adapt.libretexts.org/api/analytics',
    responseType: "stream",
    headers: { Authorization: `Bearer ${token}` }
  }

  axios(config).then(function (response) {
    //fs.writeFileSync('adapt.csv', response.data)
    response.data.pipe(fs.createWriteStream("analytics.zip"));
    //console.log(response)
  }).catch(function (error) {
    console.log(error)
  })
}

function mongoConfig(data) {
  var query = {
    "collection": "adapt",
    "database": db,
    "dataSource": dataSource,
    "document": data
  }

    var config = {
      method: 'POST',
      url: insertMany,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(query)
    }
    return config;
}

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getUTCDate()).padStart(2, '0');

  const joined = [year, month, day].join('-');
  return joined;
}

function getByWeek(startDate, endDate) {
  console.log(startDate, endDate)
  console.log(formatDate(startDate))
  console.log(formatDate(endDate))
}

async function writeToMongo(data) {
 console.log(data)
  var query = {
    "collection": "adapt",
    "database": db,
    "dataSource": dataSource,
    "document": data
  }
  var count = 0
    var config = {
      method: 'POST',
      url: insertOne,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(query)
    }
    await axios(config).then(function (response) {
      //console.log(response)
    }).catch(function (error) {
      count = count + 1
      //onsole.log(count)
      //console.log(error)
    })
}

function deleteAll() {
  var queryString = {
    "collection": "adapt",
    "database": db,
    "dataSource": dataSource,
    "filter": {}
  }
  var config = {
      method: 'post',
      url: deleteMany,
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

function getURLs(init, start, end) {
  if (typeof(start) !== "string") {
  //console.log(formatDate(start))
    start = formatDate(start)
  }
  if (typeof(end) !== "string") {
    end = formatDate(end)
  }
  var allConfigs = []
  start = new Date(start)
  var last = false
  var count = 0
  while ((start >= init) || last) {
    if (typeof(start) !== "string") {
      start = formatDate(start)
    }
    if (typeof(end) !== "string") {
      end = formatDate(end)
    }
    var url = 'https://adapt.libretexts.org/api/analytics/'+start+'/'+end
    var config = {
      method: 'GET',
      url: url,
      headers: { Authorization: `Bearer ${token}` }
    }
    allConfigs.push(config)
    end = new Date((new Date(start)).getTime())
    start = new Date(start)
    start.setUTCDate(start.getUTCDate()-7)

    if (last && (count === 1)) {
      last = false
    }
    if ((count === 0) && (start <= init)) {
      count = 1
      last = true
    }
  }

  //start = (new Date(start)).setDate((new Date(start)).getDate()-7)
  return allConfigs
}

const adaptRequest = async (config) => {
  let res = axios(config).then(response => response.data)
  console.log(res.data)
  return await res
}

async function adapt(config) {
  //console.log(config.url)
  var res = await axios(config).then(response => response.data).catch(error => console.log(error))
  //console.log(res)
  if (res && typeof(res) !== "string") {
    res.forEach(r => {
      //console.log(r)
      writeToMongo(r)
    })
  }
}

// async function adaptRequest(config) {
//   //console.log(start, end)
//   // console.log(start)
//   // if (typeof(start) !== "string") {
//   // console.log(formatDate(start))
//   //   start = formatDate(start)
//   // }
//   // if (typeof(end) !== "string") {
//   //   end = formatDate(end)
//   // }
//   // var url = 'https://adapt.libretexts.org/api/analytics/'+start+'/'+end
//   // //console.log(url)
//   // var config = {
//   //   method: 'GET',
//   //   url: url,
//   //   headers: { Authorization: `Bearer ${token}` }
//   // }
//   var allData = []
//
//   return await axios(config).then(function (response) {
//     response.data
//     //console.log(allData)
//     //return allData
//     //writeToMongo(allData[1])
//     //console.log(typeof(allData))
//
//     // if (response.data) {
//     //   allData.forEach(d => {
//     //     //console.log(d)
//     //     //writeToMongo(d)
//     //   })
//     // }
//   }).catch(function (error) {
//     console.log(error)
//   })
//   //return allData
//   // var t = new Date(start)
//   // //console.log(start)
//   // //console.log(new Date(t.setDate(t.getDate()-7)))
//   // return new Date(t.setUTCDate(t.getUTCDate()-7))
//   // //console.log(allData)
// }

function getLastDate(config) {
  fs.readFile('analytics.csv', 'utf8', (err, data) => {
    //console.log(data)
    if (err) {
      console.error(err);
      return;
    }
    var rows = data.split(/\r?\n/)
    //console.log(rows[rows.length-2])
    var items = rows[rows.length-2].split(",")
    var first = rows[1].split(",")
    var init = new Date(first[3].split(" ")[0].replace("\"", ""))
    //console.log(items)
    var lastDate = new Date(items[3].split(" ")[0].replace("\"", ""))
    var endDate = new Date(lastDate.getTime());
    var startDate = new Date(lastDate.setUTCDate(lastDate.getUTCDate()-7))
    //getByWeek(startDate, endDate)
    var start = formatDate(startDate)
    var end = formatDate(endDate)
    //console.log(start, end)
    //var newStart = adaptRequest(start, end)

    var newEnd = new Date(new Date(start).getTime())
    var newStart = new Date(new Date(start).getTime())

    var configs = []
    configs = getURLs(init, start, end)
    //adapt(configs[0])
    configs.forEach(config => {
      adapt(config)
    })
    //console.log(urls)
    // while (newStart >= init) {
    //   //console.log(newStart, newEnd)
    //   console.log("HERE")
    //   var s = new Date(newStart)
    //   newEnd = new Date(s.setUTCDate(s.getUTCDate()+7))
    //
    //   urls.push(getURLs(newStart, newEnd))
    //   console.log(newStart)
    //   //newStart = adaptRequest(newStart, newEnd)
    //
    //   //var time = new Date(newEnd)
    //   //newEnd = new Date(time.setDate(time.getDate()-7))
    //   //console.log(newStart, newEnd)
    //   //console.log(newEnd)
    // }
    //console.log(urls)
    var allRows = []
    rows.forEach((row, index) => {
      //console.log(row)
      if (index !== rows.length-1) {
        var entries = row.split(",")
        var r = {
          id: entries[0],
          anon_student_id: entries[1],
          session_id: entries[2],
          time: entries[3],
          level: entries[4],
          level_name: entries[5],
          level_group: entries[6],
          level_scoring_type: entries[7],
          level_points: entries[8],
          number_of_attempts_allowed: entries[9],
          problem_name: entries[10],
          problem_points: entries[11],
          library: entries[12],
          page_id: entries[13],
          problem_view: entries[14],
          outcome: entries[15],
          due: entries[16],
          school: entries[17],
          class: entries[18],
          class_name: entries[19],
          instructor_name: entries[20],
          instructor_email: entries[21],
          status: entries[22],
          class_start_date: entries[23]
        }
        allRows.push(r)
        //console.log(r)
      }
    })
    // var config = mongoConfig(allRows)
    // axios(config).then(function (response) {
    //
    // }).catch(function (error) {
    //   console.log(error)
    // })
    //console.log(allRows)
  });
}

//getAllData()
//deleteAll()
getLastDate()
