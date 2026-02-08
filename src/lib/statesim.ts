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
export abstract class Simulator {
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
    this.set_boundary_conditions(this.vals, 0);
  }
  // Generic setter.
  set_attr(name: string, val: any) {
    if ((name as keyof typeof Simulator) in this) {
      this[name as keyof typeof Simulator] = val;
    }
  }
  // Getter and setter for state.
  get_vals(): Array<number> {
    return this.vals;
  }
  set_vals(vals: Array<number>) {
    this.vals = vals;
  }
  set_val(index: number, value: number) {
    this.vals[index] = value;
  }
  // Time-derivative of a given state and time. Overwritten in subclasses.
  dot(vals: Array<number>, time: number): Array<number> {
    return new Array(this.state_size).fill(0);
  }
  // Subroutine for adding any time-evolution calculation
  // which does not adhere to the differential equation. Used in step().
  set_boundary_conditions(s: Array<number>, t: number): void {}
  // Advances the simulation using the differential equation with
  // s(t + dt) = s(t) + dt * s'(t)
  step_finite_diff() {
    let newS = new Array(this.state_size).fill(0);
    let dS = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS[i] as number);
    }
    this.set_boundary_conditions(newS, this.time + this.dt);
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
    this.set_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_2 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (this.dt / 2) * (dS_2[i] as number);
    }
    this.set_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_3 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS_3[i] as number);
    }
    this.set_boundary_conditions(newS, this.time + this.dt);

    let dS_4 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] =
        (this.vals[i] as number) +
        (this.dt / 6) * (dS_1[i] as number) +
        (this.dt / 3) * (dS_2[i] as number) +
        (this.dt / 3) * (dS_3[i] as number) +
        (this.dt / 6) * (dS_4[i] as number);
    }
    this.set_boundary_conditions(newS, this.time + this.dt);
    this.set_vals(newS);
    this.time += this.dt;
  }
  step() {
    return this.step_runge_kutta();
  }
}

// Simulator for a simple vibrating spring with equilibrium position 0
export class SpringSimulator extends Simulator {
  stiffness: number;
  friction: number = 0;
  constructor(stiffness: number, dt: number) {
    super(2, dt);
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
    return [
      vals[1] as number,
      -this.stiffness * (vals[0] as number) -
        this.friction * (vals[1] as number),
    ];
  }
}

// A simulator where a subset of the state can be drawn in one dimensions
export interface OneDimDrawable {
  width: number;
  get_uValues(): Array<number>;
}

// TODO Methods associated to a state which is a one-dimensional grid of values,
// representing a function f : R -> R.

// A simulator where a subset of the state can be drawn in two dimensions
export interface TwoDimDrawable {
  width: number;
  height: number;
  get_uValues(): Array<number>;
}

type Constructor = new (...args: any[]) => {};

// Methods associated to a state which is a two-dimensional grid of values,
// representing a function f : R^2 -> R.
// TODO Turn this into a Mixin.
export class TwoDimState {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  index(x: number, y: number) {
    return y * this.width + x;
  }
  // One-sided derivative f(x + 1) - f(x)
  d_x_plus(arr: Array<number>, x: number, y: number): number {
    if (x == this.width - 1) {
      return -(arr[this.index(x, y)] as number);
    } else {
      return (
        (arr[this.index(x + 1, y)] as number) -
        (arr[this.index(x, y)] as number)
      );
    }
  }
  // One-sided derivative f(x) - f(x - 1)
  d_x_minus(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return arr[this.index(x, y)] as number;
    } else {
      return (
        (arr[this.index(x, y)] as number) -
        (arr[this.index(x - 1, y)] as number)
      );
    }
  }
  // One-sided derivative f(y + 1) - f(y)
  d_y_plus(arr: Array<number>, x: number, y: number): number {
    if (y == this.height - 1) {
      return -(arr[this.index(x, y)] as number);
    } else {
      return (
        (arr[this.index(x, y + 1)] as number) -
        (arr[this.index(x, y)] as number)
      );
    }
  }
  // One-sided derivative f(y) - f(y - 1)
  d_y_minus(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return arr[this.index(x, y)] as number;
    } else {
      return (
        (arr[this.index(x, y)] as number) -
        (arr[this.index(x, y - 1)] as number)
      );
    }
  }
  // d/dx, computed as (f(x + 1) - f(x - 1)) / 2.
  d_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        (2 * (arr[this.index(2, y)] as number) -
          2 * (arr[this.index(0, y)] as number) -
          (arr[this.index(3, y)] as number) +
          (arr[this.index(1, y)] as number)) /
        2
      );
    } else if (x == this.width - 1) {
      return (
        (2 * (arr[this.index(this.width - 1, y)] as number) -
          2 * (arr[this.index(this.width - 3, y)] as number) -
          (arr[this.index(this.width - 2, y)] as number) +
          (arr[this.index(this.width - 4, y)] as number)) /
        2
      );
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        2
      );
    }
  }
  // d/dy, computed as (f(y + 1) - f(y - 1)) / 2.
  d_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        (2 * (arr[this.index(x, 2)] as number) -
          2 * (arr[this.index(x, 0)] as number) -
          (arr[this.index(x, 3)] as number) +
          (arr[this.index(x, 1)] as number)) /
        2
      );
    } else if (y == this.height - 1) {
      return (
        (2 * (arr[this.index(x, this.height - 1)] as number) -
          2 * (arr[this.index(x, this.height - 3)] as number) -
          (arr[this.index(x, this.height - 2)] as number) +
          (arr[this.index(x, this.height - 4)] as number)) /
        2
      );
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        2
      );
    }
  }
  // (d/dx)^2, computed as f(x + 1) - 2f(x) + f(x - 1).
  // At the boundaries, use a linear extrapolation.
  // TODO Maybe better to assume zero outside of the array.
  l_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        2 * (arr[this.index(0, y)] as number) -
        5 * (arr[this.index(1, y)] as number) +
        4 * (arr[this.index(2, y)] as number) -
        (arr[this.index(3, y)] as number)
      );
    } else if (x == this.width - 1) {
      return (
        2 * (arr[this.index(this.width - 1, y)] as number) -
        5 * (arr[this.index(this.width - 2, y)] as number) +
        4 * (arr[this.index(this.width - 3, y)] as number) -
        (arr[this.index(this.width - 4, y)] as number)
      );
    } else {
      return (
        (arr[this.index(x + 1, y)] as number) -
        2 * (arr[this.index(x, y)] as number) +
        (arr[this.index(x - 1, y)] as number)
      );
    }
  }
  // (d/dy)^2, computed as f(y + 1) - 2f(y) + f(y - 1).
  l_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        2 * (arr[this.index(x, 0)] as number) -
        5 * (arr[this.index(x, 1)] as number) +
        4 * (arr[this.index(x, 2)] as number) -
        (arr[this.index(x, 3)] as number)
      );
    } else if (y == this.height - 1) {
      return (
        2 * (arr[this.index(x, this.height - 1)] as number) -
        5 * (arr[this.index(x, this.height - 2)] as number) +
        4 * (arr[this.index(x, this.height - 3)] as number) -
        (arr[this.index(x, this.height - 4)] as number)
      );
    } else {
      return (
        (arr[this.index(x, y + 1)] as number) -
        2 * (arr[this.index(x, y)] as number) +
        (arr[this.index(x, y - 1)] as number)
      );
    }
  }
}

// Base class which controls interactive simulations which evolve according to a differential equation
export abstract class InteractivePlayingScene extends Scene {
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

// TODO Write a Renderer class elsewhere.
