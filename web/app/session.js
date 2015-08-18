//
// session.js

;(function(global) {
	var headerHeight = 52;
	var footerHeight = 30;
	var gap = 5;
	var panelHeaderHeight = 40;

	var panelMembers = $('#panel_members');
	var panelRtc = $('#panel_rtc');

	var panelWb = $('#panel_wb');

	var panelTabs = $('#panel_tabs');
	var panelControl = $('#panel_control');

	var frmMember = $('#frame_members');
	var frmWb = $('#frame_wb');
	var frmMsgr = $('#frame_messager');
	
	var rtcContainer = null;

	global.app = {
		modalOkCb: null,
		modalCancelCb: null,
		modalCloseCb: null,

		layoutItems: ['default', 'speech', 'conference'],

		resizeTimer: 0,

		collapseLock: false,
		collapsed: true,

		// 模态框按钮模式
		ModalButtons: {
			Ok: 1,
			OkCancel: 2,
			Close: 3
		},

		/*
		 * \param buttonModel 指定按钮模式
		 * \param callbackArray 指定按钮模式对应的回调函数
		 */
		showAlert: function(content, buttonModel, callbackArray) {
			var m = $('#modal_alert');

			if (buttonModel == this.ModalButtons.Ok) {
				this.modalOkCb = callbackArray[0];
				m.find('.btn-ok').show();
				m.find('.btn-cancel').hide();
				m.find('.btn-close').hide();
			}
			else if (buttonModel == this.ModalButtons.OkCancel) {
				this.modalOkCb = callbackArray[0];
				this.modalCancelCb = callbackArray[1];
				m.find('.btn-ok').show();
				m.find('.btn-cancel').show();
				m.find('.btn-close').hide();
			}
			else if (buttonModel == this.ModalButtons.Close) {
				this.modalCloseCb = callbackArray[0];
				m.find('.btn-ok').hide();
				m.find('.btn-cancel').hide();
				m.find('.btn-close').show();
			}
			else {
				m.find('.btn-ok').hide();
				m.find('.btn-cancel').hide();
				m.find('.btn-close').hide();
			}

			$('#alert_content').html(content);
			m.modal({
				backdrop: 'static',
				keyboard: false,
				show: true
			});
		},

		closeAlert: function() {
			$('#modal_alert').modal('hide');
		},

		resize: function() {
			if (this.resizeTimer > 0) {
				clearTimeout(this.resizeTimer);
			}

			var self = this;
			this.resizeTimer = setTimeout(function() {
				clearTimeout(self.resizeTimer);
				self.resizeTimer = 0;

				var bodyHeight = window.innerHeight - headerHeight - footerHeight - gap * 3;

				var ph = parseInt(panelRtc.height()) + 2;
				panelMembers.height(bodyHeight - ph);
				panelMembers.find('.panel-body').height(panelMembers.height() - 10);
				// frame_memeber 高度
				frmMember.height(panelMembers.height() - 10);

				ph = parseInt(panelControl.height()) + 2;
				panelTabs.height(bodyHeight - ph);
				// frame_messager 高度
				frmMsgr.height(bodyHeight - ph - 42 - 10);
				// 帮助内容高度
				$('#help').height(bodyHeight - ph - 42 - 10);

				panelWb.height(bodyHeight + 5);
				// frame_whiteboard 高度
				frmWb.height(panelWb.height() - panelHeaderHeight - gap * 2);

				if (null != rtcContainer && rtcContainer[0].style.position == "absolute") {
					rtcContainer.width(window.innerWidth);
					rtcContainer.height(window.innerHeight - footerHeight);
					$('.conference-layout-placeholder').width(window.innerWidth);
					$('.conference-layout-placeholder').height(window.innerHeight - footerHeight - 225);
					$('#frame_rtc').height(window.innerHeight);

					var mlc = $('.conference-layout-control');
					mlc[0].style.left = parseInt((window.innerWidth - 110) * 0.5) + 'px';
					mlc[0].style.top = (window.innerHeight - 34 - (self.collapsed ? 0 : 34)) + 'px';
				}

				//console.log(window.innerHeight + ',' + window.scrollMaxY);
			}, 100);
		},

		isFullScreen: function() {
			if (!document.fullscreenElement &&    // alternative standard method
				!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
				return false;
			}
			else {
				return true;
			}
		},

		onEnterFullScreen: function() {
			var self = this;
			var l = this.layoutItems[0];
			if (l == 'default') {
			}
			else if (l == 'speech') {
				var center = $('#center');
				center.find('#btn_fullscreen').off('click');
				center.find('#btn_fullscreen').on('click', function(e) {
					self.exitFullscreen();
				});
				center.find('.glyphicon-resize-full').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
			}
			else if (l == 'conference') {
				var mlc = $('.conference-layout-control');
				mlc.find('#btn_fullscreen').off('click');
				mlc.find('#btn_fullscreen').on('click', function(e) {
					self.exitFullscreen();
				});
				mlc.find('.icon-fullscreen').removeClass('icon-fullscreen').addClass('icon-restorescreen');
			}
		},
		onExitFullScreen: function() {
			var self = this;
			var l = this.layoutItems[0];
			if (l == 'default') {
			}
			else if (l == 'speech') {
				var center = $('#center');
				center.find('#btn_fullscreen').off('click');
				center.find('#btn_fullscreen').on('click', function(e) {
					self.launchFullscreen(document.body);
				});
				center.find('.glyphicon-resize-small').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
			}
			else if (l == 'conference') {
				var mlc = $('.conference-layout-control');
				mlc.find('#btn_fullscreen').off('click');
				mlc.find('#btn_fullscreen').on('click', function(e) {
					self.launchFullscreen(document.body);
				});
				mlc.find('.icon-restorescreen').removeClass('icon-restorescreen').addClass('icon-fullscreen');
			}
		},

		bindLayoutController: function() {
			var self = this;
			$('#layout_item_0').click(function(e) {
				self._onLayoutCurrentClick(e);
			});
			$('#layout_item_1').click(function(e) {
				self._onLayoutItem1Click(e);
			});
			$('#layout_item_2').click(function(e) {
				self._onLayoutItem2Click(e);
			});

			$('#btn_conference_layout_controller').mouseover(function(e) {
				self._toggleCollapseConferenceLayoutController();
			});
		},

		_onLayoutCurrentClick: function(e) {
		},
		_onLayoutItem1Click: function(e) {
			var t = this.layoutItems[1];
			if (t == "default") {
				this._switchToDefaultLayout();
			}
			else if (t == "speech") {
				this._switchToSpeechLayout();
			}
			else if (t == "conference") {
				this._switchToConferenceLayout();
			}
		},
		_onLayoutItem2Click: function(e) {
			var t = this.layoutItems[2];
			if (t == "default") {
				this._switchToDefaultLayout();
			}
			else if (t == "speech") {
				this._switchToSpeechLayout();
			}
			else if (t == "conference") {
				this._switchToConferenceLayout();
			}
		},

		_updateLayoutItem: function(newLayout) {
			if (newLayout == 'default') {
				this.layoutItems[0] = 'default';
				this.layoutItems[1] = 'speech';
				this.layoutItems[2] = 'conference';
			}
			else if (newLayout == 'speech') {
				this.layoutItems[0] = 'speech';
				this.layoutItems[1] = 'conference';
				this.layoutItems[2] = 'default';
			}
			else if (newLayout == 'conference') {
				this.layoutItems[0] = 'conference';
				this.layoutItems[1] = 'default';
				this.layoutItems[2] = 'speech';
			}

			var parse = function(p) {
				if (p == 'default') return "标准模板";
				else if (p == 'speech') return "演讲模板";
				else if (p == 'conference') return "会议模板";
			};

			$('#layout_item_0').find('.m-label').text(parse(this.layoutItems[0]));
			$('#layout_item_1').find('.m-label').text(parse(this.layoutItems[1]));
			$('#layout_item_2').find('.m-label').text(parse(this.layoutItems[2]));

			parse = null;
		},

		// 切换为默认布局
		_switchToDefaultLayout: function() {
			// 头高度恢复
			headerHeight = 52;

			// 显示
			$('#main_nav').show();
			$('#panel_members').show();
			$('.app-footer').show();

			var sbl = $('#sidebar_left');
			if (sbl.hasClass('hidden')) {
				sbl.removeClass('hidden');
				sbl.addClass('visible-md visible-lg');
			}
			var sbr = $('#sidebar_right');
			if (sbr.hasClass('hidden')) {
				sbr.removeClass('hidden');
				sbr.addClass('visible-md visible-lg');
			}
			var center = $('#center');
			center.show();
			center.removeClass('col-md-12');
			center.addClass('col-md-7');
			center[0].style.marginTop = '0px';

			center.find('.speech-wb-nav').addClass('default-wb-nav').removeClass('speech-wb-nav');

			// 恢复 RTC 视图
			if (null != rtcContainer) {
				rtcContainer[0].style.position = "relative";
				rtcContainer[0].style.styleFloat = "none";
				rtcContainer[0].style.cssFloat = "none";
				rtcContainer.width('100%');
				rtcContainer.height('100%');
			}
			$('.conference-layout-placeholder').hide();
			$('.conference-layout-control').hide();
			$('#frame_rtc').height('100%');
			// 通知 iframe
			try {
				$('#frame_rtc')[0].contentWindow.onLayoutChanged('default');
			} catch (e) {
				console.log(e);
			}

			this.resize();

			try {
				this.exitFullscreen();
			} catch (e) {
				// Nothing
			}

			this._updateLayoutItem('default');

			if (!this.collapsed) {
				this.collapseLock = false;
				this._toggleCollapseConferenceLayoutController();
			}
		},
		
		// 切换为演讲布局
		_switchToSpeechLayout: function() {
			var self = this;

			if (self.isMessageFrameExpended()) {
				self.toggleMessageFrame();
			}

			var sbl = $('#sidebar_left');
			if (!sbl.hasClass('hidden')) {
				sbl.addClass('hidden');
				sbl.removeClass('visible-md');
				sbl.removeClass('visible-lg');
			}
			var sbr = $('#sidebar_right');
			if (!sbr.hasClass('hidden')) {
				sbr.addClass('hidden');
				sbr.removeClass('visible-md');
				sbr.removeClass('visible-lg');
			}
			var center = $('#center');
			center.removeClass('col-md-7');
			center.addClass('col-md-12');
			center[0].style.marginTop = '4px';

			center.find('.default-wb-nav').addClass('speech-wb-nav').removeClass('default-wb-nav');

			center.find('#btn_back_defaultlayout').off('click');
			center.find('#btn_back_defaultlayout').on('click', function(e) {
				self._switchToDefaultLayout();
			});

			// 隐藏主导航
			$('#main_nav').hide();

			// 头高度为 0
			headerHeight = 0;

			this.resize();

			// 进入全屏模式
			//this.launchFullscreen(document.body);

			this._updateLayoutItem('speech');
		},

		// 切换为会议布局
		_switchToConferenceLayout: function() {
			var self = this;

			$('#main_nav').hide();
			$('#panel_members').hide();
			$('.app-footer').hide();

			var sbr = $('#sidebar_right');
			if (!sbr.hasClass('hidden')) {
				sbr.addClass('hidden');
				sbr.removeClass('visible-md');
				sbr.removeClass('visible-lg');
			}
			$('#center').hide();

			if (null == rtcContainer)
				rtcContainer = $('.rtc-container');

			rtcContainer[0].style.position = "absolute";
			rtcContainer[0].style.styleFloat = "left";
			rtcContainer[0].style.cssFloat = "left";
			rtcContainer[0].style.left = "0px";
			rtcContainer[0].style.top = "0px";
			rtcContainer.width(window.innerWidth);
			rtcContainer.height(window.innerHeight - footerHeight);

			var mlp = $('.conference-layout-placeholder');
			mlp.show();
			mlp.width(window.innerWidth);
			mlp.height(window.innerHeight - 225);
			$('#frame_rtc').height(window.innerHeight);

			var mlc = $('.conference-layout-control');
			mlc.show();
			mlc[0].style.left = parseInt((window.innerWidth - 110) * 0.5) + 'px';
			mlc[0].style.top = (window.innerHeight + 34) + 'px';

			mlc.find('#btn_defaultlayout').off('click');
			mlc.find('#btn_defaultlayout').on('click', function(e) {
				self._switchToDefaultLayout();
			});

			// 进入全屏模式
			//this.launchFullscreen(document.body);

			this._updateLayoutItem('conference');

			// 通知 iframe
			try {
				$('#frame_rtc')[0].contentWindow.onLayoutChanged('conference');
			} catch (e) {
				console.log(e);
			}
		},

		_toggleCollapseConferenceLayoutController: function() {
			if (this.collapseLock) {
				return;
			}

			this.collapseLock = true;

			var ty = 0;
			if (this.collapsed) {
				this.collapsed = false;
				ty = window.innerHeight - 34 - 32;

				$('.conference-layout-control').find('.btn-collapse-up').removeClass('btn-collapse-up').addClass('btn-collapse-down');
			}
			else {
				this.collapsed = true;
				ty = window.innerHeight - 34;
				$('.conference-layout-control').find('.btn-collapse-down').removeClass('btn-collapse-down').addClass('btn-collapse-up');
			}

			var self = this;
			$('.conference-layout-control').animate({top: ty}, 200, function(e) {
				self.collapseLock = false;
			});
		},

		isMessageFrameExpended: function() {
			return $('#sidebar_right').hasClass('col-md-5');
		},
		toggleMessageFrame: function() {
			var c = $('#center');
			var sbr = $('#sidebar_right');
			if (sbr.hasClass('col-md-3')) {
				// 执行展开
				c.removeClass('col-md-7');
				c.addClass('col-md-5');
				sbr.removeClass('col-md-3');
				sbr.addClass('col-md-5');

				$('#btn_toggle_messager').attr('title', '折叠消息框');
				$('#btn_toggle_messager .glyphicon').removeClass('glyphicon-triangle-left').addClass('glyphicon-triangle-right');
				//$('#btn_toggle_messager ._label').text('折叠消息框');
			}
			else {
				// 执行收缩
				c.removeClass('col-md-5');
				c.addClass('col-md-7');
				sbr.removeClass('col-md-5');
				sbr.addClass('col-md-3');

				$('#btn_toggle_messager').attr('title', '展开消息框');
				$('#btn_toggle_messager .glyphicon').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-left');
				//$('#btn_toggle_messager ._label').text('展开消息框');
			}
		},

		launchFullscreen: function(element) {
			if (element.requestFullscreen) {
				element.requestFullscreen();
			}
			else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
			else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			}
			else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			}
		},
		exitFullscreen: function() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		},

		// 请求退出协作
		quit: function() {
			$.post('channel/quit', {
				token: window._token, 
				csid: window._csid
				}, function(data, textStatus, jqXHR) {
					if (data.state == 200) {
						console.log('Quit ok');
					}
					else {
						console.log('Quit failed');
					}

					window.close();
				}, 'json');
		},

		// 请求登出系统
		signOut: function() {
			$.post('auth/signout', { token: window._token }
				, function(data, textStatus, jqXHR) {
					if (data.state == 200) {
						console.log('Signout ok');
					}
					else {
						console.log('Signout failed');
					}
	
					window.utils.deleteCookie('token');
					window.localStorage.removeItem("__cubecloud_sign__");
					window.location.href = "index.html";
				}, 'json');
		},

		showFigure: function(number) {
			switch (number) {
			case 1:
				$('.manual-figure .modal-title').text('标准模板界面示意图');
				$('#figure_1').show();
				$('#figure_2').hide();
				break;
			case 2:
				$('.manual-figure .modal-title').text('会议模板界面示意图');
				$('#figure_2').show();
				$('#figure_1').hide();
				break;
			default:
				break;
			}
		}
	};
})(window);


