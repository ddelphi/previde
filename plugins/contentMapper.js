(function(root, $) {
"use strict";


/*
	contentMapper object
	
	For mapping a list of specified content of web page
	to a dict object.
*/
var contentMapper = $.extend({}, root.baseClasses.Plugin, {
	create: function(content, dataModel) {
		var frag,
			$frag

		// wrap content within a div section
		if (!content.jquery) {
			frag = document.createElement("div")
			frag.innerHTML = content
			$frag = this.$(frag)
		} else {
			$frag = content
		}
		var collection = this.mapData($frag, dataModel)
		return collection
	},

	/* private methods */

	mapData: function mapData(collection, dataModel) {
		var arr = [],
			curCol,
			tmpSubCol

		var that = this
		collection.each(function(i, col) {
			curCol = {}
			arr.push(curCol)
			
			for (var dk in dataModel) {
				var dv = dataModel[dk]
				if (typeof dv === "string") {
					curCol[dk] = this.selectContent(col, dv)
				} else if (toString.call(dv).indexOf("Object") > 7) {
					curCol[dk] = {}
					
					if (!dataModel[dk]["_"]) {
						throw new Error("contentMapper not find a '_' key in [%s].".replace("%s", dk))
					}
					tmpSubCol = $(dataModel[dk]["_"], col)
					for (var mk in dataModel[dk]) {
						var mv = dataModel[dk][mk]
						if (mk === "_") {
							// noop
						} else if (mk === "[]") {
							curCol[dk][mk] = that.mapData(tmpSubCol, mv)
						} else {
							curCol[dk][mk] = that.selectContent(tmpSubCol, mv)
						}
					}
				}
			}
		})
		return arr
	},
	selectContent: function selectContent(content, selector) {
		var results = [],
			res

		if (!content.jquery) {
			content = $(content)
		}
		if (typeof selector === "string") {
			var arr = selector.match(/(\|.*?\||.+?(?=\||$))/ig) || [""],
				sel,
				match,
				qSel, att, repl

			for (var i = 0; i < arr.length; i++) {
				sel = arr[i].trim()

				if (sel.indexOf("|") === 0) {
					results.push(sel.slice(1, -1))
					continue
				}
				match = sel.match(/^\s*(.+?)?\s*(->\s*\[(.+?)\])?\s*(\[\[(.+?)\]\])?\s*$/)
				qSel = match[1]
				att = match[3]
				repl = match[5]

				if (sel === "") {
					res = content.text()
				}
				else if (qSel) {
					// if can't find the children, then find the first layer
					var con = content.find(qSel)
					if (con.length === 0) {
						con = content.filter(qSel)
					}
					if (con.length === 0 && att) {
						res = content.attr(att)
					} else if (con.length > 0 && att) {
						res = con.attr(att)
					} else if (con.length > 0 && !att) {
						res = con.text()
					} else {
						res = ""
					}
				}

				if (repl) {
					repl = repl.match(/^\s*\/(.+?)\/(\w*)\s*,\s*'(.+)'\s*$/)
					var regex = repl[1]
					var flag = repl[2]
					var mRepl = repl[3]
					if (regex && mRepl) {
						res = res.replace(RegExp(regex, flag), mRepl)
					}
				}
				results.push(res)
			}
			res = results.join(" ")

		} else if (toString.call(selector).indexOf("Object") > 7) {
			res = {}
			for (var k in selector) {
				if (!selector.hasOwnProperty(k)) continue
					res[k] = selectContent(content, selector[k])
			}
		}
		return res
	}

})



root.core.addPlugin("contentMapper", contentMapper)

// end of function wrapper
})(window, jQuery)