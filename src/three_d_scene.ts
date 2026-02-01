import { prepare_canvas, delay } from "./lib/base";
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
  Arrow3D,
  TwoHeadedArrow3D,
  ParametrizedCurve3D,
} from "./lib/three_d.js";
import { Slider, Button, PauseButton } from "./lib/interactive.js";
import { Arcball } from "./lib/arcball.js";

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
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];

      // Initialize three-dimensional scene, zoomed in
      let zoom_ratio = 1.0;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("projection");

      // Rotate the camera angle and set the camera position
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4),
      );

      // Add graph lines with ticks
      let tick_size = 0.1;
      scene.add("x-axis", new TwoHeadedArrow3D([xmin, 0, 0], [xmax, 0, 0]));
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line3D([x, 0, -tick_size], [x, 0, tick_size]),
        );
      }

      scene.add("y-axis", new TwoHeadedArrow3D([0, ymin, 0], [0, ymax, 0]));
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y})`,
          new Line3D([-tick_size, y, 0], [tick_size, y, 0]),
        );
      }

      scene.add("z-axis", new TwoHeadedArrow3D([0, 0, zmin], [0, 0, zmax]));
      for (let z = Math.floor(zmin) + 1; z <= Math.ceil(zmax) - 1; z++) {
        if (z == 0) {
          continue;
        }
        scene.add(
          `z-tick-(${z})`,
          new Line3D([0, -tick_size, z], [0, tick_size, z]),
        );
      }

      // Add the graph of some function.
      let curve = new ParametrizedCurve3D(
        (t) => [Math.cos(t), Math.sin(t), t / Math.PI],
        -3 * Math.PI,
        3 * Math.PI,
        100,
        { stroke_color: "red", stroke_width: 0.04 },
      );
      curve.set_alpha(0.5);
      scene.add("curve", curve);

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

      // Add a slider to control the zoom level
      let zoomSlider = Slider(
        document.getElementById("three-d-graph-zoom-slider") as HTMLElement,
        function (value: number) {
          zoom_ratio = value;
          console.log(`Zoom ratio: ${zoom_ratio}`);
          scene.set_zoom(value);
          scene.draw();
        },
        {
          name: "Zoom",
          initialValue: `${zoom_ratio}`,
          min: 0.5,
          max: 5,
          step: 0.05,
        },
      );
      zoomSlider.value = `1.0`;

      scene.draw();
    })(300, 300);
  });
})();
