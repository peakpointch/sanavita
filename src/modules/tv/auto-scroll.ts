import {
  Attributes,
  Attribute,
  BaseAttributes,
  Dataset,
  Selector,
  getAllElements,
  mergeOptions,
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

  /**
   * Percentage of the container's height scrolled per second
   * @example 0.1 // Scrolls 10% of the visible height every second
   */
  speed: number;
  pauseFor: number;
  /** Amount of overflow in px to allow */
  tolerance: number;
  /** Mode: 'scroll' uses scrollTop, 'transform' uses CSS transform for smooth motion */
  mode?: AutoScrollMode;
  syncId?: string;
}

interface AutoScrollController {
  destroy(): void;
}

export interface SyncGroup {
  total: number;
  readyCount: number;
  // direction: 1 | -1;
  pauseUntil: number;
}

export type SyncGroupMap = Record<string, SyncGroup>;

interface ScrollAttributes extends BaseAttributes {
  element: Attribute<string, ScrollElement>;
}

interface AutoScrollAttributes extends Attributes {
  mode: Attribute<string, AutoScrollMode>;
  speed: Attribute<string, number>;
  tolerance: Attribute<string, number>;
  syncId: Attribute<string, string>;
}

const scrollDataset = Dataset.define<ScrollAttributes>({
  id: "data-scroll-id",
  element: "data-scroll-element",
});

const autoScrollDataset = Dataset.define<AutoScrollAttributes>({
  mode: Dataset.String("data-auto-scroll"),
  speed: Dataset.Number("data-speed"),
  tolerance: Dataset.Number("data-tolerance"),
  syncId: Dataset.String("data-auto-scroll-sync-id"),
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

const syncRegistry: SyncGroupMap = {};

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

function getSyncGroup(id: string | null): SyncGroup | null {
  if (!id) return null;
  if (!syncRegistry[id]) {
    syncRegistry[id] = { total: 0, readyCount: 0, pauseUntil: 0 };
  }
  return syncRegistry[id];
}

function registerContainer(id: string) {
  if (id && syncRegistry[id]) {
    syncRegistry[id].total++;
  }
}

// =========================
// ========= Modes =========
// =========================

interface AutoScrollHooks {
  beforeAnimation: (opts: AutoScrollModeOptions) => void;
  scrollAnimation: (opts: AutoScrollModeOptions, scrollPos: number) => void;
  destroyAnimation: (opts: AutoScrollModeOptions) => void;
}

function initAutoScrollContainer(
  options: Partial<AutoScrollModeOptions>,
  hooks: AutoScrollHooks
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

  const group = getSyncGroup(opts.syncId);
  if (group) registerContainer(opts.syncId);

  let scrollPos = el.scrollTop;
  let direction: 1 | -1 = 1;
  let lastTime = performance.now();
  let localPauseUntil = 0;
  let isWaiting = false;
  let rafId: number;

  const relativeSpeed = el.clientHeight * opts.speed;

  hooks.beforeAnimation(opts);

  function tick(now: number) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    if (now < localPauseUntil || (group && now < group.pauseUntil)) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    if (isWaiting && group) {
      if (group.readyCount < group.total && group.readyCount !== 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      isWaiting = false;
    }

    scrollPos += relativeSpeed * delta * direction;

    hooks.scrollAnimation(opts, scrollPos);

    let hit = false;
    if (scrollPos >= maxScroll) {
      scrollPos = maxScroll;
      direction = -1;
      hit = true; // Bottom boundary
    } else if (scrollPos <= 0) {
      scrollPos = 0;
      direction = 1;
      hit = true; // Top boundary
    }

    if (hit) {
      const finishTime = now + opts.pauseFor;

      if (group) {
        isWaiting = true;
        group.readyCount++;
        if (group.readyCount === group.total) {
          group.pauseUntil = finishTime;
          group.readyCount = 0;
          isWaiting = false;
        }
      } else {
        localPauseUntil = finishTime;
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      if (group) group.total--;
      hooks.destroyAnimation(opts);
    },
  };
}

/**
 * Default mode: uses scrollTop (pixel-based, may jump at low speed)
 */
function autoScrollDefault(
  options: Partial<AutoScrollModeOptions>
): AutoScrollController {
  const beforeAnimation = (/*opts: AutoScrollModeOptions*/) => {
    // No setup needed
  };

  const scrollAnimation = (opts: AutoScrollModeOptions, scrollPos: number) => {
    opts.container.scrollTop = scrollPos;

    if (opts.scrollbar.hide) {
      opts.container.style.overflow = "hidden";
    }
  };

  const destroyAnimation = (opts: AutoScrollModeOptions) => {
    unwrapSmooth(opts.container);
  };

  const hooks: AutoScrollHooks = {
    beforeAnimation,
    scrollAnimation,
    destroyAnimation,
  };

  return initAutoScrollContainer(options, hooks);
}

/** Smooth mode: wraps content and moves with CSS transform (smooth sub-pixel) */
function autoScrollSmooth(
  options: Partial<AutoScrollModeOptions>
): AutoScrollController {
  let wrapper: HTMLElement;

  const beforeAnimation = (opts: AutoScrollModeOptions) => {
    wrapper = wrapSmooth(opts.container);
  };

  const scrollAnimation = (opts: AutoScrollModeOptions, scrollPos: number) => {
    wrapper.style.transform = `translateY(${-scrollPos}px)`;

    if (opts.scrollbar.hide) {
      opts.container.style.overflow = "hidden";
    } else if (opts.scrollbar.animate) {
      opts.container.scrollTop = scrollPos; // sync scrollbar
    }
  };

  const destroyAnimation = (opts: AutoScrollModeOptions) => {
    unwrapSmooth(opts.container);
  };

  const hooks: AutoScrollHooks = {
    beforeAnimation,
    scrollAnimation,
    destroyAnimation,
  };

  return initAutoScrollContainer(options, hooks);
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
