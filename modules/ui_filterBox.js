(function(root, $) {
"use strict";



/*
	fiterBox UI

	An editor for fitering the list item with specified keywords.
*/
var filterBox = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")
		this.textTools = this.core.getPlugin("textTools")

		this.collection = {}
		this.parentNode = this.$("#list-wrapper")
		this.filterBox = ".m-function .filter-box"
		this.selector = ".m-function .filter-box .filter-label"
		this.editor = ".m-function .filter-box .filter-editor"
		this.template = ""

		this.defaultFilterText = "Filter"
	},
	initEvents: function() {
		this.parentNode.on("dblclick", this.selector, this.performEvent.bind(this, "on_edit"))
		this.parentNode.on("keyup", this.editor, this.performEvent.bind(this, "on_editDone"))
		this.event.register("ui/list/whenAppending", this.whenListAppending.bind(this))
		this.event.register("ui/listWrapper/created", this.whenListCreating.bind(this))
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
				"$target": $node
			})
		}
	},
	initialCollection: function(uid) {
		var uidListData = this.dbParams.get("list", uid)
		this.collection[uid] = {
			"filterNode": this.$(this.selector + "[data-uid=$uid]".replace("$uid", uid)),
			"editorNode": this.$(this.editor + "[data-uid=$uid]".replace("$uid", uid)),
			"filterBoxNode": this.$(this.filterBox + "[data-uid=$uid]".replace("$uid", uid)),
			"filterText": uidListData.filter || ""
		}
	},
	on_edit: function(evt, data) {
		var $editorNode = this.collection[data.uid].editorNode,
			$filterBoxNode = this.collection[data.uid].filterBoxNode
		$editorNode.val(data.$target.text().trim())
		$filterBoxNode.addClass("edit")
		$editorNode.focus()
	},
	on_editDone: function(evt, data) {
		if (evt.which === 13) {
			// key enter is 13
			var value = data.$target.val()
			var listData = {}
			listData[data.uid] = {
				"filter": value
			}
			// the list ui content modify action will let the update() function to handle
			this.dbParams.set("list", listData)
		} else if (evt.which === 27) {
			// key ESC is 27
		} else {
			// other key then return
			return;
		}
		var $filterBoxNode = this.collection[data.uid].filterBoxNode
		$filterBoxNode.removeClass("edit")
	},
	modifyList: function(uid) {
		this.event.trigger("ui/list/mod", {
			"data": {
				"uid": uid,
				"callback": this.filterList.bind(this)
			}
		})
	},
	filterList: function(datas) {
		var uid = datas.data.uid
		var $list = datas.data.list
		var keywords = this.collection[uid].filterText.split(",")
		var $item
		$list.find(".item").each(function(k, item) {
			$item = $(item)
			this.collepseList($item, false)
			if (this.textTools.hasIn(keywords, $item.text())) {
				this.collepseList($item)
			}
		}.bind(this))
	},
	collepseList: function(node, bool) {
		var coleClass = "collepse"
		if (bool === false) {
			if (node.hasClass(coleClass)) {node.removeClass(coleClass)}
		} else {
			node.addClass(coleClass)
		}
	},
	whenListAppending: function(datas) {
		var uid = datas.data.uid
		if (!this.collection[uid]) { this.whenListCreating(uid) }
		this.filterList(datas)
	},
	whenListCreating: function(datas) {
		var uid = datas.data.uid
		this.initialCollection(uid)

		var $filterNode = this.collection[uid].filterNode
		$filterNode.text(this.collection[uid].filterText)
	},
	update: function(datas) {
		var uids = datas.data,
			$filterNode
		for (var k in uids) {
			if (!uids.hasOwnProperty(k)) continue
			// initial collection has moved to whenListCreated() method
			// not update
			if (!this.collection[k]
				|| this.collection[k].filterText === uids[k].filter
				|| typeof uids[k].filter === "undefined") {
				continue
			}
			// update our data
			this.collection[k].filterText = uids[k].filter
			// update ui content
			$filterNode = this.collection[k].filterNode
			$filterNode.text(this.collection[k].filterText)
			// do actions
			this.modifyList(k)
		}
	}
})



root.core.addModule("filterBox", filterBox)

// end of function wrapper
})(window, jQuery)