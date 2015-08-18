/*
 * Session.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubePeer = Class({
	name: null,
	displayName: null,

	ctor: function(name) {
		this.name = name;
	},

	getName: function() {
		return this.name;
	},

	getDisplayName: function() {
		return this.displayName;
	}
});

var CubeSession = Class({
	name: null,
	displayName: null,
	regState: CubeRegistrationState.None,

	callPeer: null,
	callDirection: null,
	callState: 0,

	ctor: function() {
		this.regState = CubeRegistrationState.None;
	},

	getName: function() {
		return this.name;
	},

	getDisplayName: function() {
		return this.displayName;
	},

	hasRegistered: function() {
		return (this.regState == CubeRegistrationState.Ok);
	},

	getRegState: function() {
		return this.regState;
	},

	setCallPeer: function(peer) {
		this.callPeer = peer;
	},
	getCallPeer: function() {
		return this.callPeer;
	},

	getCallDirection: function() {
		return this.callDirection;
	},

	isCalling: function() {
		return (this.callState == CubeSignalingState.Invite || this.callState == CubeSignalingState.Incall);
	},

	getLatency: function() {
		var sv = -1;
		if (nucleus.talkService.isCalled(_S_CELLET)) {
			sv = nucleus.talkService.getPingPongTime(_S_CELLET);
		}

		var mv = -1;
		if (nucleus.talkService.isCalled(_M_CELLET)) {
			mv = nucleus.talkService.getPingPongTime(_M_CELLET);
		}

		var wv = -1;
		if (nucleus.talkService.isCalled(_WB_CELLET)) {
			wv = nucleus.talkService.getPingPongTime(_WB_CELLET);
		}

		//Math.max(Math.max(sv, mv), wv);
		var c = 0;
		var sum = 0;
		if (sv > 0) { sum += sv; ++c; }
		if (mv > 0) { sum += mv; ++c; }
		if (wv > 0) { sum += wv; ++c; }
		return (c > 0) ? parseInt(Math.round(sum / c)) : -1;
	}
});
