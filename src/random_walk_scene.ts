import {
  MObject,
  Scene,
  prepare_canvas,
  delay,
  gaussianRandom,
} from "./lib/base/base.js";
import { HeatMap } from "./lib/heatmap.js";
import { Histogram } from "./lib/stats.js";
import { Button, Slider } from "./lib/interactive.js";
import {
  Dot,
  Line,
  Arrow,
  TwoHeadedArrow,
  Rectangle,
  LineSequence,
} from "./lib/base/geometry.js";
import { Vec2D } from "./lib/base/vec2.js";
import { BezierSpline } from "./lib/bezier.js";
import { ParametricFunction } from "./lib/bezier.js";
import { rot, rot_z, Vec3D } from "./lib/three_d/matvec.js";
import {
  Dot3D,
  Line3D,
  LineSequence3D,
  TwoHeadedArrow3D,
  ParametrizedCurve3D,
} from "./lib/three_d/mobjects.js";
import { ThreeDScene } from "./lib/three_d/scene.js";
import { Arcball } from "./lib/three_d/arcball.js";
import { LaTeXMObject, LatexCache } from "./lib/base/latex.js";
import { rot90 } from "numpy-ts";

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

class HeatMapScene extends Scene {
  imageData: ImageData; // Target for heatmap data
  constructor(canvas: HTMLCanvasElement, imageData: ImageData) {
    super(canvas);
    this.imageData = imageData;
  }
  _draw() {
    // Draw the mobjects
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (mobj instanceof HeatMap) {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context");
        }
        mobj._draw(ctx, this, this.imageData);
      } else {
        mobj.draw(this.canvas, this);
      }
    });
  }
}

