<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%
String name = request.getParameter("name");
if (null == name) {
	name = "";
}
String error = request.getParameter("error");
%>
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
<title>文件上传</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<style>
html, body {
	width: 100%;
	height: 100%;
	margin: 0px;
	padding: 0px;
}
.fileinput-button input {
	position: absolute;
	float: left;
	top: 38px;
	left: 0px;
	width: 100px;
	height: 34px;
	margin: 0px;
	opacity: 0;
	-moz-opacity: 0;
	-webkit-opacity: 0;
	font-size: 16px;
	direction: ltr;
	cursor: pointer;
}
.file-size {
	font-weight: normal;
	font-size: 12px;
}
.file-type-list {
	width: 100%;
}
.file-type-list > div {
	display: inline-block;
	float: left;
	margin: 0 auto;
	margin-right: 14px;
}
.file-type-list > div > img {
	float: left;
	margin: 0 auto;
}

.file-type {
	width: 100%;
	text-align: center;
	padding-top: 38px;
}

fieldset {
	font-size: 12px;
}
legend, .legend {
	font-size: 12px !important;
	margin-bottom: 10px;
}
#file {
	font-size: 16px;
}
</style>
</head>

<body>
<div id="upload_container">
<%
if (null == error) {
%>
	<form id="upload_form" method="POST" enctype="multipart/form-data" action="sharing/uploadfile?name=<%=name %>" target="target_upload">
		<div class="form-group">
			<p><label id="file">点击“选择文件”按钮，选择您需要分享的文件</label></p>
			<span class="btn btn-default fileinput-button"><span class="glyphicon glyphicon-folder-open"></span>&nbsp;选择文件
				<input id="uploadfile" type="file" name="uploadfile" accept=".jpeg, .jpg, .png, .bmp, .gif, .doc, .docx, .ppt, .pptx, .pdf, .mp4, .mp3, .ogg, .wav" >
			</span>
			&nbsp;&nbsp;
			<button class="btn btn-primary" id="btn_submit" type="submit" disabled><span class="glyphicon glyphicon-cloud-upload"></span>&nbsp;确认上传</button>
		</div>
		<div class="form-group">
			<fieldset>
				<legend class="legend">支持的文件类型</legend>
				<div class="file-type-list">
					<div>
						<img src="assets/images/icon_ft_doc.png">
						<img src="assets/images/icon_ft_docx.png">
						<div class="file-type">Word</div>
					</div>
					<div>
						<img src="assets/images/icon_ft_ppt.png">
						<img src="assets/images/icon_ft_pptx.png">
						<div class="file-type">PowerPoint</div>
					</div>
					<div>
						<img src="assets/images/icon_ft_pdf.png">
						<div class="file-type">PDF</div>
					</div>
					<div>
						<img src="assets/images/icon_ft_jpg.png">
						<div class="file-type">JPG</div>
					</div>
					<div>
						<img src="assets/images/icon_ft_jpeg.png">
						<div class="file-type">JPEG</div>
					</div>
					<div>
						<img src="assets/images/icon_ft_png.png">
						<div class="file-type">PNG</div>
					</div>
					<div>
						<img src="assets/images/icon_ft_gif.png">
						<div class="file-type">GIF</div>
					</div>
					<div>
						<img src="assets/images/icon_ft_bmp.png">
						<div class="file-type">BMP</div>
					</div>
				</div>
			</fieldset>
		</div>
	</form>
	<iframe id="target_upload" name="target_upload" style="display:none"></iframe>
<%
} else {
%>
	<div class="alert alert-danger" role="alert">上传文件错误：<%=error %></div>
<%
}
%>
	<!-- 进度条 -->
	<div id="progress_block" style="display:none">
		<div id="progress_alert" class="alert alert-success" role="alert">上传文件...</div>
		<div class="progress">
			<div id="progress_bar" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
		</div>
	</div>
