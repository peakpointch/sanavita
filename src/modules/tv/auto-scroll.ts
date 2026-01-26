import {
  Attributes,
  Attribute,
  BaseAttributes,
  Dataset,
  DatasetAttributes,
  Selector,
  exclude,
  getAllElements,
  mergeOptions,
  ScrollHandler,
} from "peakflow";

export type ScrollElement = "container" | "smooth-wrapper";

export type AutoScrollMode = "default" | "smooth" | "none";

export type AutoScrollModeOptions = Omit<AutoScrollOptions, "mode">;

export interface AutoScrollOptions {
  scrollbar: {
    animate?: boolean;
    hide?: boolean;
  };
  container: HTMLElement | null;
  speed: number;
  pauseFor: number;
  /** Amount of overflow in px to allow */
  tolerance: number;
  /** Mode: 'scroll' uses scrollTop, 'transform' uses CSS transform for smooth motion */
  mode?: AutoScrollMode;
}

interface AutoScrollController {
  destroy(): void;
}

interface ScrollAttributes extends BaseAttributes {
  element: Attribute<string, ScrollElement>;
}

interface AutoScrollAttributes extends Attributes {
  mode: Attribute<string, AutoScrollMode>;
  speed: Attribute<string, number>;
  tolerance: Attribute<string, number>;
}

const scrollDataset = Dataset.define<ScrollAttributes>({
  id: "data-scroll-id",
  element: "data-scroll-element",
});

const autoScrollDataset = Dataset.define<AutoScrollAttributes>({
  mode: Dataset.String("data-auto-scroll"),
  speed: Dataset.Number("data-speed"),
  tolerance: Dataset.Number("data-tolerance"),
});

const selector = Selector.attr<ScrollElement>(scrollDataset.attr.element);
const autoScrollAttr = Selector.attr<AutoScrollMode>(
  autoScrollDataset.attr.mode
);

const defaultModeOptions: AutoScrollModeOptions = {
  scrollbar: {
    animate: false,
    hide: false,
  },
  container: null,
  speed: 5,
  pauseFor: 0,
  tolerance: 0,
};

const defaultOptions: AutoScrollOptions = {
  ...defaultModeOptions,
  mode: "default",
};

const defaultController: AutoScrollController = {
  destroy() {},
};

const logPrefix = `AutoScroll: `;
function msg(message: string) {
  return `${logPrefix}${message}`;
}

/** Wraps all children of el in a wrapper div for transform mode */
function wrapSmooth(el: HTMLElement): HTMLElement {
  let wrapper = el.querySelector<HTMLElement>(selector("smooth-wrapper"));
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.setAttribute(scrollDataset.attr.element, "smooth-wrapper");

    // Move all children into wrapper
    while (el.firstChild) {
      wrapper.appendChild(el.firstChild);
    }

    el.appendChild(wrapper);
    wrapper.style.willChange = "transform";
  }
  return wrapper;
}

function unwrapSmooth(el: HTMLElement): void {
  const wrapper = el.parentElement;
  const type = wrapper.getAttribute(
    scrollDataset.attr.element
  ) as ScrollElement;

  if (type !== "smooth-wrapper") return;

  wrapper.replaceWith(el);
}

// =========================
// ========= Modes =========
// =========================

/**
 * Default mode: uses scrollTop (pixel-based, may jump at low speed)
 */
function autoScrollDefault(
  options: Partial<AutoScrollModeOptions>
): AutoScrollController {
  const opts = mergeOptions(
    defaultModeOptions,
    options
  ) as AutoScrollModeOptions;

  const el = opts.container;

  const maxScroll = el.scrollHeight - el.clientHeight;
  if (maxScroll <= Math.abs(opts.tolerance)) {
    el.style.overflow = "hidden";
    return;
  }

  let scrollPos = el.scrollTop;
  let direction: 1 | -1 = 1;
  let lastTime = performance.now();
  let pauseUntil = 0; // timestamp until which we pause
  let rafId: number;

  function tick(now: number) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    if (now < pauseUntil) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    scrollPos += opts.speed * delta * direction;

    if (scrollPos >= maxScroll) {
      scrollPos = maxScroll;
      direction = -1;
      pauseUntil = now + opts.pauseFor; // pause at bottom
    }

    if (scrollPos <= 0) {
      scrollPos = 0;
      direction = 1;
      pauseUntil = now + opts.pauseFor; // pause at top
    }

    if (opts.scrollbar.hide) {
      el.style.overflow = "hidden";
    }

    el.scrollTop = scrollPos;
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
    },
  };
}

/** Smooth mode: wraps content and moves with CSS transform (smooth sub-pixel) */
function autoScrollSmooth(
  options: Partial<AutoScrollModeOptions>
): AutoScrollController {
  const opts = mergeOptions(
    defaultModeOptions,
    options
  ) as AutoScrollModeOptions;

  const el = opts.container;
  const wrapper = wrapSmooth(el);

  const maxScroll = el.scrollHeight - el.clientHeight;
  if (maxScroll <= Math.abs(opts.tolerance)) {
    el.style.overflow = "hidden";
    return;
  }

  let scrollPos = 0;
  let direction: 1 | -1 = 1;
  let lastTime = performance.now();
  let pauseUntil = 0; // timestamp until which we pause
  let rafId: number;

  function tick(now: number) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    if (now < pauseUntil) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    scrollPos += opts.speed * delta * direction;

    if (scrollPos >= maxScroll) {
      scrollPos = maxScroll;
      direction = -1;
      pauseUntil = now + opts.pauseFor; // pause at bottom
    }

    if (scrollPos <= 0) {
      scrollPos = 0;
      direction = 1;
      pauseUntil = now + opts.pauseFor; // pause at top
    }

    wrapper.style.transform = `translateY(${-scrollPos}px)`;

    if (opts.scrollbar.hide) {
      el.style.overflow = "hidden";
    } else if (opts.scrollbar.animate) {
      el.scrollTop = scrollPos; // sync scrollbar
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      unwrapSmooth(el);
    },
  };
}

/** Main autoScroll dispatcher */
export function autoScroll(
  options: Partial<AutoScrollOptions>
): AutoScrollController {
  if (!options?.container) {
    throw new Error(msg("Container cannot be undefined"));
  }

  const dataset = autoScrollDataset.parse(options.container);

  const opts = mergeOptions(
    defaultOptions,
    dataset,
    options
  ) as AutoScrollOptions;

  let controller: AutoScrollController;

  switch (opts.mode) {
    case "smooth":
      controller = autoScrollSmooth(opts);
      break;

    //@ts-ignore
    case "":
    case "default":
      controller = autoScrollDefault(opts);
      break;

    case "none":
    // Identical with default

    default:
      controller = defaultController;
      break;
  }

  return controller;
}

export interface InitAutoScrollOptions extends Partial<AutoScrollOptions> {
  doc: Document | Element;
}

/** Initialize auto-scroll on all matching elements in doc */
export function initAutoScroll(options: InitAutoScrollOptions): void {
  const opts = mergeOptions(defaultOptions, options) as InitAutoScrollOptions;

  if (!opts.doc) {
    throw new Error(msg(`"doc" cannot be undefined.`));
  }

  const sel = selector("container") + autoScrollAttr();
  const containers = getAllElements(sel, {
    node: opts.doc,
  });

  for (const container of containers) {
    autoScroll({ ...opts, container });
  }
}
