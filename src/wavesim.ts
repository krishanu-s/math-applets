// Testing the direct feeding of a pixel array to the canvas
import * as np from "numpy-ts";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let WAVE_PROPAGATION_SPEED = 1.0;
let PML_WIDTH = 1.0;

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
function scale_array(arr: Array<number>, c: number): Array<number> {
  let new_arr = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    new_arr[i] = c * (arr[i] as number);
  }
  return new_arr;
}

// Holds a pixel array internally (in grayscale) as an array of
// real numbers between 0 and 1.
// Writes to the ImageDataArray for rendering.
// TODO: Make it possible to store the pixel array at a smaller size (pw, ph) than
// the canvas (cw, ch), and then linearly interpolate for rendering
class PixelArray {
  time: number;
  width: number;
  height: number;
  pixelArray: Array<number>;
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  constructor(width: number, height: number, min_val: number, max_val: number) {
    this.time = 0;
    this.width = width;
    this.height = height;
    this.min_val = min_val;
    this.max_val = max_val;
    this.pixelArray = this.new_arr();
  }
  // Makes a new pixel array
  new_arr(): Array<number> {
    return new Array(this.width * this.height).fill(0);
  }
  // Converts xy-coordinates to linear pixel array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Ticks the simulation forward by one step
  // TODO Turn this into an actual simulator which propagates the changes according to some step
  tick() {
    this.make_horizontal_gradient(this.time / 256);
    this.time++;
  }
  // TEST IMAGE: Horizontal grayscale gradient
  make_horizontal_gradient(shift: number) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = this.index(x, y);
        const gray = (shift + x / this.width) % 1;
        this.pixelArray[index] =
          this.min_val + gray * (this.max_val - this.min_val);
      }
    }
  }
  // TEST IMAGE: Vertical grayscale gradient
  make_vertical_gradient(shift: number) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = this.index(x, y);
        const gray = (shift + y / this.height) % 1;
        this.pixelArray[index] =
          this.min_val + gray * (this.max_val - this.min_val);
      }
    }
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
// TODO Major refactoring needed for efficiency. Convert to numpy-ts.
// When the functions \sigma_x and \sigma_y are both 0, we retrieve the undamped wave equation.
class WaveEquationSimulatorPML {
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
  // sx: np.NDArray;
  // sy: np.NDArray;
  constructor(
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
  ) {
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

    // let s;
    // this.sx = this.new_arr();
    // for (let x = 0; x < this.width; x++) {
    //   s = this.sigma_x(x);
    //   for (let y = 0; y < this.width; y++) {
    //     this.sx.set([x, y], s);
    //   }
    // }
    // this.sy = this.new_arr();
    // for (let y = 0; y < this.width; y++) {
    //   s = this.sigma_y(y);
    //   for (let x = 0; x < this.width; x++) {
    //     this.sy.set([x, y], s);
    //   }
    // }
    this.add_point_source(this.uValues, this.vValues, this.time);
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
    return 0;
    // let layer_start = ((this.width - 1) / 2) * this.dx - PML_WIDTH;
    // if (Math.abs(x) >= layer_start) {
    //   return 5 * (Math.abs(x) - layer_start) ** 2;
    // } else {
    //   return 0;
    // }
  }
  sigma_y(y: number): number {
    // Defines on integer slice indices
    return this._sigma_y((y - (this.height - 1) / 2) * this.dy);
  }
  _sigma_y(y: number): number {
    // Defined on real numbers
    return 0;
    // let layer_start = ((this.height - 1) / 2) * this.dy - PML_WIDTH;
    // if (Math.abs(y) >= layer_start) {
    //   return 5 * (Math.abs(y) - layer_start) ** 2;
    // } else {
    //   return 0;
    // }
  }
  // Converts from a flat Array<number> to a np.NDArray of shape (W, H) where the
  // first index proceeds faster than the second.
  to_numpy(arr: Array<number>): np.NDArray {
    return np.array(arr).reshape(this.height, this.width).transpose();
  }
  // Converts to a flat Array<number> from a np.NDArray of shape (W, H) where the
  // first index proceeds faster than the second.
  from_numpy(arr: np.NDArray): Array<number> {
    return np.reshape(arr.transpose(), [this.width * this.height]).toArray();
  }
  // (d/dx)
  d_x(arr: Array<number>): Array<number> {
    let np_arr = this.to_numpy(arr);
    let mid = np_arr
      .slice("2:", ":")
      .subtract(np_arr.slice(":-2", ":"))
      .multiply(1 / (2 * this.dx));
    let left = mid
      .slice("0", ":")
      .multiply(2)
      .subtract(mid.slice("1", ":"))
      .expand_dims(0);
    let right = mid
      .slice("-1", ":")
      .multiply(2)
      .subtract(mid.slice("-2", ":"))
      .expand_dims(0);
    return this.from_numpy(np.concatenate([left, mid, right], 0));
    // let dX = this.new_arr();
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 1; x < this.width - 1; x++) {
    //     dX[this.index(x, y)] =
    //       ((arr[this.index(x + 1, y)] as number) -
    //         (arr[this.index(x - 1, y)] as number)) /
    //       (2 * this.dx);
    //   }
    //   dX[this.index(0, y)] =
    //     2 * (dX[this.index(1, y)] as number) - (dX[this.index(2, y)] as number);
    //   dX[this.index(this.width - 1, y)] =
    //     2 * (dX[this.index(this.width - 2, y)] as number) -
    //     (dX[this.index(this.width - 3, y)] as number);
    // }
    // return dX;
  }
  // (d/dy)
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
  // (d/dx)^2
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
  // (d/dy)^2
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
  // Given the current state of shape (W, H), computes the Laplacian of shape (W, H)
  // TODO Combine computation of l_x and l_y for efficiency
  laplacian(arr: Array<number>): Array<number> {
    return linear_combination_arrays(this.l_x(arr), 1.0, this.l_y(arr), 1.0);
  }
  // First-derivative in time for u-array
  uDot(v: Array<number>): Array<number> {
    let arr = this.new_arr();
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
    let lu = this.laplacian(u);
    let dxpx = this.d_x(px);
    let dypy = this.d_y(py);
    let arr = this.new_arr();
    let ind;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        arr[ind] =
          WAVE_PROPAGATION_SPEED ** 2 * (lu[ind] as number) +
          (dxpx[ind] as number) +
          (dypy[ind] as number) -
          (this.sigma_x(x) + this.sigma_y(y)) * (v[ind] as number) -
          this.sigma_x(x) * this.sigma_y(y) * (u[ind] as number);
      }
    }
    return arr;
  }
  // First derivative in time for x-component of p
  pxDot(u: Array<number>, px: Array<number>): Array<number> {
    let dxu = this.d_x(u);
    let arr = this.new_arr();
    let ind;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        arr[ind] =
          -this.sigma_x(x) * (px[ind] as number) +
          WAVE_PROPAGATION_SPEED ** 2 *
            (this.sigma_y(y) - this.sigma_x(x)) *
            (dxu[ind] as number);
      }
    }
    return arr;
  }
  // First derivative in time for y-component of p
  pyDot(u: Array<number>, py: Array<number>): Array<number> {
    let dyu = this.d_y(u);
    let arr = this.new_arr();
    let ind;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        arr[ind] =
          -this.sigma_y(y) * (py[ind] as number) +
          WAVE_PROPAGATION_SPEED ** 2 *
            (this.sigma_x(x) - this.sigma_y(y)) *
            (dyu[ind] as number);
      }
    }
    return arr;
  }
  // // First derivative in time for p-array
  // pDot(u: Array<number>, v: Array<number>, p: Array<number>): Array<number> {
  //   let lu_x = this.l_x(u);
  //   let lu_y = this.l_y(u);
  //   let arr = this.new_arr();
  //   let ind;
  //   for (let y = 0; y < this.height; y++) {
  //     for (let x = 0; x < this.width; x++) {
  //       ind = this.index(x, y);
  //       arr[ind] =
  //         WAVE_PROPAGATION_SPEED ** 2 *
  //           (this.sigma_y(y) * (lu_x[ind] as number) +
  //             this.sigma_x(x) * (lu_y[ind] as number)) -
  //         this.sigma_x(x) * this.sigma_y(y) * (v[ind] as number);
  //     }
  //   }
  //   return arr;
  // }
  // Uses either finite-difference or Runge-Kutta to advance the differential equation.
  step(dt: number) {
    let du_1 = this.uDot(this.vValues);
    let dv_1 = this.vDot(
      this.uValues,
      this.vValues,
      this.pxValues,
      this.pyValues,
    );
    let dpx_1 = this.pxDot(this.uValues, this.pxValues);
    let dpy_1 = this.pxDot(this.uValues, this.pyValues);

    let u1 = add_scaled_array(this.uValues, du_1, dt / 2);
    let v1 = add_scaled_array(this.vValues, dv_1, dt / 2);
    let px1 = add_scaled_array(this.pxValues, dpx_1, dt / 2);
    let py1 = add_scaled_array(this.pyValues, dpy_1, dt / 2);

    this.add_point_source(u1, v1, this.time + dt / 2);

    let du_2 = this.uDot(v1);
    let dv_2 = this.vDot(u1, v1, px1, py1);
    let dpx_2 = this.pxDot(u1, px1);
    let dpy_2 = this.pyDot(u1, py1);

    let u2 = add_scaled_array(this.uValues, du_2, dt / 2);
    let v2 = add_scaled_array(this.vValues, dv_2, dt / 2);
    let px2 = add_scaled_array(this.pxValues, dpx_2, dt / 2);
    let py2 = add_scaled_array(this.pyValues, dpy_2, dt / 2);

    this.add_point_source(u2, v2, this.time + dt / 2);

    let du_3 = this.uDot(v2);
    let dv_3 = this.vDot(u2, v2, px2, py2);
    let dpx_3 = this.pxDot(u2, px2);
    let dpy_3 = this.pyDot(u2, py2);

    let u3 = add_scaled_array(this.uValues, du_3, dt);
    let v3 = add_scaled_array(this.vValues, dv_3, dt);
    let px3 = add_scaled_array(this.pxValues, dpx_3, dt);
    let py3 = add_scaled_array(this.pyValues, dpy_3, dt);

    this.add_point_source(u3, v3, this.time + dt);

    let du_4 = this.uDot(v3);
    let dv_4 = this.vDot(u3, v3, px3, py3);
    let dpx_4 = this.pxDot(u3, px3);
    let dpy_4 = this.pyDot(u3, py3);

    let s;
    for (let ind = 0; ind < this.width * this.height; ind++) {
      s = (du_1[ind] as number) * (dt / 6);
      s += (du_2[ind] as number) * (dt / 3);
      s += (du_3[ind] as number) * (dt / 3);
      s += (du_4[ind] as number) * (dt / 6);
      this.uValues[ind] = (this.uValues[ind] as number) + s;

      s = (dv_1[ind] as number) * (dt / 6);
      s += (dv_2[ind] as number) * (dt / 3);
      s += (dv_3[ind] as number) * (dt / 3);
      s += (dv_4[ind] as number) * (dt / 6);
      this.vValues[ind] = (this.vValues[ind] as number) + s;

      s = (dpx_1[ind] as number) * (dt / 6);
      s += (dpx_2[ind] as number) * (dt / 3);
      s += (dpx_3[ind] as number) * (dt / 3);
      s += (dpx_4[ind] as number) * (dt / 6);
      this.pxValues[ind] = (this.pxValues[ind] as number) + s;

      s = (dpy_1[ind] as number) * (dt / 6);
      s += (dpy_2[ind] as number) * (dt / 3);
      s += (dpy_3[ind] as number) * (dt / 3);
      s += (dpy_4[ind] as number) * (dt / 6);
      this.pyValues[ind] = (this.pyValues[ind] as number) + s;
    }

    this.add_point_source(this.uValues, this.vValues, this.time + dt);
    this.time += dt;
  }
  add_point_source(u: Array<number>, v: Array<number>, t: number): void {
    let w = 3.0;
    let ind = this.index(
      Math.floor(this.width / 2),
      Math.floor(this.height / 2),
    );

    u[ind] = Math.sin(w * t);
    v[ind] = w * Math.cos(w * t);
    // Unnecessary to modify the auxiliary fields as they vanish inside the vacuum region
  }
  // Writes the pixel array to an ImageDataArray object for rendering.
  write_data(data: ImageDataArray) {
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.uValues[i] as number;
      const gray = (px_val - this.min_val) / (this.max_val - this.min_val);
      const idx = i * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = 256 * clamp(gray);
      data[idx + 3] = 255;
    }
  }
}

