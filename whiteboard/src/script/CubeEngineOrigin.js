//
//

var CubeEngine = function() {
	this.canvas = null;
	this.context = null;
	this.lineX = new Array();
	this.lineY = new Array();
	this.lineN = new Array();

	this.lastX = -1;
	this.lastY = -1;
	this.hue = 0;
	this.flag = 0;
}

CubeEngine.prototype.init = function(id) {
	var self = this;
	var canvas = document.getElementById(id);
	canvas.addEventListener('mousemove', function(e) { self.onMouseMove(e); }, false);
	canvas.addEventListener('mousedown', function(e) { self.onMouseDown(e); }, false);
	canvas.addEventListener('mouseup', function(e) { self.onMouseUp(e); }, false);

	this.context = canvas.getContext('2d');
	this.canvas = canvas;
}

CubeEngine.prototype.onMouseMove = function(evt) {
	if (this.flag == 1) {
		var pos = getDrawPosition(this.canvas, evt);

		var context = this.context;
		this.lineX.push(pos.x);
		this.lineY.push(pos.y);
		this.lineN.push(1);

		context.save();
		context.translate(context.canvas.width/2, context.canvas.height/2);
		context.translate(-context.canvas.width/2, -context.canvas.height/2);

		context.beginPath();
		context.lineWidth = 5;// + Math.random() * 10;  

		for (var i = 1; i < this.lineX.length; i++) {
			this.lastX = this.lineX[i];
			this.lastY = this.lineY[i];
			if (this.lineN[i] == 0) {
				context.moveTo(this.lastX, this.lastY);
			}
			else {
				context.lineTo(this.lastX, this.lastY);
			}
		}

		this.hue = this.hue + 10 * Math.random();
		context.strokeStyle = '#000000';//'hsl(' + this.hue + ', 50%, 50%)';
		context.shadowColor = 'white';
		context.shadowBlur = 10;
		context.stroke();
		context.restore();
	}
}

CubeEngine.prototype.onMouseDown = function(evt) {  
	var pos = getDrawPosition(this.canvas, evt);

	this.flag = 1;
	this.lineX.push(pos.x);
	this.lineY.push(pos.y);
	this.lineN.push(0);
}

CubeEngine.prototype.onMouseUp = function(evt) {
	var pos = getDrawPosition(this.canvas, evt);

	this.flag = 0;
	this.lineX.push(pos.x);
	this.lineY.push(pos.y);
	this.lineN.push(0);
}


function getDrawPosition(dom, evt) {
	var pos = getMousePos(evt);
	var dx = getX(dom);
	var dy = getY(dom);
	return {x: pos.x - dx, y: pos.y - dy};
}

function getMousePos(event) {
	var e = event || window.event;
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
	var x = e.pageX || e.clientX + scrollX;
	var y = e.pageY || e.clientY + scrollY;
	return { 'x': x, 'y': y };
}

function getX(obj) {
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
}
