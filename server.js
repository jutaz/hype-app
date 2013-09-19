global.conf = require('./conf.json');
global.conf.development = (conf.environment == "development");
global.error = require("./lib/errorHandler");
var logHooker = require('./lib/logHooker');
var cluster = require('cluster');
var express = require('express');
var expressValidator = require('express-validator');
var mongoStore = require('mong.socket.io');
var ping = require('./lib/ping');
var app = express();
var routes = require('./routes/main');
var middleware = require("./lib/middleware");
var https = require('https');
var fs = require('fs');
if (conf.ssl && conf.ssl.key && conf.ssl.cert && conf.ports.ssl) {
	var httpsServer = https.createServer({
		key: fs.readFileSync(conf.ssl.key, 'utf8'),
		cert: fs.readFileSync(conf.ssl.cert, 'utf8')
	}, app);
	httpsServer.listen(conf.ports.ssl);

}
var io = require('socket.io').listen(app.listen(conf.ports.web), { log: conf.development });

//setting up some custom middleware
session = middleware.session(express);
conf.cookie.store = new session();

app.disable('x-powered-by');
app.use(middleware.logger);
app.use(express.static(__dirname + '/public'));
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

app.set('title', 'Presentations');
app.set('views', __dirname + '/templates');
app.set('view engine', "jade");

app.engine('jade', require('jade').__express);

//Default buit-in routes
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.login_step2);
app.get('/logout', routes.logout);
app.get('/register', routes.register);
app.post('/register', routes.register_step2);
app.post('/log/error', routes.log_error);

app.get('/staff', middleware.auth.staff, routes.staff.main);
app.get('/staff/mission-control/activate', middleware.auth.staff, routes.staff.mission_control_activate);
app.get('/staff/mission-control/deactivate', middleware.auth.staff, routes.staff.mission_control_deactivate);


//error pages. Those should be last routes. 
app.all('*', routes.error_404);
app.use(middleware.serverError);