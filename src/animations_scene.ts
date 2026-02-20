// Showcasing animations

import { prepare_canvas, Scene } from "./lib/base";
import { Dot3D, ThreeDScene } from "./lib/three_d";
import { Button } from "./lib/interactive";
import { AnimationSequence, FadeIn, ZoomIn } from "./lib/animation";

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
      scene.camera.move_to([0, 0, -4]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3,
      );

      let anims = new AnimationSequence();
      for (let i = -2; i <= 2; i++) {
        anims.add(new FadeIn(`p_${i}`, new Dot3D([i, 0, 0], 0.2), 30));
      }

      // Button which plays the animation
      let animButton = Button(
        document.getElementById(name + "-button-1") as HTMLElement,
        function () {
          scene.clear();
          anims.play(scene);
        },
      );
      animButton.textContent = "Play";
    })(300, 300);
  });
})();
