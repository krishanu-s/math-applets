import * as np from "numpy-ts";
import { Scene } from "./lib/base.js";
import { Dot, Vec2D } from "./lib/base_geom.js";
import {
  SmoothClosedPathBezierHandleCalculator,
  BezierCurve,
} from "./lib/bezier.js";

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
      this.add(`p${i}`, new Dot(p, 0.02));
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
      pt.move_to(p);
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
      curve.move_start([a.get([i, 0]) as number, a.get([i, 1]) as number]);
      curve.move_h1(
        handles_1.get([i, 0]) as number,
        handles_1.get([i, 1]) as number,
      );
      curve.move_h2(
        handles_2.get([i, 0]) as number,
        handles_2.get([i, 1]) as number,
      );
      curve.move_end([
        a.get([i + 1, 0]) as number,
        a.get([i + 1, 1]) as number,
      ]);
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

    // Define the curve scene
    let scene = new ClosedCurveScene(canvas, 20);

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

    // Start animations
    scene.draw();
  });
})();
