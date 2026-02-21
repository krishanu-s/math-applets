let wasmInstance;
let wasmReady = false;
wasmInstance = null;

// Load WASM asynchronously
async function loadWasm() {
  if (wasmInstance) return wasmInstance;

  try {
    // Fetch the WASM file
    const response = await fetch("rust_calc_bg.wasm");
    const wasmBytes = await response.arrayBuffer();

    // Create imports
    const imports = {
      "./rust_calc_bg.js": {
        __wbindgen_init_externref_table: function () {
          // This would need a proper implementation
          console.log("__wbindgen_init_externref_table called");
        },
      },
    };

    // Instantiate WASM
    const wasmModule = new WebAssembly.Module(wasmBytes);
    wasmInstance = new WebAssembly.Instance(wasmModule, imports).exports;

    // Initialize
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

// Export functions that load WASM on first call
export function multiply(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.multiply(left, right);
}

export function divide(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.divide(left, right);
}

export function subtract(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.subtract(left, right);
}

export function sum(left, right) {
  if (!wasmReady) {
    throw new Error("WASM not loaded. Call loadWasm() first.");
  }
  return wasmInstance.sum(left, right);
}

export { loadWasm };
