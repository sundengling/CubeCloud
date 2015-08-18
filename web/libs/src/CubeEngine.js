/*
 * CubeEngine.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var _M_CELLET = "CubeMessaging";
var _S_CELLET = "CubeSignaling";
var _WB_CELLET = "CubeWhiteboard";

var _CUBE_DOMAIN = "211.103.217.154";

/**
 * 魔方引擎类。
 * 魔方引擎类是为应用层提供接口的基础类，包括通话控制、获取白板对象实例、获取媒体控制器实例等。
 *
 * @class CubeEngine
 */
var CubeEngine = Class({
	/**
	 * @member {String} version 引擎版本信息。
	 * @readonly
	 * @instance
	 * @memberof CubeEngine
	 */
	version: "1.3.19",

	config: null,

	hostAddress: null,
	session: null,

	registered: false,
	accName: null,
	accPassword: null,
	accDisplayName: null,

	sipWorker: null,
	sipMediaController: null,

	sspWorker: null,
	sspMediaController: null,

	msgWorker: null,

	wbMap: null,
	wbList: null,

	// 注册监听器
	regListener: null,

	// 通话监听器
	callListener: null,

	// 消息监听器
	messageListener: null,

	// 白板监听器
	wbListener: null,

	// 查询回调
	queryCallback: null,

	ctor: function() {
		this.session = new CubeSession();
	},

	// 调试选项
	_debug: function(config) {
		if (undefined !== config.host) {
			_CUBE_DOMAIN = config.host;
		}

		if (config.single) {
			this.sspWorker.iceServersUrls = [
				{"urls": ["stun:123.57.251.18:3478"]},
				{"urls": ["turn:123.57.251.18:3478"], "username": "cube", "credential": "cube887"}];
		}
		else {
			this.sspWorker.iceServersUrls = [
				{"urls": ["stun:211.103.217.154:3478", "stun:123.57.251.18:3478"]},
				{"urls": ["turn:211.103.217.154:3478", "turn:123.57.251.18:3478"], "username": "cube", "credential": "cube887"}];
		}
	},

	/**
	 * 初始化并启动引擎。
	 * 
	 * @param {Function} completion 指定引擎启动完成回调。
	 * @returns {Boolean} 如果引擎启动成功返回 <code>true</code> ，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeEngine
	 */
	startup: function(completion, host, port) {
		var self = this;

		if (host === undefined || null == host) {
			host = _CUBE_DOMAIN;
		}
		else {
			_CUBE_DOMAIN = host;
		}

		if (port === undefined) {
			port = 7070;
		}

		self.hostAddress = new InetAddress(host, port);

		var sf = function() {
			if (window.nucleus.startup()) {
				// 添加监听器
				nucleus.talkService.addListener(new CubeNetworkListener(self));

				if (undefined !== completion) {
					completion.call(null, self);
				}

				return true;
			}
			else {
				return false;
			}
		};

		if (window.utils.isIE9) {
			//window.WEB_SOCKET_DEBUG = true;
			window.WEB_SOCKET_FORCE_FLASH = true;

			nucleus.activateWSPlugin(_CUBE_DOMAIN.indexOf("192") >= 0 ? "libs/ws" : "http://" + _CUBE_DOMAIN + "/libs/ws", function() {
				sf();
			});

			return true;
		}
		else {
			var t = setTimeout(function() {
				clearTimeout(t);
				sf();
			}, 50);
			return true;
		}
	},

	/**
	 * 关闭引擎并关闭所有子模块。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	shutdown: function() {
	},

	/**
	 * 配置引擎工作参数。参数包括视频大小、建议帧率等。
	 *
	 * @example
	 * window.cube.configure({
	 *     "videoSize": { "width": 640, "height": 480 },
	 *     "frameRate": { "min": 5, "max": 18 },
	 *     "bandwidth": { "audio": 60, "video": 256 }
	 * });
	 *
	 * @see CubeVideoSize
	 * @instance
	 * @memberof CubeEngine
	 */
	configure: function(config) {
		this.config = config;

		if (null != this.sspWorker) {
			// 最大视频大小
			if (config.videoSize !== undefined) {
				this.sspWorker.maxVideoSize = config.videoSize;

				Logger.d('CubeEngine', 'Config video size: ' + config.videoSize.width + 'x' + config.videoSize.height);
			}

			// 最低帧率
			if (config.frameRate !== undefined) {
				var minFR = parseInt(config.frameRate.min);
				if (minFR > 10)
					minFR = 10;
				else if (minFR < 2)
					minFR = 2;

				var maxFR = parseInt(config.frameRate.max);
				if (maxFR > 30)
					maxFR = 30;
				else if (maxFR < 6)
					maxFR = 6;

				this.sspWorker.minFrameRate = minFR;
				this.sspWorker.maxFrameRate = maxFR;

				Logger.d('CubeEngine', 'Config frame rate: [' + minFR + ',' + maxFR + ']');
			}

			if (config.bandwidth) {
				this.sspWorker.setBandwidth(config.bandwidth.audio || 60, config.bandwidth.video || 256);
			}
		}
	},

	/**
	 * 返回引擎当前使用的会话实例。
	 *
	 * @see CubeSession
	 * @returns {CubeSession} 会话对象的实例。
	 * @instance
	 * @memberof CubeEngine
	 */
	getSession: function() {
		return this.session;
	},

	/**
	 * 注册账号。
	 * 在魔方引擎中每个终端通过注册一个唯一账号来进行终端识别。
	 *
	 * @param {String} name 指定注册的账号名。
	 * @param {String} password 指定账号对应的密码。
	 * @param {String} [displayName] 指定账号对应的显示名。
	 * @instance
	 * @memberof CubeEngine
	 */
	registerAccount: function(name, password, displayName) {
		this.accName = name + '';
		this.accPassword = password + '';
		if (displayName === undefined || displayName.length == 0) {
			this.accDisplayName = this.accName;
		}
		else {
			this.accDisplayName = displayName.toString();
		}

		this.session.name = this.accName;
		this.session.displayName = this.accDisplayName;

		var self = this;

		if (null != self.sipWorker) {
			self.sipWorker.registerWith(name, password, this.accDisplayName);
		}

		var cellets = [];
		if (nucleus.talkService.isCalled(_M_CELLET)) {
			cellets.push(_M_CELLET);
		}
		if (nucleus.talkService.isCalled(_S_CELLET)) {
			cellets.push(_S_CELLET);
		}
		if (nucleus.talkService.isCalled(_WB_CELLET)) {
			cellets.push(_WB_CELLET);
		}

		if (cellets.length > 0) {
			// 回调注册正在处理
			self._fireRegistrationState(CubeRegistrationState.Progress);

			for (var i = 0; i < cellets.length; ++i) {
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionLogin);
				dialect.appendParam("data", {
					name: self.accName,
					displayName: self.accDisplayName,
					password: password,
					version: self.version,
					device: {
						name: navigator.appName,
						version: navigator.appVersion,
						platform: navigator.platform,
						userAgent: navigator.userAgent
					}
				});
				nucleus.talkService.talk(cellets[i], dialect);
			}
		}

		cellets = null;

		return true;
	},

	/**
	 * 注销账号。将已经注册的帐号注销，退出登录状态。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	unregisterAccount: function() {
		if (this.session.isCalling()) {
			this.terminateCall();
		}

		// 回调注销
		this._fireRegistrationState(CubeRegistrationState.Cleared);

		if (null != this.sipWorker) {
			this.sipWorker.unregister();
		}

		var cellets = [];
		if (nucleus.talkService.isCalled(_M_CELLET)) {
			cellets.push(_M_CELLET);
		}
		if (nucleus.talkService.isCalled(_S_CELLET)) {
			cellets.push(_S_CELLET);
		}
		if (nucleus.talkService.isCalled(_WB_CELLET)) {
			cellets.push(_WB_CELLET);
		}

		if (cellets.length > 0) {
			var self = this;

			for (var i = 0; i < cellets.length; ++i) {
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionLogout);
				dialect.appendParam("data", {
					name: self.accName,
					password: self.accPassword,
					version: self.version,
					device: {
						name: navigator.appName,
						version: navigator.appVersion,
						platform: navigator.platform,
						userAgent: navigator.userAgent
					}
				});
				nucleus.talkService.talk(cellets[i], dialect);
			}
		}
		cellets = null;

		this.accName = null;
		this.accDisplayName = null;
		this.accPassword = null;
		this.session.name = null;

		return true;
	},

	/**
	 * @deprecated since version 1.3.0
	 * @instance
	 * @memberof CubeEngine
	 */
	queryRemoteAccounts: function(accounts, callback) {
		this.queryAccounts(accounts, callback);
	},

	/**
	 * 查询帐号信息回调函数。
	 *
	 * @callback queryAccountsCallback
	 * @param {Array} list 查询到的用户数据列表。
	 */
	/**
	 * 查询帐号基本信息和实时状态。
	 *
	 * @param {Array} accounts 指定待查询帐号的列表。
	 * @param {queryAccountsCallback} callback 成功回调。 
	 * @instance
	 * @memberof CubeEngine
	 */
	queryAccounts: function(accounts, callback) {
		if (null == this.msgWorker) {
			return false;
		}

		if (!nucleus.talkService.isCalled(_M_CELLET)
			&& !nucleus.talkService.isCalled(_S_CELLET)) {
			return false;
		}

		if (undefined !== callback) {
			this.queryCallback = callback;
		}
		else {
			return false;
		}

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionQuery);
		dialect.appendParam("data", {
				"list": accounts
			});

		if (nucleus.talkService.isCalled(_M_CELLET)) {
			nucleus.talkService.talk(_M_CELLET, dialect);
			return true;
		}
		else if (nucleus.talkService.isCalled(_S_CELLET)) {
			nucleus.talkService.talk(_S_CELLET, dialect);
			return true;
		}
		else if (nucleus.talkService.isCalled(_WB_CELLET)) {
			nucleus.talkService.talk(_WB_CELLET, dialect);
			return true;
		}
		else {
			return false;
		}
	},

	/**
	 * 查询消息历史记录回调函数。
	 *
	 * @callback queryMessageHistoryCallback
	 * @param {Array} list 查询到的消息列表。
	 * @param {Number} begin 本次查询的开始时间戳。
	 * @param {Number} end 本次查询的截止时间戳。
	 */
	/**
	 * 查询自己的消息历史记录。
	 *
	 * @param {Number} begin 指定查询的起始时间戳。
	 * @param {Number} end 指定查询的截止时间戳。
	 * @param {queryMessageHistoryCallback} callback 指定查询结果回调函数。
	 * @instance
	 * @memberof CubeEngine
	 */
	queryMessageHistory: function(begin, end, callback) {
		if (null == this.msgWorker) {
			return false;
		}

		return this.msgWorker.queryHistory(begin, end, callback);
	},

	loadConference: function(localVideo, remoteVideo, bellAudio) {
		if (null != this.sipWorker) {
			return true;
		}

		this.sipWorker = new CubeSIPWorker("211.103.217.154");

		this.sipWorker.start(this, document.getElementById(localVideo),
									document.getElementById(remoteVideo),
									(bellAudio !== undefined) ? document.getElementById(bellAudio) : null);

		// 创建媒体控制器
		this.sipMediaController = new CubeMediaController(this.sipWorker);

		return true;
	},

	/**
	 * 加载音视频通话模块。
	 *
	 * @param {String} localVideo 指定页面上用于显示本地视频的 <code>video</code> 标签的 DOM ID 。
	 * @param {String} remoteVideo 指定页面上用于显示远端视频的 <code>video</code> 标签的 DOM ID 。
	 * @param {String} [bellAudio] 指定页面上用于响铃的 <code>audio</code> 标签的 DMO ID 。
	 * @instance
	 * @memberof CubeEngine
	 */
	loadSignaling: function(localVideo, remoteVideo, bellAudio) {
		if (null != this.sspWorker) {
			return true;
		}

		this.sspWorker = new CubeSignalingWorker(document.getElementById(localVideo),
												document.getElementById(remoteVideo),
												(bellAudio !== undefined) ? document.getElementById(bellAudio) : null);
		this.sspWorker.setDelegate(new CubeSignalingWorkerDelegate(this));

		// 设置分辨率
		if (null != this.config) {
			this.sspWorker.maxVideoSize = this.config.videoSize;
		}

		nucleus.talkService.call([_S_CELLET], this.hostAddress, true);

		// 创建媒体控制器
		this.sspMediaController = new CubeMediaController(this.sspWorker);

		// 判断
		if (!nucleus.ts.isWebSocketSupported()) {
			window.console.log("Adapter WebSocket");
			nucleus.ts.resetHeartbeat(_S_CELLET, 2000);
		}

		return true;
	},

	/**
	 * 加载即时消息模块。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	loadMessager: function() {
		if (null != this.msgWorker) {
			return true;
		}

		this.msgWorker = new CubeMessageWorker();
		this.msgWorker.setDelegate(new CubeMessageWorkerDelegate(this));

		nucleus.talkService.call([_M_CELLET], this.hostAddress, true);

		return true;
	},

	/**
	 * 加载智能白板模块。
	 *
	 * @param {String} domId 指定白板画布容器的 DOM ID 。
	 * @instance
	 * @memberof CubeEngine
	 */
	loadWhiteboard: function(domId) {
		if (null == this.wbMap)
			this.wbMap = new HashMap();

		if (null == this.wbList)
			this.wbList = new Array();

		nucleus.talkService.call([_WB_CELLET], this.hostAddress, true);

		var wb = new CubeWhiteboard(domId, new CubeWhiteboardDelegate(this));
		wb.load();

		this.wbMap.put(wb.getName(), wb);
		this.wbList.push(wb);
		return wb;
	},

	/**
	 * 设置注册监听器。
	 *
	 * @param {CubeRegistrationListener} listener 指定注册监听器。
	 * @see CubeRegistrationListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setRegistrationListener: function(listener) {
		this.regListener = listener;
	},

	/**
	 * 设置音视频通话监听器。
	 *
	 * @param {CubeCallListener} listener 指定音视频通话监听器。
	 * @see CubeCallListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setCallListener: function(listener) {
		this.callListener = listener;
	},

	/**
	 * 设置消息监听器。
	 *
	 * @param {CubeMessageListener} listener 指定消息监听器。
	 * @see CubeMessageListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setMessageListener: function(listener) {
		this.messageListener = listener;
	},

	/**
	 * 设置白板监听器。
	 *
	 * @param {CubeWhiteboardListener} listener 指定白板监听器。
	 * @see CubeWhiteboardListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setWhiteboardListener: function(listener) {
		this.wbListener = listener;
	},

	/**
	 * 向指定用户发起音/视频通话邀请。
	 *
	 * @param {String} callee 指定被叫方的帐号名。
	 * @param {Boolean} videoEnabled 指定是否使用视频通话。如果设置为 <code>false</code>，则仅使用语音通话。
	 * @returns {Boolean} 如果通话请求发送成功则返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeEngine
	 */
	makeCall: function(callee, videoEnabled) {
		// 被叫号码
		callee = callee.toString();
		if (callee.length <= 4 && null != this.sipWorker) {
			this.session.setCallPeer(new CubePeer(callee));
			return this.sipWorker.invite(callee, videoEnabled);
		}

		if (null != this.sspWorker) {
			this.session.setCallPeer(new CubePeer(callee));
			return this.sspWorker.invite(callee, videoEnabled);
		}
		else if (null != this.sipWorker) {
			this.session.setCallPeer(new CubePeer(callee));
			return this.sipWorker.invite(callee, videoEnabled);
		}
		else {
			return false;
		}
	},

	/**
	 * 应答收到的音/视频通话邀请。应答邀请即表示愿意与对方进行通话。
	 *
	 * @param {Boolean} videoEnabled 指定是否使用视频进行应答。
	 * @instance
	 * @memberof CubeEngine
	 */
	answerCall: function(videoEnabled) {
		if (this.session.callPeer.name.length <= 4 && null != this.sipWorker) {
			return this.sipWorker.answer(videoEnabled);
		}

		if (null != this.sspWorker) {
			return this.sspWorker.answer(videoEnabled);
		}
		else if (null != this.sipWorker) {
			return this.sipWorker.answer(videoEnabled);
		}
		else {
			return false;
		}
	},

	/**
	 * 终止通话或拒绝通话邀请。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	terminateCall: function() {
		if (null != this.session.callPeer &&
			this.session.callPeer.name.length <= 4 &&
			null != this.sipWorker) {
			return this.sipWorker.hangup();
		}

		var sspRet = false;
		var sipRet = false;

		if (null != this.sspWorker) {
			sspRet = this.sspWorker.hangup();
		}

		if (null != this.sipWorker) {
			sipRet = this.sipWorker.hangup();
		}

		return (sspRet || sipRet);
	},

	/**
	 * 设置是否使用自动应答。
	 * 当使用自动应答时，用户同意浏览器调用设备摄像头和麦克风之后，引擎会自动调用 <code>answerCall(true)</code> 进行应答。
	 * 也就是说当自动应答被激活后，引擎始终同意任何端的通话邀请。
	 *
	 * @param {Boolean} value 指定是否启用自动应答。
	 * @instance
	 * @memberof CubeEngine
	 */
	autoAnswer: function(value) {
		if (null != this.sspWorker) {
			this.sspWorker.setAutoAnswer(value);
		}
	},

	/**
	 * 返回引擎中用户操作媒体设备的媒体控制器对象实例。
	 *
	 * @returns 返回媒体控制器实例。
	 * @see CubeMediaController
	 * @instance
	 * @memberof CubeEngine
	 */
	getMediaController: function() {
		if (null != this.session.callPeer) {
			if (this.session.callPeer.name.length <= 4 && null != this.sipWorker) {
				return this.sipMediaController;
			}
			else {
				return this.sspMediaController;
			}
		}
		else {
			return this.sspMediaController;
		}
	},

	/**
	 * 返回引擎中用户操作媒体设备的媒体控制器对象实例。
	 *
	 * @returns 返回媒体控制器实例。
	 * @see CubeMediaController
	 * @instance
	 * @memberof CubeEngine
	 */
	mc: function() {
		return this.getMediaController();
	},

	getConferenceUA: function() {
		if (null == this.sspWorker) {
			return null;
		}

		return this.sspWorker.cua();
	},

	cua: function() {
		if (null == this.sspWorker) {
			return null;
		}

		return this.sspWorker.cua();
	},

	/**
	 * 发送指定内容的消息。
	 *
	 * @param {String} mix 指定收件人的注册帐号名。
	 * @param {String} content 指定消息的文本内容。
	 * @instance
	 * @memberof CubeEngine
	 */
	sendMessage: function(mix, content) {
		if (null == this.msgWorker) {
			return false;
		}

		if (!nucleus.talkService.isCalled(_M_CELLET)) {
			return false;
		}

		return this.msgWorker.pushMessage(mix, content);
	},

	/**
	 * 返回智能白板对象实例。
	 *
	 * @returns 返回当前有效的白板对象。
	 * @instance
	 * @memberof CubeEngine
	 */
	getWhiteboard: function(domId) {
		if (null == this.wbList) {
			return null;
		}

		if (domId === undefined) {
			return this.wbList[0];
		}

		for (var i = 0; i < this.wbList.length; ++i) {
			var wb = this.wbList[i];
			if (wb.domId == domId) {
				return wb;
			}
		}

		return null;
	},

	// 暖车
	warmUp: function() {
		if (null == this.sspWorker) {
			return;
		}

		var overflow = document.body.style.overflow;
		var w = window.innerWidth;
		var h = window.innerHeight;

		document.body.style.overflow = "hidden";

		var vx = parseInt((w - 480) * 0.5);
		var vy = parseInt((h - 480) * 0.5) - 40;
		var bx = parseInt((w - 200 - 200 - 40) * 0.5);
		var by = parseInt(vy + 480 + 10);

		var mask = ['<div style="position:absolute;float:left;left:0px;top:0px;opacity:0.7;-moz-opacity:0.7;-webkit-opacity:0.7;background:#000;',
					'width:', w, 'px;height:', h, 'px"></div>',
				'<video id="_cube_warmup_video" width="480" height="480" style="position:absolute;float:left;left:',
					vx, 'px;top:', vy, 'px;background:#101010;"></video>',
				'<button id="_cube_warmup_yes" style="width:200px;height:30px;position:absolute;float:left;left:',
					bx, 'px;top:', by, 'px;">我看到了视频</button>',
				'<button id="_cube_warmup_no" style="width:200px;height:30px;position:absolute;float:left;left:',
					bx + 240, 'px;top:', by, 'px;">我没有看到视频</button>'];

		var c = document.createElement("div");
		c.style.position = "absolute";
		c.style.styleFloat = "left";
		c.style.cssFloat = "left";
		c.style.left = "0px";
		c.style.top = "0px";
		c.style.width = w + "px";
		c.style.height = h + "px";
		c.style.zIndex = 9999;
		c.innerHTML = mask.join('');
		document.body.appendChild(c);

		var video = document.getElementById('_cube_warmup_video');
		var localStream = null;

		if (navigator.getUserMedia) {
			navigator.getUserMedia({ "audio": true, "video": true },
				function(stream) {
					localStream = stream;
					if (window.URL) {
						// Chrome case: URL.createObjectURL() converts a MediaStream to a blob URL
						video.src = window.URL.createObjectURL(localStream);
					}
					else {
						// Firefox and Opera: the src of the video can be set directly from the stream
						video.src = localStream;
					}
					video.onloadedmetadata = function(e) {
						video.play();
					};
				},
				function(error) {
					alert('发生错误: ' + JSON.stringify(error));
				});
		}

		var closeFun = function() {
			video.src = "";
			if (null != localStream) {
				localStream.stop();
				localStream = null;
			}
			document.body.removeChild(c);
			document.body.style.overflow = overflow;
		};
		var btn = document.getElementById('_cube_warmup_yes');
		btn.addEventListener('click', function(e) {
				closeFun();
			}, false);
		btn = document.getElementById('_cube_warmup_no');
		btn.addEventListener('click', function(e) {
				closeFun();
			}, false);
	},

	_fireRegistrationState: function(state) {
		if (state != this.session.regState) {
			this.session.regState = state;

			if (null != this.regListener) {
				if (state == CubeRegistrationState.Progress) {
					this.regListener.onRegistrationProgress(this.session);
				}
				else {
					if (state == CubeRegistrationState.Ok) {
						this.regListener.onRegistrationOk(this.session);
					}
					else if (state == CubeRegistrationState.Cleared) {
						this.regListener.onRegistrationCleared(this.session);

						// 终止呼叫
						if (this.session.isCalling()) {
							this.terminateCall();
						}
					}
					else if (state == CubeRegistrationState.Failed) {
						this.regListener.onRegistrationFailed(this.session);
					}
				}
			}
		}

		if (null != this.sspWorker) {
			this.sspWorker.onRegisterStateChanged(this.session);
		}

		if (null != this.msgWorker) {
			this.msgWorker.onRegisterStateChanged(this.session);
		}

		if (null != this.wbList && this.wbList.length > 0) {
			var list = this.wbList;
			for (var i = 0; i < list.length; ++i) {
				var wb = list[i];
				wb.onRegisterStateChanged(this.session);
			}
		}
	},

	_processLoginAck: function(dialect) {
		var state = dialect.getParam("state");
		if (state.code == 200) {
			this.registered = true;

			this._fireRegistrationState(CubeRegistrationState.Ok);
		}
		else {
			Logger.w("CubeEngine", "login failed");

			this._fireRegistrationState(CubeRegistrationState.Failed);
		}
	},

	_processQueryAck: function(dialect) {
		if (null != this.queryCallback) {
			var data = dialect.getParam("data");
			this.queryCallback.call(null, data.list);
			this.queryCallback = null;
		}
	}
});


