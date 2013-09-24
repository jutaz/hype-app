global.conf = require('./conf.json');
global.conf.development = (conf.environment == "development");
global.error = require("./lib/errorHandler");
var logHooker = require('./lib/logHooker');
var RedisStore = require('socket.io/lib/stores/redis');
var redis  = require('socket.io/node_modules/redis');
var pub    = redis.createClient();
var sub    = redis.createClient();
var client = redis.createClient();
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

//setting up some custom middleware
session = middleware.session(express);
conf.cookie.store = new session();

app.disable('x-powered-by');
app.use((conf.development) ? middleware.logger : express.logger('dev'));
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
app.get('/staff/mission-control/toggle', middleware.auth.staff, routes.staff.mission_control_toggle);
app.all('/staff/mission-control/bar/:id', middleware.auth.staff, routes.staff.bar);


//error pages. Those should be last routes. 
app.all('*', routes.error_404);
app.use(middleware.serverError);

io.set('store', new RedisStore({
	redisPub : pub,
	redisSub : sub,
	redisClient : client
}));
io.set('authorization', middleware.auth.socket);