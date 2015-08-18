<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.util.*"%>
<%
// 调试参数
String debug = request.getParameter("debug");
if (null != debug) {
	debug = "&debug=" + debug;
}
else {
	debug = "";
}

// CSID - Channel Session ID
String csid = request.getParameter("csid");
// PCN - Peer Cube Name
String pcn = request.getParameter("pcn");

// 如果 CSID 和 PCN 都是空则跳转回首页
if (null == csid && null == pcn) {
	response.sendRedirect(request.getContextPath() + "/index.html");
	return;
}

// 获取当前租户
Tenant tenant = ServletUtils.verifyWithCookieNoRespond(request, response);

// 令牌
String token = null;
// CN
String cubeName = null;
// CGN
String cubeGroupName = null;

// 页面名
String pageTitle = null;
// Member frame
String memberFrame = null;
// RTC frame
String rtcFrame = null;
// Whiteboard frame
String wbFrame = null;
// Messager frame
String messagerFrame = null;

Channel channel = null;
boolean guest = false;
Tenant peer = null;

if (null != csid) {
	// 获取频道
	channel = ChannelFactory.getInstance().getChannel(csid);
	if (null == channel) {
		response.sendRedirect(request.getContextPath() + "/error.jsp?sc=" + StateCode.NotFindChannel.getCode());
		return;
	}

	// 是否是访客
	guest = (null == tenant);
	if (guest) {
		// 判断频道是否是开放式的，如果是开放频道则允许访客参与
		if (channel.isOpen()) {
			// 创建一个随机访客
			tenant = Guest.createRandomGuest();
			Cookie cookie = new Cookie("token", tenant.getToken());
			cookie.setMaxAge(24 * 60 * 60);
			response.addCookie(cookie);
		}
		else {
			// 不允许访问
			response.sendRedirect(request.getContextPath() + "/error.jsp?sc=" + StateCode.NoOpenChannel.getCode());
			return;
		}
	}

	token = tenant.getToken();
	cubeName = tenant.getCubeAccount();
	cubeGroupName = channel.getCubeGroupAccount();

	if (!channel.hasPassword()) {
		// 没有密码
		if (channel.existMember(tenant)) {
			channel.comeback(tenant);
		}
		else {
			boolean ret = channel.join(tenant);
			if (!ret) {
				// 达到人数上限无法加入
				// 不允许访问
				response.sendRedirect(request.getContextPath() + "/error.jsp?sc=" + StateCode.ChannelFull.getCode());
				return;
			}
		}
	}
	else {
		// 需要密码
		String verify = request.getParameter("v");
		boolean joined = false;
		if (null != verify && verify.length() > 1) {
			Cookie[] cookies = request.getCookies();
			for (Cookie c : cookies) {
				if (c.getName().equals("v") && c.getValue().equals(verify)) {
					// 加入
					if (channel.existMember(tenant)) {
						channel.comeback(tenant);
					}
					else {
						boolean ret = channel.join(tenant);
						if (!ret) {
							// 达到人数上限无法加入
							// 不允许访问
							response.sendRedirect(request.getContextPath() + "/error.jsp?sc=" + StateCode.ChannelFull.getCode());
							return;
						}
					}
					joined = true;
					break;
				}
			}
		}

		if (guest) {
			joined = false;
		}

		if (!joined) {
			// 页面跳转
			RequestDispatcher dispatcher = request.getRequestDispatcher("/verify.jsp?csid=" + csid);
			dispatcher.forward(request, response);
			return;
		}
	}

	// 页面标题
	pageTitle = channel.getDisplayName();
	memberFrame = "members.jsp?token=" + token + "&csid=" + csid + "&cgn=" + cubeGroupName + "&cn=" + cubeName + debug;
	rtcFrame = "rtc.html?token=" + token + "&csid=" + csid + "&cgn=" + cubeGroupName + "&cn=" + cubeName + debug;
	wbFrame = "whiteboard.jsp?token=" + token + "&csid=" + csid + "&cgn=" + cubeGroupName + "&cn=" + cubeName + debug;
	messagerFrame = "messager.jsp?token=" + token + "&csid=" + csid + "&cgn=" + cubeGroupName + "&cn=" + cubeName + debug;
}
else {
	if (null == tenant) {
		response.sendRedirect(request.getContextPath() + "/error.jsp?sc=" + StateCode.Unauthorized.getCode());
		return;
	}

	token = tenant.getToken();
	cubeName = tenant.getCubeAccount();

	peer = TenantCache.getInstance().getByCubeAccount(pcn);
	pageTitle = "与 " + peer.getDisplayName() + " 一对一";
	memberFrame = "one2one.jsp?token=" + token + "&pcn=" + pcn + "&cn=" + cubeName + debug;
	rtcFrame = "rtc.html?token=" + token + "&pcn=" + pcn + "&cn=" + cubeName + debug;
	wbFrame = "whiteboard.jsp?token=" + token + "&pcn=" + pcn + "&cn=" + cubeName + debug;
	messagerFrame = "messager.jsp?token=" + token + "&pcn=" + pcn + "&cn=" + cubeName + debug;
}
%>
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><%=pageTitle %> - 魔方实时协作云</title>
<link href="assets/css/bootstrap.min.css" rel="stylesheet">
<link href="app/styles/common.css" rel="stylesheet">
<link href="app/styles/session.css" rel="stylesheet">
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
<nav id="main_nav" class="navbar navbar-default app-navbar">
	<div class="container">
		<div class="navbar-header">
			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<a class="navbar-brand brand" href="javascript:;">魔方实时协作云 - <%=pageTitle %></a>
		</div>
		<div id="navbar" class="navbar-collapse collapse">
			<ul class="nav navbar-nav navbar-right">
				<li class="dropdown">
					<a href="" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
						<span class="icon icon-user-face" style="background-image:url(<%=tenant.getFace()%>)" aria-hidden="true" title="我的头像"></span> <span><%=tenant.getDisplayName() %></span> <span class="caret"></span>
					</a>
					<ul class="dropdown-menu" role="menu">
						<li><a id="btn_close" href="javascript:window.close();"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> 关闭</a></li>
						<li class="divider"></li>
						<li><a id="btn_quit" href="javascript:;"><span class="glyphicon glyphicon-log-out" aria-hidden="true"></span> 退出当前频道</a></li>
						<li><a id="btn_signout" href="javascript:;"><span class="glyphicon glyphicon-new-window" aria-hidden="true"></span> 登出协作云</a></li>
					</ul>
				</li>
			</ul>
