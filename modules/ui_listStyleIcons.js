(function(root, $) {
"use strict";



/*
	listStyleIcons UI
	
	To change the css style class of the list ui.
*/
var listStyleIcons = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")

		this.collection = {}
		this.parentNode = this.$("#list-wrapper")
		this.selector = ".m-function .list-style .item .sprites"
		this.template = ""
		this.defaultListStyle = "list-style-normal"
	},
	initEvents: function() {
		this.parentNode.on("click", this.selector, this.performEvent.bind(this, "on_click"))
		this.event.register("ui/list/whenCreating", this.whenListCreating.bind(this))
		this.event.register("params/list/change", this.update.bind(this))
	},
	performEvent: function(fnStr, evt) {
		var $node = this.$(evt.currentTarget),
			uid = $node.attr("data-uid")

		if (uid) {
			if (!this.collection[uid]) {
				this.initialCollection(uid)
			}
			this[fnStr].call(this, evt, {
				"uid": uid,
				"listStyle": $node.attr("data-listStyle"),
				"$target": $node
			})
		}
	},
	initialCollection: function(uid) {
		var listParams = this.dbParams.get("list", uid)
		this.collection[uid] = {
			"listStyle": listParams.listStyle || this.defaultListStyle,
			"lastListStyle": listParams.lastListStyle || this.defaultListStyle
		}
		var listData = {}
		listData[uid] = this.$.extend({}, this.collection[uid])
		this.dbParams.set("list", listData)
	},
	on_click: function(evt, data) {
		var curUidData = this.collection[data.uid]

		var listData = {}
		listData[data.uid] = {
			"lastListStyle": curUidData.listStyle,
			"listStyle": data.listStyle
		}
		this.dbParams.set("list", listData)
	},
	modList: function(datas) {
		var uidList = this.collection[datas.data.uid],
			$listParent = datas.data.parent
		$listParent.removeClass(uidList.lastListStyle)
		$listParent.addClass(uidList.listStyle)
	},
	whenListCreating: function(datas) {
		var uid = datas.data.uid
		this.initialCollection(uid)
		this.modList(datas)
	},
	update: function(datas) {
		var uids = datas.data
		for (var k in uids) {
			if (!uids.hasOwnProperty(k)) continue
			// check our own datas
			if (!this.collection[k]
				|| this.collection[k].listStyle === uids[k].listStyle
				|| typeof uids[k].listStyle === "undefined") {
				continue
			}
			// update collecton
			this.collection[k].listStyle = uids[k].listStyle
			this.collection[k].lastListStyle = uids[k].lastListStyle
			// do actions
			this.event.trigger("ui/list/mod", {
				"data": {
					"uid": k,
					"callback": this.modList.bind(this)
				}
			})
		}
	}
})





root.core.addModule("listStyleIcons", listStyleIcons)

// end of function wrapper
})(window, jQuery)