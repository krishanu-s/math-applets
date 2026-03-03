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
  delay,
  Line,
} from "./lib/base";
import {
  SceneViewTranslator,
  Button,
  Slider,
  CSlider,
} from "./lib/interactive";
import { createSmoothOpenPathBezier } from "./rust-calc-browser";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Initiate the Bezier solver for smooth curve approximation
    let num_pts = 100;
    let solver = await createSmoothOpenPathBezier(num_pts);

    // Make a LaTeX cache
    let cache = new LatexCache();

    // TODO Add a playable animation which visually shows why ln(ab) = ln(a) + ln(b)
    await (async function log_stretch(width: number, height: number) {
      const name = "log-stretch";

      // Set up the scene
      let xmin = -1;
      let xmax = 8;
      let ymin = -1;
      let ymax = 8;
      let a = 2.5;
      let b = 3;

      let canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      const tick_size = 0.1;
      const tex_offset_x = 0.2;
      const tex_offset_y = 0.1;

      scene.add(
        "axes",
        new CoordinateAxes2d([xmin, xmax], [ymin, ymax])
          .set_axis_options({ arrow_size: 0.1, stroke_width: 0.04 })
          .set_tick_options({ stroke_width: 0.04, size: 0.08 })
          .set_grid_options({
            stroke_width: 0.02,
            x_distance: 1.0,
            y_distance: 1.0,
          }),
      );
      scene.add(
        "base_curve",
        new ParametricFunction(
          (t) => [t, 1 / t],
          0.04,
          xmax,
          num_pts,
          solver,
        ).set_stroke_width(0.04),
      );
      scene.add(
        "scaled_curve",
        new ParametricFunction((t) => [t, b / t], 0.04, xmax, num_pts, solver)
          .set_stroke_width(0.04)
          .set_alpha(0.5),
      );
      scene.add(
        "integral_ln_a",
        new Integral((t) => 1 / t, 1, a, num_pts)
          .set_stroke_width(0.04)
          .set_fill_alpha(0.3)
          .set_fill_color("red"),
      );
      scene.add(
        "integral_ln_b",
        new Integral((t) => 1 / t, 1, b, num_pts)
          .set_stroke_width(0.04)
          .set_fill_alpha(0.3)
          .set_fill_color("blue"),
      );
      scene.add(
        "tick_a",
        new Line([a, -tick_size], [a, tick_size])
          .set_stroke_width(0.08)
          .set_stroke_color("red"),
      );
      scene.add(
        "tick_b",
        new Line([b, -tick_size], [b, tick_size])
          .set_stroke_width(0.08)
          .set_stroke_color("blue"),
      );
      scene.add(
        "tick_ab",
        new Line([a * b, -tick_size], [a * b, tick_size])
          .set_stroke_width(0.08)
          .set_stroke_color("purple"),
      );

      scene.add(
        "tex_a",
        new LaTeXMObject(
          "a",
          [a - tex_offset_x, -tex_offset_y],
          cache,
        ).set_fontSize(12),
      );
      scene.add(
        "tex_b",
        new LaTeXMObject(
          "b",
          [b - tex_offset_x, -tex_offset_y],
          cache,
        ).set_fontSize(12),
      );
      scene.add(
        "tex_ab",
        new LaTeXMObject(
          "ab",
          [a * b - tex_offset_x, -tex_offset_y],
          cache,
        ).set_fontSize(12),
      );

      // Pre-render all LaTeX objects in the scene
      await (scene.get_mobj("tex_a") as LaTeXMObject).add_to_cache();
      await (scene.get_mobj("tex_b") as LaTeXMObject).add_to_cache();
      await (scene.get_mobj("tex_ab") as LaTeXMObject).add_to_cache();

      // Add a scene view translator
      let scene_view_translator = new SceneViewTranslator(scene).add_callback(
        () => {
          (scene.get_mobj("base_curve") as ParametricFunction).set_lims(
            0.04,
            scene.view_xlims[1],
          );
          (scene.get_mobj("scaled_curve") as ParametricFunction).set_lims(
            0.04,
            scene.view_xlims[1],
          );
        },
      );
      scene_view_translator.add();
      scene.draw();

      function update_scene(a_val: number, b_val: number) {
        (scene.get_mobj("scaled_curve") as ParametricFunction).set_function(
          (t) => [t, b_val / t],
        );
        if (horizontally_stretched) {
          (scene.get_mobj("integral_ln_a") as Integral).set_lims(
            b_val,
            a_val * b_val,
          );
        } else {
          (scene.get_mobj("integral_ln_a") as Integral).set_lims(1, a_val);
        }
        (scene.get_mobj("integral_ln_b") as Integral).set_lims(1, b_val);
        (scene.get_mobj("tex_a") as LaTeXMObject).move_to([
          a_val - tex_offset_x,
          -tex_offset_y,
        ]);
        (scene.get_mobj("tex_b") as LaTeXMObject).move_to([
          b_val - tex_offset_x,
          -tex_offset_y,
        ]);
        (scene.get_mobj("tex_ab") as LaTeXMObject).move_to([
          a_val * b_val - tex_offset_x,
          -tex_offset_y,
        ]);
        (scene.get_mobj("tick_a") as Line)
          .move_start([a_val, -tick_size])
          .move_end([a_val, tick_size]);
        (scene.get_mobj("tick_b") as Line)
          .move_start([b_val, -tick_size])
          .move_end([b_val, tick_size]);
        (scene.get_mobj("tick_ab") as Line)
          .move_start([a_val * b_val, -tick_size])
          .move_end([a_val * b_val, tick_size]);
      }

      // Animate the movement of the integral
      const num_frames = 50;
      let horizontally_stretched: boolean = false;
      let vertically_stretched: boolean = false;
      let horizontalStretchButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        async () => {
          let alpha;
          let p: number;
          for (let frame = 1; frame <= num_frames; frame++) {
            if (horizontally_stretched) {
              alpha = smooth(1 - frame / num_frames);
            } else {
              alpha = smooth(frame / num_frames);
            }
            p = b * alpha + 1 * (1 - alpha);
            (scene.get_mobj("integral_ln_a") as Integral)
              .set_lims(p, p * a)
              .set_func((t) => p / t);
            scene.draw();
            displayButton.textContent = `Red area = ${(Math.log(a) * p).toFixed(3)}, Blue area = ${Math.log(b).toFixed(3)}`;
            await delay(10);
          }
          horizontally_stretched = !horizontally_stretched;
        },
      );
      horizontalStretchButton.textContent = "Step 1";
      let verticalStretchButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        async () => {
          if (!horizontally_stretched) {
            return;
          }
          let alpha;
          let p: number;
          for (let frame = 1; frame <= num_frames; frame++) {
            if (vertically_stretched) {
              alpha = smooth(1 - frame / num_frames);
            } else {
              alpha = smooth(frame / num_frames);
            }
            p = b * alpha + 1 * (1 - alpha);
            (scene.get_mobj("integral_ln_a") as Integral).set_func(
              (t) => b / p / t,
            );
            scene.draw();
            displayButton.textContent = `Red area = ${((Math.log(a) * b) / p).toFixed(3)}, Blue area = ${Math.log(b).toFixed(3)}`;
            await delay(10);
          }
          vertically_stretched = !vertically_stretched;
        },
      );
      verticalStretchButton.textContent = "Step 2";

      // Display value, unclickable
      let displayButton = Button(
        document.getElementById(name + "-button-3") as HTMLElement,
        () => {},
      );
      displayButton.textContent = `Red area = ${Math.log(a).toFixed(3)}, Blue area = ${Math.log(b).toFixed(3)}`;

      // Sliders
      let aSlider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        (x: number) => {
          a = x;
          update_scene(a, b);
          scene.draw();
        },
        {
          name: "a value",
          initial_value: "2.5",
          min: 0.2,
          max: 8,
          step: 0.01,
        },
      );
      let bSlider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        (x: number) => {
          b = x;
          update_scene(a, b);
          scene.draw();
        },
        {
          name: "b value",
          initial_value: "3.0",
          min: 0.2,
          max: 8,
          step: 0.01,
        },
      );
    })(300, 300);

    // TODO Add an applet showing the Taylor polynomials of ln(1 + x) and animation
    // which adds them in, one-by-one. Also have a formula which fades in terms, one-by-one.
    await (async function log_series(width: number, height: number) {
      const name = "log-series";

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
          .set_grid_options({
            stroke_width: 0.02,
            x_distance: 0.5,
            y_distance: 0.5,
          }),
      );

      let hyp_canvas = prepare_canvas(width, height, "log-series-hyperbola");
      let hyp_scene = new Scene(hyp_canvas);
      hyp_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      hyp_scene.add(
        "axes",
        new CoordinateAxes2d([xmin, xmax], [ymin, ymax])
          .set_axis_options({ arrow_size: 0.1, stroke_width: 0.04 })
          .set_tick_options({ stroke_width: 0.04, size: 0.08 })
          .set_grid_options({
            stroke_width: 0.02,
            x_distance: 0.5,
            y_distance: 0.5,
          }),
      );

      // TODO Add ability to zoom in and out

      // Add Taylor approximations
      let degree = 1;

      // Pre-render LaTeX
      log_scene.add(
        "latex",
        new LaTeXMObject(`d=${degree}`, [-0.5, 1.5], cache),
      );
      await (log_scene.get_mobj("latex") as LaTeXMObject).add_to_cache();
      for (let d = 2; d < 7; d++) {
        (log_scene.get_mobj("latex") as LaTeXMObject).set_tex(`d=${d}`);
        await (log_scene.get_mobj("latex") as LaTeXMObject).add_to_cache();
      }
      (log_scene.get_mobj("latex") as LaTeXMObject).set_tex(`d=${degree}`);

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
    await (async function poly_quadrature(width: number, height: number) {
      const name = "poly-quadrature";

      // TODO Pre-populate LaTeX cache.

      // Set up the scene
      let xmin = -0.5;
      let xmax = 2.5;
      let ymin = -0.5;
      let ymax = 10;

      let canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      scene.add(
        "axes",
        new CoordinateAxes2d([xmin, xmax], [ymin, ymax])
          .set_axis_options({ arrow_size: 0.2, stroke_width: 0.03 })
          .set_tick_options({ stroke_width: 0.04, size: 0.0 })
          .set_grid_options({
            stroke_width: 0.02,
            x_distance: 1.0,
            y_distance: 4.0,
          }),
      );

      let degree = 2;
      scene.add(
        "curve",
        new ParametricFunction(
          (t) => [t, Math.pow(t, degree)],
          xmin,
          xmax,
          num_pts,
          solver,
        ).set_stroke_width(0.04),
      );
      scene.add(
        "int_1",
        new Integral((t) => Math.pow(t, degree), 0, 1, num_pts)
          .set_stroke_width(0.02)
          .set_fill_alpha(0.3),
      );

      // Pre-calculate binomial coefficients
      let binom: number[][] = [[1]];
      for (let n = 1; n < 20; n++) {
        let current: number[] = [1];
        let last = binom[n - 1] as number[];
        for (let k = 1; k < n; k++) {
          current.push((last[k - 1] as number) + (last[k] as number));
        }
        current.push(1);
        binom.push(current);
      }

      // Add intermediate integrals
      const colors = ["red", "blue", "green", "yellow", "purple"];
      for (let i = 0; i <= degree; i++) {
        scene.add(
          `int_2_${i}`,
          new IntegralBetween(
            (t) => {
              let result = 0;
              for (let j = 0; j < i; j++) {
                result += Math.pow(t - 1, j) * (binom[degree] as number[])[j];
              }
              return result;
            },
            (t) => {
              let result = 0;
              for (let j = 0; j <= i; j++) {
                result += Math.pow(t - 1, j) * (binom[degree] as number[])[j];
              }
              return result;
            },
            1,
            2,
            num_pts,
          )
            .set_stroke_width(0.02)
            .set_fill_color(colors[i] as string)
            .set_fill_alpha(0.3),
        );
      }

      // Add a view translator and callbacks to update the axes and functions when the view changes
      let scene_view_translator = new SceneViewTranslator(scene);
      scene_view_translator.add_callback(() => {
        (scene.get_mobj("axes") as CoordinateAxes2d).set_lims(
          scene.view_xlims,
          scene.view_ylims,
        );
        (scene.get_mobj("curve") as ParametricFunction).set_lims(
          scene.view_xlims[0],
          scene.view_xlims[1],
        );
      });
      scene_view_translator.add();

      let upButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        () => {
          for (let i = 0; i <= degree; i++) {
            scene.remove(`int_2_${i}`);
          }
          degree++;

          // Redraw the curve and integrals
          (scene.get_mobj("curve") as ParametricFunction).set_function((t) => [
            t,
            Math.pow(t, degree),
          ]);
          (scene.get_mobj("int_1") as Integral).set_func((t) =>
            Math.pow(t, degree),
          );

          for (let i = 0; i <= degree; i++) {
            scene.add(
              `int_2_${i}`,
              new IntegralBetween(
                (t) => {
                  let result = 0;
                  for (let j = 0; j < i; j++) {
                    result +=
                      Math.pow(t - 1, j) * (binom[degree] as number[])[j];
                  }
                  return result;
                },
                (t) => {
                  let result = 0;
                  for (let j = 0; j <= i; j++) {
                    result +=
                      Math.pow(t - 1, j) * (binom[degree] as number[])[j];
                  }
                  return result;
                },
                1,
                2,
                num_pts,
              )
                .set_stroke_width(0.02)
                .set_fill_color(colors[i] as string)
                .set_fill_alpha(0.3),
            );
          }
          scene.draw();
        },
      );
      upButton.textContent = "Increase degree";
      let downButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        () => {
          if (degree == 1) {
            return;
          }
          for (let i = 0; i <= degree; i++) {
            scene.remove(`int_2_${i}`);
          }
          degree--;
          // Redraw the curve and integrals
          (scene.get_mobj("curve") as ParametricFunction).set_function((t) => [
            t,
            Math.pow(t, degree),
          ]);

          (scene.get_mobj("int_1") as Integral).set_func((t) =>
            Math.pow(t, degree),
          );
          for (let i = 0; i <= degree; i++) {
            scene.add(
              `int_2_${i}`,
              new IntegralBetween(
                (t) => {
                  let result = 0;
                  for (let j = 0; j < i; j++) {
                    result +=
                      Math.pow(t - 1, j) * (binom[degree] as number[])[j];
                  }
                  return result;
                },
                (t) => {
                  let result = 0;
                  for (let j = 0; j <= i; j++) {
                    result +=
                      Math.pow(t - 1, j) * (binom[degree] as number[])[j];
                  }
                  return result;
                },
                1,
                2,
                num_pts,
              )
                .set_stroke_width(0.02)
                .set_fill_color(colors[i] as string)
                .set_fill_alpha(0.3),
            );
          }
          scene.draw();
        },
      );
      downButton.textContent = "Decrease degree";

      scene.draw();
    })(300, 300);

    // TODO Add a visualization of why 1 / (1 + x) = 1 - x + x^2 - x^3 + ... for x in [0, 1]
  });
})();
