import { prepare_canvas } from "./lib/base";
import { normalize, matmul_vec, rot } from "./lib/matvec";
import { Vec3D, ThreeDScene, ThreeDMObject, Cube } from "./lib/three_d.js";
import { Slider, Button, PauseButton } from "./lib/interactive.js";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    let width = 300;
    let height = 300;
    let canvas = prepare_canvas(width, height, "three-d-cube");

    // Initialize three-dimensional scene
    let scene = new ThreeDScene(canvas);
    scene.set_frame_lims([-5, 5], [-5, 5]);
    scene.add("cube", new Cube([0, 0, 0], 2));
    scene.rot_z(Math.PI / 4);
    scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
    scene.draw();

    // Animate an axis random varying over the sphere, and rotating
    // the camera angle by little kicks around this axis
    let axis: Vec3D = [1, 0, 0];
    let perturb_axis: Vec3D = [0, 1, 0];
    let perturb_axis_angle = Math.PI / 50;
    let perturb_angle = Math.PI / 100;
    for (let step = 0; step < 1000; step++) {
      // Make the perturbation axis into a randomly chosen vector orthogonal
      // to the axis, by rotating by a random angle around the axis
      perturb_axis = matmul_vec(
        rot(axis, Math.random() * Math.PI * 2),
        perturb_axis,
      );

      // Rotate the axis around this random perturb axis to perturb it slightly
      axis = matmul_vec(rot(perturb_axis, perturb_axis_angle), axis);

      // Rotate the scene camera around this new axis
      scene.rot(axis, perturb_angle);
      scene.draw();
      await delay(30);
    }
    // TODO Create sliders which can be used to rotate around the various axes
  });
})();
