import { loadWasm, multiply } from "./rust-calc-browser.js";
import { Button } from "./lib/interactive/button.js";

// Testing out performance of Rust bound in via WASM.
(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (async function rust_calc() {
      const name = "rust-calc";

      // Load the WASM module
      try {
        await loadWasm();
      } catch (error) {
        console.error("Failed to load WASM module:", error);
      }
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
            c = multiply(a, b);
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
  });
})();
