import { de } from "date-fns/locale";
import { dateflow, Script } from "peakflow";

export async function initListFilter(): Promise<void> {
  await new Script({
    src: "https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js",
    type: "module",
    async: true,
    attributes: {
      "fs-list": null,
      "fs-list-highlight": "true",
      "fs-list-highlightclass": "is-hightlight",
    },
  }).load();

  const listWrapperSelector = `[data-wf-collection="news"]`;
  const listWrapper = document.querySelector<HTMLElement>(listWrapperSelector);

  const observer = new MutationObserver(() => {
    observer.disconnect();
    dateflow(de, listWrapper);
    observer.observe(listWrapper, {
      childList: true,
      subtree: true,
    });
  });

  observer.observe(listWrapper, {
    childList: true,
    subtree: true,
  });
}
