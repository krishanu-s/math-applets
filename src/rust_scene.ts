import { multiply, createWaveSim } from "./rust-calc-browser";
import { Button } from "./lib/interactive/button";
import {
  WaveSimOneDim,
  WaveSimTwoDim,
  PointSource,
  WaveSimTwoDimHeatMapScene,
} from "./lib/simulator/wavesim";
import { funspace, prepare_canvas, delay, HeatMap } from "./lib/base";

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
      simTS.set_wave_propagation_speed(10.0);
      simTS.reset();

      // Rust simulator - use the wrapper
      let simRust = await createWaveSim(width, dt);
      simRust.set_attr("wave_propagation_speed", 10.0);
      simRust.reset();

      // Button which, when clicked, calls a rust function to do calculations

      // TODO Build direct access to the values field of the simRust object via its pointer,
      // so that we can access the values directly without having to call a function
      let rustButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        async function handleClick() {
          for (let i = 0; i < num_steps; i++) {
            const vals = simRust.output_u_vals();
            simRust.step();
            if (i % 100 == 0) {
              console.log(vals);
              console.log(`Step ${i} completed`);
            }
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
            const vals = simTS.get_uValues();
            simTS.step();
            if (i % 100 == 0) {
              console.log(vals);
              console.log(`Step ${i} completed`);
            }
          }
          console.log(`Done ${num_steps} iterations at size ${width}`);
          simTS.reset();
        },
      );
      tsButton.textContent = "TS implementation";
    })();

    // Animate a 2D wave equation heatmap scene, non-interactively.
    (async function rust_wave_eq_two_dim(width: number, height: number) {
      const name = "rust-wave-eq-two-dim";
      const dt = 0.01;
      const num_steps = 200;

      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

      // Prepare canvases
      let canvasTS = prepare_canvas(width, height, name + "-ts");
      let canvasRust = prepare_canvas(width, height, name + "-rust");

      // Create ImageData objects
      const ctxTS = canvasTS.getContext("2d");
      if (!ctxTS) {
        throw new Error("Failed to get 2D context");
      }
      const imageDataTS = ctxTS.createImageData(width, height);

      const ctxRust = canvasRust.getContext("2d");
      if (!ctxRust) {
        throw new Error("Failed to get 2D context");
      }
      const imageDataRust = ctxRust.createImageData(width, height);

      // Make the TS simulator and scene
      let simTS = new WaveSimTwoDim(width, height, dt);
      simTS.set_attr("wave_propagation_speed", 0.1 * width);
      simTS.reset();
      simTS.set_boundary_conditions(simTS.vals, 0);

      let a = 5.0;
      let w = 5.0;
      let distance = 2.0;
      simTS.add_point_source(
        new PointSource(
          Math.floor(0.5 * (1 + distance / (xmax - xmin)) * width),
          Math.floor(height / 2),
          a,
          w,
          Math.PI,
        ),
      );
      simTS.add_point_source(
        new PointSource(
          Math.floor(0.5 * (1 - distance / (xmax - xmin)) * width),
          Math.floor(height / 2),
          a,
          w,
          0.0,
        ),
      );
      let sceneTS = new WaveSimTwoDimHeatMapScene(
        canvasTS,
        imageDataTS,
        width,
        height,
      );
      sceneTS.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // TODO Make the Rust simulator and scene
      // This consists of writing the Simulator class in Rust and also
      // defining struct PointSource there.

      class Foo extends WaveSimTwoDimHeatMapScene {
        update_mobjects_from_simulator(simulator: WaveSimTwoDimRust) {
          let mobj = this.get_mobj("heatmap") as HeatMap;
          mobj.set_vals(simulator.output_u_vals());
        }
      }
      let sceneRust = new Foo(canvasRust, imageDataRust, width, height);
      sceneRust.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // // Button which, when clicked, calls Rust to do calculations
      // // TODO Write simulator values to scene
      // let rustButton = Button(
      //   document.getElementById(name + "-button-1") as HTMLElement,
      //   async function handleClick() {
      //     for (let i = 0; i < num_steps; i++) {
      //       simRust.step();
      //       const vals = simRust.output_u_vals();
      //     }
      //     console.log(`Done ${num_steps} iterations at size ${width}`);
      //     simRust.reset();
      //   },
      // );
      // rustButton.textContent = "Rust implementation";

      // Button which, when clicked, calls TS to do calculations
      // TODO Write simulator values to scene
      let tsButton = Button(
        document.getElementById(name + "-ts-button") as HTMLElement,
        async function handleClick() {
          for (let i = 0; i < num_steps; i++) {
            simTS.step();
            sceneTS.update_mobjects_from_simulator(simTS);
            sceneTS.draw();
            await delay(0.1);
          }
          console.log(`Done ${num_steps} iterations at size ${width}`);
          simTS.reset();
        },
      );
      tsButton.textContent = "TS implementation";
    })(300, 300);
  });
})();
