var contentxxx = function() {
  "use strict";
  var _a, _b;
  function defineContentScript(definition2) {
    return definition2;
  }
  const browser$1 = ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  const nullKey = Symbol("null");
  let keyCounter = 0;
  class ManyKeysMap extends Map {
    constructor() {
      super();
      this._objectHashes = /* @__PURE__ */ new WeakMap();
      this._symbolHashes = /* @__PURE__ */ new Map();
      this._publicKeys = /* @__PURE__ */ new Map();
      const [pairs] = arguments;
      if (pairs === null || pairs === void 0) {
        return;
      }
      if (typeof pairs[Symbol.iterator] !== "function") {
        throw new TypeError(typeof pairs + " is not iterable (cannot read property Symbol(Symbol.iterator))");
      }
      for (const [keys, value] of pairs) {
        this.set(keys, value);
      }
    }
    _getPublicKeys(keys, create = false) {
      if (!Array.isArray(keys)) {
        throw new TypeError("The keys parameter must be an array");
      }
      const privateKey = this._getPrivateKey(keys, create);
      let publicKey;
      if (privateKey && this._publicKeys.has(privateKey)) {
        publicKey = this._publicKeys.get(privateKey);
      } else if (create) {
        publicKey = [...keys];
        this._publicKeys.set(privateKey, publicKey);
      }
      return { privateKey, publicKey };
    }
    _getPrivateKey(keys, create = false) {
      const privateKeys = [];
      for (let key of keys) {
        if (key === null) {
          key = nullKey;
        }
        const hashes = typeof key === "object" || typeof key === "function" ? "_objectHashes" : typeof key === "symbol" ? "_symbolHashes" : false;
        if (!hashes) {
          privateKeys.push(key);
        } else if (this[hashes].has(key)) {
          privateKeys.push(this[hashes].get(key));
        } else if (create) {
          const privateKey = `@@mkm-ref-${keyCounter++}@@`;
          this[hashes].set(key, privateKey);
          privateKeys.push(privateKey);
        } else {
          return false;
        }
      }
      return JSON.stringify(privateKeys);
    }
    set(keys, value) {
      const { publicKey } = this._getPublicKeys(keys, true);
      return super.set(publicKey, value);
    }
    get(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.get(publicKey);
    }
    has(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.has(publicKey);
    }
    delete(keys) {
      const { publicKey, privateKey } = this._getPublicKeys(keys);
      return Boolean(publicKey && super.delete(publicKey) && this._publicKeys.delete(privateKey));
    }
    clear() {
      super.clear();
      this._symbolHashes.clear();
      this._publicKeys.clear();
    }
    get [Symbol.toStringTag]() {
      return "ManyKeysMap";
    }
    get size() {
      return super.size;
    }
  }
  function isPlainObject(value) {
    if (value === null || typeof value !== "object") {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
      return false;
    }
    if (Symbol.iterator in value) {
      return false;
    }
    if (Symbol.toStringTag in value) {
      return Object.prototype.toString.call(value) === "[object Module]";
    }
    return true;
  }
  function _defu(baseObject, defaults, namespace = ".", merger) {
    if (!isPlainObject(defaults)) {
      return _defu(baseObject, {}, namespace, merger);
    }
    const object = Object.assign({}, defaults);
    for (const key in baseObject) {
      if (key === "__proto__" || key === "constructor") {
        continue;
      }
      const value = baseObject[key];
      if (value === null || value === void 0) {
        continue;
      }
      if (merger && merger(object, key, value, namespace)) {
        continue;
      }
      if (Array.isArray(value) && Array.isArray(object[key])) {
        object[key] = [...value, ...object[key]];
      } else if (isPlainObject(value) && isPlainObject(object[key])) {
        object[key] = _defu(
          value,
          object[key],
          (namespace ? `${namespace}.` : "") + key.toString(),
          merger
        );
      } else {
        object[key] = value;
      }
    }
    return object;
  }
  function createDefu(merger) {
    return (...arguments_) => (
      // eslint-disable-next-line unicorn/no-array-reduce
      arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
    );
  }
  const defu = createDefu();
  const isExist = (element) => {
    return element !== null ? { isDetected: true, result: element } : { isDetected: false };
  };
  const isNotExist = (element) => {
    return element === null ? { isDetected: true, result: null } : { isDetected: false };
  };
  const getDefaultOptions = () => ({
    target: globalThis.document,
    unifyProcess: true,
    detector: isExist,
    observeConfigs: {
      childList: true,
      subtree: true,
      attributes: true
    },
    signal: void 0,
    customMatcher: void 0
  });
  const mergeOptions = (userSideOptions, defaultOptions) => {
    return defu(userSideOptions, defaultOptions);
  };
  const unifyCache = new ManyKeysMap();
  function createWaitElement(instanceOptions) {
    const { defaultOptions } = instanceOptions;
    return (selector, options) => {
      const {
        target,
        unifyProcess,
        observeConfigs,
        detector,
        signal,
        customMatcher
      } = mergeOptions(options, defaultOptions);
      const unifyPromiseKey = [
        selector,
        target,
        unifyProcess,
        observeConfigs,
        detector,
        signal,
        customMatcher
      ];
      const cachedPromise = unifyCache.get(unifyPromiseKey);
      if (unifyProcess && cachedPromise) {
        return cachedPromise;
      }
      const detectPromise = new Promise(
        // biome-ignore lint/suspicious/noAsyncPromiseExecutor: avoid nesting promise
        async (resolve, reject) => {
          if (signal == null ? void 0 : signal.aborted) {
            return reject(signal.reason);
          }
          const observer = new MutationObserver(
            async (mutations) => {
              for (const _ of mutations) {
                if (signal == null ? void 0 : signal.aborted) {
                  observer.disconnect();
                  break;
                }
                const detectResult2 = await detectElement({
                  selector,
                  target,
                  detector,
                  customMatcher
                });
                if (detectResult2.isDetected) {
                  observer.disconnect();
                  resolve(detectResult2.result);
                  break;
                }
              }
            }
          );
          signal == null ? void 0 : signal.addEventListener(
            "abort",
            () => {
              observer.disconnect();
              return reject(signal.reason);
            },
            { once: true }
          );
          const detectResult = await detectElement({
            selector,
            target,
            detector,
            customMatcher
          });
          if (detectResult.isDetected) {
            return resolve(detectResult.result);
          }
          observer.observe(target, observeConfigs);
        }
      ).finally(() => {
        unifyCache.delete(unifyPromiseKey);
      });
      unifyCache.set(unifyPromiseKey, detectPromise);
      return detectPromise;
    };
  }
  async function detectElement({
    target,
    selector,
    detector,
    customMatcher
  }) {
    const element = customMatcher ? customMatcher(selector) : target.querySelector(selector);
    return await detector(element);
  }
  const waitElement = createWaitElement({
    defaultOptions: getDefaultOptions()
  });
  function print$1(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger$1 = {
    debug: (...args) => print$1(console.debug, ...args),
    log: (...args) => print$1(console.log, ...args),
    warn: (...args) => print$1(console.warn, ...args),
    error: (...args) => print$1(console.error, ...args)
  };
  function applyPosition(root, positionedElement, options) {
    var _a2, _b2;
    if (options.position === "inline") return;
    if (options.zIndex != null) root.style.zIndex = String(options.zIndex);
    root.style.overflow = "visible";
    root.style.position = "relative";
    root.style.width = "0";
    root.style.height = "0";
    root.style.display = "block";
    if (positionedElement) {
      if (options.position === "overlay") {
        positionedElement.style.position = "absolute";
        if ((_a2 = options.alignment) == null ? void 0 : _a2.startsWith("bottom-"))
          positionedElement.style.bottom = "0";
        else positionedElement.style.top = "0";
        if ((_b2 = options.alignment) == null ? void 0 : _b2.endsWith("-right"))
          positionedElement.style.right = "0";
        else positionedElement.style.left = "0";
      } else {
        positionedElement.style.position = "fixed";
        positionedElement.style.top = "0";
        positionedElement.style.bottom = "0";
        positionedElement.style.left = "0";
        positionedElement.style.right = "0";
      }
    }
  }
  function getAnchor(options) {
    if (options.anchor == null) return document.body;
    let resolved = typeof options.anchor === "function" ? options.anchor() : options.anchor;
    if (typeof resolved === "string") {
      if (resolved.startsWith("/")) {
        const result2 = document.evaluate(
          resolved,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result2.singleNodeValue ?? void 0;
      } else {
        return document.querySelector(resolved) ?? void 0;
      }
    }
    return resolved ?? void 0;
  }
  function mountUi(root, options) {
    var _a2, _b2;
    const anchor = getAnchor(options);
    if (anchor == null)
      throw Error(
        "Failed to mount content script UI: could not find anchor element"
      );
    switch (options.append) {
      case void 0:
      case "last":
        anchor.append(root);
        break;
      case "first":
        anchor.prepend(root);
        break;
      case "replace":
        anchor.replaceWith(root);
        break;
      case "after":
        (_a2 = anchor.parentElement) == null ? void 0 : _a2.insertBefore(root, anchor.nextElementSibling);
        break;
      case "before":
        (_b2 = anchor.parentElement) == null ? void 0 : _b2.insertBefore(root, anchor);
        break;
      default:
        options.append(anchor, root);
        break;
    }
  }
  function createMountFunctions(baseFunctions, options) {
    let autoMountInstance = void 0;
    const stopAutoMount = () => {
      autoMountInstance == null ? void 0 : autoMountInstance.stopAutoMount();
      autoMountInstance = void 0;
    };
    const mount = () => {
      baseFunctions.mount();
    };
    const unmount = baseFunctions.remove;
    const remove = () => {
      stopAutoMount();
      baseFunctions.remove();
    };
    const autoMount = (autoMountOptions) => {
      if (autoMountInstance) {
        logger$1.warn("autoMount is already set.");
      }
      autoMountInstance = autoMountUi(
        { mount, unmount, stopAutoMount },
        {
          ...options,
          ...autoMountOptions
        }
      );
    };
    return {
      mount,
      remove,
      autoMount
    };
  }
  function autoMountUi(uiCallbacks, options) {
    const abortController = new AbortController();
    const EXPLICIT_STOP_REASON = "explicit_stop_auto_mount";
    const _stopAutoMount = () => {
      var _a2;
      abortController.abort(EXPLICIT_STOP_REASON);
      (_a2 = options.onStop) == null ? void 0 : _a2.call(options);
    };
    let resolvedAnchor = typeof options.anchor === "function" ? options.anchor() : options.anchor;
    if (resolvedAnchor instanceof Element) {
      throw Error(
        "autoMount and Element anchor option cannot be combined. Avoid passing `Element` directly or `() => Element` to the anchor."
      );
    }
    async function observeElement(selector) {
      let isAnchorExist = !!getAnchor(options);
      if (isAnchorExist) {
        uiCallbacks.mount();
      }
      while (!abortController.signal.aborted) {
        try {
          const changedAnchor = await waitElement(selector ?? "body", {
            customMatcher: () => getAnchor(options) ?? null,
            detector: isAnchorExist ? isNotExist : isExist,
            signal: abortController.signal
          });
          isAnchorExist = !!changedAnchor;
          if (isAnchorExist) {
            uiCallbacks.mount();
          } else {
            uiCallbacks.unmount();
            if (options.once) {
              uiCallbacks.stopAutoMount();
            }
          }
        } catch (error) {
          if (abortController.signal.aborted && abortController.signal.reason === EXPLICIT_STOP_REASON) {
            break;
          } else {
            throw error;
          }
        }
      }
    }
    observeElement(resolvedAnchor);
    return { stopAutoMount: _stopAutoMount };
  }
  function createIframeUi(ctx, options) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-wxt-iframe", "");
    const iframe = document.createElement("iframe");
    iframe.src = browser.runtime.getURL(options.page);
    wrapper.appendChild(iframe);
    let mounted = void 0;
    const mount = () => {
      var _a2;
      applyPosition(wrapper, iframe, options);
      mountUi(wrapper, options);
      mounted = (_a2 = options.onMount) == null ? void 0 : _a2.call(options, wrapper, iframe);
    };
    const remove = () => {
      var _a2;
      (_a2 = options.onRemove) == null ? void 0 : _a2.call(options, mounted);
      wrapper.remove();
      mounted = void 0;
    };
    const mountFunctions = createMountFunctions({ mount, remove }, options);
    ctx.onInvalidated(remove);
    return {
      get mounted() {
        return mounted;
      },
      iframe,
      wrapper,
      ...mountFunctions
    };
  }
  const definition = defineContentScript({
    registration: "runtime",
    matches: ["<all_urls>"],
    main(ctx) {
      console.log("Content script running...");
      try {
        const ui = createIframeUi(ctx, {
          page: "/example-iframe.html",
          position: "inline",
          anchor: "body",
          onMount: (wrapper, iframe) => {
            console.log("iframe mounted");
            iframe.width = "100%";
            iframe.height = "300px";
            iframe.style.border = "2px solid red";
            wrapper.style.margin = "10px 0";
          },
          onRemove: () => {
            console.log("iframe UI 已移除");
          }
        });
        ui.autoMount();
        console.log("UI mount called");
      } catch (error) {
        console.error("Error creating iframe UI:", error);
      }
    }
  });
  contentxxx;
  function initPlugins() {
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  const result = (async () => {
    try {
      initPlugins();
      return await definition.main();
    } catch (err) {
      logger.error(
        `The unlisted script "${"contentxxx"}" crashed on startup!`,
        err
      );
      throw err;
    }
  })();
  return result;
}();
contentxxx;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudHh4eC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjZfQHR5cGVzK25vZGVAMjIuMTUuMTdfaml0aUAyLjQuMl9yb2xsdXBANC40MC4yX3N1Z2Fyc3NANC4wLjFfcG9zdGNzc0A4LjUuM18vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHd4dC1kZXYrYnJvd3NlckAwLjAuMzE3L25vZGVfbW9kdWxlcy9Ad3h0LWRldi9icm93c2VyL3NyYy9pbmRleC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuNl9AdHlwZXMrbm9kZUAyMi4xNS4xN19qaXRpQDIuNC4yX3JvbGx1cEA0LjQwLjJfc3VnYXJzc0A0LjAuMV9wb3N0Y3NzQDguNS4zXy9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vbWFueS1rZXlzLW1hcEAyLjAuMS9ub2RlX21vZHVsZXMvbWFueS1rZXlzLW1hcC9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9kZWZ1QDYuMS40L25vZGVfbW9kdWxlcy9kZWZ1L2Rpc3QvZGVmdS5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQDFuYXRzdSt3YWl0LWVsZW1lbnRANC4xLjIvbm9kZV9tb2R1bGVzL0AxbmF0c3Uvd2FpdC1lbGVtZW50L2Rpc3QvZGV0ZWN0b3JzLm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AMW5hdHN1K3dhaXQtZWxlbWVudEA0LjEuMi9ub2RlX21vZHVsZXMvQDFuYXRzdS93YWl0LWVsZW1lbnQvZGlzdC9pbmRleC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuNl9AdHlwZXMrbm9kZUAyMi4xNS4xN19qaXRpQDIuNC4yX3JvbGx1cEA0LjQwLjJfc3VnYXJzc0A0LjAuMV9wb3N0Y3NzQDguNS4zXy9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC42X0B0eXBlcytub2RlQDIyLjE1LjE3X2ppdGlAMi40LjJfcm9sbHVwQDQuNDAuMl9zdWdhcnNzQDQuMC4xX3Bvc3Rjc3NAOC41LjNfL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9jb250ZW50LXNjcmlwdC11aS9zaGFyZWQubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjZfQHR5cGVzK25vZGVAMjIuMTUuMTdfaml0aUAyLjQuMl9yb2xsdXBANC40MC4yX3N1Z2Fyc3NANC4wLjFfcG9zdGNzc0A4LjUuM18vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LXVpL2lmcmFtZS5tanMiLCIuLi8uLi9lbnRyeXBvaW50cy9jb250ZW50eHh4L2luZGV4LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZGVmaW5lQ29udGVudFNjcmlwdChkZWZpbml0aW9uKSB7XG4gIHJldHVybiBkZWZpbml0aW9uO1xufVxuIiwiLy8gI3JlZ2lvbiBzbmlwcGV0XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IGdsb2JhbFRoaXMuYnJvd3Nlcj8ucnVudGltZT8uaWRcbiAgPyBnbG9iYWxUaGlzLmJyb3dzZXJcbiAgOiBnbG9iYWxUaGlzLmNocm9tZTtcbi8vICNlbmRyZWdpb24gc25pcHBldFxuIiwiaW1wb3J0IHsgYnJvd3NlciBhcyBfYnJvd3NlciB9IGZyb20gXCJAd3h0LWRldi9icm93c2VyXCI7XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IF9icm93c2VyO1xuZXhwb3J0IHt9O1xuIiwiY29uc3QgbnVsbEtleSA9IFN5bWJvbCgnbnVsbCcpOyAvLyBgb2JqZWN0SGFzaGVzYCBrZXkgZm9yIG51bGxcblxubGV0IGtleUNvdW50ZXIgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYW55S2V5c01hcCBleHRlbmRzIE1hcCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9vYmplY3RIYXNoZXMgPSBuZXcgV2Vha01hcCgpO1xuXHRcdHRoaXMuX3N5bWJvbEhhc2hlcyA9IG5ldyBNYXAoKTsgLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvZWNtYTI2Mi9pc3N1ZXMvMTE5NFxuXHRcdHRoaXMuX3B1YmxpY0tleXMgPSBuZXcgTWFwKCk7XG5cblx0XHRjb25zdCBbcGFpcnNdID0gYXJndW1lbnRzOyAvLyBNYXAgY29tcGF0XG5cdFx0aWYgKHBhaXJzID09PSBudWxsIHx8IHBhaXJzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHBhaXJzW1N5bWJvbC5pdGVyYXRvcl0gIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodHlwZW9mIHBhaXJzICsgJyBpcyBub3QgaXRlcmFibGUgKGNhbm5vdCByZWFkIHByb3BlcnR5IFN5bWJvbChTeW1ib2wuaXRlcmF0b3IpKScpO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgW2tleXMsIHZhbHVlXSBvZiBwYWlycykge1xuXHRcdFx0dGhpcy5zZXQoa2V5cywgdmFsdWUpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRQdWJsaWNLZXlzKGtleXMsIGNyZWF0ZSA9IGZhbHNlKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGtleXMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUga2V5cyBwYXJhbWV0ZXIgbXVzdCBiZSBhbiBhcnJheScpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHByaXZhdGVLZXkgPSB0aGlzLl9nZXRQcml2YXRlS2V5KGtleXMsIGNyZWF0ZSk7XG5cblx0XHRsZXQgcHVibGljS2V5O1xuXHRcdGlmIChwcml2YXRlS2V5ICYmIHRoaXMuX3B1YmxpY0tleXMuaGFzKHByaXZhdGVLZXkpKSB7XG5cdFx0XHRwdWJsaWNLZXkgPSB0aGlzLl9wdWJsaWNLZXlzLmdldChwcml2YXRlS2V5KTtcblx0XHR9IGVsc2UgaWYgKGNyZWF0ZSkge1xuXHRcdFx0cHVibGljS2V5ID0gWy4uLmtleXNdOyAvLyBSZWdlbmVyYXRlIGtleXMgYXJyYXkgdG8gYXZvaWQgZXh0ZXJuYWwgaW50ZXJhY3Rpb25cblx0XHRcdHRoaXMuX3B1YmxpY0tleXMuc2V0KHByaXZhdGVLZXksIHB1YmxpY0tleSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtwcml2YXRlS2V5LCBwdWJsaWNLZXl9O1xuXHR9XG5cblx0X2dldFByaXZhdGVLZXkoa2V5cywgY3JlYXRlID0gZmFsc2UpIHtcblx0XHRjb25zdCBwcml2YXRlS2V5cyA9IFtdO1xuXHRcdGZvciAobGV0IGtleSBvZiBrZXlzKSB7XG5cdFx0XHRpZiAoa2V5ID09PSBudWxsKSB7XG5cdFx0XHRcdGtleSA9IG51bGxLZXk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGhhc2hlcyA9IHR5cGVvZiBrZXkgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBrZXkgPT09ICdmdW5jdGlvbicgPyAnX29iamVjdEhhc2hlcycgOiAodHlwZW9mIGtleSA9PT0gJ3N5bWJvbCcgPyAnX3N5bWJvbEhhc2hlcycgOiBmYWxzZSk7XG5cblx0XHRcdGlmICghaGFzaGVzKSB7XG5cdFx0XHRcdHByaXZhdGVLZXlzLnB1c2goa2V5KTtcblx0XHRcdH0gZWxzZSBpZiAodGhpc1toYXNoZXNdLmhhcyhrZXkpKSB7XG5cdFx0XHRcdHByaXZhdGVLZXlzLnB1c2godGhpc1toYXNoZXNdLmdldChrZXkpKTtcblx0XHRcdH0gZWxzZSBpZiAoY3JlYXRlKSB7XG5cdFx0XHRcdGNvbnN0IHByaXZhdGVLZXkgPSBgQEBta20tcmVmLSR7a2V5Q291bnRlcisrfUBAYDtcblx0XHRcdFx0dGhpc1toYXNoZXNdLnNldChrZXksIHByaXZhdGVLZXkpO1xuXHRcdFx0XHRwcml2YXRlS2V5cy5wdXNoKHByaXZhdGVLZXkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShwcml2YXRlS2V5cyk7XG5cdH1cblxuXHRzZXQoa2V5cywgdmFsdWUpIHtcblx0XHRjb25zdCB7cHVibGljS2V5fSA9IHRoaXMuX2dldFB1YmxpY0tleXMoa2V5cywgdHJ1ZSk7XG5cdFx0cmV0dXJuIHN1cGVyLnNldChwdWJsaWNLZXksIHZhbHVlKTtcblx0fVxuXG5cdGdldChrZXlzKSB7XG5cdFx0Y29uc3Qge3B1YmxpY0tleX0gPSB0aGlzLl9nZXRQdWJsaWNLZXlzKGtleXMpO1xuXHRcdHJldHVybiBzdXBlci5nZXQocHVibGljS2V5KTtcblx0fVxuXG5cdGhhcyhrZXlzKSB7XG5cdFx0Y29uc3Qge3B1YmxpY0tleX0gPSB0aGlzLl9nZXRQdWJsaWNLZXlzKGtleXMpO1xuXHRcdHJldHVybiBzdXBlci5oYXMocHVibGljS2V5KTtcblx0fVxuXG5cdGRlbGV0ZShrZXlzKSB7XG5cdFx0Y29uc3Qge3B1YmxpY0tleSwgcHJpdmF0ZUtleX0gPSB0aGlzLl9nZXRQdWJsaWNLZXlzKGtleXMpO1xuXHRcdHJldHVybiBCb29sZWFuKHB1YmxpY0tleSAmJiBzdXBlci5kZWxldGUocHVibGljS2V5KSAmJiB0aGlzLl9wdWJsaWNLZXlzLmRlbGV0ZShwcml2YXRlS2V5KSk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHRzdXBlci5jbGVhcigpO1xuXHRcdHRoaXMuX3N5bWJvbEhhc2hlcy5jbGVhcigpO1xuXHRcdHRoaXMuX3B1YmxpY0tleXMuY2xlYXIoKTtcblx0fVxuXG5cdGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSgpIHtcblx0XHRyZXR1cm4gJ01hbnlLZXlzTWFwJztcblx0fVxuXG5cdGdldCBzaXplKCkge1xuXHRcdHJldHVybiBzdXBlci5zaXplO1xuXHR9XG59XG4iLCJmdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKTtcbiAgaWYgKHByb3RvdHlwZSAhPT0gbnVsbCAmJiBwcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvdHlwZSkgIT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiB2YWx1ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoU3ltYm9sLnRvU3RyaW5nVGFnIGluIHZhbHVlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09IFwiW29iamVjdCBNb2R1bGVdXCI7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIF9kZWZ1KGJhc2VPYmplY3QsIGRlZmF1bHRzLCBuYW1lc3BhY2UgPSBcIi5cIiwgbWVyZ2VyKSB7XG4gIGlmICghaXNQbGFpbk9iamVjdChkZWZhdWx0cykpIHtcbiAgICByZXR1cm4gX2RlZnUoYmFzZU9iamVjdCwge30sIG5hbWVzcGFjZSwgbWVyZ2VyKTtcbiAgfVxuICBjb25zdCBvYmplY3QgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cyk7XG4gIGZvciAoY29uc3Qga2V5IGluIGJhc2VPYmplY3QpIHtcbiAgICBpZiAoa2V5ID09PSBcIl9fcHJvdG9fX1wiIHx8IGtleSA9PT0gXCJjb25zdHJ1Y3RvclwiKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWUgPSBiYXNlT2JqZWN0W2tleV07XG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAobWVyZ2VyICYmIG1lcmdlcihvYmplY3QsIGtleSwgdmFsdWUsIG5hbWVzcGFjZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgQXJyYXkuaXNBcnJheShvYmplY3Rba2V5XSkpIHtcbiAgICAgIG9iamVjdFtrZXldID0gWy4uLnZhbHVlLCAuLi5vYmplY3Rba2V5XV07XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbHVlKSAmJiBpc1BsYWluT2JqZWN0KG9iamVjdFtrZXldKSkge1xuICAgICAgb2JqZWN0W2tleV0gPSBfZGVmdShcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIG9iamVjdFtrZXldLFxuICAgICAgICAobmFtZXNwYWNlID8gYCR7bmFtZXNwYWNlfS5gIDogXCJcIikgKyBrZXkudG9TdHJpbmcoKSxcbiAgICAgICAgbWVyZ2VyXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuZnVuY3Rpb24gY3JlYXRlRGVmdShtZXJnZXIpIHtcbiAgcmV0dXJuICguLi5hcmd1bWVudHNfKSA9PiAoXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHVuaWNvcm4vbm8tYXJyYXktcmVkdWNlXG4gICAgYXJndW1lbnRzXy5yZWR1Y2UoKHAsIGMpID0+IF9kZWZ1KHAsIGMsIFwiXCIsIG1lcmdlciksIHt9KVxuICApO1xufVxuY29uc3QgZGVmdSA9IGNyZWF0ZURlZnUoKTtcbmNvbnN0IGRlZnVGbiA9IGNyZWF0ZURlZnUoKG9iamVjdCwga2V5LCBjdXJyZW50VmFsdWUpID0+IHtcbiAgaWYgKG9iamVjdFtrZXldICE9PSB2b2lkIDAgJiYgdHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgb2JqZWN0W2tleV0gPSBjdXJyZW50VmFsdWUob2JqZWN0W2tleV0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59KTtcbmNvbnN0IGRlZnVBcnJheUZuID0gY3JlYXRlRGVmdSgob2JqZWN0LCBrZXksIGN1cnJlbnRWYWx1ZSkgPT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmplY3Rba2V5XSkgJiYgdHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgb2JqZWN0W2tleV0gPSBjdXJyZW50VmFsdWUob2JqZWN0W2tleV0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59KTtcblxuZXhwb3J0IHsgY3JlYXRlRGVmdSwgZGVmdSBhcyBkZWZhdWx0LCBkZWZ1LCBkZWZ1QXJyYXlGbiwgZGVmdUZuIH07XG4iLCJjb25zdCBpc0V4aXN0ID0gKGVsZW1lbnQpID0+IHtcbiAgcmV0dXJuIGVsZW1lbnQgIT09IG51bGwgPyB7IGlzRGV0ZWN0ZWQ6IHRydWUsIHJlc3VsdDogZWxlbWVudCB9IDogeyBpc0RldGVjdGVkOiBmYWxzZSB9O1xufTtcbmNvbnN0IGlzTm90RXhpc3QgPSAoZWxlbWVudCkgPT4ge1xuICByZXR1cm4gZWxlbWVudCA9PT0gbnVsbCA/IHsgaXNEZXRlY3RlZDogdHJ1ZSwgcmVzdWx0OiBudWxsIH0gOiB7IGlzRGV0ZWN0ZWQ6IGZhbHNlIH07XG59O1xuXG5leHBvcnQgeyBpc0V4aXN0LCBpc05vdEV4aXN0IH07XG4iLCJpbXBvcnQgTWFueUtleXNNYXAgZnJvbSAnbWFueS1rZXlzLW1hcCc7XG5pbXBvcnQgeyBkZWZ1IH0gZnJvbSAnZGVmdSc7XG5pbXBvcnQgeyBpc0V4aXN0IH0gZnJvbSAnLi9kZXRlY3RvcnMubWpzJztcblxuY29uc3QgZ2V0RGVmYXVsdE9wdGlvbnMgPSAoKSA9PiAoe1xuICB0YXJnZXQ6IGdsb2JhbFRoaXMuZG9jdW1lbnQsXG4gIHVuaWZ5UHJvY2VzczogdHJ1ZSxcbiAgZGV0ZWN0b3I6IGlzRXhpc3QsXG4gIG9ic2VydmVDb25maWdzOiB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgYXR0cmlidXRlczogdHJ1ZVxuICB9LFxuICBzaWduYWw6IHZvaWQgMCxcbiAgY3VzdG9tTWF0Y2hlcjogdm9pZCAwXG59KTtcbmNvbnN0IG1lcmdlT3B0aW9ucyA9ICh1c2VyU2lkZU9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKSA9PiB7XG4gIHJldHVybiBkZWZ1KHVzZXJTaWRlT3B0aW9ucywgZGVmYXVsdE9wdGlvbnMpO1xufTtcblxuY29uc3QgdW5pZnlDYWNoZSA9IG5ldyBNYW55S2V5c01hcCgpO1xuZnVuY3Rpb24gY3JlYXRlV2FpdEVsZW1lbnQoaW5zdGFuY2VPcHRpb25zKSB7XG4gIGNvbnN0IHsgZGVmYXVsdE9wdGlvbnMgfSA9IGluc3RhbmNlT3B0aW9ucztcbiAgcmV0dXJuIChzZWxlY3Rvciwgb3B0aW9ucykgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHRhcmdldCxcbiAgICAgIHVuaWZ5UHJvY2VzcyxcbiAgICAgIG9ic2VydmVDb25maWdzLFxuICAgICAgZGV0ZWN0b3IsXG4gICAgICBzaWduYWwsXG4gICAgICBjdXN0b21NYXRjaGVyXG4gICAgfSA9IG1lcmdlT3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0T3B0aW9ucyk7XG4gICAgY29uc3QgdW5pZnlQcm9taXNlS2V5ID0gW1xuICAgICAgc2VsZWN0b3IsXG4gICAgICB0YXJnZXQsXG4gICAgICB1bmlmeVByb2Nlc3MsXG4gICAgICBvYnNlcnZlQ29uZmlncyxcbiAgICAgIGRldGVjdG9yLFxuICAgICAgc2lnbmFsLFxuICAgICAgY3VzdG9tTWF0Y2hlclxuICAgIF07XG4gICAgY29uc3QgY2FjaGVkUHJvbWlzZSA9IHVuaWZ5Q2FjaGUuZ2V0KHVuaWZ5UHJvbWlzZUtleSk7XG4gICAgaWYgKHVuaWZ5UHJvY2VzcyAmJiBjYWNoZWRQcm9taXNlKSB7XG4gICAgICByZXR1cm4gY2FjaGVkUHJvbWlzZTtcbiAgICB9XG4gICAgY29uc3QgZGV0ZWN0UHJvbWlzZSA9IG5ldyBQcm9taXNlKFxuICAgICAgLy8gYmlvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0FzeW5jUHJvbWlzZUV4ZWN1dG9yOiBhdm9pZCBuZXN0aW5nIHByb21pc2VcbiAgICAgIGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3Qoc2lnbmFsLnJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihcbiAgICAgICAgICBhc3luYyAobXV0YXRpb25zKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IF8gb2YgbXV0YXRpb25zKSB7XG4gICAgICAgICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgZGV0ZWN0UmVzdWx0MiA9IGF3YWl0IGRldGVjdEVsZW1lbnQoe1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgICAgICBkZXRlY3RvcixcbiAgICAgICAgICAgICAgICBjdXN0b21NYXRjaGVyXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoZGV0ZWN0UmVzdWx0Mi5pc0RldGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZGV0ZWN0UmVzdWx0Mi5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBzaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgXCJhYm9ydFwiLFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3Qoc2lnbmFsLnJlYXNvbik7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IG9uY2U6IHRydWUgfVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBkZXRlY3RSZXN1bHQgPSBhd2FpdCBkZXRlY3RFbGVtZW50KHtcbiAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgZGV0ZWN0b3IsXG4gICAgICAgICAgY3VzdG9tTWF0Y2hlclxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGRldGVjdFJlc3VsdC5pc0RldGVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGV0ZWN0UmVzdWx0LnJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQsIG9ic2VydmVDb25maWdzKTtcbiAgICAgIH1cbiAgICApLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgdW5pZnlDYWNoZS5kZWxldGUodW5pZnlQcm9taXNlS2V5KTtcbiAgICB9KTtcbiAgICB1bmlmeUNhY2hlLnNldCh1bmlmeVByb21pc2VLZXksIGRldGVjdFByb21pc2UpO1xuICAgIHJldHVybiBkZXRlY3RQcm9taXNlO1xuICB9O1xufVxuYXN5bmMgZnVuY3Rpb24gZGV0ZWN0RWxlbWVudCh7XG4gIHRhcmdldCxcbiAgc2VsZWN0b3IsXG4gIGRldGVjdG9yLFxuICBjdXN0b21NYXRjaGVyXG59KSB7XG4gIGNvbnN0IGVsZW1lbnQgPSBjdXN0b21NYXRjaGVyID8gY3VzdG9tTWF0Y2hlcihzZWxlY3RvcikgOiB0YXJnZXQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIHJldHVybiBhd2FpdCBkZXRlY3RvcihlbGVtZW50KTtcbn1cbmNvbnN0IHdhaXRFbGVtZW50ID0gY3JlYXRlV2FpdEVsZW1lbnQoe1xuICBkZWZhdWx0T3B0aW9uczogZ2V0RGVmYXVsdE9wdGlvbnMoKVxufSk7XG5cbmV4cG9ydCB7IGNyZWF0ZVdhaXRFbGVtZW50LCBnZXREZWZhdWx0T3B0aW9ucywgd2FpdEVsZW1lbnQgfTtcbiIsImZ1bmN0aW9uIHByaW50KG1ldGhvZCwgLi4uYXJncykge1xuICBpZiAoaW1wb3J0Lm1ldGEuZW52Lk1PREUgPT09IFwicHJvZHVjdGlvblwiKSByZXR1cm47XG4gIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBhcmdzLnNoaWZ0KCk7XG4gICAgbWV0aG9kKGBbd3h0XSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgbWV0aG9kKFwiW3d4dF1cIiwgLi4uYXJncyk7XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBsb2dnZXIgPSB7XG4gIGRlYnVnOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5kZWJ1ZywgLi4uYXJncyksXG4gIGxvZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUubG9nLCAuLi5hcmdzKSxcbiAgd2FybjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUud2FybiwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5lcnJvciwgLi4uYXJncylcbn07XG4iLCJpbXBvcnQgeyB3YWl0RWxlbWVudCB9IGZyb20gXCJAMW5hdHN1L3dhaXQtZWxlbWVudFwiO1xuaW1wb3J0IHtcbiAgaXNFeGlzdCBhcyBtb3VudERldGVjdG9yLFxuICBpc05vdEV4aXN0IGFzIHJlbW92ZURldGVjdG9yXG59IGZyb20gXCJAMW5hdHN1L3dhaXQtZWxlbWVudC9kZXRlY3RvcnNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi8uLi91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzXCI7XG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQb3NpdGlvbihyb290LCBwb3NpdGlvbmVkRWxlbWVudCwgb3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5wb3NpdGlvbiA9PT0gXCJpbmxpbmVcIikgcmV0dXJuO1xuICBpZiAob3B0aW9ucy56SW5kZXggIT0gbnVsbCkgcm9vdC5zdHlsZS56SW5kZXggPSBTdHJpbmcob3B0aW9ucy56SW5kZXgpO1xuICByb290LnN0eWxlLm92ZXJmbG93ID0gXCJ2aXNpYmxlXCI7XG4gIHJvb3Quc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG4gIHJvb3Quc3R5bGUud2lkdGggPSBcIjBcIjtcbiAgcm9vdC5zdHlsZS5oZWlnaHQgPSBcIjBcIjtcbiAgcm9vdC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICBpZiAocG9zaXRpb25lZEVsZW1lbnQpIHtcbiAgICBpZiAob3B0aW9ucy5wb3NpdGlvbiA9PT0gXCJvdmVybGF5XCIpIHtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgaWYgKG9wdGlvbnMuYWxpZ25tZW50Py5zdGFydHNXaXRoKFwiYm90dG9tLVwiKSlcbiAgICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUuYm90dG9tID0gXCIwXCI7XG4gICAgICBlbHNlIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnRvcCA9IFwiMFwiO1xuICAgICAgaWYgKG9wdGlvbnMuYWxpZ25tZW50Py5lbmRzV2l0aChcIi1yaWdodFwiKSlcbiAgICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUucmlnaHQgPSBcIjBcIjtcbiAgICAgIGVsc2UgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnRvcCA9IFwiMFwiO1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUuYm90dG9tID0gXCIwXCI7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwXCI7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5yaWdodCA9IFwiMFwiO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEFuY2hvcihvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLmFuY2hvciA9PSBudWxsKSByZXR1cm4gZG9jdW1lbnQuYm9keTtcbiAgbGV0IHJlc29sdmVkID0gdHlwZW9mIG9wdGlvbnMuYW5jaG9yID09PSBcImZ1bmN0aW9uXCIgPyBvcHRpb25zLmFuY2hvcigpIDogb3B0aW9ucy5hbmNob3I7XG4gIGlmICh0eXBlb2YgcmVzb2x2ZWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAocmVzb2x2ZWQuc3RhcnRzV2l0aChcIi9cIikpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGRvY3VtZW50LmV2YWx1YXRlKFxuICAgICAgICByZXNvbHZlZCxcbiAgICAgICAgZG9jdW1lbnQsXG4gICAgICAgIG51bGwsXG4gICAgICAgIFhQYXRoUmVzdWx0LkZJUlNUX09SREVSRURfTk9ERV9UWVBFLFxuICAgICAgICBudWxsXG4gICAgICApO1xuICAgICAgcmV0dXJuIHJlc3VsdC5zaW5nbGVOb2RlVmFsdWUgPz8gdm9pZCAwO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihyZXNvbHZlZCkgPz8gdm9pZCAwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzb2x2ZWQgPz8gdm9pZCAwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG1vdW50VWkocm9vdCwgb3B0aW9ucykge1xuICBjb25zdCBhbmNob3IgPSBnZXRBbmNob3Iob3B0aW9ucyk7XG4gIGlmIChhbmNob3IgPT0gbnVsbClcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIFwiRmFpbGVkIHRvIG1vdW50IGNvbnRlbnQgc2NyaXB0IFVJOiBjb3VsZCBub3QgZmluZCBhbmNob3IgZWxlbWVudFwiXG4gICAgKTtcbiAgc3dpdGNoIChvcHRpb25zLmFwcGVuZCkge1xuICAgIGNhc2Ugdm9pZCAwOlxuICAgIGNhc2UgXCJsYXN0XCI6XG4gICAgICBhbmNob3IuYXBwZW5kKHJvb3QpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImZpcnN0XCI6XG4gICAgICBhbmNob3IucHJlcGVuZChyb290KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJyZXBsYWNlXCI6XG4gICAgICBhbmNob3IucmVwbGFjZVdpdGgocm9vdCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYWZ0ZXJcIjpcbiAgICAgIGFuY2hvci5wYXJlbnRFbGVtZW50Py5pbnNlcnRCZWZvcmUocm9vdCwgYW5jaG9yLm5leHRFbGVtZW50U2libGluZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYmVmb3JlXCI6XG4gICAgICBhbmNob3IucGFyZW50RWxlbWVudD8uaW5zZXJ0QmVmb3JlKHJvb3QsIGFuY2hvcik7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgb3B0aW9ucy5hcHBlbmQoYW5jaG9yLCByb290KTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW91bnRGdW5jdGlvbnMoYmFzZUZ1bmN0aW9ucywgb3B0aW9ucykge1xuICBsZXQgYXV0b01vdW50SW5zdGFuY2UgPSB2b2lkIDA7XG4gIGNvbnN0IHN0b3BBdXRvTW91bnQgPSAoKSA9PiB7XG4gICAgYXV0b01vdW50SW5zdGFuY2U/LnN0b3BBdXRvTW91bnQoKTtcbiAgICBhdXRvTW91bnRJbnN0YW5jZSA9IHZvaWQgMDtcbiAgfTtcbiAgY29uc3QgbW91bnQgPSAoKSA9PiB7XG4gICAgYmFzZUZ1bmN0aW9ucy5tb3VudCgpO1xuICB9O1xuICBjb25zdCB1bm1vdW50ID0gYmFzZUZ1bmN0aW9ucy5yZW1vdmU7XG4gIGNvbnN0IHJlbW92ZSA9ICgpID0+IHtcbiAgICBzdG9wQXV0b01vdW50KCk7XG4gICAgYmFzZUZ1bmN0aW9ucy5yZW1vdmUoKTtcbiAgfTtcbiAgY29uc3QgYXV0b01vdW50ID0gKGF1dG9Nb3VudE9wdGlvbnMpID0+IHtcbiAgICBpZiAoYXV0b01vdW50SW5zdGFuY2UpIHtcbiAgICAgIGxvZ2dlci53YXJuKFwiYXV0b01vdW50IGlzIGFscmVhZHkgc2V0LlwiKTtcbiAgICB9XG4gICAgYXV0b01vdW50SW5zdGFuY2UgPSBhdXRvTW91bnRVaShcbiAgICAgIHsgbW91bnQsIHVubW91bnQsIHN0b3BBdXRvTW91bnQgfSxcbiAgICAgIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgLi4uYXV0b01vdW50T3B0aW9uc1xuICAgICAgfVxuICAgICk7XG4gIH07XG4gIHJldHVybiB7XG4gICAgbW91bnQsXG4gICAgcmVtb3ZlLFxuICAgIGF1dG9Nb3VudFxuICB9O1xufVxuZnVuY3Rpb24gYXV0b01vdW50VWkodWlDYWxsYmFja3MsIG9wdGlvbnMpIHtcbiAgY29uc3QgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICBjb25zdCBFWFBMSUNJVF9TVE9QX1JFQVNPTiA9IFwiZXhwbGljaXRfc3RvcF9hdXRvX21vdW50XCI7XG4gIGNvbnN0IF9zdG9wQXV0b01vdW50ID0gKCkgPT4ge1xuICAgIGFib3J0Q29udHJvbGxlci5hYm9ydChFWFBMSUNJVF9TVE9QX1JFQVNPTik7XG4gICAgb3B0aW9ucy5vblN0b3A/LigpO1xuICB9O1xuICBsZXQgcmVzb2x2ZWRBbmNob3IgPSB0eXBlb2Ygb3B0aW9ucy5hbmNob3IgPT09IFwiZnVuY3Rpb25cIiA/IG9wdGlvbnMuYW5jaG9yKCkgOiBvcHRpb25zLmFuY2hvcjtcbiAgaWYgKHJlc29sdmVkQW5jaG9yIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgXCJhdXRvTW91bnQgYW5kIEVsZW1lbnQgYW5jaG9yIG9wdGlvbiBjYW5ub3QgYmUgY29tYmluZWQuIEF2b2lkIHBhc3NpbmcgYEVsZW1lbnRgIGRpcmVjdGx5IG9yIGAoKSA9PiBFbGVtZW50YCB0byB0aGUgYW5jaG9yLlwiXG4gICAgKTtcbiAgfVxuICBhc3luYyBmdW5jdGlvbiBvYnNlcnZlRWxlbWVudChzZWxlY3Rvcikge1xuICAgIGxldCBpc0FuY2hvckV4aXN0ID0gISFnZXRBbmNob3Iob3B0aW9ucyk7XG4gICAgaWYgKGlzQW5jaG9yRXhpc3QpIHtcbiAgICAgIHVpQ2FsbGJhY2tzLm1vdW50KCk7XG4gICAgfVxuICAgIHdoaWxlICghYWJvcnRDb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjaGFuZ2VkQW5jaG9yID0gYXdhaXQgd2FpdEVsZW1lbnQoc2VsZWN0b3IgPz8gXCJib2R5XCIsIHtcbiAgICAgICAgICBjdXN0b21NYXRjaGVyOiAoKSA9PiBnZXRBbmNob3Iob3B0aW9ucykgPz8gbnVsbCxcbiAgICAgICAgICBkZXRlY3RvcjogaXNBbmNob3JFeGlzdCA/IHJlbW92ZURldGVjdG9yIDogbW91bnREZXRlY3RvcixcbiAgICAgICAgICBzaWduYWw6IGFib3J0Q29udHJvbGxlci5zaWduYWxcbiAgICAgICAgfSk7XG4gICAgICAgIGlzQW5jaG9yRXhpc3QgPSAhIWNoYW5nZWRBbmNob3I7XG4gICAgICAgIGlmIChpc0FuY2hvckV4aXN0KSB7XG4gICAgICAgICAgdWlDYWxsYmFja3MubW91bnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1aUNhbGxiYWNrcy51bm1vdW50KCk7XG4gICAgICAgICAgaWYgKG9wdGlvbnMub25jZSkge1xuICAgICAgICAgICAgdWlDYWxsYmFja3Muc3RvcEF1dG9Nb3VudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGFib3J0Q29udHJvbGxlci5zaWduYWwuYWJvcnRlZCAmJiBhYm9ydENvbnRyb2xsZXIuc2lnbmFsLnJlYXNvbiA9PT0gRVhQTElDSVRfU1RPUF9SRUFTT04pIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBvYnNlcnZlRWxlbWVudChyZXNvbHZlZEFuY2hvcik7XG4gIHJldHVybiB7IHN0b3BBdXRvTW91bnQ6IF9zdG9wQXV0b01vdW50IH07XG59XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5pbXBvcnQgeyBhcHBseVBvc2l0aW9uLCBjcmVhdGVNb3VudEZ1bmN0aW9ucywgbW91bnRVaSB9IGZyb20gXCIuL3NoYXJlZC5tanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJZnJhbWVVaShjdHgsIG9wdGlvbnMpIHtcbiAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHdyYXBwZXIuc2V0QXR0cmlidXRlKFwiZGF0YS13eHQtaWZyYW1lXCIsIFwiXCIpO1xuICBjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuICBpZnJhbWUuc3JjID0gYnJvd3Nlci5ydW50aW1lLmdldFVSTChvcHRpb25zLnBhZ2UpO1xuICB3cmFwcGVyLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGxldCBtb3VudGVkID0gdm9pZCAwO1xuICBjb25zdCBtb3VudCA9ICgpID0+IHtcbiAgICBhcHBseVBvc2l0aW9uKHdyYXBwZXIsIGlmcmFtZSwgb3B0aW9ucyk7XG4gICAgbW91bnRVaSh3cmFwcGVyLCBvcHRpb25zKTtcbiAgICBtb3VudGVkID0gb3B0aW9ucy5vbk1vdW50Py4od3JhcHBlciwgaWZyYW1lKTtcbiAgfTtcbiAgY29uc3QgcmVtb3ZlID0gKCkgPT4ge1xuICAgIG9wdGlvbnMub25SZW1vdmU/Lihtb3VudGVkKTtcbiAgICB3cmFwcGVyLnJlbW92ZSgpO1xuICAgIG1vdW50ZWQgPSB2b2lkIDA7XG4gIH07XG4gIGNvbnN0IG1vdW50RnVuY3Rpb25zID0gY3JlYXRlTW91bnRGdW5jdGlvbnMoeyBtb3VudCwgcmVtb3ZlIH0sIG9wdGlvbnMpO1xuICBjdHgub25JbnZhbGlkYXRlZChyZW1vdmUpO1xuICByZXR1cm4ge1xuICAgIGdldCBtb3VudGVkKCkge1xuICAgICAgcmV0dXJuIG1vdW50ZWQ7XG4gICAgfSxcbiAgICBpZnJhbWUsXG4gICAgd3JhcHBlcixcbiAgICAuLi5tb3VudEZ1bmN0aW9uc1xuICB9O1xufVxuIiwiaW1wb3J0IFwiLi9zdHlsZS5jc3NcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tL2NsaWVudFwiO1xuaW1wb3J0IEFwcCBmcm9tIFwiLi9BcHAudHN4XCI7XG5pbXBvcnQgeyBjcmVhdGVJbnRlZ3JhdGVkVWksIGNyZWF0ZUlmcmFtZVVpIH0gZnJvbSBcIiNpbXBvcnRzXCI7XG5cbi8vIGV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbnRlbnRTY3JpcHQoe1xuLy8gICByZWdpc3RyYXRpb246IFwicnVudGltZVwiLFxuLy8gICBjc3NJbmplY3Rpb25Nb2RlOiBcInVpXCIsXG5cbi8vICAgbWF0Y2hlczogW10sXG4vLyAgIGFzeW5jIG1haW4oY3R4KSB7XG4vLyAgICAgY29uc3QgdWkgPSBhd2FpdCBjcmVhdGVTaGFkb3dSb290VWkoY3R4LCB7XG4vLyAgICAgICBuYW1lOiBcImFjdGl2ZS10YWItdWlcIixcbi8vICAgICAgIHBvc2l0aW9uOiBcImlubGluZVwiLFxuLy8gICAgICAgYXBwZW5kOiBcImJlZm9yZVwiLFxuLy8gICAgICAgb25Nb3VudChjb250YWluZXIpIHtcbi8vICAgICAgICAgY29uc3QgYXBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4vLyAgICAgICAgIGFwcC50ZXh0Q29udGVudCA9IFwiSGVsbG8gYWN0aXZlIHRhYiFcIjtcbi8vICAgICAgICAgY29udGFpbmVyLmFwcGVuZChhcHApO1xuLy8gICAgICAgfSxcbi8vICAgICB9KTtcbi8vICAgICB1aS5tb3VudCgpO1xuLy8gICAgIHJldHVybiBcIkhlbGxvIHdvcmxkIVwiO1xuLy8gICB9LFxuLy8gfSk7XG4vLyBleHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbi8vICAgcmVnaXN0cmF0aW9uOiBcInJ1bnRpbWVcIixcbi8vICAgY3NzSW5qZWN0aW9uTW9kZTogXCJ1aVwiLFxuXG4vLyAgIG1hdGNoZXM6IFtdLFxuLy8gICBhc3luYyBtYWluKGN0eCkge1xuLy8gICAgIGNvbnN0IHVpID0gYXdhaXQgY3JlYXRlSW50ZWdyYXRlZFVpKGN0eCwge1xuLy8gICAgICAgcG9zaXRpb246IFwiaW5saW5lXCIsXG4vLyAgICAgICBhcHBlbmQ6IFwiYmVmb3JlXCIsXG4vLyAgICAgICBvbk1vdW50KGNvbnRhaW5lcikge1xuLy8gICAgICAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbi8vICAgICAgICAgY29udGFpbmVyLmFwcGVuZCh3cmFwcGVyKTtcblxuLy8gICAgICAgICBjb25zdCByb290ID0gUmVhY3RET00uY3JlYXRlUm9vdCh3cmFwcGVyKTtcbi8vICAgICAgICAgcm9vdC5yZW5kZXIoPEFwcCAvPik7XG4vLyAgICAgICB9LFxuLy8gICAgIH0pO1xuLy8gICAgIHVpLm1vdW50KCk7XG4vLyAgICAgcmV0dXJuIFwiSGVsbG8gd29ybGQhXCI7XG4vLyAgIH0sXG4vLyB9KTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29udGVudFNjcmlwdCh7XG4gIHJlZ2lzdHJhdGlvbjogXCJydW50aW1lXCIsXG4gIG1hdGNoZXM6IFtcIjxhbGxfdXJscz5cIl0sXG5cbiAgbWFpbihjdHgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkNvbnRlbnQgc2NyaXB0IHJ1bm5pbmcuLi5cIik7XG5cbiAgICB0cnkge1xuICAgICAgLy8gRGVmaW5lIHRoZSBVSVxuICAgICAgY29uc3QgdWkgPSBjcmVhdGVJZnJhbWVVaShjdHgsIHtcbiAgICAgICAgcGFnZTogXCIvZXhhbXBsZS1pZnJhbWUuaHRtbFwiLFxuICAgICAgICBwb3NpdGlvbjogXCJpbmxpbmVcIixcbiAgICAgICAgYW5jaG9yOiBcImJvZHlcIixcbiAgICAgICAgb25Nb3VudDogKHdyYXBwZXIsIGlmcmFtZSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaWZyYW1lIG1vdW50ZWRcIik7XG4gICAgICAgICAgaWZyYW1lLndpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgICAgaWZyYW1lLmhlaWdodCA9IFwiMzAwcHhcIjtcbiAgICAgICAgICBpZnJhbWUuc3R5bGUuYm9yZGVyID0gXCIycHggc29saWQgcmVkXCI7IC8vIOS9v+i+ueahhuWPr+ingeS7peS+v+iwg+ivlVxuXG4gICAgICAgICAgd3JhcHBlci5zdHlsZS5tYXJnaW4gPSBcIjEwcHggMFwiO1xuICAgICAgICB9LFxuICAgICAgICBvblJlbW92ZTogKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaWZyYW1lIFVJIOW3suenu+mZpFwiKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTaG93IFVJIHRvIHVzZXJcbiAgICAgIHVpLmF1dG9Nb3VudCgpO1xuICAgICAgY29uc29sZS5sb2coXCJVSSBtb3VudCBjYWxsZWRcIik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBjcmVhdGluZyBpZnJhbWUgVUk6XCIsIGVycm9yKTtcbiAgICB9XG4gIH0sXG59KTtcbiJdLCJuYW1lcyI6WyJkZWZpbml0aW9uIiwiYnJvd3NlciIsIl9icm93c2VyIiwicHJpbnQiLCJsb2dnZXIiLCJfYSIsIl9iIiwicmVzdWx0IiwicmVtb3ZlRGV0ZWN0b3IiLCJtb3VudERldGVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7QUFBTyxXQUFTLG9CQUFvQkEsYUFBWTtBQUM5QyxXQUFPQTtBQUFBLEVBQ1Q7QUNETyxRQUFNQyxjQUFVLHNCQUFXLFlBQVgsbUJBQW9CLFlBQXBCLG1CQUE2QixNQUNoRCxX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QUFBLG9CQUFBO0FBQUEsSUFBbUMsY0FBQTtBQUFBLElBQ25CLFNBQUEsQ0FBQSxZQUFBO0FBQUEsSUFDUSxLQUFBLEtBQUE7QUFHcEIsY0FBQSxJQUFBLDJCQUFBO0FBRUEsVUFBQTtBQUVFLGNBQUEsS0FBQSxlQUFBLEtBQUE7QUFBQSxVQUErQixNQUFBO0FBQUEsVUFDdkIsVUFBQTtBQUFBLFVBQ0ksUUFBQTtBQUFBLFVBQ0YsU0FBQSxDQUFBLFNBQUEsV0FBQTtBQUVOLG9CQUFBLElBQUEsZ0JBQUE7QUFDQSxtQkFBQSxRQUFBO0FBQ0EsbUJBQUEsU0FBQTtBQUNBLG1CQUFBLE1BQUEsU0FBQTtBQUVBLG9CQUFBLE1BQUEsU0FBQTtBQUFBLFVBQXVCO0FBQUEsVUFDekIsVUFBQSxNQUFBO0FBRUUsb0JBQUEsSUFBQSxlQUFBO0FBQUEsVUFBMkI7QUFBQSxRQUM3QixDQUFBO0FBSUYsV0FBQSxVQUFBO0FBQ0EsZ0JBQUEsSUFBQSxpQkFBQTtBQUFBLE1BQTZCLFNBQUEsT0FBQTtBQUU3QixnQkFBQSxNQUFBLDZCQUFBLEtBQUE7QUFBQSxNQUFnRDtBQUFBLElBQ2xEO0FBQUEsRUFFSixDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMCwxLDIsMyw0LDUsNiw3LDgsOV19
