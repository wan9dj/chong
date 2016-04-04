(function(){
	var app = angular.module('myapp');
    app.factory('userStorage',function($http,$q,$timeout){
        var User = {};
        
        User.loginUser = loginUser;
        
        User.logout = function(){
            return $http.get('logout');
                
        }
        return User;
    });
})();