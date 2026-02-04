import { Scene } from "./base.js";
import {
  Line,
  Vec2D,
  vec2_norm,
  vec2_rot,
  vec2_scale,
  vec2_sum,
} from "./base_geom.js";
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
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.globalAlpha = this.alpha;
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
      let r = 1 - (this.eq_length * 0.4) / this.length();
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
