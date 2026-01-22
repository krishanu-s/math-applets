// Testing the direct feeding of a pixel array to the canvas
import { MObject, Scene, prepare_canvas } from "./base.js";
import { Slider, Button } from "./interactive.js";
import { Vec2D, clamp, sigmoid } from "./base.js";
import { ParametricFunction } from "./parametric.js";
import { HeatMap } from "./heatmap.js";
import {
  WaveSimTwoDim,
  WaveSimTwoDimPointSource,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimDotsScene,
  WaveSimTwoDimEllipticReflector,
} from "./scratch.js";

// The "state" for a wave equation simulation on a bounded domain consists of a pair
// $(\vec{u}, \vec{v})$ of array-valued functions, where $\vec{u}$ describes the wave
// surface position and $\vec{v}$ describes its velocity.
// To allow for the addition of damping layers which absorb waves, in 2 dimensions we
// would use a quadruple $(\vec{u}, \vec{v}, \vec{p}_x, \vec{p}_y)$.

// The state S of a dynamical system evolving under a differential equation.
class State {
  state_size: number;
  vals: Array<number>;
  time: number;
  constructor(state_size: number) {
    this.state_size = state_size;
    this.vals = new Array(this.state_size).fill(0);
    this.time = 0;
  }
  // Time-derivative of the current state. Overwritten in subclasses.
  dot_entry(arr: Array<number>, i: number): number {
    return 0;
  }
  dot(s: Array<number>): Array<number> {
    let dS = new Array(this.state_size);
    for (let i = 0; i < this.state_size; i++) {
      dS[i] = this.dot_entry(s, i);
    }
    return dS;
  }
  // Adding any boundary conditions which override the differential equation
  add_boundary_conditions(arr: Array<number>, t: number): void {}
  // Step the differential equation forward
  // TODO This part has to be moved outside, to the generic "DynamicScene" class.
  step(dt: number) {
    return this.step_rk(dt);
  }
  // Step the differential equation forward using finite difference method
  step_finite_diff(dt: number) {
    let newS = new Array(this.state_size);
    let dS = this.dot(this.vals);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (dS[i] as number);
    }
    this.add_boundary_conditions(newS, this.time);
    return newS;
  }
  // Step the differential equation forward using Runge-Kutta
  step_rk(dt: number) {
    let newS = new Array(this.state_size);

    let dS_1 = this.dot(this.vals);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (dt / 2) * (dS_1[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + dt / 2);

    let dS_2 = this.dot(newS);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (dt / 2) * (dS_2[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + dt / 2);

    let dS_3 = this.dot(newS);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + dt * (dS_3[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + dt);

    let dS_4 = this.dot(newS);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] =
        (this.vals[i] as number) +
        (dt / 6) * (dS_1[i] as number) +
        (dt / 3) * (dS_2[i] as number) +
        (dt / 3) * (dS_3[i] as number) +
        (dt / 6) * (dS_4[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + dt);
    this.time += dt;
    return newS;
  }
}

// One-dimensional wave equation simulator, with zeros (bounds) at the ends
class WaveSimStateOneDim extends State {
  wave_propagation_speed: number; // Optional spatial scaling
  constructor(width: number) {
    super(2 * width);
    this.wave_propagation_speed = 1;
  }
  set_wave_propagation_speed(w: number) {
    this.wave_propagation_speed = w;
  }
  width(): number {
    return this.state_size / 2;
  }
  get_uValues(): Array<number> {
    return this.vals.slice(0, this.width());
  }
  get_vValues(): Array<number> {
    return this.vals.slice(this.width(), 2 * this.width());
  }
  // Entry of the Laplacian.
  laplacian_entry(arr: Array<number>, i: number): number {
    if (i == 0) {
      return (
        2 * (arr[0] as number) -
        5 * (arr[1] as number) +
        4 * (arr[2] as number) -
        (arr[3] as number)
      );
    } else if (i == this.width() - 1) {
      return (
        2 * (arr[this.width() - 1] as number) -
        5 * (arr[this.width() - 2] as number) +
        4 * (arr[this.width() - 3] as number) -
        (arr[this.width() - 4] as number)
      );
    } else {
      return (
        (arr[i + 1] as number) - 2 * (arr[i] as number) + (arr[i - 1] as number)
      );
    }
  }
  // (u, u') -> (u', (c**2) * L(u))
  dot(arr: Array<number>): Array<number> {
    let dS = new Array(this.state_size);
    for (let i = 0; i < this.width(); i++) {
      dS[i] = arr[i + this.width()];
      dS[i + this.width()] =
        this.wave_propagation_speed ** 2 * this.laplacian_entry(arr, i);
    }
    return dS;
  }
}

// Two-dimensional wave equation simulator, with zeros around the boundary
class WaveSimStateTwoDim extends State {
  width: number;
  height: number;
  wave_propagation_speed: number; // Optional spatial scaling
  constructor(width: number, height: number) {
    super(2 * width * height);
    this.width = width;
    this.height = height;
    this.wave_propagation_speed = 1.0;
  }
  size(): number {
    return this.width * this.height;
  }
  // Converts xy-coordinates to linear array coordinates, where x-coordinate
  // proceeds faster.
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  set_wave_propagation_speed(w: number) {
    this.wave_propagation_speed = w;
  }
  get_uValues(): Array<number> {
    return this.vals.slice(0, this.size());
  }
  get_vValues(): Array<number> {
    return this.vals.slice(this.size(), 2 * this.size());
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
  laplacian_entry(arr: Array<number>, x: number, y: number): number {
    return this.l_x_entry(arr, x, y) + this.l_y_entry(arr, x, y);
  }
  // (u, u') -> (u', (c**2) * L(u))
  dot(arr: Array<number>): Array<number> {
    let dS = new Array(this.state_size);
    let i;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        i = this.index(x, y);
        dS[i] = arr[i + this.size()];
        dS[i + this.size()] =
          this.wave_propagation_speed ** 2 * this.laplacian_entry(arr, x, y);
      }
    }
    return dS;
  }
}

// Two-dimensional wave equation simulator, with PML damping around the boundary
class WaveSimStateTwoDimDamped extends State {
  width: number;
  height: number;
  wave_propagation_speed: number; // Optional spatial scaling
  constructor(width: number, height: number) {
    super(4 * width * height);
    this.width = width;
    this.height = height;
    this.wave_propagation_speed = 1.0;
  }
  dx(): number {
    return 1 / this.wave_propagation_speed;
  }
  dy(): number {
    return 1 / this.wave_propagation_speed;
  }
  size(): number {
    return this.width * this.height;
  }
  // Converts xy-coordinates to linear array coordinates, where x-coordinate
  // proceeds faster.
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  set_wave_propagation_speed(w: number) {
    this.wave_propagation_speed = w;
  }
  get_uValues(arr: Array<number>): Array<number> {
    return arr.slice(0, this.size());
  }
  get_vValues(arr: Array<number>): Array<number> {
    return arr.slice(this.size(), 2 * this.size());
  }
  get_pxValues(arr: Array<number>): Array<number> {
    return arr.slice(2 * this.size(), 3 * this.size());
  }
  get_pyValues(arr: Array<number>): Array<number> {
    return arr.slice(3 * this.size(), 4 * this.size());
  }
  // Damping in x direction
  sigma_x(x: number): number {
    return 0;
  }
  // Damping in y direction
  sigma_y(y: number): number {
    return 0;
  }
  // One-sided derivative (f(x + a * dx) - f(x)) / (a * dx)
  d_x_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (x == this.width - 1) {
      return -(arr[this.index(x, y)] as number) / (a_plus * this.dx());
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x, y)] as number)) /
        (a_plus * this.dx())
      );
    }
  }
  // One-sided derivative (f(x - a * dx) - f(x)) / (-a * dx)
  d_x_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (x == 0) {
      return (arr[this.index(x, y)] as number) / (a_minus * this.dx());
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        (a_minus * this.dx())
      );
    }
  }
  // One-sided derivative (f(y + a * dy) - f(y)) / (a * dy)
  d_y_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (y == this.height - 1) {
      return -(arr[this.index(x, y)] as number) / (a_plus * this.dy());
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y)] as number)) /
        (a_plus * this.dy())
      );
    }
  }
  // One-sided derivative (f(y - a * dy) - f(y)) / (-a * dy)
  d_y_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (y == 0) {
      return (arr[this.index(x, y)] as number) / (a_minus * this.dy());
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        (a_minus * this.dy())
      );
    }
  }
  // Calculates an entry of (d/dx)(array)
  d_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        (2 * (arr[this.index(2, y)] as number) -
          2 * (arr[this.index(0, y)] as number) -
          (arr[this.index(3, y)] as number) +
          (arr[this.index(1, y)] as number)) /
        (2 * this.dx())
      );
    } else if (x == this.width - 1) {
      return (
        (2 * (arr[this.index(this.width - 1, y)] as number) -
          2 * (arr[this.index(this.width - 3, y)] as number) -
          (arr[this.index(this.width - 2, y)] as number) +
          (arr[this.index(this.width - 4, y)] as number)) /
        (2 * this.dx())
      );
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        (2 * this.dx())
      );
    }
  }
  // Calculates an entry of (d/dy)(array)
  d_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        (2 * (arr[this.index(x, 2)] as number) -
          2 * (arr[this.index(x, 0)] as number) -
          (arr[this.index(x, 3)] as number) +
          (arr[this.index(x, 1)] as number)) /
        (2 * this.dy())
      );
    } else if (y == this.height - 1) {
      return (
        (2 * (arr[this.index(x, this.height - 1)] as number) -
          2 * (arr[this.index(x, this.height - 3)] as number) -
          (arr[this.index(x, this.height - 2)] as number) +
          (arr[this.index(x, this.height - 4)] as number)) /
        (2 * this.dy())
      );
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        (2 * this.dy())
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
  laplacian_entry(arr: Array<number>, x: number, y: number): number {
    return this.l_x_entry(arr, x, y) + this.l_y_entry(arr, x, y);
  }
  // Ref: https://arxiv.org/pdf/1001.0319, equation (2.14).
  // A scalar field in (2+1)-D, u(x, y, t), evolving according to the wave equation formulated as
  // du/dt   = v
  // dv/dt   = (c**2) * (Lu) - (\sigma_x + \sigma_y) * v - \sigma_x * \sigma_y * u + (dp_x/dx + dp_y / dy)
  // dp_x/dt = -\sigma_x * p_x + (c**2) * (\sigma_y - \sigma_x) * du/dx
  // dp_y/dt = -\sigma_y * p_y + (c**2) * (\sigma_x - \sigma_y) * du/dy
  //
  // where p = (p_x, p_y) is an auxiliary field introduced to handle PML at the boundaries.
  dot(arr: Array<number>): Array<number> {
    let dS = new Array(this.size());
    let i, sx, sy;
    let u = this.get_uValues(arr);
    let px = this.get_pxValues(arr);
    let py = this.get_pyValues(arr);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        i = this.index(x, y);
        sx = this.sigma_x(x);
        sy = this.sigma_y(y);
        dS[i] = arr[i + this.size()];
        dS[i + this.size()] =
          this.wave_propagation_speed ** 2 * this.laplacian_entry(arr, x, y) +
          this.d_x_entry(px, x, y) +
          this.d_y_entry(py, x, y) -
          (sx + sy) * (arr[i + this.size()] as number) -
          sx * sy * (arr[i] as number);
        dS[i + 2 * this.size()] =
          -sx * (arr[i + 2 * this.size()] as number) +
          this.wave_propagation_speed ** 2 *
            (sy - sx) *
            this.d_x_entry(u, x, y);
        dS[i + 3 * this.size()] =
          -sy * (arr[i + 3 * this.size()] as number) +
          this.wave_propagation_speed ** 2 *
            (sx - sy) *
            this.d_y_entry(u, x, y);
      }
    }
    return dS;
  }
}

