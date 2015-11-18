(function(){ //希望功能：增加115的网页iframe
	var app = angular.module('myapp',['ui.router']);
	app.config(function($stateProvider,$urlRouterProvider){
		 $urlRouterProvider.when("", "/");
		 $stateProvider
	        .state("home", {
	            url: "/",
	            templateUrl: "index.html",
	            controller:'mainCtrl',
	            resolve:{
	            	moviestore:function(moviesStorage){
	            		moviesStorage.get(10);
	            		return moviesStorage;
	            	},
	            	mfilterstore:function(mfilterStorage){
	            		mfilterStorage.get();
	            		return mfilterStorage;
	            	}
	            }
	        })
	       /* .state("page", { // 这个版本没有这个功能
	            url: "/:page",
	         	templateUrl: "index.html",
	            controller:'mainCtrl',
	            resolve:{
	            	moviestore:function(moviesStorage,$stateParams){
	            		console.log($stateParams.page);
	            		moviesStorage.get(+$stateParams.page);
	            		return moviesStorage;
	            	},
	            	mfilterstore:function(mfilterStorage){
	            		mfilterStorage.get();
	            		return mfilterStorage;
	            	}
	            }
	        })*/
	});
})();