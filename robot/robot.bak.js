var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var hModel = require('../models/db').hModel;

function saveData(data){
	var surl = 'http://www.cilizhushou.com/search/'+data.fan+'/1';

	superagent.get(surl).end(function(err,sres){
		if(err){
			return; //出现错误就返回
		}
		var $ = cheerio.load(sres.text);
		var goturl = $('.x-item .tail .title').eq(0).attr('href');
		if(!goturl){
		 fs.writeFileSync('Robot.log','没有ed2k,搜索内容为: '+data.fan+'\r\n\r\n',{encoding:'utf-8',flag:'a+'},function(){});
		 return;
		}
		var h = new hModel({
			title:data.title,
			fan:data.fan,
			img:data.img,
			pv:0,
			tags:data.tags,
			ed2k:goturl
		});
		console.log('start to save data');
		h.save();
	})
}

function stepGet(eleArr,$){
	var len = eleArr.length;
	var nowIndex  = 0;
	
	var jiexi = function(ele){ //用来解析每个对象的
		var page = 1;
		var timer;
		var tags = [$('a',ele).text()]; // 数据的类型
		timer = setInterval(function(){// 搜索每个类型里面的所有页数
				var gurl =$('a',ele).attr('href')+(page==1?'':'/'+page);
				superagent.get(gurl).end(function(err,sres){ //出现问题，end 的时候$ 没有办法传值进去，想办法解决
					if(err){
						console.log('err 2,url: '+gurl);
						console.log('---------------end,url: '+gurl+' ---------');
						clearInterval(timer);
						console.log(timer);
						console.log('\r\n\r\n');
						next();
						return;
					}
					//page++;
					//clearTimeout(timeout); //如果还有有后续页，就不关掉查找器
					console.log("has url: "+gurl+" page:"+page);
					var $ = cheerio.load(sres.text);
					$('.item').each(function(idx,ele){
						var title=$('#item-frame a',ele).text();
						var fan = $('.item-title:nth-of-type(1)',ele).text();
						var img = $(".item img",ele).attr('src');
						var h = {
							title:title,
							fan:fan,
							img:img,
							tags:tags
						}
						//nowPage++; //要保存了数据之后才进行自增
						saveData(h);
					})
				});
			/*	var timeout = setTimeout(function(){ //这里是用来当没有后续页数的时候就关掉定时查找器
					clearInterval(timer);
				},6000); */
				page++;
		},1000);
	};
	var next = function(){
		if(nowIndex === len){
			return;
		}
		nowIndex= nowIndex+1;
		var ele = eleArr.eq(nowIndex);
		console.log("-----start, url: "+$('a',ele).attr('href')+" ----------");
		jiexi(ele);
	};
	
	next(); //要执行一次
}

function getJavFan(){ //原1w多条记录，现5643条，错误条数15873条
	var page = 1;
		var timer = setInterval(function(){ //好像不能够清除这个定时器
			superagent.get('http://jav-fan.com/'+(page==1?'':'page/'+page)).end(function(err,sres){
				if(err){
					clearInterval(timer); // 发现没有链接的时候得清除这个timer，要不就会出现大问题
					return;
				}
				//clearTimeout(timeout); //如果还有有后续页，就不关掉查找器
				var $ = cheerio.load(sres.text);
				$('#content .post').each(function(idx,ele){
					
					var title=$(".posttitle a",ele).text();
					var fan = title.match(/\[[^\]]+\]/g);
					if(!fan){
						fs.writeFileSync('Robot.log','标题中没有番号,标题为: '+title+'\r\n\r\n',{encoding:'utf-8',flag:'a+'},function(){});
						return;
					} //如果没有番号就返回
					fan = fan[0].replace(/\[/g,'').replace(/\]/g,'');
					var img = $(".entry img",ele).attr('src');
					var tags = [];
					$(".postdata .category a",ele).each(function(idx,e){
						tags.push($(e).text());
					});
					var h = {
						title:title,
						fan:fan,
						img:img,
						tags:tags,
					}
					saveData(h);
				})
			});
		/*	var timeout = setTimeout(function(){ //这里是用来当没有后续页数的时候就关掉定时查找器
				clearInterval(timer);
			},6000); */
			page++;
		},1000)
}

function getJavBus(){
	superagent.get('http://www.javbus.co/genre').end(function(err,sres){
		if(err){
			return console.log(err);
		}
		var $ = cheerio.load(sres.text);

		/*
		结构
		父级 .item
		fan .item-title:nth-of-type(1)
		title #item-frame a
		img .item img
		*/
		stepGet($(".genreitem"),$);
	}); 
}
getJavBus();
//getJavFan();