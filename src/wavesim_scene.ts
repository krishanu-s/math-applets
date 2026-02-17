// Testing the direct feeding of a pixel array to the canvas
import {
  MObject,
  Scene,
  prepare_canvas,
  clamp,
  sigmoid,
  linspace,
  funspace,
  delay,
  Dot,
  Sector,
  Rectangle,
  Line,
  LineSequence,
  DraggableDot,
  DraggableRectangle,
  Arrow,
  LineSpring,
  Vec2D,
  vec2_norm,
  vec2_sum,
  vec2_sub,
  vec2_scale,
  vec2_rot,
  vec2_normalize,
  vec2_angle,
  vec2_sum_list,
} from "./lib/base";
import { Slider, Button } from "./lib/interactive";
import { SceneViewTranslator } from "./lib/interactive/scene_view_translator";
import { ParametricFunction } from "./lib/base/bezier.js";
import { HeatMap } from "./lib/base/heatmap";
import {
  PointSourceOneDim,
  PointSource,
  WaveSimOneDim,
  WaveSimOneDimScene,
  WaveSimTwoDim,
  WaveSimTwoDimEllipticReflector,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimThreeDScene,
  WaveSimTwoDimPointsHeatmapScene,
} from "./lib/simulator/wavesim.js";
import { SpringSimulator, StateSimulator } from "./lib/simulator/statesim.js";
import { InteractivePlayingThreeDScene } from "./lib/simulator/sim.js";
import { Dot3D, DraggableDot3D, Line3D } from "./lib/three_d";
import { ThreeDScene } from "./lib/three_d/scene.js";
import { rot, Vec3D } from "./lib/three_d/matvec.js";
import { Arcball } from "./lib/interactive/arcball.js";
import { SceneFromSimulator, InteractiveHandler } from "./lib/simulator/sim";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // *** INTRODUCTION SECTION ***
    // Demonstration of wave propagation in two dimensions. This particular one shows a dipole.
    (function twodim_dipole_demo() {
      let name = "twodim-dipole-demo";
      // Prepare the canvas and scene
      let width = 200;
      let height = 200;
      const dt = 0.02;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Create ImageData object
      const imageData = ctx.createImageData(width, height);

      // Create the simulator
      let waveSim = new WaveSimTwoDim(width, height, dt);
      waveSim.wave_propagation_speed = 0.1 * width;

      // Create a dipole
      let a = 5.0;
      let w = 5.0;
      let distance = 2.0;
      waveSim.add_point_source(
        new PointSource(
          Math.floor(0.5 * (1 + distance / (xmax - xmin)) * width),
          Math.floor(height / 2),
          a,
          w,
          Math.PI,
        ),
      );
      waveSim.add_point_source(
        new PointSource(
          Math.floor(0.5 * (1 - distance / (xmax - xmin)) * width),
          Math.floor(height / 2),
          a,
          w,
          0.0,
        ),
      );

      // Set PML layers
      waveSim.set_pml_layer(true, true, 0.2, 200.0);
      waveSim.set_pml_layer(true, false, 0.2, 200.0);
      waveSim.set_pml_layer(false, true, 0.2, 200.0);
      waveSim.set_pml_layer(false, false, 0.2, 200.0);

      let handler = new InteractiveHandler(waveSim);

      // Initialize the scene
      let waveEquationScene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height,
      );
      waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      handler.add_scene(waveEquationScene);

      // Make a slider which controls the dipole distance
      let w_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (d: number) {
          handler.add_to_queue(() => {
            waveSim.point_sources[0].set_x(
              Math.floor(0.5 * (1 + d / (xmax - xmin)) * width),
            );
            waveSim.point_sources[1].set_x(
              Math.floor(0.5 * (1 - d / (xmax - xmin)) * width),
            );
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

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-clear-button") as HTMLElement,
        function () {
          handler.add_to_queue(waveSim.reset.bind(waveSim));
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      // Set up the simulation
      waveSim.set_boundary_conditions(waveSim.vals, 0);
      handler.draw();

      // Start the simulation when unpaused
      handler.play(undefined);
    })();

    // This demonstration shows an example of light propagation in a two-dimensional medium using
    // the ray model. More precisely, it shows how light rays emanating from the focus of a conic section
    // bounce off the conic.
    (async function conic_rays() {
      // Prepare the canvas
      let canvas = prepare_canvas(200, 200, "conic-rays");

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Make the scene
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
            );
          } else if (this.eccentricity == 1) {
            let curve = new ParametricFunction(
              this.polar_function.bind(this),
              -Math.PI + 0.01,
              Math.PI - 0.01,
              50,
            );
            curve.mode = "jagged";
            return curve;
          } else {
            return new MObject();
          }
        }
        // Makes dots for the foci
        make_focus(): Dot {
          return new Dot(this.focus, 0.2);
        }
        make_other_focus(): MObject {
          if (this.eccentricity >= 1.0) {
            return new MObject();
          } else {
            return new Dot(this.other_focus as Vec2D, 0.1);
          }
        }
        make_trajectory(t: number): [MObject, MObject] {
          if (this.eccentricity >= 1.0) {
            return [new MObject(), new MObject()];
          } else {
            let intersection_point = this.polar_function(t);
            return [
              new Line(this.focus, intersection_point).set_stroke_width(0.04),
              new Line(
                intersection_point,
                this.other_focus as Vec2D,
              ).set_stroke_width(0.04),
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
      let num_trajectories = 20;
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
          let dot = new Dot(focus, 0.05);
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
                  0.3,
                  thetas[i] - Math.PI / 2,
                  thetas[i] + Math.PI / 2,
                );
                effect.set_color("red");
                scene.add(`c_${i}`, effect);

                // Set new trajectory angle after reflection
                if (conic.eccentricity == 1) {
                  current_thetas[i] = Math.PI;
                } else {
                  // TODO If we want to be honest, we could calculate the angle in a more robust way, using local partial derivatives of the curve.
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

    // *** ZERO-DIMENSIONAL WAVE EQUATION ***
    // This is the zero-dimensional case of the wave equation. A point mass connected to a spring
    // oscillates in one direction according to Hooke's law.
    (function point_mass_spring(width: number, height: number) {
      // Prepare the canvases
      let canvas_spring = prepare_canvas(width, height, "point-mass-spring");
      let canvas_graph = prepare_canvas(width, height, "point-mass-graph");

      let xmin = -4;
      let xmax = 4;
      let tmin = 0;
      let tmax = 15;
      let ymin = -4;
      let ymax = 4;
      let w = 5;

      // Make the simulator with reset condition
      class SpringSim extends SpringSimulator {
        reset() {
          super.reset();
          sim.set_vals([1, 0]);
        }
      }
      let sim = new SpringSim(w, 0.01);
      sim.set_vals([1, 0]);
      let handler = new InteractiveHandler(sim);

      // Add the two scenes, with callbacks
      class GraphScene extends SceneFromSimulator {
        step_counter: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas);
          this.set_frame_lims([tmin, tmax], [xmin, xmax]);
          this.add(
            "t-axis",
            new Line([tmin, 0], [tmax, 0])
              .set_stroke_width(0.05)
              .set_stroke_color("gray"),
          );
          let tick_size = 0.2;
          for (let i = 1; i <= tmax; i++) {
            this.add(
              `t-axis-${i}`,
              new Line([i, -tick_size / 2], [i, tick_size / 2])
                .set_stroke_width(0.05)
                .set_stroke_color("gray"),
            );
          }
          for (let i = -4; i <= 4; i++) {
            this.add(
              `y-axis-${i}`,
              new Line([0, i], [tick_size, i])
                .set_stroke_width(0.05)
                .set_stroke_color("gray"),
            );
          }
          this.add(
            "graph",
            new LineSequence([
              [0, sim.get_vals()[0] as number],
            ]).set_stroke_width(0.05),
          );
          this.draw();
        }
        reset() {
          this.remove("graph");
          this.add(
            "graph",
            new LineSequence([
              [0, sim.get_vals()[0] as number],
            ]).set_stroke_width(0.05),
          );
        }
        update_mobjects_from_simulator(simulator: SpringSimulator) {
          let vals = simulator.get_vals();
          let time = simulator.time;
          this.step_counter += 1;
          // Implement update logic, calling from the simulator
          if (this.step_counter % 5 === 0 && time < this.xlims[1]) {
            (this.get_mobj("graph") as LineSequence).add_point([
              time,
              vals[0] as number,
            ]);
          }
        }
      }
      let graph_scene = new GraphScene(canvas_graph);

      class SpringScene extends SceneFromSimulator {
        arrow_length_scale: number = w / 3;
        arrow_height: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas);
          // TODO Set coordinates in terms of scene frame limits
          let eq_line = new Line([0, -5], [0, 5])
            .set_stroke_width(0.05)
            .set_stroke_style("dashed")
            .set_stroke_color("gray");
          let spring = new LineSpring([-3, 0], [0, 0]).set_stroke_width(0.08);
          spring.set_eq_length(3.0);
          let anchor = new Rectangle([-3, 0], 0.15, 4);

          // While the scene is paused, the point mass is an interactive element which can be dragged
          // to update the simulator state. While the scene is unpaused, the simulator runs and updates
          // the state of the point mass.
          let mass = new DraggableRectangle([0, 0], 0.6, 0.6);
          mass.draggable_x = true;
          mass.draggable_y = false;

          let force_arrow = new Arrow(
            [0, this.arrow_height],
            [0, this.arrow_height],
          )
            .set_stroke_width(0.1)
            .set_stroke_color("red");
          // let velocity_arrow = new Arrow();

          this.add("eq_line", eq_line);
          this.add("spring", spring);
          this.add("anchor", anchor);
          this.add("mass", mass);
          // this.add("velocity_arrow", velocity_arrow);
          this.add("force_arrow", force_arrow);

          this.add_callbacks();
        }
        // Callback which affects the simulator and is removed when simulation is paused
        add_callbacks() {
          let mass = this.get_mobj("mass") as DraggableRectangle;
          mass.add_callback(() => {
            sim.set_vals([mass.get_center()[0], 0]);
            this.update_mobjects_from_simulator(sim);
          });
        }
        set_spring_mode(mode: "color" | "spring") {
          let spring = this.get_mobj("spring") as LineSpring;
          spring.set_mode(mode);
        }
        set_spring_stiffness(val: number) {
          this.arrow_length_scale = val / 3;
        }
        // TODO Add turn on/off of draggability.
        // Updates all mobjects to account for the new simulator state
        update_mobjects_from_simulator(simulator: SpringSimulator) {
          let vals = simulator.get_vals() as Vec2D;
          this._update_mass(vals);
          this._update_spring(vals);
          this._update_force_arrow(vals);
        }
        // Specific to this scene and simulator
        _update_mass(vals: Vec2D) {
          (this.get_mobj("mass") as Rectangle).move_to([vals[0], 0]);
        }
        _update_spring(vals: Vec2D) {
          (this.get_mobj("spring") as LineSpring).move_end([vals[0], 0]);
        }
        _update_force_arrow(vals: Vec2D) {
          let force_arrow = this.get_mobj("force_arrow") as Arrow;
          force_arrow.move_start([vals[0], this.arrow_height]);
          force_arrow.move_end([
            vals[0] * (1 - this.arrow_length_scale),
            this.arrow_height,
          ]);
          force_arrow.set_arrow_size(
            Math.min(0.5, Math.sqrt(Math.abs(vals[0])) / 2),
          );
        }
        // Enforce strict order on drawing mobjects, overriding subclass behavior
        _draw() {
          this.draw_mobject(this.get_mobj("eq_line") as Line);
          this.draw_mobject(this.get_mobj("anchor") as Rectangle);
          this.draw_mobject(this.get_mobj("spring") as LineSpring);
          this.draw_mobject(this.get_mobj("mass") as Rectangle);
          this.draw_mobject(this.get_mobj("force_arrow") as Arrow);
        }
        draw_mobject(mobj: MObject) {
          mobj.draw(this.canvas, this);
        }
      }
      let spring_scene = new SpringScene(canvas_spring);
      spring_scene.set_spring_mode("spring");
      spring_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      handler.add_scene(graph_scene);
      handler.add_scene(spring_scene);

      // Button which pauses/unpauses the simulation
      let pausebutton = handler.add_pause_button(
        document.getElementById(
          "point-mass-spring-pause-button",
        ) as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(
          "point-mass-spring-reset-button",
        ) as HTMLElement,
        function () {
          handler.add_to_queue(handler.reset.bind(handler));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById("point-mass-stiffness-slider") as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "stiffness", val),
          );
          handler.add_to_queue(
            spring_scene.set_spring_stiffness.bind(spring_scene, val),
          );
          handler.add_to_queue(
            spring_scene.update_mobjects_from_simulator.bind(
              spring_scene,
              handler.simulator as SpringSimulator,
            ),
          );
          handler.add_to_queue(handler.draw.bind(handler));
        },
        {
          name: "Spring stiffness",
          initial_value: `${sim.stiffness}`,
          min: 0,
          max: 20,
          step: 0.01,
        },
      );

      // Slider which controls friction
      let f_slider = Slider(
        document.getElementById("point-mass-damping-slider") as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "friction", val),
          );
        },
        {
          name: "Friction",
          initial_value: "0.0",
          min: 0,
          max: 5.0,
          step: 0.01,
        },
      );

      handler.draw();
      handler.play(undefined);
    })(300, 300);

    // One-dimensional case of the wave equation. A sequence of point masses (say, 5-10)
    // connected in a horizontal line, oscillating vertically.
    // - TODO Add line segments showing the displacements from the equilibrium position.
    // - TODO Add a reset button to reset the simulation.
    (function point_mass_discrete_sequence(
      width: number,
      height: number,
      num_points: number,
    ) {
      // Prepare the canvas
      let canvas = prepare_canvas(
        width,
        height,
        "point-mass-discrete-sequence",
      );

      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }

      // Prepare the simulator
      class WaveSimulator extends WaveSimOneDim {
        reset() {
          super.reset();
          this.set_uValues(
            funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points),
          );
          this.set_vValues(funspace((x) => 0, 0, 1, num_points));
        }
      }

      let w = 3.0;
      let sim = new WaveSimOneDim(num_points, 0.01);
      sim.set_attr("wave_propagation_speed", w);
      sim.reset = function () {
        this.time = 0;
        this.set_uValues(
          funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points),
        );
        this.set_vValues(funspace((x) => 0, 0, 1, num_points));
      };
      sim.reset();

      // Prepare the handler
      let handler = new InteractiveHandler(sim);

      // Prepare the scene and add
      class WaveScene extends WaveSimOneDimScene {
        constructor(canvas: HTMLCanvasElement, num_points: number) {
          super(canvas, num_points);
          for (let i = 0; i < num_points; i++) {
            let mass = this.get_mobj(`p_${i + 1}`) as DraggableDot;
            this.add_callback(i, mass);
          }
        }
        add_callback(i: number, mass: DraggableDot) {
          let self = this;
          if (i == 0) {
            mass.add_callback(() => {
              sim.set_left_endpoint(mass.get_center()[1]);
            });
          }
          if (i == width - 1) {
            mass.add_callback(() => {
              sim.set_right_endpoint(mass.get_center()[1]);
            });
          }
          mass.add_callback(() => {
            let vals = sim.get_vals();
            vals[i] = mass.get_center()[1];
            vals[i + this.width] = 0;
            sim.set_vals(vals);
            self.update_mobjects_from_simulator(sim);
          });
        }
      }
      let scene = new WaveScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.1);
      handler.add_scene(scene);

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(
          "point-mass-discrete-sequence-pause-button",
        ) as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(
          "point-mass-discrete-sequence-reset-button",
        ) as HTMLElement,
        function () {
          handler.add_to_queue(handler.reset.bind(handler));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Slider which controls friction
      let f_slider = Slider(
        document.getElementById(
          "point-mass-discrete-sequence-friction-slider",
        ) as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "damping", val),
          );
        },
        {
          name: "Friction",
          initial_value: "0.0",
          min: 0,
          max: 5.0,
          step: 0.01,
        },
      );

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(
          "point-mass-discrete-sequence-stiffness-slider",
        ) as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(
              handler,
              0,
              "wave_propagation_speed",
              val,
            ),
          );
          handler.add_to_queue(
            scene.set_arrow_length_scale.bind(scene, val / 2),
          );
          handler.add_to_queue(
            scene.update_mobjects_from_simulator.bind(
              scene,
              handler.simulator as WaveSimulator,
            ),
          );
          handler.add_to_queue(handler.draw.bind(handler));
        },
        {
          name: "Spring stiffness",
          initial_value: `${w}`,
          min: 0,
          max: 20,
          step: 0.05,
        },
      );

      // Prepare the simulation
      handler.draw();
      handler.play(undefined);
    })(300, 300, 10);

    // Use the same scene as before, but with a large number of point masses (say, 50) drawn
    // as a Bezier-curve.
    (function point_mass_continuous_sequence(
      width: number,
      height: number,
      num_points: number,
    ) {
      // Prepare the canvas
      let canvas = prepare_canvas(
        width,
        height,
        "point-mass-continuous-sequence",
      );

      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }

      // Prepare the simulator
      class WaveSimulator extends WaveSimOneDim {
        reset() {
          super.reset();
          this.set_uValues(
            funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points),
          );
          this.set_vValues(funspace((x) => 0, 0, 1, num_points));
        }
      }

      let w = 3.0;
      let sim = new WaveSimOneDim(num_points, 0.01);
      sim.reset();
      sim.set_attr("wave_propagation_speed", 3.0);
      sim.set_attr("damping", 0.05);
      sim.set_attr("dt", 0.05);
      sim.reset = function () {
        this.time = 0;
        this.set_uValues(
          funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points),
        );
        this.set_vValues(funspace((x) => 0, 0, 1, num_points));
      };
      sim.reset();

      // Prepare the handler
      let handler = new InteractiveHandler(sim);

      // Prepare the scene and add
      class WaveScene extends WaveSimOneDimScene {
        constructor(canvas: HTMLCanvasElement, num_points: number) {
          super(canvas, num_points);
          for (let i = 0; i < num_points; i++) {
            let mass = this.get_mobj(`p_${i + 1}`) as DraggableDot;
            this.add_callback(i, mass);
          }
        }
        add_callback(i: number, mass: DraggableDot) {
          let self = this;
          if (i == 0) {
            mass.add_callback(() => {
              sim.set_left_endpoint(mass.get_center()[1]);
            });
          }
          if (i == width - 1) {
            mass.add_callback(() => {
              sim.set_right_endpoint(mass.get_center()[1]);
            });
          }
          mass.add_callback(() => {
            let vals = sim.get_vals();
            vals[i] = mass.get_center()[1];
            vals[i + this.width] = 0;
            sim.set_vals(vals);
            self.update_mobjects_from_simulator(sim);
          });
        }
      }
      let scene = new WaveScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.05);
      scene.set_arrow_length_scale(0.05);
      handler.add_scene(scene);

      // Add SceneViewTranslator
      // ** NOTE that this must come after all objects have been added to the scene.
      let translator = new SceneViewTranslator(scene);
      translator.add();

      // Slider which controls the zoom
      let zoom_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-zoom-slider",
        ) as HTMLElement,
        function (zr: number) {
          handler.add_to_queue(() => {
            scene.zoom_in_on(zr / scene.zoom_ratio, scene.get_view_center());
            if (zr > 3) {
              scene.set_mode("dots");
            } else {
              scene.set_mode("curve");
            }
            scene.update_mobjects_from_simulator(sim);
            scene.draw();
          });
        },
        {
          name: "Zoom ratio",
          initial_value: "1.0",
          min: 0.6,
          max: 5,
          step: 0.05,
        },
      );

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(
          "point-mass-continuous-sequence-pause-button",
        ) as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(
          "point-mass-continuous-sequence-reset-button",
        ) as HTMLElement,
        function () {
          handler.add_to_queue(handler.reset.bind(handler));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Slider which controls friction
      let f_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-friction-slider",
        ) as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "damping", val),
          );
        },
        {
          name: "Friction",
          initial_value: "0.0",
          min: 0,
          max: 5.0,
          step: 0.01,
        },
      );

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-stiffness-slider",
        ) as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(
              handler,
              0,
              "wave_propagation_speed",
              val,
            ),
          );
          handler.add_to_queue(
            scene.set_arrow_length_scale.bind(scene, val / 2),
          );
          handler.add_to_queue(
            scene.update_mobjects_from_simulator.bind(
              scene,
              handler.simulator as WaveSimulator,
            ),
          );
          handler.add_to_queue(handler.draw.bind(handler));
        },
        {
          name: "Spring stiffness",
          initial_value: `${w}`,
          min: 0,
          max: 20,
          step: 0.05,
        },
      );

      // Prepare the simulation
      handler.draw();
      handler.play(undefined);
    })(300, 300, 50);

    // - A one-dimensional wave example with PML at the ends, where a point in the middle
    // is a timelike wave-source. Demonstrates how the timelike oscillation becomes spacelike oscillation.
    // - A one-dimensional example bounded at both endpoints with an impulse wave traveling back
    // and forth. Demonstrates how a zero-point acts as a reflector.
    (function wavesim_one_dimensional_demo_impulse(
      width: number,
      height: number,
      num_points: number,
    ) {
      const name = "wavesim-1d-impulse";
      // Prepare the canvas
      let canvas = prepare_canvas(width, height, name);

      // Initial conditions
      const sigma = 0.1;
      const mu = 0.5;
      const a = 2.0;
      function pulse(x: number): number {
        return a * Math.exp(-((x - mu) ** 2 / sigma ** 2));
      }
      function pulse_deriv(x: number): number {
        return ((-2 * (x - mu)) / sigma ** 2) * pulse(x);
      }

      // Prepare the simulator
      let sim = new WaveSimOneDim(num_points, 0.01);
      sim.set_attr("wave_propagation_speed", 5.0);
      sim.set_attr("damping", 0.0);
      sim.set_attr("dt", 0.02);
      sim.reset = function () {
        sim.time = 0;
        sim.set_uValues(funspace((x) => pulse(x) - pulse(1), 0, 1, num_points));
        sim.set_vValues(
          funspace((x) => -0.1 * pulse_deriv(x), 0, 1, num_points),
        );
      };
      sim.reset();

      // Prepare the handler
      let handler = new InteractiveHandler(sim);

      // Prepare the scene and add
      let scene = new WaveSimOneDimScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.05);
      scene.include_arrows = false;
      handler.add_scene(scene);

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );
      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          handler.add_to_queue(handler.reset.bind(handler));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Prepare the simulation
      handler.draw();
      handler.play(undefined);
    })(300, 300, 50);
    (function wavesim_one_dimensional_demo_pml(
      width: number,
      height: number,
      num_points: number,
    ) {
      const name = "wavesim-1d-pml";
      // Prepare the canvas
      let canvas = prepare_canvas(width, height, name);

      // Set the attributes of the simulator
      let sim = new WaveSimOneDim(num_points, 0.01);
      sim.set_attr("wave_propagation_speed", 3.0);
      sim.set_attr("damping", 0.0);
      sim.set_pml_layer(true, 0.3, 100);
      sim.set_pml_layer(false, 0.3, 100);
      sim.set_attr("dt", 0.02);
      sim.add_point_source(new PointSourceOneDim(num_points / 2, 3.0, 1.0, 0));
      sim.reset = function () {
        sim.time = 0;
        sim.set_uValues(funspace((x) => 0, 0, 1, num_points));
        sim.set_vValues(funspace((x) => 0, 0, 1, num_points));
      };
      sim.reset();

      // Prepare the handler
      let handler = new InteractiveHandler(sim);

      // Prepare the scene and add
      let scene = new WaveSimOneDimScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("curve");
      scene.set_dot_radius(0.05);
      scene.include_arrows = false;
      handler.add_scene(scene);

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );
      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          handler.add_to_queue(handler.reset.bind(handler));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Prepare the simulation
      handler.draw();
      handler.play(undefined);
    })(300, 300, 60);

    // *** TWO-DIMENSIONAL WAVE EQUATION ***
    // A 2D lattice of point masses, oscillating along a third dimension.
    (function point_mass_discrete_lattice(width: number, height: number) {
      // Prepare the canvas and context for drawing
      let canvas = prepare_canvas(width, height, "point-mass-discrete-lattice");

      // Parameters
      let xmin = -5;
      let xmax = 5;
      let ymin = -5;
      let ymax = 5;
      let total_arr_width = 21;
      let total_arr_height = 21;
      let shown_arr_width = 15;
      let shown_arr_height = 15;

      // Prepare the simulator and scene
      let sim = new WaveSimTwoDim(total_arr_width, total_arr_height, 0.01);
      sim.set_attr("wave_propagation_speed", 5.0);
      sim.remove_pml_layers();

      // Set some initial values in the simulation
      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      function foo2(x: number, y: number): number {
        return (foo(x) - foo(1)) * (foo(y) - foo(1));
      }
      function reset_simulation() {
        let vals = new Array(4 * total_arr_width * total_arr_height).fill(0);
        for (let i = 0; i < total_arr_width; i++) {
          for (let j = 0; j < total_arr_height; j++) {
            vals[sim.index(i, j)] =
              5 * foo2(i / (total_arr_width - 1), j / (total_arr_height - 1));
          }
        }
        sim.set_vals(vals);
      }
      reset_simulation();

      // Set boundary conditions
      for (let i = 0; i < total_arr_width; i++) {
        sim.add_point_source(new PointSource(i, 0, 0, 0, 0));
        sim.add_point_source(new PointSource(i, total_arr_height - 1, 0, 0, 0));
      }
      for (let j = 1; j < total_arr_height - 1; j++) {
        sim.add_point_source(new PointSource(0, j, 0, 0, 0));
        sim.add_point_source(new PointSource(total_arr_width - 1, j, 0, 0, 0));
      }

      // Set up the main scene which is interactive
      let zoom_ratio = 1.0;
      let scene = new WaveSimTwoDimThreeDScene(
        canvas,
        sim,
        shown_arr_width,
        shown_arr_height,
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.camera.move_to([0, 0, -10]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        (2 * Math.PI) / 3,
      );
      scene.set_rotation_speed(0.15);

      // Set up the second scene which is a heatmap version
      let second_canvas = prepare_canvas(
        width,
        height,
        "point-mass-discrete-lattice-heatmap",
      );
      let second_scene = new WaveSimTwoDimPointsHeatmapScene(
        second_canvas,
        shown_arr_width,
        shown_arr_height,
      );
      second_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      second_scene.update_mobjects_from_simulator(sim);
      scene.add_linked_scene(second_scene);

      // Button which pauses/unpauses the simulation
      let pauseButton = scene.add_pause_button(
        document.getElementById(
          "point-mass-discrete-lattice-pause-button",
        ) as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(
          "point-mass-discrete-lattice-reset-button",
        ) as HTMLElement,
        function () {
          scene.add_to_queue(() => {
            reset_simulation();
            scene.update_and_draw_linked_scenes();
            scene.draw();
          });
        },
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";

      scene.draw();
      second_scene.draw();

      scene.play(undefined);
    })(300, 300);

    (function wave_sim_2d_point_source(width: number, height: number) {
      const dt = 0.02;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

      const name = "wavesim-2d-point-source";

      let canvas = prepare_canvas(width, height, name);

      // Create ImageData object
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);

      // Create the simulator
      let sim = new WaveSimTwoDim(width, height, dt);
      sim.wave_propagation_speed = 0.1 * width;

      // Create a point source
      let a = 5.0;
      let w = 8.0;
      sim.add_point_source(
        new PointSource(
          Math.floor(0.5 * width),
          Math.floor(0.5 * height),
          w,
          a,
          0,
        ),
      );

      // Create a handler
      let handler = new InteractiveHandler(sim);

      // Initialize the scene
      let scene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height,
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.draw();
      handler.add_scene(scene);

      // Make a slider which controls the frequency
      let w_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (val: number) {
          handler.add_to_queue(() => {
            sim.point_sources[0].set_w(val);
          });
        },
        {
          name: "Frequency",
          initial_value: "5.0",
          min: 2.0,
          max: 20.0,
          step: 0.05,
        },
      );

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      handler.draw();
      handler.play(undefined);
    })(250, 250);

    (function wave_sim_2d_point_source_conic(width: number, height: number) {
      const dt = 0.01;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

      const name = "wavesim-2d-point-source-conic";

      let canvas = prepare_canvas(width, height, name);

      // Create ImageData object
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);

      // Create the simulator
      let sim = new WaveSimTwoDimEllipticReflector(width, height, dt);
      sim.wave_propagation_speed = 0.1 * width;
      sim.set_attr("w", 6.0);
      sim.remove_pml_layers();

      // Create a handler
      let handler = new InteractiveHandler(sim);

      // Initialize the scene
      let conic = new ParametricFunction(
        (t) => [
          (sim.semimajor_axis / width) * (xmax - xmin) * Math.cos(t),
          (sim.semiminor_axis / height) * (ymax - ymin) * Math.sin(t),
        ],
        0,
        Math.PI * 2,
        30,
      );
      conic.set_stroke_width(0.03);
      conic.set_alpha(0.5);
      let scene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height,
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.add("conic", conic);
      scene.draw();
      handler.add_scene(scene);

      // Make a slider which controls the eccentricity
      let e_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (val: number) {
          handler.add_to_queue(() => {
            sim.set_attr("semiminor_axis", val);
            conic.set_function((t) => [
              (sim.semimajor_axis / width) * (xmax - xmin) * Math.cos(t),
              (val / height) * (ymax - ymin) * Math.sin(t),
            ]);
            scene.draw();
          });
        },
        {
          name: "Vertical size",
          initial_value: "60",
          min: 30,
          max: 100,
          step: 1,
        },
      );

      // Make a slider which controls the frequency
      let w_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (val: number) {
          handler.add_to_queue(() => {
            sim.set_attr("w", val);
          });
        },
        {
          name: "Frequency",
          initial_value: "6.0",
          min: 3.0,
          max: 10.0,
          step: 0.05,
        },
      );

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      handler.draw();
      handler.play(undefined);
    })(250, 250);

    (function wave_sim_2d_doubleslit(width: number, height: number) {
      const dt = 0.02;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

      const name = "wavesim-2d-doubleslit";

      let canvas = prepare_canvas(width, height, name);

      // Create ImageData object
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);

      // Create the simulator
      let sim = new WaveSimTwoDim(width, height, dt);
      sim.wave_propagation_speed = 0.1 * width;

      // *** Set up the double slit experiment
      sim.remove_pml_layers();
      sim.set_pml_layer(true, true, 0.2, 200.0);
      sim.set_pml_layer(true, false, 0.2, 200.0);
      sim.set_pml_layer(false, true, 0.2, 200.0);

      // Create a plane wave at the top
      let a = 4.0;
      let w = 8.0;
      for (let x = 0; x < width; x++) {
        sim.add_point_source(new PointSource(x, 0, w, a, 0));
      }

      // Set up two slits by putting reflectors everywhere else on a horizontal line
      let slit_dist = 0.2;
      let slit_width = 0.02;
      let wall_height = 0.1;
      function make_apertures(
        slit_dist: number,
        slit_width: number,
      ): Array<PointSource> {
        let sources: Array<PointSource> = [];
        for (let x = 0; x < width; x++) {
          if (Math.abs(x / width - (0.5 - slit_dist / 2)) < slit_width) {
          } else if (Math.abs(x / width - (0.5 + slit_dist / 2)) < slit_width) {
          } else {
            sources.push(
              new PointSource(x, Math.floor(height * wall_height), 0, 0, 0),
            );
          }
        }
        return sources;
      }
      let sources = make_apertures(slit_dist, slit_width);
      for (let source of sources) {
        sim.add_point_source(source);
      }

      // Create a handler
      let handler = new InteractiveHandler(sim);

      // Initialize the scene
      let scene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height,
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.draw();
      handler.add_scene(scene);

      // Make a slider which controls the slit distance (need to fix this!)
      // let w_slider = Slider(
      //   document.getElementById(name + "-slider-1") as HTMLElement,
      //   function (val: number) {
      //     scene.add_to_queue(() => {
      //       let sim = scene.get_simulator();
      //       sim.get_
      //       while (Object.keys(sim.point_sources).length > width) {
      //         sim.remove_point_source(width);
      //       }
      //       for (let source of make_apertures(val, slit_width)) {
      //         sim.add_point_source(source);
      //       }
      //     });
      //   },
      //   {
      //     name: "Distance between point sources",
      //     initial_value: "4.0",
      //     min: 1.0,
      //     max: 9.0,
      //     step: 0.05,
      //   },
      // );
      // w_slider.width = 200;

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      handler.draw();
      handler.play(undefined);
    })(250, 250);
  });
})();
