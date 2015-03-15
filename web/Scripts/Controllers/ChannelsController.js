angular.module('app')
	.controller('ChannelCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
		
		$scope.roomList = [];

		$scope.init = function()
		{			
			$rootScope.socket.on('GET_ROOMS', function(list)
			{
				if(!$rootScope.authorized) return;
				
				if(!list) return;
				//alert(list);
				
				var tempList = [];
				//alert(list.length);

				for(var i = 0; i < list.length; i++)
				{
					$scope.$apply(function () {
						tempList.push(list[i]);
					});
				}

				$scope.roomList = tempList;	
			});
		}

		$scope.init();

	}]);