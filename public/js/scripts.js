var userStore = {};

window.onerror = function (msg, url, line) {
	$.post("/log/error", { "msg" : msg, "url": url, "line": line, "request_id": $("meta[name='request-id']")[0].content});
}

$(document).on('pjax:complete', function(pjax, ajax) {
	$("meta[name='request-id']")[0].content = ajax.getResponseHeader('request-id');
	reload_dev_bar();
});


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
	toggle_dev_bar();
});

function toggle_dev_bar() {
	$.ajax({
		type: "GET",
		url: '/staff/mission-control/toggle'
	}).done(function(data) {
		if(data.bar) {
			show_dev_bar();
		} else {
			hide_dev_bar();
		}
	});
}

function show_dev_bar() {
	$.ajax({
		type: "GET",
		url: "/staff/mission-control/bar/"+$("meta[name='request-id']")[0].content
	}).done(function(data) {
		$("div.navbar").prepend(data);
		var topHeigth = $("div.navbar").outerHeight() - $('.navbar-inner').outerHeight();
		var currentHeigth = parseInt($('#container').css('padding-top'));
		$('#container').css('padding-top', currentHeigth+topHeigth+"px");
	});
}

function hide_dev_bar() {
	if(!$("#mission-control").length) {
		return;
	}
	var topHeigth = $("div.navbar").height()-$('.navbar-inner').outerHeight();
	var currentHeigth = parseInt($('#container').css('padding-top'));
	$('#container').css('padding-top', currentHeigth-topHeigth+"px");
	$("#mission-control").remove();
}

function reload_dev_bar() {
	if(!$("#mission-control").length) {
		return;
	}
	$.ajax({
		type: "GET",
		url: "/staff/mission-control/bar/"+$("meta[name='request-id']")[0].content
	}).done(function(data) {
		$('#mission-control').replaceWith(data);
	});
}

function get_online(callback) {
	$.ajax({
		type: "GET",
		url: '/user/online'
	}).done(function(data) {callback(data)});
}