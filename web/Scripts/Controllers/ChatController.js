angular.module('app')
	.controller('ChatCtrl', ['$scope', '$rootScope', '$sce', function ($scope, $rootScope, $sce) {
		
		$scope.Messages = [];
		$scope.userMessage = "";

		$scope.sendMessage = function()
		{
			//Send Message To Server
			$rootScope.socket.emit('CHAT_MSG', $scope.userMessage);

			//Clear Input
			$scope.userMessage = "";
		}

		$scope.chatInit = function()
		{

			//Load chat history.
			$rootScope.socket.on('CHAT_HISTORY', function(list)
			{
				if(!$rootScope.authorized) return;
				
				if(!list) return;
				
				for(var i = 0; i < list.length; i++)
				{
					$scope.$apply(function () {
						$scope.Messages.push({nickname: list[i][0], message: list[i][1]});
					});
				}
			});

			//Display new chat message.
			$rootScope.socket.on('CHAT_MSG', function(nick, msg)
			{
				if(!$rootScope.authorized) return;
				
				$scope.$apply(function () {
					$scope.Messages.push({nickname: nick, message: msg});
				});
			});
		}

		$scope.chatInit();

	}]);