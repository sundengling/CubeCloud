/*
 * ConferenceUA.js
 * Cube Engine
 * 
 * Created by Ambrose Xu on 15/8/3.
 * Copyright (c) 2015 Cube Team. All rights reserved.
 */

var CubeConferenceUA = Class({
	callbackMap: null,

	ctor: function() {
		this.callbackMap = new HashMap();
	},

	listConferences: function(callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "list",
				"task": task
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	getConference: function(id, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "get",
				"task": task,
				"id": id.toString()
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	changeFloor: function(conf, caller, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "floor",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString()
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	setMemberDeaf: function(conf, caller, deaf, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "deaf",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString(),
				"deaf": deaf
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	setMemberMute: function(conf, caller, mute, callback) {
		var task = new String(Date.now());
		this.callbackMap.put(task, callback);

		var request = {
				"cmd": "mute",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString(),
				"mute": mute
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		if (!nucleus.talkService.talk(_S_CELLET, dialect)) {
			this.callbackMap.remove(task);
			return false;
		}

		return true;
	},

	notifyJoin: function(conf, caller) {
		var task = new String(Date.now());

		var request = {
				"cmd": "join",
				"task": task,
				"conf": conf.toString(),
				"caller": caller.toString()
			};

		var dialect = new ActionDialect();
		dialect.setAction(CubeConst.ActionConference);
		dialect.appendParam("request", request);
		return nucleus.talkService.talk(_S_CELLET, dialect);
	},

	processDialect: function(dialect) {
		var state = dialect.getParam("state");
		if (state.code == 200) {
			var response = dialect.getParam("response");
			var task = response.task;
			if (response.cmd == "floor"
				|| response.cmd == "deaf"
				|| response.cmd == "mute"
				|| response.cmd == "get") {
				var cb = this.callbackMap.get(task);
				if (null != cb) {
					cb.call(null, response.conference);
					this.callbackMap.remove(task);
				}
			}
			else if (response.cmd == "list") {
				var cb = this.callbackMap.get(task);
				if (null != cb) {
					cb.call(null, response);
					this.callbackMap.remove(task);
				}
			}
		}
		else {
			// 状态异常
			Logger.w("CubeConferenceUA", "Ack state: " + state.code);
			var task = dialect.getParam("task");
			var cb = this.callbackMap.remove(task);
			if (null != cb) {
				cb.call(null);
			}
		}
	}
});