<%
if (null != channel) {
%>
			<div class="nav navbar-nav navbar-right nav-role">
				<span class="icon <%=tenant.getName().equals(channel.getFounderName()) ? "icon-presenter" : "icon-member" %>" title="<%=tenant.getName().equals(channel.getFounderName()) ? "我是频道创建人" : "我是频道成员" %>"></span>
			</div>
			<form class="navbar-form navbar-right" action="auth/signin" method="post" style="display:<%=(guest ? "block !important" : "none !important") %>">
				<div class="form-group">
					<input type="text" name="name" placeholder="电子邮箱地址" class="form-control">
				</div>
				<div class="form-group">
					<input type="password" name="pwd" placeholder="登录密码" class="form-control">
				</div>
				<input type="hidden" name="csid" value="<%=csid %>">
				<button type="submit" class="btn btn-primary">登录</button>
				<a class="btn btn-default" href="signup.html?csid=<%=csid %>" target="_self">注册</a>
			</form>
			<!-- <form class="navbar-form navbar-right" style="margin-right:30px;">
				<button type="button" class="btn btn-default-inverse btn-os disabled"><span class="icon icon-android"></span> 未发现</button>
				<button type="button" class="btn btn-default-inverse btn-os disabled"><span class="icon icon-ios"></span> 未发现</button>
			</form> -->
		</div><!--/.navbar-collapse -->
<%
}
%>
	</div>
</nav>