// class WaveSimOneDim {
//   width: number;
//   uValues: Array<number>;
//   vValues: Array<number>;
//   wave_propagation_speed: number;
//   dx: number;
//   constructor(width: number, dx: number) {
//     this.width = width;
//     this.dx = dx;
//     this.uValues = new Array(width).fill(0);
//     this.vValues = new Array(width).fill(0);
//     this.wave_propagation_speed = 1.0;
//   }
//   new_arr(): Array<number> {
//     return new Array(this.width).fill(0);
//   }
//   set_uValues(u: Array<number>): void {
//     this.uValues = u;
//   }
//   get_uValues(): Array<number> {
//     return this.uValues;
//   }
//   set_vValues(v: Array<number>): void {
//     this.vValues = v;
//   }
//   get_vValues(): Array<number> {
//     return this.vValues;
//   }
//   set_wave_propagation_speed(w: number) {
//     this.wave_propagation_speed = w;
//   }
//   laplacian_entry(arr: Array<number>, x: number): number {
//     if (x == 0) {
//       return (
//         (2 * (arr[0] as number) -
//           5 * (arr[1] as number) +
//           4 * (arr[2] as number) -
//           (arr[3] as number)) /
//         this.dx ** 2
//       );
//     } else if (x == this.width - 1) {
//       return (
//         (2 * (arr[this.width - 1] as number) -
//           5 * (arr[this.width - 2] as number) +
//           4 * (arr[this.width - 3] as number) -
//           (arr[this.width - 4] as number)) /
//         this.dx ** 2
//       );
//     } else {
//       return (
//         ((arr[x + 1] as number) -
//           2 * (arr[x] as number) +
//           (arr[x - 1] as number)) /
//         this.dx ** 2
//       );
//     }
//   }
//   uDot(u: Array<number>, v: Array<number>): Array<number> {
//     let arr = new Array(this.width);
//     for (let i = 0; i < this.width; i++) {
//       arr[i] = v[i] as number;
//     }
//     return arr;
//   }
//   vDot(u: Array<number>, v: Array<number>): Array<number> {
//     let arr = new Array(this.width);
//     for (let i = 0; i < this.width; i++) {
//       arr[i] = this.wave_propagation_speed ** 2 * this.laplacian_entry(u, i);
//     }
//     return arr;
//   }
//   step(dt: number) {
//     this.step_rk(dt: number);
//   }
//   step_finite_difference(dt: number) {
//     let du = this.uDot(this.uValues, this.vValues);
//     let dv = this.vDot(this.uValues, this.vValues);
//     for (let i = 0; i < this.width; i++) {
//       [this.uValues[i], this.vValues[i]] = [
//         (this.uValues[i] as number) + dt * (du[i] as number),
//         (this.vValues[i] as number) + dt * (dv[i] as number),
//       ];
//     }
//   }
//   step_rk(dt: number)
// }
// class WaveStateTwoDim {
//   width: number;
//   height: number;
//   values: Array<number>;
//   // TODO
// }
// class WaveStateTwoDimDamped {
//   // TODO
// }

