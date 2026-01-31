import { prepare_canvas } from "./lib/base";
import {
  Vec2D,
  vec2_sub,
  vec2_scale,
  vec2_sum_list,
  vec2_sum,
  vec2_norm,
  vec2_normalize,
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
} from "./lib/three_d.js";
import { Slider, Button, PauseButton } from "./lib/interactive.js";
import { Arcball } from "./lib/arcball.js";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (async function three_d_cube(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "three-d-cube");

      // Initialize three-dimensional scene, zoomed in
      let zoom_ratio = 3.5;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_view_lims(
        [-5 / zoom_ratio, 5 / zoom_ratio],
        [-5 / zoom_ratio, 5 / zoom_ratio],
      );

      // Rotate the camera angle and set the camera position
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4),
      );

      // Add cube and dot to the scene
      scene.add("cube", new Cube([0, 0, 0], 3));
      scene.add("dot", new Dot3D([0, 0, 0], 0.05));
      scene.draw();

      // Adding click-and-drag interactivity to the canvas
      let arcball = new Arcball(scene);
      arcball.add();

      // ANIMATION
      // Vary an axis continuously, and rotate the camera angle by little kicks around this axis
      let playing = true;
      let pauseButton = Button(
        document.getElementById("three-d-cube-pause-button") as HTMLElement,
        function () {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        },
      );
      pauseButton.textContent = "Pause simulation";
      pauseButton.style.padding = "15px";

      let modeButton = Button(
        document.getElementById("three-d-cube-mode-button") as HTMLElement,
        function () {
          arcball.switch_mode();
          modeButton.textContent = `Mode = ${arcball.mode}`;
        },
      );
      modeButton.textContent = `Mode = ${arcball.mode}`;
      modeButton.style.padding = "15px";

      let axis: Vec3D = [1, 0, 0];
      let perturb_angle = Math.PI / 200;
      let perturb_axis: Vec3D = [0, 1, 0];
      let perturb_axis_angle = Math.PI / 50;
      while (true) {
        if (playing) {
          // Make the perturbation axis into a randomly chosen vector orthogonal
          // to the axis, by rotating by a random angle around the axis
          perturb_axis = rot(perturb_axis, axis, Math.random() * Math.PI * 2);

          // Rotate the axis around this random perturb axis to perturb it slightly
          axis = rot(axis, perturb_axis, perturb_axis_angle);

          // Rotate the camera frame and position around this new axis
          scene.rot(axis, perturb_angle);
          scene.camera_position = rot(
            scene.camera_position,
            axis,
            perturb_angle,
          );

          // Redraw the scene
          scene.draw();
        }
        await delay(10);
      }
    })(300, 300);

    (function three_d_graph(width: number, height: number) {
      // Graphing a function

      let canvas = prepare_canvas(width, height, "three-d-graph");

      // Initialize three-dimensional scene, zoomed in
      let zoom_ratio = 1.0;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_view_lims(
        [-5 / zoom_ratio, 5 / zoom_ratio],
        [-5 / zoom_ratio, 5 / zoom_ratio],
      );
      scene.set_view_mode("projection");

      // Rotate the camera angle and set the camera position
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4),
      );

      // Add graph lines
      // TODO Use double-sided arrows
      scene.add("x-axis", new Line3D([-5, 0, 0], [5, 0, 0]));
      scene.add("y-axis", new Line3D([0, -5, 0], [0, 5, 0]));
      scene.add("z-axis", new Line3D([0, 0, -5], [0, 0, 5]));

      // TODO Add ticks

      // Adding click-and-drag interactivity to the canvas
      let arcball = new Arcball(scene);
      arcball.add();

      // Add a button to toggle between translation and rotation modes
      let modeButton = Button(
        document.getElementById("three-d-graph-mode-button") as HTMLElement,
        function () {
          arcball.switch_mode();
          modeButton.textContent = `Mode = ${arcball.mode}`;
        },
      );
      modeButton.textContent = `Mode = ${arcball.mode}`;
      modeButton.style.padding = "15px";

      scene.draw();
    })(300, 300);
  });
})();
