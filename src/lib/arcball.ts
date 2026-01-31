// An interface for user click-and-drag interaction with a 3D object.
// Ref: https://graphicsinterface.org/wp-content/uploads/gi1992-18.pdf

import { Vec2D, vec2_normalize, vec_sub, vec_norm } from "./base_geom.js";
import { vec3_sum, vec3_scale, ThreeDScene } from "./three_d.js";
import { normalize, get_column, matmul_vec, rot } from "./matvec";

export class Arcball {
  scene: ThreeDScene;
  drag: boolean = false;
  dragStart: Vec2D = [0, 0];
  dragEnd: Vec2D = [0, 0];
  dragDiff: Vec2D = [0, 0];
  mode: "Translate" | "Rotate" = "Translate";
  constructor(scene: ThreeDScene) {
    this.scene = scene;
  }
  set_mode(mode: "Translate" | "Rotate") {
    this.mode = mode;
  }
  switch_mode() {
    this.mode = this.mode == "Translate" ? "Rotate" : "Translate";
  }
  click(event: MouseEvent) {
    this.dragStart = [
      event.pageX - this.scene.canvas.offsetLeft,
      event.pageY - this.scene.canvas.offsetTop,
    ];
    this.drag = true;
  }
  unclick(event: MouseEvent) {
    this.drag = false;
  }
  drag_cursor(event: MouseEvent) {
    if (this.drag) {
      this.dragEnd = [
        event.pageX - this.scene.canvas.offsetLeft,
        event.pageY - this.scene.canvas.offsetTop,
      ];
      this.dragDiff = vec_sub(
        this.scene.c2s(this.dragStart[0], this.dragStart[1]),
        this.scene.c2s(this.dragEnd[0], this.dragEnd[1]),
      );

      // Return if no dragging has happened
      if (this.dragDiff[0] == 0 && this.dragDiff[1] == 0) {
        return;
      }

      // Otherwise...
      if (this.mode == "Translate") {
        // Translation option
        let camera_frame = this.scene.get_camera_frame();
        this.scene.translate(
          vec3_sum(
            vec3_scale(get_column(camera_frame, 0), this.dragDiff[0]),
            vec3_scale(get_column(camera_frame, 1), this.dragDiff[1]),
          ),
        );
      } else if (this.mode == "Rotate") {
        // Rotation option
        // Find the axis to rotate around based on the angle of dragDiff
        let v = vec2_normalize([this.dragDiff[1], -this.dragDiff[0]]);
        let camera_frame = this.scene.get_camera_frame();
        let rot_axis = vec3_sum(
          vec3_scale(get_column(camera_frame, 0), v[0]),
          vec3_scale(get_column(camera_frame, 1), v[1]),
        );

        // Rotate the scene frame according to the norm, as well as the camera position,
        let n = vec_norm(this.dragDiff);
        this.scene.rot(rot_axis, n);
        this.scene.set_camera_position(
          rot(this.scene.camera_position, rot_axis, n),
        );
      }
      this.scene.draw();
      this.dragStart = this.dragEnd;
    }
  }
  add() {
    let self = this;
    this.scene.canvas.addEventListener("mousedown", self.click.bind(self));
    this.scene.canvas.addEventListener("mouseup", self.unclick.bind(self));
    this.scene.canvas.addEventListener(
      "mousemove",
      self.drag_cursor.bind(self),
    );
    console.log("Arcball added");
  }
  remove() {
    let self = this;
    this.scene.canvas.removeEventListener("mousedown", self.click);
    this.scene.canvas.removeEventListener("mouseup", self.unclick);
    this.scene.canvas.removeEventListener("mousemove", self.drag_cursor);
  }
}
