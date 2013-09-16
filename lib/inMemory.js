var inMemory = {};

var data = {};

inMemory.store = function(collection, key, value, callback) {
	data[collection][key] = value;
	callback();
}

inMemory.get = function(collection, key, callback) {
	if (data[collection][key]) {
		callback(data[collection][key]);
	} else {
		callback(null);
	}
}

inMemory.create_collection = function(name, callback) {
	if(callback) 
		callback(name);
	data[name] = {};
}

module.exports = inMemory;