(function(root, $) {
"use strict";



/*
	tooltip UI

	This ui is to display the info from the logger object,
	when there are new infos loged into the logger object.
*/
var tooltip = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.element = this.$(".m-tooltip .m-tooltip-container")
		this.template = this.templateObject.new(this.$(".template.tooltip.item").html())

		this.queue = []

		var self = this
		this.events = {
			"queue/add": [
				self.show.bind(self)
			],
			"queue/remove": [
				self.hide.bind(self)
			]
		}
		this.time = 5000
		this.itemDirection = "fromTop"
	},
	initEvents: function() {
		this.event.register("logger/all", this.update.bind(this))
	},
	enQueue: function(tip) {
		this.queue.push(tip)
		this.trigger("queue/add", {"data": tip})
	},
	deQueue: function() {
		var res = this.queue.shift()
		this.trigger("queue/remove", {"data": res})
	},
	show: function(datas) {
		this.element.show()
		this.showItem(datas.data)
	},
	hide: function(datas) {
		if (this.queue.length === 0) {
			this.element.hide()
		}
		this.hideItem(datas.data)
	},
	showItem: function(theTip) {
		var noopItem = this.element.find(".item.noop")
		theTip.hide()
		if (noopItem.length > 0 && this.itemDirection === "fromTop") {
			theTip.insertAfter(noopItem)
		} else {
			this.element.append(theTip)
		}
		theTip.fadeIn(400)
		setTimeout(this.deQueue.bind(this), this.time)
	},
	hideItem: function(theTip) {
		theTip.fadeOut(400, function() {theTip.remove()})
	},
	createItem: function(datas) {
		// the type of datas: {type, title}
		var html = this.template(datas),
			newTip = this.$(html)
		
		this.enQueue(newTip)
	},
	trigger: function(event, datas) {
		if (!this.events.hasOwnProperty(event)) return;
		for (var i = 0; i < this.events[event].length; i++) {
			this.events[event][i].call(this, datas)
		}
	},
	update: function(loggerDatas) {
		this.createItem({
			"type": loggerDatas.type,
			"title": loggerDatas.message
		})
	}
})



root.core.addModule("tooltip", tooltip)

// end of function wrapper
})(window, jQuery)