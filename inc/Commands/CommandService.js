//=============================
// Includes
//=============================
var fs = require('fs');
var util = require('util');
var RegisteredCommands = JSON.parse(fs.readFileSync("./inc/Commands/CommandRegister.json"))['commands'];

function execute_command (command) {
	
	command = "emmawatson";

	if(!command_exists(command))
		return "Invalid Command, type /commands to view all available commands.";

	var CommandObject = require(util.format("%s/%s/Script.js", __dirname, get_command_container(command)));

	CommandObject.main();

	return "Meh";
}

//=============================
// Checks to see if the command exists.
//=============================
function command_exists(command) {
	for (var i in RegisteredCommands) {
		if(RegisteredCommands[i]['name'] == command)
			return true;
	};

	return false;
}

//=============================
// Checks to see if this is a public command.
//=============================
function command_is_public (command) {
	return get_command_property(command, "public");
}

//=============================
// Checks to see if the user must be an admin to use this command.
//=============================
function command_is_admin (command) {
	return get_command_property(command, "admin");
}

//=============================
// Checks to see if the command is interperted.
//=============================
function command_is_interperted (command) {
	return get_command_property(command, "interperted");
}

//=============================
// Reads command properties.
//=============================
function get_command_property(command, prop){
	for (var i in RegisteredCommands) {
		if(RegisteredCommands[i]['name'] == command)
			return RegisteredCommands[i][prop];
	};

	return null;
}

function get_command_container (command) {
	for (var i in RegisteredCommands) {
		if(RegisteredCommands[i]['name'] == command)
			return i;
	};
}

//=============================
// Export Functions for other files to use.
//=============================
module.exports = {
	executeCommand: execute_command
};