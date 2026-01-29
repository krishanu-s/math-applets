import { Scene } from "./base.js";
import { Line } from "./base_geom.js";

// A stylized line segment representing a spring with an equilibrium length.
// - In "color" mode, the color changes in accordance with the length
// - In "spring" mode, the object is drawn as a coiled spiral.
export class LineSpring extends Line {
  // TODO
  mode: "color" | "spring";
  color_map: number;
  constructor(
    start: [number, number],
    end: [number, number],
    kwargs: Record<string, any>,
  ) {
    super(start, end, kwargs);
    this.mode = "color";
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
