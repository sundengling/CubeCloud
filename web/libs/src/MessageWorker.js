/*
 * MessageWorker.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/4/5.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeTextMessage = Class({
	type: "text",
	receiver: null,
	sender: null,

	sendTime: 0,
	receiveTime: 0,

	content: null,

	ctor: function(receiver, content) {
		this.receiver = { "name": receiver };
		this.content = content;
	},

	getContent: function() {
		return this.content;
	},

	getReceiver: function() {
		return this.receiver;
	},

	getSender: function() {
		return this.sender;
	},

	getSendTime: function() {
		return this.sendTime;
	},

	getReceiveTime: function() {
		return this.receiveTime;
	},

	toJSON: function() {
		var self = this;
		return {
			"type": "text",
			"from": self.sender,
			"to": self.receiver,
			"time": {
				"send": self.sendTime,
				"receive": self.receiveTime
			},
			"content": self.content
		};
	}
});

CubeTextMessage.parse = function(json) {
	// 创建消息实例
	var msg = new CubeTextMessage(json.to.name, json.content);
	msg.receiver.displayName = json.to.displayName;

	msg.sender = { "name": json.from.name, "displayName": json.from.displayName };

	msg.sendTime = json.time.send;
	msg.receiveTime = json.time.receive;

	return msg;
}

var CubeMessageWorker = Class({
	_msgSizeThreshold: 2048,

	delegate: null,
	session: null,

	notifyTimer: 0,

	queryHistoryCallback: null,

	ctor: function() {
	},

	setDelegate: function(delegate) {
		this.delegate = delegate;
	},

	pushMessage: function(mix, content) {
		if (null == this.session || null == this.session.name) {
			return false;
		}

		var msg = mix;
		if (typeof mix == "string") {
			if (content !== 'undefined') {
				msg = new CubeTextMessage(mix, content);
			}
			else {
				// 输入参数错误
				return false;
			}
		}

		if (msg.content.length > this._msgSizeThreshold) {
			// 回调错误发生
			this.delegate.didMessageFailed(CubeMessageErrorCode.ContentTooLong, msg);
			return false;
		}

		if (!nucleus.talkService.isCalled(_M_CELLET)) {
			return false;
		}

		// 设置发件人
		var self = this;
		msg.sender = { "name": self.session.name, "displayName": self.session.displayName };
		msg.sendTime = Date.now();

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionPush);
		dialect.appendParam("data", msg.toJSON());
		nucleus.talkService.talk(_M_CELLET, dialect);

		this.delegate.didMessageSend(msg);

		return true;
	},

	queryHistory: function(begin, end, callback, error) {
		if (null == this.session || null == this.session.name) {
			return false;
		}

		if (callback === undefined) {
			return false;
		}

		if (begin > end) {
			return false;
		}

		this.queryHistoryCallback = callback;

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionHistory);
		dialect.appendParam("data", {begin: begin, end: end});
		nucleus.talkService.talk(_M_CELLET, dialect);

		return true;
	},

	onRegisterStateChanged: function(session) {
		this.session = session;
	},

	onDialogue: function(action, dialect) {
		switch (action) {
			case CubeConst.ActionNotify:
			{
				this._processNotify(dialect);
				break;
			}
			case CubeConst.ActionPullAck:
			{
				this._processPullAck(dialect);
				break;
			}
			case CubeConst.ActionHistoryAck:
			{
				this._processHistoryAck(dialect);
				break;
			}
			default:
				break;
		}
	},

	_processNotify: function(dialect) {
		if (this.notifyTimer > 0) {
			clearTimeout(this.notifyTimer);
		}

		var self = this;
		this.notifyTimer = setTimeout(function() {
			clearTimeout(self.notifyTimer);
			self.notifyTimer = 0;

			var action = new ActionDialect();
			action.setAction(CubeConst.ActionPull);
			action.appendParam("time", Date.now());
			nucleus.talkService.talk(_M_CELLET, action);
		}, 1000);
	},

	_processPullAck: function(dialect) {
		var data = dialect.getParam("data");
		var list = data.messages;
		for (var i = 0; i < list.length; ++i) {
			var m = list[i];
			if (m.type == 'text') {
				var msg = CubeTextMessage.parse(m);
				this.delegate.didMessageReceive(msg);
			}
		}
	},

	_processHistoryAck: function(dialect) {
		var state = dialect.getParam("state");
		if (state.code == 200) {
			var msgList = [];

			var data = dialect.getParam("data");
			var begin = data.begin;
			var end = data.end;

			var list = data.messages;
			for (var i = 0; i < list.length; ++i) {
				var m = list[i];
				if (m.type == 'text') {
					msgList.push(CubeTextMessage.parse(m));
				}
			}

			if (null != this.queryHistoryCallback) {
				this.queryHistoryCallback.call(null, msgList, begin, end);
				this.queryHistoryCallback = null;
			}
		}
		else {
			// TODO
		}
	}
});
