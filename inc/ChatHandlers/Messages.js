//=============================
// Helpers
//=============================
var AuthHelper = require("../Helpers/AuthHelper.js");
var CommandHelper = require("../Helpers/CommandHelper.js");

//=============================
// Libs
//=============================
var ChatHistory = require("./History.js");

//=============================
// Handles Messages Sent From Group Chat Rooms.
//=============================
function send_message(user_info, socket, reason)
{	
	
	//Check for user auth, if not authed, kick them.
	if(!AuthHelper.isAuth(user_info, socket))
	{
		AuthHelper.handelUnauth(user_info, socket);
		return;
	}
	
	//Add onto the time out message count.
	user_info[socket.id]["chat_timeout"] = 0;
	user_info[socket.id]["num_messages"]++;
	if(user_info[socket.id]["num_messages"] >= _config["timeout_msg_num"])
	{
		user_lib.KickUser(user_info, socket, "Kicked for chat spam."); //Kick them for spam if they posted too many messages too fast.
		remove_user(socket);
		return;
	}
	
	var gid = user_info[socket.id]["group"];
	if(!room || !gid)
	{
		user_lib.KickUser(user_info, socket, "Not in valid group/room.");
		remove_user(socket);
		return;
	}
	
	//Check if message is command.
	var isCommand = CommandHelper.isCommand(msg);
	
	//If the input is not a command, send it as a normal message.
	if(!isCommand)
		send_group_message(socket, gid, room, "test", msg);
	
	//If the input is a command, use the CommandHelper to figure out what to do with it.
	if(isCommand)
		CommandHelper.executeCommand(io, socket, user_info, msg);
}


//=============================
// Called when someone sends a private message.
//=============================
function send_pm(socket, nick, msg)
{
	//checks there is info for the user.
	//If not, kick them because they probably aren't authenticated.
	if(!user_info[socket.id] || !user_info[socket.id]["nickname"])
	{
		user_lib.KickUser(user_info, socket, "Not authenticated.");
		remove_user(socket);
		return;
	}
	
	//Add onto the time out message count.
	user_info[socket.id]["chat_timeout"] = 0;
	user_info[socket.id]["num_messages"]++;
	if(user_info[socket.id]["num_messages"] >= _config["timeout_msg_num"])
	{
		user_lib.KickUser(user_info, socket, "Kicked for chat spam."); //Kick them for spam if they posted too many messages too fast.
		remove_user(socket);
		return;
	}
	
	//Trim the message if it is too long.
	if(msg.length > _config["max_msg_length"])
		msg = msg.substr(1, _config["max_msg_length"]) + "..."; //Add 3 dots on the end because why not.
	
	msg = entities.encode(msg);
	
	var csock = get_user(nick);
	if(!csock)
	{
		socket.emit("MSG_ERROR", "PM_NONICK", nick);
		return;
	}
	
	//send it to the other guy
	csock.emit('CHAT_PMSG', user_info[socket.id]["nickname"], msg);
}


//=============================
// Sends a chat message to all users in the specified room in the specified group.
//=============================
function send_group_message(socket, gid, room, from, msg)
{
	var users = group_lib.getUsersInGroup(gid, user_info);
	if(!users) return;
	
	for(var i = 0; i < users.length; i++)
		io.sockets.to(users[i]).emit('CHAT_MSG', user_info[socket.id]["nickname"], entities.encode(msg), room, "user", "null");
}

module.exports = {
	SendMessage: send_message,
	SendPM: send_pm
};