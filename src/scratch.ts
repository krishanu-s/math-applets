import { MObject, Scene, Dot, Line, prepare_canvas } from "./base.js";
import { Slider, Button } from "./interactive.js";
import { Vec2D, clamp, sigmoid } from "./base.js";
import { ParametricFunction } from "./parametric.js";
import { HeatMap } from "./heatmap.js";

// Aspirational structure for interactive, animated simulations, with several layers:
//
// "State": The lowest level. Encodes the state of the system being simulated. This contains
// - dynamically-evolving quantities such as positions, velocities, etc. as an array of numbers.
// - time value
// - a method ("dot") to calculate the time-derivative of said quantities
// - a method to add boundary conditions afterward
// - parameters such as gravity, material properties, etc. as attributes which can be set interactively
// A key method is the differential equation
//
// "Simulator": This is a thin layer which implements different finite-element ways of solving
// a differential equation (such as finite-difference and Runge-Kutta) and contains the
// user-settable elements of the State (such as gravity strength, energy, etc).
// (TO BE IMPLEMENTED IN FUTURE, CURRENTLY PART OF BOTH STATE AND SCENE)
//
// "InteractivePlayingScene": Contains logic for pausing/playing, drawing, and taking commands
// (from e.g. the user) which are queued up for execution. Extends "Scene".
// Note that execution of a user-command might involve setting values at the lower level.
//
// "Renderer": This is the portion which interacts with the canvas. Takes commands from the Scene.
// (TO BE IMPLEMENTED IN FUTURE, CURRENTLY PART OF SCENE)

// TODO Figure out how to use this new type which is an array of size state_size.
type StateVals<T, ALength extends number> = [T, ...T[]] & { length: ALength };

// *** STATE/SIMULATOR ***

// Interface for a simulator defined on a 2D grid, whose heatmap can be drawn
interface HeatMapDrawable {
  width: number;
  height: number;
  get_uValues(): Array<number>;
}

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
  // Generic setter, for interactivity
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
  // NOTE: This is just for testing purposes. This appears to be pretty numerically unstable
  // unless dt is set very small.
  step_finite_diff() {
    let newS = new Array(this.state_size).fill(0);
    let dS = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
    console.log(newS[20101]);
    this.set_vals(newS);
    this.time += this.dt;
  }
  // Advances the simulation using the differential equation with the Runge-Kutta method.
  step_runge_kutta() {
    let newS = new Array(this.state_size).fill(0);

    let dS_1 = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (this.dt / 2) * (dS_1[i] as number);
      if (Math.abs(newS[i]) > 1000) {
        console.log(
          1,
          Math.floor(i / 40000),
          Math.floor(i / 200) % 200,
          i % 200,
          newS[i],
        );
      }
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_2 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (this.dt / 2) * (dS_2[i] as number);
      if (Math.abs(newS[i]) > 1000) {
        console.log(
          2,
          Math.floor(i / 40000),
          Math.floor(i / 200) % 200,
          i % 200,
          newS[i],
        );
      }
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_3 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS_3[i] as number);
      if (Math.abs(newS[i]) > 1000) {
        console.log(
          3,
          Math.floor(i / 40000),
          Math.floor(i / 200) % 200,
          i % 200,
          newS[i],
        );
      }
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

