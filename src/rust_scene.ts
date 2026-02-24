import { multiply, createWaveSim } from "./rust-calc-browser.js";
import { Button } from "./lib/interactive/button.js";
import { WaveSimOneDim } from "./lib/simulator/wavesim.js";
import { funspace } from "./lib/base";

// Testing out performance of Rust bound in via WASM.
(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (async function rust_calc() {
      const name = "rust-calc";

      // // Load the WASM module
      // try {
      //   await loadWasm();
      // } catch (error) {
      //   console.error("Failed to load WASM module:", error);
      // }
      // TODO: Implement some more interesting Rust calculations for comparison, such as modifying an
      // array entry-by-entry.

      let a = Math.floor(Math.random() * 2 ** 16);
      let b = Math.floor(Math.random() * 2 ** 16);
      let c: number;
      let numCalls = 1000;
      console.log(`Product of ${a} and ${b}.`);

      // Button which, when clicked, calls a rust function to do calculations
      let rustButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        async function handleClick() {
          for (let i = 0; i < numCalls; i++) {
            const result = await multiply(a, b);
          }
          console.log(`${numCalls} calls completed`);
        },
      );
      rustButton.textContent = "Rust implementation";

      // Button which, when clicked, calls TS to do calculations
      let tsButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        async function handleClick() {
          for (let i = 0; i < numCalls; i++) {
            c = a * b;
          }
          console.log(`${numCalls} calls completed`);
        },
      );
      tsButton.textContent = "TS implementation";
    })();

    (async function rust_wave_eq_one_dim() {
      const name = "rust-wave-eq-one-dim";

      const width = 50000;
      const dt = 0.01;
      const num_steps = 2000;

      // Typescript simulator
      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      class WaveSimulator extends WaveSimOneDim {
        reset() {
          super.reset();
          this.set_uValues(funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, width));
          this.set_vValues(funspace((x) => 0, 0, 1, width));
        }
      }
      let simTS = new WaveSimulator(width, dt);
      simTS.reset();

      // Rust simulator - use the wrapper
      let simRust = await createWaveSim(width, dt);

      // Button which, when clicked, calls a rust function to do calculations
      let rustButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        async function handleClick() {
          for (let i = 0; i < num_steps; i++) {
            simRust.step();
            console.log(`Step ${i + 1} completed`);
          }
          console.log(`Done ${num_steps} iterations at size ${width}`);
          simRust.reset();
        },
      );
      rustButton.textContent = "Rust implementation";

      // Button which, when clicked, calls TS to do calculations
      let tsButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        async function handleClick() {
          for (let i = 0; i < num_steps; i++) {
            simTS.step();
            console.log(`Step ${i + 1} completed`);
          }
          console.log(`Done ${num_steps} iterations at size ${width}`);
          simTS.reset();
        },
      );
      tsButton.textContent = "TS implementation";
    })();
  });
})();
