var superagent = require('superagent');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var http = require('http');
var db = mongoose.createConnection('localhost','H');
var hSchema = new mongoose.Schema({
    title:String,   //定义一个属性name，类型为String
    fan:String,
    img:String,
    ed2k:String
});
var hModel = db.model('HModel',hSchema);

var server = http.createServer(function(req,res){
 hModel.find(function(err,results){
  res.end(JSON.stringify(results))
 })
});

server.listen(5000)
