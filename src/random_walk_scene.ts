import { MObject, Scene, prepare_canvas, delay } from "./lib/base.js";
import { Dot, Line, Vec2D, Rectangle } from "./lib/base_geom.js";
import { Vec3D } from "./lib/three_d.js";

(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    function pick_random_step(dim: number): number[] {
      const x = 2 * dim * Math.random();
      let output = new Array(dim).fill(0);
      for (let i = 0; i < dim; i++) {
        if (x < 2 * i + 1) {
          output[i] = 1;
          return output;
        } else if (x < 2 * i + 2) {
          output[i] = -1;
          return output;
        }
      }
      throw new Error("Invalid dimension");
    }
    // (function animate_random_walk_2d(num_steps: number) {
    //   let canvas = prepare_canvas(300, 300, "scene-container");

    //   // Get the context for drawing
    //   const ctx = canvas.getContext("2d");
    //   if (!ctx) {
    //     throw new Error("Failed to get 2D context");
    //   }

    //   let scene = new Scene(canvas);
    //   scene.set_frame_lims([-30, 30], [-30, 30]);

    //   let [x, y] = [0, 0];
    //   let [cx, cy] = scene.v2c([x, y]);
    //   ctx.beginPath();
    //   ctx.moveTo(cx, cy);

    //   // TODO Turn this into the behavior of TwoDimRandomWalk
    //   let dx, dy;
    //   for (let i = 0; i < num_steps; i++) {
    //     [dx, dy] = pick_random_step(2) as Vec2D;
    //     x += dx;
    //     y += dy;
    //     [cx, cy] = scene.v2c([x, y]);
    //     console.log(cx, cy);
    //     ctx.lineTo(cx, cy);
    //     ctx.stroke();
    //   }
    // })(100);

    class Histogram extends MObject {
      hist: Record<number, number> = {};
      fill_color: string = "black";
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
          new Rectangle(rect_center, rect_width, rect_height).draw(
            canvas,
            scene,
          );
        }
      }
    }

    // Makes a graph over time of how many random walks have not returned to the origin.
    (async function graph_random_walk_2d(num_walks: number, num_steps: number) {
      let canvas = prepare_canvas(300, 300, "scene-container");

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      let scene = new Scene(canvas);
      let histogram = new Histogram();
      histogram.set_count_limits(0, num_walks);
      histogram.set_bin_limits(0, 100);
      scene.add("histogram", histogram);

      // Set up the simulation
      let points: Vec3D[] = [];
      for (let i = 0; i < num_walks; i++) {
        points.push([0, 0, 0]);
      }

      let x: number, y: number, z: number;
      let dx: number, dy: number, dz: number;
      let dist: number;
      let hist_data: Record<number, number> = {};

      // Simulate the random walks
      for (let step = 0; step < num_steps; step++) {
        let hist_data = {};

        // Do one step and record histogram of distances
        for (let i = 0; i < num_walks; i++) {
          [x, y, z] = points[i];
          // Continue if the point is at the origin and we're past the first step
          if (x == 0 && y == 0 && z == 0 && step > 0) {
            hist_data[0] = hist_data[0] ? hist_data[0] + 1 : 1;
          } else {
            [dx, dy, dz] = pick_random_step(3) as Vec3D;
            points[i] = [x + dx, y + dy, z + dz];
            dist = Math.abs(x + dx) + Math.abs(y + dy) + Math.abs(z + dz);
            hist_data[dist] = hist_data[dist] ? hist_data[dist] + 1 : 1;
          }
        }

        // Plot the histogram of distances
        (scene.get_mobj("histogram") as Histogram).set_hist(hist_data);
        scene.draw();
        await delay(10);
      }
    })(50000, 1000);
  });
})();
