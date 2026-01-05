import * as np from "numpy-ts";
import { Line, Dot, BezierCurve, Scene, Slider } from "./base.js";
import {
  Vec2D,
  vec_scale,
  vec_sum,
  vec_sub,
  vec_norm,
  vec_sum_list,
} from "./base.js";

// TODO Make a smooth Bezier spline class

// Given anchors points P_0, P_1, ..., P_n, computes handles
// B_1, B_2, ..., B_{2n} such that the sequence of Bezier splines
// (P_{i-1}, B_{2i-1}, B_{2i}, P_i) for i = 1, ..., n
// form a smooth curve.
class SmoothOpenPathBezierHandleCalculator {
  n: number;
  result: np.NDArray;
  constructor(n: number) {
    this.n = n;
    // Calculate and stores the n-by-(n+1) transformation matrix used for
    // computing the first Bezier handles of a sequence of n+1 anchor points,
    // as a function of the n+1 anchor points. This is computed as A^{-1}B,
    // where A is an n-by-n tridiagonal matrix and B is an n-by-(n+1) matrix.

    // Tridiagonal matrix which is to be inverted
    let below_diag_list: number[] = [];
    for (let i = 0; i < n - 2; i++) {
      below_diag_list.push(1.0);
    }
    below_diag_list.push(2.0);
    let below_diag = np.array(below_diag_list);

    let diag_list = [2.0];
    for (let i = 0; i < n - 2; i++) {
      diag_list.push(4.0);
    }
    diag_list.push(7.0);
    let diag = np.array(diag_list);

    let above_diag_list = [];
    for (let i = 0; i < n - 1; i++) {
      above_diag_list.push(1.0);
    }
    let above_diag = np.array(above_diag_list);

    // n-by-(n+1) matrix
    this.result = np.zeros([n, n + 1], "float32");
    this.result.set([0, 0], 1.0);
    this.result.set([0, 1], 2.0);
    for (let i = 1; i < n - 1; i++) {
      this.result.set([i, i], 4.0);
      this.result.set([i, i + 1], 2.0);
    }
    this.result.set([n - 1, n - 1], 8.0);
    this.result.set([n - 1, n], 1.0);

    // Eliminate lower-triangular entries in tridiagonal matrix
    for (let i = 0; i < n - 1; i++) {
      let scale = (below_diag.get([i]) as number) / (diag.get([i]) as number);
      diag.set(
        [i + 1],
        (diag.get([i + 1]) as number) - (above_diag.get([i]) as number) * scale,
      );
      below_diag.set(
        [i],
        (below_diag.get([i]) as number) - (diag.get([i]) as number) * scale,
      );
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i + 1, j],
          (this.result.get([i + 1, j]) as number) -
            (this.result.get([i, j]) as number) * scale,
        );
      }
    }

    // Eliminate upper-triangular entries in tridiagonal matrix
    for (let i = n - 2; i >= 0; i--) {
      let scale =
        (above_diag.get([i]) as number) / (diag.get([i + 1]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i, j],
          (this.result.get([i, j]) as number) -
            (this.result.get([i + 1, j]) as number) * scale,
        );
      }
    }

    // Normalize by diagonal entries in tridiagonal matrix
    for (let i = 0; i < n; i++) {
      let scale = 1 / (diag.get([i]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set([i, j], (this.result.get([i, j]) as number) * scale);
      }
    }
  }
  // Given a sequence of n+1 anchors, produces the corresponding bezier handles
  get_bezier_handles(a: np.NDArray): [np.NDArray, np.NDArray] {
    if (a.shape[0] !== this.n + 1) {
      throw new Error("Invalid anchor array shape");
    }
    if (a.shape[1] !== 2) {
      throw new Error("Invalid anchor array shape");
    }
    let h1 = this.result.matmul(a);

    let h2 = np.zeros([this.n, 2]);
    for (let i = 0; i < this.n - 1; i++) {
      h2.set(
        [i, 0],
        2 * (a.get([i + 1, 0]) as number) - (h1.get([i + 1, 0]) as number),
      );
      h2.set(
        [i, 1],
        2 * (a.get([i + 1, 1]) as number) - (h1.get([i + 1, 1]) as number),
      );
    }
    h2.set(
      [this.n - 1, 0],
      0.5 * (a.get([this.n, 0]) as number) + (h1.get([this.n, 0]) as number),
    );
    h2.set(
      [this.n - 1, 1],
      0.5 * (a.get([this.n, 1]) as number) + (h1.get([this.n, 1]) as number),
    );

    return [h1, h2];
  }
}

