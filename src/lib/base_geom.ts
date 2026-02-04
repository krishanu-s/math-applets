// Basic geometric mobjects and functions
import { MObject, Scene } from "./base.js";

// A point in 2D space.
export type Vec2D = [number, number];

export function vec2_norm(x: Vec2D): number {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}

export function vec2_angle(v: Vec2D): number {
  return Math.atan2(v[1], v[0]);
}

export function vec2_normalize(x: Vec2D) {
  let n = vec2_norm(x);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec2_scale(x, 1 / n);
  }
}

export function vec2_scale(x: Vec2D, factor: number): Vec2D {
  return [x[0] * factor, x[1] * factor];
}

export function vec2_sum(x: Vec2D, y: Vec2D): Vec2D {
  return [x[0] + y[0], x[1] + y[1]];
}

export function vec2_sum_list(xs: Vec2D[]): Vec2D {
  return xs.reduce((acc, x) => vec2_sum(acc, x), [0, 0]);
}

export function vec2_sub(x: Vec2D, y: Vec2D): Vec2D {
  return [x[0] - y[0], x[1] - y[1]];
}

export function vec2_rot(v: Vec2D, angle: number): Vec2D {
  const [x, y] = v;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - y * sin, x * sin + y * cos];
}

// A filled circle.
export class Dot extends MObject {
  center: Vec2D;
  radius: number;
  fill_color: string = "black";
  constructor(center: Vec2D, kwargs: Record<string, any>) {
    super();
    this.center = center;
    let radius = kwargs.radius as number;
    if (radius == undefined) {
      this.radius = 0.3;
    } else {
      this.radius = radius;
    }
    // TODO Set color
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
  }
  // Change the dot color
  set_color(color: string) {
    this.fill_color = color;
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

// A filled circular sector
export class Sector extends MObject {
  center: Vec2D;
  radius: number;
  start_angle: number;
  end_angle: number;
  fill_color: string = "black";
  constructor(
    center: Vec2D,
    start_angle: number,
    end_angle: number,
    kwargs: Record<string, any>,
  ) {
    super();
    this.center = center;
    let radius = kwargs.radius as number;
    if (radius == undefined) {
      this.radius = 0.3;
    } else {
      this.radius = radius;
    }
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
  // Change the dot radius
  set_radius(radius: number) {
    this.radius = radius;
  }
  // Change the dot color
  set_color(color: string) {
    this.fill_color = color;
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
    ctx.arc(x, y, Math.abs(xr - x), this.start_angle, this.end_angle);
    ctx.fill();
  }
}
// A filled circle which can be clicked-and-dragged
export class DraggableDot extends Dot {
  isClicked: boolean = false;
  dragStart: Vec2D = [0, 0];
  dragEnd: Vec2D = [0, 0];
  dragDiff: Vec2D = [0, 0];
  callbacks: (() => void)[] = [];
  // Tests whether a chosen vector lies inside the dot.
  is_inside_dot(p: Vec2D) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius;
  }
  // Adds a callback which triggers when the dot is dragged
  add_callback(callback: () => void) {
    this.callbacks.push(callback);
  }
  do_callbacks() {
    for (const callback of this.callbacks) {
      callback();
    }
  }
  // Triggers when the canvas is clicked.
  click(scene: Scene, event: MouseEvent) {
    this.dragStart = [
      event.pageX - scene.canvas.offsetLeft,
      event.pageY - scene.canvas.offsetTop,
    ];
    this.isClicked = this.is_inside_dot(
      scene.c2s(this.dragStart[0], this.dragStart[1]),
    );
  }
  // Triggers when the canvas is unclicked.
  unclick(scene: Scene, event: MouseEvent) {
    this.isClicked = false;
  }
  // Triggers when the mouse is dragged over the canvas.
  drag_cursor(scene: Scene, event: MouseEvent) {
    if (this.isClicked) {
      this.dragEnd = [
        event.pageX - scene.canvas.offsetLeft,
        event.pageY - scene.canvas.offsetTop,
      ];
      this.dragDiff = vec2_sub(
        scene.c2s(this.dragEnd[0], this.dragEnd[1]),
        scene.c2s(this.dragStart[0], this.dragStart[1]),
      );
      this.move_by(this.dragDiff);
      this.dragStart = this.dragEnd;
      // Perform any other MObject updates necessary.
      this.do_callbacks();
      scene.draw();
    }
  }
  add(scene: Scene) {
    let self = this;
    scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
    scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
    scene.canvas.addEventListener(
      "mousemove",
      self.drag_cursor.bind(self, scene),
    );
  }
}

// Dragging only affects the x-coordinate
export class DraggableDotX extends DraggableDot {
  drag_cursor(scene: Scene, event: MouseEvent) {
    if (this.isClicked) {
      this.dragEnd = [
        event.pageX - scene.canvas.offsetLeft,
        event.pageY - scene.canvas.offsetTop,
      ];
      this.dragDiff = vec2_sub(
        scene.c2s(this.dragEnd[0], 0),
        scene.c2s(this.dragStart[0], 0),
      );
      this.move_by(this.dragDiff);
      this.dragStart = this.dragEnd;
      // Perform any other MObject updates necessary.
      this.do_callbacks();
      scene.draw();
    }
  }
}

// Dragging only affects the y-coordinate
export class DraggableDotY extends DraggableDot {
  drag_cursor(scene: Scene, event: MouseEvent) {
    if (this.isClicked) {
      this.dragEnd = [
        event.pageX - scene.canvas.offsetLeft,
        event.pageY - scene.canvas.offsetTop,
      ];
      this.dragDiff = vec2_sub(
        scene.c2s(0, this.dragEnd[1]),
        scene.c2s(0, this.dragStart[1]),
      );
      this.move_by(this.dragDiff);
      this.dragStart = this.dragEnd;
      // Perform any other MObject updates necessary.
      this.do_callbacks();
      scene.draw();
    }
  }
}

// A filled rectangle specified by its center, width, and height
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
  move_to(center: Vec2D) {
    this.center = center;
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

// TODO Make "Linelike" for objects with stroke_width and stroke_color properties.

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
  move_start(p: Vec2D) {
    this.start = p;
  }
  move_end(p: Vec2D) {
    this.end = p;
  }
  length(): number {
    return vec2_norm(vec2_sub(this.start, this.end));
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
}

// A sequence of line segments with joined endpoints.
export class LineSequence extends MObject {
  points: Vec2D[];
  stroke_width: number;
  stroke_color: string;
  constructor(points: Vec2D[], kwargs: Record<string, any>) {
    super();
    this.points = points;

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
  add_point(point: Vec2D) {
    this.points.push(point);
  }
  move_point(i: number, new_point: Vec2D) {
    this.points[i] = new_point;
  }
  get_point(i: number): Vec2D {
    return this.points[i];
  }
  set_color(color: string) {
    this.stroke_color = color;
  }
  set_width(width: number) {
    this.stroke_width = width;
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;
    let [x, y] = scene.v2c(this.points[0]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.points.length; i++) {
      [x, y] = scene.v2c(this.points[i]);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}

// An arrow
export class Arrow extends Line {
  arrow_size: number = 0.1;
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
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    super.draw(canvas, scene);

    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.fillStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;

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
