var socket = io();
var myNick = "";
var msg_id = 0;
var hasAuth = false;
var objDiv = document.getElementById("bizzychat-messages");
var audio = new Audio('Sounds/Notification.mp3')

//http://stackoverflow.com/questions/5796718/html-entity-decode/27385169#27385169
var decodeEntities = (function () {
        //create a new html document (doesn't execute script tags in child elements)
        var doc = document.implementation.createHTMLDocument("");
        var element = doc.createElement('div');

        function getText(str) {
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
            return str;
        }

        function decodeHTMLEntities(str) {
            if (str && typeof str === 'string') {
                //called twice because initially text might be encoded like this: &lt;img src=fake onerror=&quot;prompt(1)&quot;&gt;
                return getText(getText(str));
            }
        }
        return decodeHTMLEntities;
    })();

function validate_message(msg)
{
	if(msg.length > 1500)
		msg = msg.substr(1, 1500) + "...";
	
	return msg;
}

function toggle_show(mid)
{
	var ths = $('.showmore_link[data-mid="'+mid+'"]');
	var showing = ths.data('showing');
	
	if(showing == "1")
	{
		$('.shortmsg[data-mid="'+mid+'"]').show();
		$('.longmsg[data-mid="'+mid+'"]').hide();
		ths.data("showing", "0");
		ths.html("Show More");
	}
	else
	{
		$('.shortmsg[data-mid="'+mid+'"]').hide();
		$('.longmsg[data-mid="'+mid+'"]').show();
		ths.data("showing", "1");
		ths.html("Show Less");
		objDiv.scrollTop = objDiv.scrollHeight;
	}
	return false;
}

//Using a function for this so we can support show more links on chat history as well. 
function add_message(nick, msg)
{
	var nmsg = msg;
	
	if(msg.length > 300)
	{
		var chatmsg = $("<span class='chat_message'></span>");
		
		chatmsg.append("<span class='chat_nick'>"+nick+"</span>: ");
		chatmsg.append("<span class='shortmsg' data-mid='"+msg_id+"'>"+msg.substr(1, 300)+"</span>");
		
		var longmsg = $("<span class='longmsg' data-mid='"+msg_id+"'></span>");
		longmsg.hide();
		longmsg.html("<pre>"+msg+"</pre");
		chatmsg.append(longmsg);
		chatmsg.append("<br/><a href='#' class='showmore_link' data-mid='"+msg_id+"' data-showing='0' onclick='javascript:toggle_show("+msg_id+");return false;'>Show More</a>");
		
		$('.message-list').append(chatmsg);
	}
	else
		$('.message-list').append("<span class='chat_message' data-mid='"+msg_id+"'><span class='chat_nick'>"+nick+"</span>: "+msg+"</span><br/>");
	objDiv.scrollTop = objDiv.scrollHeight;
	msg_id++;
}


function doLogin()
{
	var nick = $("#login_nick").val();
	var pass = $("#login_pass").val();
	
	socket.emit('AUTH_LOGIN', nick, pass);
}

$('.message-list').append($('<li class="user_notice">').text("Welcome to the chat!"));
$('#msgBox').keypress(function (e) {
	if (e.which == 13) {
		var text =  $("#msgBox").val();
		$('#msgBox').val('');
		
		text = decodeEntities(validate_message(text));
		socket.emit('CHAT_MSG', text);
		//$('.message-list').append("<span class='chat_message'><span class='chat_nick'>"+myNick+"</span>: "+text+"</span><br/>");
		add_message(myNick, text);
		
		objDiv.scrollTop = objDiv.scrollHeight;
		return false;
	}
});


socket.on('CHAT_MSG', function(nick, msg)
{
	if(!hasAuth) return;
	
	add_message(nick, msg);
	audio.play();
});

socket.on('USR_CONNECT', function()
{
	if(!hasAuth) return;
	
	$('.message-list').append($('<li class="user_notice">').text("User connected."));
	objDiv.scrollTop = objDiv.scrollHeight;
	getNicks();
});

socket.on('USR_DISCONNECT', function()
{
	if(!hasAuth) return;
	
	$('.message-list').append($('<li class="user_notice">').text("User disconnected."));
	objDiv.scrollTop = objDiv.scrollHeight;
	getNicks();
});

socket.on('CONN_KICKED', function(reason)
{
	alert("You were kicked from the server: "+reason);
	window.location = window.location;
});

socket.on('USR_KICKED', function(nick, reason)
{
	if(!hasAuth) return;
	
	$('.message-list').append("<span class='chat_message user_notice'><span class='chat_nick'>"+nick+"</span> was kicked("+reason+").</span><br/>");
	objDiv.scrollTop = objDiv.scrollHeight;
	getNicks();
});
socket.on('disconnected', function()
{
	window.location = window.location;
});

socket.on('NICK_LIST', function(list)
{
	if(!hasAuth) return;
	
	if(!list) return;
	
	var html = "";
	for(var i = 0; i < list.length; i++)
		html += "<li class='ulist_nick'>"+list[i]+"</li>";
	
	$("#user-list").html(html);
});

socket.on('CHAT_HISTORY', function(list)
{
	if(!hasAuth) return;
	
	if(!list) return;
	
	for(var i = 0; i < list.length; i++)
		add_message(list[i][0], list[i][1]);
		//$('.message-list').append("<span class='chat_message'><span class='chat_nick'>"+list[i][0]+"</span>: "+list[i][1]+"</span><br/>");
	
});
socket.on('HAS_AUTH', function(status)
{
	if(!hasAuth) return;
	
	if(!status)
	{
		hasAuth = false;
		alert("Disconnected from server.");
		window.location = window.location;
	}
});
socket.on('SERVER_SHUTDOWN', function()
{
	hasAuth = false;
	alert("Disconnected: Server is shutting down.");
	window.location = window.location;

});

function getNicks()
{
	if(hasAuth)
		socket.emit("NICK_LIST");
}
setInterval(getNicks, 3000)

function checkAuth()
{
	if(hasAuth)
		socket.emit("HAS_AUTH");
}
setInterval(checkAuth, 2000)

//auth response
socket.on('AUTH_RESPONSE', function(status, error)
{
	if(status)
	{
		$("#chat").show();
		$("#login").hide();
		myNick = $("#login_nick").val();
		$("#login_pass").val("");
		$("#resp").hide();
		hasAuth = true;
	}
	else
	{
		$("#resp_error").html(error);
		$("#resp").show();
		hasAuth = false;
	}
});


$(function()
{
	$("#chat").hide();
	$("#login").show();
	$("#resp").hide();
	
});