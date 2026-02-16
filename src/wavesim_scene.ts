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
import { SceneViewTranslator } from "./lib/scene_view_translator.js";
import { ParametricFunction } from "./lib/bezier.js";
import { HeatMap } from "./lib/heatmap.js";
import {
  PointSourceOneDim,
  PointSource,
  WaveSimOneDim,
  WaveSimOneDimScene,
  WaveSimOneDimInteractiveScene,
  WaveSimTwoDim,
  WaveSimTwoDimEllipticReflector,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimThreeDScene,
  WaveSimTwoDimPointsHeatmapScene,
} from "./lib/simulator/wavesim.js";
import { SpringSimulator, StateSimulator } from "./lib/simulator/statesim.js";
import {
  InteractivePlayingScene,
  InteractivePlayingThreeDScene,
} from "./lib/simulator/sim.js";
import { Dot3D, DraggableDot3D, Line3D } from "./lib/three_d";
import { ThreeDScene } from "./lib/three_d/scene.js";
import { rot, Vec3D } from "./lib/three_d/matvec.js";
import { Arcball } from "./lib/interactive/arcball.js";
import { SceneFromSimulator } from "./lib/interactive_handler.js";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // *** INTRODUCTION SECTION ***
    // Demonstration of wave propagation in two dimensions. This particular one shows a dipole.
    (function twodim_dipole_demo() {
      // Prepare the canvas and scene
      let width = 200;
      let height = 200;
      const dt = 0.02;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;

      let canvas = prepare_canvas(width, height, "twodim-dipole-demo");

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

      // Initialize the scene
      let waveEquationScene = new WaveSimTwoDimHeatMapScene(
        canvas,
        waveSim,
        imageData,
      );
      waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Make a slider which controls the dipole distance
      let w_slider = Slider(
        document.getElementById("twodim-dipole-demo-slider-1") as HTMLElement,
        function (d: number) {
          waveEquationScene.add_to_queue(() => {
            let sim = waveEquationScene.get_simulator();
            sim.point_sources[0].set_x(
              Math.floor(0.5 * (1 + d / (xmax - xmin)) * width),
            );
            sim.point_sources[1].set_x(
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
      let pauseButton = waveEquationScene.add_pause_button(
        document.getElementById(
          "twodim-dipole-demo-pause-button",
        ) as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(
          "twodim-dipole-demo-clear-button",
        ) as HTMLElement,
        function () {
          waveEquationScene.add_to_queue(
            waveEquationScene.reset.bind(waveEquationScene),
          );
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      // Set up the simulation
      waveEquationScene
        .get_simulator()
        .set_boundary_conditions(waveSim.vals, 0);
      waveEquationScene.draw();

      // Start the simulation when unpaused
      waveEquationScene.play(undefined);
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

      // Make the scene with the graph
      let scene_graph = new Scene(canvas_graph);
      scene_graph.set_frame_lims([tmin, tmax], [xmin, xmax]);
      scene_graph.add(
        "t-axis",
        new Line([tmin, 0], [tmax, 0])
          .set_stroke_width(0.05)
          .set_stroke_color("gray"),
      );
      let tick_size = 0.2;
      for (let i = 1; i <= tmax; i++) {
        scene_graph.add(
          `t-axis-${i}`,
          new Line([i, -tick_size / 2], [i, tick_size / 2])
            .set_stroke_width(0.05)
            .set_stroke_color("gray"),
        );
      }
      for (let i = -4; i <= 4; i++) {
        scene_graph.add(
          `y-axis-${i}`,
          new Line([0, i], [tick_size, i])
            .set_stroke_width(0.05)
            .set_stroke_color("gray"),
        );
      }

      // Extension of spring simulator which increments graph
      class SpringSim extends SpringSimulator {
        step_counter: number = 0;
        constructor(stiffness: number, dt: number) {
          super(stiffness, dt);
          scene_graph.add(
            "graph",
            new LineSequence([
              [this.time, this.get_vals()[0]],
            ]).set_stroke_width(0.05),
          );
          scene_graph.draw();
        }
        step() {
          super.step();
          this.step_counter++;
          if (this.step_counter % 5 === 0 && this.time < scene_graph.xlims[1]) {
            (scene_graph.get_mobj("graph") as LineSequence).add_point([
              this.time,
              this.get_vals()[0],
            ]);
            scene_graph.draw();
          }
        }
      }

      class SpringScene extends InteractivePlayingScene {
        arrow_length_scale: number = 1.5;
        arrow_height: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas, [new SpringSim(3.0, 0.01)]);
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
          mass.add_callback(() => {
            let sim = this.get_simulator() as StateSimulator;
            sim.set_vals([mass.get_center()[0], 0]);
          });

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
        }
        set_spring_mode(mode: "color" | "spring") {
          let spring = this.get_mobj("spring") as LineSpring;
          spring.set_mode(mode);
        }
        set_spring_stiffness(val: number) {
          this.set_simulator_attr(0, "stiffness", val);
          this.arrow_length_scale = val / 3;
          scene.draw();
        }
        set_friction(val: number) {
          this.set_simulator_attr(0, "friction", val);
        }
        toggle_pause() {
          if (this.paused) {
            let mass = this.get_mobj("mass") as DraggableRectangle;
            mass.draggable_x = false;
          } else {
            let mass = this.get_mobj("mass") as DraggableRectangle;
            mass.draggable_x = true;
          }
          super.toggle_pause();
        }
        // Updates all mobjects to account for the new simulator state
        update_mobjects() {
          let [u, v] = this.get_simulator(0).get_vals() as Vec2D;

          let mass = this.get_mobj("mass") as Rectangle;
          mass.move_to([u, 0]);

          let spring = this.get_mobj("spring") as Line;
          spring.move_end([u, 0]);

          let force_arrow = this.get_mobj("force_arrow") as Arrow;
          force_arrow.move_start([u, this.arrow_height]);
          force_arrow.move_end([
            u * (1 - this.arrow_length_scale),
            this.arrow_height,
          ]);
          force_arrow.set_arrow_size(Math.min(0.5, Math.sqrt(Math.abs(u)) / 2));
        }
        // Enforce strict order on drawing mobjects, overriding subclass behavior
        _draw() {
          this.update_mobjects();
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

      // Make the scene and set initial conditions
      let scene = new SpringScene(canvas_spring);
      scene.set_spring_stiffness(5.0);
      scene.set_simulator_attr(0, "dt", 0.01);
      scene.set_simulator_attr(0, "damping", 0.0);
      scene.set_spring_mode("spring");
      let sim = scene.get_simulator();
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      sim.set_vals([1, 0]);

      // Reset the simulation
      function reset_simulation() {
        sim.time = 0;
        sim.set_vals([1, 0]);
        scene_graph.remove("graph");
        scene_graph.add(
          "graph",
          new LineSequence([[sim.time, sim.get_vals()[0]]]).set_stroke_width(
            0.05,
          ),
        );
        scene_graph.draw();
        scene.draw();
      }

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById("point-mass-stiffness-slider") as HTMLElement,
        function (val: number) {
          scene.add_to_queue(scene.set_spring_stiffness.bind(scene, val));
        },
        {
          name: "Spring stiffness",
          initial_value: "3.0",
          min: 0,
          max: 20,
          step: 0.01,
        },
      );

      // Slider which controls friction
      let f_slider = Slider(
        document.getElementById("point-mass-damping-slider") as HTMLElement,
        function (val: number) {
          scene.add_to_queue(scene.set_friction.bind(scene, val));
        },
        {
          name: "Friction",
          initial_value: "0.0",
          min: 0,
          max: 5.0,
          step: 0.01,
        },
      );

      // Button which pauses/unpauses the simulation
      let pausebutton = scene.add_pause_button(
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
          scene.add_to_queue(reset_simulation);
        },
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";

      // Play the scene
      scene.draw();
      scene.play(undefined);
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

      let scene = new WaveSimOneDimInteractiveScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.1);
      let sim = scene.sim();

      // Set the attributes of the simulator
      sim.set_attr("wave_propagation_speed", 3.0);
      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      function reset_simulation() {
        sim.time = 0;
        sim.set_uValues(
          funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points),
        );
        sim.set_vValues(funspace((x) => 0, 0, 1, num_points));
        scene.draw();
      }
      reset_simulation();
      // Slider which controls friction
      let f_slider = Slider(
        document.getElementById(
          "point-mass-discrete-sequence-friction-slider",
        ) as HTMLElement,
        function (val: number) {
          scene.add_to_queue(
            scene.set_simulator_attr.bind(scene, 0, "damping", val),
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

      // Button which pauses/unpauses the simulation
      let pauseButton = scene.add_pause_button(
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
          scene.add_to_queue(reset_simulation);
        },
      );
      resetButton.textContent = "Reset simulation";

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(
          "point-mass-discrete-sequence-stiffness-slider",
        ) as HTMLElement,
        function (val: number) {
          scene.add_to_queue(
            scene.set_simulator_attr.bind(
              scene,
              0,
              "wave_propagation_speed",
              val,
            ),
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

      // Prepare the simulation
      scene.draw();
      scene.play(undefined);
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

      let scene = new WaveSimOneDimInteractiveScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.05);
      scene.set_arrow_length_scale(0.1);
      let sim = scene.sim();

      // Set the attributes of the simulator
      sim.set_attr("wave_propagation_speed", 3.0);
      sim.set_attr("damping", 0.05);
      sim.set_attr("dt", 0.05);
      function foo(x: number): number {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      function reset_simulation() {
        sim.time = 0;
        sim.set_uValues(
          funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points),
        );
        sim.set_vValues(funspace((x) => 0, 0, 1, num_points));
        scene.draw();
      }
      reset_simulation();

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
          scene.add_to_queue(() => {
            scene.zoom_in_on(zr / scene.zoom_ratio, scene.get_view_center());
            if (zr > 3) {
              scene.set_mode("dots");
            } else {
              scene.set_mode("curve");
            }
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
      let pauseButton = scene.add_pause_button(
        document.getElementById(
          "point-mass-continuous-sequence-pause-button",
        ) as HTMLElement,
      );

      // Button which pauses/unpauses the simulation
      let resetButton = Button(
        document.getElementById(
          "point-mass-continuous-sequence-reset-button",
        ) as HTMLElement,
        function () {
          scene.add_to_queue(reset_simulation);
        },
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";

      // Slider which controls friction
      let f_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-friction-slider",
        ) as HTMLElement,
        function (val: number) {
          scene.add_to_queue(
            scene.set_simulator_attr.bind(scene, 0, "damping", val),
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
          scene.add_to_queue(
            scene.set_simulator_attr.bind(
              scene,
              0,
              "wave_propagation_speed",
              val,
            ),
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

      // Prepare the simulation
      scene.draw();
      scene.play(undefined);
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
      // Prepare the canvas
      let canvas = prepare_canvas(width, height, "wavesim-1d-impulse");

      let scene = new WaveSimOneDimInteractiveScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.05);
      scene.include_arrows = false;
      let sim = scene.sim();

      // Set the attributes of the simulator
      sim.set_attr("wave_propagation_speed", 5.0);
      sim.set_attr("damping", 0.0);
      sim.set_attr("dt", 0.02);

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
      function reset_simulation() {
        sim.time = 0;
        sim.set_uValues(funspace((x) => pulse(x) - pulse(1), 0, 1, num_points));
        sim.set_vValues(
          funspace((x) => -0.1 * pulse_deriv(x), 0, 1, num_points),
        );
        scene.draw();
      }
      reset_simulation();
      // Button which pauses/unpauses the simulation
      let pauseButton = scene.add_pause_button(
        document.getElementById(
          "wavesim-1d-impulse-pause-button",
        ) as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(
          "wavesim-1d-impulse-reset-button",
        ) as HTMLElement,
        function () {
          scene.add_to_queue(reset_simulation);
        },
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";

      // Prepare the simulation
      scene.draw();
      scene.play(undefined);
    })(300, 300, 50);
    (function wavesim_one_dimensional_demo_pml(
      width: number,
      height: number,
      num_points: number,
    ) {
      // Prepare the canvas
      let canvas = prepare_canvas(width, height, "wavesim-1d-pml");

      let scene = new WaveSimOneDimInteractiveScene(canvas, num_points);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("curve");
      scene.set_zoom(1.5);
      scene.set_dot_radius(0.05);
      scene.include_arrows = false;
      let sim = scene.sim();

      // Set the attributes of the simulator
      sim.set_attr("wave_propagation_speed", 3.0);
      sim.set_attr("damping", 0.0);
      sim.set_pml_layer(true, 0.3, 100);
      sim.set_pml_layer(false, 0.3, 100);
      sim.set_attr("dt", 0.02);
      sim.add_point_source(new PointSourceOneDim(num_points / 2, 3.0, 1.0, 0));

      // Initial conditions
      function reset_simulation() {
        sim.time = 0;
        sim.set_uValues(funspace((x) => 0, 0, 1, num_points));
        sim.set_vValues(funspace((x) => 0, 0, 1, num_points));
        scene.draw();
      }
      reset_simulation();
      // Button which pauses/unpauses the simulation
      let pauseButton = scene.add_pause_button(
        document.getElementById("wavesim-1d-pml-pause-button") as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById("wavesim-1d-pml-reset-button") as HTMLElement,
        function () {
          scene.add_to_queue(reset_simulation);
        },
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";

      // Prepare the simulation
      scene.draw();
      scene.play(undefined);
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
      let waveSim = new WaveSimTwoDim(width, height, dt);
      waveSim.wave_propagation_speed = 0.1 * width;

      // Create a point source
      let a = 5.0;
      let w = 8.0;
      waveSim.add_point_source(
        new PointSource(
          Math.floor(0.5 * width),
          Math.floor(0.5 * height),
          w,
          a,
          0,
        ),
      );

      // Initialize the scene
      let scene = new WaveSimTwoDimHeatMapScene(canvas, waveSim, imageData);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Make a slider which controls the frequency
      let w_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (val: number) {
          scene.add_to_queue(() => {
            let sim = scene.get_simulator();
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
      let pauseButton = scene.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          scene.add_to_queue(scene.reset.bind(scene));
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      scene.draw();
      scene.play(undefined);
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
      let waveSim = new WaveSimTwoDimEllipticReflector(width, height, dt);
      waveSim.wave_propagation_speed = 0.1 * width;
      waveSim.set_attr("w", 6.0);
      waveSim.remove_pml_layers();

      // Initialize the scene
      let conic = new ParametricFunction(
        (t) => [
          (waveSim.semimajor_axis / width) * (xmax - xmin) * Math.cos(t),
          (waveSim.semiminor_axis / height) * (ymax - ymin) * Math.sin(t),
        ],
        0,
        Math.PI * 2,
        30,
      );
      conic.set_stroke_width(0.03);
      conic.set_alpha(0.5);
      let scene = new WaveSimTwoDimHeatMapScene(canvas, waveSim, imageData);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      scene.add("conic", conic);

      // Make a slider which controls the eccentricity
      let e_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (val: number) {
          scene.add_to_queue(() => {
            let sim = scene.get_simulator();
            sim.set_attr("semiminor_axis", val);
            conic.set_function((t) => [
              (waveSim.semimajor_axis / width) * (xmax - xmin) * Math.cos(t),
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
          scene.add_to_queue(() => {
            let sim = scene.get_simulator();
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
      let pauseButton = scene.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          scene.add_to_queue(scene.reset.bind(scene));
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      scene.get_simulator().set_boundary_conditions(waveSim.vals, 0);
      scene.draw();
      scene.play(undefined);
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
      let waveSim = new WaveSimTwoDim(width, height, dt);
      waveSim.wave_propagation_speed = 0.1 * width;

      // *** Set up the double slit experiment
      waveSim.remove_pml_layers();
      waveSim.set_pml_layer(true, true, 0.2, 200.0);
      waveSim.set_pml_layer(true, false, 0.2, 200.0);
      waveSim.set_pml_layer(false, true, 0.2, 200.0);

      // Create a plane wave at the top
      let a = 4.0;
      let w = 8.0;
      for (let x = 0; x < width; x++) {
        waveSim.add_point_source(new PointSource(x, 0, w, a, 0));
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
        waveSim.add_point_source(source);
      }

      // Initialize the scene
      let scene = new WaveSimTwoDimHeatMapScene(canvas, waveSim, imageData);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

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
      let pauseButton = scene.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          scene.add_to_queue(scene.reset.bind(scene));
        },
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";

      scene.draw();
      scene.play(undefined);
    })(250, 250);
  });
})();
