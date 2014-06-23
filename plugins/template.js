(function(root, $) {
"use strict";



/*
	template object
	
	A simply template ojbect, which can only transform the data directly from a dict.

	It is using ${} for variable wrapper,
	and, can mute the non exist property error.
*/
var template = $.extend({}, {
	setting: {
		"pattern": /\$\{([\w\d_]+?(.[\w\d\_]+)*)\}/ig
	},

	setupSetting: function(setting) {
		this.$.extend(this.setting, setting)
	},
	new: function(content, dataModel) {
		var pattern = this.setting.pattern
		
		// construct an array which seperate the string and params
		var codes
		codes = content.replace(pattern, function(match, p1) {
				return "%22,get($params,%22" + p1 + "%22),%22"
			})
		codes = "return [%22" + codes + "%22].join('')"
		codes = codes
			.replace(/"/g, "\\\"")
			.replace(/%22/g, "\"")
			.replace(/\t/g, "\\t")
			.replace(/\n/g, "\\n")

		var fn = new Function("get, $params", codes)
		var get = this._getProperty.bind(this)
		
		if (toString.call(dataModel).indexOf("Object") > 7) {
			return fn(get, dataModel)
		} else {
			return fn.bind(this, get)
		}
	},
	_getProperty: function(dict, nameString) {
		var nameArray = nameString.split(".")
		return this._iterDict(dict, nameArray)
	},
	// method for getting key's value of the dict
	_iterDict: function(dict, nameArray) {
		if (toString.call(dict).indexOf("Object") < 8) { return "" }
		var theDict = dict,
			length = nameArray.length,
			name
		for (var i = 0; i < length; i++) {
			name = nameArray[i]
			if (theDict.hasOwnProperty(name)) {
				if (toString.call(theDict[name]).indexOf("Object") > 7) {
					theDict = theDict[name]
				} else {
					if (i === length - 1) {
						return theDict[name]
					} else {
						// handle error
						// or return previous value
						// console.warn("template error in getting value of key %s.".replace("%s", nameArray.join("")))
						return ""
					}
				}
			} else {
				// handle error
				// console.warn("template error in getting value of key %s.".replace("%s", nameArray.join("")))
				return ""
			}
		}
	}
})



root.core.addPlugin("template", template)

// end of function wrapper
})(window, jQuery)