// Contains template for elements in a scene which can be clicked and dragged.
import {
  MObject,
  Scene,
  mouse_event_coords,
  touch_event_coords,
} from "../base/base";
import { Vec2D, vec2_sub, vec2_sum } from "../base/vec2";
import { ThreeDScene, Vec3D } from "../three_d";

// TODO It would be great if we could unite the 2D and 3D cases, as they're nearly identical.

// Interface for MObject which can be clicked and dragged.
export interface DraggableMObject extends MObject {
  is_inside(p: Vec2D): boolean;
  is_almost_inside(p: Vec2D, tolerance: number): boolean;
  move_by(p: Vec2D): void;
}

// Takes an existing MObject which has certain properties and methods, and makes it draggable.
export const makeDraggable = <T extends new (...args: any[]) => any>(
  Base: T,
) => {
  return class Draggable extends Base {
    draggable_x: boolean = true; // Whether the object is set as draggable in the X-direction.
    draggable_y: boolean = true; // Whether the object is set as draggable in the Y-direction.
    isClicked: boolean = false; // Whether the object is currently being clicked and dragged.
    dragStart: Vec2D = [0, 0]; // The starting position of the drag.
    dragEnd: Vec2D = [0, 0]; // The ending position of the drag.
    touch_tolerance: number = 2.0; // The extra tolerance provided for touch events.
    callbacks: (() => void)[] = []; // Callbacks which trigger when the object is dragged.
    // Adds a callback which triggers when the object is dragged
    add_callback(callback: () => void) {
      this.callbacks.push(callback);
    }
    // Performs all callbacks (called when the object is dragged)
    do_callbacks() {
      for (const callback of this.callbacks) {
        callback();
      }
    }
    // Sets the draggable property of the object
    set_draggable_x(draggable: boolean) {
      this.draggable_x = draggable;
    }
    set_draggable_y(draggable: boolean) {
      this.draggable_y = draggable;
    }
    // Triggers when the canvas is clicked.
    click(scene: Scene, event: MouseEvent) {
      this.dragStart = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      if (!scene.is_dragging) {
        this.isClicked = this.is_inside(
          scene.c2v(this.dragStart[0], this.dragStart[1]),
        );
        if (this.isClicked) {
          scene.click();
        }
      }
    }
    touch(scene: Scene, event: TouchEvent) {
      if (event.touches.length == 0) throw new Error("No touch detected");
      this.dragStart = [
        (event.touches[0] as Touch).pageX - scene.canvas.offsetLeft,
        (event.touches[0] as Touch).pageY - scene.canvas.offsetTop,
      ];
      if (!scene.is_dragging) {
        this.isClicked = this.is_almost_inside(
          scene.c2v(this.dragStart[0], this.dragStart[1]),
          this.touch_tolerance,
        );
        if (this.isClicked) {
          scene.click();
        }
      }
    }
    // Triggers when the canvas is unclicked.
    unclick(scene: Scene, event: MouseEvent) {
      if (this.isClicked) {
        scene.unclick();
      }
      this.isClicked = false;
    }
    untouch(scene: Scene, event: TouchEvent) {
      if (this.isClicked) {
        scene.unclick();
      }
      scene.unclick();
    }
    // Triggers when the mouse is dragged over the canvas.
    mouse_drag_cursor(scene: Scene, event: MouseEvent) {
      if (this.isClicked) {
        this.dragEnd = vec2_sub(mouse_event_coords(event), [
          scene.canvas.offsetLeft,
          scene.canvas.offsetTop,
        ]);
        this._drag_cursor(scene);
      }
    }
    touch_drag_cursor(scene: Scene, event: TouchEvent) {
      if (this.isClicked) {
        this.dragEnd = vec2_sub(touch_event_coords(event), [
          scene.canvas.offsetLeft,
          scene.canvas.offsetTop,
        ]);
        this._drag_cursor(scene);
      }
    }
    _drag_cursor(scene: Scene) {
      if (!this.draggable_x && !this.draggable_y) {
        return;
      }
      let translate_vec = vec2_sub(
        scene.c2s(
          this.dragEnd[0] * Number(this.draggable_x),
          this.dragEnd[1] * Number(this.draggable_y),
        ),
        scene.c2s(
          this.dragStart[0] * Number(this.draggable_x),
          this.dragStart[1] * Number(this.draggable_y),
        ),
      );
      this.move_by(translate_vec);
      this.dragStart = this.dragEnd;
      // Perform any other MObject updates necessary.
      this.do_callbacks();
      scene.draw();
    }
    add(scene: Scene) {
      let self = this;
      // For desktop
      scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
      scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
      scene.canvas.addEventListener(
        "mousemove",
        self.mouse_drag_cursor.bind(self, scene),
      );
      // For mobile
      scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
      scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
      scene.canvas.addEventListener(
        "touchmove",
        self.touch_drag_cursor.bind(self, scene),
      );
    }
    remove(scene: Scene) {
      let self = this;
      // For desktop
      scene.canvas.removeEventListener(
        "mousedown",
        this.click.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "mouseup",
        this.unclick.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "mousemove",
        this.mouse_drag_cursor.bind(self, scene),
      );
      // For mobile
      scene.canvas.removeEventListener(
        "touchstart",
        this.touch.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "touchend",
        this.untouch.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "touchmove",
        self.touch_drag_cursor.bind(self, scene),
      );
    }
  };
};

