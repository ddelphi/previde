(function(root, $) {
"use strict";



/*
	horizonSpliter UI

	These are the spliters that will be inserted into the list.
*/
var horizonSpliter = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.collection = {}
		this.parent = "#list-wrapper"
		this.selector = ".spliter-horizon"
		this.selectorCounter = ".template.spliter-horizon.counter"
		this.selectorPage = ".template.spliter-horizon.page"
		this.selectorDate = ".template.spliter-horizon.date"
		this.templateOfCounter = this.templateObject.new(this.$(this.selectorCounter).html())
		this.templateOfPage = this.templateObject.new(this.$(this.selectorPage).html())
		this.templateOfDate = this.templateObject.new(this.$(this.selectorDate).html())
		
		this.counterStep = 5
	},
	initEvents: function() {
		this.$(this.parent).on("mouseEnter", this.selector, this.performEvent.bind(this, "on_hover"))
		this.event.register("ui/list/whenAppending", this.whenListAppending.bind(this))
		this.event.register("ui/list/whenCreating", this.whenListCreating.bind(this))
	},
	performEvent: function(fn, evt) {
		var target = this.$(evt.currentTarget)

		this[fn].call(this, {
			"data": {
				"target": target
			}
		})
	},
	initialCollection: function(uid) {
		this.collection[uid] = {
			"listItemsNum": 0,
			"lastItemDate": null,
			"pageNum": 0
		}
	},
	on_hover: function(datas) {
		// noop
	},
	spliterCounter: function(items, uid) {
		var start = this.collection[uid].listItemsNum,
			end = start + items.length,
			spliter
		var counterList = this.iterCounter(start, end, this.counterStep, true)
		var idx,
			i = counterList[0] === 0 ? 1 : 0;
		for (i; i < counterList.length; i++) {
			idx = counterList[i] - 1
			spliter = this.$(this.templateOfCounter({"count": idx + 1}))
			spliter.insertBefore(items.eq(idx - start))
		}
		this.collection[uid].listItemsNum = end
	},
	spliterPage: function(items, uid) {
		var pageNum = this.collection[uid].pageNum + 1

		if (pageNum > 1) {
			var spliter = this.$(this.templateOfPage({"page": pageNum}))
			spliter.insertBefore(items.first())
		}
		this.collection[uid].pageNum = pageNum
	},
	// todo
	spliterDate: function(items, uid) {
		var spliter,
			diffDateList = [],
			prevDate = this.collection[uid].lastItemDate || $item.first().find(".date").text(),
			date,
			$item
		
		if (!prevDate) { return }

		items.each(function(i, item) {
			$item = $(item)
			date = $item.find(".date").text()
			if (prevDate != date) {
				spliter = this.$(this.templateOfDate({
					"date": date
				}))
				spliter.insertBefore($item)
			}
		})
		this.collection[uid].lastItemDate = date
	},
	iterCounter: function(start, end, step, isStepFromZero) {
		var res = [],
			remainder = 0,
			num
		if (isStepFromZero && start !== 0) {
			remainder = step % start
		}
		for (var i = start; i <= end; i += step) {
			if (isStepFromZero) {
				num = i + remainder
			} else {
				num = i
			}
			res.push(num)
		}
		if ((res[res.length - 1]) > end) {
			res.pop()
		}
		return res
	},
	whenListCreating: function(datas) {
		// reset the status when list showing
		var uid = datas.data.uid
		this.initialCollection(uid)
	},
	whenListAppending: function(datas) {
		var items = datas.data.list.find(".item")
		var uid = datas.data.uid
		if (!this.collection[uid]) {
			this.initialCollection(uid)
		}
		this.spliterCounter(items, uid)
		this.spliterPage(items, uid)
		// this.spliterDate(items, uid)
	}
})


root.core.addModule("horizonSpliter", horizonSpliter)

// end of function wrapper
})(window, jQuery)