// Some toy examples
// (1) A discretized, bounded wave simulation u(x, t) in R. This is equivalent
//     to N point masses arranged in sequence by springs of equilibrium length 0,
//     with two endpoints being fixed. The parameter x describes the point
//     mass number and the function output u(x, t) describes the position.
class WaveEquationSceneOneDim extends Scene {
  time: number;
  width: number;
  height: number;
  num_points: number;
  dt: number;
  uValues: Array<number>;
  vValues: Array<number>;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    num_points: number,
    dt: number,
  ) {
    super(canvas);
    this.time = 0;
    this.width = width;
    this.height = height;
    this.uValues = this.new_arr();
    this.vValues = this.new_arr();
    this.num_points = num_points;
    this.dt = dt;
    this.action_queue = [];
    this.paused = true;
  }
  // Pauses or unpauses the simulation
  toggle_pause() {
    this.paused = !this.paused;
    this.play(undefined); // Restart playing if this was paused TODO Get around this hack.
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback: () => void): void {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Makes a new array
  new_arr(): Array<number> {
    return new Array(this.num_points).fill(0);
  }
  // Sets the initial conditions
  set_init_conditions(x0: Array<number>, v0: Array<number>): void {
    this.uValues = x0;
    this.vValues = v0;
    this.time = 0;
  }
  clear(): void {
    this.set_init_conditions(this.new_arr(), this.new_arr());
    this.draw();
  }
  // Uses either finite-difference or Runge-Kutta to advance the differential equation.
  step(dt: number) {
    let u = new Array(this.num_points);
  }
  // Starts animation
  play(until: number | undefined) {
    if (this.paused) {
      return;
    } else if (this.action_queue.length > 0) {
      let callback = this.action_queue.shift() as () => void;
      callback();
    } else if (this.time > (until as number)) {
      return;
    } else {
      this.step(this.dt);
      this.draw();
    }
    window.requestAnimationFrame(this.play.bind(this, until));
  }
}

