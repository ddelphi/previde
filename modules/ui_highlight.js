(function(root, $) {
"use strict";



/*
	highlight UI

	An editor to highlight the list item.
*/
var highlight = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")
		this.textTools = this.core.getPlugin("textTools")

		this.collection = {}
		this.parentNode = $("#list-wrapper")
		this.selector = ".m-list-wrapper .m-function .highlight-box .highlight-label"
		this.editor = ".m-list-wrapper .m-function .highlight-box .highlight-editor"

		this.styleClass = "highlight-item"
	},
	initEvents: function() {
		this.parentNode.on("dblclick", this.selector, this.performEvent.bind(this, "on_edit"))
		this.parentNode.on("keyup", this.editor, this.performEvent.bind(this, "on_editDone"))
		this.event.register("ui/list/whenAppending", this.whenListAppending.bind(this))
		this.event.register("ui/listWrapper/created", this.whenListCreating.bind(this))
		this.event.register("params/list/change", this.update.bind(this))
	},
	performEvent: function(fn, evt) {
		var $target = this.$(evt.currentTarget),
			uid = $target.attr("data-uid")

		if (!this.collection[uid]) {
			this.initialCollection(uid)
		}
		this[fn].call(this, evt, {
			"data": {
				"uid": uid
			}
		})
	},
	initialCollection: function(uid) {
		var listData = this.dbParams.get("list", uid),
			labelElement = this.$(this.selector + "[data-uid=%s]".replace("%s", uid)),
			editorElement = this.$(this.editor + "[data-uid=%s]".replace("%s", uid))

		this.collection[uid] = {
			"highlight": listData.highlight || "",
			"labelElement": labelElement,
			"editorElement": editorElement
		}
	},
	on_edit: function(evt, datas) {
		var uid = datas.data.uid,
			elem = this.collection[uid].labelElement,
			editorElem = this.collection[uid].editorElement

		editorElem.val(elem.text().trim())
		elem.hide()
		editorElem.fadeIn(400).focus()
	},
	on_editDone: function(evt, datas) {
		var uid = datas.data.uid,
			elem = this.collection[uid].labelElement,
			editorElem = this.collection[uid].editorElement

		if (evt.which === 13) {
			var text = editorElem.val().trim()

			var data = {}
			data[uid] = {
				"highlight": text
			}
			this.dbParams.set("list", data)
		} else if (evt.which === 27) {
			// noop
		} else {
			return
		}
		editorElem.hide()
		elem.fadeIn(400)
	},
	// todo, for later use
	highlightKeyword: function() {
		// noop
	},
	highlightItem: function(uid, $list) {
		var keywords = this.collection[uid].highlight.split(","),
			$item
		$list.find(".item").each(function(k, item) {
			$item = $(item)
			if ($item.hasClass(this.styleClass)) {
				$item.removeClass(this.styleClass)
			}
			if (this.textTools.hasIn(keywords, $item.text())) {
				$item.addClass(this.styleClass)
			}
		}.bind(this))
	},
	highlight: function(datas) {
		this.highlightItem(datas.data.uid, datas.data.list)
	},
	process: function(uid) {
		this.event.trigger("ui/list/mod", {
			"data": {
				"uid": uid,
				"callback": this.highlight.bind(this)
			}
		})
	},
	whenListAppending: function(datas) {
		var uid = datas.data.uid
		if (!this.collection[uid]) { this.whenListCreating(uid) }
		this.highlight(datas)
	},
	whenListCreating: function(datas) {
		var uid = datas.data.uid
		this.initialCollection(uid)

		var $labelElem = this.collection[uid].labelElement
		$labelElem.text(this.collection[uid].highlight)
	},
	update: function(datas) {
		var uids = datas.data
		for (var k in uids) {
			if (!uids.hasOwnProperty(k)) continue
			// initial collection has moved to whenListCreating() method
			if (!this.collection[k]
				|| this.collection[k].highlight === uids[k].highlight
				|| typeof uids[k].highlight === "undefined") {
				continue
			}
			// update our data
			this.collection[k].highlight = uids[k].highlight
			// update ui content
			var labelElem = this.collection[k].labelElement
			labelElem.text(uids[k].highlight)
			// do action
			this.process(k)
		}
	}
})



root.core.addModule("highlight", highlight)

// end of function wrapper
})(window, jQuery)