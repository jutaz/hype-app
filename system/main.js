var system = require('./init.js');
var https = require('https');
var fs = require('fs');
var io_conf = require('./io.js');

var main = {};

main.init = function() {
	return system();
}

main.listen = function(app) {
	if (process.env['ssl'] == "true") {
		var httpsServer = https.createServer({
			key: fs.readFileSync(conf.ssl.key, 'utf8'),
			cert: fs.readFileSync(conf.ssl.cert, 'utf8')
		}, app);
		httpsServer.listen(conf.ports.ssl);
		var io = require('socket.io').listen(httpsServer.listen(conf.ports.ssl), { log: conf.development });
	} else {
		var io = require('socket.io').listen(app.listen(conf.ports.web), { log: conf.development });
	}
	var io = io_conf(io);
	return {"io": io, "app": app}
}
module.exports = main;