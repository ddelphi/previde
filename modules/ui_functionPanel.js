(function(root, $) {
"use strict";


/*
	functionPanel UI

	Just doing one thing, that is to perform the ui effects.
*/
var functionPanel = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")

		this.collection = {}
		this.parentNode = this.$("#list-wrapper")
		this.selector = ".m-function"
		this.template = ""
	},
	initEvents: function() {
		this.event.register("params/list/change", this.update.bind(this))
		this.event.register("ui/list/functionPanel/toggle", this.toggle.bind(this))
		this.event.register("ui/listWrapper/created", this.whenListCreating.bind(this))
	},
	initialCollection: function(uid) {
		var listData = this.dbParams.get("list", uid),
			element = $(this.selector + "[data-uid=%s]".replace("%s", uid))
		this.collection[uid] = {
			"functionPanelState": listData.functionPanelState || true,
			"element": element
		}
	},
	toggle: function(datas) {
		var uid = datas.data.uid
		if (!this.collection[uid]) {
			this.initialCollection(uid)
		}

		var state = datas.data.state,
			curState = this.collection[uid].functionPanelState

		if (typeof state !== "boolean"
			|| state !== curState) {
			state = curState ? false : true
			var data = {}
			data[uid] = {
				"functionPanelState": state
			}
			this.dbParams.set("list", data)
		}
	},
	toggleAction: function(uid) {
		var elem = this.collection[uid].element,
			state = this.collection[uid].functionPanelState
		if (state) {
			elem.slideDown(300)
		} else {
			elem.slideUp(300)
		}
	},
	whenListCreating: function(datas) {
		var uid = datas.data.uid
		this.initialCollection(uid)
		datas.data.state = false
		this.toggle(datas)
	},
	update: function(datas) {
		var uids = datas.data
		for (var k in uids) {
			if (!uids.hasOwnProperty(k)) continue
			if (!this.collection[k]) {
				this.initialCollection(k)
			}
			if (typeof uids[k].functionPanelState === "undefined") {
				continue
			}
			// update collection
			this.collection[k].functionPanelState = uids[k].functionPanelState
			// do action
			this.toggleAction(k)
		}
	}
})



root.core.addModule("functionPanel", functionPanel)

// end of function wrapper
})(window, jQuery)