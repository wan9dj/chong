var hModel = require('./models/db').hModel;
var userModel = require('./models/db').userModel;

module.exports = function(app){
	/* post /login 登录
	   get / 首页 index.ejs
	   		未登录 login.ejs
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

	// get routes
	app.get('/',function(req,res){
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
	})
	//post routes
	app.post('/login',function(req,res){
		userModel.find({key:req.body.keyword}).count(function(err,count){
			if(err){ return console.log(err);}
			if(count==1){
				req.session.user='has user';
				res.redirect('/');
			}else{
				//不存在key直接给他跳到百度去
				res.redirect('https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baiduerr&wd='+req.body.keyword+'&rsv_pq=fc63a1fe0009e012&rsv_t=f78067RcQYLokUYvEo%2BsY5EW%2BJdbiLRpWf4WZ1s0mEW4YyVB82YDNrKpGSgUDzo&rsv_enter=1&rsv_sug3=99&rsv_sug1=35&rsv_sug2=0&inputT=19622&rsv_sug4=23072');
			}
		})
	});
}