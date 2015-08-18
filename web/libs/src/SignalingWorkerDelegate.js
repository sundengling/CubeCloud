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
