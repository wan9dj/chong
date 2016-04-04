(function(){
	var app = angular.module('myapp');
	app.controller('mainCtrl',function($scope,$timeout,$filter,$http,moviestore,mfilterstore,userStorage,$stateParams){ 	
		
		//控制
		var mfilter  = mfilterstore.filter;
		var movies = $scope.movies = moviestore.movies;
		var limit = 10;
		$scope.nowPage=$stateParams.page?+$stateParams.page:0;
		$scope.tmpmovies=$scope.movies;
		
		$scope.NextPage = function(){
			var next = ++$scope.nowPage;
			moviestore.get(next*limit);
		};
		$scope.PrevPage = function(){
			var prev = --$scope.nowPage;
			moviestore.get(prev*limit);
		};
		$scope.AddPv = function(idx){
			movies[limit*$scope.nowPage+idx].pv++;
			moviestore.save();
		};
		$scope.Refresh = function(){
			moviestore.get(limit);
		};
        $scope.logout= function(){
            userStorage.logout().success(function(){
                alert('退出成功');
                location.reload();
            });
        };
        
		var cping = $scope.cping = {};
		$scope.showXX = function(index){ // 通过传递索引改变显示内容
			$scope.tmpMovie = movies.slice(index,index+1);
		}
		$scope.showSearch = function(index){
			$scope.tmpMovie = $scope.smovieList.slice(index,index+1);
			$scope.smovieList=[];
		}
		$scope.Unshow = function($index){
			
		}
		$scope.Ping = function(idx,ptype){
			console.log('idx: '+idx);
			if(cping[idx]){ return;} //判断是否已经为评价过了的
			switch(ptype){
				case 'good':
					movies[limit*$scope.nowPage+idx].pv++;
					movies[limit*$scope.nowPage+idx].pgood++; //limit*$scope.nowPage+idx 根据我自己的规则，下一页是直接在原有数组上面直接加数组，所以，当前页面的movie的索引就要加上前面的页数的索引
				break;
				case 'bad':
					movies[limit*$scope.nowPage+idx].pv++;
					movies[limit*$scope.nowPage+idx].pbad++;
				break;
			};
			//cping[idx] = 'cant'; // 因为这里的cping的索引是相对于当前页面元素显示个数，然而他的$index等于这个movie在movies里面的索引，所以要减去前面的movie数据的个数
			//angular.element(document.querySelector('.bgood')).attr;
			console.log('cping: ',cping);
			moviestore.save();
			mfilterstore.savePing(movies[limit*$scope.nowPage+idx]['_id']);
		};
		$scope.Delete=function(index){
			moviestore.delete(index);
		};
		$scope.searchList = function(e){
			moviestore.find($scope.searchStr).then(function success(res){
				$scope.smovieList = res.data;
			});
			return false;
		}
		$scope.$watch('movies',function(newval,oldval){
			for(var m=limit*$scope.nowPage;m<movies.length;m++){ // 这个操作是在页面加载的时候通过过滤添加不允许点击操作, 或者是mfilter被改变的时候不允许点击操作
				for(var p=0;p<mfilter.ping.length;p++){
					if(movies[m]._id === mfilter.ping[p]){
						(function(m){
							$timeout(function(){
								cping[m % limit] = 'cant'; //因为cping的idx值是当前页面的，而我每个页面的movie的个数是 limit 个，所以要进行求余
							},0);
						})(m)
					}
				}
			}
		},true);
	});
})();