// Ref: https://arxiv.org/pdf/1001.0319, equation (2.14).
// A scalar field in (2+1)-D, u(x, y, t), evolving according to the wave equation formulated as
// du/dt   = v
// dv/dt   = (c**2) * (Lu) - (\sigma_x + \sigma_y) * v - \sigma_x * \sigma_y * u + (dp_x/dx + dp_y / dy)
// dp_x/dt = -\sigma_x * p_x + (c**2) * (\sigma_y - \sigma_x) * du/dx
// dp_y/dt = -\sigma_y * p_y + (c**2) * (\sigma_x - \sigma_y) * du/dy
//
// where p = (p_x, p_y) is an auxiliary field introduced to handle PML at the boundaries.
// When the functions \sigma_x and \sigma_y are both 0, we retrieve the undamped wave equation.
//
// TODO Should the point source at the origin be modeled as an *impulse* term added to dv/dt?
// TODO Make the geometry of PML more user-definable.
// TODO Make it possible to add regions with different values of WAVE_PROPAGATION_SPEED, for refraction.
class WaveEquationScene extends Scene {
  time: number;
  width: number;
  height: number;
  clamp_value: number; // Maximum allowed amplitude, clamped at each step
  dx: number;
  dy: number;
  dt: number;
  wave_propagation_speed: number;
  pml_strength: number;
  pml_width: number;
  state: Array<number>; // TODO Replace this with a WaveSimStateTwoDimDamped
  imageData: ImageData;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    clamp_value: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas);
    this.imageData = imageData;
    this.time = 0;
    this.width = width;
    this.height = height;
    this.clamp_value = clamp_value;
    this.dx = dx;
    this.dy = dy;
    this.dt = dt;
    this.wave_propagation_speed = 1.0;
    this.pml_strength = 5.0;
    this.pml_width = 1.0;
    this.state = new Array(this.state_size()).fill(0);

    this.action_queue = [];
    this.paused = true;

    this.add(
      "heatmap",
      new HeatMap(width, height, -1, 1, this.state.slice(0, this.size())),
    );
  }
  size(): number {
    return this.width * this.height;
  }
  state_size(): number {
    return 4 * this.width * this.height;
  }
  // Sets the wave propagation speed
  set_wave_propagation_speed(c: number) {
    this.wave_propagation_speed = c;
  }
  set_pml_strength(x: number) {
    this.pml_strength = x;
  }
  set_pml_width(x: number) {
    this.pml_width = x;
  }
  // Pauses or unpauses the simulation
  toggle_pause() {
    this.paused = !this.paused;
    this.play(undefined); // Restart playing if this was paused TODO Get around this hack.
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback: () => void): void {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Makes a new array
  new_arr(): Array<number> {
    return new Array(this.size()).fill(0);
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Sets the initial conditions
  set_init_conditions(x0: Array<number>, v0: Array<number>): void {
    for (let i = 0; i < this.size(); i++) {
      this.state[i] = x0[i] as number;
      this.state[i + this.size()] = v0[i] as number;
      this.state[i + 2 * this.size()] = 0;
      this.state[i + 3 * this.size()] = 0;
    }
    this.time = 0;
  }
  clear(): void {
    this.set_init_conditions(this.new_arr(), this.new_arr());
    this.draw();
  }
  // Sigma function which defines the Perfectly Matching Layer at the edges of the domain
  sigma_x(x: number): number {
    // Defines on integer slice indices
    return this._sigma_x((x - (this.width - 1) / 2) * this.dx);
  }
  _sigma_x(x: number): number {
    // Defined on real numbers
    let layer_start = ((this.width - 1) / 2) * this.dx - this.pml_width;
    if (Math.abs(x) >= layer_start) {
      return this.pml_strength * (Math.abs(x) - layer_start) ** 2;
    } else {
      return 0;
    }
  }
  sigma_y(y: number): number {
    // Defines on integer slice indices
    return this._sigma_y((y - (this.height - 1) / 2) * this.dy);
  }
  _sigma_y(y: number): number {
    // Defined on real numbers
    let layer_start = ((this.height - 1) / 2) * this.dy - this.pml_width;
    if (Math.abs(y) >= layer_start) {
      return this.pml_strength * (Math.abs(y) - layer_start) ** 2;
    } else {
      return 0;
    }
  }
  // One-sided derivative (f(x + a * dx) - f(x)) / (a * dx)
  d_x_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (x == this.width - 1) {
      return -(arr[this.index(x, y)] as number) / (a_plus * this.dx);
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x, y)] as number)) /
        (a_plus * this.dx)
      );
    }
  }
  // One-sided derivative (f(x - a * dx) - f(x)) / (-a * dx)
  d_x_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (x == 0) {
      return (arr[this.index(x, y)] as number) / (a_minus * this.dx);
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        (a_minus * this.dx)
      );
    }
  }
  // One-sided derivative (f(y + a * dy) - f(y)) / (a * dy)
  d_y_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (y == this.height - 1) {
      return -(arr[this.index(x, y)] as number) / (a_plus * this.dy);
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y)] as number)) /
        (a_plus * this.dy)
      );
    }
  }
  // One-sided derivative (f(y - a * dy) - f(y)) / (-a * dy)
  d_y_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (y == 0) {
      return (arr[this.index(x, y)] as number) / (a_minus * this.dy);
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        (a_minus * this.dy)
      );
    }
  }
  // Calculates an entry of (d/dx)(array)
  d_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        (2 * (arr[this.index(2, y)] as number) -
          2 * (arr[this.index(0, y)] as number) -
          (arr[this.index(3, y)] as number) +
          (arr[this.index(1, y)] as number)) /
        (2 * this.dx)
      );
    } else if (x == this.width - 1) {
      return (
        (2 * (arr[this.index(this.width - 1, y)] as number) -
          2 * (arr[this.index(this.width - 3, y)] as number) -
          (arr[this.index(this.width - 2, y)] as number) +
          (arr[this.index(this.width - 4, y)] as number)) /
        (2 * this.dx)
      );
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        (2 * this.dx)
      );
    }
  }
  // Calculates an entry of (d/dy)(array)
  d_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        (2 * (arr[this.index(x, 2)] as number) -
          2 * (arr[this.index(x, 0)] as number) -
          (arr[this.index(x, 3)] as number) +
          (arr[this.index(x, 1)] as number)) /
        (2 * this.dy)
      );
    } else if (y == this.height - 1) {
      return (
        (2 * (arr[this.index(x, this.height - 1)] as number) -
          2 * (arr[this.index(x, this.height - 3)] as number) -
          (arr[this.index(x, this.height - 2)] as number) +
          (arr[this.index(x, this.height - 4)] as number)) /
        (2 * this.dy)
      );
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        (2 * this.dy)
      );
    }
  }
  // (d/dx)^2.
  l_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        (2 * (arr[this.index(0, y)] as number) -
          5 * (arr[this.index(1, y)] as number) +
          4 * (arr[this.index(2, y)] as number) -
          (arr[this.index(3, y)] as number)) /
        this.dx ** 2
      );
    } else if (x == this.width - 1) {
      return (
        (2 * (arr[this.index(this.width - 1, y)] as number) -
          5 * (arr[this.index(this.width - 2, y)] as number) +
          4 * (arr[this.index(this.width - 3, y)] as number) -
          (arr[this.index(this.width - 4, y)] as number)) /
        this.dx ** 2
      );
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          2 * (arr[this.index(x, y)] as number) +
          (arr[this.index(x - 1, y)] as number)) /
        this.dx ** 2
      );
    }
  }
  // (d/dy)^2.
  l_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        (2 * (arr[this.index(x, 0)] as number) -
          5 * (arr[this.index(x, 1)] as number) +
          4 * (arr[this.index(x, 2)] as number) -
          (arr[this.index(x, 3)] as number)) /
        this.dy ** 2
      );
    } else if (y == this.height - 1) {
      return (
        (2 * (arr[this.index(x, this.height - 1)] as number) -
          5 * (arr[this.index(x, this.height - 2)] as number) +
          4 * (arr[this.index(x, this.height - 3)] as number) -
          (arr[this.index(x, this.height - 4)] as number)) /
        this.dy ** 2
      );
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          2 * (arr[this.index(x, y)] as number) +
          (arr[this.index(x, y - 1)] as number)) /
        this.dy ** 2
      );
    }
  }
  laplacian_entry(arr: Array<number>, x: number, y: number): number {
    return this.l_x_entry(arr, x, y) + this.l_y_entry(arr, x, y);
  }
  // Collective first-derivative of u, v, px, py
  dot(state: Array<number>): Array<number> {
    let dS = new Array(this.state_size());
    let ind, sx, sy;
    let u = state.slice(0, this.size());
    let px = state.slice(2 * this.size(), 3 * this.size());
    let py = state.slice(3 * this.size(), 4 * this.size());

    // u dot
    for (let ind = 0; ind < this.size(); ind++) {
      dS[ind] = state[ind + this.size()] as number;
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
            (state[ind + this.size()] as number) -
          this.sigma_x(x) * this.sigma_y(y) * (state[ind] as number);
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
  // Uses either finite-difference or Runge-Kutta to advance the differential equation.
  step(dt: number) {
    let s: Array<number> = new Array(this.state_size()).fill(0);

    let dS_1 = this.dot(this.state);
    for (let i = 0; i < this.state_size(); i++) {
      s[i] = (this.state[i] as number) + (dt / 2) * (dS_1[i] as number);
    }
    this.add_boundary_conditions(s, this.time + dt / 2);

    let dS_2 = this.dot(s);
    for (let i = 0; i < this.state_size(); i++) {
      s[i] = (this.state[i] as number) + (dt / 2) * (dS_2[i] as number);
    }
    this.add_boundary_conditions(s, this.time + dt / 2);

    let dS_3 = this.dot(s);
    for (let i = 0; i < this.state_size(); i++) {
      s[i] = (this.state[i] as number) + dt * (dS_3[i] as number);
    }
    this.add_boundary_conditions(s, this.time + dt);

    let dS_4 = this.dot(s);

    for (let ind = 0; ind < this.state_size(); ind++) {
      this.state[ind] =
        (this.state[ind] as number) +
        (dS_1[ind] as number) * (dt / 6) +
        (dS_2[ind] as number) * (dt / 3) +
        (dS_3[ind] as number) * (dt / 3) +
        (dS_4[ind] as number) * (dt / 6);
    }

    this.add_boundary_conditions(this.state, this.time + dt);
    this.time += dt;
  }
  add_boundary_conditions(state: Array<number>, t: number): void {}
  // Draws the scene
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (mobj instanceof HeatMap) {
        mobj.set_vals(this.state.slice(0, this.width * this.height));
        mobj.draw(this.canvas, this, this.imageData);
      } else {
        mobj.draw(this.canvas, this);
      }
    });
  }
  // Initializes the first step
  init() {
    this.add_boundary_conditions(this.state, this.time);
  }
  // Starts animation
  play(until: number | undefined) {
    if (this.paused) {
      return;
    } else if (this.action_queue.length > 0) {
      let callback = this.action_queue.shift() as () => void;
      callback();
    } else if (this.time > (until as number)) {
      return;
    } else {
      this.step(this.dt);
      this.draw();
    }
    window.requestAnimationFrame(this.play.bind(this, until));
  }
}

