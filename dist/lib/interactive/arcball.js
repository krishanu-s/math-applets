// An interface for user click-and-drag interaction with a 3D object.
// Ref: https://graphicsinterface.org/wp-content/uploads/gi1992-18.pdf
import { vec2_norm, vec2_sub, vec2_normalize, } from "../base";
import { matmul_vec, } from "../three_d/matvec.js";
export class Arcball {
    constructor(scene) {
        this.drag = false;
        this.dragStart = [0, 0];
        this.dragEnd = [0, 0];
        this.dragDiff = [0, 0];
        this.mode = "Translate";
        this.callbacks = []; // Callbacks which trigger when the arcball is dragged
        this.scene = scene;
    }
    // Adds a callback which triggers when the arcball is dragged
    add_callback(callback) {
        this.callbacks.push(callback);
    }
    // Performs all callbacks
    do_callbacks() {
        for (const callback of this.callbacks) {
            callback();
        }
    }
    set_mode(mode) {
        this.mode = mode;
    }
    switch_mode() {
        this.mode = this.mode == "Translate" ? "Rotate" : "Translate";
    }
    click(event) {
        this.dragStart = [
            event.pageX - this.scene.canvas.offsetLeft,
            event.pageY - this.scene.canvas.offsetTop,
        ];
        if (!this.scene.is_dragging) {
            this.drag = true;
            this.scene.click();
        }
    }
    touch(event) {
        let touch = event.touches[0];
        this.dragStart = [
            touch.pageX - this.scene.canvas.offsetLeft,
            touch.pageY - this.scene.canvas.offsetTop,
        ];
        this.drag = true;
    }
    unclick(event) {
        this.drag = false;
        this.scene.unclick();
    }
    untouch(event) {
        this.drag = false;
    }
    mouse_drag_cursor(event) {
        if (this.drag) {
            this.dragEnd = [
                event.pageX - this.scene.canvas.offsetLeft,
                event.pageY - this.scene.canvas.offsetTop,
            ];
            this._drag_cursor();
        }
    }
    touch_drag_cursor(event) {
        if (this.drag) {
            let touch = event.touches[0];
            this.dragEnd = [
                touch.pageX - this.scene.canvas.offsetLeft,
                touch.pageY - this.scene.canvas.offsetTop,
            ];
            this._drag_cursor();
        }
    }
    // Updates the scene to account for a dragged cursor position
    _drag_cursor() {
        let dragDiff = vec2_sub(this.scene.c2v(this.dragStart[0], this.dragStart[1]), this.scene.c2v(this.dragEnd[0], this.dragEnd[1]));
        // Return if no dragging has happened
        if (dragDiff[0] == 0 && dragDiff[1] == 0) {
            return;
        }
        // Otherwise...
        if (this.mode == "Translate") {
            // Translation option
            this.scene.camera.move_by(matmul_vec(this.scene.camera.get_camera_frame(), [
                dragDiff[0],
                dragDiff[1],
                0,
            ]));
        }
        else if (this.mode == "Rotate") {
            // Rotation option
            // Find the axis to rotate around based on the angle of dragDiff
            let v = vec2_normalize([dragDiff[1], -dragDiff[0]]);
            let rot_axis = matmul_vec(this.scene.camera.get_camera_frame(), [
                v[0],
                v[1],
                0,
            ]);
            // Rotate the scene frame according to the norm, as well as the camera position,
            let n = vec2_norm(dragDiff);
            this.scene.camera.rot_pos_and_view(rot_axis, n);
        }
        this.dragStart = this.dragEnd;
        this.do_callbacks();
        this.scene.draw();
    }
    add() {
        let self = this;
        // For desktop
        this.scene.canvas.addEventListener("mousedown", self.click.bind(self));
        this.scene.canvas.addEventListener("mouseup", self.unclick.bind(self));
        this.scene.canvas.addEventListener("mousemove", self.mouse_drag_cursor.bind(self));
        // For mobile.
        this.scene.canvas.addEventListener("touchstart", self.touch.bind(self));
        this.scene.canvas.addEventListener("touchend", self.untouch.bind(self));
        this.scene.canvas.addEventListener("touchmove", self.touch_drag_cursor.bind(self));
    }
    remove() {
        let self = this;
        // For desktop
        this.scene.canvas.removeEventListener("mousedown", self.click.bind(self));
        this.scene.canvas.removeEventListener("mouseup", self.unclick.bind(self));
        this.scene.canvas.removeEventListener("mousemove", self.mouse_drag_cursor.bind(self));
        // For mobile
        this.scene.canvas.removeEventListener("touchstart", self.touch.bind(self));
        this.scene.canvas.removeEventListener("touchend", self.untouch.bind(self));
        this.scene.canvas.removeEventListener("touchmove", self.touch_drag_cursor.bind(self));
    }
}
//# sourceMappingURL=arcball.js.map