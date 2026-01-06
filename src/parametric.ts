// TODO Graph of a parametric function
import * as np from "numpy-ts";
import { MObject, Scene, Slider } from "./base.js";
import {
  Vec2D,
  vec_scale,
  vec_sum,
  vec_sub,
  vec_norm,
  vec_sum_list,
} from "./base.js";
import { SmoothOpenPathBezierHandleCalculator } from "./bezier.js";

// Graph of a parametric function, drawn as a Bezier curve
class ParametricFunction extends MObject {
  function: (t: number) => Vec2D;
  tmin: number;
  tmax: number;
  num_steps: number;
  solver: SmoothOpenPathBezierHandleCalculator;
  constructor(
    f: (t: number) => Vec2D,
    tmin: number,
    tmax: number,
    num_steps: number,
  ) {
    super();
    this.function = f;
    this.tmin = tmin;
    this.tmax = tmax;
    this.num_steps = num_steps;
    this.solver = new SmoothOpenPathBezierHandleCalculator(this.num_steps);
  }
  set_function(new_f: (t: number) => Vec2D) {
    this.function = new_f;
  }
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.lineWidth = 1.0;

    // Generate anchors
    let points: Array<np.NDArray> = [np.array(this.function(this.tmin))];
    for (let i = 1; i < this.num_steps + 1; i++) {
      points.push(
        np.array(
          this.function(
            this.tmin + (i / this.num_steps) * (this.tmax - this.tmin),
          ),
        ),
      );
    }
    let anchors = np.stack(points, 0);
    console.log(anchors.shape);

    // Generate handles
    let [handles_1, handles_2] = this.solver.get_bezier_handles(anchors);

    // Draw
    let h1_x, h1_y, h2_x, h2_y, a_x, a_y;
    [a_x, a_y] = scene.s2c(
      anchors.get([0, 0]) as number,
      anchors.get([0, 1]) as number,
    );
    ctx.beginPath();
    for (let i = 0; i < this.num_steps; i++) {
      [h1_x, h1_y] = scene.s2c(
        handles_1.get([i, 0]) as number,
        handles_1.get([i, 1]) as number,
      );
      [h2_x, h2_y] = scene.s2c(
        handles_2.get([i, 0]) as number,
        handles_2.get([i, 1]) as number,
      );
      [a_x, a_y] = scene.s2c(
        anchors.get([i + 1, 0]) as number,
        anchors.get([i + 1, 1]) as number,
      );
      ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
      ctx.stroke();
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
    let width = 300;
    let height = 300;

    let canvas = prepare_canvas(width, height, "scene-container");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Make the scene
    let parametric = new ParametricFunction(
      (t) => {
        let r = 1 / (1 + 0.5 * Math.cos(t));
        return [Math.cos(t) * r, Math.sin(t) * r];
      },
      0,
      2 * Math.PI,
      30,
    );
    let scene = new Scene(canvas);
    scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    scene.add("parametric_fn", parametric);
    console.log("foo");
    scene.draw();

    // Make a slider which can be used to modify the mobject
    // It should send a message to the owning scene
    let ecc_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (e: number) {
        parametric.set_function((t) => {
          let r = 1 / (1 + e * Math.cos(t));
          return [Math.cos(t) * r, Math.sin(t) * r];
        });
        scene.draw();
      },
      "0.5",
      0,
      1,
      0.01,
    );
    ecc_slider.width = 200;
  });
})();
