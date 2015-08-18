<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.util.*"%>
<%
Tenant tenant = ServletUtils.verifyWithCookieNoRespond(request, response);
if (null == tenant) {
	response.sendRedirect(request.getContextPath() + "/index.html");
	return;
}
%>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>我的魔方 - 魔方实时协作云</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<link href="app/styles/common.css" rel="stylesheet">
<link href="app/styles/mycube.css" rel="stylesheet">
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
<div class="container">
	<div class="row">
		<div class="col-md-4">
		</div>
		<div class="col-md-8">
		</div>
	</div>
</div>
<div class="footer">
</div>

<div style="height:99%;width:100%;background:url(assets/images/under_construction.jpg) no-repeat center">
	<div style="width:100%;font-size:24px;text-align:center;padding-top:30px;">
	</div>
</div>

<script type="text/javascript" src="assets/js/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
</body>
</html>
