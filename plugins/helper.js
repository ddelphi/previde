(function(root, $) {
"use strict";



/*
	helper object
	
	Providing some helper function for dealing the url
*/
var helper = $.extend({}, {
	/*
		the type of param dict:
			content
			nextPattern:: is expression after return keywrod, can use variables ($, url, content)
			nextUrl
	*/
	updateNextUrl: function(dict) {
		var content = dict.content ? dict.content : "",
			nextPattern = dict.nextPattern || "null",
			nextUrl = dict.nextUrl

		var next = new Function("$, url, content", "return (%np%);".replace("%np%", nextPattern))

		var newNextUrl = next(this.$, nextUrl, content)
		console.log("the new next url will be:", newNextUrl)
		return newNextUrl ? newNextUrl : dict.nextUrl
	},
	absoluteUrlJquery: function($obj, baseUrl) {
		var attrMap = {
			"href": "[href]",
			"src": "[src]"
		}
		var $target,
			theUrl,
			finUrl,
			attrSelector
		for (var attr in attrMap) {
			attrSelector = attrMap[attr]
			$obj.find(attrSelector).each(function(i, target) {
				$target = $(target)
				theUrl = $target.attr(attr)

				if (theUrl.indexOf("http") !== 0) {
					finUrl = this.absoluteUrl_formatUrl(baseUrl, theUrl)
					$target.attr(attr, finUrl)
				}
			}.bind(this))
		}
	},
	absoluteUrl_formatUrl: function(baseUrl, tailUrl) {
		if (baseUrl.indexOf("http") !== 0) {
			baseUrl = "http://" + baseUrl
		}
		if (baseUrl[baseUrl.length - 1] !== "/") {
			baseUrl += "/"
		}
		if (typeof tailUrl === "undefined") return;
		
		var finUrl = baseUrl + tailUrl
		return finUrl
	}

})



root.core.addPlugin("helper", helper)

// end of function wrapper
})(window, jQuery)