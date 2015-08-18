/**
 * 
 */

;(function(global) {
	var msgContainer = $('#msg_container');
	var msgArea = $('#msg_area');
	var msgForm = $('#msg_form');

	var tenantMap = new HashMap();

	global.app = {
		resizeTimer: 0,

		resize : function() {
			var h = document.body.clientHeight;
			var height = h - 2;
			msgContainer.height(height);

			var msgAreaHeight = height - msgForm.height() - 10;
			msgArea.height(msgAreaHeight);

			//加载表情
			loadEmotion(msgArea.width() - 30, msgArea.height() - 10);
		},

		onResize : function() {
			if (this.resizeTimer > 0) {
				clearTimeout(this.resizeTimer);
			}

			var self = this;
			this.resizeTimer = setTimeout(function() {
				clearTimeout(self.resizeTimer);
				self.resizeTimer = 0;

				self.resize();
			}, 100);
		},
		
	};
	
	//加载表情
	global.loadEmotion = function(faceWidth, faceMaxHeight) {
		$('#icon_face').emotion({
			id: 'emotion_box', 			//表情盒子的ID
			assign: 'msg_text', 		//给那个控件赋值
			path: 'assets/emotion/',    //表情存放的路径
			tip: 'em',					//在文本框内显示的前缀
			width: faceWidth,			//表情框的宽度
			maxHeight: faceMaxHeight,	//表情框的最大高度
		});
	};
	
	global.loadTenant = function(message) {
		var cubeName = message.getSender().name;
		var msgContent = message.getContent();
		var sendTimeLong = message.getSendTime();

		if (tenantMap.containsKey(cubeName)) {
			var tenant = tenantMap.get(cubeName);

			var faceUrl = tenant.face;
			var userName = tenant.displayName;

			loadMsgData(faceUrl, userName, msgContent, sendTimeLong);
		}
		else {
			$.get('channel/tenant', {token: _token, cn: cubeName}, function(data, textStatus, jqXHR) {
				if (data.state == 200) {
					var tenant = data.data.tenant;

					tenantMap.put(cubeName, tenant);

					var faceUrl = tenant.face;
					var userName = tenant.displayName;

					loadMsgData(faceUrl, userName, msgContent, sendTimeLong);
				}
			});
		}
	},

	global.loadMsgData = function(faceUrl, userName, msgContent, sendTimeLong) {
		var nowDate = new Date(sendTimeLong);
		var hours = nowDate.getHours();
		var minutes = nowDate.getMinutes();

		var sendTime = (hours < 10 ? ("0" + hours) : hours) + ":" + (minutes < 10 ? ("0" + minutes) : minutes);

		var msgItemHtml = ['<div class="msg-item">',
							'<table>',
							'<tr>',
								'<td width="32">',
									'<div class="user-face">',
										'<img width="32" height="32" src="', faceUrl, '" />',
									'</div>',
								'</td>',
								'<td>',
									'<div class="msg-info">',
										'<span class="user-name">', userName, '</span>',
										'<span class="send-time">', sendTime, '</span>',
										'<div class="msg-content">', msgContent, '</div>',
									'</div>',
								'</td>',
							'</tr>',
						'</table>',
					'</div>'].join('');

		$('#msg_area').append(msgItemHtml);

		var scrollTop = $("#msg_area")[0].scrollHeight; 
		$('#msg_area').scrollTop(scrollTop);
	},
	
	/*
	 * 实现注册监听器
	 */
	global.SimpleRegistrationListener = Class(CubeRegistrationListener, {
		ctor: function() {
			// Nothing
		},

		onRegistrationProgress: function(session) {
			Logger.d('CubeMessager', 'Progress: ' + session.name);
		},

		onRegistrationOk: function(session) {
			Logger.d('CubeMessager', 'Registration ok: ' + session.name);
		},

		onRegistrationCleared: function(session) {
			Logger.d('CubeMessager', 'Registration cleared: ' + session.name);
		},

		onRegistrationFailed: function(session) {
			Logger.d('CubeMessager', 'Registration failed: ' + session.name);
		}
	});
	
	/*
	 * 实现消息监听器
	 */
	global.SimpleMessageListener = Class(CubeMessageListener, {
		ctor: function() {
			// Nothing
		},

		onSent: function(session, message) {
			loadTenant(message);
		},

		onReceived: function(session, message) {
			loadTenant(message);
		},

		onMessageFailed: function(session, errorCode, message) {
			Logger.e('CubeMessager', 'Message error: ' + errorCode);
		}
	});
})(window);

$(document).ready(function(e) {
	// 处理 resize 事件
	$(window).resize(function(e) {
		app.onResize();
	});

	// 重置大小
	app.resize();

	// 启动 Cube Engine
	if (window.cube.startup(window._debug)) {
		// 加载即时消息模块
		window.cube.loadMessager();

		// 设置注册监听器
		window.cube.setRegistrationListener(new SimpleRegistrationListener());
		
		// 设置消息监听器
		window.cube.setMessageListener(new SimpleMessageListener());
	}
	else {
		alert('Cube Engine 启动失败！');
	}
	
	var cubeName = _cubeName;
	setTimeout(function() {
		// 进行帐号登录
		window.cube.registerAccount(cubeName, '123456');
	}, 100);

	// 发送消息
	var sendMsg = function() {
		var msgText = $('#msg_text').val();
		msgText = replace_em(msgText);

		if (msgText == "" || msgText.length < 1) {
			$('#msg_text').focus();
			return;
		}

		var csid = _csid;
		if(csid != 'null') {
			var cubeGroupName = _cubeGroupName;
			var ret = window.cube.sendMessage(cubeGroupName, msgText);	//发送
		} else {	// 一对一
			var peerCubeName = _peerCubeName;
			var ret = window.cube.sendMessage(peerCubeName, msgText);	//发送
		}
		
		$('#msg_text').val('');
	};
	
	// 使用回车键快速发送消息
	$('#msg_text').keypress(function(e) {
		if (e.keyCode == 13) {
			sendMsg();
			e.preventDefault();
		}
	});

	// 绑定发送消息按钮事件
	$('#btn_send_msg').click(function(e) {
		sendMsg();
	});
});

function replace_em(str){ 
    str = str.replace(/\</g,'<；'); 
    str = str.replace(/\>/g,'>；'); 
    str = str.replace(/\n/g,'<；br/>；'); 
    str = str.replace(/\[em([0-9]*)\]/g,'<img src="assets/emotion/$1.gif" border="0" />'); 
    return str; 
}
