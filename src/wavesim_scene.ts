// Testing the direct feeding of a pixel array to the canvas
import { MObject, Scene, prepare_canvas } from "./base.js";
import { Slider, Button } from "./interactive.js";
import { Vec2D, clamp, sigmoid } from "./base.js";
import { ParametricFunction } from "./parametric.js";
import { HeatMap } from "./heatmap.js";
import {
  WaveSimTwoDim,
  WaveSimTwoDimPointSource,
  WaveSimTwoDimEllipticReflector,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimDotsScene,
} from "./wavesim.js";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    const xmin = -5;
    const xmax = 5;
    const ymin = -5;
    const ymax = 5;
    const clamp_value = 10;

    // Prepare the canvas and scene
    let width = 200;
    let height = 200;
    const dt = 0.01;

    let canvas = prepare_canvas(width, height, "scene-container");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Create ImageData object
    const imageData = ctx.createImageData(width, height);

    let waveSim = new WaveSimTwoDimPointSource(width, height, dt);
    waveSim.wave_propagation_speed = width / 10;

    // Set amplitude
    waveSim.set_attr("a", 5.0);
    // waveSim.set_attr("clamp_value", clamp_value);

    // Set PML layers
    waveSim.set_pml_layer(true, true, 0.2, 200.0);
    waveSim.set_pml_layer(true, false, 0.2, 200.0);
    waveSim.set_pml_layer(false, true, 0.2, 200.0);
    waveSim.set_pml_layer(false, false, 0.2, 200.0);

    // Set up the simulation
    waveSim.add_boundary_conditions(waveSim.vals, 0);

    // Initialize the scene
    let waveEquationScene = new WaveSimTwoDimHeatMapScene(
      canvas,
      waveSim,
      imageData,
    );
    waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);

    // Make a slider which controls the frequency
    let w_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (w: number) {
        waveEquationScene.add_to_queue(
          waveEquationScene.set_simulator_attr.bind(
            waveEquationScene,
            0,
            "w",
            w,
          ),
        );
      },
      `5.0`,
      0,
      20,
      0.05,
    );
    w_slider.width = 200;

    // Button which pauses/unpauses the simulation
    let pauseButton = Button(
      document.getElementById("button-container-1") as HTMLElement,
      function () {
        waveEquationScene.add_to_queue(
          waveEquationScene.toggle_pause.bind(waveEquationScene),
        );
        if (pauseButton.textContent == "Pause simulation") {
          pauseButton.textContent = "Unpause simulation";
        } else if (pauseButton.textContent == "Unpause simulation") {
          pauseButton.textContent = "Pause simulation";
        } else {
          throw new Error();
        }
        // // TODO Make text change state on button press, not check simulator
        // pauseButton.textContent = waveEquationScene.paused
        //   ? "Pause simulation"
        //   : "Unpause simulation";
      },
    );
    pauseButton.textContent = "Pause simulation";
    pauseButton.style.padding = "15px";

    // // Slider which controls the eccentricity: specific to ellipse
    // let eccentricity_slider = Slider(
    //   document.getElementById("slider-container-1") as HTMLElement,
    //   function (e: number) {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.set_semiminor_axis.bind(
    //         waveEquationScene,
    //         Math.sqrt(1 - (+e) ** 2) * waveEquationScene.semimajor_axis,
    //       ),
    //     );
    //   },
    //   `0.5`,
    //   0,
    //   1,
    //   0.01,
    // );
    // eccentricity_slider.width = 200;

    // Make a slider which controls the amplitude
    let a_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (a: number) {
        waveEquationScene.add_to_queue(
          waveEquationScene.set_simulator_attr.bind(
            waveEquationScene,
            0,
            "a",
            a,
          ),
        );
      },
      `5.0`,
      0,
      10,
      0.05,
    );
    a_slider.width = 200;

    // Button which clears the scene
    let clearButton = Button(
      document.getElementById("button-container-3") as HTMLElement,
      function () {
        waveEquationScene.add_to_queue(
          waveEquationScene.reset.bind(waveEquationScene),
        );
      },
    );
    clearButton.textContent = "Clear";
    clearButton.style.padding = "15px";

    // Start the simulation

    waveEquationScene.toggle_pause();
    waveEquationScene.play(undefined);
  });
})();
