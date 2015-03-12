var auth_user = [];
auth_user["bizzycola"] = ["BZ1845", true]; //auth_user["nickname"] = {"password", is_admin}; --Be sure all nicks specified here are lowercase.

function auth_checkauth(socket, nick, pass)
{
	var reg = /^([a-zA-Z0-9_-]){3,15}$/;
	
	if(!reg.test(nick))
		socket.emit('AUTH_RESPONSE', false, "Nick must be alphanumeric and between 3 and 15 characters.");
	else
	{
		var lnick = nick.toLowerCase();
		if(!auth_user[lnick] || (auth_user[lnick] && auth_user[lnick][0] == pass))
		{
			socket.emit('AUTH_RESPONSE', true, "");
			return nick;
		}
		else
			socket.emit('AUTH_RESPONSE', false, "Login failed. Please double check your password.");
	}
	return false;
}
function is_admin(nick)
{
	return (auth_user[nick] && auth_user[nick][1]);
}

module.exports = {
	checkAuth: auth_checkauth
};