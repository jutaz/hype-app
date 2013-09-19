var userStore = {};
var states = require("../states.json");

window.onerror = function (msg, url, line) {
	$.post("/log/error", { "msg" : msg, "url": url, "line": line, "request_id": $("meta[name='request-id']")[0].content});
}

$(document).on('pjax:complete', function(pjax, ajax) {
	$("meta[name='request-id']")[0].content = ajax.getResponseHeader('request-id');
})

$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

setTimeout(function() {
	throw new Error("test");
}, 5000);

$(document).ready(function() {
	$(document).on('click', 'a', function (event) {
		event.preventDefault();
		$(this).parent().addClass('active').siblings().removeClass('active');
		return $.pjax.click(event, '#container');
	});
});

var socket = io.connect();

socket.on('connect', function () {});

function getUser(id) {
	if(userStore[id]) {
		return userStore[id];
	} else {
		data = JSON.parse($.ajax({
			type: "GET",
			url: '/user/get/'+id,
			async: false
		}).responseText)
		userStore[data._id] = data;
		return data; 
	}
}

keypress.combo("shift q z", function() {
	open_dev_bar();
});

function open_dev_bar() {
	$.ajax({
		type: "GET",
		url: '/staff/mission-control/activate'
	}).done(function(data) {});
}

function get_online(callback) {
	$.ajax({
		type: "GET",
		url: '/user/online'
	}).done(function(data) {callback(data)});
}