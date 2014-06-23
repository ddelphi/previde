(function(root, $) {
"use strict";



/*
	menu UI

	the menu root.baseClasses.UI,
	to create new menu item according to the params set by user,
	to perform new list action by click the menu item,
	and also including some ui effect
*/
var menu = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")

		this.collection = {}
		this.elementMenu = this.$("#menu")
		this.elementW = this.$("#menu>.w")
		this.elementHeader = this.$("#menu .m-menu-header")
		this.element = this.$("#menu .item-container")
		this.selectorItem = "#menu .item-container .link-js"
		this.selectorClose = "#menu .item-container .link-js .menu-close"
		this.template = this.templateObject.new(this.$(".template.menu.item").html())

		this.$document = this.$(document)
		this.$window = this.$(window)
		this.closeTimeId = 0
	},
	initEvents: function() {
		this.$window.on("scroll", this.fixedMenu.bind(this))
		this.element.on("click", ".link-js", this.performEvent.bind(this, "on_itemClick"))
		this.element.on("mousedown click mouseout", ".menu-close", this.performEvent.bind(this, "on_closeButton"))

		this.event.register("params/params/change", this.update.bind(this))
		this.event.register("params/list/change", this.upadateFromList.bind(this))
	},
	performEvent: function(fn, evt) {
		var $node = this.$(evt.currentTarget),
			uid = $node.attr("data-uid")

		if (uid) {
			if (!this.collection[uid]) {
				this.initialCollection(uid)
			}
			return this[fn].call(this, evt, {
				"data": {
					"uid": uid,
					"target": $node
				}
			})
		}
	},
	initialCollection: function(uid) {
		var selector = this.selectorItem + "[data-uid=%s]".replace("%s", uid),
			selectorClose = this.selectorClose + "[data-uid=%s]".replace("%s", uid),
			listData = this.dbParams.get("list", uid)
		this.collection[uid] = {
			"selector": selector,
			"element": this.$(selector),
			"elementClose": this.$(selectorClose),
			"listCreated": listData ? true : false
		}
	},
	on_itemClick: function(evt, datas) {
		var uid = datas.data.uid
		this.createNewList(uid)
		this.focusList(uid)
	},
	fixedMenu: function(evt) {
		var offset = this.$window.scrollTop() - this.elementMenu.offset().top,
			headerState = this.elementHeader.css("display")
		if (offset > 0) {
			if (headerState === "none") {
				this.elementHeader.slideDown(200)
			}
			this.elementW.css("top", offset)
		} else {
			if (headerState === "block") {
				this.elementHeader.slideUp(200)
			}
			this.elementW.css("top", 0)
		}
	},
	// perform click event
	// and simulate the longtap event
	on_closeButton: function(evt, datas) {
		clearTimeout(this.closeTimeId)
		if (evt && evt.type === "mousedown") {
			datas.data.isTrueClose = true
			this.closeTimeId = setTimeout(this.on_closeButton.bind(this, null, datas), 800)
		}
		else if (!evt || evt.type === "click") {
			this.event.trigger("ui/listWrapper/close", datas)
		}
		return false
	},
	highlight: function(uid) {
		var listData = this.dbParams.get("list", uid),
			target = this.collection[uid].element
		
		if (listData && listData.state === true) {
			target.addClass("highlight")
		} else {
			target.removeClass("highlight")
		}
	},
	focusList: function(uid) {
		this.event.trigger("ui/listWrapper/focus", {"data": {"uid": uid}})
	},
	createNewList: function(uid) {
		var data = {}
		data[uid] = {
			"create": true,
			"state": true
		}
		this.dbParams.set("list", data)
		if (!this.collection[uid].listCreated) {
			this.collection[uid].listCreated = true
		}
	},
	appendNew: function(menuDict) {
		var html = this.template(menuDict)
		this.element.append(html)
	},
	// update from params
	update: function(datas) {
		// clear menu
		this.element.html("")
		this.$.each(datas.data, function(uid, val) {
			this.appendNew(val.menu)
			// create menu item first, then it can be reference
			if (!this.collection[uid]) {
				this.initialCollection(uid)
			}
		}.bind(this))
	},
	upadateFromList: function(datas) {
		this.$.each(datas.data, function(uid, v) {
			if (this.collection[uid]) {
				this.highlight(uid)
			}
		}.bind(this))
	}
})



root.core.addModule("menu", menu)

// end of function wrapper
})(window, jQuery)