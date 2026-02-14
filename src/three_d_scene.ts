import { prepare_canvas, delay } from "./lib/base/base.js";
import {
  Vec2D,
  vec2_sub,
  vec2_scale,
  vec2_sum_list,
  vec2_sum,
  vec2_norm,
  vec2_normalize,
} from "./lib/base/vec2.js";
import {
  Vec3D,
  vec3_sum,
  vec3_sum_list,
  vec3_scale,
  normalize,
  get_column,
  matmul_vec,
  rot,
} from "./lib/three_d/matvec.js";
import { ThreeDScene } from "./lib/three_d/scene.js";
import {
  ThreeDMObject,
  Cube,
  Dot3D,
  Line3D,
  LineSequence3D,
  Arrow3D,
  TwoHeadedArrow3D,
  ParametrizedCurve3D,
  DraggableDot3D,
} from "./lib/three_d/mobjects.js";
import { Slider, Button } from "./lib/interactive.js";
import { Arcball } from "./lib/three_d/arcball.js";
import { pick_random_step } from "./random_walk_scene.js";

(async function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (async function three_d_cube(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "three-d-cube");

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
          modeButton.textContent = `Mode: ${arcball.mode}`;
        },
      );
      modeButton.textContent = `Mode: ${arcball.mode}`;
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
          scene.camera.rot_pos_and_view(axis, perturb_angle);

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
      scene.set_view_mode("orthographic");

      // Rotate the camera angle and set the camera position
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 4,
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
      );
      curve.set_stroke_color("red");
      curve.set_stroke_width(0.04);
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

    // (async function three_d_lattice(width: number, height: number) {
    //   // Graphing a function
    //   let canvas = prepare_canvas(width, height, "three-d-lattice");
    //   let [xmin, xmax] = [-6, 6];
    //   let [ymin, ymax] = [-6, 6];

    //   // Initialize three-dimensional scene, zoomed in
    //   let zoom_ratio = 1.0;
    //   let scene = new ThreeDScene(canvas);
    //   scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    //   scene.set_zoom(zoom_ratio);
    //   scene.set_view_mode("orthographic");

    //   // Rotate the camera angle and set the camera position
    //   scene.rot_z(Math.PI / 4);
    //   scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
    //   scene.set_camera_position(
    //     rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4),
    //   );

    //   // Define the grid parameters
    //   let arr_width = 5;
    //   let arr_height = 5;
    //   function eq_position(i: number, j: number): Vec3D {
    //     return [(arr_width - 1) / 2 - i, (arr_height - 1) / 2 - j, 0];
    //   }
    //   // Add lines to the scene
    //   for (let i = 0; i < arr_width - 1; i++) {
    //     for (let j = 0; j < arr_height; j++) {
    //       scene.add(
    //         `l(${i},${j})(${i + 1},${j})`,
    //         new Line3D(
    //           eq_position(i, j),
    //           eq_position(i + 1, j),
    //         ).set_stroke_width(0.05),
    //       );
    //     }
    //   }
    //   for (let i = 0; i < arr_width; i++) {
    //     for (let j = 0; j < arr_height - 1; j++) {
    //       scene.add(
    //         `l(${i},${j})(${i},${j + 1})`,
    //         new Line3D(
    //           eq_position(i, j),
    //           eq_position(i, j + 1),
    //         ).set_stroke_width(0.05),
    //       );
    //     }
    //   }

    //   // Add dots to the scene
    //   for (let i = 0; i < arr_width; i++) {
    //     for (let j = 0; j < arr_height; j++) {
    //       let dot = new DraggableDot3D(eq_position(i, j), 0.1);
    //       dot.add_callback(() => {
    //         let center = dot.get_center();
    //         if (scene.has_mobj(`l(${i},${j})(${i + 1},${j})`)) {
    //           (
    //             scene.get_mobj(`l(${i},${j})(${i + 1},${j})`) as Line3D
    //           ).move_start(center);
    //         }
    //         if (scene.has_mobj(`l(${i},${j})(${i},${j + 1})`)) {
    //           (
    //             scene.get_mobj(`l(${i},${j})(${i},${j + 1})`) as Line3D
    //           ).move_start(center);
    //         }
    //         if (scene.has_mobj(`l(${i - 1},${j})(${i},${j})`)) {
    //           (
    //             scene.get_mobj(`l(${i - 1},${j})(${i},${j})`) as Line3D
    //           ).move_end(center);
    //         }
    //         if (scene.has_mobj(`l(${i},${j - 1})(${i},${j})`)) {
    //           (
    //             scene.get_mobj(`l(${i},${j - 1})(${i},${j})`) as Line3D
    //           ).move_end(center);
    //         }
    //         scene.draw();
    //       });
    //       scene.add(`p(${i},${j})`, dot);
    //     }
    //   }

    //   // // Adding click-and-drag interactivity to the canvas
    //   // let arcball = new Arcball(scene);
    //   // arcball.add();

    //   // // Add a button to toggle between translation and rotation modes
    //   // let modeButton = Button(
    //   //   document.getElementById("three-d-lattice-mode-button") as HTMLElement,
    //   //   function () {
    //   //     arcball.switch_mode();
    //   //     modeButton.textContent = `Mode = ${arcball.mode}`;
    //   //   },
    //   // );
    //   // modeButton.textContent = `Mode = ${arcball.mode}`;
    //   // modeButton.style.padding = "15px";

    //   // Add a slider to control the zoom level
    //   let zoomSlider = Slider(
    //     document.getElementById("three-d-lattice-zoom-slider") as HTMLElement,
    //     function (value: number) {
    //       zoom_ratio = value;
    //       scene.set_zoom(value);
    //       scene.draw();
    //     },
    //     {
    //       name: "Zoom",
    //       initialValue: `${zoom_ratio}`,
    //       min: 0.5,
    //       max: 5,
    //       step: 0.05,
    //     },
    //   );
    //   zoomSlider.value = `1.0`;

    //   scene.draw();

    //   // Perform an animation
    //   let time = 0;
    //   // while (true) {
    //   //   time += 0.01;
    //   //   for (let i = 0; i < arr_width; i++) {
    //   //     for (let j = 0; j < arr_height; j++) {
    //   //       let dot = scene.get_mobj(`p(${i},${j})`) as Dot3D;
    //   //       let [x, y, z] = eq_position(i, j);
    //   //       dot.move_to([x, y, Math.sin((i + j) * time)]);
    //   //     }
    //   //   }
    //   //   scene.draw();
    //   //   await delay(10);
    //   // }
    // })(300, 300);

    (function three_d_globe(width: number, height: number) {
      let canvas = prepare_canvas(width, height, "three-d-globe");
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
      scene.camera.move_to([0, 0, -5]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        (2 * Math.PI) / 3,
      );

      // Adding click-and-drag interactivity to the canvas
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      // Add a sphere to the scene
      let radius = 2.0;
      let globe = new Dot3D([0, 0, 0], radius);
      // globe.fill = false;
      globe.set_fill_color("rgb(200 200 200)");
      globe.set_fill_alpha(0.3);
      scene.add("globe", globe);

      // Add an equator
      //
      // TODO Part of this equator should be dotted. One possible solution is to build a "link" to the globe object,
      // and then any piece (i.e. BezierCurve) of the curve whose depth is *greater* than that of the globe
      // will be drawn as dotted.
      //
      // TODO For now, use depth of the globe as a global function, but we can make this more robust by giving
      // the globe a *local* depth function which indicates its depth at a given 2D point in the camera view.
      let equator = new ParametrizedCurve3D(
        (t) => [radius * Math.cos(t), radius * Math.sin(t), 0],
        -Math.PI,
        Math.PI,
        100,
      );
      equator.set_stroke_style("solid");
      equator.set_stroke_width(0.04);
      equator.link_mobject(globe);
      scene.add("equator", equator);

      // Add a polar axis
      let polar_axis = new LineSequence3D([
        [0, 0, -1.5 * radius],
        [0, 0, -radius],
        [0, 0, radius],
        [0, 0, 1.5 * radius],
      ]);
      polar_axis.link_mobject(globe);

      let n_pole = new Dot3D([0, 0, radius], 0.1);
      n_pole.set_fill_alpha(1.0);
      n_pole.link_mobject(globe);
      let s_pole = new Dot3D([0, 0, -radius], 0.1);
      s_pole.set_fill_alpha(1.0);
      s_pole.link_mobject(globe);
      scene.add("polar_axis", polar_axis);
      scene.add("n_pole", n_pole);
      scene.add("s_pole", s_pole);

      // Add a latitude line
      let theta: number = Math.PI / 6;
      let latitude_line = new ParametrizedCurve3D(
        (t) => [
          radius * Math.cos(t) * Math.cos(theta),
          radius * Math.sin(t) * Math.cos(theta),
          radius * Math.sin(theta),
        ],
        -Math.PI,
        Math.PI,
        100,
      );
      latitude_line.set_stroke_color("red");
      latitude_line.set_stroke_width(0.04);
      latitude_line.link_mobject(globe);
      scene.add("latitude_line", latitude_line);

      // Add a slider to control the zoom level
      let zoomSlider = Slider(
        document.getElementById("three-d-globe-slider-1") as HTMLElement,
        function (value: number) {
          zoom_ratio = value;
          scene.set_zoom(value);
          scene.draw();
        },
        {
          name: "Zoom",
          initialValue: `${zoom_ratio}`,
          min: 0.3,
          max: 3,
          step: 0.02,
        },
      );

      // Add a slider to control the latitude level
      let latitudeSlider = Slider(
        document.getElementById("three-d-globe-slider-2") as HTMLElement,
        function (value: number) {
          theta = (Math.PI * value) / 180;
          latitude_line = scene.get_mobj(
            "latitude_line",
          ) as ParametrizedCurve3D;
          latitude_line.set_function((t) => [
            radius * Math.cos(t) * Math.cos(theta),
            radius * Math.sin(t) * Math.cos(theta),
            radius * Math.sin(theta),
          ]);
          scene.draw();
        },
        {
          name: "Latitude (degrees)",
          initialValue: `${(theta * 180) / Math.PI}`,
          min: -90,
          max: 90,
          step: 1,
        },
      );

      scene.draw();
    })(500, 500);

    // (async function three_d_random_walk(width: number, height: number) {
    //   // Graphing a function
    //   let canvas = prepare_canvas(width, height, "three-d-random-walk");
    //   let [xmin, xmax] = [-5, 5];
    //   let [ymin, ymax] = [-5, 5];
    //   let [zmin, zmax] = [-5, 5];

    //   // Initialize three-dimensional scene, zoomed in
    //   let zoom_ratio = 1.0;
    //   let scene = new ThreeDScene(canvas);
    //   scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    //   scene.set_zoom(zoom_ratio);
    //   scene.set_view_mode("orthographic");

    //   // Rotate the camera angle and set the camera position
    //   scene.rot_z(Math.PI / 4);
    //   scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
    //   scene.set_camera_position(
    //     rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4),
    //   );

    //   // Add graph lines with ticks
    //   let tick_size = 0.1;
    //   scene.add("x-axis", new TwoHeadedArrow3D([xmin, 0, 0], [xmax, 0, 0]));
    //   for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
    //     if (x == 0) {
    //       continue;
    //     }
    //     scene.add(
    //       `x-tick-(${x})`,
    //       new Line3D([x, 0, -tick_size], [x, 0, tick_size]),
    //     );
    //   }

    //   scene.add("y-axis", new TwoHeadedArrow3D([0, ymin, 0], [0, ymax, 0]));
    //   for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
    //     if (y == 0) {
    //       continue;
    //     }
    //     scene.add(
    //       `y-tick-(${y})`,
    //       new Line3D([-tick_size, y, 0], [tick_size, y, 0]),
    //     );
    //   }

    //   scene.add("z-axis", new TwoHeadedArrow3D([0, 0, zmin], [0, 0, zmax]));
    //   for (let z = Math.floor(zmin) + 1; z <= Math.ceil(zmax) - 1; z++) {
    //     if (z == 0) {
    //       continue;
    //     }
    //     scene.add(
    //       `z-tick-(${z})`,
    //       new Line3D([0, -tick_size, z], [0, tick_size, z]),
    //     );
    //   }

    //   scene.draw();

    //   // Animate progress of taking steps
    //   // TODO Rotate scene at the same time to help visibility.
    //   // This will then require redrawing the progress.
    //   let ctx = canvas.getContext("2d");
    //   if (!ctx) throw new Error("Failed to get 2D context");

    //   let [x, y, z] = [0, 0, 0];
    //   let dx: number, dy: number, dz: number;
    //   let [cx, cy] = scene.v2c(scene.orthographic_view([x, y, z]));
    //   ctx.beginPath();
    //   ctx.moveTo(cx, cy);
    //   ctx.strokeStyle = "red";
    //   ctx.lineWidth = 2;
    //   for (let step = 0; step < 100; step++) {
    //     [dx, dy, dz] = pick_random_step(3) as Vec3D;
    //     x += dx;
    //     y += dy;
    //     z += dz;
    //     [cx, cy] = scene.v2c(scene.orthographic_view([x, y, z]));
    //     ctx.lineTo(cx, cy);
    //     ctx.stroke();
    //     await delay(1000);
    //   }
    // })(300, 300);
  });
})();
