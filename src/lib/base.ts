import { Vec2D } from "./base_geom";

// *** FUNCTIONS ***

// Clamps a number to the interval [xmin, xmax].
export function clamp(x: number, xmin: number, xmax: number): number {
  return Math.min(xmax, Math.max(xmin, x));
}

// The function 1 / (1 + e^{-x}). Used to map (-inf, inf) to (0, 1).
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Same as np.linspace. Generates an arithmetic sequence.
export function linspace(start: number, stop: number, num: number): number[] {
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => start + i * step);
}

// Generates an arithmetic sequence and then applies the function to each element.
export function funspace(
  func: (x: number) => number,
  start: number,
  stop: number,
  num: number,
): number[] {
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => func(start + i * step));
}

// Generate a single number according to a Gaussian distribution
export function gaussianRandom(mean: number, stdev: number) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

// Delays for the given number of milliseconds. Useful for visibility in test animations.
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// *** MATH OBJECTS ***

// Base class for mathematical objects
export class MObject {
  alpha: number; // Opacity for drawing
  constructor() {
    this.alpha = 1;
  }
  set_alpha(alpha: number) {
    this.alpha = alpha;
  }
  add(scene: Scene) {}

  draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    this._draw(ctx, scene, args);
  }
  _draw(ctx: CanvasRenderingContext2D, scene: Scene, args?: any) {}
}

// A MObject that is drawn using the ctx.stroke() command.
// TODO Incorporate "dashed" drawing
export class LineLikeMObject extends MObject {
  stroke_width: number = 0.08;
  stroke_color: string = "black";
  stroke_style: "solid" | "dashed" | "dotted" = "solid";
  set_stroke_color(color: string) {
    this.stroke_color = color;
    return this;
  }
  set_stroke_width(width: number) {
    this.stroke_width = width;
    return this;
  }
  set_stroke_style(style: "solid" | "dashed" | "dotted") {
    this.stroke_style = style;
    return this;
  }
  draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    let [xmin, xmax] = scene.view_xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    if (this.stroke_style == "dashed") {
      ctx.setLineDash([5, 5]);
    } else if (this.stroke_style == "dotted") {
      ctx.setLineDash([2, 2]);
    }
    this._draw(ctx, scene, args);
    ctx.setLineDash([]);
  }
}

// A MObject that is drawn using the ctx.stroke() and ctx.fill() commands.
export class FillLikeMObject extends MObject {
  stroke_width: number = 0.08;
  stroke_color: string = "black";
  stroke_style: "solid" | "dashed" | "dotted" = "solid";
  fill_color: string = "black";
  fill_alpha: number = 1.0;
  fill: boolean = true;
  set_stroke_color(color: string) {
    this.stroke_color = color;
    return this;
  }
  set_stroke_width(width: number) {
    this.stroke_width = width;
    return this;
  }
  set_stroke_style(style: "solid" | "dashed" | "dotted") {
    this.stroke_style = style;
    return this;
  }
  set_fill_color(color: string) {
    this.fill_color = color;
    return this;
  }
  set_color(color: string) {
    this.stroke_color = color;
    this.fill_color = color;
    return this;
  }
  set_fill_alpha(alpha: number) {
    this.fill_alpha = alpha;
    return this;
  }
  set_fill(fill: boolean) {
    this.fill = fill;
    return this;
  }
  draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    let [xmin, xmax] = scene.view_xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    if (this.stroke_style == "dashed") {
      ctx.setLineDash([5, 5]);
    } else if (this.stroke_style == "dotted") {
      ctx.setLineDash([2, 2]);
    }
    ctx.fillStyle = this.fill_color;
    this._draw(ctx, scene, args);
    ctx.setLineDash([]);
  }
}

// *** SCENES ***

