var db = require("./db").general;
var errorHandler = {};


errorHandler.mongo = function(err, callback) {
	if(callback) callback();
	data = {
		data: JSON.stringify(err),
		stack: err.stack,
		type: "mongo"
	}
	db.collection('errors').insert(data, function(err, info) {

	});
}

errorHandler.clientJS = function(err, callback) {
	if(callback) callback();
	data = {
		data: JSON.stringify(err),
		stack: err.stack,
		type: "client"
	}
	db.collection('errors').insert(data, function(err, info) {
	});
}

errorHandler.core = function(err, callback) {
	if(callback) callback();
	data = {
		data: err,
		stack: err.stack,
		type: "core"
	}
	db.collection('errors').insert(data, function(err, info) {
	});
}

module.exports = errorHandler;