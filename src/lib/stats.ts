import { MObject, Scene } from "./base";
import { Vec2D, Rectangle } from "./base_geom.js";

// TODO Make space for the axes.
export class Histogram extends MObject {
  hist: Record<number, number> = {};
  fill_color: string = "red";
  // Min/max bin values
  bin_min: number = 0;
  bin_max: number = 100;
  // Min/max counts
  count_min: number = 0;
  count_max: number = 100;
  set_count_limits(min: number, max: number) {
    this.count_min = min;
    this.count_max = max;
  }
  set_bin_limits(min: number, max: number) {
    this.bin_min = min;
    this.bin_max = max;
  }
  set_hist(hist: Record<number, number>) {
    this.hist = hist;
  }
  // Create a bunch of rectangles
  draw(canvas: HTMLCanvasElement, scene: Scene) {
    let [xmin, xmax] = scene.xlims;
    let [ymin, ymax] = scene.ylims;
    let bin_width = (xmax - xmin) / (this.bin_max - this.bin_min);
    let ct_height = (ymax - ymin) / (this.count_max - this.count_min);

    let bin;
    let rect_center: Vec2D, rect_height: number, rect_width: number;
    for (let i = 0; i < Object.keys(this.hist).length; i++) {
      bin = Object.keys(this.hist)[i];
      rect_center = [
        xmin + (bin - this.bin_min + 0.5) * bin_width,
        ymin + this.hist[bin] * 0.5 * ct_height,
      ];
      rect_height = this.hist[bin] * ct_height;
      rect_width = bin_width;
      let rect = new Rectangle(rect_center, rect_width, rect_height);
      rect.fill_color = this.fill_color;
      rect.draw(canvas, scene);
    }
  }
}
