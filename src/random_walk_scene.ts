import {
  MObject,
  Dot,
  Line,
  Vec2D,
  Scene,
  prepare_canvas,
} from "./lib/base.js";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    function pick_random_step(dim: number): number[] {
      const x = 2 * dim * Math.random();
      let output = new Array(dim).fill(0);
      for (let i = 0; i < dim; i++) {
        if (x < 2 * i) {
          output[i] = 1;
          return output;
        } else if (x < 2 * i + 1) {
          output[i] = -1;
          return output;
        }
      }
      throw new Error("Invalid dimension");
    }
    (function animate_random_walk_2d(num_steps: number) {
      let canvas = prepare_canvas(300, 300, "scene-container");

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      let scene = new Scene(canvas);
      scene.set_frame_lims([-30, 30], [-30, 30]);

      let [x, y] = [0, 0];
      let [cx, cy] = scene.v2c(x, y);
      ctx.beginPath();
      ctx.moveTo(cx, cy);

      // TODO Turn this into the behavior of TwoDimRandomWalk
      let dx, dy;
      for (let i = 0; i < num_steps; i++) {
        [dx, dy] = pick_random_step(2) as Vec2D;
        x += dx;
        y += dy;
        [cx, cy] = scene.v2c(x, y);
        console.log(cx, cy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
    })(100);

    // Makes a graph over time of how many random walks have not returned to the origin.
    (function graph_random_walk_2d(num_walks: number, num_steps: number) {
      let canvas = prepare_canvas(300, 300, "scene-container");

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      let scene = new Scene(canvas);
    })(100, 100);
  });
})();
