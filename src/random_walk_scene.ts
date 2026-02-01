import {
  MObject,
  Scene,
  prepare_canvas,
  delay,
  gaussianRandom,
} from "./lib/base.js";
import { Dot, Line, Vec2D, Rectangle } from "./lib/base_geom.js";
import { rot } from "./lib/matvec.js";
import {
  Vec3D,
  ThreeDScene,
  Dot3D,
  Line3D,
  TwoHeadedArrow3D,
} from "./lib/three_d.js";
import { Arcball } from "./lib/arcball.js";

export function pick_random_step(dim: number): number[] {
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

(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // TODO Make space for the axes.
    class Histogram extends MObject {
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

    // Makes a graph over time of how many random walks have not returned to the origin.
    (async function graph_random_walk(num_walks: number, num_steps: number) {
      let canvas2 = prepare_canvas(300, 300, "histogram-dim-two");
      let canvas3 = prepare_canvas(300, 300, "histogram-dim-three");

      let scene2 = new Scene(canvas2);
      let histogram2 = new Histogram();
      histogram2.set_count_limits(0, num_walks);
      histogram2.set_bin_limits(0, 100);
      scene2.add("histogram", histogram2);

      let scene3 = new Scene(canvas3);
      let histogram3 = new Histogram();
      histogram3.set_count_limits(0, num_walks);
      histogram3.set_bin_limits(0, 100);
      scene3.add("histogram", histogram3);

      // Set up the simulations
      let points2: Vec2D[] = [];
      for (let i = 0; i < num_walks; i++) {
        points2.push([0, 0]);
      }

      let points3: Vec3D[] = [];
      for (let i = 0; i < num_walks; i++) {
        points3.push([0, 0, 0]);
      }

      let x: number, y: number, z: number;
      let dx: number, dy: number, dz: number;
      let dist: number;
      let hist_data2: Record<number, number> = {};
      let hist_data3: Record<number, number> = {};

      // Simulate the random walks simultaneously
      for (let step = 0; step < num_steps; step++) {
        hist_data2 = { 0: num_walks };
        hist_data3 = { 0: num_walks };

        // Do one step and record histogram of distances
        for (let i = 0; i < num_walks; i++) {
          [x, y, z] = points3[i];
          // Continue if the point is at the origin and we're past the first step
          if (x == 0 && y == 0 && z == 0 && step > 0) {
            continue;
          } else {
            [dx, dy, dz] = pick_random_step(3) as Vec3D;
            points3[i] = [x + dx, y + dy, z + dz];
            dist = Math.abs(x + dx) + Math.abs(y + dy) + Math.abs(z + dz);
            hist_data3[dist] = hist_data3[dist] ? hist_data3[dist] + 1 : 1;
            hist_data3[0] = hist_data3[0] - 1;
          }
        }
        for (let i = 0; i < num_walks; i++) {
          [x, y] = points2[i];
          // Continue if the point is at the origin and we're past the first step
          if (x == 0 && y == 0 && step > 0) {
            continue;
          } else {
            [dx, dy] = pick_random_step(2) as Vec2D;
            points2[i] = [x + dx, y + dy];
            dist = Math.abs(x + dx) + Math.abs(y + dy);
            hist_data2[dist] = hist_data2[dist] ? hist_data2[dist] + 1 : 1;
            hist_data2[0] = hist_data2[0] - 1;
          }
        }

        // Plot the histogram of distances at even timesteps
        if (step % 2 === 0) {
          (scene2.get_mobj("histogram") as Histogram).set_hist(hist_data2);
          scene2.draw();
          (scene3.get_mobj("histogram") as Histogram).set_hist(hist_data3);
          scene3.draw();
          await delay(1);
        }
      }
    })(50000, 1000);

    // Brownian motion in 2D
    (async function brownian_motion_2d() {
      let canvas = prepare_canvas(300, 300, "brownian-motion-2d");
      let ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D context");
      let scene = new Scene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);

      // Draw axes
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      ctx.strokeStyle = "red";
      ctx.globalAlpha = 1.0;
      let [x, y] = [0, 0];
      let [cx, cy] = scene.v2c([x, y]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);

      let dx: number, dy: number;
      let dt = 0.01;
      let sqrt_dt = Math.sqrt(dt);

      for (let step = 0; step < 1000; step++) {
        dx = gaussianRandom(0, sqrt_dt);
        dy = gaussianRandom(0, sqrt_dt);
        [x, y] = [x + dx, y + dy];
        [cx, cy] = scene.v2c([x, y]);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        await delay(0.1);
      }
    })();

    // Brownian motion in 3D
    (async function brownian_motion_3d() {
      let canvas = prepare_canvas(300, 300, "brownian-motion-3d");
      let ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D context");

      // Initialize 3D scene
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];
      let zoom_ratio = 1.0;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("projection");

      // Rotate the camera angle and set the camera position
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4),
      );

      // Add graph lines with ticks
      let tick_size = 0.1;
      scene.add("x-axis", new TwoHeadedArrow3D([xmin, 0, 0], [xmax, 0, 0]));
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line3D([x, 0, -tick_size], [x, 0, tick_size]),
        );
      }

      scene.add("y-axis", new TwoHeadedArrow3D([0, ymin, 0], [0, ymax, 0]));
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y})`,
          new Line3D([-tick_size, y, 0], [tick_size, y, 0]),
        );
      }

      scene.add("z-axis", new TwoHeadedArrow3D([0, 0, zmin], [0, 0, zmax]));
      for (let z = Math.floor(zmin) + 1; z <= Math.ceil(zmax) - 1; z++) {
        if (z == 0) {
          continue;
        }
        scene.add(
          `z-tick-(${z})`,
          new Line3D([0, -tick_size, z], [0, tick_size, z]),
        );
      }
      scene.draw();

      // Adding click-and-drag interactivity to the canvas
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      let [x, y, z] = [0, 0, 0];
      let p = new Dot3D([x, y, z], 0.05);
      p.set_color("red");
      scene.add("point", p);

      let dx: number, dy: number, dz: number;
      let dt = 0.01;
      let sqrt_dt = Math.sqrt(dt);

      for (let step = 0; step < 1000; step++) {
        dx = gaussianRandom(0, sqrt_dt);
        dy = gaussianRandom(0, sqrt_dt);
        dz = gaussianRandom(0, sqrt_dt);
        let line = new Line3D([x, y, z], [x + dx, y + dy, z + dz]);
        line.set_color("red");
        line.set_width(0.02);
        scene.add(`line_${step}`, line);

        [x, y, z] = [x + dx, y + dy, z + dz];
        let p = scene.get_mobj("point") as Dot3D;
        p.move_to([x, y, z]);
        scene.draw();

        await delay(0.1);
      }
    })();
  });
})();
