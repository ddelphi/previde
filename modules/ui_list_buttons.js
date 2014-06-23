(function(root, $) {
"use strict";


/*
	list_buttons UI
	
	It is an UI object for wrapping the list buttons' function.
*/
var list_buttons = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.collection = {}
		this.parentNode = this.$("#list-wrapper")
		this.selectorListHeaderWrapper = ".m-list .m-list-header-wrapper>.w"
		this.selectorListHeader = ".m-list .m-list-header"
		this.selectorNextPage = ".m-list .next-page .button"
		this.selectorRefresh = ".m-list .refresh"
		this.selectorClose = ".m-list .list-close"

		this.$window = this.$(window)
		this.closeTimeSpan = 800
	},
	initEvents: function() {
		this.$window.on("scroll", this.fixedHeader.bind(this))
		this.parentNode.on("click", this.selectorListHeader, this.performEvent.bind(this, "toggleHeader"))
		this.parentNode.on("click", this.selectorNextPage, this.performEvent.bind(this, "nextPage"))
		this.parentNode.on("click", this.selectorRefresh, this.performEvent.bind(this, "refresh"))
		this.parentNode.on("mousedown click mouseout", this.selectorClose, this.performEvent.bind(this, "close"))
		this.event.register("params/list/change", this.update.bind(this))
		this.event.register("ui/list/getContentComplete", this.whenListContentComplete.bind(this))
		this.event.register("ui/list/getContentStart", this.whenGetContentStart.bind(this))
		this.event.register("ui/list/whenCreating", this.whenListCreating.bind(this))
	},
	performEvent: function(fnName, evt) {
		var $target = this.$(evt.currentTarget),
			uid = $target.attr("data-uid")

		if (uid) {
			if (!this.collection[uid]) {
				this.initialCollection(uid)
			}
			return this[fnName].call(this, {"data": {"uid": uid}}, evt)
		}
	},
	initialCollection: function(uid) {
		this.collection[uid] = {
			"listHeaderWrapperElement": this.$(this.selectorListHeaderWrapper + "[data-uid=$uid]".replace("$uid", uid)),
			"listHeaderElement": this.$(this.selectorListHeader + "[data-uid=$uid]".replace("$uid", uid)),
			"nextPageElement": this.$(this.selectorNextPage + "[data-uid=$uid]".replace("$uid", uid)),
			"refreshElement": this.$(this.selectorRefresh + "[data-uid=$uid]".replace("$uid", uid)),
			"closeElement": this.$(this.selectorClose + "[data-uid=$uid]".replace("$uid", uid)),
			"nextPageState": true,
			"refreshState": true
		}
	},

	/* header */

	toggleHeader: function(datas) {
		this.event.trigger("ui/list/functionPanel/toggle", datas)
	},
	fixedHeader: function(evt) {
		var list,
			listHeader,
			scrollTop
		for (var uid in this.collection) {
			if (!this.collection.hasOwnProperty(uid)) continue
			list = this.collection[uid].listHeaderWrapperElement
			listHeader = this.collection[uid].listHeaderElement

			if (list.length === 0) continue
			
			scrollTop = this.$window.scrollTop()
			if (scrollTop > 0) {
				listHeader.addClass("clone")
			} else {
				listHeader.removeClass("clone")
			}

			list.css("top", scrollTop)
			this.toggleHeader({"data": {
				"uid": uid,
				"state": false
			}})
		}
	},

	/* header end */

	nextPage: function(datas) {
		var uid = datas.data.uid
		if (this.collection[uid].nextPageState) {
			this.toggleNextPageState(uid, false)
			this.event.trigger("ui/list/nextPage", datas)
		}
	},
	toggleNextPageState: function(uid, state) {
		this.collection[uid].nextPageState = state
		if (state) {
			this.collection[uid].nextPageElement.removeClass("disable")
		} else {
			this.collection[uid].nextPageElement.addClass("disable")
		}
	},
	refresh: function(datas) {
		var uid = datas.data.uid
		if (this.collection[uid].refreshState) {
			this.toggleRefreshState(uid, false)
			this.event.trigger("ui/list/refresh", datas)
		}
		return false
	},
	toggleRefreshState: function(uid, state) {
		this.collection[uid].refreshState = state
		if (state) {
			this.collection[uid].refreshElement.removeClass("disable")
		} else {
			this.collection[uid].refreshElement.addClass("disable")
		}
	},
	// perform the click event
	// and simulate the longtap event
	close: function(datas, evt) {
		clearTimeout(this.closeTimeId)
		if (evt && evt.type === "mousedown") {
			datas.data.isTrueClose = true
			this.closeTimeId = setTimeout(this.close.bind(this, datas, null), 800)
		}
		else if (!evt || evt.type === "click") {
			this.event.trigger("ui/listWrapper/close", datas)
		}
		return false
	},
	whenGetContentStart: function(datas) {
		this.toggleNextPageState(datas.data.uid, false)
		this.toggleRefreshState(datas.data.uid, false)
	},
	whenListContentComplete: function(datas) {
		this.toggleNextPageState(datas.data.uid, true)
		this.toggleRefreshState(datas.data.uid, true)
	},
	whenListCreating: function(datas) {
		var uid = datas.data.uid
		this.initialCollection(uid)
	},
	update: function(datas) {
		var uids = datas.data
		for (var k in uids) {
			if (!uids.hasOwnProperty(k)) continue
		}
	}
})




root.core.addModule("list_buttons", list_buttons)

// end of function wrapper
})(window, jQuery)