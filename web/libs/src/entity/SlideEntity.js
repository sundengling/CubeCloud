/*
 * SlideEntity.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/6/12.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var SlideLayout = {
	Fill: "fill",
	Warp: "warp"
};

var SlideEntity = Class(GraphicsEntity, {
	file: null,
	obscure: false,

	layout: SlideLayout.Fill,

	cursor: 0,

	presentedImage: null,
	presentedWidth: 0,
	presentedHeight: 0,

	prevImage: null,
	prevWidth: 0,
	prevHeight: 0,

	nextImage: null,
	nextWidth: 0,
	nextHeight: 0,

	// 翻页锁
	pageLock: false,

	// 已经加载过的图片清单
	loadedImageList: [],
	loadedImageSizes: [],

	changedCallback: null,

	offline: false,

	ctor: function(file, obscure) {
		GraphicsEntity.prototype.ctor.call(this, "slide");
		this.exclusive = false;

		this.file = file;

		// FIXME test code
		/*var urls = [];
		for (var i = 1; i <= 37; ++i) {
			if (i < 10) {
				urls.push("http://127.0.0.1:8080/cube/shared/examples/Software_UI_Design-0" + i + ".png");
			}
			else {
				urls.push("http://127.0.0.1:8080/cube/shared/examples/Software_UI_Design-" + i + ".png");
			}
		}
		this.file.urls = urls;*/

		// 判断隐晦规则
		if (obscure === undefined) {
			this.obscure = false;
		}
		else {
			this.obscure = obscure;
		}
	},

	readMode: function(value) {
		if (value) {
			this.layout = SlideLayout.Warp;
			this.offline = true;
		}
		else {
			this.layout = SlideLayout.Fill;
			this.offline = false;
		}
	},

	getDocName: function() {
		return this.file.origin;
	},

	currentPage: function() {
		return (this.cursor + 1);
	},

	numPages: function() {
		return this.file.urls.length;
	},

	/**
	 * 上一页。
	 */
	prevPage: function() {
		if (this.cursor == 0) {
			return;
		}

		if (this.pageLock) {
			return;
		}

		this.pageLock = true;

		// 擦除
		this.board.erase(true);

		var self = this;
		var prev = self.cursor - 1;
		if (null == self.prevImage) {
			self._loadImage(self.board.paper, self.file.urls[prev], function(image, w, h) {
				// 设置图片属性
				self._backupImage(image, w, h);

				self.prevImage = image;
				self.prevWidth = w;
				self.prevHeight = h;

				// 翻页
				self._page(self.prevImage, function() {
					self.cursor -= 1;
					self._preparePrev();
					// 解锁
					self.pageLock = false;
				}, function() {
				});
			});
		}
		else {
			// 翻页
			self._page(self.prevImage, function() {
				self.cursor -= 1;
				self._preparePrev();
				// 解锁
				self.pageLock = false;
			});
		}
	},

	/**
	 * 下一页。
	 */
	nextPage: function() {
		if (this.cursor >= this.file.urls.length - 1) {
			return;
		}

		if (this.pageLock) {
			return;
		}

		this.pageLock = true;

		// 擦除
		this.board.erase(true);

		var self = this;
		var next = self.cursor + 1;
		if (null == self.nextImage) {
			self._loadImage(self.board.paper, self.file.urls[next], function(image, w, h) {
				// 设置图片属性
				self._backupImage(image, w, h);

				self.nextImage = image;
				self.nextWidth = w;
				self.nextHeight = h;

				// 翻页
				self._page(self.nextImage, function() {
					self.cursor += 1;
					self._prepareNext();
					// 解锁
					self.pageLock = false;
				});
			});
		}
		else {
			// 翻页
			self._page(self.nextImage, function() {
				self.cursor += 1;
				self._prepareNext();
				// 解锁
				self.pageLock = false;
			});
		}
	},

	/**
	 * 跳转到指定页。
	 */
	gotoPage: function(page) {
		var newCursor = page - 1;

		if (newCursor == this.cursor ||
			newCursor < 0 ||
			newCursor > this.file.urls.length - 1) {
			// 新页签不合法
			return;
		}

		// 擦除
		this.board.erase(true);

		var self = this;
		var task = function() {
			if (null != self.prevImage) {
				self.prevImage.remove();
			}
			if (null != self.nextImage) {
				self.nextImage.remove();
			}
			if (null != self.presentedImage) {
				self.presentedImage.remove();
			}

			self._loadImage(self.board.paper, self.file.urls[newCursor], function(image, w, h) {
				// 提交主图像
				self._presentImage(image, w, h);
			});

			if (newCursor > 0) {
				self._loadImage(self.board.paper, self.file.urls[newCursor - 1], function(image, w, h) {
					// 设置图片属性
					self._backupImage(image, w, h);
					self.prevImage = image;
					self.prevWidth = w;
					self.prevHeight = h;
				});
			}

			if (newCursor < self.file.urls.length - 1) {
				self._loadImage(self.board.paper, self.file.urls[newCursor + 1], function(image, w, h) {
					// 设置图片属性
					self._backupImage(image, w, h);
					self.nextImage = image;
					self.nextWidth = w;
					self.nextHeight = h;
				});
			}

			// 更新游标
			self.cursor = newCursor;
			// 解锁
			self.pageLock = false;

			if (null != self.changedCallback) {
				self.changedCallback.call(self.board, self, "=");
			}

			// 非隐晦模式发送数据
			if (!self.obscure && !self.offline) {
				var data = {
					"boardName": self.board.name,
					"command": {
						"name": "slide",
						"param": self.file,
						"attr": { "cursor": self.cursor, "page": "=" }
					}
				};
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionVGCmd);
				dialect.appendParam("data", data);
				nucleus.talkService.talk(_WB_CELLET, dialect);
			}
		};

		if (this.pageLock) {
			setTimeout(function() {
				self.pageLock = true;
				task();
			}, 200);
		}
		else {
			task();
		}
	},

	dispose: function() {
		if (null != this.presentedImage) {
			this.presentedImage.remove();
			this.presentedImage = null;
		}

		if (null != this.nextImage) {
			this.nextImage.remove();
			this.nextImage = null;
		}

		if (null != this.prevImage) {
			this.prevImage.remove();
			this.prevImage = null;
		}

		this.board.dom.style.overflow = "hidden";
		this.board.paper.setSize(this.board.width, this.board.height);

		GraphicsEntity.prototype.dispose.call(this);
	},

	onDraw: function(context) {
		var self = this;

		var old = self.board.getExEntity(SlideEntity.Name);
		if (null != old) {
			old.dispose();
		}

		// 设置回调
		self.changedCallback = self.board.onSlideChanged;

		self._loadImage(context, self.file.urls[self.cursor], function(image, w, h) {
			// 提交主图像
			self._presentImage(image, w, h);

			// 发送命令
			// 非隐晦模式发送数据
			if (!self.obscure && !self.offline) {
				var data = {
					"boardName": self.board.name,
					"command": {
						"name": "slide",
						"param": self.file,
						"attr": { "cursor": self.cursor, "page": "*" }
					}
				};
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionVGCmd);
				dialect.appendParam("data", data);
				nucleus.talkService.talk(_WB_CELLET, dialect);
			}

			self.changedCallback.call(self.board, self, "*");
		});

		if (self.file.urls.length > 1 && (self.cursor + 1) < self.file.urls.length) {
			self._loadImage(context, self.file.urls[self.cursor + 1], function(image, w, h) {
				self._backupImage(image, w, h);
				self.nextImage = image;
				self.nextWidth = w;
				self.nextHeight = h;
			});
		}
	},

	onResize: function(width, height) {
		// 矫正图片大小
		this._adjustImageSize(this.presentedImage, this.presentedWidth, this.presentedHeight, width, height);
		this._adjustImageSize(this.prevImage, this.prevWidth, this.prevHeight, width, height);
		this._adjustImageSize(this.nextImage, this.nextWidth, this.nextHeight, width, height);
	},

	onClick: function(event) {
		if (this.obscure) {
			return;
		}

		var pos = window.utils.getDrawPosition(this.board.dom, event);
		var bw = this.board.width;
		if (pos.x > bw * 0.5) {
			this.nextPage();
		}
		else {
			this.prevPage();
		}
	},

	onKeyPress: function(event) {
		if (this.obscure) {
			return;
		}

		var kc = event.which || event.keyCode;
		// 右箭头: 39, ]: 93
		// 左箭头: 37, [: 91
		if (kc == 39 || kc == 93) {
			// next
			this.nextPage();
		}
		else if (kc == 37 || kc == 91) {
			// prev
			this.prevPage();
		}
	},

	_presentImage: function(image, w, h) {
		var self = this;
		self.presentedImage = image;
		self.presentedWidth = w;
		self.presentedHeight = h;

		if (null == image.node) {
			setTimeout(function() {
				self._adjustImageSize(image, w, h, self.board.width, self.board.height);
			}, 40);
		}
		else {
			self._adjustImageSize(image, w, h, self.board.width, self.board.height);
		}

		image.attr("opacity", 1);
		// 置底
		image.toBack();

		if (null != self.prevImage) {
			self.prevImage.toBack();
		}
		if (null != self.nextImage) {
			self.nextImage.toBack();
		}
	},

	_backupImage: function(image, w, h) {
		var self = this;

		if (null == image.node) {
			setTimeout(function() {
				self._adjustImageSize(image, w, h, self.board.width, self.board.height);
			}, 40);
		}
		else {
			self._adjustImageSize(image, w, h, self.board.width, self.board.height);
		}

		// 设置透明度
		image.attr("opacity", 0);

		// 置底
		image.toBack();
	},

	_preparePrev: function() {
		var self = this;
		// 非隐晦模式发送数据
		if (!self.obscure && !self.offline) {
			var data = {
				"boardName": self.board.name,
				"command": {
					"name": "slide",
					"param": self.file,
					"attr": { "cursor": self.cursor, "page": "<" }
				}
			};
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionVGCmd);
			dialect.appendParam("data", data);
			nucleus.talkService.talk(_WB_CELLET, dialect);
		}

		if (null != this.nextImage) {
			this.nextImage.remove();
		}
		this.nextImage = this.presentedImage;
		this.presentedImage = this.prevImage;

		if (this.cursor == 0) {
			// 第一页
			this.prevImage = null;

			if (null != this.changedCallback) {
				this.changedCallback.call(this.board, this, "<");
			}

			return;
		}

		// 加载上一页
		self._loadImage(self.board.paper, self.file.urls[self.cursor - 1], function(image, w, h) {
				self._backupImage(image, w, h);
				self.prevImage = image;
				self.prevWidth = w;
				self.prevHeight = h;

				if (null != self.changedCallback) {
					self.changedCallback.call(self.board, self, "<");
				}
			});
	},

	_prepareNext: function() {
		var self = this;
		// 非隐晦模式发送数据
		if (!self.obscure && !self.offline) {
			var data = {
				"boardName": self.board.name,
				"command": {
					"name": "slide",
					"param": self.file,
					"attr": { "cursor": self.cursor, "page": ">" }
				}
			};
			var dialect = new ActionDialect();
			dialect.setAction(CubeConst.ActionVGCmd);
			dialect.appendParam("data", data);
			nucleus.talkService.talk(_WB_CELLET, dialect);
		}

		if (null != this.prevImage) {
			this.prevImage.remove();
		}
		this.prevImage = this.presentedImage;
		this.presentedImage = this.nextImage;

		if (this.cursor + 1 >= this.file.urls.length - 1) {
			// 最后一页
			this.nextImage = null;

			if (null != this.changedCallback) {
				this.changedCallback.call(this.board, this, ">");
			}

			return;
		}

		// 加载下一页
		self._loadImage(self.board.paper, self.file.urls[self.cursor + 1], function(image, w, h) {
				self._backupImage(image, w, h);
				self.nextImage = image;
				self.nextWidth = w;
				self.nextHeight = h;

				if (null != self.changedCallback) {
					self.changedCallback.call(self.board, self, ">");
				}
			});
	},

	_page: function(destImage, completed) {
		if (null == this.presentedImage) {
			return;
		}

		this.presentedImage.animate({"opacity": 0}, 300, "linear");

		destImage.animate({"opacity": 1.0}, 300, "linear", function() {
				completed.call(null);
			});
	},

	_loadImage: function(context, url, cb, error) {
		var index = this.loadedImageList.indexOf(url);
		if (index >= 0) {
			var size = this.loadedImageSizes[index];

			// 加载图片
			var imgEl = context.image(url, 0, 0, size.width, size.height);

			// 不可选择
			imgEl.node.setAttribute("unselectable", "on");
			imgEl.node.className = "unselectable";
			imgEl.node.onmousedown = function() {return false;}
			var s = imgEl.node.style;
			s.userSelect = "none";
			s.webkitUserSelect = "none";
			s.MozUserSelect = "-moz-none";

			cb.call(null, imgEl, size.width, size.height);

			return;
		}

		var self = this;
		var image = new Image();
		image.onload = function(e) {
			var w = image.width;
			var h = image.height;

			self.loadedImageList.push(url.toString());
			self.loadedImageSizes.push({width: w, height: h});

			var imgEl = context.image(url, 0, 0, w, h);

			// 不可选择
			imgEl.node.setAttribute("unselectable", "on");
			imgEl.node.className = "unselectable";
			imgEl.node.onmousedown = function() {return false;}
			var s = imgEl.node.style;
			s.userSelect = "none";
			s.webkitUserSelect = "none";
			s.MozUserSelect = "-moz-none";

			cb.call(null, imgEl, w, h);
		};
		image.src = url;
	},

	_adjustImageSize: function(image, rawWidth, rawHeight, boardWidth, boardHeight) {
		if (null != image && null != image.node) {
			if (this.layout == SlideLayout.Fill) {
				this.board.dom.style.overflow = "hidden";

				var iw = rawWidth;
				var ih = rawHeight;
	
				var rw = boardWidth / iw;
				var rh = boardHeight / ih;
				if (rw < rh) {
					image.node.setAttribute('width', parseInt(rw * iw));
					image.node.setAttribute('height', parseInt(rw * ih));
				}
				else {
					image.node.setAttribute('width', parseInt(rh * iw));
					image.node.setAttribute('height', parseInt(rh * ih));
				}
	
				// 居中
				var x = (boardWidth - parseInt(image.node.getAttribute('width'))) * 0.5;
				var y = (boardHeight - parseInt(image.node.getAttribute('height'))) * 0.5;
				image.node.setAttribute('x', parseInt(x));
				image.node.setAttribute('y', parseInt(y));
			}
			else if (this.layout == SlideLayout.Warp) {
				this.board.dom.style.overflow = "auto";
				this.board.paper.setSize(Math.max(boardWidth, rawWidth), Math.max(boardHeight, rawHeight));

				if (boardWidth > rawWidth) {
					var x = (boardWidth - rawWidth) * 0.5;
					image.node.setAttribute('x', parseInt(x));
				}
				if (boardHeight > rawHeight) {
					var y = (boardHeight - rawHeight) * 0.5;
					image.node.setAttribute('y', parseInt(y));
				}
			}
		}
	}
});

SlideEntity.Name = "slide";
