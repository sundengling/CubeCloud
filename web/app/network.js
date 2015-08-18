/**
 * 
 */

// 网速监听器
var NetworkSpeedListener = Class({
	ctor: function() {},
	
	onSpeedUp: function(speedBps, speedKbps, speedMbps) {},
	
	onSpeedDown: function(speedBps, speedKbps, speedMbps) {},
});

// 网络类
var Network = Class({
	filePath: "assets/test.jpg",
	startTime: 0,
	endTime: 0,
	useTime: 0,
	fileSize: 0,
	
	networkSpeedListener: null,
	
	ctor: function() {
		
	},
	
	setNetworkSpeedListener: function(listener) {
		this.networkSpeedListener = listener;
	},
	
	checkSpeed: function() {
		var self = this;
		
		var url = self.filePath + "?" + self.startTime;
		
		var xhr = $.ajax({
			type: "HEAD",
			url: url,
			success: function(data, textStatus, jqXHR) {
				self.fileSize = xhr.getResponseHeader('Content-Length');	// Byte
				self.startTime = new Date().valueOf();
				
				console.log("url:" + url);
				console.log("fileSize:" + self.fileSize);
				
				$.post(url, function(data, textStatus, jqXHR) {
					self.endTime = new Date().valueOf();
					self.useTime = Math.round((self.endTime - self.startTime) / 1000); // 秒
					
					console.log("上行useTime:" + (self.useTime) + "/s");
					
					var bitsLoaded = self.fileSize * 8;	// bit
					var speedBps = Math.round(bitsLoaded / self.useTime); 	// Bps
					var speedKbps = (speedBps / 1024).toFixed(2);			// Kbps
					var speedMbps = (speedKbps / 1024).toFixed(2);			// Mbps
					
					if(null != self.networkSpeedListener) {
						self.networkSpeedListener.onSpeedUp(speedBps, speedKbps, speedMbps);
					}
				});
				
				$.get(url, function(data, textStatus, jqXHR) {
					self.endTime = new Date().valueOf();
					self.useTime = Math.round((self.endTime - self.startTime) / 1000); // 秒
					
					console.log("下行useTime:" + (self.useTime) + "/s");
					
					var bitsLoaded = self.fileSize * 8;	// bit
					var speedBps = Math.round(bitsLoaded / self.useTime); 	// Bps
					var speedKbps = (speedBps / 1024).toFixed(2);			// Kbps
					var speedMbps = (speedKbps / 1024).toFixed(2);			// Kbps
					
					if(null != self.networkSpeedListener) {
						self.networkSpeedListener.onSpeedDown(speedBps, speedKbps, speedMbps);
					}
				});
			}
		});
	}
	
});

// 初始化
(function(global) {
	Network.sharedInstance = new Network();
	global.network = Network.sharedInstance;
})(window);