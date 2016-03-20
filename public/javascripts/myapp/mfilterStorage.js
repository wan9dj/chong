(function(){
	var app = angular.module('myapp');
	app.factory('mfilterStorage',function($http,$timeout){
		var mfilters = {
			filter:{},
			get:function(){
				return $http({
					url:'/api/filter',
					method:'get'
				}).then(function success(res){
					var nfilter = {
						ping:res.data['ping'],
						unshow:res.data['unshow']
					};
					angular.copy(nfilter,mfilters.filter);
				});
			},
			save:function(){
				return $http({
					url:'/api/saveFilter',
					method:'post',
					data:mfilters.filter
				});
			},
			savePing:function(id){
				mfilters.filter.ping.push(id);
			},
			saveUnshow:function(id){
				mfilters.filter.unshow.push(id);
			}
		};
		return mfilters;
	})
})();