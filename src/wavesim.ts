// Testing the direct feeding of a pixel array to the canvas
import { logical_and } from "numpy-ts";
import { MObject, Scene, Slider } from "./base.js";
import {
  Vec2D,
  vec_scale,
  vec_sum,
  vec_sub,
  vec_norm,
  vec_sum_list,
} from "./base.js";
import { ParametricFunction } from "./parametric.js";

const WAVE_PROPAGATION_SPEED = 1.0;
const PML_STRENGTH = 5.0;
const PML_WIDTH = 1.0;

// Clamps a number to the interval [xmin, xmax].
function clamp(x: number, xmin: number, xmax: number): number {
  return Math.min(xmax, Math.max(xmin, x));
}

// The function 1 / (1 + e^{-x})
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// A pixel heatmap
class HeatMap extends MObject {
  width: number;
  height: number;
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  valArray: Array<number>;
  constructor(
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    valArray: Array<number>,
  ) {
    super();
    this.width = width;
    this.height = height;
    this.min_val = min_val;
    this.max_val = max_val;
    this.valArray = valArray;
  }
  // Makes a new array
  new_arr(): Array<number> {
    return new Array(this.width * this.height).fill(0);
  }
  // Gets/sets values
  set_vals(vals: Array<number>) {
    this.valArray = vals;
  }
  get_vals(): Array<number> {
    return this.valArray;
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene, imageData: ImageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.valArray[i] as number;
      // Red-blue heatmap
      const gray = sigmoid(px_val);
      // const gray = (px_val - this.min_val) / (this.max_val - this.min_val);
      const idx = i * 4;
      // data[idx] = data[idx + 1] = data[idx + 2] = 256 * clamp(gray, 0, 1);
      if (gray < 0.5) {
        data[idx] = 512 * gray;
        data[idx + 1] = 512 * gray;
        data[idx + 2] = 255;
      } else {
        data[idx] = 255;
        data[idx + 1] = 512 * (1 - gray);
        data[idx + 2] = 512 * (1 - gray);
      }
      data[idx + 3] = 255;
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.putImageData(imageData, 0, 0);
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
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  dx: number;
  dy: number;
  dt: number;
  uValues: Array<number>;
  vValues: Array<number>;
  pxValues: Array<number>;
  pyValues: Array<number>;
  point_source: Vec2D;
  imageData: ImageData;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas);
    this.imageData = imageData;
    this.time = 0;
    this.width = width;
    this.height = height;
    this.min_val = min_val;
    this.max_val = max_val;
    this.dx = dx;
    this.dy = dy;
    this.dt = dt;
    this.uValues = this.new_arr();
    this.vValues = this.new_arr();
    this.pxValues = this.new_arr();
    this.pyValues = this.new_arr();

    this.point_source = [
      Math.floor(this.width / 2),
      Math.floor(this.height / 2),
    ];
    this.action_queue = [];
    this.paused = true;

