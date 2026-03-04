// Analogue of base/bezier.ts, but in three dimensions.
import { Vec2D } from "../base";
import { Vec3D } from "./matvec";
import { ThreeDMObject } from "./mobjects";
import { ThreeDScene } from "./scene";

// A sequence of Bezier curves passing through a sequence of points P_0, P_1, ..., P_n.
export class BezierSpline3D extends ThreeDMObject {
  num_steps: number;
  solver: any;
  anchors: Vec3D[];
  constructor(num_steps: number, solver: any) {
    super();
    this.num_steps = num_steps;
    this.solver = solver;
    this.anchors = [];
    for (let i = 0; i < num_steps + 1; i++) {
      this.anchors.push([0, 0, 0]);
    }
  }
  set_anchors(new_anchors: Vec3D[]) {
    this.anchors = new_anchors;
    return this;
  }
  set_anchor(index: number, new_anchor: Vec3D) {
    this.anchors[index] = new_anchor;
    return this;
  }
  get_anchor(index: number): Vec3D {
    return this.anchors[index] as Vec3D;
  }
  // Draw the Bezier curve using the solver
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    // If solver is null, draw a piecewise linear
    if (!this.solver) {
      this._drawFallback(ctx, scene);
      return;
    }

    let a_x: number, a_y: number, a: Vec2D | null;
    a = scene.camera_view(this.get_anchor(0));
    if (a == null) {
      return;
    }
    [a_x, a_y] = scene.v2c(a as Vec2D);
    ctx.beginPath();
    ctx.moveTo(a_x, a_y);

    // Generate handles
    let anchors_flat = this.anchors.reduce(
      (acc: number[], val: Vec3D) => acc.concat(val),
      [],
    );

    try {
      // Generate handles
      // TODO store these
      let handles_flat: number[] = this.solver.get_bezier_handles(anchors_flat);
      let handles: Vec3D[] = [];
      for (let i = 0; i < handles_flat.length; i += 3) {
        handles.push([
          handles_flat[i],
          handles_flat[i + 1],
          handles_flat[i + 2],
        ] as Vec3D);
      }

      // Draw
      let h1_x: number, h1_y: number, h2_x: number, h2_y: number;
      let h1: Vec2D | null, h2: Vec2D | null;
      for (let i = 0; i < this.num_steps; i++) {
        h1 = scene.camera_view(handles[i] as Vec3D);
        if (h1 == null) {
          return;
        }
        [h1_x, h1_y] = scene.v2c(h1 as Vec2D);
        h2 = scene.camera_view(handles[i + this.num_steps] as Vec3D);
        if (h2 == null) {
          return;
        }
        [h2_x, h2_y] = scene.v2c(h2 as Vec2D);
        a = scene.camera_view(this.get_anchor(i + 1));
        if (a == null) {
          return;
        }
        [a_x, a_y] = scene.v2c(a as Vec2D);
        ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
      }
      ctx.stroke();
    } catch (error) {
      console.warn("Error with solver, drawing with fallback method.");
      this._drawFallback(ctx, scene);
    }
  }
  // Draw a simple piecewise linear as fallback
  _drawFallback(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    if (this.anchors.length === 0) return;

    let [x, y] = scene.v2c(scene.camera_view(this.get_anchor(0)) as Vec2D);
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 1; i < this.anchors.length; i++) {
      [x, y] = scene.v2c(scene.camera_view(this.get_anchor(i)) as Vec2D);
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}

// Graph of a parametric function, drawn either piecewise-linear or as a Bezier spline.
export class ParametricFunction3D extends BezierSpline3D {
  function: (t: number) => Vec3D;
  tmin: number;
  tmax: number;
  mode: "smooth" | "jagged" = "smooth";
  constructor(
    f: (t: number) => Vec3D,
    tmin: number,
    tmax: number,
    num_steps: number,
    solver: any,
  ) {
    super(num_steps, solver);
    this.function = f;
    this.tmin = tmin;
    this.tmax = tmax;
    this._make_anchors();
  }
  _make_anchors() {
    let anchors: Vec3D[] = [this.function(this.tmin)];
    for (let i = 1; i <= this.num_steps; i++) {
      anchors.push(
        this.function(
          this.tmin + (i / this.num_steps) * (this.tmax - this.tmin),
        ),
      );
    }
    this.set_anchors(anchors);
  }
  // Jagged doesn't use Bezier curves. It is faster to compute and render.
  set_mode(mode: "smooth" | "jagged") {
    this.mode = mode;
  }
  set_function(new_f: (t: number) => Vec3D) {
    this.function = new_f;
    this._make_anchors();
  }
  set_lims(tmin: number, tmax: number) {
    this.tmin = tmin;
    this.tmax = tmax;
    this._make_anchors();
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    if (this.mode == "jagged") {
      this._drawFallback(ctx, scene);
    } else {
      super._draw(ctx, scene);
    }
  }
}
