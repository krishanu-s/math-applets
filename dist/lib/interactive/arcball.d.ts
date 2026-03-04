import { Vec2D } from "../base";
import { ThreeDScene } from "../three_d/scene.js";
export declare class Arcball {
    scene: ThreeDScene;
    drag: boolean;
    dragStart: Vec2D;
    dragEnd: Vec2D;
    dragDiff: Vec2D;
    mode: "Translate" | "Rotate";
    callbacks: (() => void)[];
    constructor(scene: ThreeDScene);
    add_callback(callback: () => void): void;
    do_callbacks(): void;
    set_mode(mode: "Translate" | "Rotate"): void;
    switch_mode(): void;
    click(event: MouseEvent): void;
    touch(event: TouchEvent): void;
    unclick(event: MouseEvent): void;
    untouch(event: TouchEvent): void;
    mouse_drag_cursor(event: MouseEvent): void;
    touch_drag_cursor(event: TouchEvent): void;
    _drag_cursor(): void;
    add(): void;
    remove(): void;
}
//# sourceMappingURL=arcball.d.ts.map