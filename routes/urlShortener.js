var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
require('dotenv').config();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  const client = mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

module.exports = router;