</div>
<script type="text/javascript" src="assets/js/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
<script type="text/javascript">
;(function(global) {
	var processTimer = 0;
	var sharingReady = null;

	// 设置帐号名
	global.setAccount = function(name) {
		$('#upload_form').attr("action", "sharing/uploadfile?name=" + name);
	};

	// 添加分享就绪回调
	global.sharingReady = function(cb) {
		sharingReady = cb;
	};

	global.notifyFileUploadProcess = function() {
		setTimeout(function() { global.requestFileUploadProcess(); }, 1000);
	};

	// 请求文件上传进度
	global.requestFileUploadProcess = function() {
		if (processTimer > 0) {
			clearTimeout(processTimer);
			processTimer = 0;
		}

		$.get("sharing/uploadprocess?t=" + Date.now(), {}
			, function(data, textStatus, jqXHR) {
				if (data.state == 200) {
					var raw = data.data;
					var byteRead = raw.bytesread;
					var contentLength = raw.contentlength;
					var state = raw.state;

					if (state == 200) {
						// 上传完成
						$("#progress_alert").html("上传完成，正在处理文档，请稍候…");
						$("#progress_bar").width("100%");

						var converting = raw.converting;

						if (!converting) {
							var file = raw.file;
							if (null != sharingReady) {
								sharingReady.call(null, file);
							}

							// 重置 UI
							resetUI();
						}
						else {
							var file = raw.file;
							var size = file.size;
							//console.log("size:" + size);

							if (size >= (1048576 * 2)) {
								$("#progress_alert").html("正在处理文档，请耐心等待…");
							}

							// 请求文件转换状态
							requestConvertProcess();
						}
					}
					else if (state == 100 || state == 0) {
						// 上传未完成，显示上传进度
						console.log("File Upload Process - read: " + byteRead + ", content length: "+ contentLength);

						var value = parseInt(byteRead / contentLength * 100.0);
						$("#progress_alert").html("正在上传文件：" + value + "% ("+ byteRead + "/" + contentLength + ")");
						$("#progress_bar").width(value + "%");
						processTimer = setTimeout(function() { global.requestFileUploadProcess(); }, 2000);
					}
					else {
						$("#progress_alert").html("上传文件出错");

						// 重置 UI
						resetUI();
					}
				} 
	    }, 'json');
	};

	// 请求文件转换状态
	global.requestConvertProcess = function() {
		var self = this;
		$.post('sharing/convertprocess', {}
			, function(data, textStatus, jqXHR) {
				if (data.state == 200) {
					// convertprocess请求成功
					var convertstate = data.data.convertstate;
					var name = data.data.name;
					var filename = data.data.filename;
					var state = data.data.state;
					
					console.log("State: " + state);
					console.log("File Convert State: " + convertstate);
					
					if(state == 200) {
						if (convertstate == "notstart") {
							setTimeout(function() { 
								requestConvertProcess(); 
							}, 2000);
						} 
						else if (convertstate == "started") {
							$("#progress_alert").html("正在处理文档，请稍候…");
							setTimeout(function() {
								requestConvertProcess();
							}, 2000);
						}
						else if (convertstate == "executing") {
							setTimeout(function() {
								requestConvertProcess();
							}, 2000);
						}
						else if (convertstate == "completed") {
							// 转换完成
							$("#progress_alert").html("文档处理完成");
							
							// 请求文件转换后生成的访问url
							requestFileUrlList();
						}
						else if (convertstate == "failed") {
							$("#progress_alert").html("文档处理失败");
							// 重置 UI
							resetUI();
						}
						else {
							setTimeout(function() {
								requestConvertProcess();
							}, 2000);
						}	 
					} 
					else {
						$("#progress_alert").html("文档转换出错");
						// 重置 UI
						resetUI();
					}
				} 
			}, 'json');
	};

	// 请求文件转换后生成的访问url
	global.requestFileUrlList = function() {
		var self = this;
		$.get('sharing/fileurllist', {}
			, function(data, textStatus, jqXHR) {
				if (data.state == 200) {

					var file = data.data.file;
					console.log("file:" + file);
					if (null != sharingReady) {
						sharingReady.call(null, file);
					}

					// 重置 UI
					resetUI();
				} 
	    }, 'json');
	};

	global.resetUI = function() {
		$('#file').html('点击“选择文件”按钮，选择您需要分享的文件');
		$('#upload_form').show();
		$("#progress_block").hide();

		$("#progress_alert").html("上传文件...");
		$("#progress_bar").width("0%");
		$('#btn_submit').attr('disabled', 'disabled');
		$('#uploadfile').val('');
	};
})(window);

$(document).ready(function(e) {
	// 重置 UI
	window.resetUI();

	var updateUI = function() {
		if ($("#uploadfile").val()) {
			$('#btn_submit').removeAttr('disabled');
		} else {
			$('#btn_submit').attr('disabled', 'disabled');
		}
	};

	$('#btn_submit').click(function() {
		$('#upload_form').submit();

		$('#upload_form').hide();
		$("#progress_block").show();

		// 唤醒文件上传进度条
		window.notifyFileUploadProcess();
	});

	$('#uploadfile').change(function() {
		updateUI();

		var filename = null;
		var filesize = 0;
		var f = document.getElementById("uploadfile");
		if ('files' in f) {
			if (f.files.length == 0) {
				// 无文件选择
			}
			else {
				var file = f.files[0];
				if ('name' in file) {
					filename = file.name;
				}
				if ('size' in file) {
					filesize = file.size;
				}
			}
		}

		if (null == filename) {
			$('#file').html('点击“选择文件”按钮，选择您需要分享的文件');
			return;
		}

		var size = new Number(filesize);
		if (size < 1024) {
			size += ' bytes';
		}
		else if (size >= 1024 && size < 1048576) {
			size = (size / 1024).toFixed(2);
			size += ' KB';
		}
		else if (size >= 1048576) {
			size = (size / 1048576).toFixed(2);
			size += ' MB';
		}

		var txt = '<span class="glyphicon glyphicon-file"></span> ' + filename + ' <span class="file-size text-info">文件大小：' + size + '</span>';
		$('#file').html(txt);
	});
});
</script>
</body>
</html>
