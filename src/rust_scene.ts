import {
  createWaveSimOneDim,
  createWaveSimTwoDim,
  createHeatSimTwoDim,
  createHeatSimSphere,
} from "./rust-calc-browser";
import { Button } from "./lib/interactive/button";
import { Slider } from "./lib/interactive/slider";
import {
  WaveSimOneDim,
  WaveSimTwoDim,
  PointSource,
  WaveSimTwoDimHeatMapScene,
} from "./lib/simulator/wavesim";
import { HeatSimPoles } from "./lib/simulator/heatsim";
import { InteractiveHandler, Simulator } from "./lib/simulator/sim";
import {
  funspace,
  prepare_canvas,
  delay,
  HeatMap,
  MObject,
  grayscale_colormap,
  gaussian_normal_pdf,
} from "./lib/base";
import { SceneFromSimulator } from "./lib/simulator/sim";
import { HeatSimTwoDim } from "./lib/simulator/heatsim";
import { Arcball } from "./lib/three_d";
import { SphereHeatMapScene } from "./lib/three_d/surfaces";
import { CoordinateAxes3d } from "./lib/base";

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

    // 2D Heat equation simulation, in Typescript
    (function heatsim_2d_ts(width: number, height: number) {
      const name = "heatsim-2d-ts";
      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Create ImageData object
      const imageData = ctx.createImageData(width, height);

      let dt = 0.01;

      class Sim extends HeatSimTwoDim {
        center_temperature: number = 10;
        boundary_temperature: number = 0;
        set_center_temperature(temp: number): void {
          this.center_temperature = temp;
        }
        set_boundary_temperature(temp: number): void {
          this.boundary_temperature = temp;
        }
        set_boundary_conditions(s: Array<number>, t: number): void {
          // Puts a source in the middle
          let [center_x, center_y] = [
            Math.floor(this.width / 2),
            Math.floor(this.height / 2),
          ];
          for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
              s[this.index(center_x + i, center_y + j)] =
                this.center_temperature;
            }
          }

          // Cools the outside
          for (let x = 0; x < this.width; x++) {
            s[this.index(x, 0)] = this.boundary_temperature;
            s[this.index(x, this.height - 1)] = this.boundary_temperature;
          }
          for (let y = 0; y < this.height; y++) {
            s[this.index(0, y)] = this.boundary_temperature;
            s[this.index(this.width - 1, y)] = this.boundary_temperature;
          }
        }
      }
      let sim = new Sim(width, height, dt);
      sim.set_heat_propagation_speed(20);

      let handler = new InteractiveHandler(sim);

      class S extends SceneFromSimulator {
        imageData: ImageData;
        width: number;
        height: number;
        constructor(
          canvas: HTMLCanvasElement,
          width: number,
          height: number,
          imageData: ImageData,
        ) {
          super(canvas);
          this.width = width;
          this.height = height;
          this.imageData = imageData;
          let heatmap = new HeatMap(
            width,
            height,
            -100,
            100,
            new Array(width * height).fill(0),
          );
          this.add("heatmap", heatmap);
        }
        update_mobjects_from_simulator(simulator: HeatSimTwoDim) {
          let mobj = this.get_mobj("heatmap") as HeatMap;
          mobj.set_vals(simulator.get_uValues());
        }
        draw_mobject(mobj: MObject) {
          if (mobj instanceof HeatMap) {
            mobj.draw(this.canvas, this, this.imageData);
          } else {
            mobj.draw(this.canvas, this);
          }
        }
      }

      let scene = new S(canvas, width, height, imageData);
      handler.add_scene(scene);
      handler.draw();

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
        },
      );
      clearButton.textContent = "Clear";

      // Sliders which control center and boundary temperature
      let c_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_center_temperature(Number(t));
          });
        },
        {
          name: "Center temperature",
          initial_value: "10",
          min: -10,
          max: 10,
          step: 0.05,
        },
      );
      let b_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_boundary_temperature(Number(t));
          });
        },
        {
          name: "Boundary temperature",
          initial_value: "0",
          min: -10,
          max: 10,
          step: 0.05,
        },
      );

      handler.play(undefined);
    })(300, 300);

    // 2D Heat equation simulation, in Rust
    await (async function heatsim_2d_rust(width: number, height: number) {
      const name = "heatsim-2d-rust";
      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Create ImageData object
      const imageData = ctx.createImageData(width, height);

      let dt = 0.01;

      let sim = await createHeatSimTwoDim(width, height, dt);
      sim.set_attr("heat_propagation_speed", 20.0);
      sim.reset();
      // Add a point source in the center and ones around the boundary
      let [center_x, center_y] = [
        Math.floor(width / 2),
        Math.floor(height / 2),
      ];
      let center_source_padding = 2;
      for (let i = -center_source_padding; i <= center_source_padding; i++) {
        for (let j = -center_source_padding; j <= center_source_padding; j++) {
          sim.add_point_source(center_x + i, center_y + j, 10.0);
        }
      }
      for (let x = 0; x < width; x++) {
        sim.add_point_source(x, 0, -10.0);
        sim.add_point_source(x, height - 1, -10.0);
      }
      for (let y = 1; y < height - 1; y++) {
        sim.add_point_source(0, y, -10.0);
        sim.add_point_source(width - 1, y, -10.0);
      }
      let handler = new InteractiveHandler(sim);

      class S extends SceneFromSimulator {
        imageData: ImageData;
        width: number;
        height: number;
        constructor(
          canvas: HTMLCanvasElement,
          width: number,
          height: number,
          imageData: ImageData,
        ) {
          super(canvas);
          this.width = width;
          this.height = height;
          this.imageData = imageData;
          let heatmap = new HeatMap(
            width,
            height,
            -100,
            100,
            new Array(width * height).fill(0),
          );
          this.add("heatmap", heatmap);
        }
        update_mobjects_from_simulator(simulator: Simulator) {
          let mobj = this.get_mobj("heatmap") as HeatMap;
          mobj.set_vals(simulator.get_uValues());
        }
        draw_mobject(mobj: MObject) {
          if (mobj instanceof HeatMap) {
            mobj.draw(this.canvas, this, this.imageData);
          } else {
            mobj.draw(this.canvas, this);
          }
        }
      }

      let scene = new S(canvas, width, height, imageData);
      handler.add_scene(scene);
      handler.draw();

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
        },
      );
      clearButton.textContent = "Clear";

      // Sliders which control center and boundary temperature
      let c_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            for (let i = 0; i < (2 * center_source_padding + 1) ** 2; i++) {
              sim.modify_point_source_amplitude(i, Number(t));
            }
          });
        },
        {
          name: "Center temperature",
          initial_value: "10",
          min: -10,
          max: 10,
          step: 0.05,
        },
      );
      let b_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            for (let i = 0; i < 2 * (width + height - 2); i++) {
              sim.modify_point_source_amplitude(
                i + (2 * center_source_padding + 1) ** 2,
                Number(t),
              );
            }
          });
        },
        {
          name: "Boundary temperature",
          initial_value: "0",
          min: -10,
          max: 10,
          step: 0.05,
        },
      );

      handler.play(undefined);
    })(300, 300);

    // Spherical heat equation simulation, in Typescript
    // A heatmap scene in 3D on the surface of a sphere
    (function heatsim_sphere_ts(width: number, height: number) {
      const name = "heatsim-sphere-ts";
      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Set parameters
      let num_theta = 50;
      let num_phi = 100;

      // Make a simulator
      let dt = 0.001;
      let sim = new HeatSimPoles(num_theta, num_phi, dt);
      sim.set_heat_propagation_speed(1.0);

      // let sim = new SphericalFunctionSimulator(num_theta, num_phi, dt);
      // Initial steps to warm up the simulation
      // for (let i = 0; i < 0; i++) {
      //   sim.step();
      // }

      // let sim = new HeatSimSphericalDecoherence(num_theta, num_phi, dt);
      // sim.reset();

      // Make a handler to link the simulator to the sphere object
      let handler = new InteractiveHandler(sim);

      // Prepare the scene
      let radius = 1;
      let zoom_ratio = 1.0;
      let scene = new SphereHeatMapScene(canvas, radius, num_theta, num_phi);
      // scene.set_colormap(grayscale_colormap);
      scene.set_frame_lims([-2, 2], [-2, 2]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");

      // Move the camera
      scene.camera.move_to([0, 0, -2]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3,
      );

      // Add an arcball for interactivity
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      // Add axes
      let [xmin, xmax] = [-2, 2];
      let [ymin, ymax] = [-2, 2];
      let [zmin, zmax] = [-2, 2];
      let axes = new CoordinateAxes3d([xmin, xmax], [ymin, ymax], [zmin, zmax]);
      axes.set_tick_size(0.1);
      axes.set_alpha(0.5);
      axes.set_axis_stroke_width(0.01);
      scene.add("axes", axes);

      // Add the scene to the handler
      handler.add_scene(scene);

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
          handler.add_to_queue(handler.draw.bind(handler));
        },
      );
      clearButton.textContent = "Clear";

      // Sliders which control north and south temperature
      let n_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_n_pole_temp(Number(t));
          });
        },
        {
          name: "North pole temperature",
          initial_value: "20",
          min: -50,
          max: 50,
          step: 0.05,
        },
      );
      let s_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_s_pole_temp(Number(t));
          });
        },
        {
          name: "South pole temperature",
          initial_value: "-20",
          min: -50,
          max: 50,
          step: 0.05,
        },
      );

      // Run the simulation
      handler.draw();
      handler.play(undefined);
    })(300, 300);

    // Spherical heat equation simulation, in Rust
    // A heatmap scene in 3D on the surface of a sphere
    await (async function heatsim_sphere_rust(width: number, height: number) {
      const name = "heatsim-sphere-rust";
      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Set parameters
      let num_theta = 50;
      let num_phi = 100;

      // Make a simulator
      let dt = 0.001;
      let sim = await createHeatSimSphere(num_theta, num_phi, dt);
      sim.set_attr("heat_propagation_speed", 1.0);
      sim.reset();

      // Add normal sources
      let bump_std = 0.1;
      let bump_vals: number[] = [];
      let num_lines = 0;
      let bump_val = gaussian_normal_pdf(
        0,
        bump_std,
        (num_lines * Math.PI) / num_theta,
      );
      while (bump_val > 0.2) {
        bump_vals.push(bump_val);
        num_lines++;
        bump_val = gaussian_normal_pdf(
          0,
          bump_std,
          (num_lines * Math.PI) / num_theta,
        );
      }

      for (let i = 0; i < num_lines; i++) {
        sim.add_latitude_source(i, (bump_vals[i] as number) * 10.0);
      }
      for (let i = 0; i < num_lines; i++) {
        sim.add_latitude_source(
          num_theta - i,
          (bump_vals[i] as number) * -10.0,
        );
      }

      // Make a handler to link the simulator to the sphere object
      let handler = new InteractiveHandler(sim);

      // Prepare the scene
      let radius = 1;
      let zoom_ratio = 1.0;
      let scene = new SphereHeatMapScene(canvas, radius, num_theta, num_phi);
      // scene.set_colormap(grayscale_colormap);
      scene.set_frame_lims([-2, 2], [-2, 2]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");

      // Move the camera
      scene.camera.move_to([0, 0, -2]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3,
      );

      // Add an arcball for interactivity
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      // Add axes
      let [xmin, xmax] = [-2, 2];
      let [ymin, ymax] = [-2, 2];
      let [zmin, zmax] = [-2, 2];
      let axes = new CoordinateAxes3d([xmin, xmax], [ymin, ymax], [zmin, zmax]);
      axes.set_tick_size(0.1);
      axes.set_alpha(0.5);
      axes.set_axis_stroke_width(0.01);
      scene.add("axes", axes);

      // Add the scene to the handler
      handler.add_scene(scene);

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
          handler.add_to_queue(handler.draw.bind(handler));
        },
      );
      clearButton.textContent = "Clear";

      // Sliders which control north and south temperature
      let n_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            for (let i = 0; i < num_lines; i++) {
              sim.modify_latitude_source_amplitude(
                i,
                (bump_vals[i] as number) * Number(t),
              );
            }
          });
        },
        {
          name: "North pole temperature",
          initial_value: "20",
          min: -50,
          max: 50,
          step: 0.05,
        },
      );
      let s_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            for (let i = 0; i < num_lines; i++) {
              sim.modify_latitude_source_amplitude(
                i + num_lines,
                (bump_vals[i] as number) * Number(t),
              );
            }
          });
        },
        {
          name: "South pole temperature",
          initial_value: "-20",
          min: -50,
          max: 50,
          step: 0.05,
        },
      );

      // Run the simulation
      handler.draw();
      handler.play(undefined);
    })(300, 300);
  });
})();
