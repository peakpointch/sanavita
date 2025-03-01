import createAttribute from "@library/attributeselector";
import { format, Locale } from "date-fns";

type ElementsArg = Array<NodeListOf<HTMLElement> | HTMLElement | string>;
type AttrObject = {
  [key: string]: string;
}

function getDomElements(...elements: ElementsArg): HTMLElement[] {
  const containers: HTMLElement[] = [];

  elements.forEach((entry) => {
    if (entry instanceof HTMLElement) {
      containers.push(entry)
    } else if (typeof entry === "string") {
      containers.push(...Array.from(document.querySelectorAll<HTMLElement>(entry)));
    } else if (entry instanceof NodeList) {
      containers.push(...Array.from(entry));
    } else if (entry === null) {
      return;
    } else {
      throw new Error(`Passed container entry was not of type "string" or "HTMLElement".`);
    }
  });
  return containers;
}

export function dateflow(locale: Locale, ...containers: ElementsArg): void {
  const containerList: HTMLElement[] = getDomElements(...containers);
  const attr: AttrObject = {
    date: "dateflow-date",
    format: "dateflow-format",
  }
  const dateSelector = createAttribute(attr.date);
  const dateQuery: string = `${dateSelector()}:not(.w-condition-invisible, .w-condition-invisible [${attr.date}])`;
  let i: number = 0;

  containerList.forEach((c) => {
    const dateElements = c.querySelectorAll<HTMLElement>(dateQuery);
    dateElements.forEach((e) => {
      i++;
      const formatString: string = e.getAttribute("dateflow-format");
      const dateString: string = e.getAttribute("dateflow-date");
      if (!dateString) {
        console.warn(`Date string #${i} is empty.`);
        return;
      }
      const date = new Date(dateString);
      if (!(date instanceof Date)) {
        console.warn(`Couldn't parse date #${i} "${dateString}". Skipping date.`);
        return;
      }
      console.log(dateString, date)
      if (!formatString) {
        console.warn(`Format string #${i} is empty. Perhaps you missed the "dateflow-format" attribute?`);
        return;
      }
      e.innerText = format(date, formatString, { locale: locale });
    });
  });
}

