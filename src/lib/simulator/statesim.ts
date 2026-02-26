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

// A simulator where a subset of the state can be drawn on the surface of a sphere
export interface SphericalDrawable {
  num_theta: number;
  num_phi: number;
  get_uValues(): Array<number>;
  // Outputs an array of size (num_theta, num_phi) to be printed on a sphere.
  get_drawable(): Array<number>;
}

// Represents a function on S^2 in spherical coordinates as an array of values
// f(θ, φ) where θ ∈ [0, π] and φ ∈ [0, 2π], i.e. θ proceeds along the inner index
// and φ proceeds along the outer index.
export class SphericalState {
  num_theta: number;
  num_phi: number;
  constructor(num_theta: number, num_phi: number) {
    if (num_phi % 2 !== 0) {
      throw new Error("num_phi must be even");
    }
    this.num_theta = num_theta;
    this.num_phi = num_phi;
  }
  index(theta: number, phi: number) {
    return theta + phi * (this.num_theta + 1);
  }
  new_arr(): Array<number> {
    return new Array<number>((this.num_theta + 1) * this.num_phi).fill(0);
  }
  // Takes an array of shape (num_theta + 1, num_phi) and downshifts it to shape (num_theta, num_phi)
  // by averaging adjacent rows.
  downshift_values(vals: Array<number>): Array<number> {
    let downshifted_vals = new Array<number>(this.num_theta * this.num_phi);
    let ind;
    for (let phi = 0; phi < this.num_phi; phi++) {
      for (let theta = 0; theta < this.num_theta; theta++) {
        ind = phi * this.num_theta + theta;
        let val =
          ((vals[this.index(theta, phi)] as number) +
            (vals[this.index(theta + 1, phi)] as number)) /
          2;
        downshifted_vals[ind] = val;
      }
    }
    return downshifted_vals;
  }
  dtheta() {
    return Math.PI / this.num_theta;
  }
  dphi() {
    return (2 * Math.PI) / this.num_phi;
  }
  get_val(arr: Array<number>, theta: number, phi: number): number {
    return arr[this.index(theta, phi)] as number;
  }
  l_entry(arr: Array<number>, theta: number, phi: number): number {
    let theta_val = (theta * Math.PI) / this.num_theta;
    let l_theta: number, l_phi: number;
    if (theta == 0) {
      // North pole
      l_theta = -this.num_phi * this.get_val(arr, 0, phi);
      for (let p = 0; p < this.num_phi; p++) {
        l_theta += this.get_val(arr, 1, p);
      }
      l_theta *= 2 / this.num_phi;
      l_theta *= 1 / this.dtheta() ** 2;
      // console.log(l_theta, theta, phi);
      return l_theta;
    } else if (theta == this.num_theta) {
      // South pole
      l_theta = -this.num_phi * this.get_val(arr, this.num_theta, phi);
      for (let p = 0; p < this.num_phi; p++) {
        l_theta += this.get_val(arr, this.num_theta - 1, p);
      }
      l_theta *= 2 / this.num_phi;
      l_theta *= 1 / this.dtheta() ** 2;
      // console.log(l_theta, theta, phi);
      return l_theta;
    } else {
      // Generic case
      l_theta =
        (this.get_val(arr, theta + 1, phi) +
          this.get_val(arr, theta - 1, phi) -
          2 * this.get_val(arr, theta, phi)) /
        this.dtheta() ** 2;
      l_theta +=
        (this.get_val(arr, theta + 1, phi) -
          this.get_val(arr, theta - 1, phi)) /
        (2 * this.dtheta() * Math.tan(theta_val));
      l_phi =
        (this.get_val(arr, theta, (phi + 1) % this.num_phi) +
          this.get_val(arr, theta, (phi + this.num_phi - 1) % this.num_phi) -
          2 * this.get_val(arr, theta, phi)) /
        (this.dphi() * Math.sin(theta_val)) ** 2;
      // console.log(l_theta, l_phi, theta, phi);
      return l_theta + l_phi;
    }
  }
}

// TODO Write a Renderer class elsewhere.
