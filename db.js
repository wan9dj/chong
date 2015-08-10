var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost','H');

var hSchema = new mongoose.Schema({
    title:String,   //定义一个属性name，类型为String
    fan:String,
    img:String,
    ed2k:String
});


module.exports.hModel = db.model('Movie',hSchema); //创建或者是连接表