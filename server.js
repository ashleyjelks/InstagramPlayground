var express = require('express'),
  path = require('path');
  // Instagram = require('instagram-node-lib');
  request = require('request');
  bodyParser = require('body-parser');
  url = 'https://api.instagram.com/v1/tags/houseofcards/media/recent?access_token=272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d';
  app = express();
  timestamp = require('unix-timestamp');

// Model here, refactor into seperate files later:
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/instagram');

// Model schema
var InstagramSchema = new mongoose.Schema({
  link: String,
  tags: Object,
  dateCreated: String,
  dateAsDateObject: Date
});

// Model based on schema
var InstagramPhotoObject = mongoose.model('InstagramPhotoObject', InstagramSchema);

app.get('/', function(req, res){
  request(url, function(error, response, body){
    // request data from API, parse and save in photoInfo object
    // then save data in mongodb
    if (!error && response.statusCode == 200) {
      var parsedData = JSON.parse(this.responseContent.body)['data'];

      res.send(parsedData);

      var photoInfo = {
        link: '',
        tags: '',
        dateCreated: '',
        dateAsDateObject: Date
      };

      for (var i = 0; i < parsedData.length; i++) {
        photoInfo.link = parsedData[i]['link']
        photoInfo.tags = parsedData[i]['tags']
        photoInfo.dateCreated = parsedData[i]['created_time']
        photoInfo.dateAsDateObject = timestamp.toDate(Number(photoInfo.dateCreated))

        var instagramPhotoObject = new InstagramPhotoObject({
          link: photoInfo.link,
          tags: photoInfo.tags,
          dateCreated: photoInfo.dateCreated,
          dateAsDateObject: photoInfo.dateAsDateObject
        });

        instagramPhotoObject.save(function(error){
          if (error){
            console.log(error);
          } else {
            console.log(instagramPhotoObject);
          }
        });
      }
    } if (error) {
      console.log(error)
    }
  })
});


app.listen(3000)

console.log('Running on port 3000');

module.exports = app;