// Wave equation scene where waves emanate from a single point source.
//
class WaveEquationScenePointSource extends WaveEquationScene {
  point_source: Vec2D;
  w: number; // Frequency of oscillation
  a: number; // Amplitude of oscillation
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    clamp_value: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, clamp_value, dx, dy, dt);
    // Default settings
    this.point_source = [0, 0];
    this.w = 5.0;
    this.a = 5.0;
  }
  // Sets the amplitude
  set_amplitude(a: number) {
    this.a = a;
  }
  // Sets the frequency
  set_frequency(w: number) {
    this.w = w;
  }
  // Moves the point source
  move_point_source_x(x: number) {
    this.point_source[0] = x;
  }
  move_point_source_y(y: number) {
    this.point_source[1] = y;
  }
  add_boundary_conditions(state: Array<number>, t: number) {
    let [x, y] = this.s2c(this.point_source[0], this.point_source[1]);
    let ind = this.index(Math.floor(x), Math.floor(y));
    state[ind] = this.a * Math.sin(this.w * t);
    state[ind + this.size()] = this.a * this.w * Math.cos(this.w * t);
  }
}

// Wave equation scene where there is a hard reflective surface defined by
// a function.
// This is a general scaffold for subclasses which include a reflective element.
class WaveEquationSceneReflector extends WaveEquationScene {
  // Points within this distance of the region boundary will be treated
  // as outside of the boundary.
  x_pos_mask: Array<number>;
  x_neg_mask: Array<number>;
  y_pos_mask: Array<number>;
  y_neg_mask: Array<number>;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    clamp_value: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, clamp_value, dx, dy, dt);

    // Make mask arrays
    this.x_pos_mask = new Array(this.width * this.height).fill(0);
    this.x_neg_mask = new Array(this.width * this.height).fill(0);
    this.y_pos_mask = new Array(this.width * this.height).fill(0);
    this.y_neg_mask = new Array(this.width * this.height).fill(0);
  }
  // *** Encodes geometry ***
  // Returns whether the point (x, y) in scene coordinates is inside the domain.
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
  // Sets all points outside the region to 0
  zero_outside_region() {
    let x, y, ind;
    for (let y_arr = 0; y_arr < this.height; y_arr++) {
      for (let x_arr = 0; x_arr < this.width; x_arr++) {
        [x, y] = this.c2s(x_arr, y_arr);
        if (!this.inside_region(x, y)) {
          ind = this.index(x_arr, y_arr);
          this.state[ind] = 0;
          this.state[ind + this.size()] = 0;
          this.state[ind + 2 * this.size()] = 0;
          this.state[ind + 3 * this.size()] = 0;
        }
      }
    }
  }

  // *** Called during  initialization ***
  init() {
    super.init();
    this._recalculate_masks();
    this.zero_outside_region();
    if (this.paused) {
      this.draw();
    }
  }
  // Recalculate mask arrays based on modified geometry
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
    let [x, y] = this.c2s(x_arr, y_arr);
    if (!this.inside_region(x, y)) {
      // Exterior case
      return [0, 0];
    } else {
      let a_pos, a_neg;
      if (!this.inside_region(x + this.dx, y)) {
        // Near right boundary case, and x is positive
        a_pos = this._x_plus(x, y);
      } else {
        a_pos = 1;
      }
      if (!this.inside_region(x - this.dx, y)) {
        // Near left boundary case, and x is negative
        a_neg = this._x_minus(x, y);
      } else {
        a_neg = 1;
      }
      return [a_pos, a_neg];
    }
  }
  _calc_bdy_dists_y(x_arr: number, y_arr: number): Vec2D {
    let [x, y] = this.c2s(x_arr, y_arr);
    if (!this.inside_region(x, y)) {
      // Exterior case
      return [0, 0];
    } else {
      let a_plus, a_minus;
      if (!this.inside_region(x, y + this.dy)) {
        // Near boundary case
        a_plus = this._y_plus(x, y);
      } else {
        a_plus = 1;
      }
      if (!this.inside_region(x, y - this.dy)) {
        // Near boundary case
        a_minus = this._y_minus(x, y);
      } else {
        a_minus = 1;
      }
      return [a_plus, a_minus];
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
        (((a_minus + a_plus) * this.dx) / 2)
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
        (((a_minus + a_plus) * this.dy) / 2)
      );
    }
  }
}

