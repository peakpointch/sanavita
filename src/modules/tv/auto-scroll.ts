import {
  Attributes,
  Attribute,
  BaseAttributes,
  Dataset,
  Selector,
  getAllElements,
  mergeOptions,
} from "peakflow";
import { format } from "date-fns";

export type ScrollElement = "container" | "smooth-wrapper";

export type AutoScrollMode = "default" | "smooth" | "none";

export type AutoScrollModeOptions = Omit<AutoScrollOptions, "mode">;

export interface AutoScrollOptions {
  /** Unique identifier of this scroll container */
  id?: string;
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

export interface AutoScrollController {
  // /** True if the container has enough overflow to scroll, false otherwise */
  // enabled: boolean;

  get state(): ContainerState | null;

  /**
   * Starts the auto scroll animation and calls all initializers.
   */
  start(): void;

  /**
   * Stops the auto scroll animation and cleans up its side effects.
   */
  stop(): void;

  /**
   * Resumes the animation loop from the current position.
   */
  play(): void;

  /**
   * Suspends the animation loop without cleanup.
   */
  pause(): void;
}

export interface SyncGroup {
  total: number;
  readyCount: number;
  releasedCount: number;
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

const defaultAutoScrollOptions: AutoScrollOptions = {
  ...defaultModeOptions,
  mode: "default",
};

const warnNotImplemented = () => console.warn("Not implemented");

const defaultController: AutoScrollController = {
  // enabled: false,
  get state() {
    return null;
  },
  start: warnNotImplemented,
  stop: warnNotImplemented,
  play: warnNotImplemented,
  pause: warnNotImplemented,
};

const syncRegistry: SyncGroupMap = {};

function logStamp(ms: boolean = true): string {
  return format(new Date(), ms ? "MMM dd HH:mm:ss.SS" : "MMM dd HH:mm:ss");
}

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
  const wrapper = el.querySelector<HTMLElement>(selector("smooth-wrapper"));
  if (!wrapper) return;

  const type = wrapper.getAttribute(
    scrollDataset.attr.element
  ) as ScrollElement;

  if (type !== "smooth-wrapper") return;

  // Move all children back into the container
  while (wrapper.firstChild) {
    el.appendChild(wrapper.firstChild);
  }

