<%@page import="cube.cloud.auth.Role"%>
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.util.*"%>
<%
Tenant tenant = ServletUtils.verifyWithParameterNoRespond(request, response);
if (null == tenant) {
	// 未登录的用户
	// TODO
}

String token = request.getParameter("token");
String cubeName = request.getParameter("cn");
String csid = request.getParameter("csid");
String cubeGroupName = request.getParameter("cgn");
String peerCubeName = request.getParameter("pcn");
String debug = request.getParameter("debug");
%>
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport"
	content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
<title>Cube Messager</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<link href="app/styles/common.css" rel="stylesheet">
<link href="app/styles/messager.css" rel="stylesheet">

</head>

<body>
<div id="msg_container" class="msg-container">
	<div id="msg_area" class="msg-area"></div>

	<div id="msg_form" class="msg-form">
		<form class="bs-example bs-example-form" role="form">
	    	<div class="input-group">
	        	<span class="input-group-btn">
	         		<button type="button" class="btn btn-default btn-plus" disabled="disabled">
		          	<!-- <span class="icon icon-upload-white"></span> -->
		        		<span class="glyphicon glyphicon-plus"></span>
		        	</button>
	         	</span>
	         	<input type="text" id="msg_text" class="form-control input-msg" placeholder="请输入内容">
	         	<span class="input-group-addon span-face">
	         		<span id="icon_face" class="icon icon-face" title="添加表情"></span>
	         	</span>
				<span class="input-group-btn">
					<button id="btn_send_msg" type="button" class="btn btn-default btn-send">发送</button>
		        </span>
	      	</div>
		</form>
	</div>
	
</div>

<script type="text/javascript">
var _token = '<%=token %>';
var _cubeName = '<%=cubeName %>';
var _csid = '<%=csid %>';
var _cubeGroupName = '<%=cubeGroupName %>';
var _peerCubeName = '<%=peerCubeName %>';
<% if (null == debug) { %>
var _debug = null;
<% } else { %>
var _debug = '<%=debug %>';
<% } %>
</script>
<script type="text/javascript" src="libs/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
<script type="text/javascript" src="libs/nucleus-min.js"></script>
<script type="text/javascript" src="libs/cube-core-min.js"></script>
<script type="text/javascript" src="libs/cube-messager-min.js"></script>
<script type="text/javascript" src="libs/jquery-emotion.js"></script>
<script type="text/javascript" src="app/messager.js"></script>
</body>
</html>
