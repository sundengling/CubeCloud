<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*" %>
<%
String strsc = request.getParameter("sc");
if (null == strsc) {
	strsc = "100";
}
StateCode sc = StateCode.parse(Integer.parseInt(strsc));
StringBuilder desc = new StringBuilder("Error: ");
desc.append(strsc);
desc.append(" - ");
if (sc == StateCode.InvalidParameter) {
	desc.append("参数错误");
}
else if (sc == StateCode.ChannelFull) {
	desc.append("频道配额已满");
}
else {
	desc.append("未知的错误信息");
}
%>
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>发生错误 - 魔方实时协作云</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<link href="app/styles/common.css" rel="stylesheet">
<link href="app/styles/error.css" rel="stylesheet">
<!-- Just for debugging purposes. Don't actually copy these 2 lines! -->
<!--[if lt IE 9]><script src="assets/js/ie8-responsive-file-warning.js"></script><![endif]-->
<script src="assets/js/ie-emulation-modes-warning.js"></script>

<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
<!--[if lt IE 9]>
	<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
<![endif]-->

<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" href="favicon.ico">
</head>

<body>
<nav class="navbar navbar-default">
	<div class="container">
		<div class="navbar-header">
			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<a class="navbar-brand brand" href="index.html">魔方实时协作云</a>
		</div>
	</div>
</nav>

<div class="container">
	<div class="row">
		<div class="col-sm-12 text-center">
			<h3>很抱歉，您的操作发生了错误</h3>
		</div>
	</div>
	<p>&nbsp;</p>
	<div class="row">
		<div class="col-sm-5 text-right">
			<span class="glyphicon glyphicon-alert text-danger" style="font-size:36px;"></span>
		</div>
		<div class="col-sm-7 text-left">
			<div class="info text-danger"><%=desc.toString() %></div>
		</div>
	</div>
</div>

<footer class="footer">
	<div class="container center-block text-center">
		<p>版权所有 &copy; 2015 Cube Team. 保留所有权利。</p>
	</div>
</footer>

<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script type="text/javascript" src="assets/js/ie10-viewport-bug-workaround.js"></script>
<script type="text/javascript" src="libs/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
</body>
</html>
