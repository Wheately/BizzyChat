angular.module('app')
	.controller('ChatCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
		
		$scope.notification = new Audio('Sounds/Notification.mp3');

		$scope.Messages = [];
		$scope.userMessage = "";

		//Send The Users Message To The Server.
		$scope.sendMessage = function()
		{
			//If authorized and valid, send message
			if($rootScope.authorized && $scope.userMessage != "")
				$rootScope.socket.emit('CHAT_MSG', $scope.userMessage);

			//Clear Input
			$scope.userMessage = "";
		}

		//Initlize chat.
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
			$rootScope.socket.on('CHAT_MSG', function(nick, msg, room, type, extra)
			{
				if(!$rootScope.authorized) return;
				
				$scope.$apply(function () {
					$scope.Messages.push({nickname: nick, message: msg, type: type, extra: extra});
				});

				$scope.notification.play();
			});


			//=============================
			// Listeners
			//=============================

			$rootScope.socket.on('STEAL_BACON', function(nick)
			{
				if(!$rootScope.authorized) return;
				
				var img = document.getElementsByClassName("bacon-img");
				for(var i = 0; i < img.length; i++)
					img.innerHTML = '<strong>' + nick + "</strong> stole this bacon!";
			});
			
			//When user connects, notify users.
			$rootScope.socket.on('USR_CONNECT', function(nickname, type, extra)
			{
				if(!$rootScope.authorized) return;
				
				$scope.$apply(function () {
					$scope.Messages.push({nickname: nickname, message: nickname + " joined the server.", type: type, extra: extra});
				});
			});

			//When user disconnects, notify users.
			$rootScope.socket.on('USR_DISCONNECT', function(nickname, type, extra)
			{
				if(!$rootScope.authorized) return;
				
				$scope.$apply(function () {
					$scope.Messages.push({nickname: nickname, message: nickname + " left the server.", type: type, extra: extra});
				});
			});

			//When user is kicked, notify users.
			$rootScope.socket.on('USR_KICKED', function(nickname, reason, type, extra)
			{
				if(!$rootScope.authorized) return;
				
				$scope.$apply(function () {
					$scope.Messages.push({nickname: nickname, message: nickname + " was kicked from the server because of " + reason, type: type, extra: extra});
				});
			});
		}

		//Initilize the chat.
		$scope.chatInit();

	}]);