/*
 * RegistrationListener.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeRegistrationState = {
	None: 'None',
	Progress: 'Progress',
	Ok: 'Ok',
	Cleared: 'Cleared',
	Failed: 'Failed'
};

/**
 * 注册状态监听器。
 * 通过注册状态监听器来监听引擎注册状态的变化。
 *
 * @interface CubeRegistrationListener
 */
var CubeRegistrationListener = Class({
	ctor: function() {},

	/**
	 * 当注册流程正在处理时此方法被回调。
	 *
	 * @param {CubeSession} session 本次注册流程的会话对象实例。
	 * @instance
	 * @memberof CubeRegistrationListener
	 */
	onRegistrationProgress: function(session) {},

	
	onRegistrationOk: function(session) {},

	onRegistrationCleared: function(session) {},

	onRegistrationFailed: function(session) {}
});
