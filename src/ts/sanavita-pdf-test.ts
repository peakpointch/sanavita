// Imports
import createAttribute from "@library/attributeselector";
import { filterFormSelector } from "@library/form";
import Pdf from "@library/pdf";

const wfCollectionSelector = createAttribute('wf-collection');

function initialize() {
  const collectionListElement = document.querySelector<HTMLElement>(wfCollectionSelector('activity'));
  const pdfCanvasElement = document.querySelector<HTMLElement>(Pdf.select('container'));
  const filterFormElement = document.querySelector<HTMLElement>(filterFormSelector('component'));

  const pdf = new Pdf(pdfCanvasElement);
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initialize();
  } catch (e) {
    console.log(e);
  }
})
