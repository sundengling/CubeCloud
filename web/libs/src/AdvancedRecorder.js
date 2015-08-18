/*
 * AdvancedRecorder.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/7/8.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeAdvancedRecorder = Class({
	preview: null,
	maxWidth: 320,
	maxHeight: 240,
	maxFrameRate: 20,
	minFrameRate: 5,

	// 默认间隔 30 秒
	interval: 30000,

	stream: null,
	recorder: null,
	timer: 0,

	storeKeyList: [],
	durationList: [],
	sizeList: [],

	prefix: "cube",

	ctor: function(previewVideo, config) {
		if (undefined !== previewVideo && null != previewVideo) {
			this.preview = previewVideo;
		}

		// 读取配置
		this.interval = config.interval || 30000;

		Logger.d("AdvancedRecorder", "config: " + JSON.stringify(config));
	},

	startRecording: function(stream) {
		if (this.timer > 0) {
			return false;
		}

		this.prefix = "" + parseInt(Date.now() / 1000.0);

		var self = this;
		var handle = function(stream) {
			self.stream = stream;

			if (null != self.preview) {
				self.attachMediaStream(self.preview, stream);
				self.preview.muted = true;
				self.preview.controls = false;
				self.preview.style.visibility = 'visible';
			}

			// 记录器
			self.recorder = new CubeRecorder();
			self.recorder.startRecording(self.stream);

			self.timer = setTimeout(function() {
				self._continue();
			}, self.interval);
		}

		if (stream === undefined || null == stream) {
			var constraints = null;
			if (utils.isFirefox) {
				constraints = {
					"width": { "min": 160, "max": self.maxWidth },
					"height": { "min": 120, "max": self.maxHeight },
					"frameRate": parseInt(self.maxFrameRate),
					"require": ["width", "height", "frameRate"]};
			}
			else {
				constraints = {
					"mandatory": {
						"maxWidth": self.maxWidth,
						"maxHeight": self.maxHeight,
						"minWidth": 160,
						"minHeight": 120,
						"maxFrameRate": self.maxFrameRate,
						"minFrameRate": self.minFrameRate
					}};
			}
			navigator.getUserMedia({
					audio: true,
					video: constraints
				}, function(stream) {
					handle(stream);
				}, function(error) {
					alert(JSON.stringify(error));
				});
		}
		else {
			handle(stream);
		}

		return true;
	},

	stopRecording: function(callback) {
		clearTimeout(this.timer);
		this.timer = 0;

		var self = this;

		// 停止录制
		this.recorder.stopRecording(function(r) {
			// 保存 Key 值
			self.storeKeyList.push(self.recorder.startTime + 0);
			// 记录时长
			self.durationList.push(self.recorder.duration + 0);
			// 记录文件长度
			self.sizeList.push(self.recorder.getSize() + 0);

			var old = self.recorder;
			var timestamp = old.save(self.prefix, function() {
				old.dispose();
				old = null;
			});

			self.recorder = null;

			if (null != self.preview) {
				self.preview.src = utils.isFirefox ? null : "";

				try {
					self.stream.stop();
				} catch (e) {
				}
			}

			self.stream = null;

			callback.call(null, self);
		});
	},

	pauseRecording: function() {
	},

	resumeRecording: function() {
	},

	uploadRecordings: function(url, parameter, success, error) {
		if (this.storeKeyList.length > 0) {
			// 取出数据
			var t = this.storeKeyList.shift();

			var r = new CubeRecorder();
			r.startTime = t;

			var self = this;

			// 从缓存上传
			r._uploadFromDB(url, parameter, function() {
				r._deleteFromDB();

				if (self.storeKeyList.length > 0) {
					setTimeout(function() {
						self.uploadRecordings(url, parameter, success, error);
					}, 10);
				}
				else {
					success.call(null, self, parameter);
				}

				r = null;
			}, error);
		}

		return true;
	},

	replay: function(video, audio) {
		alert();
	},

	clearAll: function() {
		var self = this;
		// 开启数据库
		var db = null;
		var request = window.indexedDB.open("_cube_recording", 1);
		request.onerror = function(event) {
			Logger.e("CubeRecorder", "Can NOT use IndexedDB");
		};
		request.onupgradeneeded = function(event) {
			db = event.target.result;

			if (!db.objectStoreNames.contains("recording")) {
				var objectStore = db.createObjectStore("recording", { keyPath: "time" });
				objectStore.createIndex("time", "time", { unique:true });
			}
		};
		request.onsuccess = function(event) {
			db = event.target.result;

			//db.transaction(["recording"], "readwrite").objectStore("recording")['delete'](self.startTime);
		};
	},

	numRecordings: function() {
		return this.storeKeyList.length;
	},

	getDuration: function() {
		var ret = 0;

		if (this.durationList.length > 0) {
			for (var i = 0; i < this.durationList.length; ++i) {
				ret += this.durationList[i];
			}
		}

		if (null != this.recorder) {
			ret += this.recorder.getDuration();
		}

		return ret;
	},

	getSize: function() {
		var ret = 0;

		if (this.sizeList.length > 0) {
			for (var i = 0; i < this.sizeList.length; ++i) {
				ret += this.sizeList[i];
			}
		}

		if (null != this.recorder && !this.recorder.recording) {
			ret += this.recorder.getSize();
		}

		return ret;
	},

	_continue: function() {
		if (null == this.recorder) {
			return;
		}

		clearTimeout(this.timer);

		var self = this;

		// 停止录制
		var old = self.recorder;
		this.recorder.stopRecording(function(r) {
			var timestamp = old.save(self.prefix, function() {
				old.dispose();
			});

			// 保存 Key 值
			self.storeKeyList.push(timestamp);
			// 记录时长
			self.durationList.push(old.duration + 0);
			// 记录文件长度
			self.sizeList.push(old.getSize() + 0);
		});

		// 启动新的记录器
		self.recorder = new CubeRecorder();
		self.recorder.startRecording(self.stream);

		self.timer = setTimeout(function() {
			self._continue();
		}, self.interval);
	},

	attachMediaStream: function(video, stream) {
		if (window.URL) {
			// Chrome case: URL.createObjectURL() converts a MediaStream to a blob URL
			video.src = window.URL.createObjectURL(stream);
		}
		else {
			// Firefox and Opera: the src of the video can be set directly from the stream
			video.src = stream;
		}

		video.onloadedmetadata = function(e) {
			video.play();
		};
	}
});
