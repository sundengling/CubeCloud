/*
 * SIPWorker.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeSIPWorker = Class({
	stack: null,
	sessionRegister: null,
	sessionCall: null,

	configCall: null,
	localVideo: null,
	remoteVideo: null,

	host:null,

	session: null,

	regListener: null,
	callListener: null,

	ctor: function(host) {
		this.host = host;
	},

	start: function(engine, localVideo, remoteVideo, bellAudio) {
		this.session = engine.session;

		SIPml.setDebugLevel("info");
		SIPml.init();

		var self = this;
		this.configCall = {
            //audio_remote: bellAudio,
            video_local: localVideo,
            video_remote: remoteVideo,
            bandwidth: { audio:50, video:256 },
            video_size: { minWidth:"160", minHeight:"120", maxWidth:"360", maxHeight:"240" },
            events_listener: { events: '*', listener: function(e) { self.onSipSessionEvent(e); } },
        };
		
		this.localVideo = localVideo;
		this.remoteVideo = remoteVideo;

		this.regListener = new CubeSipRegistrationListener(engine);
		this.callListener = new CubeSipCallListener(engine);
	},

	stop: function() {
		if (null != this.stack) {
			this.stack.stop();
			this.stack = null;
		}

		this.session = null;
	},

	registerWith: function(account, password, displayName) {
		var self = this;
		try {
			this.stack = new SIPml.Stack({
					realm: self.host,
					impi: account,
					impu: "sip:" + account + "@" + self.host,
					password: password,
					display_name: displayName,
					websocket_proxy_url: 'ws://' + self.host + ':5066',
					outbound_proxy_url: 'tcp://' + self.host + ':5060',
					ice_servers: [{urls:['stun:211.103.217.154:3478']}, {urls:['turn:211.103.217.154:3478'], username:'cube', credential:'cube887'}],
					//ice_servers: [{url:'stun:stun.voiparound.com'}],
					enable_rtcweb_breaker: true,
					events_listener: { events: '*', listener: function(e) { self.onSipStackEvent(e); } },
					enable_early_ims: true, 
					enable_media_stream_cache: true,
					bandwidth: null,
					video_size: null,
					sip_headers: [
						{ name: 'User-Agent', value: 'Cube Web Client' }	
					]
				});

			if (this.stack.start() == 0) {
				 // 注册成功
				 return true;
			}
			else {
				this.callListener.onCallFailed(this.session, CallErrorCode.SignalingStartError);
				return false;
			}
		}
		catch (e) {
			 console.log("reg error : " + e);
			 this.callListener.onCallFailed(this.session, CallErrorCode.SignalingStartError);
		}
	},

	unregister: function() {
		if (null != this.stack) {
			this.stack.stop();
			this.stack = null;
		}
	},

	invite: function(callee, videoEnabled) {
		// 呼叫
		var type = videoEnabled ? 'call-audiovideo' : 'call-audio';
		if (this.stack && !this.sessionCall && !tsk_string_is_null_or_empty(callee)) {
			this.sessionCall = this.stack.newSession(type, this.configCall);
			this.sessionCall.call(callee);

			// Callback
			this.callListener.onNewCall(CubeCallDirection.Outgoing, this.session, videoEnabled);

			return true;
		}

		return false;
	},

	answer: function(videoEnabled) {
		// TODO videoEnabled

		// 应答
		if (null != this.sessionCall) {
			this.sessionCall.accept(this.configCall);
			return true;
		}

		return false;
	},

	hangup: function() {
		// 挂断
		var self = this;
		if (null != this.sessionCall) {
			this.sessionCall.hangup({events_listener: { events: '*', listener: function(e) { self.onSipSessionEvent(e); } }});
			return true;
		}

		return false;
	},

	setListener: function(regListener, callListener) {
		this.regListener = regListener;
		this.callListener = callListener;
	},

	onSipStackEvent: function(e) {
		var self = this;
		tsk_utils_log_info('* stack event : ' + e.type);

		switch (e.type) {
			case 'started':
			{
				try {
					self.sessionRegister = self.stack.newSession('register', {
						expires: 610,
						events_listener: { events: '*', listener: function(e) { self.onSipRegisterEvent(e); } }
					});
					// 执行注册
					self.sessionRegister.register();
				} catch (e) {
					console.log("reg started error : " + e);
				}
				break;
			}
			case 'stopping':
			{
				break;
			}
			case 'stopped': 
			{
				// 离线状态
				self.regListener.onRegistrationCleared(self.session);

				self.stack = null;
				self.sessionRegister = null;
				self.sessionCall = null;
				break;
			}
			case 'failed_to_start':
			case 'failed_to_stop':	
			{
				self.stack = null;
				self.sessionRegister = null;
				self.sessionCall = null;

				//onCubeRegError(e.description);
				break;
			}

			case 'i_new_call':
			{
				if (null != self.sessionCall) {
					// do not accept the incoming call if we're already 'in call'
					// comment this line for multi-line support
					e.newSession.hangup();
				}
				else {
					self.sessionCall = e.newSession;
					self.sessionCall.setConfiguration(self.configCall);
					var remoteNumber = (self.sessionCall.getRemoteFriendlyName() || 'unknown');

					self.session.setCallPeer(new CubePeer(remoteNumber));
					// Callback
					self.callListener.onNewCall(CubeCallDirection.Incoming, self.session, true);
				}
				break;
			}

			case 'm_permission_requested':
			{
				break;
			}
			case 'm_permission_accepted':
			case 'm_permission_refused':
			{
				if (e.type == 'm_permission_refused') {
					self.sessionCall = null;
					self.callListener.onCallFailed(self.session, CubeCallErrorCode.CameraOpenFailed);
					//onCubeCallTerminated('Media stream permission denied');
				}
				break;
			}
			case 'i_new_message':
			{
				break;
			}
			case 'starting':
			{
				break;
			}
			default:
				break;
		}
	},

	onSipRegisterEvent: function(e) {
		var self = this;
		tsk_utils_log_info('* register session event: ' + e.type);

		switch (e.type) {
			case 'connecting':
			{
				self.regListener.onRegistrationProgress(self.session);
				break;
			}
			case 'connected':
			{
				self.regListener.onRegistrationOk(self.session);
				break;
			}
			case 'terminated':
			{
				self.sessionCall = null;
				self.sessionRegister = null;

				if (self.session.regState == CubeRegistrationState.Cleared) {
					self.regListener.onRegistrationCleared(self.session);
				}
				else {
					self.regListener.onRegistrationFailed(self.session);
				}
				break;
			}
			default:
				break;
		}
	},

	onSipSessionEvent: function(e) {
		var self = this;
		tsk_utils_log_info('* session event: ' + e.type);

		switch (e.type) {
			case 'connecting':
			{
				if (self.session.regState == CubeRegistrationState.Ok) {
					self.callListener.onInProgress(self.session);
				}
				break;
			}
			case 'connected':
			{
				if (e.session == self.sessionCall) {
					self.callListener.onCallConnected(self.session);
				}
				break;
			}
			case 'terminating':
			case 'terminated':
			{
				if (e.session == self.sessionRegister) {
					self.sessionCall = null;
					self.sessionRegister = null;
				}
				else if (e.session == self.sessionCall) {
					self.sessionCall = null;
					self.callListener.onCallEnded(self.session);
				} 
				break;
			}
			case 'm_stream_video_local_added':
			{
				if (e.session == self.sessionCall) {
				}
				break;
			}
			case 'm_stream_video_local_removed':
			{
				if (e.session == self.sessionCall) {
				}
				break;
			}
			case 'm_stream_video_remote_added':
			{
				if (e.session == self.sessionCall) {
				}
				break;
			}
			case 'm_stream_video_remote_removed':
			{
				if (e.session == self.sessionCall) {
				}
				break;
			}
			case 'm_stream_audio_local_added':
			case 'm_stream_audio_local_removed':
			case 'm_stream_audio_remote_added':
			case 'm_stream_audio_remote_removed':
			{
				break;
			}
			case 'i_ect_new_call':
			{                   
				break;
			}
			case 'i_ao_request':
			{
				if (e.session == self.sessionCall) {
					var sipResponseCode = e.getSipResponseCode();
					if (sipResponseCode == 180 || sipResponseCode == 183) {
						self.callListener.onCallRinging(self.session);
					}
				}
				break;
			}
			case 'm_early_media':
			{
				if(e.session == self.sessionCall) {                    
				}
				break;
			}
			case 'm_local_hold_ok':
			{
				break;
			}
			case 'm_local_hold_nok':
			{
				break;
			}
			case 'm_local_resume_ok':
			{
				break;
			}
			case 'm_local_resume_nok':
			{
				break;
			}
			case 'm_remote_hold':
			{
				break;
			}
			case 'm_remote_resume':
			{
				break;
			}			
			case 'o_ect_trying':
			{
				break;
			}
			case 'o_ect_accepted':
			{
				break;
			}
			case 'o_ect_completed':
			case 'i_ect_completed':
			{
				break;
			}
			case 'o_ect_failed':
			case 'i_ect_failed':
			{
				break;
			}
			case 'o_ect_notify':
			case 'i_ect_notify':
			{
				break;
			}
			case 'i_ect_requested':
			{
				break;
			}
			default:
				break;
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

		if (null != this.engine.regListener) {
			this.engine.regListener.onRegistrationProgress(session);
		}
	},

	onRegistrationOk: function(session) {
		Logger.d('SipRegistrationListener', 'onRegistrationOk');

		session.regState = CubeRegistrationState.Ok;

		if (null != this.engine.regListener) {
			this.engine.regListener.onRegistrationOk(session);
		}
	},

	onRegistrationCleared: function(session) {
		Logger.d('SipRegistrationListener', 'onRegistrationCleared');

		session.regState = CubeRegistrationState.Cleared;

		if (null != this.engine.regListener) {
			this.engine.regListener.onRegistrationCleared(session);
		}
		session.regState = CubeRegistrationState.None;
	},

	onRegistrationFailed: function(session) {
		Logger.d('SipRegistrationListener', 'onRegistrationFailed');

		session.regState = CubeRegistrationState.Failed;

		if (null != this.engine.regListener) {
			this.engine.regListener.onRegistrationFailed(session);
		}
	}
});
