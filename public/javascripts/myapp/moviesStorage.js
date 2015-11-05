(function(){
	var app = angular.module('myapp');
	app.factory('moviesStorage',function($http,$injector){
		return  $injector.get('api');
	}).factory('api',function($http,$timeout){
		var store = {
			movies:[],
			get:function(skip,limit){
				skip = skip || 0;
				limit = limit || 5;
				if((skip*limit)>=store.movies.length){ //判断是否点了上一页
					return $http({
						url:'/api?skip='+skip+'&limit='+limit,
						method:'GET',
					}).then(function success(res){
						//store.movies = res.data;
						//angular.copy(res.data,store.movies); // 不知道为什么能够解决问题，不能够直接用=赋值
						//使用timeout会调用$apply来保证数据刷新，直接通过js方式改变数据的话，数据不会直接被angular发现
						//在没有使用timeout的时候，mfilter获取不到对象
						
						
						$timeout(function(){
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