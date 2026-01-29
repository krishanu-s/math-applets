// Basic geometric mobjects and functions
import { MObject, Scene } from "./base.js";

// A filled circle.
export class Dot extends MObject {
  center: [number, number];
  radius: number;
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
    // TODO Scale coordinates to pixels
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    let [x, y] = scene.v2c(this.center[0], this.center[1]);
    let xr = scene.v2c(this.center[0] + this.radius, this.center[1])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
}

// A line segment.
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
    let [start_x, start_y] = scene.v2c(this.start[0], this.start[1]);
    let [end_x, end_y] = scene.v2c(this.end[0], this.end[1]);
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
