import { initWfCollections, wfCollections } from "@peakflow/wfcollection";

// Expose the functions to the global window object for the browser
window.initWfCollections = initWfCollections;
window.wfCollections = wfCollections;