// Example: Wave equation simulation for a function R^2 -> R
// Ref: https://arxiv.org/pdf/1001.0319, equation (2.14).
// A scalar field in (2+1)-D, u(x, y, t), evolving according to the wave equation formulated as
// du/dt   = v
// dv/dt   = (c**2) * (Lu) - (\sigma_x + \sigma_y) * v - \sigma_x * \sigma_y * u + (dp_x/dx + dp_y / dy)
// dp_x/dt = -\sigma_x * p_x + (c**2) * (\sigma_y - \sigma_x) * du/dx
// dp_y/dt = -\sigma_y * p_y + (c**2) * (\sigma_x - \sigma_y) * du/dy
//
// where p = (p_x, p_y) is an auxiliary field introduced to handle PML at the boundaries.
// When the functions \sigma_x and \sigma_y are both 0, we retrieve the undamped wave equation.
export class WaveSimTwoDim extends Simulator implements HeatMapDrawable {
  width: number;
  height: number;
  pml_strength: number = 5.0; // PML strength scales as this value times a quadratic
  pml_width: number = 0.2; // Thickness of PML layer on one side, divided by half of the region width
  wave_propagation_speed: number = 10.0; // Speed of wave propagation
  constructor(width: number, height: number, dt: number) {
    super(4 * width * height, dt);
    this.width = width;
    this.height = height;
  }
  // Sets the initial conditions of the simulation
  set_init_conditions(x0: Array<number>, v0: Array<number>): void {
    for (let i = 0; i < this.size(); i++) {
      this.vals[i] = x0[i] as number;
      this.vals[i + this.size()] = v0[i] as number;
      this.vals[i + 2 * this.size()] = 0;
      this.vals[i + 3 * this.size()] = 0;
    }
    this.time = 0;
    this.add_boundary_conditions(this.vals, this.time);
  }
  // *** HELPER FUNCTIONS ***
  // Size of the 2D grid
  size(): number {
    return this.width * this.height;
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Named portions of the state values
  get_uValues(): Array<number> {
    return this._get_uValues(this.vals);
  }
  _get_uValues(vals: Array<number>): Array<number> {
    return vals.slice(0, this.size());
  }
  _get_vValues(vals: Array<number>): Array<number> {
    return vals.slice(this.size(), 2 * this.size());
  }
  _get_pxValues(vals: Array<number>): Array<number> {
    return vals.slice(2 * this.size(), 3 * this.size());
  }
  _get_pyValues(vals: Array<number>): Array<number> {
    return vals.slice(3 * this.size(), 4 * this.size());
  }
  // *** ARRAY FUNCTIONS USED IN SIMULATION, NOT TO BE CHANGED ***
  // PML damping functions
  sigma_x(arr_x: number): number {
    return this._sigma(arr_x, this.width);
  }
  sigma_y(arr_y: number): number {
    return this._sigma(arr_y, this.height);
  }
  _sigma(arr_val: number, arr_size: number): number {
    let l = Math.abs(arr_val / (arr_size / 2) - 1);
    if (l > 1 - this.pml_width) {
      return this.pml_strength * l ** 2;
    } else {
      return 0;
    }
  }
  // *** TODO Move these into the "reflector" class
  // One-sided derivative (f(x + a) - f(x)) / a
  d_x_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (x == this.width - 1) {
      return -(arr[this.index(x, y)] as number) / a_plus;
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x, y)] as number)) /
        a_plus
      );
    }
  }
  // One-sided derivative (f(x) - f(x - a)) / a
  d_x_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (x == 0) {
      return (arr[this.index(x, y)] as number) / a_minus;
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        a_minus
      );
    }
  }
  // One-sided derivative (f(y + a) - f(y)) / a
  d_y_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (y == this.height - 1) {
      return -(arr[this.index(x, y)] as number) / a_plus;
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y)] as number)) /
        a_plus
      );
    }
  }
  // One-sided derivative (f(y) - f(y - a)) / a
  d_y_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (y == 0) {
      return (arr[this.index(x, y)] as number) / a_minus;
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        a_minus
      );
    }
  }
  // ***
  // d/dx.
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
  // d/dy.
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
  // (d/dx)^2.
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
  // (d/dy)^2.
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
  // (d/dx)^2 + (d/dy)^2
  laplacian_entry(vals: Array<number>, x: number, y: number): number {
    return this.l_x_entry(vals, x, y) + this.l_y_entry(vals, x, y);
  }
  // Constructs the time-derivative of the entire state array.
  dot(vals: Array<number>, time: number): Array<number> {
    let dS = new Array(this.state_size);
    let ind, sx, sy;
    let u = this._get_uValues(vals);
    let px = this._get_pxValues(vals);
    let py = this._get_pyValues(vals);

    // u dot
    for (let ind = 0; ind < this.size(); ind++) {
      dS[ind] = vals[ind + this.size()] as number;
    }

    // v dot
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        dS[ind + this.size()] =
          this.wave_propagation_speed ** 2 * this.laplacian_entry(u, x, y) +
          this.d_x_entry(px, x, y) +
          this.d_y_entry(py, x, y) -
          (this.sigma_x(x) + this.sigma_y(y)) *
            (vals[ind + this.size()] as number) -
          this.sigma_x(x) * this.sigma_y(y) * (vals[ind] as number);
      }
    }

    // px dot
    for (let x = 0; x < this.width; x++) {
      sx = this.sigma_x(x);
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        dS[ind + 2 * this.size()] =
          -sx * (px[ind] as number) +
          this.wave_propagation_speed ** 2 *
            (this.sigma_y(y) - sx) *
            this.d_x_entry(u, x, y);
      }
    }

    // py dot
    for (let y = 0; y < this.height; y++) {
      sy = this.sigma_y(y);
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        dS[ind + 3 * this.size()] =
          -sy * (py[ind] as number) +
          this.wave_propagation_speed ** 2 *
            (this.sigma_x(x) - sy) *
            this.d_y_entry(u, x, y);
      }
    }

    return dS;
  }
}

