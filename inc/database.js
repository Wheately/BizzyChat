var mysql      = require('mysql');
var connection = false;
function init(event)
{
		
	var conn = mysql.createConnection({
	  host     : 'bizzycola.info',
	  user     : 'bizzychat',
	  password : 'SfCV8cL75hTRAywd',
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

