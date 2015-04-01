var user_lib = require("../users.js");

function check_auth (user_info, socket) {
	if(!user_info[socket.id] || !user_info[socket.id]["nickname"])
		return false
	else
		return true;
}

function handel_unauth (user_info, socket) {
	user_lib.Kick_user(socket);
}

module.exports = {
	isAuth: check_auth,
	handelUnauth: handel_unauth
};