(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Simplest visualization of a 2D random walk
    // TODO: Stop upon reaching the origin, and then start over.
    (async function two_dim_random_walk_basic(
      width: number,
      height: number,
      num_points: number,
      delay_time: number = 25,
      trail_length: number = 10,
    ) {
      let canvas = prepare_canvas(width, height, "2d-random-walk");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-20, 20];
      let [ymin, ymax] = [-20, 20];
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
        new TwoHeadedArrow([0, ymin], [0, ymax]).set_stroke_width(0.02),
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

      // Do simulation
      async function do_simulation(): Promise<boolean> {
        let points: Vec2D[] = [];
        for (let i = 0; i < num_points; i++) {
          points.push([0, 0]);
        }
        let x: number, y: number;
        let dx: number, dy: number;
        let p: Dot;
        let line: LineSequence;

        // Add the path line sequence
        for (let i = 0; i < num_points; i++) {
          let [x, y] = points[i];
          let line = new LineSequence([[x, y]]);
          line.set_stroke_color("red");
          line.set_alpha(0.3);
          line.set_stroke_width(0.1);
          scene.add(`line${i}`, line);
        }
        // Add the points
        for (let i = 0; i < num_points; i++) {
          let [x, y] = points[i];
          let p = new Dot([x, y], 0.3);
          p.set_color("blue");
          scene.add(`point${i}`, p);
        }
        let step_number = 0;

        while (true) {
          if (playing) {
            // Draw
            scene.draw();
            let done = step_number > 0;
            for (let i = 0; i < num_points; i++) {
              let [x, y] = points[i];
              if (!(x == 0 && y == 0 && step_number > 0)) {
                done = false;
                // Generate a random step
                [dx, dy] = pick_random_step(2) as Vec2D;
                [x, y] = [x + dx, y + dy];
                points[i] = [x, y];

                // Extend the line sequence, removing old points if necessary
                let line = scene.get_mobj(`line${i}`) as LineSequence;
                line.add_point([x, y]);
                if (line.points.length > trail_length) {
                  line.remove_point(0);
                }

                // Move the endpoint
                let p = scene.get_mobj(`point${i}`) as Dot;
                p.move_to([x, y]);

                if (x == 0 && y == 0) {
                  scene.remove(`point${i}`);
                  scene.remove(`line${i}`);
                }
              }
            }
            step_number += 1;
            if (done) {
              await delay(1000);
              // for (let i = 0; i < num_points; i++) {
              //   scene.remove(`line${i}`);
              // }
              // scene.remove("line");
              return true;
            }
          }
          await delay(delay_time);
        }
      }

      while (true) {
        await do_simulation();
      }
    })(300, 300, 50);

    // Simplest visualization of a 1D random walk
    (async function one_dim_random_walk_basic(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "1d-random-walk");
      let scene = new Scene(canvas);

      let [xmin, xmax] = [-10, 10];
      let [ymin, ymax] = [-10, 10];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Add number line with ticks
      // TODO Add numbers below ticks
      let tick_size = 0.2;
      scene.add(
        "x-axis",
        new TwoHeadedArrow([xmin, 0], [xmax, 0]).set_stroke_width(0.02),
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

      // Do simulation
      const max_path_length = 10;
      async function do_simulation(): Promise<boolean> {
        let x = 0;
        let dx: number;

        // Add the path current point
        let p = new Dot([x, 0], 0.3);
        p.set_color("blue");
        scene.add("point", p);

        // Add the path line sequence
        let line = new LineSequence([[x, 0]]);
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

            if (line.points.length > max_path_length) {
              line.remove_point(0);
            }

            // Move the endpoint
            p = scene.get_mobj("point") as Dot;
            p.move_to([x, 0]);

            // Draw
            scene.draw();

            if (x == 0) {
              await delay(500);
              scene.remove("line");
              scene.remove("dot");
              return true;
            }
          }
          await delay(20);
        }
      }

      while (true) {
        await do_simulation();
      }
    })(300, 300);

    // Simplest visualization of a 2D random walk
    // TODO: Stop upon reaching the origin, and then start over.
    (async function three_dim_random_walk_basic(
      width: number,
      height: number,
      num_points: number,
      delay_time: number = 25,
      trail_length: number = 10,
    ) {
      const name = "3d-random-walk";
      let canvas = prepare_canvas(width, height, name);
      let [xmin, xmax] = [-30, 30];
      let [ymin, ymax] = [-30, 30];
      let [zmin, zmax] = [-30, 30];
      let zoom_ratio = 1.0;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");

      // Set the camera position and rotate
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
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
      arcball.set_mode("Translate");
      arcball.add();

      // Make a pause button
      let playing = false;
      let pauseButton = Button(
        document.getElementById(name + "-pause-button") as HTMLElement,
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

      // Do simulation
      async function do_simulation(): Promise<boolean> {
        let points: Vec3D[] = [];
        for (let i = 0; i < num_points; i++) {
          points.push([0, 0, 0]);
        }
        let x: number, y: number, z: number;
        let dx: number, dy: number, dz: number;
        let p: Dot3D;
        let line: LineSequence3D;

        // Add the path line sequence
        for (let i = 0; i < num_points; i++) {
          let [x, y, z] = points[i];
          let line = new LineSequence3D([[x, y, z]]);
          line.set_stroke_color("red");
          line.set_alpha(0.3);
          line.set_stroke_width(0.1);
          scene.add(`line${i}`, line);
        }
        // Add the points
        for (let i = 0; i < num_points; i++) {
          let [x, y, z] = points[i];
          let p = new Dot3D([x, y, z], 0.3);
          p.set_color("blue");
          scene.add(`point${i}`, p);
        }
        let step_number = 0;

        while (true) {
          if (playing) {
            // Draw
            scene.draw();
            let done = step_number > 0;
            for (let i = 0; i < num_points; i++) {
              let [x, y, z] = points[i];
              if (!(x == 0 && y == 0 && z == 0 && step_number > 0)) {
                done = false;
                // Generate a random step
                [dx, dy, dz] = pick_random_step(3) as Vec3D;
                [x, y, z] = [x + dx, y + dy, z + dz];
                points[i] = [x, y, z];

                // Extend the line sequence, removing old points if necessary
                let line = scene.get_mobj(`line${i}`) as LineSequence3D;
                line.add_point([x, y, z]);
                if (line.points.length > trail_length) {
                  line.remove_point(0);
                }

                // Move the endpoint
                let p = scene.get_mobj(`point${i}`) as Dot3D;
                p.move_to([x, y, z]);

                if (x == 0 && y == 0 && z == 0) {
                  scene.remove(`point${i}`);
                  scene.remove(`line${i}`);
                }
              }
            }
            step_number += 1;

            // Rotate the camera angle and set the camera position
            scene.camera.rot_pos_and_view_z(Math.PI / 1000);
            if (done) {
              await delay(1000);
              return true;
            }
          }
          await delay(delay_time);
        }
      }

      while (true) {
        await do_simulation();
      }
    })(300, 300, 50);

    // Static visualization of the coefficients of the generating function $F(x, t)$
    // (async function one_dim_random_walk_gen_fn_coefficients(
    //   width: number,
    //   height: number,
    // ) {
    //   const scene_name = "one-dim-random-walk-gen-fn-coefficients";
    //   let canvas = prepare_canvas(width, height, scene_name);
    //   let scene = new Scene(canvas);
    //   let num_x_steps = 3;
    //   let num_t_steps = 3;

    //   let xmin = -(num_x_steps + 0.5);
    //   let xmax = num_x_steps + 0.5;
    //   let ymin = -1;
    //   let ymax = num_t_steps + 0.5;

    //   scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

    //   // Draw the grid lines
    //   for (let j = 0; j <= num_t_steps; j++) {
    //     let line = new Line([xmin, j - 0.5], [xmax, j - 0.5])
    //       .set_stroke_width(0.05)
    //       .set_stroke_color("gray");
    //     scene.add(`horizontal_${j}`, line);
    //   }
    //   for (let i = -num_x_steps; i <= num_x_steps; i++) {
    //     let line = new Line([i - 0.5, ymin + 0.5], [i - 0.5, ymax])
    //       .set_stroke_width(0.05)
    //       .set_stroke_color("gray");
    //     scene.add(`line_vertical_${i}`, line);
    //   }

    //   // Add the critical strip
    //   let strip = new Rectangle([0, 0.5 * num_t_steps], 1, num_t_steps + 1);
    //   strip.set_color("red");
    //   strip.set_alpha(0.3);
    //   scene.add("strip", strip);

    //   // Calculate the coefficients x^at^b for -num_x_steps <= a <= num_x_steps and
    //   // 0 <= b <= num_t_steps, by recursion.
    //   let rows: Array<Array<number>> = [];
    //   for (let b = 0; b <= num_t_steps; b++) {
    //     let row: Array<number> = [];
    //     if (b == 0) {
    //       for (let i = 0; i < num_x_steps; i++) {
    //         row.push(0);
    //       }
    //       row.push(1);
    //       for (let i = 0; i < num_x_steps; i++) {
    //         row.push(0);
    //       }
    //     } else {
    //       let last_row: Array<number> = rows[b - 1];
    //       row.push(last_row[1]);
    //       for (let a = 1; a <= 2 * num_x_steps - 1; a++) {
    //         row.push(last_row[a - 1] + last_row[a + 1]);
    //       }
    //       row.push(last_row[2 * num_x_steps - 1]);
    //     }
    //     rows.push(row);
    //   }

    //   // Make LaTeX strings for the coefficients
    //   let cache = new LatexCache();
    //   let val;
    //   for (let b = 0; b <= num_t_steps; b++) {
    //     for (let a = 0; a <= 2 * num_x_steps; a++) {
    //       val = rows[b][a];
    //       // let mobj = new LaTeXMObject(
    //       //   `${val}`,
    //       //   [a - num_x_steps - 0.25, b + 0.25],
    //       //   cache,
    //       // );
    //       // mobj.set_fontSize(12);
    //       // scene.add(`c_${a}_${b}`, mobj);
    //     }
    //   }

    //   scene.draw();
    // })(400, 300);

    // Makes a histogram over time of how many random walks have not returned to the origin.
    (async function graph_random_walk(num_walks: number, num_steps: number) {
      let canvas1 = prepare_canvas(250, 250, "histogram-dim-one");
      let canvas2 = prepare_canvas(250, 250, "histogram-dim-two");
      let canvas3 = prepare_canvas(250, 250, "histogram-dim-three");
      let canvas4 = prepare_canvas(250, 250, "histogram-dim-four");

      // Set up histogram scenes
      let scene1 = new Scene(canvas1);
      let histogram1 = new Histogram();
      histogram1.set_count_limits(0, num_walks);
      histogram1.set_bin_limits(0, 100);
      scene1.add("histogram", histogram1);

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

      let scene4 = new Scene(canvas4);
      let histogram4 = new Histogram();
      histogram4.set_count_limits(0, num_walks);
      histogram4.set_bin_limits(0, 100);
      scene4.add("histogram", histogram4);

      // Declare variables
      let step: number = 0;
      let points1: [number][] = [];
      let points2: Vec2D[] = [];
      let points3: Vec3D[] = [];
      let points4: [number, number, number, number][] = [];
      let hist_data1: Record<number, number> = {};
      let hist_data2: Record<number, number> = {};
      let hist_data3: Record<number, number> = {};
      let hist_data4: Record<number, number> = {};

      // Function to reset the simulation
      function reset_simulation() {
        // Set up the simulations
        points1 = [];
        for (let i = 0; i < num_walks; i++) {
          points1.push([0]);
        }

        points2 = [];
        for (let i = 0; i < num_walks; i++) {
          points2.push([0, 0]);
        }

        points3 = [];
        for (let i = 0; i < num_walks; i++) {
          points3.push([0, 0, 0]);
        }

        points4 = [];
        for (let i = 0; i < num_walks; i++) {
          points4.push([0, 0, 0, 0]);
        }

        hist_data1 = {};
        hist_data2 = {};
        hist_data3 = {};
        hist_data4 = {};

        step = 0;
        (scene1.get_mobj("histogram") as Histogram).set_hist(hist_data1);
        (scene2.get_mobj("histogram") as Histogram).set_hist(hist_data2);
        (scene3.get_mobj("histogram") as Histogram).set_hist(hist_data3);
        (scene4.get_mobj("histogram") as Histogram).set_hist(hist_data4);
        scene1.draw();
        scene2.draw();
        scene3.draw();
        scene4.draw();
      }

      reset_simulation();

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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";

      // Make a reset button
      let reset = false;
      let resetButton = Button(
        document.getElementById("random-walk-reset-button") as HTMLElement,
        function () {
          reset = true;
        },
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";

      // Display button which shows the simulation time
      let displayButton = Button(
        document.getElementById("random-walk-display-button") as HTMLElement,
        function () {},
      );
      displayButton.textContent = "Simulation time: 0";
      displayButton.style.padding = "15px";

      // Display buttons which shows the fraction of walks with distance 0
      let counterButton1 = Button(
        document.getElementById("random-walk-count-button-1") as HTMLElement,
        function () {},
      );
      counterButton1.textContent = "Fraction returned to origin: 0";
      counterButton1.style.padding = "15px";
      let counterButton2 = Button(
        document.getElementById("random-walk-count-button-2") as HTMLElement,
        function () {},
      );
      counterButton2.textContent = "Fraction returned to origin: 0";
      counterButton2.style.padding = "15px";
      let counterButton3 = Button(
        document.getElementById("random-walk-count-button-3") as HTMLElement,
        function () {},
      );
      counterButton3.textContent = "Fraction returned to origin: 0";
      counterButton3.style.padding = "15px";
      let counterButton4 = Button(
        document.getElementById("random-walk-count-button-4") as HTMLElement,
        function () {},
      );
      counterButton4.textContent = "Fraction returned to origin: 0";
      counterButton4.style.padding = "15px";

      // Set up some variables
      let x: number, y: number, z: number, w: number;
      let dx: number, dy: number, dz: number, dw: number;
      let dist: number;

      while (step < num_steps) {
        if (reset) {
          reset_simulation();
          reset = false;
        } else if (playing) {
          hist_data1 = { 0: num_walks };
          hist_data2 = { 0: num_walks };
          hist_data3 = { 0: num_walks };
          hist_data4 = { 0: num_walks };

          // Do one step and record histogram of distances
          for (let i = 0; i < num_walks; i++) {
            [x] = points1[i];
            // Continue if the point is at the origin and we're past the first step
            if (x == 0 && step > 0) {
              continue;
            } else {
              [dx] = pick_random_step(1) as [number];
              points1[i] = [x + dx];
              dist = Math.abs(x + dx);
              hist_data1[dist] = hist_data1[dist] ? hist_data1[dist] + 1 : 1;
              hist_data1[0] = hist_data1[0] - 1;
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
            [x, y, z, w] = points4[i];
            // Continue if the point is at the origin and we're past the first step
            if (x == 0 && y == 0 && z == 0 && w == 0 && step > 0) {
              continue;
            } else {
              [dx, dy, dz, dw] = pick_random_step(4) as [
                number,
                number,
                number,
                number,
              ];
              points4[i] = [x + dx, y + dy, z + dz, w + dw];
              dist =
                Math.abs(x + dx) +
                Math.abs(y + dy) +
                Math.abs(z + dz) +
                Math.abs(w + dw);
              hist_data4[dist] = hist_data4[dist] ? hist_data4[dist] + 1 : 1;
              hist_data4[0] = hist_data4[0] - 1;
            }
          }

          // Note how many have distance 0
          counterButton1.textContent = `Fraction with distance 0: ${hist_data1[0] / num_walks}`;
          counterButton2.textContent = `Fraction with distance 0: ${hist_data2[0] / num_walks}`;
          counterButton3.textContent = `Fraction with distance 0: ${hist_data3[0] / num_walks}`;
          counterButton4.textContent = `Fraction with distance 0: ${hist_data4[0] / num_walks}`;

          // Plot the histogram of distances at even timesteps
          if (step % 2 === 0) {
            (scene1.get_mobj("histogram") as Histogram).set_hist(hist_data1);
            (scene2.get_mobj("histogram") as Histogram).set_hist(hist_data2);
            (scene3.get_mobj("histogram") as Histogram).set_hist(hist_data3);
            (scene4.get_mobj("histogram") as Histogram).set_hist(hist_data4);
            scene1.draw();
            scene2.draw();
            scene3.draw();
            scene4.draw();
          }
          step += 1;
        }
        displayButton.textContent = `Simulation time: ${step}`;
        await delay(0.1);
      }
    })(10000, Infinity);

    // A static visualization of the fact that $A(t) = 1 + B(t) + B(t)^2 + B(t)^3 + ...$,
    // in combinatorial form
    async function convolution_visualization(
      width: number,
      height: number,
      subpath_lengths: number[],
    ) {
      const scene_name = "convolution-visualization";

      let canvas = prepare_canvas(
        width,
        height,
        scene_name + `-${subpath_lengths.length}`,
      );
      let scene = new Scene(canvas);

      let type_b_lengths = subpath_lengths;
      let colors = ["red", "green", "blue", "orange"];
      let total_length = type_b_lengths.reduce((acc, val) => acc + val, 0);

      scene.set_frame_lims(
        [-1, 2 * total_length],
        [-total_length, total_length],
      );

      // Add axis for time and x-position
      let t_axis = new Arrow([-1, 0], [2 * total_length, 0]).set_stroke_width(
        0.04,
      );
      scene.add("t-axis", t_axis);
      let x_axis = new TwoHeadedArrow(
        [0, -total_length],
        [0, total_length],
      ).set_stroke_width(0.04);
      scene.add("x-axis", x_axis);

      // Generates a random sequence of +1/-1 with length 2n and of type A, meaning
      // that the sum is 0.
      function gen_type_a(n: number): number[] {
        let seq: number[] = [];
        for (let i = 0; i < 2 * n; i++) {
          seq.push(1);
        }
        let k = n;
        while (k > 0) {
          let i = Math.floor(Math.random() * 2 * n);
          if (seq[i] == 1) {
            seq[i] = -1;
            k -= 1;
          }
        }
        return seq;
      }

      // Generates a random sequence of +1/-1 with length 2n and of type B, meaning
      // that the sum is 0 and no leading subsequence has sum 0.
      function gen_type_b(n: number): number[] {
        if (n == 1) {
          return [1, -1];
        }

        // Generate a path of length 2n-2 whose leading subsequence
        // sums are all nonnegative, then pad it.
        let seq = gen_type_a(n - 1);

        // Break it into pieces of type B.
        let type_b_seqs: number[][] = [];
        let subseq: number[] = [];
        let sum = 0;
        for (let i = 0; i < 2 * n - 2; i++) {
          subseq.push(seq[i]);
          sum += seq[i];
          if (sum == 0) {
            type_b_seqs.push(subseq);
            subseq = [];
            sum = 0;
          }
        }

        // Flip the polarity of any subsequences which start off negative
        for (let i = 0; i < type_b_seqs.length; i++) {
          if (type_b_seqs[i][0] == -1) {
            type_b_seqs[i] = type_b_seqs[i].map((x) => -x);
          }
        }
        // Join them back together, with padding
        let result: number[] = [1];
        result = result.concat(
          type_b_seqs.reduce((acc, curr) => acc.concat(curr), []),
        );
        result.push(-1);
        return result;
      }

      // Generate a random type-B path and draw it.
      while (true) {
        let current_point: Vec2D = [0, 0];
        let length: number;
        for (let j = 0; j < type_b_lengths.length; j++) {
          // Generate a random type-B path, flip its polarity with probability 0.5 and add it to the scene
          length = type_b_lengths[j];
          let type_b_path = gen_type_b(length);
          if (Math.random() < 0.5) {
            type_b_path = type_b_path.map((x) => -x);
          }
          let line = new LineSequence([[current_point[0], current_point[1]]])
            .set_stroke_color(colors[j % colors.length])
            .set_stroke_width(0.1);
          for (let i = 0; i < type_b_path.length; i++) {
            current_point[0] += 1;
            current_point[1] += type_b_path[i];
            line.add_point([current_point[0], current_point[1]]);
          }
          scene.add(`type-b-path-${j}`, line);
        }

        // Draw it
        scene.draw();
        await delay(1000);
        // Remove and starting again
        for (let j = 0; j < type_b_lengths.length; j++) {
          scene.remove(`type-b-path-${j}`);
        }
      }
    }
    convolution_visualization(250, 250, [20]);
    convolution_visualization(250, 250, [8, 12]);
    convolution_visualization(250, 250, [4, 9, 7]);
    convolution_visualization(250, 250, [5, 3, 8, 4]);

    // Visualization of the function to be integrated when D=1
    (function one_dim_integral_graph(width: number, height: number) {
      const name = "1d-function-graph";
      const canvas = prepare_canvas(width, height, name);
      const scene = new Scene(canvas);
      let xmin = -Math.PI;
      let xmax = Math.PI;
      let ymin = -0.2;
      let ymax = 10;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Add axes with ticks and grid lines
      let tick_size = 0.1;
      let x_axis = new TwoHeadedArrow([xmin - 1, 0], [xmax + 1, 0]);
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
        new TwoHeadedArrow([0, ymin - 1], [0, ymax + 1]).set_stroke_width(0.02),
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

      const graph_1 = new ParametricFunction(
        (t) => {
          return [t, 1 / (1 - Math.cos(t))];
        },
        -Math.PI,
        -0.05,
        100,
      ).set_stroke_width(0.03);
      graph_1.set_mode("jagged");
      const graph_2 = new ParametricFunction(
        (t) => {
          return [t, 1 / (1 - Math.cos(t))];
        },
        0.05,
        Math.PI,
        100,
      ).set_stroke_width(0.03);
      graph_1.set_mode("jagged");
      scene.add("graph_1", graph_1);
      scene.add("graph_2", graph_2);
      scene.draw();
    })(300, 300);

    // Visualization of the function to be integrated when D=2
    (function two_dim_integral_graph(width: number, height: number) {
      const name = "2d-function-heatmap";
      const canvas = prepare_canvas(width, height, name);
      // Create a new HeatMapScene with the canvas and imageData
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      const scene = new HeatMapScene(canvas, imageData);

      // Set the frame limits
      let xmin = -Math.PI;
      let xmax = Math.PI;
      let ymin = -Math.PI;
      let ymax = Math.PI;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Add the function value heatmap
      let valArray = Array.from({ length: width }, (_, x) =>
        Array.from({ length: height }, (_, y) => {
          const xVal = xmin + ((xmax - xmin) * x) / width;
          const yVal = ymin + ((ymax - ymin) * y) / height;
          if (xVal == 0 && yVal == 0) {
            return 100;
          } else {
            return Math.log(1 / (1 - (Math.cos(xVal) + Math.cos(yVal)) / 2));
          }
        }),
      );
      let heatmap = new HeatMap(width, height, 0, 10000, valArray.flat());
      scene.add("heatmap", heatmap);

      // Add axes with ticks and grid lines
      let x_axis = new TwoHeadedArrow([xmin - 0.5, 0], [xmax + 0.5, 0]);
      x_axis.set_stroke_width(0.02);
      scene.add("x-axis", x_axis);
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        let xline = new Line([x, ymin], [x, ymax]).set_stroke_width(0.01);
        xline.set_alpha(0.3);
        scene.add(`x-line-(${x})`, xline);
      }

      scene.add(
        "y-axis",
        new TwoHeadedArrow([0, ymin - 0.5], [0, ymax + 0.5]).set_stroke_width(
          0.02,
        ),
      );
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        let yline = new Line([xmin, y], [xmax, y]).set_stroke_width(0.01);
        yline.set_alpha(0.3);
        scene.add(`y-line-(${y})`, yline);
      }
      scene.draw();
    })(300, 300);
  });
})();
