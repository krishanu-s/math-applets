import {
  FadeIn,
  FadeOut,
  Homothety,
  Wait,
  Zoom,
  FRAME_LENGTH,
  MoveBy,
  ChangeParameterSmoothly,
  GrowLineFromMidpoint,
  GrowShrinkDot,
  Emphasize,
} from "./lib/animation";
import {
  MObjectGroup,
  Polygon,
  prepare_canvas,
  Scene,
  Line,
  CoordinateAxes2d,
  ParametricFunction,
  Dot,
  delay,
  smooth,
  Vec2D,
  vec2_sum,
  vec2_scale,
  MObject,
  vec2_rot,
  linear,
} from "./lib/base";
import { Button } from "./lib/interactive";
import { createSmoothOpenPathBezier } from "./rust-calc-browser";
import { LatexCache, LaTeXMObject } from "./lib/base/latex";
import { Parameter } from "./lib/interactive";
import { CartEq, ConicSection, PolarEq } from "./lib/math";

// Makes a triangle representing a Pythagorean triple.
// The offset vector is where the bottom-left corner is placed.
function make_triangle(
  height: number,
  width: number,
  offset: Vec2D = [0, 0],
  scale: number = 1.0,
  add_grid_lines: boolean = true,
): MObjectGroup {
  let t = new MObjectGroup();
  t.add_mobj(
    "triangle",
    new Polygon([
      [0, 0],
      [width, 0],
      [width, height],
    ]).set_fill(false),
  );

  // Add grid lines
  if (add_grid_lines) {
    for (let i = 1; i < height; i++) {
      t.add_mobj(
        `grid_y_${i}`,
        new Line([width, i], [(i * width) / height, i]).set_alpha(0.3),
      );
    }
    for (let j = 1; j < width; j++) {
      t.add_mobj(
        `grid_x_${j}`,
        new Line([j, 0], [j, (j * height) / width]).set_alpha(0.3),
      );
    }
  }

  // Scale size
  t.homothety_around([0, 0], scale);

  // Move to offset
  t.move_by(offset);
  return t;
}

