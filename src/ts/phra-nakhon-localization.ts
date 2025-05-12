import createAttribute from "@peakflow/attributeselector";

// type LocalizationElements = 'dropdown' | 'trigger' | 'list';
// const localizationSelector = createAttribute<LocalizationElements>('data-wf-localization');

type LocaleString = string;

const wfLocalizationAttr = 'data-wf-localization';
const wfLocaleAttr = 'data-wf-locale';


/**
 * Runs when `localeStorage.wfLocale` is not yet initialized.
 */
function readLocale(): LocaleString {
  const langSwitcher = document.querySelector<HTMLElement>(`[${wfLocalizationAttr}="dropdown"]`);
  const locale = langSwitcher?.dataset?.wfLocale ?? null;
  const fallbackLocale = document.documentElement.getAttribute('lang');

  return locale || fallbackLocale;
}

function initializeLocale(): void {
  const parsedLocale = readLocale();
  const storedLocale = getLocale();

  const locale = storedLocale !== parsedLocale ? parsedLocale : storedLocale;

  if (!locale) {
    throw new Error(`Couldn't initialize locale: No valid locale was found.`);
  }

  setLocale(locale);

  const event = new CustomEvent('wfLocaleReady');
  document.dispatchEvent(event);
}

function getLocale(): LocaleString {
  return localStorage.getItem('wfLocale');
}

function setLocale(locale: LocaleString): void {
  localStorage.setItem('wfLocale', locale);
}

function setupLocaleSwitcher(): void {
  getLocaleLinks(document).forEach(anchor => {
    anchor.addEventListener('click', (event) => updateLocale(event, anchor));
  });
}

function getLocaleLinks(container: HTMLElement | Document): HTMLAnchorElement[] {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>(`a[hreflang]`));
}

function updateLocale(event: Event, target: HTMLAnchorElement): void {
  event.preventDefault();

  if (!target) {
    throw new Error(`The event target is undefined.`);
  } else if (!(target instanceof HTMLAnchorElement)) {
    throw new TypeError(`The event target is not of type "HTMLAnchorElement".`);
  }

  let locale: LocaleString = target.hreflang;

  if (!locale || locale === '') {
    throw new Error(`The locale read from the anchors "hreflang" property is undefined.`);
  }

  setLocale(locale);

  window.location.href = target.href;
}

document.addEventListener('DOMContentLoaded', () => {
  initializeLocale();

  const locale = getLocale();

  setupLocaleSwitcher();
});
