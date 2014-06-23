(function(root, $) {
"use strict";


/*
	moduleEvents object

	an object for perform some actions of the whole project,
	such as saveing params on closing the page
*/
var moduleEvents = $.extend({}, root.baseClasses.Module, {
	initParams: function() {
		this.db = this.core.getPlugin("storage")

		this.$window = $(window)
	},
	initEvents: function() {
		this.$window.on("unload", this.unload.bind(this))
	},
	unload: function(evt) {
		// save the data model to localStorage
		this.saveDb()
	},
	saveDb: function() {
		this.db.save()
	}
})



root.core.addModule("moduleEvents", moduleEvents)

// end of function wrapper
})(window, jQuery)