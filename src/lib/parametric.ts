// TODO Graph of a parametric function
import * as np from "numpy-ts";
import { LineLikeMObject, Scene } from "./base.js";
import { Vec2D } from "./base_geom.js";
import { SmoothOpenPathBezierHandleCalculator } from "./bezier.js";

// Graph of a parametric function, drawn as a Bezier curve
// This is effectively a wrapper around BezierSpline.
export class ParametricFunction extends LineLikeMObject {
  function: (t: number) => Vec2D;
  tmin: number;
  tmax: number;
  num_steps: number;
  solver: SmoothOpenPathBezierHandleCalculator;
  mode: "smooth" | "jagged";
  constructor(
    f: (t: number) => Vec2D,
    tmin: number,
    tmax: number,
    num_steps: number,
    kwargs: Record<string, any>,
  ) {
    super();
    this.function = f;
    this.tmin = tmin;
    this.tmax = tmax;
    this.num_steps = num_steps;
    this.solver = new SmoothOpenPathBezierHandleCalculator(this.num_steps);

    let mode = kwargs.mode;
    if (mode == undefined) {
      this.mode = "smooth";
    } else {
      this.mode = mode;
    }
    let stroke_width = kwargs.stroke_width;
    if (stroke_width == undefined) {
      this.stroke_width = 0.08;
    } else {
      this.stroke_width = stroke_width;
    }

    let stroke_color = kwargs.stroke_color;
    if (stroke_color == undefined) {
      this.stroke_color = `rgb(0, 0, 0)`;
    } else {
      this.stroke_color = stroke_color;
    }
  }

  // Jagged doesn't use Bezier curves. It is faster to compute and render.
  set_mode(mode: "smooth" | "jagged") {
    this.mode = mode;
  }
  set_function(new_f: (t: number) => Vec2D) {
    this.function = new_f;
  }
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
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

    let a_x: number, a_y: number;
    [a_x, a_y] = scene.v2c([anchors.get([0, 0]), anchors.get([0, 1])] as Vec2D);
    ctx.beginPath();
    ctx.moveTo(a_x, a_y);

    if (this.mode == "jagged") {
      for (let i = 0; i < this.num_steps; i++) {
        [a_x, a_y] = scene.v2c([
          anchors.get([i + 1, 0]),
          anchors.get([i + 1, 1]),
        ] as Vec2D);
        ctx.lineTo(a_x, a_y);
        ctx.stroke();
      }
    } else {
      // Generate handles
      let [handles_1, handles_2] = this.solver.get_bezier_handles(anchors);

      // Draw
      let h1_x: number, h1_y: number, h2_x: number, h2_y: number;
      for (let i = 0; i < this.num_steps; i++) {
        [h1_x, h1_y] = scene.v2c([
          handles_1.get([i, 0]),
          handles_1.get([i, 1]),
        ] as Vec2D);
        [h2_x, h2_y] = scene.v2c([
          handles_2.get([i, 0]),
          handles_2.get([i, 1]),
        ] as Vec2D);
        [a_x, a_y] = scene.v2c([
          anchors.get([i + 1, 0]),
          anchors.get([i + 1, 1]),
        ] as Vec2D);
        ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
        ctx.stroke();
      }
    }
  }
}
