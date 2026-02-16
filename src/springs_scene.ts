// Testing the direct feeding of a pixel array to the canvas
import { Slider, Button } from "./lib/interactive";
import {
  MObject,
  Scene,
  prepare_canvas,
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
} from "./lib/base";
import { ParametricFunction } from "./lib/bezier.js";
import { SpringSimulator } from "./lib/simulator/statesim.js";
import { InteractivePlayingScene } from "./lib/simulator/sim.js";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // *** EXTRA, TO BE REMOVED ***
    (function foo(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "two-springs-circle");
      let xmin = -2.5;
      let xmax = 2.5;
      let ymin = -2.5;
      let ymax = 2.5;

      class TwoSpringsCircleScene extends InteractivePlayingScene {
        set_init_values() {
          (this.get_simulator(0) as SpringSimulator).set_vals([1, 0]);
          (this.get_simulator(1) as SpringSimulator).set_vals([0, 1]);
        }
        constructor(canvas: HTMLCanvasElement) {
          super(canvas, [
            new SpringSimulator(1.0, 0.02),
            new SpringSimulator(1.0, 0.02),
          ]);

          this.set_init_values();

          let x_axis = new Line([xmin, 0], [xmax, 0])
            .set_stroke_width(0.02)
            .set_alpha(0.5);
          let y_axis = new Line([0, ymin], [0, ymax])
            .set_stroke_width(0.02)
            .set_alpha(0.5);
          this.add("x-axis", x_axis);
          this.add("y-axis", y_axis);

          let trajectory = new ParametricFunction(
            (t) => [Math.cos(t), Math.sin(t)],
            0,
            2 * Math.PI + 0.01,
            30,
          )
            .set_stroke_width(0.05)
            .set_stroke_color("gray");
          this.add("trajectory", trajectory);

          let dot = new Rectangle([0, 0], 0.1, 0.1);
          this.add("dot", dot);

          // First spring simulator is drawn horizontally
          let mass_0 = new Rectangle([0, 0], 0.1, 0.1);
          this.add("mass_0", mass_0);
          let spring_0 = new LineSpring([-2, 0], [0, 0]);
          spring_0.set_mode("spring");
          this.add("spring_0", spring_0);
          this.add("b_0", new Rectangle([-2, 0], 0.1, 2));

          // Second spring simulator is drawn vertically
          let mass_1 = new Rectangle([0, 0], 0.1, 0.1);
          this.add("mass_1", mass_1);
          let spring_1 = new LineSpring([0, -2], [0, 0]);
          spring_1.set_mode("spring");
          this.add("spring_1", spring_1);
          this.add("b_1", new Rectangle([0, -2], 2, 0.1));
        }
        update_mobjects() {
          let dot = this.get_mobj("dot") as Rectangle;
          dot.move_to([
            this.get_simulator(0).get_vals()[0],
            this.get_simulator(1).get_vals()[0],
          ]);
          // First spring simulator is drawn horizontally
          let mass_0 = this.get_mobj("mass_0") as Rectangle;
          mass_0.move_to([this.get_simulator(0).get_vals()[0], 0]);
          let spring_0 = this.get_mobj("spring_0") as LineSpring;
          spring_0.set_mode("spring");
          spring_0.move_end([this.get_simulator(0).get_vals()[0], 0]);

          // Second spring simulator is drawn vertically
          let mass_1 = this.get_mobj("mass_1") as Rectangle;
          mass_1.move_to([0, this.get_simulator(1).get_vals()[0]]);
          let spring_1 = this.get_mobj("spring_1") as LineSpring;
          spring_1.set_mode("spring");
          spring_1.move_end([0, this.get_simulator(1).get_vals()[0]]);
        }
        draw_mobject(mobj: MObject) {
          mobj.draw(this.canvasWrapper, this);
        }
      }

      let scene = new TwoSpringsCircleScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.draw();

      // Button which pauses/unpauses the simulation
      let pauseButton = Button(
        document.getElementById(
          "two-springs-circle-pause-button",
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

      scene.play(undefined);
    })(300, 300);

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
            let sim = this.get_simulator() as SpringSim;
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
            (this.get_mobj("mass") as DraggableRectangle).draggable_x = false;
          } else {
            (this.get_mobj("mass") as DraggableRectangle).draggable_x = true;
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
          mobj.draw(this.canvasWrapper, this);
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
  });
})();
