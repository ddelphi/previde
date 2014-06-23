(function(root, $) {
"use strict";



/*
	setting UI
	the setting button ui
*/
var setting = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.selector = "#setting"
		this.element = this.$(this.selector)
	},
	initEvents: function() {
		this.element.find(".icon-setting").on("click", this.on_click.bind(this))
	},
	on_click: function(evt) {
		this.event.trigger("ui/setting/dialog/toggle", null)
	}
})


/*
	settingDialog UI
	the setting dialog ui
*/
var settingDialog = $.extend({}, root.baseClasses.UI, {
	initParams: function() {
		this.dbParams = this.core.getPlugin("dbParams")

		this.element = this.$("#setting-dialog")
		this.editor = this.element.find(".editor")
		this.submitButton = this.element.find(".submit")
		this.cancelButton = this.element.find(".cancel")
		this.cache = ""
	},
	initEvents: function() {
		this.submitButton.on("click", this.submit.bind(this))
		this.cancelButton.on("click", this.cancel.bind(this))
		this.editor.on("keyup", this.cancel.bind(this))
		this.event.register("ui/setting/dialog/toggle", this.toggle.bind(this))
		this.event.register("params/params/change", this.update.bind(this))
	},
	toggle: function() {
		if (this.element.css("display") === "none") {
			this.show()
		} else {
			this.cancel()
		}
	},
	show: function() {
		this.element.css("display", "block")
	},
	submit: function() {
		var state = this.saveParams()
		if (state) {
			this.element.css("display", "none")
			this.logger.log("params has been saved!")
		}
	},
	cancel: function(evt) {
		if (!evt || evt.which === 27 || evt.type === "click") {
			this.element.css("display", "none")
			this.editor.val(this.cache)
		}
	},
	saveParams: function() {
		var params = this.editor.val()
		try {
			var dict = this.$.parseJSON(params)
			this.dbParams.set("params", dict)
		} catch(e) {
			console.error("error in save params in setting box:", e)
			this.logger.error("error in saving params.")
			return false
		}
		return true
	},
	fillEditor: function(datas) {
		// only update with the "params" datas
		var paramsText = JSON.stringify(datas.data)
		this.editor.val(paramsText)

		// cache the params text
		this.cache = paramsText
	},
	// update from params/params/change event
	update: function(datas) {
		this.fillEditor(datas)
	}
})



root.core.addModule("setting", setting)
root.core.addModule("settingDialog", settingDialog)

// end of function wrapper
})(window, jQuery)