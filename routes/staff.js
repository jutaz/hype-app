var perf_model = require('../models/perf');
var staff = {};

staff.main = function(req, res) {
	perf_model.get_average("", function(data) {
		res.render('staff/index', {loadTimes: data});
	});
}

staff.mission_control_activate = function(req, res) {
	req.session.mission_control = true;
	res.json({success: true});
}

staff.mission_control_deactivate = function(req, res) {
	req.session.mission_control = false;
	res.json({success: true});
}


module.exports = staff;