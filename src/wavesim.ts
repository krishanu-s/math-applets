// Testing the direct feeding of a pixel array to the canvas
import { MObject, Scene, Slider } from "./base.js";
import {
  Vec2D,
  vec_scale,
  vec_sum,
  vec_sub,
  vec_norm,
  vec_sum_list,
} from "./base.js";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const WAVE_PROPAGATION_SPEED = 1.0;
const PML_STRENGTH = 5.0;
const PML_WIDTH = 1.0;

// Clamps a number to the interval [0, 1].
function clamp(x: number): number {
  if (x < 0) {
    return 0;
  } else if (x > 1) {
    return 1;
  } else {
    return x;
  }
}

// The function 1 / (1 + e^{-x})
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Helper functions with arrays
function linear_combination_arrays(
  arr: Array<number>,
  a: number,
  other_arr: Array<number>,
  b: number,
): Array<number> {
  let new_arr = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    new_arr[i] = a * (arr[i] as number) + b * (other_arr[i] as number);
  }

  return new_arr;
}
function add_scaled_array(
  arr: Array<number>,
  other_arr: Array<number>,
  c: number,
): Array<number> {
  return linear_combination_arrays(arr, 1.0, other_arr, c);
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
      // data[idx] = data[idx + 1] = data[idx + 2] = 256 * clamp(gray);
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
//
// TODO Should the point source at the origin be modeled as an impulse term added to dv/dt?
// When the functions \sigma_x and \sigma_y are both 0, we retrieve the undamped wave equation.
// TODO Make the geometry of PML more user-definable.
// TODO Make it possible to add regions with different values of WAVE_PROPAGATION_SPEED, for refraction.
// TODO Make it possible to add a reflective element defined by an arbitrary curve. This will require some sophisticated math.
class WaveEquationScene extends Scene {
  time: number;
  width: number;
  height: number;
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  dx: number;
  dy: number;
  uValues: Array<number>;
  vValues: Array<number>;
  pxValues: Array<number>;
  pyValues: Array<number>;
  point_source: Vec2D;
  imageData: ImageData;
  action_queue: Array<CallableFunction>;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
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
    this.uValues = this.new_arr();
    this.vValues = this.new_arr();
    this.pxValues = this.new_arr();
    this.pyValues = this.new_arr();

    this.point_source = [
      Math.floor(this.width / 2),
      Math.floor(this.height / 2),
    ];
    this.action_queue = [];

    this.add(
      "heatmap",
      new HeatMap(width, height, min_val, max_val, this.uValues),
    );
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
  // (d/dx).
  d_x(arr: Array<number>): Array<number> {
    let dX = this.new_arr();
    for (let y = 0; y < this.height; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        dX[this.index(x, y)] =
          ((arr[this.index(x + 1, y)] as number) -
            (arr[this.index(x - 1, y)] as number)) /
          (2 * this.dx);
      }
      dX[this.index(0, y)] =
        2 * (dX[this.index(1, y)] as number) - (dX[this.index(2, y)] as number);
      dX[this.index(this.width - 1, y)] =
        2 * (dX[this.index(this.width - 2, y)] as number) -
        (dX[this.index(this.width - 3, y)] as number);
    }
    return dX;
  }
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
  // (d/dy).
  d_y(arr: Array<number>): Array<number> {
    let dY = this.new_arr();
    for (let x = 0; x < this.width; x++) {
      for (let y = 1; y < this.height - 1; y++) {
        dY[this.index(x, y)] =
          ((arr[this.index(x, y + 1)] as number) -
            (arr[this.index(x, y - 1)] as number)) /
          (2 * this.dx);
      }
      dY[this.index(x, 0)] =
        2 * (dY[this.index(x, 1)] as number) - (dY[this.index(x, 2)] as number);
      dY[this.index(x, this.height - 1)] =
        2 * (dY[this.index(x, this.height - 2)] as number) -
        (dY[this.index(x, this.height - 3)] as number);
    }
    return dY;
  }
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
  l_x(arr: Array<number>): Array<number> {
    let lapX = this.new_arr();
    for (let y = 0; y < this.height; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        lapX[this.index(x, y)] =
          ((arr[this.index(x - 1, y)] as number) +
            (arr[this.index(x + 1, y)] as number) -
            2 * (arr[this.index(x, y)] as number)) /
          (this.dx * this.dx);
      }
      lapX[this.index(0, y)] =
        2 * (lapX[this.index(1, y)] as number) -
        (lapX[this.index(2, y)] as number);
      lapX[this.index(this.width - 1, y)] =
        2 * (lapX[this.index(this.width - 2, y)] as number) -
        (lapX[this.index(this.width - 3, y)] as number);
    }
    return lapX;
  }
  l_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        (2 * (arr[this.index(0, y)] as number) -
          5 * (arr[this.index(1, y)] as number) +
          4 * (arr[this.index(2, y)] as number) -
          (arr[this.index(3, y)] as number)) /
        (this.dx * this.dx)
      );
    } else if (x == this.width - 1) {
      return (
        (2 * (arr[this.index(this.width - 1, y)] as number) -
          5 * (arr[this.index(this.width - 2, y)] as number) +
          4 * (arr[this.index(this.width - 3, y)] as number) -
          (arr[this.index(this.width - 4, y)] as number)) /
        (this.dx * this.dx)
      );
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          2 * (arr[this.index(x, y)] as number) +
          (arr[this.index(x - 1, y)] as number)) /
        (this.dx * this.dx)
      );
    }
  }
  // (d/dy)^2.
  l_y(arr: Array<number>): Array<number> {
    let lapY = this.new_arr();
    for (let x = 0; x < this.width; x++) {
      for (let y = 1; y < this.height - 1; y++) {
        lapY[this.index(x, y)] =
          ((arr[this.index(x, y - 1)] as number) +
            (arr[this.index(x, y + 1)] as number) -
            2 * (arr[this.index(x, y)] as number)) /
          (this.dy * this.dy);
      }
      lapY[this.index(x, 0)] =
        2 * (lapY[this.index(x, 1)] as number) -
        (lapY[this.index(x, 2)] as number);
      lapY[this.index(x, this.height - 1)] =
        2 * (lapY[this.index(x, this.height - 2)] as number) -
        (lapY[this.index(x, this.height - 3)] as number);
    }
    return lapY;
  }
  l_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        (2 * (arr[this.index(x, 0)] as number) -
          5 * (arr[this.index(x, 1)] as number) +
          4 * (arr[this.index(x, 2)] as number) -
          (arr[this.index(x, 3)] as number)) /
        (this.dy * this.dy)
      );
    } else if (y == this.height - 1) {
      return (
        (2 * (arr[this.index(x, this.height - 1)] as number) -
          5 * (arr[this.index(x, this.height - 2)] as number) +
          4 * (arr[this.index(x, this.height - 3)] as number) -
          (arr[this.index(x, this.height - 4)] as number)) /
        (this.dy * this.dy)
      );
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          2 * (arr[this.index(x, y)] as number) +
          (arr[this.index(x, y - 1)] as number)) /
        (this.dy * this.dy)
      );
    }
  }
  // Given the current state of shape (W, H), computes the Laplacian of shape (W, H)
  laplacian(arr: Array<number>): Array<number> {
    return linear_combination_arrays(this.l_x(arr), 1.0, this.l_y(arr), 1.0);
  }
  laplacian_entry(arr: Array<number>, x: number, y: number): number {
    return this.l_x_entry(arr, x, y) + this.l_y_entry(arr, x, y);
  }
  // First-derivative in time for u-array
  uDot(v: Array<number>): Array<number> {
    let arr = [];
    for (let ind = 0; ind < this.width * this.height; ind++) {
      arr.push(v[ind] as number);
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

    this.add_boundary_conditions(u, v, this.time + dt / 2);

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

    this.add_boundary_conditions(u, v, this.time + dt / 2);

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

    this.add_boundary_conditions(u, v, this.time + dt);

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

    this.add_boundary_conditions(this.uValues, this.vValues, this.time + dt);
    this.time += dt;
  }
  add_boundary_conditions(
    u: Array<number>,
    v: Array<number>,
    t: number,
  ): void {}
  // Draws the scene
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let heatmap = this.get_mobj("heatmap") as HeatMap;
    heatmap.set_vals(this.uValues);
    heatmap.draw(this.canvas, this, this.imageData);
  }
  // Initializes the first step
  init() {
    this.add_boundary_conditions(this.uValues, this.vValues, this.time);
  }
  // Starts animation
  start_playing() {
    if (this.action_queue.length > 0) {
      let callback = this.action_queue.shift() as () => void;
      callback();
    } else {
      this.step(0.03);
      this.draw();
    }
    window.requestAnimationFrame(this.start_playing.bind(this));
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
  ) {
    super(canvas, imageData, width, height, min_val, max_val, dx, dy);
    // Default settings
    this.point_source = [0, 0];
    this.w = 5.0;
    this.a = 5.0;
  }

  // Moves the point source
  move_point_source_x(x: number) {
    this.point_source[0] = x;
  }
  move_point_source_y(y: number) {
    this.point_source[1] = y;
  }
  add_boundary_conditions(u: Array<number>, v: Array<number>, t: number) {
    let [x, y] = this.s2c(this.point_source[0], this.point_source[1]);
    let ind = this.index(Math.floor(x), Math.floor(y));
    u[ind] = this.a * Math.sin(this.w * t);
    v[ind] = this.a * this.w * Math.cos(this.w * t);
  }
}

