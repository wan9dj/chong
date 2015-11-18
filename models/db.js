var mongoose = require('mongoose');
var setting = require('../setting');
var db = mongoose.createConnection(setting.host,setting.db);

var hSchema = new mongoose.Schema({
    title:{type:String,unique:true},   //定义一个属性name，类型为String
    //fan:{type:String,default:''},
    img:String,
    tags:Array,
    pv:{type:Number,default:0},
    pgood:{type:Number,default:0},
    pbad:{type:Number,default:0},
    ed2k:Array,
    random:{type:Array,index:'2d'}
});
var userSchema = new mongoose.Schema({
    user:String,   //定义一个属性name，类型为String
    key:{type:String,unique:true},
    fping:{type:Array,default:[],unique:true},
    funshow:{type:Array,default:[]}
});
module.exports.db = db;
module.exports.hModel = db.model('Movie',hSchema); //创建或者是连接表
module.exports.userModel = db.model('User',userSchema);