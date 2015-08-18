/*
 * SIPWorker.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeSIPWorker = Class({
	host: null,
	engine: null,

	localVideo: null,
	remoteVideo: null,
	bellAudio: null,

	localStream: null,
	remoteStream: null,

	regListener: null,
	callListener: null,

	direction: null,
	videoEnabled: true,
	sip: null,
	rtcSession: null,
	
	maxFrameRate: 15,
	minFrameRate: 5,

	iceServersUrls: [{"urls": ["stun:211.103.217.154:3478"]},
		{"urls": ["turn:211.103.217.154:3478"], "username": "cube", "credential": "cube887"}],

	// local video ready callback
	localVideoReady: null,
	// remote video ready callback
	remoteVideoReady: null,
	// close callback
	videoCloseHandler: null,

	ctor: function(host) {
		this.host = host;
	},

	start: function(engine, localVideo, remoteVideo, bellAudio) {
		this.engine = engine;
		this.localVideo = localVideo;
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
	},

	registerWith: function(name, password, displayName) {
		if (null != this.sip) {
			if (this.sip.isRegistered()) {
				return true;
			}
		}

		var self = this;
		var configuration = {
			"ws_servers": "ws://" + self.host + ":5066",
			"uri": "sip:" + name + "@" + self.host,
			"password": password,
			"display_name": displayName,
			"register_expires": 610,
			"register": true
		};

		this.sip = new JsSIP.UA(configuration);

		if (null == this.regListener)
			this.regListener = new CubeSipRegistrationListener(this.engine);
		if (null == this.callListener)
			this.callListener = new CubeSipCallListener(this.engine);

		this.sip.on('connected', function(e) {
			self.regListener.onRegistrationProgress(self.engine.session);
		});

		this.sip.on('disconnected', function(e) {
		});

		this.sip.on('registered', function(e) {
			self.regListener.onRegistrationOk(self.engine.session);
		});
		this.sip.on('unregistered', function(e) {
			self.regListener.onRegistrationCleared(self.engine.session);
		});
		this.sip.on('registrationFailed', function(e) {
			self.regListener.onRegistrationFailed(self.engine.session);
		});

		// New incoming or outgoing call event
		this.sip.on('newRTCSession', function(e) {
			self.onNewSession(e);
		});

		// Start sip
		this.sip.start();
	},

	unregister: function() {
		if (null != this.sip) {
			this.sip.unregister({ all: true });
			this.sip.stop();
			this.sip = null;
		}

		this.clear();
	},

	invite: function(callee, videoEnabled) {
		if (null == this.sip ||
			(this.engine.session.callState != CubeSignalingState.None && this.engine.session.callState != CubeSignalingState.End)) {
			return false;
		}

		this.direction = CubeCallDirection.Outgoing;
		this.videoEnabled = videoEnabled;

		var self = this;

		var mW = 320;
		var mH = 240;
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

		var options = {
			mediaConstraints: { audio: true, video: videoEnabled ? constraints : false },
			pcConfig: {
				iceServers: self.iceServersUrls,
				gatheringTimeout: 2000
			},
			rtcConstraints: {optional: [{DtlsSrtpKeyAgreement: true}]},
			rtcOfferConstraints: {
				offerToReceiveAudio: 1,
				offerToReceiveVideo: videoEnabled ? 1 : 0
            }
		};
		// 发起呼叫
		this.sip.call("sip:" + callee + "@" + this.host, options);

		return true;
	},

	answer: function(videoEnabled) {
		if (null == this.rtcSession) {
			return false;
		}

		this.videoEnabled = videoEnabled;

		if (null != this.rtcSession) {
			var options = {
				mediaConstraints: { audio: true, video: videoEnabled },
				pcConfig: {
					iceServers: self.iceServersUrls,
					gatheringTimeout: 2000
				},
				rtcConstraints: {optional: [{DtlsSrtpKeyAgreement: true}]},
				rtcOfferConstraints: {
					offerToReceiveAudio: 1,
					offerToReceiveVideo: videoEnabled ? 1 : 0
				}
			};
			this.rtcSession.answer(options);
		}

		return true;
	},

	hangup: function() {
		if (null == this.rtcSession) {
			return false;
		}

		try {
			this.rtcSession.terminate();
		} catch (e) {
		}

		return true;
	},

	consult: function() {
		// Nothing
	},

	onNewSession: function(e) {
		var request = e.request;
		var call = e.session;
		var uri = call.remote_identity.uri.toString();

		this.rtcSession = call;

		if (null == this.engine.session.callPeer) {
			var peer = new CubePeer(call.remote_identity.uri.user);
			this.engine.session.setCallPeer(peer);
		}

		this.engine.session.callPeer.name = call.remote_identity.uri.user;
		this.engine.session.callPeer.displayName = call.remote_identity.display_name || call.remote_identity.uri.user;

		if (call.direction === "incoming") {
			this.direction = CubeCallDirection.Incoming;
		}
		else {
			this.direction = CubeCallDirection.Outgoing;
		}

		var self = this;
		call.on('connecting', function(e) {
			if (call.connection.getLocalStreams().length > 0) {
				self.localStream = call.connection.getLocalStreams()[0];
				self.attachMediaStream(self.localVideo, self.localStream);
				self.localVideo.volume = 0;
			}

			if (self.direction == CubeCallDirection.Outgoing) {
				self.callListener.onNewCall(self.direction, self.engine.session, self.videoEnabled);
			}
		});

		// Progress
		call.on('progress', function(e) {
			if (e.originator === 'remote') {
				// 被叫
			}
		});

		// Confirmed
		call.on('confirmed', function(e) {
			if (e.originator === 'local') {
				// 通话建立
				self.callListener.onCallConnected(self.engine.session);
			}
			else {
				// 通话建立
				self.callListener.onCallConnected(self.engine.session);
			}
		});

		// Started
		call.on('accepted', function(e){
			// Attach the streams to the views if it exists.
			if (call.connection.getLocalStreams().length > 0 && null == self.localStream) {
				self.localStream = call.connection.getLocalStreams()[0];
				//JsSIP.rtcninja.attachMediaStream(self.localVideo, self.localStream);
				self.attachMediaStream(self.localVideo, self.localStream);
				self.localVideo.volume = 0;
			}

			if (e.originator === 'remote') {
				if (e.response.getHeader('X-Can-Renegotiate') === 'false') {
					call.data.remoteCanRenegotiateRTC = false;
				}
				else {
					call.data.remoteCanRenegotiateRTC = true;
				}

				// answered
			}

			if (self.direction == CubeCallDirection.Outgoing) {
				self.callListener.onCallRinging(self.engine.session);
			}
		});

		call.on('addstream', function(e) {
			//console.log('Tryit: addstream()');
			self.remoteStream = e.stream;
			self.attachMediaStream(self.remoteVideo, self.remoteStream);
			//JsSIP.rtcninja.attachMediaStream(self.remoteVideo, self.remoteStream);
			self.remoteVideo.volume = 1;
		});

		// Failed
		call.on('failed',function(e) {
			var cause = e.cause,
				response = e.response;

			if (e.originator === 'remote' && cause.match("SIP;cause=200", "i")) {
				cause = 'answered_elsewhere';
			}

			console.log("Failed: " + cause);

			if (cause == JsSIP.C.causes.BYE || cause == JsSIP.C.causes.CANCELED) {
				// 结束
				self.callListener.onCallEnded(self.engine.session);
			}

			self.clear();
		});

		// NewDTMF
		call.on('newDTMF',function(e) {
			if (e.originator === 'remote') {
				/*sound_file = e.dtmf.tone;
				soundPlayer.setAttribute("src", "sounds/dialpad/" + sound_file + ".ogg");
				soundPlayer.play();*/
			}
		});

		/*call.on('hold',function(e) {
			soundPlayer.setAttribute("src", "sounds/dialpad/pound.ogg");
			soundPlayer.play();

			GUI.setCallSessionStatus(session, 'hold', e.originator);
		});*/
		
		/*call.on('unhold',function(e) {
			soundPlayer.setAttribute("src", "sounds/dialpad/pound.ogg");
			soundPlayer.play();

			GUI.setCallSessionStatus(session, 'unhold', e.originator);
		});*/

		// Ended
		call.on('ended', function(e) {
			var cause = e.cause;

			self.clear();

			self.callListener.onCallEnded(self.engine.session);
		});

		// received UPDATE
		/*call.on('update', function(e) {
			var request = e.request;

			if (! request.body) { return; }

			if (! localCanRenegotiateRTC() || ! call.data.remoteCanRenegotiateRTC) {
				console.warn('Tryit: UPDATE received, resetting PeerConnection');
				call.connection.reset();
				call.connection.addStream(localStream);
			}
		});*/

		// received reINVITE
		/*call.on('reinvite', function(e) {
			var request = e.request;

			if (! request.body) { return; }

			if (! localCanRenegotiateRTC() || ! call.data.remoteCanRenegotiateRTC) {
				console.warn('Tryit: reINVITE received, resetting PeerConnection');
				call.connection.reset();
				call.connection.addStream(localStream);
			}
		});*/

		if (self.direction == CubeCallDirection.Incoming) {
			self.callListener.onNewCall(self.direction, self.engine.session, self.videoEnabled);
		}
	},

	attachMediaStream: function(video, stream) {
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

	clear: function() {
		if (null != this.localStream) {
			this.localStream.stop();
			this.localStream = null;
		}
		if (null != this.remoteStream) {
			try {
				this.remoteStream.getAudioTracks()[0].stop();
				this.remoteStream.getVideoTracks()[0].stop();
			} catch (e) {
				Logger.w("SIPWorker#clear", e.message);
			}
			this.remoteStream = null;
		}

		this.localVideo.src = "";
		this.remoteVideo.src = "";

		this.rtcSession = null;

		if (null != this.videoCloseHandler) {
			this.videoCloseHandler.call(null, this);
		}
	}
});

