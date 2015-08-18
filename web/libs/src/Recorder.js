/*
 * Recorder.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/6/26.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeRecorder = Class({
	isFirefox: !!navigator.mozGetUserMedia,
	recording: false,

	// 结束回调
	recordEnd: null,

	maxWidth: 320,
	maxHeight: 240,
	maxFrameRate: 15,
	minFrameRate: 5,

	recordVideo: null,
	recordAudio: null,

	videoUrl: null,
	audioUrl: null,

	preview: null,

	stream: null,

	// 时长
	startTime: 0,
	duration: 0,

	// 数据库
	db: null,

	ctor: function(previewVideo) {
		if (undefined !== previewVideo) {
			this.preview = previewVideo;
		}
	},

	dispose: function() {
		this.stream = null;
		this.recordEnd = null;
	},

	startRecording: function(stream) {
		if (this.recording) {
			return false;
		}

		this.recording = true;
		this.startTime = 0;
		this.duration = 0;

		var self = this;
		var handle = function(stream) {
			self.stream = stream;

			if (null != self.preview) {
				self.attachMediaStream(self.preview, stream);
				self.preview.muted = true;
				self.preview.controls = false;
				self.preview.style.visibility = 'visible';
			}

			if (!self.isFirefox) {
				self.recordAudio = RecordRTC(stream, {
					bufferSize: 16384,
					sampleRate: 45000,

					// Windows 7 上进行音画同步
					onAudioProcessStarted: function() {
						self.recordVideo.startRecording();
					}
				});
			}

			self.recordVideo = RecordRTC(stream, {
				type: "video"
			});

			if (null != self.recordAudio) {
				self.recordAudio.startRecording();
			}
			else {
				self.recordVideo.startRecording();
			}

			self.startTime = Date.now();
		}

		if (stream === undefined || null == stream) {
			var constraints = null;
			if (self.isFirefox) {
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
		if (!this.recording) {
			return false;
		}

		this.recording = false;

		var called = (null != this.recordVideo) ? 1 : 0;
		called += (null != this.recordAudio) ? 1 : 0;

		var self = this;
		if (null != this.recordVideo) {
			this.recordVideo.stopRecording(function(url) {
				self.duration = Date.now() - self.startTime;

				self.videoUrl = url;

				--called;
				if ('undefined' !== callback && 0 == called) {
					callback.call(null, self);
				}

				if (null != self.recordEnd) {
					self.recordEnd.call(null, self);
				}

				if (null != self.preview) {
					self.preview.src = "";

					try {
						self.stream.stop();
					} catch (e) {
					}
				}

				self.stream = null;
			});
		}

		if (null != this.recordAudio) {
			this.recordAudio.stopRecording(function(url) {

				self.audioUrl = url;

				--called;
				if ('undefined' !== callback && 0 == called) {
					callback.call(null, self);
				}
			});
		}
	},

	replay: function(video, audio) {
		if (this.recording) {
			return false;
		}

		var self = this;

		if (null != this.recordAudio) {
			// 音视频同步播放
			video.onplay = function(e) { audio.play(); };
			video.onpause = function(e) { audio.pause(); };

			audio.muted = false;

			if (window.URL) {
				audio.src = window.URL.createObjectURL(this.recordAudio.getBlob());
			}
			else {
				audio.src = this.recordAudio.getBlob();
			}
		}

		if (null != this.recordVideo) {
			/*video.onloadeddata = function(e) {
				video.play();
			};*/

			video.muted = false;
			video.controls = true;

			video.onended = function(e) {
				//video.pause();
				//video.onloadeddata = function(e) {};

				if (self.isFirefox) {
					if (window.URL) {
						video.src = window.URL.createObjectURL(self.recordVideo.getBlob());
					}
					else {
						video.src = self.recordVideo.getBlob();
					}
				}
				else {
					if (null != self.recordAudio) {
						audio.pause();

						if (window.URL) {
							audio.src = window.URL.createObjectURL(self.recordAudio.getBlob());
						}
						else {
							audio.src = self.recordAudio.getBlob();
						}
					}
				}
			};

			if (window.URL) {
				video.src = window.URL.createObjectURL(this.recordVideo.getBlob());
			}
			else {
				video.src = this.recordVideo.getBlob();
			}
		}

		return true;
	},

	getVideoUrl: function() {
		return this.videoUrl;
	},

	save: function(prefix, complete, error) {
		var video = (null != this.recordVideo);
		var audio = (null != this.recordAudio);

		var videoData = null;
		var audioData = null;

		var videoSize = video ? this.recordVideo.blob.size : 0;
		var audioSize = audio ? this.recordAudio.blob.size : 0;

		var time = new Date(this.startTime);
		var str = [prefix, "_",
			time.getFullYear(),
			(time.getMonth() + 1) < 10 ? "0" + (time.getMonth() + 1) : (time.getMonth() + 1),
			time.getDate() < 10 ? "0" + time.getDate() : time.getDate(),
			time.getHours() < 10 ? "0" + time.getHours() : time.getHours(),
			time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes(),
			time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds(),
			"_",
			parseInt(this.duration / 1000.0)];
		var fileName = str.join('');

		var self = this;
		var timestamp = this.startTime;

		// 待存储数据
		var store = null;
		// 数据库
		var db = null;

		// 读数据
		if (video) {
			// 从 Blob 读取
			var reader = new FileReader();
			reader.onload = function(event) {
				videoData = event.target.result;

				if (audio && null != audioData) {
					store = {
						time: timestamp,
						video: {
							name: fileName + '.webm',
							size: videoSize,
							data: videoData
						},
						audio: {
							name: fileName + '.wav',
							size: audioSize,
							data: audioData
						}
					};

					// 写入数据
					self._save(db, store, complete, error);
				}
				else if (!audio) {
					store = {
						time: timestamp,
						video: {
							name: fileName + '.webm',
							size: videoSize,
							data: videoData
						}
					};

					// 写入数据
					self._save(db, store, complete, error);
				}
			};

			// 读数据
			reader.readAsDataURL(this.recordVideo.blob);
		}

		if (audio) {
			// 从 Blob 读取
			var reader = new FileReader();
			reader.onload = function(event) {
				audioData = event.target.result;

				if (video && null != videoData) {
					store = {
						time: timestamp,
						video: {
							name: fileName + '.webm',
							size: videoSize,
							data: videoData
						},
						audio: {
							name: fileName + '.wav',
							size: audioSize,
							data: audioData
						}
					};

					// 写入数据
					self._save(db, store, complete, error);
				}
				else if (!video) {
					store = {
						time: timestamp, 
						audio: {
							name: fileName + '.wav',
							size: audioSize,
							data: audioData
						}
					};

					// 写入数据
					self._save(db, store, complete, error);
				}
			};

			// 读数据
			reader.readAsDataURL(this.recordAudio.blob);
		}

		// 开启数据库
		var request = window.indexedDB.open("_cube_recording", 1);
		request.onerror = function(event) {
			Logger.e("CubeRecorder", "Can NOT use IndexedDB");
		};
		request.onupgradeneeded = function(event) {
			//console.log("onupgradeneeded");
			db = event.target.result;

			if (!db.objectStoreNames.contains("recording")) {
				var objectStore = db.createObjectStore("recording", { keyPath: "time" });
				objectStore.createIndex("time", "time", { unique:true });
			}
		};
		request.onsuccess = function(event) {
			//console.log("onsuccess");
			db = event.target.result;

			// 写入数据
			self._save(db, store, complete, error);
		};

		return timestamp;
	},

	_save: function(db, data, complete, error) {
		if (null == db || null == data) {
			return;
		}

		// 存储
		var transaction = db.transaction(["recording"], "readwrite");
		transaction.oncomplete = function(event) {
			complete.call(null, data);
		};
		transaction.onerror = function(event) {
			error.call(null, data);
		};
		// 添加数据
		transaction.objectStore("recording").add(data);
	},

	uploadTo: function(url, parameter, success, error) {
		return this._upload(url, parameter, "cube", success, error);
	},

	upload: function(accountName, prefix, success, error, cors) {
		if (null == accountName || null == prefix) {
			return false;
		}

		var mix = true;
		if ('undefined' !== cors) {
			mix = cors;
		}

		return this._upload(mix, { "account": accountName }, prefix, success, error);
	},

	_upload: function(mix, param, prefix, callback, error) {
		if (null == mix || null == param || null == prefix) {
			return false;
		}

		var time = new Date(this.startTime);
		var str = [prefix, "_",
			time.getFullYear(),
			(time.getMonth() + 1) < 10 ? "0" + (time.getMonth() + 1) : (time.getMonth() + 1),
			time.getDate() < 10 ? "0" + time.getDate() : time.getDate(),
			time.getHours() < 10 ? "0" + time.getHours() : time.getHours(),
			time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes(),
			time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds(),
			"_",
			parseInt(this.duration / 1000.0)];
		var fileName = str.join('');

		var self = this;
		var video = (null != this.recordVideo);
		var audio = (null != this.recordAudio);

		var videoData = null;
		var audioData = null;

		if (video) {
			// 从 Blob 读取
			var reader = new FileReader();
			reader.onload = function(event) {
				videoData = event.target.result;

				if (audio && null != audioData) {
					self._post(mix, param, {
						name: fileName + '.webm',
						size: self.recordVideo.blob.size,
						data: videoData
					}, {
						name: fileName + '.wav',
						size: self.recordAudio.blob.size,
						data: audioData
					}, callback, error);
				}
				else if (!audio) {
					self._post(mix, param, {
						name: fileName + '.webm',
						size: self.recordVideo.blob.size,
						data: videoData
					}, null, callback, error);
				}
			};
			reader.readAsDataURL(this.recordVideo.blob);
		}

		if (audio) {
			// 从 Blob 读取
			var reader = new FileReader();
			reader.onload = function(event) {
				audioData = event.target.result;

				if (video && null != videoData) {
					self._post(mix, param, {
						name: fileName + '.webm',
						size: self.recordVideo.blob.size,
						data: videoData
					}, {
						name: fileName + '.wav',
						size: self.recordAudio.blob.size,
						data: audioData
					}, callback, error);
				}
				else if (!video) {
					self._post(mix, param, null, {
						name: fileName + '.wav',
						size: self.recordAudio.blob.size,
						data: audioData
					}, callback, error);
				}
			};
			reader.readAsDataURL(this.recordAudio.blob);
		}

		return true;

		/*var data = new FormData();

		if (null != this.recordVideo) {
			data.append("video-filename", fileName + ".webm");
			data.append("video-size", this.recordVideo.blob.size);
			data.append("video-blob", this.recordVideo.blob);
		}

		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			if (request.readyState == 4 && request.status == 200) {
				console.log('log: ' + location.href + request.responseText);
			}
		};
		request.open("POST", "archive/save?name=" + accountName);
		request.send(data);*/
	},

	_uploadFromDB: function(url, parameter, success, error) {
		var time = this.startTime;
		var self = this;

		// 开启数据库
		var db = null;
		var request = window.indexedDB.open("_cube_recording", 1);
		request.onerror = function(event) {
			Logger.e("CubeRecorder", "Can NOT use IndexedDB");
			error.call(null, self);
		};
		request.onupgradeneeded = function(event) {
			db = event.target.result;
			self.db = db;

			if (!db.objectStoreNames.contains("recording")) {
				var objectStore = db.createObjectStore("recording", { keyPath: "time" });
				objectStore.createIndex("time", "time", { unique:true });
			}
		};
		request.onsuccess = function(event) {
			db = event.target.result;
			self.db = db;

			// 读取数据
			var transaction = db.transaction(["recording"]);
			var objectStore = transaction.objectStore("recording");
			var req = objectStore.get(time);
			req.onsuccess = function(event) {
				var data = event.target.result;

				var video = (undefined !== data.video) ? data.video : null;
				var audio = (undefined !== data.audio) ? data.audio : null;

				// 提交数据
				self._post(url, parameter, video, audio, success, error);

				Logger.d("CubeRecorder", "Post data to " + url);
			}
		};
	},

	_deleteFromDB: function() {
		var self = this;
		if (null == self.db) {
			// 开启数据库
			var db = null;
			var request = window.indexedDB.open("_cube_recording", 1);
			request.onerror = function(event) {
				Logger.e("CubeRecorder", "Can NOT use IndexedDB");
			};
			request.onupgradeneeded = function(event) {
				db = event.target.result;
				self.db = db;
	
				if (!db.objectStoreNames.contains("recording")) {
					var objectStore = db.createObjectStore("recording", { keyPath: "time" });
					objectStore.createIndex("time", "time", { unique:true });
				}
			};
			request.onsuccess = function(event) {
				db = event.target.result;
				self.db = db;

				db.transaction(["recording"], "readwrite").objectStore("recording")['delete'](self.startTime);
			};
		}
		else {
			self.db.transaction(["recording"], "readwrite").objectStore("recording")['delete'](self.startTime);
		}
	},

	_post: function(mix, parameters, video, audio, callback, error) {
		var data = new FormData();

		data.append("param", JSON.stringify(parameters));

		if (null != video) {
			data.append("video-filename", video.name);
			data.append("video-size", video.size);
			data.append("video-data", video.data);
		}

		if (null != audio) {
			data.append("audio-filename", audio.name);
			data.append("audio-size", audio.size);
			data.append("audio-data", audio.data);
		}

		var self = this;
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			if (request.readyState == 4) {
				if (request.status == 200) {
					//console.log('log: ' + location.href + request.responseText);
					if (undefined !== callback) {
						callback.call(null, self, parameters);
					}
				}
				else {
					if (undefined !== error) {
						error.call(null, self, parameters);
					}
				}
			}
		};

		if (typeof mix === 'string') {
			request.open("POST", mix);
		}
		else if (mix) {
			request.open("POST", window._cube_cross.host + "/archive/save");
		}
		else {
			request.open("POST", "archive/save");
		}

		// 发送数据
		request.send(data);
	},

	clear: function() {
		this.recordVideo = null;
		this.recordAudio = null;
	},

	getDuration: function() {
		if (0 == this.startTime) {
			return 0;
		}

		if (0 == this.duration) {
			return Date.now() - this.startTime;
		}

		return this.duration;
	},

	getSize: function() {
		var size = 0;
		size += (null != this.recordVideo) ? this.recordVideo.blob.size : 0;
		size += (null != this.recordAudio) ? this.recordAudio.blob.size : 0;
		return size;
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
