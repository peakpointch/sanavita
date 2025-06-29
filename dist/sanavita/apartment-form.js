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

  // node_modules/semver/internal/constants.js
  var require_constants = __commonJS({
    "node_modules/semver/internal/constants.js"(exports, module) {
      "use strict";
      var SEMVER_SPEC_VERSION = "2.0.0";
      var MAX_LENGTH = 256;
      var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
      9007199254740991;
      var MAX_SAFE_COMPONENT_LENGTH = 16;
      var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
      var RELEASE_TYPES = [
        "major",
        "premajor",
        "minor",
        "preminor",
        "patch",
        "prepatch",
        "prerelease"
      ];
      module.exports = {
        MAX_LENGTH,
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_SAFE_INTEGER,
        RELEASE_TYPES,
        SEMVER_SPEC_VERSION,
        FLAG_INCLUDE_PRERELEASE: 1,
        FLAG_LOOSE: 2
      };
    }
  });

  // node_modules/semver/internal/debug.js
  var require_debug = __commonJS({
    "node_modules/semver/internal/debug.js"(exports, module) {
      "use strict";
      var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
      };
      module.exports = debug;
    }
  });

  // node_modules/semver/internal/re.js
  var require_re = __commonJS({
    "node_modules/semver/internal/re.js"(exports, module) {
      "use strict";
      var {
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_LENGTH
      } = require_constants();
      var debug = require_debug();
      exports = module.exports = {};
      var re = exports.re = [];
      var safeRe = exports.safeRe = [];
      var src = exports.src = [];
      var safeSrc = exports.safeSrc = [];
      var t = exports.t = {};
      var R = 0;
      var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
      var safeRegexReplacements = [
        ["\\s", 1],
        ["\\d", MAX_LENGTH],
        [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
      ];
      var makeSafeRegex = (value) => {
        for (const [token, max] of safeRegexReplacements) {
          value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
        }
        return value;
      };
      var createToken = (name, value, isGlobal) => {
        const safe = makeSafeRegex(value);
        const index = R++;
        debug(name, index, value);
        t[name] = index;
        src[index] = value;
        safeSrc[index] = safe;
        re[index] = new RegExp(value, isGlobal ? "g" : void 0);
        safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
      };
      createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
      createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
      createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
      createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
      createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
      createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
      createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
      createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
      createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
      createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
      createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
      createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
      createToken("FULL", `^${src[t.FULLPLAIN]}$`);
      createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
      createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
      createToken("GTLT", "((?:<|>)?=?)");
      createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
      createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
      createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
      createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
      createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
      createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
      createToken("COERCERTL", src[t.COERCE], true);
      createToken("COERCERTLFULL", src[t.COERCEFULL], true);
      createToken("LONETILDE", "(?:~>?)");
      createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
      exports.tildeTrimReplace = "$1~";
      createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
      createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("LONECARET", "(?:\\^)");
      createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
      exports.caretTrimReplace = "$1^";
      createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
      createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
      createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
      createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
      exports.comparatorTrimReplace = "$1$2$3";
      createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
      createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
      createToken("STAR", "(<|>)?=?\\s*\\*");
      createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
      createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
    }
  });

  // node_modules/semver/internal/parse-options.js
  var require_parse_options = __commonJS({
    "node_modules/semver/internal/parse-options.js"(exports, module) {
      "use strict";
      var looseOption = Object.freeze({ loose: true });
      var emptyOpts = Object.freeze({});
      var parseOptions = (options) => {
        if (!options) {
          return emptyOpts;
        }
        if (typeof options !== "object") {
          return looseOption;
        }
        return options;
      };
      module.exports = parseOptions;
    }
  });

  // node_modules/semver/internal/identifiers.js
  var require_identifiers = __commonJS({
    "node_modules/semver/internal/identifiers.js"(exports, module) {
      "use strict";
      var numeric = /^[0-9]+$/;
      var compareIdentifiers = (a, b) => {
        const anum = numeric.test(a);
        const bnum = numeric.test(b);
        if (anum && bnum) {
          a = +a;
          b = +b;
        }
        return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
      };
      var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
      module.exports = {
        compareIdentifiers,
        rcompareIdentifiers
      };
    }
  });

  // node_modules/semver/classes/semver.js
  var require_semver = __commonJS({
    "node_modules/semver/classes/semver.js"(exports, module) {
      "use strict";
      var debug = require_debug();
      var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
      var { safeRe: re, t } = require_re();
      var parseOptions = require_parse_options();
      var { compareIdentifiers } = require_identifiers();
      var SemVer = class _SemVer {
        constructor(version, options) {
          options = parseOptions(options);
          if (version instanceof _SemVer) {
            if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
              return version;
            } else {
              version = version.version;
            }
          } else if (typeof version !== "string") {
            throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
          }
          if (version.length > MAX_LENGTH) {
            throw new TypeError(
              `version is longer than ${MAX_LENGTH} characters`
            );
          }
          debug("SemVer", version, options);
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
          if (!m) {
            throw new TypeError(`Invalid Version: ${version}`);
          }
          this.raw = version;
          this.major = +m[1];
          this.minor = +m[2];
          this.patch = +m[3];
          if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError("Invalid major version");
          }
          if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError("Invalid minor version");
          }
          if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError("Invalid patch version");
          }
          if (!m[4]) {
            this.prerelease = [];
          } else {
            this.prerelease = m[4].split(".").map((id) => {
              if (/^[0-9]+$/.test(id)) {
                const num = +id;
                if (num >= 0 && num < MAX_SAFE_INTEGER) {
                  return num;
                }
              }
              return id;
            });
          }
          this.build = m[5] ? m[5].split(".") : [];
          this.format();
        }
        format() {
          this.version = `${this.major}.${this.minor}.${this.patch}`;
          if (this.prerelease.length) {
            this.version += `-${this.prerelease.join(".")}`;
          }
          return this.version;
        }
        toString() {
          return this.version;
        }
        compare(other) {
          debug("SemVer.compare", this.version, this.options, other);
          if (!(other instanceof _SemVer)) {
            if (typeof other === "string" && other === this.version) {
              return 0;
            }
            other = new _SemVer(other, this.options);
          }
          if (other.version === this.version) {
            return 0;
          }
          return this.compareMain(other) || this.comparePre(other);
        }
        compareMain(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
        }
        comparePre(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          if (this.prerelease.length && !other.prerelease.length) {
            return -1;
          } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
          } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
          }
          let i = 0;
          do {
            const a = this.prerelease[i];
            const b = other.prerelease[i];
            debug("prerelease compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        compareBuild(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          let i = 0;
          do {
            const a = this.build[i];
            const b = other.build[i];
            debug("build compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        // preminor will bump the version up to the next minor release, and immediately
        // down to pre-release. premajor and prepatch work the same way.
        inc(release, identifier, identifierBase) {
          if (release.startsWith("pre")) {
            if (!identifier && identifierBase === false) {
              throw new Error("invalid increment argument: identifier is empty");
            }
            if (identifier) {
              const match2 = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
              if (!match2 || match2[1] !== identifier) {
                throw new Error(`invalid identifier: ${identifier}`);
              }
            }
          }
          switch (release) {
            case "premajor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor = 0;
              this.major++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "preminor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "prepatch":
              this.prerelease.length = 0;
              this.inc("patch", identifier, identifierBase);
              this.inc("pre", identifier, identifierBase);
              break;
            // If the input is a non-prerelease version, this acts the same as
            // prepatch.
            case "prerelease":
              if (this.prerelease.length === 0) {
                this.inc("patch", identifier, identifierBase);
              }
              this.inc("pre", identifier, identifierBase);
              break;
            case "release":
              if (this.prerelease.length === 0) {
                throw new Error(`version ${this.raw} is not a prerelease`);
              }
              this.prerelease.length = 0;
              break;
            case "major":
              if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                this.major++;
              }
              this.minor = 0;
              this.patch = 0;
              this.prerelease = [];
              break;
            case "minor":
              if (this.patch !== 0 || this.prerelease.length === 0) {
                this.minor++;
              }
              this.patch = 0;
              this.prerelease = [];
              break;
            case "patch":
              if (this.prerelease.length === 0) {
                this.patch++;
              }
              this.prerelease = [];
              break;
            // This probably shouldn't be used publicly.
            // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
            case "pre": {
              const base = Number(identifierBase) ? 1 : 0;
              if (this.prerelease.length === 0) {
                this.prerelease = [base];
              } else {
                let i = this.prerelease.length;
                while (--i >= 0) {
                  if (typeof this.prerelease[i] === "number") {
                    this.prerelease[i]++;
                    i = -2;
                  }
                }
                if (i === -1) {
                  if (identifier === this.prerelease.join(".") && identifierBase === false) {
                    throw new Error("invalid increment argument: identifier already exists");
                  }
                  this.prerelease.push(base);
                }
              }
              if (identifier) {
                let prerelease = [identifier, base];
                if (identifierBase === false) {
                  prerelease = [identifier];
                }
                if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                  if (isNaN(this.prerelease[1])) {
                    this.prerelease = prerelease;
                  }
                } else {
                  this.prerelease = prerelease;
                }
              }
              break;
            }
            default:
              throw new Error(`invalid increment argument: ${release}`);
          }
          this.raw = this.format();
          if (this.build.length) {
            this.raw += `+${this.build.join(".")}`;
          }
          return this;
        }
      };
      module.exports = SemVer;
    }
  });

  // node_modules/semver/functions/parse.js
  var require_parse = __commonJS({
    "node_modules/semver/functions/parse.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var parse = (version, options, throwErrors = false) => {
        if (version instanceof SemVer) {
          return version;
        }
        try {
          return new SemVer(version, options);
        } catch (er) {
          if (!throwErrors) {
            return null;
          }
          throw er;
        }
      };
      module.exports = parse;
    }
  });

  // node_modules/semver/functions/valid.js
  var require_valid = __commonJS({
    "node_modules/semver/functions/valid.js"(exports, module) {
      "use strict";
      var parse = require_parse();
      var valid = (version, options) => {
        const v = parse(version, options);
        return v ? v.version : null;
      };
      module.exports = valid;
    }
  });

  // node_modules/semver/functions/clean.js
  var require_clean = __commonJS({
    "node_modules/semver/functions/clean.js"(exports, module) {
      "use strict";
      var parse = require_parse();
      var clean = (version, options) => {
        const s = parse(version.trim().replace(/^[=v]+/, ""), options);
        return s ? s.version : null;
      };
      module.exports = clean;
    }
  });

  // node_modules/semver/functions/inc.js
  var require_inc = __commonJS({
    "node_modules/semver/functions/inc.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var inc = (version, release, options, identifier, identifierBase) => {
        if (typeof options === "string") {
          identifierBase = identifier;
          identifier = options;
          options = void 0;
        }
        try {
          return new SemVer(
            version instanceof SemVer ? version.version : version,
            options
          ).inc(release, identifier, identifierBase).version;
        } catch (er) {
          return null;
        }
      };
      module.exports = inc;
    }
  });

  // node_modules/semver/functions/diff.js
  var require_diff = __commonJS({
    "node_modules/semver/functions/diff.js"(exports, module) {
      "use strict";
      var parse = require_parse();
      var diff = (version1, version2) => {
        const v1 = parse(version1, null, true);
        const v2 = parse(version2, null, true);
        const comparison = v1.compare(v2);
        if (comparison === 0) {
          return null;
        }
        const v1Higher = comparison > 0;
        const highVersion = v1Higher ? v1 : v2;
        const lowVersion = v1Higher ? v2 : v1;
        const highHasPre = !!highVersion.prerelease.length;
        const lowHasPre = !!lowVersion.prerelease.length;
        if (lowHasPre && !highHasPre) {
          if (!lowVersion.patch && !lowVersion.minor) {
            return "major";
          }
          if (lowVersion.compareMain(highVersion) === 0) {
            if (lowVersion.minor && !lowVersion.patch) {
              return "minor";
            }
            return "patch";
          }
        }
        const prefix = highHasPre ? "pre" : "";
        if (v1.major !== v2.major) {
          return prefix + "major";
        }
        if (v1.minor !== v2.minor) {
          return prefix + "minor";
        }
        if (v1.patch !== v2.patch) {
          return prefix + "patch";
        }
        return "prerelease";
      };
      module.exports = diff;
    }
  });

  // node_modules/semver/functions/major.js
  var require_major = __commonJS({
    "node_modules/semver/functions/major.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var major = (a, loose) => new SemVer(a, loose).major;
      module.exports = major;
    }
  });

  // node_modules/semver/functions/minor.js
  var require_minor = __commonJS({
    "node_modules/semver/functions/minor.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var minor = (a, loose) => new SemVer(a, loose).minor;
      module.exports = minor;
    }
  });

  // node_modules/semver/functions/patch.js
  var require_patch = __commonJS({
    "node_modules/semver/functions/patch.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var patch = (a, loose) => new SemVer(a, loose).patch;
      module.exports = patch;
    }
  });

  // node_modules/semver/functions/prerelease.js
  var require_prerelease = __commonJS({
    "node_modules/semver/functions/prerelease.js"(exports, module) {
      "use strict";
      var parse = require_parse();
      var prerelease = (version, options) => {
        const parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
      };
      module.exports = prerelease;
    }
  });

  // node_modules/semver/functions/compare.js
  var require_compare = __commonJS({
    "node_modules/semver/functions/compare.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
      module.exports = compare;
    }
  });

  // node_modules/semver/functions/rcompare.js
  var require_rcompare = __commonJS({
    "node_modules/semver/functions/rcompare.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var rcompare = (a, b, loose) => compare(b, a, loose);
      module.exports = rcompare;
    }
  });

  // node_modules/semver/functions/compare-loose.js
  var require_compare_loose = __commonJS({
    "node_modules/semver/functions/compare-loose.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var compareLoose = (a, b) => compare(a, b, true);
      module.exports = compareLoose;
    }
  });

  // node_modules/semver/functions/compare-build.js
  var require_compare_build = __commonJS({
    "node_modules/semver/functions/compare-build.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var compareBuild = (a, b, loose) => {
        const versionA = new SemVer(a, loose);
        const versionB = new SemVer(b, loose);
        return versionA.compare(versionB) || versionA.compareBuild(versionB);
      };
      module.exports = compareBuild;
    }
  });

  // node_modules/semver/functions/sort.js
  var require_sort = __commonJS({
    "node_modules/semver/functions/sort.js"(exports, module) {
      "use strict";
      var compareBuild = require_compare_build();
      var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
      module.exports = sort;
    }
  });

  // node_modules/semver/functions/rsort.js
  var require_rsort = __commonJS({
    "node_modules/semver/functions/rsort.js"(exports, module) {
      "use strict";
      var compareBuild = require_compare_build();
      var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
      module.exports = rsort;
    }
  });

  // node_modules/semver/functions/gt.js
  var require_gt = __commonJS({
    "node_modules/semver/functions/gt.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var gt = (a, b, loose) => compare(a, b, loose) > 0;
      module.exports = gt;
    }
  });

  // node_modules/semver/functions/lt.js
  var require_lt = __commonJS({
    "node_modules/semver/functions/lt.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var lt = (a, b, loose) => compare(a, b, loose) < 0;
      module.exports = lt;
    }
  });

  // node_modules/semver/functions/eq.js
  var require_eq = __commonJS({
    "node_modules/semver/functions/eq.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var eq = (a, b, loose) => compare(a, b, loose) === 0;
      module.exports = eq;
    }
  });

  // node_modules/semver/functions/neq.js
  var require_neq = __commonJS({
    "node_modules/semver/functions/neq.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var neq = (a, b, loose) => compare(a, b, loose) !== 0;
      module.exports = neq;
    }
  });

  // node_modules/semver/functions/gte.js
  var require_gte = __commonJS({
    "node_modules/semver/functions/gte.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var gte = (a, b, loose) => compare(a, b, loose) >= 0;
      module.exports = gte;
    }
  });

  // node_modules/semver/functions/lte.js
  var require_lte = __commonJS({
    "node_modules/semver/functions/lte.js"(exports, module) {
      "use strict";
      var compare = require_compare();
      var lte = (a, b, loose) => compare(a, b, loose) <= 0;
      module.exports = lte;
    }
  });

  // node_modules/semver/functions/cmp.js
  var require_cmp = __commonJS({
    "node_modules/semver/functions/cmp.js"(exports, module) {
      "use strict";
      var eq = require_eq();
      var neq = require_neq();
      var gt = require_gt();
      var gte = require_gte();
      var lt = require_lt();
      var lte = require_lte();
      var cmp = (a, op, b, loose) => {
        switch (op) {
          case "===":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a === b;
          case "!==":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a !== b;
          case "":
          case "=":
          case "==":
            return eq(a, b, loose);
          case "!=":
            return neq(a, b, loose);
          case ">":
            return gt(a, b, loose);
          case ">=":
            return gte(a, b, loose);
          case "<":
            return lt(a, b, loose);
          case "<=":
            return lte(a, b, loose);
          default:
            throw new TypeError(`Invalid operator: ${op}`);
        }
      };
      module.exports = cmp;
    }
  });

  // node_modules/semver/functions/coerce.js
  var require_coerce = __commonJS({
    "node_modules/semver/functions/coerce.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var parse = require_parse();
      var { safeRe: re, t } = require_re();
      var coerce = (version, options) => {
        if (version instanceof SemVer) {
          return version;
        }
        if (typeof version === "number") {
          version = String(version);
        }
        if (typeof version !== "string") {
          return null;
        }
        options = options || {};
        let match2 = null;
        if (!options.rtl) {
          match2 = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
        } else {
          const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
          let next;
          while ((next = coerceRtlRegex.exec(version)) && (!match2 || match2.index + match2[0].length !== version.length)) {
            if (!match2 || next.index + next[0].length !== match2.index + match2[0].length) {
              match2 = next;
            }
            coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
          }
          coerceRtlRegex.lastIndex = -1;
        }
        if (match2 === null) {
          return null;
        }
        const major = match2[2];
        const minor = match2[3] || "0";
        const patch = match2[4] || "0";
        const prerelease = options.includePrerelease && match2[5] ? `-${match2[5]}` : "";
        const build = options.includePrerelease && match2[6] ? `+${match2[6]}` : "";
        return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
      };
      module.exports = coerce;
    }
  });

  // node_modules/semver/internal/lrucache.js
  var require_lrucache = __commonJS({
    "node_modules/semver/internal/lrucache.js"(exports, module) {
      "use strict";
      var LRUCache = class {
        constructor() {
          this.max = 1e3;
          this.map = /* @__PURE__ */ new Map();
        }
        get(key) {
          const value = this.map.get(key);
          if (value === void 0) {
            return void 0;
          } else {
            this.map.delete(key);
            this.map.set(key, value);
            return value;
          }
        }
        delete(key) {
          return this.map.delete(key);
        }
        set(key, value) {
          const deleted = this.delete(key);
          if (!deleted && value !== void 0) {
            if (this.map.size >= this.max) {
              const firstKey = this.map.keys().next().value;
              this.delete(firstKey);
            }
            this.map.set(key, value);
          }
          return this;
        }
      };
      module.exports = LRUCache;
    }
  });

  // node_modules/semver/classes/range.js
  var require_range = __commonJS({
    "node_modules/semver/classes/range.js"(exports, module) {
      "use strict";
      var SPACE_CHARACTERS = /\s+/g;
      var Range = class _Range {
        constructor(range, options) {
          options = parseOptions(options);
          if (range instanceof _Range) {
            if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
              return range;
            } else {
              return new _Range(range.raw, options);
            }
          }
          if (range instanceof Comparator) {
            this.raw = range.value;
            this.set = [[range]];
            this.formatted = void 0;
            return this;
          }
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
          this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
          if (!this.set.length) {
            throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
          }
          if (this.set.length > 1) {
            const first = this.set[0];
            this.set = this.set.filter((c) => !isNullSet(c[0]));
            if (this.set.length === 0) {
              this.set = [first];
            } else if (this.set.length > 1) {
              for (const c of this.set) {
                if (c.length === 1 && isAny(c[0])) {
                  this.set = [c];
                  break;
                }
              }
            }
          }
          this.formatted = void 0;
        }
        get range() {
          if (this.formatted === void 0) {
            this.formatted = "";
            for (let i = 0; i < this.set.length; i++) {
              if (i > 0) {
                this.formatted += "||";
              }
              const comps = this.set[i];
              for (let k = 0; k < comps.length; k++) {
                if (k > 0) {
                  this.formatted += " ";
                }
                this.formatted += comps[k].toString().trim();
              }
            }
          }
          return this.formatted;
        }
        format() {
          return this.range;
        }
        toString() {
          return this.range;
        }
        parseRange(range) {
          const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
          const memoKey = memoOpts + ":" + range;
          const cached = cache.get(memoKey);
          if (cached) {
            return cached;
          }
          const loose = this.options.loose;
          const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
          range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
          debug("hyphen replace", range);
          range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
          debug("comparator trim", range);
          range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
          debug("tilde trim", range);
          range = range.replace(re[t.CARETTRIM], caretTrimReplace);
          debug("caret trim", range);
          let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
          if (loose) {
            rangeList = rangeList.filter((comp) => {
              debug("loose invalid filter", comp, this.options);
              return !!comp.match(re[t.COMPARATORLOOSE]);
            });
          }
          debug("range list", rangeList);
          const rangeMap = /* @__PURE__ */ new Map();
          const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
          for (const comp of comparators) {
            if (isNullSet(comp)) {
              return [comp];
            }
            rangeMap.set(comp.value, comp);
          }
          if (rangeMap.size > 1 && rangeMap.has("")) {
            rangeMap.delete("");
          }
          const result = [...rangeMap.values()];
          cache.set(memoKey, result);
          return result;
        }
        intersects(range, options) {
          if (!(range instanceof _Range)) {
            throw new TypeError("a Range is required");
          }
          return this.set.some((thisComparators) => {
            return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
              return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
                return rangeComparators.every((rangeComparator) => {
                  return thisComparator.intersects(rangeComparator, options);
                });
              });
            });
          });
        }
        // if ANY of the sets match ALL of its comparators, then pass
        test(version) {
          if (!version) {
            return false;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          for (let i = 0; i < this.set.length; i++) {
            if (testSet(this.set[i], version, this.options)) {
              return true;
            }
          }
          return false;
        }
      };
      module.exports = Range;
      var LRU = require_lrucache();
      var cache = new LRU();
      var parseOptions = require_parse_options();
      var Comparator = require_comparator();
      var debug = require_debug();
      var SemVer = require_semver();
      var {
        safeRe: re,
        t,
        comparatorTrimReplace,
        tildeTrimReplace,
        caretTrimReplace
      } = require_re();
      var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
      var isNullSet = (c) => c.value === "<0.0.0-0";
      var isAny = (c) => c.value === "";
      var isSatisfiable = (comparators, options) => {
        let result = true;
        const remainingComparators = comparators.slice();
        let testComparator = remainingComparators.pop();
        while (result && remainingComparators.length) {
          result = remainingComparators.every((otherComparator) => {
            return testComparator.intersects(otherComparator, options);
          });
          testComparator = remainingComparators.pop();
        }
        return result;
      };
      var parseComparator = (comp, options) => {
        debug("comp", comp, options);
        comp = replaceCarets(comp, options);
        debug("caret", comp);
        comp = replaceTildes(comp, options);
        debug("tildes", comp);
        comp = replaceXRanges(comp, options);
        debug("xrange", comp);
        comp = replaceStars(comp, options);
        debug("stars", comp);
        return comp;
      };
      var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
      var replaceTildes = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
      };
      var replaceTilde = (comp, options) => {
        const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("tilde", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
          } else if (pr) {
            debug("replaceTilde pr", pr);
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
          debug("tilde return", ret);
          return ret;
        });
      };
      var replaceCarets = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
      };
      var replaceCaret = (comp, options) => {
        debug("caret", comp, options);
        const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
        const z = options.includePrerelease ? "-0" : "";
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("caret", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            if (M === "0") {
              ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
            } else {
              ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
            }
          } else if (pr) {
            debug("replaceCaret pr", pr);
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
            }
          } else {
            debug("no pr");
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
            }
          }
          debug("caret return", ret);
          return ret;
        });
      };
      var replaceXRanges = (comp, options) => {
        debug("replaceXRanges", comp, options);
        return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
      };
      var replaceXRange = (comp, options) => {
        comp = comp.trim();
        const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
        return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
          debug("xRange", comp, ret, gtlt, M, m, p, pr);
          const xM = isX(M);
          const xm = xM || isX(m);
          const xp = xm || isX(p);
          const anyX = xp;
          if (gtlt === "=" && anyX) {
            gtlt = "";
          }
          pr = options.includePrerelease ? "-0" : "";
          if (xM) {
            if (gtlt === ">" || gtlt === "<") {
              ret = "<0.0.0-0";
            } else {
              ret = "*";
            }
          } else if (gtlt && anyX) {
            if (xm) {
              m = 0;
            }
            p = 0;
            if (gtlt === ">") {
              gtlt = ">=";
              if (xm) {
                M = +M + 1;
                m = 0;
                p = 0;
              } else {
                m = +m + 1;
                p = 0;
              }
            } else if (gtlt === "<=") {
              gtlt = "<";
              if (xm) {
                M = +M + 1;
              } else {
                m = +m + 1;
              }
            }
            if (gtlt === "<") {
              pr = "-0";
            }
            ret = `${gtlt + M}.${m}.${p}${pr}`;
          } else if (xm) {
            ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
          } else if (xp) {
            ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
          }
          debug("xRange return", ret);
          return ret;
        });
      };
      var replaceStars = (comp, options) => {
        debug("replaceStars", comp, options);
        return comp.trim().replace(re[t.STAR], "");
      };
      var replaceGTE0 = (comp, options) => {
        debug("replaceGTE0", comp, options);
        return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
      };
      var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
        if (isX(fM)) {
          from = "";
        } else if (isX(fm)) {
          from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
        } else if (isX(fp)) {
          from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
        } else if (fpr) {
          from = `>=${from}`;
        } else {
          from = `>=${from}${incPr ? "-0" : ""}`;
        }
        if (isX(tM)) {
          to = "";
        } else if (isX(tm)) {
          to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
          to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
          to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
          to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
          to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
      };
      var testSet = (set, version, options) => {
        for (let i = 0; i < set.length; i++) {
          if (!set[i].test(version)) {
            return false;
          }
        }
        if (version.prerelease.length && !options.includePrerelease) {
          for (let i = 0; i < set.length; i++) {
            debug(set[i].semver);
            if (set[i].semver === Comparator.ANY) {
              continue;
            }
            if (set[i].semver.prerelease.length > 0) {
              const allowed = set[i].semver;
              if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                return true;
              }
            }
          }
          return false;
        }
        return true;
      };
    }
  });

  // node_modules/semver/classes/comparator.js
  var require_comparator = __commonJS({
    "node_modules/semver/classes/comparator.js"(exports, module) {
      "use strict";
      var ANY = Symbol("SemVer ANY");
      var Comparator = class _Comparator {
        static get ANY() {
          return ANY;
        }
        constructor(comp, options) {
          options = parseOptions(options);
          if (comp instanceof _Comparator) {
            if (comp.loose === !!options.loose) {
              return comp;
            } else {
              comp = comp.value;
            }
          }
          comp = comp.trim().split(/\s+/).join(" ");
          debug("comparator", comp, options);
          this.options = options;
          this.loose = !!options.loose;
          this.parse(comp);
          if (this.semver === ANY) {
            this.value = "";
          } else {
            this.value = this.operator + this.semver.version;
          }
          debug("comp", this);
        }
        parse(comp) {
          const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
          const m = comp.match(r);
          if (!m) {
            throw new TypeError(`Invalid comparator: ${comp}`);
          }
          this.operator = m[1] !== void 0 ? m[1] : "";
          if (this.operator === "=") {
            this.operator = "";
          }
          if (!m[2]) {
            this.semver = ANY;
          } else {
            this.semver = new SemVer(m[2], this.options.loose);
          }
        }
        toString() {
          return this.value;
        }
        test(version) {
          debug("Comparator.test", version, this.options.loose);
          if (this.semver === ANY || version === ANY) {
            return true;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          return cmp(version, this.operator, this.semver, this.options);
        }
        intersects(comp, options) {
          if (!(comp instanceof _Comparator)) {
            throw new TypeError("a Comparator is required");
          }
          if (this.operator === "") {
            if (this.value === "") {
              return true;
            }
            return new Range(comp.value, options).test(this.value);
          } else if (comp.operator === "") {
            if (comp.value === "") {
              return true;
            }
            return new Range(this.value, options).test(comp.semver);
          }
          options = parseOptions(options);
          if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
            return false;
          }
          if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
            return false;
          }
          if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
            return true;
          }
          if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
            return true;
          }
          if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
            return true;
          }
          if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
            return true;
          }
          if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
            return true;
          }
          return false;
        }
      };
      module.exports = Comparator;
      var parseOptions = require_parse_options();
      var { safeRe: re, t } = require_re();
      var cmp = require_cmp();
      var debug = require_debug();
      var SemVer = require_semver();
      var Range = require_range();
    }
  });

  // node_modules/semver/functions/satisfies.js
  var require_satisfies = __commonJS({
    "node_modules/semver/functions/satisfies.js"(exports, module) {
      "use strict";
      var Range = require_range();
      var satisfies = (version, range, options) => {
        try {
          range = new Range(range, options);
        } catch (er) {
          return false;
        }
        return range.test(version);
      };
      module.exports = satisfies;
    }
  });

  // node_modules/semver/ranges/to-comparators.js
  var require_to_comparators = __commonJS({
    "node_modules/semver/ranges/to-comparators.js"(exports, module) {
      "use strict";
      var Range = require_range();
      var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
      module.exports = toComparators;
    }
  });

  // node_modules/semver/ranges/max-satisfying.js
  var require_max_satisfying = __commonJS({
    "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var Range = require_range();
      var maxSatisfying = (versions, range, options) => {
        let max = null;
        let maxSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!max || maxSV.compare(v) === -1) {
              max = v;
              maxSV = new SemVer(max, options);
            }
          }
        });
        return max;
      };
      module.exports = maxSatisfying;
    }
  });

  // node_modules/semver/ranges/min-satisfying.js
  var require_min_satisfying = __commonJS({
    "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var Range = require_range();
      var minSatisfying = (versions, range, options) => {
        let min = null;
        let minSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!min || minSV.compare(v) === 1) {
              min = v;
              minSV = new SemVer(min, options);
            }
          }
        });
        return min;
      };
      module.exports = minSatisfying;
    }
  });

  // node_modules/semver/ranges/min-version.js
  var require_min_version = __commonJS({
    "node_modules/semver/ranges/min-version.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var Range = require_range();
      var gt = require_gt();
      var minVersion = (range, loose) => {
        range = new Range(range, loose);
        let minver = new SemVer("0.0.0");
        if (range.test(minver)) {
          return minver;
        }
        minver = new SemVer("0.0.0-0");
        if (range.test(minver)) {
          return minver;
        }
        minver = null;
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let setMin = null;
          comparators.forEach((comparator) => {
            const compver = new SemVer(comparator.semver.version);
            switch (comparator.operator) {
              case ">":
                if (compver.prerelease.length === 0) {
                  compver.patch++;
                } else {
                  compver.prerelease.push(0);
                }
                compver.raw = compver.format();
              /* fallthrough */
              case "":
              case ">=":
                if (!setMin || gt(compver, setMin)) {
                  setMin = compver;
                }
                break;
              case "<":
              case "<=":
                break;
              /* istanbul ignore next */
              default:
                throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
          });
          if (setMin && (!minver || gt(minver, setMin))) {
            minver = setMin;
          }
        }
        if (minver && range.test(minver)) {
          return minver;
        }
        return null;
      };
      module.exports = minVersion;
    }
  });

  // node_modules/semver/ranges/valid.js
  var require_valid2 = __commonJS({
    "node_modules/semver/ranges/valid.js"(exports, module) {
      "use strict";
      var Range = require_range();
      var validRange = (range, options) => {
        try {
          return new Range(range, options).range || "*";
        } catch (er) {
          return null;
        }
      };
      module.exports = validRange;
    }
  });

  // node_modules/semver/ranges/outside.js
  var require_outside = __commonJS({
    "node_modules/semver/ranges/outside.js"(exports, module) {
      "use strict";
      var SemVer = require_semver();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var Range = require_range();
      var satisfies = require_satisfies();
      var gt = require_gt();
      var lt = require_lt();
      var lte = require_lte();
      var gte = require_gte();
      var outside = (version, range, hilo, options) => {
        version = new SemVer(version, options);
        range = new Range(range, options);
        let gtfn, ltefn, ltfn, comp, ecomp;
        switch (hilo) {
          case ">":
            gtfn = gt;
            ltefn = lte;
            ltfn = lt;
            comp = ">";
            ecomp = ">=";
            break;
          case "<":
            gtfn = lt;
            ltefn = gte;
            ltfn = gt;
            comp = "<";
            ecomp = "<=";
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (satisfies(version, range, options)) {
          return false;
        }
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let high = null;
          let low = null;
          comparators.forEach((comparator) => {
            if (comparator.semver === ANY) {
              comparator = new Comparator(">=0.0.0");
            }
            high = high || comparator;
            low = low || comparator;
            if (gtfn(comparator.semver, high.semver, options)) {
              high = comparator;
            } else if (ltfn(comparator.semver, low.semver, options)) {
              low = comparator;
            }
          });
          if (high.operator === comp || high.operator === ecomp) {
            return false;
          }
          if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
            return false;
          } else if (low.operator === ecomp && ltfn(version, low.semver)) {
            return false;
          }
        }
        return true;
      };
      module.exports = outside;
    }
  });

  // node_modules/semver/ranges/gtr.js
  var require_gtr = __commonJS({
    "node_modules/semver/ranges/gtr.js"(exports, module) {
      "use strict";
      var outside = require_outside();
      var gtr = (version, range, options) => outside(version, range, ">", options);
      module.exports = gtr;
    }
  });

  // node_modules/semver/ranges/ltr.js
  var require_ltr = __commonJS({
    "node_modules/semver/ranges/ltr.js"(exports, module) {
      "use strict";
      var outside = require_outside();
      var ltr = (version, range, options) => outside(version, range, "<", options);
      module.exports = ltr;
    }
  });

  // node_modules/semver/ranges/intersects.js
  var require_intersects = __commonJS({
    "node_modules/semver/ranges/intersects.js"(exports, module) {
      "use strict";
      var Range = require_range();
      var intersects = (r1, r2, options) => {
        r1 = new Range(r1, options);
        r2 = new Range(r2, options);
        return r1.intersects(r2, options);
      };
      module.exports = intersects;
    }
  });

  // node_modules/semver/ranges/simplify.js
  var require_simplify = __commonJS({
    "node_modules/semver/ranges/simplify.js"(exports, module) {
      "use strict";
      var satisfies = require_satisfies();
      var compare = require_compare();
      module.exports = (versions, range, options) => {
        const set = [];
        let first = null;
        let prev = null;
        const v = versions.sort((a, b) => compare(a, b, options));
        for (const version of v) {
          const included = satisfies(version, range, options);
          if (included) {
            prev = version;
            if (!first) {
              first = version;
            }
          } else {
            if (prev) {
              set.push([first, prev]);
            }
            prev = null;
            first = null;
          }
        }
        if (first) {
          set.push([first, null]);
        }
        const ranges = [];
        for (const [min, max] of set) {
          if (min === max) {
            ranges.push(min);
          } else if (!max && min === v[0]) {
            ranges.push("*");
          } else if (!max) {
            ranges.push(`>=${min}`);
          } else if (min === v[0]) {
            ranges.push(`<=${max}`);
          } else {
            ranges.push(`${min} - ${max}`);
          }
        }
        const simplified = ranges.join(" || ");
        const original = typeof range.raw === "string" ? range.raw : String(range);
        return simplified.length < original.length ? simplified : range;
      };
    }
  });

  // node_modules/semver/ranges/subset.js
  var require_subset = __commonJS({
    "node_modules/semver/ranges/subset.js"(exports, module) {
      "use strict";
      var Range = require_range();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var satisfies = require_satisfies();
      var compare = require_compare();
      var subset = (sub, dom, options = {}) => {
        if (sub === dom) {
          return true;
        }
        sub = new Range(sub, options);
        dom = new Range(dom, options);
        let sawNonNull = false;
        OUTER: for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
        return true;
      };
      var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
      var minimumVersion = [new Comparator(">=0.0.0")];
      var simpleSubset = (sub, dom, options) => {
        if (sub === dom) {
          return true;
        }
        if (sub.length === 1 && sub[0].semver === ANY) {
          if (dom.length === 1 && dom[0].semver === ANY) {
            return true;
          } else if (options.includePrerelease) {
            sub = minimumVersionWithPreRelease;
          } else {
            sub = minimumVersion;
          }
        }
        if (dom.length === 1 && dom[0].semver === ANY) {
          if (options.includePrerelease) {
            return true;
          } else {
            dom = minimumVersion;
          }
        }
        const eqSet = /* @__PURE__ */ new Set();
        let gt, lt;
        for (const c of sub) {
          if (c.operator === ">" || c.operator === ">=") {
            gt = higherGT(gt, c, options);
          } else if (c.operator === "<" || c.operator === "<=") {
            lt = lowerLT(lt, c, options);
          } else {
            eqSet.add(c.semver);
          }
        }
        if (eqSet.size > 1) {
          return null;
        }
        let gtltComp;
        if (gt && lt) {
          gtltComp = compare(gt.semver, lt.semver, options);
          if (gtltComp > 0) {
            return null;
          } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
            return null;
          }
        }
        for (const eq of eqSet) {
          if (gt && !satisfies(eq, String(gt), options)) {
            return null;
          }
          if (lt && !satisfies(eq, String(lt), options)) {
            return null;
          }
          for (const c of dom) {
            if (!satisfies(eq, String(c), options)) {
              return false;
            }
          }
          return true;
        }
        let higher, lower;
        let hasDomLT, hasDomGT;
        let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
        let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
        if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
          needDomLTPre = false;
        }
        for (const c of dom) {
          hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
          hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
          if (gt) {
            if (needDomGTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
                needDomGTPre = false;
              }
            }
            if (c.operator === ">" || c.operator === ">=") {
              higher = higherGT(gt, c, options);
              if (higher === c && higher !== gt) {
                return false;
              }
            } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
              return false;
            }
          }
          if (lt) {
            if (needDomLTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
                needDomLTPre = false;
              }
            }
            if (c.operator === "<" || c.operator === "<=") {
              lower = lowerLT(lt, c, options);
              if (lower === c && lower !== lt) {
                return false;
              }
            } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
              return false;
            }
          }
          if (!c.operator && (lt || gt) && gtltComp !== 0) {
            return false;
          }
        }
        if (gt && hasDomLT && !lt && gtltComp !== 0) {
          return false;
        }
        if (lt && hasDomGT && !gt && gtltComp !== 0) {
          return false;
        }
        if (needDomGTPre || needDomLTPre) {
          return false;
        }
        return true;
      };
      var higherGT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
      };
      var lowerLT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
      };
      module.exports = subset;
    }
  });

  // node_modules/semver/index.js
  var require_semver2 = __commonJS({
    "node_modules/semver/index.js"(exports, module) {
      "use strict";
      var internalRe = require_re();
      var constants = require_constants();
      var SemVer = require_semver();
      var identifiers = require_identifiers();
      var parse = require_parse();
      var valid = require_valid();
      var clean = require_clean();
      var inc = require_inc();
      var diff = require_diff();
      var major = require_major();
      var minor = require_minor();
      var patch = require_patch();
      var prerelease = require_prerelease();
      var compare = require_compare();
      var rcompare = require_rcompare();
      var compareLoose = require_compare_loose();
      var compareBuild = require_compare_build();
      var sort = require_sort();
      var rsort = require_rsort();
      var gt = require_gt();
      var lt = require_lt();
      var eq = require_eq();
      var neq = require_neq();
      var gte = require_gte();
      var lte = require_lte();
      var cmp = require_cmp();
      var coerce = require_coerce();
      var Comparator = require_comparator();
      var Range = require_range();
      var satisfies = require_satisfies();
      var toComparators = require_to_comparators();
      var maxSatisfying = require_max_satisfying();
      var minSatisfying = require_min_satisfying();
      var minVersion = require_min_version();
      var validRange = require_valid2();
      var outside = require_outside();
      var gtr = require_gtr();
      var ltr = require_ltr();
      var intersects = require_intersects();
      var simplifyRange = require_simplify();
      var subset = require_subset();
      module.exports = {
        parse,
        valid,
        clean,
        inc,
        diff,
        major,
        minor,
        patch,
        prerelease,
        compare,
        rcompare,
        compareLoose,
        compareBuild,
        sort,
        rsort,
        gt,
        lt,
        eq,
        neq,
        gte,
        lte,
        cmp,
        coerce,
        Comparator,
        Range,
        satisfies,
        toComparators,
        maxSatisfying,
        minSatisfying,
        minVersion,
        validRange,
        outside,
        gtr,
        ltr,
        intersects,
        simplifyRange,
        subset,
        SemVer,
        re: internalRe.re,
        src: internalRe.src,
        tokens: internalRe.t,
        SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: constants.RELEASE_TYPES,
        compareIdentifiers: identifiers.compareIdentifiers,
        rcompareIdentifiers: identifiers.rcompareIdentifiers
      };
    }
  });

  // node_modules/peakflow/dist/attributeselector/attributeselector.js
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
    if (exclusions.length === 0)
      return selector;
    return extend(selector, `:not(${exclusions.join(", ")})`);
  }
  function extend(selector, ...extensions) {
    if (extensions.length === 0)
      return selector;
    const selectors = split(selector);
    const selectorsWithExtensions = extensions.map((extension) => {
      return append(selectors, extension);
    });
    return selectorsWithExtensions.join(", ");
  }
  function append(selectorList, suffix) {
    return selectorList.reduce((acc, string) => {
      const prefix = acc === "" ? "" : `${acc}, `;
      return `${prefix}${string}${suffix}`;
    }, "");
  }
  function split(selector) {
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
        while (selector[i] === " ")
          i++;
        continue;
      }
      current += char;
      i++;
    }
    if (current.trim()) {
      result.push(current.trim());
    }
    return result;
  }
  var createAttribute = (attrName, defaultOptions2) => {
    const mergedDefaultOptions = {
      defaultMatchType: defaultOptions2?.defaultMatchType ?? "exact",
      defaultValue: defaultOptions2?.defaultValue ?? void 0,
      defaultExclusions: defaultOptions2?.defaultExclusions ?? []
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

  // node_modules/peakflow/dist/webflow/webflow.js
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
    checked: "w--redirected-checked",
    focus: "w--redirected-focus",
    focusVisible: "w--redirected-focus-visible"
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
    focused: `:focus-visible, [data-wf-focus-visible]`,
    focus: `.${wfclass.focus}`,
    focusVisible: `.${wfclass.focusVisible}`,
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

  // node_modules/peakflow/dist/utils/getelements.js
  function getAllElements(input, options = {}) {
    const opts = {
      single: options.single ?? false,
      node: options.node ?? document
    };
    if (typeof input === "string") {
      const elements = Array.from(opts.node.querySelectorAll(input)).filter(Boolean);
      if (elements.length === 0) {
        throw new Error(`No elements found matching selector: ${input}`);
      } else if (opts.single) {
        return [elements[0]];
      } else {
        return elements;
      }
    } else if (input instanceof HTMLElement) {
      return [input];
    } else if (Array.isArray(input)) {
      return input;
    } else if (input instanceof NodeList) {
      return Array.from(input);
    } else {
      throw new Error("Invalid input provided: must be a string, HTMLElement, array or node list.");
    }
  }
  function getElement(input, options = {}) {
    const opts = {
      single: options.single ?? true,
      node: options.node ?? document
    };
    if (typeof input === "string") {
      const elements = Array.from(opts.node.querySelectorAll(input));
      if (elements.length === 0) {
        throw new Error(`No elements found matching selector: "${input}".`);
      } else if (opts.single && elements.length > 1) {
        throw new Error(`More than 1 element found matching selector "${input}". Make your selector more specific.`);
      }
      return elements[0];
    } else if (input instanceof HTMLElement) {
      return input;
    } else {
      throw new Error("Invalid input provided: must be a string or HTMLElement.");
    }
  }

  // node_modules/peakflow/dist/form/utility.js
  var formElementSelector = createAttribute("data-form-element");
  var filterFormSelector = createAttribute("data-filter-form");
  function isRadioInput(input) {
    return input instanceof HTMLInputElement && input.type === "radio";
  }
  function isCheckboxInput(input) {
    return input instanceof HTMLInputElement && input.type === "checkbox";
  }
  function isFormInput(input) {
    return input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement;
  }
  function getRadioGroups(source, ...names) {
    let inputs;
    if (Array.isArray(source)) {
      inputs = source;
    } else if (source instanceof HTMLElement) {
      inputs = getAllElements(wf.select.formInput, { single: false, node: source });
    } else {
      throw new Error(`Invalid first parameter: expected "string", "HTMLElement" or "HTMLFormInput[]".`);
    }
    if (!inputs || !inputs.length) {
      return [];
    }
    const radioGroupMap = inputs.reduce((acc, input) => {
      if (!isRadioInput(input))
        return acc;
      if (names.length && !names.includes(input.name))
        return acc;
      if (!acc.has(input.name)) {
        acc.set(input.name, { name: input.name, inputs: [] });
      }
      acc.get(input.name).inputs.push(input);
      return acc;
    }, /* @__PURE__ */ new Map());
    return Array.from(radioGroupMap.values());
  }
  function getRadioGroupStrict(source, name) {
    const groups = getRadioGroups(source, name);
    const group = groups[0];
    if (!group || !group.name) {
      throw new Error(`Radio group "${name}" not found.`);
    }
    if (groups.length > 1) {
      console.warn(`Get radio group: Multiple groups found for name "${name}". Returning the first.`);
    }
    if (!group.inputs.length) {
      console.warn(`Radio group "${name}" has no inputs.`);
    } else if (group.inputs.length === 1) {
      console.warn(`Radio group "${name}" has only 1 input.`);
    }
    return group;
  }
  function getRadioGroup(source, name) {
    try {
      return getRadioGroupStrict(source, name);
    } catch (e) {
      console.warn(`Get radio group: ${e instanceof Error ? e.message : "Unknown error"}`);
      return null;
    }
  }
  function findFormInput(containers, inputId, selectorPrefix = wf.select.formInput) {
    const selector = `${selectorPrefix}#${inputId}`;
    const matches = Array.from(containers).flatMap((container) => Array.from(container.querySelectorAll(selector)));
    if (matches.length === 0) {
      throw new Error(`No form input found with selector "${selector}".`);
    }
    if (matches.length > 1) {
      throw new Error(`Multiple form inputs found with selector "${selector}" - expected only one.`);
    }
    return matches[0];
  }
  async function sendFormData(formData) {
    const url = `https://webflow.com/api/v1/form/${wf.siteId}`;
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/javascript, */*; q=0.01"
      },
      body: JSON.stringify(formData)
    };
    try {
      const response = await fetch(url, request);
      if (!response.ok) {
        throw new Error(`Network response "${response.status}" was not okay`);
      }
      console.log("Form submission success! Status", response.status);
      return true;
    } catch (error) {
      console.error("Form submission failed:", error);
      return false;
    }
  }
  function setChecked(input, checked, silent = false) {
    if (!isRadioInput(input) && !isCheckboxInput(input)) {
      throw new Error(`Expected an input of type checkbox or radio.`);
    }
    input.checked = checked;
    if (isRadioInput(input)) {
      const wradio = input.closest(wf.select.wradio);
      const customRadio = wradio?.querySelector(wf.select.radio);
      if (customRadio) {
        customRadio.classList.toggle(wf.class.checked, checked);
      }
    }
    if (isCheckboxInput(input)) {
      const wcheckbox = input.closest(wf.select.wcheckbox);
      const customCheckbox = wcheckbox?.querySelector(wf.select.checkbox);
      if (customCheckbox) {
        customCheckbox.classList.toggle(wf.class.checked, checked);
      }
    }
    if (silent)
      return;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function enforceButtonTypes(form) {
    if (!form)
      return;
    const buttons = form.querySelectorAll("button:not([type])");
    buttons.forEach((button) => button.setAttribute("type", "button"));
  }
  function initWfInputs(container) {
    const inputTypes = [
      ["checkbox", wf.select.checkbox],
      ["radio", wf.select.radio]
    ];
    container.querySelectorAll(wf.select.checkboxInput).forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target;
        setChecked(target, target.checked, true);
      });
    });
    container.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.checked)
          return;
        const radioGroup = getRadioGroup(container, target.name);
        radioGroup.inputs.forEach((radio) => {
          setChecked(radio, radio.value === target.value, true);
        });
      });
    });
    inputTypes.forEach(([type, customClass]) => {
      container.querySelectorAll(`input[type="${type}"]:not(${customClass})`).forEach((input) => {
        input.addEventListener("focus", (event) => {
          const target = event.target;
          const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
          if (customElement) {
            customElement.classList.add(wf.class.focus);
            if (target.matches(wf.select.focused)) {
              customElement.classList.add(wf.class.focusVisible);
            }
          }
        });
        input.addEventListener("blur", (event) => {
          const target = event.target;
          const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
          if (customElement) {
            customElement.classList.remove(wf.class.focus, wf.class.focusVisible);
          }
        });
      });
    });
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
  function validateFields(inputs, report = true) {
    let isValid2 = true;
    let invalidFields = [];
    for (const input of Array.from(inputs)) {
      if (!input.checkValidity()) {
        invalidFields.push(input);
        isValid2 = false;
        if (report) {
          reportValidity(input);
        }
        break;
      } else {
        input.classList.remove("has-error");
      }
    }
    return { isValid: isValid2, invalidFields };
  }

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

  // node_modules/date-fns/addMonths.js
  function addMonths(date, amount, options) {
    const _date = toDate(date, options?.in);
    if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
    if (!amount) {
      return _date;
    }
    const dayOfMonth = _date.getDate();
    const endOfDesiredMonth = constructFrom(options?.in || date, _date.getTime());
    endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
    const daysInMonth = endOfDesiredMonth.getDate();
    if (dayOfMonth >= daysInMonth) {
      return endOfDesiredMonth;
    } else {
      _date.setFullYear(
        endOfDesiredMonth.getFullYear(),
        endOfDesiredMonth.getMonth(),
        dayOfMonth
      );
      return _date;
    }
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

  // node_modules/date-fns/isDate.js
  function isDate(value) {
    return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
  }

  // node_modules/date-fns/isValid.js
  function isValid(date) {
    return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
  }

  // node_modules/date-fns/startOfMonth.js
  function startOfMonth(date, options) {
    const _date = toDate(date, options?.in);
    _date.setDate(1);
    _date.setHours(0, 0, 0, 0);
    return _date;
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

  // node_modules/peakflow/dist/form/cms-select.js
  var CMSSelect = class _CMSSelect {
    constructor(component, options = {}) {
      this.opts = {
        id: void 0
      };
      this.attr = _CMSSelect.attr;
      this.onChangeCallbacks = /* @__PURE__ */ new Map();
      try {
        this.source = getElement(component);
        if (!this.source) {
          throw new Error(`Source list element is not defined.`);
        }
        this.opts = { id: options.id ?? this.opts.id };
        this.id = this.opts.id || this.source.getAttribute(this.attr.id);
        this.source.setAttribute(this.attr.id, this.opts.id);
        this.waitEvent = this.source.dataset.formSelectWait || null;
        this.targets = getAllElements(this.selector("target"));
        this.readValues();
        this.initOnChange();
      } catch (e) {
        console.error(`Failed to create CMSSelect instance: ${e.message}`);
      }
    }
    /**
     * Static selector
     */
    static selector(element, instance) {
      const base = _CMSSelect.attributeSelector(element);
      const instanceSelector = instance ? `[${_CMSSelect.attr.id}="${instance}"]` : "";
      if (element === "option") {
        return `${instanceSelector} ${base}`.trim();
      } else {
        return `${base}${instanceSelector}`;
      }
    }
    /**
     * Instance selector
     */
    selector(element, local = true) {
      return local ? _CMSSelect.selector(element, this.id) : _CMSSelect.selector(element);
    }
    static initializeAll() {
      try {
        const sourceLists = getAllElements(_CMSSelect.selector("source"));
        sourceLists.forEach((list) => {
          const cmsSelect = new _CMSSelect(list);
          if (cmsSelect.initWaitEvent(true))
            return;
          cmsSelect.insertOptions();
        });
      } catch (e) {
        console.error(`Failed to initialize all CMS select components: ${e.message}`);
      }
    }
    static createOption(value) {
      const optionElement = document.createElement("option");
      optionElement.setAttribute("value", value);
      optionElement.innerText = value;
      return optionElement;
    }
    static insertOptions(targets, values) {
      const targetList = getAllElements(targets, { single: true });
      values.forEach((val) => {
        if (val) {
          const option = _CMSSelect.createOption(val);
          targetList.forEach((target) => target.appendChild(option));
        } else {
          console.warn("CMS select: skip empty option");
        }
      });
    }
    static clearOptions(targets, keepEmpty) {
      const targetList = getAllElements(targets, { single: true });
      targetList.forEach((target) => {
        let options = Array.from(target.querySelectorAll("option"));
        if (keepEmpty)
          options = options.filter((option) => Boolean(option.value));
        options.forEach((option) => option.remove());
      });
    }
    /**
     * @param graceful Whether to throw an error if the wait event is invalid.
     * @returns A boolean indicating whether the wait event was initialized successfully.
     */
    initWaitEvent(graceful = false) {
      if (this.waitEvent) {
        this.source.addEventListener(this.waitEvent, () => {
          this.insertOptions();
        });
        return true;
      } else {
        const message2 = `The wait event name "${this.waitEvent}" is invalid.`;
        if (graceful)
          return false;
        throw new Error(message2);
      }
    }
    readValues() {
      this.values = [];
      const optionElements = this.source.querySelectorAll(_CMSSelect.selector("option"));
      optionElements.forEach((element) => {
        this.values.push(this.getSelectValue(element));
      });
    }
    insertOptions() {
      _CMSSelect.insertOptions(this.targets, this.values);
    }
    getSelectValue(item) {
      const prefix = item.getAttribute(this.attr.prefix) || "";
      const value = item.getAttribute(this.attr.value) || "";
      const optionValue = prefix ? `${prefix} ${value}` : value;
      return optionValue;
    }
    initOnChange() {
      this.targets.forEach((target) => {
        target.addEventListener("change", () => {
          this.triggerOnChange();
        });
      });
    }
    onChange(name, callback) {
      this.onChangeCallbacks.set(name, callback);
    }
    clearOnChange(name) {
      this.onChangeCallbacks.delete(name);
    }
    triggerOnChange() {
      for (const callback of this.onChangeCallbacks.values()) {
        callback();
      }
    }
  };
  CMSSelect.attr = {
    id: "data-cms-select-id",
    element: "data-cms-select-element",
    prefix: "data-cms-select-prefix",
    value: "data-cms-select-value",
    wait: "data-cms-select-wait",
    status: "data-cms-select-status"
  };
  CMSSelect.attributeSelector = createAttribute("data-cms-select-element");

  // node_modules/peakflow/dist/utils/parameterize.js
  function parameterize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  }

  // node_modules/peakflow/dist/form/formfield.js
  var FormField = class {
    constructor(data = null) {
      this.listeners = /* @__PURE__ */ new Set();
      if (!data) {
        return;
      }
      this.id = data.id || `field-${Math.random().toString(36).substring(2)}`;
      this.label = data.label || `Untitled`;
      this.value = data.value || "";
      this.required = data.required || false;
      this.type = data.type || "text";
      if (["radio", "checkbox"].includes(this.type)) {
        this.checked = data.checked || false;
      }
      if (this.type === "checkbox" && !this.checked) {
        this.value = "Nicht angew\xE4hlt";
      }
    }
    setValue(newValue) {
      this.value = newValue;
      this.listeners.forEach((callback) => callback(newValue));
    }
    onChange(callback) {
      this.listeners.add(callback);
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
    serialize() {
      const serialized = {
        id: this.id,
        label: this.label,
        value: this.value,
        required: this.required,
        type: this.type
      };
      if (["radio", "checkbox"].includes(this.type)) {
        serialized.checked = this.checked;
      }
      return serialized;
    }
  };
  function fieldFromInput(input, index) {
    if (input.type === "radio" && !input.checked) {
      return new FormField();
    }
    const id = input.id || parameterize(input.dataset.name || `untitled ${index}`);
    const field = new FormField({
      id: isRadioInput(input) ? input.name : id,
      label: input.dataset.name || `Untitled ${index}`,
      value: input.value,
      required: input.required || false,
      type: input.type,
      checked: isCheckboxInput(input) || isRadioInput(input) ? input.checked : void 0
    });
    return field;
  }

  // node_modules/peakflow/dist/form/fieldgroup.js
  var FieldGroup = class _FieldGroup {
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
    validate(report = true) {
      const invalidFields = [];
      for (const field of this.fields.values()) {
        if (field.validate(report))
          continue;
        invalidFields.push(field);
      }
      this.validation = {
        isValid: invalidFields.length === 0,
        invalidFields
      };
      return this.validation;
    }
    /**
     * Serialize this `FieldGroup`.
     *
     * @returns `this.fields` as an object
     */
    serialize() {
      let fields = {};
      this.fields.forEach((field, key) => {
        fields[key] = field.serialize();
      });
      return fields;
    }
    /**
     * Deserialize a `FieldGroup`.
     *
     * @returns A new `FieldGroup` instance
     */
    static deserialize(fieldGroupData) {
      const fieldsMap = /* @__PURE__ */ new Map();
      Object.entries(fieldGroupData).forEach(([key, fieldData]) => {
        const field = new FormField(fieldData);
        fieldsMap.set(key, field);
      });
      return new _FieldGroup(fieldsMap);
    }
  };

  // node_modules/peakflow/dist/form/formmessage.js
  var FormMessage = class {
    /**
     * Constructs a new FormMessage instance.
     * @param componentName The name of the component (used in `data-message-component`).
     * @param messageFor The target form field identifier (used in `data-message-for`).
     */
    constructor(componentName, messageFor) {
      this.initialized = false;
      this.resetTimeoutId = null;
      this.messageFor = messageFor;
      const component = document.querySelector(`[data-message-component="${componentName}"][data-message-for="${this.messageFor}"]`);
      if (!component) {
        console.warn(`No FormMessage component was found: ${componentName}, ${this.messageFor}`);
        return;
      }
      this.component = component;
      this.messageElement = this.component?.querySelector('[data-message-element="message"]') || null;
      this.reset();
      this.initialized = true;
    }
    /**
     * Displays an informational message.
     * @param message The message text to display. Defaults to `null`.
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    info(message2 = null, silent = false) {
      if (!this.initialized)
        return;
      this.clearTimeout();
      if (!silent) {
        this.component.setAttribute("aria-live", "polite");
      }
      this.setMessage(message2, "info", silent);
    }
    /**
     * Displays an error message.
     * @param message The message text to display. Defaults to `null`.
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    error(message2 = null, silent = false) {
      if (!this.initialized)
        return;
      this.clearTimeout();
      if (!silent) {
        this.component.setAttribute("role", "alert");
        this.component.setAttribute("aria-live", "assertive");
      }
      this.setMessage(message2, "error", silent);
    }
    /**
     * Resets the message component, hiding any displayed message.
     */
    reset() {
      if (!this.initialized)
        return;
      this.clearTimeout();
      this.component.classList.remove("info", "error");
      if (this.messageElement) {
        this.messageElement.textContent = "";
      }
      this.component.removeAttribute("aria-live");
      this.component.removeAttribute("role");
    }
    /**
     * Schedules an automatic reset or custom action of the message component after a `delay`.
     * Cancels any existing reset timer.
     *
     * @param delay - Time in milliseconds after which the reset or callback is triggered.
     * @param callback - Optional function to execute when the timer fires instead of the default reset.
     */
    setTimedReset(delay, callback) {
      if (!this.initialized)
        return;
      this.clearTimeout();
      this.resetTimeoutId = setTimeout(() => {
        if (callback) {
          callback();
        } else {
          this.reset();
        }
        this.resetTimeoutId = null;
      }, delay);
    }
    /**
     * Cancels any existing timer.
     */
    clearTimeout() {
      if (!this.initialized)
        return;
      if (this.resetTimeoutId !== null) {
        clearTimeout(this.resetTimeoutId);
        this.resetTimeoutId = null;
      }
    }
    /**
     * Sets the message text and type (private method).
     * @param message The message text to display. Defaults to `null`.
     * @param type The type of message (`"info"` or `"error"`).
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    setMessage(message2 = null, type, silent = false) {
      if (!this.initialized)
        return;
      if (this.messageElement && message2) {
        this.messageElement.textContent = message2;
      } else if (!this.messageElement) {
        console.warn("Message text element not found.");
      }
      this.component.classList.remove("info", "error");
      this.component.classList.add(type);
      if (silent)
        return;
      this.component.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  // node_modules/peakflow/dist/form/formdecision.js
  var FormDecision = class _FormDecision {
    static get attr() {
      return {
        component: "data-decision-component",
        element: "data-decision-element",
        pathId: "data-path-id",
        required: "data-decision-required"
      };
    }
    get currentPath() {
      return this._currentPath;
    }
    set currentPath(pathId) {
      this._currentPath = pathId;
    }
    /**
     * Constructs a new FormDecision instance.
     * @param component The FormDecision element.
     * @param id Unique identifier for the specific instance.
     */
    constructor(component, options) {
      this.opts = {
        id: void 0,
        clearPathOnChange: false,
        defaultPath: null
      };
      this.paths = /* @__PURE__ */ new Map();
      this.errorMessages = {};
      this.defaultErrorMessage = "Please complete the required fields.";
      this.onChangeCallback = () => {
      };
      this.attr = _FormDecision.attr;
      this.selector = createAttribute(_FormDecision.attr.element);
      if (!component) {
        console.error(`FormDecision: Component not found.`);
        return;
      } else if (!component.hasAttribute("data-decision-component")) {
        console.error(`FormDecision: Selected element is not a FormDecision component:`, component);
        return;
      }
      this.component = component;
      this.opts = {
        id: options.id || this.component.getAttribute(this.attr.component) || this.opts.id,
        clearPathOnChange: options.clearPathOnChange || this.opts.clearPathOnChange,
        defaultPath: options.defaultPath || this.opts.defaultPath
      };
      this.formMessage = new FormMessage("FormDecision", this.opts.id);
      this.initialize();
    }
    /**
     * Initializes the FormDecision instance by setting up decision inputs & paths as well as their event listeners.
     */
    initialize() {
      const decisionFieldsWrapper = this.component.querySelector(this.selector("decision")) || this.component;
      const decisionInputsList = decisionFieldsWrapper.querySelectorAll(this.selector("input"));
      this.decisionInputs = Array.from(decisionInputsList);
      if (this.decisionInputs.length === 0) {
        console.warn(`Decision component "${this.opts.id}" does not contain any decision input elements.`);
        return;
      }
      this.decisionInputs.forEach((input) => {
        const pathId = input.getAttribute(this.attr.pathId) || input.value;
        const pathSelector = `${this.selector("path")}[${this.attr.pathId}="${pathId}"]`;
        const path = this.component.querySelector(pathSelector);
        if (path) {
          path.style.display = "none";
          this.initRequiredAttributes(path);
        }
        this.paths.set(pathId, path);
        input.addEventListener("change", (event) => {
          this.changeToPath(pathId, event);
        });
      });
      this.component.addEventListener("change", () => this.formMessage.reset());
    }
    /**
     * Handles changes to the decision input fields and updates the associated path visibility.
     * @param path The HTMLElement that contains the form fields of this path.
     * @param event The event that invokes this change.
     */
    changeToPath(pathId, event) {
      if (pathId === null) {
        this.hideAllPaths();
        this.decisionInputs.forEach((input) => {
          setChecked(input, false);
        });
      }
      if (this.currentPath === pathId)
        return;
      const prevPath = this.paths.get(this.currentPath);
      if (prevPath) {
        prevPath.style.display = "none";
      }
      this.currentPath = pathId;
      const path = this.paths.get(this.currentPath);
      if (path) {
        path.style.removeProperty("display");
      }
      this.paths.forEach((path2, pathId2) => {
        this.updateRequiredAttributes(pathId2);
        if (this.opts.clearPathOnChange) {
          this.clearPath(pathId2);
        }
      });
      this.onChangeCallback();
      this.formMessage.reset();
    }
    reset(force) {
      this.clearAllPaths();
      this.changeToPath(force !== void 0 ? force : this.opts.defaultPath);
    }
    /**
     * Sync the path shown do the actual selected path, if the component ever gets out of sync.
     */
    sync() {
      const path = this.getCurrentPath();
      this.changeToPath(path);
    }
    /**
     * Sets the display of all path elements to 'none'.
     */
    hideAllPaths() {
      this.paths.forEach((path) => {
        if (!path)
          return;
        path.style.display = "none";
      });
    }
    /**
     * Retrieves the currently selected decision input.
     * @returns The selected input element, or undefined if none is selected.
     */
    getSelectedInput() {
      return Array.from(this.decisionInputs).find((input) => input.checked);
    }
    /**
     * Retrieves the current `PathId` from the currently selected decision input.
     */
    getCurrentPath() {
      const selected = this.getSelectedInput();
      if (!selected)
        return null;
      return selected.getAttribute(this.attr.pathId);
    }
    /**
     * Validates the FormDecision based on the selected path to ensure the form's correctness.
     * @returns A boolean indicating whether the validation passed.
     */
    validate() {
      const selectedInput = this.getSelectedInput();
      const { isValid: decisionValid } = validateFields(this.decisionInputs);
      if (!decisionValid || !selectedInput) {
        console.warn("No decision selected!");
        this.handleValidationMessages(false);
        return false;
      }
      const pathId = selectedInput.getAttribute(this.attr.pathId) || selectedInput.value;
      const isValid2 = !this.paths.has(pathId) || this.checkPathValidity(pathId);
      this.handleValidationMessages(isValid2);
      return isValid2;
    }
    /**
     * Sets custom error messages for the decision inputs.
     * @param messages An object mapping decision input values to error messages.
     * @param defaultMessage An optional default error message to use when no specific message is provided.
     */
    setErrorMessages(messages, defaultMessage) {
      this.errorMessages = messages;
      if (defaultMessage) {
        this.defaultErrorMessage = defaultMessage;
      }
    }
    /**
     * Validates the fields within the specified path and returns whether they are valid.
     * @param pathIndex The index of the path to validate.
     * @returns A boolean indicating whether the specified path is valid.
     */
    checkPathValidity(pathId) {
      const pathElement = this.paths.get(pathId);
      if (!pathElement)
        return true;
      const inputs = pathElement.querySelectorAll(wf.select.formInput);
      const { isValid: isValid2 } = validateFields(inputs, true);
      return isValid2;
    }
    initRequiredAttributes(path) {
      const inputs = path.querySelectorAll(wf.select.input);
      inputs.forEach((input) => {
        input.setAttribute(this.attr.required, `${input.required}`);
        input.required = false;
      });
    }
    /**
     * Updates the required attributes of input fields within the paths based on the selected decision input.
     */
    updateRequiredAttributes(pathId) {
      const path = this.paths.get(pathId);
      if (!path)
        return;
      if (pathId === this.currentPath) {
        const pathInputs = path.querySelectorAll(wf.select.formInput);
        pathInputs.forEach((input) => {
          const isRequired = input.matches(`[${this.attr.required}="required"], [${this.attr.required}="true"]`);
          input.required = isRequired;
        });
      } else {
        const pathInputs = path.querySelectorAll(wf.select.formInput);
        pathInputs.forEach((input) => {
          input.required = false;
        });
      }
    }
    clearPath(pathId, silent = false) {
      const path = this.paths.get(pathId);
      if (!path)
        return;
      const pathInputs = path.querySelectorAll(wf.select.formInput);
      pathInputs.forEach((input) => {
        input.value = null;
        if (silent)
          return;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
    clearAllPaths(clearCurrentPath = true) {
      this.paths.forEach((path, pathId) => {
        if (clearCurrentPath) {
          this.clearPath(pathId);
        } else if (pathId !== this.currentPath) {
          this.clearPath(pathId);
        }
      });
    }
    /**
     * Displays validation message based on the current path.
     * @param currentGroupValid A boolean indicating whether the current group of inputs is valid.
     */
    handleValidationMessages(currentGroupValid) {
      if (!currentGroupValid) {
        const customMessage = this.errorMessages[this.currentPath] || this.defaultErrorMessage;
        this.formMessage.error(customMessage);
      } else {
        this.formMessage.reset();
      }
    }
    onChange(callback) {
      this.clearOnChange();
      this.onChangeCallback = callback;
    }
    clearOnChange() {
      this.onChangeCallback = () => {
      };
    }
  };
  FormDecision.selector = createAttribute(FormDecision.attr.element);

  // node_modules/peakflow/dist/utils/deepmerge.js
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = target[key];
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== void 0) {
        result[key] = sourceValue;
      }
    }
    return result;
  }
  function isPlainObject(value) {
    return value !== void 0 && value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
  }

  // node_modules/peakflow/dist/utils/maptoobject.js
  function mapToObject(map, stringify = false) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = value instanceof Map ? mapToObject(value, stringify) : stringify ? JSON.stringify(value) : value;
    }
    return obj;
  }

  // node_modules/peakflow/dist/utils/objecttomap.js
  function objectToMap(obj, deep = false) {
    const map = /* @__PURE__ */ new Map();
    for (const [key, value] of Object.entries(obj)) {
      if (deep && value instanceof Object && !(value instanceof Map)) {
        map.set(key, objectToMap(value, true));
      } else {
        map.set(key, value);
      }
    }
    return map;
  }

  // node_modules/peakflow/dist/form/multistep.js
  var stepsElementSelector = createAttribute("data-steps-element", {
    defaultExclusions: ['[data-steps-element="component"] [data-steps-element="component"] *']
  });
  var stepsTargetSelector = createAttribute("data-step-target");
  var stepsNavSelector = createAttribute("data-steps-nav");
  var STEPS_PAGINATION_ITEM_SELECTOR = `button${stepsTargetSelector()}`;
  var MultiStepForm = class {
    set currentStep(index) {
      this._currentStep = index;
    }
    get currentStep() {
      return this._currentStep;
    }
    constructor(component, options) {
      this.options = {
        recaptcha: false,
        navigation: {
          hideInStep: -1
        },
        excludeInputSelectors: [],
        nested: false,
        pagination: {
          doneClass: "is-done",
          activeClass: "is-active"
        },
        validation: {
          validate: true,
          reportValidity: true
        }
      };
      this.initialized = false;
      this._currentStep = 0;
      this.customComponents = [];
      this.component = component;
      this.options = deepMerge(this.options, options);
      this.validateComponent();
      this.cacheDomElements();
      this.setupForm();
      this.setupEventListeners();
      this.initialized = true;
    }
    validateComponent() {
      if (!this.component.getAttribute("data-steps-element")) {
        console.error(`Form Steps: Component is not a steps component or is missing the attribute ${stepsElementSelector("component")}.
Component:`, this.component);
        throw new Error("Component is not a valid multi-step form component.");
      }
    }
    cacheDomElements() {
      this.formElement = this.component.querySelector("form");
      if (!this.options.nested && !this.formElement) {
        throw new Error("Form element not found within the specified component.");
      }
      if (this.options.nested) {
        this.formElement = this.component;
      }
      this.formSteps = this.component.querySelectorAll(stepsElementSelector("step"));
      this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
      this.navigationElement = this.component.querySelector(stepsElementSelector("navigation"));
      this.buttonsNext = this.component.querySelectorAll(stepsNavSelector("next"));
      this.buttonsPrev = this.component.querySelectorAll(stepsNavSelector("prev"));
      this.successElement = this.component.querySelector(formElementSelector("success"));
      this.errorElement = this.component.querySelector(formElementSelector("error"));
      this.submitButton = this.component.querySelector(formElementSelector("submit"));
    }
    setupForm() {
      if (!this.formSteps.length) {
        console.warn(`Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`, this.component.querySelector(stepsElementSelector("list")));
        return;
      }
      if (!this.options.nested) {
        enforceButtonTypes(this.formElement);
        this.formElement.setAttribute("novalidate", "");
      }
      this.formElement.dataset.state = "initialized";
      initWfInputs(this.component);
      this.changeToStep(this.currentStep);
    }
    setupEventListeners() {
      if (!this.options.nested) {
        this.formElement.addEventListener("submit", (event) => {
          event.preventDefault();
          this.submitToWebflow();
        });
      }
      this.initPagination();
      this.initChangeStepOnKeydown();
    }
    addCustomComponent(component) {
      this.customComponents.push(component);
    }
    async submitToWebflow() {
      if (this.options.nested) {
        throw new Error(`Can't submit a nested MultiStepForm.`);
      }
      if (this.currentStep !== this.formSteps.length - 1) {
        console.error("SUBMIT ERROR: the current step is not the last step. Can only submit the MultiStepForm in the last step.");
        return;
      }
      const allStepsValid = this.validateAllSteps();
      if (!allStepsValid) {
        console.warn("Form submission blocked: Not all steps are valid.");
        return;
      }
      this.formElement.dataset.state = "sending";
      if (this.submitButton) {
        this.submitButton.dataset.defaultText = this.submitButton.value;
        this.submitButton.value = this.submitButton.dataset.wait || "Wird gesendet ...";
      }
      const formData = this.buildJsonForWebflow();
      debugger;
      const success = await sendFormData(formData);
      if (success) {
        this.onFormSuccess();
      } else {
        this.onFormError();
      }
    }
    buildJsonForWebflow() {
      if (this.options.nested) {
        throw new Error(`Can't get FormData for a nested MultiStepForm.`);
      }
      const fields = this.getFormData();
      if (this.options.recaptcha) {
        const recaptcha = this.formElement.querySelector("#g-recaptcha-response").value;
        fields["g-recaptcha-response"] = recaptcha;
      }
      return {
        name: this.formElement.dataset.name,
        pageId: wf.pageId,
        elementId: this.formElement.dataset.wfElementId,
        source: window.location.href,
        test: false,
        fields,
        dolphin: false
      };
    }
    onFormSuccess() {
      if (this.errorElement)
        this.errorElement.style.display = "none";
      if (this.successElement)
        this.successElement.style.display = "block";
      this.formElement.style.display = "none";
      this.formElement.dataset.state = "success";
      this.formElement.dispatchEvent(new CustomEvent("formSuccess"));
      if (this.submitButton) {
        this.submitButton.value = this.submitButton.dataset.defaultText || "Submit";
      }
    }
    onFormError() {
      if (this.errorElement)
        this.errorElement.style.display = "block";
      if (this.successElement)
        this.successElement.style.display = "none";
      this.formElement.dataset.state = "error";
      this.formElement.dispatchEvent(new CustomEvent("formError"));
      if (this.submitButton) {
        this.submitButton.value = this.submitButton.dataset.defaultText || "Submit";
      }
    }
    initChangeStepOnKeydown() {
      this.formSteps.forEach((step, index) => {
        step.dataset.stepId = index.toString();
        step.classList.toggle("hide", index !== this.currentStep);
        step.querySelectorAll(wf.select.formInput).forEach((input) => {
          input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              this.changeToNext();
            }
          });
        });
      });
    }
    initPagination() {
      this.paginationItems.forEach((item, index) => {
        item.dataset.stepTarget = index.toString();
        item.addEventListener("click", (event) => {
          event.preventDefault();
          this.changeToStep(index);
        });
      });
      this.buttonsNext.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          this.changeToNext();
        });
      });
      this.buttonsPrev.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          this.changeToPrevious();
        });
      });
    }
    /**
     * Change to the next step.
     */
    changeToNext() {
      if (this.currentStep < this.formSteps.length - 1) {
        this.changeToStep(this.currentStep + 1);
      }
    }
    /**
     * Change to the previous step.
     */
    changeToPrevious() {
      if (this.currentStep > 0) {
        this.changeToStep(this.currentStep - 1);
      }
    }
    /**
     * Change to the specified step by `index`.
     *
     * If moving forward, the method will validate all intermediate steps before
     * allowing navigation. If validation fails on any step, it will halt and move
     * to the invalid step instead.
     *
     * Use the CustomEvent "changeStep" to hook into step changes.
     *
     * @param index - The zero-based index of the step to navigate to.
     */
    changeToStep(index) {
      if (this.currentStep === index && this.initialized) {
        return;
      }
      if (index > this.currentStep && this.initialized) {
        for (let step = this.currentStep; step < index; step++) {
          if (!this.validateCurrentStep(step)) {
            this.changeToStep(step);
            return;
          }
        }
        this.component.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
      const event = new CustomEvent("changeStep", {
        detail: { previousStep: this.currentStep, currentStep: index }
      });
      this.component.dispatchEvent(event);
      this.updateStepVisibility(index);
      this.updatePagination(index);
      this.currentStep = index;
      console.log(`Step ${this.currentStep + 1}/${this.formSteps.length}`);
    }
    updateStepVisibility(target) {
      const current = this.formSteps[this.currentStep];
      const next = this.formSteps[target];
      if (this.options.onStepChange) {
        this.options.onStepChange({
          index: target,
          currentStep: current,
          targetStep: next
        });
      } else {
        current.classList.add("hide");
        next.classList.remove("hide");
      }
    }
    set onChangeStep(callback) {
      this.options.onStepChange = callback;
    }
    updatePagination(target) {
      this.buttonsPrev.forEach((button) => {
        if (target === 0) {
          button.style.visibility = "hidden";
          button.style.opacity = "0";
        } else {
          button.style.visibility = "visible";
          button.style.opacity = "1";
        }
      });
      this.buttonsNext.forEach((button) => {
        if (target === this.formSteps.length - 1) {
          button.style.visibility = "hidden";
          button.style.opacity = "0";
        } else {
          button.style.visibility = "visible";
          button.style.opacity = "1";
        }
      });
      if (target === this.options.navigation.hideInStep) {
        this.navigationElement.style.visibility = "hidden";
        this.navigationElement.style.opacity = "0";
      } else {
        this.navigationElement.style.removeProperty("visibility");
        this.navigationElement.style.removeProperty("opacity");
      }
      this.paginationItems.forEach((step, index) => {
        step.classList.toggle(this.options.pagination.doneClass, index < target);
        step.classList.toggle(this.options.pagination.activeClass, index === target);
      });
    }
    validateAllSteps() {
      let allValid = true;
      this.formSteps.forEach((_, index) => {
        if (!this.validateCurrentStep(index)) {
          console.warn(`Step ${index + 1} is invalid.`);
          allValid = false;
          this.changeToStep(index);
        }
      });
      return allValid;
    }
    validateCurrentStep(stepIndex) {
      if (!this.options.validation.validate)
        return true;
      const basicError = `Validation failed for step: ${stepIndex + 1}/${this.formSteps.length}`;
      const currentStepElement = this.formSteps[stepIndex];
      const inputs = currentStepElement.querySelectorAll(wf.select.formInput);
      const filteredInputs = Array.from(inputs).filter((input) => {
        const isExcluded = this.options.excludeInputSelectors.some((selector) => {
          return input.closest(`${selector}`) !== null || input.matches(selector);
        });
        return !isExcluded;
      });
      let { isValid: isValid2 } = validateFields(filteredInputs, this.options.validation.reportValidity);
      if (!isValid2 && this.options.validation.reportValidity) {
        console.warn(`${basicError}: Standard validation is not valid`);
      }
      if (!isValid2)
        return false;
      const customValidators = this.customComponents.filter((entry) => entry.stepIndex === stepIndex).map((entry) => () => entry.validator());
      const customValid = customValidators?.every((validator) => validator()) ?? true;
      if (this.options.validation.reportValidity && !customValid) {
        console.warn(`${basicError}: Custom validation is not valid`);
      }
      return isValid2 && customValid;
    }
    /**
     * Gets data of all form fields in a `FormFieldMap`.
     *
     * @step Step index of the multi step form
     * @returns `FormFieldMap` - A map of field id (string) to a `FormField` class instance
     *
     * Fields that are a descendant of '[data-steps-element="custom-component"]' are excluded.
     */
    getFieldMapForStep(step) {
      let fields = /* @__PURE__ */ new Map();
      const stepElement = this.formSteps[step];
      const stepInputs = stepElement.querySelectorAll(exclude(wf.select.formInput, `${stepsElementSelector("custom-component", { exclusions: [] })} *`));
      stepInputs.forEach((input, inputIndex) => {
        const entry = fieldFromInput(input, inputIndex);
        if (entry.id) {
          fields.set(entry.id, entry.value);
        }
      });
      return fields;
    }
    getFieldMap() {
      const fields = Array.from(this.formSteps).reduce((acc, _, stepIndex) => {
        const stepData = this.getFieldMapForStep(stepIndex);
        return new Map([
          ...acc,
          ...stepData
        ]);
      }, /* @__PURE__ */ new Map());
      return fields;
    }
    getFormData() {
      const customFields = this.customComponents.reduce((acc, entry) => {
        return {
          ...acc,
          ...entry.getData ? entry.getData() : {}
        };
      }, {});
      const fields = {
        ...mapToObject(this.getFieldMap(), false),
        ...customFields
      };
      return fields;
    }
    getFormInput(id) {
      const selector = extend(wf.select.formInput, `#${id}`);
      return this.component.querySelector(selector);
    }
  };

  // node_modules/peakflow/dist/accordion/accordion.js
  var Accordion = class {
    constructor(component) {
      this.isOpen = false;
      this.onClickCallback = () => {
      };
      this.component = component;
      this.trigger = component.querySelector('[data-animate="trigger"]');
      this.uiTrigger = component.querySelector('[data-animate="ui-trigger"]');
      this.icon = component.querySelector('[data-animate="icon"]');
    }
    onClick(callback) {
      this.removeOnClick();
      this.onClickCallback = callback;
      this.uiTrigger.addEventListener("click", this.onClickCallback);
    }
    removeOnClick() {
      this.uiTrigger.removeEventListener("click", this.onClickCallback);
    }
    open() {
      if (!this.isOpen) {
        this.trigger.click();
        setTimeout(() => {
          this.icon.classList.add("is-open");
        }, 200);
        this.isOpen = true;
      }
    }
    close() {
      if (this.isOpen) {
        this.trigger.click();
        setTimeout(() => {
          this.icon.classList.remove("is-open");
        }, 200);
        this.isOpen = false;
      }
    }
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
    scrollIntoView(scrollWrapper, offset = 0) {
      const elementPosition = this.component.getBoundingClientRect().top;
      if (scrollWrapper) {
        const wrapperPosition = scrollWrapper.getBoundingClientRect().top;
        offset = scrollWrapper.querySelector('[data-scroll-child="sticky"]').clientHeight;
        scrollWrapper.scrollBy({
          top: elementPosition - wrapperPosition - offset - 2,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: elementPosition + window.scrollY - offset - 2,
          behavior: "smooth"
        });
      }
    }
  };

  // node_modules/peakflow/dist/scroll/scrollbar.js
  function getVisibleScrollbarWidth(element) {
    return isScrollbarVisible(element) ? getScrollbarWidth(element) : 0;
  }
  function isScrollbarVisible(element) {
    const style = getComputedStyle(element);
    const overflowY = style.overflowY;
    if (overflowY === "hidden" || overflowY === "clip") {
      return false;
    }
    if (element === document.body || element === document.documentElement) {
      return window.innerWidth > document.documentElement.clientWidth;
    }
    return element.scrollHeight > element.clientHeight;
  }
  function getScrollbarWidth(element) {
    const scrollDiv = document.createElement("div");
    scrollDiv.style.visibility = "hidden";
    scrollDiv.style.overflow = "scroll";
    scrollDiv.style.position = "absolute";
    scrollDiv.style.top = "-9999px";
    scrollDiv.style.width = "100px";
    element.appendChild(scrollDiv);
    const innerDiv = document.createElement("div");
    innerDiv.style.width = "100%";
    scrollDiv.appendChild(innerDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - innerDiv.offsetWidth;
    scrollDiv.remove();
    return scrollbarWidth;
  }
  function addScrollbarPadding(element, scrollbarElement) {
    if (!scrollbarElement)
      scrollbarElement = element;
    const scrollbarWidth = getVisibleScrollbarWidth(scrollbarElement);
    const currentPadding = parseFloat(getComputedStyle(element).paddingRight || "0");
    if (scrollbarWidth === 0)
      return;
    if (!element.dataset.originalPaddingRight) {
      element.dataset.originalPaddingRight = currentPadding.toString();
    }
    element.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
  function removeScrollbarPadding(element) {
    const originalPadding = element.dataset.originalPaddingRight;
    if (originalPadding !== void 0) {
      element.style.paddingRight = `${originalPadding}px`;
      if (originalPadding === "0") {
        element.style.removeProperty("paddingRight");
      }
      delete element.dataset.originalPaddingRight;
    }
  }

  // node_modules/peakflow/dist/scroll/lock.js
  var scrollLockCount = 0;
  function lockBodyScroll(smooth) {
    scrollLockCount++;
    if (scrollLockCount === 1) {
      if (smooth)
        addScrollbarPadding(document.body);
      document.body.style.overflow = "hidden";
    }
  }
  function unlockBodyScroll(smooth) {
    if (scrollLockCount > 0)
      scrollLockCount--;
    if (scrollLockCount === 0) {
      if (smooth)
        removeScrollbarPadding(document.body);
      document.body.style.removeProperty("overflow");
    }
  }

  // node_modules/peakflow/dist/scroll/handler.js
  var ScrollHandler = class {
    constructor(config) {
      this.scrollTimeoutId = null;
      this.scrollWrapper = config.scrollWrapper;
      this.stickyTop = config.stickyTop ?? null;
      this.stickyBottom = config.stickyBottom ?? null;
      if (!this.scrollWrapper) {
        throw new Error(`Couldn't construct ScrollHandler: The property "scrollWrapper" can't be undefined`);
      }
    }
    clearScrollTimeout() {
      if (this.scrollTimeoutId !== null) {
        clearTimeout(this.scrollTimeoutId);
        this.scrollTimeoutId = null;
      }
    }
    scrollTo(element, options = {}) {
      this.clearScrollTimeout();
      if (!element || !this.scrollWrapper.contains(element)) {
        return Promise.reject(new Error("The element to scroll into view is not inside the scroll container."));
      }
      if (!isScrollbarVisible(this.scrollWrapper))
        return Promise.resolve();
      const opts = {
        delay: options.delay ?? 0,
        offset: options.offset ?? 0,
        position: options.position ?? "start",
        behavior: options.behavior ?? "smooth"
      };
      return new Promise((resolve) => {
        this.scrollTimeoutId = window.setTimeout(() => {
          const elementRect = element.getBoundingClientRect();
          const wrapperRect = this.scrollWrapper.getBoundingClientRect();
          const stickyTopHeight = this.stickyTop?.clientHeight || 0;
          const stickyBottomHeight = this.stickyBottom?.clientHeight || 0;
          const relativePosition = elementRect.top - wrapperRect.top;
          const isFullyVisible = elementRect.top >= wrapperRect.top + stickyTopHeight && elementRect.bottom <= wrapperRect.bottom - stickyBottomHeight;
          let scrollOffset = 0;
          switch (opts.position) {
            case "start":
              scrollOffset = relativePosition - stickyTopHeight - opts.offset - 2;
              break;
            case "center":
              scrollOffset = relativePosition - this.scrollWrapper.clientHeight / 2 + element.clientHeight / 2 + opts.offset;
              break;
            case "end":
              scrollOffset = relativePosition - this.scrollWrapper.clientHeight + element.clientHeight + stickyBottomHeight + opts.offset;
              break;
            case "nearest":
              if (isFullyVisible) {
                this.clearScrollTimeout();
                resolve();
                return;
              }
              scrollOffset = relativePosition - this.scrollWrapper.clientHeight / 2 + element.clientHeight / 2 + opts.offset;
              break;
          }
          this.scrollWrapper.scrollBy({
            top: scrollOffset,
            behavior: opts.behavior
          });
          resolve();
        }, opts.delay);
      });
    }
  };

  // node_modules/peakflow/dist/modal/modal.js
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
    bodyScroll: {
      lock: true,
      smooth: false
    }
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
      component.setAttribute(_Modal.attr.id, this.instance);
      this.component.setAttribute("role", "dialog");
      this.component.setAttribute("aria-modal", "true");
      this.setupScrollTo();
      this.setInitialState();
      this.setupStickyFooter();
      if (this.modal === this.component) {
        console.warn(`Modal: The modal instance was successfully initialized, but the "modal" element is equal to the "component" element, which will affect the modal animations. To fix this, add the "${_Modal.selector("modal")}" attribute to a descendant of the component element. Find out more about the difference between the "component" and the "modal" element in the documentation.`);
      }
      this.initialized = true;
    }
    /**
     * Static selector
     */
    static selector(element, instance) {
      const base = _Modal.attributeSelector(element);
      const instanceSelector = instance ? `[${_Modal.attr.id}="${instance}"]` : "";
      return element === "component" ? `${base}${instanceSelector}` : `${base}${instanceSelector}, ${instanceSelector} ${base}`;
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
      if (!this.modal)
        this.modal = this.component;
      return this.modal;
    }
    setupScrollTo() {
      this.scrollHandler = new ScrollHandler({
        scrollWrapper: this.modal,
        stickyTop: this.select("sticky-top"),
        stickyBottom: this.select("sticky-bottom")
      });
      this.scrollTo = this.scrollHandler.scrollTo.bind(this.scrollHandler);
      this.clearScrollTimeout = this.scrollHandler.clearScrollTimeout.bind(this.scrollHandler);
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
      this.component.style.removeProperty("display");
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
      }, this.settings.animation.duration);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, this.settings.animation.duration);
      });
    }
    async hide() {
      await animationFrame();
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
      return new Promise((resolve) => {
        setTimeout(() => {
          this.component.style.display = "none";
          resolve();
        }, this.settings.animation.duration);
      });
    }
    /**
     * Opens the modal instance.
     *
     * This method calls the `show` method and locks the scroll of the document body.
     */
    async open() {
      this.component.dataset.state = "opening";
      if (this.settings.bodyScroll.lock) {
        addScrollbarPadding(this.component, document.body);
        lockBodyScroll(this.settings.bodyScroll.smooth);
      }
      await this.show();
      this.opened = true;
      this.component.dataset.state = "open";
    }
    /**
     * Closes the modal instance.
     *
     * This method calls the `hide` method and unlocks the scroll of the document body.
     */
    async close() {
      this.component.dataset.state = "closing";
      if (this.settings.bodyScroll.lock) {
        removeScrollbarPadding(this.component);
        unlockBodyScroll(this.settings.bodyScroll.smooth);
      }
      await this.hide();
      this.opened = false;
      this.component.dataset.state = "closed";
    }
  };
  Modal.attr = {
    id: "data-modal-id",
    element: "data-modal-element"
  };
  Modal.attributeSelector = createAttribute(Modal.attr.element);
  function animationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  // node_modules/peakflow/dist/modal/alertdialog.js
  var AlertDialog = class extends Modal {
    confirm(message2) {
      this.message = message2;
      this.open();
      return new Promise((resolve) => {
        const confirmBtn = this.select("confirm");
        const cancelBtn = this.select("cancel");
        const onConfirm = () => {
          cleanup();
          this.close();
          resolve(true);
        };
        const onCancel = () => {
          cleanup();
          this.close();
          resolve(false);
        };
        const cleanup = () => {
          confirmBtn.removeEventListener("click", onConfirm);
          cancelBtn.removeEventListener("click", onCancel);
        };
        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
      });
    }
    set message(message2) {
      this._message = message2;
      this.renderMessage(message2);
    }
    get message() {
      return this._message;
    }
    renderMessage(message2) {
      for (const key in message2) {
        const element = this.getElement(key);
        if (element) {
          element.innerText = message2[key];
        } else {
          console.warn(`AlertDialog: Missing element for key "${key}"`);
        }
      }
    }
    getElement(element) {
      return this.component.querySelector(`[data-alert-dialog="${element}"]`);
    }
  };

  // src/sanavita/ts/form/resident-prospect.ts
  function prospectMapToObject(prospects) {
    const prospectsObj = {};
    for (const [key, prospect] of prospects) {
      prospectsObj[key] = prospect.serialize();
    }
    return prospectsObj;
  }
  function flattenProspects(prospects) {
    let prospectsObj = {};
    let prospectArray = [...prospects.values()];
    for (let i = 0; i < prospectArray.length; i++) {
      let prospect = prospectArray[i];
      prospectsObj = { ...prospectsObj, ...prospect.flatten(`person${i + 1}`) };
    }
    return prospectsObj;
  }
  var ResidentProspect = class _ResidentProspect {
    constructor(data) {
      this.key = `person-${crypto.randomUUID()}`;
      const defaults = _ResidentProspect.defaultData;
      const resolved = data ?? {};
      this.personalData = resolved.personalData ?? defaults.personalData;
      this.doctor = resolved.doctor ?? defaults.doctor;
      this.health = resolved.health ?? defaults.health;
      this.primaryRelative = resolved.primaryRelative ?? defaults.primaryRelative;
      this.secondaryRelative = resolved.secondaryRelative ?? defaults.secondaryRelative;
      this.linkedFields = resolved.linkedFields ?? defaults.linkedFields;
      this.draft = resolved.draft ?? defaults.draft;
    }
    static get defaultData() {
      return {
        personalData: new FieldGroup(),
        doctor: new FieldGroup(),
        health: new FieldGroup(),
        primaryRelative: new FieldGroup(),
        secondaryRelative: new FieldGroup(),
        linkedFields: /* @__PURE__ */ new Map(),
        draft: false
      };
    }
    linkFields(id, groupName, fields) {
      if (!id) throw new Error(`ResidentProspect "${this.getFullName()}": The group id "${id}" for linking fields is not valid.`);
      let inputIds = fields;
      if (typeof inputIds === "string") {
        inputIds = inputIds?.split(",").map((id2) => id2.trim());
      }
      if (inputIds.length === 0 || inputIds.some((id2) => id2 === "")) {
        throw new Error(`Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`);
      }
      this.linkedFields.set(id, { group: groupName, fields: inputIds });
    }
    /**
     * @returns true if the fields existed and have been unlinked, or false if the fields were not linked.
     */
    unlinkFields(id) {
      return this.linkedFields.delete(id);
    }
    validateGroups(...groups) {
      const groupNames = groups.length ? groups : Object.keys(this);
      const validatedGroups = {};
      for (const groupName of groupNames) {
        const group = this[groupName];
        if (group instanceof FieldGroup) {
          const { isValid: isValid2, invalidFields } = group.validate();
          validatedGroups[groupName] = { isValid: isValid2, invalidFields };
        }
      }
      return validatedGroups;
    }
    validate() {
      const validated = this.validateGroups();
      return !Object.values(validated).some((group) => group.isValid === false);
    }
    getFullName() {
      return `${this.personalData.getField("firstName").value} ${this.personalData.getField("lastName").value}`.trim() || "Neue Person";
    }
    flatten(prefix) {
      const fields = {};
      const groupNames = Object.keys(this);
      for (const groupName of groupNames) {
        const group = this[groupName];
        if (group instanceof FieldGroup) {
          group.fields.forEach((field, index) => {
            const fieldName = `${prefix}_${groupName}_${field.id}`;
            fields[fieldName] = field.value;
          });
        }
      }
      return fields;
    }
    serialize() {
      return {
        personalData: this.personalData.serialize(),
        doctor: this.doctor.serialize(),
        health: this.health.serialize(),
        primaryRelative: this.primaryRelative.serialize(),
        secondaryRelative: this.secondaryRelative.serialize(),
        linkedFields: mapToObject(this.linkedFields),
        draft: this.draft
      };
    }
    /**
     * Main function to deserialize a `ResidentProspect`
     */
    static deserialize(data) {
      return new _ResidentProspect({
        personalData: FieldGroup.deserialize(data.personalData),
        doctor: FieldGroup.deserialize(data.doctor),
        health: FieldGroup.deserialize(data.health),
        primaryRelative: FieldGroup.deserialize(data.primaryRelative),
        secondaryRelative: FieldGroup.deserialize(data.secondaryRelative),
        linkedFields: objectToMap(data.linkedFields),
        draft: data.draft
      });
    }
    static areEqual(a, b) {
      const groups = [
        "personalData",
        "doctor",
        "health",
        "primaryRelative",
        "secondaryRelative"
      ];
      if (!a || !b) return false;
      for (const groupName of groups) {
        const groupA = a[groupName];
        const groupB = b[groupName];
        if (!groupA || !groupB) return false;
        const fieldsA = groupA.fields;
        const fieldsB = groupB.fields;
        if (fieldsA.size !== fieldsB.size) return false;
        for (const [fieldId, fieldA] of fieldsA) {
          const fieldB = fieldsB.get(fieldId);
          if (!fieldB || fieldA.value !== fieldB.value) {
            return false;
          }
        }
      }
      return true;
    }
  };

  // src/sanavita/ts/form/save-options.ts
  var SaveOptions = class _SaveOptions {
    constructor(component, settings = {}) {
      this.actions = /* @__PURE__ */ new Map();
      this.currentActionKey = null;
      this.renderButtonContent = (action) => {
        this.saveButton.textContent = action.label;
      };
      this.component = component;
      this.settings = deepMerge(_SaveOptions.defaultSettings, settings);
      this.instance = this.settings.id || component.getAttribute(_SaveOptions.attr.id);
      component.setAttribute(_SaveOptions.attr.id, this.instance);
      this.saveButton = this.select("button");
      const dropdownOptions = this.selectAll("option");
      dropdownOptions.forEach((optionEl) => {
        const key = optionEl.getAttribute(_SaveOptions.attr.key);
        const label = optionEl.getAttribute(_SaveOptions.attr.label) || optionEl.textContent?.trim() || "";
        if (!key) return;
        this.actions.set(key, {
          label,
          element: optionEl,
          handler: () => {
          }
        });
        optionEl.addEventListener("click", () => {
          this.setAction(key);
          this.executeAction();
        });
      });
      this.saveButton.addEventListener("click", () => {
        this.executeAction();
      });
    }
    static get attr() {
      return {
        id: "data-save-options-id",
        element: "data-save-options-element",
        key: "data-save-options-key",
        label: "data-save-options-label"
      };
    }
    static get defaultSettings() {
      return {
        id: void 0,
        hideSelectedAction: true
      };
    }
    static {
      this.attributeSelector = createAttribute(_SaveOptions.attr.element);
    }
    /**
     * Static selector
     */
    static selector(element, instance) {
      const base = _SaveOptions.attributeSelector(element);
      return instance ? `${base}[${_SaveOptions.attr.id}="${instance}"]` : base;
    }
    /**
     * Instance selector
     */
    selector(element, local = true) {
      return local ? _SaveOptions.selector(element, this.instance) : _SaveOptions.selector(element);
    }
    static select(element, instance) {
      return document.querySelector(_SaveOptions.selector(element, instance));
    }
    static selectAll(element, instance) {
      return document.querySelectorAll(_SaveOptions.selector(element, instance));
    }
    select(element, local = true) {
      return local ? this.component.querySelector(_SaveOptions.selector(element)) : document.querySelector(_SaveOptions.selector(element, this.instance));
    }
    selectAll(element, local = true) {
      return local ? this.component.querySelectorAll(_SaveOptions.selector(element)) : document.querySelectorAll(_SaveOptions.selector(element, this.instance));
    }
    setRenderButtonContent(renderer) {
      this.renderButtonContent = renderer;
    }
    setAction(key) {
      if (!this.actions.has(key)) {
        throw new Error(`Save action '${key}' not found`);
      }
      const action = this.actions.get(key);
      if (this.settings.hideSelectedAction) {
        this.actions.get(this.currentActionKey)?.element.classList.remove("hide");
        action.element.classList.add("hide");
      }
      this.currentActionKey = key;
      this.renderButtonContent(action);
    }
    setActionHandler(key, handler) {
      const action = this.actions.get(key);
      if (!action) {
        throw new Error(`Cannot set handler, action '${key}' not found`);
      }
      action.handler = handler;
    }
    executeAction() {
      if (!this.currentActionKey) {
        throw new Error(`No save action selected`);
      }
      const action = this.actions.get(this.currentActionKey);
      if (!action) {
        throw new Error(`Save action '${this.currentActionKey}' not found`);
      }
      action.handler();
    }
    showAllActionElements() {
      for (const action of this.actions.values()) {
        action.element.classList.remove("hide");
      }
    }
  };

  // src/sanavita/ts/form/alert-dialog.ts
  function getAlertDialog() {
    const modalElement = AlertDialog.select("component", "alert-dialog");
    const modal = new AlertDialog(modalElement, {
      animation: {
        type: "growIn",
        duration: 200
      },
      bodyScroll: {
        lock: true,
        smooth: true
      }
    });
    return modal;
  }

  // src/sanavita/ts/form/prospect-array.ts
  var import_semver = __toESM(require_semver2(), 1);
  var prospectSelector = createAttribute("data-prospect-element");
  var LINK_FIELDS_ATTR = `data-link-fields`;
  var FIELD_GROUP_ATTR = `data-prospect-field-group`;
  var ARRAY_LIST_SELECTOR = '[data-form-array-element="list"]';
  var FIELD_GROUP_SELECTOR = `[${FIELD_GROUP_ATTR}]`;
  var ACCORDION_SELECTOR = `[data-animate="accordion"]`;
  var PROSPECT_STORAGE_KEY = "formProgress";
  var PROSPECT_STORAGE_VERSION = "v1.0.0";
  var ProspectArray = class {
    constructor(container, id) {
      this.initialized = false;
      this.alertDialog = getAlertDialog();
      this.groups = [];
      this.accordionList = [];
      this.onOpenCallbacks = /* @__PURE__ */ new Map();
      this.onCloseCallbacks = /* @__PURE__ */ new Map();
      this.editingKey = null;
      this.unsavedProspect = null;
      this.id = id;
      this.container = container;
      this.prospects = /* @__PURE__ */ new Map();
      this.list = this.container.querySelector(ARRAY_LIST_SELECTOR);
      this.template = this.list.querySelector(prospectSelector("template"));
      this.addButton = this.container.querySelector(prospectSelector("add"));
      this.formMessage = new FormMessage("FormArray", this.id.toString());
      this.modalElement = Modal.select("component", "resident-prospect");
      this.modal = new Modal(this.modalElement, {
        animation: {
          type: "growIn",
          duration: 300
        },
        bodyScroll: {
          lock: true,
          smooth: true
        }
      });
      this.saveOptions = new SaveOptions(SaveOptions.select("component", "save-prospect"));
      this.cancelButtons = this.modalElement.querySelectorAll(
        prospectSelector("cancel")
      );
      this.modalInputs = this.modalElement.querySelectorAll(wf.select.formInput);
      const groupElements = this.modalElement.querySelectorAll(FIELD_GROUP_SELECTOR);
      groupElements.forEach((groupEl) => {
        const groupName = groupEl.dataset.prospectFieldGroup;
        this.groups.push({
          isValid: false,
          element: groupEl,
          name: groupName
        });
      });
      this.initialize();
    }
    initialize() {
      this.cancelButtons.forEach((button) => {
        button.addEventListener("click", () => this.discardChanges());
      });
      let keyboardFocused = false;
      this.modalInputs.forEach((input) => {
        input.addEventListener("keydown", (event) => {
          if (!this.modal.opened) return;
          if (event.key === "Enter") {
            event.preventDefault();
            this.saveProspectFromModal({ validate: true, report: true });
          }
          if (event.key === "Tab" || event.key === "ArrowDown" || event.key === "ArrowUp") {
            keyboardFocused = true;
          }
        });
        input.addEventListener("focusin", (event) => {
          if (!this.modal.opened) return;
          event.preventDefault();
          const accordionIndex = this.accordionIndexOf(input);
          const accordionInstance = this.accordionList[accordionIndex];
          if (!accordionInstance.isOpen) {
            this.toggleAccordion(accordionIndex);
          }
          let position = "nearest";
          if (keyboardFocused) {
            keyboardFocused = false;
            position = "center";
          }
          this.modal.scrollTo(input, {
            delay: 500,
            position
          });
        });
        const group = this.getClosestGroup(input);
        input.addEventListener("input", () => {
          if (input.matches(FormDecision.selector("input")) || input.matches(`[${LINK_FIELDS_ATTR}] *`)) return;
          this.validateModalGroup(group);
          const valid = this.groups.every((group2) => group2.isValid === true);
          this.saveOptions.setAction(valid ? "save" : "draft");
        });
      });
      this.saveOptions.setActionHandler("save", () => {
        this.saveProspectFromModal({ validate: true, report: true });
      });
      this.saveOptions.setActionHandler("draft", () => {
        this.saveProspectFromModal({ validate: false, report: false });
      });
      this.addButton.addEventListener("click", () => this.startNewProspect());
      this.initializeLinkedFields();
      this.renderList();
      this.closeModal();
      this.initAccordions();
      this.initialized = true;
    }
    initializeLinkedFields() {
      const links = this.modalElement.querySelectorAll(`[${LINK_FIELDS_ATTR}]`);
      links.forEach((link) => {
        const checkbox = link.querySelector(wf.select.checkboxInput);
        checkbox.addEventListener("change", () => {
          if (!this.initialized || !this.modal.opened) return;
          if (checkbox.checked) {
            this.linkFields(link);
          } else {
            this.unlinkFields(link);
          }
        });
      });
    }
    linkFields(linkElement) {
      const checkbox = linkElement.querySelector(wf.select.checkboxInput);
      checkbox.checked = true;
      const otherProspect = this.getOtherProspect();
      if (!otherProspect) throw new Error(`Couldn't get otherProspect.`);
      const inputIds = linkElement.getAttribute(LINK_FIELDS_ATTR)?.split(",").map((id) => id.trim());
      if (inputIds.length === 0 || inputIds.some((id) => id === "")) {
        throw new Error(`Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`);
      }
      const fieldGroupElement = linkElement.closest(FIELD_GROUP_SELECTOR);
      const fieldGroupName = fieldGroupElement?.getAttribute(FIELD_GROUP_ATTR);
      const sourceFieldGroup = otherProspect[fieldGroupName];
      inputIds.forEach((id) => {
        const input = fieldGroupElement.querySelector(`#${id}`);
        if (!input || !isFormInput(input)) {
          throw new TypeError(
            `FormArray "ResidentProspect": The selected input for field-link is not a "HTMLFormInput"`
          );
        }
        input.value = sourceFieldGroup.getField(id)?.value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
    unlinkFields(linkElement) {
      const checkbox = linkElement.querySelector(wf.select.checkboxInput);
      checkbox.checked = false;
      const inputIds = linkElement.getAttribute(LINK_FIELDS_ATTR)?.split(",").map((id) => id.trim());
      if (inputIds.length === 0 || inputIds.some((id) => id === "")) {
        throw new Error(`Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`);
      }
      const fieldGroupElement = linkElement.closest(FIELD_GROUP_SELECTOR);
      inputIds.forEach((id) => {
        const input = fieldGroupElement.querySelector(`#${id}`);
        if (!input || !(input instanceof HTMLInputElement) && !(input instanceof HTMLSelectElement) && !(input instanceof HTMLTextAreaElement)) {
          throw new TypeError(
            `FormArray "ResidentProspect": The selected input for field-link is not a "HTMLFormInput"`
          );
        }
        input.value = null;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
    unlinkAllProspects() {
      this.prospects.forEach((prospect) => prospect.linkedFields.clear());
    }
    /**
     * Updates the values of the linked fields inside `target` with the ones from `source`.
     *
     * @param id The id of the group of the linked fields
     */
    syncLinkedFields(id, source, target) {
      if (!source || !target) throw new Error(`The source or target ResidentProspect is not defined.`);
      const linkedFields = source.linkedFields.get(id);
      target.linkFields(id, linkedFields.group, linkedFields.fields);
      linkedFields.fields.forEach((fieldId) => {
        const sourceValue = source[linkedFields.group].getField(fieldId).value;
        target[linkedFields.group].getField(fieldId).setValue(sourceValue);
      });
    }
    /**
     * Sync all linked fields of `target` with the ones from `source`.
     */
    syncLinkedFieldsAll(source, target) {
      if (!source || !target) throw new Error(`The source or target ResidentProspect is not defined.`);
      target.linkedFields.clear();
      Array.from(source.linkedFields.keys()).forEach((groupId) => {
        this.syncLinkedFields(groupId, source, target);
      });
    }
    handleLinkedFieldsVisibility() {
      const length = this.unsavedProspect === null ? this.prospects.size : this.prospects.size + 1;
      const links = this.modalElement.querySelectorAll(`[${LINK_FIELDS_ATTR}]`);
      if (length < 2) {
        links.forEach((link) => {
          link.style.display = "none";
        });
      } else {
        const otherProspect = this.getOtherProspect();
        if (!otherProspect) throw new Error(`Couldn't get otherProspect.`);
        links.forEach((link) => {
          this.setLiveText("other-prospect-full-name", otherProspect.getFullName());
          link.style.removeProperty("display");
        });
      }
    }
    /**
     * Retrieves a `ResidentProspect` instance from a given key or returns the provided `ResidentProspect` directly.
     * 
     * @param prospectOrKeyOrIndex - Either the key of the prospect or the prospect object itself.
     * @returns {ResidentProspect} The corresponding `ResidentProspect` object.
     * @throws Error if the prospect with the given key is not found.
     */
    getProspect(prospectOrKeyOrIndex) {
      let prospect;
      if (typeof prospectOrKeyOrIndex === "string") {
        prospect = this.prospects.get(prospectOrKeyOrIndex);
      } else if (typeof prospectOrKeyOrIndex === "number") {
        prospect = Array.from(this.prospects.values())[prospectOrKeyOrIndex];
      } else if (prospectOrKeyOrIndex instanceof ResidentProspect) {
        prospect = prospectOrKeyOrIndex;
      }
      if (!prospect) {
        throw new Error(`Prospect not found: ${prospectOrKeyOrIndex}`);
      }
      return prospect;
    }
    /**
     * Gets the ResidentProspect currently being edited via the `editingKey` property.
     */
    getEditingProspect() {
      if (this.editingKey === null) {
        return void 0;
      } else if (this.editingKey.startsWith("unsaved")) {
        return this.unsavedProspect;
      } else {
        return this.prospects.get(this.editingKey);
      }
    }
    getOtherProspect() {
      if (!this.editingKey) {
        throw new Error(`Can't get other prospect if no prospect is currently being edited.`);
      }
      const editingProspect = this.getEditingProspect();
      return Array.from(this.prospects.values()).find((prospect) => {
        return prospect.key !== editingProspect.key;
      });
    }
    /**
     * Opens an alert dialog to confirm canceling the changes made to the current ResidentProspect.
     */
    async discardChanges() {
      const lastSaved = this.getEditingProspect();
      const currentState = this.extractData();
      if (ResidentProspect.areEqual(lastSaved, currentState)) {
        this.unsavedProspect = null;
        this.closeModal();
        return;
      }
      const confirmed = await this.alertDialog.confirm({
        title: `M\xF6chten Sie die \xC4nderungen verwerfen?`,
        paragraph: `Mit dieser Aktion gehen alle \xC4nderungen f\xFCr "${this.getEditingProspect().getFullName()}" verworfen. Diese Aktion kann nicht r\xFCckg\xE4ngig gemacht werden.`,
        cancel: "abbrechen",
        confirm: "\xC4nderungen verwerfen"
      });
      if (confirmed) {
        this.unsavedProspect = null;
        this.closeModal();
      }
    }
    /**
     * Opens the modal form to start a new `ResidentProspect`. Creates an unsaved prospect.
     */
    startNewProspect() {
      if (this.prospects.size === 2) {
        this.formMessage.error("Sie k\xF6nnen nur max. 2 Personen hinzuf\xFCgen.");
        this.formMessage.setTimedReset(5e3);
        return;
      }
      this.clearModal();
      this.setLiveText("state", "Hinzuf\xFCgen");
      this.setLiveText("full-name", "Neue Person");
      this.unsavedProspect = this.extractData(true);
      this.editingKey = `unsaved-${this.unsavedProspect.key}`;
      this.openModal();
    }
    saveProspectFromModal(opts) {
      if (opts.validate ?? true) {
        const listValid = this.validateModal(opts.report ?? true);
        if (!listValid) {
          console.warn(
            `Couldn't save ResidentProspect. Please fill in all the values correctly.`
          );
          return;
        }
      }
      const draft = !opts.validate;
      const prospect = this.extractData(draft);
      const otherProspect = this.getOtherProspect();
      if (!otherProspect) {
        this.unlinkAllProspects();
      } else {
        this.syncLinkedFieldsAll(prospect, otherProspect);
      }
      if (this.saveProspect(prospect)) {
        this.unsavedProspect = null;
        this.renderList();
        this.closeModal();
      }
      this.saveProgress();
    }
    saveProspect(prospect) {
      const prospectLimitError = new Error(`Sie k\xF6nnen nur max. 2 Personen hinzuf\xFCgen.`);
      if (!this.editingKey.startsWith("unsaved") && this.editingKey !== null) {
        if (this.prospects.size > 2) {
          throw prospectLimitError;
        }
        prospect.key = this.editingKey;
        this.prospects.set(this.editingKey, prospect);
      } else {
        if (this.prospects.size > 1) {
          throw prospectLimitError;
        }
        this.prospects.set(prospect.key, prospect);
      }
      return true;
    }
    setLiveText(element, string) {
      const liveElements = this.modalElement.querySelectorAll(`[data-live-text="${element}"]`);
      let valid = true;
      for (const element2 of Array.from(liveElements)) {
        if (!element2) {
          valid = false;
          break;
        }
        element2.innerText = string;
      }
      return valid;
    }
    renderList() {
      this.list.innerHTML = "";
      this.list.dataset.length = this.prospects.size.toString();
      if (this.prospects.size) {
        this.prospects.forEach((prospect) => this.renderProspect(prospect));
        this.formMessage.reset();
      } else {
        this.formMessage.info(
          "Bitte f\xFCgen Sie die Mieter (max. 2 Personen) hinzu.",
          !this.initialized
        );
      }
    }
    renderProspect(prospectOrKey) {
      const prospect = this.getProspect(prospectOrKey);
      const newElement = this.template.cloneNode(true);
      const props = ["full-name", "phone", "email", "street", "zip", "city"];
      newElement.style.removeProperty("display");
      const editButton = newElement.querySelector(prospectSelector("edit"));
      const deleteButton = newElement.querySelector(prospectSelector("delete"));
      editButton.addEventListener("click", () => this.editProspect(prospect));
      deleteButton.addEventListener("click", async () => await this.onDeleteProspect(prospect));
      props.forEach((prop) => {
        const propSelector = `[data-${prop}]`;
        const el = newElement.querySelector(propSelector);
        if (el && prop === "full-name") {
          el.innerText = prospect.getFullName();
        } else if (el) {
          const currentField = prospect.personalData.getField(prop);
          if (!currentField) {
            console.error(`Render ResidentProspect: A field for "${prop}" doesn't exist.`);
            return;
          }
          el.innerText = currentField.value || currentField.label;
        }
      });
      const badge = newElement.querySelector(prospectSelector("draft-badge"));
      badge.classList.toggle("hide", !prospect.draft);
      this.list.appendChild(newElement);
    }
    editProspect(prospectOrKey) {
      const prospect = this.getProspect(prospectOrKey);
      this.setLiveText("state", "bearbeiten");
      this.setLiveText("full-name", prospect.getFullName() || "Neue Person");
      this.editingKey = prospect.key;
      this.populateModal(prospect);
      this.openModal();
    }
    async onDeleteProspect(prospectOrKey) {
      const prospect = this.getProspect(prospectOrKey);
      const confirmed = await this.alertDialog.confirm({
        title: `M\xF6chten Sie die Person "${prospect.getFullName()}" wirklich l\xF6schen?`,
        paragraph: `Mit dieser Aktion wird die Person "${prospect.getFullName()}" gel\xF6scht. Diese Aktion kann nicht r\xFCckg\xE4ngig gemacht werden.`,
        cancel: "Abbrechen",
        confirm: "Person l\xF6schen"
      });
      if (confirmed) this.deleteProspect(prospect);
    }
    deleteProspect(prospectOrKey) {
      const prospect = this.getProspect(prospectOrKey);
      this.prospects.delete(prospect.key);
      this.unlinkAllProspects();
      this.renderList();
      this.closeModal();
      this.saveProgress();
    }
    onOpen(name, callback) {
      this.onOpenCallbacks.set(name, callback);
    }
    clearOnOpen(name) {
      this.onOpenCallbacks.delete(name);
    }
    triggerOnOpen() {
      const editingProspect = this.getEditingProspect();
      for (const callback of this.onOpenCallbacks.values()) {
        callback(editingProspect);
      }
    }
    onClose(name, callback) {
      this.onCloseCallbacks.set(name, callback);
    }
    clearOnClose(name) {
      this.onCloseCallbacks.delete(name);
    }
    triggerOnClose() {
      for (const callback of this.onCloseCallbacks.values()) {
        callback();
      }
    }
    populateModal(prospect) {
      for (const [id] of prospect.linkedFields.entries()) {
        const linkElement = this.modalElement.querySelector(`[${LINK_FIELDS_ATTR}][data-id="${id}"]`);
        if (!linkElement) continue;
        const linkCheckbox = linkElement.querySelector(wf.select.checkboxInput);
        linkCheckbox.checked = true;
        linkCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
      this.groups.forEach((group) => {
        const selector = exclude(wf.select.formInput, `[${LINK_FIELDS_ATTR}] *`);
        const groupInputs = Array.from(group.element.querySelectorAll(selector));
        if (!prospect[group.name]) {
          console.error(`The group "${group.name}" doesn't exist.`);
          return;
        }
        const [radioInputs, otherInputs] = groupInputs.reduce(([r, o], input) => {
          input.type === "radio" ? r.push(input) : o.push(input);
          return [r, o];
        }, [[], []]);
        otherInputs.forEach((input) => {
          const field = prospect[group.name].getField(input.id);
          if (!field) {
            return;
          }
          if (!isCheckboxInput(input)) {
            input.value = field.value.trim();
          } else {
            setChecked(input, field.checked);
          }
        });
        const radioGroups = getRadioGroups(radioInputs);
        radioGroups.forEach((radioGroup) => {
          const field = prospect[group.name].getField(radioGroup.name);
          if (!field) {
            return;
          }
          radioGroup.inputs.forEach((radio) => {
            setChecked(radio, radio.value === field.value ? field.checked : false);
          });
        });
      });
    }
    validate() {
      let valid = true;
      if (this.prospects.size === 0) {
        console.warn("Bitte f\xFCgen Sie mindestens eine mietende Person hinzu.");
        this.formMessage.error(`Bitte f\xFCgen Sie mindestens eine mietende Person hinzu.`);
        this.formMessage.setTimedReset(5e3, () => {
          this.formMessage.info("Bitte f\xFCgen Sie die Mieter (max. 2 Personen) hinzu.", true);
        });
        valid = false;
      } else {
        this.prospects.forEach((prospect) => {
          if (prospect.draft) {
            console.warn(
              `Die Person "${prospect.getFullName()}" ist als Entwurf gespeichert. Bitte finalisieren oder l\xF6schen Sie diese Person.`
            );
            this.formMessage.error(
              `Die Person "${prospect.getFullName()}" ist als Entwurf gespeichert. Bitte finalisieren oder l\xF6schen Sie diese Person.`
            );
            this.formMessage.setTimedReset(8e3);
            valid = false;
          } else if (!prospect.validate()) {
            console.warn(
              `Bitte f\xFCllen Sie alle Pflichtfelder f\xFCr "${prospect.getFullName()}" aus.`
            );
            this.formMessage.error(
              `Bitte f\xFCllen Sie alle Pflichtfelder f\xFCr "${prospect.getFullName()}" aus.`
            );
            this.formMessage.setTimedReset(7e3);
            valid = false;
          }
        });
      }
      return valid;
    }
    validateModalGroup(group) {
      const groupInputs = group.element.querySelectorAll(wf.select.formInput);
      const validation = validateFields(groupInputs, false);
      const circle = group.element.querySelector(prospectSelector("circle"));
      if (!circle) console.warn(`Circle element not found inside group "${group.name}"`);
      if (validation.isValid) {
        circle.classList.add("is-valid");
      } else {
        circle.classList.remove("is-valid");
      }
      group.isValid = validation.isValid;
      return validation;
    }
    validateModal(report = true) {
      let valid = true;
      const invalidFields = [];
      this.groups.forEach((group) => {
        const groupValid = this.validateModalGroup(group);
        invalidFields.push(...groupValid.invalidFields);
        if (group.isValid) return;
        valid = false;
      });
      if (!valid && invalidFields.length && report && this.modal.opened) {
        this.reportInvalidField(invalidFields[0]);
      }
      return valid;
    }
    async reportInvalidField(fieldOrId, groupName) {
      const input = this.getFormInput(fieldOrId, groupName);
      const accordionIndex = this.accordionIndexOf(input);
      if (accordionIndex !== -1) {
        let delay = 0;
        const accordion = this.accordionList[accordionIndex];
        if (!accordion.isOpen) {
          this.openAccordion(accordionIndex);
          delay = 800;
        }
        await this.modal.scrollTo(input, {
          delay,
          position: "center"
        });
        reportValidity(input);
      }
    }
    clearModal() {
      this.setLiveText("state", "hinzuf\xFCgen");
      this.setLiveText("full-name", "Neue Person");
      this.modalInputs.forEach((input) => {
        if (isRadioInput(input)) {
          setChecked(input, false);
        } else if (isCheckboxInput(input)) {
          input.checked = false;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          input.value = "";
        }
        removeErrorClasses(input);
      });
    }
    openModal() {
      const personalDataGroup = this.modalElement.querySelector(
        '[data-prospect-field-group="personalData"]'
      );
      const nameInputs = personalDataGroup.querySelectorAll("#first-name, #name");
      nameInputs.forEach((input) => {
        input.addEventListener("input", () => {
          const editingProspect = this.extractData(this.editingKey.startsWith("unsaved"));
          this.setLiveText(
            "full-name",
            editingProspect.getFullName() || "Neue Person"
          );
        });
      });
      const valid = this.validateModal(false);
      this.saveOptions.setAction(valid ? "save" : "draft");
      this.handleLinkedFieldsVisibility();
      this.openAccordion(0);
      this.triggerOnOpen();
      this.modal.open();
    }
    async closeModal() {
      await this.modal.close();
      if (this.initialized) {
        this.list.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
      this.clearModal();
      this.triggerOnClose();
      this.editingKey = null;
    }
    initAccordions() {
      const accordionElements = Array.from(
        this.container.querySelectorAll(ACCORDION_SELECTOR)
      );
      const accordionList = accordionElements.reduce(
        (acc, accordionEl) => {
          return [...acc, new Accordion(accordionEl)];
        },
        []
      );
      this.accordionList = accordionList;
      this.initAccordionListeners();
    }
    initAccordionListeners() {
      for (let i = 0; i < this.accordionList.length; i++) {
        const accordion = this.accordionList[i];
        accordion.component.dataset.index = i.toString();
        accordion.onClick(() => {
          this.toggleAccordion(i);
          if (!accordion.isOpen) return;
          setTimeout(() => {
            accordion.scrollIntoView(this.modal.select("modal"), 0);
          }, 500);
        });
      }
    }
    toggleAccordion(index) {
      for (let i = 0; i < this.accordionList.length; i++) {
        const accordion = this.accordionList[i];
        if (i === index) {
          accordion.toggle();
        } else {
          accordion.close();
        }
      }
    }
    openAccordion(index) {
      for (let i = 0; i < this.accordionList.length; i++) {
        const accordion = this.accordionList[i];
        if (i === index) {
          accordion.open();
        } else {
          accordion.close();
        }
      }
    }
    /**
     * Finds the index of the accordion that contains a specific field element.
     * This method traverses the DOM to locate the accordion that wraps the field
     * and returns its index in the `accordionList`.
     *
     * @param field - The form element (field) to search for within the accordions.
     * @returns The index of the accordion containing the field, or `-1` if no accordion contains the field.
     */
    accordionIndexOf(field) {
      let parentElement = field.closest(
        '[data-animate="accordion"]'
      );
      if (parentElement) {
        const accordionIndex = this.accordionList.findIndex(
          (accordion) => accordion.component === parentElement
        );
        return accordionIndex !== -1 ? accordionIndex : -1;
      }
      return -1;
    }
    getClosestGroup(element) {
      const groupEl = element.closest(FIELD_GROUP_SELECTOR);
      if (!groupEl) {
        throw new Error(`The given element is not part of a group element.`);
      }
      return this.groups.find((group) => group.element === groupEl);
    }
    getGroupsByName(groupName) {
      return this.groups.filter((group) => group.name === groupName);
    }
    getFormInput(fieldOrId, groupName) {
      if (isFormInput(fieldOrId)) {
        return fieldOrId;
      }
      const groups = this.getGroupsByName(groupName);
      const groupElements = groups.map((group) => group.element);
      return findFormInput(groupElements, fieldOrId);
    }
    extractData(draft = false) {
      const prospectData = new ResidentProspect({ draft });
      this.groups.forEach((group) => {
        const selector = exclude(wf.select.formInput, `[${LINK_FIELDS_ATTR}] *`);
        const groupInputs = group.element.querySelectorAll(selector);
        const linkElements = group.element.querySelectorAll(`[${LINK_FIELDS_ATTR}]`);
        if (!prospectData[group.name]) {
          console.error(`The group "${group.name}" doesn't exist.`);
          return;
        }
        groupInputs.forEach((input, index) => {
          const field = fieldFromInput(input, index);
          if (field.id) {
            prospectData[group.name].fields.set(field.id, field);
          }
        });
        linkElements.forEach((linkElement) => {
          const linkCheckbox = linkElement.querySelector(wf.select.checkboxInput);
          const id = linkCheckbox.dataset.name;
          const fieldsToLink = linkElement.getAttribute(LINK_FIELDS_ATTR);
          if (linkCheckbox.checked) {
            prospectData.linkFields(id, group.name, fieldsToLink);
          }
        });
      });
      return prospectData;
    }
    /**
     * Save the progress to localStorage
     */
    saveProgress() {
      const progress = {
        version: PROSPECT_STORAGE_VERSION,
        prospects: prospectMapToObject(this.prospects)
      };
      try {
        localStorage.setItem(PROSPECT_STORAGE_KEY, JSON.stringify(progress));
        console.info("Form progress saved.");
      } catch (error) {
        console.error("Error saving form progress to localStorage:", error);
      }
    }
    /**
     * Clear the saved progress from localStorage
     */
    clearProgress() {
      try {
        localStorage.removeItem(PROSPECT_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form progress from localStorage:", error);
      }
    }
    /**
     * Load the saved progress from localStorage
     */
    loadProgress() {
      const savedData = localStorage.getItem(PROSPECT_STORAGE_KEY);
      if (savedData) {
        try {
          const progress = JSON.parse(savedData);
          if (!progress.version) {
            throw new Error(`Saved progress is missing version; outdated.`);
          }
          const cleanCurrentVersion = import_semver.default.clean(PROSPECT_STORAGE_VERSION);
          const cleanSavedVersion = import_semver.default.clean(progress.version);
          if (!cleanCurrentVersion || !cleanSavedVersion) {
            throw new Error("Invalid semver version format.");
          }
          if (!import_semver.default.eq(cleanCurrentVersion, cleanSavedVersion)) {
            throw new Error(`Saved progress version "${progress.version}" is outdated.`);
          }
          for (const key in progress.prospects) {
            if (progress.prospects.hasOwnProperty(key)) {
              const prospectData = progress.prospects[key];
              const prospect = ResidentProspect.deserialize(prospectData);
              prospect.key = key;
              this.prospects.set(key, prospect);
            }
          }
          this.renderList();
          this.closeModal();
          console.log("Form progress loaded.");
        } catch (e) {
          console.error(`Error loading prospects progress: ${e.message}`);
        }
      } else {
        console.log("No saved form progress found.");
      }
    }
  };

  // src/sanavita/ts/apartment-form.ts
  var decisionSelector = createAttribute("data-decision-component");
  function initializeFormDecisions(form, errorMessages, defaultMessages = {}) {
    form.formSteps.forEach((step, stepIndex) => {
      const formDecisions = step.querySelectorAll(decisionSelector());
      formDecisions.forEach((element) => {
        const id = element.dataset.decisionComponent;
        const decision = new FormDecision(element, { id });
        if (id && errorMessages[id]) {
          decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
        }
        form.addCustomComponent({
          stepIndex,
          instance: decision,
          validator: () => decision.validate()
        });
      });
    });
  }
  function initializeProspectDecisions(prospectArray, errorMessages, defaultMessages = {}) {
    const decisionElements = prospectArray.modalElement.querySelectorAll(decisionSelector());
    const formDecisions = /* @__PURE__ */ new Map();
    decisionElements.forEach((element, index) => {
      const id = element.getAttribute(FormDecision.attr.component) || index.toString();
      const decision = new FormDecision(element, { id, clearPathOnChange: false });
      formDecisions.set(decision.opts.id, decision);
      const group = prospectArray.getClosestGroup(decision.component);
      decision.onChange(() => {
        prospectArray.validateModalGroup(group);
        const valid = prospectArray.groups.every((group2) => group2.isValid === true);
        prospectArray.saveOptions.setAction(valid ? "save" : "draft");
      });
      prospectArray.onOpen(`decision-${id}`, () => decision.sync());
      prospectArray.onClose(`decision-${id}`, () => decision.reset());
      if (id && errorMessages[id]) {
        decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
      }
    });
    return formDecisions;
  }
  function insertSearchParamValues() {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const selectElement = document.querySelector(
        "#wohnung"
      );
      const wohnungValue = params.get("wohnung");
      const option = selectElement.querySelector(
        `option[value="${wohnungValue}"]`
      );
      if (wohnungValue && option) {
        selectElement.value = wohnungValue;
      } else {
        console.warn(`No matching option for value: ${wohnungValue}`);
      }
    }
  }
  function initCMSSelect() {
    const source = CMSSelect.selector("source", "apartment");
    const apartmentSelect = new CMSSelect(source);
    apartmentSelect.insertOptions();
    const wrapper = getElement('[data-field-wrapper-id="alternativeApartment"]');
    if (apartmentSelect.values.length <= 1) {
      wrapper.style.display = "none";
      return;
    }
    const alternative = CMSSelect.selector("target", "alternativeApartment");
    const alternativeSelect = wrapper.querySelector(alternative);
    apartmentSelect.onChange("syncAlternatives", () => {
      const values = Array.from(apartmentSelect.values);
      const filtered = values.filter((val) => val !== apartmentSelect.targets[0].value);
      CMSSelect.clearOptions(alternativeSelect, true);
      CMSSelect.insertOptions(alternativeSelect, filtered);
    });
    apartmentSelect.triggerOnChange();
  }
  var formElement = document.querySelector(
    formElementSelector("component", { exclusions: [] })
  );
  formElement?.classList.remove("w-form");
  document.addEventListener("DOMContentLoaded", async () => {
    if (!formElement) {
      console.error("Form not found.");
      return;
    }
    const prospectArray = new ProspectArray(formElement, "resident-prospects");
    const FORM = new MultiStepForm(formElement, {
      navigation: {
        hideInStep: 0
      },
      recaptcha: true,
      excludeInputSelectors: [
        '[data-decision-path="upload"]',
        "[data-decision-component]"
      ]
    });
    FORM.addCustomComponent({
      stepIndex: 2,
      instance: prospectArray,
      validator: () => prospectArray.validate(),
      getData: () => flattenProspects(prospectArray.prospects)
    });
    FORM.component.addEventListener("changeStep", () => {
      if (prospectArray.modal.opened) prospectArray.closeModal();
    });
    const errorMessages = {
      attachmentSubmission: {
        upload: "Bitte laden Sie alle Beilagen hoch."
      }
    };
    const defaultMessages = {
      attachmentSubmission: `Bitte laden Sie alle Beilagen hoch oder w\xE4hlen Sie die Option "Beilagen per Post senden".`
    };
    initializeProspectDecisions(
      prospectArray,
      errorMessages,
      defaultMessages
    );
    initializeFormDecisions(FORM, errorMessages, defaultMessages);
    insertSearchParamValues();
    initCMSSelect();
    prospectArray.loadProgress();
    FORM.formElement.addEventListener("formSuccess", () => {
      prospectArray.clearProgress();
    });
    const monthStart = startOfMonth(/* @__PURE__ */ new Date());
    const nextMonthStart = addMonths(monthStart, 1);
    const nextMonthStartString = format(nextMonthStart, "yyyy-MM-dd");
    const moveInDateInput = FORM.getFormInput("moveInDate");
    moveInDateInput.min = nextMonthStartString;
    window.prospectArray = prospectArray;
    console.log("Form initialized:", FORM.initialized, FORM);
  });
})();
//# sourceMappingURL=apartment-form.js.map
