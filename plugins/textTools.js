(function(root, $) {
"use strict";


/*
	textTools object
	
	Very simple text manipulation object,
	which only has one function for the specify action
*/
var textTools = $.extend({}, root.baseClasses.Plugin, {
	defaultOptions: {
		"caseSensitive": false,
		"forceRegex": false,
		"autoTrim": true
	},
	hasIn: function(keyword, content, options) {
		var result
		options = this.$.extend({}, this.defaultOptions, options)

		if (toString.call(keyword).indexOf("Array") > -1) {
			for (var i = 0; i < keyword.length; i++) {
				result = this._hasIn(keyword[i], content, options)
				if (result) { break }
			}
		} else {
			result = this._hasIn(keyword, content, options)
		}
		return result
	},
	_hasIn: function(keyword, content, options) {
		var result
		if (keyword.trim() === "") { return }

		if (options.forceRegex) {
			var re = options.caseSensitive ? new RegExp(keyword) : new RegExp(keyword, "i")
			result = re.test(content)
		} else {
			if (!options.caseSensitive) {
				keyword = keyword.toLowerCase()
				content = content.toLowerCase()
			}
			if (options.autoTrim) {
				keyword = keyword.trim()
			}
			result = content.indexOf(keyword) > -1
		}
		return result
	}
})



root.core.addPlugin("textTools", textTools)

// end of function wrapper
})(window, jQuery)