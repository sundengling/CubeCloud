/*
 * CallErrorCode.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeCallErrorCode = {
	BadRequest: 400,					//!< 请求无效。
	Unauthorized: 401,					//!< 未授权请求。
	PaymentRequired: 402,
	Forbidden: 403,						//!< 服务器无法识别请求。
	NotFound: 404,						//!< 服务器没有找到对应的请求 URI 。
	MethodNotAllowed: 405,				//!< 请求指定的方法服务器不允许执行。
	ProxyAuthenticationRequired: 407,	//!< 代理需要授权。
	RequestTimeout: 408,				//!< 客户端的请求超时。
	UnsupportedMediaType: 415,			//!< 不支持的媒体类型。
	RequestSendFailed: 477,				//!< 请求数据发送失败。
	TemporarilyUnavailable: 480,
	BusyHere: 486,
	RequestTerminated: 487,				//!< 对方未接听。
	ServerInternalError: 500,
	BusyEverywhere: 600,				//!< 对方忙
	Declined: 603,						//!< 拒绝请求。

	ConnectionFailed: 700,				//!< 连接失败。
	SignalingStartError: 701,			//!< 信令启动错误。
	TransportError: 702,				//!< 信令链路传输数据错误。
	ICEConnectionFailed: 703,			//!< ICE 连接失败。
	CreateSessionDescriptionFailed: 705,		//!< 创建 SDP 失败。
	SetSessionDescriptionFailed: 706,			//!< 设置 SDP 失败。
	RTCInitializeFailed: 707,			//!< RTC 初始化失败。
	DuplicationException: 801,			//!< 正在呼叫时，新呼叫进入。
	WorkerStateException: 802,			//!< 工作机状态异常。
	CallTimeout: 804,					//!< 呼叫超时。
	NetworkNotReachable: 809,			//!< 网络不可达。

	CameraOpenFailed: 901,				//!< 摄像头开启失败。
	Unknown: 0							//!< 未知的错误发生。
};
