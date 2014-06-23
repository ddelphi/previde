
/*
	previde
	
	@version 0.1
*/

/* global $, jQuery,EventSystem,toString */
/* jshint unused: false*/


(function(root, $) {
"use strict";



var oldCore = root.core
var core = {}
root.core = core

core.noConflict = function() {
	if (oldCore) {
		return oldCore
	} else {
		return core
	}
}

// The global options is for the modules and plugins under the core obejct
core.options = {
	"default": {
		"paramsPath": "params.json"
	},
	"debug": true,
	"dbKey": "settings"
}

/*
	The core object, is the only one main object to control all other objects.

	There are two type of objects to the core, the Plugin and the Module object.
	UI object is the type of Module object.
*/
core = $.extend(core, {
	_messages: [],
	modules: {},
	modulesState: {},
	plugins: {},
	switchs: {},

	init: function(objectDict) {
		this.$ = objectDict.$
		this.addPlugin("jQuery", $)

		this.init_debug()
	},
	/*
		The debug mode switcher
	*/
	init_debug: function() {
		if (this.options.debug) {
			// Let the brower handle the error
		} else {
			// Wrap all functions of core with the error handler function
			this._wrapperLog(this)
		}
	},
	
	/* cross-cutting concern */

	// wrap all core's function for tracing error
	_wrapperLog: function(obj) {
		var that = this
		for (var fn in obj) {
			if (!obj[fn].hasOwnProperty(fn)) continue
			if (typeof fn !== "function") continue

			obj[fn] = (function() {
				var targetFn = obj[fn]

				return function() {
					try {
						targetFn.apply(obj, Array.prototype.slice.call(arguments, 0))
					} catch(e) {
						// throw new Error("Custom Error:", e)
						console.error("Custom Error:", e)
						that._messages.push([Date.now().toISOString(), "executing error in ", fn, "():", e, e.stack])
					}
				}
			})()
		}
	},

	/* deal with modules */

	addModule: function(id, module) {
		if (this.modules.hasOwnProperty(id)) {
			throw new Error("module already has the module [%s].".replace("%s", id))
		}
		this.modules[id] = module
		this.modulesState[id] = {}
	},
	removeModule: function(id) {
		if (this.modules.hasOwnProperty(id)) {
			delete this.modules[id]
			return true
		}
		return false
	},
	getModule: function(id) {
		return this.modules[id]
	},

	/* deal with plugins */

	addPlugin: function(id, plugin) {
		if (this.plugins.hasOwnProperty(id)) {
			throw new Error("module already has the plugin [%s].".replace("%s", id))
		}
		if (typeof plugin.init === "function") {
			plugin.init(this)
		}
		this.plugins[id] = plugin
	},
	removePlugin: function(id) {
		if (this.plugins.hasOwnProperty(id)) {
			delete this.plugins[id]
			return true
		}
		return false
	},
	getPlugin: function(id) {
		return this.plugins[id]
	},
	
	/* main actions */

	start: function(id) {
		var modState = this.modulesState[id]
		if (modState && !modState.isRunning) {
			this.modules[id].init(this)
			modState.isRunning = true
		}
	},
	stop: function(id) {
		var modState = this.modulesState[id]
		if (modState && modState.isRunning) {
			this.modules[id].stop()
			modState.isRunning = false
		}
	},
	startAll: function() {
		for (var mod in this.modules) {
			if (!this.modules.hasOwnProperty(mod)) continue
			this.start(mod)
		}
	},
	stopAll: function() {
		for (var mod in this.modules) {
			if (!this.modules.hasOwnProperty(mod)) continue
			this.stop(mod)
		}
	}

// end of core
})



/* base classes */

var baseClasses = {}
root.baseClasses = baseClasses

baseClasses.Plugin = {
	__type__: "plugin",

	init: function(core) {
		this.core = core
		this.$ = core.$
		this.logger = core.getPlugin("logger")
		this.event = core.getPlugin("event")

		this.initParams()
		this.initEvents()
	},
	initParams: function() {},
	initEvents: function() {}
}

baseClasses.Module = $.extend({}, baseClasses.Plugin, {
	__type__: "module",

	stop: function() {}
})

baseClasses.UI = $.extend({}, baseClasses.Module, {
	__type__: "ui",

	init: function(core) {
		this.core = core
		this.$ = core.$
		this.logger = core.getPlugin("logger")
		this.event = core.getPlugin("event")
		this.templateObject = core.getPlugin("template")

		this.initParams()
		this.initEvents()
	}
})

// initial the core with jQuery object
core.init({"$": $})

// end of function wrapper
})(window, jQuery)
