var CommandList = [];
var http = require('http');

//Registers a command.
function register_commands(command, description, method, public, requireSocket) 
{
	var CommandItem = [command, description, method, public, requireSocket];
	CommandList.push(CommandItem);
}

//Executes a command.
function execute_command(command, io)
{
	commandName = command;

	if(command.indexOf(' ') !== -1)
		commandName = command.split(' ')[0];

	var Response = "Invalid Command, type '/Commands' to view all commands."

	for(var i = 0; i < CommandList.length; i++)
	{
		Response += CommandList[i][0];

		if(CommandList[i][0] == commandName)
		{			
			if(command.indexOf(' ') !== -1)
			{
				if(CommandList[i][4])
					Response = CommandList[i][2](command.split(' ')[1], io);
				else
					Response = CommandList[i][2](command.split(' ')[1]);
			}
			else
			{
				if(CommandList[i][4])
					Response = CommandList[i][2](io);
				else
					Response = CommandList[i][2]();
			}

			break;
		}
	}

	return Response;
}

function command_public(command){
	commandName = command;

	var Response = false;

	if(command.indexOf(' ') !== -1)
		commandName = command.split(' ')[0];

	for(var i = 0; i < CommandList.length; i++)
	{
		if(CommandList[i][0] == commandName)
		{			
			Response = CommandList[i][3];
			break;
		}
	}

	return Response;
}


//=============================
// Register Commands
//=============================
register_commands("/help", "Displays help list.", help_command, false, false);
register_commands("/rules", "Displays the server rules.", rules_command, true, false);
register_commands("/commands", "Displays all server commands.", commands_command, false, false);
register_commands("/gif", "Displays a random gif based on the text entered.", gif_command, true, true);
register_commands("/time", "Displays the server time.", time_command, true, false);
register_commands("/version", "Displays the version of the server.", version_command, true, false);
register_commands("/quit", "Quit the server.", quit_command, true, false);


//=============================
// Commands Go Below This
//=============================

function rules_command (argument) {
	// body...
}

function time_command (argument) {
	return Date.now();
}

function version_command (argument) {
	// body...
}

function quit_command (argument) {
	// body...
}

function help_command ()
{
	return "Here is help";
}

function commands_command () 
{
	var Response = "For more information on a command, type '/help [command-name]'.";

	for(var i = 0; i < CommandList.length; i++)
	{
		Response += "<br/><b>" + CommandList[i][0] + "</b> - <i>" + CommandList[i][1] + "</i>";
	}

	return Response;
}

function gif_command (gif, io) 
{

	var options = {
	  host: 'api.giphy.com',
	  port: 80,
	  path: '/v1/gifs/search?q=' + gif + '&api_key=dc6zaTOxFJmzC'
	};

	http.get(options, function(resp){

		var body = '';

		resp.on('data', function(response){
			body += response;
		});

		resp.on('end', function(){

			var Data = JSON.parse(body);
			var Random = Math.floor(Math.random() * Data['data'].length);

			io.sockets.emit('CHAT_MSG', "Server", "<img src='" + Data['data'][Random]['images']['original']['url'] + "' />");
		});
	});

}

module.exports = {
	executeCommand: execute_command,
	isPublic: command_public
};