    this.add(
      "heatmap",
      new HeatMap(width, height, min_val, max_val, this.uValues),
    );
  }
  toggle_pause() {
    this.paused = !this.paused;
  }
  // Adds to the action queue
  add_to_queue(callback: () => void) {
    this.action_queue.push(callback);
  }
  // Makes a new array
  new_arr(): Array<number> {
    return new Array(this.width * this.height).fill(0);
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Sets the initial conditions
  set_init_conditions(x0: Array<number>, v0: Array<number>): void {
    this.uValues = x0;
    this.vValues = v0;
    this.pxValues = this.new_arr();
    this.pyValues = this.new_arr();
    this.time = 0;
  }
  // Sigma function which defines the Perfectly Matching Layer at the edges of the domain
  sigma_x(x: number): number {
    // Defines on integer slice indices
    return this._sigma_x((x - (this.width - 1) / 2) * this.dx);
  }
  _sigma_x(x: number): number {
    // Defined on real numbers
    let layer_start = ((this.width - 1) / 2) * this.dx - PML_WIDTH;
    if (Math.abs(x) >= layer_start) {
      return PML_STRENGTH * (Math.abs(x) - layer_start) ** 2;
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
    let layer_start = ((this.height - 1) / 2) * this.dy - PML_WIDTH;
    if (Math.abs(y) >= layer_start) {
      return PML_STRENGTH * (Math.abs(y) - layer_start) ** 2;
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
  // First-derivative in time for u-array
  uDot(v: Array<number>): Array<number> {
    let arr = new Array(this.width * this.height);
    for (let ind = 0; ind < this.width * this.height; ind++) {
      arr[ind] = v[ind] as number;
    }
    return arr;
  }
  // First-derivative in time for v-array
  vDot(
    u: Array<number>,
    v: Array<number>,
    px: Array<number>,
    py: Array<number>,
  ): Array<number> {
    let arr = new Array(this.width * this.height);
    let ind;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        arr[ind] =
          WAVE_PROPAGATION_SPEED ** 2 * this.laplacian_entry(u, x, y) +
          this.d_x_entry(px, x, y) +
          this.d_y_entry(py, x, y) -
          (this.sigma_x(x) + this.sigma_y(y)) * (v[ind] as number) -
          this.sigma_x(x) * this.sigma_y(y) * (u[ind] as number);
      }
    }
    return arr;
  }
  // First derivative in time for x-component of p
  pxDot(u: Array<number>, px: Array<number>): Array<number> {
    let arr = new Array(this.width * this.height);
    let ind, sx;
    for (let x = 0; x < this.width; x++) {
      sx = this.sigma_x(x);
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        arr[ind] =
          -sx * (px[ind] as number) +
          WAVE_PROPAGATION_SPEED ** 2 *
            (this.sigma_y(y) - sx) *
            this.d_x_entry(u, x, y);
      }
    }
    return arr;
  }
  // First derivative in time for y-component of p
  pyDot(u: Array<number>, py: Array<number>): Array<number> {
    let arr = new Array(this.width * this.height);
    let ind, sy;
    for (let y = 0; y < this.height; y++) {
      sy = this.sigma_y(y);
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        arr[ind] =
          -sy * (py[ind] as number) +
          WAVE_PROPAGATION_SPEED ** 2 *
            (this.sigma_x(x) - sy) *
            this.d_y_entry(u, x, y);
      }
    }
    return arr;
  }
  // Uses either finite-difference or Runge-Kutta to advance the differential equation.
  step(dt: number) {
    let u, v, px, py;
    u = new Array(this.width * this.height);
    v = new Array(this.width * this.height);
    px = new Array(this.width * this.height);
    py = new Array(this.width * this.height);

    let du_1 = this.uDot(this.vValues);
    let dv_1 = this.vDot(
      this.uValues,
      this.vValues,
      this.pxValues,
      this.pyValues,
    );
    let dpx_1 = this.pxDot(this.uValues, this.pxValues);
    let dpy_1 = this.pxDot(this.uValues, this.pyValues);

    for (let i = 0; i < this.width * this.height; i++) {
      u[i] = (this.uValues[i] as number) + (dt / 2) * (du_1[i] as number);
      v[i] = (this.vValues[i] as number) + (dt / 2) * (dv_1[i] as number);
      px[i] = (this.pxValues[i] as number) + (dt / 2) * (dpx_1[i] as number);
      py[i] = (this.pyValues[i] as number) + (dt / 2) * (dpy_1[i] as number);
    }

    this.add_boundary_conditions(u, v, px, py, this.time + dt / 2);

    let du_2 = this.uDot(v);
    let dv_2 = this.vDot(u, v, px, py);
    let dpx_2 = this.pxDot(u, px);
    let dpy_2 = this.pyDot(u, py);

    for (let i = 0; i < this.width * this.height; i++) {
      u[i] = (this.uValues[i] as number) + (dt / 2) * (du_2[i] as number);
      v[i] = (this.vValues[i] as number) + (dt / 2) * (dv_2[i] as number);
      px[i] = (this.pxValues[i] as number) + (dt / 2) * (dpx_2[i] as number);
      py[i] = (this.pyValues[i] as number) + (dt / 2) * (dpy_2[i] as number);
    }

    this.add_boundary_conditions(u, v, px, py, this.time + dt / 2);

    let du_3 = this.uDot(v);
    let dv_3 = this.vDot(u, v, px, py);
    let dpx_3 = this.pxDot(u, px);
    let dpy_3 = this.pyDot(u, py);

    for (let i = 0; i < this.width * this.height; i++) {
      u[i] = (this.uValues[i] as number) + dt * (du_3[i] as number);
      v[i] = (this.vValues[i] as number) + dt * (dv_3[i] as number);
      px[i] = (this.pxValues[i] as number) + dt * (dpx_3[i] as number);
      py[i] = (this.pyValues[i] as number) + dt * (dpy_3[i] as number);
    }

    this.add_boundary_conditions(u, v, px, py, this.time + dt);

    let du_4 = this.uDot(v);
    let dv_4 = this.vDot(u, v, px, py);
    let dpx_4 = this.pxDot(u, px);
    let dpy_4 = this.pyDot(u, py);

    for (let ind = 0; ind < this.width * this.height; ind++) {
      this.uValues[ind] =
        (this.uValues[ind] as number) +
        (du_1[ind] as number) * (dt / 6) +
        (du_2[ind] as number) * (dt / 3) +
        (du_3[ind] as number) * (dt / 3) +
        (du_4[ind] as number) * (dt / 6);

      this.vValues[ind] =
        (this.vValues[ind] as number) +
        (dv_1[ind] as number) * (dt / 6) +
        (dv_2[ind] as number) * (dt / 3) +
        (dv_3[ind] as number) * (dt / 3) +
        (dv_4[ind] as number) * (dt / 6);

      this.pxValues[ind] =
        (this.pxValues[ind] as number) +
        (dpx_1[ind] as number) * (dt / 6) +
        (dpx_2[ind] as number) * (dt / 3) +
        (dpx_3[ind] as number) * (dt / 3) +
        (dpx_4[ind] as number) * (dt / 6);

      this.pyValues[ind] =
        (this.pyValues[ind] as number) +
        (dpy_1[ind] as number) * (dt / 6) +
        (dpy_2[ind] as number) * (dt / 3) +
        (dpy_3[ind] as number) * (dt / 3) +
        (dpy_4[ind] as number) * (dt / 6);
    }

    this.add_boundary_conditions(
      this.uValues,
      this.vValues,
      this.pxValues,
      this.pyValues,
      this.time + dt,
    );
    this.time += dt;
  }
  add_boundary_conditions(
    u: Array<number>,
    v: Array<number>,
    px: Array<number>,
    py: Array<number>,
    t: number,
  ): void {}
  // Draws the scene
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (mobj instanceof HeatMap) {
        mobj.set_vals(this.uValues);
        mobj.draw(this.canvas, this, this.imageData);
      } else {
        mobj.draw(this.canvas, this);
      }
    });
  }
  // Initializes the first step
  init() {
    this.add_boundary_conditions(
      this.uValues,
      this.vValues,
      this.pxValues,
      this.pyValues,
      this.time,
    );
  }
  // Starts animation
  start_playing(until: number | undefined) {
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
    window.requestAnimationFrame(this.start_playing.bind(this, until));
  }
}

