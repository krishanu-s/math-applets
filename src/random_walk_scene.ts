import {
  MObject,
  Scene,
  prepare_canvas,
  delay,
  gaussianRandom,
} from "./lib/base.js";
import { Histogram } from "./lib/stats.js";
import { Button, Slider } from "./lib/interactive.js";
import {
  Dot,
  Line,
  TwoHeadedArrow,
  Vec2D,
  Rectangle,
  LineSequence,
} from "./lib/base_geom.js";
import { rot, rot_z } from "./lib/matvec.js";
import {
  Vec3D,
  ThreeDScene,
  Dot3D,
  Line3D,
  LineSequence3D,
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
    // Simplest visualization of a 2D random walk
    // TODO: Stop upon reaching the origin, and then start over.
    (async function two_dim_random_walk_basic() {
      let canvas = prepare_canvas(300, 300, "2d-random-walk");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-10, 10];
      let [ymin, ymax] = [-10, 10];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Add axes with ticks and grid lines
      let tick_size = 0.1;
      let x_axis = new TwoHeadedArrow([xmin, 0], [xmax, 0]);
      x_axis.set_stroke_width(0.02);
      scene.add("x-axis", x_axis);
      scene.add(
        `x-tick-(${0})`,
        new Line([0, -2 * tick_size], [0, 2 * tick_size]).set_stroke_width(
          0.04,
        ),
      );
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line([x, -tick_size], [x, tick_size]).set_stroke_width(0.02),
        );
        let xline = new Line([x, ymin], [x, ymax]).set_stroke_width(0.01);
        xline.set_alpha(0.3);
        scene.add(`x-line-(${x})`, xline);
      }

      scene.add(
        "y-axis",
        new TwoHeadedArrow([0, ymin], [0, ymax], { stroke_width: 0.02 }),
      );
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y})`,
          new Line([-tick_size, y], [tick_size, y]).set_stroke_width(0.02),
        );
        let yline = new Line([xmin, y], [xmax, y]).set_stroke_width(0.01);
        yline.set_alpha(0.3);
        scene.add(`y-line-(${y})`, yline);
      }
      scene.draw();

      // Make a pause button
      let playing = false;
      let pauseButton = Button(
        document.getElementById("2d-random-walk-pause-button") as HTMLElement,
        function () {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Pause simulation";
      pauseButton.style.padding = "15px";

      // Do simulation
      async function do_simulation(): Promise<boolean> {
        let [x, y] = [0, 0];
        let dx: number, dy: number;

        // Add the path line sequence
        let line = new LineSequence([[x, y]], {});
        line.set_stroke_color("red");
        line.set_alpha(1);
        line.set_stroke_width(0.1);
        scene.add("line", line);

        // Add the path current point
        let p = new Dot([x, y], 0.3);
        p.set_color("blue");
        scene.add("point", p);

        while (true) {
          if (playing) {
            // Generate a random step
            [dx, dy] = pick_random_step(2) as Vec2D;
            [x, y] = [x + dx, y + dy];

            // Extend the line sequence
            line = scene.get_mobj("line") as LineSequence;
            line.add_point([x, y]);

            // Move the endpoint
            p = scene.get_mobj("point") as Dot;
            p.move_to([x, y]);

            // Draw
            scene.draw();

            if (x == 0 && y == 0) {
              await delay(1000);
              scene.remove("line");
              scene.remove("dot");
              return true;
            }
          }
          await delay(100);
        }
      }

      while (true) {
        await do_simulation();
      }
    })();

    // Simplest visualization of a 1D random walk
    // TODO
    (async function one_dim_random_walk_basic() {
      let canvas = prepare_canvas(300, 300, "1d-random-walk");
      let scene = new Scene(canvas);

      let [xmin, xmax] = [-10, 10];
      let [ymin, ymax] = [-10, 10];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Add number line with ticks
      // TODO Add numbers below ticks
      let tick_size = 0.2;
      scene.add(
        "x-axis",
        new TwoHeadedArrow([xmin, 0], [xmax, 0], { stroke_width: 0.02 }),
      );
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line([x, -tick_size], [x, tick_size]).set_stroke_width(0.02),
        );
      }

      scene.draw();

      // Make a pause button
      let playing = false;
      let pauseButton = Button(
        document.getElementById("1d-random-walk-pause-button") as HTMLElement,
        function () {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Pause simulation";
      pauseButton.style.padding = "15px";

      // Do simulation
      async function do_simulation(): Promise<boolean> {
        let x = 0;
        let dx: number;

        // Add the path current point
        let p = new Dot([x, 0], 0.3);
        p.set_color("blue");
        scene.add("point", p);

        // Add the path line sequence
        let line = new LineSequence([[x, 0]], {});
        line.set_stroke_color("red");
        line.set_alpha(1);
        line.set_stroke_width(0.1);
        scene.add("line", line);

        // TODO Add text

        while (true) {
          if (playing) {
            // Generate a random step
            [dx] = pick_random_step(1) as [number];
            x += dx;

            // Extend the line sequence
            line = scene.get_mobj("line") as LineSequence;
            line.add_point([x, 0]);

            // Move the endpoint
            p = scene.get_mobj("point") as Dot;
            p.move_to([x, 0]);

            // Draw
            scene.draw();

            if (x == 0) {
              await delay(1000);
              scene.remove("line");
              scene.remove("dot");
              return true;
            }
          }
          await delay(100);
        }
      }

      while (true) {
        await do_simulation();
      }
    })();

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

      // Make a pause button
      let playing = false;
      let pauseButton = Button(
        document.getElementById("random-walk-pause-button") as HTMLElement,
        function () {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Pause simulation";
      pauseButton.style.padding = "15px";

      let x: number, y: number, z: number;
      let dx: number, dy: number, dz: number;
      let dist: number;
      let hist_data2: Record<number, number> = {};
      let hist_data3: Record<number, number> = {};

      // Simulate the random walks simultaneously
      let step = 0;
      scene2.draw();
      scene3.draw();
      while (step < num_steps) {
        if (playing) {
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
          }
          step += 1;
        }
        await delay(1);
      }
    })(50000, 1000);

    // Brownian motion in 2D
    (async function brownian_motion_2d() {
      let canvas = prepare_canvas(300, 300, "brownian-motion-2d");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Add graph lines with ticks
      let tick_size = 0.1;
      scene.add(
        "x-axis",
        new TwoHeadedArrow([xmin, 0], [xmax, 0], { stroke_width: 0.02 }),
      );
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line([x, -tick_size], [x, tick_size]).set_stroke_width(0.02),
        );
      }

      scene.add(
        "y-axis",
        new TwoHeadedArrow([0, ymin], [0, ymax], { stroke_width: 0.02 }),
      );
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y})`,
          new Line([-tick_size, y], [tick_size, y]).set_stroke_width(0.02),
        );
      }
      scene.draw();

      let [x, y] = [0, 0];

      // Add the path current point
      let p = new Dot([x, y], 0.05);
      p.set_color("blue");
      scene.add("point", p);

      // Add the path line sequence
      let line = new LineSequence([[x, y]], {});
      line.set_stroke_color("red");
      line.set_alpha(0.5);
      line.set_stroke_width(0.01);
      scene.add("line", line);

      let dx: number, dy: number;
      let dt = 0.01;
      let sqrt_dt = Math.sqrt(dt);

      let playing = false;
      let pauseButton = Button(
        document.getElementById(
          "brownian-motion-2d-pause-button",
        ) as HTMLElement,
        function () {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

      while (true) {
        if (playing) {
          // Generate a random step
          dx = gaussianRandom(0, sqrt_dt);
          dy = gaussianRandom(0, sqrt_dt);
          [x, y] = [x + dx, y + dy];

          // Extend the line sequence
          line = scene.get_mobj("line") as LineSequence;
          line.add_point([x, y]);

          // Move the endpoint
          p = scene.get_mobj("point") as Dot;
          p.move_to([x, y]);

          // Draw
          scene.draw();
        }
        await delay(1);
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
      scene.set_view_mode("orthographic");

      // Rotate the camera angle and set the camera position
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 3);
      scene.set_camera_position([0, 0, -8]);
      scene.camera_position = rot(
        scene.camera_position,
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3,
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

      // Add the path current point
      let p = new Dot3D([x, y, z], 0.05);
      p.set_color("blue");
      scene.add("point", p);

      // Add the path line sequence
      let line = new LineSequence3D([[x, y, z]]);
      line.set_stroke_color("red");
      line.set_stroke_width(0.02);
      scene.add("line", line);

      let dx: number, dy: number, dz: number;
      let dt = 0.01;
      let sqrt_dt = Math.sqrt(dt);

      let playing = false;
      let pauseButton = Button(
        document.getElementById(
          "brownian-motion-3d-pause-button",
        ) as HTMLElement,
        function () {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

      while (true) {
        if (playing) {
          // Generate a random step
          dx = gaussianRandom(0, sqrt_dt);
          dy = gaussianRandom(0, sqrt_dt);
          dz = gaussianRandom(0, sqrt_dt);

          [x, y, z] = [x + dx, y + dy, z + dz];

          // Extend the line sequence
          line = scene.get_mobj("line") as LineSequence3D;
          line.get_point(5);
          line.add_point([x, y, z]);

          // Move the endpoint
          p = scene.get_mobj("point") as Dot3D;
          p.move_to([x, y, z]);

          // Rotate the camera angle and set the camera position
          scene.rot_z(Math.PI / 1000);
          scene.camera_position = rot_z(scene.camera_position, Math.PI / 1000);

          // Draw
          scene.draw();
        }
        await delay(10);
      }
    })();
  });
})();
