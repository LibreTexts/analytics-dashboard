var axios = require('axios');
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
app.use(bodyParser.json());
app.use(cors());
require("dotenv").config();
const basicAuth = require('express-basic-auth');

const coll = process.env.COLL;
const pageColl = process.env.PCOLL;
const adaptColl = process.env.ACOLL;
const db = process.env.DB;
const dataSource = process.env.SRC;
const hashKey = process.env.studentHash;
const userPassword = process.env.userPassword;

var adaptCodeQuery = {
  "collection": "adaptCodes",
  "database": db,
  "dataSource": dataSource,
  "pipeline": [
    {
      '$group': {
        '_id': '$url',
        'code': {'$first': '$adaptCode'},
        'course': {'$first': '$courseId'},
        'isInAdapt': {'$first': '$isInAdapt'}
      }
    }
  ]
}

function getAdaptQuery(params) {

  // var arr = params.course.split("_")
  // var index = arr.findIndex(value => /\d/.test(value))
  // var course = arr[index-1]+" "+arr[index]

  var data = {
    "collection": adaptColl,
    "database": db,
    "dataSource": dataSource,
    "pipeline": [
      {
        "$match": {
          '$expr': {
            '$eq': ['$class', params.course]
          }
        }
      },
      {
        "$group": {
          '_id': '$anon_student_id',
          'adaptLastDate': {'$max': '$time'},
          'adaptObjects': {'$addToSet': '$problem_name'}
        }
      },
      {
        "$addFields": {
          'uniqueAssignments': {'$size': '$objects'}
        }
      }
    ]
  }
  return data
}

function adaptLevelQuery(params, adaptCodes) {
  //console.log(params.courseId)
    var codeFound = adaptCodes.find(o => o.course === params.courseId)
    //console.log(codeFound)
    var data = {
      "collection": adaptColl,
      "database": db,
      "dataSource": dataSource,
      "pipeline": [
        {
          '$match': {
            '$expr': {
              '$and': [
                {'$eq': ["$class", codeFound.code]}
              ]
            }
          }
        },
        {
          '$group': {
            '_id': {
              'level_group': '$level_group',
              'level_name': '$level_name'
            }
          }
        },
        {
          '$group': {
            '_id': '$_id.level_group',
            'level_name': {'$addToSet': '$_id.level_name'}
          }
        }
      ]
    }
    return data;
}

module.exports = { adaptCodeQuery, getAdaptQuery, adaptLevelQuery }
