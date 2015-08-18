// cover.js
//

$(document).ready(function(e) {
	$('#input_email').val('');
	$('#mynav').show();
	$('#myaction').hide();
	$('#jumbotron_action').show();
	$('#jumbotron_signup').hide();
	$('#filter_founder').val('');

	// 判断浏览器
	if (window.utils.isIE || window.utils.isSafari) {
		window.location.href = 'helper.html';
		return;
	}

	var token = window.utils.getUrlParam('token');
	if (null == token) {
		// 显示提示
		window.showDemoTip();

		// 检查 Cookie
		token = window.utils.getCookie('token');
		if (null == token) {
			requireSignin();
			return;
		}
	}

	// Token 写入全局
	window._token = token;
	window.utils.setCookie('token', token);

	$.get('channel/tenant', { token: token }
		, function(data, textStatus, jqXHR) {
			if (data.state == 200) {
				// 加载用户数据
				loadTenant(data.data);

				// 尝试获取 CSID
				var csid = window.utils.getUrlParam('csid');
				if (null != csid) {
					// CSID 不为空，转入频道 Session 页面
					window.location.href = "session.cube?csid=" + csid;
				}
			}
			else {
				window.utils.deleteCookie('token');
				requireSignin();
			}
		});

	// 加载频道列表
	loadChannelTable();

	// 自动心跳
	setInterval(function() {
		$.post('auth/hb', {token: window._token}, function(data, textStatus, jqXHR) {
				if (data.state == 200) {
					console.log('Heartbeat ok');
				}
				else {
					console.log('Heartbeat failed');
				}
			});
	}, 8 * 60 * 1000);

	ZeroClipboard.config({
		swfPath: 'assets/js/ZeroClipboard.swf'
		, hoverClass: 'zc-hover'
		, activeClass: 'zc-active'
	});

	ZeroClipboard.on({
		"ready": function(e) {
			console.log('Clipboard ready');
		},
		"error": function(e) {
			console.log('Clipboard error');
		}
	});
});

