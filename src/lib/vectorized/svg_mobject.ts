// Vectorized mobjects -- e.g., for drawing from SVG

import { ParsedPathInfo } from "./svg_loader";
import { Vec3D } from "../three_d";
import { Scene, FillLikeMObject, clamp, MObjectGroup } from "../base/base";
import {
  Vec2D,
  Mat2by2,
  vec2_scale,
  vec2_sum,
  vec2_sub,
  matmul_vec2,
  matmul_mat2,
} from "../base/vec2";

// Ratio of time used for stroke animation before fill animation begins
const FILL_DELAY = 0.9;

// Base class for SVG mobjects, e.g. containing more than just paths.
export class SVGMObject extends FillLikeMObject {}

// A 4-tuples of points representing a cubic Bezier curve
type CubicBezierTuple = [Vec2D, Vec2D, Vec2D, Vec2D];

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

// A sequence of CubicBezierTuple segments representing a single SVG path, beginning
// with a move-to command (M) and ending with a close-path command (Z).
class SVGPath {
  // Bezier segments that make up the path.
  bezier_segments: CubicBezierTuple[] = [];
  // Number between 0 and 1 indicating how far along the path to draw.
  progress: number = 1.0;
  // x limits and y limits of the path, used for setting a bounding box and sizing.
  xmin: number = Infinity;
  xmax: number = -Infinity;
  ymin: number = Infinity;
  ymax: number = -Infinity;
  set_progress(p: number) {
    this.progress = p;
  }
  clone(): SVGPath {
    let clone = new SVGPath();
    clone.bezier_segments = this.bezier_segments.slice();
    clone.progress = this.progress;
    clone.xmin = this.xmin;
    clone.xmax = this.xmax;
    clone.ymin = this.ymin;
    clone.ymax = this.ymax;
    return clone;
  }
  // Adds a new single cubic Bezier segment to the path. Typically the segment
  // will be given in ctx coordinates, and will be transformed to scene coordinates
  // here by x -> Ax + b
  add_segment(
    segment: CubicBezierTuple,
    transformMatrix: Mat2by2,
    translate: Vec2D = [0, 0],
  ) {
    const scaled_segment = segment.map((p) =>
      vec2_sum(matmul_vec2(transformMatrix, p), translate),
    ) as CubicBezierTuple;
    this.bezier_segments.push(scaled_segment);
    this.xmin = Math.min(
      this.xmin,
      scaled_segment[0][0],
      scaled_segment[1][0],
      scaled_segment[2][0],
      scaled_segment[3][0],
    );
    this.xmax = Math.max(
      this.xmax,
      scaled_segment[0][0],
      scaled_segment[1][0],
      scaled_segment[2][0],
      scaled_segment[3][0],
    );
    this.ymin = Math.min(
      this.ymin,
      scaled_segment[0][1],
      scaled_segment[1][1],
      scaled_segment[2][1],
      scaled_segment[3][1],
    );
    this.ymax = Math.max(
      this.ymax,
      scaled_segment[0][1],
      scaled_segment[1][1],
      scaled_segment[2][1],
      scaled_segment[3][1],
    );
  }
  // Translates the path by a given vector.
  move_by(p: Vec2D | Vec3D) {
    this.bezier_segments = this.bezier_segments.map((segment) => {
      return segment.map((v) => vec2_sum(v, p as Vec2D)) as CubicBezierTuple;
    });
    this.xmin += (p as Vec2D)[0];
    this.xmax += (p as Vec2D)[0];
    this.ymin += (p as Vec2D)[1];
    this.ymax += (p as Vec2D)[1];
    return this;
  }
  // Scales the path around a given point by a given scale factor.
  homothety_around(p: Vec2D | Vec3D, scale: number) {
    this.bezier_segments = this.bezier_segments.map((segment) => {
      return segment.map((v) => {
        const [x, y] = vec2_sub(v, p as Vec2D);
        return vec2_sum([x * scale, y * scale], p as Vec2D);
      }) as CubicBezierTuple;
    });
    this.xmin = (this.xmin - p[0]) * scale + p[0];
    this.xmax = (this.xmax - p[0]) * scale + p[0];
    this.ymin = (this.ymin - p[1]) * scale + p[1];
    this.ymax = (this.ymax - p[1]) * scale + p[1];
    return this;
  }
  // Partially draws the path with the given stroke and fill settings, where t is a parameter
  // between 0 and 1 controlling the progress.
  // - When 0 < t < FILL_DELAY, a partial outline is drawn.
  // - When FILL_DELAY < t < 1, the full outline is drawn with partial opacity.
  _drawPartial(
    ctx: CanvasRenderingContext2D,
    scene: Scene,
    t: number,
    stroke: boolean,
    fill: boolean,
  ) {
    let num_segments = Math.min(
      Math.floor(this.bezier_segments.length * 2 * t),
      this.bezier_segments.length,
    );
    ctx.beginPath();
    ctx.strokeStyle = "black";
    let [curr_x, curr_y] = scene.v2c(
      (this.bezier_segments[0] as CubicBezierTuple)[0],
    );
    let cx: number, cy: number;
    let [h1_x, h1_y] = [0, 0];
    let [h2_x, h2_y] = [0, 0];
    let [x, y] = [0, 0];
    let segment: CubicBezierTuple;

    ctx.moveTo(curr_x, curr_y);
    for (let i = 0; i < num_segments; i++) {
      segment = this.bezier_segments[i] as CubicBezierTuple;
      // If the starting point of this curve is different from the previous one, move the pen
      [cx, cy] = scene.v2c(segment[0]);
      if (cx != curr_x || cy != curr_y) {
        ctx.moveTo(cx, cy);
      }
      [h1_x, h1_y] = scene.v2c(segment[1]);
      [h2_x, h2_y] = scene.v2c(segment[2]);
      [x, y] = scene.v2c(segment[3]);
      ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, x, y);
      [curr_x, curr_y] = [x, y];
    }
    if (t <= FILL_DELAY) {
      ctx.stroke();
    } else {
      ctx.closePath();
      if (stroke) {
        ctx.stroke();
      }
      const fill_progress = (t - FILL_DELAY) / (1 - FILL_DELAY);
      if (fill) {
        ctx.globalAlpha = clamp(ctx.globalAlpha * fill_progress, 0, 1);
        ctx.fill();
        ctx.globalAlpha = clamp(ctx.globalAlpha / fill_progress, 0, 1);
      }
    }
  }
  // Draws the path with the given stroke and fill settings.
  _draw(
    ctx: CanvasRenderingContext2D,
    scene: Scene,
    stroke: boolean,
    fill: boolean,
  ) {
    this._drawPartial(ctx, scene, this.progress, stroke, fill);
  }
}

