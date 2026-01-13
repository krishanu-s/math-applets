// TODO Graph of a parametric function
import * as np from "numpy-ts";
import { MObject, Scene } from "./base.js";
import { Vec2D } from "./base.js";
import { SmoothOpenPathBezierHandleCalculator } from "./bezier.js";

// Graph of a parametric function, drawn as a Bezier curve
export class ParametricFunction extends MObject {
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
    for (let i = 1; i <= this.num_steps; i++) {
      points.push(
        np.array(
          this.function(
            this.tmin + (i / this.num_steps) * (this.tmax - this.tmin),
          ),
        ),
      );
    }
    let anchors = np.stack(points, 0);

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
