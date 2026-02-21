var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// polyfill.js
if (typeof global === "undefined") {
  window.global = window;
}
if (typeof __dirname === "undefined") {
  global.__dirname = "";
}
if (typeof __require === "undefined") {
  let wasmCache = null;
  global.require = function(name) {
    if (name === "fs") {
      return {
        readFileSync: function(path) {
          console.log("readFileSync called with:", path);
          return new Uint8Array();
        }
      };
    }
    throw new Error(`Cannot find module: ${name}`);
  };
}

// src/rust-calc-browser.ts
var wasmInstance;
var wasmReady = false;
wasmInstance = null;
async function loadWasm() {
  if (wasmInstance) return wasmInstance;
  try {
    const response = await fetch("rust_calc_bg.wasm");
    const wasmBytes = await response.arrayBuffer();
    const imports = {
      "./rust_calc_bg.js": {
        __wbindgen_init_externref_table: function() {
          console.log("__wbindgen_init_externref_table called");
        }
      }
    };
    const wasmModule = new WebAssembly.Module(wasmBytes);
    wasmInstance = new WebAssembly.Instance(wasmModule, imports).exports;
    if (wasmInstance.__wbindgen_start) {
      wasmInstance.__wbindgen_start();
    }
    wasmReady = true;
    return wasmInstance;
  } catch (error) {
    console.error("Failed to load WASM:", error);
    throw error;
  }
}
function multiply(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.multiply(left, right);
}
function divide(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.divide(left, right);
}
function subtract(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.subtract(left, right);
}
function sum(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.sum(left, right);
}
export {
  divide,
  loadWasm,
  multiply,
  subtract,
  sum
};