var CubeNetworkListener = Class(TalkListener, {
	engine: null,

	ctor: function(engine) {
		TalkListener.prototype.ctor.call(this);
		this.engine = engine;
	},

	dialogue: function(identifier, primitive) {
		if (primitive.isDialectal()) {
			var dialect = primitive.getDialect();
			if (ActionDialect.DIALECT_NAME == dialect.getName()) {
				var action = dialect.getAction();
				if (action == CubeConst.ActionLoginAck) {
					this.engine._processLoginAck(dialect);
					return;
				}
				else if (action == CubeConst.ActionQueryAck) {
					this.engine._processQueryAck(dialect);
					return;
				}

				if (identifier == _WB_CELLET) {
					if (null != this.engine.wbList && this.engine.wbList.length > 0) {
						var list = this.engine.wbList;
						for (var i = 0; i < list.length; ++i) {
							list[i].onDialogue(action, dialect);
						}
					}
				}
				else if (identifier == _M_CELLET) {
					if (null != this.engine.msgWorker) {
						this.engine.msgWorker.onDialogue(action, dialect);
					}
				}
				else if (identifier == _S_CELLET) {
					if (null != this.engine.sspWorker) {
						this.engine.sspWorker.onDialogue(action, dialect);
					}
				}
			}
		}
	},

	contacted: function(identifier, tag) {
		console.log("*** contacted: " + identifier);

		if (!this.engine.registered && null != this.engine.accName && null != this.engine.accPassword) {
			// 回调
			this.engine._fireRegistrationState(CubeRegistrationState.Progress);

			var name = this.engine.accName;
			var displayName = this.engine.accDisplayName;
			var password = this.engine.accPassword;
			var version = this.engine.version;

			var cellets = [];
			if (null != this.engine.msgWorker)
				cellets.push(_M_CELLET);
			if (null != this.engine.sspWorker)
				cellets.push(_S_CELLET);
			if (null != this.engine.wbMap)
				cellets.push(_WB_CELLET);

			for (var i = 0; i < cellets.length; ++i) {
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionLogin);
				dialect.appendParam("data", {
					name: name,
					displayName: displayName,
					password: password,
					version: version,
					device: {
						name: navigator.appName,
						version: navigator.appVersion,
						platform: navigator.platform,
						userAgent: navigator.userAgent
					}
				});
				nucleus.talkService.talk(cellets[i], dialect);
			}

			cellets = null;
		}
	},

	quitted: function(identifier, tag) {
		console.log("*** quitted: " + identifier);

		if (null != this.engine.sspWorker) {
			if (this.engine.session.isCalling()) {
				this.engine.terminateCall();
			}
		}
	},

	failed: function(tag, failure) {
		console.log("*** failed: " + tag + " - " + failure.getDescription());

		var t = setTimeout(function() {
			clearTimeout(t);

			nucleus.talkService.recall();
		}, 10000);
	}
});

// 初始化
;(function(global) {
	CubeEngine.sharedInstance = new CubeEngine();
	global.cube = CubeEngine.sharedInstance;
})(window);
