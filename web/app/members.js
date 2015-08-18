/**
 * 
 */

;(function(global) {
	
	
	// ReadWhileboard 设置ReadWhileboard的权限是否可用
	function setAuthReadWhileboard(obj, tenantName, auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				alert(isHasAuth);

				if (isHasAuth) {
					obj.attr('class', 'icon icon-read-whileboard');
				} else {
					obj.attr('class', 'icon icon-read-whileboard-disabled');
				}
			}
		});
		
	}

	//写白板权限
	function setAuthWriteWhileboard(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class', 'icon icon-write-whileboard');
				} else {
					obj.attr('class','icon icon-write-whileboard-disabled');
				}
			}
		});
	}
	
	//SharingFile
	function setAuthSharingFile(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-sharing-file');
				} else {
					obj.attr('class','icon icon-sharing-file-disabled');
				}
			}
		});
	}
	
	//VoiceIn
	function setAuthVoiceIn(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class', 'icon icon-voice-in');
				} else {
					obj.attr('class', 'icon icon-voice-in-disabled');
				}
			}
		});
	}
	
	//VoiceOut
	function setAuthVoiceOut(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class', 'icon icon-voice-out');
				} else {
					obj.attr('class', 'icon icon-voice-out-disabled');
				}
			}
		});
	}
	
	//VideoIn
	function setAuthVideoIn(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-video-in');
				} else {
					obj.attr('class','icon icon-video-in-disabled');
				}
			}
		});
	}
	
	//VideoOut
	function setAuthVideoOut(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-video-out');
				} else {
					obj.attr('class','icon icon-video-out-disabled');
				}
			}
		});
	}
	
	//SendMessage
	function setAuthSendMessage(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-send-message');
				} else {
					obj.attr('class','icon icon-send-message-disabled');
				}
			}
		});
	}
	
	//ReceiveMessage
	function setAuthReceiveMessage(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-receive-message');
				} else {
					obj.attr('class','icon icon-receive-message-disabled');
				}
			}
		});
	}
	
	//HandsUp
	function setAuthHandsUp(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-hands-up');
				} else {
					obj.attr('class', 'icon icon-hands-up-disabled');
				}
			}
		});
	}
	
	//Invite
	function setAuthInvite(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-invite');
				} else {
					obj.attr('class','icon icon-invite-disabled');
				}
			}
		});
	}
	
	//KickOut
	function setAuthKickOut(obj,tenantName,auth) {
		if (presenter != null && tenant != presenter) { //如果不是主持人
			return; 
		}

		var params = {
			token: token,
			csid : csid,
			tenant : tenantName,
			code : auth
		};
		
		$.post("auth/change",params,function(data, textStatus, jqXHR) {
			var state = data.state;
			if(state == 200){
				var isHasAuth = data.data.isHasAuth;
				if (isHasAuth) {
					obj.attr('class','icon icon-kick-out');
				} else {
					obj.attr('class', 'icon icon-kick-out-disabled');
				}
			}
		});
	}
	
	
	$(function() { 
		
		var content = $('#popover_content').html();
		$("#presenter_more_div").popover({
            content: content,
            trigger: 'click',
            placement: 'bottom',
            html: true
        });
		
     	});

	global.app = {
		resizeTimer : 0,

		resize : function() {
			var h = document.body.clientHeight;
			var height = h;
			$('#members_container').height(height);
			
			var temp = (document.body.clientWidth / 2) / (4 + 16);
			var count = Math.floor(temp);
			var row = nameListCount;
			if(row <= 2)
				row = 3;
			
			if(memberCount > 0) {
				$(".member-auth-more").show();
			}
			
			if(guestCount > 0) {
				$(".guest-auth-more").show();
			}
			$(".presenter-auth-more").show();
			
			for (var r = 0; r < row; ++r) {
				if (count >= 6) {
					//最后一个放更多
					for (var c = 0; c <= 5; ++c) {
						$('.r'+r+'c'+c).show();
					}
					
				} else if (count < 6) {
					for (var c = 0; c <= count-1; ++c) {
						$('.r'+r+'c'+c).show();
					}
				}
			}
		},

		onResize : function() {
			if (this.resizeTimer > 0) {
				clearTimeout(this.resizeTimer);
			}

			var self = this;
			this.resizeTimer = setTimeout(function() {
				clearTimeout(self.resizeTimer);
				self.resizeTimer = 0;

				self.resize();
			}, 100);
		},
			
	};

	$('.auth-110').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthReadWhileboard(obj, name, 110);
		});
	});
	
	
	$('.auth-220').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthVoiceOut(obj, name, 220);
		});
	});
	
	$('.auth-800').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthInvite(obj, name, 800);
		});
	});
	
	$('.auth-320').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthReceiveMessage(obj, name, 320);
		});
	});
	
	$('.auth-240').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthVideoOut(obj, name, 240);
		});
	});
	
	$('.auth-700').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthHandsUp(obj, name, 700);
		});
	});
	
	$('.auth-210').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthVoiceIn(obj, name, 210);
		});
	});
	
	$('.auth-230').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthVideoIn(obj, name, 230);
		});
	});
	
	$('.auth-310').each(function(index, element) {
		var self = $(this);
		$(this).click(function(e) {
			var obj = self.find('span');
			var name = $(this).attr('data-name');
			setAuthSendMessage(obj, name, 310);
		});
	});
	
	
	
})(window);

$(document).ready(function(e) {
		
	// 处理 resize 事件
	$(window).resize(function(e) {
		app.onResize();
	});
	
	// 重置大小
	app.resize();

});


	
	