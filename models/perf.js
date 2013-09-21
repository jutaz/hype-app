var db = require('../lib/db').general;
var perf = {};

perf.get_average = function(type, callback) {
	(type == "web_request" || type == "static_asset") ? query = {"type": type} : query = {} ;
	db.collection('perf').find(query).toArray(function(err, data) {
		if(type || type !== "") {
			total = data.length;
			count = 0;
			for (var i in data) {
				count = count+data[i].time;
			}
			callback(Math.round(count/total));
		} else {
			total = {};
			count = {};
			total.web = 0;
			total.assets = 0;
			count.web = 0;
			count.assets = 0;
			for (var i in data) {
				if(data[i].type == "web_request") {
					count.web = count.web+data[i].time;
					total.web++;
				} else {
					count.assets = count.assets+data[i].time;
					total.assets++;
				}
			}
			data = {
				web: Math.round(count.web/total.web),
				assets: Math.round(count.assets/total.assets)
			}
			callback(data);
		}
	});
}

perf.get_request = function(id, callback) {
	if(!db.ObjectId.isValid(id)) {
		callback("Object Id is not valid", null);
		return;
	}
	db.collection("perf").find({_id: db.ObjectId(id)}).limit(0).toArray(function(err, results) {
		if(err) {
			error.mongo(err);
			callback(err, null);
			return;
		}
		if(results.length < 1) {
			callback(null, null);
			return;
		}
		callback(null, results[0]);
	});
}



module.exports = perf;