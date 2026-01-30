import { Scene } from "./base.js";
import { Line } from "./base_geom.js";
import { rb_colormap_2, colorval_to_rgba } from "./color.js";

// A stylized line segment representing a spring with an equilibrium length.
// - In "color" mode, the color changes in accordance with the length
// TODO Handle this using blue for lengthening, red for shortening.
// - In "spring" mode, the object is drawn as a coiled spiral.
export class LineSpring extends Line {
  // TODO
  mode: "color" | "spring";
  eq_length: number;
  constructor(
    start: [number, number],
    end: [number, number],
    kwargs: Record<string, any>,
  ) {
    super(start, end, kwargs);
    this.mode = "color";
    this.eq_length = 2.0;
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
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    // ctx.strokeStyle = this.stroke_color;
    ctx.strokeStyle = colorval_to_rgba(
      rb_colormap_2(10 * Math.log(this.eq_length / this.length())),
    );
    // TODO Change the color map
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
}
