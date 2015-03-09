function auth_checkauth(socket, nick, pass)
{
	var reg = /^([a-zA-Z0-9_-]){3,15}$/;
	
	if(!reg.test(nick))
		socket.emit('AUTH_RESPONSE', false, "Nick must be alphanumeric and between 3 and 15 characters.");
	else if(nick == "MyAwesomeAccount" && pass != "ABC123SecurePassword")
		socket.emit('AUTH_RESPONSE', false, "Login failed. Please double check your password.");
	else
	{
		socket.emit('AUTH_RESPONSE', true, "");
		
		return nick;
	}
	return false;
}
module.exports = {
	checkAuth: auth_checkauth
};