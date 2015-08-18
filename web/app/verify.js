// JavaScript Document

$(document).ready(function(e) {
	var resize = function() {
		var height = $(window).height();
		$('.footer')[0].style.marginTop = (height - 310) + 'px';
	}

	$(window).resize(function(e) {
		resize();
	});

	resize();

	var error = window.utils.getUrlParam('error');
	if (null != error || null != _e) {
		alert("您输入的频道进入密码错误，请重新输入");
	}
});