// Wave equation scene where waves emanate from a single point source at (0, 0)
// and with a parabolic reflector with focus at (0, 0) and focal length f = 1,
// defined by y + f = x^2 / (4 * f)
class WaveEquationSceneParabolic extends WaveEquationSceneReflector {
  point_source: Vec2D;
  focal_length: number;
  w: number;
  a: number;
  point_source_on: boolean;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    clamp_value: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, clamp_value, dx, dy, dt);

    // Specify parabola
    this.focal_length = 1;
    this.add(
      "boundary",
      new ParametricFunction((t) => [t, 0.25 * t ** 2 - 1], -5, 5, 20),
    );

    // Default settings
    this.point_source = [0, 0];
    this.point_source_on = true;
    this.w = 5.0;
    this.a = 5.0;
  }
  // *** Parabola geometry ***
  inside_region(x: number, y: number): boolean {
    return y + this.focal_length > (1 / (4 * this.focal_length)) * x ** 2;
  }
  _x_plus(x: number, y: number): number {
    return (
      Math.abs(Math.sqrt((y + this.focal_length) * 4 * this.focal_length) - x) /
      this.dx
    );
  }
  _x_minus(x: number, y: number): number {
    return (
      Math.abs(Math.sqrt((y + this.focal_length) * 4 * this.focal_length) + x) /
      this.dx
    );
  }
  _y_plus(x: number, y: number): number {
    return (
      Math.abs(x ** 2 / (4 * this.focal_length) - y - this.focal_length) /
      this.dy
    );
  }
  _y_minus(x: number, y: number): number {
    return (
      Math.abs(x ** 2 / (4 * this.focal_length) - y - this.focal_length) /
      this.dy
    );
  }
  // *** Interactivity ***
  set_focal_length(f: number) {
    this.focal_length = f;
    let boundary = this.get_mobj("boundary") as ParametricFunction;
    boundary.set_function((t) => [t, t ** 2 / (4 * f) - f]);
    this._recalculate_masks();
    this.zero_outside_region();
    if (this.paused) {
      this.draw();
    }
  }
  set_amplitude(a: number) {
    this.a = a;
  }
  set_frequency(w: number) {
    this.w = w;
  }
  toggle_point_source() {
    this.point_source_on = !this.point_source_on;
  }
  move_point_source_x(x: number) {
    this.point_source[0] = x;
  }
  move_point_source_y(y: number) {
    this.point_source[1] = y;
  }
  // *** Simulation methods ***
  add_boundary_conditions(state: Array<number>, t: number) {
    if (this.point_source_on) {
      let [x, y] = this.s2c(this.point_source[0], this.point_source[1]);
      let ind = this.index(Math.floor(x), Math.floor(y));
      state[ind] = this.a * Math.sin(this.w * t);
      state[ind + this.size()] = this.a * this.w * Math.cos(this.w * t);
    }

    // Clamp for numerical stability
    for (let ind = 0; ind < this.state_size(); ind++) {
      state[ind] = clamp(
        state[ind] as number,
        -this.clamp_value,
        this.clamp_value,
      );
    }
  }
}

