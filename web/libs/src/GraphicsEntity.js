/*
 * GraphicsEntity.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var GraphicsEntity = Class({
	name: "",
	board: null,
	exclusive: false,

	ctor: function(name) {
		this.name = name;
	},

	dispose: function() {
		this.board = null;
	},

	onDraw: function(context) {
		// Nothing
	},

	onResize: function(width, height) {
		// Nothing
	},

	onClick: function(e) {
		// Nothing
	},

	onMouseMove: function(e) {
		// Nothing
	},

	onMouseDown: function(e) {
		// Nothing
	},

	onMouseUp: function(e) {
		// Nothing
	},

	onTouchMove: function(e) {
		// Nothing
	},

	onTouchStart: function(e) {
		// Nothing
	},

	onTouchEnd: function(e) {
		// Nothing
	},

	onKeyPress: function(e) {
		// Nothing
	}
});


/**
 * 背景图片实体。
 */
var BackgroundImageEntity = Class(GraphicsEntity, {
	source: null,
	obscure: false,
	domImage: null,
	img: null,
	rawWidth: 0,
	rawHeight: 0,

	ctor: function(source, obscure) {
		GraphicsEntity.prototype.ctor.call(this, "bgimage");

		// 非独占
		this.exclusive = false;

		if (source === undefined) {
			this.source = null;
		}
		else {
			this.source = source;
		}

		if (obscure === undefined) {
			this.obscure = false;
		}
		else {
			this.obscure = obscure;
		}
	},

	dispose: function() {
		var self = this;
		if (null != self.board.bgImage) {
			self.board.bgImage.remove();
			self.board.bgImage = null;
		}

		GraphicsEntity.prototype.dispose.call(this);
	},

	onDraw: function() {
		var self = this;

		if (null == self.source) {
			if (null != self.board.bgImage) {
				self.board.bgImage.remove();
				self.board.bgImage = null;
			}
			return;
		}

		var image = new Image();
		image.onload = function(e) {
			var w = image.width;
			var h = image.height;

			self.rawWidth = w;
			self.rawHeight = h;

			Logger.i("BackgroundImageEntity", "Image size: " + w + "x" + h);

			if (null != self.board.bgImage) {
				self.board.bgImage.remove();
				self.board.bgImage = null;
			}

			self.img = self.board.paper.image(self.source, 0, 0, w, h);
			self.board.bgImage = self.img;

			if (null == self.img.node) {
				setTimeout(function() {
					self.onResize(self.board.width, self.board.height);
				}, 60);
			}
			else {
				self.onResize(self.board.width, self.board.height);
			}

			// 放到底层
			self.img.toBack();

			// 不可选择
			self.board.bgImage.node.setAttribute("unselectable", "on");
			self.board.bgImage.node.className = "unselectable";
			self.board.bgImage.node.onmousedown = function() {return false;}
			var s = self.board.bgImage.node.style;
			s.userSelect = "none";
			s.webkitUserSelect = "none";
			s.MozUserSelect = "-moz-none";
		};
		image.src = self.source;

		// 发送命令
		var self = this;
		// 非隐晦模式发送数据
		if (!this.obscure) {
			var data = {
				"boardName": self.board.name,
				"command": {
					"name": "bgimage",
					"param": self.source
				}
			};
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionVGCmd);
			dialect.appendParam("data", data);
			nucleus.talkService.talk(_WB_CELLET, dialect);
		}

		/*var self = this;
		this.domImage = this.board.setBackgroundImage(this.source, function(image) {
			var w = image.width;
			var h = image.height;

			self.rawWidth = w;
			self.rawHeight = h;

			Logger.i("ImageEntity", "Image size: " + w + "x" + h);

			self.onResize(self.board.width, self.board.height);
		});*/
	},

	onResize: function(width, height) {
		if (null != this.img && null != this.img.node) {
			var iw = this.rawWidth;
			var ih = this.rawHeight;

			var rw = width / iw;
			var rh = height / ih;
			if (rw < rh) {
				this.img.node.setAttribute('width', parseInt(rw * iw));
				this.img.node.setAttribute('height', parseInt(rw * ih));
			}
			else {
				this.img.node.setAttribute('width', parseInt(rh * iw));
				this.img.node.setAttribute('height', parseInt(rh * ih));
			}

			// 居中
			var x = (width - parseInt(this.img.node.getAttribute('width'))) * 0.5;
			var y = (height - parseInt(this.img.node.getAttribute('height'))) * 0.5;
			this.img.node.setAttribute('x', parseInt(x));
			this.img.node.setAttribute('y', parseInt(y));
		}
		/*else if (null != this.domImage) {
			var iw = this.rawWidth;
			var ih = this.rawHeight;

			var rw = width / iw;
			var rh = height / ih;
			if (rw < rh) {
				this.domImage.width = (rw * iw);
				this.domImage.height = (rw * ih);
			}
			else {
				this.domImage.width = (rh * iw);
				this.domImage.height = (rh * ih);
			}
		}*/
	},

	getSource: function() {
		return this.source;
	}
});

BackgroundImageEntity.Name = "bgimage";
