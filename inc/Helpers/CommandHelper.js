var Commands = require("../commands.js");

function is_chat_command (input) {
	if(input.charAt(0) == "/")
		return true;
	else
		return false;
}

function is_valid_command (input) {
	
}

function execute_command (io, socket, user_info, input) {
	
}

module.exports = {
	isCommand: is_chat_command,
	executeCommand: execute_command
};