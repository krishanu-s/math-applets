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

(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (function draggable_dots(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "draggable-dot");
      let scene = new Scene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);

      let dot_1 = new DraggableDot(1, 0, {});
      dot_1.set_radius(0.3);

      let dot_2 = new DraggableDot(-1, 0, {});
      dot_2.set_radius(0.3);

      let line = new Line([1, 0], [-1, 0], {});
      dot_1.add_callback(() => {
        let [x, y] = dot_1.get_center();
        line.move_start(x, y);
      });
      dot_2.add_callback(() => {
        let [x, y] = dot_2.get_center();
        line.move_end(x, y);
      });

      scene.add("line", line);
      scene.add("p1", dot_1);
      scene.add("p2", dot_2);

      scene.draw();
    })(300, 300);
  });
})();
