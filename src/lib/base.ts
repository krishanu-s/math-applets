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
  draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void {}
}

// *** SCENES ***

// An animated scene where all objects evolve according to some notion of time.
export class Scene {
  canvas: HTMLCanvasElement;
  mobjects: Record<string, MObject>; // TODO make this easier to look up?
  // Scene size
  xlims: [number, number];
  ylims: [number, number];
  // Current viewing window, this can differ
  // from the larger scene when zooming
  view_xlims: [number, number];
  view_ylims: [number, number];
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
    this.view_xlims = [0, canvas.width];
    this.view_ylims = [0, canvas.height];
  }
  // Sets the coordinates for the borders of the scene. This also resets
  // the current viewing window to match the scene size.
  set_frame_lims(xlims: [number, number], ylims: [number, number]) {
    this.xlims = xlims;
    this.ylims = ylims;
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Sets the current viewing window
  set_view_lims(xlims: [number, number], ylims: [number, number]) {
    this.view_xlims = xlims;
    this.view_ylims = ylims;
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

  console.log("Canvas made");

  return canvas;
}
