/*
 * MessageListener.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeMessageErrorCode = {
	ContentTooLong: 300
};

var CubeMessageListener = Class({
	ctor: function() {},

	onSent: function(session, message) {},

	onReceived: function(session, message) {},

	onMessageFailed: function(session, errorCode, message) {}
});
