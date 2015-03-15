var CommandList = [];
var http = require('http');

//Registers a command.
function register_commands(command, description, method, public, requireSocket, detailedHelp) 
{
	var CommandItem = [command, description, method, public, requireSocket, detailedHelp];
	CommandList.push(CommandItem);
}

//Executes a command.
function execute_command(command, io, user, socket)
{
	commandName = command;

	if(command.indexOf(' ') !== -1)
		commandName = command.split(' ')[0];

	var Response = "Invalid Command, type '/commands' to view all commands."

	for(var i = 0; i < CommandList.length; i++)
	{
		if(CommandList[i][0] == commandName)
		{			
			if(command.indexOf(' ') !== -1)
			{
				if(CommandList[i][4])
					Response = CommandList[i][2](command.substr(command.indexOf(" ") + 1), io, user, socket);
				else
					Response = CommandList[i][2](command.substr(command.indexOf(" ") + 1));
			}
			else
			{
				if(CommandList[i][4])
					Response = CommandList[i][2](io, user, socket);
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
//
// register_commands([Command-Name], [Command-Description], [Command-Function], [Command-Public], [Use-Socket], [Command-Help])
//
// Command-Name(string) - The name the user will use to call the command.
// Command-Description(string) - The description of the command, this will be used in the /commands list. Please put something more than "Does stuff and things..." :P
// Command-Function(function) - The function to call when the command is used, yeah, it is probably a good idea to fill this out too.
// Command-Public(bool) - This changes whether other users will see the output of this command.
// Use-Socket(bool) - This will give you access to io, user, and socket. If the command takes in parameter data, then it will be the last three parameters.
// Command-Help(string) - Do I really need to explain this... fine, it makes the register command all ugly and provides help to the stupid user. 
//
//=============================
register_commands("/help", "Displays help list.", help_command, false, false, "Really, you asked for more help with help???");
register_commands("/rules", "Displays the server rules.", rules_command, true, false, "Wow, it is a pretty simple command, no paramaeters.");
register_commands("/commands", "Displays all server commands.", commands_command, false, false, "");
register_commands("/gif", "Displays a random gif based on the text entered.", gif_command, true, true, "<span>Gets a random gif based on the text entered.</span><br/><b>/gif [name]</b>");
register_commands("/time", "Displays the server time.", time_command, true, false, "Does not work right now... don't know why...");
register_commands("/version", "Displays the version of the server.", version_command, true, false, "This one is not complicated either...");
register_commands("/quit", "Quit the server.", quit_command, true, true, "You will be removed from the server, and brought to the login page.");
register_commands("/code", "Formats and highlights code you paste.", code_command, true, true, "<span>Formats and highlights code you paste<span><br/><b>/code [language] [code]</b><br/><span>Supported Languages:</span><ul><li><i>HTML</i></li><li><i>CSS</i></li><li><i>PHP</i></li><li><i>JavaScript</i></li><li><i>Java</i></li></ul>");
register_commands("/emmawatson", "Emma", emmawatson_command, false, true, "Watson");
register_commands("/bacon", "Bacon", bacon_command, false, true, "Bacon");


//=============================
// Commands Go Below This
//=============================

function bacon_command (io, user, socket) {
	io.sockets.emit('CHAT_MSG', "Server", "<img width='400' src='http://investorplace.com/wp-content/uploads/2014/02/bacon.jpg' />", "server", "null");
}

function emmawatson_command (io, user, socket) {
	io.sockets.emit('CHAT_MSG', "Server", "<img width='400' src='http://imageserver.moviepilot.com/emma-watson-images-first-look-will-emma-watson-be-able-to-escape-colonia-dignidad.jpeg?width=1920&height=1200' />", "server", "null");
}

function code_command (data, io, user, socket) {

	var Language = data.split(' ')[0];

	var Code = data.substr(data.indexOf(' ') + 1); 

	io.sockets.emit('CHAT_MSG', "server", Code, "Code", Language);

	//return '<ui-codemirror ui-codemirror-opts="editorOptions">' + Code + '</ui-codemirror>';
}

function rules_command (argument) {
	// body...
}

function time_command () {
	return Date.now();
}

function version_command () {
	return "0.0.2";
}

function quit_command (io, user, socket) {
	socket.emit("DO_QUIT");
	socket.broadcast.emit("USER_QUIT", user["nickname"]);
	socket.disconnect();
}

function help_command (commandName)
{
	var Response = "Type /help [command-name] to view detailed help with a specific command." + commandName;

	if(commandName != "")
	{
		Response = "Command Not Found, please type /commands to see all available commands.";

		for(var i = 0; i < CommandList.length; i++)
		{	
			if(CommandList[i][0] ==  "/" + commandName)
				Response = CommandList[i][5];
		}
	}

	return Response;
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

function gif_command (gif, io, user, socket) 
{

	var options = {
	  host: 'api.giphy.com',
	  port: 80,
	  path: '/v1/gifs/search?q=' + encodeURI(gif) + '&api_key=dc6zaTOxFJmzC'
	};

	http.get(options, function(resp){

		var body = '';

		resp.on('data', function(response){
			body += response;
		});

		resp.on('end', function(){

			var Data = JSON.parse(body);
			var Random = Math.floor(Math.random() * Data['data'].length);

			io.sockets.emit('CHAT_MSG', "Server", "<img src='" + Data['data'][Random]['images']['original']['url'] + "' />", "server", "null");
		});
	});

}

module.exports = {
	executeCommand: execute_command,
	isPublic: command_public
};