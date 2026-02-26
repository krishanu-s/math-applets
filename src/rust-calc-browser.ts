// rust-calc-browser.ts
import init, * as rustCalc from "../rust-calc/pkg/rust_calc";

let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the WASM module. Must be called before using any WASM functions.
 */
export async function initWasm(): Promise<void> {
  if (!isInitialized) {
    if (typeof init === "function") {
      // Pass a relative path to the WASM file
      // Make sure rust_calc_bg.wasm is in the same directory as your HTML file
      await init("./rust_calc_bg.wasm");
    }
    isInitialized = true;
  }
}

/**
 * Check if WASM is initialized
 */
export function isWasmInitialized(): boolean {
  return isInitialized;
}

// Robust createWaveSim function
// TODO Move this to lib/simulator/wavesim.ts
export async function createWaveSimOneDim(
  width: number,
  dt: number,
): Promise<any> {
  await initWasm();

  if (!(rustCalc as any).WaveSimOneDim) {
    throw new Error("WaveSimOneDim not found in rust-calc exports");
  }

  const WaveSimOneDim = (rustCalc as any).WaveSimOneDim;

  let instance;

  try {
    // Create instance
    instance = new WaveSimOneDim(width, dt);
    console.log("WaveSimOneDim instance created:", instance);

    // // Check what methods are available
    // console.log(
    //   "Instance methods:",
    //   Object.getOwnPropertyNames(Object.getPrototypeOf(instance)),
    // );

    // // Try calling reset carefully
    // if (typeof instance.reset === "function") {
    //   console.log("reset() method found, calling...");

    //   // Try with error handling
    //   try {
    //     instance.reset();
    //     console.log("reset() succeeded");
    //   } catch (resetError) {
    //     console.error("reset() failed:", resetError);

    //     // Try alternative: maybe reset needs parameters
    //     console.log("Trying reset with different approaches...");

    //     // Approach 1: Try reset with parameters
    //     if (instance.reset.length > 0) {
    //       console.log(`reset expects ${instance.reset.length} parameters`);
    //       // Try with common parameters
    //       try {
    //         instance.reset(width, dt);
    //       } catch (e) {
    //         console.error("reset(width, dt) failed:", e);
    //       }
    //     }

    //     // Approach 2: Try a different method name
    //     if (typeof instance.init === "function") {
    //       console.log("Trying init() instead...");
    //       try {
    //         instance.init();
    //       } catch (e) {
    //         console.error("init() failed:", e);
    //       }
    //     }

    //     // Approach 3: Maybe reset is async
    //     if (instance.reset.constructor.name === "AsyncFunction") {
    //       console.log("reset appears to be async, trying await...");
    //       try {
    //         await instance.reset();
    //       } catch (e) {
    //         console.error("await reset() failed:", e);
    //       }
    //     }

    //     // Don't throw yet - the instance might still be usable
    //     console.warn("reset() failed but instance was created");
    //   }
    // } else {
    //   console.warn("reset() method not found on instance");
    // }
  } catch (error) {
    console.error(
      "Failed to create or initialize WaveSimOneDimRust instance:",
      error,
    );
    throw error;
  }

  return instance;
}

// TODO Move this to lib/simulator/wavesim.ts
export async function createWaveSimTwoDim(
  width: number,
  height: number,
  dt: number,
): Promise<any> {
  await initWasm();

  if (!(rustCalc as any).WaveSimTwoDim) {
    throw new Error("WaveSimTwoDim not found in rust-calc exports");
  }

  const WaveSimTwoDim = (rustCalc as any).WaveSimTwoDim;

  let instance;

  try {
    // Create instance
    instance = new WaveSimTwoDim(width, height, dt);
    console.log("WaveSimTwoDim instance created:", instance);
  } catch (error) {
    console.error(
      "Failed to create or initialize WaveSimOneDimRust instance:",
      error,
    );
    throw error;
  }

  return instance;
}

// TODO Move this to lib/simulator/wavesim.ts
export async function createWaveSimTwoDimElliptical(
  width: number,
  height: number,
  dt: number,
): Promise<any> {
  await initWasm();

  if (!(rustCalc as any).WaveSimTwoDimElliptical) {
    throw new Error("WaveSimTwoDimElliptical not found in rust-calc exports");
  }

  const WaveSimTwoDimElliptical = (rustCalc as any).WaveSimTwoDimElliptical;

  let instance;

  try {
    // Create instance
    instance = new WaveSimTwoDimElliptical(width, height, dt);
    console.log("WaveSimTwoDimElliptical instance created:", instance);
  } catch (error) {
    console.error(
      "Failed to create or initialize WaveSimTwoDimElliptical instance:",
      error,
    );
    throw error;
  }

  return instance;
}

// TODO Move this to lib/base/bezier.ts
export async function createSmoothOpenPathBezier(n: number): Promise<any> {
  await initWasm();

  if (!(rustCalc as any).SmoothOpenPathBezierHandleCalculator) {
    throw new Error(
      "SmoothOpenPathBezierHandleCalculator not found in rust-calc exports",
    );
  }

  const SmoothOpenPathBezierHandleCalculator = (rustCalc as any)
    .SmoothOpenPathBezierHandleCalculator;

  let instance;

  try {
    // Create instance
    instance = new SmoothOpenPathBezierHandleCalculator(n);
    console.log(
      "SmoothOpenPathBezierHandleCalculator instance created:",
      instance,
    );
  } catch (error) {
    console.error(
      "Failed to create or initialize SmoothOpenPathBezierHandleCalculator instance:",
      error,
    );
    throw error;
  }

  return instance;
}

// Also export the class directly for advanced use
export async function getWaveSimOneDimClass(): Promise<any> {
  await initWasm();

  if ((rustCalc as any).WaveSimOneDim) {
    return (rustCalc as any).WaveSimOneDim;
  }

  throw new Error("WaveSimOneDimRust not found in rust-calc exports");
}
export async function getWaveSimTwoDimClass(): Promise<any> {
  await initWasm();

  if ((rustCalc as any).WaveSimTwoDim) {
    return (rustCalc as any).WaveSimTwoDim;
  }

  throw new Error("WaveSimTwoDim not found in rust-calc exports");
}

// Export the raw module for advanced use
export { rustCalc };

// For debugging
console.log("rust-calc exports:", Object.keys(rustCalc));
