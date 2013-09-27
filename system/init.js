var express = require('express');
var expressValidator = require('express-validator');
var ping = require('../lib/ping');
var routes = require('../routes/main');
var middleware = require("../lib/middleware");
var path = require('path');

module.exports = function() {
	app = express();

	session = middleware.session(express);
	conf.cookie.store = new session();
	app.disable('x-powered-by');
	app.use(express.cookieParser());
	app.use(express.session(conf.cookie));
	app.use(middleware.logger);
	app.use(express.static(path.normalize(__dirname + '/../public')));
	app.use(middleware.pjax);
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(expressValidator());
	app.use(express.methodOverride());
	app.use(middleware.user);
	app.use(middleware.nav);

	app.locals.pretty = conf.development;

	app.set('views', path.normalize(__dirname + '/../templates'));
	app.set('view engine', "jade");

	app.engine('jade', require('jade').__express);

	app.get('/', routes.index);
	app.get('/login', routes.login);
	app.post('/login', routes.login_step2);
	app.get('/logout', routes.logout);
	app.get('/register', routes.register);
	app.post('/register', routes.register_step2);

	app = require('./staff.js')(app);
	return app;
}