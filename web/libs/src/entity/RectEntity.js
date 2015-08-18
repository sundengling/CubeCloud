/*
 * RectEntity.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

/**
 * 矩形实体。
 */
var RectEntity = Class(GraphicsEntity, {
	borderWidth: 2,
	borderColor: "#FE0000",

	flag: false,
	startPos: null,
	endPos: null,

	drawTimer: 0,
	drawEl: null,

	ctor: function(options) {
		GraphicsEntity.prototype.ctor.call(this, "rect");
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
		var param = { x: self.drawEl.attr("x"), y: self.drawEl.attr("y"),
					width: self.drawEl.attr("width"), height: self.drawEl.attr("height") };
		var attr = { "stroke": self.borderColor, "strokeWidth": self.borderWidth };

		var sn = self.board.record("rect", self.drawEl, {"param": param, "attr": attr});

		// 发送数据
		var data = {
			"boardName": self.board.name,
			"command": {
				"name": "rect",
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
		var x = begin.x;
		var y = begin.y;
		var w = end.x - begin.x;
		var h = end.y - begin.y;

		if (w < 0) {
			x = end.x;
			w = Math.abs(w);
		}

		if (h < 0) {
			y = end.y;
			h = Math.abs(h);
		}

		this.drawEl = this.board.paper.rect(x, y, w, h);
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

RectEntity.Name = "rect";
