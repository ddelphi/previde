/* global console */
/* jshint asi: false */


var Unittest = {
	init: function() {
		this.messages = [];
		this.callbacks = [];
		this.counter = {
			"true": 0,
			"false": 0,
			"error": 0
		};
		this.isStop = false;
	},
	init_aliasName: function() {
		var alias = {
			"eq": "assertTrue",
			"at": "assertTrue",
			"af": "assertFalse"
		};
		
		for (var k in alias) {
			if (!alias.hasOwnProperty(k)) continue;
			this[k] = this[alias[k]];
		}
	},
	run: function() {
		var logInfoPattern = "\n"
			+ "----------------------------------------\n"
			+ "*** testing %s() ***\n"
			+ "----------------------------------------\n";
		
		if (typeof this.setup === "function") {
			this.setup();
		}
		for (var k in this) {
			// if (!this.hasOwnProperty(k)) continue;
			if (k.indexOf("test_") === 0 && typeof this[k] === "function") {
				if (this.isStop) {
					this.hasStop(k);
					break;
				}
				this._log("");
				this._log(logInfoPattern.replace("%s", k));
				this[k].call(this);
			}
		}
		if (typeof this.destory === "function") {
			this.destory();
		}
		this.report();
	},
	hasStop: function(name) {
		this._log("%s has been stoped by manual.".replace("%s", name));
		this._log("");
	},
	assertTrue: function(v1, v2) {
		if (v1 === v2) {
			this.assert(true, "assertTure", v1, "||||", v2);
		} else {
			this.assert(false, "assertTrue", v1, "||||", v2);
		}
		return this;
	},
	assertFalse: function(v1, v2) {
		if (v1 !== v2) {
			this.assert(true, "assertFalse", v1, "||||", v2);
		} else {
			this.assert(false, "assertFalse", v1, "||||", v2);
		}
		return this;
	},
	assertError: function(fn /* args */) {
		var args = this._array(arguments, 1);
		var fnStr = fn.toString();
		var fnName = fnStr.substring(0, fnStr.indexOf("{"));

		try {
			fn.apply(fn, args);
		} catch(e) {
			this.assert(true, "assertError", fnName, args);
		}
		this.assert(false, "assertError", fnName, args);
		return this;
	},
	assert: function(type, name /* args */) {
		var args = this._array(arguments, 2);
		type = type.toString();
		
		this._count(type.toLowerCase());
		args.unshift("[" + type.toUpperCase() + " " + name + "]");

		if (type === "true") {
			this._log.apply(this, args);
		} else if (type === "false") {
			this._error.apply(this, args);
		} else if (type === "error") {
			this._error.apply(this, args);
		}
	},
	log: function(/* args */) {
		var res = this._array(arguments),
			additionInfo = "==>>";

		res.unshift(additionInfo);
		this._log.apply(this, res);
		return this;
	},
	lnLog: function(/* args */) {
		this._log("");
		this.log.apply(this, this._array(arguments));
		return this;
	},
	report: function(prefixStr) {
		var reportInfo = "%prefix%: success %succ%, fail %fail%, error %err%",
			prefix = typeof prefixStr === "string" ? prefixStr : "final report";

		prefix += this.isStop ? " (at STOP)" : "";
		reportInfo = reportInfo
			.replace("%prefix%", prefix)
			.replace("%succ%", this.counter.true)
			.replace("%fail%", this.counter.false)
			.replace("%err%", this.counter.error);

		this._log("");
		this._log("//////////////////////////////////////////////////");
		if (this.counter.false > 0 || this.counter.error > 0) {
			this._error(reportInfo);
		} else {
			this._log(reportInfo);
		}
		this._log("//////////////////////////////////////////////////");
	},
	// this stop testing function is for stoping after the end of current test function
	stopTesting: function() {
		this.isStop = true;
	},
	addDispatcher: function(callback) {
		if (typeof callback === "function") {
			this.callbacks.push(callback);
		}
	},
	extend: function(target) {
		var newObj = Object.create(this);
		for (var k in target) {
			if (!target.hasOwnProperty(k)) continue;
			newObj[k] = target[k];
		}
		newObj.init();
		return newObj;
	},
	
	/* private methods */
	
	_count: function(type, num) {
		if (!this.counter.hasOwnProperty(type)) return;

		var finNum = typeof num === "number" ? num : 1;
		this.counter[type.toLowerCase()] += finNum;
	},
	_log: function(/* args */) {
		var args = this._array(arguments);
		this._logMessage(args);
		console.log.apply(console, args);
	},
	_warn: function(/* args */) {
		var args = this._array(arguments);
		this._logMessage(args);
		console.warn.apply(console, args);
	},
	_error: function(/* args */) {
		var args = this._array(arguments);
		this._logMessage(args);
		console.error.apply(console, args);
	},
	_array: function(originArgs, startIndex) {
		var i = startIndex ? startIndex : 0;
		return Array.prototype.slice.call(originArgs, i);
	},
	_logMessage: function(args) {
		var msg = args.join(" ");
		this.messages.push(msg);
		this._dispatchMessage(msg);
	},
	_dispatchMessage: function(msg) {
		for (var cb in this.callbacks) {
			if (this.callbacks.hasOwnProperty(cb)) continue;
			cb(msg);
		}
	}
};
Unittest.init_aliasName();

