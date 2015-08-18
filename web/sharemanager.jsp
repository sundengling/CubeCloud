<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.util.*"%>
<%
String token = request.getParameter("token");
String error = request.getParameter("error");
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
<title>Cube Share Manager</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<style>
html, body {
	height: 100%;
}
</style>
</head>
<body>
<iframe id="_upload_frame" src="upload.jsp?token=<%=token%>" frameborder="0" width="100%" height="100%"></iframe>

<!-- 进度条 -->
<div id="_progress_block" style="display:none">
	<div id="_progress_alert" class="alert alert-success" role="alert">上传文件...</div>
	<div class="progress">
	  <div id="_progress_bar" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
	  </div>
	</div>
</div>

<script type="text/javascript" src="assets/js/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
<script type="text/javascript">
$(document).ready(function(e) {
	notifyProgress = function() {
		var contentWindow = $("#_upload_frame")[0].contentWindow;
		if (null != contentWindow) {
			contentWindow.onShare();
		}
		else {
			setTimeout(notifyProgress, 100);
		}
	};

	window.onShare = function () {
		notifyProgress();
	};

	window.onSubmit = function (){
		$("#_upload_frame").height(0);
		$("#_progress_block").show();
		window.parent.notifyUpload();
	};

	window.onConvertCompleted = function(){
		$("#_progress_bar").width("100%");
		$("#_progress_alert").html("完成文档处理");
		$("#_upload_frame").height("100%");
		$("#_progress_block").hide();
	};

	window.onConvertFailed = function(){
	    $("#_progress_alert").attr("class", "alert alert-warning");
		$("#_progress_alert").html("文档处理失败");
		$("#_progress_bar").width("0%");
	};

	window.onProgress = function(value) {
		//var val = "width: " + value + "%";
		//$("#_progress_bar").attr("style", val);
		$("#_progress_bar").width(value + "%");
	};

	window.onProgressAlert = function (value) {
		$("#_progress_alert").html(value);
	};

	window.reset = function() {
		$("#_progress_alert").attr("class", "alert alert-success");
		$("#_progress_alert").html("上传文件...");
		$("#_progress_bar").width("0%");
		$("#_upload_frame").height("100%");
		$("#_progress_block").hide();
	};
});
</script>
</body>
</html>