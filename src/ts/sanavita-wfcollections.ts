import { initWfCollections } from "@peakflow/wfcollection";

const sanavitaCollections: Set<string> = new Set([
  'hit',
  'dailyMenu',
  'news',
]);

initWfCollections(sanavitaCollections);
