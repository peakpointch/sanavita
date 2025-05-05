(() => {
  // src/ts/phra-nakhon-localization.ts
  var wfLocalizationAttr = "data-wf-localization";
  function readLocale() {
    const langSwitcher = document.querySelector(`[${wfLocalizationAttr}="dropdown"]`);
    const locale = langSwitcher?.dataset?.wfLocale ?? null;
    const fallbackLocale = document.documentElement.getAttribute("lang");
    return locale || fallbackLocale;
  }
  function initializeLocale() {
    const parsedLocale = readLocale();
    const storedLocale = getLocale();
    const locale = storedLocale !== parsedLocale ? parsedLocale : storedLocale;
    if (!locale) {
      throw new Error(`Couldn't initialize locale: No valid locale was found.`);
    }
    setLocale(locale);
    const event = new CustomEvent("wfLocaleReady");
    document.dispatchEvent(event);
  }
  function getLocale() {
    return localStorage.getItem("wfLocale");
  }
  function setLocale(locale) {
    localStorage.setItem("wfLocale", locale);
  }
  function setupLocaleSwitcher() {
    getLocaleLinks(document).forEach((anchor) => {
      anchor.addEventListener("click", (event) => updateLocale(event, anchor));
    });
  }
  function getLocaleLinks(container) {
    return Array.from(container.querySelectorAll(`a[hreflang]`));
  }
  function updateLocale(event, target) {
    event.preventDefault();
    if (!target) {
      throw new Error(`The event target is undefined.`);
    } else if (!(target instanceof HTMLAnchorElement)) {
      throw new TypeError(`The event target is not of type "HTMLAnchorElement".`);
    }
    let locale = target.hreflang;
    if (!locale || locale === "") {
      throw new Error(`The locale read from the anchors "hreflang" property is undefined.`);
    }
    setLocale(locale);
    window.location.href = target.href;
  }
  document.addEventListener("DOMContentLoaded", () => {
    initializeLocale();
    const locale = getLocale();
    setupLocaleSwitcher();
  });
})();
