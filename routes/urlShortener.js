var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const dnsPromises = require('dns').promises;
require('dotenv').config();

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const ShortUrl = mongoose.model('Url', urlSchema);

router.get('/', function(req, res, next) {
  res.send('enter an id to begin.');
});

router.get('/:id?', function(req, res, next) {
  let urlIdToSearch = req.params.id;

  async function checkIfIdExists() {
    await mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    ShortUrl.find({short_url: urlIdToSearch})
    .then((urlObject) => {
      let urlToRedirectTo = urlObject[0]['original_url'];
      res.redirect(urlToRedirectTo);
    })
    .catch((err) => {
      console.error('ID not found.');
      res.send('ID not found.');
      console.error(err);
    })
  }

  checkIfIdExists();
});

router.post('/:url?', function(req, res, next) {
  let urlToValidate = req.body.url;
  
  async function checkIfUrlIsValid () {
    let urlObject = new URL(req.body.url);
    let urlHost = urlObject.host;    
    dnsPromises.setServers(['8.8.8.8','[2001:4860:4860::8888]']);
     
    console.log('Checking if URL is valid...')
    return dnsPromises.resolve(urlHost)
    .then(urlResults => {
      console.log(`${urlHost} is valid and resolved to ${urlResults}`);
      return urlResults;
    })
  }

  async function checkIfUrlExists () {
    console.log('Checking if URL exists in DB...')
    await mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const asyncUrlFinder = await ShortUrl.find({original_url: urlToValidate});
    mongoose.connection.close();
    return asyncUrlFinder
  }
  
  async function createNewUrlRecord () {
    console.log('Creating new record...')
    await mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const allUrls = await ShortUrl.find({});
    let newMaxId = allUrls[allUrls.length - 1]['short_url'] + 1;
    const newUrlRecord = new ShortUrl({original_url: urlToValidate, short_url: newMaxId});
    console.log(`${newUrlRecord} was created. Now saving into DB...`)
    newUrlRecord.save()
    .then(() => {
      console.log('Document was saved!')      
    })
    .catch((err) => {
      console.log('Something went wrong while saving.')
      console.error(err)
    })
    .then(() => {
      console.log({original_url: urlToValidate, short_url: newMaxId});
      res.send({original_url: urlToValidate, short_url: newMaxId});
      mongoose.connection.close();
    })
  }
  
  checkIfUrlIsValid()
  .then(() => {
    checkIfUrlExists()
    .then((urlFound) => {
      let urlRecordAlreadyExists = Object.keys(urlFound).length;  
      if (urlRecordAlreadyExists) {
        let existingUrlRecord = {"original_url": urlFound[0]['original_url'], "short_url": urlFound[0]['short_url']};
        console.log(`This URL already exists in the DB: ${existingUrlRecord.original_url}`);
        res.send(existingUrlRecord);
      } else {
        console.log('URL does not exist in the DB.')
        createNewUrlRecord();
      }
    })
    .catch(err => {
      console.error(err);
    })
  })
  .catch(err => {
    console.log('URL is not valid!')
    console.error(err);
    res.send({"error":"Invalid Hostname"});
    return
  })

});

module.exports = router;
