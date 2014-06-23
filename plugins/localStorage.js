(function(root, $) {
"use strict";


/*
	localStorage object

	This is a wrapper object for localStorage in browser
*/
var localStorage = $.extend({}, root.baseClasses.Plugin, {
	initParams: function() {
		this.storage = root.localStorage
	},
	get: function(key) {
		return this.storage.getItem(key)
	},
	set: function(key, data) {
		// save the plain data with key
		if (typeof data !== "string") {
			if (toString.call(data).indexOf("Object") > 7 && root.JSON) {
				data = root.JSON.stringify(data)
			} else {
				return false
			}
		}
		this.storage.setItem(key, data)
		return true
	},
	remove: function(key) {
		this.storage.removeItem(key)
	}
})


root.core.addPlugin("localStorage", localStorage)

// end of function wrapper
})(window, jQuery)