// Testing the direct feeding of a pixel array to the canvas
import { MObject, Scene, prepare_canvas } from "./lib/base.js";
import { Slider, Button, PauseButton } from "./lib/interactive.js";
import {
  Dot,
  Sector,
  Rectangle,
  Line,
  Vec2D,
  vec2_sum,
  vec2_sum_list,
  vec2_sub,
  vec2_angle,
  vec2_scale,
  vec2_norm,
  DraggableDot,
  DraggableDotX,
  DraggableDotY,
  Arrow,
} from "./lib/base_geom.js";
import { clamp, sigmoid, linspace, funspace, delay } from "./lib/base.js";
import { ParametricFunction } from "./lib/parametric.js";
import { HeatMap } from "./lib/heatmap.js";
import {
  PointSource,
  WaveSimOneDimScene,
  WaveSimTwoDim,
  WaveSimTwoDimEllipticReflector,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimDotsScene,
} from "./lib/wavesim.js";
import { LineSpring } from "./lib/spring.js";
import { InteractivePlayingScene, SpringSimulator } from "./lib/statesim.js";

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
      waveSim.set_boundary_conditions(waveSim.vals, 0);

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

      waveEquationScene.draw();

      // Start the simulation when unpaused
      waveEquationScene.play(undefined);
    })();

    // Depicts ray trajectories emanating from the focus of a conic section
    // and reflecting off the conic section.
    (async function conic_rays() {
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

      // Define conic section
      class Conic {
        focus: Vec2D;
        eccentricity: number;
        scale: number;
        other_focus: Vec2D | null;
        constructor(focus: Vec2D, eccentricity: number, scale: number) {
          this.focus = focus;
          this.eccentricity = eccentricity;
          this.scale = scale;
          this.other_focus = this.calculate_other_focus();
        }
        // Radius as a function of angle, i.e. polar parametrization
        polar_radius(t: number): number {
          return this.scale / (1 + this.eccentricity * Math.cos(t));
        }
        // 2D parametrization in polar form
        polar_function(t: number): Vec2D {
          let r = this.polar_radius(t);
          return [
            this.focus[0] + r * Math.cos(t),
            this.focus[1] + r * Math.sin(t),
          ];
        }
        // Calculates the other focus
        // TODO Return a PVec2D in projective space.
        calculate_other_focus(): Vec2D | null {
          if (this.eccentricity == 1) {
            return null;
          } else {
            return vec2_sum_list([
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
        make_curve(): MObject {
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
          return new Dot(this.focus, { radius: 0.2 });
        }
        make_other_focus(): MObject {
          if (this.eccentricity >= 1.0) {
            return new MObject();
          } else {
            return new Dot(this.other_focus, {
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
      let focus: Vec2D = [2.0, 0];
      let eccentricity = 0.5;
      let scale = 3.0;
      let conic = new Conic(focus, eccentricity, scale);

      // Redraw fixed elements of scene
      function reset_scene_fixed_elements() {
        scene.remove("focus");
        scene.remove("other_focus");
        scene.remove("curve");
        scene.add("focus", conic.make_focus());
        scene.add("other_focus", conic.make_other_focus());
        scene.add("curve", conic.make_curve());
      }

      // Decide trajectory angles
      let num_trajectories = 10;
      let thetas: number[] = [];
      for (let i = 0; i < num_trajectories; i++) {
        thetas.push((2 * Math.PI * i) / num_trajectories);
      }
      let collision_times: number[];

      // Calculate the collision points of the trajectories with the conic section
      function recalculate_collision_time(theta: number): number {
        return conic.polar_radius(theta);
      }

      // Add a slider
      let eccentricity_slider: HTMLInputElement = Slider(
        document.getElementById(
          "conic-rays-eccentricity-slider",
        ) as HTMLElement,
        function (val: number) {
          conic.set_eccentricity(val);
          reset_scene_fixed_elements();
          scene.draw();
          let collision_times: number[] = [];
          for (let i = 0; i < num_trajectories; i++) {
            collision_times.push(recalculate_collision_time(thetas[i]));
          }
        },
        {
          name: "Eccentricity",
          min: 0.0,
          max: 1.0,
          initial_value: "0.5",
          step: 0.05,
        },
      );

      // Draw the scene
      scene.draw();

      // Make a pause button for the animation
      let playing = false;
      let pauseButton = Button(
        document.getElementById("conic-rays-pause-button") as HTMLElement,
        function () {
          playing = !playing;
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

      async function do_simulation(total_time: number, dt: number) {
        // Setup
        let current_thetas: number[] = [];
        let moving_points: Vec2D[] = [];
        let reflected: boolean[] = [];
        for (let i = 0; i < num_trajectories; i++) {
          current_thetas.push((2 * Math.PI * i) / num_trajectories);
          reflected.push(false);
          moving_points.push([focus[0], focus[1]]);
          let dot = new Dot(focus, {});
          dot.set_radius(0.05);
          dot.set_color("red");
          scene.add(`p_${i}`, dot);
        }
        let collision_times: number[] = [];
        for (let i = 0; i < num_trajectories; i++) {
          collision_times.push(recalculate_collision_time(thetas[i]));
        }
        // Animate trajectories
        let t = 0;
        let x: number, y: number;
        let collision_indices: number[] = [];
        while (t < total_time) {
          if (playing) {
            for (let i = 0; i < num_trajectories; i++) {
              [x, y] = moving_points[i];
              if (t + dt > collision_times[i] && !reflected[i]) {
                // Collision case
                collision_indices.push(i);

                // TODO Recalculate next collision time for continued reflections
                let s = collision_times[i] - t;

                // Add the first trajectory portion to the reflection point
                x += Math.cos(thetas[i]) * s;
                y += Math.sin(thetas[i]) * s;

                // Add a little collision effect
                let effect = new Sector(
                  [x, y],
                  thetas[i] - Math.PI / 2,
                  thetas[i] + Math.PI / 2,
                  {},
                );
                effect.set_color("red");
                effect.set_radius(0.3);
                scene.add(`c_${i}`, effect);

                // Set new trajectory angle after reflection
                if (conic.eccentricity == 1) {
                  current_thetas[i] = Math.PI;
                } else {
                  console.log(conic.eccentricity);
                  // TODO Calculate the angle in a more robust way, using local partial derivatives of the curve.
                  current_thetas[i] = vec2_angle(
                    vec2_sub(
                      conic.other_focus as Vec2D,
                      conic.polar_function(thetas[i]),
                    ),
                  );
                }
                // Add the first trajectory portion after the reflection point
                x += Math.cos(current_thetas[i]) * (dt - s);
                y += Math.sin(current_thetas[i]) * (dt - s);
                reflected[i] = true;
              } else {
                x += Math.cos(current_thetas[i]) * dt;
                y += Math.sin(current_thetas[i]) * dt;
              }
              moving_points[i] = [x, y];
              (scene.get_mobj(`p_${i}`) as Dot).move_to([x, y]);
            }
            scene.draw();
            t += dt;
            while (collision_indices.length > 0) {
              let i = collision_indices.pop();
              scene.remove(`c_${i}`);
            }
          }
          await delay(10);
        }
        for (let i = 0; i < num_trajectories; i++) {
          scene.remove(`p_${i}`);
        }
        await delay(500);
      }
      while (true) {
        await do_simulation(10, 0.06);
      }
    })();

    // Shows a single vibrating spring in two dimensions, obeying Hooke's law.
    // Include both an interactive animation (with spring strength modifiable by slider)
    // and a static visualization of the force diagram.
    (function point_mass_spring() {
      // Prepare the canvas
      let canvas = prepare_canvas(200, 200, "point-mass-spring");

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      class SpringScene extends InteractivePlayingScene {
        constructor(canvas: HTMLCanvasElement) {
          super(canvas, [new SpringSimulator(1.0, 0.01)]);
          // TODO Set coordinates in terms of scene frame limits
          let spring = new LineSpring([-3, 0], [0, 0], { stroke_width: 0.08 });
          spring.set_eq_length(3.0);
          let anchor = new Line([-3, -2], [-3, 2], { stroke_width: 0.3 });
          let mass = new Rectangle([0, 0], 0.6, 0.6);
          this.add("spring", spring);
          this.add("anchor", anchor);
          this.add("mass", mass);
        }
        // Updates all mobjects to account for the new simulator state
        update_mobjects() {
          let [u, v] = this.get_simulator(0).get_vals() as Vec2D;

          let mass = this.get_mobj("mass") as Rectangle;
          mass.move_to([u, 0]);

          let spring = this.get_mobj("spring") as Line;
          spring.move_end([u, 0]);
        }
        draw_mobject(mobj: MObject) {
          mobj.draw(this.canvas, this);
        }
      }

      // Make the scene
      let scene = new SpringScene(canvas);
      scene.set_simulator_attr(0, "stiffness", 5.0);
      scene.set_simulator_attr(0, "dt", 0.01);
      let sim = scene.get_simulator(0);
      sim.set_vals([1, 0]);
      scene.set_frame_lims([-5, 5], [-5, 5]);

      console.log("");

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(
          "point-mass-spring-stiffness-slider",
        ) as HTMLElement,
        function (w: number) {
          scene.add_to_queue(
            scene.set_simulator_attr.bind(scene, 0, "stiffness", w),
          );
        },
        {
          name: "Spring stiffness",
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
          "point-mass-spring-pause-button",
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

      // Play the scene
      scene.draw();
      scene.play(undefined);
    })();

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
      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      sim.set_uValues(funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points));

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

    (function point_mass_discrete_sequence_diagram(num_points: number) {
      // Prepare the scene
      let canvas = prepare_canvas(
        300,
        300,
        "point-mass-discrete-sequence-diagram",
      );
      // TODO This is essentially a WaveSimOneDimScene.
      let scene = new Scene(canvas);
      let xmin = -5;
      let xmax = 5;
      let ymin = -5;
      let ymax = 5;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // i goes from 0 to num_points -1
      function eq_position(i: number): Vec2D {
        return [xmin + ((i + 0.5) * (xmax - xmin)) / num_points, 0];
      }

      let pos: Vec2D;

      // Add vertical lines at the beginning and end of the sequence
      pos = eq_position(0);
      scene.add(
        "b0",
        new Line([pos[0], ymin / 2], [pos[0], ymax / 2], { stroke_width: 0.1 }),
      );

      pos = eq_position(num_points - 1);
      scene.add(
        "b1",
        new Line([pos[0], ymin / 2], [pos[0], ymax / 2], { stroke_width: 0.1 }),
      );

      // Make draggable dots
      let dots: DraggableDotY[] = [];
      for (let i = 0; i < num_points; i++) {
        let dot = new DraggableDotY(eq_position(i), { radius: 0.2 });
        dots.push(dot);
      }

      // Make springs and add callbacks to dots
      // TODO
      let springs: LineSpring[] = [];
      function set_spring(i: number, spring: LineSpring) {
        spring.move_start(dots[i].get_center());
        spring.move_end(dots[i + 1].get_center());
      }
      for (let i = 0; i < num_points - 1; i++) {
        let spring = new LineSpring([0, 0], [0, 0], {});
        spring.set_eq_length(
          vec2_norm(vec2_sub(eq_position(i + 1), eq_position(i))),
        );
        set_spring(i, spring);
        dots[i].add_callback(() => {
          set_spring(i, spring);
        });
        springs.push(spring);
      }

      // Make force arrows and add callbacks to dots
      let arrows: Arrow[] = [];
      function set_force_arrow(i: number, arrow: Arrow) {
        pos = dots[i].get_center();
        let disp: number;
        if (i == 0) {
          disp = dots[i + 1].get_center()[1] - pos[1];
        } else if (i == num_points - 1) {
          disp = pos[1] - dots[i - 1].get_center()[1];
        } else {
          disp =
            dots[i - 1].get_center()[1] +
            dots[i + 1].get_center()[1] -
            2 * dots[i].get_center()[1];
        }
        arrow.move_start(pos);
        arrow.move_end([pos[0], pos[1] + disp]);
        arrow.set_arrow_size(Math.sqrt(Math.abs(disp)) / 5);
      }
      for (let i = 0; i < num_points; i++) {
        let arrow = new Arrow([0, 0], [0, 0], { stroke_color: "red" });
        set_force_arrow(i, arrow);
        dots[i].add_callback(() => {
          set_force_arrow(i, arrow);
        });
        arrows.push(arrow);
      }

      for (let i = 0; i < num_points - 1; i++) {
        scene.add(`spring_${i}`, springs[i]);
      }
      for (let i = 0; i < num_points; i++) {
        scene.add(`arrow_${i}`, arrows[i]);
        scene.add(`point_${i}`, dots[i]);
      }

      // Prepare the simulation
      scene.draw();
    })(7);

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
      sim.set_attr("wave_propagation_speed", 10.0);
      sim.set_attr("damping", 0.05);
      sim.set_attr("dt", 0.05);
      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      sim.set_uValues(funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points));

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
    (function point_mass_discrete_lattice(width: number, height: number) {
      // TODO
      // Prepare the canvas and context for drawing
      let canvas = prepare_canvas(width, height, "point-mass-discrete-lattice");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);

      // Prepare the simulator and scene
      let sim = new WaveSimTwoDim(width, height, 0.02);
      // sim.remove_pml_layers();

      let scene = new WaveSimTwoDimHeatMapScene(canvas, sim, imageData);
      scene.set_frame_lims([-5, 5], [-5, 5]);

      sim.set_attr("wave_propagation_speed", 20.0);
      let w = 8.0;
      let a = 8.0;
      let [px, py] = scene.v2c([0, 0]);
      sim.add_point_source(new PointSource(px, py, w, a, 0.0));

      // Button which pauses/unpauses the simulation
      let pauseButton = Button(
        document.getElementById(
          "point-mass-discrete-lattice-pause-button",
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

      scene.draw();

      scene.play(undefined);
    })(200, 200);

    // Some animation to depict reflective elements.
    // Some animation to depict point sources and line sources.
    (function line_source_heatmap(width: number, height: number) {
      // Prepare the canvas and context for drawing
      let canvas = prepare_canvas(width, height, "line-source-heatmap");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);

      // Prepare the simulator and scene
      const ratio = 0.5;
      class WaveSimTwoDimDiffraction extends WaveSimTwoDim {
        // Has different wave propagation speed in two different media.
        wps(x: number, y: number): number {
          if (y < height / 2) {
            return this.wave_propagation_speed * ratio;
          } else {
            return this.wave_propagation_speed;
          }
        }
      }

      let sim = new WaveSimTwoDimDiffraction(width, height, 0.01);

      let scene = new WaveSimTwoDimHeatMapScene(canvas, sim, imageData);
      scene.set_frame_lims([-5, 5], [-5, 5]);

      const theta = Math.PI / 6; // Angle off vertical along which wave travels
      let alpha = Math.asin(ratio * Math.sin(theta));
      // Angle off vertical along which wave travels after refraction
      sim.set_attr("wave_propagation_speed", 20.0);
      let w = 4.0;
      let a = 5.0;

      // Turn off PML layers along the bottom and left of the scene
      sim.remove_pml_layers();
      sim.set_pml_layer(true, true, 0.2, 200.0);
      sim.set_pml_layer(false, true, 0.2, 200.0);

      // Set wave source at the bottom and left of the scene
      // TODO Calculate correct amplitude based on angle of wave
      let t;
      for (let px = 0; px <= width - 10; px++) {
        t = (px * Math.sin(theta)) / 20.0;
        let p = new PointSource(px, height - 1, w, a, t);
        p.set_turn_on_time(t);
        sim.add_point_source(p);
      }
      for (let py = 10; py <= height; py++) {
        if (py < height / 2) {
          t = (py * Math.cos(theta)) / 20.0;
        } else {
          t =
            ((height / 2) * Math.cos(theta) +
              ((py - height / 2) * Math.cos(alpha)) / ratio) /
            20.0;
        }
        let p = new PointSource(0, height - 1 - py, w, a, t);
        p.set_turn_on_time(t);
        sim.add_point_source(p);
      }

      // Button which pauses/unpauses the simulation
      let pauseButton = PauseButton(
        document.getElementById(
          "line-source-heatmap-pause-button",
        ) as HTMLElement,
        scene,
      );

      scene.draw();

      // Start playing
      scene.play(undefined);
    })(200, 200);
  });
})();
