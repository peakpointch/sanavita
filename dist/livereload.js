// livereload/livereload.js
var pageIframe = document.getElementById("site-iframe-next") || null;
var page = pageIframe ? pageIframe.contentDocument || pageIframe.contentWindow.document : document;
var liveSource;
var webflow = window ? {
  designer: location.href.includes("design"),
  development: location.href.includes("webflow"),
  staging: location.href.includes("webflow") && !location.href.includes("design")
} : {};
var Script = class {
  constructor(src, emptyAttribute) {
    this.element = document.createElement("script");
    this.element.setAttribute(emptyAttribute, "");
    this.element.src = src;
  }
  addAttribute(name, value) {
    this.element.setAttribute(name, value);
  }
};
function scriptExists(src) {
  const allPageScripts = Array.from(page.getElementsByTagName("script"));
  const scripts = allPageScripts.some((script) => script.src.split("?")[0] === src);
  return scripts;
}
function appendDevScripts(sources) {
  sources.forEach((file) => {
    let src = `http://localhost:3000/assets/${file}`;
    if (!scriptExists(src)) {
      let script = new Script(src, "data-dyn-js");
      script.addAttribute("data-dyn-js", true);
      page.body.appendChild(script.element);
    }
  });
}
function reloadCSS() {
  const links = page.querySelectorAll('[data-dyn-css="true"]');
  links.forEach((link) => {
    const href = link.getAttribute("href");
    const newHref = href.split("?")[0] + "?reload=" + (/* @__PURE__ */ new Date()).getTime();
    link.setAttribute("href", newHref);
  });
}
function reloadJS() {
  const scripts = page.querySelectorAll('[data-dyn-js="true"]');
  scripts.forEach((script) => {
    if (script) {
      const src = script.getAttribute("src");
      const parentNode = script.parentNode;
      script.parentNode.removeChild(script);
      const newSrc = src.split("?")[0] + "?reload=" + (/* @__PURE__ */ new Date()).getTime();
      let newScript = new Script(newSrc, "data-dyn-js");
      newScript.addAttribute("data-dyn-js", true);
      parentNode.appendChild(newScript.element);
    }
  });
}
function activateLiveReload() {
  try {
    liveSource = new EventSource("http://localhost:3001");
    liveSource.onmessage = (event) => {
      if (event.data === "reload") {
        console.log("RELOAD " + (/* @__PURE__ */ new Date()).getTime());
        reloadCSS();
        reloadJS();
      }
    };
    console.log("Live reload is active.");
    liveSource.onerror = (error) => {
      console.error("Error connecting to live reload server:", error);
      setTimeout(deactivateLiveReload, 200);
    };
  } catch (error) {
    console.error("Failed to initialize live reload:", error);
    setTimeout(deactivateLiveReload, 200);
  }
}
function deactivateLiveReload() {
  if (liveSource) {
    liveSource.close();
    console.log("Live reload deactivated.");
  } else {
    console.log("Live reload was not active.");
  }
}
if (webflow && webflow.designer) {
  parent.activateLiveReload = activateLiveReload;
  const scripts = ["dynamic.js", "copy.js"];
  appendDevScripts(scripts);
  activateLiveReload();
} else if (webflow && webflow.staging) {
  document.addEventListener("DOMContentLoaded", activateLiveReload);
}
window.liveSource = liveSource;
window.activateLiveReload = activateLiveReload;
window.deactivateLiveReload = deactivateLiveReload;
