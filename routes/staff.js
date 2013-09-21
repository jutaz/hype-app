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

staff.mission_control_toggle = function(req, res) {
	if(req.session.mission_control) {
		req.session.mission_control = false;
	} else {
		req.session.mission_control = true;
	}
	res.json({success: true});
}

staff.bar = function(req, res) {
	res.render('staff/bar');
}

module.exports = staff;