// Generic form of stereographic projection for a conic section, as a function of
// - the cartesian form of the conic section being projected
// - the location of the base point
// - the slope of the line through the basepoint
// Outputs coordinates of the second intersection point.
function stereographic_projection(
  cart_eq: CartEq,
  basepoint: Vec2D,
  slope: number,
): Vec2D | null {
  let [x0, y0] = basepoint;
  // Calculate the two leading coefficients in the quadratic equation for x
  let quadratic_coeff =
    cart_eq.c_xx + slope * cart_eq.c_xy + slope ** 2 * cart_eq.c_yy;
  let linear_coeff =
    cart_eq.c_x +
    slope * cart_eq.c_y -
    cart_eq.c_xy * (x0 * slope - y0) +
    2 * slope * cart_eq.c_yy * (y0 - slope * x0);

  // If the quadratic coefficient is zero, output null
  if (quadratic_coeff == 0) {
    return null;
  }

  // Sum of roots is equal to -b / a
  let sum_of_roots = -linear_coeff / quadratic_coeff;
  let x1 = sum_of_roots - x0;
  let y1 = y0 + slope * (x1 - x0);
  return [x1, y1];
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Define the solver for Bezier curves in this scene
    let num_pts = 200;
    let solver = await createSmoothOpenPathBezier(num_pts);
    let cache = new LatexCache();

    // Pre-render LaTeX as needed
    await new LaTeXMObject("x^2 + y^2 = 1", [0, -3], cache).add_to_cache();
    await new LaTeXMObject("y = -m(x-1)", [0, -4], cache).add_to_cache();
    await new LaTeXMObject(
      "x^2 + (-m(x-1))^2 = 1",
      [0, -5],
      cache,
    ).add_to_cache();
    await new LaTeXMObject(
      "(m^2+1)x^2 - 2m^2x + (m^2-1) = 0",
      [0, -6],
      cache,
    ).add_to_cache();
    await new LaTeXMObject(
      "x = \\frac{2m^2 \\pm \\sqrt{(2m^2)^2 - 4(m^2+1)(m^2-1)}}{2(m^2+1)}",
      [0, -7],
      cache,
    ).add_to_cache();
    await new LaTeXMObject(
      "(x, y) = (\\frac{m^2-1}{m^2+1}, \\frac{2m}{m^2+1})",
      [0, -8],
      cache,
    ).add_to_cache();

    // SCENE 0:
    // - I want to describe a problem involving integers and triangles. The solution goes back to Diophantus
    // of Alexandria, which is why the equations which arise are often called "Diophantine equations".
    // This solution is simple and elegant, but it's the the first example of what we today would call
    // "algebraic geometry", which is its own entire field of mathematics.
    // - ANIMATION: A changing conic section with basepoint (1, 0), with a collection of rational points on it
    // parametrized by a fixed finite set of rational numbers, and the corresponding lines. Meanwhile, show
    // CP^1 on the right. Also changing into an elliptic curve, and showing a torus on the right.

    await (async function scene_0(width: number, height: number) {})(400, 400);

    // SCENE 1:
    // - ANIMATION: Draw a right triangle with sidelengths labeled a, b, and c.
    // - Re-state (and write) the Pythagorean theorem, which is that for a right triangle with sidelengths
    // a, b, and c, we have a^2 + b^2 = c^2
    // - ANIMATION: Vary the values of a, b, and c to be various decimal number values.
    // - SPEECH: "Now I want restrict our attention to the case where the two legs a and are are whole numbers. Notice that
    // most of the time, the number c is irrational.""
    // - ANIMATION: Meanwhile, vary a and b to be (1, 1), (1, 2), (1, 3), (2, 3), (2, 4), (3, 4).
    // - SPEECH: "But every once in a while, we get that all three sidelengths are whole numbers."
    // - ANIMATION: Emphasize this by drawing tick mark and grid lines, and writing 3^2 + 4^2 = 5^2 below.
    // - SPEECH: "When the three sidelengths are all whole numbers, we call it a `integer Pythagorean triple`, or just
    // `Pythagorean triple`. For example, (3, 4, 5) is the first Pythagorean triple."
    // - ANIMATION: Zoom out and fade in some more examples.
    // - SPEECH: "If you continue increasing a and b, you'll find there are a variety of other Pythagorean triples. For example,
    // there's (5, 12, 13), (6, 8, 10), (7, 24, 25), (8, 15, 17), (9, 12, 15), (9, 40, 41), and (10, 24, 26)."
    // - ANIMATION: Shrink down (6, 8, 10) until it's the same size as (3, 4, 5).
    // - SPEECH: "So here's the question. Are there infinitely many Pythagorean triples? And is there some simple way to describe
    // all of them?"
    //
    // (OPTIONAL?)
    //
    // - SPEECH: "Take a moment to look at the examples here and see if you can spot any patterns."
    // (PAUSE)
    // - ANIMATION: Highlight (3, 4, 5), (6, 8, 10), and (9, 12, 15).
    // - SPEECH: "You might notice that (3, 4, 5) and (6, 8, 10) are similar to each other. The triple (6, 8, 10) is formed by
    // just doubling all of the sidelengths of (3, 4, 5). Similarly, (9, 12, 15) is three times of (3, 4, 5)."
    // - ANIMATION: Highlight (3, 4, 5), (5, 12, 13), and (7, 24, 25).
    // - SPEECH: "There's another pattern you might notice." (TODO Write this out)

    // Defining Pythagorean triples and listing out examples
    await (async function scene_1(width: number, height: number) {
      const name = "scene-1";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);

      scene.set_frame_lims([0, 100], [0, 100]);
      scene.set_view_lims([0, 20], [-20, 0]);
      scene.draw();

      let playButton = Button(
        document.getElementById(name + "-play-button") as HTMLElement,
        async function () {
          scene.clear();
          await new FadeIn(
            "3-4-5",
            make_triangle(3, 4).move_by([1, -1]),
            30,
          ).play(scene);

          await new Wait(20).play(scene);

          await new FadeIn(
            "5-12-13",
            make_triangle(5, 12).move_by([1, -9]),
            30,
          ).play(scene);

          await new Wait(20).play(scene);

          await new FadeIn(
            "6-8-10",
            make_triangle(6, 8).move_by([7, -1]),
            30,
          ).play(scene);

          await new Homothety(
            "6-8-10",
            scene.get_mobj("6-8-10"),
            [7, -1],
            0.5,
            40,
          ).play(scene);
        },
      );
      playButton.textContent = "Play next";

      // scene.draw();
    })(300, 300);

    // SCENE 2:
    // - ANIMATION: Fade in a pair of axes, and the point (1, 0) and a segment connecting it to the origin. Sweep this segment
    // around to form a circle of radius 1. Animate a floating red point (x, y) and the width/height/hypotenuse.
    // - SPEECH: "Diophantus' solution to this problem comes from looking at the unit circle. Expressed in modern language, this
    // is the set of coordinate points (x, y) whose distance from (0, 0) is equal to 1. This circle is described by the equation
    // x^2 + y^2 = 1, which is another form of the Pythagorean theorem.""
    // - ANIMATION: Draw the line through the point (1, 0) and the point (x, y) as the point (x, y) floats.
    // - SPEECH: "One special point we'll mark on this circle is (1, 0). Now notice that if we draw any non-vertical line
    // through (1, 0), it intersects the circle at exactly one other point. Can we find the coordinates of that point in
    // terms of the slope of the line?"
    // - ANIMATION: Zoom out and show the algebra below it step-by-step.
    // - SPEECH: "Let's say the line has slope m, meaning that it goes through (0, -m). Then the line has equation
    // y = m(x-1). Plugging this back into the equation of the circle, we get x^2 + (m(x-1))^2 = 1. Collecting terms on
    // one side tells us that (m^2+1)x^2 - 2m^2x + (m^2-1) = 0. Finally, when we apply the quadratic equation we get
    // x = 2m^2 \pm \sqrt{(2m^2)^2 - 4(m^2+1)(m^2-1)}/2(m^2+1), which simplifies to x = (m^2 \pm 1)/(m^2+1).
    // When x = (m^2+1)/(m^2+1), which is just equal to 1, we get y = 0, which gives us the point (1, 0), which we already knew.
    // When x = (m^2-1)/(m^2+1), we get y = -2m/(m^2+1), which is the other point marked here on the circle."
    // - ANIMATION: Draw the line of slope -2 which passes through (0, 2) and (3/5, 4/5). Then draw the line of slope -3/2
    // which passes through (0, 3/2) and (5/13, 12/13).
    // - SPEECH: "This correspondence between points on the circle and slope values, based around a single
    // fixed point on the circle, is called `stereographic projection` and appears in many places in mathematics.
    // What we did here is calculate a formula for the correspondence, sending m -> ((m^2-1)/(m^2+1), -2m/(m^2+1)).
    // For example, the line with slope -2 intersects the circle at (3/5, 4/5). The line with slope -3/2 intersects the circle
    // at (5/13, 12/13). When m = -4/3, we get (7/25, 24/25), and when m = -5/3, we get (8/17, 15/17). And the vertical
    // line, which has infinite slope, corresponds to the point $(1, 0)$."
    //
    // Demonstrate that one can generate rational points on the circle
    await (async function scene_2(width: number, height: number) {
      const name = "scene-2";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);

      scene.set_frame_lims([-2, 20], [-2, 20]);
      scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
      scene.draw();
      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          scene.clear();
          scene.set_frame_lims([-2, 20], [-2, 20]);
          scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
          scene.draw();
        },
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button") as HTMLElement,
        async function () {
          scene.clear();
          let num_frames;
          let progress;
          let theta_slope;
          let theta_point;
          let slope;

          // Fade in a pair of axes, and the point (1, 0) and a segment connecting it to the origin. Sweep this segment
          // around to form a circle of radius 1. Animate a floating red point (x, y) and the width/height/hypotenuse.
          await new FadeIn(
            {
              axes: new CoordinateAxes2d([-2, 2], [-2.5, 2.5])
                .remove_grid_lines()
                .set_axis_options({ stroke_width: 0.05, arrow_size: 0.2 })
                .set_tick_options({ stroke_width: 0.03, size: 0.1 }),
            },
            10,
          ).play(scene);

          await new FadeIn(
            {
              basepoint: new Dot([1, 0], 0.06),
              segment: new Line([0, 0], [1, 0]).set_stroke_width(0.05),
            },
            10,
          ).play(scene);

          await new FadeIn(
            {
              circle: new ParametricFunction(
                (t) => [Math.cos(t), Math.sin(t)],
                0,
                0,
                100,
                solver,
              ).set_stroke_width(0.04),
            },
            10,
          ).play(scene);

          // TODO Turn this into a basic ingredient in animation.ts
          num_frames = 30;
          let t = new Parameter().set_value(0);
          t.add_callback((x: number) => {
            (scene.get_mobj("circle") as ParametricFunction).set_lims(0, x);
            (scene.get_mobj("basepoint") as Dot).move_to([
              Math.cos(x),
              Math.sin(x),
            ]);
            (scene.get_mobj("segment") as Line).move_end([
              Math.cos(x),
              Math.sin(x),
            ]);
          });
          await new ChangeParameterSmoothly(t, 2 * Math.PI, 30).play(scene);

          await new FadeOut(["segment"], 20).play(scene);

          await new FadeIn(
            { eq_circle: new LaTeXMObject("x^2 + y^2 = 1", [1.5, 1.5], cache) },
            10,
          ).play(scene);

          // Slope of line being drawn
          slope = -2.0;
          theta_slope = Math.atan2(-slope, -1);
          theta_point = 2 * theta_slope - Math.PI;

          // Fade in a floating point (x, y), as well as the width/height.
          await new FadeIn(
            {
              width: new Line(
                [Math.cos(theta_point), Math.sin(theta_point)],
                [0, Math.sin(theta_point)],
              )
                .set_stroke_color("red")
                .set_stroke_width(0.03),
              height: new Line(
                [Math.cos(theta_point), Math.sin(theta_point)],
                [Math.cos(theta_point), 0],
              )
                .set_stroke_color("blue")
                .set_stroke_width(0.03),
              floating_point: new Dot(
                [Math.cos(theta_point), Math.sin(theta_point)],
                0.08,
              ).set_fill_color("gray"),
            },
            20,
          ).play(scene);

          // Draw the line through the point (1, 0) and the point (x, y) as the point (x, y) floats.
          let length = 8;
          scene.add("line", new Line([1, 0], [1, 0]).set_stroke_width(0.04));
          scene.move_to_front("floating_point");
          num_frames = 30;
          for (let i = 1; i < num_frames; i++) {
            progress = smooth(i / num_frames);
            (scene.get_mobj("line") as Line)
              .move_start([
                1 + progress * length * Math.cos(theta_slope),
                progress * length * Math.sin(theta_slope),
              ])
              .move_end([
                1 - progress * length * Math.cos(theta_slope),
                -progress * length * Math.sin(theta_slope),
              ]);
            await delay(FRAME_LENGTH);
            scene.draw();
          }

          // Fade in the point where the line intersects the y-axis
          await new FadeIn({ axis_point: new Dot([0, -slope], 0.08) }, 10).play(
            scene,
          );

          // Make a parameter which links all of these objects
          let v = new Parameter();
          v.set_value(-2.0);
          v.add_callback((x: number) => {
            let t_slope = Math.atan2(-x, -1);
            let t_point = 2 * t_slope - Math.PI;
            (scene.get_mobj("width") as Line)
              .move_start([Math.cos(t_point), Math.sin(t_point)])
              .move_end([0, Math.sin(t_point)]);
            (scene.get_mobj("height") as Line)
              .move_start([Math.cos(t_point), Math.sin(t_point)])
              .move_end([Math.cos(t_point), 0]);
            (scene.get_mobj("floating_point") as Dot).move_to([
              Math.cos(t_point),
              Math.sin(t_point),
            ]);
            (scene.get_mobj("line") as Line)
              .move_start([
                1 + length * Math.cos(t_slope),
                length * Math.sin(t_slope),
              ])
              .move_end([
                1 - length * Math.cos(t_slope),
                -length * Math.sin(t_slope),
              ]);
            (scene.get_mobj("axis_point") as Dot).move_to([0, -x]);
          });

          // Fade in the equation of the line

          await new FadeIn(
            { eq_line: new LaTeXMObject("y = -m(x-1)", [1.5, 0.5], cache) },
            10,
          ).play(scene);

          // Move the slope around a bit
          let new_slope = -2 / 3;
          let new_theta_slope = Math.atan2(-new_slope, -1);
          let theta, m, point_angle;

          // Slope -> -2/3
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;

          // Slope -> -3
          new_slope = -3;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;

          // Slope -> -3/2
          new_slope = -3 / 2;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;

          // Zoom out and show the algebra below it step-by-step. Then zoom back in
          //
          await new Zoom([0, 2], 1 / 3, 30).play(scene);
          await new FadeIn(
            {
              formula_1: new LaTeXMObject(
                "x^2 + (-m(x-1))^2 = 1",
                [-2, -3],
                cache,
              ),
            },
            10,
          ).play(scene);
          await new FadeIn(
            {
              formula_2: new LaTeXMObject(
                "(m^2+1)x^2 - 2m^2x + (m^2-1) = 0",
                [-2, -4],
                cache,
              ),
            },
            10,
          ).play(scene);
          await new FadeIn(
            {
              formula_3: new LaTeXMObject(
                "x = \\frac{2m^2 \\pm \\sqrt{(2m^2)^2 - 4(m^2+1)(m^2-1)}}{2(m^2+1)}",
                [-2, -5],
                cache,
              ),
            },
            10,
          ).play(scene);
          await new FadeIn(
            {
              formula: new LaTeXMObject(
                "(x, y) = (\\frac{m^2-1}{m^2+1}, \\frac{2m}{m^2+1})",
                [-2, -6],
                cache,
              ),
            },
            10,
          ).play(scene);
          await new FadeOut(["formula_1", "formula_2", "formula_3"], 30).play(
            scene,
          );
          await new MoveBy("formula", [3, 8], 30).play(scene);
          await new Zoom([0, 2], 2, 30).play(scene);

          // Set the line to slope -2, and mark the intersection point as (3/5, 4/5). Color-code.
          // Set the line to slope 3/2 and mark the intersection point as (5/13, 12/13). Color-code
          // Set the line to slope 4/3 and mark the intersection point as (7/25, 24/25). Color-code
          // Set the line to slope 5/3 and mark the intersection point as (8/17, 15/17). Color-code

          // Slope -> -2
          new_slope = -2;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_1",
            new Dot(
              (scene.get_mobj("floating_point") as Dot).get_center(),
              0.04,
            ).set_color("green"),
          );
          scene.add(
            "line_point_1",
            new Dot(
              (scene.get_mobj("axis_point") as Dot).get_center(),
              0.04,
            ).set_color("green"),
          );
          scene.move_to_front("circle_point_1");
          scene.move_to_front("line_point_1");

          // Slope -> -3/2
          new_slope = -3 / 2;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_2",
            new Dot(
              (scene.get_mobj("floating_point") as Dot).get_center(),
              0.04,
            ).set_color("purple"),
          );
          scene.add(
            "line_point_2",
            new Dot(
              (scene.get_mobj("axis_point") as Dot).get_center(),
              0.04,
            ).set_color("purple"),
          );
          scene.move_to_front("circle_point_2");
          scene.move_to_front("line_point_2");

          // Slope -> -4/3
          new_slope = -4 / 3;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_3",
            new Dot(
              (scene.get_mobj("floating_point") as Dot).get_center(),
              0.04,
            ).set_color("yellow"),
          );
          scene.add(
            "line_point_3",
            new Dot(
              (scene.get_mobj("axis_point") as Dot).get_center(),
              0.04,
            ).set_color("yellow"),
          );
          scene.move_to_front("circle_point_3");
          scene.move_to_front("line_point_3");

          // Slope -> -5/3
          new_slope = -5 / 3;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_4",
            new Dot(
              (scene.get_mobj("floating_point") as Dot).get_center(),
              0.04,
            ).set_color("orange"),
          );
          scene.add(
            "line_point_4",
            new Dot(
              (scene.get_mobj("axis_point") as Dot).get_center(),
              0.04,
            ).set_color("orange"),
          );
          scene.move_to_front("circle_point_4");
          scene.move_to_front("line_point_4");
        },
      );
      playButton.textContent = "Play";
    })(500, 500);

    // SCENE 3:
    // - SPEECH: "These numbers should look familiar.
    // Remember that (3, 4, 5), (5, 12, 13), (7, 24, 25), and (8, 15, 17) were all Pythagorean triples. We can shrink each
    // of those Pythagorean triples down until its hypotenuse has length 1, and each one fits neatly into this unit
    // circle, with one end of the hypotenuse sitting at the origin and the other end sitting at a *rational* point
    // on this unit circle, meaning that the two coordinates x and y are each a ratio of two whole numbers. What this tells
    // us is that Pythagorean triples correspond neatly to rational points on the circle. Some Pythagorean triples, such as
    // (3, 4, 5), (6, 8, 10), and (9, 12, 15) correspond to the same rational point, so morally, these all fit into one
    // family."
    // - ANIMATION: Zoom out and show the Pythagorean triple triangles on the right, with the equation a^2 + b^2 = c^2.
    // Then write (a/c)^2 + (b/c)^2 = 1 below, and shrink each one onto the unit circle.
    // - SPEECH: "The key insight Diophantus made is this: if the slope m of the line is a rational number, then the
    // two coordinates x and y of this intersection point are also rational numbers. You can see this by plugging it into
    // the formula for the point (x, y). The opposite also holds true: if we pick a point (x, y) on the circle with both x
    // and y rational, then the slope of the line connecting (x, y) to (1, 0) is also a rational number."
    // - ANIMATION: Let the point (0, m) vary to other different rational numbers, and for each one write out the
    // Pythagorean triple.
    // - SPEECH: "What this means is that the rational points on the circle are *parametrized* by rational numbers.
    // This answers our original question in the affirmative: there are an infinite number of Pythagorean triples.
    // And it does more, by giving us a simple recipe for generating all of them."
    // - ANIMATION: Mark rational points on the line x = 0, and rational points on the circle, with color-matching.
    //
    // Draw the connection between Pythagorean triples and rational points on the circle, and then explain
    // how the latter are parametrized.
    await (async function scene_3(width: number, height: number) {
      // Make the scene
      const name = "scene-3";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-2, 20], [-2, 20]);
      scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
      scene.draw();

      // Make a button which can be clicked to progress through the scene
      let slides_played: number = 0;
      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          slides_played = 0;
          scene.clear();
          scene.set_frame_lims([-2, 20], [-2, 20]);
          scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
          scene.draw();
        },
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button") as HTMLElement,
        async function () {
          await do_scene();
        },
      );
      playButton.textContent = "Play";

      async function do_scene() {
        // Define all of the objects relevant to parametrization of the circle
        let slope, theta_slope, num_frames;
        scene.add(
          "axes",
          new CoordinateAxes2d([-2, 2], [-2.5, 2.5])
            .remove_grid_lines()
            .set_axis_options({ stroke_width: 0.05, arrow_size: 0.2 })
            .set_tick_options({ stroke_width: 0.03, size: 0.1 }),
        );
        scene.add("basepoint", new Dot([1, 0], 0.06));
        scene.add(
          "circle",
          new ParametricFunction(
            (t) => [Math.cos(t), Math.sin(t)],
            0,
            2 * Math.PI,
            num_pts,
            solver,
          ).set_stroke_width(0.04),
        );

        scene.add(
          "stereographic_line",
          new Line([1, 0], [1, 0]).set_stroke_width(0.04),
        );
        scene.add(
          "point_on_circle",
          new Dot([1, 0], 0.08).set_fill_color("gray"),
        );
        scene.add("point_on_axis", new Dot([0, 0], 0.08));

        // Line length and slope
        let l = new Parameter();
        let m = new Parameter();

        l.add_callback((x: number) => {
          slope = m.get_value();
          let direction: Vec2D = [
            1 / (slope ** 2 + 1),
            slope / (slope ** 2 + 1),
          ];
          (scene.get_mobj("stereographic_line") as Line)
            .move_start(vec2_sum([1, 0], vec2_scale(direction, x / 2)))
            .move_end(vec2_sum([1, 0], vec2_scale(direction, -x / 2)));
        });

        m.add_callback((x: number) => {
          length = l.get_value();
          let direction: Vec2D = [
            1 / Math.sqrt(x ** 2 + 1),
            x / Math.sqrt(x ** 2 + 1),
          ];
          (scene.get_mobj("point_on_circle") as Dot).move_to([
            1 - 2 / (x ** 2 + 1),
            (-2 * x) / (x ** 2 + 1),
          ]);
          (scene.get_mobj("point_on_axis") as Dot).move_to([0, -x]);
          (scene.get_mobj("stereographic_line") as Line)
            .move_start(vec2_sum([1, 0], vec2_scale(direction, length / 2)))
            .move_end(vec2_sum([1, 0], vec2_scale(direction, -length / 2)));
        });

        l.set_value(8);
        m.set_value(-1.0);

        scene.draw();

        // Add some of the Pythagorean triangles
        scene.add("3-4-5", make_triangle(4, 3, [4, 0], 0.5));
        scene.add("5-12-13", make_triangle(12, 5, [6, 0], 0.4));
        scene.add("7-24-25", make_triangle(24, 7, [9, 0], 0.3));

        // Zoom out
        await new Zoom([-2, 0], 1 / 3, 20).play(scene);

        // TODO Animate formulas

        // For each Pythagorean triple, change the line and shrink the triangles down into the unit circle

        // Slope = -2 is the 3-4-5 triangle.
        num_frames = 20;
        slope = m.get_value();
        for (let i = 1; i < num_frames; i++) {
          m.set_value(slope + smooth(i / num_frames) * (-2 - slope));
          await delay(FRAME_LENGTH);
          scene.draw();
        }
        await new Homothety(
          "3-4-5",
          scene.get_mobj("3-4-5") as MObject,
          vec2_scale([4, 0], 1 / 5 / (1 / 5 - 0.5)),
          1 / 5 / 0.5,
          num_frames,
        ).play(scene);
        await new FadeOut(["3-4-5"], 10).play(scene);
        scene.add("3-4-5-point", new Dot([0, 2], 0.06).set_color("red"));

        // Slope = -3/2 is the 5-12-13 triangle
        slope = m.get_value();
        for (let i = 1; i < num_frames; i++) {
          m.set_value(slope + smooth(i / num_frames) * (-3 / 2 - slope));
          await delay(FRAME_LENGTH);
          scene.draw();
        }
        await new Homothety(
          "5-12-13",
          scene.get_mobj("5-12-13") as MObject,
          vec2_scale([6, 0], 1 / 13 / (1 / 13 - 0.4)),
          1 / 13 / 0.4,
          num_frames,
        ).play(scene);
        await new FadeOut(["5-12-13"], 10).play(scene);
        scene.add("5-12-13-point", new Dot([0, 3 / 2], 0.06).set_color("blue"));

        // Slope = -4/3 is the 7-24-25 triangle
        slope = m.get_value();
        for (let i = 1; i < num_frames; i++) {
          m.set_value(slope + smooth(i / num_frames) * (-4 / 3 - slope));
          await delay(FRAME_LENGTH);
          scene.draw();
        }
        await new Homothety(
          "7-24-25",
          scene.get_mobj("7-24-25") as MObject,
          vec2_scale([9, 0], 1 / 25 / (1 / 25 - 0.3)),
          1 / 25 / 0.3,
          num_frames,
        ).play(scene);
        await new FadeOut(["7-24-25"], 10).play(scene);
        scene.add(
          "7-24-25-point",
          new Dot([0, 4 / 3], 0.06).set_color("orange"),
        );

        // Indicate the formula again
        await new FadeIn(
          {
            formula: new LaTeXMObject(
              "(x, y) = (\\frac{m^2-1}{m^2+1}, \\frac{2m}{m^2+1})",
              [0, -4],
              cache,
            ),
          },
          10,
        ).play(scene);

        // TODO Extend the y-axis and flash in a whole mesh of rational points

        // For several different rational points, generate the corresponding Pythagorean triples
        // TODO
      }
    })(500, 500);

    // SCENE 4:
    // - SPEECH: "I want us to step back and reflect on this solution for a moment. The Pythagorean triples problem
    // asked for all triples of integers $(a, b, c)$ satisfying the equation $a^2 + b^2 = c^2$.
    // Although the motivation for considering this equation came from geometry, this isn't really
    // a geometry question, since geometry happens in a continuous space where lengths can be
    // arbitrary real numbers, like \sqrt{2} or \pi. It's a number theory question."
    // - ANIMATION: Flash up the equation $a^2 + b^2 = c^2$. Then fade in a right triangle with sidelengths a-b-c
    // below. Move these two expressions a little farther apart while enclosing each by a bubble: geometry below,
    // and number theory above. Put some other sketches within each, such as hyperbolas, spheres, and tori below
    // and more arithmetic above (such as prime factorization, representing a product as a grid, and Pascal's
    // triangle).
    // - SPEECH: "So the fact that we could answer this question with a *geometric construction* hints at a richer
    // connection between number theory and geometry. That connection is captured by the field of math called
    // *algebraic geometry*. Diophantus' proof can be thought of as an early demonstration of algebraic geometry."
    // - ANIMATION: Create a bubble between them with some algebraic curves
    //
    await (async function scene_4(width: number, height: number) {
      // Make the scene
      const name = "scene-4";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-3, 3], [-3, 3]);
      scene.set_view_lims([-3, 3], [-3, 3]);
      scene.draw();

      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          scene.clear();
          scene.set_frame_lims([-3, 3], [-3, 3]);
          scene.set_view_lims([-3, 3], [-3, 3]);
          scene.draw();
        },
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button") as HTMLElement,
        async function () {
          await do_scene();
        },
      );
      playButton.textContent = "Play";

      async function do_scene() {}
    })(500, 500);

    // SCENE 5:
    // - SPEECH: "Let's make this more precise by going back to our unit circle, which had the equation
    // x^2 + y^2 = 1. What would happen if we replaced this with some other quadratic equation, such as
    // x^2 + xy + y^2 = 1?"
    // - ANIMATION: Deform the unit circle to the ellipse x^2 + xy + y^2 = 1.
    // - SPEECH: "For this equation, the pair $(x, y) = (1, 0)$ is again a point on the curve, which is now
    // an ellipse. We can draw a line through this basepoint of some slope $m$, and look for where it intersects
    // the curve. Here we turned to algebra: first substituting the equation of the line into the equation of
    // the curve to get a single equation for x. Because our original equation was *quadratic*, we then
    // have a quadratic equation for x, which we can solve with the quadratic formula. This yields either two
    // real roots or two complex roots -- but we know there's at least one real root coming from our basepoint --
    // so there has to be another real root, which produces a second point on the curve. This defines a stereographic
    // projection formula for this curve."
    // - ANIMATION: Highlight several steps, while animating their realizations in geometry.
    // (1) Find an initial pair $(x_0, y_0)$ satisfying the equation.
    // (2) Represent a line of slope $m$ through the point with the equation $y = m(x-x_0) + y_0$.
    // (3) Substitute this equation into the equation of the curve to get (...)
    // (4) Use the quadratic equation to find the roots in terms of m.
    // (5) Emphasize
    // - SPEECH: "Lastly, if $m$ is a *rational* number, then the second real root is a rational number. This is
    // because the sum of the two roots has to be rational, and our original chosen basepoint was rational.
    // Said another way, the stereographic projection map is a rational function of $m$."
    // - ANIMATION: List out a table of rational numbers $m$, and the corresponding rational points
    // - SPEECH: "As an aside, this equation has the same relationship to triangles with a 120 degree
    // angle as the unit circle has to right triangles: namely, if a triangle has sides of length $a, b, c$ and
    // the angle opposite $c$ measures 120 degrees, then $a^2 + ab + b^2 = c$. You can see this by applying the
    // Law of Cosines. So this method produces all triangles with all integer sidelengths and one 120 degree angle."
    // - ANIMATION: Flash up a small triangle with 120 degree angle and the law of cosines. Then list out
    // triples.
    // - SPEECH: "We can use this same stereographic projection method to parametrize rational solutions to *any*
    // quadratic equation, with one major caveat, which is that you need a rational basepoint out of which you can
    // do your stereographic projection. Some conic sections don't have any rational points at all, but if you can
    // find at least one, then there are infinitely many rational points and you can parametrize them this way."
    // - ANIMATION: Cycle through several different conic sections, with rational points marked out on each. Then
    // switch over to one with no rational points at all (x^2 + y^2 = 3).

    await (async function scene_5(width: number, height: number) {
      // Make the scene
      const name = "scene-5";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-3, 3], [-3, 3]);
      scene.set_view_lims([-3, 3], [-3, 3]);
      scene.draw();

      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          scene.clear();
          scene.set_frame_lims([-3, 3], [-3, 3]);
          scene.set_view_lims([-3, 3], [-3, 3]);
          scene.draw();
        },
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button") as HTMLElement,
        async function () {
          await do_scene();
        },
      );
      playButton.textContent = "Play";

      async function do_scene() {
        // Make a conic section whose equation is modifiable
        let cart_eq = new CartEq(1, 0, 1, 0, 0, -1);
        let polar_eq = cart_eq.to_polar();
        let conic = new ConicSection(
          cart_eq,
          polar_eq,
          num_pts,
          solver,
        ).set_stroke_width(0.04);

        // Make axes
        await new FadeIn(
          {
            axes: new CoordinateAxes2d([-3, 3], [-3, 3])
              .remove_grid_lines()
              .set_axis_options({ stroke_width: 0.05, arrow_size: 0.2 })
              .set_tick_options({ stroke_width: 0.03, size: 0.1 }),
            basepoint: new Dot([1, 0], 0.06),
            conic: conic,
          },
          20,
        ).play(scene);

        // Add a parameter which changes the conic section, and animate changing it
        let a = new Parameter().set_value(0);
        a.add_callback((m: number) => {
          (scene.get_mobj("conic") as ConicSection).set_coeffs(
            1,
            m,
            1,
            0,
            0,
            -1,
          );
        });
        await new ChangeParameterSmoothly(a, 1.0, 50).play(scene);

        // Emphasize the basepoint
        await new Emphasize(
          "basepoint",
          scene.get_mobj("basepoint") as Dot,
          20,
        ).play(scene);

        // Set up for stereographic projection
        // Line length and slope
        let m = new Parameter();
        m.set_value(-2 / 3);

        // Draw in stereographic line
        let length = 8;
        await new GrowLineFromMidpoint(
          "stereographic_line",
          new Line(
            vec2_sum((scene.get_mobj("basepoint") as Dot).get_center(), [
              length / 2,
              0,
            ]),
            vec2_sum((scene.get_mobj("basepoint") as Dot).get_center(), [
              -length / 2,
              0,
            ]),
          )
            .set_stroke_width(0.04)
            .rotate_to(Math.atan(m.get_value())),
          30,
        ).play(scene);

        // Fade in stereographically projected point and point on axis
        await new FadeIn(
          {
            point_on_curve: new Dot(
              stereographic_projection(
                cart_eq,
                (scene.get_mobj("basepoint") as Dot).get_center(),
                m.get_value(),
              ) as Vec2D,
              0.06,
            ),
            point_on_line: new Dot([0, -m.get_value()], 0.06),
          },
          20,
        ).play(scene);

        // Add callbacks which play when m is varied
        m.add_callback((s: number) => {
          // Change slope of line
          (scene.get_mobj("stereographic_line") as Line).rotate_to(
            Math.atan(s),
          );

          let bp = (scene.get_mobj("basepoint") as Dot).get_center();

          // Move point on line
          (scene.get_mobj("point_on_line") as Dot).move_to([
            0,
            bp[1] - s * bp[0],
          ]);

          // Move intersection point using stereographic projection map
          let v = stereographic_projection(cart_eq, bp, s);
          if (v == null) {
            (scene.get_mobj("point_on_curve") as Dot).move_to([100, 100]);
          } else {
            (scene.get_mobj("point_on_curve") as Dot).move_to(v);
          }
        });

        // Vary the slope
        await new ChangeParameterSmoothly(m, -1.5, 30).play(scene);

        // Vary the conic equation, and vary everything in the picture accordingly
        a.clear().set_value(0);
        a.add_callback((x: number) => {
          let conic = scene.get_mobj("conic") as ConicSection;
          conic.set_coeffs(1, 1 + 3 * x, 1, 0, 0, -1);
          // TODO Bug: this curve *should* alwayspass through (1, 0), but graphically it doesn't seem to.
          // TODO Move basepoint to lie on curve: this could be hand-crafted
          // (scene.get_mobj("basepoint") as Dot).move_to(
          //   conic.function(Math.PI / 4),
          // );
          // (scene.get_mobj("stereographic_line") as Line).move_midpoint_to(
          //   conic.function(Math.PI / 4),
          // );
          m.do_callbacks();
        });
        await new ChangeParameterSmoothly(a, 1.0, 50).play(scene);
      }
    })(500, 500);

    // SCENE 6:
    // - SPEECH: "Lastly, why doesn't this method work for other equations? For example, Fermat's Last Theorem
    // says that the equation a^n + b^n = c^n doesn't have any solutions without one of a, b, c equal to 0. If we
    // set n=3, this is equivalent to saying that the curve x^3 + y^3 = 1 doesn't have any rational points other
    // than the four shown. If you stereographically project out of one of these basepoints and try to find a formula
    // in terms of the slope $m$, you'll find it's an absolute mess. Geometrically, this can be seen
    // TODO
    // "
    // - ANIMATION: Show a quadratic equation with a sphere below it, and an elliptic curve with a torus below it.
    await (async function scene_6(width: number, height: number) {
      // Make the scene
      const name = "scene-6";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-3, 3], [-3, 3]);
      scene.set_view_lims([-3, 3], [-3, 3]);
      scene.draw();

      let resetButton = Button(
        document.getElementById(name + "-reset-button") as HTMLElement,
        function () {
          scene.clear();
          scene.set_frame_lims([-3, 3], [-3, 3]);
          scene.set_view_lims([-3, 3], [-3, 3]);
          scene.draw();
        },
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button") as HTMLElement,
        async function () {
          await do_scene();
        },
      );
      playButton.textContent = "Play";

      async function do_scene() {}
    })(500, 500);
  });
})();