(function(global) {
	// 频道清单
	var channelList = [];
	var zcList = [];

	// 创建人映射频道
	var founderChannelMap = new HashMap();
	// 创建人清单
	var founderList = [];

	global.peerCubeName = null;

	global.showAlert = function(content, title) {
		$('#alert_content').html(content);

		if (title !== undefined) {
			$('#modal_alert').find('#AlertModalLabel').text(title);
		}
		else {
			$('#modal_alert').find('#AlertModalLabel').text('提示');
		}

		$('#modal_alert').modal('show');
	};

	global.requireSignin = function() {
		// 尝试执行自动登录
		var ls = window.localStorage.getItem('__cubecloud_sign__');
		if (ls !== undefined && null != ls) {
			var sign = JSON.parse(ls);
			if (Date.now() - sign.time < 7 * 24 * 60 * 60 * 1000) {
				// 执行自动登录
				global.showAlert('正在登录，请稍候……');

				$.post('auth/signin', {
					name: sign.name,
					pwd: sign.pwd,
					direct: true
				}, function(data, textStatus, jqXHR) {
					if (data.state == 200) {
						window.location.href = 'index.html?token=' + data.data.token + '&t=' + Date.now();
					}
					else {
						window.location.href = 'signin.html?error=' + data.state;
					}
				});
			}
		}

		$('#mynav').hide();
		$('#myaction').show();
		$('#jumbotron_action').hide();
		$('#jumbotron_signup').show();
	};

	global.loadTenant = function(data) {
		window.tenant = data;

		// 用户名
		$('#tenant_name').text(data.displayName);
		// 用户头像
		var style = $('.icon-user-face')[0].style;
		style.backgroundImage = 'url("' + data.face + '")';
	};

	// 加载列表
	global.loadChannelTable = function() {
		if (refreshTimer > 0) {
			clearInterval(refreshTimer);
			refreshTimer = 0;
		}

		$.get('list.cube', { token: window._token },
			function(data, textStatus, jqXHR) {
				if (data.state == 200) {
					var size = data.data.size;
					if (size > 0) {
						var currentLocation = window.location;
						var prefix = currentLocation.protocol + "//" + currentLocation.hostname + ":" + currentLocation.port;
						var ti = currentLocation.pathname.indexOf("index.html");
						var tmp = null;
						if (ti < 0) {
							tmp = currentLocation.pathname;
						}
						else {
							tmp = currentLocation.pathname.substring(0, ti);
						}
						prefix += tmp;

						//var url = prefix + "session.cube?csid=" + csid;

						var list = data.data.list;
						var buf = '';
						for (var i = 0; i < size; ++i) {
							var channel = list[i];
							// 记录数据
							channelList.push(channel);
							// 映射关系
							founderChannelMap.put(channel.founder, channel);
							founderList.push(channel.founder);

							var link = "session.cube?csid=" + channel.csid;
							var html = ['<tr class="', channel.csid, '"><td>', (i + 1), '</td>',
								'<td>', channel.displayName, '</td>',
								'<td>', channel.numTenants, '/', channel.maxTenants, '</td>',
								'<td>', channel.founder, '</td>',
								'<td class="countdown">', '</td>',
								'<td>', (channel.hasPassword ? '<span class="icon icon-lock" title="有密码"></span>' : '<span class="icon icon-unlock" title="无密码"></span>'), '</td>',
								'<td><a class="btn btn-sm btn-primary btn-join" href="', link, '" target="_blank" role="button">进入</a>',
								'&nbsp;&nbsp;',
								'<a id="', channel.csid, '" class="btn btn-sm btn-default btn-invite" href="javascript:;" data-clipboard-text="', prefix, link, '">邀请</a>',
								'&nbsp;&nbsp;',
								'</td></tr>'];
							buf += html.join('');
						}

						$('#coop_list').html(buf);

						// 刷新
						refreshChannelExpire();

						global.bindClipboard(channelList);
					}
				}
				else {
					console.log('Get channel list failed: ' + data.state);
				}
			});
	};

	global.bindClipboard = function(list) {
		if (zcList.length > 0) {
			for (var i = 0; i < zcList.length; ++i) {
				var zc = zcList[i];
				zc.destroy();
			}
			zcList.splice(0, zcList.length);
		}

		for (var i = 0; i < list.length; ++i) {
			var channel = list[i];
			var client = new ZeroClipboard(document.getElementById(channel.csid));
			client.on('aftercopy', function(e) {
				var content = "<p>频道的访问地址（URL）已经复制到剪贴板中。</p><p>您可以直接粘贴到 Email、QQ 等工具中发送邀请给任何人。</p>";
				global.showAlert(content);
			});
			zcList.push(client);
		}
	};

	global.selectOnlineOne = function(pcn, name) {
		$('#peer_name').val(name);
		global.peerCubeName = pcn;
	};

	global.showDemoTip = function() {
		$('.demo-tip').show(1000);

		var timer = setTimeout(function() {
			clearTimeout(timer);
			$('.demo-tip').hide(200);
		}, 20000);

		$('.demo-tip .glyphicon-remove').click(function(e) {
			clearTimeout(timer);
			$('.demo-tip').hide(200);
		});
	};

	var refreshTimer = 0;
	var refreshChannelExpire = function() {
		if (refreshTimer > 0) {
			return;
		}

		var refreshFun = function() {
			var time = Date.now();
			var dt = 3600000;
			for (var i = 0; i < channelList.length; ++i) {
				var channel = channelList[i];
				var dateTime = channel.createDate + channel.expiry * dt;
				if (dateTime - time > 0) {
					var d = dateTime - time;
					var h = parseInt(Math.floor(d / dt));
					var m = parseInt(Math.floor((d - h * dt) / 60000));
					//var s = parseInt(Math.floor((d - h * dt - m * 60000) / 1000));

					$('.' + channel.csid).find('.countdown').text(h + " 时 " + m + " 分");
				}
				else {
					if ($('.' + channel.csid).find('.btn-join').hasClass('disabled')) {
						continue;
					}
					$('.' + channel.csid).find('.countdown').html('<em>已过期</em>');
					$('.' + channel.csid).find('.btn-join').remove();
					$('.' + channel.csid).find('.btn-invite').remove();
				}
			}
		};

		refreshTimer = setInterval(function() {
			refreshFun();
		}, 60000);

		refreshFun();
	};

	// 快捷注册
	$('#btn_shortcut_signup').click(function() {
		var name = $('#input_email').val();
		var pwd = $('#input_password').val();
		var repeatPwd = $('#input_password_repeat').val();
		var tips = $('#shortcut_signup_tips');

		if (name.length < 6 || name.length > 32) {
			tips.text('填写正确的邮箱地址。');
			setTimeout(function() {
				tips.html('&nbsp;');
			}, 3000);
			return;
		}
		if (!window.utils.verifyEmail(name)) {
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

		$('#btn_shortcut_signup').attr("disable", "disable");

		$.post('auth/signup', {
				name: name,
				pwd: pwdMd5
			}, function(data, textStatus, jqXHR) {
				var state = data.state;
				if (state == 200) {
					var token = data.data.token;
					window.location.href = "index.html?token=" + token;
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

				$('#btn_shortcut_signup').removeAttr('disable');
			}, 'json');
	});

	// 创建按钮
	$('#btn_create').bind('click', function(e) {
		$('#coop_name').val('');
		$('#coop_maxtenants').val('');
		$('#coop_password').val('');
		$('#modal_create').modal('show');
	});

	// 一对一按钮
	$('#btn_one2one').click(function(e) {
		// 获取在线列表
		var menu = $('#online_menu_ul');
		$.get('online.cube', { token: window._token }
			, function(data, textStatus, jqXHR) {
				if (data.state != 200) {
					return;
				}

				window.onlineList = data.data.list;

				if (data.data.size == 1) {
					menu.html('<li role="presentation" class="disabled"><a role="menuitem" tabindex="-1" href="javascript:;">没有找到更多的在线用户</li>');
					return;
				}

				menu.html('');

				var list = data.data.list;
				for (var i = 0; i < list.length; ++i) {
					var t = list[i];
					if (window.tenant.name == t.name) {
						// 不显示自己
						continue;
					}
					var html = ['<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:selectOnlineOne(\'',
						t.cube, '\',\'', t.name, '\');">', t.displayName, '</a></li>'];
					menu.append(html.join(''));
					html = null;
				}
			});

		$('#peer_name').val('');
		$('#modal_one2one').modal('show');
	});

	// 启动一对一
	$('#btn_submit_one2one').click(function(e) {
		var name = $('#peer_name').val();
		if (name.length < 3 || name == window.tenant.name) {
			alert('输入的一对一用户名错误，请检查后重新输入');
			return;
		}

		if (null == window.peerCubeName) {
			for (var i = 0; i < window.onlineList.length; ++i) {
				var t = window.onlineList[i];
				if (t.name == name) {
					window.peerCubeName = t.cube;
				}
			}
		}

		if (null == window.peerCubeName) {
			alert('输入的用户不存在或用户未上线');
			return;
		}

		window.open('session.cube?token='+ window._token + '&pcn=' + window.peerCubeName);
		$('#modal_one2one').modal('hide');
	});

	// 退出按钮
	$('#btn_signout').bind('click', function(e) {
		$.post('auth/signout', { token: window._token }
			, function(data, textStatus, jqXHR) {
				if (data.state == 200) {
					window.utils.deleteCookie('token');
					window.localStorage.removeItem("__cubecloud_sign__");
					window.location.href = "index.html";
				}
				else {
					global.showAlert('注销失败，错误码: ' + data.state);
					window.localStorage.removeItem("__cubecloud_sign__");
					setTimeout(function() {
						window.location.href = "index.html";
					}, 8000);
				}
			}, 'json');
	});

	// 焦点时删除错误状态样式
	$('#coop_name').bind('focus', function(e) {
		$(this).parent().parent().removeClass('has-error has-feedback');
		$(this).next().addClass('hidden');
	});
	$('#coop_maxtenants').bind('focus', function(e) {
		$(this).parent().parent().removeClass('has-error has-feedback');
		$(this).next().addClass('hidden');
	});
	$('#coop_password').bind('focus', function(e) {
		$(this).parent().parent().removeClass('has-error has-feedback');
		$(this).next().addClass('hidden');
	});

	// 提交创建
	$('#btn_submit_create').bind('click', function(e) {
		var channelName = $('#coop_name').val();
		if (channelName.length < 4 || channelName.length > 32) {
			$('#coop_name').parent().parent().addClass('has-error has-feedback');
			$('#coop_name').next().removeClass('hidden');
			return;
		}

		var channelMaxTenants = $('#coop_maxtenants').val();
		channelMaxTenants = parseInt(channelMaxTenants);
		if (isNaN(channelMaxTenants)) {
			$('#coop_maxtenants').parent().parent().addClass('has-error has-feedback');
			$('#coop_maxtenants').next().removeClass('hidden');
			return;
		}
		else if (channelMaxTenants <= 1) {
			$('#coop_maxtenants').parent().parent().addClass('has-error has-feedback');
			$('#coop_maxtenants').next().removeClass('hidden');
			return;
		}

		var channelPwd = $('#coop_password').val();
		if (channelPwd.length > 16) {
			$('#coop_password').parent().parent().addClass('has-error has-feedback');
			$('#coop_password').next().removeClass('hidden');
			return;
		}

		var channelOpen = $('#coop_open').val();

		$.post('create.cube', {
				token: window._token,
				name: channelName,
				open: channelOpen,
				max: channelMaxTenants,
				password: channelPwd
			}, function(data, textStatus, jqXHR) {
				if (data.state == 200) {
					var link = 'session.cube?csid=' + data.data.csid;
					$('#modal_create').modal('hide');
					$('#coop_link').attr('href', link);
					$('#modal_session_created').modal('show');

					setTimeout(function() { global.loadChannelTable(); }, 100);
				}
				else {
					global.showAlert('创建协作会议失败，错误码: ' + data.state);
				}
			}
		, 'json');
	});

	var filterTimer = 0;
	// 过滤创建人
	$('#filter_founder').bind('input', function(e) {
		var input = $(this).val();

		if (filterTimer > 0) {
			clearTimeout(filterTimer);
		}
		filterTimer = setTimeout(function() {
			clearTimeout(filterTimer);
			filterTimer = 0;

			if (input.length == 0) {
				for (var i = 0; i < founderList.length; ++i) {
					var f = founderList[i];
					$('.' + founderChannelMap.get(f).csid).show();
				}
				return;
			}

			for (var i = 0; i < founderList.length; ++i) {
				var f = founderList[i];
				if (f.indexOf(input) >= 0) {
					$('.' + founderChannelMap.get(f).csid).show(200);
				}
				else {
					$('.' + founderChannelMap.get(f).csid).hide(200);
				}
			}
		}, 500);
	});

	// 关于
	global.showAbout = function() {
		var content = '<p>魔方实时协作云，版本：1.1.7 Beta 20150529</p>';
		content += '<p>魔方引擎，版本：'+ global.cube.version +'</p>';
		content += '<p>官方网站：<a href="http://www.getcube.cn" target="_blank">http://www.getcube.cn</a></p>';
		global.showAlert(content, '关于');
	};

	// 发布手记人物
	$('#xu').popover({container:'body', trigger:'hover', placement:'top',
		content:'徐小一'});
	$('#peng').popover({container:'body', trigger:'hover', placement:'top',
		content:'彭小圆'});
	$('#zhu').popover({container:'body', trigger:'hover', placement:'top',
		content:'朱小友'});
	$('#jiang').popover({container:'body', trigger:'hover', placement:'top',
		content:'蒋小枫'});
	$('#zeng').popover({container:'body', trigger:'hover', placement:'top',
		content:'曾小欢'});
	$('#ling').popover({container:'body', trigger:'hover', placement:'top',
		content:'凌小云'});
	$('#wang').popover({container:'body', trigger:'hover', placement:'top',
		content:'王小花'});
})(window);