// A Scene is an abstract class which houses mathematical objects defined by some set of parameters.
// It includes frameworks for
// - drawing to a canvas, or multiple separate canvases (TODO, in this case it may be better to have separate linked scenes)
// - making available to the user interactive elements, such as buttons or sliders, which change parameters
// - running autonomous simulations which evolve these mathematical objects
// - running user-defined animations
// TODO Incorporate the ability to add interactive elements to the scene.
// - Sliders
// - Buttons
// -
export class Scene {
  canvas: HTMLCanvasElement;
  border_thickness: number = 4;
  border_color: string = "black";
  mobjects: Record<string, MObject>;
  // Scene size
  xlims: Vec2D;
  ylims: Vec2D;
  // Current viewing window, this can differ
  // from the larger scene when zooming
  view_xlims: Vec2D;
  view_ylims: Vec2D;
  // Zoom ratio
  zoom_ratio: number = 1.0;
  // Determines whether any draggable object in the scene is clicked
  is_dragging: boolean = false;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
    this.view_xlims = [0, canvas.width];
    this.view_ylims = [0, canvas.height];
  }
  click() {
    this.is_dragging = true;
  }
  unclick() {
    this.is_dragging = false;
  }
  // Sets the coordinates for the borders of the scene. This also resets
  // the current viewing window to match the scene size.
  set_frame_lims(xlims: Vec2D, ylims: Vec2D) {
    this.xlims = xlims;
    this.ylims = ylims;
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Sets the current viewing window
  set_view_lims(xlims: Vec2D, ylims: Vec2D) {
    this.zoom_ratio = (this.xlims[1] - this.xlims[0]) / (xlims[1] - xlims[0]);
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Returns the center of the viewing window
  get_view_center(): Vec2D {
    return [
      (this.view_xlims[0] + this.view_xlims[1]) / 2,
      (this.view_ylims[0] + this.view_ylims[1]) / 2,
    ];
  }
  // Sets the current zoom level
  set_zoom(value: number) {
    this.zoom_ratio = value;
    this.view_xlims = [this.xlims[0] / value, this.xlims[1] / value];
    this.view_ylims = [this.ylims[0] / value, this.ylims[1] / value];
  }
  // Performs a homothety around the specified center point of the viewing window, with the given factor
  zoom_in_on(ratio: number, center: Vec2D) {
    this.zoom_ratio *= ratio;
    this.view_xlims = [
      center[0] + (this.view_xlims[0] - center[0]) / ratio,
      center[0] + (this.view_xlims[1] - center[0]) / ratio,
    ];
    this.view_ylims = [
      center[1] + (this.view_ylims[0] - center[1]) / ratio,
      center[1] + (this.view_ylims[1] - center[1]) / ratio,
    ];
  }
  // Moves the viewing window by the specified vector
  move_view(v: Vec2D) {
    this.view_xlims = [this.view_xlims[0] + v[0], this.view_xlims[1] + v[0]];
    this.view_ylims = [this.view_ylims[0] + v[1], this.view_ylims[1] + v[1]];
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
  // Converts viewing coordinates to canvas coordinates
  v2c(v: Vec2D): Vec2D {
    return [
      (this.canvas.width * (v[0] - this.view_xlims[0])) /
        (this.view_xlims[1] - this.view_xlims[0]),
      (this.canvas.height * (this.view_ylims[1] - v[1])) /
        (this.view_ylims[1] - this.view_ylims[0]),
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
  // Converts canvas coordinates to viewing coordinates
  c2v(x: number, y: number): [number, number] {
    return [
      this.view_xlims[0] +
        (x * (this.view_xlims[1] - this.view_xlims[0])) / this.canvas.width,
      this.view_ylims[1] -
        (y * (this.view_ylims[1] - this.view_ylims[0])) / this.canvas.height,
    ];
  }
  // Adds a mobject to the scene
  add(name: string, mobj: MObject) {
    this.mobjects[name] = mobj;
    let self = this;
    mobj.add(self);
  }
  // Removes the mobject from the scene
  remove(name: string) {
    delete this.mobjects[name];
  }
  // Removes all mobjects from the scene
  clear() {
    this.mobjects = {};
  }
  // Checks if a mobject exists in the scene
  has_mobj(name: string): boolean {
    return this.mobjects.hasOwnProperty(name);
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

    this._draw();

    this.draw_border(ctx);
  }
  _draw() {
    // Draw the mobjects
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
  }
  // Draw a border around the canvas
  draw_border(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Prepares a named element of the document to be a drawing canvas
// of the desired size.
export function prepare_canvas(
  width: number,
  height: number,
  name: string,
): HTMLCanvasElement {
  const container = document.getElementById(name);
  if (container == null) throw new Error(`${name} not found`);

  // Set size
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

  prepareCanvasForMobile(canvas);

  return canvas;
}

// Prepares a canvas for interactive elements on mobile by removing all other touch interactivity
export function prepareCanvasForMobile(canvas: HTMLCanvasElement) {
  canvas.ontouchstart = function (e) {
    e.preventDefault();
  };
  canvas.ontouchend = function (e) {
    e.preventDefault();
  };
  canvas.ontouchmove = function (e) {
    e.preventDefault();
  };
}

export function mouse_event_coords(event: MouseEvent): Vec2D {
  return [event.pageX, event.pageY];
}

export function touch_event_coords(event: TouchEvent): Vec2D {
  return [event.touches[0].pageX, event.touches[0].pageY];
}
