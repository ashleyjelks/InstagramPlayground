var express = require('express'),
  path = require('path');
  request = require('request');
  bodyParser = require('body-parser');
  app = express();
  timestamp = require('unix-timestamp');

// Model here, refactor into seperate files later:
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/instagram');

// Model schema
var InstagramSchema = new mongoose.Schema({
  searchedTag: String,
  link: String,
  tags: Object,
  dateCreated: String,
  dateAsDateObject: Date,
  photoID: { type: String, unique:true }
});

// Model based on schema
var InstagramPhotoObject = mongoose.model('InstagramPhotoObject', InstagramSchema);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});


// send form data to query mongodb
// if photos meet search criteria and are already stored in db, render them
// otherwise hit Instagram API to save photos to db, then render them
app.get('/search', function(req, res) {
  var hashtag = req.query.hashtag;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  var url = 'https://api.instagram.com/v1/tags/' + hashtag + '/media/recent/?&MIN_TAG_ID='+ startDate + '&MAX_TAG_ID='+ endDate +'&access_token=272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d';
  var callback = function(error, data) {
    if (error) {
      return console.info(error);
    } else if ([]) {
      request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var parsedData = JSON.parse(this.responseContent.body)['data'];

          res.send(parsedData);

          var photoInfo = {
            searchedTag: '',
            link: '',
            tags: '',
            dateCreated: Date,
            dateAsDateObject: '',
            photoID: String
          };

          for (var i = 0; i < parsedData.length; i++) {
            photoInfo.searchedTag = hashtag
            photoInfo.link = parsedData[i]['link']
            photoInfo.tags = parsedData[i]['tags']
            photoInfo.dateCreated = parsedData[i]['created_time']
            photoInfo.dateAsDateObject = timestamp.toDate(Number(photoInfo.dateCreated))
            photoInfo.photoID = parsedData[i]['id']

            var instagramPhotoObject = new InstagramPhotoObject({
              searchedTag: photoInfo.searchedTag,
              link: photoInfo.link,
              tags: photoInfo.tags,
              dateCreated: photoInfo.dateCreated,
              dateAsDateObject: photoInfo.dateAsDateObject,
              photoID: photoInfo.photoID
            });

            instagramPhotoObject.save(function(error){
              if (error) {
                console.info(error);
              } else {
                console.info('saved to db');
              }
            });
          }
        } if (error) {
          console.info(error)
        }
      })
    } else {
      console.info(data);
    }
  };

  InstagramPhotoObject.find({
    searchedTag: hashtag,
    dateCreated: {
      $gte: timestamp.fromDate(startDate),
      $lt: timestamp.fromDate(endDate)
    }
  }, callback);
});

app.listen(3000)

console.log('Running on port 3000');

module.exports = app;