// TODO Allow multiple sources, of the form {ind => (p_x, p_y, a, w, phase)}
// TODO Allow this interface to stack with others.
export class WaveSimTwoDimPointSource extends WaveSimTwoDim {
  source_x: number = Math.floor(this.width / 2);
  source_y: number = Math.floor(this.height / 2);
  w: number = 2.0; // Frequency
  a: number = 5.0; // Amplitude
  add_boundary_conditions(vals: Array<number>, t: number): void {
    let ind = this.index(Math.floor(this.source_x), Math.floor(this.source_y));
    vals[ind] = this.a * Math.sin(this.w * t);
    vals[ind + this.size()] = this.a * this.w * Math.cos(this.w * t);
  }
}

// A simulation of the wave equation whose domain is a subset of the grid points, circumscribed by
// a "reflective surface" which is described as the zero-set of an equation f(x, y).
// TODO No reason not to use Mixins here to inherit point sources and reflectors independently.
interface Reflector {
  x_pos_mask: Array<number>;
  x_neg_mask: Array<number>;
  y_pos_mask: Array<number>;
  y_neg_mask: Array<number>;
  inside_region(x: number, y: number): boolean;
  _recalculate_masks(): void;
  _calc_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
  _calc_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
  get_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
  get_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
}

export class WaveSimTwoDimReflector extends WaveSimTwoDim implements Reflector {
  // For each point p in the domain, and each possible direction N, S, E, W,
  // if the adjacent grid point to p in the chosen direction lies outside
  // of the domain, then we note down the distance to the region boundary in that direction.
  // Otherwise, we note the number 1 (which is the maximum possible value).
  x_pos_mask: Array<number> = new Array(this.size()).fill(1);
  x_neg_mask: Array<number> = new Array(this.size()).fill(1);
  y_pos_mask: Array<number> = new Array(this.size()).fill(1);
  y_neg_mask: Array<number> = new Array(this.size()).fill(1);
  constructor(width: number, height: number, dt: number) {
    super(width, height, dt);
    this._recalculate_masks();
  }
  set_attr(name: keyof typeof Simulator, val: any) {
    super.set_attr(name, val);
    this._recalculate_masks();
    this.zero_outside_region();
  }
  // *** Encodes geometry ***
  // Returns whether the point (x, y) in array coordinates is inside the domain.
  inside_region(x: number, y: number): boolean {
    return true;
  }
  // Helper functions which return the fraction of leeway right, left, up and down
  // from the given array lattice point to the boundary.
  _x_plus(x: number, y: number): number {
    return 1;
  }
  _x_minus(x: number, y: number): number {
    return 1;
  }
  _y_plus(x: number, y: number): number {
    return 1;
  }
  _y_minus(x: number, y: number): number {
    return 1;
  }
  // Recalculate mask arrays based on current geometry
  _recalculate_masks() {
    let ind;
    for (let y_arr = 0; y_arr < this.height; y_arr++) {
      for (let x_arr = 0; x_arr < this.width; x_arr++) {
        ind = this.index(x_arr, y_arr);
        [this.x_pos_mask[ind], this.x_neg_mask[ind]] = this._calc_bdy_dists_x(
          x_arr,
          y_arr,
        );
        [this.y_pos_mask[ind], this.y_neg_mask[ind]] = this._calc_bdy_dists_y(
          x_arr,
          y_arr,
        );
      }
    }
  }
  // [0, 0] / [1, 1] means an exterior / interior point
  // A value between 0 and 1 in the first coordinate means moving to the right crosses the boundary
  // A value between 0 and 1 in the second coordinate means moving to the left crosses the boundary
  _calc_bdy_dists_x(x_arr: number, y_arr: number): Vec2D {
    if (!this.inside_region(x_arr, y_arr)) {
      // Exterior case
      return [0, 0];
    } else {
      let a_pos, a_neg;
      if (!this.inside_region(x_arr + 1, y_arr)) {
        // Near right boundary case, and x is positive
        a_pos = this._x_plus(x_arr, y_arr);
      } else {
        a_pos = 1;
      }
      if (!this.inside_region(x_arr - 1, y_arr)) {
        // Near left boundary case, and x is negative
        a_neg = this._x_minus(x_arr, y_arr);
      } else {
        a_neg = 1;
      }
      return [a_pos, a_neg];
    }
  }
  _calc_bdy_dists_y(x_arr: number, y_arr: number): Vec2D {
    if (!this.inside_region(x_arr, y_arr)) {
      // Exterior case
      return [0, 0];
    } else {
      let a_plus, a_minus;
      if (!this.inside_region(x_arr, y_arr + 1)) {
        // Near boundary case
        a_plus = this._y_plus(x_arr, y_arr);
      } else {
        a_plus = 1;
      }
      if (!this.inside_region(x_arr, y_arr - 1)) {
        // Near boundary case
        a_minus = this._y_minus(x_arr, y_arr);
      } else {
        a_minus = 1;
      }
      return [a_plus, a_minus];
    }
  }
  // Sets all points outside the region to 0
  zero_outside_region() {
    let ind;
    for (let y_arr = 0; y_arr < this.height; y_arr++) {
      for (let x_arr = 0; x_arr < this.width; x_arr++) {
        if (!this.inside_region(x_arr, y_arr)) {
          ind = this.index(x_arr, y_arr);
          this.vals[ind] = 0;
          this.vals[ind + this.size()] = 0;
          this.vals[ind + 2 * this.size()] = 0;
          this.vals[ind + 3 * this.size()] = 0;
        }
      }
    }
  }
  // *** Called during simulation ***
  get_bdy_dists_x(x_arr: number, y_arr: number): Vec2D {
    return [
      this.x_pos_mask[this.index(x_arr, y_arr)] as number,
      this.x_neg_mask[this.index(x_arr, y_arr)] as number,
    ];
  }
  get_bdy_dists_y(x_arr: number, y_arr: number): Vec2D {
    return [
      this.y_pos_mask[this.index(x_arr, y_arr)] as number,
      this.y_neg_mask[this.index(x_arr, y_arr)] as number,
    ];
  }
  d_x_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_x(x, y);
    if (a_plus == 0 && a_minus == 0) {
      // If the point is in the exterior, return 0
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      // If the point is in the interior, calculate normally.
      return super.d_x_entry(arr, x, y);
    } else {
      return (
        (a_minus * this.d_x_plus(arr, x, y, a_plus) +
          a_plus * this.d_x_minus(arr, x, y, a_minus)) /
        (a_minus + a_plus)
      );
    }
  }
  d_y_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_y(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.d_y_entry(arr, x, y);
    } else {
      return (
        (a_minus * this.d_y_plus(arr, x, y, a_plus) +
          a_plus * this.d_y_minus(arr, x, y, a_minus)) /
        (a_minus + a_plus)
      );
    }
  }
  // Calculates an entry of (d/dx)(d/dx)(array)
  l_x_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_x(x, y);
    if (a_plus == 0 && a_minus == 0) {
      // If the point is in the exterior, return 0
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      // If the point is in the interior, calculate normally.
      return super.l_x_entry(arr, x, y);
    } else {
      return (
        (this.d_x_plus(arr, x, y, a_plus) -
          this.d_x_minus(arr, x, y, a_minus)) /
        ((a_minus + a_plus) / 2)
      );
    }
  }
  // Calculates an entry of (d/dy)(d/dy)(array)
  l_y_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_y(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.l_y_entry(arr, x, y);
    } else {
      return (
        (this.d_y_plus(arr, x, y, a_plus) -
          this.d_y_minus(arr, x, y, a_minus)) /
        ((a_minus + a_plus) / 2)
      );
    }
  }
}

