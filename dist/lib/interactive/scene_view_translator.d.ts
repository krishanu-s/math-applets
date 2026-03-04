import { Scene, Vec2D } from "../base";
export declare class SceneViewTranslator {
    scene: Scene;
    drag: boolean;
    dragStart: Vec2D;
    dragEnd: Vec2D;
    callbacks: (() => void)[];
    constructor(scene: Scene);
    add_callback(callback: () => void): this;
    do_callbacks(): void;
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
//# sourceMappingURL=scene_view_translator.d.ts.map