// MObjects representing 2D geometry. These are the "basic" ones.
import {
  MObject,
  LineLikeMObject,
  FillLikeMObject,
  Scene,
  mouse_event_coords,
  touch_event_coords,
} from "./base.js";
import { colorval_to_rgba, rb_colormap_2 } from "./color.js";
import {
  Vec2D,
  vec2_norm,
  vec2_sum,
  vec2_sub,
  vec2_scale,
  vec2_rot,
  vec2_normalize,
  vec2_angle,
  vec2_sum_list,
} from "./vec2.js";
import { DraggableMObject, makeDraggable } from "../interactive/draggable.js";

// A filled circle.
export class Dot extends FillLikeMObject implements DraggableMObject {
  center: Vec2D;
  radius: number = 0.1;
  constructor(center: Vec2D, radius: number) {
    super();
    this.center = center;
    this.radius = radius;
  }
  // Tests whether a chosen vector lies inside the shape. Used for click-detection.
  is_inside(p: Vec2D) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius;
  }
  // Tests whether a chosen vector lies within an enlarged version of the dot.
  // Used for touch-detection on mobile devices.
  is_almost_inside(p: Vec2D, tolerance: number) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius * tolerance;
  }
  // Get the center coordinates
  get_center(): Vec2D {
    return this.center;
  }
  // Move the center of the dot to a desired location
  move_to(p: Vec2D) {
    this.center = p;
  }
  move_by(p: Vec2D) {
    this.center[0] += p[0];
    this.center[1] += p[1];
  }
  // Change the dot radius
  set_radius(radius: number) {
    this.radius = radius;
    return this;
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [x, y] = scene.v2c(this.center);
    let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
}

// A filled circular sector
export class Sector extends FillLikeMObject {
  center: Vec2D;
  radius: number;
  start_angle: number;
  end_angle: number;
  constructor(
    center: Vec2D,
    radius: number,
    start_angle: number,
    end_angle: number,
  ) {
    super();
    this.center = center;
    this.radius = radius;
    this.start_angle = start_angle;
    this.end_angle = end_angle;
  }
  // Get the center coordinates
  get_center(): Vec2D {
    return this.center;
  }
  // Move the center of the dot to a desired location
  move_to(center: Vec2D) {
    this.center = center;
  }
  move_by(p: Vec2D) {
    this.center[0] += p[0];
    this.center[1] += p[1];
  }
  // Change the dot radius
  set_radius(radius: number) {
    this.radius = radius;
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [x, y] = scene.v2c(this.center);
    let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), this.start_angle, this.end_angle);
    if (this.fill_options.fill) {
      ctx.globalAlpha *= this.fill_options.fill_alpha;
      ctx.fill();
      ctx.globalAlpha /= this.fill_options.fill_alpha;
    }
  }
}
// A filled circle which can be clicked-and-dragged
export const DraggableDot = makeDraggable(Dot);

// A filled rectangle specified by its center, width, and height
export class Rectangle extends FillLikeMObject implements DraggableMObject {
  center: Vec2D;
  size_x: number;
  size_y: number;
  constructor(center: Vec2D, size_x: number, size_y: number) {
    super();
    this.center = center;
    this.size_x = size_x;
    this.size_y = size_y;
  }
  // Tests whether a chosen vector lies inside the shape. Used for click-detection.
  is_inside(p: Vec2D) {
    return (
      Math.abs(p[0] - this.center[0]) < this.size_x / 2 &&
      Math.abs(p[1] - this.center[1]) < this.size_y / 2
    );
  }
  // Tests whether a chosen vector lies within an enlarged version of the shape.
  // Used for touch-detection on mobile devices, and for use by small children.
  is_almost_inside(p: Vec2D, tolerance: number) {
    return (
      Math.abs(p[0] - this.center[0]) < (this.size_x / 2) * tolerance &&
      Math.abs(p[1] - this.center[1]) < (this.size_y / 2) * tolerance
    );
  }
  get_center(): Vec2D {
    return this.center;
  }
  move_to(center: Vec2D) {
    this.center = center;
  }
  move_by(p: Vec2D) {
    this.center[0] += p[0];
    this.center[1] += p[1];
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] - this.size_y / 2,
    ]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] + this.size_x / 2,
      this.center[1] - this.size_y / 2,
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] + this.size_x / 2,
      this.center[1] + this.size_y / 2,
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] + this.size_y / 2,
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] - this.size_y / 2,
    ]);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
}

