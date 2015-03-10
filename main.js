var _config = {};

/*CONFIG*/
_config["chat_timeout"] = 3; //The amount of time in which timeout_msg_num messages can be sent before the user is kicked.
_config["timeout_msg_num"] = 5; //Number of messages within chat_timeout before being kicked.
_config["server_root"] = __dirname ;
_config["max_msg_length"] = 200;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/*
 *Fixed Queue stuff
 *Created by: Ben Nadel
 *Link: http://www.bennadel.com/blog/2308-creating-a-fixed-length-queue-in-javascript-using-arrays.htm
 *Thanks!
*/
function FixedQueue( size, initialValues ){

	// If there are no initial arguments, default it to
	// an empty value so we can call the constructor in
	// a uniform way.
	initialValues = (initialValues || []);

	// Create the fixed queue array value.
	var queue = Array.apply( null, initialValues );

	// Store the fixed size in the queue.
	queue.fixedSize = size;

	// Add the class methods to the queue. Some of these have
	// to override the native Array methods in order to make
	// sure the queue lenght is maintained.
	queue.push = FixedQueue.push;
	queue.splice = FixedQueue.splice;
	queue.unshift = FixedQueue.unshift;

	// Trim any initial excess from the queue.
	FixedQueue.trimTail.call( queue );

	// Return the new queue.
	return( queue );

}


// I trim the queue down to the appropriate size, removing
// items from the beginning of the internal array.
FixedQueue.trimHead = function(){

	// Check to see if any trimming needs to be performed.
	if (this.length <= this.fixedSize){

		// No trimming, return out.
		return;

	}

	// Trim whatever is beyond the fixed size.
	Array.prototype.splice.call(
		this,
		0,
		(this.length - this.fixedSize)
	);

};


// I trim the queue down to the appropriate size, removing
// items from the end of the internal array.
FixedQueue.trimTail = function(){

	// Check to see if any trimming needs to be performed.
	if (this.length <= this.fixedSize){

		// No trimming, return out.
		return;

	}

	// Trim whatever is beyond the fixed size.
	Array.prototype.splice.call(
		this,
		this.fixedSize,
		(this.length - this.fixedSize)
	);

};


// I synthesize wrapper methods that call the native Array
// methods followed by a trimming method.
FixedQueue.wrapMethod = function( methodName, trimMethod ){

	// Create a wrapper that calls the given method.
	var wrapper = function(){

		// Get the native Array method.
		var method = Array.prototype[ methodName ];

		// Call the native method first.
		var result = method.apply( this, arguments );

		// Trim the queue now that it's been augmented.
		trimMethod.call( this );

		// Return the original value.
		return( result );

	};

	// Return the wrapper method.
	return( wrapper );

};


// Wrap the native methods.
FixedQueue.push = FixedQueue.wrapMethod(
	"push",
	FixedQueue.trimHead
);

FixedQueue.splice = FixedQueue.wrapMethod(
	"splice",
	FixedQueue.trimTail
);

FixedQueue.unshift = FixedQueue.wrapMethod(
	"unshift",
	FixedQueue.trimTail
);
/* END FIXED QUEUE*/




var chat_history = FixedQueue(20); //Use a fixed queue to store the chat history.
var users = []; //Holds a list of user sockets
var user_info = []; //Holds information on each socket such as nickname, spam time out stuff, etc.

/*
 * Runs every 1 second for timed things such as spam time outs.
*/
function chat_tick()
{
	
	for(var i = 0; i < users.length; i++)
	{
		if(!users[i]){
			continue;
		}
		
		//The chat timeout is used to kick users for spamming multiple messages within a [chat_timeout] second period.
		user_info[users[i].id]["chat_timeout"]++;
		if(user_info[users[i].id]["chat_timeout"] >= _config["chat_timeout"])
		{
			user_info[users[i].id]["chat_timeout"] = 0;
			user_info[users[i].id]["num_messages"] = 0;

		}
	}
}
setInterval(chat_tick, 1000);

/*
 * Initializes the user_info entry for a user socket.
*/
function init_socket(socket)
{
	users.push(socket);
	
	//console.log(socket.id);
	user_info[socket.id] = {};
	user_info[socket.id]["chat_timeout"] = 0;
	user_info[socket.id]["num_messages"] = 0;
}

