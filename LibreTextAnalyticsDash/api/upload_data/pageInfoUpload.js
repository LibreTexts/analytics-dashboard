const axios = require('axios');
const moment = require('moment');
const helper = require("./helperFunctions.js");
require("dotenv").config();

const coll = process.env.COLL;
const pcoll = process.env.PCOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;

function pageIDsConfig(collection) {
  var groupBy = "$object.id";
  var subdomain = "$object.subdomain";
  if (collection === pcoll) {
    groupBy = "$id";
    subdomain = "$subdomain"
  }
  var query = {
    "collection": collection,
    "database": db,
    "dataSource": dataSource,
    "pipeline": [
      {
        '$group': {
          '_id': groupBy,
          'subdomain': {'$first': subdomain}
        }
      }
    ]
  }
  var config = {
      method: 'post',
      url: process.env.URL,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': process.env.API_KEY
      },
      data: JSON.stringify(query)
  };
  return config;
}

// get all page ids from both, check to see if there are lt page ids that aren't in pageinfo
// take all page ids that aren't in pageinfo and push to a config that'll get mindtouch data
// take the data and configure it into the data structure for mongodb

function getAllPageIDs() {
  var pageInfoIDsCall= axios(pageIDsConfig(pcoll));
  var ltPageIDsCall = axios(pageIDsConfig(coll));
  axios.all([pageInfoIDsCall, ltPageIDsCall]).then(function (responses) {
    var pageInfoIDs = [];
    responses[0].data['documents'].forEach((id) => {
      pageInfoIDs.push(id.subdomain+"-"+id._id);
    })
    lookThroughltPageIDs(pageInfoIDs, responses[1].data['documents']);
  }).catch(function (err) {
    console.log(err)
  })
}

function lookThroughltPageIDs(pageInfoIDs, ltPageIDs) {
  var page = "";
  var pageInfoAxiosCalls = [];
  ltPageIDs.forEach((id, index) => {
    page = id.subdomain+"-"+id._id;
    if (!pageInfoIDs.includes(page)) {
      getPageInfo(id, index);
    }
  })
}

// make into an insert many function? return the axios call to put into an array??
// return just the parameters from the call, and then figure out how to do an axios.all or Promises call on a put call
function getPageInfo(page, time) {
  setTimeout(async function() {
    await axios.put('https://api.libretexts.org/endpoint/info', {
      subdomain: page['subdomain'],
      path: page['_id'],
      dreamformat: 'json',
      },
      {
        headers: {
          origin: 'analytics.libretexts.org'
        }
      }).then(function (response) {
        configureData(page, response.data)
      }).catch(function (error) {
        console.log(page.subdomain+"-"+page._id+" failed")
        console.log(error.data)
      })
    }, time*1000);
}

function configureData(page, data) {
  var pageInfo = [
    page['_id'],
    data['title'],
    data['path']['@type'],
    data['path']['#text'],
    data['path']['#text'].split("/")[2],
    data['uri.ui']
  ]
  var text = pageInfo[3].split("/")
  var subdomain = pageInfo[5].split('/')[2].split(".")[0]
  var chapter = null;
  if (text.length > 4) {
    chapter = text[text.length-2]
  } else if (text.length === 4) {
    chapter = text[text.length-1]
  }
  var insertOneQuery = {
    "collection": pcoll,
    "database": db,
    "dataSource": dataSource,
    "document":
    {
      'id': pageInfo[0],
      'title': pageInfo[1],
      'type': pageInfo[2],
      'text': pageInfo[3],
      'courseName': pageInfo[4],
      'url': pageInfo[5],
      'subdomain': subdomain,
      'path': text,
      'chapter': chapter
    }
  }
  var config = helper.insertOneAxiosCall(insertOneQuery);
  console.log(subdomain+"-"+pageInfo[0])
  axios(config).then((response) => console.log(response.statusText)).catch((err) => console.log(err));
}

module.exports = { getAllPageIDs }
