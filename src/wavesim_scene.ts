// Testing the direct feeding of a pixel array to the canvas
import { MObject, Scene, prepare_canvas } from "./lib/base.js";
import { Slider, Button, PauseButton } from "./lib/interactive.js";
import { SceneViewTranslator } from "./lib/scene_view_translator.js";
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
  DraggableRectangle,
  DraggableRectangleX,
  DraggableRectangleY,
  Arrow,
} from "./lib/base_geom.js";
import { clamp, sigmoid, linspace, funspace, delay } from "./lib/base.js";
import { ParametricFunction } from "./lib/parametric.js";
import { HeatMap } from "./lib/heatmap.js";
import {
  PointSource,
  WaveSimOneDim,
  WaveSimOneDimScene,
  WaveSimTwoDim,
  WaveSimTwoDimEllipticReflector,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimDotsScene,
} from "./lib/wavesim.js";
import { LineSpring } from "./lib/spring.js";
import { InteractivePlayingScene, SpringSimulator } from "./lib/statesim.js";

class WaveSimOneDimInteractiveScene extends WaveSimOneDimScene {
  set_dot_radius(radius: number) {
    for (let i = 0; i < this.width(); i++) {
      let mass = this.get_mobj(`p_${i + 1}`) as Dot;
      mass.set_radius(radius);
    }
  }
  toggle_pause() {
    if (this.paused) {
      for (let i = 0; i < this.width(); i++) {
        let mass = this.get_mobj(`p_${i + 1}`) as DraggableDotX;
        this.remove(`p_${i + 1}`);
        this.add(`p_${i + 1}`, mass.toDot());
      }
    } else {
      for (let i = 0; i < this.width(); i++) {
        let mass = this.get_mobj(`p_${i + 1}`) as Dot;
        this.remove(`p_${i + 1}`);
        let new_mass = mass.toDraggableDotY();
        if (i == 0) {
          new_mass.add_callback(() => {
            let sim = this.get_simulator() as WaveSimOneDim;
            sim.set_left_endpoint(new_mass.get_center()[1]);
          });
        }
        if (i == this.width() - 1) {
          new_mass.add_callback(() => {
            let sim = this.get_simulator() as WaveSimOneDim;
            sim.set_right_endpoint(new_mass.get_center()[1]);
          });
        }
        new_mass.add_callback(() => {
          let sim = this.get_simulator();
          let vals = sim.get_vals();
          vals[i] = new_mass.get_center()[1];
          vals[i + this.width()] = 0;
          sim.set_vals(vals);
        });
        this.add(`p_${i + 1}`, new_mass);
      }
    }
    super.toggle_pause();
  }
}

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
      w_slider.width = 200;

      // Button which pauses/unpauses the simulation
      let pauseButton = Button(
        document.getElementById(
          "twodim-dipole-demo-pause-button",
        ) as HTMLElement,
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

    // *** ONE-DIMENSIONAL WAVE EQUATION ***
    // This is the zero-dimensional case of the wave equation. A point mass connected to a spring
    // oscillates in one direction according to Hooke's law.
    (function point_mass_spring(width: number, height: number) {
      // Prepare the canvas
      let canvas = prepare_canvas(width, height, "point-mass-spring");

      class SpringScene extends InteractivePlayingScene {
        arrow_length_scale: number = 1.5;
        arrow_height: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas, [new SpringSimulator(3.0, 0.01)]);
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
          let mass = new DraggableRectangleX([0, 0], 0.6, 0.6);
          mass.add_callback(() => {
            let sim = this.get_simulator();
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
        toggle_pause() {
          if (this.paused) {
            let mass = this.get_mobj("mass") as DraggableRectangleX;
            this.remove("mass");
            this.add("mass", mass.toRectangle());
          } else {
            let mass = this.get_mobj("mass") as Rectangle;
            this.remove("mass");
            let new_mass = mass.toDraggableRectangleX();
            new_mass.add_callback(() => {
              let sim = this.get_simulator();
              sim.set_vals([new_mass.get_center()[0], 0]);
            });
            this.add("mass", new_mass);
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
      let scene = new SpringScene(canvas);
      scene.set_simulator_attr(0, "stiffness", 5.0);
      scene.set_simulator_attr(0, "dt", 0.01);
      scene.set_spring_mode("spring");
      let sim = scene.get_simulator();
      sim.set_vals([1, 0]);
      scene.set_frame_lims([-4, 4], [-4, 4]);

      // // Slider which controls the propagation speed
      // let w_slider = Slider(
      //   document.getElementById(
      //     "point-mass-spring-stiffness-slider",
      //   ) as HTMLElement,
      //   function (w: number) {
      //     scene.add_to_queue(
      //       scene.set_simulator_attr.bind(scene, 0, "stiffness", w),
      //     );
      //   },
      //   {
      //     name: "Spring stiffness",
      //     initial_value: "3.0",
      //     min: 0,
      //     max: 20,
      //     step: 0.05,
      //   },
      // );
      // w_slider.width = 200;

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
    })(300, 300);

    // One-dimensional case of the wave equation. A sequence of point masses (say, 5-10)
    // connected in a horizontal line, oscillating vertically.
    // - TODO Add line segments showing the displacements from the equilibrium position.
    (function point_mass_discrete_sequence(num_points: number) {
      // Prepare the canvas
      let canvas = prepare_canvas(300, 300, "point-mass-discrete-sequence");

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

      // // Slider which controls the propagation speed
      // let w_slider = Slider(
      //   document.getElementById(
      //     "point-mass-discrete-sequence-stiffness-slider",
      //   ) as HTMLElement,
      //   function (w: number) {
      //     scene.add_to_queue(
      //       scene.set_simulator_attr.bind(
      //         scene,
      //         0,
      //         "wave_propagation_speed",
      //         w,
      //       ),
      //     );
      //   },
      //   {
      //     name: "Wave propagation speed",
      //     initial_value: "3.0",
      //     min: 0,
      //     max: 20,
      //     step: 0.05,
      //   },
      // );
      // w_slider.width = 200;

      // Prepare the simulation
      scene.draw();
      scene.play(undefined);
    })(10);

    // (function point_mass_discrete_sequence_diagram(num_points: number) {
    //   // Prepare the scene
    //   let canvas = prepare_canvas(
    //     300,
    //     300,
    //     "point-mass-discrete-sequence-diagram",
    //   );
    //   // TODO This is essentially a WaveSimOneDimScene.
    //   let scene = new Scene(canvas);
    //   let xmin = -5;
    //   let xmax = 5;
    //   let ymin = -5;
    //   let ymax = 5;
    //   scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

    //   // i goes from 0 to num_points -1
    //   function eq_position(i: number): Vec2D {
    //     return [xmin + ((i + 0.5) * (xmax - xmin)) / num_points, 0];
    //   }

    //   let pos: Vec2D;

    //   // Add vertical lines at the beginning and end of the sequence
    //   pos = eq_position(0);
    //   scene.add(
    //     "b0",
    //     new Line([pos[0], ymin / 2], [pos[0], ymax / 2]).set_stroke_width(0.1),
    //   );

    //   pos = eq_position(num_points - 1);
    //   scene.add(
    //     "b1",
    //     new Line([pos[0], ymin / 2], [pos[0], ymax / 2]).set_stroke_width(0.1),
    //   );

    //   // Make draggable dots
    //   let dots: DraggableDotY[] = [];
    //   for (let i = 0; i < num_points; i++) {
    //     let dot = new DraggableDotY(eq_position(i), 0.13);
    //     dots.push(dot);
    //   }

    //   // Make springs and add callbacks to dots
    //   let springs: LineSpring[] = [];
    //   function set_spring(i: number, spring: LineSpring) {
    //     spring.move_start(dots[i].get_center());
    //     spring.move_end(dots[i + 1].get_center());
    //   }
    //   for (let i = 0; i < num_points - 1; i++) {
    //     let spring = new LineSpring([0, 0], [0, 0], {});
    //     spring.set_eq_length(
    //       vec2_norm(vec2_sub(eq_position(i + 1), eq_position(i))),
    //     );
    //     spring.set_mode("spring");
    //     set_spring(i, spring);
    //     dots[i].add_callback(() => {
    //       set_spring(i, spring);
    //     });
    //     springs.push(spring);
    //   }

    //   // Make force arrows and add callbacks to dots
    //   let arrow_scale = 0.3;
    //   let arrows: Arrow[] = [];
    //   function set_force_arrow(i: number, arrow: Arrow) {
    //     pos = dots[i].get_center();
    //     let disp: number;
    //     if (i == 0) {
    //       disp = dots[i + 1].get_center()[1] - pos[1];
    //     } else if (i == num_points - 1) {
    //       disp = dots[i - 1].get_center()[1] - pos[1];
    //     } else {
    //       disp =
    //         dots[i - 1].get_center()[1] +
    //         dots[i + 1].get_center()[1] -
    //         2 * dots[i].get_center()[1];
    //     }
    //     arrow.move_start(pos);
    //     arrow.move_end([pos[0], pos[1] + arrow_scale * disp]);
    //     arrow.set_arrow_size(Math.sqrt(Math.abs(disp)) / 8);
    //   }
    //   for (let i = 0; i < num_points; i++) {
    //     let arrow = new Arrow([0, 0], [0, 0]);
    //     arrow.set_stroke_color("red");
    //     arrow.set_stroke_width(0.05);
    //     arrow.set_alpha(0.5);
    //     set_force_arrow(i, arrow);
    //     if (i == 0) {
    //       dots[i].add_callback(() => {
    //         set_force_arrow(i, arrow);
    //       });
    //       dots[i + 1].add_callback(() => {
    //         set_force_arrow(i, arrow);
    //       });
    //     } else if (i == num_points - 1) {
    //       dots[i - 1].add_callback(() => {
    //         set_force_arrow(i, arrow);
    //       });
    //       dots[i].add_callback(() => {
    //         set_force_arrow(i, arrow);
    //       });
    //     } else {
    //       dots[i - 1].add_callback(() => {
    //         set_force_arrow(i, arrow);
    //       });
    //       dots[i].add_callback(() => {
    //         set_force_arrow(i, arrow);
    //       });
    //       dots[i + 1].add_callback(() => {
    //         set_force_arrow(i, arrow);
    //       });
    //     }
    //     arrows.push(arrow);
    //   }

    //   for (let i = 0; i < num_points - 1; i++) {
    //     scene.add(`spring_${i}`, springs[i]);
    //   }
    //   for (let i = 0; i < num_points; i++) {
    //     scene.add(`arrow_${i}`, arrows[i]);
    //     scene.add(`point_${i}`, dots[i]);
    //   }

    //   // Prepare the simulation
    //   scene.draw();
    // })(7);

    // Use the same scene as before, but with a large number of point masses (say, 50) drawn
    // as a Bezier-curve.
    (function point_mass_continuous_sequence(num_points: number) {
      // Prepare the canvas
      let canvas = prepare_canvas(300, 300, "point-mass-continuous-sequence");

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
      sim.set_uValues(funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points));

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
      zoom_slider.width = 200;

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

    // TODO A one-dimensional wave example with PML at the ends, where a point in the middle
    // is a timelike wave-source. Demonstrates how the timelike oscillation becomes spacelike oscillation.

    // TODO A one-dimensional example bounded at both endpoints with an impulse wave traveling back
    // and forth. Demonstrates how a zero-point acts as a reflector.

    // *** TWO-DIMENSIONAL WAVE EQUATION ***
    // A 2D lattice of point masses (say, 5x5), oscillating along a third dimension.
    // - TODO Make this scene in 3D. At that point, we'll decide what to add.
    // - TODO Indicate height using color, to parallel the heatmap version.
    // - TODO Add draggable 3D dots. When the cursor lies inside multiple dots,
    //   drag the one with lowest depth.
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

    // TODO A heatmap demonstration of a single point source

    // *** DEMONSTRATIONS ***

    // TODO A heatmap demonstration of diffraction through a single aperture
    // TODO A heatmap demonstration of the double-slit experiment: diffraction through an aperture
    // TODO A heatmap demonstration of reflection within a conic section

    // *** EIGENFUNCTIONS *** (TODO FUTURE)

    // TODO A depiction of the eigenfunctions for a one-dimensional bounded system
    // TODO A heatmap demonstration of eigenfunctions within a circular region

    // // Some animation to depict reflective elements.
    // // Some animation to depict point sources and line sources.
    // (function line_source_heatmap(width: number, height: number) {
    //   // Prepare the canvas and context for drawing
    //   let canvas = prepare_canvas(width, height, "line-source-heatmap");
    //   const ctx = canvas.getContext("2d");
    //   if (!ctx) {
    //     throw new Error("Failed to get 2D context");
    //   }
    //   const imageData = ctx.createImageData(width, height);

    //   // Prepare the simulator and scene
    //   const ratio = 0.5;
    //   class WaveSimTwoDimDiffraction extends WaveSimTwoDim {
    //     // Has different wave propagation speed in two different media.
    //     wps(x: number, y: number): number {
    //       if (y < height / 2) {
    //         return this.wave_propagation_speed * ratio;
    //       } else {
    //         return this.wave_propagation_speed;
    //       }
    //     }
    //   }

    //   let sim = new WaveSimTwoDimDiffraction(width, height, 0.01);

    //   let scene = new WaveSimTwoDimHeatMapScene(canvas, sim, imageData);
    //   scene.set_frame_lims([-5, 5], [-5, 5]);

    //   const theta = Math.PI / 6; // Angle off vertical along which wave travels
    //   let alpha = Math.asin(ratio * Math.sin(theta));
    //   // Angle off vertical along which wave travels after refraction
    //   sim.set_attr("wave_propagation_speed", 20.0);
    //   let w = 4.0;
    //   let a = 5.0;

    //   // Turn off PML layers along the bottom and left of the scene
    //   sim.remove_pml_layers();
    //   sim.set_pml_layer(true, true, 0.2, 200.0);
    //   sim.set_pml_layer(false, true, 0.2, 200.0);

    //   // Set wave source at the bottom and left of the scene
    //   // TODO Calculate correct amplitude based on angle of wave
    //   let t;
    //   for (let px = 0; px <= width - 10; px++) {
    //     t = (px * Math.sin(theta)) / 20.0;
    //     let p = new PointSource(px, height - 1, w, a, t);
    //     p.set_turn_on_time(t);
    //     sim.add_point_source(p);
    //   }
    //   for (let py = 10; py <= height; py++) {
    //     if (py < height / 2) {
    //       t = (py * Math.cos(theta)) / 20.0;
    //     } else {
    //       t =
    //         ((height / 2) * Math.cos(theta) +
    //           ((py - height / 2) * Math.cos(alpha)) / ratio) /
    //         20.0;
    //     }
    //     let p = new PointSource(0, height - 1 - py, w, a, t);
    //     p.set_turn_on_time(t);
    //     sim.add_point_source(p);
    //   }

    //   // Button which pauses/unpauses the simulation
    //   let pauseButton = PauseButton(
    //     document.getElementById(
    //       "line-source-heatmap-pause-button",
    //     ) as HTMLElement,
    //     scene,
    //   );

    //   scene.draw();

    //   // Start playing
    //   scene.play(undefined);
    // })(200, 200);
  });
})();
