var superagent = require('superagent-charset');
var cheerio = require('cheerio');
var fs = require('fs');
var hModel = require('../models/db').hModel;
//var encoding = require('encoding'); //转码工具？
var Iconv = require('iconv-lite');

var websiteUrl = 'http://www.renren001.cc';
var todoList  = []; 
//保存请求地址
// [obj ...]
// obj{ url:string,isend:boolean}
var skip = 0; //跳过对应索引的todolist

//获取todolist的函数
function getTodos(endCallback){ 	
	superagent.get(websiteUrl).charset('gbk').end(function(err,sres){
		if(err){ return;}
		var $ = cheerio.load(sres.text);
		$(".new_nav li").not(":first-child").find('a').each(function(i,e){
			if(i<skip){
				return;
			}
			var url = websiteUrl+$(e).attr('href');
			var obj = {url:url,isend:false};
			todoList.push(obj);
			if(i == $(".new_nav li").not(":first-child").length -1){
				endCallback();
			}
		});
	});
}

// 遍历todoList,并且逐个获取里面的细节
function checkTodos(todoList){ 
	for(var i = 0;i<todoList.length;i++){
		if(!todoList[i].isend){
			checkTodo(todoList[i],function(){
				console.log('checkTodos, todolist status:',todoList);
				checkTodos(todoList);
			});
			break;
		}
	}
}

//检查todo里面的细节,在回调函数里面重新执行当前函数
function checkTodo(todo,callback){
	checkPagesCount(todo.url,1,function(){
		todo.isend = true;
		return callback&&callback();
	});
}

//用来判断一个todo里面存在多少页的,然后遍历每一页里面的电影
//url:todo.url,count用来遍历的个数 
//当页面请求状态status==404的时候，表示当前todo到达最后一页，所以就要执行回调函数
function checkPagesCount(url,count,callback){
	var tmpurl = 'index'+(count==1?'':count)+'.html';
	tmpurl = url+tmpurl;
	console.log("checkPagesCount,at:",tmpurl);
	superagent.get(tmpurl).charset('gbk').end(function(err,sres){
		if(err){
			if(sres.status == 404){
				console.log('checkPagesCount','goto next todo\r\n\r\n');
				return callback&&callback();
			}
			return console.log('checkPagesCount','err');
		}
		var $ = cheerio.load(sres.text);
		//var pageObj = {};
		var len = $("#tagContent0 .box3_mid li").length;
		var c = 0;
		$("#tagContent0 .box3_mid li").each(function(i,e){
			var tmpurl = websiteUrl+$("a",$(e)).attr('href');
			saveEd2k(tmpurl,function(){
				++c;
				if(c == len){
					console.log('checkPagesCount','goto-next-page...');
					checkPagesCount(url,++count,callback);
				}
			});
		});
		//eachPageUrls(url,$);
	});
}

//遍历对应页数里面的电影url，然后访问地址并保存,callback用来执行当所有的电影操作完毕之后才进行下一步,
//count 保存执行到的个数
function eachPageUrls(url,count,callback){
	/*$("#tagContent0 .box3_mid li").each(function(i,e){
		var tmpurl = websiteUrl+$("a",$(e)).attr('href');
		console.log('eachPageUrls, tmpUrl:',tmpurl);
		saveEd2k(tmpurl);
	});*/
}

//将对应页面里面的url保存到数据库
//callback 是当页面检索操作完毕的时候执行
function saveEd2k(url,callback){
	superagent.get(url).charset('gbk').end(function(err,isres){
		if(err){
			console.log('saveEd2k','err');
			callback();
			return;
		}
		var $ = cheerio.load(isres.text);
		if($('.downurl script').html() == null){
			console.log('saveEd2k','ed2k is undefined','url is:',url);
			callback();
			return;
		}
		var title = $(".haibao .vipicbg").attr('alt');
		var img = websiteUrl+$(".haibao .vipicbg").attr('src');
		var ed2k =[];
		var ed2kStr = $('.downurl script').html();
		ed2kStr = ed2kStr.match(/\"[\s\S]+\"/)[0].split("$###");
		for(var e=0;e<ed2kStr.length-1;e++){ //ed2kStr数组里面的最后一个数组为空
			(function(e){
				var obj = {};
				var arr = ed2kStr[e].split("\$");
				obj.name = arr[0];
				obj.ed2k = arr[1];
				ed2k.push(obj);
			})(e)
		}
		var tags = [];
		var h = new hModel({
			title:title,
			img:img,
			pv:0,
			tags:tags,
			ed2k:ed2k,
			random:[Math.random(),0]
		});
		h.save();
		callback();
		console.log('saveData','success');
	}); 	
}

//操作
// getTodos -> checkTodos <-> checkTodo -> checkPagesCount -> eachPageUrls -> saveEd2k
getTodos(function(){
	console.log("get todoList end, todoList : ",todoList);
	checkTodos(todoList);
});