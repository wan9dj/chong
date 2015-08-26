var superagent = require('superagent');
var cheerio = require('cheerio');
//var hModel = require('./models/db').hModel;

function saveData(data){
	var surl = 'http://www.cilizhushou.com/search/'+hdatas[d].fan+'/1';
	superagent.get(surl).end(function(err,sres){
		var $ = cheerio.load(sres.text);
		var goturl = $('.x-item .tail .title').eq(0).attr('href');
		if(!goturl){ return console.log('no url');}
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
	var timer = setInterval(function(){
		superagent.get('http://jav-fan.com/'+(page==1?'':'page/'+page)).end(function(err,sres){
			if(err){
				return console.log(err);
			}
			clearTimeout(timeout); //如果还有有后续页，就不关掉查找器
			var $ = cheerio.load(sres.text);
			$('#content .post').each(function(idx,ele){
				var title=$(".posttitle a",ele).text();
				var fan = title.match(/\[[^\]]+\]/g);
				if(!fan){ return console.log('没有番号');} //如果没有番号就返回
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
		var timeout = setTimeout(function(){ //这里是用来当没有后续页数的时候就关掉定时查找器
			clearInterval(timer);
		},60000);
		page++;
	},6000)
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
		fan .item-title
		title #item-frame a
		img .item img
		*/

		
		$(".genreitem").each(function(idx,ele){
			var page = 1;
			var tags = [$('a',ele).text()]; // 数据的类型
			var url =$('a',ele).attr('href')+(page==1?'':'/'+page);
			console.log('url :'+url)
			var timer = setInterval(function(){// 搜索每个类型里面的所有页数
				superagent.get($('a',ele).attr('href')+(page==1?'':'/'+page)).end(function(err,sres){ 
					if(err){
						return console.log(err);
					}
					clearTimeout(timeout); //如果还有有后续页，就不关掉查找器
					var $ = cheerio.load(sres.text);
					$('.item').each(function(idx,ele){
						var title=$('#item-frame a',ele).text();
						var fan = $('.item-title',ele).text();
						var img = $(".item img",ele).attr('src');
						var h = {
							title:title,
							fan:fan,
							img:img,
							tags:tags
						}
						saveData(h);
					})
				});
				var timeout = setTimeout(function(){ //这里是用来当没有后续页数的时候就关掉定时查找器
					clearInterval(timer);
				},600000);
				page++;
			},6000)
		
		});
	}); 

	/*
	var page = 1;
	var timer = setInterval(function(){
		superagent.get('http://javbus.co/'+(page==1?'':'page/'+page)).end(function(err,sres){
			if(err){
				return console.log(err);
			}
			clearTimeout(timeout); //如果还有有后续页，就不关掉查找器
			var $ = cheerio.load(sres.text);
			$('#content .post').each(function(idx,ele){
				var title=$(".posttitle a",ele).text();
				var fan = title.match(/\[[^\]]+\]/g);
				if(!fan){ return console.log('没有番号');} //如果没有番号就返回
				fan = fan[0].replace(/\[/g,'').replace(/\]/g,'');
				var img = $(".entry img",ele).attr('src');
				var h = {
					title:title,
					fan:fan,
					img:img,
					tags:tags
				}
				saveData(h);
			})
		});
		var timeout = setTimeout(function(){ //这里是用来当没有后续页数的时候就关掉定时查找器
			clearInterval(timer);
		},600000);
		page++;
	},60000)
	*/
}
getJavBus();
getJavFan();