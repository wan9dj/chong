var superagent = require('superagent');
var cheerio = require('cheerio');
//var express = require('express');
//var path = require('path');
//var app = express();
//var EventEmitter = require('events').EventEmitter;   
//var ee = new EventEmitter();

var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost','H');
var hSchema = new mongoose.Schema({
    title:String,   //定义一个属性name，类型为String
    fan:String,
    img:String,
    ed2k:String
});
var hModel = db.model('HModel',hSchema);

var page = 1;
setInterval(function(){
	superagent.get('http://jav-fan.com/'+(page==1?'':'page/'+page)).end(function(err,sres){
		if(err){
			return console.log(err);
		}
		var $ = cheerio.load(sres.text);
		var hdatas = [];
		$('#content .post').each(function(idx,ele){
			var title=$(".posttitle a",ele).text();
			var fan = title.match(/\[[^\]]+\]/g);
			if(!fan){ return console.log('没有番号');} //如果没有番号就返回
			fan = fan[0].replace(/\[/g,'').replace(/\]/g,'');
			var img = $(".entry img",ele).attr('src');
			var h = {
				title:title,
				fan:fan,
				img:img
			}
			hdatas.push(h);
		})
		console.log('start get ed2k');
		for(var d in hdatas){
			(function(d){
				var surl = 'http://www.cilizhushou.com/search/'+hdatas[d].fan+'/1';
				superagent.get(surl).end(function(err,sres){
					var $ = cheerio.load(sres.text);
					var goturl = $('.x-item .tail .title').eq(0).attr('href');
					if(!goturl){ return console.log('no url');}
					var h = new hModel({
						title:hdatas[d].title,
						fan:hdatas[d].fan,
						img:hdatas[d].img,
						ed2k:goturl
					});
					console.log('start to save data')
					h.save();
				})
			})(d)
		}
	});

	page++;
},60000)

//app.get('/',function(req,res,next){

		/* ####################下面这一部分在获取磁力链接的时候有用，不要删 ##############
		var htmls='';
		
		//循环获取内容
		var d=0;//创建全局变量保存循环到的次数
		(function getDatas(){
			var surl = 'http://www.cilizhushou.com/search/'+hdatas[d].fan+'/1';
			superagent.get(surl).end(function(err,sres){
				var $ = cheerio.load(sres.text);
				var goturl = $('.x-item .tail .title').eq(0).attr('href');
				ee.emit('getUrl',goturl,d);
				d++;
				if(d == hdatas.length){
					return false;
				}
				getDatas();
			})
		})()
		
		// 注册事件监听请求种子地址
		ee.on('getUrl',function(url,idx){
			console.log(url+'      '+idx)
			htmls += "<a href='"+url+"'>"+hdatas[idx].title+"</a><br />";
			htmls += "<img src='"+hdatas[idx].img+"' />";
			htmls += "<br /><br />";
			
			if(idx == hdatas.length-1){
				ee.emit('getUrlEnd');
			}
		})
		ee.on('getUrlEnd',function(){
			res.end(htmls);
		})
		*/
		
	
	
//})

//app.listen(3000)