import {
  prepare_canvas,
  delay,
  Scene,
  Vec2D,
  vec2_sub,
  vec2_scale,
  vec2_sum_list,
  vec2_sum,
  vec2_norm,
  vec2_normalize,
  DraggableDot,
  Polygon,
  Line,
  LaTeXMObject,
  LatexCache,
} from "./lib/base";
import { BezierSpline } from "./lib/base/bezier.js";
import { normalize, get_column, matmul_vec, rot } from "./lib/three_d/matvec";
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
} from "./lib/three_d";
import { Slider, Button } from "./lib/interactive";
import { Arcball } from "./lib/interactive/arcball.js";
import { SceneViewTranslator } from "./lib/interactive/scene_view_translator";
import { pick_random_step } from "./random_walk_scene.js";
import {
  Axis,
  CoordinateAxes2d,
  CoordinateAxes3d,
  Integral,
} from "./lib/base/cartesian";

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
        let curve = new BezierSpline(n - 1).set_stroke_width(
          0.2 / Math.sqrt(n),
        );
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

    // A number line
    (function cartesian_1d(width: number, height: number) {
      const name = "cartesian-1d";
      let canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      let xmin = -5;
      let xmax = 5;
      let ymin = -5;
      let ymax = 5;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      let number_line = new Axis([xmin, xmax], "x");
      number_line.axis().set_stroke_width(0.05);
      number_line.axis().set_arrow_size(0.3);
      number_line.set_tick_size(0.2);
      scene.add("number_line", number_line);
      scene.draw();
    })(300, 300);

    // A pair of Cartesian axes, with grid lines
    (function cartesian_2d(width: number, height: number) {
      const name = "cartesian-2d";
      let canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      let xmin = -8;
      let xmax = 8;
      let ymin = -8;
      let ymax = 8;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      let axes = new CoordinateAxes2d([xmin, xmax], [ymin, ymax]);
      scene.add("axes", axes);

      // The integral of a function
      let x = 4;
      let integral = new Integral((t) => 1 / t, 1, x, 50);
      integral.set_fill_color("gray");
      integral.set_fill_alpha(0.3);
      scene.add("integral", integral);

      // Zoom slider
      let z_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (log_zr: number) {
          let zr = Math.exp(log_zr * Math.LN10);

          // Zoom into the center of the scene
          scene.zoom_in_on(zr / scene.zoom_ratio, scene.get_view_center());

          // Reset the coordinate system display
          axes.set_lims(scene.view_xlims, scene.view_ylims);
          axes.set_axis_options({
            stroke_width: 0.05 / zr,
            arrow_size: 0.3 / zr,
          });
          axes.set_tick_options({
            distance: 1,
            size: 0.2 / zr,
            alpha: 1,
            stroke_width: 0.08 / zr,
          });
          axes.set_grid_options({
            distance: Math.exp(Math.LN2 * Math.ceil(-Math.log2(zr))),
            alpha: 0.2,
            stroke_width: 0.05 / zr,
          });
          scene.draw();
        },
        {
          name: "zoom ratio (log base 10 scale)",
          initial_value: "0.0",
          min: -1.0,
          max: 1.0,
          step: 0.01,
        },
      );

      // Slider to change the integral bounds
      let w_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (d: number) {
          integral.set_left_endpoint(Number(d));
          integral.set_right_endpoint(Number(d) * x);
          scene.draw();
        },
        {
          name: "bounds",
          initial_value: "1.0",
          min: 0.5,
          max: 2.0,
          step: 0.05,
        },
      );

      let translator = new SceneViewTranslator(scene);
      translator.add_callback(() =>
        axes.set_lims(scene.view_xlims, scene.view_ylims),
      );
      translator.add();

      scene.draw();
    })(300, 300);

    // A triple of Cartesian axes
    (function cartesian_3d(width: number, height: number) {
      const name = "cartesian-3d";
      let canvas = prepare_canvas(width, height, name);
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];

      // Initialize three-dimensional scene, zoomed in
      let zoom_ratio = 1.0;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");

      // Rotate the camera angle and set the camera position
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 4,
      );

      // Set up axes
      let axes = new CoordinateAxes3d([xmin, xmax], [ymin, ymax], [zmin, zmax]);
      axes.x_axis().axis().set_stroke_width(0.05);
      axes.y_axis().axis().set_stroke_width(0.05);
      axes.z_axis().axis().set_stroke_width(0.05);
      axes.set_tick_size(0.2);
      axes.x_axis().axis().set_arrow_size(0.3);
      axes.y_axis().axis().set_arrow_size(0.3);
      axes.z_axis().axis().set_arrow_size(0.3);

      // Make arcball
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      scene.add("axes", axes);
      scene.draw();
    })(300, 300);

    // (function test_latex(width: number, height: number) {
    //   const canvas_name = "latex-scene";
    //   const canvas = prepare_canvas(width, height, canvas_name);

    //   let scene = new Scene(canvas);
    //   const xmin = -5;
    //   const xmax = 5;
    //   const ymin = -5;
    //   const ymax = 5;
    //   scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

    //   let cache = new LatexCache();

    //   for (let i = 1; i < 10; i++) {
    //     let tex = new LaTeXMObject(
    //       `\\frac{${i}}{${i + 1}}`,
    //       [xmin + i, 0],
    //       cache,
    //     );
    //     scene.add(`latex_${i}`, tex);
    //   }

    //   let ctx = canvas.getContext("2d");
    //   if (!ctx) throw new Error("Failed to get 2D context");
    //   scene.draw();

    //   // Add a slider which controls the zoom
    //   let zoom_slider = Slider(
    //     document.getElementById(canvas_name + "-slider-1") as HTMLElement,
    //     function (zr: number) {
    //       scene.set_zoom(zr);
    //       scene.draw();
    //     },
    //     {
    //       name: "Zoom ratio",
    //       initial_value: "1.0",
    //       min: 0.6,
    //       max: 5,
    //       step: 0.05,
    //     },
    //   );
    //   zoom_slider.width = 200;
    // })(300, 300);
  });
})();
