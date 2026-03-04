import {
  Axis3D,
  CoordinateAxes3d,
  FillLikeMObject,
  FillOptions,
  prepare_canvas,
  Scene,
} from "./lib/base";
import {
  ThreeDScene,
  ThreeDMObjectGroup,
  PolygonPanel3D,
  Vec3D,
  vec3_sum,
  vec3_sub,
  vec3_scale,
  Arcball,
  LineSequence3D,
  ThreeDFillLikeMObject,
} from "./lib/three_d";
import { Torus, Surface } from "./lib/three_d/surfaces";
import { get_column, vec3_dot, vec3_normalize } from "./lib/three_d/matvec";
import { createSmoothOpenPathBezier } from "./rust-calc-browser";

// GOAL: Draw a torus with shading program on each pixel, and interactive ArcBall capability.
(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Initiate the Bezier solver for smooth curve approximation
    let num_pts = 20;
    let solver = await createSmoothOpenPathBezier(num_pts);

    await (async function make_torus(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "torus");

      // Initialize three-dimensional scene, zoomed in
      let zoom_ratio = 5.5;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_zoom(zoom_ratio);

      // Rotate the camera angle and set the camera position
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 4,
      );

      // Vector direction from which light source is coming
      const light_source: Vec3D = [1, 0, 0];

      // Add a custom torus object
      const inner_radius = 1.0;
      const outer_radius = 2.0;

      let torus = new Torus(outer_radius, inner_radius, 60, 60).set_fill_alpha(
        1.0,
      );
      torus.do_stroke = false;
      torus._update_panel_brightness(
        light_source,
        get_column(scene.camera.get_camera_frame(), 2),
      );
      scene.add("torus", torus);
      // scene.add("x-axis", new Axis3D([-10, 10], "x"));

      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add_callback(() => {
        let frame = scene.camera.get_camera_frame();
        let depth_dir = get_column(frame, 2);
        // console.log("depth dir:", depth_dir);
        torus._update_panel_brightness(light_source, depth_dir);
      });
      arcball.add();

      scene.set_view_mode("perspective");
      scene.draw();

      // // Switch the context
      // const gl = canvas.getContext("webgl");
    })(300, 300);

    await (async function make_surface(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "surface");

      // Initialize three-dimensional scene, zoomed in
      let zoom_ratio = 3.5;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-3, 3], [-3, 3]);
      scene.set_zoom(zoom_ratio);

      // Rotate the camera angle and set the camera position
      scene.camera.move_to([0, 0, -12]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 4,
      );

      scene.add(
        "axes",
        new CoordinateAxes3d(
          [-Math.PI, Math.PI],
          [-Math.PI, Math.PI],
          [-Math.PI, Math.PI],
        ).set_axis_options({
          arrow_size: 0.08,
        }),
      );

      // Vector direction from which light source is coming
      const light_source: Vec3D = [
        1 / Math.sqrt(3),
        1 / Math.sqrt(3),
        1 / Math.sqrt(3),
      ];

      // z = 1/(1 - 0.5 * (cos(x)+cos(y)))
      // Gradient is (0.5 * sin(x), 0.5 * sin(y), 1 - 0.5 * (cos(x)+cos(y)))
      let surface = new Surface(
        (x, y) => 1 / (1.01 - 0.5 * (Math.cos(x) + Math.cos(y))),
        [-Math.PI, Math.PI],
        [-Math.PI, Math.PI],
        num_pts,
        num_pts,
        solver,
        solver,
      ).set_fill_alpha(1.0);
      surface.set_do_stroke(true);
      surface.set_grad_f((x, y) => [
        Math.sin(x),
        Math.sin(y),
        2.02 - Math.cos(x) - Math.cos(y),
      ]);
      surface.do_stroke = false;
      surface._update_panel_brightness(
        light_source,
        get_column(scene.camera.get_camera_frame(), 2),
      );
      scene.add("surface", surface);

      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add_callback(() => {
        let frame = scene.camera.get_camera_frame();
        let depth_dir = get_column(frame, 2);
        surface._update_panel_brightness(light_source, depth_dir);
      });
      arcball.add();

      scene.set_view_mode("perspective");
      scene.draw();

      // // Switch the context
      // const gl = canvas.getContext("webgl");
    })(300, 300);
  });
})();
