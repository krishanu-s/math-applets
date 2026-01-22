// This file contains classes which are used to define a simulation running in
// real-time, with interactivity from the user. By "simulation", we mean
// dynamical systems governed by, e.g., a differential equation or
// repeated iteration of a map.
//
// The underlying state of such a system is represented by the "Simulator" class.
//
// This is housed within an "InteractivePlayingScene", through which the
// user interacts, and which also handles rendering.

import { Scene, MObject } from "./base.js";

// The basic state/simulator class. The state s(t) advances according to the differential equation
// s'(t) = dot(s(t), t)
export class Simulator {
  vals: Array<number>; // Array of values storing the state
  state_size: number; // Size of the array of values storing the state
  time: number = 0; // Timestamp in the worldline of the simulator
  dt: number; // Length of time in each simulation step
  constructor(state_size: number, dt: number) {
    this.state_size = state_size;
    this.vals = new Array(this.state_size).fill(0);
    this.dt = dt;
  }
  // Resets the simulation
  reset() {
    this.vals = new Array(this.state_size).fill(0);
    this.time = 0;
    this.add_boundary_conditions(this.vals, 0);
  }
  // Generic setter.
  set_attr(name: keyof typeof Simulator, val: any) {
    if (name in this) {
      this[name] = val;
    }
  }
  // Getter and setter for state.
  get_vals(): Array<number> {
    return this.vals;
  }
  set_vals(vals: Array<number>) {
    this.vals = vals;
  }
  // Time-derivative of a given state and time. Overwritten in subclasses.
  dot(vals: Array<number>, time: number): Array<number> {
    return new Array(this.state_size).fill(0);
  }
  // Subroutine for adding any time-evolution calculation
  // which does not adhere to the differential equation. Used in step().
  add_boundary_conditions(s: Array<number>, t: number): void {}
  // Advances the simulation using the differential equation with
  // s(t + dt) = s(t) + dt * s'(t)
  step_finite_diff() {
    let newS = new Array(this.state_size).fill(0);
    let dS = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
    this.set_vals(newS);
    this.time += this.dt;
  }
  // Advances the simulation using the differential equation with the Runge-Kutta method.
  step_runge_kutta() {
    let newS = new Array(this.state_size).fill(0);

    let dS_1 = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (this.dt / 2) * (dS_1[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_2 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (this.dt / 2) * (dS_2[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_3 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS_3[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);

    let dS_4 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] =
        (this.vals[i] as number) +
        (this.dt / 6) * (dS_1[i] as number) +
        (this.dt / 3) * (dS_2[i] as number) +
        (this.dt / 3) * (dS_3[i] as number) +
        (this.dt / 6) * (dS_4[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
    this.set_vals(newS);
    this.time += this.dt;
  }
  step() {
    return this.step_runge_kutta();
  }
}

// A simulator where a subset of the state can be drawn in one dimensions
export interface OneDimDrawable {
  width: number;
  get_uValues(): Array<number>;
}

// A simulator where a subset of the state can be drawn in two dimensions
export interface TwoDimDrawable {
  width: number;
  height: number;
  get_uValues(): Array<number>;
}

// Base class which controls interactive simulations
export class InteractivePlayingScene extends Scene {
  simulators: Record<number, Simulator>; // The internal simulator
  num_simulators: number;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  time: number;
  dt: number;
  end_time: number | undefined; // Store a known end-time in case the simulation is paused and unpaused
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
  get_simulator(ind: number): Simulator {
    return this.simulators[ind] as Simulator;
  }
  set_simulator_attr(
    simulator_ind: number,
    attr_name: string,
    attr_val: number,
  ) {
    this.get_simulator(simulator_ind).set_attr(
      attr_name as keyof typeof Simulator,
      attr_val,
    );
  }
  // Restarts the simulator
  reset(): void {
    for (let ind = 0; ind < this.num_simulators; ind++) {
      this.get_simulator(ind).reset();
    }
    this.time = 0;
    this.draw();
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
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates all mobjects to account for the new simulator state
  update_mobjects() {}
  // Draws the scene.
  draw() {
    // TODO Move canvas manipulation into the renderer.
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update_mobjects();
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      // TODO Move mobject-drawing into the renderer?
      this.draw_mobject(mobj);
    });
  }
  // Add drawing instructions in the subclass.
  draw_mobject(mobj: MObject) {}
}

// TODO Write a Renderer class elsewhere.
