import { initWfCollections } from "@library/wfcollection";

const sanavitaCollections: Set<string> = new Set([
  'hit',
  'dailyMenu',
  'news',
]);

initWfCollections(sanavitaCollections);
