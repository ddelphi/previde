(function(root, $) {
"use strict";



/*
	listWrapper UI

	The list wrapper root.baseClasses.UI, is the place for holding mulitpule list ui.
	The ability of listWrapper object is
	to create new list,
	and to manager the display of each list ui.
*/
var listWrapper = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")

		this.collection = {}
		this.selector = "#list-wrapper .m-list-wrapper"
		this.parentElement = this.$("#list-wrapper")
		this.template = this.templateObject.new(this.$(".template.list-wrapper").html())

		this.$body = this.$(document.body)
		this.$win = this.$(window)
		this.$doc = this.$(document)
	},
	initEvents: function() {
		this.event.register("ui/listWrapper/close", this.close.bind(this))
		this.event.register("ui/listWrapper/focus", this.focus.bind(this))
		this.event.register("params/list/change", this.update.bind(this))
		// trigger:
		//   ui/listWrapper/created
		//   ui/list/show
	},
	performEvent: function(fn, evt) {
		var $node = this.$(evt.currentTarget),
			uid = $node.attr("data-uid")

		if (uid) {
			if (!this.collection[uid]) {
				this.initialCollection(uid)
			}
			this[fn].call(this, evt, {
				"data": {
					"uid": uid,
					"target": $node
				}
			})
		}
	},
	initialCollection: function(uid) {
		var params = this.dbParams.get("params", uid),
			selector = this.selector + "[data-uid=%uid]".replace("%uid", uid)
		this.collection[uid] = {
			"created": false,
			"selector": selector,
			"state": false,
			"listTitle": params.menu.title
		}
	},
	close: function(datas) {
		var uid = datas.data.uid
		var data = {}
		data[uid] = { "state": false }
		this.dbParams.set("list", data)

		if (datas.data.isTrueClose) {
			var elem = this.$(this.collection[uid].selector),
				title = this.collection[uid].listTitle
			elem.remove()
			this.initialCollection(uid)
			this.logger.log("list: \"%s\" has been removed.".replace("%s", title))
		}
	},
	// new list node
	new: function(uid, data) {
		this.initialCollection(uid)
		var paramsData = this.dbParams.get("params", uid)
		var dataModel = {
			"uid": uid,
			"title": paramsData.menu.title
		}
		var content = this.template(dataModel)
		this.parentElement.append(content)
		var datas = {"data": {"uid": uid}}
		this.event.trigger("ui/listWrapper/created", datas)
		
	},
	focus: function(datas) {
		var uid = datas.data.uid,
			selector = this.collection[uid].selector,
			$elem = this.$(selector)
		this.$body.animate({
			"scrollLeft": $elem.offset().left
		})
		this.highlight($elem)
	},
	// todo
	highlight: function(elem) {
		// noop
	},
	toggle: function(uid, v) {
		var elem = this.$(this.collection[uid].selector),
			state = this.collection[uid].state
		if (state) {
			elem.fadeIn(400)
			this.updateDimention()
			setTimeout(this.focus.bind(this, {"data": {"uid": uid}}), 0)
		} else {
			elem.fadeOut(400, this.updateDimention.bind(this))
		}
	},
	updateDimention: function() {
		var totalW = 50,
			maxH = 0,
			winHeight = this.$win.height(),
			curScrollHeight = this.$win.scrollTop() + winHeight,
			height,
			$elem
		this.$(this.selector).each(function(i, elem) {
			$elem = $(elem)
			if ($elem.css("display") === "none") return;
			totalW += $elem.width()
			height = $elem.height()
			maxH = height > maxH ? height : maxH
		})
		this.parentElement.width(totalW)

		if (maxH < curScrollHeight) {
			this.$win.scrollTop(maxH - winHeight)
		}
	},
	update: function(datas) {
		this.$.each(datas.data, function(uid, v) {
			if (datas.type === "remove") {
				this.remove(uid)
				return;
			}
			// check our dataModel
			if (!this.collection[uid]) {
				this.initialCollection(uid)
			}
			if (this.collection[uid].state === v.state
				|| typeof v.state === "undefined") {
				return;
			}
			// create new list
			if (v.create && !(this.collection[uid] ? this.collection[uid].created : false)) {
				this.new(uid, v)
				this.collection[uid].created = true
			}
			// update collection
			this.collection[uid].state = v.state
			// do action
			this.toggle(uid)
		}.bind(this))
	}
})



root.core.addModule("listWrapper", listWrapper)

// end of function wrapper
})(window, jQuery)