var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const dns = require('dns');
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

/* GET all urls. */
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
  
  try {
    dns.resolve(urlToValidate, () => {})
  } catch (err) {
    throw err;
  }

  async function checkIfUrlExists () {
    await mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let db = mongoose.connection;
    ShortUrl.
    find({url: urlToValidate}).
    select('url id')
    .then((urls) => {
      let responseObject = {url: urls[0]['url'], id: urls[0]['id']};
      console.log(responseObject);
      res.send(responseObject);
    }).then(() => {
      db.close();
    }).catch((err) => {
      console.error('[ERROR] the url is not in the database.');
      console.error(err);
    })
  }

  async function asyncCheckIfUrlExists () {
    let checker = await checkIfUrlExists;
    if (checker === 'hello') return console.log('yes!!!!');
  }

  async function run () {
    await mongoose.connect(process.env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let db = mongoose.connection;
    
    await ShortUrl.
    find({}).
    select('url id').
    exec((err, urls) => {
      if (err) {
        res.send({error: 'invalid url'});
      } else {
          let newMaxId = urls[urls.length - 1]['id'] + 1;
          const newUrlRecord = new ShortUrl({url: urlToValidate, id: newMaxId});
          console.log('2!')
          res.send(newUrlRecord);
      }
    });

  }
  
  asyncCheckIfUrlExists()
});

module.exports = router;