// TODO the equation of the ellipse needs to be known in canvas-coordinates here, and in
// scene-coordinates one level above (to define the ParametricFunction MObject).
// Find some way to derive both of these from a single source of truth.
export class WaveSimTwoDimEllipticReflector extends WaveSimTwoDimReflector {
  // TODO: Ensure PML layer doesn't interfere with the region.
  semimajor_axis: number = 80.0;
  semiminor_axis: number = 60.0;
  w: number = 5.0; // Frequency
  a: number = 5.0; // Amplitude
  foci: [Vec2D, Vec2D] = [
    [
      Math.floor(
        this.width / 2 +
          Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      ),
      Math.floor(this.height / 2),
    ],
    [
      Math.floor(
        this.width / 2 -
          Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      ),
      Math.floor(this.height / 2),
    ],
  ];
  clamp_value: number = 10.0;
  constructor(width: number, height: number, dt: number) {
    super(width, height, dt);
  }
  _recalculate_foci() {
    this.foci = [
      [
        Math.floor(
          this.width / 2 +
            Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
        ),
        Math.floor(this.height / 2),
      ],
      [
        Math.floor(
          this.width / 2 -
            Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
        ),
        Math.floor(this.height / 2),
      ],
    ];
  }
  set_attr(name: keyof typeof Simulator, val: any) {
    super.set_attr(name, val);
    this._recalculate_foci();
    this.zero_outside_region();
  }
  inside_region(x_arr: number, y_arr: number): boolean {
    return (
      ((x_arr - this.width / 2) / this.semimajor_axis) ** 2 +
        ((y_arr - this.height / 2) / this.semiminor_axis) ** 2 <
      1
    );
  }
  _x_plus(x: number, y: number): number {
    return Math.abs(
      this.semimajor_axis *
        Math.sqrt(1 - ((y - this.height / 2) / this.semiminor_axis) ** 2) -
        x +
        this.width / 2,
    );
  }
  _x_minus(x: number, y: number): number {
    return Math.abs(
      this.semimajor_axis *
        Math.sqrt(1 - ((y - this.height / 2) / this.semiminor_axis) ** 2) +
        x -
        this.width / 2,
    );
  }
  _y_plus(x: number, y: number): number {
    return Math.abs(
      this.semiminor_axis *
        Math.sqrt(1 - ((x - this.width / 2) / this.semimajor_axis) ** 2) -
        y +
        this.height / 2,
    );
  }
  _y_minus(x: number, y: number): number {
    return Math.abs(
      this.semiminor_axis *
        Math.sqrt(1 - ((x - this.width / 2) / this.semimajor_axis) ** 2) +
        y -
        this.height / 2,
    );
  }
  add_boundary_conditions(s: Array<number>, t: number): void {
    let ind = this.index(
      Math.floor(this.foci[0][0]),
      Math.floor(this.foci[0][1]),
    );
    this.vals[ind] = this.a * Math.sin(this.w * t);
    this.vals[ind + this.size()] = this.a * this.w * Math.cos(this.w * t);

    // Clamp for numerical stability
    for (let ind = 0; ind < this.state_size; ind++) {
      this.vals[ind] = clamp(
        this.vals[ind] as number,
        -this.clamp_value,
        this.clamp_value,
      );
    }
  }
}

