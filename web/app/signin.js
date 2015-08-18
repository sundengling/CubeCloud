//
// signin.js
//

;(function(global) {
	$('#form').submit(function(e) {
		var pwd = $('#input_password').val();
		if (pwd.length < 6) {
			e.preventDefault();
			alert('请输入正确的登录密码。');
			return;
		}

		pwd = md5(pwd);
		$('#input_password').val(pwd);

		// 是否免登录
		if ($('.form-signin').find('[name="remember"]')[0].checked) {
			// 存储登录信息
			var name = $('#input_email').val();
			var time = Date.now();

			var sign = {'name': name, 'pwd': pwd, 'time': time};
			window.localStorage.setItem("__cubecloud_sign__", JSON.stringify(sign));
		}
		else {
			window.localStorage.removeItem("__cubecloud_sign__");
		}
	});

	global.app = {
		clearSignin: function() {
			window.localStorage.removeItem("__cubecloud_sign__");
		}
	};
})(window);

$(document).ready(function(e) {
	var error = window.utils.getUrlParam('error');
	if (null != error) {
		if (error == '2007') {
			alert('请先注册账号。');
		}
		else if (error == '2003') {
			alert('请检查输入的注册邮箱和密码是否正确。');
		}
		else {
			alert('请稍候再试……');
		}
	}

	var resize = function() {
		var height = $(window).height();
		$('.footer')[0].style.marginTop = (height - 410) + 'px';
	}

	$(window).resize(function(e) {
		resize();
	});

	resize();
});
