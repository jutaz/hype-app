var system = require('./system/main');
var routes = require('./routes/main');

app = system.init({
	default_routes: true,
	middleware: true,
	sessions: true,
	staff_mode: true,
	logger: true,
	validator: true,
	pjax: true,
	template_dir: __dirname+"/templates",
	public_dir: __dirname+"/public",
	view_engine: "jade",
});

app.set('title', 'Hype');

//Define your routes here.
app.get('/', routes.index);

//error pages. Those should be last routes. You may replace these with your own.
app = require('./system/error_pages')(app);
system.listen(app);