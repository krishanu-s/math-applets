// Contains template for elements in a scene which can be clicked and dragged.
import { mouse_event_coords, touch_event_coords, } from "../base/base";
import { vec2_sub } from "../base/vec2";
// Takes an existing MObject which has certain properties and methods, and makes it draggable.
export const makeDraggable = (Base) => {
    return class Draggable extends Base {
        constructor() {
            super(...arguments);
            this.draggable_x = true; // Whether the object is set as draggable in the X-direction.
            this.draggable_y = true; // Whether the object is set as draggable in the Y-direction.
            this.isClicked = false; // Whether the object is currently being clicked and dragged.
            this.dragStart = [0, 0]; // The starting position of the drag.
            this.dragEnd = [0, 0]; // The ending position of the drag.
            this.touch_tolerance = 2.0; // The extra tolerance provided for touch events.
            this.callbacks = []; // Callbacks which trigger when the object is dragged.
        }
        // Adds a callback which triggers when the object is dragged
        add_callback(callback) {
            this.callbacks.push(callback);
        }
        // Performs all callbacks (called when the object is dragged)
        do_callbacks() {
            for (const callback of this.callbacks) {
                callback();
            }
        }
        // Sets the draggable property of the object
        set_draggable_x(draggable) {
            this.draggable_x = draggable;
        }
        set_draggable_y(draggable) {
            this.draggable_y = draggable;
        }
        // Triggers when the canvas is clicked.
        click(scene, event) {
            this.dragStart = vec2_sub(mouse_event_coords(event), [
                scene.canvas.offsetLeft,
                scene.canvas.offsetTop,
            ]);
            if (!scene.is_dragging) {
                this.isClicked = this.is_inside(scene.c2v(this.dragStart[0], this.dragStart[1]));
                if (this.isClicked) {
                    scene.click();
                }
            }
        }
        touch(scene, event) {
            if (event.touches.length == 0)
                throw new Error("No touch detected");
            let touch = event.touches[0];
            this.dragStart = [
                touch.pageX - scene.canvas.offsetLeft,
                touch.pageY - scene.canvas.offsetTop,
            ];
            if (!scene.is_dragging) {
                this.isClicked = this.is_almost_inside(scene.c2v(this.dragStart[0], this.dragStart[1]), this.touch_tolerance);
                if (this.isClicked) {
                    scene.click();
                }
            }
        }
        // Triggers when the canvas is unclicked.
        unclick(scene, event) {
            if (this.isClicked) {
                scene.unclick();
            }
            this.isClicked = false;
        }
        untouch(scene, event) {
            if (this.isClicked) {
                scene.unclick();
            }
            scene.unclick();
        }
        // Triggers when the mouse is dragged over the canvas.
        mouse_drag_cursor(scene, event) {
            if (this.isClicked) {
                this.dragEnd = vec2_sub(mouse_event_coords(event), [
                    scene.canvas.offsetLeft,
                    scene.canvas.offsetTop,
                ]);
                this._drag_cursor(scene);
            }
        }
        touch_drag_cursor(scene, event) {
            if (this.isClicked) {
                this.dragEnd = vec2_sub(touch_event_coords(event), [
                    scene.canvas.offsetLeft,
                    scene.canvas.offsetTop,
                ]);
                this._drag_cursor(scene);
            }
        }
        _drag_cursor(scene) {
            if (!this.draggable_x && !this.draggable_y) {
                return;
            }
            let translate_vec = vec2_sub(scene.c2s(this.dragEnd[0] * Number(this.draggable_x), this.dragEnd[1] * Number(this.draggable_y)), scene.c2s(this.dragStart[0] * Number(this.draggable_x), this.dragStart[1] * Number(this.draggable_y)));
            this.move_by(translate_vec);
            this.dragStart = this.dragEnd;
            // Perform any other MObject updates necessary.
            this.do_callbacks();
            scene.draw();
        }
        add(scene) {
            let self = this;
            // For desktop
            scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
            scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
            scene.canvas.addEventListener("mousemove", self.mouse_drag_cursor.bind(self, scene));
            // For mobile
            scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
            scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
            scene.canvas.addEventListener("touchmove", self.touch_drag_cursor.bind(self, scene));
        }
        remove(scene) {
            let self = this;
            // For desktop
            scene.canvas.removeEventListener("mousedown", this.click.bind(self, scene));
            scene.canvas.removeEventListener("mouseup", this.unclick.bind(self, scene));
            scene.canvas.removeEventListener("mousemove", this.mouse_drag_cursor.bind(self, scene));
            // For mobile
            scene.canvas.removeEventListener("touchstart", this.touch.bind(self, scene));
            scene.canvas.removeEventListener("touchend", this.untouch.bind(self, scene));
            scene.canvas.removeEventListener("touchmove", self.touch_drag_cursor.bind(self, scene));
        }
    };
};
export const makeDraggable3D = (Base) => {
    return class Draggable extends Base {
        constructor() {
            super(...arguments);
            this.draggable_x = true; // Whether the object is set as draggable in the X-direction.
            this.draggable_y = true; // Whether the object is set as draggable in the Y-direction.
            this.draggable_z = true; // Whether the object is set as draggable in the Z-direction.
            this.isClicked = false; // Whether the object is currently being clicked and dragged.
            this.dragStart = [0, 0]; // The starting position of the drag.
            this.dragEnd = [0, 0]; // The ending position of the drag.
            this.touch_tolerance = 2.0; // The extra tolerance provided for touch events.
            this.callbacks = []; // Callbacks which trigger when the object is dragged.
        }
        // Adds a callback which triggers when the object is dragged
        add_callback(callback) {
            this.callbacks.push(callback);
        }
        // Performs all callbacks (called when the object is dragged)
        do_callbacks() {
            for (const callback of this.callbacks) {
                callback();
            }
        }
        // Sets the draggable property of the object
        set_draggable_x(draggable) {
            this.draggable_x = draggable;
        }
        set_draggable_y(draggable) {
            this.draggable_y = draggable;
        }
        set_draggable_z(draggable) {
            this.draggable_z = draggable;
        }
        // Triggers when the canvas is clicked.
        click(scene, event) {
            this.dragStart = vec2_sub(mouse_event_coords(event), [
                scene.canvas.offsetLeft,
                scene.canvas.offsetTop,
            ]);
            if (!scene.is_dragging) {
                this.isClicked = this.is_inside(scene, scene.c2v(this.dragStart[0], this.dragStart[1]));
                if (this.isClicked) {
                    scene.click();
                }
            }
        }
        touch(scene, event) {
            let touch = event.touches[0];
            this.dragStart = [
                touch.pageX - scene.canvas.offsetLeft,
                touch.pageY - scene.canvas.offsetTop,
            ];
            if (!scene.is_dragging) {
                this.isClicked = this.is_almost_inside(scene, scene.c2v(this.dragStart[0], this.dragStart[1]), this.touch_tolerance);
                if (this.isClicked) {
                    scene.click();
                }
            }
        }
        // Triggers when the canvas is unclicked.
        unclick(scene, event) {
            if (this.isClicked) {
                scene.unclick();
            }
            this.isClicked = false;
        }
        untouch(scene, event) {
            if (this.isClicked) {
                scene.unclick();
            }
            scene.unclick();
        }
        // Triggers when the mouse is dragged over the canvas.
        mouse_drag_cursor(scene, event) {
            if (this.isClicked) {
                this.dragEnd = vec2_sub(mouse_event_coords(event), [
                    scene.canvas.offsetLeft,
                    scene.canvas.offsetTop,
                ]);
                this._drag_cursor(scene);
            }
        }
        touch_drag_cursor(scene, event) {
            if (this.isClicked) {
                this.dragEnd = vec2_sub(touch_event_coords(event), [
                    scene.canvas.offsetLeft,
                    scene.canvas.offsetTop,
                ]);
                this._drag_cursor(scene);
            }
        }
        _drag_cursor(scene) {
            if (!this.draggable_x && !this.draggable_y && !this.draggable_z)
                return;
            let [mx, my, mz] = scene.v2w(vec2_sub(scene.c2s(this.dragEnd[0], this.dragEnd[1]), scene.c2s(this.dragStart[0], this.dragStart[1])));
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
        add(scene) {
            let self = this;
            // For desktop
            scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
            scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
            scene.canvas.addEventListener("mousemove", self.mouse_drag_cursor.bind(self, scene));
            // For mobile
            scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
            scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
            scene.canvas.addEventListener("touchmove", self.touch_drag_cursor.bind(self, scene));
        }
        remove(scene) {
            let self = this;
            // For desktop
            scene.canvas.removeEventListener("mousedown", this.click.bind(self, scene));
            scene.canvas.removeEventListener("mouseup", this.unclick.bind(self, scene));
            scene.canvas.removeEventListener("mousemove", this.mouse_drag_cursor.bind(self, scene));
            // For mobile
            scene.canvas.removeEventListener("touchstart", this.touch.bind(self, scene));
            scene.canvas.removeEventListener("touchend", this.untouch.bind(self, scene));
            scene.canvas.removeEventListener("touchmove", self.touch_drag_cursor.bind(self, scene));
        }
    };
};
//# sourceMappingURL=draggable.js.map