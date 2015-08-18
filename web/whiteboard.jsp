<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="cube.cloud.*"%>
<%@page import="cube.cloud.core.*"%>
<%@page import="cube.cloud.util.*"%>
<%
String token = request.getParameter("token");
String debug = request.getParameter("debug");
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
<link href="libs/whiteboard-app.css" rel="stylesheet">
</head>

<body>
<div id="app_stage" class="stage">
	<div id="canvas"></div>
</div>
<div class="container toolbar">
	<div class="row">
		<div class="col-xs-8 col-sm-8 col-md-8 toolbar-col">
			<div class="btn-toolbar" role="toolbar" aria-label="toolbar">
				<div class="btn-group" role="group" aria-label="graphics-toolbar">
					<button id="btn_default" type="button" class="btn btn-selected" data-toggle="tooltip" data-placement="top" title="默认工具">
						<span class="icon icon-pointer-on" aria-hidden="true"></span>
					</button>
					<button id="btn_pencil" type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="铅笔工具">
						<span class="icon icon-pencil-on" aria-hidden="true"></span>
					</button>
				</div>
				<div id="group_draw_option" class="btn-group" role="group" aria-label="graphics-toolbar">
					<button id="btn_line_weight" type="button" class="btn btn-default opt-btn" data-toggle="tooltip" data-placement="top" title="铅笔线宽">
						<span class="icon icon-line-weight-2">●</span>
					</button>
					<button id="btn_draw_color" type="button" class="btn btn-default opt-btn" data-toggle="tooltip" data-placement="top" title="铅笔颜色">
						<span class="icon icon-color-0">▇</span>
					</button>
				</div>
				<div class="btn-group" role="group" aria-label="graphics-toolbar">
					<button id="btn_undo" type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="撤销">
						<span class="icon icon-undo-on" aria-hidden="true"></span>
					</button>
					<button id="btn_redo" type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="重做">
						<span class="icon icon-redo-on" aria-hidden="true"></span>
					</button>
					<button id="btn_erase" type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="擦除笔迹">
						<span class="icon icon-eraser-on" aria-hidden="true"></span>
					</button>
					<button id="btn_clear" type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="清空">
						<span class="icon icon-clear-on" aria-hidden="true"></span>
					</button>
					<!--button id="btn_test" type="button" class="btn btn-default" title="测试">
						<span class="glyphicon glyphicon-picture" aria-hidden="true"></span>
					</button-->
				</div>
				<div class="btn-group" role="group" aria-label="graphics-toolbar">
					<button id="btn_share" type="button" class="btn btn-default"  data-toggle="tooltip" data-placement="top" title="分享文档">
						<span class="icon icon-sharing-file-on" aria-hidden="true"></span>
					</button>
				</div>
			</div>
		</div>
		<div class="col-xs-3 col-sm-3 col-md-3 toolbar-col">
			<nav class="pull-right">
				<ul class="pagination">
					<li>
						<a id="btn_prev" href="javascript:;" aria-label="Previous" data-toggle="tooltip" data-placement="top" title="上一页">
							<span aria-hidden="true">&laquo;</span>
						</a>
					</li>
					<li><a id="btn_skip" href="javascript:;"><span id="page_info">无幻灯片</span></a></li>
					<li>
						<a id="btn_next" href="javascript:;" aria-label="Next" data-toggle="tooltip" data-placement="top" title="下一页">
							<span aria-hidden="true">&raquo;</span>
						</a>
					</li>
				</ul>
			</nav>
		</div>
		<div class="col-xs-1 col-sm-1 col-md-1 toolbar-col pull-right text-right" style="padding-top:1px;">
			<button type="button" class="btn btn-default disabled"><span class="glyphicon glyphicon-blackboard"></span></button>
		</div>
	</div>
</div>

<!-- div class="watermark"></div -->

<!-- 模态视图 -->
<div id="modal_share_file" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="UploadModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button id="modal_close_share" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">分享文档</h4>
			</div>
			<div class="modal-body">
				<iframe id="_share_manager_frame" src="sharemanager.jsp?token=<%=token %>" frameborder="0" width="100%" height="100%"></iframe>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script type="text/javascript" src="libs/jquery-2.1.3.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
<script type="text/javascript" src="libs/nucleus-min.js"></script>
<script type="text/javascript" src="libs/cube-core-min.js"></script>
<script type="text/javascript" src="libs/cube-whiteboard-min.js"></script>
<script type="text/javascript" src="libs/whiteboard-app.js"></script>
</body>
</html>
