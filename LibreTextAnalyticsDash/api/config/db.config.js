require("dotenv").config();
const express = require("express");
const cors = require("cors");

module.exports = {
  coll: process.env.COLL,
  pageColl: process.env.PCOLL,
  adaptColl: process.env.ACOLL,
  metaColl: process.env.TCOLL,
  db: process.env.DB,
  dataSource: process.env.SRC,
  enrollColl: process.env.ECOLL,
  codesColl: process.env.CODES,
  gradesColl: process.env.GCOLL
}
