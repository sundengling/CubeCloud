/*
 * Utils.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

;(function(global) {
	// 归一 indexedDB
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	var ua = navigator.userAgent.toLowerCase();

	var isIPad = ua.match(/ipad/i) == "ipad";
	var isIPhoneOs = ua.match(/iphone os/i) == "iphone os";
	var isMidp = ua.match(/midp/i) == "midp";
	var isUc7 = ua.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	var isUc = ua.match(/ucweb/i) == "ucweb";
	var isAndroid = ua.match(/android/i) == "android";
	var isCE = ua.match(/windows ce/i) == "windows ce";
	var isWM = ua.match(/windows mobile/i) == "windows mobile";

	var isStrict = document.compatMode == "CSS1Compat";	// 是否定义DOCUMENT类型
	var isOpera = ua.indexOf("opera") > -1;				// Opera
	var isChrome = ua.indexOf("chrome") > -1;			// Chrome
	var isFirefox = ua.indexOf("firefox") > -1;			// Firefox
	var isSafari = !isChrome && (/webkit|khtml/).test(ua);		// Safari
	var isSafari3 = isSafari && ua.indexOf("webkit/5") != -1;	// Safari3
	var isIE = ("ActiveXObject" in window);			// IE
	var isIE6 = isIE && !window.XMLHttpRequest;		// IE6
	var isIE7 = isIE && window.XMLHttpRequest && !document.documentMode;	// IE7
	var isIE8 = isIE && !-[1,] && document.documentMode;	// IE8
	var isIE9 = (navigator.appName == "Microsoft Internet Explorer") && navigator.appVersion.match(/9./i)=="9.";	// IE9
	var isIE10 = isIE && (/10\.0/).test(ua);	// IE10
	var isIE11 = isIE && ua.indexOf("rv:11.0") > -1;	// IE11
	var isGecko = !isSafari && !isChrome && ua.indexOf("gecko") > -1;	// Gecko 内核
	var isGecko3 = isGecko && ua.indexOf("rv:1.9") > -1;	// Gecko3 内核
	var isBorderBox = isIE && !isStrict; // 使用盒模型
	var isWindows = (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1);		// 是 Windows 系统
	var isMac = (ua.indexOf("macintosh") != -1 || ua.indexOf("mac os x") != -1);	// 是 MacOS 系统
	var isAir = (ua.indexOf("adobeair") != -1);	// 是用 Adobe Air 浏览
	var isLinux = (ua.indexOf("linux") != -1);	// 是 Linux 系统
	var isSecure = window.location.href.toLowerCase().indexOf("https") === 0;  // 是SSL浏览

	var regularEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

	global.utils = {
		isIPad: isIPad
		, isIPhone: isIPhoneOs
		, isAndroid : isAndroid
		, isPhone: (isIPhoneOs || isAndroid)
		, isDesktop: (!isIPhoneOs && !isAndroid && !isIPad)
		, isWindows: isWindows
		, isMac: isMac
		, isLinux: isLinux

		, isChrome: isChrome
		, isFirefox: isFirefox
		, isIE: isIE
		, isIE9: isIE9
		, isIE11: isIE11
		, isSafari: isSafari

		// 向上检索 DOM 节点指定的 Class
		, retrievalDomClass: function(node, className) {
			var cstring = null;
			try {
				cstring = node.getAttribute('class');
			} catch (e) {
				return null;
			}

			if (cstring != null && cstring.indexOf(className) >= 0) {
				return node;
			}

			var pn = node.parentNode;
			if (pn != null && pn !== undefined) {
				// 递归
				return global.utils.retrievalDomClass(pn, className);
			}
			else {
				return null;
			}
		}

		, formatDuration: function(time) {
			var s = time / 1000.0;
			var ns = parseInt(s);
			if (ns < 60) {
				return "00:" + ((ns < 10) ? "0" + ns : ns);
			}

			var m = s / 60.0;
			var nm = parseInt(Math.floor(m));
			var ss = parseInt(ns % 60);
			return ((nm < 10) ? "0" + nm : nm) + ":" + ((ss < 10) ? "0" + ss : ss);
		}

		, getUrlParams: function() {
			var vars = [], hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for (var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			return vars;
		}

		, getUrlParam: function(name) {
			var ret = this.getUrlParams()[name];
			return (undefined === ret) ? null : ret;
		}

		, getCookieVal: function(offset) {
			var endstr = document.cookie.indexOf(";", offset);
			if (endstr == -1) {
				endstr = document.cookie.length;
			}
			return unescape(document.cookie.substring(offset, endstr));
		}

		// get cookie value
		, getCookie: function(name) {
			var arg = name + "=";
			var alen = arg.length;
			var clen = document.cookie.length;
			var i = 0;
			while (i < clen) {
				var j = i + alen;
				if (document.cookie.substring(i, j) == arg) {
					return this.getCookieVal(j);
				}
		
				i = document.cookie.indexOf(" ", i) + 1;
		
				if (i == 0)
					break;
			}
			return null;
		}

		// store cookie value with optional details as needed
		, setCookie: function(name, value, expires, path, domain, secure) {
			document.cookie = name + "=" + escape(value) +
				((expires) ? "; expires=" + expires : "") +
				((path) ? "; path=" + path : "") +
				((domain) ? "; domain=" + domain : "") +
				((secure) ? "; secure" : "");
		}

		// remove the cookie by setting ancient expiration date
		, deleteCookie: function(name, path, domain) {
			if (this.getCookie(name)) {
				document.cookie = name + "=" +
					((path) ? "; path=" + path : "") +
					((domain) ? "; domain=" + domain : "") +
					"; expires=Thu, 01-Jan-1970 00:00:01 GMT";
			}
		}

		, getDrawPosition: function(dom, event) {
			var pos = (event.touches === undefined) ? this.getMousePos(event) : this.getTouchPos(event);
			var dx = this.getX(dom);
			var dy = this.getY(dom);
			return {x: pos.x - dx, y: pos.y - dy};
		}

		, getMousePos: function(event) {
			var e = event || window.event;
			var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			var x = e.pageX || e.clientX + scrollX;
			var y = e.pageY || e.clientY + scrollY;
			return { 'x': x, 'y': y };
		}

		, getTouchPos: function(event) {
			var e = event || window.event;
			var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			var x = e.touches[0].pageX || e.clientX + scrollX;
			var y = e.touches[0].pageY || e.clientY + scrollY;
			return { 'x': x, 'y': y };
		}

		, getX: function(obj) {
			var left = obj.offsetLeft;
			var parObj = obj;
			while ((parObj = parObj.offsetParent) != null) {
				left += parObj.offsetLeft;
			}
			return left;
		}

		, getY: function(obj) {
			var top = obj.offsetTop;
			var parObj = obj;
			while ((parObj = parObj.offsetParent) != null) {
				top += parObj.offsetTop;
			}
			return top;
		}

		, unselectable: function(node) {
			node.setAttribute("unselectable", "on");
			node.className = "unselectable";
			node.onmousedown = function() {return false;}
			var s = node.style;
			s.userSelect = "none";
			s.webkitUserSelect = "none";
			s.MozUserSelect = "-moz-none";
		}

		, verifyEmail: function(email) {
			return (regularEmail.test(email));
		}

		, measureBandwidth: function(fast, result, error, host) {
			var downloadSize = fast ? 1054738 : 10561396;
			var startTime = 0;
			var endTime = 0;
			var bandwidth = 0;

			var img = new Image();
			img.onload = function() {
				endTime = Date.now();

				var duration = (endTime - startTime) / 1000;
				var bitsLoaded = downloadSize * 8;
				var bwbps = (bitsLoaded / duration).toFixed(2);
				var bwKbps = (bwbps / 1024).toFixed(2);
				var bwMbps = (bwKbps / 1024).toFixed(2);

				result.call(null, bwbps, bwKbps, bwMbps);
			}

			img.onerror = function(err, msg) {
				error.call(null, err);
			}

			startTime = Date.now();
			var cacheBuster = "?t=" + startTime;

			var src = "assets/bandwidth/" + (fast ? "bandwidth-1m.jpg" : "bandwidth-10m.jpg") + cacheBuster;
			if (host !== undefined) {
				src = "http://" + host + "/" + src;
			}

			img.src = src;
		}

		, requestGet: function(url, success, error) {
			var request = new XMLHttpRequest();
			request.onreadystatechange = function () {
				if (request.readyState == 4) {
					if (request.status == 200) {
						success.call(null, JSON.parse(request.responseText));
					}
					else {
						error.call(null, request.status);
					}
				}
			};
			request.open("GET", url);
			request.send(null);
		}
	};
})(window);

// 封装 window.localStorage
;(function(window){
	// 准备模拟对象、空函数等
	var LS, noop = function(){}, document = window.document, notSupport = {set:noop,get:noop,remove:noop,clear:noop,each:noop,obj:noop,length:0};

	// 优先探测userData是否支持，如果支持，则直接使用userData，而不使用localStorage
	// 以防止IE浏览器关闭localStorage功能或提高安全级别(*_* 万恶的IE)
	// 万恶的IE9(9.0.11）)，使用userData也会出现类似seesion一样的效果，刷新页面后设置的东西就没有了...
	// 只好优先探测本地存储，不能用再尝试使用userData
	(function() {
		// 先探测本地存储
		// 防止IE10早期版本安全设置有问题导致的脚本访问权限错误
		if ("localStorage" in window) {
			try {
				LS = window.localStorage;
				return;
			} catch(e) {
				//如果报错，说明浏览器已经关闭了本地存储或者提高了安全级别
				//则尝试使用userData
			}
		}

		//继续探测userData
		var o = document.getElementsByTagName("head")[0], hostKey = window.location.hostname || "localStorage", d = new Date(), doc, agent;
		
		// typeof o.addBehavior 在IE6下是object，在IE10下是function，因此这里直接用!判断
		// 如果不支持userData则跳出使用原生localStorage，如果原生localStorage报错，则放弃本地存储
		if (!o.addBehavior) {
			try {
				LS = window.localStorage;
			} catch(e) {
				LS = null;
			}
			return;
		}
		
		try {
			// 尝试创建iframe代理，以解决跨目录存储的问题
			agent = new ActiveXObject('htmlfile');
			agent.open();
			agent.write('<s' + 'cript>document.w=window;</s' + 'cript><iframe src="/favicon.ico"></iframe>');
			agent.close();
			doc = agent.w.frames[0].document;
			// 这里通过代理document创建head，可以使存储数据垮文件夹访问
			o = doc.createElement('head');
			doc.appendChild(o);
		} catch(e) {
			// 不处理跨路径问题，直接使用当前页面元素处理
			// 不能跨路径存储，也能满足多数的本地存储需求
			o = document.getElementsByTagName("head")[0];
		}

		// 初始化userData
		try {
			d.setDate(d.getDate() + 36500);
			o.addBehavior("#default#userData");
			o.expires = d.toUTCString();
			o.load(hostKey);
			o.save(hostKey);
		} catch(e) {
			// 防止部分外壳浏览器的bug出现导致后续js无法运行
			// 如果有错，放弃本地存储
			return;
		}
		// 开始处理userData
		// 以下代码感谢瑞星的刘瑞明友情支持，做了大量的兼容测试和修改
		// 并处理了userData设置的key不能以数字开头的问题
		var root, attrs;
		try{
			root = o.XMLDocument.documentElement;
			attrs = root.attributes;
		} catch(e) {
			//防止部分外壳浏览器的bug出现导致后续js无法运行
			//如果有错，放弃本地存储
			return;
		}
		var prefix = "p__hack_", spfix = "m-_-c",
			reg1 = new RegExp("^"+prefix),
			reg2 = new RegExp(spfix,"g"),
			encode = function(key){ return encodeURIComponent(prefix + key).replace(/%/g, spfix); },
			decode = function(key){ return decodeURIComponent(key.replace(reg2, "%")).replace(reg1,""); };

		// 创建模拟对象
		LS = {
			length: attrs.length,
			isVirtualObject: true,
			getItem: function(key) {
				// IE9中 通过o.getAttribute(name);取不到值，所以才用了下面比较复杂的方法。
				return (attrs.getNamedItem( encode(key) ) || {nodeValue: null}).nodeValue||root.getAttribute(encode(key)); 
			},
			setItem: function(key, value) {
				//IE9中无法通过 o.setAttribute(name, value); 设置#userData值，而用下面的方法却可以。
				try {
					root.setAttribute( encode(key), value);
					o.save(hostKey);
					this.length = attrs.length;
				} catch(e) {
					// 这里IE9经常报没权限错误,但是不影响数据存储
				}
			},
			removeItem: function(key) {
				//IE9中无法通过 o.removeAttribute(name); 删除#userData值，而用下面的方法却可以。
				try {
					root.removeAttribute( encode(key) );
					o.save(hostKey);
					this.length = attrs.length;
				} catch(e) {
					// 这里IE9经常报没权限错误,但是不影响数据存储
				}
			},
			clear: function() {
				while (attrs.length) {
					this.removeItem( attrs[0].nodeName );
				}
				this.length = 0;
			},
			key: function(i) {
				return attrs[i] ? decode(attrs[i].nodeName) : undefined;
			}
		};

		// 提供模拟的"localStorage"接口
		if (!("localStorage" in window))
			window.localStorage = LS;
	})();

	// 二次包装接口
	window.LS = !LS ? notSupport : {
		set: function(key, value) {
			// fixed iPhone/iPad 'QUOTA_EXCEEDED_ERR' bug
			if (this.get(key) !== undefined)
				this.remove(key);
			LS.setItem(key, value);
			this.length = LS.length;
		},
		// 查询不存在的key时，有的浏览器返回null，这里统一返回undefined
		get: function(key) {
			var v = LS.getItem(key);
			return v === null ? undefined : v;
		},
		remove: function(key) { LS.removeItem(key);this.length = LS.length; },
		clear: function() { LS.clear();this.length = 0; },
		// 本地存储数据遍历，callback接受两个参数 key 和 value，如果返回false则终止遍历
		each: function(callback) {
			var list = this.obj(), fn = callback || function(){}, key;
			for (key in list)
				if (fn.call(this, key, this.get(key)) === false)
					break;
		},
		// 返回一个对象描述的localStorage副本
		obj: function() {
			var list={}, i=0, n, key;
			if (LS.isVirtualObject) {
				list = LS.key(-1);
			}
			else {
				n = LS.length;
				for (; i<n; i++) {
					key = LS.key(i);
					list[key] = this.get(key);
				}
			}
			return list;
		},
		length : LS.length
	};
	// 如果有jQuery，则同样扩展到jQuery
	if (window.jQuery) window.jQuery.LS = window.LS;
})(window);
/*
 * CubeConst.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeConst = {
	ActionLogin: "login",
	ActionLoginAck: "login-ack",
	ActionLogout: "logout",
	ActionLogoutAck: "logout-ack",
	ActionQuery: "query",
	ActionQueryAck: "query-ack",

	ActionPush: "push",
	ActionPull: "pull",
	ActionPullAck: "pull-ack",
	ActionNotify: "notify",
	ActionHistory: "history",
	ActionHistoryAck: "history-ack",

	ActionInvite: "invite",
	ActionInviteAck: "invite-ack",
	ActionAnswer: "answer",
	ActionAnswerAck: "answer-ack",
	ActionCancel: "cancel",
	ActionCancelAck: "cancel-ack",
	ActionBye: "bye",
	ActionByeAck: "bye-ack",
	ActionCandidate: "candidate",
	ActionCandidateAck: "candidate-ack",
	ActionConsult: "consult",
	ActionConsultAck: "consult-ack",
	ActionConference: "conference",
	ActionConferenceAck: "conference-ack",

	ActionShare: "share",
	ActionRevoke: "revoke",
	ActionShareAck: "share-ack",
	ActionVGCmd: "vg-cmd",
	ActionVGCmdAck: "vg-cmd-ack",

	Unknown: ""
};
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
/*
 * MediaController.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/28.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

/**
 * 媒体层探针接口。
 * 媒体层探针用于实时监测媒体设备的工作状态。
 *
 * @interface CubeMediaProbe
 * @see {@link CubeMediaController#addMediaProbe|CubeMediaController}
 */
