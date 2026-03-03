import {
  Scene,
  prepare_canvas,
  smooth,
  Vec2D,
  DraggableDot,
  Dot,
  CoordinateAxes2d,
  Integral,
  IntegralBetween,
  ParametricFunction,
  LatexCache,
  LaTeXMObject,
} from "./lib/base";
import { SceneViewTranslator, Button, Slider } from "./lib/interactive";
import { createSmoothOpenPathBezier } from "./rust-calc-browser";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
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
  });
})();
