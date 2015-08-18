/*
 * VideoSize.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/5/29.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

/**
 * 视频大小枚举。
 *
 * @readonly
 * @enum {Object} CubeVideoSize
 */
var CubeVideoSize = {
	/** 视频分辨率为 128×96 (12,288) 的尺寸设置。*/
	SQCIF: { width: 128, height: 96 },
	/** 视频分辨率为 160×120 (19,200) 的尺寸设置。*/
	QQVGA: { width: 160, height: 120 },
	/** 视频分辨率为 320×240 (76,800) 的尺寸设置。*/
	QVGA: { width: 320, height: 240 },
	/** 视频分辨率为 352×288 (101,376) 的尺寸设置。*/
	CIF: { width: 352, height: 288 },
	/** 视频分辨率为 640×480 (307,200) 的尺寸设置。*/
	VGA: { width: 640, height: 480 },
	/** 视频分辨率为 800×600 (480,000) 的尺寸设置。*/
	SVGA: { width: 800, height: 600 },
	/** 视频分辨率为 960×720 (691,200) 的尺寸设置。*/
	HD: { width: 960, height: 720 },
	/** 视频分辨率为 1024×768 (786,432) 的尺寸设置。*/
	XGA: { width: 1024, height: 768 },
	/** 视频分辨率为 1280×1024 (1,310,720) 的尺寸设置。*/
	SXGA: { width: 1280, height: 1024 },
	/** 视频分辨率为 1600×1200 (1,920,000) 的尺寸设置。*/
	UXGA: { width: 1600, height: 1200 },

	/** 视频分辨率为 400×240 (96,000) 的尺寸设置。*/
	WQVGA: { width: 400, height: 240 },
	/** 视频分辨率为 512×288 (147 456) 的尺寸设置。*/
	WCIF: { width: 512, height: 288 },
	/** 视频分辨率为 800×480 (384,000) 的尺寸设置。*/
	WVGA: { width: 800, height: 480 },
	/** 视频分辨率为 1024×600 (614,400) 的尺寸设置。*/
	WSVGA: { width: 1024, height: 600 },
	/** 视频分辨率为 1280×720 (921,600) 的尺寸设置。*/
	WHD: { width:1280, height: 720 },
	/** 视频分辨率为 1280×768 (983,040) 的尺寸设置。*/
	WXGA: { width: 1280, height: 768 },
	/** 视频分辨率为 1920×1200 (2,304,000) 的尺寸设置。*/
	WUXGA: { width: 1920, height: 1200 },

	/** 视频分辨率为 768×432 (331,776, a.k.a WVGA 16:9) 的尺寸设置。*/
	W432P: { width: 768, height: 432 },
	/** 视频分辨率为 768×480 (368,640, a.k.a WVGA 16:10) 的尺寸设置。*/
	W480P: { width: 768, height: 480 }
};
/*
 * SignalingState.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/5/20.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeSignalingState = {

	None: 0,

	Progress: 1,

	Invite: 2,

	Ringing: 3,

	Incall: 4,

	End: 5
};
/*
 * SignalingWorkerDelegate.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/5/19.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeSignalingWorkerDelegate = Class({
	engine: null,

	ctor: function(engine) {
		this.engine = engine;
	},

	didInvite: function(worker, direction, callee, video) {
		Logger.d('CubeSignalingWorkerDelegate', 'onNewCall');

		// 更新呼叫方向
		this.engine.session.callDirection = direction;
		this.engine.session.callState = CubeSignalingState.Invite;

		// 更新 CallPeer
		if (null == this.engine.session.callPeer || this.engine.session.callPeer.name != callee) {
			this.engine.session.setCallPeer(new CubePeer(callee));

			if (null != worker.targetData) {
				this.engine.session.callPeer.displayName = worker.targetData.displayName;
			}
		}

		if (null != this.engine.callListener) {
			this.engine.callListener.onNewCall(direction, this.engine.session, video);
		}

		worker.localVideo.style.visibility = 'visible';
	},

	didRinging: function(worker, callee) {
		Logger.d('CubeSignalingWorkerDelegate', 'onCallRinging');

		// 更新显示名
		this.engine.session.callPeer.displayName = worker.targetData.displayName;

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallRinging(this.engine.session);
		}
	},

	didIncall: function(worker, direction, callee, sdp) {
		Logger.d('CubeSignalingWorkerDelegate', 'onCallConnected');

		// 更新状态
		this.engine.session.callState = CubeSignalingState.Incall;

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallConnected(this.engine.session);
		}

		worker.remoteVideo.style.visibility = 'visible';
	},

	didEnd: function(worker, callee) {
		Logger.d('CubeSignalingWorkerDelegate', 'onCallEnded');

		// 更新状态
		this.engine.session.callState = CubeSignalingState.End;

		if (null != worker.videoCloseHandler) {
			worker.videoCloseHandler.call(null, worker);
		}

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallEnded(this.engine.session);
		}

		worker.localVideo.style.visibility = 'hidden';
		worker.remoteVideo.style.visibility = 'hidden';
	},

	didProgress: function(worker, callee) {
		Logger.d('CubeSignalingWorkerDelegate', 'onInProgress');

		if (null != this.engine.callListener) {
			this.engine.callListener.onInProgress(this.engine.session);
		}
	},

	didFailed: function(worker, callee, errorCode) {
		Logger.d('CubeSignalingWorkerDelegate', 'onCallFailed');

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallFailed(this.engine.session, errorCode);
		}

		// 更新状态
		this.engine.session.callState = CubeSignalingState.None;

		worker.localVideo.style.visibility = 'hidden';
		worker.remoteVideo.style.visibility = 'hidden';

		var self = this;
		setTimeout(function() {
			self.engine.terminateCall();
		}, 1000);

		if (null != worker.videoCloseHandler) {
			worker.videoCloseHandler.call(null, worker);
		}
	}
});
/*
 * SignalingWorker.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/5/19.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

;(function(global) {
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	global.RTCPeerConnection = RTCPeerConnection;

	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
	global.RTCIceCandidate = RTCIceCandidate;

	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
	global.RTCSessionDescription = RTCSessionDescription;

	// Look after different browser vendors' ways of calling the getUserMedia()
	// API method:
	// Opera --> getUserMedia
	// Chrome --> webkitGetUserMedia
	// Firefox --> mozGetUserMedia
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	if (window.utils.isIE) {
		var s = document.createElement("script");
		s.setAttribute("src", "http://" + _CUBE_DOMAIN + "/libs/adapter-min.js");
		s.onload = function(e) {
			AdapterJS.webRTCReady(function(isUsingPlugin) {
				window.console.log("WebRTC Plugin Ready!");
			});
		};
		document.body.appendChild(s);
	}
})(window);

var CubeSignalingWorker = Class({
	delegate: null,
	session: null,

	target: null,
	targetData: null,

	direction: null,
	videoEnabled: true,
	state: CubeSignalingState.None,

	sdpCache: null,

	autoAnswer: false,

	// 带宽
	audioBandwidth: 50,
	videoBandwidth: 256,

	// HTML5 <video> elements
	localVideo: null,
	remoteVideo: null,
	bellAudio: null,
	bellAudioPaused: false,

	isInitiator: false,
	isStarted: false,
	isChannelReady: false,

	// WebRTC data structures
	// Streams
	localStream: null,
	remoteStream: null,
	// PeerConnection
	pc: null,

	// local video ready callback
	localVideoReady: null,
	// remote video ready callback
	remoteVideoReady: null,
	// close callback
	videoCloseHandler: null,

	//iceServers: [{"urls": ["stun:211.103.217.154:3478"]}, {"urls": ["turn:211.103.217.154:3478"], "username": "cube", "credential": "cube887"}],
	iceServersUrls: [{"urls": ["stun:211.103.217.154:3478", "stun:123.57.251.18:3478"]},
		{"urls": ["turn:211.103.217.154:3478", "turn:123.57.251.18:3478"], "username": "cube", "credential": "cube887"}],
	/*iceServersUrls: [{"url": "stun:211.103.217.154:3478"},
		{"url": "stun:123.57.251.18:3478"},
		{"url": "turn:211.103.217.154:3478", "username": "cube", "credential": "cube887"},
		{"url": "turn:123.57.251.18:3478", "username": "cube", "credential": "cube887"}],*/

	pcConstraints: {"optional": [{"DtlsSrtpKeyAgreement": true}]},

	sdpConstraints: {},
	candidateQueue: [],

	maxVideoSize: null,
	maxFrameRate: 15,
	minFrameRate: 5,

	iceTimer: null,
	iceTimeout: 10000,

	confUA: null,

	ctor: function(localVideo, remoteVideo, bellAudio) {
		this.localVideo = localVideo;
		//this.localVideo.setAttribute('muted', 'muted');
		this.localVideo.muted = true;
		this.remoteVideo = remoteVideo;
		this.bellAudio = bellAudio;

		var self = this;
		self.localVideo.addEventListener('loadeddata', function(e) {
			if (null != self.localVideoReady) {
				self.localVideoReady.call(null, self.localVideo);
			}
		}, false);

		self.remoteVideo.addEventListener('loadeddata', function(e) {
			if (null != self.remoteVideoReady) {
				self.remoteVideoReady.call(null, self.remoteVideo);
			}
		}, false);

		if (null != self.bellAudio) {
			self.bellAudio.addEventListener('loadeddata', function(e) {
				if (self.bellAudioPaused) {
					return;
				}

				self.bellAudio.play();
			}, false);
		}
	},

	onRegisterStateChanged: function(session) {
		this.session = session;
		if (session.regState == CubeRegistrationState.Ok) {
			this.isChannelReady = true;
		}
		else {
			this.isChannelReady = false;
		}
	},

	onDialogue: function(action, dialect) {
		if (action == CubeConst.ActionInviteAck) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionInviteAck);
			this._processInviteAck(dialect);
		}
		else if (action == CubeConst.ActionInvite) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionInvite);
			this._processInvite(dialect);
		}
		else if (action == CubeConst.ActionAnswerAck) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionAnswerAck);
			this._processAnswerAck(dialect);
		}
		else if (action == CubeConst.ActionAnswer) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionAnswer);
			this._processAnswer(dialect);
		}
		else if (action == CubeConst.ActionByeAck) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionByeAck);
			this._processByeAck(dialect);
		}
		else if (action == CubeConst.ActionBye) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionBye);
			this._processBye(dialect);
		}
		else if (action == CubeConst.ActionCancelAck) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionCancelAck);
			this._processCancelAck(dialect);
		}
		else if (action == CubeConst.ActionCancel) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionCancel);
			this._processCancel(dialect);
		}
		else if (action == CubeConst.ActionCandidate) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionCandidate);
			this._processCandidate(dialect);
		}
		else if (action == CubeConst.ActionCandidateAck) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionCandidateAck);
			this._processCandidateAck(dialect);
		}
		else if (action == CubeConst.ActionConsult) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionConsult);
			this._processConsult(dialect);
		}
		else if (action == CubeConst.ActionConsultAck) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionConsultAck);
			this._processConsultAck(dialect);
		}
		else if (action == CubeConst.ActionConferenceAck) {
			Logger.d('SignalingWorker#onDialogue', CubeConst.ActionConferenceAck);
			this._processConferenceAck(dialect);
		}
	},

	cua: function() {
		if (null == this.confUA) {
			this.confUA = new CubeConferenceUA(this);
		}

		return this.confUA;
	},

	getConferenceUA: function() {
		return this.cua();
	},

	setDelegate: function(delegate) {
		this.delegate = delegate;
	},

	setAutoAnswer: function(autoAnswer) {
		this.autoAnswer = autoAnswer;
	},

	setBandwidth: function(audio, video) {
		this.audioBandwidth = audio;
		this.videoBandwidth = video;
	},

	getLocalVideo: function() {
		return this.localVideo;
	},

	getRemoteVideo: function() {
		return this.remoteVideo;
	},

	invite: function(callee, videoEnabled) {
		if (!this.isChannelReady) {
			return false;
		}

		var self = this;
		// 呼叫目标
		self.target = callee.toString();
		// 主叫
		self.isInitiator = true;
		self.direction = CubeCallDirection.Outgoing;
		self.videoEnabled = videoEnabled;
		// 更新状态
		self.state = CubeSignalingState.Invite;

		if (null != self.delegate) {
			self.delegate.didInvite(self, self.direction, self.target, self.videoEnabled);
		}

		var mW = 320;
		var mH = 240;
		if (null != self.maxVideoSize) {
			if (self.maxVideoSize.width !== undefined)
				mW = self.maxVideoSize.width;
			if (self.maxVideoSize.height !== undefined)
				mH = self.maxVideoSize.height;
		}

		Logger.d("SignalingWorker", "Camera resolution: " + mW + "x" + mH);

		// Call getUserMedia()
		var constraints = {
				"mandatory": {
					"maxWidth": mW,
					"maxHeight": mH,
					"minWidth": 160,
					"minHeight": 120,
					"maxFrameRate": self.maxFrameRate,
					"minFrameRate": self.minFrameRate
				}};
		if (window.utils.isFirefox) {
			constraints = {
				"width": { "min": 160, "max": mW },
				"height": { "min": 120, "max": mH },
				"frameRate": parseInt(self.maxFrameRate),
				"require": ["width", "height", "frameRate"]};
		}
		if (window.utils.isIE && window.getUserMedia) {
			navigator.getUserMedia = window.getUserMedia;
		}
		navigator.getUserMedia({ "audio": true, "video": videoEnabled ? constraints : false },
			function(e) {
				self.handleUserMedia(e);

				// 检查并启动
				self.checkAndStart();
			},
			function(e) {
				self.handleUserMediaError(e);
			});

		Logger.d('SignalingWorker', 'Getting user media with constraints');

		// 显示遮罩
		this._showMask();

		return true;
	},

	answer: function() {
		if (!this.isChannelReady) {
			return false;
		}

		if (this.isInitiator || null == this.sdpCache) {
			return false;
		}

		// 启动 WebRTC
		if (this.checkAndStart()) {
			// 设置远端的 SDP
			var self = this;
			this.pc.setRemoteDescription(new RTCSessionDescription({type:"offer", sdp: self.sdpCache}), function() {
				self.doAnswer();
			}, function(e) {
				self.onSignalingError(e);
			});
			return true;
		}
		else {
			return false;
		}
	},

	hangup: function() {
		if (this.state == CubeSignalingState.None) {
			return false;
		}

		if (this.state == CubeSignalingState.Incall) {
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionBye);
			dialect.appendParam('call', this.target);
			nucleus.talkService.talk(_S_CELLET, dialect);

			this._cleanCall();
		}
		else if (this.state == CubeSignalingState.Invite
			|| this.state == CubeSignalingState.Ringing) {
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionCancel);
			dialect.appendParam('call', this.target);
			nucleus.talkService.talk(_S_CELLET, dialect);

			this._cleanCall();
		}

		return true;
	},

	consult: function(media, operation) {
		if (this.state != CubeSignalingState.Incall) {
			return false;
		}

		var peer = this.session.callPeer.name.toString();
		var payload = {
					"ver": 1,
					"media": media,
					"operation": operation };

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConsult);
		dialect.appendParam("peer", peer);
		dialect.appendParam("payload", payload);
		nucleus.talkService.talk(_S_CELLET, dialect);

		return true;
	},

	// Channel negotiation trigger function
	checkAndStart: function() {
		if (!this.isStarted && this.localStream != null) {
			// 创建 PeerConnection
			if (!this.createPeerConnection()) {
				// 发生错误
				return false;
			}

			// 标记为已启动
			this.isStarted = true;

			if (this.isInitiator) {
				this.doCall();
			}

			return true;
		}
		else {
			return false;
		}
	},

	// PeerConnection management...
	createPeerConnection: function() {
		var self = this;
		try {
			var config = {"iceServers": self.iceServersUrls};

			self.pc = new RTCPeerConnection(config, self.pcConstraints);
			self.pc.addStream(self.localStream);
			self.pc.onicecandidate = function(e) { self.handleIceCandidate(e); };

			//Logger.d('SignalingWorker', 'Created RTCPeerConnnection with:\n  config: \'' +
			//		JSON.stringify(config) + '\';\n  constraints: \'' +
			//		JSON.stringify(self.pcConstraints) + '\'.');
		} catch (e) {
			Logger.d('SignalingWorker', 'Failed to create PeerConnection, exception: ' + e.message);
			//alert('Cannot create RTCPeerConnection object.');

			if (null != this.delegate) {
				this.delegate.didFailed(this, this.target, CubeCallErrorCode.RTCInitializeFailed);
			}

			this._cleanCall();

			return false;
		}

		self.pc.onaddstream = function(e) { self.handleRemoteStreamAdded(e); };
		self.pc.onremovestream = function(e) { self.handleRemoteStreamRemoved(e); };

		// Data channel
		/*if (isInitiator) {
			try {
				// Create a reliable data channel
				sendChannel = pc.createDataChannel("sendDataChannel", {reliable: true});
				trace('Created send data channel');
			} catch (e) {
      			alert('Failed to create data channel. ');
      			trace('createDataChannel() failed with exception: ' + e.message);
    		}
			sendChannel.onopen = handleSendChannelStateChange;
			sendChannel.onmessage = handleMessage;
			sendChannel.onclose = handleSendChannelStateChange;
		} else { // Joiner
			pc.ondatachannel = gotReceiveChannel;
		}*/

		return true;
	},

	doCall: function() {
		Logger.d('SignalingWorker', 'Creating Offer...');
		var self = this;
		// 创建 Offer
		self.pc.createOffer(
			function(sessionDescription) {
				sessionDescription.sdp = self._fixSdp(sessionDescription.sdp);
				self.setLocalAndSendInvite(sessionDescription);
			},
			function(e) {
				self.onSignalingError(e);
			}, self.sdpConstraints);
	},

	doAnswer: function() {
		Logger.d('SignalingWorker', 'Creating Answer...');
		var self = this;
		// 创建 Answer
		self.pc.createAnswer(
			function(sessionDescription) {
				sessionDescription.sdp = self._fixSdp(sessionDescription.sdp);
				self.setLocalAndSendAnswer(sessionDescription);
			},
			function(e) {
				self.onSignalingError(e);
			}, self.sdpConstraints);
	},

	setLocalAndSendInvite: function(sessionDescription) {
		var self = this;
		// set local SDP
		this.pc.setLocalDescription(sessionDescription, function() {
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionInvite);
			dialect.appendParam('callee', self.target);
			dialect.appendParam('sdp', self.pc.localDescription.sdp);
			nucleus.talkService.talk(_S_CELLET, dialect);

			Logger.d("SignalingWorker#setLocalAndSendInvite", "Offer:\n" + self.pc.localDescription.sdp);
		}, function(error) {
			Logger.e('SignalingWorker', 'set local description error: ' + error);
		});
    },

	setLocalAndSendAnswer: function(sessionDescription) {
		var self = this;
		// set local SDP
		this.pc.setLocalDescription(sessionDescription, function() {
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionAnswer);
			dialect.appendParam('caller', self.target);
			dialect.appendParam('sdp', self.pc.localDescription.sdp);
			nucleus.talkService.talk(_S_CELLET, dialect);

			// 处理 ICE Candidate
			self.drainCandidateQueue();

			Logger.d("SignalingWorker#setLocalAndSendAnswer", "Answer:\n" + self.pc.localDescription.sdp);
		}, function(error) {
			Logger.e('SignalingWorker', 'set local description error: ' + error);
		});
	},

	attachMediaStream: function(video, stream) {
		if (window.utils.isIE && window.attachMediaStream) {
			window.attachMediaStream(video, stream);
			return;
		}

		if (window.URL) {
			// Chrome case: URL.createObjectURL() converts a MediaStream to a blob URL
			video.src = window.URL.createObjectURL(stream);
		}
		else {
			// Firefox and Opera: the src of the video can be set directly from the stream
			video.src = stream;
		}
		video.onloadedmetadata = function(e) {
			video.play();
		};
	},

	handleUserMedia: function(stream) {
		this.localStream = stream;
		this.attachMediaStream(this.localVideo, stream);

		if (utils.isIE && this.localVideo.tagName.toLowerCase() == "video") {
			this.localVideo = document.getElementById(this.localVideo.id);
		}

		// 本地视频静音
		this.localVideo.muted = true;
		// 本地视频控制器不可用
		this.localVideo.controls = false;

		Logger.d('SignalingWorker', 'Adding local stream.');

		// 关闭遮罩
		this._closeMask();
	},
	handleUserMediaError: function(error) {
		Logger.e('SignalingWorker', 'Navigator.getUserMedia error: ' + JSON.stringify(error));

		// 关闭遮罩
		this._closeMask();
	},
	handleIceCandidate: function(event) {
		if (event.candidate) {
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionCandidate);
			dialect.appendParam('peer', this.target);
			dialect.appendParam('candidate', {
					sdpMid: event.candidate.sdpMid,
					sdpMLineIndex: event.candidate.sdpMLineIndex,
					sdp: event.candidate.candidate
				});
			nucleus.talkService.talk(_S_CELLET, dialect);
		}
		else {
			Logger.d('SignalingWorker', 'End of candidates.');
		}
	},
	handleRemoteStreamAdded: function(event) {
		try {
			if (null != this.bellAudio) {
				this.bellAudioPaused = true;
				this.bellAudio.pause();
			}
		} catch (e) {
		}

		if (this.iceTimer > 0) {
			clearTimeout(this.iceTimer);
			this.iceTimer = 0;
		}

		this.remoteStream = event.stream;
		this.attachMediaStream(this.remoteVideo, event.stream);

		if (utils.isIE && this.remoteVideo.tagName.toLowerCase() == "video") {
			this.remoteVideo = document.getElementById(this.remoteVideo.id);
		}
	},
	handleRemoteStreamRemoved: function(event) {
		Logger.d('SignalingWorker', 'Remote stream removed. Event: ' + event);

		if (this.iceTimer > 0) {
			clearTimeout(this.iceTimer);
			this.iceTimer = 0;
		}
	},

	drainCandidateQueue: function() {
		for (var i = 0; i < this.candidateQueue.length; ++i) {
			var candidate = this.candidateQueue[i];
			this.pc.addIceCandidate(candidate);
		}

		this.candidateQueue.splice(0, this.candidateQueue.length);
		this.candidateQueue = [];
	},

	onSignalingError: function(error) {
		Logger.w('SignalingWorker#onSignalingError', 'Failed to create signaling message : ' + error.name);
	},

	_setBandwidth: function(sdp) {
		sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + this.audioBandwidth + '\r\n');
		sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + this.videoBandwidth + '\r\n');
		sdp = sdp.replace(/a=mid:sdparta_0\r\n/g, 'a=mid:sdparta_0\r\nb=AS:' + this.audioBandwidth + '\r\n');
		sdp = sdp.replace(/a=mid:sdparta_1\r\n/g, 'a=mid:sdparta_1\r\nb=AS:' + this.videoBandwidth + '\r\n');
		return sdp;
	},

	_fixSdp: function(sdp) {
		var ret = this._setBandwidth(sdp);
		//sdp = sdp.replace(/a=candidate+/g, '');
		return ret;
	},

	_processInviteAck: function(dialect) {
		var state = dialect.getParam("state");
		var code = state.code;
		if (code != 200) {
			if (null != this.delegate) {
				this.delegate.didFailed(this, this.target, code);
			}
			return;
		}

		if (this.direction == CubeCallDirection.Outgoing) {
			var callee = dialect.getParam("callee");

			// 目标数据
			this.targetData = dialect.getParam('calleeData');

			// 更新状态
			this.state = CubeSignalingState.Ringing;

			// Ringing 响铃
			if (null != this.bellAudio) {
				this.bellAudioPaused = false;
				this.bellAudio.loop = true;
				this.bellAudio.src = "assets/sounds/ringbacktone.wav";
			}

			if (null != this.delegate) {
				this.delegate.didRinging(this, callee);
			}
		}
	},

	_processInvite: function(dialect) {
		if (this.state == CubeSignalingState.None) {
			// 被叫
			this.isInitiator = false;
			this.direction = CubeCallDirection.Incoming;
			// 更新状态
			this.state = CubeSignalingState.Invite;

			var self = this;

			// Ringing 响铃
			if (null != this.bellAudio) {
				this.bellAudioPaused = false;
				this.bellAudio.loop = true;
				this.bellAudio.src = "assets/sounds/ringtone.wav";
			}

			var caller = dialect.getParam('caller');
			var sdp = dialect.getParam('sdp');
			// 保存 SDP
			this.sdpCache = sdp;

			var videoEnabled = false;
			if (sdp.indexOf('m=video') >= 0) {
				videoEnabled = true;
			}

			this.videoEnabled = videoEnabled;

			// 目标
			this.target = caller.toString();
			this.targetData = dialect.getParam('callerData');

			// Call getUserMedia()
			var mW = 320;
			var mH = 240;
			if (null != self.maxVideoSize) {
				if (self.maxVideoSize.width !== undefined)
					mW = self.maxVideoSize.width;
				if (self.maxVideoSize.height !== undefined)
					mH = self.maxVideoSize.height;
			}
			var constraints = {
				mandatory: {
					maxWidth: mW,
					maxHeight: mH,
					minWidth: 160,
					minHeight: 120,
					maxFrameRate: self.maxFrameRate,
					minFrameRate: self.minFrameRate
				}};
			if (window.utils.isFirefox) {
				constraints = {
					"width": { "min": 160, "max": mW },
					"height": { "min": 120, "max": mH },
					"frameRate": parseInt(self.maxFrameRate),
					"require": ["width", "height", "frameRate"]};
			}
		
			if (window.utils.isIE && window.getUserMedia) {
				navigator.getUserMedia = window.getUserMedia;
			}
			navigator.getUserMedia({ "audio": true, "video": (videoEnabled ? constraints : false) },
				function(e) {
					self.handleUserMedia(e);

					if (self.autoAnswer) {
						setTimeout(function() { self.answer(); }, 60);
					}
				},
				function(e) {
					self.handleUserMediaError(e);
				});

			if (null != this.delegate) {
				this.delegate.didInvite(this, this.direction, this.target, videoEnabled);
			}

			// 显示遮罩
			this._showMask();
		}
		else {
			Logger.e('SignalingWorker#_processInvite', 'Signaling state error: ' + this.state);
		}
	},

	_processAnswerAck: function(dialect) {
		// 处理铃声
		if (null != this.bellAudio) {
			this.bellAudioPaused = true;
			this.bellAudio.pause();
		}

		var state = dialect.getParam("state");
		if (state.code != 200) {
			// 错误
			if (null != this.delegate) {
				this.delegate.didFailed(this, this.target, code);
			}
			return;
		}

		if (this.direction == CubeCallDirection.Incoming) {
			var caller = dialect.getParam("caller");

			// 更新状态
			this.state = CubeSignalingState.Incall;
			if (null != this.delegate) {
				this.delegate.didIncall(this, this.direction, caller, null);
			}
		}
	},

	_processAnswer: function(dialect) {
		if (this.direction == CubeCallDirection.Outgoing) {
			var callee = dialect.getParam("callee");
			var sdp = dialect.getParam("sdp");

			// 设置对端 SDP
			this.pc.setRemoteDescription(new RTCSessionDescription({type:"answer", sdp: sdp}));

			// 处理 ICE Candidate
			this.drainCandidateQueue();

			// 更新状态
			this.state = CubeSignalingState.Incall;

			// 处理铃声
			if (null != this.bellAudio) {
				this.bellAudioPaused = true;
				this.bellAudio.pause();
			}

			if (null != this.delegate) {
				this.delegate.didIncall(this, this.direction, callee, sdp);
			}

			if (this.iceTimer > 0) {
				clearTimeout(this.iceTimer);
			}
			var self = this;
			this.iceTimer = setTimeout(function() {
				clearTimeout(self.iceTimer);
				self.iceTimer = 0;

				// ICE 超时
				if (null != self.delegate) {
					self.delegate.didFailed(self, self.target, CubeCallErrorCode.ICEConnectionFailed);
				}
	
				self.hangup();
			}, this.iceTimeout);
		}
	},

	_processByeAck: function(dialect) {
		if (null != this.delegate) {
			this.delegate.didEnd(this, this.target);
		}

		this._cleanCall();
	},
	_processCancelAck: function(dialect) {
		if (null != this.delegate) {
			this.delegate.didEnd(this, this.target);
		}

		this._cleanCall();
	},

	_processBye: function(dialect) {
		if (this.state == CubeSignalingState.None) {
			return;
		}

		if (null != this.delegate) {
			this.delegate.didEnd(this, this.target);
		}

		this._cleanCall();
	},
	_processCancel: function(dialect) {
		if (this.state == CubeSignalingState.None) {
			return;
		}

		if (null != this.delegate) {
			this.delegate.didEnd(this, this.target);
		}

		this._cleanCall();
	},

	_processCandidate: function(dialect) {
		var jsonCandidate = dialect.getParam("candidate");
		var candidate = new RTCIceCandidate({
			sdpMLineIndex: jsonCandidate.sdpMLineIndex,
			sdpMid: jsonCandidate.sdpMid,
			candidate: jsonCandidate.sdp
		});

		if (null == this.pc) {
			this.candidateQueue.push(candidate);
			return;
		}

    	this.pc.addIceCandidate(candidate);
	},

	_processCandidateAck: function(dialect) {
		// Nothing
	},

	_processConsult: function(dialect) {
		var peer = dialect.getParam("peer");
		var payload = dialect.getParam("payload");

		// 判断当前对端是否是正确的对端
		if (peer == this.session.callPeer.name) {
			if (payload.ver == 1) {
				if (payload.media == "video") {
					if (payload.operation == "close") {
						try {
							this.localStream.getVideoTracks()[0].enabled = false;
						} catch (e) {
							// Nothing
						}
					}
					else if (payload.operation == "open") {
						try {
							this.localStream.getVideoTracks()[0].enabled = true;
						} catch (e) {
							// Nothing
						}
					}
				}
			}
		}
		else {
			Logger.w("SignalingWorker#_processConsult", "Session peer error: " + peer);
		}
	},

	_processConsultAck: function(dialect) {
		// Nothing
	},

	_processConferenceAck: function(dialect) {
		if (null != this.confUA) {
			this.confUA.processDialect(dialect);
		}
	},

	_bodyOverflow: null,
	_maskDom: null,
	_maskHeight: 1080,

	_showMask: function() {
		this._closeMask();

		this._bodyOverflow = document.body.style.overflow;

		var w = window.innerWidth;
		var h = parseInt(window.innerHeight) + 70;
		if (h > this._maskHeight) {
			this._maskHeight = h;
		}

		document.body.style.overflow = "hidden";

		if (null == this._maskDom) {
			//var mask = [''];

			var c = document.createElement("div");
			c.id = "_cube_mask_";
			c.style.position = "absolute";
			c.style.styleFloat = "left";
			c.style.cssFloat = "left";
			c.style.left = "0px";
			c.style.top = "0px";
			c.style.width = w + "px";
			c.style.height = this._maskHeight + "px";
			c.style.zIndex = 9999;
			c.style.opacity = 0.6;
			c.style.mozOpacity = 0.6;
			c.style.webkitOpacity = 0.6;
			c.style.background = "#000";
			//c.innerHTML = mask.join('');

			var self = this;
			c.addEventListener('dblclick', function(e) {
				self._closeMask();
			}, false);

			this._maskDom = c;
		}
		else {
			this._maskDom.style.left = "0px";
			this._maskDom.style.top = "0px";
			this._maskDom.style.width = w + "px";
			this._maskDom.style.height = this._maskHeight + "px";
		}

		document.body.appendChild(this._maskDom);
	},

	_closeMask: function() {
		if (null != this._bodyOverflow) {
			document.body.removeChild(this._maskDom);
			document.body.style.overflow = this._bodyOverflow;

			this._bodyOverflow = null;
		}
	},

	_cleanCall: function() {
		if (this.iceTimer > 0) {
			clearTimeout(this.iceTimer);
			this.iceTimer = 0;
		}

		if (null != this.videoCloseHandler) {
			this.videoCloseHandler.call(null, this);
		}

		// 处理铃声
		if (null != this.bellAudio) {
			this.bellAudioPaused = true;
			this.bellAudio.pause();
		}

		try {
			if (utils.isIE) {
				this.localVideo = document.getElementById(this.localVideo.id);
				window.attachMediaStream(this.localVideo, null);
			}
			else {
				this.localVideo.src = "";
			}
		} catch (e) {
			Logger.w("SignalingWorker#clean", e.message);
		}

		try {
			if (utils.isIE) {
				this.remoteVideo = document.getElementById(this.remoteVideo.id);
				window.attachMediaStream(this.remoteVideo, null);
			}
			else {
				this.remoteVideo.src = "";
			}
		} catch (e) {
			Logger.w("SignalingWorker#clean", e.message);
		}

		if (null != this.localStream) {
			this.localStream.stop();
			this.localStream = null;
		}
		if (null != this.remoteStream) {
			try {
				this.remoteStream.getAudioTracks()[0].stop();
				this.remoteStream.getVideoTracks()[0].stop();
			} catch (e) {
				Logger.w("SignalingWorker#clean", e.message);
			}
			this.remoteStream = null;
		}

		if (null != this.pc) {
			this.pc.close();
			this.pc = null;
		}

		this.direction = null;
		this.target = null;
		this.targetData = null;
		this.state = CubeSignalingState.None;
		this.isInitiator = false;
		this.isStarted = false;
		this.sdpCache = null;
	}
});
/*
 * ConferenceUA.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/8/3.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeConferenceUA = Class({
	callbackMap: null,

	ctor: function() {
		this.callbackMap = new HashMap();
	},

	listConferences: function(callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "list",
				"task": task
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	getConference: function(id, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "get",
				"task": task,
				"id": id.toString()
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	changeFloor: function(conf, caller, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "floor",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString()
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	setMemberDeaf: function(conf, caller, deaf, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "deaf",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString(),
				"deaf": deaf
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	setMemberMute: function(conf, caller, mute, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "mute",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString(),
				"mute": mute
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	notifyJoin: function(conf, caller) {
		var task = new String(Date.now());

		var request = {
				"cmd": "join",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString()
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		return nucleus.talkService.talk(_S_CELLET, dialect);
	},

	processDialect: function(dialect) {
		var state = dialect.getParam("state");
		if (state.code == 200) {
			var response = dialect.getParam("response");
			var task = response.task;
			if (response.cmd == "floor"
				|| response.cmd == "deaf"
				|| response.cmd == "mute"
				|| response.cmd == "get") {
				var cb = this.callbackMap.get(task);
				if (null != cb) {
					cb.call(null, response.conference);
					this.callbackMap.remove(task);
				}
			}
			else if (response.cmd == "list") {
				var cb = this.callbackMap.get(task);
				if (null != cb) {
					cb.call(null, response);
					this.callbackMap.remove(task);
				}
			}
		}
		else {
			// 状态异常
			Logger.w("CubeConferenceUA", "Ack state: " + state.code);
			var task = dialect.getParam("task");
			var cb = this.callbackMap.remove(task);
			if (null != cb) {
				cb.call(null);
			}
		}
	}
});