var CubeMediaProbe = Class({
	ctor: function() {
	},

	/**
	 * 当本地视频数据就绪时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onLocalVideoReady: function(mediaController) {},

	/**
	 * 当远端视频数据就绪时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onRemoteVideoReady: function(mediaController) {},

	/**
	 * 当本地视频帧率数据刷新时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} videoWidth 视频画面宽度。
	 * @param {Number} videoHeight 视频画面高度。
	 * @param {Number} curFPS 视频当前帧率。
	 * @param {Number} avgFPS 视频平均帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onLocalVideoFPS: function(mediaController, videoWidth, videoHeight, curFPS, avgFPS) {},

	/**
	 * 当远端视频帧率数据刷新时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} videoWidth 视频画面宽度。
	 * @param {Number} videoHeight 视频画面高度。
	 * @param {Number} curFPS 视频当前帧率。
	 * @param {Number} avgFPS 视频平均帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onRemoteVideoFPS: function(mediaController, videoWidth, videoHeight, curFPS, avgFPS) {},

	/**
	 * 当探针检测到帧率明显降低时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} curFps 当前实时帧率。
	 * @param {Number} avgFps 平均帧率。
	 * @param {Number} maxFps 监测周期内的最大帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onFrameRateWarning: function(mediaController, curFps, avgFps, maxFps) {},

	/**
	 * 当探针检测到帧率恢复时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} curFps 当前实时帧率。
	 * @param {Number} avgFps 平均帧率。
	 * @param {Number} maxFps 监测周期内的最大帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onFrameRateRecovering: function(mediaController, curFps, avgFps, maxFps) {}
});

/**
 * 媒体控制器。用于操作媒体设备。
 *
 * @class CubeMediaController
 * @see {@link CubeEngine#getMediaController|CubeEngine}
 */
var CubeMediaController = Class({
	worker: null,
	timerList: [],

	probes: null,
	frameWarning: false,

	remoteMaxFrameRate: -1,
	remoteMinFrameRate: 120,

	// 离线录制器
	recorderMap: null,

	ctor: function(worker) {
		this.worker = worker;

		var self = this;
		worker.videoCloseHandler = function() {
			Logger.d("CubeMediaController", "Video closed");

			for (var i = 0; i < self.timerList.length; ++i) {
				var timer = self.timerList[i];
				clearInterval(timer);
			}

			self.timerList.splice(0, self.timerList.length);

			if (null != self.probes && self.frameWarning) {
				for (var i = 0; i < self.probes.length; ++i) {
					var p = self.probes[i];
					p.onFrameRateRecovering(self, 0, 0, self.remoteMaxFrameRate);
				}
			}

			self.remoteMaxFrameRate = -1;
			self.remoteMinFrameRate = 120;
			self.frameWarning = false;

			if (self.isLocalRecording()) {
				self.stopLocalRecording(null);
			}
		};

		worker.localVideoReady = function(video) {
			self._localVideoReady(video);
		};
		worker.remoteVideoReady = function(video) {
			video.volume = 1;
			self._remoteVideoReady(video);
		};
	},

	/**
	 * 添加媒体探针。
	 *
	 * @param {CubeMediaProbe} probe 指定待添加的媒体探针实例。
	 * @see CubeMediaProbe
	 * @instance
	 * @memberof CubeMediaController
	 */
	addMediaProbe: function(probe) {
		if (null == this.probes) {
			this.probes = [probe];
		}
		else {
			this.probes.push(probe);
		}
	},

	/**
	 * 删除媒体探针。
	 *
	 * @param {CubeMediaProbe} probe 指定待删除的媒体探针实例。
	 * @see CubeMediaProbe
	 * @instance
	 * @memberof CubeMediaController
	 */
	removeMediaProbe: function(probe) {
		if (null == this.probes) {
			return false;
		}

		var index = this.probes.indexOf(probe);
		if (index >= 0) {
			this.probes.splice(index, 1);
			return true;
		}

		return false;
	},

	getLocalVideoSize: function() {
		var v = this.worker.localVideo;
		var w = v.videoWidth;
		var h = v.videoHeight;
		return { width: w, height: h };
	},

	getRemoteVideoSize: function() {
		var v = this.worker.remoteVideo;
		var w = v.videoWidth;
		var h = v.videoHeight;
		return { width: w, height: h };
	},

	_localVideoReady: function(video) {
		if (null != this.probes) {
			for (var i = 0; i < this.probes.length; ++i) {
				var p = this.probes[i];
				p.onLocalVideoReady(this);
			}

			var self = this;
			this._calculateStats(video, function(v, fps, avg) {
				for (var i = 0; i < self.probes.length; ++i) {
					var p = self.probes[i];
					p.onLocalVideoFPS(self, v.videoWidth, v.videoHeight, fps, avg);
				}
			});
		}
	},

	_remoteVideoReady: function(video) {
		if (null != this.probes) {
			for (var i = 0; i < this.probes.length; ++i) {
				var p = this.probes[i];
				p.onRemoteVideoReady(this);
			}

			var self = this;
			this._calculateStats(video, function(v, fps, avg) {
				for (var i = 0; i < self.probes.length; ++i) {
					var p = self.probes[i];
					p.onRemoteVideoFPS(self, v.videoWidth, v.videoHeight, fps, avg);
				}

				// 探测远端视频帧率过低
				if (self.remoteMaxFrameRate < fps) {
					self.remoteMaxFrameRate = fps;
				}
				if (self.remoteMinFrameRate > fps) {
					self.remoteMinFrameRate = fps;
				}

				if (fps <= self.remoteMaxFrameRate * 0.5
					&& fps <= avg * 0.6) {
					self.frameWarning = true;

					for (var i = 0; i < self.probes.length; ++i) {
						var p = self.probes[i];
						p.onFrameRateWarning(self, fps, avg, self.remoteMaxFrameRate);
					}
				}
				else {
					if (self.frameWarning) {
						for (var i = 0; i < self.probes.length; ++i) {
							var p = self.probes[i];
							p.onFrameRateRecovering(self, fps, avg, self.remoteMaxFrameRate);
						}

						self.frameWarning = false;

						if (fps >= 6) {
							// 复位最大帧率
							self.remoteMaxFrameRate = -1;
						}
					}
				}
			});
		}
	},

	_calculateStats: function(video, callback) {
		var now = new Date().getTime();
		var decodedFrames = 0,
			droppedFrames = 0,
			startTime = now,
			initialTime = now;
		var timer = 0;

		timer = window.setInterval(function() {
			// see if webkit stats are available; exit if they aren't
			if (video.webkitDecodedFrameCount === undefined) {
				if (video.mozPaintedFrames === undefined) {
					console.log("Video FPS calcs not supported");
					clearInterval(timer);
					return;
				}
			}

			// get the stats
			var currentTime = new Date().getTime();
			var deltaTime = (currentTime - startTime) / 1000;
			var totalTime = (currentTime - initialTime) / 1000;
			startTime = currentTime;

			var currentDecodedFPS = 0;
			var decodedFPSAvg = 0;

			// Calculate decoded frames per sec.
			if (video.mozPaintedFrames !== undefined) {
				//console.log(video.mozDecodedFrames + ',' + video.mozParsedFrames + ',' + video.mozPresentedFrames + ',' + video.mozPaintedFrames);
				currentDecodedFPS  = (video.mozPaintedFrames - decodedFrames) / deltaTime;
				decodedFPSAvg = video.mozPaintedFrames / totalTime;
				decodedFrames = video.mozPaintedFrames;
			}
			else {
				currentDecodedFPS  = (video.webkitDecodedFrameCount - decodedFrames) / deltaTime;
				decodedFPSAvg = video.webkitDecodedFrameCount / totalTime;
				decodedFrames = video.webkitDecodedFrameCount;
			}

			// Calculate dropped frames per sec.
			/*
			var currentDroppedFPS = (video.webkitDroppedFrameCount - droppedFrames) / deltaTime;
			var droppedFPSavg = video.webkitDroppedFrameCount / totalTime;
			droppedFrames = video.webkitDroppedFrameCount;
			*/

			if (currentDecodedFPS < 0 || currentDecodedFPS > 60) {
				currentDecodedFPS = 0;
			}

			callback.call(null, video, currentDecodedFPS.toFixed(), decodedFPSAvg.toFixed());

			if ((parseInt(video.width) == 0 && decodedFPSAvg == 0) || video.src == null) {
				clearInterval(timer);
			}
		}, 1000);

		this.timerList.push(timer);
	},

	/**
	 * 开启本地视频流。开启视频后对方将能看到本地摄像头采集到的视频影像。
	 *
	 * @returns {Boolean} 如果开启成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	openVideo: function() {
		if (null != this.worker.localStream && this.worker.localStream.getVideoTracks().length > 0) {
			this.worker.localStream.getVideoTracks()[0].enabled = true;

			// 进行媒体操作同步
			this.worker.consult("video", "open");

			return true;
		}

		return false;
	},

	/**
	 * 关闭本地视频流。关闭视频后对方将无法看到本地摄像头采集到的视频影像。
	 *
	 * @returns {Boolean} 如果关闭成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	closeVideo: function() {
		if (null != this.worker.localStream && this.worker.localStream.getVideoTracks().length > 0) {
			this.worker.localStream.getVideoTracks()[0].enabled = false;

			// 进行媒体操作同步
			this.worker.consult("video", "close");

			return true;
		}

		return false;
	},

	/**
	 * 本地视频数据是否可用。
	 *
	 * @returns {Boolean} 如果本地视频数据已开启返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	isVideoEnabled: function() {
		if (null != this.worker.localStream && this.worker.localStream.getVideoTracks().length > 0) {
			return this.worker.localStream.getVideoTracks()[0].enabled;
		}

		return true;
	},

	/**
	 * 开启本地语音流。开启语音流后对方将能听到本地麦克风采集的音频效果。
	 *
	 * @returns {Boolean} 如果开启成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	openVoice: function() {
		if (null != this.worker.localStream && this.worker.localStream.getAudioTracks().length > 0) {
			this.worker.localStream.getAudioTracks()[0].enabled = true;
			return true;
		}

		return false;
	},

	/**
	 * 关闭本地语音流。关闭语音流后对方将无法听到本地麦克风采集的音频效果。
	 *
	 * @returns {Boolean} 如果关闭成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	closeVoice: function() {
		if (null != this.worker.localStream && this.worker.localStream.getAudioTracks().length > 0) {
			this.worker.localStream.getAudioTracks()[0].enabled = false;
			return true;
		}

		return false;
	},

	/**
	 * 本地音频数据是否可用。
	 *
	 * @returns {Boolean} 如果本地音频数据已开启返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	isVoiceEnabled: function() {
		if (null != this.worker.localStream && this.worker.localStream.getAudioTracks().length > 0) {
			return this.worker.localStream.getAudioTracks()[0].enabled;
		}

		return true;
	},

	/**
	 * 设置远端音频音量大小。
	 *
	 * @param {Number} value 指定音量大小。取值范围 0 到 100，0 表示最小音量，100 表示最大音量。
	 * @instance
	 * @memberof CubeMediaController
	 */
	setVolume: function(value) {
		if (null != this.worker.remoteVideo) {
			this.worker.remoteVideo.volume = value / 100;
		}
	},

	/**
	 * 获取当前远端音频音量大小。
	 *
	 * @returns {Number} 返回当前音量大小。数值范围 0 到 100 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	getVolume: function() {
		return parseInt(Math.round(this.worker.remoteVideo.volume * 100));
	},

	/**
	 * 静音。
	 *
	 * @instance
	 * @memberof CubeMediaController
	 */
	mute: function() {
		this.closeVoice();
	},

	/**
	 * 查询归档记录。
	 *
	 * @param {String} name 指定待查询的用户名。
	 * @param {Function} success 指定查询数据后的回调函数。
	 * @param {Function} error 指定查询失败时的回调函数。
	 * @param {Boolean} cors 指定是否是跨域查询。
	 * @instance
	 * @memberof CubeMediaController
	 */
	queryRecordArchives: function(name, success, error, cors) {
		if ("undefined" !== cors && cors) {
			var sn = "p" + Date.now();
			window._cube_cross.addCallback(sn, success, error);

			var src = window._cube_cross.host + "/archive/list.js?name=" + name + "&m=window._cube_cross.queryRecordArchives&sn=" + sn;
			var dom = document.createElement("script");
			dom.setAttribute("id", sn);
			dom.setAttribute("name", name.toString());
			dom.setAttribute("src", src);
			dom.setAttribute("type", "text/javascript");
			dom.onerror = function() {
				if (undefined !== error) {
					error.call(null, name);
				}
				document.body.removeChild(dom);
			}
			document.body.appendChild(dom);
			return;
		}

		utils.requestGet("archive/list?name=" + name, function(data) {
			success.call(null, name, data);
		}, function(status) {
			if (undefined !== error) {
				error.call(null, name);
			}
		});
	},

	loadArchive: function(name, file, videoEl, cors) {
		var video = videoEl;
		if (typeof videoEl === 'string') {
			video = document.getElementById(videoEl);
		}

		if ('undefined' !== cors && cors) {
			video.src = window._cube_cross.host + "/archive/read?name=" + name + "&file=" + file;
		}
		else {
			video.src = "archive/read?name=" + name + "&file=" + file;
		}
	},

	hasLocalRecorded: function() {
		if (null == this.recorderMap) {
			return false;
		}

		return this.recorderMap.containsKey("LocalVideo");
	},

	/**
	 * 是否正在录制本地视频。
	 *
	 * @returns {Boolean} 返回是否正在录制本地视频。
	 * @instance
	 * @memberof CubeMediaController
	 */
	isLocalRecording: function() {
		if (null == this.recorderMap) {
			return false;
		}

		var r = this.recorderMap.get("LocalVideo");
		if (r == null) {
			return false;
		}

		return r.recording;
	},

	/**
	 * 启动本地音视频录制。
	 *
	 * @param {Object} config 指定录像参数。参数包括：interval （录制切片间隔）
	 * @returns {Boolean} 返回录制是否启动成功。
	 * @instance
	 * @memberof CubeMediaController
	 */
	startLocalRecording: function(config) {
		if (null == this.worker.localStream) {
			return false;
		}

		return this.startRecording("LocalVideo", this.worker.localStream, config);
	},

	/**
	 * 停止本地音视频录制。
	 *
	 * @param {Function} callback 指定录像结束时的回调函数。
	 * @returns {Boolean} 返回录制是否启动停止。
	 * @instance
	 * @memberof CubeMediaController
	 */
	stopLocalRecording: function(callback) {
		return this.stopRecording("LocalVideo", callback);
	},

	replayLocalRecording: function(videoEl, audioEl) {
		return this.replayRecording("LocalVideo", videoEl, audioEl);
	},

	getLocalRecorder: function() {
		return this.getRecorder("LocalVideo");
	},

	hasRemoteRecorded: function() {
		if (null == this.recorderMap) {
			return false;
		}

		return this.recorderMap.containsKey("RemoteVideo");
	},

	isRemoteRecording: function() {
		if (null == this.recorderMap) {
			return false;
		}

		var r = this.recorderMap.get("RemoteVideo");
		if (r == null) {
			return false;
		}

		return r.recording;
	},

	startRemoteRecording: function(config) {
		if (null == this.worker.remoteStream) {
			return false;
		}

		return this.startRecording("RemoteVideo", this.worker.remoteStream, config);
	},

	stopRemoteRecording: function(callback) {
		return this.stopRecording("RemoteVideo", callback);
	},

	getRemoteRecorder: function() {
		return this.getRecorder("RemoteVideo");
	},

	startRecording: function(task, mix, config) {
		var preview = null;
		var stream = null;
		if (typeof mix === 'string') {
			preview = document.getElementById(mix);
		}
		else if (mix.tagName !== undefined) {
			preview = mix;
		}
		else {
			stream = mix;
		}

		if (null == this.recorderMap) {
			this.recorderMap = new HashMap();
		}

		var recorder = null;
		// 创建记录器
		if (config !== 'undefined' && null != config) {
			recorder = new CubeAdvancedRecorder(preview, config);
		}
		else {
			recorder = new CubeRecorder(preview);
		}

		// 记录
		this.recorderMap.put(task, recorder);

		// 启动记录器
		return recorder.startRecording(stream);
	},

	stopRecording: function(task, callback) {
		if (null == this.recorderMap) {
			return false;
		}

		var recorder = this.recorderMap.get(task);
		if (null == recorder) {
			return false;
		}

		var callTimer = 0;
		var ret = recorder.stopRecording(function(r) {
			if (null == callback) {
				return;
			}

			if (callTimer > 0) {
				clearTimeout(callTimer);
			}

			callTimer = setTimeout(function() {
				clearTimeout(callTimer);
				callback.call(null, recorder);
			}, 1000);
		});

		return ret;
	},

	replayRecording: function(task, videoEl, audioEl) {
		if (null == this.recorderMap) {
			return false;
		}

		var recorder = this.recorderMap.get(task);
		if (null == recorder) {
			return false;
		}

		var video = null;
		if (typeof videoEl === 'string') {
			video = document.getElementById(videoEl);
		}
		else {
			video = videoEl;
		}

		var audio = null;
		if (typeof audioEl === 'string') {
			audio = document.getElementById(audioEl);
		}
		else {
			audio = audioEl;
		}

		return recorder.replay(video, audio);
	},

	getRecorder: function(task) {
		if (null == this.recorderMap) {
			return null;
		}

		return this.recorderMap.get(task);
	}
});

;(function() {
	if (window._cube_cross === undefined) {
		window._cube_cross = {
			host: "http://" + _CUBE_DOMAIN,//"http://192.168.0.198:8080/cube"

			callbackMap: {},

			addCallback: function(sn, success, error) {
				this.callbackMap[sn] = success;
			}
		};
	}

	window._cube_cross.queryRecordArchives = function(sn, data) {
		var dom = document.getElementById(sn);
		var name = dom.getAttribute("name");

		var success = window._cube_cross.callbackMap[sn];
		success.call(null, name, data);

		document.body.removeChild(dom);
		dom = null;

		delete window._cube_cross.callbackMap[sn];
	};
})();
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
/*
 * CubeEngine.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var _M_CELLET = "CubeMessaging";
var _S_CELLET = "CubeSignaling";
var _WB_CELLET = "CubeWhiteboard";

var _CUBE_DOMAIN = "211.103.217.154";

/**
 * 魔方引擎类。
 * 魔方引擎类是为应用层提供接口的基础类，包括通话控制、获取白板对象实例、获取媒体控制器实例等。
 *
 * @class CubeEngine
 */
var CubeEngine = Class({
	/**
	 * @member {String} version 引擎版本信息。
	 * @readonly
	 * @instance
	 * @memberof CubeEngine
	 */
	version: "1.3.19",

	config: null,

	hostAddress: null,
	session: null,

	registered: false,
	accName: null,
	accPassword: null,
	accDisplayName: null,

	sipWorker: null,
	sipMediaController: null,

	sspWorker: null,
	sspMediaController: null,

	msgWorker: null,

	wbMap: null,
	wbList: null,

	// 注册监听器
	regListener: null,

	// 通话监听器
	callListener: null,

	// 消息监听器
	messageListener: null,

	// 白板监听器
	wbListener: null,

	// 查询回调
	queryCallback: null,

	ctor: function() {
		this.session = new CubeSession();
	},

	// 调试选项
	_debug: function(config) {
		if (config.single) {
			this.sspWorker.iceServersUrls = [
				{"urls": ["stun:123.57.251.18:3478"]},
				{"urls": ["turn:123.57.251.18:3478"], "username": "cube", "credential": "cube887"}];
		}
		else {
			this.sspWorker.iceServersUrls = [
				{"urls": ["stun:211.103.217.154:3478", "stun:123.57.251.18:3478"]},
				{"urls": ["turn:211.103.217.154:3478", "turn:123.57.251.18:3478"], "username": "cube", "credential": "cube887"}];
		}
	},

	/**
	 * 初始化并启动引擎。
	 * 
	 * @param {Function} completion 指定引擎启动完成回调。
	 * @returns {Boolean} 如果引擎启动成功返回 <code>true</code> ，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeEngine
	 */
	startup: function(completion, host, port) {
		/*$.post('/engine/auth', {code:"cube.channel7a28464563d4200b990652d7f7491c95"},
			function(data, textStatus, jqXHR) {
				if (data.state == 200) {
				}
			});*/

		var self = this;

		if (host === undefined || null == host) {
			host = _CUBE_DOMAIN;
		}
		else {
			_CUBE_DOMAIN = host;
		}

		if (port === undefined) {
			port = 7070;
		}

		self.hostAddress = new InetAddress(host, port);

		var sf = function() {
			if (window.nucleus.startup()) {
				// 添加监听器
				nucleus.talkService.addListener(new CubeNetworkListener(self));

				if (undefined !== completion) {
					completion.call(null, self);
				}

				return true;
			}
			else {
				return false;
			}
		};

		if (window.utils.isIE9) {
			//window.WEB_SOCKET_DEBUG = true;
			window.WEB_SOCKET_FORCE_FLASH = true;

			nucleus.activateWSPlugin(_CUBE_DOMAIN.indexOf("192") >= 0 ? "libs/ws" : "http://" + _CUBE_DOMAIN + "/libs/ws", function() {
				sf();
			});

			return true;
		}
		else {
			var t = setTimeout(function() {
				clearTimeout(t);
				sf();
			}, 50);
			return true;
		}
	},

	/**
	 * 关闭引擎并关闭所有子模块。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	shutdown: function() {
	},

	/**
	 * 配置引擎工作参数。参数包括视频大小、建议帧率等。
	 *
	 * @example
	 * window.cube.configure({
	 *     "videoSize": { "width": 640, "height": 480 },
	 *     "frameRate": { "min": 5, "max": 18 },
	 *     "bandwidth": { "audio": 60, "video": 256 }
	 * });
	 *
	 * @see CubeVideoSize
	 * @instance
	 * @memberof CubeEngine
	 */
	configure: function(config) {
		this.config = config;

		if (null != this.sspWorker) {
			// 最大视频大小
			if (config.videoSize !== undefined) {
				this.sspWorker.maxVideoSize = config.videoSize;

				Logger.d('CubeEngine', 'Config video size: ' + config.videoSize.width + 'x' + config.videoSize.height);
			}

			// 最低帧率
			if (config.frameRate !== undefined) {
				var minFR = parseInt(config.frameRate.min);
				if (minFR > 10)
					minFR = 10;
				else if (minFR < 2)
					minFR = 2;

				var maxFR = parseInt(config.frameRate.max);
				if (maxFR > 30)
					maxFR = 30;
				else if (maxFR < 6)
					maxFR = 6;

				this.sspWorker.minFrameRate = minFR;
				this.sspWorker.maxFrameRate = maxFR;

				Logger.d('CubeEngine', 'Config frame rate: [' + minFR + ',' + maxFR + ']');
			}

			if (config.bandwidth) {
				this.sspWorker.setBandwidth(config.bandwidth.audio || 60, config.bandwidth.video || 256);
			}
		}
	},

	/**
	 * 返回引擎当前使用的会话实例。
	 *
	 * @see CubeSession
	 * @returns {CubeSession} 会话对象的实例。
	 * @instance
	 * @memberof CubeEngine
	 */
	getSession: function() {
		return this.session;
	},

	/**
	 * 注册账号。
	 * 在魔方引擎中每个终端通过注册一个唯一账号来进行终端识别。
	 *
	 * @param {String} name 指定注册的账号名。
	 * @param {String} password 指定账号对应的密码。
	 * @param {String} [displayName] 指定账号对应的显示名。
	 * @instance
	 * @memberof CubeEngine
	 */
	registerAccount: function(name, password, displayName) {
		this.accName = name + '';
		this.accPassword = password + '';
		if (displayName === undefined || displayName.length == 0) {
			this.accDisplayName = this.accName;
		}
		else {
			this.accDisplayName = displayName.toString();
		}

		this.session.name = this.accName;
		this.session.displayName = this.accDisplayName;

		var self = this;

		if (null != self.sipWorker) {
			self.sipWorker.registerWith(name, password, this.accDisplayName);
		}

		var cellets = [];
		if (nucleus.talkService.isCalled(_M_CELLET)) {
			cellets.push(_M_CELLET);
		}
		if (nucleus.talkService.isCalled(_S_CELLET)) {
			cellets.push(_S_CELLET);
		}
		if (nucleus.talkService.isCalled(_WB_CELLET)) {
			cellets.push(_WB_CELLET);
		}

		if (cellets.length > 0) {
			// 回调注册正在处理
			self._fireRegistrationState(CubeRegistrationState.Progress);

			for (var i = 0; i < cellets.length; ++i) {
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionLogin);
				dialect.appendParam("data", {
					name: self.accName,
					displayName: self.accDisplayName,
					password: password,
					version: self.version,
					device: {
						name: navigator.appName,
						version: navigator.appVersion,
						platform: navigator.platform,
						userAgent: navigator.userAgent
					}
				});
				nucleus.talkService.talk(cellets[i], dialect);
			}
		}

		cellets = null;

		return true;
	},

	/**
	 * 注销账号。将已经注册的帐号注销，退出登录状态。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	unregisterAccount: function() {
		if (this.session.isCalling()) {
			this.terminateCall();
		}

		// 回调注销
		this._fireRegistrationState(CubeRegistrationState.Cleared);

		if (null != this.sipWorker) {
			this.sipWorker.unregister();
		}

		var cellets = [];
		if (nucleus.talkService.isCalled(_M_CELLET)) {
			cellets.push(_M_CELLET);
		}
		if (nucleus.talkService.isCalled(_S_CELLET)) {
			cellets.push(_S_CELLET);
		}
		if (nucleus.talkService.isCalled(_WB_CELLET)) {
			cellets.push(_WB_CELLET);
		}

		if (cellets.length > 0) {
			var self = this;

			for (var i = 0; i < cellets.length; ++i) {
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionLogout);
				dialect.appendParam("data", {
					name: self.accName,
					password: self.accPassword,
					version: self.version,
					device: {
						name: navigator.appName,
						version: navigator.appVersion,
						platform: navigator.platform,
						userAgent: navigator.userAgent
					}
				});
				nucleus.talkService.talk(cellets[i], dialect);
			}
		}
		cellets = null;

		this.accName = null;
		this.accDisplayName = null;
		this.accPassword = null;
		this.session.name = null;

		return true;
	},

	/**
	 * @deprecated since version 1.3.0
	 * @instance
	 * @memberof CubeEngine
	 */
	queryRemoteAccounts: function(accounts, callback) {
		this.queryAccounts(accounts, callback);
	},

	/**
	 * 查询帐号信息回调函数。
	 *
	 * @callback queryAccountsCallback
	 * @param {Array} list 查询到的用户数据列表。
	 */
	/**
	 * 查询帐号基本信息和实时状态。
	 *
	 * @param {Array} accounts 指定待查询帐号的列表。
	 * @param {queryAccountsCallback} callback 成功回调。 
	 * @instance
	 * @memberof CubeEngine
	 */
	queryAccounts: function(accounts, callback) {
		if (null == this.msgWorker) {
			return false;
		}

		if (!nucleus.talkService.isCalled(_M_CELLET)
			&& !nucleus.talkService.isCalled(_S_CELLET)) {
			return false;
		}

		if (undefined !== callback) {
			this.queryCallback = callback;
		}
		else {
			return false;
		}

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionQuery);
		dialect.appendParam("data", {
				"list": accounts
			});

		if (nucleus.talkService.isCalled(_M_CELLET)) {
			nucleus.talkService.talk(_M_CELLET, dialect);
			return true;
		}
		else if (nucleus.talkService.isCalled(_S_CELLET)) {
			nucleus.talkService.talk(_S_CELLET, dialect);
			return true;
		}
		else if (nucleus.talkService.isCalled(_WB_CELLET)) {
			nucleus.talkService.talk(_WB_CELLET, dialect);
			return true;
		}
		else {
			return false;
		}
	},

	/**
	 * 查询消息历史记录回调函数。
	 *
	 * @callback queryMessageHistoryCallback
	 * @param {Array} list 查询到的消息列表。
	 * @param {Number} begin 本次查询的开始时间戳。
	 * @param {Number} end 本次查询的截止时间戳。
	 */
	/**
	 * 查询自己的消息历史记录。
	 *
	 * @param {Number} begin 指定查询的起始时间戳。
	 * @param {Number} end 指定查询的截止时间戳。
	 * @param {queryMessageHistoryCallback} callback 指定查询结果回调函数。
	 * @instance
	 * @memberof CubeEngine
	 */
	queryMessageHistory: function(begin, end, callback) {
		if (null == this.msgWorker) {
			return false;
		}

		return this.msgWorker.queryHistory(begin, end, callback);
	},

	loadConference: function(localVideo, remoteVideo, bellAudio) {
		if (null != this.sipWorker) {
			return true;
		}

		this.sipWorker = new CubeSIPWorker("211.103.217.154");

		this.sipWorker.start(this, document.getElementById(localVideo),
									document.getElementById(remoteVideo),
									(bellAudio !== undefined) ? document.getElementById(bellAudio) : null);

		// 创建媒体控制器
		this.sipMediaController = new CubeMediaController(this.sipWorker);

		return true;
	},

	/**
	 * 加载音视频通话模块。
	 *
	 * @param {String} localVideo 指定页面上用于显示本地视频的 <code>video</code> 标签的 DOM ID 。
	 * @param {String} remoteVideo 指定页面上用于显示远端视频的 <code>video</code> 标签的 DOM ID 。
	 * @param {String} [bellAudio] 指定页面上用于响铃的 <code>audio</code> 标签的 DMO ID 。
	 * @instance
	 * @memberof CubeEngine
	 */
	loadSignaling: function(localVideo, remoteVideo, bellAudio) {
		if (null != this.sspWorker) {
			return true;
		}

		this.sspWorker = new CubeSignalingWorker(document.getElementById(localVideo),
												document.getElementById(remoteVideo),
												(bellAudio !== undefined) ? document.getElementById(bellAudio) : null);
		this.sspWorker.setDelegate(new CubeSignalingWorkerDelegate(this));

		// 设置分辨率
		if (null != this.config) {
			this.sspWorker.maxVideoSize = this.config.videoSize;
		}

		nucleus.talkService.call([_S_CELLET], this.hostAddress, true);

		// 创建媒体控制器
		this.sspMediaController = new CubeMediaController(this.sspWorker);

		// 判断
		if (!nucleus.ts.isWebSocketSupported()) {
			window.console.log("Adapter WebSocket");
			nucleus.ts.resetHeartbeat(_S_CELLET, 2000);
		}

		return true;
	},

	/**
	 * 加载即时消息模块。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	loadMessager: function() {
		if (null != this.msgWorker) {
			return true;
		}

		this.msgWorker = new CubeMessageWorker();
		this.msgWorker.setDelegate(new CubeMessageWorkerDelegate(this));

		nucleus.talkService.call([_M_CELLET], this.hostAddress, true);

		return true;
	},

	/**
	 * 加载智能白板模块。
	 *
	 * @param {String} domId 指定白板画布容器的 DOM ID 。
	 * @instance
	 * @memberof CubeEngine
	 */
	loadWhiteboard: function(domId) {
		if (null == this.wbMap)
			this.wbMap = new HashMap();

		if (null == this.wbList)
			this.wbList = new Array();

		nucleus.talkService.call([_WB_CELLET], this.hostAddress, true);

		var wb = new CubeWhiteboard(domId, new CubeWhiteboardDelegate(this));
		wb.load();

		this.wbMap.put(wb.getName(), wb);
		this.wbList.push(wb);
		return wb;
	},

	/**
	 * 设置注册监听器。
	 *
	 * @param {CubeRegistrationListener} listener 指定注册监听器。
	 * @see CubeRegistrationListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setRegistrationListener: function(listener) {
		this.regListener = listener;
	},

	/**
	 * 设置音视频通话监听器。
	 *
	 * @param {CubeCallListener} listener 指定音视频通话监听器。
	 * @see CubeCallListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setCallListener: function(listener) {
		this.callListener = listener;
	},

	/**
	 * 设置消息监听器。
	 *
	 * @param {CubeMessageListener} listener 指定消息监听器。
	 * @see CubeMessageListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setMessageListener: function(listener) {
		this.messageListener = listener;
	},

	/**
	 * 设置白板监听器。
	 *
	 * @param {CubeWhiteboardListener} listener 指定白板监听器。
	 * @see CubeWhiteboardListener
	 * @instance
	 * @memberof CubeEngine
	 */
	setWhiteboardListener: function(listener) {
		this.wbListener = listener;
	},

	/**
	 * 向指定用户发起音/视频通话邀请。
	 *
	 * @param {String} callee 指定被叫方的帐号名。
	 * @param {Boolean} videoEnabled 指定是否使用视频通话。如果设置为 <code>false</code>，则仅使用语音通话。
	 * @returns {Boolean} 如果通话请求发送成功则返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeEngine
	 */
	makeCall: function(callee, videoEnabled) {
		// 被叫号码
		callee = callee.toString();
		if (callee.length <= 4 && null != this.sipWorker) {
			this.session.setCallPeer(new CubePeer(callee));
			return this.sipWorker.invite(callee, videoEnabled);
		}

		if (null != this.sspWorker) {
			this.session.setCallPeer(new CubePeer(callee));
			return this.sspWorker.invite(callee, videoEnabled);
		}
		else if (null != this.sipWorker) {
			this.session.setCallPeer(new CubePeer(callee));
			return this.sipWorker.invite(callee, videoEnabled);
		}
		else {
			return false;
		}
	},

	/**
	 * 应答收到的音/视频通话邀请。应答邀请即表示愿意与对方进行通话。
	 *
	 * @param {Boolean} videoEnabled 指定是否使用视频进行应答。
	 * @instance
	 * @memberof CubeEngine
	 */
	answerCall: function(videoEnabled) {
		if (this.session.callPeer.name.length <= 4 && null != this.sipWorker) {
			return this.sipWorker.answer(videoEnabled);
		}

		if (null != this.sspWorker) {
			return this.sspWorker.answer(videoEnabled);
		}
		else if (null != this.sipWorker) {
			return this.sipWorker.answer(videoEnabled);
		}
		else {
			return false;
		}
	},

	/**
	 * 终止通话或拒绝通话邀请。
	 *
	 * @instance
	 * @memberof CubeEngine
	 */
	terminateCall: function() {
		if (null != this.session.callPeer &&
			this.session.callPeer.name.length <= 4 &&
			null != this.sipWorker) {
			return this.sipWorker.hangup();
		}

		var sspRet = false;
		var sipRet = false;

		if (null != this.sspWorker) {
			sspRet = this.sspWorker.hangup();
		}

		if (null != this.sipWorker) {
			sipRet = this.sipWorker.hangup();
		}

		return (sspRet || sipRet);
	},

	/**
	 * 设置是否使用自动应答。
	 * 当使用自动应答时，用户同意浏览器调用设备摄像头和麦克风之后，引擎会自动调用 <code>answerCall(true)</code> 进行应答。
	 * 也就是说当自动应答被激活后，引擎始终同意任何端的通话邀请。
	 *
	 * @param {Boolean} value 指定是否启用自动应答。
	 * @instance
	 * @memberof CubeEngine
	 */
	autoAnswer: function(value) {
		if (null != this.sspWorker) {
			this.sspWorker.setAutoAnswer(value);
		}
	},

	/**
	 * 返回引擎中用户操作媒体设备的媒体控制器对象实例。
	 *
	 * @returns 返回媒体控制器实例。
	 * @see CubeMediaController
	 * @instance
	 * @memberof CubeEngine
	 */
	getMediaController: function() {
		if (null != this.session.callPeer) {
			if (this.session.callPeer.name.length <= 4 && null != this.sipWorker) {
				return this.sipMediaController;
			}
			else {
				return this.sspMediaController;
			}
		}
		else {
			return this.sspMediaController;
		}
	},

	/**
	 * 返回引擎中用户操作媒体设备的媒体控制器对象实例。
	 *
	 * @returns 返回媒体控制器实例。
	 * @see CubeMediaController
	 * @instance
	 * @memberof CubeEngine
	 */
	mc: function() {
		return this.getMediaController();
	},

	getConferenceUA: function() {
		if (null == this.sspWorker) {
			return null;
		}

		return this.sspWorker.cua();
	},

	cua: function() {
		if (null == this.sspWorker) {
			return null;
		}

		return this.sspWorker.cua();
	},

	/**
	 * 发送指定内容的消息。
	 *
	 * @param {String} mix 指定收件人的注册帐号名。
	 * @param {String} content 指定消息的文本内容。
	 * @instance
	 * @memberof CubeEngine
	 */
	sendMessage: function(mix, content) {
		if (null == this.msgWorker) {
			return false;
		}

		if (!nucleus.talkService.isCalled(_M_CELLET)) {
			return false;
		}

		return this.msgWorker.pushMessage(mix, content);
	},

	/**
	 * 返回智能白板对象实例。
	 *
	 * @returns 返回当前有效的白板对象。
	 * @instance
	 * @memberof CubeEngine
	 */
	getWhiteboard: function(domId) {
		if (null == this.wbList) {
			return null;
		}

		if (domId === undefined) {
			return this.wbList[0];
		}

		for (var i = 0; i < this.wbList.length; ++i) {
			var wb = this.wbList[i];
			if (wb.domId == domId) {
				return wb;
			}
		}

		return null;
	},

	// 暖车
	warmUp: function() {
		if (null == this.sspWorker) {
			return;
		}

		var overflow = document.body.style.overflow;
		var w = window.innerWidth;
		var h = window.innerHeight;

		document.body.style.overflow = "hidden";

		var vx = parseInt((w - 480) * 0.5);
		var vy = parseInt((h - 480) * 0.5) - 40;
		var bx = parseInt((w - 200 - 200 - 40) * 0.5);
		var by = parseInt(vy + 480 + 10);

		var mask = ['<div style="position:absolute;float:left;left:0px;top:0px;opacity:0.7;-moz-opacity:0.7;-webkit-opacity:0.7;background:#000;',
					'width:', w, 'px;height:', h, 'px"></div>',
				'<video id="_cube_warmup_video" width="480" height="480" style="position:absolute;float:left;left:',
					vx, 'px;top:', vy, 'px;background:#101010;"></video>',
				'<button id="_cube_warmup_yes" style="width:200px;height:30px;position:absolute;float:left;left:',
					bx, 'px;top:', by, 'px;">我看到了视频</button>',
				'<button id="_cube_warmup_no" style="width:200px;height:30px;position:absolute;float:left;left:',
					bx + 240, 'px;top:', by, 'px;">我没有看到视频</button>'];

		var c = document.createElement("div");
		c.style.position = "absolute";
		c.style.styleFloat = "left";
		c.style.cssFloat = "left";
		c.style.left = "0px";
		c.style.top = "0px";
		c.style.width = w + "px";
		c.style.height = h + "px";
		c.style.zIndex = 9999;
		c.innerHTML = mask.join('');
		document.body.appendChild(c);

		var video = document.getElementById('_cube_warmup_video');
		var localStream = null;

		if (navigator.getUserMedia) {
			navigator.getUserMedia({ "audio": true, "video": true },
				function(stream) {
					localStream = stream;
					if (window.URL) {
						// Chrome case: URL.createObjectURL() converts a MediaStream to a blob URL
						video.src = window.URL.createObjectURL(localStream);
					}
					else {
						// Firefox and Opera: the src of the video can be set directly from the stream
						video.src = localStream;
					}
					video.onloadedmetadata = function(e) {
						video.play();
					};
				},
				function(error) {
					alert('发生错误: ' + JSON.stringify(error));
				});
		}

		var closeFun = function() {
			video.src = "";
			if (null != localStream) {
				localStream.stop();
				localStream = null;
			}
			document.body.removeChild(c);
			document.body.style.overflow = overflow;
		};
		var btn = document.getElementById('_cube_warmup_yes');
		btn.addEventListener('click', function(e) {
				closeFun();
			}, false);
		btn = document.getElementById('_cube_warmup_no');
		btn.addEventListener('click', function(e) {
				closeFun();
			}, false);
	},

	_fireRegistrationState: function(state) {
		if (state != this.session.regState) {
			this.session.regState = state;

			if (null != this.regListener) {
				if (state == CubeRegistrationState.Progress) {
					this.regListener.onRegistrationProgress(this.session);
				}
				else {
					if (state == CubeRegistrationState.Ok) {
						this.regListener.onRegistrationOk(this.session);
					}
					else if (state == CubeRegistrationState.Cleared) {
						this.regListener.onRegistrationCleared(this.session);

						// 终止呼叫
						if (this.session.isCalling()) {
							this.terminateCall();
						}
					}
					else if (state == CubeRegistrationState.Failed) {
						this.regListener.onRegistrationFailed(this.session);
					}
				}
			}
		}

		if (null != this.sspWorker) {
			this.sspWorker.onRegisterStateChanged(this.session);
		}

		if (null != this.msgWorker) {
			this.msgWorker.onRegisterStateChanged(this.session);
		}

		if (null != this.wbList && this.wbList.length > 0) {
			var list = this.wbList;
			for (var i = 0; i < list.length; ++i) {
				var wb = list[i];
				wb.onRegisterStateChanged(this.session);
			}
		}
	},

	_processLoginAck: function(dialect) {
		var state = dialect.getParam("state");
		if (state.code == 200) {
			this.registered = true;

			this._fireRegistrationState(CubeRegistrationState.Ok);
		}
		else {
			Logger.w("CubeEngine", "login failed");

			this._fireRegistrationState(CubeRegistrationState.Failed);
		}
	},

	_processQueryAck: function(dialect) {
		if (null != this.queryCallback) {
			var data = dialect.getParam("data");
			this.queryCallback.call(null, data.list);
			this.queryCallback = null;
		}
	}
});


