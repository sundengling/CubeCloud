//
// Utils.js

;(function(global){
	if (undefined === global.cube) {
		global.cube = {};
	}

	var self = null;
	global.cube.utils = {
		getDrawPosition: function(dom, evt) {
			var pos = self.getMousePos(evt);
			var dpos = self.getDomPosition(dom);
			return {x: pos.x - dpos.x, y: pos.y - dpos.y};
		},

		getMousePos: function(event) {
			var e = event || window.event;
			var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			var x = e.pageX || e.clientX + scrollX;
			var y = e.pageY || e.clientY + scrollY;
			return {x: x, y: y};
		},

		getDomPosition: function(obj) {
			var left = obj.offsetLeft;
			var top = obj.offsetTop;

			var parObj = obj;
			while ((parObj = parObj.offsetParent) != null) {
				left += parObj.offsetLeft;
				top += parObj.offsetTop;
			}

			return {x: left, y: top};
		}
	};

	self = global.cube.utils;

	/*function getX(obj) {
		var left = obj.offsetLeft;
		var parObj = obj;
		while ((parObj = parObj.offsetParent) != null) {
			left += parObj.offsetLeft;
		}
		return left;
	}
	
	function getY(obj) {
		var top = obj.offsetTop;
		var parObj = obj;
		while ((parObj = parObj.offsetParent) != null) {
			top += parObj.offsetTop;
		}
		return top;
	}*/
})(window);