// Interface for a 3D MObject which can be clicked and dragged.
export interface DraggableMObject3D extends MObject {
  is_inside(scene: ThreeDScene, view_point: Vec2D): boolean;
  is_almost_inside(
    scene: ThreeDScene,
    view_point: Vec2D,
    tolerance: number,
  ): boolean;
  move_by(p: Vec3D): void;
}

export const makeDraggable3D = <T extends new (...args: any[]) => any>(
  Base: T,
) => {
  return class Draggable extends Base {
    draggable_x: boolean = true; // Whether the object is set as draggable in the X-direction.
    draggable_y: boolean = true; // Whether the object is set as draggable in the Y-direction.
    draggable_z: boolean = true; // Whether the object is set as draggable in the Z-direction.
    isClicked: boolean = false; // Whether the object is currently being clicked and dragged.
    dragStart: Vec2D = [0, 0]; // The starting position of the drag.
    dragEnd: Vec2D = [0, 0]; // The ending position of the drag.
    touch_tolerance: number = 2.0; // The extra tolerance provided for touch events.
    callbacks: (() => void)[] = []; // Callbacks which trigger when the object is dragged.
    // Adds a callback which triggers when the object is dragged
    add_callback(callback: () => void) {
      this.callbacks.push(callback);
    }
    // Performs all callbacks (called when the object is dragged)
    do_callbacks() {
      for (const callback of this.callbacks) {
        callback();
      }
    }
    // Sets the draggable property of the object
    set_draggable_x(draggable: boolean) {
      this.draggable_x = draggable;
    }
    set_draggable_y(draggable: boolean) {
      this.draggable_y = draggable;
    }
    set_draggable_z(draggable: boolean) {
      this.draggable_z = draggable;
    }
    // Triggers when the canvas is clicked.
    click(scene: ThreeDScene, event: MouseEvent) {
      this.dragStart = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      if (!scene.is_dragging) {
        this.isClicked = this.is_inside(
          scene,
          scene.c2v(this.dragStart[0], this.dragStart[1]),
        );
        if (this.isClicked) {
          scene.click();
        }
      }
    }
    touch(scene: ThreeDScene, event: TouchEvent) {
      this.dragStart = [
        event.touches[0].pageX - scene.canvas.offsetLeft,
        event.touches[0].pageY - scene.canvas.offsetTop,
      ];
      if (!scene.is_dragging) {
        this.isClicked = this.is_almost_inside(
          scene,
          scene.c2v(this.dragStart[0], this.dragStart[1]),
          this.touch_tolerance,
        );
        if (this.isClicked) {
          scene.click();
        }
      }
    }
    // Triggers when the canvas is unclicked.
    unclick(scene: ThreeDScene, event: MouseEvent) {
      if (this.isClicked) {
        scene.unclick();
      }
      this.isClicked = false;
    }
    untouch(scene: ThreeDScene, event: TouchEvent) {
      if (this.isClicked) {
        scene.unclick();
      }
      scene.unclick();
    }
    // Triggers when the mouse is dragged over the canvas.
    mouse_drag_cursor(scene: ThreeDScene, event: MouseEvent) {
      if (this.isClicked) {
        this.dragEnd = vec2_sub(mouse_event_coords(event), [
          scene.canvas.offsetLeft,
          scene.canvas.offsetTop,
        ]);
        this._drag_cursor(scene);
      }
    }
    touch_drag_cursor(scene: ThreeDScene, event: TouchEvent) {
      if (this.isClicked) {
        this.dragEnd = vec2_sub(touch_event_coords(event), [
          scene.canvas.offsetLeft,
          scene.canvas.offsetTop,
        ]);
        this._drag_cursor(scene);
      }
    }
    _drag_cursor(scene: ThreeDScene) {
      if (!this.draggable_x && !this.draggable_y && !this.draggable_z) return;

      let [mx, my, mz] = scene.v2w(
        vec2_sub(
          scene.c2s(this.dragEnd[0], this.dragEnd[1]),
          scene.c2s(this.dragStart[0], this.dragStart[1]),
        ),
      );

      this.move_by([
        mx * Number(this.draggable_x),
        my * Number(this.draggable_y),
        mz * Number(this.draggable_z),
      ]);
      this.dragStart = this.dragEnd;
      // Perform any other MObject updates necessary.
      this.do_callbacks();
      scene.draw();
    }
    add(scene: ThreeDScene) {
      let self = this;
      // For desktop
      scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
      scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
      scene.canvas.addEventListener(
        "mousemove",
        self.mouse_drag_cursor.bind(self, scene),
      );
      // For mobile
      scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
      scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
      scene.canvas.addEventListener(
        "touchmove",
        self.touch_drag_cursor.bind(self, scene),
      );
    }
    remove(scene: Scene) {
      let self = this;
      // For desktop
      scene.canvas.removeEventListener(
        "mousedown",
        this.click.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "mouseup",
        this.unclick.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "mousemove",
        this.mouse_drag_cursor.bind(self, scene),
      );
      // For mobile
      scene.canvas.removeEventListener(
        "touchstart",
        this.click.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "touchend",
        this.unclick.bind(self, scene),
      );
      scene.canvas.removeEventListener(
        "touchmove",
        self.mouse_drag_cursor.bind(self, scene),
      );
    }
  };
};
