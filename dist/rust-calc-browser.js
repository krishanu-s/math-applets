var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// rust-calc/pkg/rust_calc.js
var rust_calc_exports = {};
__export(rust_calc_exports, {
  WaveSimOneDimRust: () => WaveSimOneDimRust,
  default: () => __wbg_init,
  divide: () => divide,
  initSync: () => initSync,
  multiply: () => multiply,
  subtract: () => subtract,
  sum: () => sum
});
var WaveSimOneDimRust = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WaveSimOneDimRustFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wavesimonedimrust_free(ptr, 0);
  }
  /**
   * @returns {Float64Array}
   */
  get_u_values() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.wavesimonedimrust_get_u_values(ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
  }
  /**
   * @returns {Float64Array}
   */
  get_v_values() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.wavesimonedimrust_get_v_values(ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
  }
  /**
   * @returns {Float64Array}
   */
  get_vals() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.wavesimonedimrust_get_vals(ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
  }
  /**
   * @param {number} width
   * @param {number} dt
   */
  constructor(width, dt) {
    const ret = wasm.wavesimonedimrust_new(width, dt);
    this.__wbg_ptr = ret >>> 0;
    WaveSimOneDimRustFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  reset() {
    wasm.wavesimonedimrust_reset(this.__wbg_ptr);
  }
  /**
   * @param {Float64Array} vals
   */
  reset_to(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedimrust_reset_to(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @param {string} name
   * @param {number} val
   */
  set_attr(name, val) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedimrust_set_attr(this.__wbg_ptr, ptr0, len0, val);
  }
  /**
   * @param {Float64Array} vals
   */
  set_u_vals(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedimrust_set_u_vals(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @param {Float64Array} vals
   */
  set_v_vals(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedimrust_set_v_vals(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @param {number} index
   * @param {number} val
   */
  set_val(index, val) {
    wasm.wavesimonedimrust_set_val(this.__wbg_ptr, index, val);
  }
  /**
   * @param {Float64Array} vals
   */
  set_vals(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedimrust_set_vals(this.__wbg_ptr, ptr0, len0);
  }
  step() {
    wasm.wavesimonedimrust_step(this.__wbg_ptr);
  }
};
if (Symbol.dispose) WaveSimOneDimRust.prototype[Symbol.dispose] = WaveSimOneDimRust.prototype.free;
function divide(left, right) {
  const ret = wasm.divide(left, right);
  return ret;
}
function multiply(left, right) {
  const ret = wasm.multiply(left, right);
  return ret;
}
function subtract(left, right) {
  const ret = wasm.subtract(left, right);
  return ret;
}
function sum(left, right) {
  const ret = wasm.sum(left, right);
  return ret;
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg___wbindgen_throw_df03e93053e0f4bc: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    }
  };
  return {
    __proto__: null,
    "./rust_calc_bg.js": import0
  };
}
var WaveSimOneDimRustFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_wavesimonedimrust_free(ptr >>> 0, 1));
function getArrayF64FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
var cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
  if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
    cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function passArrayF64ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 8, 8) >>> 0;
  getFloat64ArrayMemory0().set(arg, ptr / 8);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasm;
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  wasmModule = module;
  cachedFloat64ArrayMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("rust_calc_bg.wasm", "");
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}

// src/rust-calc-browser.ts
var isInitialized = false;
async function initWasm() {
  if (!isInitialized) {
    if (typeof __wbg_init === "function") {
      await __wbg_init("./rust_calc_bg.wasm");
    }
    isInitialized = true;
  }
}
function isWasmInitialized() {
  return isInitialized;
}
async function multiply2(left, right) {
  await initWasm();
  return multiply(left, right);
}
async function divide2(left, right) {
  await initWasm();
  return divide(left, right);
}
async function subtract2(left, right) {
  await initWasm();
  return subtract(left, right);
}
async function sum2(left, right) {
  await initWasm();
  return sum(left, right);
}
async function createWaveSim(width, dt) {
  await initWasm();
  if (!WaveSimOneDimRust) {
    throw new Error("WaveSimOneDimRust not found in rust-calc exports");
  }
  const WaveSimOneDimRust2 = WaveSimOneDimRust;
  let instance;
  try {
    instance = new WaveSimOneDimRust2(width, dt);
    console.log("WaveSimOneDimRust instance created:", instance);
  } catch (error) {
    console.error(
      "Failed to create or initialize WaveSimOneDimRust instance:",
      error
    );
    throw error;
  }
  return instance;
}
async function getWaveSimClass() {
  await initWasm();
  if (WaveSimOneDimRust) {
    return WaveSimOneDimRust;
  }
  throw new Error("WaveSimOneDimRust not found in rust-calc exports");
}
console.log("rust-calc exports:", Object.keys(rust_calc_exports));
export {
  createWaveSim,
  divide2 as divide,
  getWaveSimClass,
  initWasm,
  isWasmInitialized,
  multiply2 as multiply,
  rust_calc_exports as rustCalc,
  subtract2 as subtract,
  sum2 as sum
};
