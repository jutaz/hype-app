var db = require('../lib/db').general;
var perf = {};

perf.get_average = function(type, callback) {
	(type == "web_request" || type == "static_asset") ? query = {"type": type} : query = {} ;
	initial =  {count: 0, total: 0, web: {count: 0, total: 0}, asset: {count: 0, total: 0}};
	reduce = function(doc, out) {
		if(doc.type == "web_request") {
			out.web.count++;
			out.web.total+=doc.time;
		} else {
			out.asset.count++;
			out.asset.total+=doc.time;
		}
		out.count++;
		out.total+=doc.time;
	};
	db.collection('perf').group([], query, initial, reduce, true, function(err, results) {
		count = results[0];
		data = {
			web: Math.round(count.web.total/count.web.count),
			assets: Math.round(count.asset.total/count.asset.count)
		}
		callback(data);
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