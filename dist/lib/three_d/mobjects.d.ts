import { MObject, Scene, StrokeOptions, FillOptions, Vec2D } from "../base";
import { ThreeDScene } from "./scene";
import { Vec3D } from "./matvec";
import { DraggableMObject3D } from "../interactive/draggable";
export declare class ThreeDMObject extends MObject {
    blocked_depth_tolerance: number;
    linked_mobjects: ThreeDFillLikeMObject[];
    stroke_options: StrokeOptions;
    set_stroke_color(color: string): this;
    set_stroke_width(width: number): this;
    set_stroke_style(style: "solid" | "dashed" | "dotted"): this;
    depth(scene: ThreeDScene): number;
    depth_at(scene: ThreeDScene, view_point: Vec2D): number;
    link_mobject(mobject: ThreeDFillLikeMObject): void;
    blocked_depth_at(scene: ThreeDScene, view_point: Vec2D): number;
    is_blocked(scene: ThreeDScene, point: Vec3D): boolean;
    draw(canvas: HTMLCanvasElement, scene: ThreeDScene, simple?: boolean, args?: any): void;
    _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class ThreeDMObjectGroup extends ThreeDMObject {
    children: Record<string, ThreeDMObject>;
    add_mobj(name: string, child: ThreeDMObject): void;
    remove_mobj(name: string): void;
    move_by(p: Vec3D): void;
    clear(): void;
    get_mobj(name: string): ThreeDMObject;
    depth(scene: ThreeDScene): number;
    draw(canvas: HTMLCanvasElement, scene: ThreeDScene, args?: any): void;
}
export declare class ThreeDLineLikeMObject extends ThreeDMObject {
    set_behind_linked_mobjects(ctx: CanvasRenderingContext2D): void;
    unset_behind_linked_mobjects(ctx: CanvasRenderingContext2D): void;
    draw(canvas: HTMLCanvasElement, scene: ThreeDScene, simple?: boolean, args?: any): void;
}
export declare class ThreeDLineLikeMObjectGroup extends ThreeDMObjectGroup {
    stroke_options: StrokeOptions;
    set_stroke_color(color: string): this;
    set_stroke_width(width: number): this;
    set_stroke_style(style: "solid" | "dashed" | "dotted"): this;
    draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void;
}
export declare class ThreeDFillLikeMObject extends ThreeDMObject {
    fill_options: FillOptions;
    set_fill_color(color: string): this;
    set_color(color: string): this;
    set_fill_alpha(alpha: number): this;
    set_fill(fill: boolean): this;
    set_behind_linked_mobjects(ctx: CanvasRenderingContext2D): void;
    unset_behind_linked_mobjects(ctx: CanvasRenderingContext2D): void;
    draw(canvas: HTMLCanvasElement, scene: ThreeDScene, simple?: boolean, args?: any): void;
}
export declare class ThreeDFillLikeMObjectGroup extends ThreeDMObjectGroup {
    stroke_options: StrokeOptions;
    fill_options: FillOptions;
    set_stroke_color(color: string): this;
    set_stroke_width(width: number): this;
    set_stroke_style(style: "solid" | "dashed" | "dotted"): this;
    set_fill_color(color: string): this;
    set_color(color: string): this;
    set_fill_alpha(alpha: number): this;
    set_fill(fill: boolean): this;
    draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void;
}
export declare class Dot3D extends ThreeDFillLikeMObject implements DraggableMObject3D {
    center: Vec3D;
    radius: number;
    constructor(center: Vec3D, radius: number);
    get_center(): Vec3D;
    get_radius(): number;
    is_inside(scene: ThreeDScene, view_point: Vec2D): boolean;
    is_almost_inside(scene: ThreeDScene, view_point: Vec2D, tolerance: number): boolean;
    depth(scene: ThreeDScene): number;
    depth_at(scene: ThreeDScene, view_point: Vec2D): number;
    move_to(new_center: Vec3D): void;
    move_by(p: Vec3D): void;
    _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare const DraggableDot3D: {
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
} & typeof Dot3D;
export declare class Line3D extends ThreeDLineLikeMObject {
    start: Vec3D;
    end: Vec3D;
    constructor(start: Vec3D, end: Vec3D);
    move_start(v: Vec3D): void;
    move_end(v: Vec3D): void;
    depth(scene: ThreeDScene): number;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
    _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class LineSequence3D extends ThreeDLineLikeMObject {
    points: Vec3D[];
    constructor(points: Vec3D[]);
    add_point(point: Vec3D): void;
    remove_point(index: number): void;
    move_point(i: number, new_point: Vec3D): void;
    get_point(i: number): Vec3D;
    depth(scene: ThreeDScene): number;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
    _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class Arrow3D extends Line3D {
    arrow_size: number;
    fill_color: string;
    constructor(start: Vec3D, end: Vec3D);
    set_arrow_size(size: number): void;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class TwoHeadedArrow3D extends Line3D {
    arrow_size: number;
    fill_color: string;
    constructor(start: Vec3D, end: Vec3D);
    set_arrow_size(size: number): void;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class Cube extends ThreeDLineLikeMObject {
    center: Vec3D;
    size: number;
    constructor(center: Vec3D, size: number);
    depth(scene: ThreeDScene): number;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class ParametrizedCurve3D extends ThreeDLineLikeMObject {
    function: (t: number) => Vec3D;
    tmin: number;
    tmax: number;
    num_steps: number;
    points: Vec3D[];
    mode: "smooth" | "jagged";
    linked_mobjects: ThreeDFillLikeMObject[];
    constructor(f: (t: number) => Vec3D, tmin: number, tmax: number, num_steps: number);
    set_mode(mode: "smooth" | "jagged"): void;
    set_function(new_f: (t: number) => Vec3D): void;
    calculatePoints(): void;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
    _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class PolygonPanel3D extends ThreeDFillLikeMObject {
    points: Vec3D[];
    normal_vec: Vec3D;
    do_stroke: boolean;
    constructor(points: Vec3D[]);
    set_normal_vector(v: Vec3D): this;
    _calculate_normal_vector(): Vec3D;
    depth(scene: ThreeDScene): number;
    set_stroke(x: boolean): this;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
//# sourceMappingURL=mobjects.d.ts.map