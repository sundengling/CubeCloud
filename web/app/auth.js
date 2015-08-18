/*
 * auth.js
 */

// 添加权限状态监听
var AddAuthStatusListener = Class({
	ctor: function() {},
	
	onAddAuthSuccess: function(stateCode) {},

	onAddAuthFailed: function(stateCode) {}
});

// 移除权限状态监听
var RemoveAuthStatusListener = Class({
	ctor: function() {},
	
	onRemoveAuthSuccess: function(stateCode) {},

	onRemoveAuthFailed: function(stateCode) {}
});

// 查询权限状态监听
var QueryAuthStatusListener = Class({
	ctor: function() {},
	
	onQueryAuthSuccess: function(stateCode, authCodeList) {},

	onQueryAuthFailed: function(stateCode) {}
});

// 权限类
var Auth = Class({
	addAuthStatusListener: null,
	removeAuthStatusListener: null,
	queryAuthStatusListener: null,

	ctor: function() {
		
	},
	
	setAddAuthStatusListener: function(listener) {
		this.addAuthStatusListener = listener;
	},
	
	setRemoveAuthStatusListener: function(listener) {
		this.removeAuthStatusListener = listener;
	},
	
	setQueryAuthStatusListener: function(listener) {
		this.queryAuthStatusListener = listener;
	},
	
	// 添加权限
	addAuth: function(csid, tenantName, authCode) {
		var params = {csid: csid, tenantName: tenantName, authCode: authCode};
		$.post("auth/add", params, function(data, textStatus, jqXHR) {
			var state = data.state;
			if (state == 200) {
				this.addAuthStatusListener.onAddAuthSuccess(state);
			} else {
				this.addAuthStatusListener.onAddAuthFailed(state);
			}
		});
	},
	
	// 移除权限
	removeAuth: function(csid, tenantName, authCode) {
		var params = {csid: csid, tenantName: tenantName, authCode: authCode};
		$.post("auth/remove", params, function(data, textStatus, jqXHR) {
			var state = data.state;
			if (state == 200) {
				this.removeAuthStatusListener.onRemoveAuthSuccess(state);
			} else {
				this.removeAuthStatusListener.onRemoveAuthFailed(state);
			}
		});
	},
	
	// 查询权限
	queryAuth: function(token, csid) {
		var params = {token: token, csid: csid};
		$.get("auth/query", params, function(data, textStatus, jqXHR) {
			var state = data.state;
			if (state == 200) {
				var authCodeList = data.data.authCodeList;
				this.queryAuthStatusListener.onQueryAuthSuccess(state, authCodeList);
			} else {
				this.queryAuthStatusListener.onQueryAuthFailed(state);
			}
		});
	},
	
});

//初始化
(function(global) {
	Auth.sharedInstance = new Auth();
	global.auth = Auth.sharedInstance;
})(window);