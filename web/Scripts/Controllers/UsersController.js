angular.module('app')
	.controller('UsersCtrl', ['$scope', '$rootScope', '$interval', function ($scope, $rootScope, $interval) {
		
		$scope.userList = [];

		$scope.init = function()
		{			
			$rootScope.socket.on('NICK_LIST', function(list)
			{
				if(!$rootScope.authorized) return;
				
				if(!list) return;
				
				var tempList = [];

				for(var i = 0; i < list.length; i++)
				{
					$scope.$apply(function () {
						tempList.push(list[i]);
					});
				}

				$scope.userList = tempList;				
			});

			$interval(function(){
				if($rootScope.authorized)
					$rootScope.socket.emit("NICK_LIST");
			}, 500, 0);
		}

		$scope.init();

	}]);