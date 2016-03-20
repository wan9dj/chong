var hModel = require('./models/db').hModel;
var userModel = require('./models/db').userModel;
var ObjectId = require('mongodb').ObjectId;

module.exports = function(app){
	/* post /login 登录
	   get / 首页 index.ejs
	   		未登录 login.ejs
	   get /api
	*/
	function checkNotLogin(req,res,next){
		if(!req.session.user){
			return res.render('login',{
				title:'用户登录'
			});
		}
		next();
	}
	// return res.redirect('http://www.baidu.com');
	//权限判断
	app.get('/',checkNotLogin);
	app.get('/api',checkNotLogin);
	app.get('/api/filter',checkNotLogin);
	app.post('/api/save',checkNotLogin);
	// get routes
	app.get('/api/find',function(req,res){
		var searchstr= req.query['str'];
		console.log(searchstr);
		var query = hModel.find({isDel:false,title:{$regex:searchstr}});
		query.limit(10);
		query.exec(function(err,hs){
			res.end(JSON.stringify(hs));
		})
	});
	app.get('/api/rand',function(req,res){
		var query = hModel.find({random:{$near:[Math.random(),0]},isDel:false});
		var limit = req.query['limit'];
		query.limit(limit);
		query.exec(function(err,hs){
			res.end(JSON.stringify(hs));
		})
	});
	app.get('/api/filter',function(req,res){
		userModel.findById(req.session.user['_id']).exec(function(err,u){	
			var userFilter = {
				ping:u['fping'],
				unshow:u['funshow']
			}
			res.end(JSON.stringify(userFilter));
		});
	});
	app.get('/',function(req,res){
		/* // index-withejs.ejs
		var page = req.query['page']?req.query['page']:0;
		var total; //保存数据总数
		var cquery = hModel.find(); //获取总数的执行
		cquery.count(function(err,c){
			total=c;
		});
		var query = hModel.find();
		query.skip(page*10);
		query.limit(10);
		query.exec(function(err,hs){
			console.log(page)
			if(!err){
				res.render('index',{
					title:'内容词典',
					hs:hs,
					page:page,
					isfirst:page==0?'true':'false',
					isend:page==Math.round(total/10)?'true':'false',
					total:total
				});
			}
		})
		*/
		res.render('index2',{
					title:'人人电影'
				});
	})
	//post routes
	app.post('/login',function(req,res){
		userModel.find({key:req.body.keyword}).exec(function(err,users){
			if(err){ return console.log(err);}
			if(users.length==1){ //判断存在key
				req.session.user=users[0];
				var statusJSON = {status:'success',url:'/'};
				res.send(JSON.stringify(statusJSON));
				//res.redirect('/');
			}else{
				//不存在key直接给他跳到百度去
				var statusJSON = {status:'error',url:'//www.baidu.com'};
				res.send(JSON.stringify(statusJSON));
				//res.redirect('https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baiduerr&wd='+req.body.keyword+'&rsv_pq=fc63a1fe0009e012&rsv_t=f78067RcQYLokUYvEo%2BsY5EW%2BJdbiLRpWf4WZ1s0mEW4YyVB82YDNrKpGSgUDzo&rsv_enter=1&rsv_sug3=99&rsv_sug1=35&rsv_sug2=0&inputT=19622&rsv_sug4=23072');
			}
		})
	});
	app.post('/api/save',function(req,res){
		for(var d in req.body){
			(function(d){
				var find = {
					_id:ObjectId(req.body[d]['_id'])
				};
				hModel.findById(find._id).exec(function(err,h){
					var old = {
						pv:h['pv'],
						pgood:h['pgood'],
						pbad:h['pbad']
					}
					var newone = {
						pv:req.body[d]['pv'],
						pgood:req.body[d]['pgood'],
						pbad:req.body[d]['pbad']
					};
					if(old.pgood != newone.pgood || old.pbad != newone.pbad){
						//判断是否有进行评价
						userModel.findById(req.session.user['_id']).exec(function(err,u){//保证每个movie id只保存一次，不进行重复保存
							for(var p in u.fping){
								if(u.fping[p] === req.body[d]['_id']){
									return;
								}
							}
							userModel.update({'_id':ObjectId(req.session.user['_id'])},{$push:{'fping':req.body[d]['_id']}},{},function(err){
							 	if(err){
							 		console.log('update user err');
							 	}
							});
						});

						
					}
					var update = {
						$set:newone
					};
					hModel.update(find,update,{},function(err){ 
						if(err){
						 		console.log('update ping err');
						 }
					});
				});
			})(d)
		};
		res.end('save end');
	});
	app.post('/api/saveFilter',function(req,res){ //用来保存mfilter的操作
		var fping = req.body['fping'];
		var unshow = req.body['unshow'];
		userModel.update({'_id':ObjectId(req.session.user['_id'])},{set:{'fping':req.body[d]['_id']}},{},function(err){
			if(err){
				console.log('update user err');
			}
		});
	});
	// delete请求
	app.delete('/api/del',function(req,res){
		var find = {
			_id:ObjectId(req.body['_id'])
		};
		var update = {
			$set:{isDel:true}
		};
		console.log('delete sth');
		hModel.update(find,update,{},function(err){ 
			if(err){
				return console.log('update ping err');
			}
			console.log('delete ok!');
			res.end('delete success');
		});
	});
}