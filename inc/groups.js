var dbcon = false;
var groups = [];

function init(db)
{
	dbcon = db;
	
	load_groups();
}

function load_groups()
{
	if(!dbcon) return;
	dbcon.query('SELECT `id`, `title` FROM `groups`', function (error, results, fields) {
		console.log("#Groups: " + results.length);
		
		for(var i = 0; i < results.length; i++)
			if(!is_group(results[i]["title"])) //prevent groups with duplicate names being loaded.
			groups[i] = results[i];
		
		load_rooms();
	});
}
function load_rooms()
{
	dbcon.query('SELECT `id`, `gid`, `title`, `topic` FROM `rooms`', function (error, res, fields) {
		console.log("#Rooms: " + res.length);
		
		clear_rooms();
		for(var i = 0; i < res.length; i++)
		{
		console.log(groups);
		}
	});
}

function is_group(title)
{
	for(var i = 0; i < groups.length; i++)
		if(groups[i]["title"].toLowerCase() == title.toLowerCase())
			return groups[i]["id"];
	return false;
}

function get_group_rooms(gid)
{
	var ind = get_group_index(gid);
	if(ind < 0) return -1;
	
	console.log(groups[ind][2]);
	return groups[ind]["rooms"];
}

function clear_rooms()
{
	for(var i = 0; i < groups.length; i++)
		groups[i]["rooms"] = [];
	return false;
}
function get_group_index(id)
{
	for(var i = 0; i < groups.length; i++)
		if(groups[i]["id"] == id)
			return i;
	return -1;
}
function get_group_title(id)
{
	for(var i = 0; i < groups.length; i++)
		if(groups[i][0] == id)
			return groups[i][1];
	return false;
}

/*
 * Gets socket IDs for users in the group with the provided ID.
*/
function get_users_in_group(gid, user_info)
{
	var users = [];
	for (var i in user_info) 
	{
		if(user_info[i]["group"] != gid) continue;
		users.push(i);
	}
	
	if(users.length < 1) return false
	return users;
}

module.exports = {
	init: init,
	getTitle: get_group_title,
	isGroup: is_group,
	getRooms: get_group_rooms,
	getUsersInGroup: get_users_in_group
};