// A closed path of points.
export class Polygon extends FillLikeMObject {
  points: Vec2D[];
  constructor(points: Vec2D[]) {
    super();
    this.points = points;
  }
  add_point(point: Vec2D) {
    this.points.push(point);
  }
  remove_point(index: number) {
    this.points.splice(index, 1);
  }
  move_point(i: number, new_point: Vec2D) {
    this.points[i] = new_point;
  }
  move_by(p: Vec2D) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = vec2_sum(this.points[i] as Vec2D, p);
    }
  }
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [x, y] = scene.v2c(this.points[0] as Vec2D);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.points.length; i++) {
      [x, y] = scene.v2c(this.points[i] as Vec2D);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    if (this.fill_options.fill) {
      ctx.globalAlpha *= this.fill_options.fill_alpha;
      ctx.fill();
      ctx.globalAlpha /= this.fill_options.fill_alpha;
    }
  }
}

// A filled rectangle which can be clicked-and-dragged
export const DraggableRectangle = makeDraggable(Rectangle);

// A line segment.
export class Line extends LineLikeMObject {
  start: Vec2D;
  end: Vec2D;
  constructor(start: Vec2D, end: Vec2D) {
    super();
    this.start = start;
    this.end = end;
  }
  // Moves the start and end points
  move_start(p: Vec2D) {
    this.start = p;
  }
  move_end(p: Vec2D) {
    this.end = p;
  }
  move_by(p: Vec2D) {
    this.start = vec2_sum(this.start, p);
    this.end = vec2_sum(this.end, p);
  }
  length(): number {
    return vec2_norm(vec2_sub(this.start, this.end));
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
}

// A sequence of line segments with joined endpoints.
export class LineSequence extends LineLikeMObject {
  points: Vec2D[];
  constructor(points: Vec2D[]) {
    super();
    this.points = points;
  }
  add_point(point: Vec2D) {
    this.points.push(point);
  }
  remove_point(index: number) {
    this.points.splice(index, 1);
  }
  move_point(i: number, new_point: Vec2D) {
    this.points[i] = new_point;
  }
  get_point(i: number): Vec2D {
    return this.points[i] as Vec2D;
  }
  move_by(p: Vec2D) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = vec2_sum(this.points[i] as Vec2D, p);
    }
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [x, y] = scene.v2c(this.points[0] as Vec2D);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.points.length; i++) {
      [x, y] = scene.v2c(this.points[i] as Vec2D);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// An arrow
export class Arrow extends Line {
  arrow_size: number = 0.1;

  set_arrow_size(size: number) {
    this.arrow_size = size;
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    super._draw(ctx, scene);

    ctx.fillStyle = this.stroke_options.stroke_color;

    let [end_x, end_y] = scene.v2c(this.end);

    let v = vec2_scale(
      vec2_sub(this.start, this.end),
      this.arrow_size / this.length(),
    );
    let [ax, ay] = scene.v2c(vec2_sum(this.end, vec2_rot(v, Math.PI / 6)));
    let [bx, by] = scene.v2c(vec2_sum(this.end, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();

    ctx.moveTo(end_x, end_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(end_x, end_y);
    ctx.closePath();
    ctx.fill();
  }
}

// A double-sided arrow
export class TwoHeadedArrow extends Line {
  arrow_size: number = 0.3;
  set_arrow_size(size: number) {
    this.arrow_size = size;
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    super._draw(ctx, scene);
    ctx.fillStyle = this.stroke_options.stroke_color;

    let [end_x, end_y] = scene.v2c(this.end);
    let [start_x, start_y] = scene.v2c(this.start);

    let v: Vec2D;
    let ax: number;
    let ay: number;
    let bx: number;
    let by: number;

    // Arrow head
    v = vec2_scale(
      vec2_sub(this.start, this.end),
      this.arrow_size / this.length(),
    );
    [ax, ay] = scene.v2c(vec2_sum(this.end, vec2_rot(v, Math.PI / 6)));
    [bx, by] = scene.v2c(vec2_sum(this.end, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();
    ctx.moveTo(end_x, end_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(end_x, end_y);
    ctx.closePath();
    ctx.fill();

    // Arrow tail
    v = vec2_scale(
      vec2_sub(this.end, this.start),
      this.arrow_size / this.length(),
    );
    [ax, ay] = scene.v2c(vec2_sum(this.start, vec2_rot(v, Math.PI / 6)));
    [bx, by] = scene.v2c(vec2_sum(this.start, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(start_x, start_y);
    ctx.closePath();
    ctx.fill();
  }
}

// A stylized line segment representing a spring with an equilibrium length.
// - In "color" mode, the color changes in accordance with the length
// - In "spring" mode, the object is drawn as a coiled spiral.
export class LineSpring extends Line {
  mode: "color" | "spring";
  eq_length: number;
  constructor(start: [number, number], end: [number, number]) {
    super(start, end);
    this.mode = "color";
    this.eq_length = 2.0;
  }
  set_mode(mode: "color" | "spring") {
    this.mode = mode;
  }
  set_eq_length(length: number) {
    this.eq_length = length;
  }
  length(): number {
    let [start_x, start_y] = this.start;
    let [end_x, end_y] = this.end;
    return Math.sqrt((end_x - start_x) ** 2 + (end_y - start_y) ** 2);
  }
  // alpha_scaling(): number {
  //   return Math.min(1.0, this.eq_length / this.length());
  // }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    if (this.mode == "color") {
      ctx.strokeStyle = colorval_to_rgba(
        rb_colormap_2(10 * Math.log(this.eq_length / this.length())),
      );
      ctx.beginPath();
      ctx.moveTo(start_x, start_y);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
    } else {
      let v: Vec2D = [end_x - start_x, end_y - start_y];
      // Number of turns
      let num_turns = 5;
      // Ratio of length of spring taken up by zigzag part
      let r = 1 - (0.4 * this.eq_length) / this.length();
      // Decide the angle of each turn based on the current length
      // let theta = Math.PI / 3;
      let theta = Math.atan((8 * (2 * num_turns)) / (vec2_norm(v) * r));
      let scaled_v = vec2_scale(v, r / (2 * Math.cos(theta) * num_turns));

      let current_p: Vec2D = [
        start_x + 0.5 * (1 - r) * (end_x - start_x),
        start_y + 0.5 * (1 - r) * (end_y - start_y),
      ];

      // Draw as a zigzag
      ctx.beginPath();
      ctx.moveTo(start_x, start_y);

      // Do initial 10% of length
      ctx.lineTo(current_p[0], current_p[1]);

      current_p = vec2_sum(
        current_p,
        vec2_rot(vec2_scale(scaled_v, 0.5), theta),
      );
      ctx.lineTo(current_p[0], current_p[1]);
      for (let i = 0; i < num_turns - 1; i++) {
        current_p = vec2_sum(current_p, vec2_rot(scaled_v, -theta));
        ctx.lineTo(current_p[0], current_p[1]);
        current_p = vec2_sum(current_p, vec2_rot(scaled_v, theta));
        ctx.lineTo(current_p[0], current_p[1]);
      }
      current_p = vec2_sum(
        current_p,
        vec2_rot(vec2_scale(scaled_v, 0.5), -theta),
      );
      ctx.lineTo(current_p[0], current_p[1]);

      // Do final 10% of length
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
    }
  }
}
