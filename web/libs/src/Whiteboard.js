/*
 * Whiteboard.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var _WhiteboardSharingPluginDOM = "cube_sharing_plugin";

/**
 * 白板类。
 */
var CubeWhiteboard = Class({
	session: null,

	name: null,
	dom: null,
	domId: null,
	paper: null,
	paperDom: null,

	background: null,
	bgImage: null,

	curEntity: null,
	exMap: null,

	cmdSnCursor: 0,

	// 视口控制
	viewport: null,

	// 记录：{sn: sn, type: type, set: set, raw: {param: param, attr: attr}}
	pastRecords: null,
	undoRecords: null,

	sharedList: null,

	// 远端绘图记录，key: from, value: record array
	remoteRecordMap: null,
	// 远端绘图历史，key: from, value: record array
	remoteHistoryMap: null,
	// 远端 Slide
	remoteSlide: null,

	width: 0,
	height: 0,

	// 委派
	delegate: null,

	// 阅读模式
	readMode: false,

	ctor: function(id, delegate) {
		this.name = UUID.v4().toString();
		this.domId = id;
		this.dom = document.getElementById(id);
		this.viewport = new CubeViewport(this);
		this.pastRecords = new Array();
		this.undoRecords = new Array();
		//this.remoteColorArray = ['#c0392b', '#2980b9', '#16a085', '#8e44ad', '#d35400', 'red', 'blue', 'green'];
		this.remoteRecordMap = new HashMap();
		this.remoteHistoryMap = new HashMap();

		this.exMap = new HashMap();

		// 设置委派
		this.delegate = delegate;
	},

	getName: function() {
		return this.name;
	},

	resize: function(width, height) {
		if (null == this.paper) {
			return;
		}

		this.paper.setSize(width, height);

		this.width = width;
		this.height = height;

		if (null != this.curEntity) {
			this.curEntity.onResize(width, height);
		}

		var bgimg = this.background.getElementsByTagName('img')[0];
		if (bgimg !== undefined && null != bgimg) {
			this._centerBgImage(bgimg);
		}
	},

	load: function(width, height) {
		if (width === undefined) {
			width = this.dom.offsetWidth;
		}
		if (height === undefined) {
			height = this.dom.offsetHeight;
		}

		this.paper = Raphael(this.domId, width, height);
		this.paperDom = this.dom.getElementsByTagName('svg')[0];

		this.width = width;
		this.height = height;

		this._buildEvents();

		// 插入背景容器
		this.background = document.createElement("div");
		this.background.style.position = "absolute";
		this.background.style.styleFloat = "left";
		this.background.style.cssFloat = "left";
		this.background.style.left = "0px";
		this.background.style.top = "0px";
		this.dom.insertBefore(this.background, this.paperDom);
	},

	/**
	 * 矫正画布大小跟随容器大小。
	 */
	adjustSize: function() {
		var w = parseInt(this.dom.offsetWidth);
		var h = parseInt(this.dom.offsetHeight);
		this.resize(w, h);
	},

	_buildEvents: function() {
		var self = this;
		this.dom.addEventListener('click', function(e) { self.onClick(e); }, false);
		this.dom.addEventListener('mousemove', function(e) { self.onMouseMove(e); }, false);
		this.dom.addEventListener('mousedown', function(e) { self.onMouseDown(e); }, false);
		this.dom.addEventListener('mouseup', function(e) { self.onMouseUp(e); }, false);
		this.dom.addEventListener('touchmove', function(e) { self.onTouchMove(e); }, false);
		this.dom.addEventListener('touchstart', function(e) { self.onTouchStart(e); }, false);
		this.dom.addEventListener('touchend', function(e) { self.onTouchEnd(e); }, false);
		window.addEventListener('keypress', function(e) { self.onKeyPress(e); }, false);
	},

	shareWith: function(list) {
		if (!nucleus.talkService.isCalled(_WB_CELLET) || null == this.session) {
			return false;
		}

		// 禁止分享给自己
		if (list.indexOf(this.session.name) >= 0) {
			return false;
		}

		// 判断是否重新分享
		if (null != this.sharedList) {
			if (this.sharedList.length != list.length) {
				this.revokeSharing();
			}
			else {
				var count = 0;
				for (var i = 0; i < this.sharedList.length; ++i) {
					var n = this.sharedList[i];
					if (n != list[i]) {
						this.revokeSharing();
						break;
					}
					++count;
				}

				if (count == this.sharedList.length) {
					// 分享列表没有变化，返回
					return true;
				}
			}
		}

		this.sharedList = list;

		var self = this;
		var data = {
			"boardName": self.name,
			"sharedList": list
		};
		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionShare);
		dialect.appendParam('data', data);
		nucleus.talkService.talk(_WB_CELLET, dialect);

		return true;
	},

	/**
	 * 停止分享。
	 */
	revokeSharing: function() {
		this.sharedList = null;

		var name = this.name;
		var data = {
			"boardName": name
		};
		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionRevoke);
		dialect.appendParam('data', data);
		nucleus.talkService.talk(_WB_CELLET, dialect);
	},

	/**
	 * 是否分享了白板。
	 */
	isSharing: function() {
		return (nucleus.talkService.isCalled(_WB_CELLET)
			&& null != this.session
			&& null != this.sharedList);
	},

	applyMaster: function() {
		// TODO
	},

	unselect: function() {
		if (null != this.curEntity && this.curEntity.exclusive) {
			this.curEntity.dispose();
			this.curEntity = null;
		}
	},

	selectEntity: function(entity) {
		var self = this;

		if (!entity.exclusive) {
			entity.board = this;
			var timer = setTimeout(function() {
				clearTimeout(timer);
				entity.onDraw(self.paper);

				// 记录非独占的实体
				self.exMap.put(entity.name, entity);
			}, 30);

			return;
		}

		if (null != this.curEntity) {
			this.curEntity.dispose();
			this.curEntity = null;
		}

		entity.board = this;
		this.curEntity = entity;

		var timer = setTimeout(function() {
			clearTimeout(timer);
			if (null != self.curEntity) {
				self.curEntity.onDraw(self.paper);
			}
		}, 30);
	},

	entity: function() {
		return this.curEntity;
	},

	setReadMode: function(value) {
		this.readMode = value;
	},

	undo: function() {
		if (this.pastRecords.length == 0) {
			return;
		}

		var r = this.pastRecords.pop();
		this.undoRecords.push(r);

		// 游标减一
		--this.cmdSnCursor;

		// r : {sn: sn, type: type, set: set, raw: {param: param, attr: attr}}
		if (r.set.forEach === undefined) {
			if (r.set._bbox) { r.set._bbox.remove(); r.set._bbox = null; }
			r.set.remove();
		}
		else {
			r.set.forEach(function(e) {
				e.remove();
			});
		}

		// 发送 VG 命令
		var self = this;
		var sn = r.sn;
		var data = {
			"boardName": self.name,
			"command": {
				"name": "undo",
				"param": sn
			}
		};
		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionVGCmd);
		dialect.appendParam("data", data);
		nucleus.talkService.talk(_WB_CELLET, dialect);
	},

	redo: function() {
		if (this.undoRecords.length == 0) {
			return;
		}

		var r = this.undoRecords.pop();
		this.pastRecords.push(r);

		// 游标加一
		++this.cmdSnCursor;

		// r : {sn: sn, type: type, set: set, raw: {param: param, attr: attr}}
		if (r.type == "path") {
			this.paper.setStart();
			this.paper.path(r.raw.param);
			var set = this.paper.setFinish();
			set.attr("stroke", r.raw.attr.stroke);
			set.attr("stroke-width", r.raw.attr.strokeWidth);
			set.attr("stroke-linecap", "round");
			r.set = set;
		}
		else if (r.type == "text") {
			var el = this.paper.text(r.raw.param.x, r.raw.param.y, r.raw.param.text);
			el.attr("font-family", r.raw.attr.fontFamily);
			el.attr("font-size", r.raw.attr.fontSize);
			r.set = el;
		}
		else if (r.type == "rect") {
			var el = this.paper.rect(r.raw.param.x, r.raw.param.y, r.raw.param.width, r.raw.param.height);
			el.attr("stroke", r.raw.attr.stroke);
			el.attr("stroke-width", r.raw.attr.strokeWidth);
			el.attr("stroke-linecap", "round");
			r.set = el;
		}
		else if (r.type == "ellipse") {
			var el = this.paper.ellipse(r.raw.param.x, r.raw.param.y, r.raw.param.rx, r.raw.param.ry);
			el.attr("stroke", r.raw.attr.stroke);
			el.attr("stroke-width", r.raw.attr.strokeWidth);
			el.attr("stroke-linecap", "round");
			r.set = el;
		}
		else {
			Logger.e("CubeWhiteboard#redo", "Unknown command type: " + r.type);
		}

		// 发送 VG 命令
		var self = this;
		var sn = r.sn;
		var data = {
			"boardName": self.name,
			"command": {
				"name": "redo",
				"param": sn
			}
		};
		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionVGCmd);
		dialect.appendParam("data", data);
		nucleus.talkService.talk(_WB_CELLET, dialect);
	},

	/**
	 * 清空绘制数据。
	 */
	erase: function(silent) {
		var noTalk = (silent !== undefined && silent);

		if (this.pastRecords.length > 0) {
			for (var i = 0; i < this.pastRecords.length; ++i) {
				var r = this.pastRecords[i];
				// r : {sn: sn, type: type, set: set, raw: {param: param, attr: attr}}
				if (r.set.forEach === undefined) {
					if (r.set._bbox) { r.set._bbox.remove(); r.set._bbox = null; }
					r.set.remove();
				}
				else {
					r.set.forEach(function(e) {
						e.remove();
					});
				}
			}
		}

		if (this.remoteRecordMap.size() > 0) {
			var list = this.remoteRecordMap.values();
			for (var i = 0; i < list.length; ++i) {
				var rlist = list[i];
				for (var j = 0; j < rlist.length; ++j) {
					var r = rlist[j];
					r.el.remove();
				}
			}
		}

		this.pastRecords.splice(0, this.pastRecords.length);
		this.undoRecords.splice(0, this.undoRecords.length);
		this.cmdSnCursor = 0;

		this.remoteRecordMap.clear();
		this.remoteHistoryMap.clear();

		if (!noTalk) {
			// 发送 VG 命令
			var self = this;
			var data = {
				"boardName": self.name,
				"command": {
					"name": "erase",
					"param": 0
				}
			};
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionVGCmd);
			dialect.appendParam("data", data);
			nucleus.talkService.talk(_WB_CELLET, dialect);
		}
	},

	cleanup: function(silent) {
		var noTalk = (silent !== undefined && silent);

		this.exMap.clear();

		this.pastRecords.splice(0, this.pastRecords.length);
		this.undoRecords.splice(0, this.undoRecords.length);
		this.cmdSnCursor = 0;

		this.remoteRecordMap.clear();
		this.remoteHistoryMap.clear();
		if (null != this.remoteSlide) {
			this.remoteSlide.dispose();
			this.remoteSlide = null;
		}

		if (null != this.bgImage) {
			this.bgImage.remove();
			this.bgImage = null;
		}

		this.paper.clear();

		if (!noTalk) {
			// 发送 VG 命令
			var self = this;
			var data = {
				"boardName": self.name,
				"command": {
					"name": "cleanup",
					"param": 0
				}
			};
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionVGCmd);
			dialect.appendParam("data", data);
			nucleus.talkService.talk(_WB_CELLET, dialect);
		}
	},

	/**
	 * 返回幻灯片实体。
	 */
	getSlide: function() {
		return this.exMap.get(SlideEntity.Name);
	},

	getExEntity: function(name) {
		return this.exMap.get(name);
	},

	setBackgroundImage: function(url, loadCallback) {
		var self = this;
		var bgd = this.background;
		var img = bgd.getElementsByTagName('img')[0];
		if (img === undefined || null == img) {
			var newImg = document.createElement('img');
			bgd.appendChild(newImg);
			newImg.onload = function(e) {
				loadCallback.call(null, newImg);

				self._centerBgImage(newImg);
			}
			newImg.src = url;
			return newImg;
		}
		else {
			img.setAttribute('src', '');
			img.onload = function(e) {
				loadCallback.call(null, img);

				self._centerBgImage(img);
			}
			img.setAttribute('src', url);
			return img;
		}
	},

	_centerBgImage: function(img) {
		var x = (this.width - img.width) * 0.5;
		var y = (this.height - img.height) * 0.5;
		this.background.style.paddingLeft = parseInt(x) + 'px';
		this.background.style.paddingTop = parseInt(y) + 'px';
	},

	// 返回命令的 SN 号
	record: function(type, set, raw) {
		var sn = this.cmdSnCursor++;
		this.pastRecords.push({sn: sn, type: type, set: set, raw: raw});
		return sn;
	},

	onRegisterStateChanged: function(session) {
		var state = session.regState;
		if (state == CubeRegistrationState.Ok) {
			this.session = session;

			if (null != this.sharedList) {
				var self = this;
				var data = {
					"boardName": self.name,
					"sharedList": self.sharedList
				};
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionShare);
				dialect.appendParam('data', data);
				nucleus.talkService.talk(_WB_CELLET, dialect);
			}

			var dom = document.getElementById(_WhiteboardSharingPluginDOM);
			if (dom.contentWindow.setAccount)
				dom.contentWindow.setAccount(session.name);
			var self = this;
			if (dom.contentWindow.sharingReady)
				dom.contentWindow.sharingReady(function(file) { self.onSharingReady(file); });
		}
		else {
			this.session = null;
		}
	},

	onDialogue: function(action, dialect) {
		if (action == CubeConst.ActionVGCmd) {
			Logger.d('CubeWhiteboard', 'VG Command received.');

			var data = dialect.getParam("data");
			this._processVGCommand(data);
		}
		else if (action == CubeConst.ActionShareAck) {
			var state = dialect.getParam('state');
			if (state.code == 200) {
				Logger.i('CubeWhiteboard', 'Shared ok.');

				// 回调委派
				this.delegate.didShared(this, this.sharedList);
			}
			else {
				Logger.e('CubeWhiteboard', 'Shared failed!');
				// 失败，将分享列表置空
				this.sharedList = null;

				// 回调委派
				this.delegate.didFailed(this, state.code);
			}
		}
		else if (action == CubeConst.ActionShare) {
			var data = dialect.getParam("data");
			if (null == this.sharedList) {
				// 分享列表为空进行分享数据发送
				this.shareWith([data.from.toString()]);
			}
			else {
				// 判断分享列表，是否包含当前分享
				if (this.sharedList.indexOf(data.from) < 0) {
					this.shareWith([data.from.toString()]);
				}
			}
		}
	},

	onClick: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onClick(e);
		}
		else {
			this.viewport.onClick(e);

			var se = this.getSlide();
			if (null != se) {
				se.onClick(e);
			}
		}
	},

	onMouseMove: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onMouseMove(e);
		}
		else {
			this.viewport.onMouseMove(e);
		}
	},

	onMouseDown: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onMouseDown(e);
		}
		else {
			this.viewport.onMouseDown(e);
		}
	},

	onMouseUp: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onMouseUp(e);
		}
		else {
			this.viewport.onMouseUp(e);
		}
	},

	onTouchMove: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onTouchMove(e);
		}
		else {
			this.viewport.onTouchMove(e);
		}
	},

	onTouchStart: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onTouchStart(e);
		}
		else {
			this.viewport.onTouchStart(e);
		}
	},

	onTouchEnd: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onTouchEnd(e);
		}
		else {
			this.viewport.onTouchEnd(e);
		}
	},

	onKeyPress: function(e) {
		if (null != this.curEntity) {
			this.curEntity.onKeyPress(e);
		}
		else {
			this.viewport.onKeyPress(e);
		}

		var se = this.getSlide();
		if (null != se) {
			se.onKeyPress(e);
		}
	},

	onSharingReady: function(file) {
		// 如果有背景图片，则移除背景图片
		var be = this.exMap.get(BackgroundImageEntity.Name);
		if (null != be) {
			be.dispose();
			this.exMap.remove(BackgroundImageEntity.Name);
			be = null;
		}

		// 擦除
		this.erase();

		// 新幻灯片
		var slide = new SlideEntity(file);
		slide.readMode(this.readMode);
		this.selectEntity(slide);

		if (null != this.delegate) {
			this.delegate.didFileShared(this, file);
		}
	},

	onSlideChanged: function(silde, pageAction) {
		if (null != this.delegate) {
			this.delegate.didSlide(this, silde);
		}
	},

	_processVGCommand: function(data) {
		var boardName = data.boardName;
		//var groupName = data.groupName;
		var from = data.from;
		var to = data.to;
		var command = data.command;
		if (command.name == 'path') {
			this._processVGPath(command, from);
		}
		else if (command.name == 'text') {
			this._processVGText(command, from);
		}
		else if (command.name == 'rect') {
			this._processVGRect(command, from);
		}
		else if (command.name == 'ellipse') {
			this._processVGEllipse(command, from);
		}
		else if (command.name == 'slide') {
			this._processVGSlide(command, from);
		}
		else if (command.name == 'undo') {
			this._processVGUndo(command, from);
		}
		else if (command.name == 'redo') {
			this._processVGRedo(command, from);
		}
		else if (command.name == 'erase') {
			this.erase(true);
		}
		else if (command.name == 'cleanup') {
			this.cleanup(true);
		}
		else if (command.name == 'bgimage') {
			var entity = new BackgroundImageEntity(command.param, true);
			this.selectEntity(entity);
		}
		else {
			Logger.w('CubeWhiteboard', 'Unknown VG command: ' + command.name);
		}
	},

	_processVGPath: function(command, from) {
		var el = this.paper.path(command.param);
		el.attr("stroke", command.attr.stroke);
		el.attr("stroke-width", command.attr.strokeWidth);
		el.attr("stroke-linecap", "round");

		// 记录
		if (this.remoteRecordMap.containsKey(from)) {
			var list = this.remoteRecordMap.get(from);
			list.push({sn: command.sn, type: "path", el: el, raw: {"param": command.param, "attr": command.attr}});
		}
		else {
			var list = [{sn: command.sn, type: "path", el: el, raw: {"param": command.param, "attr": command.attr}}];
			this.remoteRecordMap.put(from, list);
		}
	},

	_processVGText: function(command, from) {
		var el = this.paper.text(command.param.x, command.param.y, command.param.text);
		el.attr("font-family", command.attr.fontFamily);
		el.attr("font-size", command.attr.fontSize);

		// 记录
		if (this.remoteRecordMap.containsKey(from)) {
			var list = this.remoteRecordMap.get(from);
			list.push({sn: command.sn, type: "text", el: el, raw: {"param": command.param, "attr": command.attr}});
		}
		else {
			var list = [{sn: command.sn, type: "text", el: el, raw: {"param": command.param, "attr": command.attr}}];
			this.remoteRecordMap.put(from, list);
		}
	},

	_processVGRect: function(command, from) {
		var el = this.paper.rect(command.param.x, command.param.y, command.param.width, command.param.height);
		el.attr("stroke", command.attr.stroke);
		el.attr("stroke-width", command.attr.strokeWidth);
		el.attr("stroke-linecap", "round");

		// 记录
		if (this.remoteRecordMap.containsKey(from)) {
			var list = this.remoteRecordMap.get(from);
			list.push({sn: command.sn, type: "rect", el: el, raw: {"param": command.param, "attr": command.attr}});
		}
		else {
			var list = [{sn: command.sn, type: "rect", el: el, raw: {"param": command.param, "attr": command.attr}}];
			this.remoteRecordMap.put(from, list);
		}
	},

	_processVGEllipse: function(command, from) {
		var el = this.paper.ellipse(command.param.x, command.param.y, command.param.rx, command.param.ry);
		el.attr("stroke", command.attr.stroke);
		el.attr("stroke-width", command.attr.strokeWidth);
		el.attr("stroke-linecap", "round");

		// 记录
		if (this.remoteRecordMap.containsKey(from)) {
			var list = this.remoteRecordMap.get(from);
			list.push({sn: command.sn, type: "ellipse", el: el, raw: {"param": command.param, "attr": command.attr}});
		}
		else {
			var list = [{sn: command.sn, type: "ellipse", el: el, raw: {"param": command.param, "attr": command.attr}}];
			this.remoteRecordMap.put(from, list);
		}
	},

	_processVGSlide: function(command, from) {
		if (null != this.remoteSlide) {
			if (this.remoteSlide.file.origin == command.param.origin) {
				// 仅更新数据
				var attr = command.attr;
				if (Math.abs(attr.cursor - this.remoteSlide.cursor) > 1 || attr.page == "=") {
					// 页码不同步，进行同步
					this.remoteSlide.gotoPage(attr.cursor + 1);
				}
				else if (attr.page == "<") {
					// 上一页
					this.remoteSlide.prevPage();
				}
				else if (attr.page == ">") {
					// 下一页
					this.remoteSlide.nextPage();
				}
				return;
			}
		}

		// 如果有背景图片，则移除背景图片
		var be = this.exMap.get(BackgroundImageEntity.Name);
		if (null != be) {
			be.dispose();
			this.exMap.remove(BackgroundImageEntity.Name);
			be = null;
		}

		// 擦除
		this.erase(true);

		// 新幻灯片
		this.remoteSlide = new SlideEntity(command.param, true);
		this.remoteSlide.cursor = command.attr.cursor;
		this.selectEntity(this.remoteSlide);
	},

	_processVGUndo: function(command, from) {
		var list = this.remoteRecordMap.get(from);
		if (null != list) {
			var sn = parseInt(command.param);
			var undoList = [];

			for (var i = list.length - 1; i >= 0; --i) {
				var c = list[i];
				if (c.sn >= sn) {
					undoList.push(c);
				}
				else {
					// 列表里的 SN 小于目标 SN 则不需要 undo
					break;
				}
			}

			if (undoList.length > 0) {
				var hlist = this.remoteHistoryMap.get(from);
				if (null == hlist) {
					hlist = [];
					this.remoteHistoryMap.put(from, hlist);
				}

				for (var i = 0; i < undoList.length; ++i) {
					var c = undoList[i];
					hlist.push(c);

					var index = list.indexOf(c);
					if (index >= 0) {
						list.splice(index, 1);
					}

					// c: {sn: sn, type: type, el: el, raw: {param: param, attr: attr}}
					c.el.remove();
				}
			}
		}
	},

	_processVGRedo: function(command, from) {
		var list = this.remoteHistoryMap.get(from);
		if (null != list) {
			var sn = parseInt(command.param);
			var redoList = [];

			for (var i = list.length - 1; i >= 0; --i) {
				var c = list[i];
				if (c.sn <= sn) {
					redoList.push(c);
				}
				else {
					// 列表里的 SN 大目标 SN 则不需要 redo
					break;
				}
			}

			if (redoList.length > 0) {
				var rlist = this.remoteRecordMap.get(from);
				if (null == rlist) {
					rlist = [];
					this.remoteRecordMap.put(from, rlist);
				}

				for (var i = 0; i < redoList.length; ++i) {
					var c = redoList[i];
					rlist.push(c);

					var index = list.indexOf(c);
					if (index >= 0) {
						list.splice(index, 1);
					}

					var type = c.type;
					// c: {sn: sn, type: type, el: el, raw: {param: param, attr: attr}}
					if (type == "path") {
						var el = this.paper.path(c.raw.param);
						el.attr("stroke", c.raw.attr.stroke);
						el.attr("stroke-width", c.raw.attr.strokeWidth);
						el.attr("stroke-linecap", "round");
						c.el = el;
					}
					else if (type == "text") {
						var el = this.paper.text(c.raw.param.x, c.raw.param.y, c.raw.param.text);
						el.attr("font-family", c.raw.attr.fontFamily);
						el.attr("font-size", c.raw.attr.fontSize);
						c.el = el;
					}
					else if (type == "rect") {
						var el = this.paper.rect(c.raw.param.x, c.raw.param.y, c.raw.param.width, c.raw.param.height);
						el.attr("stroke", c.raw.attr.stroke);
						el.attr("stroke-width", c.raw.attr.strokeWidth);
						el.attr("stroke-linecap", "round");
						c.el = el;
					}
					else if (type == "ellipse") {
						var el = this.paper.ellipse(c.raw.param.x, c.raw.param.y, c.raw.param.rx, c.raw.param.ry);
						el.attr("stroke", c.raw.attr.stroke);
						el.attr("stroke-width", c.raw.attr.strokeWidth);
						el.attr("stroke-linecap", "round");
						c.el = el;
					}
					else {
						Logger.e("CubeWhiteboard#_processVGRedo", "Unknown command type: " + type);
					}
				}
			}
		}
	}
});

