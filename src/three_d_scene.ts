import { prepare_canvas } from "./lib/base";
import {
  Vec2D,
  vec_sub,
  vec_scale,
  vec_sum_list,
  vec_sum,
  vec_norm,
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

      // INTERACTIVITY
      // Adding draggability to the canvas
      let drag: boolean = false;
      let dragStart: Vec2D;
      let dragEnd: Vec2D;
      let dragDiff: Vec2D;
      let mode: "Translate" | "Rotate" = "Translate";
      canvas.addEventListener("mousedown", function (event) {
        dragStart = [
          event.pageX - canvas.offsetLeft,
          event.pageY - canvas.offsetTop,
        ];

        drag = true;
      });
      canvas.addEventListener("mouseup", function (event) {
        drag = false;
      });
      canvas.addEventListener("mousemove", function (event) {
        if (drag) {
          dragEnd = [
            event.pageX - canvas.offsetLeft,
            event.pageY - canvas.offsetTop,
          ];
          dragDiff = vec_sub(
            scene.c2s(dragStart[0], dragStart[1]),
            scene.c2s(dragEnd[0], dragEnd[1]),
          );
          if (mode == "Translate") {
            // Translation option
            let camera_frame = scene.get_camera_frame();
            scene.translate(
              vec3_sum(
                vec3_scale(get_column(camera_frame, 0), dragDiff[0]),
                vec3_scale(get_column(camera_frame, 1), dragDiff[1]),
              ),
            );
          } else if (mode == "Rotate") {
            // Rotation option
            // Find the axis to rotate around based on the angle of dragDiff
            let v = vec2_normalize([dragDiff[1], -dragDiff[0]]);
            let camera_frame = scene.get_camera_frame();
            let rot_axis = vec3_sum(
              vec3_scale(get_column(camera_frame, 0), v[0]),
              vec3_scale(get_column(camera_frame, 1), v[1]),
            );

            // Rotate the scene frame according to the norm, as well as the camera position,
            let n = vec_norm(dragDiff);
            scene.rot(rot_axis, n);
            scene.set_camera_position(rot(scene.camera_position, rot_axis, n));
          }
          scene.draw();
          dragStart = dragEnd;
        }
      });

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
          if (mode == "Translate") {
            mode = "Rotate";
          } else if (mode == "Rotate") {
            mode = "Translate";
          } else {
            throw new Error();
          }
          modeButton.textContent = `Mode = ${mode}`;
        },
      );
      modeButton.textContent = `Mode = ${mode}`;
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
      scene.add("x-axis", new Line3D([-5, 0, 0], [5, 0, 0]));
      scene.add("y-axis", new Line3D([0, -5, 0], [0, 5, 0]));
      scene.add("z-axis", new Line3D([0, 0, -5], [0, 0, 5]));

      // INTERACTIVITY
      // Adding draggability to the canvas
      let drag: boolean = false;
      let dragStart: Vec2D;
      let dragEnd: Vec2D;
      let dragDiff: Vec2D;
      let mode: "Translate" | "Rotate" = "Translate";
      canvas.addEventListener("mousedown", function (event) {
        dragStart = [
          event.pageX - canvas.offsetLeft,
          event.pageY - canvas.offsetTop,
        ];

        drag = true;
      });
      canvas.addEventListener("mouseup", function (event) {
        drag = false;
      });
      canvas.addEventListener("mousemove", function (event) {
        if (drag) {
          dragEnd = [
            event.pageX - canvas.offsetLeft,
            event.pageY - canvas.offsetTop,
          ];
          dragDiff = vec_sub(
            scene.c2s(dragStart[0], dragStart[1]),
            scene.c2s(dragEnd[0], dragEnd[1]),
          );
          if (mode == "Translate") {
            // Translation option
            let camera_frame = scene.get_camera_frame();
            scene.translate(
              vec3_sum(
                vec3_scale(get_column(camera_frame, 0), dragDiff[0]),
                vec3_scale(get_column(camera_frame, 1), dragDiff[1]),
              ),
            );
          } else if (mode == "Rotate") {
            // Rotation option
            // Find the axis to rotate around based on the angle of dragDiff
            let v = vec2_normalize([dragDiff[1], -dragDiff[0]]);
            let camera_frame = scene.get_camera_frame();
            let rot_axis = vec3_sum(
              vec3_scale(get_column(camera_frame, 0), v[0]),
              vec3_scale(get_column(camera_frame, 1), v[1]),
            );

            // Rotate the scene frame according to the norm, as well as the camera position,
            let n = vec_norm(dragDiff);
            scene.rot(rot_axis, n);
            scene.set_camera_position(rot(scene.camera_position, rot_axis, n));
          }
          scene.draw();
          dragStart = dragEnd;
        }
      });

      // Add a button to toggle between translation and rotation modes
      let modeButton = Button(
        document.getElementById("three-d-graph-mode-button") as HTMLElement,
        function () {
          if (mode == "Translate") {
            mode = "Rotate";
          } else if (mode == "Rotate") {
            mode = "Translate";
          } else {
            throw new Error();
          }
          modeButton.textContent = `Mode = ${mode}`;
        },
      );
      modeButton.textContent = `Mode = ${mode}`;
      modeButton.style.padding = "15px";

      scene.draw();
    })(300, 300);
  });
})();
