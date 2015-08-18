/*
 * MessageWorkerDelegate.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/10.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeMessageWorkerDelegate = Class({
	engine: null,

	ctor: function(engine) {
		this.engine = engine;
	},

	didMessageSend: function(message) {
		if (null != this.engine.messageListener) {
			this.engine.messageListener.onSent(this.engine.session, message);
		}
	},

	didMessageReceive: function(message) {
		if (null != this.engine.messageListener) {
			this.engine.messageListener.onReceived(this.engine.session, message);
		}
	},

	didMessageFailed: function(errorCode, message) {
		if (null != this.engine.messageListener) {
			this.engine.messageListener.onMessageFailed(this.engine.session, errorCode, message);
		}
	}
});
