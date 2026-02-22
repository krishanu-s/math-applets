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
  CoordinateAxes2d,
} from "./lib/base";
import { ParametricFunction } from "./lib/base/bezier.js";
import { SpringSimulator } from "./lib/simulator/statesim.js";
import {
  InteractiveHandler,
  Simulator,
  SceneFromSimulator,
  ThreeDSceneFromSimulator,
} from "./lib/simulator/sim";

// Base class which controls interactive simulations which evolve according to a differential equation
// NOTE: This is deprecated in favor of InteractiveHandler.
export abstract class InteractivePlayingScene extends Scene {
  simulators: Record<number, Simulator>; // The internal simulator
  num_simulators: number;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  time: number;
  dt: number;
  end_time: number | undefined; // Store a known end-time in case the simulation is paused and unpaused
  linked_scenes: Array<SceneFromSimulator | ThreeDSceneFromSimulator> = [];
  constructor(canvas: HTMLCanvasElement, simulators: Array<Simulator>) {
    super(canvas);
    [this.num_simulators, this.simulators] = simulators.reduce(
      ([ind, acc], item) => ((acc[ind] = item), [ind + 1, acc]),
      [0, {}] as [number, Record<number, Simulator>],
    );
    this.action_queue = [];
    this.paused = true;
    this.time = 0;
    this.dt = (simulators[0] as Simulator).dt;
  }
  // Adds another scene whose state is dependent on the simulation.
  // This scene acts as the "controller" through which the simulation can be paused and
  // interacted with.
  add_linked_scene(scene: SceneFromSimulator | ThreeDSceneFromSimulator) {
    this.linked_scenes.push(scene);
  }
  add_pause_button(container: HTMLElement) {
    let self = this;
    let pauseButton = Button(container, function () {
      self.add_to_queue(self.toggle_pause.bind(self));
      pauseButton.textContent =
        pauseButton.textContent == "Pause simulation"
          ? "Unpause simulation"
          : "Pause simulation";
    });
    pauseButton.textContent = this.paused
      ? "Unpause simulation"
      : "Pause simulation";
    return pauseButton;
  }
  get_simulator(ind: number = 0): Simulator {
    return this.simulators[ind] as Simulator;
  }
  set_simulator_attr(
    simulator_ind: number,
    attr_name: string,
    attr_val: number,
  ) {
    this.get_simulator(simulator_ind).set_attr(attr_name, attr_val);
  }
  // Restarts the simulator
  reset(): void {
    for (let ind = 0; ind < this.num_simulators; ind++) {
      this.get_simulator(ind).reset();
    }
    this.time = 0;
    this.draw();
    for (let scene of this.linked_scenes) {
      scene.update_mobjects_from_simulator(this.get_simulator(0));
      scene.draw();
    }
  }
  // Switches from paused to unpaused and vice-versa.
  toggle_pause() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.play(this.end_time);
    }
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback: () => void) {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Starts animation
  play(until: number | undefined) {
    // If paused, record the end time and stop the loop
    if (this.paused) {
      this.end_time = until;
      return;
    }
    // Otherwise, loop
    else {
      // If there are outstanding actions, perform them first
      if (this.action_queue.length > 0) {
        let callback = this.action_queue.shift() as () => void;
        callback();
      }
      // If we have reached the end-time, stop.
      else if (this.time > (until as number)) {
        return;
      } else {
        for (let ind = 0; ind < this.num_simulators; ind++) {
          this.get_simulator(ind).step();
        }
        this.time += this.get_simulator(0).dt;
        this.draw();
        for (let scene of this.linked_scenes) {
          scene.update_mobjects_from_simulator(this.get_simulator(0));
          scene.draw();
        }
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates all mobjects to account for the new simulator state
  update_mobjects() {}
  // Draws the scene.
  _draw() {
    this.update_mobjects();
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      this.draw_mobject(mobj);
    });
  }
  // Add drawing instructions in the subclass.
  draw_mobject(mobj: MObject) {}
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // // *** EXTRA, TO BE REMOVED ***
    // (function foo(width: number, height: number) {
    //   let canvas = prepare_canvas(width, height, "two-springs-circle");
    //   let xmin = -2.5;
    //   let xmax = 2.5;
    //   let ymin = -2.5;
    //   let ymax = 2.5;

    //   class TwoSpringsCircleScene extends InteractivePlayingScene {
    //     set_init_values() {
    //       (this.get_simulator(0) as SpringSimulator).set_vals([1, 0]);
    //       (this.get_simulator(1) as SpringSimulator).set_vals([0, 1]);
    //     }
    //     constructor(canvas: HTMLCanvasElement) {
    //       super(canvas, [
    //         new SpringSimulator(1.0, 0.02),
    //         new SpringSimulator(1.0, 0.02),
    //       ]);

    //       this.set_init_values();

    //       let x_axis = new Line([xmin, 0], [xmax, 0])
    //         .set_stroke_width(0.02)
    //         .set_alpha(0.5);
    //       let y_axis = new Line([0, ymin], [0, ymax])
    //         .set_stroke_width(0.02)
    //         .set_alpha(0.5);
    //       this.add("x-axis", x_axis);
    //       this.add("y-axis", y_axis);

    //       let trajectory = new ParametricFunction(
    //         (t) => [Math.cos(t), Math.sin(t)],
    //         0,
    //         2 * Math.PI + 0.01,
    //         30,
    //       )
    //         .set_stroke_width(0.05)
    //         .set_stroke_color("gray");
    //       this.add("trajectory", trajectory);

    //       let dot = new Rectangle([0, 0], 0.1, 0.1);
    //       this.add("dot", dot);

    //       // First spring simulator is drawn horizontally
    //       let mass_0 = new Rectangle([0, 0], 0.1, 0.1);
    //       this.add("mass_0", mass_0);
    //       let spring_0 = new LineSpring([-2, 0], [0, 0]);
    //       spring_0.set_mode("spring");
    //       this.add("spring_0", spring_0);
    //       this.add("b_0", new Rectangle([-2, 0], 0.1, 2));

    //       // Second spring simulator is drawn vertically
    //       let mass_1 = new Rectangle([0, 0], 0.1, 0.1);
    //       this.add("mass_1", mass_1);
    //       let spring_1 = new LineSpring([0, -2], [0, 0]);
    //       spring_1.set_mode("spring");
    //       this.add("spring_1", spring_1);
    //       this.add("b_1", new Rectangle([0, -2], 2, 0.1));
    //     }
    //     update_mobjects() {
    //       let dot = this.get_mobj("dot") as Rectangle;
    //       dot.move_to([
    //         this.get_simulator(0).get_vals()[0],
    //         this.get_simulator(1).get_vals()[0],
    //       ]);
    //       // First spring simulator is drawn horizontally
    //       let mass_0 = this.get_mobj("mass_0") as Rectangle;
    //       mass_0.move_to([this.get_simulator(0).get_vals()[0], 0]);
    //       let spring_0 = this.get_mobj("spring_0") as LineSpring;
    //       spring_0.set_mode("spring");
    //       spring_0.move_end([this.get_simulator(0).get_vals()[0], 0]);

    //       // Second spring simulator is drawn vertically
    //       let mass_1 = this.get_mobj("mass_1") as Rectangle;
    //       mass_1.move_to([0, this.get_simulator(1).get_vals()[0]]);
    //       let spring_1 = this.get_mobj("spring_1") as LineSpring;
    //       spring_1.set_mode("spring");
    //       spring_1.move_end([0, this.get_simulator(1).get_vals()[0]]);
    //     }
    //     draw_mobject(mobj: MObject) {
    //       mobj.draw(this.canvasWrapper, this);
    //     }
    //   }

    //   let scene = new TwoSpringsCircleScene(canvas);
    //   scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    //   scene.draw();

    //   // Button which pauses/unpauses the simulation
    //   let pauseButton = Button(
    //     document.getElementById(
    //       "two-springs-circle-pause-button",
    //     ) as HTMLElement,
    //     function () {
    //       scene.add_to_queue(scene.toggle_pause.bind(scene));
    //       if (pauseButton.textContent == "Pause simulation") {
    //         pauseButton.textContent = "Unpause simulation";
    //       } else if (pauseButton.textContent == "Unpause simulation") {
    //         pauseButton.textContent = "Pause simulation";
    //       } else {
    //         throw new Error();
    //       }
    //     },
    //   );
    //   pauseButton.textContent = "Unpause simulation";
    //   pauseButton.style.padding = "15px";

    //   scene.play(undefined);
    // })(300, 300);

    // *** ZERO-DIMENSIONAL WAVE EQUATION ***
    // This is the zero-dimensional case of the wave equation. A point mass connected to a spring
    // oscillates in one direction according to Hooke's law.
    (function point_mass_spring(width: number, height: number) {
      // Prepare the canvases
      let canvas_spring = prepare_canvas(width, height, "point-mass-spring");
      let canvas_graph = prepare_canvas(width, height, "point-mass-graph");

      let xmin = -6;
      let xmax = 6;
      let tmin = 0;
      let tmax = 12;
      let ymin = -6;
      let ymax = 6;
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
        num_graphs: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas);
          this.set_frame_lims([tmin, tmax], [xmin, xmax]);
          let axes = new CoordinateAxes2d([tmin, tmax], [xmin, xmax]);

          this.add("axes", axes);
          this.add(
            "graph",
            new LineSequence([
              [0, sim.get_vals()[0] as number],
            ]).set_stroke_width(0.05),
          );
          this.draw();
        }
        clear() {
          for (let i = 0; i < this.num_graphs - 1; i++) {
            this.remove(`graph${i}`);
          }
          let graph = this.get_mobj(`graph${this.num_graphs - 1}`);
          this.remove(`graph${this.num_graphs - 1}`);
          this.add("graph0", graph);
          this.num_graphs = 0;
        }
        reset() {
          this.num_graphs += 1;
          this.add(
            `graph${this.num_graphs - 1}`,
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
            (
              this.get_mobj(`graph${this.num_graphs - 1}`) as LineSequence
            ).add_point([time, vals[0] as number]);
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
          let eq_line = new Line([0, ymin], [0, ymax])
            .set_stroke_width(0.05)
            .set_stroke_style("dashed")
            .set_stroke_color("gray");
          let spring = new LineSpring([xmin * 0.7, 0], [0, 0]).set_stroke_width(
            0.08,
          );
          spring.set_eq_length(3.0);
          let anchor = new Rectangle(
            [xmin * 0.7, 0],
            0.15,
            (ymax - ymin) * 0.7,
          );

          // While the scene is paused, the point mass is an interactive element which can be dragged
          // to update the simulator state. While the scene is unpaused, the simulator runs and updates
          // the state of the point mass.
          let mass = new DraggableRectangle([0, 0], 0.8, 0.8);
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
          handler.add_to_queue(graph_scene.clear.bind(graph_scene));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Button which clears the old graphs
      let clearGraphButton = Button(
        document.getElementById(
          "point-mass-spring-graph-clear-button",
        ) as HTMLElement,
        function () {
          handler.add_to_queue(graph_scene.clear.bind(graph_scene));
        },
      );
      clearGraphButton.textContent = "Clear graphs";

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

    // TODO A pendulum. Reset button resets the simulation, but doesn't clear the graph. Clear button clears the graph.

    // TODO A pair of coupled springs in series.

    // TODO A double pendulum.
  });
})();
