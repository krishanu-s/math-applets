import { MObject, Scene, Rectangle, Line, Vec2D } from ".";

// TODO Convert to a MObjectGroup
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
    let [scene_xmin, scene_xmax] = scene.xlims;
    let [scene_ymin, scene_ymax] = scene.ylims;

    let xmin = scene_xmin + (scene_xmax - scene_xmin) * 0.05;
    let xmax = scene_xmax - (scene_xmax - scene_xmin) * 0.05;
    let ymin = scene_ymin + (scene_ymax - scene_ymin) * 0.05;
    let ymax = scene_ymax - (scene_ymax - scene_ymin) * 0.05;

    // Draw histogram axes
    let x_axis = new Line([xmin, ymin], [xmax, ymin])
      .set_alpha(1.0)
      .set_stroke_width(0.5);
    x_axis.draw(canvas, scene);
    let y_axis = new Line([xmin, ymin], [xmin, ymax])
      .set_alpha(1.0)
      .set_stroke_width(0.5);
    y_axis.draw(canvas, scene);

    // Draw dotted lines at every 20%
    for (let i = 1; i <= 5; i++) {
      let line = new Line(
        [xmin, ymin + (i * (ymax - ymin)) / 5],
        [xmax, ymin + (i * (ymax - ymin)) / 5],
      )
        .set_alpha(1.0)
        .set_stroke_width(0.5)
        .set_stroke_color("gray");
      line.set_stroke_style("dashed");
      line.draw(canvas, scene);
    }

    let bin_width = (xmax - xmin) / (this.bin_max - this.bin_min);
    let ct_height = (ymax - ymin) / (this.count_max - this.count_min);

    let bin;
    let rect_center: Vec2D, rect_height: number, rect_width: number;
    for (let i = 0; i < Object.keys(this.hist).length; i++) {
      bin = Number(Object.keys(this.hist)[i]);
      rect_center = [
        xmin + (bin - this.bin_min + 0.5) * bin_width,
        ymin + (this.hist[bin] as number) * 0.5 * ct_height,
      ];
      rect_height = (this.hist[bin] as number) * ct_height;
      rect_width = bin_width;
      let rect = new Rectangle(rect_center, rect_width, rect_height);
      rect.fill_options.fill_color = this.fill_color;
      rect.draw(canvas, scene);
    }
  }
}
