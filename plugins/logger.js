(function(root, $) {
"use strict";


/*
	logger object
	
	For logging info, and dispatching info
*/
var logger = $.extend({}, root.baseClasses.Plugin, {
	settings: {
		"spliter": " ",
		"trigger": {
			"log": true,
			"warn": true,
			"error": true
		}
	},
	initParams: function() {
		this.messages = {
			"log": [],
			"warn": [],
			"error": []
		}
	},
	initEvents: function() {
		// trigger:
		//   logger/log
		//   logger/warn
		//   logger/error
		//   logger/all
	},
	setupSetting: function(newSetting) {
		this.$.extend(true, this.settings, newSetting)
	},
	bindPrefix: function(str) {
		this.setupSetting({
			"prefix": str
		})
		return this.$.exntend(true, {}, this)
	},
	log: function(/* args */) {
		this._log("log", arguments)
	},
	warn: function(/* args */) {
		this._log("warn", arguments)
	},
	error: function(/* args */) {
		this._log("error", arguments)
	},

	/* private methods */

	_log: function(type, args) {
		var msgs = Array.prototype.slice.call(args)

		var theMessage = {
			"time": (new Date()).toISOString(),
			"type": type,
			"message": msgs.join(this.settings.spliter)
		}
		this.messages[type].push(theMessage)
		this.trigger(type, theMessage)
	},
	get: function(type, index) {
		if (!this.messages[type]) return null;

		var length = this.messages[type].length
		if (typeof index === "number") {
			if (length < (index >= 0 ? index : -index)) return null;
			var idx = index >= 0 ? index : length + index
			return this.messages[type][idx]
		} else if (typeof index === "undefined") {
			return this.messages[type]
		}
	},
	trigger: function(eventName, datas) {
		if (!this.messages[eventName]) return;
		if (!this.settings.trigger[eventName]) return false;
		this.event.trigger("logger/" + eventName, datas)
		this.event.trigger("logger/all", datas)
	},
	list: function(type, spliter) {
		if (!this.messages.hasOwnProperty(type)) return null;
		spliter = typeof spliter === "string" ? spliter : this.spliter
		
		var res = []
		for (var logObj in this.messages[type]) {
			if (!this.messages[type].hasOwnProperty(logObj)) continue
			res.push(this.messages[type][logObj].message)
		}
		return res.join("\n")
	}
})



root.core.addPlugin("logger", logger)

// end of function wrapper
})(window, jQuery)