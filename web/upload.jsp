<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.util.*"%>
<%
String token = request.getParameter("token");
String error = request.getParameter("error");
%>
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
<title>Cube White Board</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<link href="app/styles/common.css" rel="stylesheet">
<style>
html, body {
	width: 100%;
	height: 100%;
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
	font-size: 14px !important;
	margin-bottom: 10px;
}
</style>
</head>

<body>
<%
if (null == error) { 
	// 
%>

<form id="upload_form" method="POST" enctype="multipart/form-data" action="share/uploadfile?token=<%=token%>" target="target_upload">
	<div class="form-group">
		<label for="upfile">选择分享文档</label>
		 <!-- FireFox -->
		 <input id="upfile" type="file" name="upfile" accept=".jpeg, .jpg, .png, .bmp, .gif, .doc, .docx, .ppt, .pptx, .pdf, .mp4, .mp3, .ogg, .wav" >
		<p class="help-block">请选择您要分享的文档。</p>
	</div>
	<div class="form-group">
		<fieldset>
			<legend class="legend">支持的文档类型</legend>
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
	<div>
		<input id="token" type="hidden" name="token" value="<%=token %>">
	</div>
	<button class="btn btn-primary" id="_btn_submit" type="submit" disabled>确认上传</button>
</form>
<iframe id='target_upload' name='target_upload' src='' style='display: none'></iframe>
<%
}
else {
%>
<div class="alert alert-danger" role="alert">上传文件错误：<%=error %></div>
<%
}
%>

<script type="text/javascript" src="assets/js/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
<script type="text/javascript">
$(document).ready(function(e) {
	submitDisabled = function() {
		if($("#upfile").val()) {
			$('#_btn_submit').attr('disabled', false);
		} else {
			$('#_btn_submit').attr('disabled', true);
		}
	}
	
	$('#_btn_submit').click(function() {
		window.parent.onSubmit();
	});
	
	window.onShare = function (){
		$("#upfile").replaceWith($("#upfile").val('').clone(true));
		submitDisabled();
	};
	
	$('#upfile').change(submitDisabled);
});
</script>
</body>
</html>
