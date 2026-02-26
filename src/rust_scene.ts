import {
  createWaveSimOneDim,
  createWaveSimTwoDim,
  createHeatSimTwoDim,
} from "./rust-calc-browser";
import { Button } from "./lib/interactive/button";
import { Slider } from "./lib/interactive/slider";
import {
  WaveSimOneDim,
  WaveSimTwoDim,
  PointSource,
  WaveSimTwoDimHeatMapScene,
} from "./lib/simulator/wavesim";
import { InteractiveHandler, Simulator } from "./lib/simulator/sim";
import { funspace, prepare_canvas, delay, HeatMap } from "./lib/base";

// Testing out performance of Rust bound in via WASM.
(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    await (async function rust_wave_eq_one_dim() {
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
      let simRust = await createWaveSimOneDim(width, dt);
      simRust.set_attr("wave_propagation_speed", 10.0);
      simRust.reset();

      // Button which, when clicked, calls a rust function to do calculations

      // TODO Build direct access to the values field of the simRust object via its pointer,
      // so that we can access the values directly without having to call a function
      let rustButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        async function handleClick() {
          for (let i = 0; i < num_steps; i++) {
            const vals = simRust.get_uValues();
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
    await (async function rust_wave_eq_two_dim(width: number, height: number) {
      const name = "rust-wave-eq-two-dim";
      const dt = 0.01;
      const num_steps = 300;

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

      // Make the TS simulator, handler, and scene
      let simTS = new WaveSimTwoDim(width, height, dt);
      simTS.set_attr("wave_propagation_speed", 0.1 * width);
      simTS.reset();
      simTS.set_boundary_conditions(simTS.vals, 0);

      let a = 5.0;
      let w = 8.0;
      let distance = 2.0;

      simTS.add_point_source(
        new PointSource(
          Math.floor(0.5 * (1 + distance / (xmax - xmin)) * width),
          Math.floor(height / 2),
          w,
          a,
          Math.PI / w,
        ),
      );
      simTS.add_point_source(
        new PointSource(
          Math.floor(0.5 * (1 - distance / (xmax - xmin)) * width),
          Math.floor(height / 2),
          w,
          a,
          0.0,
        ),
      );
      let handlerTS = new InteractiveHandler(simTS);
      let sceneTS = new WaveSimTwoDimHeatMapScene(
        canvasTS,
        imageDataTS,
        width,
        height,
      );
      sceneTS.set_frame_lims([xmin, xmax], [ymin, ymax]);
      handlerTS.add_scene(sceneTS);

      // Button which pauses/unpauses scene
      let pauseButtonTS = handlerTS.add_pause_button(
        document.getElementById(name + "-ts-button-1") as HTMLElement,
      );
      // Button which clears the scene
      let clearButtonTS = Button(
        document.getElementById(name + "-ts-button-2") as HTMLElement,
        function () {
          handlerTS.add_to_queue(simTS.reset.bind(simTS));
          handlerTS.add_to_queue(handlerTS.draw.bind(handlerTS));
        },
      );
      clearButtonTS.textContent = "Clear";
      clearButtonTS.style.padding = "15px";
      // Make a slider which controls the dipole distance
      let w_sliderTS = Slider(
        document.getElementById(name + "-ts-slider-1") as HTMLElement,
        function (d: number) {
          let r = d / (xmax - xmin);
          handlerTS.add_to_queue(() => {
            simTS.modify_point_source_x(0, Math.floor(0.5 * (1 + r) * width));
            simTS.modify_point_source_x(1, Math.floor(0.5 * (1 - r) * width));
          });
        },
        {
          name: "Distance",
          initial_value: "1.0",
          min: 0.2,
          max: 8,
          step: 0.05,
        },
      );

      // Make the Rust simulator and scene
      // TODO Write a wrapper class which extends Simulator and reveals
      // a reset() method, a step() method, a add_point_source() method,
      // a modify_point_source() method, and a get_uValues() method

      let simRust = await createWaveSimTwoDim(width, height, dt);
      simRust.set_attr("wave_propagation_speed", 0.1 * width);
      simRust.reset();

      simRust.add_point_source(
        Math.floor(0.5 * (1 + distance / (xmax - xmin)) * width),
        Math.floor(height / 2),
        w,
        a,
        Math.PI / w,
      );
      simRust.add_point_source(
        Math.floor(0.5 * (1 - distance / (xmax - xmin)) * width),
        Math.floor(height / 2),
        w,
        a,
        0.0,
      );
      let handlerRust = new InteractiveHandler(simRust);

      let sceneRust = new WaveSimTwoDimHeatMapScene(
        canvasRust,
        imageDataRust,
        width,
        height,
      );
      sceneRust.set_frame_lims([xmin, xmax], [ymin, ymax]);
      handlerRust.add_scene(sceneRust);

      // Button which pauses/unpauses scene
      let pauseButtonRust = handlerRust.add_pause_button(
        document.getElementById(name + "-rust-button-1") as HTMLElement,
      );
      // Button which clears the scene
      let clearButtonRust = Button(
        document.getElementById(name + "-rust-button-2") as HTMLElement,
        function () {
          handlerRust.add_to_queue(simRust.reset.bind(simRust));
          handlerRust.add_to_queue(handlerRust.draw.bind(handlerRust));
        },
      );
      clearButtonRust.textContent = "Clear";
      clearButtonRust.style.padding = "15px";
      // Make a slider which controls the dipole distance
      let w_sliderRust = Slider(
        document.getElementById(name + "-rust-slider-1") as HTMLElement,
        function (d: number) {
          let r = d / (xmax - xmin);
          handlerRust.add_to_queue(() => {
            simRust.modify_point_source_x(0, Math.floor(0.5 * (1 + r) * width));
            simRust.modify_point_source_x(1, Math.floor(0.5 * (1 - r) * width));
          });
        },
        {
          name: "Distance",
          initial_value: "1.0",
          min: 0.2,
          max: 8,
          step: 0.05,
        },
      );
    })(200, 200);

    // Animate a 2D heat equation heatmap scene, non-interactively.
    await (async function rust_heat_eq_two_dim(width: number, height: number) {
      const name = "rust-heat-eq-two-dim";
      const dt = 0.01;
      const num_steps = 300;

      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

      // Prepare canvases
      // let canvasTS = prepare_canvas(width, height, name + "-ts");
      let canvasRust = prepare_canvas(width, height, name + "-rust");

      // Create ImageData objects
      // const ctxTS = canvasTS.getContext("2d");
      // if (!ctxTS) {
      //   throw new Error("Failed to get 2D context");
      // }
      // const imageDataTS = ctxTS.createImageData(width, height);

      const ctxRust = canvasRust.getContext("2d");
      if (!ctxRust) {
        throw new Error("Failed to get 2D context");
      }
      const imageDataRust = ctxRust.createImageData(width, height);

      // Make the TS simulator, handler, and scene
      // let simTS = new WaveSimTwoDim(width, height, dt);
      // simTS.set_attr("wave_propagation_speed", 0.1 * width);
      // simTS.reset();
      // simTS.set_boundary_conditions(simTS.vals, 0);

      // let a = 5.0;
      // let w = 8.0;
      // let distance = 2.0;

      // simTS.add_point_source(
      //   new PointSource(
      //     Math.floor(0.5 * (1 + distance / (xmax - xmin)) * width),
      //     Math.floor(height / 2),
      //     w,
      //     a,
      //     Math.PI / w,
      //   ),
      // );
      // simTS.add_point_source(
      //   new PointSource(
      //     Math.floor(0.5 * (1 - distance / (xmax - xmin)) * width),
      //     Math.floor(height / 2),
      //     w,
      //     a,
      //     0.0,
      //   ),
      // );
      // let handlerTS = new InteractiveHandler(simTS);
      // let sceneTS = new WaveSimTwoDimHeatMapScene(
      //   canvasTS,
      //   imageDataTS,
      //   width,
      //   height,
      // );
      // sceneTS.set_frame_lims([xmin, xmax], [ymin, ymax]);
      // handlerTS.add_scene(sceneTS);

      // // Button which pauses/unpauses scene
      // let pauseButtonTS = handlerTS.add_pause_button(
      //   document.getElementById(name + "-ts-button-1") as HTMLElement,
      // );
      // // Button which clears the scene
      // let clearButtonTS = Button(
      //   document.getElementById(name + "-ts-button-2") as HTMLElement,
      //   function () {
      //     handlerTS.add_to_queue(simTS.reset.bind(simTS));
      //     handlerTS.add_to_queue(handlerTS.draw.bind(handlerTS));
      //   },
      // );
      // clearButtonTS.textContent = "Clear";
      // clearButtonTS.style.padding = "15px";
      // // Make a slider which controls the dipole distance
      // let w_sliderTS = Slider(
      //   document.getElementById(name + "-ts-slider-1") as HTMLElement,
      //   function (d: number) {
      //     let r = d / (xmax - xmin);
      //     handlerTS.add_to_queue(() => {
      //       simTS.modify_point_source_x(0, Math.floor(0.5 * (1 + r) * width));
      //       simTS.modify_point_source_x(1, Math.floor(0.5 * (1 - r) * width));
      //     });
      //   },
      //   {
      //     name: "Distance",
      //     initial_value: "1.0",
      //     min: 0.2,
      //     max: 8,
      //     step: 0.05,
      //   },
      // );

      // Make the Rust simulator and scene

      let simRust = await createHeatSimTwoDim(width, height, dt);
      // simRust.set_attr("heat_propagation_speed", 0.1 * width);
      simRust.reset();

      simRust.add_point_source(
        Math.floor(width / 2),
        Math.floor(height / 2),
        10.0,
      );
      let handlerRust = new InteractiveHandler(simRust);

      let sceneRust = new WaveSimTwoDimHeatMapScene(
        canvasRust,
        imageDataRust,
        width,
        height,
      );
      sceneRust.set_frame_lims([xmin, xmax], [ymin, ymax]);
      handlerRust.add_scene(sceneRust);

      // Button which pauses/unpauses scene
      let pauseButtonRust = handlerRust.add_pause_button(
        document.getElementById(name + "-rust-button-1") as HTMLElement,
      );
      // Button which clears the scene
      let clearButtonRust = Button(
        document.getElementById(name + "-rust-button-2") as HTMLElement,
        function () {
          handlerRust.add_to_queue(simRust.reset.bind(simRust));
          handlerRust.add_to_queue(handlerRust.draw.bind(handlerRust));
        },
      );
      clearButtonRust.textContent = "Clear";
      clearButtonRust.style.padding = "15px";
      // Make a slider which controls the dipole distance
      // let w_sliderRust = Slider(
      //   document.getElementById(name + "-rust-slider-1") as HTMLElement,
      //   function (d: number) {
      //     let r = d / (xmax - xmin);
      //     handlerRust.add_to_queue(() => {
      //       simRust.modify_point_source_x(0, Math.floor(0.5 * (1 + r) * width));
      //       simRust.modify_point_source_x(1, Math.floor(0.5 * (1 - r) * width));
      //     });
      //   },
      //   {
      //     name: "Distance",
      //     initial_value: "1.0",
      //     min: 0.2,
      //     max: 8,
      //     step: 0.05,
      //   },
      // );
    })(200, 200);
  });
})();