// TODO Add friction terms to DE
// TODO Do elliptic and parabolic reflector cases

// *** INTERACTIVE ANIMATION ***
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
  // Updates a mobject to account for the new simulator state
  update_mobjects() {}
  // Draws the scene by passing to the renderer.
  //
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

// Heatmap version of a 2D input wave equation scene
// TODO Make this written for any Simulator satisfying HeatMapDrawable.
export class WaveSimTwoDimHeatMapScene extends InteractivePlayingScene {
  simulator: WaveSimTwoDim;
  imageData: ImageData; // Target for heatmap data
  constructor(
    canvas: HTMLCanvasElement,
    simulator: WaveSimTwoDim,
    imageData: ImageData,
  ) {
    super(canvas, [simulator]);
    this.simulator = simulator;
    simulator satisfies HeatMapDrawable;
    this.add(
      "heatmap",
      new HeatMap(
        simulator.width,
        simulator.height,
        -1,
        1,
        this.simulator.get_uValues(),
      ),
    );
    // TODO Move this part to renderer.
    this.imageData = imageData;
  }
  update_mobjects() {
    let mobj = this.get_mobj("heatmap") as HeatMap;
    mobj.set_vals(this.simulator.get_uValues());
  }
  draw_mobject(mobj: MObject) {
    if (mobj instanceof HeatMap) {
      mobj.draw(this.canvas, this, this.imageData);
    } else {
      mobj.draw(this.canvas, this);
    }
  }
}

