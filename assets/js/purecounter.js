// <script src="https://cdn.jsdelivr.net/npm/@srexi/purecounterjs/dist/purecounter_vanilla.js"></script>
// <script>

const allCounters = document.querySelectorAll('[counterid]')

allCounters.forEach(counter => {
  let counterStart = counter.getAttribute('counter-start') || 0;
  let counterEnd = counter.getAttribute('counter-end') || 0;
  let counterDecimals = counter.getAttribute('counter-decimals') || 1;
  let counterId = counter.getAttribute('counterid');


  new PureCounter({
    // Setting that can't be overriden on pre-element
    selector: `[counterid="${counterId}"]`,		// HTML query selector for spesific element

    // Settings that can be overridden on per-element basis, by `data-purecounter-*` attributes:
    start: counterStart,            // Starting number [unit]
    end: counterEnd, 			    // End number [unit]
    duration: 2, 	                // The time in seconds for the animation to complete [seconds]
    delay: 10, 			            // The delay between each iteration (the default of 10 will produce 100 fps) [miliseconds]
    once: true, 		            // Counting at once or recount when the element in view [boolean]
    repeat: false, 		            // Repeat count for certain time [boolean:false|seconds]
    decimals: counterDecimals, 		            // How many decimal places to show. [unit]
    legacy: true,                   // If this is true it will use the scroll event listener on browsers
    filesizing: false, 	            // This will enable/disable File Size format [boolean]
    currency: false, 	            // This will enable/disable Currency format. Use it for set the symbol too [boolean|char|string]
    separator: true, 	            // This will enable/disable comma separator for thousands. Use it for set the symbol too [boolean|char|string]
  });
});
// </script>