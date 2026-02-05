// Basic geometric mobjects and functions
import {
  MObject,
  LineLikeMObject,
  FillLikeMObject,
  Scene,
  mouse_event_coords,
  touch_event_coords,
} from "./base.js";

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

// A MObject with linelike properties: in particular,

// A filled circle.
export class Dot extends FillLikeMObject {
  center: Vec2D;
  radius: number = 0.1;
  constructor(center: Vec2D, radius: number) {
    super();
    this.center = center;
    this.radius = radius;
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
    ctx.fill();
  }
}
// A filled circle which can be clicked-and-dragged
export class DraggableDot extends Dot {
  isClicked: boolean = false;
  dragStart: Vec2D = [0, 0];
  dragEnd: Vec2D = [0, 0];
  touch_tolerance: number = 2.0;
  callbacks: (() => void)[] = [];
  // Tests whether a chosen vector lies inside the shape. Used for click-detection.
  is_inside(p: Vec2D) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius;
  }
  // Tests whether a chosen vector lies within an enlarged version of the dot.
  // Used for touch-detection on mobile devices, and for use by small children.
  is_almost_inside_dot(p: Vec2D, tolerance: number) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius * tolerance;
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
    this.dragStart = vec2_sub(mouse_event_coords(event), [
      scene.canvas.offsetLeft,
      scene.canvas.offsetTop,
    ]);
    this.isClicked = this.is_inside(
      scene.c2s(this.dragStart[0], this.dragStart[1]),
    );
  }
  touch(scene: Scene, event: TouchEvent) {
    this.dragStart = vec2_sub(touch_event_coords(event), [
      scene.canvas.offsetLeft,
      scene.canvas.offsetTop,
    ]);
    this.isClicked = this.is_almost_inside_dot(
      scene.c2s(this.dragStart[0], this.dragStart[1]),
      this.touch_tolerance,
    );
  }
  // Triggers when the canvas is unclicked.
  unclick(scene: Scene, event: MouseEvent) {
    this.isClicked = false;
  }
  untouch(scene: Scene, event: TouchEvent) {
    this.isClicked = false;
  }
  // Triggers when the mouse is dragged over the canvas.
  mouse_drag_cursor(scene: Scene, event: MouseEvent) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      this._drag_cursor(scene);
    }
  }
  touch_drag_cursor(scene: Scene, event: TouchEvent) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(touch_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      this._drag_cursor(scene);
    }
  }
  _drag_cursor(scene: Scene) {
    this.move_by(
      vec2_sub(
        scene.c2s(this.dragEnd[0], this.dragEnd[1]),
        scene.c2s(this.dragStart[0], this.dragStart[1]),
      ),
    );
    this.dragStart = this.dragEnd;
    // Perform any other MObject updates necessary.
    this.do_callbacks();
    scene.draw();
  }
  add(scene: Scene) {
    let self = this;
    // For desktop
    scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
    scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
    scene.canvas.addEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self, scene),
    );
    // For mobile
    scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
    scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
    scene.canvas.addEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self, scene),
    );
  }
  remove(scene: Scene) {
    let self = this;
    // For desktop
    scene.canvas.removeEventListener("mousedown", this.click.bind(self, scene));
    scene.canvas.removeEventListener("mouseup", this.unclick.bind(self, scene));
    scene.canvas.removeEventListener(
      "mousemove",
      this.mouse_drag_cursor.bind(self, scene),
    );
    // For mobile
    scene.canvas.removeEventListener(
      "touchstart",
      this.click.bind(self, scene),
    );
    scene.canvas.removeEventListener(
      "touchend",
      this.unclick.bind(self, scene),
    );
    scene.canvas.removeEventListener(
      "touchmove",
      self.mouse_drag_cursor.bind(self, scene),
    );
  }
}

