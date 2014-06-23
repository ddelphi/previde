(function(root, $) {
"use strict";



/*
	initial module
	
	For fetching the params data from either the path or local storage
*/
var initial = $.extend({}, root.baseClasses.Module, {
	initParams: function() {
		this.fetcher = this.core.getPlugin("fetcher")
		this.db = this.core.getPlugin("storage")
		this.localStorage = this.core.getPlugin("localStorage")
		this.dbParams = this.core.getPlugin("dbParams")
		this.coreOptions = this.core.options

		this.getParams()
	},
	/*
		setup params from params.json file,
		or from localStroage
	*/
	getParams: function() {
		this.getDefaultParams(function(data, type, jqXHR) {
			var lastModify = jqXHR.getResponseHeader("Last-Modified"),
				llm = this.localStorage.get("lastModify")

			if (lastModify === llm) {
				var result = this.getLocalParams()
				if (!result) {
					throw new Error("error in getting local params.")
				}
			} else {
				this.setupParams(data)
				this.localStorage.set("lastModify", lastModify)
			}
		}.bind(this))
	},
	getLocalParams: function() {
		var params = this.localStorage.get(this.coreOptions.dbKey)
		if (params) {
			this.setupParams(params)
			return true
		}
		return false
	},
	getDefaultParams: function(fn) {
		this.fetcher.fetchPage({
			"url": this.coreOptions.default.paramsPath,
			"success": fn
		})
	},
	setupParams: function(data) {
		if (!data) {
			this.logger.error("error in seting up the params.")
		}
		var oldDict = this.$.parseJSON(this.localStorage.get("params")),
			theDict = this.$.parseJSON(data)

		console.log("setupParams with:", theDict)
		// check if we cover the old settings
		if (!theDict.option || theDict.option.new !== "true") {
			theDict = this.$.extend(true, oldDict, theDict)
		}
		this.dbParams.set(theDict)
	}
})


root.core.addModule("initial", initial)

// end of function wrapper
})(window, jQuery)