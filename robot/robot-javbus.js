var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var events =require('events');
var event = events.EventEmitter();;
var hModel = require('../models/db').hModel;

var delay = 1000;
var page = 1;

function getJavBus(){
	(function getNextPage(){
		setTimeout(function(){
			console.log('start, page: '+page);
			superagent.get('http://www.javbus.co/page/'+page).end(function(err,sres){
				if(err){page++;
					getNextPage();
					return console.log(err);
					
				}
				/*
					@结构
				h	url: #item-frame a #attr href
				*/
				var $ = cheerio.load(sres.text);
				$('.item').each(function(idx,ele){
					superagent.get($('#item-frame a',ele).attr('href')).end(function(err,isres){
						if(err){ console.log('no href'); return;}
						var $$ = cheerio.load(isres.text);
						/*
							@结构
							fan $$('span.movie-code')
							title $$('h3:nth-of-type(2)')
							tags $$('span.genre')
							ed2k $$('[data-message="magnet"]') #attr href
							img $$('.bigImage') #attr href
						*/
						console.log($$('span.movie-code').text());
						if($$('[data-message="magnet"]').attr('href')==''){
							return console.log('no url');
						}
						var tags = [];
						$$('span.genre').each(function(i,e){
							tags.push($(e).text());
						});
						var h = new hModel({
							title:$$('h3:nth-of-type(2)').text(),
							fan:$$('span.movie-code').text(),
							img:$$('.bigImage').attr('href'),
							pv:0,
							tags:tags,
							ed2k:$$('[data-message="magnet"]').attr('href')
						});
						h.save();
					});
					if(idx === $('.item').length -1 ){
						page++;
						getNextPage();
					}
				});
			}); 
		},delay);
	})()
}
getJavBus();
/*
	@2015-9-3
*/