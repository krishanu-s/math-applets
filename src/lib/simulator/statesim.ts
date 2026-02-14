// Simulators whose internal state is a vector of numbers.
import { Simulator } from "./sim.js";

// The basic state/simulator class. The state s(t) advances according to the differential equation
// s'(t) = dot(s(t), t)
export class StateSimulator extends Simulator {
  vals: Array<number>; // Array of values storing the state
  state_size: number; // Size of the array of values storing the state
  constructor(state_size: number, dt: number) {
    super(dt);
    this.state_size = state_size;
    this.vals = new Array(this.state_size).fill(0);
  }
  // Resets the simulation
  reset() {
    super.reset();
    this.vals = new Array(this.state_size).fill(0);
    this.set_boundary_conditions(this.vals, 0);
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
export class SpringSimulator extends StateSimulator {
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

// A simulator where a subset of the state can be drawn in two dimensions
export interface TwoDimDrawable {
  width: number;
  height: number;
  get_uValues(): Array<number>;
}

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

// TODO Write a Renderer class elsewhere.
