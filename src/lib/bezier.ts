import * as np from "numpy-ts";
import { MObject, LineLikeMObject, Scene, Vec2D } from "./base";

// TODO Make a smooth Bezier spline class

// Given anchors points P_0, P_1, ..., P_n, computes handles
// B_1, B_2, ..., B_{2n} such that the sequence of Bezier splines
// (P_{i-1}, B_{2i-1}, B_{2i}, P_i) for i = 1, ..., n
// form a smooth curve.
export class SmoothOpenPathBezierHandleCalculator {
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

    let above_diag_list: number[] = [];
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
      0.5 *
        ((a.get([this.n, 0]) as number) + (h1.get([this.n - 1, 0]) as number)),
    );
    h2.set(
      [this.n - 1, 1],
      0.5 *
        ((a.get([this.n, 1]) as number) + (h1.get([this.n - 1, 1]) as number)),
    );

    return [h1, h2];
  }
}

// A cubic function starting at one point and ending at another, defined by two control points.
export class BezierCurve extends LineLikeMObject {
  start: [number, number];
  end: [number, number];
  h1: [number, number];
  h2: [number, number];
  width: number;
  constructor(
    start: [number, number],
    h1: [number, number],
    h2: [number, number],
    end: [number, number],
    width: number,
  ) {
    super();
    this.start = start;
    this.h1 = h1;
    this.h2 = h2;
    this.end = end;
    this.width = width;
  }
  // Moves the start and end points
  move_start(p: Vec2D) {
    this.start = p;
  }
  move_end(p: Vec2D) {
    this.end = p;
  }
  // Moves the handles
  move_h1(x: number, y: number) {
    this.h1 = [x, y];
  }
  move_h2(x: number, y: number) {
    this.h2 = [x, y];
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [start_x, start_y] = scene.v2c(this.start);
    let [h1_x, h1_y] = scene.v2c(this.h1);
    let [h2_x, h2_y] = scene.v2c(this.h2);
    let [end_x, end_y] = scene.v2c(this.end);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, end_x, end_y);
    ctx.stroke();
  }
}

// A sequence of Bezier curves passing through a sequence of points P_0, P_1, ..., P_n.
export class BezierSpline extends LineLikeMObject {
  num_steps: number;
  solver: SmoothOpenPathBezierHandleCalculator;
  anchors: Vec2D[];
  constructor(num_steps: number, kwargs: Record<string, any>) {
    super();
    this.num_steps = num_steps;
    this.solver = new SmoothOpenPathBezierHandleCalculator(num_steps);
    this.anchors = [];
    for (let i = 0; i < num_steps + 1; i++) {
      this.anchors.push([0, 0]);
    }

    let stroke_width = kwargs.stroke_width as number;
    if (stroke_width == undefined) {
      this.stroke_options.stroke_width = 0.08;
    } else {
      this.stroke_options.stroke_width = stroke_width;
    }

    let stroke_color = kwargs.stroke_color as string;
    if (stroke_color == undefined) {
      this.stroke_options.stroke_color = `rgb(0, 0, 0)`;
    } else {
      this.stroke_options.stroke_color = stroke_color;
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
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let a_x: number, a_y: number, a: Vec2D;
    a = this.get_anchor(0);
    [a_x, a_y] = scene.v2c(a);
    ctx.beginPath();
    ctx.moveTo(a_x, a_y);

    // Generate handles
    let [handles_1, handles_2] = this.solver.get_bezier_handles(
      np.array(this.anchors),
    );

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
      a = this.get_anchor(i + 1);
      [a_x, a_y] = scene.v2c(a);
      ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
      ctx.stroke();
    }
  }
}

// Graph of a parametric function, drawn as a Bezier curve
// This is effectively a wrapper around BezierSpline.
export class ParametricFunction extends LineLikeMObject {
  function: (t: number) => Vec2D;
  tmin: number;
  tmax: number;
  num_steps: number;
  solver: SmoothOpenPathBezierHandleCalculator;
  mode: "smooth" | "jagged" = "smooth";
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
      }
      ctx.stroke();
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
      }
      ctx.stroke();
    }
  }
}

// Given anchors points P_0, P_1, ..., P_n, computes handles
// B_1, B_2, ..., B_{2n} such that the sequence of Bezier splines
// (P_{i-1}, B_{2i-1}, B_{2i}, P_i) for i = 1, ..., n
// form a smooth curve.
export class SmoothClosedPathBezierHandleCalculator {
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