class WaveEquationSimulatorPMLNumpy {
  time: number;
  width: number;
  height: number;
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  dx: number;
  dy: number;
  uValues: np.NDArray;
  vValues: np.NDArray;
  pxValues: np.NDArray;
  pyValues: np.NDArray;
  sx: np.NDArray;
  sy: np.NDArray;
  constructor(
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
  ) {
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

    let s;
    this.sx = this.new_arr();
    for (let x = 0; x < this.width; x++) {
      s = this.sigma_x(x);
      for (let y = 0; y < this.width; y++) {
        this.sx.set([x, y], s);
      }
    }
    this.sy = this.new_arr();
    for (let y = 0; y < this.width; y++) {
      s = this.sigma_y(y);
      for (let x = 0; x < this.width; x++) {
        this.sy.set([x, y], s);
      }
    }
    this.add_point_source(this.uValues, this.vValues, this.time);
  }
  // Makes a new array
  new_arr(): np.NDArray {
    return np.zeros([this.width, this.height]);
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Sets the initial conditions
  set_init_conditions(x0: np.NDArray, v0: np.NDArray): void {
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
    return 0;
    // let layer_start = ((this.width - 1) / 2) * this.dx - PML_WIDTH;
    // if (Math.abs(x) >= layer_start) {
    //   return 5 * (Math.abs(x) - layer_start) ** 2;
    // } else {
    //   return 0;
    // }
  }
  sigma_y(y: number): number {
    // Defines on integer slice indices
    return this._sigma_y((y - (this.height - 1) / 2) * this.dy);
  }
  _sigma_y(y: number): number {
    // Defined on real numbers
    return 0;
    // let layer_start = ((this.height - 1) / 2) * this.dy - PML_WIDTH;
    // if (Math.abs(y) >= layer_start) {
    //   return 5 * (Math.abs(y) - layer_start) ** 2;
    // } else {
    //   return 0;
    // }
  }
  // (d/dx)
  d_x(arr: np.NDArray): np.NDArray {
    let mid = arr
      .slice("2:", ":")
      .subtract(arr.slice(":-2", ":"))
      .multiply(1 / (2 * this.dx));
    let left = mid
      .slice("0", ":")
      .multiply(2)
      .subtract(mid.slice("1", ":"))
      .expand_dims(0);
    let right = mid
      .slice("-1", ":")
      .multiply(2)
      .subtract(mid.slice("-2", ":"))
      .expand_dims(0);
    return np.concatenate([left, mid, right], 0);
    // let dX = this.new_arr();
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 1; x < this.width - 1; x++) {
    //     dX[this.index(x, y)] =
    //       ((arr[this.index(x + 1, y)] as number) -
    //         (arr[this.index(x - 1, y)] as number)) /
    //       (2 * this.dx);
    //   }
    //   dX[this.index(0, y)] =
    //     2 * (dX[this.index(1, y)] as number) - (dX[this.index(2, y)] as number);
    //   dX[this.index(this.width - 1, y)] =
    //     2 * (dX[this.index(this.width - 2, y)] as number) -
    //     (dX[this.index(this.width - 3, y)] as number);
    // }
    // return dX;
  }
  // (d/dy)
  d_y(arr: np.NDArray): np.NDArray {
    let mid = arr
      .slice(":", "2:")
      .subtract(arr.slice(":", ":-2"))
      .multiply(1 / (2 * this.dy));
    let top = mid
      .slice(":", "0")
      .multiply(2)
      .subtract(mid.slice(":", "1"))
      .expand_dims(-1);
    let bottom = mid
      .slice(":", "-1")
      .multiply(2)
      .subtract(mid.slice(":", "-2"))
      .expand_dims(-1);
    return np.concatenate([top, mid, bottom], -1);
    // let dY = this.new_arr();
    // for (let x = 0; x < this.width; x++) {
    //   for (let y = 1; y < this.height - 1; y++) {
    //     dY[this.index(x, y)] =
    //       ((arr[this.index(x, y + 1)] as number) -
    //         (arr[this.index(x, y - 1)] as number)) /
    //       (2 * this.dx);
    //   }
    //   dY[this.index(x, 0)] =
    //     2 * (dY[this.index(x, 1)] as number) - (dY[this.index(x, 2)] as number);
    //   dY[this.index(x, this.height - 1)] =
    //     2 * (dY[this.index(x, this.height - 2)] as number) -
    //     (dY[this.index(x, this.height - 3)] as number);
    // }
    // return dY;
  }
  // (d/dx)^2
  l_x(arr: np.NDArray): np.NDArray {
    let mid = arr
      .slice("2:", ":")
      .add(arr.slice(":-2", ":"))
      .subtract(arr.slice("1:-1", ":").multiply(2))
      .multiply(1 / (this.dx * this.dx));
    let left = mid
      .slice("0", ":")
      .multiply(2)
      .subtract(mid.slice("1", ":"))
      .expand_dims(0);
    let right = mid
      .slice("-1", ":")
      .multiply(2)
      .subtract(mid.slice("-2", ":"))
      .expand_dims(0);
    return np.concatenate([left, mid, right], 0);
    // let lapX = this.new_arr();
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 1; x < this.width - 1; x++) {
    //     lapX[this.index(x, y)] =
    //       ((arr[this.index(x - 1, y)] as number) +
    //         (arr[this.index(x + 1, y)] as number) -
    //         2 * (arr[this.index(x, y)] as number)) /
    //       (this.dx * this.dx);
    //   }
    //   lapX[this.index(0, y)] =
    //     2 * (lapX[this.index(1, y)] as number) -
    //     (lapX[this.index(2, y)] as number);
    //   lapX[this.index(this.width - 1, y)] =
    //     2 * (lapX[this.index(this.width - 2, y)] as number) -
    //     (lapX[this.index(this.width - 3, y)] as number);
    // }
    // return lapX;
  }
  // (d/dy)^2
  l_y(arr: np.NDArray): np.NDArray {
    let mid = arr
      .slice(":", "2:")
      .add(arr.slice(":", ":-2"))
      .subtract(arr.slice(":", "1:-1").multiply(2))
      .multiply(1 / (this.dy * this.dy));
    let top = mid
      .slice(":", "0")
      .multiply(2)
      .subtract(mid.slice(":", "1"))
      .expand_dims(-1);
    let bottom = mid
      .slice(":", "-1")
      .multiply(2)
      .subtract(mid.slice(":", "-2"))
      .expand_dims(-1);
    return np.concatenate([top, mid, bottom], -1);
    // let lapY = this.new_arr();
    // for (let x = 0; x < this.width; x++) {
    //   for (let y = 1; y < this.height - 1; y++) {
    //     lapY[this.index(x, y)] =
    //       ((arr[this.index(x, y - 1)] as number) +
    //         (arr[this.index(x, y + 1)] as number) -
    //         2 * (arr[this.index(x, y)] as number)) /
    //       (this.dy * this.dy);
    //   }
    // lapY[this.index(x, 0)] =
    //   2 * (lapY[this.index(x, 1)] as number) -
    //   (lapY[this.index(x, 2)] as number);
    // lapY[this.index(x, this.height - 1)] =
    //   2 * (lapY[this.index(x, this.height - 2)] as number) -
    //   (lapY[this.index(x, this.height - 3)] as number);
    // }
    // return lapY;
  }
  // Given the current state of shape (W, H), computes the Laplacian of shape (W, H)
  // TODO Combine computation of l_x and l_y for efficiency
  laplacian(arr: np.NDArray): np.NDArray {
    return this.l_x(arr).add(this.l_y(arr));
    // return linear_combination_arrays(this.l_x(arr), 1.0, this.l_y(arr), 1.0);
  }
  // First-derivative in time for u-array
  uDot(v: np.NDArray): np.NDArray {
    return v.copy();
    // let arr = this.new_arr();
    // for (let ind = 0; ind < this.width * this.height; ind++) {
    //   arr[ind] = v[ind] as number;
    // }
    // return arr;
  }
  // First-derivative in time for v-array
  vDot(
    u: np.NDArray,
    v: np.NDArray,
    px: np.NDArray,
    py: np.NDArray,
  ): np.NDArray {
    return this.laplacian(u)
      .multiply(WAVE_PROPAGATION_SPEED ** 2)
      .add(this.d_x(px))
      .add(this.d_y(py))
      .subtract(v.multiply(this.sx.add(this.sy)))
      .subtract(u.multiply(this.sx.multiply(this.sy)));
    // let lu = this.laplacian(u);
    // let dxpx = this.d_x(px);
    // let dypy = this.d_y(py);
    // let arr = this.new_arr();
    // let ind;
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 0; x < this.width; x++) {
    //     ind = this.index(x, y);
    //     arr[ind] =
    //       WAVE_PROPAGATION_SPEED ** 2 * (lu[ind] as number) +
    //       (dxpx[ind] as number) +
    //       (dypy[ind] as number) -
    //       (this.sigma_x(x) + this.sigma_y(y)) * (v[ind] as number) -
    //       this.sigma_x(x) * this.sigma_y(y) * (u[ind] as number);
    //   }
    // }
    // return arr;
  }
  // First derivative in time for x-component of p
  pxDot(u: np.NDArray, px: np.NDArray): np.NDArray {
    return this.d_x(u)
      .multiply(this.sy.subtract(this.sx))
      .multiply(WAVE_PROPAGATION_SPEED ** 2)
      .subtract(px.multiply(this.sx));
    // let dxu = this.d_x(u);
    // let arr = this.new_arr();
    // let ind;
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 0; x < this.width; x++) {
    //     ind = this.index(x, y);
    //     arr[ind] =
    //       -this.sigma_x(x) * (px[ind] as number) +
    //       WAVE_PROPAGATION_SPEED ** 2 *
    //         (this.sigma_y(y) - this.sigma_x(x)) *
    //         (dxu[ind] as number);
    //   }
    // }
    // return arr;
  }
  // First derivative in time for y-component of p
  pyDot(u: np.NDArray, py: np.NDArray): np.NDArray {
    return this.d_y(u)
      .multiply(this.sx.subtract(this.sy))
      .multiply(WAVE_PROPAGATION_SPEED ** 2)
      .subtract(py.multiply(this.sy));
    // let dyu = this.d_y(u);
    // let arr = this.new_arr();
    // let ind;
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 0; x < this.width; x++) {
    //     ind = this.index(x, y);
    //     arr[ind] =
    //       -this.sigma_y(y) * (py[ind] as number) +
    //       WAVE_PROPAGATION_SPEED ** 2 *
    //         (this.sigma_x(x) - this.sigma_y(y)) *
    //         (dyu[ind] as number);
    //   }
    // }
    // return arr;
  }
  // // First derivative in time for p-array
  // pDot(u: Array<number>, v: Array<number>, p: Array<number>): Array<number> {
  //   let lu_x = this.l_x(u);
  //   let lu_y = this.l_y(u);
  //   let arr = this.new_arr();
  //   let ind;
  //   for (let y = 0; y < this.height; y++) {
  //     for (let x = 0; x < this.width; x++) {
  //       ind = this.index(x, y);
  //       arr[ind] =
  //         WAVE_PROPAGATION_SPEED ** 2 *
  //           (this.sigma_y(y) * (lu_x[ind] as number) +
  //             this.sigma_x(x) * (lu_y[ind] as number)) -
  //         this.sigma_x(x) * this.sigma_y(y) * (v[ind] as number);
  //     }
  //   }
  //   return arr;
  // }
  // Uses either finite-difference or Runge-Kutta to advance the differential equation.
  step(dt: number) {
    let du_1 = this.uDot(this.vValues);
    let dv_1 = this.vDot(
      this.uValues,
      this.vValues,
      this.pxValues,
      this.pyValues,
    );
    let dpx_1 = this.pxDot(this.uValues, this.pxValues);
    let dpy_1 = this.pxDot(this.uValues, this.pyValues);

    // let u1 = add_scaled_array(this.uValues, du_1, dt / 2);
    // let v1 = add_scaled_array(this.vValues, dv_1, dt / 2);
    // let px1 = add_scaled_array(this.pxValues, dpx_1, dt / 2);
    // let py1 = add_scaled_array(this.pyValues, dpy_1, dt / 2);
    let u1 = this.uValues.add(du_1.multiply(dt / 2));
    let v1 = this.vValues.add(dv_1.multiply(dt / 2));
    let px1 = this.pxValues.add(dpx_1.multiply(dt / 2));
    let py1 = this.pyValues.add(dpy_1.multiply(dt / 2));

    this.add_point_source(u1, v1, this.time + dt / 2);

    let du_2 = this.uDot(v1);
    let dv_2 = this.vDot(u1, v1, px1, py1);
    let dpx_2 = this.pxDot(u1, px1);
    let dpy_2 = this.pyDot(u1, py1);

    // let u2 = add_scaled_array(this.uValues, du_2, dt / 2);
    // let v2 = add_scaled_array(this.vValues, dv_2, dt / 2);
    // let px2 = add_scaled_array(this.pxValues, dpx_2, dt / 2);
    // let py2 = add_scaled_array(this.pyValues, dpy_2, dt / 2);
    let u2 = this.uValues.add(du_2.multiply(dt / 2));
    let v2 = this.vValues.add(dv_2.multiply(dt / 2));
    let px2 = this.pxValues.add(dpx_2.multiply(dt / 2));
    let py2 = this.pyValues.add(dpy_2.multiply(dt / 2));

    this.add_point_source(u2, v2, this.time + dt / 2);

    let du_3 = this.uDot(v2);
    let dv_3 = this.vDot(u2, v2, px2, py2);
    let dpx_3 = this.pxDot(u2, px2);
    let dpy_3 = this.pyDot(u2, py2);

    // let u3 = add_scaled_array(this.uValues, du_3, dt);
    // let v3 = add_scaled_array(this.vValues, dv_3, dt);
    // let px3 = add_scaled_array(this.pxValues, dpx_3, dt);
    // let py3 = add_scaled_array(this.pyValues, dpy_3, dt);
    let u3 = this.uValues.add(du_3.multiply(dt));
    let v3 = this.vValues.add(dv_3.multiply(dt));
    let px3 = this.pxValues.add(dpx_3.multiply(dt));
    let py3 = this.pyValues.add(dpy_3.multiply(dt));

    this.add_point_source(u3, v3, this.time + dt);

    let du_4 = this.uDot(v3);
    let dv_4 = this.vDot(u3, v3, px3, py3);
    let dpx_4 = this.pxDot(u3, px3);
    let dpy_4 = this.pyDot(u3, py3);

    this.uValues = this.uValues
      .add(du_1.multiply(dt / 6))
      .add(du_2.multiply(dt / 3))
      .add(du_3.multiply(dt / 3))
      .add(du_4.multiply(dt / 6));
    this.vValues = this.vValues
      .add(dv_1.multiply(dt / 6))
      .add(dv_2.multiply(dt / 3))
      .add(dv_3.multiply(dt / 3))
      .add(dv_4.multiply(dt / 6));
    this.pxValues = this.pxValues
      .add(dpx_1.multiply(dt / 6))
      .add(dpx_2.multiply(dt / 3))
      .add(dpx_3.multiply(dt / 3))
      .add(dpx_4.multiply(dt / 6));
    this.pyValues = this.pyValues
      .add(dpy_1.multiply(dt / 6))
      .add(dpy_2.multiply(dt / 3))
      .add(dpy_3.multiply(dt / 3))
      .add(dpy_4.multiply(dt / 6));

    // let s;
    // for (let ind = 0; ind < this.width * this.height; ind++) {
    //   s = (du_1[ind] as number) * (dt / 6);
    //   s += (du_2[ind] as number) * (dt / 3);
    //   s += (du_3[ind] as number) * (dt / 3);
    //   s += (du_4[ind] as number) * (dt / 6);
    //   this.uValues[ind] = (this.uValues[ind] as number) + s;

    //   s = (dv_1[ind] as number) * (dt / 6);
    //   s += (dv_2[ind] as number) * (dt / 3);
    //   s += (dv_3[ind] as number) * (dt / 3);
    //   s += (dv_4[ind] as number) * (dt / 6);
    //   this.vValues[ind] = (this.vValues[ind] as number) + s;

    //   s = (dpx_1[ind] as number) * (dt / 6);
    //   s += (dpx_2[ind] as number) * (dt / 3);
    //   s += (dpx_3[ind] as number) * (dt / 3);
    //   s += (dpx_4[ind] as number) * (dt / 6);
    //   this.pxValues[ind] = (this.pxValues[ind] as number) + s;

    //   s = (dpy_1[ind] as number) * (dt / 6);
    //   s += (dpy_2[ind] as number) * (dt / 3);
    //   s += (dpy_3[ind] as number) * (dt / 3);
    //   s += (dpy_4[ind] as number) * (dt / 6);
    //   this.pyValues[ind] = (this.pyValues[ind] as number) + s;
    // }

    this.add_point_source(this.uValues, this.vValues, this.time + dt);
    this.time += dt;
  }
  add_point_source(u: np.NDArray, v: np.NDArray, t: number): void {
    let w = 3.0;
    u.set(
      [Math.floor(this.width / 2), Math.floor(this.height / 2)],
      Math.sin(w * t),
    );
    v.set(
      [Math.floor(this.width / 2), Math.floor(this.height / 2)],
      w * Math.cos(w * t),
    );
    // let ind = this.index(
    //   Math.floor(this.width / 2),
    //   Math.floor(this.height / 2),
    // );

    // u[ind] = Math.sin(w * t);
    // v[ind] = w * Math.cos(w * t);
    // Unnecessary to modify the auxiliary fields as they vanish inside the vacuum region
  }
  // Writes the pixel array to an ImageDataArray object for rendering.
  write_data(data: ImageDataArray) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const px_val = this.uValues.get([x, y]) as number;
        const gray = (px_val - this.min_val) / (this.max_val - this.min_val);
        const idx = this.index(x, y) * 4;
        data[idx] = data[idx + 1] = data[idx + 2] = 256 * clamp(gray);
        data[idx + 3] = 255;
      }
    }
    // for (let i = 0; i < this.width * this.height; i++) {
    //   const px_val = this.uValues[i] as number;
    //   const gray = (px_val - this.min_val) / (this.max_val - this.min_val);
    //   const idx = i * 4;
    //   data[idx] = data[idx + 1] = data[idx + 2] = 256 * clamp(gray);
    //   data[idx + 3] = 255;
    // }
  }
}

