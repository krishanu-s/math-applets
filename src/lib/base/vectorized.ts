// Vectorized mobjects -- e.g., for drawing from SVG

import { ParsedPathInfo } from "../svg_loader";
import { Vec3D } from "../three_d";
import { Scene, FillLikeMObject } from "./base";
import {
  Vec2D,
  Mat2by2,
  vec2_scale,
  vec2_sum,
  vec2_sub,
  matmul_vec2,
} from "./vec2";

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

// A MObject corresponding to a single continuously drawn <path> object.
// TODO For now, it's assumed to be a single continuous path, i.e. only one M command and one Z command.
// Generalize this.
export class SVGPathMObject extends FillLikeMObject {
  // The Path is stored (and then later drawn) as a sequence of cubic Bezier curves, in scene coordinates.
  segments: Array<CubicBezierTuple> = [];

  // Sets the segments based on a parsed path. The parsed path is in ctx coordinates, while
  // this object's segments are in scene coordinates, so a scaling factor must be supplied
  from_path(pathElement: ParsedPathInfo, scene_scale: number) {
    // Set the stroke and fill options
    this.set_stroke_color(pathElement.stroke);

    // Remove the 'px' suffix and convert to number
    this.set_stroke_width(pathElement.strokeWidth / scene_scale);
    this.set_fill_color(pathElement.fill);

    // Get necessary transformations to segments
    let translate: Vec2D = pathElement.translation
      ? [pathElement.translation.x, pathElement.translation.y]
      : [0, 0];
    let transformMatrix: Mat2by2 = [
      [1 / scene_scale, 0],
      [0, -1 / scene_scale],
    ];

    // Make the segments
    this.segments = [];

    let [curr_x, curr_y] = [0, 0];
    let path_start = [0, 0];
    let [x, y] = [0, 0];
    let h1: Vec2D = [0, 0];
    let h2: Vec2D = [0, 0];
    let [hx, hy] = [0, 0];

    // Converts each possible path element into a cubic Bezier curve
    for (let cmd of pathElement.commands) {
      console.log(cmd);
      // Move to a new point
      if (cmd.type == "M") {
        [curr_x, curr_y] = cmd.values;
        path_start = cmd.values;
      }
      // Line to a new point
      else if (cmd.type == "L") {
        [x, y] = cmd.values;
        h1 = [(curr_x * 2) / 3 + x / 3, (curr_y * 2) / 3 + y / 3];
        h2 = [curr_x / 3 + (x * 2) / 3, curr_y / 3 + (y * 2) / 3];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Vertical line to a new point
      else if (cmd.type == "V") {
        y = cmd.values[1];
        h1 = [curr_x, curr_y / 3 + (x * 2) / 3];
        h2 = [curr_x, (curr_y * 2) / 3 + x / 3];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [curr_x, y]],
          transformMatrix,
          translate,
        );
        curr_y = y;
      }
      // Horizontal line to a new point
      else if (cmd.type == "H") {
        x = cmd.values[0];
        h1 = [(curr_x * 2) / 3 + x / 3, curr_y];
        h2 = [curr_x / 3 + (x * 2) / 3, curr_y];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [x, curr_y]],
          transformMatrix,
          translate,
        );
        curr_x = x;
      }
      // Cubic Bezier curve
      else if (cmd.type == "C") {
        h1 = [cmd.values[0], cmd.values[1]];
        h2 = [cmd.values[2], cmd.values[3]];
        [x, y] = [cmd.values[4], cmd.values[5]];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Smooth cubic Bezier curve
      else if (cmd.type == "S") {
        h1 = vec2_sub(vec2_scale([curr_x, curr_y], 2), h2);
        h2 = [cmd.values[0], cmd.values[1]];
        [x, y] = [cmd.values[2], cmd.values[3]];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Quadratic Bezier curve
      else if (cmd.type == "Q") {
        [hx, hy] = [cmd.values[0], cmd.values[1]];
        [x, y] = [cmd.values[2], cmd.values[3]];
        h1 = [curr_x / 3 + (hx * 2) / 3, curr_y / 3 + (hy * 2) / 3];
        h2 = [x / 3 + (hx * 2) / 3, y / 3 + (hy * 2) / 3];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Smooth quadratic Bezier curve
      else if (cmd.type == "T") {
        [hx, hy] = vec2_sub(vec2_scale([curr_x, curr_y], 2), h2);
        [x, y] = [cmd.values[0], cmd.values[1]];
        h1 = [curr_x / 3 + (hx * 2) / 3, curr_y / 3 + (hy * 2) / 3];
        h2 = [x / 3 + (hx * 2) / 3, y / 3 + (hy * 2) / 3];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
        [curr_x, curr_y] = [x, y];
      }
      // Close path
      // TODO Insert fill command, for when we have multiple paths.
      else if (cmd.type == "Z") {
        [x, y] = path_start;
        h1 = [(curr_x * 2) / 3 + x / 3, curr_y / 3 + (x * 2) / 3];
        h2 = [curr_x / 3 + (x * 2) / 3, (curr_y * 2) / 3 + x / 3];
        this.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate,
        );
      } else {
        throw new Error(`Unknown command type: ${cmd.type}`);
      }
      // // Arc
      // else if (cmd.type == "A") {
      //   // TODO
      //   console.log("Type A", cmd.values);
      // }
    }
  }
  // Adds a new single cubic Bezier segment to the path. Typically the segment
  // will be given in ctx coordinates, and will be transformed to scene coordinates
  // here by x -> Ax + b
  add_segment(
    segment: CubicBezierTuple,
    transformMatrix: Mat2by2,
    translate: Vec2D = [0, 0],
  ) {
    this.segments.push(
      segment.map((p) =>
        vec2_sum(matmul_vec2(transformMatrix, p), translate),
      ) as CubicBezierTuple,
    );
  }
  // Returns the partial path up to a given alpha in [0, 1]. Used for animations.
  // TODO

  // Translates the path by a given vector.
  move_by(p: Vec2D | Vec3D) {
    this.segments = this.segments.map((segment) => {
      return segment.map((v) => vec2_sum(v, p as Vec2D));
    });
    return this;
  }
  // Scales the path around a given point by a given scale factor.
  homothety_around(p: Vec2D | Vec3D, scale: number) {
    this.segments = this.segments.map((segment) => {
      return segment.map((v) => {
        const [x, y] = vec2_sub(v, p as Vec2D);
        return vec2_sum([x * scale, y * scale], p as Vec2D);
      });
    });
    return this;
  }
  _draw(ctx: CanvasRenderingContext2D, scene: Scene, args?: any) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    let [curr_x, curr_y] = scene.v2c((this.segments[0] as CubicBezierTuple)[0]);
    let cx: number, cy: number;
    let [h1_x, h1_y] = [0, 0];
    let [h2_x, h2_y] = [0, 0];
    let [x, y] = [0, 0];

    ctx.moveTo(curr_x, curr_y);
    for (let segment of this.segments) {
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
    ctx.closePath();
    if (this.stroke_options.stroke_color != "none") {
      ctx.stroke();
    }
    if (this.fill_options.fill) {
      ctx.fill();
    }
  }
}
