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
          var match2 = matches[i];
          if (host === match2 || isRegExp(match2) && match2.test(host)) {
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

  // library/attributeselector.ts
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
    return selector.split(", ").reduce((acc, str) => {
      let separator = acc === "" ? "" : ", ";
      return acc + separator + `${str}:not(${exclusions.join(", ")})`;
    }, "");
  }
  var createAttribute = (attrName, options = {
    defaultType: "exact",
    defaultValue: void 0,
    exclusions: []
  }) => {
    return (name = options.defaultValue, type = options.defaultType) => {
      if (!name) {
        return exclude(`[${attrName}]`, ...options.exclusions);
      }
      const value = String(name);
      const selector = `[${attrName}${getOperator(type)}="${value}"]`;
      return exclude(selector, ...options.exclusions ?? []);
    };
  };
  var attributeselector_default = createAttribute;

  // library/webflow/webflow.ts
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

  // library/form/form.ts
  var formElementSelector = attributeselector_default("data-form-element");
  var filterFormSelector = attributeselector_default("data-filter-form");
  function isRadioInput(input) {
    return input instanceof HTMLInputElement && input.type === "radio";
  }
  function isCheckboxInput(input) {
    return input instanceof HTMLInputElement && input.type === "checkbox";
  }
  function reportValidity(input) {
    input.reportValidity();
    input.classList.add("has-error");
    if (isCheckboxInput(input)) {
      input.parentElement?.querySelector(wf.select.checkbox)?.classList.add("has-error");
    }
    const removeErrorClasses = () => {
      input.classList.remove("has-error");
      if (isCheckboxInput(input)) {
        input.parentElement?.querySelector(wf.select.checkbox)?.classList.remove("has-error");
      }
    };
    if (input.type !== "checkbox" && input.type !== "radio") {
      input.addEventListener("input", () => removeErrorClasses(), { once: true });
    } else {
      input.addEventListener("change", () => removeErrorClasses(), { once: true });
    }
  }
  function disableWebflowForm(form) {
    form?.classList.remove("w-form");
    form.parentElement.classList.remove("w-form");
  }

  // library/parameterize.ts
  function parameterize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  }

  // library/form/formfield.ts
  var FormField = class {
    constructor(data = null) {
      if (!data) {
        return;
      }
      this.id = data.id || `field-${Math.random().toString(36).substring(2)}`;
      this.label = data.label || `Unnamed Field`;
      this.value = data.value || "";
      this.required = data.required || false;
      this.type = data.type || "text";
      if (this.type === "radio" || "checkbox") {
        this.checked = data.checked || false;
      }
      if (this.type === "checkbox" && !this.checked) {
        console.log(this.label, this.type, this.checked, data.checked);
        this.value = "Nicht angew\xE4hlt";
      }
    }
    validate(report = true) {
      let valid = true;
      if (this.required) {
        if (this.type === "radio" || this.type === "checkbox") {
          if (!this.checked) {
            valid = false;
          }
        } else {
          if (!this.value.trim()) {
            valid = false;
          }
        }
      }
      if (!valid && report) {
        console.warn(`Field "${this.label}" is invalid.`);
      }
      return valid;
    }
  };
  function fieldFromInput(input, index) {
    if (input.type === "radio" && !input.checked) {
      return new FormField();
    }
    const field = new FormField({
      id: input.id || parameterize(input.dataset.name || `field ${index}`),
      label: input.dataset.name || `field ${index}`,
      value: input.value,
      required: input.required || false,
      type: input.type,
      checked: isCheckboxInput(input) || isRadioInput(input) ? input.checked : void 0
    });
    return field;
  }

  // library/form/fieldgroup.ts
  var FieldGroup = class {
    constructor(fields = /* @__PURE__ */ new Map()) {
      this.fields = fields;
    }
    /**
     * Finds a specific `FormField` instance by id.
     *
     * @param fieldId The id attribute of the associated DOM element.
     */
    getField(fieldId) {
      return this.fields.get(fieldId);
    }
  };

  // library/form/filterform.ts
  var FilterForm = class _FilterForm {
    constructor(container, fieldIds) {
      this.fieldIds = fieldIds;
      this.beforeChangeActions = [];
      this.fieldChangeActions = /* @__PURE__ */ new Map();
      this.globalChangeActions = [];
      // Stores wildcard ('*') actions
      this.defaultDayRange = 7;
      this.resizeResetFields = /* @__PURE__ */ new Map();
      if (!container) throw new Error(`FilterForm container can't be null`);
      container = container;
      if (container.tagName === "form") {
        container = container.querySelector("form");
      }
      if (!container) {
        throw new Error(`Form cannot be undefined.`);
      }
      container.classList.remove("w-form");
      container.addEventListener("submit", (event) => {
        event.preventDefault();
      });
      this.container = container;
      this.filterFields = container.querySelectorAll(wf.select.formInput);
      this.actionElements = container.querySelectorAll(_FilterForm.select());
      this.attachChangeListeners();
    }
    static {
      this.select = attributeselector_default("data-action");
    }
    /**
     * Returns the `HTMLElement` of a specific filter input.
     */
    getFilterInput(fieldId) {
      const existingFields = this.getFieldIds(this.filterFields);
      if (!this.fieldExists(fieldId, existingFields)) {
        throw new Error(`Field with ID "${fieldId}" was not found`);
      }
      return Array.from(this.filterFields).find((field) => field.id === fieldId);
    }
    /**
     * Returns the `HTMLElement` of a specific action element.
     */
    getActionElement(id) {
      return Array.from(this.actionElements).find((element) => element.id === id);
    }
    /**
     * Get all the field-ids inside the current instance.
     */
    getFieldIds(fields) {
      return Array.from(fields).map((input) => input.id);
    }
    /**
     * Check if a field-id exists in a list of field-ids.
     */
    fieldExists(fieldId, fieldIds) {
      const matches = fieldIds.filter((id) => id === fieldId);
      if (matches.length === 1) {
        return true;
      } else if (matches.length > 1) {
        throw new Error(`FieldId ${fieldId} was found more than once!`);
      }
      return false;
    }
    /**
     * Attach all the event listeners needed for the form to function.
     * These event listeners ensure the instance is always in sync with the
     * current state of the FilterForm.
     */
    attachChangeListeners() {
      this.filterFields.forEach((field) => {
        field.addEventListener("input", (event) => this.onChange(event));
      });
      this.actionElements.forEach((element) => {
        element.addEventListener("click", (event) => this.onChange(event));
      });
    }
    /**
     * Add an action to be exectued before all the onChange actions get called.
     * Use this function to validate or modify inputs if needed.
     */
    addBeforeChange(action) {
      this.beforeChangeActions.push(action);
    }
    /**
     * Push actions that run when specific fields change. Actions are executed in the order of insertion.
     * @param fields - An array of field IDs and action element IDs OR '*' for any change event.
     * @param action - An array of actions to execute when the field(s) change.
     */
    addOnChange(fields, action) {
      if (fields === "*") {
        this.globalChangeActions.push(action);
      } else {
        fields.forEach((fieldId) => {
          if (!this.fieldChangeActions.has(fieldId)) {
            this.fieldChangeActions.set(fieldId, []);
          }
          this.fieldChangeActions.get(fieldId)?.push(action);
        });
      }
    }
    /**
     * Execute change actions for the specific field that changed.
     * If wildcard actions exist, they run on every change.
     */
    onChange(event) {
      let filters = this.getFieldGroup(this.filterFields);
      const targetId = this.getTargetId(event);
      if (!targetId) {
        throw new Error(`Target is neither a FilterField nor an ActionElement.`);
      }
      this.beforeChangeActions.forEach((action) => action(filters, targetId));
      filters = this.getFieldGroup(this.filterFields);
      const actions = this.fieldChangeActions.get(targetId) || [];
      actions.forEach((action) => action(filters, targetId));
      this.globalChangeActions.forEach((action) => action(filters, targetId));
    }
    /**
     * Simulate an onChange event and invoke change actions for specified fields.
     * @param fields - An array of field IDs OR '*' for all fields.
     */
    invokeOnChange(fields) {
      let invokedBy;
      let filters = this.getFieldGroup(this.filterFields);
      if (fields === "*") {
        invokedBy = "";
        this.beforeChangeActions.forEach((action) => action(filters, invokedBy));
        filters = this.getFieldGroup(this.filterFields);
        const done = [];
        this.fieldChangeActions.forEach((actions) => {
          actions.forEach((action) => {
            if (!done.includes(action)) {
              action(filters, invokedBy);
              done.push(action);
            }
          });
        });
      } else {
        invokedBy = fields.length === 1 ? fields[0] : "";
        this.beforeChangeActions.forEach((action) => action(filters, invokedBy));
        filters = this.getFieldGroup(this.filterFields);
        fields.forEach((fieldId) => {
          invokedBy = fieldId;
          const actions = this.fieldChangeActions.get(fieldId) || [];
          actions.forEach((action) => action(filters, invokedBy));
        });
      }
      this.globalChangeActions.forEach((action) => action(filters, invokedBy));
    }
    /**
     * Extracts the target ID from an event, whether it's a filter field or an action element.
     */
    getTargetId(event) {
      const target = event.target;
      if (!target) return null;
      if (event.type === "input") {
        return target.id;
      }
      if (event.type === "click" && target.hasAttribute("data-action")) {
        return target.getAttribute("data-action");
      }
      return null;
    }
    /**
     * Get the FieldGroup from current form state.
     * Use this method to get all the form field values as structured data 
     * alongside field metadata.
     */
    getFieldGroup(fields) {
      this.data = new FieldGroup();
      fields = fields;
      fields.forEach((input, index) => {
        const field = fieldFromInput(input, index);
        if (field?.id) {
          this.data.fields.set(field.id, field);
        }
      });
      return this.data;
    }
    /**
     * Reset a field to a specific value on `window.resize` event.
     */
    addResizeReset(fieldId, getValue) {
      const existingFields = this.getFieldIds(this.filterFields);
      if (!this.fieldExists(fieldId, existingFields)) {
        throw new Error(`Field with ID "${fieldId}" was not found`);
      }
      this.resizeResetFields.set(fieldId, getValue);
      if (this.resizeResetFields.size === 1) {
        window.addEventListener("resize", () => this.applyResizeResets());
      }
    }
    /**
     * Remove a field from the reset on resize list. This will no longer reset the field on resize.
     */
    removeResizeReset(fieldId) {
      this.resizeResetFields.delete(fieldId);
      if (this.resizeResetFields.size === 0) {
        window.removeEventListener("resize", this.applyResizeResets);
      }
    }
    /**
     * Applies the reset values to the fields.
     */
    applyResizeResets() {
      this.resizeResetFields.forEach((getValue, fieldId) => {
        let value = getValue();
        if (value instanceof Date) {
          value = value.toISOString().split("T")[0];
        }
        this.getFilterInput(fieldId).value = value.toString();
      });
    }
    /**
     * Set a custom day range for validation.
     * If no custom range is needed, revert to default.
     */
    setDayRange(dayRange) {
      if (dayRange <= 0) {
        throw new Error(`Day range must be at least "1".`);
      }
      this.defaultDayRange = dayRange;
      return this.defaultDayRange;
    }
    /**
     * Validate the date range between startDate and endDate.
     * Ensure they remain within the chosen day range.
     *
     * @param startDateFieldId The field id of the startdate `HTMLFormInput`
     * @param endDateFieldId The field id of the enddate `HTMLFormInput`
     */
    validateDateRange(startDateFieldId, endDateFieldId, customDayRange) {
      const startDateInput = this.getFilterInput(startDateFieldId);
      const endDateInput = this.getFilterInput(endDateFieldId);
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
      let activeRange = customDayRange ?? this.defaultDayRange;
      activeRange -= 1;
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const diffInDays = (endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24);
        let activeField = "other";
        if (document.activeElement === startDateInput) {
          activeField = "startDate";
        } else if (document.activeElement === endDateInput) {
          activeField = "endDate";
        }
        if (activeField === "startDate" || activeField === "other") {
          if (diffInDays !== activeRange) {
            const newEndDate = new Date(startDate);
            newEndDate.setDate(startDate.getDate() + activeRange);
            endDateInput.value = newEndDate.toISOString().split("T")[0];
          } else if (diffInDays < 0) {
            endDateInput.value = startDate.toISOString().split("T")[0];
          }
        } else if (activeField === "endDate") {
          if (diffInDays !== activeRange) {
            const newStartDate = new Date(endDate);
            newStartDate.setDate(endDate.getDate() - activeRange);
            startDateInput.value = newStartDate.toISOString().split("T")[0];
          } else if (diffInDays < 0) {
            startDateInput.value = endDate.toISOString().split("T")[0];
          }
        }
      }
    }
  };

  // node_modules/date-fns/constants.js
  var daysInYear = 365.2425;
  var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
  var minTime = -maxTime;
  var millisecondsInWeek = 6048e5;
  var millisecondsInDay = 864e5;
  var secondsInHour = 3600;
  var secondsInDay = secondsInHour * 24;
  var secondsInWeek = secondsInDay * 7;
  var secondsInYear = secondsInDay * daysInYear;
  var secondsInMonth = secondsInYear / 12;
  var secondsInQuarter = secondsInMonth * 3;
  var constructFromSymbol = Symbol.for("constructDateFrom");

  // node_modules/date-fns/constructFrom.js
  function constructFrom(date, value) {
    if (typeof date === "function") return date(value);
    if (date && typeof date === "object" && constructFromSymbol in date)
      return date[constructFromSymbol](value);
    if (date instanceof Date) return new date.constructor(value);
    return new Date(value);
  }

  // node_modules/date-fns/toDate.js
  function toDate(argument, context) {
    return constructFrom(context || argument, argument);
  }

  // node_modules/date-fns/addDays.js
  function addDays(date, amount, options) {
    const _date = toDate(date, options?.in);
    if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
    if (!amount) return _date;
    _date.setDate(_date.getDate() + amount);
    return _date;
  }

  // node_modules/date-fns/_lib/defaultOptions.js
  var defaultOptions = {};
  function getDefaultOptions() {
    return defaultOptions;
  }

  // node_modules/date-fns/startOfWeek.js
  function startOfWeek(date, options) {
    const defaultOptions2 = getDefaultOptions();
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const _date = toDate(date, options?.in);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    _date.setDate(_date.getDate() - diff);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/startOfISOWeek.js
  function startOfISOWeek(date, options) {
    return startOfWeek(date, { ...options, weekStartsOn: 1 });
  }

  // node_modules/date-fns/getISOWeekYear.js
  function getISOWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();
    const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
    const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
    fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
    if (_date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
  function getTimezoneOffsetInMilliseconds(date) {
    const _date = toDate(date);
    const utcDate = new Date(
      Date.UTC(
        _date.getFullYear(),
        _date.getMonth(),
        _date.getDate(),
        _date.getHours(),
        _date.getMinutes(),
        _date.getSeconds(),
        _date.getMilliseconds()
      )
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
  }

  // node_modules/date-fns/_lib/normalizeDates.js
  function normalizeDates(context, ...dates) {
    const normalize = constructFrom.bind(
      null,
      context || dates.find((date) => typeof date === "object")
    );
    return dates.map(normalize);
  }

  // node_modules/date-fns/startOfDay.js
  function startOfDay(date, options) {
    const _date = toDate(date, options?.in);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/differenceInCalendarDays.js
  function differenceInCalendarDays(laterDate, earlierDate, options) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options?.in,
      laterDate,
      earlierDate
    );
    const laterStartOfDay = startOfDay(laterDate_);
    const earlierStartOfDay = startOfDay(earlierDate_);
    const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
    const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
    return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
  }

  // node_modules/date-fns/startOfISOWeekYear.js
  function startOfISOWeekYear(date, options) {
    const year = getISOWeekYear(date, options);
    const fourthOfJanuary = constructFrom(options?.in || date, 0);
    fourthOfJanuary.setFullYear(year, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    return startOfISOWeek(fourthOfJanuary);
  }

  // node_modules/date-fns/setISOWeekYear.js
  function setISOWeekYear(date, weekYear, options) {
    let _date = toDate(date, options?.in);
    const diff = differenceInCalendarDays(
      _date,
      startOfISOWeekYear(_date, options)
    );
    const fourthOfJanuary = constructFrom(options?.in || date, 0);
    fourthOfJanuary.setFullYear(weekYear, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    _date = startOfISOWeekYear(fourthOfJanuary);
    _date.setDate(_date.getDate() + diff);
    return _date;
  }

  // node_modules/date-fns/addWeeks.js
  function addWeeks(date, amount, options) {
    return addDays(date, amount * 7, options);
  }

  // node_modules/date-fns/isDate.js
  function isDate(value) {
    return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
  }

  // node_modules/date-fns/isValid.js
  function isValid(date) {
    return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
  }

  // node_modules/date-fns/startOfYear.js
  function startOfYear(date, options) {
    const date_ = toDate(date, options?.in);
    date_.setFullYear(date_.getFullYear(), 0, 1);
    date_.setHours(0, 0, 0, 0);
    return date_;
  }

  // node_modules/date-fns/locale/en-US/_lib/formatDistance.js
  var formatDistanceLocale = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds"
    },
    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds"
    },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes"
    },
    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes"
    },
    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours"
    },
    xHours: {
      one: "1 hour",
      other: "{{count}} hours"
    },
    xDays: {
      one: "1 day",
      other: "{{count}} days"
    },
    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks"
    },
    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks"
    },
    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months"
    },
    xMonths: {
      one: "1 month",
      other: "{{count}} months"
    },
    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years"
    },
    xYears: {
      one: "1 year",
      other: "{{count}} years"
    },
    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years"
    },
    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years"
    }
  };
  var formatDistance = (token, count, options) => {
    let result;
    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count.toString());
    }
    if (options?.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }
    return result;
  };

  // node_modules/date-fns/locale/_lib/buildFormatLongFn.js
  function buildFormatLongFn(args) {
    return (options = {}) => {
      const width = options.width ? String(options.width) : args.defaultWidth;
      const format2 = args.formats[width] || args.formats[args.defaultWidth];
      return format2;
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/formatLong.js
  var dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy"
  };
  var timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a"
  };
  var dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}"
  };
  var formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full"
    }),
    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full"
    }),
    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full"
    })
  };

  // node_modules/date-fns/locale/en-US/_lib/formatRelative.js
  var formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P"
  };
  var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

  // node_modules/date-fns/locale/_lib/buildLocalizeFn.js
  function buildLocalizeFn(args) {
    return (value, options) => {
      const context = options?.context ? String(options.context) : "standalone";
      let valuesArray;
      if (context === "formatting" && args.formattingValues) {
        const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        const width = options?.width ? String(options.width) : defaultWidth;
        valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        const defaultWidth = args.defaultWidth;
        const width = options?.width ? String(options.width) : args.defaultWidth;
        valuesArray = args.values[width] || args.values[defaultWidth];
      }
      const index = args.argumentCallback ? args.argumentCallback(value) : value;
      return valuesArray[index];
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/localize.js
  var eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"]
  };
  var quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
  };
  var monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  };
  var dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  };
  var dayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    }
  };
  var formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    }
  };
  var ordinalNumber = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);
    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };
  var localize = {
    ordinalNumber,
    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide"
    }),
    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1
    }),
    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide"
    }),
    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide"
    }),
    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide"
    })
  };

  // node_modules/date-fns/locale/_lib/buildMatchFn.js
  function buildMatchFn(args) {
    return (string, options = {}) => {
      const width = options.width;
      const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
      const matchResult = string.match(matchPattern);
      if (!matchResult) {
        return null;
      }
      const matchedString = matchResult[0];
      const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
      const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
        // [TODO] -- I challenge you to fix the type
        findKey(parsePatterns, (pattern) => pattern.test(matchedString))
      );
      let value;
      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options.valueCallback ? (
        // [TODO] -- I challenge you to fix the type
        options.valueCallback(value)
      ) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }
  function findKey(object, predicate) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
        return key;
      }
    }
    return void 0;
  }
  function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return void 0;
  }

  // node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
  function buildMatchPatternFn(args) {
    return (string, options = {}) => {
      const matchResult = string.match(args.matchPattern);
      if (!matchResult) return null;
      const matchedString = matchResult[0];
      const parseResult = string.match(args.parsePattern);
      if (!parseResult) return null;
      let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
      value = options.valueCallback ? options.valueCallback(value) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/match.js
  var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
  var parseOrdinalNumberPattern = /\d+/i;
  var matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i
  };
  var parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i]
  };
  var matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i
  };
  var parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i]
  };
  var matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
  };
  var parseMonthPatterns = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ],
    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ]
  };
  var matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
  };
  var parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
  };
  var matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
  };
  var parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i
    }
  };
  var match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: (value) => parseInt(value, 10)
    }),
    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any"
    }),
    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: (index) => index + 1
    }),
    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any"
    }),
    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any"
    }),
    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any"
    })
  };

  // node_modules/date-fns/locale/en-US.js
  var enUS = {
    code: "en-US",
    formatDistance,
    formatLong,
    formatRelative,
    localize,
    match,
    options: {
      weekStartsOn: 0,
      firstWeekContainsDate: 1
    }
  };

  // node_modules/date-fns/getDayOfYear.js
  function getDayOfYear(date, options) {
    const _date = toDate(date, options?.in);
    const diff = differenceInCalendarDays(_date, startOfYear(_date));
    const dayOfYear = diff + 1;
    return dayOfYear;
  }

  // node_modules/date-fns/getISOWeek.js
  function getISOWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/getWeekYear.js
  function getWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
    const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
    if (+_date >= +startOfNextYear) {
      return year + 1;
    } else if (+_date >= +startOfThisYear) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/startOfWeekYear.js
  function startOfWeekYear(date, options) {
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const year = getWeekYear(date, options);
    const firstWeek = constructFrom(options?.in || date, 0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    const _date = startOfWeek(firstWeek, options);
    return _date;
  }

  // node_modules/date-fns/getWeek.js
  function getWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/_lib/addLeadingZeros.js
  function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? "-" : "";
    const output = Math.abs(number).toString().padStart(targetLength, "0");
    return sign + output;
  }

  // node_modules/date-fns/_lib/format/lightFormatters.js
  var lightFormatters = {
    // Year
    y(date, token) {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },
    // Month
    M(date, token) {
      const month = date.getMonth();
      return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },
    // Day of the month
    d(date, token) {
      return addLeadingZeros(date.getDate(), token.length);
    },
    // AM or PM
    a(date, token) {
      const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return dayPeriodEnumValue.toUpperCase();
        case "aaa":
          return dayPeriodEnumValue;
        case "aaaaa":
          return dayPeriodEnumValue[0];
        case "aaaa":
        default:
          return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
      }
    },
    // Hour [1-12]
    h(date, token) {
      return addLeadingZeros(date.getHours() % 12 || 12, token.length);
    },
    // Hour [0-23]
    H(date, token) {
      return addLeadingZeros(date.getHours(), token.length);
    },
    // Minute
    m(date, token) {
      return addLeadingZeros(date.getMinutes(), token.length);
    },
    // Second
    s(date, token) {
      return addLeadingZeros(date.getSeconds(), token.length);
    },
    // Fraction of second
    S(date, token) {
      const numberOfDigits = token.length;
      const milliseconds = date.getMilliseconds();
      const fractionalSeconds = Math.trunc(
        milliseconds * Math.pow(10, numberOfDigits - 3)
      );
      return addLeadingZeros(fractionalSeconds, token.length);
    }
  };

  // node_modules/date-fns/_lib/format/formatters.js
  var dayPeriodEnum = {
    am: "am",
    pm: "pm",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  };
  var formatters = {
    // Era
    G: function(date, token, localize2) {
      const era = date.getFullYear() > 0 ? 1 : 0;
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return localize2.era(era, { width: "abbreviated" });
        // A, B
        case "GGGGG":
          return localize2.era(era, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return localize2.era(era, { width: "wide" });
      }
    },
    // Year
    y: function(date, token, localize2) {
      if (token === "yo") {
        const signedYear = date.getFullYear();
        const year = signedYear > 0 ? signedYear : 1 - signedYear;
        return localize2.ordinalNumber(year, { unit: "year" });
      }
      return lightFormatters.y(date, token);
    },
    // Local week-numbering year
    Y: function(date, token, localize2, options) {
      const signedWeekYear = getWeekYear(date, options);
      const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
      if (token === "YY") {
        const twoDigitYear = weekYear % 100;
        return addLeadingZeros(twoDigitYear, 2);
      }
      if (token === "Yo") {
        return localize2.ordinalNumber(weekYear, { unit: "year" });
      }
      return addLeadingZeros(weekYear, token.length);
    },
    // ISO week-numbering year
    R: function(date, token) {
      const isoWeekYear = getISOWeekYear(date);
      return addLeadingZeros(isoWeekYear, token.length);
    },
    // Extended year. This is a single number designating the year of this calendar system.
    // The main difference between `y` and `u` localizers are B.C. years:
    // | Year | `y` | `u` |
    // |------|-----|-----|
    // | AC 1 |   1 |   1 |
    // | BC 1 |   1 |   0 |
    // | BC 2 |   2 |  -1 |
    // Also `yy` always returns the last two digits of a year,
    // while `uu` pads single digit years to 2 characters and returns other years unchanged.
    u: function(date, token) {
      const year = date.getFullYear();
      return addLeadingZeros(year, token.length);
    },
    // Quarter
    Q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
          return String(quarter);
        // 01, 02, 03, 04
        case "QQ":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "formatting"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "formatting"
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone quarter
    q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "q":
          return String(quarter);
        // 01, 02, 03, 04
        case "qq":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "standalone"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "standalone"
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // Month
    M: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        case "M":
        case "MM":
          return lightFormatters.M(date, token);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "MMM":
          return localize2.month(month, {
            width: "abbreviated",
            context: "formatting"
          });
        // J, F, ..., D
        case "MMMMM":
          return localize2.month(month, {
            width: "narrow",
            context: "formatting"
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return localize2.month(month, { width: "wide", context: "formatting" });
      }
    },
    // Stand-alone month
    L: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return String(month + 1);
        // 01, 02, ..., 12
        case "LL":
          return addLeadingZeros(month + 1, 2);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "LLL":
          return localize2.month(month, {
            width: "abbreviated",
            context: "standalone"
          });
        // J, F, ..., D
        case "LLLLL":
          return localize2.month(month, {
            width: "narrow",
            context: "standalone"
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return localize2.month(month, { width: "wide", context: "standalone" });
      }
    },
    // Local week of year
    w: function(date, token, localize2, options) {
      const week = getWeek(date, options);
      if (token === "wo") {
        return localize2.ordinalNumber(week, { unit: "week" });
      }
      return addLeadingZeros(week, token.length);
    },
    // ISO week of year
    I: function(date, token, localize2) {
      const isoWeek = getISOWeek(date);
      if (token === "Io") {
        return localize2.ordinalNumber(isoWeek, { unit: "week" });
      }
      return addLeadingZeros(isoWeek, token.length);
    },
    // Day of the month
    d: function(date, token, localize2) {
      if (token === "do") {
        return localize2.ordinalNumber(date.getDate(), { unit: "date" });
      }
      return lightFormatters.d(date, token);
    },
    // Day of year
    D: function(date, token, localize2) {
      const dayOfYear = getDayOfYear(date);
      if (token === "Do") {
        return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
      }
      return addLeadingZeros(dayOfYear, token.length);
    },
    // Day of week
    E: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "EEEEE":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "EEEEEE":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "EEEE":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Local day of week
    e: function(date, token, localize2, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (Nth day of week with current locale or weekStartsOn)
        case "e":
          return String(localDayOfWeek);
        // Padded numerical value
        case "ee":
          return addLeadingZeros(localDayOfWeek, 2);
        // 1st, 2nd, ..., 7th
        case "eo":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "eee":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "eeeee":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "eeeeee":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "eeee":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone local day of week
    c: function(date, token, localize2, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (same as in `e`)
        case "c":
          return String(localDayOfWeek);
        // Padded numerical value
        case "cc":
          return addLeadingZeros(localDayOfWeek, token.length);
        // 1st, 2nd, ..., 7th
        case "co":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "ccc":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "standalone"
          });
        // T
        case "ccccc":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "standalone"
          });
        // Tu
        case "cccccc":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "standalone"
          });
        // Tuesday
        case "cccc":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // ISO day of week
    i: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      switch (token) {
        // 2
        case "i":
          return String(isoDayOfWeek);
        // 02
        case "ii":
          return addLeadingZeros(isoDayOfWeek, token.length);
        // 2nd
        case "io":
          return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
        // Tue
        case "iii":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "iiiii":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "iiiiii":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "iiii":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM or PM
    a: function(date, token, localize2) {
      const hours = date.getHours();
      const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "aaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "aaaaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaa":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM, PM, midnight, noon
    b: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours === 12) {
        dayPeriodEnumValue = dayPeriodEnum.noon;
      } else if (hours === 0) {
        dayPeriodEnumValue = dayPeriodEnum.midnight;
      } else {
        dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      }
      switch (token) {
        case "b":
        case "bb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "bbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "bbbbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbb":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // in the morning, in the afternoon, in the evening, at night
    B: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours >= 17) {
        dayPeriodEnumValue = dayPeriodEnum.evening;
      } else if (hours >= 12) {
        dayPeriodEnumValue = dayPeriodEnum.afternoon;
      } else if (hours >= 4) {
        dayPeriodEnumValue = dayPeriodEnum.morning;
      } else {
        dayPeriodEnumValue = dayPeriodEnum.night;
      }
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "BBBBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBB":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Hour [1-12]
    h: function(date, token, localize2) {
      if (token === "ho") {
        let hours = date.getHours() % 12;
        if (hours === 0) hours = 12;
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return lightFormatters.h(date, token);
    },
    // Hour [0-23]
    H: function(date, token, localize2) {
      if (token === "Ho") {
        return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
      }
      return lightFormatters.H(date, token);
    },
    // Hour [0-11]
    K: function(date, token, localize2) {
      const hours = date.getHours() % 12;
      if (token === "Ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Hour [1-24]
    k: function(date, token, localize2) {
      let hours = date.getHours();
      if (hours === 0) hours = 24;
      if (token === "ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Minute
    m: function(date, token, localize2) {
      if (token === "mo") {
        return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
      }
      return lightFormatters.m(date, token);
    },
    // Second
    s: function(date, token, localize2) {
      if (token === "so") {
        return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
      }
      return lightFormatters.s(date, token);
    },
    // Fraction of second
    S: function(date, token) {
      return lightFormatters.S(date, token);
    },
    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      if (timezoneOffset === 0) {
        return "Z";
      }
      switch (token) {
        // Hours and optional minutes
        case "X":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XX`
        case "XXXX":
        case "XX":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XXX`
        case "XXXXX":
        case "XXX":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Hours and optional minutes
        case "x":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xx`
        case "xxxx":
        case "xx":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xxx`
        case "xxxxx":
        case "xxx":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (GMT)
    O: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "OOOO":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (specific non-location)
    z: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "zzzz":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Seconds timestamp
    t: function(date, token, _localize) {
      const timestamp = Math.trunc(+date / 1e3);
      return addLeadingZeros(timestamp, token.length);
    },
    // Milliseconds timestamp
    T: function(date, token, _localize) {
      return addLeadingZeros(+date, token.length);
    }
  };
  function formatTimezoneShort(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = Math.trunc(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
      return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
  }
  function formatTimezoneWithOptionalMinutes(offset, delimiter) {
    if (offset % 60 === 0) {
      const sign = offset > 0 ? "-" : "+";
      return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, delimiter);
  }
  function formatTimezone(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
    const minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
  }

  // node_modules/date-fns/_lib/format/longFormatters.js
  var dateLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "P":
        return formatLong2.date({ width: "short" });
      case "PP":
        return formatLong2.date({ width: "medium" });
      case "PPP":
        return formatLong2.date({ width: "long" });
      case "PPPP":
      default:
        return formatLong2.date({ width: "full" });
    }
  };
  var timeLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "p":
        return formatLong2.time({ width: "short" });
      case "pp":
        return formatLong2.time({ width: "medium" });
      case "ppp":
        return formatLong2.time({ width: "long" });
      case "pppp":
      default:
        return formatLong2.time({ width: "full" });
    }
  };
  var dateTimeLongFormatter = (pattern, formatLong2) => {
    const matchResult = pattern.match(/(P+)(p+)?/) || [];
    const datePattern = matchResult[1];
    const timePattern = matchResult[2];
    if (!timePattern) {
      return dateLongFormatter(pattern, formatLong2);
    }
    let dateTimeFormat;
    switch (datePattern) {
      case "P":
        dateTimeFormat = formatLong2.dateTime({ width: "short" });
        break;
      case "PP":
        dateTimeFormat = formatLong2.dateTime({ width: "medium" });
        break;
      case "PPP":
        dateTimeFormat = formatLong2.dateTime({ width: "long" });
        break;
      case "PPPP":
      default:
        dateTimeFormat = formatLong2.dateTime({ width: "full" });
        break;
    }
    return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
  };
  var longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter
  };

  // node_modules/date-fns/_lib/protectedTokens.js
  var dayOfYearTokenRE = /^D+$/;
  var weekYearTokenRE = /^Y+$/;
  var throwTokens = ["D", "DD", "YY", "YYYY"];
  function isProtectedDayOfYearToken(token) {
    return dayOfYearTokenRE.test(token);
  }
  function isProtectedWeekYearToken(token) {
    return weekYearTokenRE.test(token);
  }
  function warnOrThrowProtectedError(token, format2, input) {
    const _message = message(token, format2, input);
    console.warn(_message);
    if (throwTokens.includes(token)) throw new RangeError(_message);
  }
  function message(token, format2, input) {
    const subject = token[0] === "Y" ? "years" : "days of the month";
    return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format2}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
  }

  // node_modules/date-fns/format.js
  var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
  var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
  var escapedStringRegExp = /^'([^]*?)'?$/;
  var doubleQuoteRegExp = /''/g;
  var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
  function format(date, formatStr, options) {
    const defaultOptions2 = getDefaultOptions();
    const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const originalDate = toDate(date, options?.in);
    if (!isValid(originalDate)) {
      throw new RangeError("Invalid time value");
    }
    let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter === "p" || firstCharacter === "P") {
        const longFormatter = longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    }).join("").match(formattingTokensRegExp).map((substring) => {
      if (substring === "''") {
        return { isToken: false, value: "'" };
      }
      const firstCharacter = substring[0];
      if (firstCharacter === "'") {
        return { isToken: false, value: cleanEscapedString(substring) };
      }
      if (formatters[firstCharacter]) {
        return { isToken: true, value: substring };
      }
      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
        );
      }
      return { isToken: false, value: substring };
    });
    if (locale.localize.preprocessor) {
      parts = locale.localize.preprocessor(originalDate, parts);
    }
    const formatterOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale
    };
    return parts.map((part) => {
      if (!part.isToken) return part.value;
      const token = part.value;
      if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
        warnOrThrowProtectedError(token, formatStr, String(date));
      }
      const formatter = formatters[token[0]];
      return formatter(originalDate, token, locale.localize, formatterOptions);
    }).join("");
  }
  function cleanEscapedString(input) {
    const matched = input.match(escapedStringRegExp);
    if (!matched) {
      return input;
    }
    return matched[1].replace(doubleQuoteRegExp, "'");
  }

  // node_modules/date-fns/getISOWeeksInYear.js
  function getISOWeeksInYear(date, options) {
    const thisYear = startOfISOWeekYear(date, options);
    const nextYear = startOfISOWeekYear(addWeeks(thisYear, 60));
    const diff = +nextYear - +thisYear;
    return Math.round(diff / millisecondsInWeek);
  }

  // node_modules/date-fns/setISOWeek.js
  function setISOWeek(date, week, options) {
    const _date = toDate(date, options?.in);
    const diff = getISOWeek(_date, options) - week;
    _date.setDate(_date.getDate() - diff * 7);
    return _date;
  }

  // library/form/calendarweekcomponent.ts
  function getISOWeeksOfYear(year) {
    return getISOWeeksInYear(new Date(year, 5, 1));
  }
  var CalendarweekComponent = class _CalendarweekComponent {
    constructor(container, mode) {
      this.minDate = null;
      this.maxDate = null;
      this.mode = "continuous";
      this.onChangeActions = [];
      this.container = container;
      this.weekInput = container.querySelector(_CalendarweekComponent.select("week"));
      this.yearInput = container.querySelector(_CalendarweekComponent.select("year"));
      if (!this.weekInput || !this.yearInput) {
        throw new Error(`Couldn't find required "week" or "year" input element. Check the attribute selector "${_CalendarweekComponent.select()}"`);
      }
      if (!mode) {
        mode = container.getAttribute("data-mode");
        if (!["continuous", "loop", "fixed"].some((validMode) => validMode === mode)) {
          mode = "continuous";
          console.info(`Mode parsed from attribute was invalid. Mode was set to "${mode}".`);
        }
      }
      this.setMode(mode);
      const minDateStr = container.getAttribute("data-min-date") || "";
      const maxDateStr = container.getAttribute("data-max-date") || "";
      this.setMinMaxDates(new Date(minDateStr), new Date(maxDateStr));
      this.updateWeekMinMax();
      this.weekInput.addEventListener("keydown", (event) => this.onWeekKeydown(event));
      this.yearInput.addEventListener("keydown", (event) => this.onYearKeydown(event));
      this.weekInput.addEventListener("change", () => this.onWeekChange());
      this.yearInput.addEventListener("change", () => this.onYearChange());
    }
    static {
      this.select = attributeselector_default("data-cweek-element");
    }
    setDate(date, silent = false) {
      const year = getISOWeekYear(date);
      const week = getISOWeek(date);
      if (this.minDate && date < this.minDate || this.maxDate && date > this.maxDate) {
        throw new Error("The provided date is out of range.");
      }
      this.year = year;
      this.week = week;
      this.updateWeekMinMax();
      if (!silent) {
        this.onChange();
      } else {
        this.updateClient();
      }
    }
    setMode(mode) {
      switch (mode) {
        case "continuous":
        case "loop":
        case "fixed":
          this.mode = mode;
          break;
        default:
          throw new Error(`"${mode}" is not a valid mode.`);
      }
      console.info(`Calendarweek: Mode set to "${this.mode}".`);
    }
    setMinMaxDates(newMinDate, newMaxDate) {
      if (newMinDate instanceof Date && !isNaN(newMinDate.getTime())) {
        this.minDate = newMinDate;
        this.minDateYear = getISOWeekYear(newMinDate);
        this.minDateWeek = getISOWeek(newMinDate);
        this.yearInput.min = this.minDateYear.toString();
        this.container.dataset.minDate = format(newMinDate, "yyyy-MM-dd");
      } else {
        this.minDate = null;
        this.minDateYear = null;
        this.minDateWeek = null;
        this.yearInput.min = null;
        this.container.dataset.minDate = null;
      }
      if (newMaxDate instanceof Date && !isNaN(newMaxDate.getTime())) {
        this.maxDate = newMaxDate;
        this.maxDateYear = getISOWeekYear(newMaxDate);
        this.maxDateWeek = getISOWeek(newMaxDate);
        this.yearInput.max = this.maxDateYear.toString();
        this.container.dataset.maxDate = format(newMaxDate, "yyyy-MM-dd");
      } else {
        this.maxDate = null;
        this.maxDateYear = null;
        this.maxDateWeek = null;
        this.yearInput.max = null;
        this.container.dataset.maxDate = null;
      }
      this.updateWeekMinMax();
    }
    addOnChange(callback) {
      this.onChangeActions.push(callback);
    }
    removeOnChange(callback) {
      this.onChangeActions = this.onChangeActions.filter((fn) => fn !== callback);
    }
    getCurrentDate() {
      let date = setISOWeekYear(/* @__PURE__ */ new Date(0), this.year);
      date = setISOWeek(date, this.week);
      return startOfISOWeek(date);
    }
    parseWeekAndYear() {
      let parsedYear = parseInt(this.yearInput.value, 10);
      let parsedWeek = parseInt(this.weekInput.value, 10);
      parsedYear = this.keepYearInBounds(parsedYear);
      this.updateWeekMinMax(parsedYear);
      parsedWeek = this.keepWeekInBounds(parsedWeek);
      this.year = parsedYear;
      this.week = parsedWeek;
    }
    onChange() {
      this.updateClient();
      this.onChangeActions.forEach((callback) => callback(this.week, this.year, this.getCurrentDate()));
    }
    updateClient() {
      this.updateClientWeekMinMax();
      this.updateClientValues();
    }
    updateClientWeekMinMax() {
      this.weekInput.min = this.currentMinWeek.toString();
      this.weekInput.max = this.currentMaxWeek.toString();
    }
    updateClientValues() {
      this.yearInput.value = this.year.toString();
      this.weekInput.value = this.week.toString();
    }
    onYearChange() {
      this.parseWeekAndYear();
      this.onChange();
    }
    onWeekChange() {
      this.parseWeekAndYear();
      this.onChange();
    }
    updateWeekMinMax(currentYear = this.year) {
      const maxWeeksOfCurrentYear = getISOWeeksOfYear(currentYear);
      let minCalendarWeek = 1;
      let maxCalendarWeek = maxWeeksOfCurrentYear;
      if (this.minDate !== null && this.minDateYear === currentYear) {
        minCalendarWeek = this.minDateWeek;
      }
      if (this.maxDate !== null && this.maxDateYear === currentYear) {
        maxCalendarWeek = this.maxDateWeek;
      }
      this.currentMinWeek = minCalendarWeek;
      this.currentMaxWeek = maxCalendarWeek;
    }
    onWeekKeydown(event) {
      this.parseWeekAndYear();
      let changed = false;
      if (event.key === "ArrowUp" && this.week >= this.currentMaxWeek) {
        event.preventDefault();
        switch (this.mode) {
          case "continuous":
            if (this.year === this.maxDateYear) break;
            this.year += 1;
            this.week = 1;
            this.updateWeekMinMax();
            changed = true;
            break;
          case "loop":
            this.week = this.currentMinWeek;
            changed = true;
            break;
        }
      } else if (event.key === "ArrowDown" && this.week <= this.currentMinWeek) {
        event.preventDefault();
        switch (this.mode) {
          case "continuous":
            if (this.year === this.minDateYear) break;
            this.year -= 1;
            this.week = getISOWeeksOfYear(this.year);
            this.updateWeekMinMax();
            changed = true;
            break;
          case "loop":
            this.week = this.currentMaxWeek;
            changed = true;
            break;
        }
      }
      if (changed) {
        this.onChange();
      }
    }
    keepYearInBounds(year) {
      if (this.minDateYear !== null && year < this.minDateYear) {
        return this.minDateYear;
      }
      if (this.maxDateYear !== null && year > this.maxDateYear) {
        return this.maxDateYear;
      }
      return year;
    }
    keepWeekInBounds(week) {
      if (week < this.currentMinWeek) {
        return this.currentMinWeek;
      } else if (week > this.currentMaxWeek) {
        return this.currentMaxWeek;
      }
      return week;
    }
    onYearKeydown(event) {
      if (this.mode !== "loop" || !this.minDate || !this.maxDate) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const isArrowUp = event.key === "ArrowUp";
      const isArrowDown = event.key === "ArrowDown";
      this.parseWeekAndYear();
      if (isArrowUp && this.year === this.maxDateYear || isArrowDown && this.year === this.minDateYear) {
        event.preventDefault();
        this.year = isArrowUp ? this.minDateYear : this.maxDateYear;
        this.onChange();
      }
    }
  };

  // library/inputsync.ts
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

  // library/modal.ts
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
    constructor(component, settings = {}) {
      this.initialized = false;
      if (!component) {
        throw new Error(`The component HTMLElement cannot be undefined.`);
      }
      this.component = component;
      this.settings = deepMerge(defaultModalSettings, settings);
      this.modal = this.getModalElement();
      this.instance = this.settings.id || component.getAttribute(_Modal.attr.id);
      this.component.setAttribute("role", "dialog");
      this.component.setAttribute("aria-modal", "true");
      this.setInitialState();
      this.setupStickyFooter();
      if (this.modal === this.component) {
        console.warn(`Modal: The modal instance was successfully initialized, but the "modal" element is equal to the "component" element, which will affect the modal animations. To fix this, add the "${_Modal.selector("modal")}" attribute to a descendant of the component element. Find out more about the difference between the "component" and the "modal" element in the documentation.`);
      }
      this.initialized = true;
    }
    static {
      this.attr = {
        id: "data-modal-id",
        element: "data-modal-element"
      };
    }
    static {
      this.attributeSelector = attributeselector_default(_Modal.attr.element);
    }
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
        case "fade":
          this.component.style.willChange = "opacity";
          this.component.style.transitionProperty = "opacity";
          this.component.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`;
          break;
        case "slideUp":
          this.component.style.willChange = "opacity";
          this.component.style.transitionProperty = "opacity";
          this.component.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`;
          this.modal.style.willChange = "transform";
          this.modal.style.transitionProperty = "transform";
          this.modal.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`;
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

  // src/ts/peakpoint-form.ts
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
