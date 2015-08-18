/*
 * MediaController.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/28.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

/**
 * 媒体层探针接口。
 * 媒体层探针用于实时监测媒体设备的工作状态。
 *
 * @interface CubeMediaProbe
 * @see {@link CubeMediaController#addMediaProbe|CubeMediaController}
 */
var CubeMediaProbe = Class({
	ctor: function() {
	},

	/**
	 * 当本地视频数据就绪时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onLocalVideoReady: function(mediaController) {},

	/**
	 * 当远端视频数据就绪时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onRemoteVideoReady: function(mediaController) {},

	/**
	 * 当本地视频帧率数据刷新时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} videoWidth 视频画面宽度。
	 * @param {Number} videoHeight 视频画面高度。
	 * @param {Number} curFPS 视频当前帧率。
	 * @param {Number} avgFPS 视频平均帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onLocalVideoFPS: function(mediaController, videoWidth, videoHeight, curFPS, avgFPS) {},

	/**
	 * 当远端视频帧率数据刷新时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} videoWidth 视频画面宽度。
	 * @param {Number} videoHeight 视频画面高度。
	 * @param {Number} curFPS 视频当前帧率。
	 * @param {Number} avgFPS 视频平均帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onRemoteVideoFPS: function(mediaController, videoWidth, videoHeight, curFPS, avgFPS) {},

	/**
	 * 当探针检测到帧率明显降低时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} curFps 当前实时帧率。
	 * @param {Number} avgFps 平均帧率。
	 * @param {Number} maxFps 监测周期内的最大帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onFrameRateWarning: function(mediaController, curFps, avgFps, maxFps) {},

	/**
	 * 当探针检测到帧率恢复时该方法被调用。
	 *
	 * @param {CubeMediaController} mediaController 媒体控制器实例。
	 * @param {Number} curFps 当前实时帧率。
	 * @param {Number} avgFps 平均帧率。
	 * @param {Number} maxFps 监测周期内的最大帧率。
	 * @instance
	 * @memberof CubeMediaProbe
	 */
	onFrameRateRecovering: function(mediaController, curFps, avgFps, maxFps) {}
});

/**
 * 媒体控制器。用于操作媒体设备。
 *
 * @class CubeMediaController
 * @see {@link CubeEngine#getMediaController|CubeEngine}
 */