  wrapper.remove();
}

function getSyncGroup(id: string | null): SyncGroup | null {
  if (!id) return null;
  if (!syncRegistry[id]) {
    syncRegistry[id] = {
      total: 0,
      readyCount: 0,
      pauseUntil: 0,
      releasedCount: 0,
    };
  }
  return syncRegistry[id];
}

function registerContainer(id: string) {
  if (id && syncRegistry[id]) {
    syncRegistry[id].total++;
  }
}

export function resetSyncRegistry(): void {
  for (const id in syncRegistry) {
    delete syncRegistry[id];
  }
}

function isWaiting(now: number, state: ContainerState): boolean {
  return now < state.pauseUntil;
}

function isWaitingForGroup(now: number, state: ContainerState): boolean {
  if (!state.group) return false;

  const groupIsPaused = now < state.group.pauseUntil;
  const waitingForOthers =
    state.isWaiting && state.group.readyCount < state.group.total;

  return groupIsPaused || waitingForOthers;
}

// =========================
// ========= Modes =========
// =========================

interface AutoScrollHooks {
  beforeAnimation?: (opts: AutoScrollModeOptions) => void;
  scrollAnimation: (opts: AutoScrollModeOptions, scrollPos: number) => void;
  destroyAnimation?: (opts: AutoScrollModeOptions) => void;
  onVisibilityChange?: (opts: AutoScrollModeOptions) => void;
}

interface ContainerState {
  direction: 1 | -1;
  group: SyncGroup | null;
  isEnabled: boolean;
  isWaiting: boolean;
  lastTime: DOMHighResTimeStamp;
  pauseUntil: number;
  rafId: number | null;
  relativeSpeed: number;
  scrollMax: number;
  scrollPos: number;
}

function initAutoScrollContainer(
  options: Partial<AutoScrollModeOptions>,
  hooks: AutoScrollHooks
): AutoScrollController {
  const opts = mergeOptions(
    defaultModeOptions,
    options
  ) as AutoScrollModeOptions;

  //@ts-expect-error state is fully initialized in start()
  let state: ContainerState = {};

  function tick(now: number) {
    // Math.min with 0.1s prevents visual jumps after a hardware freeze
    const delta = Math.min((now - state.lastTime) / 1000, 0.1);
    state.lastTime = now;

    if (isWaiting(now, state) || isWaitingForGroup(now, state)) {
      state.rafId = requestAnimationFrame(tick);
      return;
    } else {
      state.isWaiting = false;
      if (state.group && state.group.readyCount >= state.group.total) {
        state.group.releasedCount++;
        if (state.group.releasedCount >= state.group.total) {
          state.group.readyCount = 0;
          state.group.releasedCount = 0;
        }
      }
    }

    state.scrollPos += state.relativeSpeed * delta * state.direction;
    hooks.scrollAnimation(opts, state.scrollPos);

    let hit = false;
    if (state.direction === -1 && state.scrollPos <= 0) {
      hit = true; // Top boundary
      state.scrollPos = 0;
      state.direction = 1;
    } else if (state.direction === 1 && state.scrollPos >= state.scrollMax) {
      hit = true; // Bottom boundary
      state.scrollPos = state.scrollMax;
      state.direction = -1;
    }

    if (hit) {
      const finishTime = now + opts.pauseFor;
      state.isWaiting = true;

      if (state.group) {
        state.group.readyCount++;
        if (state.group.readyCount >= state.group.total) {
          state.group.pauseUntil = finishTime;
        }
      } else {
        state.pauseUntil = finishTime;
      }
    }

    state.rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (state.rafId === null) {
      state.lastTime = performance.now();
      state.rafId = requestAnimationFrame(tick);
    }
  }

  function pause() {
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }

  function handleVisibility(): void {
    if (document.hidden) {
      pause();
    } else {
      play();
    }
    hooks.onVisibilityChange?.(opts);
  }

  function start() {
    document.addEventListener("visibilitychange", handleVisibility);

    state = {
      ...state,
      direction: 1,
      group: getSyncGroup(opts.syncId),
      isWaiting: false,
      lastTime: performance.now(),
      pauseUntil: 0,
      rafId: null,
      relativeSpeed: opts.container.clientHeight * opts.speed,
      scrollMax: opts.container.scrollHeight - opts.container.clientHeight,
      scrollPos: opts.container.scrollTop,
    };

    state.isEnabled = state.scrollMax > Math.abs(opts.tolerance);

    if (!state.isEnabled) {
      opts.container.style.overflow = "hidden";
      return;
    }

    if (state.group) registerContainer(opts.syncId);

    opts.container.style.removeProperty("overflow");
    hooks.beforeAnimation?.(opts);
    play();
  }

  function stop() {
    pause();
    document.removeEventListener("visibilitychange", handleVisibility);
    if (state.group) state.group.total--;
    hooks.destroyAnimation?.(opts);
  }

  state.scrollMax = opts.container.scrollHeight - opts.container.clientHeight;
  state.isEnabled = state.scrollMax > Math.abs(opts.tolerance);

  // Set up initial state
  if (!state.isEnabled) {
    opts.container.style.overflow = "hidden";
  } else {
    opts.container.style.removeProperty("overflow");
  }

  return {
    get state() {
      return state;
    },
    play,
    pause,
    start,
    stop,
  };
}

/**
 * Default mode: uses scrollTop (pixel-based, may jump at low speed)
 */
function autoScrollDefault(
  options: Partial<AutoScrollModeOptions>
): AutoScrollController {
  const scrollAnimation = (opts: AutoScrollModeOptions, scrollPos: number) => {
    opts.container.scrollTop = scrollPos;

    if (opts.scrollbar.hide) {
      opts.container.style.overflow = "hidden";
    }
  };

  const hooks: AutoScrollHooks = {
    scrollAnimation,
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

  const opts = mergeOptions(
    defaultAutoScrollOptions,
    scrollDataset.parse(options.container),
    autoScrollDataset.parse(options.container),
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

export interface InitAutoScrollOptions
  extends Partial<Omit<AutoScrollOptions, "id" | "container">> {
  doc: Document | Element;
}

/** Initialize auto-scroll on all matching elements in doc */
export function initAutoScroll(options: InitAutoScrollOptions): void {
  if (!options.doc) {
    throw new Error(msg(`"doc" cannot be undefined.`));
  }

  const sel = selector("container") + autoScrollAttr();
  const containers = getAllElements(sel, {
    node: options.doc,
  });

  for (const container of containers) {
    autoScroll({ ...options, container });
  }
}