// Wave equation scene where the boundary is an ellipse with waves emanating
// from one focus.
class WaveEquationSceneElliptic extends WaveEquationSceneReflector {
  foci: [Vec2D, Vec2D];
  semimajor_axis: number;
  semiminor_axis: number;
  w: number;
  a: number;
  point_source_on: boolean;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    clamp_value: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, clamp_value, dx, dy, dt);

    // Specify ellipse axes
    this.semimajor_axis = 4;
    this.semiminor_axis = 3;
    this.add(
      "boundary",
      new ParametricFunction(
        (t) => [
          this.semimajor_axis * Math.cos(t),
          this.semiminor_axis * Math.sin(t),
        ],
        0,
        2 * Math.PI,
        20,
      ),
    );

    // Default settings
    this.foci = [
      [Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2), 0],
      [-Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2), 0],
    ];
    this.w = 5.0;
    this.a = 5.0;
    this.point_source_on = true;
  }
  init() {
    this.foci = [
      [Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2), 0],
      [-Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2), 0],
    ];
    let boundary = this.get_mobj("boundary") as ParametricFunction;
    boundary.set_function((t) => [
      this.semimajor_axis * Math.cos(t),
      this.semiminor_axis * Math.sin(t),
    ]);
    super.init();
  }
  // *** Ellipse geometry ***
  inside_region(x: number, y: number): boolean {
    return (x / this.semimajor_axis) ** 2 + (y / this.semiminor_axis) ** 2 < 1;
  }
  _x_plus(x: number, y: number): number {
    return (
      Math.abs(
        this.semimajor_axis * Math.sqrt(1 - (y / this.semiminor_axis) ** 2) - x,
      ) / this.dx
    );
  }
  _x_minus(x: number, y: number): number {
    return (
      Math.abs(
        this.semimajor_axis * Math.sqrt(1 - (y / this.semiminor_axis) ** 2) + x,
      ) / this.dx
    );
  }
  _y_plus(x: number, y: number): number {
    return (
      Math.abs(
        this.semiminor_axis * Math.sqrt(1 - (x / this.semimajor_axis) ** 2) - y,
      ) / this.dy
    );
  }
  _y_minus(x: number, y: number): number {
    return (
      Math.abs(
        this.semiminor_axis * Math.sqrt(1 - (x / this.semimajor_axis) ** 2) + y,
      ) / this.dy
    );
  }
  // *** Interactivity ***
  set_semimajor_axis(a: number) {
    this.semimajor_axis = a;
    this.init();
  }
  set_semiminor_axis(a: number) {
    this.semiminor_axis = a;
    this.init();
  }
  set_amplitude(a: number) {
    this.a = a;
  }
  set_frequency(w: number) {
    this.w = w;
  }
  toggle_point_source() {
    this.point_source_on = !this.point_source_on;
  }
  // *** Simulation methods ***
  add_boundary_conditions(state: Array<number>, t: number) {
    if (this.point_source_on) {
      let [x, y] = this.s2c(this.foci[0][0], this.foci[0][1]);
      let ind = this.index(Math.floor(x), Math.floor(y));
      state[ind] = this.a * Math.sin(this.w * t);
      state[ind + this.size()] = this.a * this.w * Math.cos(this.w * t);
    }

    // Clamp for numerical stability
    for (let ind = 0; ind < this.state_size(); ind++) {
      state[ind] = clamp(
        state[ind] as number,
        -this.clamp_value,
        this.clamp_value,
      );
    }
  }
}