var CubeMediaController = Class({
	worker: null,
	timerList: [],

	probes: null,
	frameWarning: false,

	remoteMaxFrameRate: -1,
	remoteMinFrameRate: 120,

	// 离线录制器
	recorderMap: null,

	ctor: function(worker) {
		this.worker = worker;

		var self = this;
		worker.videoCloseHandler = function() {
			Logger.d("CubeMediaController", "Video closed");

			for (var i = 0; i < self.timerList.length; ++i) {
				var timer = self.timerList[i];
				clearInterval(timer);
			}

			self.timerList.splice(0, self.timerList.length);

			if (null != self.probes && self.frameWarning) {
				for (var i = 0; i < self.probes.length; ++i) {
					var p = self.probes[i];
					p.onFrameRateRecovering(self, 0, 0, self.remoteMaxFrameRate);
				}
			}

			self.remoteMaxFrameRate = -1;
			self.remoteMinFrameRate = 120;
			self.frameWarning = false;

			if (self.isLocalRecording()) {
				self.stopLocalRecording(null);
			}
		};

		worker.localVideoReady = function(video) {
			self._localVideoReady(video);
		};
		worker.remoteVideoReady = function(video) {
			video.volume = 1;
			self._remoteVideoReady(video);
		};
	},

	/**
	 * 添加媒体探针。
	 *
	 * @param {CubeMediaProbe} probe 指定待添加的媒体探针实例。
	 * @see CubeMediaProbe
	 * @instance
	 * @memberof CubeMediaController
	 */
	addMediaProbe: function(probe) {
		if (null == this.probes) {
			this.probes = [probe];
		}
		else {
			this.probes.push(probe);
		}
	},

	/**
	 * 删除媒体探针。
	 *
	 * @param {CubeMediaProbe} probe 指定待删除的媒体探针实例。
	 * @see CubeMediaProbe
	 * @instance
	 * @memberof CubeMediaController
	 */
	removeMediaProbe: function(probe) {
		if (null == this.probes) {
			return false;
		}

		var index = this.probes.indexOf(probe);
		if (index >= 0) {
			this.probes.splice(index, 1);
			return true;
		}

		return false;
	},

	getLocalVideoSize: function() {
		var v = this.worker.localVideo;
		var w = v.videoWidth;
		var h = v.videoHeight;
		return { width: w, height: h };
	},

	getRemoteVideoSize: function() {
		var v = this.worker.remoteVideo;
		var w = v.videoWidth;
		var h = v.videoHeight;
		return { width: w, height: h };
	},

	capture: function(canvas) {
		var ctx = canvas.getContext('2d');
		if (this.worker.localStream) {
			
		}
	},

	_localVideoReady: function(video) {
		if (null != this.probes) {
			for (var i = 0; i < this.probes.length; ++i) {
				var p = this.probes[i];
				p.onLocalVideoReady(this);
			}

			var self = this;
			this._calculateStats(video, function(v, fps, avg) {
				for (var i = 0; i < self.probes.length; ++i) {
					var p = self.probes[i];
					p.onLocalVideoFPS(self, v.videoWidth, v.videoHeight, fps, avg);
				}
			});
		}
	},

	_remoteVideoReady: function(video) {
		if (null != this.probes) {
			for (var i = 0; i < this.probes.length; ++i) {
				var p = this.probes[i];
				p.onRemoteVideoReady(this);
			}

			var self = this;
			this._calculateStats(video, function(v, fps, avg) {
				for (var i = 0; i < self.probes.length; ++i) {
					var p = self.probes[i];
					p.onRemoteVideoFPS(self, v.videoWidth, v.videoHeight, fps, avg);
				}

				// 探测远端视频帧率过低
				if (self.remoteMaxFrameRate < fps) {
					self.remoteMaxFrameRate = fps;
				}
				if (self.remoteMinFrameRate > fps) {
					self.remoteMinFrameRate = fps;
				}

				if (fps <= self.remoteMaxFrameRate * 0.5
					&& fps <= avg * 0.6) {
					self.frameWarning = true;

					for (var i = 0; i < self.probes.length; ++i) {
						var p = self.probes[i];
						p.onFrameRateWarning(self, fps, avg, self.remoteMaxFrameRate);
					}
				}
				else {
					if (self.frameWarning) {
						for (var i = 0; i < self.probes.length; ++i) {
							var p = self.probes[i];
							p.onFrameRateRecovering(self, fps, avg, self.remoteMaxFrameRate);
						}

						self.frameWarning = false;

						if (fps >= 6) {
							// 复位最大帧率
							self.remoteMaxFrameRate = -1;
						}
					}
				}
			});
		}
	},

	_calculateStats: function(video, callback) {
		var now = new Date().getTime();
		var decodedFrames = 0,
			droppedFrames = 0,
			startTime = now,
			initialTime = now;
		var timer = 0;

		timer = window.setInterval(function() {
			// see if webkit stats are available; exit if they aren't
			if (video.webkitDecodedFrameCount === undefined) {
				if (video.mozPaintedFrames === undefined) {
					console.log("Video FPS calcs not supported");
					clearInterval(timer);
					return;
				}
			}

			// get the stats
			var currentTime = new Date().getTime();
			var deltaTime = (currentTime - startTime) / 1000;
			var totalTime = (currentTime - initialTime) / 1000;
			startTime = currentTime;

			var currentDecodedFPS = 0;
			var decodedFPSAvg = 0;

			// Calculate decoded frames per sec.
			if (video.mozPaintedFrames !== undefined) {
				//console.log(video.mozDecodedFrames + ',' + video.mozParsedFrames + ',' + video.mozPresentedFrames + ',' + video.mozPaintedFrames);
				currentDecodedFPS  = (video.mozPaintedFrames - decodedFrames) / deltaTime;
				decodedFPSAvg = video.mozPaintedFrames / totalTime;
				decodedFrames = video.mozPaintedFrames;
			}
			else {
				currentDecodedFPS  = (video.webkitDecodedFrameCount - decodedFrames) / deltaTime;
				decodedFPSAvg = video.webkitDecodedFrameCount / totalTime;
				decodedFrames = video.webkitDecodedFrameCount;
			}

			// Calculate dropped frames per sec.
			/*
			var currentDroppedFPS = (video.webkitDroppedFrameCount - droppedFrames) / deltaTime;
			var droppedFPSavg = video.webkitDroppedFrameCount / totalTime;
			droppedFrames = video.webkitDroppedFrameCount;
			*/

			if (currentDecodedFPS < 0 || currentDecodedFPS > 60) {
				currentDecodedFPS = 0;
			}

			callback.call(null, video, currentDecodedFPS.toFixed(), decodedFPSAvg.toFixed());

			if ((parseInt(video.width) == 0 && decodedFPSAvg == 0) || video.src == null) {
				clearInterval(timer);
			}
		}, 1000);

		this.timerList.push(timer);
	},

	/**
	 * 开启本地视频流。开启视频后对方将能看到本地摄像头采集到的视频影像。
	 *
	 * @returns {Boolean} 如果开启成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	openVideo: function() {
		if (null != this.worker.localStream && this.worker.localStream.getVideoTracks().length > 0) {
			this.worker.localStream.getVideoTracks()[0].enabled = true;

			// 进行媒体操作同步
			this.worker.consult("video", "open");

			return true;
		}

		return false;
	},

	/**
	 * 关闭本地视频流。关闭视频后对方将无法看到本地摄像头采集到的视频影像。
	 *
	 * @returns {Boolean} 如果关闭成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	closeVideo: function() {
		if (null != this.worker.localStream && this.worker.localStream.getVideoTracks().length > 0) {
			this.worker.localStream.getVideoTracks()[0].enabled = false;

			// 进行媒体操作同步
			this.worker.consult("video", "close");

			return true;
		}

		return false;
	},

	/**
	 * 本地视频数据是否可用。
	 *
	 * @returns {Boolean} 如果本地视频数据已开启返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	isVideoEnabled: function() {
		if (null != this.worker.localStream && this.worker.localStream.getVideoTracks().length > 0) {
			return this.worker.localStream.getVideoTracks()[0].enabled;
		}

		return true;
	},

	/**
	 * 开启本地语音流。开启语音流后对方将能听到本地麦克风采集的音频效果。
	 *
	 * @returns {Boolean} 如果开启成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	openVoice: function() {
		if (null != this.worker.localStream && this.worker.localStream.getAudioTracks().length > 0) {
			this.worker.localStream.getAudioTracks()[0].enabled = true;
			return true;
		}

		return false;
	},

	/**
	 * 关闭本地语音流。关闭语音流后对方将无法听到本地麦克风采集的音频效果。
	 *
	 * @returns {Boolean} 如果关闭成功返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	closeVoice: function() {
		if (null != this.worker.localStream && this.worker.localStream.getAudioTracks().length > 0) {
			this.worker.localStream.getAudioTracks()[0].enabled = false;
			return true;
		}

		return false;
	},

	/**
	 * 本地音频数据是否可用。
	 *
	 * @returns {Boolean} 如果本地音频数据已开启返回 <code>true</code>，否则返回 <code>false</code> 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	isVoiceEnabled: function() {
		if (null != this.worker.localStream && this.worker.localStream.getAudioTracks().length > 0) {
			return this.worker.localStream.getAudioTracks()[0].enabled;
		}

		return true;
	},

	/**
	 * 设置远端音频音量大小。
	 *
	 * @param {Number} value 指定音量大小。取值范围 0 到 100，0 表示最小音量，100 表示最大音量。
	 * @instance
	 * @memberof CubeMediaController
	 */
	setVolume: function(value) {
		if (null != this.worker.remoteVideo) {
			this.worker.remoteVideo.volume = value / 100;
		}
	},

	/**
	 * 获取当前远端音频音量大小。
	 *
	 * @returns {Number} 返回当前音量大小。数值范围 0 到 100 。
	 * @instance
	 * @memberof CubeMediaController
	 */
	getVolume: function() {
		return parseInt(Math.round(this.worker.remoteVideo.volume * 100));
	},

	/**
	 * 静音。
	 *
	 * @instance
	 * @memberof CubeMediaController
	 */
	mute: function() {
		this.closeVoice();
	},

	/**
	 * 查询归档记录。
	 *
	 * @param {String} name 指定待查询的用户名。
	 * @param {Function} success 指定查询数据后的回调函数。
	 * @param {Function} error 指定查询失败时的回调函数。
	 * @param {Boolean} cors 指定是否是跨域查询。
	 * @instance
	 * @memberof CubeMediaController
	 */
	queryRecordArchives: function(name, success, error, cors) {
		if ("undefined" !== cors && cors) {
			var sn = "p" + Date.now();
			window._cube_cross.addCallback(sn, success, error);

			var src = window._cube_cross.host + "/archive/list.js?name=" + name + "&m=window._cube_cross.queryRecordArchives&sn=" + sn;
			var dom = document.createElement("script");
			dom.setAttribute("id", sn);
			dom.setAttribute("name", name.toString());
			dom.setAttribute("src", src);
			dom.setAttribute("type", "text/javascript");
			dom.onerror = function() {
				if (undefined !== error) {
					error.call(null, name);
				}
				document.body.removeChild(dom);
			}
			document.body.appendChild(dom);
			return;
		}

		utils.requestGet("archive/list?name=" + name, function(data) {
			success.call(null, name, data);
		}, function(status) {
			if (undefined !== error) {
				error.call(null, name);
			}
		});
	},

	loadArchive: function(name, file, videoEl, cors) {
		var video = videoEl;
		if (typeof videoEl === 'string') {
			video = document.getElementById(videoEl);
		}

		if ('undefined' !== cors && cors) {
			video.src = window._cube_cross.host + "/archive/read?name=" + name + "&file=" + file;
		}
		else {
			video.src = "archive/read?name=" + name + "&file=" + file;
		}
	},

	hasLocalRecorded: function() {
		if (null == this.recorderMap) {
			return false;
		}

		return this.recorderMap.containsKey("LocalVideo");
	},

	/**
	 * 是否正在录制本地视频。
	 *
	 * @returns {Boolean} 返回是否正在录制本地视频。
	 * @instance
	 * @memberof CubeMediaController
	 */
	isLocalRecording: function() {
		if (null == this.recorderMap) {
			return false;
		}

		var r = this.recorderMap.get("LocalVideo");
		if (r == null) {
			return false;
		}

		return r.recording;
	},

	/**
	 * 启动本地音视频录制。
	 *
	 * @param {Object} config 指定录像参数。参数包括：interval （录制切片间隔）
	 * @returns {Boolean} 返回录制是否启动成功。
	 * @instance
	 * @memberof CubeMediaController
	 */
	startLocalRecording: function(config) {
		if (null == this.worker.localStream) {
			return false;
		}

		return this.startRecording("LocalVideo", this.worker.localStream, config);
	},

	/**
	 * 停止本地音视频录制。
	 *
	 * @param {Function} callback 指定录像结束时的回调函数。
	 * @returns {Boolean} 返回录制是否启动停止。
	 * @instance
	 * @memberof CubeMediaController
	 */
	stopLocalRecording: function(callback) {
		return this.stopRecording("LocalVideo", callback);
	},

	replayLocalRecording: function(videoEl, audioEl) {
		return this.replayRecording("LocalVideo", videoEl, audioEl);
	},

	getLocalRecorder: function() {
		return this.getRecorder("LocalVideo");
	},

	hasRemoteRecorded: function() {
		if (null == this.recorderMap) {
			return false;
		}

		return this.recorderMap.containsKey("RemoteVideo");
	},

	isRemoteRecording: function() {
		if (null == this.recorderMap) {
			return false;
		}

		var r = this.recorderMap.get("RemoteVideo");
		if (r == null) {
			return false;
		}

		return r.recording;
	},

	startRemoteRecording: function(config) {
		if (null == this.worker.remoteStream) {
			return false;
		}

		return this.startRecording("RemoteVideo", this.worker.remoteStream, config);
	},

	stopRemoteRecording: function(callback) {
		return this.stopRecording("RemoteVideo", callback);
	},

	getRemoteRecorder: function() {
		return this.getRecorder("RemoteVideo");
	},

	startRecording: function(task, mix, config) {
		var preview = null;
		var stream = null;
		if (typeof mix === 'string') {
			preview = document.getElementById(mix);
		}
		else if (mix.tagName !== undefined) {
			preview = mix;
		}
		else {
			stream = mix;
		}

		if (null == this.recorderMap) {
			this.recorderMap = new HashMap();
		}

		var recorder = null;
		// 创建记录器
		if (config !== 'undefined' && null != config) {
			recorder = new CubeAdvancedRecorder(preview, config);
		}
		else {
			recorder = new CubeRecorder(preview);
		}

		// 记录
		this.recorderMap.put(task, recorder);

		// 启动记录器
		return recorder.startRecording(stream);
	},

	stopRecording: function(task, callback) {
		if (null == this.recorderMap) {
			return false;
		}

		var recorder = this.recorderMap.get(task);
		if (null == recorder) {
			return false;
		}

		var callTimer = 0;
		var ret = recorder.stopRecording(function(r) {
			if (null == callback) {
				return;
			}

			if (callTimer > 0) {
				clearTimeout(callTimer);
			}

			callTimer = setTimeout(function() {
				clearTimeout(callTimer);
				callback.call(null, recorder);
			}, 1000);
		});

		return ret;
	},

	replayRecording: function(task, videoEl, audioEl) {
		if (null == this.recorderMap) {
			return false;
		}

		var recorder = this.recorderMap.get(task);
		if (null == recorder) {
			return false;
		}

		var video = null;
		if (typeof videoEl === 'string') {
			video = document.getElementById(videoEl);
		}
		else {
			video = videoEl;
		}

		var audio = null;
		if (typeof audioEl === 'string') {
			audio = document.getElementById(audioEl);
		}
		else {
			audio = audioEl;
		}

		return recorder.replay(video, audio);
	},

	getRecorder: function(task) {
		if (null == this.recorderMap) {
			return null;
		}

		return this.recorderMap.get(task);
	}
});

;(function() {
	if (window._cube_cross === undefined) {
		window._cube_cross = {
			host: "http://" + _CUBE_DOMAIN,//"http://192.168.0.198:8080/cube"

			callbackMap: {},

			addCallback: function(sn, success, error) {
				this.callbackMap[sn] = success;
			}
		};
	}

	window._cube_cross.queryRecordArchives = function(sn, data) {
		var dom = document.getElementById(sn);
		var name = dom.getAttribute("name");

		var success = window._cube_cross.callbackMap[sn];
		success.call(null, name, data);

		document.body.removeChild(dom);
		dom = null;

		delete window._cube_cross.callbackMap[sn];
	};
})();
