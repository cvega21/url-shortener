var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const dns = require('dns');
const dnsPromises = require('dns').promises;
require('dotenv').config();

const urlSchema = new mongoose.Schema({
  url: String,
  id: Number
});

const ShortUrl = mongoose.model('Url', urlSchema);

const createNewUrlInstance = function(inputUrl) {
  mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
  let db = mongoose.connection;

  db.on('error', err => console.log(err));
  db.once('open', function() {
    let urlExists = ShortUrl.find({url: inputUrl});
    if (urlExists) {
      return 
    } else {
      let newMaxId = ShortUrl.find().sort({id: -1});
      const newUrl = new ShortUrl({url: inputUrl, id: newMaxId});
      newUrl.save((error, newUrl) => {
        if (error) return console.log('there was an error.');
        console.log('new document has been saved.')      
      })
    }
  });
}

router.get('/', function(req, res, next) {
  res.send('respond with a resource');

  mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
  let db = mongoose.connection;
  db.on('error', err => console.log(err));
  db.once('open', () => {
    // const newUrl = new ShortUrl({url: 'https://www.google.com', id: 2});
    // newUrl.save((error, newUrl) => {
    //   if (error) return console.log('there was an error.');
    //   console.log('new document has been saved.')      
    // })
    // ShortUrl.find((err, urls) => {
    //   if (err) return console.error(err);
    //   console.log(urls);
    // });
    ShortUrl.find({}, (err, urls) => {
      console.log(urls[urls.length - 1]['id']);
      let newMaxId = urls[urls.length - 1]['id'] + 1;
      console.log(newMaxId);
    });
  });
});

router.get('/:id?', function(req, res, next) {
  let urlIdToSearch = req.params.id;
  
  mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
  let db = mongoose.connection;
  db.on('error', err => console.log(err));
  db.once('open', () => {
    ShortUrl.find({id: urlIdToSearch}, (err, urlObject) => {
      if (err) return res.send({error: 'invalid url'});
      let urlToRedirectTo = urlObject[0]['url']
      res.redirect(urlToRedirectTo);
    });
  });
});

router.post('/:url?', function(req, res, next) {
  let urlToValidate = req.body.url;
  
  async function checkIfUrlIsValid () {
    let urlObject = new URL(req.body.url);
    let urlHost = urlObject.host;
    let urlIsValid = false;
    
    dnsPromises.setServers(['8.8.8.8','[2001:4860:4860::8888]']);
    
    console.log('Checking if URL is valid...')
    return dnsPromises.resolve(urlHost)
    .then(urlResults => {
      urlIsValid = true;
      console.log(`${urlHost} is valid and resolved to ${urlResults}`);
      return urlResults;
    })
  }

  async function checkIfUrlExists () {
    console.log('Checking if URL exists in DB...')
    await mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const asyncUrlFinder = await ShortUrl.find({url: urlToValidate});
    mongoose.connection.close();
    return asyncUrlFinder
  }
  
  async function createNewUrlRecord () {
    console.log('Creating new record...')
    await mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const allUrls = await ShortUrl.find({});
    let newMaxId = allUrls[allUrls.length - 1]['id'] + 1;
    const newUrlRecord = new ShortUrl({url: urlToValidate, id: newMaxId});
    console.log({url: urlToValidate, id: newMaxId});
    res.send({url: urlToValidate, id: newMaxId});
    mongoose.connection.close();
  }
  
  checkIfUrlIsValid()
  .then(() => {
    checkIfUrlExists().then((urlFound) => {
      let urlRecordAlreadyExists = Object.keys(urlFound).length;  
      if (urlRecordAlreadyExists) {
        let existingUrlRecord = {"url": urlFound[0]['url'], "id": urlFound[0]['id']};
        console.log(`This URL already exists in the DB: ${existingUrlRecord.url}`);
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
