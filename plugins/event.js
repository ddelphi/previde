(function(root, $) {
"use strict";

/*
	event object

	just an alias of the eventSystem object
*/

root.core.addPlugin("event", $.extend({}, root.EventSystem))

// end of function wrapper
})(window, jQuery)