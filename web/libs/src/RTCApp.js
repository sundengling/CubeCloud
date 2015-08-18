/*
 * RTCApp.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/28.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

$(document).ready(function(e) {
	$('#default_btn_videocall').removeAttr('disabled');
	$('#default_btn_voicecall').removeAttr('disabled', 'disabled');
	$('#default_btn_terminate').attr('disabled', 'disabled');
	$('#default_btn_mute').attr('disabled', 'disabled');

	$('#conference_btn_call').removeAttr('disabled');
	$('#conference_btn_terminate').attr('disabled', 'disabled');
	$('#conference_btn_mute').attr('disabled', 'disabled');
	$('#conference_btn_camera').attr('disabled', 'disabled');
	$('#conference_btn_microphone').attr('disabled', 'disabled');
	$('#conference_btn_volume_down').attr('disabled', 'disabled');
	$('#conference_btn_volume_up').attr('disabled', 'disabled');
	$('#conference_btn_whiteboard').attr('disabled', 'disabled');
	$('#conference_btn_messager').attr('disabled', 'disabled');
	$('#conference_btn_lock').attr('disabled', 'disabled');
	$('#conference_btn_invite').attr('disabled', 'disabled');

	// 启动 Cube Engine
	if (window.cube.startup(window._debug)) {
		// 加载视频通话模块
		if (window.peer) {
			window.cube.loadSignaling("local_video", "remote_video", "remove_audio");
		}
		else {
			window.cube.loadConference("local_video", "remote_video", "remote_audio");
		}

		// 设置注册监听器
		window.cube.setRegistrationListener(new SimpleRegistrationListener());
		// 设置呼叫监听器
		window.cube.setCallListener(new SimpleCallListener());
	}
	else {
		alert('Cube Engine 启动失败！');
	}

	// 重置窗口大小
	$(window).resize(function(e) {
		app.resize();
	});

	// 初始化
	app.init();

	// 处理 Tooltips
	$("#operation").tooltip({selector:'[data-toggle="tooltip"]', container:"body"});
	$('#conference_operation').tooltip({selector:'[data-toggle="tooltip"]', container:"body"});

	// 计算界面大小
	window.app.resize();
});

;(function(global) {
	var remoteVideo = $('#remote_video');
	var localVideo = $('#local_video');

	// Peer to peer
	global.peer = false;
	// Debug
	global._debug = null;

	// 获取参数
	var params = window.utils.getUrlParams();

	var debug = params['debug'];
	if (debug !== undefined) {
		global._debug = debug;
	}

	var account = params['cn'];
	var peerNumber = params['cgn'];
	// 对端号码
	if (peerNumber === undefined) {
		peerNumber = params['pcn'];
		global.peer = true;
	}
	var csid = params['csid'];
	if (csid === undefined) {
		csid = null;
	}
	var token = params['token'];

	var channel = null;

	var resizeTimer = 0;

	global.app = {
		collapsedLock: false,
		collapsed: true,
		full: false,
		pushpined: false,

		init: function() {
			// 绑定 Media 控制器
			this.bindMediaController();

			if (null != csid) {
				// 加载频道数据
				this.loadChannel();
			}
			else {
				// 自动应答
				window.cube.autoAnswer(true);
				// 信令注册
				window.cube.registerAccount(account, '123456');
			}
		},

		resize: function() {
			var self = this;
			if (resizeTimer > 0) {
				clearTimeout(resizeTimer);
			}

			resizeTimer = setTimeout(function() {
				clearTimeout(resizeTimer);
				resizeTimer = 0;

				var vw = window.innerWidth;
				var vh = 100;
				if (self.full) {
					vh = window.innerHeight;
					$('#lvc').width(160);
					$('#lvc').height(120);
					$('#lvc')[0].style.left = (vw - 160 - 20) + "px";
					$('#lvc')[0].style.top = (vh - 120 - 20) + "px";
				}
				else {
					vh = window.innerHeight - $('#operation').height() - 2;
					if (null == csid) {
						vh = 182;
						$('#lvc').width(vw);
						$('#lvc').height(vh);
						$('#lvc')[0].style.top = 185 + "px";
						$('#lvc')[0].style.left = 0 + "px";
						$('#operation')[0].style.top = "370px";
					}
					else {
						$('#lvc').width(parseInt(vw * 0.5));
						$('#lvc').height(parseInt(vh * 0.5));
						$('#lvc')[0].style.top = 0 + "px";
						$('#lvc')[0].style.left = 0 + "px";
						$('#operation')[0].style.top = "186px";
					}
				}

				$('#rvc').width(vw);
				$('#rvc').height(vh);
			}, 60);
		},

		bindMediaController: function() {
			var self = this;

			$("#default_btn_videocall").click(function(e) {
                self.makeCall(true);
            });
			$("#default_btn_voicecall").click(function(e) {
				self.makeCall(false);
			});
			$("#default_btn_terminate").click(function(e) {
                self.terminateCall();
            });

			$("#default_btn_mute").click(function(e) {
                self.toggleVoice();
            });

			// Conference 模式按钮
			$("#conference_btn_call").click(function(e) {
                self.makeCall(true);
            });

			$("#conference_btn_terminate").click(function(e) {
                self.terminateCall();
            });

			$("#conference_btn_mute").click(function(e) {
                self.toggleVoice();
            });

			//图钉
			$("#conference_btn_pushpin").click(function(e) {
				if(!self.pushpined) {
					self.pushpined = true;
					self.collapsed = true;
					self.toggleConferenceController();
					$('#btn_conference_controller').hide();
				}else {
					self.pushpined = false;
					self.collapsed = false;
					self.toggleConferenceController();
					$('#btn_conference_controller').show();
				}
			});

			$('#btn_conference_controller').mouseover(function(e) {
				self.toggleConferenceController();
			});
		},

		loadChannel: function() {
			var self = this;
			$.get('channel', { token: token, csid: csid }, function(data, textStatus, jqXHR) {
					if (data.state == 200) {
						// 保存数据
						channel = data.data;
						// 更新显示标题
						$('#coop_display_name').text(channel.displayName);
						// 更新成员面板
						self.updateMemberPanels();
					}
					else {
						// 加载频道数据失败
					}
				}, 'json');
		},

		// register and call
		makeCall: function(video) {
			if (account === undefined) {
				return;
			}

			if (window.peer) {
				window.cube.makeCall(peerNumber, video);
			}
			else {
				window.cube.registerAccount(account, "123456");
			}
		},

		// terminal and unregister
		terminateCall: function() {
			window.cube.terminateCall();
		},

		// 更新用户信息面板
		updateMemberPanels: function() {
			var membersLength = channel.members.length;
			if (membersLength <= 1) {
				$('.user-container')[0].style.visibility = 'hidden';
				return;
			}
			
			for ( var i = 0; i < membersLength; ++i) {
				var member = channel.members[i];
				var memberHtml = [
							'<div class="col-sm-1 item-col">',
								'<div class="panel panel-default">',
									'<div class="panel-body">',
										'<div class="btn-group">',
											'<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="视频">',
												'<span class="glyphicon glyphicon-facetime-video" aria-hidden="true"></span>',
											'</button>',
											'<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="静音">',
												'<span class="glyphicon glyphicon-volume-off" aria-hidden="true"></span>',
											'</button>',
										'</div>',
										'<div class="info">',
											'<div class="name">', member, '</div>',
										'</div>',
									'</div>',
								'</div>',
							'</div>'].join('');

				$('.user-container .items').width((i + 1) * 200);
				$('#panel_can').append(memberHtml);
			}
			
			$('.user-container')[0].style.visibility = 'visible';
		},

		// 关闭/打开声音
		toggleVoiceHandler: function () {
		
		},

		toggleConferenceController: function() {
			if (this.collapsedLock) {
				return;
			}
			
			this.collapsedLock = true;

			var ty = 0;
			if (this.collapsed) {
				this.collapsed = false;
				ty = 0;
				$('#btn_conference_controller').removeClass('btn-collapse-down').addClass('btn-collapse-up');
				// $('#btn_conference_controller').hide();
			}
			else {
				this.collapsed = true;
				ty = -34;
				$('#btn_conference_controller').removeClass('btn-collapse-up').addClass('btn-collapse-down');
				// $('#btn_conference_controller').show();
			}

			var self = this;
			$('.conference-media-control').animate({top: ty}, 200, function() {
				self.collapsedLock = false;
			});
		},
	};

	// 布局变更回调
	global.onLayoutChanged = function(layout) {
		if (layout == 'default') {
			global.app.collapsed = true;
			global.app.full = false;
			$('.conference-media-control').find('.btn-collapse-up').removeClass('btn-collapse-up').addClass('btn-collapse-down');
			$('.conference-media-control').hide();
			$('.user-container').hide();
			$('.info-layer').hide();
			$('#operation').show();
		}
		else if (layout == 'conference') {
			global.app.full = true;
			var mlc = $(".conference-media-control");
			mlc.show();
			mlc[0].style.left = parseInt((window.innerWidth - mlc.width()) * 0.5) + 'px';
			mlc[0].style.top = -34 + 'px';

			$('.user-container').show();
			$('.info-layer').show();
			$('#operation').hide();
		}
	}
	
	global.SimpleRegistrationListener = Class(CubeRegistrationListener, {
		ctor: function() {
			// Nothing
		},

		onRegistrationProgress: function(session) {
		},

		onRegistrationOk: function(session) {
			if (window.peer) {
				// Nothing
			}
			else {
				window.cube.makeCall(peerNumber, true);
			}
		},

		onRegistrationCleared: function(session) {
		},

		onRegistrationFailed: function(session) {
		}
	});

	global.SimpleCallListener = Class(CubeCallListener, {
		ctor: function() {
			// Nothing
		},

		onNewCall: function(direction, session, video) {
			//direction == CubeCallDirection.Outgoing ? '呼出 ' + session.callPeer.name : '呼入 ' + session.callPeer.name);
			$('#default_btn_videocall').attr('disabled', 'disabled');
			$('#default_btn_voicecall').attr('disabled', 'disabled');
			$('#default_btn_terminate').removeAttr('disabled');
			$('#default_btn_mute').removeAttr('disabled');

			$('#conference_btn_call').attr('disabled', 'disabled');
			$('#conference_btn_terminate').removeAttr('disabled');
			$('#conference_btn_mute').removeAttr('disabled');

			$('#default_btn_videocall').tooltip('hide');
			$('#default_btn_voicecall').tooltip('hide');
			$('#conference_btn_call').tooltip('hide');
		},

		onInProgress: function(session) {
		},

		onCallRinging: function(session) {
		},

		onCallConnected: function(session) {
		},

		onCallEnded: function(session) {
			$('#default_btn_videocall').removeAttr('disabled');
			$('#default_btn_voicecall').removeAttr('disabled');
			$('#default_btn_terminate').attr('disabled', 'disabled');
			$('#default_btn_mute').attr('disabled', 'disabled');

			$('#conference_btn_call').removeAttr('disabled');
			$('#conference_btn_terminate').attr('disabled', 'disabled');
			$('#conference_btn_mute').attr('disabled', 'disabled');

			$('#default_btn_terminate').tooltip('hide');
			$('#conference_btn_terminate').tooltip('hide');

			if (window.peer) {
				// Nothing
			}
			else {
				window.cube.unregisterAccount();
			}
		},

		onCallFailed: function(session, errorCode) {
			if (window.peer) {
				// Nothing
			}
			else {
				window.cube.unregisterAccount();
			}
		}
	});
})(window);