var CubeSipCallListener = Class(CubeCallListener, {
	engine: null,

	ctor: function(engine) {
		this.engine = engine;
	},

	onNewCall: function(direction, session, video) {
		Logger.d('CallListener', 'onNewCall');

		// 更新呼叫方向
		session.callDirection = direction;
		session.callState = CubeSignalingState.Invite;

		if (null != this.engine.callListener) {
			this.engine.callListener.onNewCall(direction, session, video);
		}

		this.engine.sipWorker.localVideo.style.visibility = 'visible';
	},

	onInProgress: function(session) {
		Logger.d('CallListener', 'onInProgress');

		session.callState = CubeSignalingState.Progress;

		if (null != this.engine.callListener) {
			this.engine.callListener.onInProgress(session);
		}
	},

	onCallRinging: function(session) {
		Logger.d('CallListener', 'onCallRinging');

		session.callState = CubeSignalingState.Ringing;

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallRinging(session);
		}
	},

	onCallConnected: function(session) {
		Logger.d('CallListener', 'onCallConnected');

		session.callState = CubeSignalingState.Incall;

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallConnected(session);
		}

		this.engine.sipWorker.remoteVideo.style.visibility = 'visible';

		var cua = this.engine.cua();
		if (null != cua && session.callPeer.name.length <= 4) {
			cua.notifyJoin(session.callPeer.name, session.name);
		}
	},

	onCallEnded: function(session) {
		Logger.d('CallListener', 'onCallEnded');

		session.callState = CubeSignalingState.End;

		this.engine.sipWorker.localVideo.style.visibility = 'hidden';
		this.engine.sipWorker.remoteVideo.style.visibility = 'hidden';

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallEnded(session);
		}
	},

	onCallFailed: function(session, errorCode) {
		Logger.d('CallListener', 'onCallFailed');

		this.engine.sipWorker.localVideo.style.visibility = 'hidden';
		this.engine.sipWorker.remoteVideo.style.visibility = 'hidden';

		if (null != this.engine.callListener) {
			this.engine.callListener.onCallFailed(session, errorCode);
		}

		session.callState = CubeSignalingState.None;
	}
});

