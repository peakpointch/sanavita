import {
  CollectionList,
  Selector,
  Slider,
  fetchOwnDocument,
  getAllElements,
  mergeOptions,
  wf,
} from "peakflow";
import Swiper from "swiper";

type RefreshMode = "default" | "document" | "cms" | "swiper";

type RefreshCallback<T extends BaseContext> = (ctx: T) => T | void;

interface BaseContext {
  [x: string]: unknown;
}

interface RefreshNodeContext extends BaseContext {
  id: string | null;
  mode: RefreshMode;
  node: Element;
  newNode: Element;
}

interface RefreshContext extends BaseContext {
  doc: Document;
  newDoc: Document;
}

interface SwiperHTMLElement extends HTMLElement {
  swiper: Swiper;
}

const attr = {
  id: "data-refresh-id",
  mode: "data-refresh-mode",
  clone: "data-refresh-clone",
};

const selector = Selector.attr(attr.id);

const warning = {
  idNotDefined: "Refresh: A node must specify a valid id. Skipping node...",
};

const error = {
  modeNotImplemented: (mode?: string) =>
    new Error(
      `Refresh: mode ${mode ? `"${mode} "` : ""}is not yet implemented`
    ),
  modeNotDefined: (mode?: string) =>
    new Error(`Refresh: mode ${mode ? `"${mode} "` : ""}does not exist`),
};

// ==============================
//      Mode Implementations
// ==============================

function defaultRefresh(node: Element, newNode: Element): Element {
  const cloned = newNode.cloneNode(true) as Element;

  node.replaceWith(cloned);

  return cloned;
}

function documentRefresh(node: Element, newNode: Element): Element {
  throw error.modeNotImplemented("document");
}

function cmsRefresh(node: Element, newNode: Element): HTMLElement {
  if (!isHTMLElement(node) || !isHTMLElement(newNode)) {
    throw new Error(
      `Refresh: Both 'node' and 'newNode' have to be of type 'HTMLElement' in "cms" mode.`
    );
  }

  const list = new CollectionList(node);
  const refreshList = new CollectionList(newNode);

  list.listElement.replaceChildren(...refreshList.getItems());

  return list.container;
}

function swiperRefresh(node: Element, newNode: Element): HTMLElement {
  if (!isSwiperElement(node) || !isSwiperElement(newNode)) {
    throw new Error(
      `Refresh: Both 'node' and 'newNode' have to be a '[data-swiper-element="component"]' element in "swiper" mode.`
    );
  }

  const swiper = node.swiper;
  const newWrapper = newNode.querySelector(Slider.selector("wrapper"));
  const newSlides = Array.from(newWrapper.children) as HTMLElement[];

  if (typeof swiper.removeAllSlides !== "function") {
    throw new Error(
      `Refresh: Refresheable swiper instances must be instantiated with the module "Manipulation".`
    );
  }

  swiper.removeAllSlides();

  for (const slide of newSlides) {
    swiper.appendSlide(slide);
  }

  swiper.update();

  return newNode;
}

// ==============================
//             Helpers
// ==============================

function readId(element: Element): string | null {
  return element.getAttribute(attr.id) ?? null;
}

function readMode(element: Element): RefreshMode {
  return (element.getAttribute(attr.mode) as RefreshMode) || "default";
}

function readCloneNode(element: Element): boolean | null {
  return element.hasAttribute(attr.clone)
    ? wf.hasAttr(element, attr.clone)
    : null;
}

function isHTMLElement(element: Node): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isSwiperElement(element: Node): element is SwiperHTMLElement {
  return (
    element &&
    element instanceof HTMLElement &&
    element.hasAttribute(Slider.attr.element)
  );
}

function validateContext<T extends BaseContext>(ctx?: T | void): ctx is T {
  if (!ctx) return false;

  // Validate RefreshNodeContext
  if (Boolean(ctx.node) && Boolean(ctx.newNode)) return true;

  // Validate RefreshContext
  if (Boolean(ctx.container) && Boolean(ctx.newContainer)) return true;

  return false;
}

function mapNodesById<T extends Element>(nodes: T[]): Map<string, T> {
  const map = new Map<string, T>();

  for (const node of nodes) {
    const id = readId(node);

    if (!id) continue;

    map.set(id, node);
  }

  return map;
}

// ==============================
//              Main
// ==============================

interface RefreshNodeOptions {
  cloneNode?: boolean;
  modeOverride?: RefreshMode;
}

const defaultRefreshNodeOptions: RefreshNodeOptions = {
  cloneNode: false,
  modeOverride: undefined,
};