// Dragging only affects the x-coordinate
export class DraggableDotX extends DraggableDot {
  _drag_cursor(scene: Scene) {
    this.move_by(
      vec2_sub(scene.c2s(this.dragEnd[0], 0), scene.c2s(this.dragStart[0], 0)),
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
}

// Dragging only affects the y-coordinate
export class DraggableDotY extends DraggableDot {
  _drag_cursor(scene: Scene) {
    this.move_by(
      vec2_sub(scene.c2s(0, this.dragEnd[1]), scene.c2s(0, this.dragStart[1])),
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
}

// A filled rectangle specified by its center, width, and height
export class Rectangle extends FillLikeMObject {
  center: Vec2D;
  size_x: number;
  size_y: number;
  constructor(center: Vec2D, size_x: number, size_y: number) {
    super();
    this.center = center;
    this.size_x = size_x;
    this.size_y = size_y;
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

// A filled rectangle which can be clicked-and-dragged
// TODO See if it's possible to refactor this with DraggableDot.
export class DraggableRectangle extends Rectangle {
  isClicked: boolean = false;
  dragStart: Vec2D = [0, 0];
  dragEnd: Vec2D = [0, 0];
  touch_tolerance: number = 2.0;
  callbacks: (() => void)[] = [];
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
      Math.abs(p[0] - this.center[0]) <
        (this.size_x / 2) * this.touch_tolerance &&
      Math.abs(p[1] - this.center[1]) < (this.size_y / 2) * this.touch_tolerance
    );
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
    this.isClicked = this.is_inside(
      scene.c2s(this.dragStart[0], this.dragStart[1]),
    );
  }
  touch(scene: Scene, event: TouchEvent) {
    this.dragStart = [
      event.touches[0].pageX - scene.canvas.offsetLeft,
      event.touches[0].pageY - scene.canvas.offsetTop,
    ];
    this.isClicked = this.is_almost_inside(
      scene.c2s(this.dragStart[0], this.dragStart[1]),
      this.touch_tolerance,
    );
  }
  // Triggers when the canvas is unclicked.
  unclick(scene: Scene, event: MouseEvent) {
    this.isClicked = false;
  }
  untouch(scene: Scene, event: TouchEvent) {
    this.isClicked = false;
  }
  // Triggers when the mouse is dragged over the canvas.
  mouse_drag_cursor(scene: Scene, event: MouseEvent) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      this._drag_cursor(scene);
    }
  }
  touch_drag_cursor(scene: Scene, event: TouchEvent) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(touch_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      this._drag_cursor(scene);
    }
  }
  _drag_cursor(scene: Scene) {
    this.move_by(
      vec2_sub(
        scene.c2s(this.dragEnd[0], this.dragEnd[1]),
        scene.c2s(this.dragStart[0], this.dragStart[1]),
      ),
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
  add(scene: Scene) {
    let self = this;
    // For desktop
    scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
    scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
    scene.canvas.addEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self, scene),
    );
    // For mobile
    scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
    scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
    scene.canvas.addEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self, scene),
    );
  }
  remove(scene: Scene) {
    let self = this;
    // For desktop
    scene.canvas.removeEventListener("mousedown", this.click.bind(self, scene));
    scene.canvas.removeEventListener("mouseup", this.unclick.bind(self, scene));
    scene.canvas.removeEventListener(
      "mousemove",
      this.mouse_drag_cursor.bind(self, scene),
    );
    // For mobile
    scene.canvas.removeEventListener(
      "touchstart",
      this.click.bind(self, scene),
    );
    scene.canvas.removeEventListener(
      "touchend",
      this.unclick.bind(self, scene),
    );
    scene.canvas.removeEventListener(
      "touchmove",
      self.mouse_drag_cursor.bind(self, scene),
    );
  }
}

// Dragging only affects the x-coordinate
export class DraggableRectangleX extends DraggableRectangle {
  _drag_cursor(scene: Scene) {
    this.move_by(
      vec2_sub(scene.c2s(this.dragEnd[0], 0), scene.c2s(this.dragStart[0], 0)),
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
}

// Dragging only affects the y-coordinate
export class DraggableRectangleY extends DraggableRectangle {
  _drag_cursor(scene: Scene) {
    this.move_by(
      vec2_sub(scene.c2s(0, this.dragEnd[1]), scene.c2s(0, this.dragStart[1])),
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
}

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
  move_point(i: number, new_point: Vec2D) {
    this.points[i] = new_point;
  }
  get_point(i: number): Vec2D {
    return this.points[i];
  }
  // Draws on the canvas
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
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
  _draw(ctx: CanvasRenderingContext2D, scene: Scene) {
    super._draw(ctx, scene);
    ctx.fillStyle = this.stroke_color;

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
    ctx.fillStyle = this.stroke_color;

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