// Wave equation scene where waves emanate from a single point source at (0, 0)
class WaveEquationScenePointSource extends WaveEquationScene {
  point_source: Vec2D;
  w: number; // Frequency of oscillation
  a: number; // Amplitude of oscillation
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, min_val, max_val, dx, dy, dt);
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
  add_boundary_conditions(
    u: Array<number>,
    v: Array<number>,
    px: Array<number>,
    py: Array<number>,
    t: number,
  ) {
    let [x, y] = this.s2c(this.point_source[0], this.point_source[1]);
    let ind = this.index(Math.floor(x), Math.floor(y));
    u[ind] = this.a * Math.sin(this.w * t);
    v[ind] = this.a * this.w * Math.cos(this.w * t);
  }
}

// Wave equation scene where there is a hard reflective surface defined by
// a function. This is a general scaffold for subclasses.
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
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, min_val, max_val, dx, dy, dt);

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
    let x, y;
    for (let y_arr = 0; y_arr < this.height; y_arr++) {
      for (let x_arr = 0; x_arr < this.width; x_arr++) {
        [x, y] = this.c2s(x_arr, y_arr);
        if (!this.inside_region(x, y)) {
          this.uValues[this.index(x_arr, y_arr)] = 0;
          this.vValues[this.index(x_arr, y_arr)] = 0;
          this.pxValues[this.index(x_arr, y_arr)] = 0;
          this.pyValues[this.index(x_arr, y_arr)] = 0;
        }
      }
    }
  }

  // *** Called during  initialization ***
  init() {
    super.init();
    this._recalculate_masks();
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

// TODO Implement reflecting surfaces, such as a conic section.
// Wave equation scene where waves emanate from a single point source at (0, 0)
// with a parabolic reflector with focus at (0, 0) and focal length f = 1
// defined by y + f = x^2 / (4 * f)
class WaveEquationSceneParabolic extends WaveEquationSceneReflector {
  focal_length: number;
  w: number;
  a: number;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, min_val, max_val, dx, dy, dt);

    // Specify parabola
    this.focal_length = 1;
    this.add(
      "boundary",
      new ParametricFunction((t) => [t, 0.25 * t ** 2 - 1], -5, 5, 20),
    );

    // Default settings
    this.point_source = [0, 0];
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
  }
  set_amplitude(a: number) {
    this.a = a;
  }
  set_frequency(w: number) {
    this.w = w;
  }
  move_point_source_x(x: number) {
    this.point_source[0] = x;
  }
  move_point_source_y(y: number) {
    this.point_source[1] = y;
  }
  // *** Simulation methods ***
  add_boundary_conditions(
    u: Array<number>,
    v: Array<number>,
    px: Array<number>,
    py: Array<number>,
    t: number,
  ) {
    let [x, y] = this.s2c(this.point_source[0], this.point_source[1]);
    let ind = this.index(Math.floor(x), Math.floor(y));
    u[ind] = this.a * Math.sin(this.w * t);
    v[ind] = this.a * this.w * Math.cos(this.w * t);

    // Clamp for numerical stability
    for (let ind = 0; ind < this.width * this.height; ind++) {
      u[ind] = clamp(u[ind] as number, this.min_val, this.max_val);
      v[ind] = clamp(v[ind] as number, this.min_val, this.max_val);
      px[ind] = clamp(px[ind] as number, this.min_val, this.max_val);
      py[ind] = clamp(py[ind] as number, this.min_val, this.max_val);
    }
  }
}

