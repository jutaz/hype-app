global.conf = require('./conf.json');
global.conf.development = (conf.environment == "development");
global.error = require("./lib/errorHandler");
var logHooker = require('./lib/logHooker');
var routes = require('./routes/main');
var middleware = require("./lib/middleware");

var test = require('./system/main');
app = test.init();
test.listen(app);
// var system = require('./system/init.js')();
// var app = system.app;
// var io = require('./system/io.js')(system.io);

app.set('title', 'Hype');

//Define your routes here.


//error pages. Those should be last routes. You may replace these with your own.
app = require('./system/error_pages')(app);