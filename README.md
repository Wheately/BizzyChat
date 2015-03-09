# BizzyChat
A Socket.IO / Node.JS Web Chat.

This is a free open source little project I decided to do for fun.
It's not going to be the most complicated web chat in the world or anything but it could be fun to play with if you're new to Node.JS and Socket.IO.

## Current Features ##
-Login with nickname and optional password(check auth.js for validating passwords. Methods other than if statements will be added later).
-Nicklist on the left.
-Kicks users if they post more than 5 messages in 3 seconds.
-Nicknames must be alphanumeric and between 3 and 15 characters in length.
-The last 20 lines of chat history will be sent to the client when they join, a bit like a shoutbox.

## Upcoming Features ##
-Proper authentication with some kind of database to store registered nicknames.
-Prevent duplicate nicks.
-Add a maximum message length.
-Notify the user when they are disconnected in some fashion other than being kicked.
-Allow accounts to be admins which can kick and mute users.

## Possible Future Features ##
-Multiple Chat Rooms
-Private Messages
-An embeddable chat client to put in ones site like a shoutbox.
-Ability to work with existing site accounts for the above feature.

## USAGE ##
Place the files together in a directory somewhere, change to it in the terminal and run 'node main.js'.
You may then connect to the chat by visiting http://your-ip-or-domain-here:3120
