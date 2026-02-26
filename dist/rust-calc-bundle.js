/* @ts-self-types="./rust_calc.d.ts" */

export class HeatSimSphere {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HeatSimSphereFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_heatsimsphere_free(ptr, 0);
    }
    /**
     * @param {number} theta
     * @param {number} amplitude
     */
    add_latitude_source(theta, amplitude) {
        wasm.heatsimsphere_add_latitude_source(this.__wbg_ptr, theta, amplitude);
    }
    /**
     * @param {number} phi
     * @param {number} amplitude
     */
    add_longitude_source(phi, amplitude) {
        wasm.heatsimsphere_add_longitude_source(this.__wbg_ptr, phi, amplitude);
    }
    /**
     * @param {number} theta
     * @param {number} phi
     * @param {number} amplitude
     */
    add_point_source(theta, phi, amplitude) {
        wasm.heatsimsphere_add_point_source(this.__wbg_ptr, theta, phi, amplitude);
    }
    /**
     * @returns {Float64Array}
     */
    get_drawable() {
        const ret = wasm.heatsimsphere_get_drawable(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_dt() {
        const ret = wasm.heatsimsphere_get_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_time() {
        const ret = wasm.heatsimsphere_get_time(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_uValues() {
        const ret = wasm.heatsimsphere_get_uValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} index
     * @param {number} amplitude
     */
    modify_latitude_source_amplitude(index, amplitude) {
        wasm.heatsimsphere_modify_latitude_source_amplitude(this.__wbg_ptr, index, amplitude);
    }
    /**
     * @param {number} index
     * @param {number} theta
     */
    modify_latitude_source_theta(index, theta) {
        wasm.heatsimsphere_modify_latitude_source_theta(this.__wbg_ptr, index, theta);
    }
    /**
     * @param {number} index
     * @param {number} amplitude
     */
    modify_longitude_source_amplitude(index, amplitude) {
        wasm.heatsimsphere_modify_longitude_source_amplitude(this.__wbg_ptr, index, amplitude);
    }
    /**
     * @param {number} index
     * @param {number} phi
     */
    modify_longitude_source_phi(index, phi) {
        wasm.heatsimsphere_modify_longitude_source_phi(this.__wbg_ptr, index, phi);
    }
    /**
     * @param {number} index
     * @param {number} amplitude
     */
    modify_point_source_amplitude(index, amplitude) {
        wasm.heatsimsphere_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
    }
    /**
     * @param {number} index
     * @param {number} phi
     */
    modify_point_source_phi(index, phi) {
        wasm.heatsimsphere_modify_point_source_phi(this.__wbg_ptr, index, phi);
    }
    /**
     * @param {number} index
     * @param {number} theta
     */
    modify_point_source_theta(index, theta) {
        wasm.heatsimsphere_modify_point_source_theta(this.__wbg_ptr, index, theta);
    }
    /**
     * @param {number} num_theta
     * @param {number} num_phi
     * @param {number} dt
     */
    constructor(num_theta, num_phi, dt) {
        const ret = wasm.heatsimsphere_new(num_theta, num_phi, dt);
        this.__wbg_ptr = ret >>> 0;
        HeatSimSphereFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    reset() {
        wasm.heatsimsphere_reset(this.__wbg_ptr);
    }
    /**
     * @param {string} name
     * @param {number} val
     */
    set_attr(name, val) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.heatsimsphere_set_attr(this.__wbg_ptr, ptr0, len0, val);
    }
    step() {
        wasm.heatsimsphere_step(this.__wbg_ptr);
    }
}
if (Symbol.dispose) HeatSimSphere.prototype[Symbol.dispose] = HeatSimSphere.prototype.free;

export class HeatSimTwoDim {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HeatSimTwoDimFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_heatsimtwodim_free(ptr, 0);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} amplitude
     */
    add_point_source(x, y, amplitude) {
        wasm.heatsimtwodim_add_point_source(this.__wbg_ptr, x, y, amplitude);
    }
    /**
     * @returns {number}
     */
    get_dt() {
        const ret = wasm.heatsimtwodim_get_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_time() {
        const ret = wasm.heatsimtwodim_get_time(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_uValues() {
        const ret = wasm.heatsimtwodim_get_uValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} index
     * @param {number} amplitude
     */
    modify_point_source_amplitude(index, amplitude) {
        wasm.heatsimtwodim_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
    }
    /**
     * @param {number} index
     * @param {number} x
     */
    modify_point_source_x(index, x) {
        wasm.heatsimtwodim_modify_point_source_x(this.__wbg_ptr, index, x);
    }
    /**
     * @param {number} index
     * @param {number} y
     */
    modify_point_source_y(index, y) {
        wasm.heatsimtwodim_modify_point_source_y(this.__wbg_ptr, index, y);
    }
    /**
     * @param {number} width
     * @param {number} height
     * @param {number} dt
     */
    constructor(width, height, dt) {
        const ret = wasm.heatsimtwodim_new(width, height, dt);
        this.__wbg_ptr = ret >>> 0;
        HeatSimTwoDimFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    reset() {
        wasm.heatsimtwodim_reset(this.__wbg_ptr);
    }
    /**
     * @param {string} name
     * @param {number} val
     */
    set_attr(name, val) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.heatsimtwodim_set_attr(this.__wbg_ptr, ptr0, len0, val);
    }
    step() {
        wasm.heatsimtwodim_step(this.__wbg_ptr);
    }
}
if (Symbol.dispose) HeatSimTwoDim.prototype[Symbol.dispose] = HeatSimTwoDim.prototype.free;

export class SmoothOpenPathBezierHandleCalculator {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SmoothOpenPathBezierHandleCalculatorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_smoothopenpathbezierhandlecalculator_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get n() {
        const ret = wasm.__wbg_get_smoothopenpathbezierhandlecalculator_n(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set n(arg0) {
        wasm.__wbg_set_smoothopenpathbezierhandlecalculator_n(this.__wbg_ptr, arg0);
    }
    /**
     * @param {Float64Array} anchors
     * @returns {Float64Array}
     */
    get_bezier_handles(anchors) {
        const ret = wasm.smoothopenpathbezierhandlecalculator_get_bezier_handles(this.__wbg_ptr, anchors);
        return ret;
    }
    /**
     * @param {number} n
     */
    constructor(n) {
        const ret = wasm.smoothopenpathbezierhandlecalculator_new(n);
        this.__wbg_ptr = ret >>> 0;
        SmoothOpenPathBezierHandleCalculatorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) SmoothOpenPathBezierHandleCalculator.prototype[Symbol.dispose] = SmoothOpenPathBezierHandleCalculator.prototype.free;

export class WaveSimOneDim {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WaveSimOneDimFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wavesimonedim_free(ptr, 0);
    }
    /**
     * @param {number} x
     * @param {number} frequency
     * @param {number} amplitude
     * @param {number} phase
     */
    add_point_source(x, frequency, amplitude, phase) {
        wasm.wavesimonedim_add_point_source(this.__wbg_ptr, x, frequency, amplitude, phase);
    }
    /**
     * @returns {number}
     */
    get_dt() {
        const ret = wasm.wavesimonedim_get_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_time() {
        const ret = wasm.wavesimonedim_get_time(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_uValues() {
        const ret = wasm.wavesimonedim_get_uValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_vValues() {
        const ret = wasm.wavesimonedim_get_vValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} index
     * @param {number} amplitude
     */
    modify_point_source_amplitude(index, amplitude) {
        wasm.wavesimonedim_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
    }
    /**
     * @param {number} index
     * @param {number} frequency
     */
    modify_point_source_frequency(index, frequency) {
        wasm.wavesimonedim_modify_point_source_frequency(this.__wbg_ptr, index, frequency);
    }
    /**
     * @param {number} index
     * @param {number} phase
     */
    modify_point_source_phase(index, phase) {
        wasm.wavesimonedim_modify_point_source_phase(this.__wbg_ptr, index, phase);
    }
    /**
     * @param {number} index
     * @param {number} x
     */
    modify_point_source_x(index, x) {
        wasm.wavesimonedim_modify_point_source_x(this.__wbg_ptr, index, x);
    }
    /**
     * @param {number} width
     * @param {number} dt
     */
    constructor(width, dt) {
        const ret = wasm.wavesimonedim_new(width, dt);
        this.__wbg_ptr = ret >>> 0;
        WaveSimOneDimFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    reset() {
        wasm.wavesimonedim_reset(this.__wbg_ptr);
    }
    /**
     * @param {Float64Array} vals
     */
    reset_to(vals) {
        const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wavesimonedim_reset_to(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} name
     * @param {number} val
     */
    set_attr(name, val) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wavesimonedim_set_attr(this.__wbg_ptr, ptr0, len0, val);
    }
    step() {
        wasm.wavesimonedim_step(this.__wbg_ptr);
    }
}
if (Symbol.dispose) WaveSimOneDim.prototype[Symbol.dispose] = WaveSimOneDim.prototype.free;

export class WaveSimTwoDim {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WaveSimTwoDimFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wavesimtwodim_free(ptr, 0);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} frequency
     * @param {number} amplitude
     * @param {number} phase
     */
    add_point_source(x, y, frequency, amplitude, phase) {
        wasm.wavesimtwodim_add_point_source(this.__wbg_ptr, x, y, frequency, amplitude, phase);
    }
    /**
     * @returns {number}
     */
    get_dt() {
        const ret = wasm.wavesimtwodim_get_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_time() {
        const ret = wasm.wavesimtwodim_get_time(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_uValues() {
        const ret = wasm.wavesimtwodim_get_uValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_vValues() {
        const ret = wasm.wavesimtwodim_get_vValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} index
     * @param {number} amplitude
     */
    modify_point_source_amplitude(index, amplitude) {
        wasm.wavesimtwodim_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
    }
    /**
     * @param {number} index
     * @param {number} frequency
     */
    modify_point_source_frequency(index, frequency) {
        wasm.wavesimtwodim_modify_point_source_frequency(this.__wbg_ptr, index, frequency);
    }
    /**
     * @param {number} index
     * @param {number} phase
     */
    modify_point_source_phase(index, phase) {
        wasm.wavesimtwodim_modify_point_source_phase(this.__wbg_ptr, index, phase);
    }
    /**
     * @param {number} index
     * @param {number} x
     */
    modify_point_source_x(index, x) {
        wasm.wavesimtwodim_modify_point_source_x(this.__wbg_ptr, index, x);
    }
    /**
     * @param {number} index
     * @param {number} y
     */
    modify_point_source_y(index, y) {
        wasm.wavesimtwodim_modify_point_source_y(this.__wbg_ptr, index, y);
    }
    /**
     * @param {number} width
     * @param {number} height
     * @param {number} dt
     */
    constructor(width, height, dt) {
        const ret = wasm.wavesimtwodim_new(width, height, dt);
        this.__wbg_ptr = ret >>> 0;
        WaveSimTwoDimFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    remove_pml_layers() {
        wasm.wavesimtwodim_remove_pml_layers(this.__wbg_ptr);
    }
    reset() {
        wasm.wavesimtwodim_reset(this.__wbg_ptr);
    }
    /**
     * @param {string} name
     * @param {number} val
     */
    set_attr(name, val) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wavesimtwodim_set_attr(this.__wbg_ptr, ptr0, len0, val);
    }
    /**
     * @param {boolean} x_direction
     * @param {boolean} positive
     * @param {number} width
     * @param {number} strength
     */
    set_pml_layer(x_direction, positive, width, strength) {
        wasm.wavesimtwodim_set_pml_layer(this.__wbg_ptr, x_direction, positive, width, strength);
    }
    step() {
        wasm.wavesimtwodim_step(this.__wbg_ptr);
    }
}
if (Symbol.dispose) WaveSimTwoDim.prototype[Symbol.dispose] = WaveSimTwoDim.prototype.free;

export class WaveSimTwoDimElliptical {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WaveSimTwoDimEllipticalFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wavesimtwodimelliptical_free(ptr, 0);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} frequency
     * @param {number} amplitude
     * @param {number} phase
     */
    add_point_source(x, y, frequency, amplitude, phase) {
        wasm.wavesimtwodimelliptical_add_point_source(this.__wbg_ptr, x, y, frequency, amplitude, phase);
    }
    /**
     * @returns {number}
     */
    get_dt() {
        const ret = wasm.wavesimtwodimelliptical_get_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} index
     * @returns {number}
     */
    get_focus_x(index) {
        const ret = wasm.wavesimtwodimelliptical_get_focus_x(this.__wbg_ptr, index);
        return ret >>> 0;
    }
    /**
     * @param {number} index
     * @returns {number}
     */
    get_focus_y(index) {
        const ret = wasm.wavesimtwodimelliptical_get_focus_y(this.__wbg_ptr, index);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get_semimajor_axis() {
        const ret = wasm.wavesimtwodimelliptical_get_semimajor_axis(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get_semiminor_axis() {
        const ret = wasm.wavesimtwodimelliptical_get_semiminor_axis(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get_time() {
        const ret = wasm.wavesimtwodimelliptical_get_time(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_uValues() {
        const ret = wasm.wavesimtwodimelliptical_get_uValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_vValues() {
        const ret = wasm.wavesimtwodimelliptical_get_vValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} index
     * @param {number} amplitude
     */
    modify_point_source_amplitude(index, amplitude) {
        wasm.wavesimtwodimelliptical_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
    }
    /**
     * @param {number} index
     * @param {number} frequency
     */
    modify_point_source_frequency(index, frequency) {
        wasm.wavesimtwodimelliptical_modify_point_source_frequency(this.__wbg_ptr, index, frequency);
    }
    /**
     * @param {number} index
     * @param {number} phase
     */
    modify_point_source_phase(index, phase) {
        wasm.wavesimtwodimelliptical_modify_point_source_phase(this.__wbg_ptr, index, phase);
    }
    /**
     * @param {number} index
     * @param {number} x
     */
    modify_point_source_x(index, x) {
        wasm.wavesimtwodimelliptical_modify_point_source_x(this.__wbg_ptr, index, x);
    }
    /**
     * @param {number} index
     * @param {number} y
     */
    modify_point_source_y(index, y) {
        wasm.wavesimtwodimelliptical_modify_point_source_y(this.__wbg_ptr, index, y);
    }
    /**
     * @param {number} width
     * @param {number} height
     * @param {number} dt
     */
    constructor(width, height, dt) {
        const ret = wasm.wavesimtwodimelliptical_new(width, height, dt);
        this.__wbg_ptr = ret >>> 0;
        WaveSimTwoDimEllipticalFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    recalculate_masks() {
        wasm.wavesimtwodimelliptical_recalculate_masks(this.__wbg_ptr);
    }
    remove_pml_layers() {
        wasm.wavesimtwodimelliptical_remove_pml_layers(this.__wbg_ptr);
    }
    reset() {
        wasm.wavesimtwodimelliptical_reset(this.__wbg_ptr);
    }
    /**
     * @param {string} name
     * @param {number} val
     */
    set_attr(name, val) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wavesimtwodimelliptical_set_attr(this.__wbg_ptr, ptr0, len0, val);
    }
    /**
     * @param {boolean} x_direction
     * @param {boolean} positive
     * @param {number} width
     * @param {number} strength
     */
    set_pml_layer(x_direction, positive, width, strength) {
        wasm.wavesimtwodimelliptical_set_pml_layer(this.__wbg_ptr, x_direction, positive, width, strength);
    }
    step() {
        wasm.wavesimtwodimelliptical_step(this.__wbg_ptr);
    }
}
if (Symbol.dispose) WaveSimTwoDimElliptical.prototype[Symbol.dispose] = WaveSimTwoDimElliptical.prototype.free;

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_89ca9e2c67795ec1: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_length_57aa70d8471ff229: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_new_from_slice_42c6e17e5e805f45: function(arg0, arg1) {
            const ret = new Float64Array(getArrayF64FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_prototypesetcall_e26af6f1b2474b2b: function(arg0, arg1, arg2) {
            Float64Array.prototype.set.call(getArrayF64FromWasm0(arg0, arg1), arg2);
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./rust_calc_bg.js": import0,
    };
}

const HeatSimSphereFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_heatsimsphere_free(ptr >>> 0, 1));
const HeatSimTwoDimFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_heatsimtwodim_free(ptr >>> 0, 1));
const SmoothOpenPathBezierHandleCalculatorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_smoothopenpathbezierhandlecalculator_free(ptr >>> 0, 1));
const WaveSimOneDimFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wavesimonedim_free(ptr >>> 0, 1));
const WaveSimTwoDimFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wavesimtwodim_free(ptr >>> 0, 1));
const WaveSimTwoDimEllipticalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wavesimtwodimelliptical_free(ptr >>> 0, 1));

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

let cachedFloat64ArrayMemory0 = null;
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

let cachedUint8ArrayMemory0 = null;
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
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
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

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedFloat64ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
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
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
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
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('rust_calc_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