// Given anchors points P_0, P_1, ..., P_n, computes handles
// B_1, B_2, ..., B_{2n} such that the sequence of Bezier splines
// (P_{i-1}, B_{2i-1}, B_{2i}, P_i) for i = 1, ..., n
// form a smooth curve.
class SmoothClosedPathBezierHandleCalculator {
  n: number;
  result: np.NDArray;
  constructor(n: number) {
    this.n = n;
    // Calculate and stores the n-by-(n+1) transformation matrix used for
    // computing the first Bezier handles of a sequence of n+1 anchor points,
    // as a function of the n+1 anchor points. This is computed as A^{-1}B,
    // where A is an n-by-n tridiagonal matrix and B is an n-by-(n+1) matrix.

    // Tridiagonal matrix which is to be inverted
    let below_diag = np.ones([n - 1], "float32");

    let diag_list = [3.0];
    for (let i = 0; i < n - 2; i++) {
      diag_list.push(4.0);
    }
    diag_list.push(3.0);
    let diag = np.array(diag_list);

    let above_diag = np.ones([n - 1], "float32");

    // n-by-(n+1) matrix
    this.result = np.zeros([n, n + 1], "float32");
    for (let i = 0; i < n; i++) {
      this.result.set([i, i], 4.0);
      this.result.set([i, i + 1], 2.0);
    }

    // Computation of q, described in extra step below
    let v = np.zeros([n], "float32");
    v.set([0], 1.0);
    v.set([n - 1], 1.0);
    let q = np.zeros([n], "float32");
    q.set([0], 1.0);
    q.set([n - 1], 1.0);

    // Eliminate lower-triangular entries in tridiagonal matrix
    for (let i = 0; i < n - 1; i++) {
      let scale = (below_diag.get([i]) as number) / (diag.get([i]) as number);
      diag.set(
        [i + 1],
        (diag.get([i + 1]) as number) - (above_diag.get([i]) as number) * scale,
      );
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i + 1, j],
          (this.result.get([i + 1, j]) as number) -
            (this.result.get([i, j]) as number) * scale,
        );
      }
      q.set(
        [i + 1],
        (q.get([i + 1]) as number) - (q.get([i]) as number) * scale,
      );
    }

    // Eliminate upper-triangular entries in tridiagonal matrix
    for (let i = n - 2; i >= 0; i--) {
      let scale =
        (above_diag.get([i]) as number) / (diag.get([i + 1]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i, j],
          (this.result.get([i, j]) as number) -
            (this.result.get([i + 1, j]) as number) * scale,
        );
      }
      q.set([i], (q.get([i]) as number) - (q.get([i + 1]) as number) * scale);
    }

    // Normalize by diagonal entries in tridiagonal matrix
    for (let i = 0; i < n; i++) {
      let scale = 1 / (diag.get([i]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set([i, j], (this.result.get([i, j]) as number) * scale);
      }
      q.set([i], (q.get([i]) as number) * scale);
    }

    // Extra step: left-multiply the result by (I + qv^t)^{-1} = I - \frac{1}{1 + v^tq} qv^t, where v = [1 0 0 ... 0 1] and q = T^{-1}v
    let m = np
      .eye(this.n)
      .subtract(np.outer(q, v).multiply(1 / (1 + (np.dot(v, q) as number))));
    this.result = m.matmul(this.result);
  }
  // Given a sequence of n+1 anchors, produces the corresponding bezier handles
  get_bezier_handles(a: np.NDArray): [np.NDArray, np.NDArray] {
    if (a.shape[0] !== this.n + 1) {
      throw new Error("Invalid anchor array shape");
    }
    if (a.shape[1] !== 2) {
      throw new Error("Invalid anchor array shape");
    }
    let h1 = this.result.matmul(a);

    let h2 = np.zeros([this.n, 2]);
    for (let i = 0; i < this.n - 1; i++) {
      h2.set(
        [i, 0],
        2 * (a.get([i + 1, 0]) as number) - (h1.get([i + 1, 0]) as number),
      );
      h2.set(
        [i, 1],
        2 * (a.get([i + 1, 1]) as number) - (h1.get([i + 1, 1]) as number),
      );
    }
    h2.set(
      [this.n - 1, 0],
      2.0 * (a.get([0, 0]) as number) - (h1.get([0, 0]) as number),
    );
    h2.set(
      [this.n - 1, 1],
      2.0 * (a.get([0, 1]) as number) - (h1.get([0, 1]) as number),
    );

    return [h1, h2];
  }
}

