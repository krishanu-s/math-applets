// Click-and-drag translation on a 2D scene. This is effectively a simplified version of ArcBall.
// TODO Refactor this with ArcBall.
import {
  Scene,
  Vec2D,
  vec2_norm,
  vec2_sum,
  vec2_sub,
  vec2_scale,
  vec2_rot,
  vec2_normalize,
  vec2_angle,
  vec2_sum_list,
} from "./base";

export class SceneViewTranslator {
  scene: Scene;
  drag: boolean = false;
  dragStart: Vec2D = [0, 0];
  dragEnd: Vec2D = [0, 0];
  constructor(scene: Scene) {
    this.scene = scene;
  }
  click(event: MouseEvent) {
    this.dragStart = [
      event.pageX - this.scene.canvas.offsetLeft,
      event.pageY - this.scene.canvas.offsetTop,
    ];
    if (!this.scene.is_dragging) {
      this.drag = true;
      this.scene.click();
    }
  }
  touch(event: TouchEvent) {
    this.dragStart = [
      event.touches[0].pageX - this.scene.canvas.offsetLeft,
      event.touches[0].pageY - this.scene.canvas.offsetTop,
    ];
    if (!this.scene.is_dragging) {
      this.drag = true;
      this.scene.click();
    }
  }
  unclick(event: MouseEvent) {
    this.drag = false;
    this.scene.unclick();
  }
  untouch(event: TouchEvent) {
    this.drag = false;
    this.scene.unclick();
  }

  mouse_drag_cursor(event: MouseEvent) {
    if (this.drag) {
      this.dragEnd = [
        event.pageX - this.scene.canvas.offsetLeft,
        event.pageY - this.scene.canvas.offsetTop,
      ];
      this._drag_cursor();
    }
  }
  touch_drag_cursor(event: TouchEvent) {
    if (this.drag) {
      this.dragEnd = [
        event.touches[0].pageX - this.scene.canvas.offsetLeft,
        event.touches[0].pageY - this.scene.canvas.offsetTop,
      ];
      this._drag_cursor();
    }
  }
  // Updates the scene to account for a dragged cursor position
  _drag_cursor() {
    let dragDiff = vec2_sub(
      this.scene.c2v(this.dragStart[0], this.dragStart[1]),
      this.scene.c2v(this.dragEnd[0], this.dragEnd[1]),
    );

    // Return if no dragging has happened
    if (dragDiff[0] == 0 && dragDiff[1] == 0) {
      return;
    }

    // Otherwise...
    this.scene.move_view(dragDiff);
    this.scene.draw();
    this.dragStart = this.dragEnd;
  }
  add() {
    let self = this;
    // For desktop
    this.scene.canvas.addEventListener("mousedown", self.click.bind(self));
    this.scene.canvas.addEventListener("mouseup", self.unclick.bind(self));
    this.scene.canvas.addEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self),
    );
    // For mobile.
    this.scene.canvas.addEventListener("touchstart", self.touch.bind(self));
    this.scene.canvas.addEventListener("touchend", self.untouch.bind(self));
    this.scene.canvas.addEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self),
    );
  }
  remove() {
    let self = this;
    // For desktop
    this.scene.canvas.removeEventListener("mousedown", self.click.bind(self));
    this.scene.canvas.removeEventListener("mouseup", self.unclick.bind(self));
    this.scene.canvas.removeEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self),
    );
    // For mobile
    this.scene.canvas.removeEventListener("touchstart", self.touch.bind(self));
    this.scene.canvas.removeEventListener("touchend", self.untouch.bind(self));
    this.scene.canvas.removeEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self),
    );
  }
}
