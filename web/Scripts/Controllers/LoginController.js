angular.module('app')
	.controller('LoginCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
		
		$scope.nickname = "";
		$scope.password = "";

		$scope.joinServer = function()
		{
			//auth response
			$rootScope.socket.on('AUTH_RESPONSE', function(status, error)
			{
				if(status)
				{
					$('#modal1').closeModal();
					$rootScope.authorized = true;
					toast("Successfully Logged In!", 3000);
				}
				else
				{
					$scope.$apply(function () {
			            $scope.errorMessage = error;
			        });
				}
				
			});

			//Send Message To Server
			$rootScope.socket.emit('AUTH_LOGIN', $scope.nickname, $scope.password);
		}

	}]);