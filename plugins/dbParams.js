(function(root, $) {
"use strict";


/*
	dbParams object

	It is more or less a dataModel for preserving params and list datas
*/
var dbParams = $.extend({}, root.baseClasses.Plugin, {
	initParams: function() {
		this.db = this.core.getPlugin("storage")
		this.parentKey = this.core.options.dbKey
		this.key = {
			"params": "params",
			"list": "list"
		}
	},
	initEvents: function() {
		// trigger:
		//   params/params/create
		//   params/params/update
		//   params/params/change
		//   params/list/create
		//   params/list/update
		//   params/list/change
	},
	/*
		can be:
			get(key, uid)
			get(key)
	*/
	get: function(key, uid) {
		if (this.key.hasOwnProperty(key)) {
			var datas = this._get(key),
				uidData = datas[uid] || null
			return (typeof uid === "undefined" ? datas : uidData)
		} else {
			return this._get()
		}
	},
	/*
		can be:
			set(key, uidDict)
			set(paramsDict or listDict)
	*/
	set: function(keyOrDict, dict_) {
		if (typeof keyOrDict === "string" && this.key.hasOwnProperty(keyOrDict)) {
			this._set(keyOrDict, dict_)
		}
		else if (toString.call(keyOrDict).indexOf("Object") > 7) {
			this._set(keyOrDict)
		}
	},
	remove: function(key) {
		if (this.key.hasOwnProperty(key)) {
			return this._remove(key)
		} else {
			for (var k in this.key) {
				if (!this.key.hasOwnProperty(k)) continue;
				return this._remove(this.key[k])
			}
		}
	},

	/* private methods */

	_get: function(key) {
		var p = this.db.get(this.parentKey)
		return typeof key === "string" ? p[key] : p
	},
	_set: function(key, dictOfUids) {
		var eventState = "create"
		
		var parentData = this._get() || {}
		var data = {}

		if (typeof key === "string") {
			for (var k in dictOfUids) {
				if (!dictOfUids.hasOwnProperty(k)) continue
				if (typeof parentData[key][k] !== "undefined") {
					eventState = "update"
					break
				}
			}
			data[key] = dictOfUids
		}
		else if (toString.call(key).indexOf("Object") > 7){
			data = key
		}

		this.db.set(this.parentKey, data)

		// trigger "params" or "list"
		// with the specified data, and the whole settings datas
		for (var m in data) {
			if (!data.hasOwnProperty(m)) continue
			this._triggerWrap(m, eventState, {
				"data": data[m],
				"extra": parentData
			})
		}
	},
	_remove: function(key, uid) {
		var p = this.db.get(this.parentKey)
		if (typeof uid === "string") {
			delete p[key][uid]
		} else {
			delete p[key]
		}
		this.db.refresh()
		this._triggerWrap(key, "remove", {
			"data": uid || key
		})
	},
	_formEvent: function(/*args*/) {
		return Array.prototype.join.call(arguments, "/")
	},
	_trigger: function(eventName, datas) {
		var event = "params/" + eventName
		this.event.trigger(event, datas)
	},
	_triggerWrap: function(parent, state, datas) {
		parent = typeof parent === "string" ? parent : "all"
		var eventName = this._formEvent(parent, state)
		var eventChangeName = this._formEvent(parent, "change")

		this._trigger(eventName, datas)
		this._trigger(eventChangeName, datas)
	}

})




root.core.addPlugin("dbParams", dbParams)

// end of function wrapper
})(window, jQuery)