var CubeSipRegistrationListener = Class(CubeRegistrationListener, {
	engine: null,

	ctor: function(engine) {
		this.engine = engine;
	},

	onRegistrationProgress: function(session) {
		Logger.d('SipRegistrationListener', 'onRegistrationProgress');

		session.regState = CubeRegistrationState.Progress;

		if (null != this.engine.regListener && null == this.engine.sspWorker) {
			this.engine.regListener.onRegistrationProgress(session);
		}
	},

	onRegistrationOk: function(session) {
		Logger.d('SipRegistrationListener', 'onRegistrationOk');

		session.regState = CubeRegistrationState.Ok;

		if (null != this.engine.regListener && null == this.engine.sspWorker) {
			this.engine.regListener.onRegistrationOk(session);
		}
	},

	onRegistrationCleared: function(session) {
		Logger.d('SipRegistrationListener', 'onRegistrationCleared');

		session.regState = CubeRegistrationState.Cleared;

		if (null != this.engine.regListener && null == this.engine.sspWorker) {
			this.engine.regListener.onRegistrationCleared(session);
		}
		session.regState = CubeRegistrationState.None;
	},

	onRegistrationFailed: function(session) {
		Logger.d('SipRegistrationListener', 'onRegistrationFailed');

		session.regState = CubeRegistrationState.Failed;

		if (null != this.engine.regListener && null == this.engine.sspWorker) {
			this.engine.regListener.onRegistrationFailed(session);
		}
	}
});
