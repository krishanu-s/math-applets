import { LineLikeMObject, FillLikeMObject, Scene } from "./base.js";
import { Vec2D } from "./vec2.js";
import { DraggableMObject } from "../interactive/draggable.js";
export declare class Dot extends FillLikeMObject implements DraggableMObject {
    center: Vec2D;
    radius: number;
    constructor(center: Vec2D, radius: number);
    is_inside(p: Vec2D): boolean;
    is_almost_inside(p: Vec2D, tolerance: number): boolean;
    get_center(): Vec2D;
    move_to(p: Vec2D): void;
    move_by(p: Vec2D): void;
    set_radius(radius: number): this;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class Sector extends FillLikeMObject {
    center: Vec2D;
    radius: number;
    start_angle: number;
    end_angle: number;
    constructor(center: Vec2D, radius: number, start_angle: number, end_angle: number);
    get_center(): Vec2D;
    move_to(center: Vec2D): void;
    move_by(p: Vec2D): void;
    set_radius(radius: number): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare const DraggableDot: {
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
} & typeof Dot;
export declare class Rectangle extends FillLikeMObject implements DraggableMObject {
    center: Vec2D;
    size_x: number;
    size_y: number;
    constructor(center: Vec2D, size_x: number, size_y: number);
    is_inside(p: Vec2D): boolean;
    is_almost_inside(p: Vec2D, tolerance: number): boolean;
    get_center(): Vec2D;
    move_to(center: Vec2D): void;
    move_by(p: Vec2D): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class Polygon extends FillLikeMObject {
    points: Vec2D[];
    constructor(points: Vec2D[]);
    add_point(point: Vec2D): void;
    remove_point(index: number): void;
    move_point(i: number, new_point: Vec2D): void;
    move_by(p: Vec2D): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare const DraggableRectangle: {
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
} & typeof Rectangle;
export declare class Line extends LineLikeMObject {
    start: Vec2D;
    end: Vec2D;
    constructor(start: Vec2D, end: Vec2D);
    move_start(p: Vec2D): this;
    move_end(p: Vec2D): this;
    move_by(p: Vec2D): this;
    length(): number;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class LineSequence extends LineLikeMObject {
    points: Vec2D[];
    constructor(points: Vec2D[]);
    add_point(point: Vec2D): void;
    remove_point(index: number): void;
    move_point(i: number, new_point: Vec2D): void;
    get_point(i: number): Vec2D;
    move_by(p: Vec2D): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class Arrow extends Line {
    arrow_size: number;
    set_arrow_size(size: number): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class TwoHeadedArrow extends Line {
    arrow_size: number;
    set_arrow_size(size: number): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class LineSpring extends Line {
    mode: "color" | "spring";
    eq_length: number;
    constructor(start: [number, number], end: [number, number]);
    set_mode(mode: "color" | "spring"): void;
    set_eq_length(length: number): void;
    length(): number;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
//# sourceMappingURL=geometry.d.ts.map