var CubeNetworkListener = Class(TalkListener, {
	engine: null,

	ctor: function(engine) {
		TalkListener.prototype.ctor.call(this);
		this.engine = engine;
	},

	dialogue: function(identifier, primitive) {
		if (primitive.isDialectal()) {
			var dialect = primitive.getDialect();
			if (ActionDialect.DIALECT_NAME == dialect.getName()) {
				var action = dialect.getAction();
				if (action == CubeConst.ActionLoginAck) {
					this.engine._processLoginAck(dialect);
					return;
				}
				else if (action == CubeConst.ActionQueryAck) {
					this.engine._processQueryAck(dialect);
					return;
				}

				if (identifier == _WB_CELLET) {
					if (null != this.engine.wbList && this.engine.wbList.length > 0) {
						var list = this.engine.wbList;
						for (var i = 0; i < list.length; ++i) {
							list[i].onDialogue(action, dialect);
						}
					}
				}
				else if (identifier == _M_CELLET) {
					if (null != this.engine.msgWorker) {
						this.engine.msgWorker.onDialogue(action, dialect);
					}
				}
				else if (identifier == _S_CELLET) {
					if (null != this.engine.sspWorker) {
						this.engine.sspWorker.onDialogue(action, dialect);
					}
				}
			}
		}
	},

	contacted: function(identifier, tag) {
		console.log("*** contacted: " + identifier);

		if (!this.engine.registered && null != this.engine.accName && null != this.engine.accPassword) {
			// 回调
			this.engine._fireRegistrationState(CubeRegistrationState.Progress);

			var name = this.engine.accName;
			var displayName = this.engine.accDisplayName;
			var password = this.engine.accPassword;
			var version = this.engine.version;

			var cellets = [];
			if (null != this.engine.msgWorker)
				cellets.push(_M_CELLET);
			if (null != this.engine.sspWorker)
				cellets.push(_S_CELLET);
			if (null != this.engine.wbMap)
				cellets.push(_WB_CELLET);

			for (var i = 0; i < cellets.length; ++i) {
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionLogin);
				dialect.appendParam("data", {
					name: name,
					displayName: displayName,
					password: password,
					version: version,
					device: {
						name: navigator.appName,
						version: navigator.appVersion,
						platform: navigator.platform,
						userAgent: navigator.userAgent
					}
				});
				nucleus.talkService.talk(cellets[i], dialect);
			}

			cellets = null;
		}
	},

	quitted: function(identifier, tag) {
		console.log("*** quitted: " + identifier);

		if (null != this.engine.sspWorker) {
			if (this.engine.session.isCalling()) {
				this.engine.terminateCall();
			}
		}
	},

	failed: function(tag, failure) {
		console.log("*** failed: " + tag + " - " + failure.getDescription());

		var t = setTimeout(function() {
			clearTimeout(t);

			nucleus.talkService.recall();
		}, 10000);
	}
});

// 初始化
;(function(global) {
	CubeEngine.sharedInstance = new CubeEngine();
	global.cube = CubeEngine.sharedInstance;
})(window);
