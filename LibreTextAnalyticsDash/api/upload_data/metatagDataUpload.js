const axios = require('axios');
const moment = require('moment');
const helper = require("../helper/helperFunctions.js");
require("dotenv").config();

const coll = process.env.COLL;
const tcoll = process.env.TCOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;

function pageIDsConfig(collection) {
  var groupBy = "$object.id";
  var subdomain = "$object.subdomain";
  if (collection === tcoll) {
    groupBy = "$pageId";
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

function getAllPageIDs() {
  var metatagIDsCall= axios(pageIDsConfig(tcoll));
  var ltPageIDsCall = axios(pageIDsConfig(coll));
  axios.all([metatagIDsCall, ltPageIDsCall]).then(function (responses) {
    var metatagIDs = [];
    responses[0].data['documents'].forEach((id) => {
      metatagIDs.push(id.subdomain+"-"+id._id);
    })
    lookThroughltPageIDs(metatagIDs, responses[1].data['documents']);
  }).catch(function (err) {
    console.log(err)
  })
}

function lookThroughltPageIDs(pageInfoIDs, ltPageIDs) {
  var page = "";
  var pageInfoAxiosCalls = [];
  ltPageIDs.forEach((id, index) => {
    page = id.subdomain+"-"+id._id;
    if (!pageInfoIDs.includes(page) && id._id !== "undefined") {
      getMetatagInfo(id, index);
    }
  })
}

function getMetatagInfo(page, time) {
  setTimeout(async function() {
    await axios.put('https://api.libretexts.org/endpoint/tags', {
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
        console.log(error)
      })
    }, time*1000);
}

function configureData(page, data) {
  var count = data['@count'];
  var href = data['@href'];
  var tagInfo = [];
  data['tag'].forEach(tag => {
    tagInfo = [
      page['_id'],
      count,
      href,
      tag['@value'],
      tag['@id'],
      tag['@href'],
      tag['title'],
      tag['type'],
      tag['uri'],
      page['subdomain']
    ]
    var insertOneQuery = {
      "collection": tcoll,
      "database": db,
      "dataSource": dataSource,
      "document":
      {
        'pageId': tagInfo[0],
        'count': tagInfo[1],
        'href': tagInfo[2],
        'value': tagInfo[3],
        '@id': tagInfo[4],
        '@href': tagInfo[5],
        'title': tagInfo[6],
        'type': tagInfo[7],
        'ui': tagInfo[8],
        'subdomain': tagInfo[9]
      }
    }
    var config = helper.insertOneAxiosCall(insertOneQuery);
    console.log(tagInfo[9]+"-"+tagInfo[0])
    axios(config).then((response) => console.log(response.data)).catch((err) => console.log(err));
  })
}

module.exports = { getAllPageIDs }
