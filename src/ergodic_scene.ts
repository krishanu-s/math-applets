import {
  Scene,
  prepare_canvas,
  smooth,
  gaussianRandom,
  Vec2D,
  DraggableDot,
  Polygon,
  Dot,
  CoordinateAxes2d,
  Integral,
  IntegralBetween,
  ParametricFunction,
  LatexCache,
  LaTeXMObject,
} from "./lib/base";
import { FillLikeMObjectGroup } from "./lib/base/base";
import { SceneViewTranslator, Button, Slider } from "./lib/interactive";
import { createSmoothOpenPathBezier } from "./rust-calc-browser";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // TODO Add a depiction of the iterates of a point under the Gauss map.
    await (async function gauss_map_iterates(width: number, height: number) {
      // Initiate the Bezier solver for smooth curve approximation
      let num_pts = 100;
      let solver = await createSmoothOpenPathBezier(num_pts);

      // Set up the scene
      const name = "gauss-map";
      let canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);

      let xmin = -0.5;
      let xmax = 1.5;
      let ymin = -0.5;
      let ymax = 1.5;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);

      scene.add(
        "axes",
        new CoordinateAxes2d([xmin, xmax], [ymin, ymax])
          .set_axis_options({ arrow_size: 0.1, stroke_width: 0.03, alpha: 0.6 })
          .set_tick_options({ stroke_width: 0.04, size: 0.08, alpha: 0.6 })
          .set_grid_options({ stroke_width: 0.01, distance: 0.5 }),
      );

      // Add Gauss map regions
      let gauss_region = new Polygon([
        [1, 0],
        [0, 0],
        [0, 1],
      ])
        .set_stroke_width(0.02)
        .set_fill_alpha(0);
      for (let i = 1; i <= 50; i++) {
        gauss_region.add_point([i / 50, 1 / (1 + i / 50)]);
      }
      scene.add("gauss_region", gauss_region);

      // Define the map f: (0, 1) -> (0, 1)
      // TODO If y = 0, we could perturb it by a very small normal.
      function f(y: number): number {
        if (y == 0) {
          // Perturb very slightly
          let r = gaussianRandom(0, 0.001);
          return r - Math.floor(r);
        } else if (y < 0) {
          throw new Error(`Invalid y-value ${y}, less than 0`);
        } else if (y > 1) {
          throw new Error(`Invalid y-value ${y}, greater than 1`);
        } else {
          return 1 / y - Math.floor(1 / y);
        }
      }

      // Define the Gauss map T: Y -> Y
      function T(y: number, z: number): Vec2D {
        return [f(y), y * (1 - y * z)];
      }

      // Add point whose iterates are computed
      const num_iterates = 100;
      let dot = new DraggableDot([0.5, 0.5], 0.02).set_color("red");
      let py: number, pz: number;
      [py, pz] = dot.get_center();
      for (let i = 1; i < num_iterates; i++) {
        [py, pz] = T(py, pz);
        scene.add(
          `p_${i}`,
          new Dot([py, pz], 0.02).set_alpha((1 - i / num_iterates) ** 2),
        );
      }
      dot.add_callback(() => {
        [py, pz] = dot.get_center();
        for (let i = 1; i < num_iterates; i++) {
          [py, pz] = T(py, pz);
          (scene.get_mobj(`p_${i}`) as Dot).move_to([py, pz]);
        }
      });
      scene.add("p_0", dot);

      // Add a view translator and callbacks to update the axes and functions when the view changes
      let view_translator = new SceneViewTranslator(scene);
      view_translator.add_callback(() => {
        (scene.get_mobj("axes") as CoordinateAxes2d).set_lims(
          scene.view_xlims,
          scene.view_ylims,
        );
      });
      view_translator.add();

      scene.draw();
    })(300, 300);
  });
})();
