<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.util.*"%>
<%
String csid = request.getParameter("csid");
String error = request.getParameter("error");
%>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
<meta name="description" content="">
<meta name="author" content="">
<link rel="icon" href="">
<title>频道进入验证 - 魔方实时协作云</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<link href="app/styles/common.css" rel="stylesheet">
<link href="app/styles/verify.css" rel="stylesheet">
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
	<form id="form" class="form-verify" action="verify.cube" method="post">
		<h2 class="form-verify-heading">进入频道密码</h2>
		<label for="input_password" class="sr-only">频道密码</label>
		<input type="password" id="input_password" name="p" class="form-control" placeholder="频道密码" required autofocus>
		<input type="hidden" name="csid" value="<%=csid %>">
		<button class="btn btn-lg btn-primary btn-block" type="submit">确认登录频道</button>
	</form>
</div> <!-- /container -->

<footer class="footer">
	<div class="container center-block">
		<p>版权所有 &copy; 2015 Cube Team. 保留所有权利。</p>
	</div>
</footer>

<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script type="text/javascript" src="assets/js/ie10-viewport-bug-workaround.js"></script>
<script type="text/javascript" src="libs/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="libs/nucleus-min.js"></script>
<script type="text/javascript" src="libs/cube-core-min.js"></script>
<script type="text/javascript" src="app/verify.js"></script>
<script type="text/javascript">var _e = <%=(null != error) ? error : "null" %>;</script>
</body>
</html>

