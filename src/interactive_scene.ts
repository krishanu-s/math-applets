import { prepare_canvas, delay, Scene } from "./lib/base";
import {
  Vec2D,
  vec2_sub,
  vec2_scale,
  vec2_sum_list,
  vec2_sum,
  vec2_norm,
  vec2_normalize,
  DraggableDot,
  Line,
} from "./lib/base_geom.js";
import { BezierSpline } from "./lib/bezier.js";
import { normalize, get_column, matmul_vec, rot } from "./lib/matvec";
import {
  Vec3D,
  vec3_sum,
  vec3_sum_list,
  vec3_scale,
  ThreeDScene,
  ThreeDMObject,
  Cube,
  Dot3D,
  Line3D,
  Arrow3D,
  TwoHeadedArrow3D,
  ParametrizedCurve3D,
} from "./lib/three_d.js";
import { Slider, Button, PauseButton } from "./lib/interactive.js";
import { Arcball } from "./lib/arcball.js";
import { pick_random_step } from "./random_walk_scene.js";
import { LaTeXMObject, LatexCache } from "./lib/latex.js";

(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Two points with a connecting line, where the points can be dragged around.
    (function draggable_dots(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "draggable-dot");
      let scene = new Scene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);

      let dot_1 = new DraggableDot([1, 0], 0.3);

      let dot_2 = new DraggableDot([-1, 0], 0.3);

      let line = new Line([1, 0], [-1, 0]);
      dot_1.add_callback(() => {
        line.move_start(dot_1.get_center());
      });
      dot_2.add_callback(() => {
        line.move_end(dot_2.get_center());
      });

      scene.add("line", line);
      scene.add("p1", dot_1);
      scene.add("p2", dot_2);

      scene.draw();
    })(300, 300);

    // A Bezier curve defined by a sequence of control points, where the points can be dragged around.
    (function draggable_dots_bezier(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "draggable-dot-bezier");
      let scene = new Scene(canvas);
      let xmin = -5;
      let xmax = 5;
      let ymin = -5;
      let ymax = 5;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      // Make the scene
      function make_scene(n: number) {
        scene.clear();
        let dots: DraggableDot[] = [];
        for (let i = 0; i < n; i++) {
          let dot = new DraggableDot(
            [xmin + ((xmax - xmin) * (i + 0.5)) / n, 0],
            0.5 / Math.sqrt(n),
          );
          dot.touch_tolerance = 2.0 + n / 10;
          dots.push(dot);
          scene.add(`p${i}`, dot);
        }

        // Define the Bezier curve and link it to the dots
        let curve = new BezierSpline(n - 1, {
          stroke_width: 0.2 / Math.sqrt(n),
        });
        curve.set_anchors(dots.map((dot) => dot.get_center()));
        for (let i = 0; i < n; i++) {
          dots[i].add_callback(() => {
            curve.set_anchor(i, dots[i].get_center());
          });
        }

        // TODO Set the curve to draw the handles as well

        // Add to the scene
        // TODO Draw handles
        scene.add("curve", curve);
        for (let i = 0; i < n; i++) {
          scene.add(`p${i}`, dots[i]);
        }

        scene.draw();
      }

      // Make a slider to change the number of points
      let n_slider = Slider(
        document.getElementById(
          "draggable-dot-bezier-num-slider",
        ) as HTMLElement,
        function (n: number) {
          make_scene(n);
        },
        {
          name: "Number of points",
          initial_value: "5.0",
          min: 3,
          max: 20,
          step: 1.0,
        },
      );
      n_slider.width = 200;

      make_scene(5);
    })(300, 300);

    (function test_latex(width: number, height: number) {
      const canvas_name = "latex-scene";
      const canvas = prepare_canvas(width, height, canvas_name);

      let scene = new Scene(canvas);
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      let cache = new LatexCache();

      for (let i = 1; i < 10; i++) {
        let tex = new LaTeXMObject(
          `\\frac{${i}}{${i + 1}}`,
          [xmin + i, 0],
          cache,
        );
        scene.add(`latex_${i}`, tex);
      }

      let ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D context");
      scene.draw();

      // Add a slider which controls the zoom
      let zoom_slider = Slider(
        document.getElementById(canvas_name + "-slider-1") as HTMLElement,
        function (zr: number) {
          scene.set_zoom(zr);
          scene.draw();
        },
        {
          name: "Zoom ratio",
          initial_value: "1.0",
          min: 0.6,
          max: 5,
          step: 0.05,
        },
      );
      zoom_slider.width = 200;
    })(300, 300);
  });
})();
