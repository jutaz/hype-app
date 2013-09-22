var db = require('../db').general;
var cluster = require('cluster');
module.exports = function(req, res, next) {
	req._startTime = new Date;
	var end = res.end;
	res.locals.request_id = db.ObjectId();
	res.setHeader("Request-Id", res.locals.request_id);
	res.end = function(chunk, encoding) {
		res.end = end;
		res.end(chunk, encoding);
		var time = new Date;
		// there`s no need to log cssRefresh requests
		if(req.query.cssrefresh) {
			return;
		}
		data = {
			_id: db.ObjectId(res.locals.request_id),
			method: req.method,
			url: req.originalUrl || req.url,
			pathname: req._parsedUrl.pathname,
			query: req.query,
			req_headers: req.headers,
			res_headers: res._headers,
			http_version: req.httpVersion,
			status_code: (res.locals.statusCode && req.headers["x-pjax"]) ? res.locals.statusCode : res.statusCode,
			pjax: (req.headers["x-pjax"]) ? true : false,
			cluster_id: cluster.worker.id,
			time: (time-req._startTime),
			request_date: req._startTime
		}
		if(res.locals.error) {
			data.error = {
				error: res.locals.error,
				stack: res.locals.error.stack
			};
		}
		if(req.route) {
			data.assoc_req_id = false;
			data.type = "web_request";
		} else {
			if(req.query.request_id) {
				data.assoc_req_id = req.query.request_id;
			} else {
				data.assoc_req_id = false;
			}
			
			data.type = "static_asset";
		}
		db.collection('perf').insert(data, function(err) {

		});
	};
	next();
}