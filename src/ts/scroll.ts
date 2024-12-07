export function scrollToSection(
  id: string,
  offset: number = 0,
  selectorType: "id" | "any" = "id"
): void {
  console.log("SCROLLING");

  setTimeout(() => {
    const selector = selectorType === "id" ? `#${id}` : id;
    const section = document.querySelector(selector);
    if (section) {
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      console.error(`Section with id '${id}' not found.`);
    }
  }, 10);
}

document.addEventListener("DOMContentLoaded", () => {
  const cmsScrollLinks = document.querySelectorAll<HTMLAnchorElement>(
    "a[data-href-scroll]"
  );
  cmsScrollLinks.forEach((link) => {
    const hrefPrefix = link.dataset.hrefPrefix || "";
    const hrefScroll = link.dataset.hrefScroll || "";
    link.href = `${hrefPrefix}#${hrefScroll}`;
  });

  if (location.pathname !== "/") {
    const globalScrollLinks = document.querySelectorAll<HTMLAnchorElement>(
      'a[data-global-scroll="true"]'
    );
    const globalFiltered = Array.from(globalScrollLinks).filter((link) =>
      link.href.includes(location.pathname)
    );
    globalFiltered.forEach((link) => {
      const url = new URL(link.href); // Create a URL object from the link's href
      link.href = url.hash; // Set the href to only the hash (e.g., "#section")
    });
  }

  const allScrollLinks = document.querySelectorAll<HTMLAnchorElement>(
    'a[href^="#"], [scroll-to]'
  );
  allScrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const scrollId =
        link.getAttribute("href")?.slice(1) ||
        link.getAttribute("scroll-to") ||
        "";
      console.log(scrollId);

      const offset = parseInt(link.getAttribute("scroll-offset") || "88", 10);
      scrollToSection(scrollId, offset);
    });
  });
});
