var mongo = require('mongoskin');
var objectId = require('objectid');
var db = {};

db.general = mongo.db('mongo://'+conf.db.username+':'+conf.db.password+'@'+conf.db.host+':'+conf.db.port+'/'+conf.db.database.general, {'auto_reconnect': true , 'poolSize': 1 , w:1 , safe: true});
db.general.ObjectId = objectId;
db.general.open(function(err, data) {
	// console.log(err);
});
db.general.on('error', function(err) {
	// console.log('err'+err);
});

module.exports = db;