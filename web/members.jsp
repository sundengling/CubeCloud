<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.*"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.auth.*"%>
<%@page import="cube.cloud.util.*"%>
<%
Tenant tenant = ServletUtils.verifyWithParameterNoRespond(request, response);
if (null == tenant) {
	// 未登录的用户
	return;
}

String token = request.getParameter("token");
String csid = request.getParameter("csid");
Channel channel = ChannelFactory.getInstance().getChannel(csid);
Tenant presenter = channel.getFounder();
List<String> memberNameList = channel.getMemberNameList();

String presenterName = (null != presenter) ? presenter.getDisplayName() : channel.getFounderName();

List<String> memberList  = new ArrayList<String>();
List<String> guestList = new ArrayList<String>();

for (String name: memberNameList) {
	Role role = channel.getTenantRole(name);
	if (role instanceof PresenterRole) {
		continue;
	}
	if (role instanceof MemberRole) {
		memberList.add(name);
	}
	else {
		guestList.add(name);
	}
}
%>
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="refresh" content="30">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
<title>Cube Cloud Members</title>
<link type="text/css" rel="stylesheet" href="assets/css/bootstrap.min.css">
<link href="app/styles/common.css" rel="stylesheet">
<link href="app/styles/members.css" rel="stylesheet">
</head>

<body>
<div id="members_container" class="table-responsive">
	<table class="table table-hover">
		<thead>
			<tr>
				<th colspan="2" width="100%">成员</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>
					<span class="icon icon-presenter"></span>
					<span class="name-text" title="<%=presenterName%>"><%=presenterName%></span>					
				</td>
				<td>
					<div class="row">
						<div class="col-xs-12" id="authwidth">
							<span id="r0_c0" class="auth-item r0c0"><button class="btn"><span class="icon icon-read-whileboard" title="读白板"></span></button></span>
							<span id="r0_c1" class="auth-item r0c1"><button class="btn"><span class="icon icon-write-whileboard" title="写白板"></span></button></span>
							<span id="r0_c2" class="auth-item r0c2"><button class="btn"><span class="icon icon-sharing-file" title="分享文件"></span></button></span>
							<span id="r0_c3" class="auth-item r0c3"><button class="btn"><span class="icon icon-voice-out" title="听筒"></span></button></span>
							<span id="r0_c4" class="auth-item r0c4"><button class="btn"><span class="icon icon-voice-in" title="话筒"></span></button></span>
							<span id="r0_c5" class="auth-item r0c5"><button class="btn"><span class="icon icon-video-out" title="看视频"></span></button></span>
							<span id="r0_c6" class="auth-item r0c6"><button class="btn"><span class="icon icon-video-in" title="视频"></span></button></span>
							<span id="r0_c7" class="auth-item r0c7"><button class="btn"><span class="icon icon-send-message" title="发消息"></span></button></span>
							<span id="r0_c8" class="auth-item r0c8"><button class="btn"><span class="icon icon-receive-message" title="收消息"></span></button></span>
							<span id="r0_c9" class="auth-item r0c9"><button class="btn"><span class="icon icon-hands-up" title="举手"></span></button></span>
							<span id="r0_c10" class="auth-item r0c10"><button class="btn"><span class="icon icon-invite" title="邀请"></span></button></span>
							<span id="r0_c11" class="auth-item r0c11"><button class="btn"><span class="icon icon-kick-out" title="踢人"></span></button></span>
							<span class="auth-item auth-more presenter-auth-more"><button class="btn"><span class="icon icon-more" title="更多"></span></button></span>
						</div>
					</div>
				</td>
			</tr>