<div class="container main">
	<div class="row">
		<!-- 左侧列 -->
		<div id="sidebar_left" class="col-md-2 visible-md visible-lg sidebar-container">
			<div class="sidebar-left">
				<div id="panel_members" class="panel panel-default app-panel">
					<div class="panel-body">
						<iframe id="frame_members" width="100%" height="100%" src="<%=memberFrame %>" allowFullScreen="allowFullScreen" frameborder="0" hspace="0" vspace="0" marginheight="0" marginwidth="0"></iframe>
					</div>
				</div>
				<div id="panel_rtc" class="panel panel-default app-panel">
					<div class="panel-body" style="height:<%=(null != channel) ? "224px" : "408px"%>;">
						<div class="rtc-container">
							<iframe id="frame_rtc" width="100%" height="100%" src="<%=rtcFrame %>" allowFullScreen="allowFullScreen" frameborder="0" hspace="0" vspace="0" marginheight="0" marginwidth="0"></iframe>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 中间列 -->
		<div id="center" class="col-md-7 col-sm-12 center-container">
			<div class="center">
				<div id="panel_wb" class="panel panel-default app-panel">
					<div class="panel-heading">
						<div class="navbar">
							<div class="navbar-header">
								<h2 class="panel-title"><%=pageTitle %></h2>
							</div>
							<div class="default-wb-nav">
								<div class="navbar-collapse collapse">
									<form class="navbar-form navbar-right">
										<button id="btn_back_defaultlayout" type="button" class="btn btn-default" title="返回标准模板"><span class="glyphicon glyphicon-home"></span></button>
										<button id="btn_fullscreen" type="button" class="btn btn-default" title="全屏模式切换"><span class="glyphicon glyphicon-resize-small"></span></button>
									</form>
								</div>
							</div>
						</div>
					</div>
					<div class="panel-body">
						<iframe id="frame_wb" width="100%" height="100%" src="<%=wbFrame %>" allowFullScreen="allowFullScreen" frameborder="0" hspace="0" vspace="0" marginheight="0" marginwidth="0"></iframe>
					</div>
				</div>
			</div>
		</div>

		<!-- 右侧列 -->
		<div id="sidebar_right" class="col-md-3 visible-md visible-lg sidebar-container">
			<div class="sidebar-right">
				<div id="panel_tabs" class="panel panel-default app-panel">
					<div class="panel-body">
						<div role="tabpanel">
							<ul class="nav nav-tabs" role="tablist">
								<li role="presentation" class="active">
									<a href="#messager" aria-controls="messager" role="tab" data-toggle="tab">消息对话</a>
								</li>
								<!-- li role="presentation">
									<a href="#files" aria-controls="profile" role="tab" data-toggle="tab">文档管理</a>
								</li -->
								<li role="presentation">
									<a href="#help" aria-controls="profile" role="tab" data-toggle="tab">帮助</a>
								</li>
							</ul>
							<div class="tab-content">
								<div role="tabpanel" class="tab-pane fade in active" id="messager">
									<iframe id="frame_messager" width="100%" height="100%" src="<%=messagerFrame %>" allowFullScreen="allowFullScreen" frameborder="0" hspace="0" vspace="0" marginheight="0" marginwidth="0"></iframe>
								</div>
								<!-- div role="tabpanel" class="tab-pane fade" id="files">
									<iframe id="frame_fileexplorer" width="100%" height="100%" src="fileexplorer.jsp" allowFullScreen="allowFullScreen" frameborder="0" hspace="0" vspace="0" marginheight="0" marginwidth="0"></iframe>
								</div -->
								<div role="tabpanel" class="tab-pane fade" id="help">
									<div class="help-text">
										<h5>系统介绍</h5>
										<p>魔方实时协作云是具有音/视屏通话、即时消息、即时白板、文档共享、跨屏协作功能的协作云平台。</p>
										<p>在魔方云里，每一个用户都可以创建用于协作的频道，也可以参与到其他用户创建的频道中。</span>。</p>
										<p>在<strong>频道</strong>里您可以和参与者一起进行工作、会议和协商，使用的协作方式包括<b>视频会议</b>、<b>语音会议</b>、<b>即时消息</b>、<b>文件分享</b>、<b>智能白板</b>、<b>短视频</b>、<b>短语音</b>、<b>桌面共享</b>、<b>分屏控制</b>等等。您可以使用桌面电脑、笔记本电脑、智能手机（Android、iPhone）、平板电脑（Android Pad、iPad）等终端加入频道，参与协作。</p>
										<p>每一个用户在魔方云里都拥有一个专属于自己的管理入口：<span class="text-primary"><strong>我的魔方</strong></span>。“我的魔方”（正在开发）</p>
										<p>&nbsp;</p>
										<h5>使用说明</h5>
										<p><strong>标准模板</strong>是默认的集中式布局模板。</p>
										<p><button type="button" class="btn btn-default" data-toggle="modal" data-target=".manual-figure" onClick="javascript:app.showFigure(1);">标准模板界面示意图</button></p>
										<p><button type="button" class="btn btn-default" data-toggle="modal" data-target=".manual-figure" onClick="javascript:app.showFigure(2);">会议模板界面示意图</button></p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div id="panel_control" class="panel panel-default app-panel">
					<div class="panel-body">
						<div class="btn-group dropup">
							<button id="btn_toggle_messager" type="button" class="btn btn-default" style="margin-right:5px;" title="展开消息框">
								<span class="glyphicon glyphicon-triangle-left"></span> <span class="_label"></span>
							</button>
							<button id="layout_item_0" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
								<span class="m-label">标准模板</span> <span class="caret"></span>
							</button>
							<ul class="dropdown-menu" role="menu">
								<li><a id="layout_item_1" href="javascript:;"><span class="m-label">演讲模板</span></a></li>
								<li><a id="layout_item_2" href="javascript:;"><span class="m-label">会议模板</span></a></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 会议布局容器 -->
