/*
 * WhiteboardApp.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

;(function(global) {
	global.notifyUpload = function() {
		setTimeout(function() {
			global.app._requestFileUploadProcess();
		}, 3000);
	},

	global.app = {
		wb: null,
		token: null,
		toolbarHeight: 34,
		tbButtons: null,

		curLineWeight: 2,
		curColorIndex: 0,
		colors: ['#fb3838', '#800000', '#f7883a', '#ffff00', '#308430', '#99cc00',
				'#385ad3', '#3894e4', '#800080', '#f31bf3', '#009999', '#16dcdc',
				'#000000', '#ffffff', '#808080', '#c0c0c0'],

		resizeTimer: 0,

		slideImageList: null,
		slideCursor: 0,

		uploadProcessTimer: 0,

		selectDefault: function() {
			if ($('#btn_default').hasClass('btn-selected')) {
				return;
			}

			for (var i = 0; i < this.tbButtons.length; ++i) {
				var b = this.tbButtons[i];
				b.removeClass('btn-selected');
				if (!b.hasClass('btn-default')) {
					b.addClass('btn-default');
				}
			}

			$('#btn_default').removeClass('btn-default');
			$('#btn_default').addClass('btn-selected');

			this.wb.unselect();

			$('#group_draw_option').hide();
		},

		selectPencil: function() {
			if ($('#btn_pencil').hasClass('btn-selected')) {
				return;
			}

			for (var i = 0; i < this.tbButtons.length; ++i) {
				var b = this.tbButtons[i];
				b.removeClass('btn-selected');
				if (!b.hasClass('btn-default')) {
					b.addClass('btn-default');
				}
			}

			$('#btn_pencil').removeClass('btn-default');
			$('#btn_pencil').addClass('btn-selected');

			var pe = new PencilEntity();
			pe.weight = this.curLineWeight;
			pe.color = this.colors[this.curColorIndex];
			this.wb.selectEntity(pe);

			$('#group_draw_option').show();
		},

		setLineWeight: function(weight) {
			// 修改图标
			$('#btn_line_weight .icon').removeClass('icon-line-weight-' + this.curLineWeight).addClass('icon-line-weight-' + weight);

			this.curLineWeight = weight;

			var e = this.wb.entity();
			if (e.name == PencilEntity.Name) {
				e.weight = weight;
			}

			$('#btn_line_weight').popover('hide');
		},
		setDrawColor: function(index) {
			// 修改图标
			$('#btn_draw_color .icon').removeClass('icon-color-' + this.curColorIndex).addClass('icon-color-' + index);

			this.curColorIndex = index;

			var e = this.wb.entity();
			if (e.name == PencilEntity.Name) {
				e.color = this.colors[index];
			}

			$('#btn_draw_color').popover('hide');
		},

		setBgImage: function(url) {
			this.wb.selectEntity(new BackgroundImageEntity(url));
		},

		startSlide: function(list) {
			Logger.d("WhiteboardApp", "Start slide: " + list.length);

			this.slideImageList = list;
			this.wb.selectEntity(new BackgroundImageEntity(list[0]));
			this.slideCursor = 0;

			$('#page_info').text('1 / ' + list.length);

			if (!$('#btn_prev').parent().hasClass('disabled'))
				$('#btn_prev').parent().addClass('disabled');

			if (list.length == 1) {
				// 只有一页的幻灯片
				if (!$('#btn_next').parent().hasClass('disabled'))
					$('#btn_next').parent().addClass('disabled');
			}
			else {
				$('#btn_next').parent().removeClass('disabled');
			}
		},

		clearSlide: function() {
			Logger.d("WhiteboardApp", "Clear slide");

			// TODO 更新 UI
			this.slideImageList = null;
			if ($('#btn_prev').parent().hasClass('disabled')) {
				$('#btn_prev').parent().removeClass('disabled');
			}
			if ($('#btn_next').parent().hasClass('disabled')) {
				$('#btn_next').parent().removeClass('disabled');
			}
			$('#page_info').text("无幻灯片");

			this.wb.cleanup();
		},

		prevSlide: function() {
			if (null == this.slideImageList) {
				return;
			}

			if (this.slideCursor == 0) {
				return;
			}

			this.wb.erase();

			--this.slideCursor;
			this.wb.selectEntity(new BackgroundImageEntity(this.slideImageList[this.slideCursor]));

			this._updateSlide();
		},

		nextSlide: function() {
			if (null == this.slideImageList) {
				return null;
			}

			if (this.slideCursor == this.slideImageList.length - 1) {
				return;
			}

			this.wb.erase();

			++this.slideCursor;
			this.wb.selectEntity(new BackgroundImageEntity(this.slideImageList[this.slideCursor]));

			this._updateSlide();
		},

		skipToSlide: function(page) {
		},

		_updateSlide: function() {
			if (this.slideCursor == 0) {
				$('#btn_prev').parent().addClass('disabled');
			}
			else {
				$('#btn_prev').parent().removeClass('disabled');
			}

			if (this.slideCursor == this.slideImageList.length - 1) {
				$('#btn_next').parent().addClass('disabled');
			}
			else {
				$('#btn_next').parent().removeClass('disabled');
			}

			$('#page_info').text((this.slideCursor + 1) + ' / ' + this.slideImageList.length);
		},

		selectBgImage : function(url) {
			this.wb.selectEntity(new BackgroundImageEntity(url));
		},

		resize : function() {
			var h = document.body.clientHeight;
			var height = h - this.toolbarHeight - 11;
			$('#app_stage').height(height);
			//$('.watermark').height(height);
			this.wb.resize(document.body.clientWidth, height);
		},
		
		notifyOnProgressAlertInfo : function(value) {
			var contentWindow = $("#_share_manager_frame")[0].contentWindow;
			if (null !== contentWindow) {
				contentWindow.onProgressAlert(value);
			}
			else {
				setTimeout(notifyOnProgressAlertInfo(value), 100);
			}
			
		},
		notifyOnProgress : function(value) {
			var contentWindow = $("#_share_manager_frame")[0].contentWindow;
			if (null !== contentWindow) {
				contentWindow.onProgress(value);
			}
			else {
				setTimeout(notifyOnProgress(value), 100);
			}
			
		},
		notifyOnConvertCompleted : function() {
			var contentWindow = $("#_share_manager_frame")[0].contentWindow;
			if (null !== contentWindow) {
				contentWindow.onConvertCompleted();
			}
			else {
				setTimeout(notifyOnConvertCompleted, 100);
			}
			
		},
		norifyOnConvertFailed : function() {
			var contentWindow = $("#_share_manager_frame")[0].contentWindow;
			if (null !== contentWindow) {
				contentWindow.onConvertFailed();
			}
			else {
				setTimeout(norifyOnConvertFailed(), 100);
			}
			
		},

		// 获取文件上传进度，
		_requestFileUploadProcess : function() {
			var self = this;
			$.post('share/fileprocess', {}
				, function(data, textStatus, jqXHR) {
					if (data.state == 200) {
						//fileprocess请求成功
						var byteRead = data.data.bytesread;
						var contentLength = data.data.contentlength;
						
				        if (byteRead == contentLength) {
							// 上传完成，开始转换
//							console.log("#_progress_alert 上传完成");
							self.notifyOnProgressAlertInfo("上传完成，正在处理文档，请稍候…");

							self._requestConvertProcess();
						} 
						else {
							// TODO 上传未完成，显示上传进度,上传完成80%，转换20% 
							console.log("File Upload Process [Read: " + byteRead + ", ContentLength: "+ contentLength);
							self.notifyOnProgressAlertInfo("上传进度："+ byteRead + "/" + contentLength);
							var value = byteRead / contentLength * 100;
							console.log ("progress.value : " + value);
							if( value <= 90) {
								self.notifyOnProgress(value);
							}
							self.uploadProcessTimer = setTimeout(function() {
								self._requestFileUploadProcess();
							}, 3000);
						}
					} 
					else {
						// TODO fileprocess请求失败
				    }
		    }, 'json');
		},
		
		//请求文件转换状态
		_requestConvertProcess: function() {
			var self = this;
			$.post('share/convertprocess', {}
				, function(data, textStatus, jqXHR) {
					if (data.state == 200) {
						// convertprocess请求成功
						var convertstate = data.data.convertstate;
						console.log("File Convert State: " + convertstate);
						if (convertstate == "notstart") {
									setTimeout(function() {
										self._requestConvertProcess();
									}, 2000);
							 }
							 else if (convertstate == "started") {
								self.notifyOnProgressAlertInfo("正在处理文档，请稍候…");
//								$("#_share_manager_frame")[0].contentWindow.onProgress(92);
								self.notifyOnProgress(92);
								setTimeout(function() {
									self._requestConvertProcess();
								}, 2000);
							}
							else if (convertstate == "executing") {
								self.notifyOnProgress(95);
								setTimeout(function() {
									self._requestConvertProcess();
								}, 2000);
							}
							else if (convertstate == "completed") {
								// 转换完成
								self.notifyOnConvertCompleted();

								$('#modal_share_file').modal('hide');

								// 请求文件清单
								var fileName = data.data.filename;
								
								self._requestFileUrlList(fileName);
							}
							else if (convertstate == "failed") {
								self.norifyOnConvertFailed();
							}
							else {
								setTimeout(function() {
									self._requestConvertProcess();
								}, 2000);
							}	 
					} 
					else {
						// convertprocess 请求失败
					}
				}, 'json');
		},

		//请求文件转换后生成的访问url
		_requestFileUrlList: function(fileName) {
			var self = this;
			$.get('share/fileurllist', {token: self.token, 
				                  fileName: fileName}
				, function(data, textStatus, jqXHR) {
					if (data.state == 200) {
						//fileurllist请求成功
						var urllist = data.data.urllist;
						app.wb.erase();
						app.startSlide(urllist);
					} 
					else {
						// TODO fileurllist请求失败
				    }
		    }, 'json');
		},

		onResize : function() {
			if (this.resizeTimer > 0) {
				clearTimeout(this.resizeTimer);
			}

			var self = this;
			this.resizeTimer = setTimeout(function() {
				clearTimeout(self.resizeTimer);
				self.resizeTimer = 0;

				self.resize();
			}, 60);
		},	
	};
})(window);

$(document).ready(function(e) {
	// 读取引擎账号信息
	var params = window.utils.getUrlParams();
	var token = params['token'];
	var cubeName = params['cn'];
	var cubeGroupName = params['cgn'];
	var peerName = params['pcn'];
	var debug = params['debug'];

	if (cubeGroupName === undefined) {
		cubeGroupName = null;
	}
	if (peerName === undefined) {
		peerName = null;
	}

	window.app.token = token;

	// 启动 Cube 引擎
	if (window.cube.startup(debug)) {
		// 加载白板
		window.app.wb = window.cube.loadWhiteboard('canvas');
		window.app.wb.shareWith([ (null != cubeGroupName) ? cubeGroupName : peerName ]);

		// 注册账号
		window.cube.registerAccount(cubeName, '123456');
	} else {
		console.log('Cube Engine 启动失败');
	}

	// 处理 resize 事件
	$(window).resize(function(e) {
		app.onResize();
	});

	// 重置画布大小
	app.resize();

	// 工具栏按钮
	app.tbButtons = [ $('#btn_default'), $('#btn_pencil')];

	// Tooltip 处理
	$('.toolbar').tooltip({selector:'[data-toggle="tooltip"]', container:"body"});
	$('.pagination').tooltip({selector:'[data-toggle="tooltip"]', container:"body"});

	// 绑定事件
	$('#btn_default').click(function(e) {
		app.selectDefault();
	});
	$('#btn_pencil').click(function(e) {
		app.selectPencil();
	});
	$('#btn_undo').click(function(e) {
		app.wb.undo();
	});
	$('#btn_redo').click(function(e) {
		app.wb.redo();
	});
	$('#btn_erase').click(function(e) {
		app.wb.erase();
	});
	$('#btn_clear').click(function(e) {
		app.clearSlide();
	});

	// 选择线条粗细
	var selectLineWeightPopover = '<div class="popover popover-template" role="tooltip"><div class="arrow"></div>\
		<div class="btn-group popover-line-weight" role="group">\
			<button id="btn_pencil_weight" type="button" onclick="javascript:app.setLineWeight(2);" class="btn btn-default opt-item-btn" title="细">\
				<span class="icon icon-line-weight-2" aria-hidden="true">●</span>\
			</button>\
			<button id="btn_pencil_color" type="button" onclick="javascript:app.setLineWeight(4);" class="btn btn-default opt-item-btn" title="中">\
				<span class="icon icon-line-weight-4" aria-hidden="true">●</span>\
			</button>\
			<button id="btn_pencil_color" type="button" onclick="javascript:app.setLineWeight(8);" class="btn btn-default opt-item-btn" title="粗">\
				<span class="icon icon-line-weight-8" aria-hidden="true">●</span>\
			</button>\
		</div></div>';
	$('#btn_line_weight').popover({
		template: selectLineWeightPopover,
		html: true,
		placement: 'top'
	});

	// 选择颜色
	var selectDrawColorPopover = '<div class="popover popover-template" role="tooltip"><div class="arrow"></div>\
		<table class="popover-draw-color">';
	var pt = [selectDrawColorPopover];
	var col = app.colors.length / 4;
	var row = app.colors.length / col;
	var index = 0;
	for (var r = 0; r < row; ++r) {
		pt.push('<tr>');
		for (var c = 0; c < col; ++c) {
			var coltd = '<td><button type="button" onclick="javascript:app.setDrawColor('+ index +');" class="btn btn-default opt-item-btn"><span class="icon icon-color-' +
				index + '" aria-hidden="true">▇</span></button></td>';
			++index;
			pt.push(coltd);
		}
		pt.push('</tr>');
	}
	pt.push('</table></div>');
	selectDrawColorPopover = pt.join('');
	pt = null;
	$('#btn_draw_color').popover({
		template: selectDrawColorPopover,
		html: true,
		placement: 'top'
	});

	/* 测试代码
	$('#btn_test').click(function(e) {
		var list = [];
		for (var i = 1; i <= 37; ++i) {
			var num = i < 10 ? '0' + i : '' + i;
			list.push('http://127.0.0.1:8080/cube/shared/examples/Software_UI_Design-' + num + '.png');
		}
		app.startSlide(list);
	});*/

	var btnShareClick = function() {
		var contentWindow = $("#_share_manager_frame")[0].contentWindow;
		if (contentWindow !== null) {
	        contentWindow.reset();	
	        contentWindow.onShare();
		}
		else {
		    setTimeout(btnShareClick, 100); 
		}
		$('#modal_share_file').modal('show');		
	}

	$('#btn_share').click(btnShareClick);
	
	$('#btn_prev').click(function(e) {
		app.prevSlide();
	});
	
	$('#btn_next').click(function(e) {
		app.nextSlide();
	});
	
	$('#btn_skip').click(function(e) {
		app.skipToSlide();
	});
});