<%
if (memberList.size() != 0) {
 	for (String name : memberList) {
 		Role role = channel.getTenantRole(name);
 		Tenant member = TenantCache.getInstance().getByName(name);
 		String displayName = (null != member) ? member.getDisplayName() : name;
 		boolean isHasAuthReadWhileboard = role.hasAuthority(Authority.ReadWhileboard);
		boolean isHasAuthVoiceOut = role.hasAuthority(Authority.VoiceOut);
		boolean isHasAuthInvite = role.hasAuthority(Authority.ReadWhileboard);
		boolean isHasAuthReceiveMessage = role.hasAuthority(Authority.ReceiveMessage);
		boolean isHasVideoOut = role.hasAuthority(Authority.VideoOut);
		boolean isHasAuthHandsUp = role.hasAuthority(Authority.HandsUp);
		boolean isHasAuthVoiceIn = role.hasAuthority(Authority.VoiceIn);
		boolean isHasVideoIn = role.hasAuthority(Authority.VideoIn);
		boolean isHasSendMessage = role.hasAuthority(Authority.SendMessage);
%>
			<tr>
				<td>
					<span class="icon icon-member"></span>
					<span class="name-text" title="<%=displayName%>"><%=displayName%></span>
				</td>
				<td>
					<div class="row">
						<div class="col-xs-12">
							<span class="auth-item r1c0"><button class="btn auth-110" data-name="<%=name%>"><span class="<%if (isHasAuthReadWhileboard) {%>icon icon-read-whileboard<%} else {%>icon icon-read-whileboard-disabled<%}%>" title="读白板"></span></button></span>
							<span class="auth-item r1c1"><button class="btn auth-220" data-name="<%=name%>"><span class="<%if (isHasAuthVoiceOut) {%>icon icon-voice-out<%} else {%>icon icon-voice-out-disabled<%}%>" title="听筒"></span></button></span>
							<span class="auth-item r1c2"><button class="btn auth-800" data-name="<%=name%>"><span class="<%if (isHasAuthInvite) {%>icon icon-invite<%} else {%>icon icon-invite-disabled<%}%>" title="邀请"></span></button></span>
							<span class="auth-item r1c3"><button class="btn auth-320" data-name="<%=name%>"><span class="<%if (isHasAuthReceiveMessage) {%>icon icon-receive-message<%} else {%>icon icon-receive-message-disabled<%}%>" title="收消息"></span></button></span>
							<span class="auth-item r1c4"><button class="btn auth-240" data-name="<%=name%>"><span class="<%if (isHasVideoOut) {%>icon icon-video-out<%} else {%>icon icon-video-out-disabled<%}%>" title="看视频"></span></button></span>
							<span class="auth-item r1c5"><button class="btn auth-700" data-name="<%=name%>"><span class="<%if (isHasAuthHandsUp) {%>icon icon-hands-up<%} else {%>icon icon-hands-up-disabled<%}%>" title="举手"></span></button></span>
							<span class="auth-item r1c6"><button class="btn auth-210" data-name="<%=name%>"><span class="<%if (isHasAuthVoiceIn) {%>icon icon-voice-in<%} else {%>icon icon-voice-in-disabled<%}%>" title="听筒"></span></button></span>
							<span class="auth-item r1c7"><button class="btn auth-230" data-name="<%=name%>"><span class="<%if (isHasVideoIn) {%>icon icon-video-in<%} else {%>icon icon-video-in-disabled<%}%>" title="看视频"></span></button></span>
							<span class="auth-item r1c8"><button class="btn auth-310" data-name="<%=name%>"><span class="<%if (isHasVideoIn) {%>icon icon-send-message<%} else {%>icon icon-send-message-disabled<%}%>" title="发消息"></span></button></span>
							<span class="auth-item auth-more member-auth-more"><button class="btn"><span class="icon icon-more" title="更多"></span></button></span>
						</div>
					</div>
				</td>
			</tr>
<%
	}
}
%>
<%
if (guestList.size() != 0) {
	for (String name : guestList) {
		Role role = channel.getTenantRole(name);
		Tenant guest = TenantCache.getInstance().getByName(name);
 		String displayName = (null != guest) ? guest.getDisplayName() : name;
 		boolean isHasAuthReadWhileboard = role.hasAuthority(Authority.ReadWhileboard);
 		boolean isHasAuthVoiceOut= role.hasAuthority(Authority.VoiceOut);
 		boolean isHandAuthInvite = role.hasAuthority(Authority.ReadWhileboard);
 		boolean isHasAuthReceiveMessage = role.hasAuthority(Authority.ReceiveMessage);
 		boolean isHasVideoOut = role.hasAuthority(Authority.VideoOut);
%>
			<tr>
				<td>
					<span class="icon icon-guest"></span>
					<span class="name-text" title="<%=displayName%>"><%=displayName%></span>
				</td>
				<td>
					<div class="row">
						<div class="col-xs-12">
							<span class="auth-item r2c0"><button class="btn auth-110" data-name="<%=name%>"><span class="<%if (isHasAuthReadWhileboard) {%>icon icon-read-whileboard<%} else {%>icon icon-read-whileboard-disabled<%}%>" title="读白板"></span></button></span>
							<span class="auth-item r2c1"><button class="btn auth-220" data-name="<%=name%>"><span class="<%if (isHasAuthVoiceOut) {%>icon icon-voice-out<%} else {%>icon icon-voice-out-disabled<%}%>" title="听筒"></span></button></span>
							<span class="auth-item r2c2"><button class="btn auth-800" data-name="<%=name%>"><span class="<%if (isHandAuthInvite) {%>icon icon-invite<%} else {%>icon icon-invite-disabled<%}%>" title="邀请"></span></button></span>
							<span class="auth-item r2c3"><button class="btn auth-320" data-name="<%=name%>"><span class="<%if (isHasAuthReceiveMessage) {%>icon icon-receive-message<%} else {%>icon icon-receive-message-disabled<%}%>" title="收消息"></span></button></span>
							<span class="auth-item r2c0"><button class="btn auth-240" data-name="<%=name%>"><span class="<%if (isHasVideoOut) {%>icon icon-video-out<%} else {%>icon icon-video-out-disabled<%}%>" title="看视频"></span></button></span>
							<span class="auth-item auth-more guest-auth-more"><button class="btn"><span class="icon icon-more" title="更多"></span></button></span>
						</div>
					</div>
				</td>
			</tr>
<%
	}
}
%>
		</tbody>
	</table>
</div>

<script type="text/javascript">
var csid = "<%=csid%>";
var token = "<%=token%>";
var presenter = "<%=channel.getFounderName().trim()%>";
var tenant = "<%=tenant.getName().trim()%>";
var nameListCount = <%=memberNameList.size()%>;
var memberCount = <%=memberList.size()%>;
var guestCount = <%=guestList.size()%>;
</script>
<script type="text/javascript" src="assets/js/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
<script type="text/javascript" src="app/members.js"></script>
</body>
</html>