/*
 * Kicks a user with a specified reason.
*/
function kick_user(socket, reason)
{
	console.log("USER KICKED: "+reason);
	
	socket.kicked = true; //Stops the disconnect event from sending an additional disconnected user event.
	socket.emit("CONN_KICKED", reason);
	if(user_info[socket.id]["nickname"])
		socket.broadcast.emit("USR_KICKED", user_info[socket.id]["nickname"], reason);
	socket.disconnect();
	
	var i = users.indexOf(socket);
	delete users[i];
	
	
}

/*
 * Sends the chat history to a user.
*/
function send_history(socket)
{
	socket.emit("CHAT_HISTORY", chat_history);
}

/*
 * Called when a new chat message is received.
*/
function on_message(socket, msg)
{
	//checks there is info for the user.
	//If not, kick them because they probably aren't authenticated.
	if(!user_info[socket.id] || !user_info[socket.id]["nickname"])
	{
		kick_user(socket, "Not authenticated.");
		return;
	}
	
	//Add onto the time out message count.
	user_info[socket.id]["chat_timeout"] = 0;
	user_info[socket.id]["num_messages"]++;
	if(user_info[socket.id]["num_messages"] >= _config["timeout_msg_num"])
	{
		kick_user(socket, "Kicked for chat spam."); //Kick them for spam if they posted too many messages too fast.
		return;
	}
	
	//Trim the message if it is too long.
	if(msg.length > _config["max_msg_length"])
		msg = msg.substr(1, _config["max_msg_length"]) + "...";
	
	//Add the message to the chat history
	chat_history.push([user_info[socket.id]["nickname"], msg]);
	
	//And of course send it to all the other clients
	socket.broadcast.emit('CHAT_MSG', user_info[socket.id]["nickname"], msg);
	
}

//Web stuff
app.get('/', function(req, res)
{
	res.sendFile('web/index.html', { root: _config["server_root"] });
});
app.get('/style.css', function(req, res)
{
	res.sendFile('web/style.css', { root: _config["server_root"] });
});app.get('/site.js', function(req, res)
{
	res.sendFile('web/site.js', { root: _config["server_root"] });
});

var auth_lib = require("./auth.js");

//User connections
io.on('connection', function(socket)
{
	//Call the socket init to initialize the user info.
	init_socket(socket);
	
	//A socket was disconnected.
	socket.on('disconnect', function()
	{
		//Check the socket wasn't intentionally disconnected by the server.
		if(!socket.kicked && user_info[socket.id]["nickname"])
		{	
			//If it wasn't, tell everyone they disconnected then remove their info.
			io.emit('USR_DISCONNECT', user_info[socket.id]["nickname"]);
			user_info[socket.id] = null;
			var i = users.indexOf(socket);
			delete users[i];
		}
	});
	
	socket.on('CHAT_MSG', function(msg)
	{
		on_message(socket, msg); //send chat messages to our on_message function.
	});
	
	//User asked if they are authenticated. If not, they were probably reconnected.
	socket.on('HAS_AUTH', function()
	{
		if(!user_info[socket.id]["nickname"])
			socket.emit("HAS_AUTH", false);
		
		socket.emit("HAS_AUTH", true);
	});
	
	//User sent a login request
	socket.on('AUTH_LOGIN', function(nick, pass)
	{
		var nick = auth_lib.checkAuth(socket, nick, pass);
		user_info[socket.id]["nickname"] = nick;
		
		//If the login was successful, send them the chat history and tell everyone else they joined.
		if(nick)
		{
			socket.broadcast.emit('USR_CONNECT', user_info[socket.id]["nickname"]);
			send_history(socket);
		}
	});
	
	//User asked for the nick list.
	socket.on('NICK_LIST', function()
	{
		var nlist = [];
		for(var i = 0; i < users.length; i++)
		{
			//If the socket has a nickname, append it to nlist
			if(users[i] && user_info[users[i].id]["nickname"])
			{
				var nick = user_info[users[i].id]["nickname"];
				var col = (nick == "MyCoolAdmin") ? "<span style='color: darkred;' title='Admin'>"+nick+"</span>" : nick;
				
				nlist.push(col);
			}
		}
		
		//Send them their nick list.
		socket.emit("NICK_LIST", nlist);
		
	});
	
});

//HTTP!
http.listen(3120, function()
{
	console.log('listening on *:3120');
});
