(function(){
	var app = angular.module('myapp');
	app.factory('moviesStorage',function($http,$injector){
		return  $injector.get('api');
	}).factory('api',function($http,$timeout){
		var store = {
			movies:[],
			/*get:function(skip,limit){ //v0.1版本的get函数，对应着index.ejs
				skip = skip || 0;
				limit = limit || 5;
				if((skip*limit)>=store.movies.length){ //判断是否点了上一页
					return $http({
						url:'/api/rand?skip='+skip+'&limit='+limit,
						method:'GET',
					}).then(function success(res){
						//store.movies = res.data;
						//angular.copy(res.data,store.movies); // 不知道为什么能够解决问题，不能够直接用=赋值
						//使用timeout会调用$apply来保证数据刷新，直接通过js方式改变数据的话，数据不会直接被angular发现
						//在没有使用timeout的时候，mfilter获取不到对象
						$timeout(function(){
							console.log('get success');
							var newArr = store.movies.concat(res.data);
							angular.copy(newArr,store.movies);
						},0);
						return store.movies;

						// /localStorage.setItem('movies',JSON.stringify(store.movies));
						//return store.movies;
					},function error(){
						console.log('获取数据失败');
					});
				}else{
					$timeout(function(){
						var newArr = store.movies.slice(skip*limit,limit);
						angular.copy(newArr,store.movies);
					},0);
					
					//return store.movies;
				}
			},*/
			get:function(limit){ //v0.3版本的get，只是进行了部分修改，代码还有问题
				limit = limit || 5;
				return $http({
					url:'/api/rand?limit='+limit,
					method:'GET',
				}).then(function success(res){
					//store.movies = res.data;
					//angular.copy(res.data,store.movies); // 不知道为什么能够解决问题，不能够直接用=赋值
					//使用timeout会调用$apply来保证数据刷新，直接通过js方式改变数据的话，数据不会直接被angular发现
					//在没有使用timeout的时候，mfilter获取不到对象
					$timeout(function(){
						console.log('get success');
						//var newArr = store.movies.concat(res.data);
						angular.copy(res.data,store.movies);
					},0);
					return store.movies;

					// /localStorage.setItem('movies',JSON.stringify(store.movies));
					//return store.movies;
				},function error(){
					console.log('获取数据失败');
				});
			},
			delete:function(index){
				console.log('delete',store.movies[index]['_id']);
				$http({
					url:'/api/del',
					method:'delete',
					data:{
						_id:store.movies[index]['_id']
					}
				}).then(function success(){
					$timeout(function(){
						store.movies.splice(index,1);
						console.log('delete success');	
					},0);
				});
			},
			save:function(){
				$http({
					url:'/api/save',
					method:'post',
					data:store.movies
				}).then(
					function success(res){
						console.log(res.data);
					}
				);
			}
		};
		return store;
	})
})();