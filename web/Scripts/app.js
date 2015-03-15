app = angular.module('app', ['ngCookies', 'luegg.directives', 'ui.codemirror', 'ngTextTruncate']);

angular.module('app')
    .filter('to_trusted', ['$sce', '$compile', function($sce, $compile){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
}]);

app.run(['$rootScope', '$cookies', function($rootScope, $cookies){

	$rootScope.authorized = false;

	$('#modal1').openModal({
		dismissible: false // Modal can be dismissed by clicking outside of the modal
	});

	//Create Global Socket Var
	$rootScope.socket = io();

	//Handel user being kicked.
	$rootScope.socket.on('CONN_KICKED', function(reason)
	{
		$("#kickedModal").openModal({
			dismissible: false // Modal can be dismissed by clicking outside of the modal
		});
	});

	$rootScope.socket.on("DO_QUIT", function(){
		location.reload();
	});

}]);