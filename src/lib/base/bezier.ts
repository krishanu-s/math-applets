import { LineLikeMObject, MObjectGroup, Scene, Vec2D } from ".";
import { LineLikeMObjectGroup } from "./base";
import { vec2_scale, vec2_sum } from "./vec2";

// A 4-tuples of points representing a cubic Bezier curve
export type CubicBezierTuple = [Vec2D, Vec2D, Vec2D, Vec2D];

// Converts a linear segment into a cubic Bezier segment
export function make_linear_segment(
  start: Vec2D,
  end: Vec2D,
): CubicBezierTuple {
  return [
    start,
    vec2_scale(vec2_sum(start, vec2_scale(end, 2)), 1 / 3),
    vec2_scale(vec2_sum(vec2_scale(start, 2), end), 1 / 3),
    end,
  ];
}

// Converts a quadratic Bezier segment into a cubic Bezier segment
export function make_quadratic_segment(
  start: Vec2D,
  cp: Vec2D,
  end: Vec2D,
): CubicBezierTuple {
  return [
    start,
    vec2_scale(vec2_sum(start, vec2_scale(cp, 2)), 1 / 3),
    vec2_scale(vec2_sum(vec2_scale(cp, 2), end), 1 / 3),
    end,
  ];
}

// TODO Make the curve function store calculated handles, and avoid re-calculating unless necessary.

// A sequence of Bezier curves passing through a sequence of points P_0, P_1, ..., P_n.
export class BezierSpline extends LineLikeMObject {
  num_steps: number;
  solver: any;
  anchors: Vec2D[];
  constructor(num_steps: number, solver: any) {
    super();
    this.num_steps = num_steps;
    this.solver = solver;
    this.anchors = [];
    for (let i = 0; i < num_steps + 1; i++) {
      this.anchors.push([0, 0]);
    }
  }
  set_anchors(new_anchors: Vec2D[]) {
    this.anchors = new_anchors;
  }
  set_anchor(index: number, new_anchor: Vec2D) {
    this.anchors[index] = new_anchor;
  }
  get_anchor(index: number): Vec2D {
    return this.anchors[index] as Vec2D;
  }
  // Draw the Bezier curve using the solver
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    // If solver is null, draw a piecewise linear
    if (!this.solver) {
      this._drawFallback(ctx, scene);
      return;
    }

    let a_x: number, a_y: number, a: Vec2D;
    a = this.get_anchor(0);
    [a_x, a_y] = scene.v2c(a);
    ctx.beginPath();
    ctx.moveTo(a_x, a_y);

    // Generate handles
    let anchors_flat = this.anchors.reduce(
      (acc: number[], val: Vec2D) => acc.concat(val),
      [],
    );

    try {
      // Generate handles
      // TODO store these
      let handles_flat: number[] = this.solver.get_bezier_handles(anchors_flat);
      let handles: Vec2D[] = [];
      for (let i = 0; i < handles_flat.length; i += 2) {
        handles.push([handles_flat[i], handles_flat[i + 1]] as Vec2D);
      }

      // Draw
      let h1_x: number, h1_y: number, h2_x: number, h2_y: number;
      for (let i = 0; i < this.num_steps; i++) {
        [h1_x, h1_y] = scene.v2c(handles[i] as Vec2D);
        [h2_x, h2_y] = scene.v2c(handles[i + this.num_steps] as Vec2D);
        a = this.get_anchor(i + 1);
        [a_x, a_y] = scene.v2c(a);
        ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
      }
      ctx.stroke();
    } catch (error) {
      console.warn("Error with solver, drawing with fallback method.");
      this._drawFallback(ctx, scene);
    }
  }
  // Draw a simple piecewise linear as fallback
  _drawFallback(ctx: CanvasRenderingContext2D, scene: Scene) {
    if (this.anchors.length === 0) return;

    let [x, y] = scene.v2c(this.get_anchor(0));
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 1; i < this.anchors.length; i++) {
      [x, y] = scene.v2c(this.get_anchor(i));
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}

// Graph of a parametric function, drawn either piecewise-linear or as a Bezier spline.
export class ParametricFunction extends BezierSpline {
  function: (t: number) => Vec2D;
  tmin: number;
  tmax: number;
  mode: "smooth" | "jagged" = "smooth";
  constructor(
    f: (t: number) => Vec2D,
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
    let anchors: Vec2D[] = [this.function(this.tmin)];
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
  set_function(new_f: (t: number) => Vec2D) {
    this.function = new_f;
    this._make_anchors();
  }
  set_lims(tmin: number, tmax: number) {
    this.tmin = tmin;
    this.tmax = tmax;
    this._make_anchors();
  }
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    if (this.mode == "jagged") {
      this._drawFallback(ctx, scene);
    } else {
      super._draw(ctx, scene);
    }
  }
}

// A disconnected sequence of Bezier splines, each having the same number of points

// A parametric function with multiple branches. Useful for drawing functions with discontinuities,
// where the function may be changed over time and the number of discontinuities may change.
export class MultipleBranchParametricFunction extends LineLikeMObjectGroup {
  num_branches: number = 0;
  mode: "smooth" | "jagged" = "smooth";
  num_steps: number;
  solver: any;
  constructor(num_steps: number, solver: any) {
    super();
    this.num_steps = num_steps;
    this.solver = solver;
  }
  add_branch(f: (t: number) => Vec2D, tlims: Vec2D) {
    this.add_mobj(
      `f_${this.num_branches}`,
      new ParametricFunction(
        f,
        tlims[0],
        tlims[1],
        this.num_steps,
        this.solver,
      ),
    );
    this.num_branches += 1;
  }
  del_branch(i: number) {
    this.remove_mobj(`f_${i}`);
    for (let j = i; j < this.num_branches - 1; j++) {
      let mobj = this.get_mobj(`f_${j + 1}`);
      this.add_mobj(`f_${j}`, mobj);
    }
    this.remove_mobj(`f_${this.num_branches - 1}`);
    this.num_branches -= 1;
  }
  set_mode(mode: "smooth" | "jagged", i: number) {
    (this.get_mobj(`f_${i}`) as ParametricFunction).set_mode(mode);
  }
  set_function(new_f: (t: number) => Vec2D, i: number) {
    (this.get_mobj(`f_${i}`) as ParametricFunction).set_function(new_f);
  }
  set_lims(tmin: number, tmax: number, i: number) {
    (this.get_mobj(`f_${i}`) as ParametricFunction).set_lims(tmin, tmax);
  }
  // TODO
  // - Search for discontinuities in the domain
  // - Break the function piecewise
  set_global_function(f: (t: number) => Vec2D, tlims: Vec2D) {}
}
