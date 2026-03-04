import { MObject, Scene } from "../base/base";
import { Vec2D } from "../base/vec2";
import { ThreeDScene, Vec3D } from "../three_d";
export interface DraggableMObject extends MObject {
    is_inside(p: Vec2D): boolean;
    is_almost_inside(p: Vec2D, tolerance: number): boolean;
    move_by(p: Vec2D): void;
}
export declare const makeDraggable: <T extends new (...args: any[]) => any>(Base: T) => {
    new (...args: any[]): {
        [x: string]: any;
        draggable_x: boolean;
        draggable_y: boolean;
        isClicked: boolean;
        dragStart: Vec2D;
        dragEnd: Vec2D;
        touch_tolerance: number;
        callbacks: (() => void)[];
        add_callback(callback: () => void): void;
        do_callbacks(): void;
        set_draggable_x(draggable: boolean): void;
        set_draggable_y(draggable: boolean): void;
        click(scene: Scene, event: MouseEvent): void;
        touch(scene: Scene, event: TouchEvent): void;
        unclick(scene: Scene, event: MouseEvent): void;
        untouch(scene: Scene, event: TouchEvent): void;
        mouse_drag_cursor(scene: Scene, event: MouseEvent): void;
        touch_drag_cursor(scene: Scene, event: TouchEvent): void;
        _drag_cursor(scene: Scene): void;
        add(scene: Scene): void;
        remove(scene: Scene): void;
    };
} & T;
export interface DraggableMObject3D extends MObject {
    is_inside(scene: ThreeDScene, view_point: Vec2D): boolean;
    is_almost_inside(scene: ThreeDScene, view_point: Vec2D, tolerance: number): boolean;
    move_by(p: Vec3D): void;
}
export declare const makeDraggable3D: <T extends new (...args: any[]) => any>(Base: T) => {
    new (...args: any[]): {
        [x: string]: any;
        draggable_x: boolean;
        draggable_y: boolean;
        draggable_z: boolean;
        isClicked: boolean;
        dragStart: Vec2D;
        dragEnd: Vec2D;
        touch_tolerance: number;
        callbacks: (() => void)[];
        add_callback(callback: () => void): void;
        do_callbacks(): void;
        set_draggable_x(draggable: boolean): void;
        set_draggable_y(draggable: boolean): void;
        set_draggable_z(draggable: boolean): void;
        click(scene: ThreeDScene, event: MouseEvent): void;
        touch(scene: ThreeDScene, event: TouchEvent): void;
        unclick(scene: ThreeDScene, event: MouseEvent): void;
        untouch(scene: ThreeDScene, event: TouchEvent): void;
        mouse_drag_cursor(scene: ThreeDScene, event: MouseEvent): void;
        touch_drag_cursor(scene: ThreeDScene, event: TouchEvent): void;
        _drag_cursor(scene: ThreeDScene): void;
        add(scene: ThreeDScene): void;
        remove(scene: ThreeDScene): void;
    };
} & T;
//# sourceMappingURL=draggable.d.ts.map