// Dots-and-springs version of a 2D wave equation scene
// TODO In this case, there are two simulators at play. One for the x-coordinate of the output,
// and one for the y-coordinate of the output.
export class WaveSimTwoDimDotsScene extends InteractivePlayingScene {
  constructor(
    canvas: HTMLCanvasElement,
    simulators: [WaveSimTwoDim, WaveSimTwoDim],
    imageData: ImageData,
  ) {
    super(canvas, simulators);
    this.simulators = simulators;

    if (simulators[0].width != simulators[1].width) {
      throw new Error("Simulators have different width.");
    }
    if (simulators[0].height != simulators[1].height) {
      throw new Error("Simulators have different height.");
    }

    // Add Mobjects
    // TODO Add connecting lines
    console.log(this.xlims[1], this.xlims[0]);
    let w = simulators[0].width;
    let h = simulators[0].height;
    let x_eq, y_eq;
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        [x_eq, y_eq] = this.eq_position(x, y);
        this.add(`p_{${x}, ${y}}`, new Dot(x_eq, y_eq, 2 / w));
      }
    }
  }
  // Returns the equilibrium position of the dot at position (x, y)
  eq_position(x: number, y: number): [number, number] {
    return [
      this.xlims[0] +
        ((x + 0.5) * (this.xlims[1] - this.xlims[0])) / this.width(),
      this.ylims[0] +
        ((y + 0.5) * (this.ylims[1] - this.ylims[0])) / this.height(),
    ];
  }
  get_simulator(ind: number): WaveSimTwoDim {
    return super.get_simulator(ind) as WaveSimTwoDim;
  }
  width(): number {
    return this.get_simulator(0).width;
  }
  height(): number {
    return this.get_simulator(0).height;
  }
  // Move all of the dots, where the two simulators control
  // the x-coordinates and y-coordinates, respectively.
  update_mobjects() {
    let w = this.width();
    let h = this.height();
    let dot: Dot;
    let ind: number;
    let x_eq: number;
    let y_eq: number;
    let sim_0 = this.get_simulator(0);
    let u_0 = sim_0.get_uValues();
    let u_1 = this.get_simulator(1).get_uValues();
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        dot = this.get_mobj(`p_{${x}, ${y}}`) as Dot;
        ind = sim_0.index(x, y);
        [x_eq, y_eq] = this.eq_position(x, y);
        dot.move_to(x_eq + (u_0[ind] as number), y_eq + (u_1[ind] as number));
      }
    }
  }
  draw_mobject(mobj: MObject) {
    mobj.draw(this.canvas, this);
  }
}

// *** RENDERER ***
class Renderer {
  canvas: HTMLCanvasElement;
  xlims: [number, number];
  ylims: [number, number];
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
  }
}
