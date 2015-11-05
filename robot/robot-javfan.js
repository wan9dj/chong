var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var hModel = require('../models/db').hModel;

function saveData(data){
	var surl = 'http://www.cilizhushou.com/search/'+data.fan+'/1';
	superagent.get(surl).end(function(err,sres){
		if(err){
			console.log('err fan '+data.fan+' url: '+surl+' err: '+err);
			fs.writeFileSync('./Robot.log','打开磁力链接错误: '+data.fan+'err: '+err+'\r\n\r\n',{encoding:'utf-8',flag:'a+'},function(){});
			return; //出现错误就返回
		}
		var $ = cheerio.load(sres.text);
		var goturl = $('.x-item .tail .title').eq(0).attr('href');
		if(!goturl||goturl ==''){
		 fs.writeFileSync('./Robot.log','没有ed2k,搜索内容为: '+data.fan+'\r\n\r\n',{encoding:'utf-8',flag:'a+'},function(){});
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
function getJavFan(){ 
	var page = 1;
		var timer = setInterval(function(){ //好像不能够清除这个定时器
			superagent.get('http://jav-fan.com/'+(page==1?'':'page/'+page)).end(function(err,sres){
				if(err){
					fs.writeFileSync('./Robot.log','javfan没有下一页\r\n\r\n',{encoding:'utf-8',flag:'a+'},function(){});
					clearInterval(timer); // 发现没有链接的时候得清除这个timer，要不就会出现大问题
					return;
				}
				//clearTimeout(timeout); //如果还有有后续页，就不关掉查找器
				var $ = cheerio.load(sres.text);
				$('#content .post').each(function(idx,ele){
					
					var title=$(".posttitle a",ele).text();
					var fan = title.match(/\[[^\]]+\]/g);
					if(!fan){
						fs.writeFileSync('./Robot.log','标题中没有番号,标题为: '+title+'\r\n\r\n',{encoding:'utf-8',flag:'a+'},function(){});
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
		},6000)
}
getJavFan();
/*
	@原1w多条记录
	@现5643条
	@错误条数15873条
	@2015-9-3
*/