<div class="conference-layout-placeholder"></div>
<div class="conference-layout-control">
	<div>
		<button id="btn_conference_layout_controller" class="btn btn-block btn-collapse-up">&nbsp;</button>
	</div>
	<div class="container">
		<div class="row">
			<div class="col-xs-6"><button id="btn_defaultlayout" type="button" class="btn btn-block btn-default" data-toggle="tooltip" data-placement="left" title="返回标准模板"><span class="icon"></span></button></div>
			<div class="col-xs-6"><button id="btn_fullscreen" type="button" class="btn btn-block btn-default" data-toggle="tooltip" data-placement="right" title="切换全屏"><span class="icon icon-fullscreen"></span></button></div>
		</div>
	</div>
</div>

<!-- 通用模态对话框 -->
<div id="modal_alert" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="AlertModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close hidden" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="AlertModalLabel">提示</h4>
			</div>
			<div class="modal-body">
				<div id="alert_content"></div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-primary btn-ok" data-dismiss="modal">确定</button>
				<button type="button" class="btn btn-default btn-cancel" data-dismiss="modal">取消</button>
				<button type="button" class="btn btn-default btn-close" data-dismiss="modal">关闭</button>
			</div>
		</div>
	</div>
</div>

<div class="modal fade manual-figure" tabindex="-1" role="dialog" aria-labelledby="ManualModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="ManualModalLabel">说明书插图</h4>
			</div>
			<div class="modal-body">
				<img id="figure_1" src="assets/images/manual_figure1.png" class="img-responsive" width="100%" height="auto"/>
				<img id="figure_2" src="assets/images/manual_figure2.png" class="img-responsive" width="100%" height="auto"/>
			</div>
		</div>
	</div>
</div>

<footer class="container app-footer">
	<div class="row">
		<div class="col-xs-6">
			<span>魔方协作云 <%=Version.getDescription() %></span>
		</div>
		<div class="col-xs-6 text-right">
			<span>版权所有 &copy; 2015 魔方实时协作云。</span>
		</div>
	</div>
</footer>

<script type="text/javascript">
window._token = "<%=token%>";
<%
if (null != csid) {
%>
window._csid = "<%=csid%>";
var _requirePassword = <%=channel.hasPassword() %>;
<%
}
else {
%>
window._pcn = "<%=pcn%>";
<%
}
%>
</script>
<script type="text/javascript" src="assets/js/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
<script type="text/javascript" src="libs/nucleus-min.js"></script>
<script type="text/javascript" src="libs/cube-core-min.js"></script>
<script type="text/javascript" src="app/session.js"></script>
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script src="assets/js/ie10-viewport-bug-workaround.js"></script>
</body>
</html>
