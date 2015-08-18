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
