// This file contains classes which are used to define a simulation running in
// real-time, with interactivity from the user. By "simulation", we mean
// dynamical systems governed by, e.g., a differential equation or
// repeated iteration of a map.
//
// The underlying state of such a system is represented by the "Simulator" class.
//
// This is housed within an "InteractivePlayingScene", through which the
// user interacts, and which also handles rendering.

import { Scene, MObject } from "../base";
import { Button } from "../interactive.js";
import {
  SceneFromSimulator,
  ThreeDSceneFromSimulator,
} from "../interactive_handler.js";
import { ThreeDScene } from "../three_d/scene.js";

// A generic simulator which can be used to simulate a system.
export abstract class Simulator {
  time: number = 0; // Timestamp in the worldline of the simulator
  dt: number; // Length of time in each simulation step
  constructor(dt: number) {
    this.dt = dt;
  }
  reset() {
    this.time = 0;
  }
  step() {
    this.time += this.dt;
  }
  // Generic setter.
  set_attr(name: string, val: any) {
    if ((name as keyof typeof Simulator) in this) {
      this[name as keyof typeof Simulator] = val;
    }
  }
}

// Base class which controls interactive simulations which evolve according to a differential equation
// TODO Add reset button
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

// Identical extension of ThreeDScene as InteractivePlayingScene is of Scene
export abstract class InteractivePlayingThreeDScene extends ThreeDScene {
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
    this.linked_scenes = [];
  }
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
  update_and_draw_linked_scenes() {
    for (let scene of this.linked_scenes) {
      scene.update_mobjects_from_simulator(this.get_simulator(0));
      scene.draw();
    }
  }
  // Restarts the simulator
  reset(): void {
    for (let ind = 0; ind < this.num_simulators; ind++) {
      this.get_simulator(ind).reset();
    }
    this.time = 0;
    this.draw();
    this.update_and_draw_linked_scenes();
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
        this.update_and_draw_linked_scenes();
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates all mobjects to account for the new simulator state
  update_mobjects() {}
  // Draws the scene without worrying about depth-sensing.
  // TODO Sort this out later.
  draw() {
    this.update_mobjects();

    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      this.draw_mobject(mobj);
    });
  }
  // Add drawing instructions in the subclass.
  draw_mobject(mobj: MObject) {}
}
