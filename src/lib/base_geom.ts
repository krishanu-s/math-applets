// Basic geometric mobjects and functions
import { MObject, Scene } from "./base.js";

// A point in 2D space.
export type Vec2D = [number, number];

export function vec_norm(x: Vec2D): number {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}

export function vec2_normalize(x: Vec2D) {
  let n = vec_norm(x);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec_scale(x, 1 / n);
  }
}

export function vec_scale(x: Vec2D, factor: number): Vec2D {
  return [x[0] * factor, x[1] * factor];
}

export function vec_sum(x: Vec2D, y: Vec2D): Vec2D {
  return [x[0] + y[0], x[1] + y[1]];
}

export function vec_sum_list(xs: Vec2D[]): Vec2D {
  return xs.reduce((acc, x) => vec_sum(acc, x), [0, 0]);
}

export function vec_sub(x: Vec2D, y: Vec2D): Vec2D {
  return [x[0] - y[0], x[1] - y[1]];
}

export function vec_rot(v: Vec2D, angle: number): Vec2D {
  const [x, y] = v;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - y * sin, x * sin + y * cos];
}

// A filled circle.
export class Dot extends MObject {
  center: [number, number];
  radius: number;
  fill_color: string = "black";
  constructor(center_x: number, center_y: number, kwargs: Record<string, any>) {
    super();
    this.center = [center_x, center_y];
    let radius = kwargs.radius as number;
    if (radius == undefined) {
      this.radius = 0.3;
    } else {
      this.radius = radius;
    }
    // TODO Set color
  }
  // Get the center coordinates
  get_center(): [number, number] {
    return this.center;
  }
  // Move the center of the dot to a desired location
  move_to(x: number, y: number) {
    this.center = [x, y];
  }
  // Change the dot radius
  set_radius(radius: number) {
    this.radius = radius;
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.fillStyle = this.fill_color;
    ctx.globalAlpha = this.alpha;
    let [x, y] = scene.v2c(this.center);
    let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
}

// A rectangle specified by its center, width, and height
export class Rectangle extends MObject {
  center: Vec2D;
  size_x: number;
  size_y: number;
  fill_color: string = "black";
  constructor(center: Vec2D, size_x: number, size_y: number) {
    super();
    this.center = center;
    this.size_x = size_x;
    this.size_y = size_y;
  }
  move_to(x: number, y: number) {
    this.center = [x, y];
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.fillStyle = this.fill_color;
    ctx.globalAlpha = this.alpha;

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
    ctx.fill();
  }
}

// A line segment.
export class Line extends MObject {
  start: Vec2D;
  end: Vec2D;
  stroke_width: number;
  stroke_color: string;
  constructor(start: Vec2D, end: Vec2D, kwargs: Record<string, any>) {
    super();
    this.start = start;
    this.end = end;

    let stroke_width = kwargs.stroke_width as number;
    if (stroke_width == undefined) {
      this.stroke_width = 0.08;
    } else {
      this.stroke_width = stroke_width;
    }

    let stroke_color = kwargs.stroke_color as string;
    if (stroke_color == undefined) {
      this.stroke_color = `rgb(0, 0, 0)`;
    } else {
      this.stroke_color = stroke_color;
    }
  }
  // Moves the start and end points
  move_start(x: number, y: number) {
    this.start = [x, y];
  }
  move_end(x: number, y: number) {
    this.end = [x, y];
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
}

// An arrow
export class Arrow extends Line {
  arrow_size: number = 0.3;
  set_arrow_size(size: number) {
    this.arrow_size = size;
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    super.draw(canvas, scene);

    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.fillStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;

    let [end_x, end_y] = scene.v2c(this.end);

    let v = vec_scale(vec_sub(this.start, this.end), this.arrow_size);
    let [ax, ay] = scene.v2c(vec_sum(this.end, vec_rot(v, Math.PI / 6)));
    let [bx, by] = scene.v2c(vec_sum(this.end, vec_rot(v, -Math.PI / 6)));
    ctx.beginPath();

    ctx.moveTo(end_x, end_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(end_x, end_y);
    ctx.closePath();
    ctx.fill();
  }
}