var CubeViewport = Class({
	wb: null,
	enabled: false,
	down: false,

	domLeft: 0,
	domTop: 0,

	posX: 0,
	posY: 0,

	ctor: function(wb) {
		this.wb = wb;
	},

	manage: function(el) {
		var self = this;
		window.utils.unselectable(el.node);

		el._bbox = null;
		el.click(function(e) {
			if (null == el._bbox) {
				var bb = el.getBBox();
				var bbEl = self.wb.paper.rect(bb.x, bb.y, bb.width, bb.height);
				bbEl.attr('stroke', '#FE0000');
				bbEl.attr('stroke-dasharray', '.');
				el._bbox = bbEl;
			}
			else {
				el._bbox.remove();
				el._bbox = null;
			}
		});
	},

	onClick: function(event) {
	},

	onMouseMove: function(event) {
		if (!this.enabled) {
			return;
		}

		if (this.down) {
			event = event || window.event;
			var x = event.clientX;
			var y = event.clientY;
			var dx = x - this.posX;
			var dy = y - this.posY;

			this.domLeft += parseInt(dx);
			this.domTop += parseInt(dy);

			//var svg = this.wb.dom.getElementsByTagName('svg')[0];
			var svg = this.wb.paperDom;
			svg.style.left = this.domLeft + "px";
			svg.style.top = this.domTop + "px";

			this.posX = x;
			this.posY = y;
		}
	},

	onMouseDown: function(event) {
		if (!this.enabled) {
			return;
		}

		this.down = true;
		document.body.style.cursor = 'move';

		event = event || window.event;
		this.posX = event.clientX;
		this.posY = event.clientY;

		//var svg = this.wb.dom.getElementsByTagName('svg')[0];
		var svg = this.wb.paperDom;

		this.domLeft = svg.style.left.length == 0
			? 0 : parseInt(svg.style.left);
		this.domTop = svg.style.top.length == 0
			? 0 : parseInt(svg.style.top);
	},

	onMouseUp: function(event) {
		if (!this.enabled) {
			return;
		}

		document.body.style.cursor = 'auto';
		this.down = false;
	},

	onTouchMove: function(event) {
	},

	onTouchStart: function(event) {
	},

	onTouchEnd: function(event) {
	},

	onKeyPress: function(event) {
	}
});
