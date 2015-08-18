/*
 * TextEntity.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

/**
 * 文本实体。
 */
var TextEntity = Class(GraphicsEntity, {
	inputDom: null,
	input: false,
	fontFamily: '黑体',
	fontSize: '16',

	ctor: function() {
		GraphicsEntity.prototype.ctor.call(this, "text");
		this.exclusive = true;
	},

	dispose: function() {
		if (null != this.inputDom) {
			this.inputDom.remove();
			this.inputDom.value = '';
		}

		this.input = false;

		GraphicsEntity.prototype.dispose.call(this);
	},

	onClick: function(event) {
		if (null == this.inputDom) {
			this.inputDom = this._createInputDom();
		}

		if (event.target == this.inputDom) {
			return;
		}

		if (this.input) {
			var text = this.inputDom.value;

			if (text.length > 0) {
				var x = parseInt(this.inputDom.style.left) + 83;
				var y = parseInt(this.inputDom.style.top) + 15;
				var el = this.board.paper.text(x, y, text);
				el.attr('font-family', this.fontFamily);
				el.attr('font-size', this.fontSize);

				// 视口对元素进行管理
				this.board.viewport.manage(el);

				var self = this;
				var param = {x: x, y: y, text: text.toString()};

				// 记录
				var sn = self.board.record("text", el, {'param': param, 'attr': {'fontFamily': self.fontFamily, 'fontSize': self.fontSize}});

				// 发送数据
				var data = {
					"boardName": self.board.name,
					"command": {
						"name": "text",
						"sn": sn,
						"param": param,
						"attr": {'fontFamily': self.fontFamily, 'fontSize': self.fontSize}
					}
				};
				var dialect = new ActionDialect();
				dialect.setAction(CubeConst.ActionVGCmd);
				dialect.appendParam("data", data);
				nucleus.talkService.talk(_WB_CELLET, dialect);
			}

			this.inputDom.value = '';
			this.inputDom.remove();
			this.input = false;
		}
		else {
			var pos = window.utils.getDrawPosition(this.board.dom, event);
			this.inputDom.style.left = (pos.x - 83) + "px";
			this.inputDom.style.top = (pos.y - 15) + "px";
			this.board.dom.appendChild(this.inputDom);
			this.inputDom.focus();
			this.input = true;
		}
	},

	_createInputDom: function() {
		var dom = document.createElement("input");
		dom.setAttribute("type", "text");
		dom.setAttribute("maxlength", "128");
		dom.style.position = "absolute";
		dom.style.cssFloat = "left";
		dom.style.styleFloat = "left";
		dom.style.padding = "0px";
		dom.style.margin = "0px";
		dom.style.width = "200px";
		dom.style.textAlign = "center";
		return dom;
	}
});

TextEntity.Name = "text";
