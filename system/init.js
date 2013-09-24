var express = require('express');
var expressValidator = require('express-validator');
var ping = require('../lib/ping');
var routes = require('../routes/main');
var middleware = require("../lib/middleware");
var https = require('https');
var fs = require('fs');
var path = require('path');

module.exports = function() {
	app = express();
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

	session = middleware.session(express);
	conf.cookie.store = new session();
	app.disable('x-powered-by');
	app.use((conf.development) ? middleware.logger : express.logger('dev'));
	app.use(express.static(path.normalize(__dirname + '/../public')));
	app.use(middleware.pjax);
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(expressValidator());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session(conf.cookie));
	app.use(middleware.user);
	app.use(middleware.nav);

	app.locals.pretty = conf.development;

	app.set('views', path.normalize(__dirname + '/../templates'));
	app.set('view engine', "jade");

	app.engine('jade', require('jade').__express);
	return {"app": app, "io": io};
}