// A MObject consisting of a collection of SVG Path objects.
export class SVGPathMObject extends SVGMObject {
  // An SVGPathMObject is composed of an ordered sequence of SVGPaths, each representing a single SVG path.
  paths: Array<SVGPath> = [];

  // x limits and y limits of the MObject, used for setting a bounding box and sizing.
  xmin: number = Infinity;
  xmax: number = -Infinity;
  ymin: number = Infinity;
  ymax: number = -Infinity;

  _recalculate_limits() {
    this.xmin = Math.min(...this.paths.map((path) => path.xmin));
    this.xmax = Math.max(...this.paths.map((path) => path.xmax));
    this.ymin = Math.min(...this.paths.map((path) => path.ymin));
    this.ymax = Math.max(...this.paths.map((path) => path.ymax));
  }
  // Sets the segments based on a parsed path. The parsed path is in ctx coordinates, while
  // this object's segments are in scene coordinates, so a scaling factor must be supplied.
  from_path(pathElement: ParsedPathInfo, scene_scale: number) {
    // Set the stroke and fill options
    this.set_stroke_color(pathElement.stroke);

    // Remove the 'px' suffix and convert to number
    this.set_stroke_width(pathElement.strokeWidth / scene_scale);
    this.set_fill_color(pathElement.fill);

    // Get necessary transformations to segments
    let transformMatrix: Mat2by2 = [
      [1 / scene_scale, 0],
      [0, -1 / scene_scale],
    ];
    let translate: Vec2D = pathElement.translation
      ? matmul_vec2(transformMatrix, [
          pathElement.translation.x,
          pathElement.translation.y,
        ])
      : [0, 0];

    if (pathElement.transformMatrix) {
      transformMatrix = matmul_mat2(
        [
          [pathElement.transformMatrix?.a, pathElement.transformMatrix?.b],
          [pathElement.transformMatrix?.c, pathElement.transformMatrix?.d],
        ] as Mat2by2,
        transformMatrix,
      );
    }

    // Make the paths
    this.paths = [];

    let current_path = new SVGPath();
    let [curr_x, curr_y] = [0, 0];
    let [x, y] = [0, 0];
    let h1: Vec2D = [0, 0];
    let h2: Vec2D = [0, 0];
    let [hx, hy] = [0, 0];

    // Converts each possible path element into a cubic Bezier curve
    // TODO Handle other path commands, such as relative commands.
    for (let i = 0; i < pathElement.commands.length; i++) {
      let cmd = pathElement.commands[i] as { type: string; values: number[] };
      // Move to a new point
      if (cmd.type == "M") {
        [curr_x, curr_y] = cmd.values as Vec2D;
      }
      // Line to a new point
      else if (cmd.type == "L") {
        [x, y] = cmd.values as Vec2D;
        h1 = [(curr_x * 2) / 3 + x / 3, (curr_y * 2) / 3 + y / 3];
        h2 = [curr_x / 3 + (x * 2) / 3, curr_y / 3 + (y * 2) / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Vertical line to a new point
      else if (cmd.type == "V") {
        y = cmd.values[0] as number;
        h1 = [curr_x, curr_y / 3 + (x * 2) / 3];
        h2 = [curr_x, (curr_y * 2) / 3 + x / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [curr_x, y]],
          transformMatrix,
          translate,
        );
        curr_y = y;
      }
      // Horizontal line to a new point
      else if (cmd.type == "H") {
        x = cmd.values[0] as number;
        h1 = [(curr_x * 2) / 3 + x / 3, curr_y];
        h2 = [curr_x / 3 + (x * 2) / 3, curr_y];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, curr_y]],
          transformMatrix,
          translate,
        );
        curr_x = x;
      }
      // Cubic Bezier curve
      else if (cmd.type == "C") {
        h1 = [cmd.values[0], cmd.values[1]] as Vec2D;
        h2 = [cmd.values[2], cmd.values[3]] as Vec2D;
        [x, y] = [cmd.values[4], cmd.values[5]];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Smooth cubic Bezier curve
      else if (cmd.type == "S") {
        h1 = vec2_sub(vec2_scale([curr_x, curr_y], 2), h2);
        h2 = [cmd.values[0], cmd.values[1]] as Vec2D;
        [x, y] = [cmd.values[2], cmd.values[3]];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Quadratic Bezier curve
      else if (cmd.type == "Q") {
        [hx, hy] = [cmd.values[0], cmd.values[1]] as Vec2D;
        [x, y] = [cmd.values[2], cmd.values[3]] as Vec2D;
        h1 = [curr_x / 3 + (hx * 2) / 3, curr_y / 3 + (hy * 2) / 3];
        h2 = [x / 3 + (hx * 2) / 3, y / 3 + (hy * 2) / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Smooth quadratic Bezier curve
      else if (cmd.type == "T") {
        [hx, hy] = vec2_sub(vec2_scale([curr_x, curr_y], 2), h2);
        [x, y] = [cmd.values[0], cmd.values[1]] as Vec2D;
        h1 = [curr_x / 3 + (hx * 2) / 3, curr_y / 3 + (hy * 2) / 3];
        h2 = [x / 3 + (hx * 2) / 3, y / 3 + (hy * 2) / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Close path
      else if (cmd.type == "Z") {
        this.paths.push(current_path.clone());
        current_path = new SVGPath();
      } else {
        throw new Error(`Unknown command type: ${cmd.type}`);
      }
      // // Arc
      // else if (cmd.type == "A") {
      //   // TODO
      //   console.log("Type A", cmd.values);
      // }
    }
    this._recalculate_limits();
    return this;
  }
  // Translates the path by a given vector.
  move_by(p: Vec2D | Vec3D) {
    for (let path of this.paths) {
      path.move_by(p);
    }
    this._recalculate_limits();
    return this;
  }
  // Scales the path around a given point by a given scale factor.
  homothety_around(p: Vec2D | Vec3D, scale: number) {
    for (let path of this.paths) {
      path.homothety_around(p, scale);
    }
    this._recalculate_limits();
    return this;
  }
  // Sets the progress of drawing the entire MObject
  set_progress(t: number) {
    let total_num_paths = this.paths.length;
    for (let i = 0; i < total_num_paths; i++) {
      (this.paths[i] as SVGPath).set_progress(
        clamp(t * total_num_paths - i, 0, 1),
      );
    }
    return this;
  }
  // Draw all paths.
  _draw(ctx: CanvasRenderingContext2D, scene: Scene, args?: any) {
    for (let path of this.paths) {
      path._draw(
        ctx,
        scene,
        this.stroke_options.stroke_color != "none",
        this.fill_options.fill,
      );
    }
  }
}

export class SVGPathMObjectGroup extends MObjectGroup {
  center: Vec2D = [0, 0];
  width: number = 0;
  height: number = 0;
  _recalculate_size() {
    let xmin: number = Infinity;
    let xmax: number = -Infinity;
    let ymin: number = Infinity;
    let ymax: number = -Infinity;
    Object.values(this.children).forEach((child) => {
      xmin = Math.min(xmin, (child as SVGPathMObject).xmin);
      xmax = Math.max(xmax, (child as SVGPathMObject).xmax);
      ymin = Math.min(ymin, (child as SVGPathMObject).ymin);
      ymax = Math.max(ymax, (child as SVGPathMObject).ymax);
    });
    this.center = [(xmin + xmax) / 2, (ymin + ymax) / 2];
    this.width = xmax - xmin;
    this.height = ymax - ymin;
  }
  // Used for animation - sets the progress of drawing each character.
  set_progress(t: number) {
    Object.values(this.children).forEach((child) =>
      (child as SVGPathMObject).set_progress(t),
    );
  }
  get_center(): Vec2D {
    return this.center;
  }
  // Sets the total width of the MObjectGroup
  set_width(width: number) {
    let scale = width / this.width;
    Object.values(this.children).forEach((child) => {
      child.homothety_around(this.center, scale);
    });
    this.width *= scale;
    this.height *= scale;
    return this;
  }
  // Sets the total height of the MObjectGroup
  set_height(height: number) {
    let scale = height / this.height;
    Object.values(this.children).forEach((child) => {
      child.homothety_around(this.center, scale);
    });
    this.width *= scale;
    this.height *= scale;
    return this;
  }
  // Sets the center
  set_center(center: Vec2D) {
    Object.values(this.children).forEach((child) =>
      child.move_by(vec2_sub(center, this.center)),
    );
    this.center = center;
    return this;
  }
}
