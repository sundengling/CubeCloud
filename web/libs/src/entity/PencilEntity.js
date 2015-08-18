/*
 * PencilEntity.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

/**
 * 铅笔实体
 */
var PencilEntity = Class(GraphicsEntity, {
	weight: 2,
	color: "#FE0000",

	lastX: -1,
	lastY: -1,
	lineX: [],
	lineY: [],
	flag: 0,

	timer: 0,

	queue: [],
	queueTimer: 0,

	vgCmdArray: null,

	ctor: function(options) {
		GraphicsEntity.prototype.ctor.call(this, "pencil");
		this.exclusive = true;

		if (options != undefined) {
			this.weight = options.weight || 2;
			this.color = options.color || "#FE0000";
		}
	},

	onDraw: function() {
		this.board.paperDom.style.cursor = "url(assets/whiteboard/cursor_pencil.png), default";
	},

	onMouseMove: function(event) {
		this.fireMove(event);
	},

	onMouseDown: function(event) {
		this.fireStart(event);
	},

	onMouseUp: function(event) {
		this.fireEnd(event);
	},

	onTouchMove: function(event) {
		this.fireMove(event);
	},

	onTouchStart: function(event) {
		this.fireStart(event);
	},

	onTouchEnd: function(event) {
		this.fireEnd(event);
	},

	fireMove: function(event) {
		if (this.flag == 1) {
			var pos = window.utils.getDrawPosition(this.board.dom, event);
			this.lineX.push(pos.x);
			this.lineY.push(pos.y);
		}
	},

	fireStart: function(event) {
		var pos = window.utils.getDrawPosition(this.board.dom, event);
		this.lineX.push(pos.x);
		this.lineY.push(pos.y);

		this.flag = 1;

		this.board.paper.setStart();
		this.vgCmdArray = [];

		if (this.timer > 0) {
			clearInterval(this.timer);
		}
		var self = this;
		this.timer = setInterval(function() {
			self.draw();
		}, 60);
	},

	fireEnd: function(event) {
		this.flag = 0;

		if (this.timer > 0) {
			clearInterval(this.timer);
			this.timer = 0;
		}

		this.lineX.splice(0, this.lineX.length);
		this.lineX.length = 0;
		this.lineY.splice(0, this.lineY.length);
		this.lineY.length = 0;

		if (null == this.vgCmdArray) {
			return;
		}

		var self = this;
		var param = self.vgCmdArray.join('');

		var set = self.board.paper.setFinish();
		set.attr('stroke', self.color);
		set.attr('stroke-width', self.weight);
		set.attr('stroke-linecap', "round");

		var sn = self.board.record("path", set, {"param": param, "attr": {"stroke": self.color, "strokeWidth": self.weight}});

		var data = {
			"boardName": self.board.name,
			"command": {
				"name": "path",
				"sn": sn,
				"param": param,
				"attr": {"stroke": self.color, "strokeWidth": self.weight}
			}
		};
		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionVGCmd);
		dialect.appendParam("data", data);
		self.queue.push(dialect);

		self.vgCmdArray.length = 0;
		self.vgCmdArray = null;

		// 进行队列消耗
		self.tick();
	},

	dispose: function() {
		this.board.paperDom.style.cursor = "auto";

		if (this.timer > 0) {
			clearInterval(this.timer);
			this.timer = 0;
		}

		if (this.queueTimer > 0) {
			clearTimeout(this.queueTimer);
			this.queueTimer = 0;
		}

		GraphicsEntity.prototype.dispose.call(this);
	},

	draw: function() {
		if (this.lineX.length <= 1) {
			return;
		}

		var cmd = [];

		this.lastX = this.lineX[0];
		this.lastY = this.lineY[0];
		cmd.push('M' + this.lastX + ',' + this.lastY);

		for (var i = 1; i < this.lineX.length; ++i) {
			this.lastX = this.lineX[i];
			this.lastY = this.lineY[i];
			cmd.push('L' + this.lastX + ',' + this.lastY);
		}

		var vgcmd = cmd.join('');
		if (cmd.length > 1) {
			var el = this.board.paper.path(vgcmd);
			el.attr("stroke", this.color);
			el.attr("stroke-width", this.weight);
			el.attr("stroke-linecap", "round");
		}

		cmd.splice(0, cmd.length);
		cmd = null;

		this.lineX.splice(0, this.lineX.length - 1);
		this.lineY.splice(0, this.lineY.length - 1);

		// 记录命令
		if (null == this.vgCmdArray) {
			this.vgCmdArray = [];
		}
		this.vgCmdArray.push(vgcmd);
	},

	tick: function() {
		if (this.queueTimer > 0) {
			return;
		}

		if (this.queue.length > 0) {
			var dialect = this.queue.shift();
			nucleus.talkService.talk(_WB_CELLET, dialect);
		}

		var self = this;
		this.queueTimer = setTimeout(function() {
			clearTimeout(self.queueTimer);
			self.queueTimer = 0;

			if (self.queue.length == 0) {
				return;
			}

			self.tick();
		}, 300);
	}
});

PencilEntity.Name = "pencil";
