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

type NodeMatcher = (ctx: RefreshNodeContext) => boolean;

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

  const list = new CollectionList(node, { name: readId(node) });
  const refreshList = new CollectionList(newNode, { name: readId(newNode) });

  if (list.empty || refreshList.empty) {
    // If either list is empty, refresh the whole list wrapper
    return defaultRefresh(node, newNode) as HTMLElement;
  }

  // Default case: only refresh the list items
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
  /**
   * Specify the nodes to refresh.
   * - An array of strings matching node ids
   * - A custom function taking a context and returning a boolean.
   *   True means the node will get refreshed.
   */
  nodes?: string[] | NodeMatcher;
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

    if (Array.isArray(opts.nodes)) {
      if (!opts.nodes.includes(id)) return;
    } else if (typeof opts.nodes === "function") {
      if (!opts.nodes(ctx)) return;
    }

    const userCtx = opts.beforeRefresh(ctx);
    const newCtx = validateContext(userCtx) ? userCtx : ctx;

    try {
      // Refresh the current node with the new node
      newCtx.newNode = refreshNode(newCtx.node, newCtx.newNode);
    } catch (error) {
      console.error(error);
    }

    opts.afterRefresh(newCtx);
  });
}

interface RefreshOwnOptions {
  /**
   * Specify the nodes to refresh.
   * - An array of strings matching node ids
   * - A custom function taking a context and returning a boolean.
   *   True means the node will get refreshed.
   */
  nodes?: string[] | NodeMatcher;
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
  const newDoc = await fetchOwnDocument(
    `${location.pathname}?ts=${Date.now()}`,
    {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }
  );

  const ctx: RefreshContext = {
    doc,
    newDoc,
  };

  const userCtx = opts.beforeRefresh(ctx);
  const newCtx = validateContext(userCtx) ? userCtx : ctx;

  refreshNodes(newCtx.doc.body, newCtx.newDoc.body, {
    nodes: opts.nodes,
    beforeRefresh: opts.beforeNodeRefresh,
    afterRefresh: opts.afterNodeRefresh,
  });

  opts.afterRefresh(newCtx);
}

// ==============================
//              Auto
// ==============================

interface AutoRefreshOptions {
  /**
   * Specify the nodes to refresh.
   * - An array of strings matching node ids
   * - A custom function taking a context and returning a boolean.
   *   True means the node will get refreshed.
   */
  nodes?: string[] | NodeMatcher;
  afterRefresh: RefreshCallback<RefreshContext>;
  afterNodeRefresh: RefreshCallback<RefreshNodeContext>;
  beforeRefresh: RefreshCallback<RefreshContext>;
  beforeNodeRefresh: RefreshCallback<RefreshNodeContext>;

  /** Amount of time in seconds before refreshing again. Default: 60 */
  delay: number;
  /** Amount of time in seconds before re-trying in case a refresh failed. */
  retryAfter: number;
  retry: boolean;
  maxRetries: number;
}

const defaultAutoRefreshOptions: AutoRefreshOptions = {
  beforeRefresh: () => undefined,
  afterRefresh: () => undefined,
  beforeNodeRefresh: (ctx) => ctx,
  afterNodeRefresh: (ctx) => ctx,
  delay: 60,
  retryAfter: 15,
  retry: true,
  maxRetries: 3,
};

function autoRefresh(options?: Partial<AutoRefreshOptions>): number {
  const opts = mergeOptions(defaultAutoRefreshOptions, options);

  /** Count amount of times a*/
  let failed: number = 0;

  const refreshCore = () => refreshOwnNodes(opts);

  const refresh = async () => {
    try {
      await refreshCore();
      failed = 0;
    } catch (error) {
      failed++;

      if (opts.retry && failed <= opts.maxRetries) {
        console.error(
          `Auto refresh failed ${failed}x. Trying again in ${opts.retryAfter}s`
        );
        //@ts-ignore
        setTimeout(refresh, opts.retryAfter * 1000);
      } else {
        console.error(`Auto refresh failed ${failed}x.`);
      }
    } finally {
      window.tv.failed = failed;
    }
  };

  window.tv = {
    ...window.tv,
    refresh,
    refreshCore,
    failed,
  };

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