// Wave equation scene where the boundary is an ellipse with waves emanating
// from one focus.
// TODO Adapt this from parabola.
class WaveEquationSceneElliptic extends WaveEquationSceneReflector {
  semimajor_axis: number;
  semiminor_axis: number;
  w: number;
  a: number;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, min_val, max_val, dx, dy, dt);

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
    this.point_source = [
      Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      0,
    ];
    this.w = 5.0;
    this.a = 5.0;
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
    this.point_source = [
      Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      0,
    ];
    let boundary = this.get_mobj("boundary") as ParametricFunction;
    boundary.set_function((t) => [
      this.semimajor_axis * Math.cos(t),
      this.semiminor_axis * Math.sin(t),
    ]);
    this._recalculate_masks();
    this.zero_outside_region();
  }
  set_semiminor_axis(a: number) {
    this.semiminor_axis = a;
    this.point_source = [
      Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      0,
    ];
    let boundary = this.get_mobj("boundary") as ParametricFunction;
    boundary.set_function((t) => [
      this.semimajor_axis * Math.cos(t),
      this.semiminor_axis * Math.sin(t),
    ]);
    this._recalculate_masks();
    this.zero_outside_region();
  }
  set_amplitude(a: number) {
    this.a = a;
  }
  set_frequency(w: number) {
    this.w = w;
  }
  move_point_source_x(x: number) {
    this.point_source[0] = x;
  }
  move_point_source_y(y: number) {
    this.point_source[1] = y;
  }
  // *** Simulation methods ***
  add_boundary_conditions(
    u: Array<number>,
    v: Array<number>,
    px: Array<number>,
    py: Array<number>,
    t: number,
  ) {
    let [x, y] = this.s2c(this.point_source[0], this.point_source[1]);
    let ind = this.index(Math.floor(x), Math.floor(y));
    u[ind] = this.a * Math.sin(this.w * t);
    v[ind] = this.a * this.w * Math.cos(this.w * t);

    // Clamp for numerical stability
    for (let ind = 0; ind < this.width * this.height; ind++) {
      u[ind] = clamp(u[ind] as number, this.min_val, this.max_val);
      v[ind] = clamp(v[ind] as number, this.min_val, this.max_val);
      px[ind] = clamp(px[ind] as number, this.min_val, this.max_val);
      py[ind] = clamp(py[ind] as number, this.min_val, this.max_val);
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
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
    dt: number,
  ) {
    super(canvas, imageData, width, height, min_val, max_val, dx, dy, dt);
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
  add_boundary_conditions(
    u: Array<number>,
    v: Array<number>,
    px: Array<number>,
    py: Array<number>,
    t: number,
  ) {
    // Positive point source
    let [x1, y1] = this.s2c(this.dipole[0], this.dipole[1]);
    let ind_1 = this.index(Math.floor(x1), Math.floor(y1));
    // Negative point source
    let [x2, y2] = this.s2c(-this.dipole[0], -this.dipole[1]);
    let ind_2 = this.index(Math.floor(x2), Math.floor(y2));
    // // Positive point source
    // let ind_1 = this.index(
    //   Math.floor(this.width / 2) + this.dipole[0],
    //   Math.floor(this.height / 2) + this.dipole[1],
    // );
    // // Negative point source
    // let ind_2 = this.index(
    //   Math.floor(this.width / 2) - this.dipole[0],
    //   Math.floor(this.height / 2) - this.dipole[1],
    // );
    u[ind_1] = this.a * Math.sin(this.w * t);
    v[ind_1] = this.a * this.w * Math.cos(this.w * t);
    u[ind_2] = -this.a * Math.sin(this.w * t);
    v[ind_2] = -this.a * this.w * Math.cos(this.w * t);
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Prepare the canvas
    function prepare_canvas(
      width: number,
      height: number,
      name: string,
    ): HTMLCanvasElement {
      const container = document.getElementById(name);
      if (container == null) throw new Error(`${name} not found`);

      // Set size to 300 pixels by 300 pixels
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;

      // Make a visual element
      let wrapper = document.createElement("div");
      wrapper.classList.add("canvas_container");
      wrapper.classList.add("non_selectable");
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;

      let canvas = document.createElement("canvas");
      canvas.classList.add("non_selectable");
      canvas.style.position = "relative";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.height = height;
      canvas.width = width;

      wrapper.appendChild(canvas);
      container.appendChild(wrapper);

      console.log("Canvas made");

      return canvas;
    }

    const xmin = -5;
    const xmax = 5;
    const ymin = -5;
    const ymax = 5;
    const min_val = -10;
    const max_val = 10;

    // Prepare the canvas and scene
    let width = 200;
    let height = 200;
    const dx = (xmax - xmin) / width;
    const dy = (ymax - ymin) / height;
    const dt = 0.03;

    let canvas = prepare_canvas(width, height, "scene-container");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Create ImageData object
    const imageData = ctx.createImageData(width, height);

    let waveEquationScene = new WaveEquationSceneElliptic(
      canvas,
      imageData,
      width,
      height,
      min_val,
      max_val,
      dx,
      dy,
      dt,
    );

    waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);

    // Make a slider which can be used to modify the mobject
    // It should send a message to the owning scene
    let y_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (f: number) {
        waveEquationScene.add_to_queue(
          waveEquationScene.set_semiminor_axis.bind(waveEquationScene, +f),
        );
      },
      `3`,
      0.5,
      3,
      0.01,
    );
    y_slider.width = 200;

    waveEquationScene.init();
    waveEquationScene.toggle_pause();
    waveEquationScene.start_playing(undefined);
  });
})();
