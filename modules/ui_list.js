(function(root, $) {
"use strict";


/*
	list UI

	list UI is responsible for transforming the content from web page to an object of dict type, 
	and then convert the formated to web page source by template object.
	Finally append the result to the page.
	It also manager some ui effect.
*/
var list = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")
		this.helper = this.core.getPlugin("helper")
		this.fetcher = this.core.getPlugin("fetcher")
		this.contentMapper = this.core.getPlugin("contentMapper")

		this.collection = {}
		this.parentSelector = "#list-wrapper .m-list"
		this.selector = "#list-wrapper .m-list .item-container"
		this.template = this.templateObject.new(this.$(".template.list.item").html())
		this.templatePage = this.templateObject.new(this.$(".template.list.page").html())
	},
	initEvents: function() {
		this.event.register("ui/list/append", this.performEvent.bind(this, "append"))
		this.event.register("ui/list/create", this.performEvent.bind(this, "create"))
		this.event.register("ui/listWrapper/created", this.performEvent.bind(this, "create"))
		this.event.register("ui/list/mod", this.performEvent.bind(this, "mod"))
		this.event.register("ui/list/nextPage", this.performEvent.bind(this, "getNextPage"))
		this.event.register("ui/list/refresh", this.performEvent.bind(this, "refresh"))
		this.event.register("ui/list/close", this.performEvent.bind(this, "close"))
		this.event.register("ui/list/getContentSuccess", this.whenGetContentSuccess.bind(this))
		this.event.register("params/list/change", this.update.bind(this))
		// trigger event: 
		//   ui/list/whenAppending
		//   ui/list/whenAppendingDone
		//   ui/list/whenCreating
		//   ui/list/getContentStart
		//   ui/list/getContentSuccess
		//   ui/list/getContentComplete
		//   ui/list/getContentEmpty
	},
	performEvent: function(fnName, datas) {
		var uid = datas.data.uid

		if (uid && this.isElementExist(uid)) {
			if (!this.collection[uid]) {
				this.initialCollection(uid)
			}
			this[fnName].call(this, datas)
		} else {
			this.logger.error("uid or element not exist.")
		}
	},
	initialCollection: function(uid) {
		var uidListData = this.dbParams.get("list", uid)
		var uidParamsData = this.dbParams.get("params", uid)
		var selector = this.selector + "[data-uid=%uid]".replace("%uid", uid)
		var parentSelector = this.parentSelector + "[data-uid=%uid]".replace("%uid", uid)

		if (uidListData) {
			this.collection[uid] = {
				"listParams": $.extend({}, uidListData),
				"params": $.extend({}, uidParamsData),
				"element": this.$(selector),
				"parent": this.$(parentSelector)
			}
			this.collection[uid].listParams.fetcher = this.$.extend({}, uidParamsData.fetcher)
		} else {
			console.warn("list object: list uid not exist.")
			return
		}
	},
	isElementExist: function(uid) {
		var element = this.$(this.selector + "[data-uid=%uid]".replace("%uid", uid))
		return element.length > 0
	},
	// create a new list
	create: function(datas) {
		var uid = datas.data.uid
		this.initialCollection(uid)

		var elem = this.collection[uid].element,
			fetcher = this.collection[uid].listParams.fetcher
		fetcher.nextUrl = fetcher.url

		this.event.trigger("ui/list/whenCreating", {
			"data": {
				"uid": uid,
				"parent": this.collection[uid].parent
			}
		})
		elem.html("")
		this.getNextPage(datas)
	},
	append: function(datas) {
		var uid = datas.data.uid,
			html = datas.data.content

		var baseUrl = this.collection[uid].params.fetcher.baseUrl || null
		var $items = this.$(this.templatePage()).append(html)
		
		if (baseUrl) {
			this.helper.absoluteUrlJquery($items, baseUrl)
		}
		var apDatas = {
			"data": {
				"uid": uid,
				"list": $items,
				"parent": this.collection[uid].parent
			}
		}
		this.event.trigger("ui/list/whenAppending", apDatas)
		$items.hide()
		this.collection[uid].element.append($items)
		$items.fadeIn(1200)
		this.event.trigger("ui/list/whenAppendingDone", apDatas)
	},
	mod: function(datas) {
		var uid = datas.data.uid
		if (!this.collection[uid]) {
			throw new Error("list with uid has not created.")
		}
		var callback = datas.data.callback,
			element = this.collection[uid].element,
			parent = this.collection[uid].parent

		callback({
			"data": {
				"uid": uid,
				"list": element,
				"parent": parent
			}
		})
	},
	whenGetContentSuccess: function(datas) {
		this.updateNextPage(datas.data.uid, datas.data.content)
		this.append(datas)
		this.logger.log("list getting page success.")
	},
	getContent: function(uid) {
		var params = this.collection[uid].params
		var listParams = this.collection[uid].listParams

		var success = function(data, event, jqXHR) {
			// no result from yahooapis.com
			if (data.indexOf('xmlns:yahoo="http://www.yahooapis.com') > -1
				&& data.indexOf("<body>") === -1) {
				this.logger.warn("no data from remote page.")
				this.event.trigger("ui/list/getContentEmpty", null)
				return
			}
			try {
			// mapped list items's data to dict
			var datasDict = this.contentMapper.create(data, params.model)
			} catch(e) {
				console.error("custom error in getting content:", e)
				this.logger.warn("error when mapping the content to dict.")
				return
			}

			var itemDatas = datasDict[0].item["[]"],
				tempList = []

			$.each(itemDatas, function(i, v) {
				tempList.push(this.template(v))
			}.bind(this))
			var finHtml = tempList.join("\n")
			this.event.trigger("ui/list/getContentSuccess", {
				"data": {
					"uid": uid,
					"content": finHtml
				}
			})
		}.bind(this)

		var complete = function(jqXHR, status) {
			this.event.trigger("ui/list/getContentComplete", {
				"data": {
					"uid": uid,
					"status": status
				}
			})
			if (status === "success" || status === "notmodify") {
				// this.logger.log("list getting page complete.")
			} else {
				this.logger.warn("list getting page wrong, status: ", status)
				this.event.trigger("ui/list/getContentFail", { "data": { "status": status }})
			}
		}.bind(this)

		this.fetcher.fetchXPage({
			"url": listParams.fetcher.nextUrl,
			"success": success,
			"complete": complete
		})
	},
	updateNextPage: function(uid, content) {
		var listParams = this.collection[uid].listParams,
			params = this.collection[uid].params
		if (!listParams.fetcher) {
			listParams.fetcher = this.$extend({}, params.fetcher)
		}
		var fetcher = listParams.fetcher
		var newNextUrl = this.helper.updateNextUrl({
			"content": content,
			"nextPattern": fetcher.nextPattern,
			"nextUrl": fetcher.nextUrl || fetcher.url
		})
		fetcher.nextUrl = newNextUrl
		return newNextUrl
	},
	getNextPage: function(datas) {
		this.event.trigger("ui/list/getContentStart", datas)
		this.getContent(datas.data.uid)
		this.logger.log("getting page now...")
	},
	refresh: function(datas) {
		this.create(datas)
	},
	close: function(datas) {
		var uid = datas.data.uid,
			data = {}
		data[uid] = { "state": false }
		this.dbParams.set("list", data)
	},
	update: function(datas) {
		this.$.each(datas.data, function(uid, v) {
			// update self datas
			if (this.collection[uid]) {
				this.$.extend(true, this.collection[uid].listParams, v)
			}
		}.bind(this))
	}
})



root.core.addModule("list", list)

// end of function wrapper
})(window, jQuery)