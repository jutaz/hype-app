global.conf = require('./conf.json');
global.conf.development = (conf.environment == "development");
global.error = require("./lib/errorHandler");
var RedisStore = require('socket.io/lib/stores/redis');
var redis  = require('socket.io/node_modules/redis');
var pub    = redis.createClient();
var sub    = redis.createClient();
var client = redis.createClient();
var routes = require('./routes/main');
var middleware = require("./lib/middleware");

var system = require('./system/init.js')();
var app = system.app;
var io = system.io;

app.set('title', 'Hype');

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