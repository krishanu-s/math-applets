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

// src/lib/interactive/button.ts
function Button(container, callback) {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "interactiveButton";
  button.style.padding = "15px";
  container.appendChild(button);
  button.addEventListener("click", (event) => {
    callback();
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 100);
  });
  return button;
}

// src/rust_scene.ts
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (async function rust_calc() {
      const name = "rust-calc";
      try {
        await loadWasm();
      } catch (error) {
        console.error("Failed to load WASM module:", error);
      }
      let a = Math.floor(Math.random() * 2 ** 16);
      let b = Math.floor(Math.random() * 2 ** 16);
      let c;
      let numCalls = 1e3;
      console.log(`Product of ${a} and ${b}.`);
      let rustButton = Button(
        document.getElementById(name + "-button-1"),
        async function handleClick() {
          for (let i = 0; i < numCalls; i++) {
            c = multiply(a, b);
          }
          console.log(`${numCalls} calls completed`);
        }
      );
      rustButton.textContent = "Rust implementation";
      let tsButton = Button(
        document.getElementById(name + "-button-2"),
        async function handleClick() {
          for (let i = 0; i < numCalls; i++) {
            c = a * b;
          }
          console.log(`${numCalls} calls completed`);
        }
      );
      tsButton.textContent = "TS implementation";
    })();
  });
})();
