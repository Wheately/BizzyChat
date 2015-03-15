var mysql      = require('mysql');
var connection = false;
function init(event)
{
	var conn = mysql.createConnection({
	  host     : '',//wheately: You can ask me for ours.
	  user     : 'bizzychat',
	  password : '', //Wheately: And for this too.
	  database : 'bizzychat'
	});
	conn.connect(function(err) {
		if (err) 
		{
			event.emit("db_connected", false, false);
			return;
		}
		
		event.emit("db_connected", true, conn);
	});
	connection = conn;
	
	if(!connection) throw "Database connection failed.";
}


module.exports = {
	init: init,
	MySQL: mysql,
	DBCon: connection
};

