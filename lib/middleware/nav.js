module.exports = function(req, res, next) {
	var paths = { 
		'':'Main'
	}
	if(req.session.loggedIn) {
	} else {
		paths['login'] = 'Login';
		paths['register'] = 'Register';
	}
	res.locals.paths = paths;
	if(req.url.substr(1).indexOf("/") > -1 && req.url.substr(1) != 'user/'+req.user._id) {
		url = req.url.substr(1).split("/")[0];
	} else {
		url = req.url.substr(1);
	}
	for (var i in paths) {
		if(url == i) {
			res.locals.current_page = i;
			next();
			return;
		}
	}
	next();
}