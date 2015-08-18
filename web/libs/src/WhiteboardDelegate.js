/*
 * WhiteboardDelegate.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/6/4.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeWhiteboardDelegate = Class({
	engine: null,

	ctor: function(engine) {
		this.engine = engine;
	},

	didShared: function(wb, list) {
		if (null != this.engine.wbListener) {
			this.engine.wbListener.onShared(wb, list);
		}
	},

	didFileShared: function(wb, file) {
		if (null != this.engine.wbListener) {
			this.engine.wbListener.onFileShared(wb, file);
		}
	},

	didSlide: function(wb, slide) {
		if (null != this.engine.wbListener) {
			this.engine.wbListener.onSlide(wb, slide);
		}
	},

	didFailed: function(wb, errorCode) {
		if (null != this.engine.wbListener) {
			this.engine.wbListener.onFailed(wb, errorCode);
		}
	}
});
