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
  Dot,
  DraggableDot,
  Polygon,
  Line,
  LaTeXMObject,
  LatexCache,
  sigmoid,
  smooth,
} from "./lib/base";
import { BezierSpline } from "./lib/base/bezier.js";
import {
  vec3_normalize,
  get_column,
  matmul_vec,
  rot,
} from "./lib/three_d/matvec";
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
  IntegralBetween,
} from "./lib/base/cartesian";
import { ParametricFunction } from "./lib/base/bezier";
import { createSmoothOpenPathBezier } from "./rust-calc-browser";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
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
      async function make_scene(n: number) {
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
        let solver = await createSmoothOpenPathBezier(n - 1);
        let curve = new BezierSpline(n - 1, solver).set_stroke_width(
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
    })(500, 500);

    // A pair of Cartesian axes, with grid lines
    // Displaying a function and its integral

    //
    // TODO Add a visualization of why 1 / (1 + x) = 1 - x + x^2 - x^3 + ... for x in [0, 1]
    //
    // TODO Add a visualization of why 1 + 1/2 + 1/3 + ... + 1/n ~ ln(n)
    // TODO Add a visualization of why ln(2) + ... + ln(n) ~ ...
    // TODO Add a visualization of why ln(2) + ... + ln(n) ~ ...
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
    })(500, 500);

    // TODO Add a playable animation which visually shows why ln(ab) = ln(a) + ln(b)

    // TODO Add an applet showing the Taylor polynomials of ln(1 + x) and animation
    // which adds them in, one-by-one. Also have a formula which fades in terms, one-by-one.
    await (async function log_series(width: number, height: number) {
      const name = "log-series";

      // Initiate the Bezier solver for smooth curve approximation
      let num_pts = 100;
      let solver = await createSmoothOpenPathBezier(num_pts);

      // Make a LaTeX cache
      // TODO Pre-populate it.
      let cache = new LatexCache();
      // for (let d = 0; d <= 10; d++) {
      //   cache.add(`d=${d}`, "black", 12);
      // }

      // Set up the two scenes
      let xmin = -1;
      let xmax = 2;
      let ymin = -1;
      let ymax = 2;

      let log_canvas = prepare_canvas(width, height, name);
      let log_scene = new Scene(log_canvas);
      log_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      log_scene.add(
        "axes",
        new CoordinateAxes2d([xmin, xmax], [ymin, ymax])
          .set_axis_options({ arrow_size: 0.1, stroke_width: 0.04 })
          .set_tick_options({ stroke_width: 0.04, size: 0.08 })
          .set_grid_options({ stroke_width: 0.02, distance: 0.5 }),
      );

      let hyp_canvas = prepare_canvas(width, height, "log-series-hyperbola");
      let hyp_scene = new Scene(hyp_canvas);
      hyp_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      hyp_scene.add(
        "axes",
        new CoordinateAxes2d([xmin, xmax], [ymin, ymax])
          .set_axis_options({ arrow_size: 0.1, stroke_width: 0.04 })
          .set_tick_options({ stroke_width: 0.04, size: 0.08 })
          .set_grid_options({ stroke_width: 0.02, distance: 0.5 }),
      );

      // TODO Add ability to zoom in and out

      // Add Taylor approximations
      let degree = 1;

      log_scene.add(
        "latex",
        new LaTeXMObject(`d=${degree}`, [-0.5, 1.5], cache),
      );
      log_scene.add(
        "approx_to_curve",
        new ParametricFunction((t) => [t, t], xmin, xmax, num_pts, solver)
          .set_stroke_color("red")
          .set_stroke_width(0.04),
      );
      log_scene.add(
        "curve",
        new ParametricFunction(
          (t) => [t, Math.log(1 + t)],
          -0.98,
          xmax,
          num_pts,
          solver,
        ).set_stroke_width(0.04),
      );

      hyp_scene.add(
        "approx_to_curve",
        new ParametricFunction(
          (t) => [t, 1.0] as Vec2D,
          xmin,
          xmax,
          num_pts,
          solver,
        )
          .set_stroke_width(0.04)
          .set_stroke_color("blue"),
      );
      hyp_scene.add(
        "curve",
        new ParametricFunction(
          (t) => [t, 1 / (1 + t)],
          -0.98,
          xmax,
          num_pts,
          solver,
        ).set_stroke_width(0.04),
      );

      // Add draggable point
      let x_val = 0.5;
      let x_pt = new DraggableDot([x_val, Math.log(1 + x_val)], 0.08);
      let approx_x_pt = new Dot(
        [x_val, approxFunctionLog(degree)(x_val)],
        0.08,
      ).set_color("red");
      hyp_scene.add(
        "approx_integral",
        new IntegralBetween(
          (t) => 1.0,
          (t) => 0,
          0,
          x_val,
          num_pts,
        )
          .set_stroke_width(0.02)
          .set_fill_color("red")
          .set_fill_alpha(0.2),
      );
      hyp_scene.add(
        "integral",
        new IntegralBetween(
          (t) => 1 / (1 + t),
          (t) => 0,
          0,
          x_val,
          num_pts,
        )
          .set_stroke_width(0.02)
          .set_fill_color("gray")
          .set_fill_alpha(0.4),
      );
      x_pt.add_callback(() => {
        x_val = x_pt.center[0];
        x_pt.move_to([x_val, Math.log(1 + x_val)]);
        (hyp_scene.get_mobj("integral") as IntegralBetween).set_right_endpoint(
          x_val,
        );
        (
          hyp_scene.get_mobj("approx_integral") as IntegralBetween
        ).set_right_endpoint(x_val);
        approx_x_pt.move_to([x_val, approxFunctionLog(degree)(x_val)]);
        hyp_scene.draw();
      });
      log_scene.add("approx_x_pt", approx_x_pt);
      log_scene.add("x_pt", x_pt);

      // Add a view translator and callbacks to update the axes and functions when the view changes
      let log_canvas_translator = new SceneViewTranslator(log_scene);
      log_canvas_translator.add_callback(() => {
        (log_scene.get_mobj("axes") as CoordinateAxes2d).set_lims(
          log_scene.view_xlims,
          log_scene.view_ylims,
        );
        (log_scene.get_mobj("curve") as ParametricFunction).set_lims(
          -0.99,
          log_scene.view_xlims[1],
        );
        (log_scene.get_mobj("approx_to_curve") as ParametricFunction).set_lims(
          log_scene.view_xlims[0],
          log_scene.view_xlims[1],
        );
      });
      log_canvas_translator.add();

      let hyp_canvas_translator = new SceneViewTranslator(hyp_scene);
      hyp_canvas_translator.add_callback(() => {
        (hyp_scene.get_mobj("axes") as CoordinateAxes2d).set_lims(
          hyp_scene.view_xlims,
          hyp_scene.view_ylims,
        );
        (hyp_scene.get_mobj("curve") as ParametricFunction).set_lims(
          -0.99,
          hyp_scene.view_xlims[1],
        );
        (hyp_scene.get_mobj("approx_to_curve") as ParametricFunction).set_lims(
          hyp_scene.view_xlims[0],
          hyp_scene.view_xlims[1],
        );
      });
      hyp_canvas_translator.add();

      // Add buttons to increment/decrement degree
      const num_frames = 50;
      function approxFunctionLog(d: number): (t: number) => number {
        return (t: number) => {
          let result = 0;
          for (let i = 1; i <= d; i++) {
            result -= Math.pow(-t, i) / i;
          }
          return result;
        };
      }
      function approxFunctionHyp(d: number): (t: number) => number {
        return (t: number) => {
          let result = 0;
          for (let i = 1; i <= d; i++) {
            result += Math.pow(-t, i - 1);
          }
          return result;
        };
      }
      async function setApproxDegree(oldDegree: number, newDegree: number) {
        for (let frame = 1; frame <= num_frames; frame++) {
          let alpha = frame / num_frames;
          (
            log_scene.get_mobj("approx_to_curve") as ParametricFunction
          ).set_function((t) => {
            let result = 0;
            if (oldDegree > newDegree) {
              for (let i = 1; i <= newDegree; i++) {
                result -= Math.pow(-t, i) / i;
              }
              for (let i = newDegree + 1; i <= oldDegree; i++) {
                result -= (smooth(1 - alpha) * Math.pow(-t, i)) / i;
              }
            } else {
              for (let i = 1; i <= oldDegree; i++) {
                result -= Math.pow(-t, i) / i;
              }
              for (let i = oldDegree + 1; i <= newDegree; i++) {
                result -= (smooth(alpha) * Math.pow(-t, i)) / i;
              }
            }
            return [t, result];
          });

          (
            hyp_scene.get_mobj("approx_to_curve") as ParametricFunction
          ).set_function((t) => {
            let result = 0;
            if (oldDegree > newDegree) {
              for (let i = 1; i <= newDegree; i++) {
                result += Math.pow(-t, i - 1);
              }
              for (let i = newDegree + 1; i <= oldDegree; i++) {
                result += smooth(1 - alpha) * Math.pow(-t, i - 1);
              }
            } else {
              for (let i = 1; i <= oldDegree; i++) {
                result += Math.pow(-t, i - 1);
              }
              for (let i = oldDegree + 1; i <= newDegree; i++) {
                result += smooth(alpha) * Math.pow(-t, i - 1);
              }
            }
            return [t, result];
          });
          (hyp_scene.get_mobj("approx_integral") as IntegralBetween).set_f(
            (t) => {
              let result = 0;
              if (oldDegree > newDegree) {
                for (let i = 1; i <= newDegree; i++) {
                  result += Math.pow(-t, i - 1);
                }
                for (let i = newDegree + 1; i <= oldDegree; i++) {
                  result += smooth(1 - alpha) * Math.pow(-t, i - 1);
                }
              } else {
                for (let i = 1; i <= oldDegree; i++) {
                  result += Math.pow(-t, i - 1);
                }
                for (let i = oldDegree + 1; i <= newDegree; i++) {
                  result += smooth(alpha) * Math.pow(-t, i - 1);
                }
              }
              return result;
            },
          );

          approx_x_pt.move_to([
            x_val,
            (1 - smooth(alpha)) * approxFunctionLog(oldDegree)(x_val) +
              smooth(alpha) * approxFunctionLog(newDegree)(x_val),
          ]);

          log_scene.draw();
          hyp_scene.draw();
          await delay(10);
        }
      }
      let upButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        () => {
          // TODO First make the integral under the curve x^d in the hyperbola scene,
          // and homotope it
          setApproxDegree(degree, degree + 1);
          degree++;
          (log_scene.get_mobj("latex") as LaTeXMObject).set_tex(`d=${degree}`);
          log_scene.draw();
          hyp_scene.draw();
        },
      );
      upButton.textContent = "Increase degree";
      let downButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        () => {
          if (degree == 1) {
            return;
          }
          // TODO First make the integral under the curve x^{d-1} in the hyperbola scene,
          // and homotope it
          setApproxDegree(degree, degree - 1);
          degree--;
          (log_scene.get_mobj("latex") as LaTeXMObject).set_tex(`d=${degree}`);
          log_scene.draw();
          hyp_scene.draw();
        },
      );
      downButton.textContent = "Decrease degree";
      log_scene.draw();
      hyp_scene.draw();
    })(300, 300);

    // TODO Add a visualization of why the integral of x^n from x = 0 to x = 1 is 1/(n+1), for
    // - n = 1
    // - n = 2
    // - n = 3
    // - General slider and sum
    // - n = 0

    // TODO Add a visualization of why 1 / (1 + x) = 1 - x + x^2 - x^3 + ... for x in [0, 1]

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
      // axes.x_axis().axis().set_stroke_width(0.05);
      // axes.y_axis().axis().set_stroke_width(0.05);
      // axes.z_axis().axis().set_stroke_width(0.05);
      // axes.set_tick_size(0.2);
      // axes.x_axis().axis().set_arrow_size(0.3);
      // axes.y_axis().axis().set_arrow_size(0.3);
      // axes.z_axis().axis().set_arrow_size(0.3);

      // Make arcball
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      scene.add("axes", axes);
      scene.draw();
    })(500, 500);

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
