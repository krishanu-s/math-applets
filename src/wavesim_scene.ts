// Testing the direct feeding of a pixel array to the canvas
import { MObject, Dot, Line, Scene, prepare_canvas } from "./lib/base.js";
import { Slider, Button } from "./lib/interactive.js";
import {
  Vec2D,
  clamp,
  sigmoid,
  vec_sum,
  vec_sum_list,
  linspace,
} from "./lib/base.js";
import { ParametricFunction } from "./lib/parametric.js";
import { HeatMap } from "./lib/heatmap.js";
import {
  WaveSimOneDimScene,
  WaveSimTwoDim,
  WaveSimTwoDimPointSource,
  WaveSimTwoDimEllipticReflector,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimDotsScene,
} from "./lib/wavesim.js";
import {} from "./lib/statesim.js";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Demonstration of wave propagation in two dimensions. At the top of the page.
    (function twodim_wave_propagation_demo() {
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

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

      let waveSim = new WaveSimTwoDimEllipticReflector(width, height, dt);
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
        {
          name: "Frequency",
          initial_value: "5.0",
          min: 0,
          max: 20,
          step: 0.05,
        },
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

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
        {
          name: "Amplitude",
          initial_value: "5.0",
          min: 0,
          max: 10,
          step: 0.05,
        },
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

      // Start the simulation when unpaused
      waveEquationScene.play(undefined);
    })();

    // Depicts ray trajectories emanating from the focus of a conic section
    // and reflecting off the conic section.
    (function conic_rays() {
      // Prepare the canvas
      let canvas = prepare_canvas(200, 200, "conic-rays");

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Make the scene
      // TODO Make the trajectories play in real-time.
      let scene = new Scene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);

      // Define conic
      class Conic {
        focus: Vec2D;
        eccentricity: number;
        scale: number;
        other_focus: Vec2D;
        constructor(focus: Vec2D, eccentricity: number, scale: number) {
          this.focus = focus;
          this.eccentricity = eccentricity;
          this.scale = scale;
          this.other_focus = this.calculate_other_focus();
        }
        // Parametrization in polar form
        polar_function(t: number): Vec2D {
          return [
            this.focus[0] +
              (this.scale * Math.cos(t)) /
                (1 + this.eccentricity * Math.cos(t)),
            this.focus[1] +
              (this.scale * Math.sin(t)) /
                (1 + this.eccentricity * Math.cos(t)),
          ];
        }
        // Calculates the other focus
        calculate_other_focus(): Vec2D {
          if (this.eccentricity == 1) {
            return null;
          } else {
            return vec_sum_list([
              [-this.focus[0], -this.focus[1]],
              this.polar_function(0),
              this.polar_function(Math.PI),
            ]);
          }
        }
        // Sets the eccentricity
        set_eccentricity(eccentricity: number) {
          this.eccentricity = eccentricity;
          this.other_focus = this.calculate_other_focus();
        }
        // Makes a conic section object
        // TODO Consider making the solver fixed.
        make_curve(): ParametricFunction {
          if (this.eccentricity < 1) {
            return new ParametricFunction(
              this.polar_function.bind(this),
              -Math.PI,
              Math.PI,
              50,
              { mode: "smooth", stroke_width: 0.08 },
            );
          } else if (this.eccentricity == 1) {
            return new ParametricFunction(
              this.polar_function.bind(this),
              -Math.PI + 0.01,
              Math.PI - 0.01,
              50,
              { mode: "jagged", stroke_width: 0.08 },
            );
          } else {
            return new MObject();
          }
        }
        // Makes dots for the foci
        make_focus(): Dot {
          return new Dot(this.focus[0], this.focus[1], { radius: 0.2 });
        }
        make_other_focus(): Dot {
          if (this.eccentricity >= 1.0) {
            return new MObject();
          } else {
            return new Dot(this.other_focus[0], this.other_focus[1], {
              radius: 0.1,
            });
          }
        }
        make_trajectory(t: number): [MObject, MObject] {
          if (this.eccentricity >= 1.0) {
            return [new MObject(), new MObject()];
          } else {
            let intersection_point = this.polar_function(t);
            return [
              new Line(this.focus, intersection_point, {
                stroke_width: 0.04,
              }),
              new Line(intersection_point, this.other_focus, {
                stroke_width: 0.04,
              }),
            ];
          }
        }
      }

      // Make conic
      let conic = new Conic([2.0, 0], 0.5, 3.0);

      // Set trajectory angles
      let num_trajectories = 10;
      let thetas: number[] = [];
      for (let i = 1; i < num_trajectories; i++) {
        thetas.push((2 * Math.PI * i) / num_trajectories);
      }

      // Reset objects in scene
      function reset_scene() {
        scene.clear();
        scene.add("focus", conic.make_focus());
        scene.add("other_focus", conic.make_other_focus());
        scene.add("curve", conic.make_curve());
        // TODO Make these animated.
        for (let i = 0; i < num_trajectories; i++) {
          let theta = thetas[i] as number;
          let [l1, l2] = conic.make_trajectory(theta);
          scene.add(`l${i}_1`, l1);
          scene.add(`l${i}_2`, l2);
        }
      }

      // Add a slider
      let eccentricity_slider = new Slider(
        document.getElementById(
          "conic-rays-eccentricity-slider",
        ) as HTMLElement,
        function (val: number) {
          conic.set_eccentricity(val);
          reset_scene();
          scene.draw();
        },
        {
          name: "Eccentricity",
          initial_value: "0.5",
          min: 0.0,
          max: 1.0,
          step: 0.05,
        },
      );
      // TODO Animate these trajectories

      // Draw the scene
      scene.draw();
    })();

    // Shows a single vibrating spring in two dimensions, obeying Hooke's law.
    // Include both an interactive animation (with spring strength modifiable by slider)
    // and a static visualization of the force diagram.
    (function point_mass_spring() {
      // TODO
    });

    // Shows a sequence of point masses connected by springs, oscillating
    // according to Hooke's law.
    // Include both an interactive animation (with spring strength modifiable by slider)
    // and a static visualization of the force diagram.
    (function point_mass_discrete_sequence(num_points: number) {
      // Prepare the scene
      let canvas = prepare_canvas(300, 300, "point-mass-discrete-sequence");
      let scene = new WaveSimOneDimScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      let sim = scene.sim();

      // Set the attributes of the simulator
      sim.set_attr("wave_propagation_speed", 3.0);
      // TODO Set a better initial condition
      sim.set_uValues(linspace(0, 1, num_points));

      // Button which pauses/unpauses the simulation
      let pauseButton = Button(
        document.getElementById(
          "point-mass-discrete-sequence-pause-button",
        ) as HTMLElement,
        function () {
          scene.add_to_queue(scene.toggle_pause.bind(scene));
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(
          "point-mass-discrete-sequence-stiffness-slider",
        ) as HTMLElement,
        function (w: number) {
          scene.add_to_queue(
            scene.set_simulator_attr.bind(
              scene,
              0,
              "wave_propagation_speed",
              w,
            ),
          );
        },
        {
          name: "Wave propagation speed",
          initial_value: "3.0",
          min: 0,
          max: 20,
          step: 0.05,
        },
      );
      w_slider.width = 200;

      // Prepare the simulation
      scene.draw();
      scene.play(undefined);
    })(10);

    // Redraw the previous scene in a continuous-Bezier curve fashion,
    // using a large number of tiny point masses.
    // Include both an interactive animation (with spring strength modifiable by slider)
    // and a static visualization of the force diagram.
    (function point_mass_continuous_sequence(num_points: number) {
      // Prepare the scene
      let canvas = prepare_canvas(300, 300, "point-mass-continuous-sequence");
      let scene = new WaveSimOneDimScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("curve");
      let sim = scene.sim();

      // Set the attributes of the simulator
      sim.set_attr("wave_propagation_speed", 3.0);
      // TODO Set a better initial condition
      sim.set_uValues(linspace(0, 1, num_points));

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-stiffness-slider",
        ) as HTMLElement,
        function (w: number) {
          scene.add_to_queue(
            scene.set_simulator_attr.bind(
              scene,
              0,
              "wave_propagation_speed",
              w,
            ),
          );
        },
        {
          name: "Wave propagation speed",
          initial_value: "3.0",
          min: 0,
          max: 20,
          step: 0.05,
        },
      );
      w_slider.width = 200;

      // Button which pauses/unpauses the simulation
      let pauseButton = Button(
        document.getElementById(
          "point-mass-continuous-sequence-pause-button",
        ) as HTMLElement,
        function () {
          scene.add_to_queue(scene.toggle_pause.bind(scene));
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

      // Prepare the simulation
      scene.draw();
      scene.play(undefined);
    })(50);

    // Extend the 1D, finite-number-of-point-masses to 2D.
    // Include both an interactive animation (with spring strength modifiable by slider)
    // and a static visualization of the force diagram. Use color to indicate height.
    (function point_mass_discrete_lattice() {
      // TODO
    });

    // Some animation to depict reflective elements.
    // Some animation to depict point sources and line sources.
  });
})();
