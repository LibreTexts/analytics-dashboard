const helper = require("./helperFunctions.js");
var axios = require("axios");
const fs = require("fs");

const coll = process.env.ECOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;

function getAxiosFindCall(data) {
  var query = {
    "collection": coll,
    "database": db,
    "dataSource": dataSource,
    "filter": data[0],
    "update": data[1],
    "upsert": true
  }
  var config = {
    method: 'POST',
    url: process.env.updateOneURL,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': process.env.API_KEY
    },
    data: JSON.stringify(query)
  }
  return config
}

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getUTCDate()).padStart(2, '0');

  const joined = [year, month, day].join('-');
  return joined;
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
    var url = 'https://adapt.libretexts.org/api/analytics/enrollments/'+start+'/'+end
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

function delay(config, time) {
  //console.log(moment().format())
  setTimeout(async function() {
    adapt(config)
  }, time*1000);
  //return new Promise(resolve => setTimeout(resolve, time));
}

async function adapt(config) {
  //console.log(config.url)
  var res = await axios(config).then(response => response.data).catch(error => console.log(error.request.path))
  //console.log(res)
  //fs.writeFileSync('adaptEnrollment.json', '')
  var allConfigs = []
  if (res && typeof(res) !== "string") {
    res.forEach(r => {
      //console.log(r)
      r.email = helper.encryptStudent(r.email)
      //allConfigs.push(getAxiosCall(r))
      allConfigs.push(getAxiosFindCall([r, {'$setOnInsert': r}])) //work here, create delay
      //fs.appendFileSync('adaptEnrollment.json', JSON.stringify(r))
      //fs.appendFileSync('adaptEnrollment.json', ",")
    })
    helper.writeToMongoDB(allConfigs)
  }

}

function getLastDate() {
  //fs.writeFileSync("adaptEnrollment.json", "[")
  fs.readFile('analytics.csv', 'utf8', (err, data) => {

    if (err) {
      console.error(err);
      return;
    }
    var rows = data.split(/\r?\n/)

    var items = rows[rows.length-2].split(",")
    var first = rows[1].split(",")
    var init = new Date(first[3].split(" ")[0].replace("\"", ""))

    var lastDate = new Date(items[3].split(" ")[0].replace("\"", ""))
    var endDate = new Date(lastDate.getTime());
    var startDate = new Date(lastDate.setUTCDate(lastDate.getUTCDate()-7))

    var start = formatDate(startDate)
    var end = formatDate(endDate)

    var newEnd = new Date(new Date(start).getTime())
    var newStart = new Date(new Date(start).getTime())

    var configs = []
    configs = getURLs(init, start, end)

    configs.forEach((config, index) => {
      //console.log(config)
      //adapt(config)
      delay(config, index)
    })
  });
}
