var superagent = require('superagent');
var cheerio = require('cheerio');
var hModel = require('./models/db').hModel;

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