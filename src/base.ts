// *** TYPES ***
export type Vec2D = [number, number];

export function vec_norm(x: Vec2D): number {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
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

// *** FUNCTIONS ***

// Clamps a number to the interval [xmin, xmax].
export function clamp(x: number, xmin: number, xmax: number): number {
  return Math.min(xmax, Math.max(xmin, x));
}

// The function 1 / (1 + e^{-x})
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// *** MATH OBJECTS ***

// Base class for mathematical objects
export class MObject {
  constructor() {}
  draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void {}
}

// A dot with a center and radius
export class Dot extends MObject {
  center: [number, number];
  radius: number;
  constructor(center_x: number, center_y: number, kwargs: Record<string, any>) {
    super();
    this.center = [center_x, center_y];
    let radius = kwargs["radius"] as number;
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
    // TODO Scale coordinates to pixels
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [x, y] = scene.s2c(this.center[0], this.center[1]);
    let xr = scene.s2c(this.center[0] + this.radius, this.center[1])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
}

// A line of some length
export class Line extends MObject {
  start: [number, number];
  end: [number, number];
  stroke_width: number;
  stroke_color: string;
  constructor(
    start: [number, number],
    end: [number, number],
    kwargs: Record<string, any>,
  ) {
    super();
    this.start = start;
    this.end = end;

    let stroke_width = kwargs["stroke_width"] as number;
    if (stroke_width == undefined) {
      this.stroke_width = 0.08;
    } else {
      this.stroke_width = stroke_width;
    }

    let stroke_color = kwargs["stroke_color"] as string;
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
    let [start_x, start_y] = scene.s2c(this.start[0], this.start[1]);
    let [end_x, end_y] = scene.s2c(this.end[0], this.end[1]);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
}

// A Bezier curve
export class BezierCurve extends MObject {
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
  move_start(x: number, y: number) {
    this.start = [x, y];
  }
  move_end(x: number, y: number) {
    this.end = [x, y];
  }
  // Moves the handles
  move_h1(x: number, y: number) {
    this.h1 = [x, y];
  }
  move_h2(x: number, y: number) {
    this.h2 = [x, y];
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.s2c(this.start[0], this.start[1]);
    let [h1_x, h1_y] = scene.s2c(this.h1[0], this.h1[1]);
    let [h2_x, h2_y] = scene.s2c(this.h2[0], this.h2[1]);
    let [end_x, end_y] = scene.s2c(this.end[0], this.end[1]);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.width * canvas.width) / (xmax - xmin);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, end_x, end_y);
    ctx.stroke();
  }
}
// *** SCENES ***

// An animated scene where all objects evolve according to some notion of time.
export class Scene {
  canvas: HTMLCanvasElement;
  mobjects: Record<string, MObject>; // TODO make this easier to look up?
  xlims: [number, number];
  ylims: [number, number];
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
  }
  // Sets the coordinates for the borders of the frame
  set_frame_lims(xlims: [number, number], ylims: [number, number]) {
    this.xlims = xlims;
    this.ylims = ylims;
  }
  // Converts scene coordinates to canvas coordinates
  s2c(x: number, y: number): [number, number] {
    return [
      (this.canvas.width * (x - this.xlims[0])) /
        (this.xlims[1] - this.xlims[0]),
      (this.canvas.height * (this.ylims[1] - y)) /
        (this.ylims[1] - this.ylims[0]),
    ];
  }
  // Converts canvas coordinates to scene coordinates
  c2s(x: number, y: number): [number, number] {
    return [
      this.xlims[0] + (x * (this.xlims[1] - this.xlims[0])) / this.canvas.width,
      this.ylims[1] -
        (y * (this.ylims[1] - this.ylims[0])) / this.canvas.height,
    ];
  }
  // Adds a mobject to the scene
  add(name: string, mobj: MObject) {
    this.mobjects[name] = mobj;
  }
  // Removes the mobject from the scene
  remove(name: string) {
    delete this.mobjects[name];
  }
  // Removes all mobjects from the scene
  clear() {
    this.mobjects = {};
  }
  // Gets the mobject by name
  get_mobj(name: string): MObject {
    let mobj = this.mobjects[name];
    if (mobj == undefined) throw new Error(`${name} not found`);
    return mobj;
  }
  // Draws the scene
  draw(args?: any) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
  }
}

// Prepare the canvas
export function prepare_canvas(
  width: number,
  height: number,
  name: string,
): HTMLCanvasElement {
  const container = document.getElementById(name);
  if (container == null) throw new Error(`${name} not found`);

  // Set size to 300 pixels by 300 pixels
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  // Make a visual element
  let wrapper = document.createElement("div");
  wrapper.classList.add("canvas_container");
  wrapper.classList.add("non_selectable");
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;

  let canvas = document.createElement("canvas");
  canvas.classList.add("non_selectable");
  canvas.style.position = "relative";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.height = height;
  canvas.width = width;

  wrapper.appendChild(canvas);
  container.appendChild(wrapper);

  console.log("Canvas made");

  return canvas;
}
