var auth_user = [];
auth_user["bizzycola"] = ["BZ1845", true]; //auth_user["nickname"] = {"password", is_admin}; --Be sure all nicks specified here are lowercase.

/*
 * Validate and optionally authenticate a user
*/
function auth_checkauth(user_info, socket, nick, pass)
{
	var reg = /^([a-zA-Z0-9_-]){3,15}$/;
	
	if(!reg.test(nick))
		socket.emit('AUTH_RESPONSE', false, "Nick must be alphanumeric and between 3 and 15 characters.");
	else
	{
		//convert the nick to lower case to compare with the auth_user array.
		var lnick = nick.toLowerCase();
		
		//prevent two users with the same nickname
		var inUse = false;
		for (var i in user_info) 
		{
			if(user_info[i] && user_info[i]["nickname"] && user_info[i]["nickname"].toLowerCase() == lnick)
			{
				inUse = true;
				break;
			}
		}
		
		//Deny them if it is in use
		if(inUse)
		{
			socket.emit('AUTH_RESPONSE', false, "Nickname already in use.");
			return false;
		}
		
		//Check if the user is in the auth table and if it is, check the password, otherwise it's free so let them have it.
		if(!auth_user[lnick] || (auth_user[lnick] && auth_user[lnick][0] == pass))
		{
			socket.emit('AUTH_RESPONSE', true, "");
			return nick;
		}
		else
			socket.emit('AUTH_RESPONSE', false, "Login failed. Please double check your password."); //tell them they did it wrong.
	}
	return false;
}

/*
 * Checks whether or not the nickname is an admin.
*/
function is_admin(nick)
{
	var lnick = nick.toLowerCase();
	return (auth_user[lnick] && auth_user[lnick][1]);
}

module.exports = {
	checkAuth: auth_checkauth,
	isAdmin: is_admin
};