// Simulates the wave equation in 2D by storing the values as an array of shape (W, H)
// and the derivatives as an array of shape (W, H).
// To handle open boundary conditions we use the PML technique which attentuates the wave
// in a region near the open boundary -- this requires that values are allowed to be complex
// and so we need two more arrays for the imaginary parts.
class WaveEquationSimulator {
  time: number;
  width: number;
  height: number;
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  dx: number;
  dy: number;
  uValues: Array<number>;
  uDotValues: Array<number>;
  constructor(
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    dx: number,
    dy: number,
  ) {
    this.time = 0;
    this.width = width;
    this.height = height;
    this.min_val = min_val;
    this.max_val = max_val;
    this.dx = dx;
    this.dy = dy;
    // Scalar-valued function which represents the pixel array to be drawn.
    this.uValues = new Array(width * height).fill(0);
    this.uDotValues = new Array(width * height).fill(0);
  }
  // Makes a new pixel array
  new_arr(): Array<number> {
    return new Array(this.width * this.height).fill(0);
  }
  // Converts xy-coordinates to linear pixel array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Sets the initial (real) conditions
  set_init_conditions(x0: Array<number>, v0: Array<number>): void {
    this.uValues = x0;
    this.uDotValues = v0;
    this.time = 0;
  }
  // (d/dx)^2
  l_x(arr: Array<number>): Array<number> {
    let lapX = this.new_arr();
    let lapXIm = this.new_arr();
    // let new_arr = this.new_arr();
    let d1, d2;
    for (let y = 0; y < this.height; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        // // Set first and second derivative
        // if (x == 1) {
        //   d1 = (arr[this.index(x + 1, y)] as number) / (2 * this.dx);
        //   d2 =
        //     ((arr[this.index(x + 1, y)] as number) -
        //       2 * (arr[this.index(x, y)] as number)) /
        //     (this.dx * this.dx);
        // } else if (x == this.width - 1) {
        //   d1 = -(arr[this.index(x - 1, y)] as number) / (2 * this.dx);
        //   d2 =
        //     ((arr[this.index(x - 1, y)] as number) -
        //       2 * (arr[this.index(x, y)] as number)) /
        //     (this.dx * this.dx);
        // } else {
        //   d1 =
        //     ((arr[this.index(x + 1, y)] as number) +
        //       (arr[this.index(x - 1, y)] as number)) /
        //     (2 * this.dx);
        //   d2 =
        //     ((arr[this.index(x - 1, y)] as number) +
        //       (arr[this.index(x + 1, y)] as number) -
        //       2 * (arr[this.index(x, y)] as number)) /
        //     (this.dx * this.dx);
        // }
        // Middle section, no attenuation
        lapX[this.index(x, y)] =
          ((arr[this.index(x - 1, y)] as number) +
            (arr[this.index(x + 1, y)] as number) -
            2 * (arr[this.index(x, y)] as number)) /
          (this.dx * this.dx);
        // // Set Laplacian based on whether x is in an attenuated zone or not
        // if (x * this.dx < PML_WIDTH) {
        //   // Left strip
        // } else if ((this.width - 1 - x) * this.dx < PML_WIDTH) {
        //   // Right strip
        // } else {
        //   // Middle section, no attenuation
        //   lapX[this.index(x, y)] =
        //     ((arr[this.index(x - 1, y)] as number) +
        //       (arr[this.index(x + 1, y)] as number) -
        //       2 * (arr[this.index(x, y)] as number)) /
        //     (this.dx * this.dx);
        // }
      }
      // TODO This method of computing the Laplacian at the open boundary
      // gives rebound effects.
      // Option 0 (the preferred option, TODO): Use a PML to set the Laplacian on
      // strips along the sides. This is the only part of the code we have to modify.

      // Option 1: Compute the Laplacian at the end so that the last (n+2) Laplacians
      // go as a degree-n poly, for n = 2

      // new_arr[this.index(0, y)] =
      //   3 * (new_arr[this.index(1, y)] as number) -
      //   3 * (new_arr[this.index(2, y)] as number) +
      //   (new_arr[this.index(3, y)] as number);
      // new_arr[this.index(this.width - 1, y)] =
      //   3 * (new_arr[this.index(this.width - 2, y)] as number) -
      //   3 * (new_arr[this.index(this.width - 3, y)] as number) +
      //   (new_arr[this.index(this.width - 4, y)] as number);
      // Option 2
      // new_arr[this.index(0, y)] =
      //   ((arr[this.index(1, y)] as number) -
      //     2 * (arr[this.index(0, y)] as number)) /
      //   (this.dx * this.dx);
      // new_arr[this.index(this.width - 1, y)] =
      //   ((arr[this.index(this.width - 2, y)] as number) -
      //     2 * (arr[this.index(this.width - 1, y)] as number)) /
      //   (this.dx * this.dx);
      // Option 3
      // new_arr[this.index(0, y)] = 0;
      // new_arr[this.index(this.width - 1, y)] = 0;
    }
    return lapX;
  }
  // (d/dy)^2
  l_y(arr: Array<number>): Array<number> {
    let new_arr = this.new_arr();
    for (let x = 0; x < this.width; x++) {
      for (let y = 1; y < this.height - 1; y++) {
        new_arr[this.index(x, y)] =
          ((arr[this.index(x, y - 1)] as number) +
            (arr[this.index(x, y + 1)] as number) -
            2 * (arr[this.index(x, y)] as number)) /
          (this.dy * this.dy);
      }
      // TODO This method of computing the Laplacian at the open boundary gives rebound effects.
      // Option 0 (the preferred option, TODO): Use a PML to set the Laplacian on
      // strips along the sides. This is the only part of the code we have to modify.
      // Option 1: Compute the Laplacian at the end so that the last (n+2) Laplacians
      // go as a degree-n poly, for n = 2
      new_arr[this.index(x, 0)] =
        3 * (new_arr[this.index(x, 1)] as number) -
        3 * (new_arr[this.index(x, 2)] as number) +
        (new_arr[this.index(x, 3)] as number);
      new_arr[this.index(x, this.height - 1)] =
        3 * (new_arr[this.index(x, this.height - 2)] as number) -
        3 * (new_arr[this.index(x, this.height - 3)] as number) +
        (new_arr[this.index(x, this.height - 4)] as number);
      // Option 2
      // new_arr[this.index(x, 0)] =
      //   ((arr[this.index(x, 1)] as number) -
      //     2 * (arr[this.index(x, 0)] as number)) /
      //   (this.dy * this.dy);
      // new_arr[this.index(x, this.height - 1)] =
      //   ((arr[this.index(x, this.height - 2)] as number) -
      //     2 * (arr[this.index(x, this.height - 1)] as number)) /
      //   (this.dy * this.dy);
      // Option 3
      // new_arr[this.index(x, 0)] = 0;
      // new_arr[this.index(x, this.height - 1)] = 0;
    }
    return new_arr;
  }
  // Given the current state of shape (W, H), computes the Laplacian of shape (W, H)
  // TODO Combine computation of l_x and l_y for efficiency
  laplacian(arr: Array<number>, t: number): Array<number> {
    return linear_combination_arrays(this.l_x(arr), 1.0, this.l_y(arr), 1.0);
  }
  // Given an array of shape (2, W, H) containing the evolved values and derivatives,
  // modifies it to reflect the boundary conditions
  add_bdy_values(uArr: Array<number>, uDotArr: Array<number>, t: number): void {
    // this.rectilinear_compact(arr, arr_deriv);
    this.add_point_source(uArr, uDotArr);
  }
  // Special case corresponding to a point-source wave at the center of the array.
  add_point_source(uArr: Array<number>, uDotArr: Array<number>): void {
    let w = 3.0;
    let index =
      Math.floor(this.height / 2) * this.width + Math.floor(this.width / 2);
    uArr[index] = Math.sin(w * this.time);
    uDotArr[index] = w * Math.cos(w * this.time);
  }
  // Special case corresponding to the boundary condition 0 around the square
  rectilinear_compact(uArr: Array<number>, uDotArr: Array<number>): void {
    for (let x = 0; x < this.width; x++) {
      uArr[this.index(x, 0)] = 0;
      uArr[this.index(x, this.height - 1)] = 0;
      uDotArr[this.index(x, 0)] = 0;
      uDotArr[this.index(x, this.height - 1)] = 0;
    }
    for (let y = 0; y < this.width; y++) {
      uArr[this.index(0, y)] = 0;
      uArr[this.index(this.width - 1, y)] = 0;
      uDotArr[this.index(0, y)] = 0;
      uDotArr[this.index(this.width - 1, y)] = 0;
    }
  }
  // Moves the simulation forward by time dt, using Runge-Kutta
  // TODO The numerical speed of this simulation is the limiter to rendering speed.
  // It would help if we can condense the loops.
  // TODO Add in PML to computations here.
  step(dt: number) {
    const l1 = this.laplacian(this.uValues, this.time);
    const v1 = add_scaled_array(this.uValues, this.uDotValues, dt / 2);
    const d1 = add_scaled_array(
      this.uDotValues,
      l1,
      (dt / 2) * WAVE_PROPAGATION_SPEED ** 2,
    );
    this.add_bdy_values(v1, d1, this.time + dt / 2);

    const l2 = this.laplacian(v1, this.time + dt / 2);
    const v2 = add_scaled_array(this.uValues, d1, dt / 2);
    const d2 = add_scaled_array(
      this.uDotValues,
      l2,
      (dt / 2) * WAVE_PROPAGATION_SPEED ** 2,
    );
    this.add_bdy_values(v2, d2, this.time + dt / 2);

    const l3 = this.laplacian(v2, this.time + dt / 2);
    const v3 = add_scaled_array(this.uValues, d2, dt);
    const d3 = add_scaled_array(
      this.uDotValues,
      l3,
      dt * WAVE_PROPAGATION_SPEED ** 2,
    );
    this.add_bdy_values(v3, d3, this.time + dt);

    const l4 = this.laplacian(v3, this.time + dt);
    let v4, d4;
    v4 = add_scaled_array(this.uValues, this.uDotValues, dt / 6);
    v4 = add_scaled_array(v4, d1, dt / 3);
    v4 = add_scaled_array(v4, d2, dt / 3);
    v4 = add_scaled_array(v4, d3, dt / 6);
    d4 = add_scaled_array(
      this.uDotValues,
      l1,
      (dt / 6) * WAVE_PROPAGATION_SPEED ** 2,
    );
    d4 = add_scaled_array(d4, l2, (dt / 3) * WAVE_PROPAGATION_SPEED ** 2);
    d4 = add_scaled_array(d4, l3, (dt / 3) * WAVE_PROPAGATION_SPEED ** 2);
    d4 = add_scaled_array(d4, l4, (dt / 6) * WAVE_PROPAGATION_SPEED ** 2);
    this.add_bdy_values(v4, d4, this.time + dt);

    this.uValues = v4;
    this.uDotValues = d4;
    this.time += dt;
  }
  // Writes the pixel array to an ImageDataArray object for rendering.
  write_data(data: ImageDataArray) {
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.uValues[i] as number;
      const gray = (px_val - this.min_val) / (this.max_val - this.min_val);
      const idx = i * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = 256 * clamp(gray);
      data[idx + 3] = 255;
    }
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
    let width = 151;
    let height = 151;
    const dx = (xmax - xmin) / (width - 1);
    const dy = (ymax - ymin) / (height - 1);
    const frame_length = 1 / 30;
    const num_steps = 5;
    const dt = frame_length / num_steps;

    let canvas = prepare_canvas(width, height, "scene-container");

    // Create test pattern pixel array
    // let waveEquationSim = new WaveEquationSimulator(
    //   width,
    //   height,
    //   -1.0,
    //   1.0,
    //   dx,
    //   dy,
    // );

    let waveEquationSim = new WaveEquationSimulatorPML(
      width,
      height,
      -1.0,
      1.0,
      dx,
      dy,
    );

    // Initial conditions, for rectilinear case
    // let x0 = waveEquationSim.new_arr();
    // let v0 = waveEquationSim.new_arr();
    // for (let y = 0; y < height; y++) {
    //   for (let x = 0; x < width; x++) {
    //     x0[waveEquationSim.index(x, y)] =
    //       Math.sin((3 * Math.PI * x) / (width - 1)) *
    //       Math.sin((3 * Math.PI * y) / (height - 1));
    //     v0[waveEquationSim.index(x, y)] = 0.0;
    //   }
    // }
    // waveEquationSim.set_init_conditions(x0, v0);

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Create ImageData object
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    console.log("Prepared image data object");

    while (true) {
      // waveEquationSim.tick();
      for (let i = 0; i < num_steps; i++) {
        waveEquationSim.step(dt);
      }

      // (2) Write to the imageData object
      waveEquationSim.write_data(data);

      // (3) Draw to canvas
      ctx.putImageData(imageData, 0, 0);

      // Frame rate 30 FPS
      console.log("Advancing one frame");
      await sleep(5 * frame_length);
    }
  });
})();
