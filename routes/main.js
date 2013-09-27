var routes = {};

routes.index = function(req, res) {
	if(req.user.loggedIn) {
		res.render("online", {
			user: req.user,
		});
	} else {
		res.render("index", {
			user: req.user,
		});
	}
}

module.exports = routes;