class ClosedCurveScene extends Scene {
  n: number;
  calculator: SmoothClosedPathBezierHandleCalculator;
  x_cos_fourier_coeffs: number[];
  x_sin_fourier_coeffs: number[];
  y_cos_fourier_coeffs: number[];
  y_sin_fourier_coeffs: number[];
  constructor(canvas: HTMLCanvasElement, n: number) {
    super(canvas);
    this.n = n;
    this.calculator = new SmoothClosedPathBezierHandleCalculator(n);
    this.x_cos_fourier_coeffs = [0.0, 1.0, 0.0, 0.0];
    this.x_sin_fourier_coeffs = [0.0, 0.0, 0.0, 0.0];
    this.y_cos_fourier_coeffs = [0.0, 0.0, 0.0, 0.0];
    this.y_sin_fourier_coeffs = [0.0, 1.0, 0.0, 0.0];

    let a_list: np.NDArray[] = [];
    for (let i = 0; i < n; i++) {
      let p = this.calculate((i / n) * Math.PI * 2);
      this.add(`p${i}`, new Dot(p[0], p[1], 0.02));
      a_list.push(np.array(p));
    }
    a_list.push(np.array(this.calculate(0)));

    let a = np.stack(a_list, 0);
    let [handles_1, handles_2] = this.calculator.get_bezier_handles(a);
    for (let i = 0; i < n; i++) {
      let p = this.calculate((i / n) * Math.PI * 2);
      let q = this.calculate(((i + 1) / n) * Math.PI * 2);
      let h1 = [handles_1.get([i, 0]), handles_1.get([i, 1])] as Vec2D;
      let h2 = [handles_2.get([i, 0]), handles_2.get([i, 1])] as Vec2D;
      this.add(`c_${i}`, new BezierCurve(p, h1, h2, q, 0.02));
    }
  }
  // Move the anchors of the curve
  _move_anchors() {
    for (let i = 0; i < this.n; i++) {
      let p = this.calculate((i / this.n) * Math.PI * 2);
      let pt = this.get_mobj(`p${i}`) as Dot;
      pt.move_to(p[0], p[1]);
    }
  }
  _move_handles() {
    let a_list: np.NDArray[] = [];
    for (let i = 0; i < this.n + 1; i++) {
      let p = this.calculate((i / this.n) * Math.PI * 2);
      a_list.push(np.array(p));
    }
    let a = np.stack(a_list, 0);
    let [handles_1, handles_2] = this.calculator.get_bezier_handles(a);
    for (let i = 0; i < this.n; i++) {
      let p = this.calculate((i / this.n) * Math.PI * 2);
      let q = this.calculate(((i + 1) / this.n) * Math.PI * 2);
      let curve = this.get_mobj(`c${i}`) as BezierCurve;
      curve.move_start(a.get([i, 0]) as number, a.get([i, 1]) as number);
      curve.move_h1(
        handles_1.get([i, 0]) as number,
        handles_1.get([i, 1]) as number,
      );
      curve.move_h2(
        handles_2.get([i, 0]) as number,
        handles_2.get([i, 1]) as number,
      );
      curve.move_end(a.get([i + 1, 0]) as number, a.get([i + 1, 1]) as number);
    }
  }
  // 0 < t < 2*pi
  calculate(t: number): [number, number] {
    let result: [number, number] = [0, 0];
    for (let w = 0; w < 4; w++) {
      const cos = Math.cos(w * t);
      const sin = Math.sin(w * t);
      result[0] =
        result[0] +
        (this.x_cos_fourier_coeffs[w] as number) * cos -
        (this.x_sin_fourier_coeffs[w] as number) * sin;
      result[1] =
        result[1] +
        (this.y_cos_fourier_coeffs[w] as number) * cos -
        (this.y_sin_fourier_coeffs[w] as number) * sin;
    }
    return result;
  }
  set_x_cos_fourier_coeff(w: number, val: number) {
    this.x_cos_fourier_coeffs[w] = val;
    this._move_anchors();
    this._move_handles();
  }
  set_x_sin_fourier_coeff(w: number, val: number) {
    this.x_sin_fourier_coeffs[w] = val;
    this._move_anchors();
    this._move_handles();
  }
  set_y_cos_fourier_coeff(w: number, val: number) {
    this.y_cos_fourier_coeffs[w] = val;
    this._move_anchors();
    this._move_handles();
  }
  set_y_sin_fourier_coeff(w: number, val: number) {
    this.y_sin_fourier_coeffs[w] = val;
    this._move_anchors();
    this._move_handles();
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
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

    // Prepare the canvas and scene
    let width = 500;
    let height = 500;
    let canvas = prepare_canvas(width, height, "scene-container");

    // Define the catenary scene
    let scene = new ClosedCurveScene(canvas, 20);

    // Sets the initial parameters
    // scene.set_position([0.5, 0]);
    // scene.set_velocity([0, 0]);

    // Sets the coordinates for the scene
    let xlims: [number, number] = [-5.0, 5.0];
    let ylims: [number, number] = [-5.0, 5.0];
    scene.set_frame_lims(xlims, ylims);

    // Make a slider which can be used to modify the mobject
    // It should send a message to the owning scene
    // let gravity_slider = Slider(
    //   document.getElementById("slider-gravity-container") as HTMLElement,
    //   function (g: number) {
    //     scene.set_gravity(g);
    //   },
    //   "1.0",
    // );
    // gravity_slider.min = "0.0";
    // gravity_slider.max = "8.0";
    // gravity_slider.width = 200;

    // let angle_slider = Slider(
    //   document.getElementById("slider-energy-container") as HTMLElement,
    //   function (t: number) {
    //     scene.set_max_angle(t);
    //   },
    //   "0.2",
    // );
    // angle_slider.min = "0.0";
    // angle_slider.max = "1.5";
    // angle_slider.width = 200;

    // Start animations
    scene.draw();

    // scene.start_playing();
  });
})();
