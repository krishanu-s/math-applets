import * as rustCalc from "../rust-calc/pkg/rust_calc";
/**
 * Initialize the WASM module. Must be called before using any WASM functions.
 */
export declare function initWasm(): Promise<void>;
/**
 * Check if WASM is initialized
 */
export declare function isWasmInitialized(): boolean;
export declare function createWaveSimOneDim(width: number, dt: number): Promise<any>;
export declare function createWaveSimTwoDim(width: number, height: number, dt: number): Promise<any>;
export declare function createHeatSimTwoDim(width: number, height: number, dt: number): Promise<any>;
export declare function createHeatSimSphere(num_theta: number, num_phi: number, dt: number): Promise<any>;
export declare function createWaveSimTwoDimElliptical(width: number, height: number, dt: number): Promise<any>;
export declare function createSmoothOpenPathBezier(n: number): Promise<any>;
export declare function getWaveSimOneDimClass(): Promise<any>;
export declare function getWaveSimTwoDimClass(): Promise<any>;
export { rustCalc };
//# sourceMappingURL=rust-calc-browser.d.ts.map