(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/validator/lib/util/assertString.js
  var require_assertString = __commonJS({
    "node_modules/validator/lib/util/assertString.js"(exports, module) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = assertString;
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function assertString(input) {
        var isString = typeof input === "string" || input instanceof String;
        if (!isString) {
          var invalidType = _typeof(input);
          if (input === null) invalidType = "null";
          else if (invalidType === "object") invalidType = input.constructor.name;
          throw new TypeError("Expected a string but received a ".concat(invalidType));
        }
      }
      module.exports = exports.default;
      module.exports.default = exports.default;
    }
  });

  // node_modules/validator/lib/util/checkHost.js
  var require_checkHost = __commonJS({
    "node_modules/validator/lib/util/checkHost.js"(exports, module) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = checkHost;
      function isRegExp(obj) {
        return Object.prototype.toString.call(obj) === "[object RegExp]";
      }
      function checkHost(host, matches) {
        for (var i = 0; i < matches.length; i++) {
          var match = matches[i];
          if (host === match || isRegExp(match) && match.test(host)) {
            return true;
          }
        }
        return false;
      }
      module.exports = exports.default;
      module.exports.default = exports.default;
    }
  });

  // node_modules/validator/lib/util/merge.js
  var require_merge = __commonJS({
    "node_modules/validator/lib/util/merge.js"(exports, module) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = merge;
      function merge() {
        var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var defaults = arguments.length > 1 ? arguments[1] : void 0;
        for (var key in defaults) {
          if (typeof obj[key] === "undefined") {
            obj[key] = defaults[key];
          }
        }
        return obj;
      }
      module.exports = exports.default;
      module.exports.default = exports.default;
    }
  });

  // node_modules/validator/lib/isFQDN.js
  var require_isFQDN = __commonJS({
    "node_modules/validator/lib/isFQDN.js"(exports, module) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = isFQDN;
      var _assertString = _interopRequireDefault(require_assertString());
      var _merge = _interopRequireDefault(require_merge());
      function _interopRequireDefault(e) {
        return e && e.__esModule ? e : { default: e };
      }
      var default_fqdn_options = {
        require_tld: true,
        allow_underscores: false,
        allow_trailing_dot: false,
        allow_numeric_tld: false,
        allow_wildcard: false,
        ignore_max_length: false
      };
      function isFQDN(str, options) {
        (0, _assertString.default)(str);
        options = (0, _merge.default)(options, default_fqdn_options);
        if (options.allow_trailing_dot && str[str.length - 1] === ".") {
          str = str.substring(0, str.length - 1);
        }
        if (options.allow_wildcard === true && str.indexOf("*.") === 0) {
          str = str.substring(2);
        }
        var parts = str.split(".");
        var tld = parts[parts.length - 1];
        if (options.require_tld) {
          if (parts.length < 2) {
            return false;
          }
          if (!options.allow_numeric_tld && !/^([a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
            return false;
          }
          if (/\s/.test(tld)) {
            return false;
          }
        }
        if (!options.allow_numeric_tld && /^\d+$/.test(tld)) {
          return false;
        }
        return parts.every(function(part) {
          if (part.length > 63 && !options.ignore_max_length) {
            return false;
          }
          if (!/^[a-z_\u00a1-\uffff0-9-]+$/i.test(part)) {
            return false;
          }
          if (/[\uff01-\uff5e]/.test(part)) {
            return false;
          }
          if (/^-|-$/.test(part)) {
            return false;
          }
          if (!options.allow_underscores && /_/.test(part)) {
            return false;
          }
          return true;
        });
      }
      module.exports = exports.default;
      module.exports.default = exports.default;
    }
  });

  // node_modules/validator/lib/isIP.js
  var require_isIP = __commonJS({
    "node_modules/validator/lib/isIP.js"(exports, module) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = isIP;
      var _assertString = _interopRequireDefault(require_assertString());
      function _interopRequireDefault(e) {
        return e && e.__esModule ? e : { default: e };
      }
      var IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
      var IPv4AddressFormat = "(".concat(IPv4SegmentFormat, "[.]){3}").concat(IPv4SegmentFormat);
      var IPv4AddressRegExp = new RegExp("^".concat(IPv4AddressFormat, "$"));
      var IPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})";
      var IPv6AddressRegExp = new RegExp("^(" + "(?:".concat(IPv6SegmentFormat, ":){7}(?:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){6}(?:").concat(IPv4AddressFormat, "|:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){5}(?::").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,2}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){4}(?:(:").concat(IPv6SegmentFormat, "){0,1}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,3}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){3}(?:(:").concat(IPv6SegmentFormat, "){0,2}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,4}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){2}(?:(:").concat(IPv6SegmentFormat, "){0,3}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,5}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){1}(?:(:").concat(IPv6SegmentFormat, "){0,4}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,6}|:)|") + "(?::((?::".concat(IPv6SegmentFormat, "){0,5}:").concat(IPv4AddressFormat, "|(?::").concat(IPv6SegmentFormat, "){1,7}|:))") + ")(%[0-9a-zA-Z-.:]{1,})?$");
      function isIP(str) {
        var version = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
        (0, _assertString.default)(str);
        version = String(version);
        if (!version) {
          return isIP(str, 4) || isIP(str, 6);
        }
        if (version === "4") {
          return IPv4AddressRegExp.test(str);
        }
        if (version === "6") {
          return IPv6AddressRegExp.test(str);
        }
        return false;
      }
      module.exports = exports.default;
      module.exports.default = exports.default;
    }
  });

  // node_modules/validator/lib/isURL.js
  var require_isURL = __commonJS({
    "node_modules/validator/lib/isURL.js"(exports, module) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = isURL2;
      var _assertString = _interopRequireDefault(require_assertString());
      var _checkHost = _interopRequireDefault(require_checkHost());
      var _isFQDN = _interopRequireDefault(require_isFQDN());
      var _isIP = _interopRequireDefault(require_isIP());
      var _merge = _interopRequireDefault(require_merge());
      function _interopRequireDefault(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function _slicedToArray(r, e) {
        return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
      }
      function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _unsupportedIterableToArray(r, a) {
        if (r) {
          if ("string" == typeof r) return _arrayLikeToArray(r, a);
          var t = {}.toString.call(r).slice(8, -1);
          return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
        }
      }
      function _arrayLikeToArray(r, a) {
        (null == a || a > r.length) && (a = r.length);
        for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
        return n;
      }
      function _iterableToArrayLimit(r, l) {
        var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
        if (null != t) {
          var e, n, i, u, a = [], f = true, o = false;
          try {
            if (i = (t = t.call(r)).next, 0 === l) {
              if (Object(t) !== t) return;
              f = false;
            } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
          } catch (r2) {
            o = true, n = r2;
          } finally {
            try {
              if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
            } finally {
              if (o) throw n;
            }
          }
          return a;
        }
      }
      function _arrayWithHoles(r) {
        if (Array.isArray(r)) return r;
      }
      var default_url_options = {
        protocols: ["http", "https", "ftp"],
        require_tld: true,
        require_protocol: false,
        require_host: true,
        require_port: false,
        require_valid_protocol: true,
        allow_underscores: false,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: false,
        allow_fragments: true,
        allow_query_components: true,
        validate_length: true,
        max_allowed_length: 2084
      };
      var wrapped_ipv6 = /^\[([^\]]+)\](?::([0-9]+))?$/;
      function isURL2(url, options) {
        (0, _assertString.default)(url);
        if (!url || /[\s<>]/.test(url)) {
          return false;
        }
        if (url.indexOf("mailto:") === 0) {
          return false;
        }
        options = (0, _merge.default)(options, default_url_options);
        if (options.validate_length && url.length > options.max_allowed_length) {
          return false;
        }
        if (!options.allow_fragments && url.includes("#")) {
          return false;
        }
        if (!options.allow_query_components && (url.includes("?") || url.includes("&"))) {
          return false;
        }
        var protocol, auth, host, hostname, port, port_str, split, ipv6;
        split = url.split("#");
        url = split.shift();
        split = url.split("?");
        url = split.shift();
        split = url.split("://");
        if (split.length > 1) {
          protocol = split.shift().toLowerCase();
          if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
            return false;
          }
        } else if (options.require_protocol) {
          return false;
        } else if (url.slice(0, 2) === "//") {
          if (!options.allow_protocol_relative_urls) {
            return false;
          }
          split[0] = url.slice(2);
        }
        url = split.join("://");
        if (url === "") {
          return false;
        }
        split = url.split("/");
        url = split.shift();
        if (url === "" && !options.require_host) {
          return true;
        }
        split = url.split("@");
        if (split.length > 1) {
          if (options.disallow_auth) {
            return false;
          }
          if (split[0] === "") {
            return false;
          }
          auth = split.shift();
          if (auth.indexOf(":") >= 0 && auth.split(":").length > 2) {
            return false;
          }
          var _auth$split = auth.split(":"), _auth$split2 = _slicedToArray(_auth$split, 2), user = _auth$split2[0], password = _auth$split2[1];
          if (user === "" && password === "") {
            return false;
          }
        }
        hostname = split.join("@");
        port_str = null;
        ipv6 = null;
        var ipv6_match = hostname.match(wrapped_ipv6);
        if (ipv6_match) {
          host = "";
          ipv6 = ipv6_match[1];
          port_str = ipv6_match[2] || null;
        } else {
          split = hostname.split(":");
          host = split.shift();
          if (split.length) {
            port_str = split.join(":");
          }
        }
        if (port_str !== null && port_str.length > 0) {
          port = parseInt(port_str, 10);
          if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
            return false;
          }
        } else if (options.require_port) {
          return false;
        }
        if (options.host_whitelist) {
          return (0, _checkHost.default)(host, options.host_whitelist);
        }
        if (host === "" && !options.require_host) {
          return true;
        }
        if (!(0, _isIP.default)(host) && !(0, _isFQDN.default)(host, options) && (!ipv6 || !(0, _isIP.default)(ipv6, 6))) {
          return false;
        }
        host = host || ipv6;
        if (options.host_blacklist && (0, _checkHost.default)(host, options.host_blacklist)) {
          return false;
        }
        return true;
      }
      module.exports = exports.default;
      module.exports.default = exports.default;
    }
  });

  // node_modules/peakflow/src/attributeselector.ts
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
    if (exclusions.length === 0) return selector;
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
        while (selector[i] === " ") i++;
        continue;
      }
      current += char;
      i++;
    }
    if (current.trim()) {
      result.push(current.trim());
    }
    return result.map((sel) => `${sel}:not(${exclusions.join(", ")})`).join(", ");
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
  var attributeselector_default = createAttribute;

  // node_modules/peakflow/src/webflow/webflow.ts
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
  var wfclass = {
    invisible: "w-condition-invisible",
    input: "w-input",
    select: "w-select",
    wradio: "w-radio",
    radio: "w-radio-input",
    wcheckbox: "w-checkbox",
    checkbox: "w-checkbox-input",
    checked: "w--redirected-checked"
  };
  var inputSelectorList = [
    `.${wfclass.input}`,
    `.${wfclass.select}`,
    `.${wfclass.wradio} input[type="radio"]`,
    `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`
  ];
  var wfselect = {
    invisible: `.${wfclass.invisible}`,
    input: `.${wfclass.input}`,
    select: `.${wfclass.select}`,
    wradio: `.${wfclass.wradio}`,
    radio: `.${wfclass.radio}`,
    wcheckbox: `.${wfclass.wcheckbox}`,
    checkbox: `.${wfclass.checkbox}`,
    checked: `.${wfclass.checked}`,
    formInput: inputSelectorList.join(", "),
    radioInput: `.${wfclass.wradio} input[type="radio"]`,
    checkboxInput: `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`,
    inputSelectorList
  };
  var wf = {
    siteId,
    pageId,
    class: wfclass,
    select: wfselect
  };

  // node_modules/peakflow/src/form/utility.ts
  var formElementSelector = attributeselector_default("data-form-element");
  var filterFormSelector = attributeselector_default("data-filter-form");
  function isCheckboxInput(input) {
    return input instanceof HTMLInputElement && input.type === "checkbox";
  }
  function reportValidity(input) {
    input.reportValidity();
    input.classList.add("has-error");
    if (isCheckboxInput(input)) {
      input.parentElement?.querySelector(wf.select.checkbox)?.classList.add("has-error");
    }
    if (input.type !== "checkbox" && input.type !== "radio") {
      input.addEventListener("input", () => removeErrorClasses(input), { once: true });
    } else {
      input.addEventListener("change", () => removeErrorClasses(input), { once: true });
    }
  }
  function removeErrorClasses(input) {
    input.classList.remove("has-error");
    if (isCheckboxInput(input)) {
      input.parentElement?.querySelector(wf.select.checkbox)?.classList.remove("has-error");
    }
  }
  function disableWebflowForm(form) {
    form?.classList.remove("w-form");
    form.parentElement.classList.remove("w-form");
  }

  // node_modules/peakflow/src/inputsync.ts
  var syncSelector = attributeselector_default("input-sync");
  function constructInputMap(inputs) {
    const inputMap = /* @__PURE__ */ new Map();
    inputs.forEach((input) => {
      const value = input.getAttribute("input-sync");
      if (inputMap.has(value)) {
        inputMap.get(value).push(input);
      } else {
        inputMap.set(value, [input]);
      }
    });
    return inputMap;
  }
  function syncGroup(input, groupInputs) {
    groupInputs.filter((otherInput) => otherInput !== input).forEach((otherInput) => otherInput.value = input.value);
  }
  function inputSync(container = document.body) {
    if (!container) throw new Error(`Container cannot be undefined.`);
    const inputs = Array.from(container.querySelectorAll(syncSelector()));
    const inputMap = constructInputMap(inputs);
    const inputGroups = Array.from(inputMap.entries());
    inputGroups.forEach(([groupName, groupInputs]) => {
      if (groupInputs.length < 2) {
        console.warn(`Input group "${groupName}" has less than 2 inputs. Skipping group.`);
        return;
      }
      groupInputs.forEach((currentInput) => {
        currentInput.addEventListener("change", () => {
          syncGroup(currentInput, groupInputs);
        });
      });
    });
  }

  // node_modules/peakflow/src/deepmerge.ts
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else if (source[key] !== void 0) {
        result[key] = source[key];
      }
    }
    return result;
  }

  // node_modules/peakflow/src/modal.ts
  var defaultModalAnimation = {
    type: "none",
    duration: 0,
    className: "is-closed"
  };
  var defaultModalSettings = {
    id: void 0,
    animation: defaultModalAnimation,
    stickyFooter: false,
    stickyHeader: false,
    lockBodyScroll: true
  };
  var Modal = class _Modal {
    component;
    modal;
    initialized = false;
    settings;
    instance;
    static attr = {
      id: "data-modal-id",
      element: "data-modal-element"
    };
    constructor(component, settings = {}) {
      if (!component) {
        throw new Error(`The component HTMLElement cannot be undefined.`);
      }
      this.component = component;
      this.settings = deepMerge(defaultModalSettings, settings);
      this.modal = this.getModalElement();
      this.instance = this.settings.id || component.getAttribute(_Modal.attr.id);
      component.setAttribute(_Modal.attr.id, this.instance);
      this.component.setAttribute("role", "dialog");
      this.component.setAttribute("aria-modal", "true");
      this.setInitialState();
      this.setupStickyFooter();
      if (this.modal === this.component) {
        console.warn(`Modal: The modal instance was successfully initialized, but the "modal" element is equal to the "component" element, which will affect the modal animations. To fix this, add the "${_Modal.selector("modal")}" attribute to a descendant of the component element. Find out more about the difference between the "component" and the "modal" element in the documentation.`);
      }
      this.initialized = true;
    }
    static attributeSelector = attributeselector_default(_Modal.attr.element);
    /**
     * Static selector
     */
    static selector(element, instance) {
      const base = _Modal.attributeSelector(element);
      return instance ? `${base}[${_Modal.attr.id}="${instance}"]` : base;
    }
    /**
     * Instance selector
     */
    selector(element, local = true) {
      return local ? _Modal.selector(element, this.instance) : _Modal.selector(element);
    }
    static select(element, instance) {
      return document.querySelector(_Modal.selector(element, instance));
    }
    static selectAll(element, instance) {
      return document.querySelectorAll(_Modal.selector(element, instance));
    }
    select(element, local = true) {
      return local ? this.component.querySelector(_Modal.selector(element)) : document.querySelector(_Modal.selector(element, this.instance));
    }
    selectAll(element, local = true) {
      return local ? this.component.querySelectorAll(_Modal.selector(element)) : document.querySelectorAll(_Modal.selector(element, this.instance));
    }
    getModalElement() {
      if (this.component.matches(_Modal.selector("modal"))) {
        this.modal = this.component;
      } else {
        this.modal = this.component.querySelector(this.selector("modal"));
      }
      if (!this.modal) this.modal = this.component;
      return this.modal;
    }
    setupStickyFooter() {
      const modalContent = this.component.querySelector(_Modal.selector("scroll"));
      const stickyFooter = this.component.querySelector(_Modal.selector("sticky-bottom"));
      if (!modalContent || !stickyFooter) {
        console.warn("Initialize modal: skip sticky footer");
      } else {
        this.setupScrollEvent(modalContent, stickyFooter);
      }
    }
    setupScrollEvent(modalContent, stickyFooter) {
      modalContent.addEventListener("scroll", () => {
        const { scrollHeight, scrollTop, clientHeight } = modalContent;
        const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1;
        if (isScrolledToBottom) {
          stickyFooter.classList.remove("modal-scroll-shadow");
        } else {
          stickyFooter.classList.add("modal-scroll-shadow");
        }
      });
    }
    setInitialState() {
      this.component.style.display = "none";
      this.component.classList.remove("hide");
      this.hide();
      switch (this.settings.animation.type) {
        case "growIn":
        case "slideUp":
          this.modal.style.willChange = "transform";
          this.modal.style.transitionProperty = "transform";
          this.modal.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`;
        case "fade":
          this.component.style.willChange = "opacity";
          this.component.style.transitionProperty = "opacity";
          this.component.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`;
          break;
        case "none":
          break;
      }
      this.component.dataset.state = "closed";
    }
    async show() {
      this.component.dataset.state = "opening";
      this.component.style.removeProperty("display");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await animationFrame();
      switch (this.settings.animation.type) {
        case "fade":
          this.component.style.opacity = "1";
          break;
        case "slideUp":
          this.component.style.opacity = "1";
          this.modal.style.transform = "translateY(0vh)";
          break;
        case "growIn":
          this.component.style.opacity = "1";
          this.modal.style.transform = "scale(1)";
          break;
        default:
          this.component.classList.remove("is-closed");
      }
      setTimeout(() => {
        this.component.dataset.state = "open";
      }, this.settings.animation.duration);
    }
    async hide() {
      this.component.dataset.state = "closing";
      switch (this.settings.animation.type) {
        case "fade":
          this.component.style.opacity = "0";
          break;
        case "slideUp":
          this.component.style.opacity = "0";
          this.modal.style.transform = "translateY(10vh)";
          break;
        case "growIn":
          this.component.style.opacity = "0";
          this.modal.style.transform = "scale(0.9)";
          break;
        default:
          break;
      }
      const finish = new Promise((resolve) => {
        setTimeout(() => {
          this.component.style.display = "none";
          this.component.dataset.state = "closed";
          resolve();
        }, this.settings.animation.duration);
      });
      await finish;
    }
    /**
     * Opens the modal instance.
     *
     * This method calls the `show` method and locks the scroll of the document body.
     */
    open() {
      this.show();
      if (this.settings.lockBodyScroll) {
        lockBodyScroll();
      }
    }
    /**
     * Closes the modal instance.
     *
     * This method calls the `hide` method and unlocks the scroll of the document body.
     */
    close() {
      if (this.settings.lockBodyScroll) {
        unlockBodyScroll();
      }
      this.hide();
    }
  };
  function lockBodyScroll() {
    document.body.style.overflow = "hidden";
  }
  function unlockBodyScroll() {
    document.body.style.removeProperty("overflow");
  }
  function animationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  // src/peakpoint/prototype-form.ts
  var import_isURL = __toESM(require_isURL());
  function setupForm(form, modal) {
    disableWebflowForm(form);
    const closeModalButtons = modal.selectAll("close");
    const openModalButton = form.querySelector(Modal.selector("open"));
    const enterWebsiteInput = form.querySelector(syncSelector("enter-website"));
    function tryOpenModal() {
      if (!enterWebsiteInput.required) {
        modal.open();
      } else if ((0, import_isURL.default)(enterWebsiteInput.value)) {
        closeModalButtons.forEach((closebtn) => {
          closebtn.addEventListener("click", () => {
            modal.close();
          }, { once: true });
        });
        modal.open();
      } else {
        reportValidity(enterWebsiteInput);
        enterWebsiteInput.focus();
      }
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      tryOpenModal();
    });
    openModalButton.addEventListener("click", () => tryOpenModal());
  }
  document.addEventListener("DOMContentLoaded", () => {
    inputSync();
    const modalElement = Modal.select("component", "prototype");
    const modal = new Modal(modalElement, {
      animation: {
        type: "slideUp",
        duration: 300
      },
      lockBodyScroll: true
    });
    const hookForms = document.querySelectorAll(`form[formstack-element="form:prototype-hook"]`);
    hookForms.forEach((form) => {
      setupForm(form, modal);
    });
    const navModalElement = Modal.select("component", "nav");
    const navModal = new Modal(navModalElement, {
      animation: {
        type: "slideUp",
        duration: 300
      },
      lockBodyScroll: true
    });
    const openNavModalBtns = navModal.selectAll("open", false);
    const closeNavModalBtns = navModal.selectAll("close", true);
    openNavModalBtns.forEach((button) => {
      button.addEventListener("click", () => {
        navModal.open();
      });
    });
    closeNavModalBtns.forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        navModal.close();
      });
    });
  });
})();
//# sourceMappingURL=prototype-form.js.map
