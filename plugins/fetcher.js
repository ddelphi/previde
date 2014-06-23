(function(root, $) {
"use strict";



/*
	fetcher object

	For fetching web content.
	For solving the cross origin requests problem,
	We use the YQL query service,
	which can be access by ajax without the cross origin requests problem.

	one problem is,
	YQL query service has to follow the robots.txt rules,
	so those sites with limitation rule in robots.txt,
	can't be fetched in this way.
*/
var fetcher = $.extend({}, root.baseClasses.Plugin, {
	defaultParams: function() {
		return {
			"type": "get",
			"data": "",
			"dataType": "text"
		}
	},
	fetchPage: function(params) {
		params = this.$.extend({}, this.defaultParams(), params)
		this.$.ajax(params)
	},
	fetchXPage: function(params) {
		// check if the url is in the same domain
		if (!this.matchSelfDomain(params.url)) {
			var url = "http://query.yahooapis.com/v1/public/yql?q="
			var query = "select * from html where url=\"<url>\""
			query = query.replace("<url>", params.url)
			url = url + encodeURIComponent(query)

			params.url = url
		}
		this.fetchPage(params)
	},
	matchSelfDomain: function(url) {
		var urlDomain = url.match(/^.+?:\/\/.+?(?:\/|$)/i)
		var curSiteDomain = window.location.origin
		if (!urlDomain || urlDomain === curSiteDomain) {
			return true
		} else {
			return false
		}
	}
})



root.core.addPlugin("fetcher", fetcher)

// end of function wrapper
})(window, jQuery)