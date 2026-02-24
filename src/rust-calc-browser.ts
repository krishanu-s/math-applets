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

// Create wrapper functions that ensure initialization
export async function multiply(left: number, right: number): Promise<number> {
  await initWasm();
  return rustCalc.multiply(left, right);
}

export async function divide(left: number, right: number): Promise<number> {
  await initWasm();
  return rustCalc.divide(left, right);
}

export async function subtract(left: number, right: number): Promise<number> {
  await initWasm();
  return rustCalc.subtract(left, right);
}

export async function sum(left: number, right: number): Promise<number> {
  await initWasm();
  return rustCalc.sum(left, right);
}

// Robust createWaveSim function
export async function createWaveSim(width: number, dt: number): Promise<any> {
  await initWasm();

  if (!(rustCalc as any).WaveSimOneDimRust) {
    throw new Error("WaveSimOneDimRust not found in rust-calc exports");
  }

  const WaveSimOneDimRust = (rustCalc as any).WaveSimOneDimRust;

  let instance;

  try {
    // Create instance
    instance = new WaveSimOneDimRust(width, dt);
    console.log("WaveSimOneDimRust instance created:", instance);

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

// Also export the class directly for advanced use
export async function getWaveSimClass(): Promise<any> {
  await initWasm();

  if ((rustCalc as any).WaveSimOneDimRust) {
    return (rustCalc as any).WaveSimOneDimRust;
  }

  throw new Error("WaveSimOneDimRust not found in rust-calc exports");
}

// Export the raw module for advanced use
export { rustCalc };

// For debugging
console.log("rust-calc exports:", Object.keys(rustCalc));
