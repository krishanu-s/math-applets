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
import { SpringSimulator, StateSimulator } from "./lib/simulator/statesim.js";
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
    // *** ZERO-DIMENSIONAL WAVE EQUATION ***
    // This is the zero-dimensional case of the wave equation. A point mass connected to a spring
    // oscillates in one direction according to Hooke's law.
    (function point_mass_spring(width: number, height: number) {
      const name = "point-mass-spring";
      // Prepare the canvases
      let canvas_spring = prepare_canvas(width, height, name);
      let canvas_graph = prepare_canvas(width, height, name + "-graph");

      let xmin = -6;
      let xmax = 6;
      let tmin = 0;
      let tmax = 12;
      let ymin = -6;
      let ymax = 6;
      let w = 5;
      const dt = 0.01;

      // Make the simulator with reset condition
      class SpringSim extends SpringSimulator {
        reset() {
          super.reset();
          sim.set_vals([1, 0]);
        }
      }
      let sim = new SpringSim(w, dt);
      sim.set_vals([1, 0]);
      let handler = new InteractiveHandler(sim);

      // Add the two scenes, with callbacks
      class GraphScene extends SceneFromSimulator {
        step_counter: number = 0;
        num_graphs: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas);
          console.log("Re-initialized");
          this.set_frame_lims([tmin, tmax], [xmin, xmax]);
          let axes = new CoordinateAxes2d([tmin, tmax], [xmin, xmax]);

          this.add("axes", axes);
          this.add_graph();
          this.add(
            "dot",
            new Dot([0, sim.get_vals()[0] as number], 0.08).set_color("red"),
          );
          this.draw();
        }
        add_graph() {
          this.num_graphs += 1;
          this.add(
            `graph${this.num_graphs - 1}`,
            new LineSequence([
              [0, sim.get_vals()[0] as number],
            ]).set_stroke_width(0.05),
          );
          this.step_counter = 0;
          console.log("Added graph", this.num_graphs);
        }
        clear() {
          for (let i = 0; i < this.num_graphs - 1; i++) {
            this.remove(`graph${i}`);
          }
          console.log("Removed graphs");
          let graph = this.get_mobj(`graph${this.num_graphs - 1}`);
          this.remove(`graph${this.num_graphs - 1}`);

          this.num_graphs = 1;
          this.add("graph0", graph);
        }
        reset() {
          this.add_graph();
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
            (this.get_mobj("dot") as Dot).move_to([time, vals[0] as number]);
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
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          handler.add_to_queue(handler.reset.bind(handler));
          // handler.add_to_queue(graph_scene.clear.bind(graph_scene));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Button which clears the old graphs
      let clearGraphButton = Button(
        document.getElementById(name + "-graph-clear-button") as HTMLElement,
        function () {
          handler.add_to_queue(graph_scene.clear.bind(graph_scene));
        },
      );
      clearGraphButton.textContent = "Clear graphs";

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(name + "-stiffness-slider") as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "stiffness", val),
          );
          handler.add_to_queue(
            spring_scene.set_spring_stiffness.bind(spring_scene, val),
          );
          // handler.add_to_queue(
          //   spring_scene.update_mobjects_from_simulator.bind(spring_scene, sim),
          // );
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
        document.getElementById(name + "-damping-slider") as HTMLElement,
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

    // // TODO A pendulum. Reset button resets the simulation, but doesn't clear the graph. Clear button clears the graph.
    // (function point_mass_pendulum(width: number, height: number) {
    //   const name = "point-mass-pendulum";
    //   // Prepare the canvases
    //   let canvas_spring = prepare_canvas(width, height, name);
    //   let canvas_graph = prepare_canvas(width, height, name + "-graph");

    //   let xmin = -Math.PI;
    //   let xmax = Math.PI;
    //   let tmin = 0;
    //   let tmax = 12;
    //   let ymin = -6;
    //   let ymax = 6;
    //   let w = 5;

    //   // Make the simulator with reset condition
    //   class PendulumSim extends StateSimulator {
    //     stiffness: number;
    //     friction: number = 0;
    //     constructor(stiffness: number, dt: number) {
    //       super(2, dt);
    //       this.stiffness = stiffness;
    //     }
    //     set_stiffness(stiffness: number) {
    //       this.stiffness = stiffness;
    //     }
    //     set_friction(friction: number) {
    //       this.friction = friction;
    //     }
    //     dot(vals: Array<number>, time: number): Array<number> {
    //       return [
    //         vals[1] as number,
    //         -this.stiffness * Math.sin(vals[0] as number) -
    //           this.friction * (vals[1] as number),
    //       ];
    //     }
    //   }
    //   let sim = new PendulumSim(w, 0.01);
    //   sim.set_vals([1, 0]);
    //   let handler = new InteractiveHandler(sim);

    //   // Add the two scenes, with callbacks
    //   class GraphScene extends SceneFromSimulator {
    //     step_counter: number = 0;
    //     num_graphs: number = 0;
    //     constructor(canvas: HTMLCanvasElement) {
    //       super(canvas);
    //       console.log("Re-initialized");
    //       this.set_frame_lims([tmin, tmax], [xmin, xmax]);
    //       let axes = new CoordinateAxes2d([tmin, tmax], [xmin, xmax]);

    //       this.add("axes", axes);
    //       this.add_graph();
    //       this.add(
    //         "dot",
    //         new Dot([0, sim.get_vals()[0] as number], 0.08).set_color("red"),
    //       );
    //       this.draw();
    //     }
    //     add_graph() {
    //       this.num_graphs += 1;
    //       this.add(
    //         `graph${this.num_graphs - 1}`,
    //         new LineSequence([
    //           [0, sim.get_vals()[0] as number],
    //         ]).set_stroke_width(0.05),
    //       );
    //       this.step_counter = 0;
    //       console.log("Added graph", this.num_graphs);
    //     }
    //     clear() {
    //       for (let i = 0; i < this.num_graphs - 1; i++) {
    //         this.remove(`graph${i}`);
    //       }
    //       console.log("Removed graphs");
    //       let graph = this.get_mobj(`graph${this.num_graphs - 1}`);
    //       this.remove(`graph${this.num_graphs - 1}`);

    //       this.num_graphs = 1;
    //       this.add("graph0", graph);
    //     }
    //     reset() {
    //       this.add_graph();
    //     }
    //     update_mobjects_from_simulator(simulator: SpringSimulator) {
    //       let vals = simulator.get_vals();
    //       let time = simulator.time;
    //       this.step_counter += 1;
    //       // Implement update logic, calling from the simulator
    //       if (this.step_counter % 5 === 0 && time < this.xlims[1]) {
    //         (
    //           this.get_mobj(`graph${this.num_graphs - 1}`) as LineSequence
    //         ).add_point([time, vals[0] as number]);
    //         (this.get_mobj("dot") as Dot).move_to([time, vals[0] as number]);
    //       }
    //     }
    //   }
    //   let graph_scene = new GraphScene(canvas_graph);

    //   class PendulumScene extends SceneFromSimulator {
    //     arrow_length_scale: number = w / 3;
    //     arrow_height: number = 0;
    //     string_length: number = 10 / w;
    //     constructor(canvas: HTMLCanvasElement) {
    //       super(canvas);

    //       // Add fixed parts
    //       let anchor = new Dot([0, ymax + 0.2 * (ymin - ymax)], 0.1);
    //       let eq_line = new Line([0, ymax], [0, ymin])
    //         .set_stroke_width(0.05)
    //         .set_stroke_style("dashed")
    //         .set_stroke_color("gray");
    //       this.add("anchor", anchor);
    //       this.add("eq_line", eq_line);

    //       // Add string
    //       let string = new Line(
    //         [0, ymax + 0.2 * (ymin - ymax)],
    //         [0, ymax + 0.2 * (ymin - ymax) - this.string_length],
    //       );
    //       this.add("string", string);

    //       // While the scene is paused, the point mass is an interactive element which can be dragged
    //       // to update the simulator state. While the scene is unpaused, the simulator runs and updates
    //       // the state of the point mass.
    //       // TODO Set constraint
    //       let mass = new DraggableDot(
    //         [0, ymax + 0.2 * (ymin - ymax) - this.string_length],
    //         0.2,
    //       );
    //       // mass.draggable_x = true;
    //       // mass.draggable_y = false;
    //       this.add("mass", mass);

    //       let force_arrow = new Arrow(
    //         [0, this.arrow_height],
    //         [0, this.arrow_height],
    //       )
    //         .set_stroke_width(0.1)
    //         .set_stroke_color("red");
    //       this.add("force_arrow", force_arrow);

    //       this.add_callbacks();
    //     }
    //     // Callback which affects the simulator and is removed when simulation is paused
    //     // TODO Add callback
    //     add_callbacks() {
    //       let mass = this.get_mobj("mass") as DraggableRectangle;
    //       mass.add_callback(() => {
    //         sim.set_vals([mass.get_center()[0], 0]);
    //         this.update_mobjects_from_simulator(sim);
    //       });
    //     }
    //     set_spring_stiffness(val: number) {
    //       this.arrow_length_scale = val / 3;
    //       this.string_length = 10 / val;
    //     }
    //     // TODO Add turn on/off of draggability.
    //     // Updates all mobjects to account for the new simulator state
    //     update_mobjects_from_simulator(simulator: SpringSimulator) {
    //       let vals = simulator.get_vals() as Vec2D;
    //       this._update_mass(vals);
    //       this._update_string(vals);
    //       this._update_force_arrow(vals);
    //     }
    //     // Specific to this scene and simulator
    //     _update_mass(vals: Vec2D) {
    //       (this.get_mobj("mass") as Rectangle).move_to([vals[0], 0]);
    //     }
    //     _update_string(vals: Vec2D) {
    //       (this.get_mobj("spring") as LineSpring).move_end([vals[0], 0]);
    //     }
    //     _update_force_arrow(vals: Vec2D) {
    //       let force_arrow = this.get_mobj("force_arrow") as Arrow;
    //       force_arrow.move_start([vals[0], this.arrow_height]);
    //       force_arrow.move_end([
    //         vals[0] * (1 - this.arrow_length_scale),
    //         this.arrow_height,
    //       ]);
    //       force_arrow.set_arrow_size(
    //         Math.min(0.5, Math.sqrt(Math.abs(vals[0])) / 2),
    //       );
    //     }
    //     // Enforce strict order on drawing mobjects, overriding subclass behavior
    //     _draw() {
    //       this.draw_mobject(this.get_mobj("eq_line") as Line);
    //       this.draw_mobject(this.get_mobj("anchor") as Rectangle);
    //       this.draw_mobject(this.get_mobj("spring") as LineSpring);
    //       this.draw_mobject(this.get_mobj("mass") as Rectangle);
    //       this.draw_mobject(this.get_mobj("force_arrow") as Arrow);
    //     }
    //     draw_mobject(mobj: MObject) {
    //       mobj.draw(this.canvas, this);
    //     }
    //   }
    //   let scene = new PendulumScene(canvas_spring);
    //   scene.set_spring_mode("spring");
    //   scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

    //   handler.add_scene(graph_scene);
    //   handler.add_scene(scene);

    //   // Button which pauses/unpauses the simulation
    //   let pausebutton = handler.add_pause_button(
    //     document.getElementById(name + "-pause-button") as HTMLElement,
    //   );

    //   // Button which resets the simulation
    //   let resetButton = Button(
    //     document.getElementById(name + "-reset-button") as HTMLElement,
    //     function () {
    //       handler.add_to_queue(handler.reset.bind(handler));
    //       // handler.add_to_queue(graph_scene.clear.bind(graph_scene));
    //     },
    //   );
    //   resetButton.textContent = "Reset simulation";

    //   // Button which clears the old graphs
    //   let clearGraphButton = Button(
    //     document.getElementById(name + "-graph-clear-button") as HTMLElement,
    //     function () {
    //       handler.add_to_queue(graph_scene.clear.bind(graph_scene));
    //     },
    //   );
    //   clearGraphButton.textContent = "Clear graphs";

    //   // Slider which controls the propagation speed
    //   let w_slider = Slider(
    //     document.getElementById(name + "-stiffness-slider") as HTMLElement,
    //     function (val: number) {
    //       handler.add_to_queue(
    //         handler.set_simulator_attr.bind(handler, 0, "stiffness", val),
    //       );
    //       handler.add_to_queue(scene.set_spring_stiffness.bind(scene, val));
    //       // handler.add_to_queue(
    //       //   spring_scene.update_mobjects_from_simulator.bind(spring_scene, sim),
    //       // );
    //       handler.add_to_queue(handler.draw.bind(handler));
    //     },
    //     {
    //       name: "Spring stiffness",
    //       initial_value: `${sim.stiffness}`,
    //       min: 0,
    //       max: 20,
    //       step: 0.01,
    //     },
    //   );

    //   // Slider which controls friction
    //   let f_slider = Slider(
    //     document.getElementById(name + "-damping-slider") as HTMLElement,
    //     function (val: number) {
    //       handler.add_to_queue(
    //         handler.set_simulator_attr.bind(handler, 0, "friction", val),
    //       );
    //     },
    //     {
    //       name: "Friction",
    //       initial_value: "0.0",
    //       min: 0,
    //       max: 5.0,
    //       step: 0.01,
    //     },
    //   );

    //   handler.draw();
    //   handler.play(undefined);
    // })(300, 300);

    // TODO A pair of coupled springs in series.
    (function double_spring(width: number, height: number) {
      const name = "double-spring";
      // Prepare the canvases
      let canvas_spring = prepare_canvas(width, height, name);
      let canvas_graph = prepare_canvas(width, height, name + "-graph");

      let xmin = -6;
      let xmax = 6;
      let tmin = 0;
      let tmax = 12;
      let ymin = -6;
      let ymax = 6;
      let w = 5;

      // Make the simulator with reset condition
      // The first two values indicate the two masses' displacement from equilibrium.
      // The third and fourth values indicate the two velocities.
      class DoubleSpringSim extends StateSimulator {
        stiffness: number;
        friction: number = 0;
        constructor(stiffness: number, dt: number) {
          super(4, dt);
          this.stiffness = stiffness;
        }
        set_stiffness(stiffness: number) {
          this.stiffness = stiffness;
        }
        set_friction(friction: number) {
          this.friction = friction;
        }
        // Time-derivative of a given state and time. Overwritten in subclasses.
        dot(vals: Array<number>, time: number): Array<number> {
          let x0 = vals[0] as number;
          let x1 = vals[1] as number;
          return [
            vals[2] as number,
            vals[3] as number,
            -this.stiffness * x0 +
              this.stiffness * (x1 - x0) -
              this.friction * (vals[2] as number),
            -this.stiffness * (x1 - x0) - this.friction * (vals[3] as number),
          ];
        }
      }
      let sim = new DoubleSpringSim(w, 0.01);
      sim.set_vals([1, 0, 0, 0]);
      let handler = new InteractiveHandler(sim);

      // Add the two scenes, with callbacks
      class GraphScene extends SceneFromSimulator {
        step_counter: number = 0;
        num_graphs: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas);
          console.log("Re-initialized");
          this.set_frame_lims([tmin, tmax], [xmin, xmax]);
          let axes = new CoordinateAxes2d([tmin, tmax], [xmin, xmax]);

          this.add("axes", axes);
          this.add_graph();
          this.add(
            "dot_1",
            new Dot([0, sim.get_vals()[0] as number], 0.08).set_color("red"),
          );
          this.add(
            "dot_2",
            new Dot([0, sim.get_vals()[1] as number], 0.08).set_color("blue"),
          );
          this.draw();
        }
        add_graph() {
          this.num_graphs += 1;
          this.add(
            `graph${this.num_graphs - 1}_1`,
            new LineSequence([
              [0, sim.get_vals()[0] as number],
            ]).set_stroke_width(0.05),
          );
          this.add(
            `graph${this.num_graphs - 1}_2`,
            new LineSequence([
              [0, sim.get_vals()[1] as number],
            ]).set_stroke_width(0.05),
          );
          this.step_counter = 0;
          console.log("Added graph", this.num_graphs);
        }
        clear() {
          for (let i = 0; i < this.num_graphs - 1; i++) {
            this.remove(`graph${i}_1`);
            this.remove(`graph${i}_2`);
          }
          console.log("Removed graphs");
          let graph_1 = this.get_mobj(`graph${this.num_graphs - 1}_1`);
          this.remove(`graph${this.num_graphs - 1}_1`);
          this.add("graph0_1", graph_1);

          let graph_2 = this.get_mobj(`graph${this.num_graphs - 1}_2`);
          this.remove(`graph${this.num_graphs - 1}_2`);
          this.add("graph0_2", graph_2);

          this.num_graphs = 1;
        }
        reset() {
          this.add_graph();
        }
        update_mobjects_from_simulator(simulator: DoubleSpringSim) {
          let vals = simulator.get_vals();
          let time = simulator.time;
          this.step_counter += 1;
          // Implement update logic, calling from the simulator
          if (this.step_counter % 5 === 0 && time < this.xlims[1]) {
            (
              this.get_mobj(`graph${this.num_graphs - 1}_1`) as LineSequence
            ).add_point([time, vals[0] as number]);
            (this.get_mobj("dot_1") as Dot).move_to([time, vals[0] as number]);
            (
              this.get_mobj(`graph${this.num_graphs - 1}_2`) as LineSequence
            ).add_point([time, vals[1] as number]);
            (this.get_mobj("dot_2") as Dot).move_to([time, vals[1] as number]);
          }
        }
      }
      let graph_scene = new GraphScene(canvas_graph);

      class DoubleSpringScene extends SceneFromSimulator {
        arrow_length_scale: number = w / 3;
        arrow_height: number = 0;
        constructor(canvas: HTMLCanvasElement) {
          super(canvas);
          // TODO Set coordinates in terms of scene frame limits
          // Make fixed components
          let anchor = new Rectangle(
            [xmin + 0.1 * (xmax - xmin), 0],
            0.15,
            (ymax - ymin) * 0.7,
          );
          let eq_line_0 = new Line(
            [xmin + 0.4 * (xmax - xmin), ymin],
            [xmin + 0.4 * (xmax - xmin), ymax],
          )
            .set_stroke_width(0.05)
            .set_stroke_style("dashed")
            .set_stroke_color("gray");
          this.add("eq_line_0", eq_line_0);
          let eq_line_1 = new Line(
            [xmin + 0.7 * (xmax - xmin), ymin],
            [xmin + 0.7 * (xmax - xmin), ymax],
          )
            .set_stroke_width(0.05)
            .set_stroke_style("dashed")
            .set_stroke_color("gray");
          this.add("eq_line_1", eq_line_1);
          this.add("anchor", anchor);

          // Make springs
          let spring_0 = new LineSpring(
            [xmin + 0.1 * (xmax - xmin), 0],
            [xmin + 0.4 * (xmax - xmin), 0],
          ).set_stroke_width(0.08);
          spring_0.set_eq_length(1.5);

          let spring_1 = new LineSpring(
            [xmin + 0.4 * (xmax - xmin), 0],
            [xmin + 0.7 * (xmax - xmin), 0],
          ).set_stroke_width(0.08);
          spring_1.set_eq_length(1.5);

          // While the scene is paused, the point mass is an interactive element which can be dragged
          // to update the simulator state. While the scene is unpaused, the simulator runs and updates
          // the state of the point mass.
          let mass_0 = new DraggableRectangle(
            [xmin + 0.4 * (xmax - xmin), 0],
            0.8,
            0.8,
          );
          mass_0.draggable_x = true;
          mass_0.draggable_y = false;
          let mass_1 = new DraggableRectangle(
            [xmin + 0.7 * (xmax - xmin), 0],
            0.8,
            0.8,
          );
          mass_1.draggable_x = true;
          mass_1.draggable_y = false;

          this.add("spring_0", spring_0);
          this.add("spring_1", spring_1);
          this.add("mass_0", mass_0);
          this.add("mass_1", mass_1);

          // Add force arrows
          let force_arrow_0 = new Arrow(
            [0, this.arrow_height],
            [0, this.arrow_height],
          )
            .set_stroke_width(0.1)
            .set_stroke_color("red");
          this.add("force_arrow_0", force_arrow_0);
          let force_arrow_1 = new Arrow(
            [0, this.arrow_height],
            [0, this.arrow_height],
          )
            .set_stroke_width(0.1)
            .set_stroke_color("red");
          this.add("force_arrow_1", force_arrow_1);

          this.add_callbacks();
        }
        // Callback which affects the simulator and is removed when simulation is paused
        add_callbacks() {
          let mass_0 = this.get_mobj("mass_0") as DraggableRectangle;
          mass_0.add_callback(() => {
            let x1 = sim.get_vals()[1] as number;
            sim.set_vals([
              mass_0.get_center()[0] - (xmin + 0.4 * (xmax - xmin)),
              x1,
              0,
              0,
            ]);
            this.update_mobjects_from_simulator(sim);
          });

          let mass_1 = this.get_mobj("mass_1") as DraggableRectangle;
          mass_1.add_callback(() => {
            let x0 = sim.get_vals()[0] as number;
            sim.set_vals([
              x0,
              mass_1.get_center()[0] - (xmin + 0.7 * (xmax - xmin)),
              0,
              0,
            ]);
            this.update_mobjects_from_simulator(sim);
          });
        }
        set_spring_mode(mode: "color" | "spring") {
          let spring_0 = this.get_mobj("spring_0") as LineSpring;
          spring_0.set_mode(mode);
          let spring_1 = this.get_mobj("spring_1") as LineSpring;
          spring_1.set_mode(mode);
        }
        set_spring_stiffness(val: number) {
          this.arrow_length_scale = val / 3;
        }
        // TODO Add turn on/off of draggability.
        // Updates all mobjects to account for the new simulator state
        update_mobjects_from_simulator(simulator: DoubleSpringSim) {
          let vals = simulator.get_vals() as [number, number, number, number];
          this._update_mass(vals);
          this._update_spring(vals);
          this._update_force_arrow(vals);
        }
        // Specific to this scene and simulator
        _update_mass(vals: [number, number, number, number]) {
          let x0 = vals[0] as number;
          let x1 = vals[1] as number;
          (this.get_mobj("mass_0") as Rectangle).move_to([
            xmin + 0.4 * (xmax - xmin) + x0,
            0,
          ]);
          (this.get_mobj("mass_1") as Rectangle).move_to([
            xmin + 0.7 * (xmax - xmin) + x1,
            0,
          ]);
        }
        _update_spring(vals: [number, number, number, number]) {
          let x0 = vals[0] as number;
          let x1 = vals[1] as number;
          (this.get_mobj("spring_0") as LineSpring).move_end([
            xmin + 0.4 * (xmax - xmin) + x0,
            0,
          ]);
          (this.get_mobj("spring_1") as LineSpring).move_start([
            xmin + 0.4 * (xmax - xmin) + x0,
            0,
          ]);
          (this.get_mobj("spring_1") as LineSpring).move_end([
            xmin + 0.7 * (xmax - xmin) + x1,
            0,
          ]);
        }
        _update_force_arrow(vals: [number, number, number, number]) {
          let x0 = vals[0] as number;
          let x1 = vals[1] as number;
          let force_arrow_0 = this.get_mobj("force_arrow_0") as Arrow;
          force_arrow_0.move_start([
            xmin + 0.4 * (xmax - xmin) + x0,
            this.arrow_height,
          ]);
          force_arrow_0.move_end([
            xmin +
              0.4 * (xmax - xmin) +
              x0 -
              this.arrow_length_scale * (x0 - (x1 - x0)),
            this.arrow_height,
          ]);
          force_arrow_0.set_arrow_size(
            Math.min(0.5, Math.sqrt(Math.abs(x0 - (x1 - x0))) / 2),
          );
          let force_arrow_1 = this.get_mobj("force_arrow_1") as Arrow;
          force_arrow_1.move_start([
            xmin + 0.7 * (xmax - xmin) + x1,
            this.arrow_height,
          ]);
          force_arrow_1.move_end([
            xmin +
              0.7 * (xmax - xmin) +
              x1 -
              this.arrow_length_scale * (x1 - x0),
            this.arrow_height,
          ]);
          force_arrow_1.set_arrow_size(
            Math.min(0.5, Math.sqrt(Math.abs(x1 - x0)) / 2),
          );
        }
        // Enforce strict order on drawing mobjects, overriding subclass behavior
        _draw() {
          this.draw_mobject(this.get_mobj("eq_line_0") as Line);
          this.draw_mobject(this.get_mobj("eq_line_1") as Line);
          this.draw_mobject(this.get_mobj("anchor") as Rectangle);
          this.draw_mobject(this.get_mobj("spring_0") as LineSpring);
          this.draw_mobject(this.get_mobj("spring_1") as LineSpring);
          this.draw_mobject(this.get_mobj("mass_0") as Rectangle);
          this.draw_mobject(this.get_mobj("mass_1") as Rectangle);
          this.draw_mobject(this.get_mobj("force_arrow_0") as Arrow);
          this.draw_mobject(this.get_mobj("force_arrow_1") as Arrow);
        }
        draw_mobject(mobj: MObject) {
          mobj.draw(this.canvas, this);
        }
      }
      let spring_scene = new DoubleSpringScene(canvas_spring);
      spring_scene.set_spring_mode("spring");
      spring_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      handler.add_scene(graph_scene);
      handler.add_scene(spring_scene);

      // Button which pauses/unpauses the simulation
      let pausebutton = handler.add_pause_button(
        document.getElementById(name + "-pause-button") as HTMLElement,
      );

      // Button which resets the simulation
      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          handler.add_to_queue(handler.reset.bind(handler));
          // handler.add_to_queue(graph_scene.clear.bind(graph_scene));
        },
      );
      resetButton.textContent = "Reset simulation";

      // Button which clears the old graphs
      let clearGraphButton = Button(
        document.getElementById(name + "-graph-clear-button") as HTMLElement,
        function () {
          handler.add_to_queue(graph_scene.clear.bind(graph_scene));
        },
      );
      clearGraphButton.textContent = "Clear graphs";

      // Slider which controls the propagation speed
      let w_slider = Slider(
        document.getElementById(name + "-stiffness-slider") as HTMLElement,
        function (val: number) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "stiffness", val),
          );
          handler.add_to_queue(
            spring_scene.set_spring_stiffness.bind(spring_scene, val),
          );
          // handler.add_to_queue(
          //   spring_scene.update_mobjects_from_simulator.bind(spring_scene, sim),
          // );
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
        document.getElementById(name + "-damping-slider") as HTMLElement,
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

    // TODO A double pendulum.
  });
})();
