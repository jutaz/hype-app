var system = require('./system/main');
var routes = require('./routes/main');

app = system.init();

app.set('title', 'Hype');

//Define your routes here.


//error pages. Those should be last routes. You may replace these with your own.
app = require('./system/error_pages')(app);
system.listen(app);