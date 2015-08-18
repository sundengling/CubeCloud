/*
 * CallListener.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeCallDirection = {
	// 呼出
	Outgoing: "outgoing",
	// 呼入
	Incoming: "incoming"
};

var CubeCallListener = Class({
	ctor: function() {},

	onNewCall: function(direction, session, video) {},

	onInProgress: function(session) {},

	onCallRinging: function(session) {},

	onCallConnected: function(session) {},

	onCallEnded: function(session) {},

	onCallFailed: function(session, errorCode) {}
});