$(document).ready(function(e) {
	// 计算场景大小
	app.resize();

	$(window).resize(function(e) {
		app.resize();
	});

	// 模态警告框关闭事件
	/*$('#modal_alert').on('hidden.bs.modal', function(e) {
	});*/
	$('#modal_alert').find('.btn-ok').click(function(e) {
		if (app.modalOkCb != null) {
			app.modalOkCb.call(null, app);
			app.modalOkCb = null;
		}
	});
	$('#modal_alert').find('.btn-cancel').click(function(e) {
		if (app.modalCancelCb != null) {
			app.modalCancelCb.call(null, app);
			app.modalCancelCb = null;
		}
	});
	$('#modal_alert').find('.btn-close').click(function(e) {
		if (app.modalCloseCb != null) {
			app.modalCloseCb.call(null, app);
			app.modalCloseCb = null;
		}
	});

	// 退出当前协作按钮
	$('#btn_quit').click(function(e) {
		app.showAlert('<p>您正在参与协作，是否确认退出当前协作？</p>', app.ModalButtons.OkCancel, [
			function() {
				app.quit();
			}, null]);
	});

	// 登出系统按钮
	$('#btn_signout').click(function(e) {
		app.showAlert('<p>您正在参与协作，登出系统将关闭所有参与的协作数据。</p><p>您是否确认登出？</p>', app.ModalButtons.OkCancel, [
			function() {
				app.signOut();
			}, null]);
	});

	// 切换消息框布局，展开或收缩
	$('#btn_toggle_messager').click(function(e) {
		app.toggleMessageFrame();
	});

	$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e)  {
		if (!window.screenTop && !window.screenY) {
			app.onEnterFullScreen(e);
		}
		else {
			app.onExitFullScreen(e);
		}
	});

	// 绑定布局控制器
	app.bindLayoutController();

	// 处理 Tooltips
	$(".conference-layout-control").tooltip({selector:'[data-toggle="tooltip"]', container:"body"});

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
	}, 5 * 60 * 1000);
});
