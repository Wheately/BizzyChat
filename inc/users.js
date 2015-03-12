/*
 * Kicks a user with a specified reason.
*/
function kick_user(users, user_info, socket, reason)
{
	console.log("USER KICKED: "+reason);
	
	socket.kicked = true; //Stops the disconnect event from sending an additional disconnected user event.
	socket.emit("CONN_KICKED", reason);
	if(user_info[socket.id]["nickname"])
		socket.broadcast.emit("USR_KICKED", user_info[socket.id]["nickname"], reason);
	socket.disconnect();

}

module.exports = {
	KickUser: kick_user
};