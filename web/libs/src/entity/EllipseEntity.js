/*
 * EllipseEntity.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/6/22.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

/**
 * 椭圆实体。
 */
var EllipseEntity = Class(GraphicsEntity, {
	borderWidth: 2,
	borderColor: "#FE0000",

	flag: false,
	startPos: null,
	endPos: null,

	drawTimer: 0,
	drawEl: null,

	ctor: function(options) {
		GraphicsEntity.prototype.ctor.call(this, "ellipse");
		this.exclusive = true;

		if (options != undefined) {
			this.borderWidth = options.borderWidth || 2;
			this.borderColor = options.borderColor || "#FE0000";
		}
	},

	fireBegin: function(event) {
		this.flag = true;
		this.startPos = window.utils.getDrawPosition(this.board.dom, event);

		if (this.drawTimer > 0) {
			clearTimeout(this.drawTimer);
			this.drawTimer = 0;
		}
	},

	fireEnd: function(event) {
		this.flag = false;

		if (this.drawTimer > 0) {
			clearTimeout(this.drawTimer);
			this.drawTimer = 0;
		}

		if (null != this.drawEl) {
			this.drawEl.remove();
		}

		this.endPos = window.utils.getDrawPosition(this.board.dom, event);
		this.draw(this.startPos, this.endPos);

		var self = this;
		var param = { x: self.drawEl.attr("cx"), y: self.drawEl.attr("cy"),
					rx: self.drawEl.attr("rx"), ry: self.drawEl.attr("ry") };
		var attr = { "stroke": self.borderColor, "strokeWidth": self.borderWidth };

		var sn = self.board.record("ellipse", self.drawEl, {"param": param, "attr": attr});

		// 发送数据
		var data = {
			"boardName": self.board.name,
			"command": {
				"name": "ellipse",
				"sn": sn,
				"param": param,
				"attr": attr
			}
		};
		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionVGCmd);
		dialect.appendParam("data", data);
		nucleus.talkService.talk(_WB_CELLET, dialect);

		this.drawEl = null;
	},

	fireMove: function(event) {
		if (!this.flag) {
			return;
		}

		if (this.drawTimer > 0) {
			return;
		}

		var self = this;
		this.drawTimer = setTimeout(function() {
			clearTimeout(self.drawTimer);
			self.drawTimer = 0;

			if (null != self.drawEl) {
				self.drawEl.remove();
			}

			var pos = window.utils.getDrawPosition(self.board.dom, event);
			self.draw(self.startPos, pos);
		}, 40);
	},

	draw: function(begin, end) {
		var rx = parseInt((end.x - begin.x) * 0.5);
		var ry = parseInt((end.y - begin.y) * 0.5);
		var x = begin.x + rx;
		var y = begin.y + ry;

		if (rx < 0) {
			rx = Math.abs(rx);
		}
		if (ry < 0) {
			ry = Math.abs(ry);
		}

		this.drawEl = this.board.paper.ellipse(x, y, rx, ry);
		this.drawEl.attr("stroke", this.borderColor);
		this.drawEl.attr("stroke-width", this.borderWidth);
		this.drawEl.attr("stroke-linecap", "round");
	},

	onMouseMove: function(e) {
		this.fireMove(e);
	},

	onMouseDown: function(e) {
		this.fireBegin(e);
	},

	onMouseUp: function(e) {
		this.fireEnd(e);
	},

	onTouchMove: function(e) {
		// Nothing
	},

	onTouchStart: function(e) {
		// Nothing
	},

	onTouchEnd: function(e) {
		// Nothing
	}
});

EllipseEntity.Name = "ellipse";
