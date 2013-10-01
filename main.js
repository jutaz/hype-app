var cluster = require('cluster');
var fs = require('fs');
var cpus = require('os').cpus();
var os = require('os');
var settings = require('settings');
var conf = new settings(require('./conf.json'), {env: 'development'});
var watch = require('watch');
var path = require('path');
var browserify = require('browserify');
var bower =  require('bower-json');
var compressor = require('node-minify');
var UglifyJS = require("uglify-js");
var bowerrc = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/.bowerrc')));
conf.development = (conf.environment == "development");
var sslRuns = 0;
var packages = [];
var dead_list = [];

numberofWorkers = (conf.launch_options.workers) ? conf.launch_options.workers : cpus.length;

cluster.setupMaster({
	exec : path.normalize(__dirname+"/server.js"),
	silent : true
});

bower(path.normalize(__dirname+'/bower.json'), function(err, jsonData) {
	for(var i in jsonData.dependencies) {
		packages.push(path.normalize(__dirname+"/"+bowerrc.directory+"/"+i));
	}
	compile_client_js(packages);
});

process.on('exit', function() {
	console.log('Shutting down workers.');
	for (var i in cluster.workers){
		cluster.workers[i].destroy();
	}
	console.log('Exiting......');
});

function use_ssl() {
	sslRuns++;
	if(!conf.ssl || !conf.ssl.key || !conf.ssl.cert || !conf.ports.ssl) {
		return false;
	}
	if(numberofWorkers > 1) {
		if(sslRuns % 2 == 0) {
			return true;
		}
	}
	return false;
}

for (var i = 0; i < numberofWorkers; i++) {
	cluster.fork({"ssl": use_ssl(), "NODE_ENV": (conf.development) ? "development" : "production"});
}

for (var i in cluster.workers){
	cluster.workers[i].process.stdout.on('data', outputData);
	cluster.workers[i].process.stderr.on('data', outputData);
	cluster.workers[i].process.on('error', clusterError);
}

cluster.on('exit', function(worker, code, signal) {
	if (worker.suicide === true) {
		console.log(worker.process.pid+" was restarted due to file update.");
	} else {
		console.log('worker ' + worker.process.pid + ' died');
		add_to_dead_list(worker);
		cluster.fork({"ssl": use_ssl(), "NODE_ENV": (conf.development) ? "development" : "production"});
	}

});

watch.createMonitor(path.normalize(__dirname), function (monitor) {
	monitor.on("created", function (file, stat) {
		if(need_restart(file)) {
			restart_workers();
		}
	})
	monitor.on("changed", function (file, curr, prev) {
		if(need_restart(file)) {
			restart_workers();
		}
	})
	monitor.on("removed", function (file, stat) {
		if(need_restart(file)) {
			restart_workers();
		}
	})
});

watch.createMonitor(path.normalize(__dirname+"/public/"), function (monitor) {
	monitor.on("created", function (file, stat) {
		if(file !== path.normalize(__dirname+"/public/js/bundle.js")) {
			compile_client_js(packages);
		}
	})
	monitor.on("changed", function (file, curr, prev) {
		if(file !== path.normalize(__dirname+"/public/js/bundle.js")) {
			compile_client_js(packages);
		}
	})
	monitor.on("removed", function (file, stat) {
		if(file !== path.normalize(__dirname+"/public/js/bundle.js")) {
			compile_client_js(packages);
		}
	})
});

function restart_workers(callback) {
	for(var i in cluster.workers) {
		cluster.workers[i].disconnect();
		cluster.workers[i].destroy();
		new_worker = cluster.fork({"ssl": use_ssl(), "NODE_ENV": (conf.development) ? "development" : "production"})
		new_worker.process.stdout.on('data', outputData);
		new_worker.process.stderr.on('data', outputData);
		new_worker.process.on('error', clusterError);
	}
};

function outputData(chunk) {
	process.stdout.write(""+chunk);
}

function clusterError(err) {
	process.stderr.write(err);
}

function need_restart(file) {
	cwd = __dirname+path.sep;
	paths = [cwd+'main.js', cwd+'public', cwd+'.git']
	for (var i in paths) {
		if(file.startsWith(paths[i])) {
			return false;
		}
	}
	return true;
}

function count_dead() {
	if(dead_list.length >= 16) {
		process.exit(0);
	} else {
		dead_list = [];
	}
}

function add_to_dead_list(worker) {
	dead_list.push(worker);
}

function compile_client_js(scripts) {
	var alljs = [];
	var allJsSrc = [];
	var b = browserify();
	for (var i in scripts) {
		tmp = JSON.parse(fs.readFileSync(scripts[i]+path.sep+"bower.json"));
		if(typeof tmp.main == 'object') {
			for (var e in tmp.main) {
				if(path.extname(tmp.main[e]) == '.js') {
					alljs.push(path.normalize(scripts[i]+path.sep+tmp.main[e]));
				}
			}
		} else {
			alljs.push(path.normalize(scripts[i]+path.sep+tmp.main));
		}
	}
	alljs.push(path.normalize(__dirname+"/public/js/scripts.js"));
	var result = UglifyJS.minify(alljs, {
		outSourceMap: true,
		sourceRoot: "//localhost/js/",
		outSourceMap: path.normalize(__dirname+"/public/js/bundle.js.map"),
	});
	fs.writeFileSync(path.normalize(__dirname+"/public/js/bundle.js"), result.code+"//@ sourceMappingURL=/js/bundle.js.map");
}

setInterval(count_dead, 5000);


String.prototype.startsWith = function (str){
	return this.slice(0, str.length) == str;
};