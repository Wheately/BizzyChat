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
					$rootScope.socket.emit("GET_ROOMS");
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
			$rootScope.socket.emit('AUTH_LOGIN', $scope.nickname, $scope.password, $scope.group, $scope.gpass);
		}

		$scope.joinServerDialog = function()
		{
			$("#kickedModal").closeModal();

			setTimeout(function(e) {
				$('#modal1').openModal({
					dismissible: false // Modal can be dismissed by clicking outside of the modal
				});
			}, 400);

		}

	}]);