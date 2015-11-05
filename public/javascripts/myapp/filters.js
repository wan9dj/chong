(function(){
	var app = angular.module('myapp');
	app.filter('limitToNum',function(){
		return function(input,limit){
			var newArr = [];
			newArr = input.slice(-limit); //倒叙输出数组的后几个元素
			return newArr;
		}
	});
})();