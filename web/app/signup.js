//
// signup.js
//

;(function() {
	var requestSignup = function() {
		var name = $('#input_email').val();
		var pwd = $('#input_password').val();
		var repeatPwd = $('#input_password_repeat').val();
		var tips = $('#shortcut_signup_tips');

		var csid = window.utils.getUrlParam('csid');

		if (name.length < 6 || name.length > 32) {
			tips.text('请填写正确的邮箱地址。');
			setTimeout(function() {
				tips.html('&nbsp;');
			}, 3000);
			return;
		}
		if (pwd.length < 6) {
			tips.text('请至少输入6位密码。');
			$('#input_password').val('');
			$('#input_password_repeat').val('');
			setTimeout(function() {
				tips.html('&nbsp;');
			}, 3000);
			return;
		}
		if (pwd != repeatPwd) {
			tips.text('两次输入的密码不一致，请重新输入。');
			$('#input_password').val('');
			$('#input_password_repeat').val('');
			setTimeout(function() {
				tips.html('&nbsp;');
			}, 3000);
			return;
		}

		var pwdMd5 = md5(pwd);

		$('#btn_submit').attr("disable", "disable");

		$.post('auth/signup', {
				name: name,
				pwd: pwdMd5
			}, function(data, textStatus, jqXHR) {
				var state = data.state;
				if (state == 200) {
					var token = data.data.token;
					var href = "index.html?token=" + token + (null == csid ? "" : "&csid=" + csid);
					window.location.href = href;
				}
				else if (state == 2005) {
					tips.text('邮箱地址已被注册，请更换邮箱地址后再注册。');
					setTimeout(function() {
						tips.html('&nbsp;');
					} , 8000);
				}
				else {
					tips.text('注册失败，请稍候再试…');
					setTimeout(function() {
						tips.html('&nbsp;');
					} , 8000);
				}

				$('#btn_submit').removeAttr('disable');
			}, 'json');
	}

	$('#btn_submit').click(function(e) {
		requestSignup();
	});

	$('#input_password_repeat').keypress(function(e) {
		if (e.keyCode == 13) {
			requestSignup();
			e.preventDefault();
		}
	});
})();

$(document).ready(function(e) {
	$('#btn_submit').removeAttr('disable');

	var resize = function() {
		var height = $(window).height();
		$('.footer')[0].style.marginTop = (height - 410) + 'px';
	}

	$(window).resize(function(e) {
		resize();
	});

	resize();
});
