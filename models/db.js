var mongoose = require('mongoose');
var setting = require('../setting');
var db = mongoose.createConnection(setting.host,setting.db);

var hSchema = new mongoose.Schema({
    title:String,   //定义一个属性name，类型为String
    fan:String,
    img:String,
    ed2k:String
});
var userSchema = new mongoose.Schema({
    user:String,   //定义一个属性name，类型为String
    key:String
});
module.exports.db = db;
module.exports.hModel = db.model('Movie',hSchema); //创建或者是连接表
module.exports.userModel = db.model('User',userSchema);