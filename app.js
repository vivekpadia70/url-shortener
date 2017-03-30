var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validurl = require('valid-url');
var rand = require('random-int')
var fs = require('fs')
var mongo = require('mongodb').MongoClient

var url = "mongodb://vivekpadia:webbergen@ds145370.mlab.com:45370/sites"
var number = 1;
var query = {'site_name':'sityy things'};
var nurl;
var substance = {};

var app = express();
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.get('/new/*', function(req, res){
  var surl = req.protocol + '://' + req.get('host');
  var name = req.params[0];
  var i = 0;
  if(validurl.isUri(name)){
    mongo.connect(url, function(err, db){
      var site = db.collection('sites')
      site.insert({'site_name': name, 'number': rand(100, 100000)}, function(err, data){
        var num = data.ops[0].number;
        nurl = surl+'/'+num;
        surl = surl+'/'+name;
        substance = {'original_url': name, 'short_url': nurl};
        res.send(substance)
      })
      db.close();
    })

  }
  else{
    console.log("hellll")
    res.send({"error" : "wrong url format, check your url"})
  }
})

app.get('/database', function(req, res){
  mongo.connect(url, function(err, db){
    var site = db.collection('sites')
    site.find({}).toArray(function(err, item){
      for(term in item){
        console.log(item[term])
      }
    })
    db.close();
  })
})

app.get('/:short', function(req, res){
  var surl = req.protocol + '://' + req.get('host');
  var short = req.params.short;
  short = Number(short)
  mongo.connect(url, function(err, db){
    var sites = db.collection('sites');
    var shorter = sites.find({'number': short}).toArray(function(err, items){
      res.redirect(items[0].site_name)
    })
    db.close()
  })
})

app.listen(app.get('port'), function(){
  console.log("server listening to port " + app.get('port'))
})

module.exports = app;
