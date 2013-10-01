var settings = require('settings');
global.conf = new settings(require('../conf.json'));
global.conf.development = (conf.environment == "development");
global.error = require("./lib/errorHandler");
global.db = require("./lib/db");
var logHooker = require('./lib/logHooker');
var system = require('./init.js');
var https = require('https');
var fs = require('fs');
var io_conf = require('./io.js');
var path = require('path');

var main = {};

main.init = function(options) {
	if(!options) options = {};
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
		var io = io_conf(io);
	}
	return {"io": io, "app": app}
}
module.exports = main;