var settings = require('settings');
var https = require('https');
var fs = require('fs');
var path = require('path');

var main = {};

main.init = function(options) {
	if(!options) {
		throw new Error("Options must be specified!");
	}
	if(!options.conf) {
		throw new Error("Options.conf must be specified!");
	}
	global.conf = new settings(require(path.normalize(options.conf)));
	global.conf.development = (conf.environment == "development");
	global.db = require("./lib/db");
	global.error = require("./lib/errorHandler");
	var logHooker = require('./lib/logHooker');
	var system = require('./init.js');
	return system(options);
}

main.listen = function(app, options) {
	if(!options) options = {
		https: true,
		http: true,
		io: true
	};
	if (process.env['ssl'] == "true" && options.https && options.ssl) {
		var httpsServer = https.createServer({
			key: fs.readFileSync(path.normalize(options.ssl.key), 'utf8'),
			cert: fs.readFileSync(path.normalize(options.ssl.cert), 'utf8')
		}, app);
		httpsServer.listen(conf.ports.ssl);
		srv = httpsServer.listen(conf.ports.ssl);
		if(options.io) {
			var io = require('socket.io').listen(srv, { log: conf.development });
		}
	} else {
		if(options.http) {
			srv = app.listen(conf.ports.web);
		}
		if(options.io) {
			if(srv) {
				var io = require('socket.io').listen(srv, { log: conf.development });
			} else {
				var io = require('socket.io').listen(conf.ports.web, { log: conf.development });
			}
		}
	}
	if(options.io) {
		var io_conf = require('./io.js');
		var io = io_conf(io);
	}
	return {"io": io, "app": app}
}
module.exports = main;