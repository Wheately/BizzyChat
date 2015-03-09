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



var _config = {};

/*CONFIG*/
_config["chat_timeout"] = 3; //The amount of time in which timeout_msg_num messages can be sent before the user is kicked.
_config["timeout_msg_num"] = 5; //Number of messages within chat_timeout before being kicked.
_config["server_root"] = __dirname ;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var chat_history = FixedQueue(20);
var users = [];
var user_info = [];

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

function init_socket(socket)
{
	users.push(socket);
	
	//console.log(socket.id);
	user_info[socket.id] = {};
	user_info[socket.id]["chat_timeout"] = 0;
	user_info[socket.id]["num_messages"] = 0;
}

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

function send_history(socket)
{
	socket.emit("CHAT_HISTORY", chat_history);
}

//event stuff
function on_message(socket, msg)
{
	if(!user_info[socket.id])
	{
		console.log("ERROR: "+socket);
		return;
	}
	if(!user_info[socket.id]["nickname"])
	{
		kick_user(socket, "Not authenticated.");
		return;
	}
	
	user_info[socket.id]["chat_timeout"] = 0;
	user_info[socket.id]["num_messages"]++;
	if(user_info[socket.id]["num_messages"] >= _config["timeout_msg_num"])
	{
		kick_user(socket, "Kicked for chat spam.");
		return;
	}
	chat_history.push([user_info[socket.id]["nickname"], msg]);
	
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
	init_socket(socket);
	
	if(user_info[socket.id]["nickname"])
		socket.broadcast.emit('USR_CONNECT', user_info[socket.id]["nickname"]);
	
	socket.on('disconnect', function()
	{
		if(!socket.kicked && user_info[socket.id]["nickname"])
		{	
			io.emit('USR_DISCONNECT', user_info[socket.id]["nickname"]);
			var i = users.indexOf(socket);
			delete users[i];
		}
	});
	
	socket.on('CHAT_MSG', function(msg)
	{
		on_message(socket, msg);
	});
	
	socket.on('AUTH_LOGIN', function(nick, pass)
	{
		var nick = auth_lib.checkAuth(socket, nick, pass);
		user_info[socket.id]["nickname"] = nick;
		
		if(nick)
			send_history(socket);
	});
	
	socket.on('NICK_LIST', function()
	{
		var nlist = [];
		for(var i = 0; i < users.length; i++)
		{
			if(users[i] && user_info[users[i].id]["nickname"])
			{
				var nick = user_info[users[i].id]["nickname"];
				var col = (nick == "Bizzycola" || nick == "Brynk") ? "<span style='color: darkred;' title='Admin'>"+nick+"</span>" : nick;col = (nick == "Bizzycola") ? "<span style='color: darkred;' title='Admin'>Bizzycola</span>" : nick;
				
				nlist.push(col);
			}
		}
			
		socket.emit("NICK_LIST", nlist);
		
	});
	
});

//HTTP!
http.listen(3120, function()
{
	console.log('listening on *:3120');
});