function refreshNode<T extends Element>(
  node: T,
  newNode: T,
  options?: Partial<RefreshNodeOptions>
): T {
  const opts = mergeOptions(defaultRefreshNodeOptions, options);
  const mode = opts.modeOverride ?? readMode(node);

  opts.cloneNode = options?.cloneNode ?? readCloneNode(node) ?? opts.cloneNode;
  const cloned = newNode.cloneNode(true) as Element;
  const finalNewNode = opts.cloneNode ? cloned : newNode;

  let result: Element;

  switch (mode) {
    case "cms":
      result = cmsRefresh(node, finalNewNode);
      break;

    case "swiper":
      result = swiperRefresh(node, finalNewNode);
      break;

    case "document":
      debugger;
      result = documentRefresh(node, finalNewNode);
      break;

    case "default":
      result = defaultRefresh(node, finalNewNode);
      break;

    default:
      throw error.modeNotDefined(mode);
  }

  return result as T;
}

interface RefreshNodesOptions {
  beforeRefresh: RefreshCallback<RefreshNodeContext>;
  afterRefresh: RefreshCallback<RefreshNodeContext>;
}

const defaultRefreshNodesOptions: RefreshNodesOptions = {
  beforeRefresh: (ctx) => ctx,
  afterRefresh: (ctx) => ctx,
};

function refreshNodes(
  container: Document | Element,
  newContainer: Document | Element,
  options?: Partial<RefreshNodesOptions>
): void {
  const opts = mergeOptions(defaultRefreshNodesOptions, options);

  const nodes = getAllElements(selector(), { node: container });
  const newNodes = getAllElements(selector(), { node: newContainer });

  // Improved performance
  const newNodesMapped = mapNodesById(newNodes);

  nodes.forEach((node) => {
    const id = readId(node);
    if (!id) {
      console.warn(warning.idNotDefined);
      return;
    }

    const ctx: RefreshNodeContext = {
      id,
      mode: readMode(node),
      node: node,
      newNode: newNodesMapped.get(id),
    };

    const valid = validateContext(ctx);
    if (!valid) {
      const val = (ctx || {}) as any;
      console.warn(
        `Refresh: Invalid context for element with id "${val.id}" in mode "${val.mode}"`
      );
      return;
    }

    const userCtx = opts.beforeRefresh(ctx);
    const newCtx = validateContext(userCtx) ? userCtx : ctx;

    // Refresh the current node with the new node
    const insertedNode = refreshNode(newCtx.node, newCtx.newNode);

    opts.afterRefresh({
      ...newCtx,
      newNode: insertedNode,
    });
  });
}

interface RefreshOwnOptions {
  afterRefresh: RefreshCallback<RefreshContext>;
  afterNodeRefresh: RefreshCallback<RefreshNodeContext>;
  beforeRefresh: RefreshCallback<RefreshContext>;
  beforeNodeRefresh: RefreshCallback<RefreshNodeContext>;
}

async function refreshOwnNodes(
  options?: Partial<RefreshOwnOptions>
): Promise<void> {
  const opts = mergeOptions(defaultAutoRefreshOptions, options);
  const doc = document;
  const newDoc = await fetchOwnDocument(location.pathname);

  const ctx: RefreshContext = {
    doc,
    newDoc,
  };

  const userCtx = opts.beforeRefresh(ctx);
  const newCtx = validateContext(userCtx) ? userCtx : ctx;

  refreshNodes(newCtx.doc.body, newCtx.newDoc.body, {
    beforeRefresh: opts.beforeNodeRefresh,
    afterRefresh: opts.afterNodeRefresh,
  });

  opts.afterRefresh(newCtx);
}

// ==============================
//              Auto
// ==============================

interface AutoRefreshOptions {
  afterRefresh: RefreshCallback<RefreshContext>;
  afterNodeRefresh: RefreshCallback<RefreshNodeContext>;
  beforeRefresh: RefreshCallback<RefreshContext>;
  beforeNodeRefresh: RefreshCallback<RefreshNodeContext>;

  /** Amount of time in seconds before refreshing again. Default: 60 */
  delay: number;
}

const defaultAutoRefreshOptions: AutoRefreshOptions = {
  beforeRefresh: () => undefined,
  afterRefresh: () => undefined,
  beforeNodeRefresh: (ctx) => ctx,
  afterNodeRefresh: (ctx) => ctx,
  delay: 60,
};

function autoRefresh(options?: Partial<AutoRefreshOptions>): number {
  const opts = mergeOptions(defaultAutoRefreshOptions, options);

  const refresh = () => refreshOwnNodes(opts);

  window.tv.refresh = refresh;

  //@ts-ignore
  return setInterval(
    refresh,
    opts.delay * 1000 // Refresh delay in seconds
  );
}

export {
  // Ready
  autoRefresh,
  refreshOwnNodes,

  // Main
  refreshNodes,
  refreshNode,

  // Core
  defaultRefresh,
  documentRefresh,
  cmsRefresh,

  // Helpers
  readId,
  readMode,
};

export type { RefreshMode, RefreshNodeOptions };