// TODO Implement reflecting surfaces, such as a conic section.
// Wave equation scene where waves emanate from a single point source at (0, 0)
// with a parabolic reflector defined by y + 1 = x^2 / 4

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
  ) {
    super(canvas, imageData, width, height, min_val, max_val, dx, dy);
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
  add_boundary_conditions(u: Array<number>, v: Array<number>, t: number) {
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

    // Prepare the canvas and scene
    let width = 301;
    let height = 301;
    const dx = (xmax - xmin) / (width - 1);
    const dy = (ymax - ymin) / (height - 1);

    let canvas = prepare_canvas(width, height, "scene-container");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Create ImageData object
    const imageData = ctx.createImageData(width, height);

    // Create test pattern pixel array
    // let waveEquationScene = new WaveEquationSimulator(
    //   width,
    //   height,
    //   -1.0,
    //   1.0,
    //   dx,
    //   dy,
    // );

    let waveEquationScene = new WaveEquationSceneDipole(
      canvas,
      imageData,
      width,
      height,
      -1.0,
      1.0,
      dx,
      dy,
    );

    // let waveEquationScene = new WaveEquationSceneDipole(
    //   canvas,
    //   imageData,
    //   width,
    //   height,
    //   -1.0,
    //   1.0,
    //   dx,
    //   dy,
    // );

    waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    waveEquationScene.init();

    // Make a slider which can be used to modify the mobject
    // It should send a message to the owning scene
    let x_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (x: number) {
        waveEquationScene.add_to_queue(
          waveEquationScene.move_dipole_x.bind(waveEquationScene, +x),
        );
      },
      // `${Math.floor(width / 2)}`,
      `0.5`,
      xmin,
      // width,
      xmax,
      0.01,
    );
    x_slider.width = 200;

    waveEquationScene.start_playing();
  });
})();
