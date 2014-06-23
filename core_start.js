/*
	the main start of the project
*/



$(document).ready(function() {
"use strict";

/* main */

function main() {
	// start running

	var core = window.core

	core.start("initial")
	core.startAll()

	var event = core.getPlugin("event")
	event.flushBuffer()
	console.log("=========== core all started ==========")
}

main()

// end of document's ready wrapper
})

