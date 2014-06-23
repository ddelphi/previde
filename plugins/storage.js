(function(root, $) {
"use strict";

/*
	storage object
	
	For perserving the datas in memory,
	and synchronize them with localStorage of browser
*/
var storage = $.extend({}, root.baseClasses.Plugin, {
	initParams: function() {
		this.localStorage = this.core.getPlugin("localStorage")

		this.initCollection()
	},
	initCollection: function() {
		this.collection = {}
	},
	get: function(key) {
		if (!this.collection.hasOwnProperty(key)) return null
		return this.collection[key]
	},
	set: function(key, val) {
		if (toString.call(val).indexOf("Object") < 8) {
			throw new Error("storage's set value must be the type of dict.")
		}

		var eventType = this.collection.hasOwnProperty(key) ? "change" : "create"
		this.triggerEvent(eventType, {
			"type": eventType,
			"data": key
		})
		if (typeof this.collection[key] === "undefined") {
			this.collection[key] = {}
		}
		this._extend(this.collection[key], val)
	},
	remove: function(key) {
		if (!this.collection.hasOwnProperty(key)) return false
		delete this.collection[key]
		this.localStorage.remove(key)
		this.triggerEvent("remove", {
			"type": "remove",
			"data": key
		})
		return true
	},
	// save to localStorage
	save: function() {
		for (var k in this.collection) {
			if (!this.collection.hasOwnProperty(k)) continue
			this.localStorage.set(k, this.collection[k])
		}
	},
	clear: function() {
		this.initCollection()
	},

	/* private methods */

	triggerEvent: function(evt, datas) {
		this.event.trigger("db/" + evt, datas)
	},
	/*
		extend method
		deep extend
	*/
	_extend: function extend(target, source) {
		for (var k in source) {
			if (!source.hasOwnProperty(k)) continue
			
			if (toString.call(target[k]).indexOf("Object") > 7) {
				if (toString.call(source[k]).indexOf("Object") > 7) {
					extend(target[k], source[k])
				} else {
					target[k] = source[k]
				}
			} else {
				target[k] = source[k]
			}
		}
		return target
	}
})



root.core.addPlugin("storage", storage)

// end of function wrapper
})(window, jQuery)