// Wave equation scene where waves emanate from a pair of opposed point
// sources centered around (0, 0)
class WaveEquationSceneDipole extends WaveEquationScene {
  dipole: Vec2D;
  w: number; // Frequency of oscillation
  a: number; // Amplitude of oscillation
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    clamp_value: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, clamp_value, dx, dy, dt);
    // Default settings
    this.dipole = [0.5, 0];
    this.w = 5.0;
    this.a = 5.0;
  }

  // Moves the point source
  move_dipole_x(x: number) {
    this.dipole[0] = x as number;
  }
  move_dipole_y(y: number) {
    this.dipole[1] = y as number;
  }
  // Set amplitude and frequency
  set_a(a: number) {
    this.a = a;
  }
  set_w(w: number) {
    this.w = w;
  }
  add_boundary_conditions(state: Array<number>, t: number) {
    // Positive point source
    let [x1, y1] = this.s2c(this.dipole[0], this.dipole[1]);
    let ind_1 = this.index(Math.floor(x1), Math.floor(y1));
    // Negative point source
    let [x2, y2] = this.s2c(-this.dipole[0], -this.dipole[1]);
    let ind_2 = this.index(Math.floor(x2), Math.floor(y2));
    state[ind_1] = this.a * Math.sin(this.w * t);
    state[ind_1 + this.width * this.height] =
      this.a * this.w * Math.cos(this.w * t);
    state[ind_2] = -this.a * Math.sin(this.w * t);
    state[ind_2 + this.width * this.height] =
      -this.a * this.w * Math.cos(this.w * t);
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    const xmin = -5;
    const xmax = 5;
    const ymin = -5;
    const ymax = 5;
    const clamp_value = 10;

    // Prepare the canvas and scene
    let width = 200;
    let height = 200;
    let dx = (xmax - xmin) / width;
    let dy = (ymax - ymin) / height;
    const dt = 0.02;

    let canvas = prepare_canvas(width, height, "scene-container");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Create ImageData object
    const imageData = ctx.createImageData(width, height);

    let sim_width = width;
    let sim_height = height;
    let waveSim = new WaveSimTwoDimEllipticReflector(sim_width, sim_height, dt);
    waveSim.wave_propagation_speed = sim_width / 20;
    waveSim.a = 5.0;
    waveSim.add_boundary_conditions(waveSim.vals, 0);
    let waveEquationScene = new WaveSimTwoDimHeatMapScene(
      canvas,
      waveSim,
      imageData,
    );
    console.log("Simulation initialized");

    // let sim_width = 20;
    // let sim_height = 20;
    // let waveSimX = new WaveSimTwoDimPointSource(sim_width, sim_height, dt);
    // waveSimX.wave_propagation_speed = sim_width / 10;
    // waveSimX.a = 1.0;
    // waveSimX.pml_width = 0.2;
    // waveSimX.pml_strength = 100.0;
    // let waveSimY = new WaveSimTwoDim(sim_width, sim_height, dt);
    // waveSimY.wave_propagation_speed = sim_width / 10;
    // let waveEquationScene = new WaveSimTwoDimDotsScene(
    //   canvas,
    //   [waveSimX, waveSimY],
    //   imageData,
    // );

    // let waveEquationScene = new WaveEquationSceneElliptic(
    //   canvas,
    //   imageData,
    //   width,
    //   height,
    //   clamp_value,
    //   dx,
    //   dy,
    //   dt,
    // );

    waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    // waveEquationScene.set_pml_strength(5.0);
    // waveEquationScene.set_pml_width(1.0);

    // Slider which controls the frequency
    let w_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (w: number) {
        waveEquationScene.add_to_queue(
          waveEquationScene.set_simulator_attr.bind(
            waveEquationScene,
            0,
            "w",
            w,
          ),
        );
      },
      `5.0`,
      0,
      20,
      0.05,
    );
    w_slider.width = 200;

    // Button which pauses/unpauses the simulation
    let pauseButton = Button(
      document.getElementById("button-container-1") as HTMLElement,
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
    pauseButton.textContent = "Pause simulation";
    pauseButton.style.padding = "15px";

    // // Slider which controls the eccentricity: specific to ellipse
    // let eccentricity_slider = Slider(
    //   document.getElementById("slider-container-1") as HTMLElement,
    //   function (e: number) {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.set_semiminor_axis.bind(
    //         waveEquationScene,
    //         Math.sqrt(1 - (+e) ** 2) * waveEquationScene.semimajor_axis,
    //       ),
    //     );
    //   },
    //   `0.5`,
    //   0,
    //   1,
    //   0.01,
    // );
    // eccentricity_slider.width = 200;

    // // Slider which controls the wave frequency
    // let frequency_slider = Slider(
    //   document.getElementById("slider-container-1") as HTMLElement,
    //   function (w: number) {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.set_frequency.bind(waveEquationScene, +w),
    //     );
    //   },
    //   `5.0`,
    //   1.0,
    //   10.0,
    //   0.01,
    // );
    // frequency_slider.width = 200;

    // // Button which pauses/unpauses the simulation
    // let pauseButton = Button(
    //   document.getElementById("button-container-1") as HTMLElement,
    //   function () {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.toggle_pause.bind(waveEquationScene),
    //     );
    //     // TODO Make text change state on button press, not check simulator
    //     pauseButton.textContent = waveEquationScene.paused
    //       ? "Pause simulation"
    //       : "Unpause simulation";
    //   },
    // );
    // pauseButton.textContent = "Pause simulation";
    // pauseButton.style.padding = "15px";

    // // Button which turns the point source on or off.
    // let pointSourceButton = Button(
    //   document.getElementById("button-container-2") as HTMLElement,
    //   function () {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.toggle_point_source.bind(waveEquationScene),
    //     );
    //     // TODO Make text change state on button press, not check simulator
    //     pointSourceButton.textContent = waveEquationScene.point_source_on
    //       ? "Turn on source"
    //       : "Turn off source";
    //   },
    // );
    // pointSourceButton.textContent = "Turn off source";
    // pointSourceButton.style.padding = "15px";

    // Button which clears the scene
    let clearButton = Button(
      document.getElementById("button-container-3") as HTMLElement,
      function () {
        waveEquationScene.add_to_queue(
          waveEquationScene.reset.bind(waveEquationScene),
        );
      },
    );
    clearButton.textContent = "Clear";
    clearButton.style.padding = "15px";

    // Start the simulation
    // waveSim.init();
    console.log("Ready to play");

    // waveEquationScene.init();

    waveEquationScene.toggle_pause();
    waveEquationScene.play(undefined);
  });
})();
