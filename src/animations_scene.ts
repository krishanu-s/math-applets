// Showcasing animations

import { CoordinateAxes3d, prepare_canvas, Scene } from "./lib/base";
import { Dot3D, ThreeDScene, Arcball } from "./lib/three_d";
import { Button } from "./lib/interactive";
import {
  AnimationSequence,
  FadeIn,
  FadeOut,
  Zoom,
  MoveBy,
} from "./lib/animation";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (function animation(width: number, height: number) {
      // Does an animation
      const name = "animation";
      let canvas = prepare_canvas(width, height, name);
      let scene = new ThreeDScene(canvas);

      // Set default scene data
      let zoom_ratio = 1.0;
      scene.set_frame_lims([-4, 4], [-4, 4]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");

      // Move the camera
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3,
      );

      // Add axes
      // scene.add(
      //   "axes",
      //   new CoordinateAxes3d([-4, 4], [-4, 4], [-4, 4]).set_axis_options({
      //     stroke_width: 0.02,
      //   }),
      // );

      // Adding click-and-drag interactivity to the canvas
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      // Make fade animations
      let fade_in_anims = new AnimationSequence();
      for (let i = 0; i <= 4; i++) {
        fade_in_anims.add(
          new FadeIn(`p_${i}`, new Dot3D([i - 2, 0, 0], 0.2), 15),
        );
      }

      let fade_out_anims = new AnimationSequence();
      for (let i = 0; i <= 4; i++) {
        fade_out_anims.add(new FadeOut(`p_${i}`, 15));
      }

      // Make zoom animations
      let zoom_in = new Zoom([0, 0], 2, 15);
      let zoom_out = new Zoom([0, 0], 0.5, 15);

      // Make movement animations
      let moveLeft = new MoveBy("points", [1, 0, 0], 15);
      let moveRight = new MoveBy("points", [-1, 0, 0], 15);

      // Button which plays the fade-in / fade-out animation
      let faded_in = false;
      let animButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        async function () {
          if (faded_in) {
            scene.ungroup("points");
            await fade_out_anims.play(scene);
            animButton.textContent = "Fade In";
          } else {
            await fade_in_anims.play(scene);
            scene.group(["p_0", "p_1", "p_2", "p_3", "p_4"], "points");
            animButton.textContent = "Fade Out";
          }
          faded_in = !faded_in;
        },
      );
      animButton.textContent = "Fade In";

      // Button which zooms in
      let zoomInButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        function () {
          zoom_in.play(scene);
        },
      );
      zoomInButton.textContent = "Zoom In";

      // Button which zooms out
      let zoomOutButton = Button(
        document.getElementById(name + "-button-3") as HTMLElement,
        function () {
          zoom_out.play(scene);
        },
      );
      zoomOutButton.textContent = "Zoom Out";

      // Button which moves the objects left
      let moveLeftButton = Button(
        document.getElementById(name + "-button-4") as HTMLElement,
        function () {
          moveLeft.play(scene);
        },
      );
      moveLeftButton.textContent = "Move dots left";

      // Button which moves the objects right
      let moveRightButton = Button(
        document.getElementById(name + "-button-5") as HTMLElement,
        function () {
          moveRight.play(scene);
        },
      );
      moveRightButton.textContent = "Move dots right";
    })(300, 300);
  });
})();
