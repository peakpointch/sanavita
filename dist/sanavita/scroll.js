(() => {
  // node_modules/peakflow/dist/attributeselector/attributeselector.js
  var attrMatchTypes = {
    startsWith: "^",
    endsWith: "$",
    includes: "*",
    whitespace: "~",
    hyphen: "|",
    exact: ""
  };
  function getOperator(type) {
    return attrMatchTypes[type] || "";
  }
  function exclude(selector, ...exclusions) {
    if (exclusions.length === 0)
      return selector;
    return extend(selector, `:not(${exclusions.join(", ")})`);
  }
  function extend(selector, ...extensions) {
    if (extensions.length === 0)
      return selector;
    const selectors = split(selector);
    const selectorsWithExtensions = extensions.map((extension) => {
      return append(selectors, extension);
    });
    return selectorsWithExtensions.join(", ");
  }
  function append(selectorList, suffix) {
    return selectorList.reduce((acc, string) => {
      const prefix = acc === "" ? "" : `${acc}, `;
      return `${prefix}${string}${suffix}`;
    }, "");
  }
  function split(selector) {
    const result = [];
    let current = "";
    let depth = 0;
    let i = 0;
    while (i < selector.length) {
      const char = selector[i];
      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
      }
      if (char === "," && depth === 0) {
        result.push(current.trim());
        current = "";
        i++;
        while (selector[i] === " ")
          i++;
        continue;
      }
      current += char;
      i++;
    }
    if (current.trim()) {
      result.push(current.trim());
    }
    return result;
  }
  var createAttribute = (attrName, defaultOptions) => {
    const mergedDefaultOptions = {
      defaultMatchType: defaultOptions?.defaultMatchType ?? "exact",
      defaultValue: defaultOptions?.defaultValue ?? void 0,
      defaultExclusions: defaultOptions?.defaultExclusions ?? []
    };
    return (name = mergedDefaultOptions.defaultValue, options) => {
      const mergedOptions = {
        matchType: options?.matchType ?? mergedDefaultOptions.defaultMatchType,
        exclusions: options?.exclusions ?? mergedDefaultOptions.defaultExclusions
      };
      if (!name) {
        return exclude(`[${attrName}]`, ...mergedOptions.exclusions);
      }
      const value = String(name);
      const selector = `[${attrName}${getOperator(mergedOptions.matchType)}="${value}"]`;
      return exclude(selector, ...mergedOptions.exclusions ?? []);
    };
  };

  // node_modules/peakflow/dist/scroll/scroll.js
  var defaultScrollOptions = {
    defaultOffset: 0,
    defaultBehaviour: "smooth"
  };
  function scrollToSection(id, selectorType = "id", options = {}) {
    const opts = {
      offset: options.offset ?? defaultScrollOptions.defaultOffset,
      behaviour: options.behaviour ?? defaultScrollOptions.defaultBehaviour
    };
    setTimeout(() => {
      const selector = selectorType === "id" ? `#${id}` : id;
      const section = document.querySelector(selector);
      if (section) {
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - opts.offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: opts.behaviour
        });
      } else {
        console.error(`Section with id '${id}' not found.`);
      }
    }, 10);
  }
  function onScroll(event, options = {}) {
    event.preventDefault();
    const opts = {
      defaultOffset: options.defaultOffset ?? defaultScrollOptions.defaultOffset,
      defaultBehaviour: options.defaultBehaviour ?? defaultScrollOptions.defaultBehaviour
    };
    const link = event.target;
    if (!link)
      throw new Error(`Event target is undefined. Cannot scroll from an undefined link.`);
    const scrollId = link.getAttribute("href")?.slice(1) || link.getAttribute("scroll-to") || "";
    const offset = parseInt(link.getAttribute("scroll-offset") || `${opts.defaultOffset}`, 10);
    const behaviour = link.getAttribute("scroll-behaviour") || opts.defaultBehaviour;
    scrollToSection(scrollId, "id", { offset, behaviour });
  }
  function initCMSScrollLinks() {
    const cmsScrollLinks = document.querySelectorAll("a[data-href-scroll]");
    cmsScrollLinks.forEach((link) => {
      const hrefPrefix = link.dataset.hrefPrefix || "";
      const hrefScroll = link.dataset.hrefScroll || "";
      link.href = `${hrefPrefix}#${hrefScroll}`;
    });
  }
  function initGlobalScrollLinks() {
    const globalScrollLinks = document.querySelectorAll('a[data-global-scroll="true"]');
    const globalFiltered = Array.from(globalScrollLinks).filter((link) => {
      const url = new URL(link.href);
      return url.pathname === location.pathname;
    });
    globalFiltered.forEach((link) => {
      const url = new URL(link.href);
      link.href = url.hash;
    });
  }
  function disableWebflowScroll() {
    var Webflow = window.Webflow || [];
    Webflow.push(function() {
      $(function() {
        $(document).off("click.wf-scroll");
      });
    });
  }
  function overrideDefaultScroll(options = {}) {
    initCMSScrollLinks();
    initGlobalScrollLinks();
    const href = createAttribute("href");
    const allScrollLinks = document.querySelectorAll(`${href("#", { matchType: "startsWith" })}, [scroll-to]`);
    allScrollLinks.forEach((link) => {
      link.addEventListener("click", (event) => onScroll(event, options));
    });
  }
  function overrideWebflowScroll(options = {}) {
    disableWebflowScroll();
    overrideDefaultScroll(options);
  }

  // src/sanavita/ts/scroll.ts
  document.addEventListener("DOMContentLoaded", () => {
    overrideWebflowScroll({
      defaultOffset: 99,
      defaultBehaviour: "smooth"
    });
  });
})();
//# sourceMappingURL=scroll.js.map
