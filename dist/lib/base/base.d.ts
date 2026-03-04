import { Vec2D } from "./vec2";
import { Vec3D } from "../three_d/matvec";
export declare function clamp(x: number, xmin: number, xmax: number): number;
export declare function sigmoid(x: number): number;
export declare function linspace(start: number, stop: number, num: number): number[];
export declare function funspace(func: (x: number) => number, start: number, stop: number, num: number): number[];
export declare function gaussianRandom(mean: number, stdev: number): number;
export declare function gaussian_normal_pdf(mean: number, stdev: number, x: number): number;
export declare function delay(ms: number): Promise<unknown>;
export declare function smooth(t: number, inflection?: number): number;
export declare class StrokeOptions {
    stroke_width: number;
    stroke_color: string;
    stroke_style: "solid" | "dashed" | "dotted";
    set_stroke_color(color: string): this;
    set_stroke_width(width: number): this;
    set_stroke_style(style: "solid" | "dashed" | "dotted"): this;
    apply_to(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class FillOptions {
    fill_color: string;
    fill_alpha: number;
    fill: boolean;
    set_fill_color(color: string): this;
    set_fill_alpha(alpha: number): this;
    set_fill(fill: boolean): this;
    apply_to(ctx: CanvasRenderingContext2D): void;
}
export declare class MObject {
    alpha: number;
    constructor();
    set_alpha(alpha: number): this;
    move_by(p: Vec2D | Vec3D): void;
    add(scene: Scene): void;
    draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene, args?: any): void;
}
export declare class MObjectGroup extends MObject {
    children: Record<string, MObject>;
    add_mobj(name: string, child: MObject): void;
    remove_mobj(name: string): void;
    move_by(p: Vec2D | Vec3D): void;
    clear(): void;
    get_mobj(name: string): MObject;
    draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void;
}
export declare class LineLikeMObject extends MObject {
    stroke_options: StrokeOptions;
    set_stroke_color(color: string): this;
    set_stroke_width(width: number): this;
    set_stroke_style(style: "solid" | "dashed" | "dotted"): this;
    draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void;
}
export declare class LineLikeMObjectGroup extends MObjectGroup {
    stroke_options: StrokeOptions;
    set_stroke_color(color: string): this;
    set_stroke_width(width: number): this;
    set_stroke_style(style: "solid" | "dashed" | "dotted"): this;
    draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void;
}
export declare class FillLikeMObject extends MObject {
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
export declare class FillLikeMObjectGroup extends MObjectGroup {
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
export declare class Scene {
    canvas: HTMLCanvasElement;
    background_color: string;
    border_width: number;
    border_color: string;
    mobjects: Record<string, MObject>;
    xlims: Vec2D;
    ylims: Vec2D;
    view_xlims: Vec2D;
    view_ylims: Vec2D;
    zoom_ratio: number;
    is_dragging: boolean;
    constructor(canvas: HTMLCanvasElement);
    click(): void;
    unclick(): void;
    set_frame_lims(xlims: Vec2D, ylims: Vec2D): void;
    set_view_lims(xlims: Vec2D, ylims: Vec2D): void;
    get_view_center(): Vec2D;
    set_zoom(value: number): void;
    zoom_in_on(ratio: number, center: Vec2D): void;
    move_view(v: Vec2D): void;
    scale(): number;
    s2c(x: number, y: number): [number, number];
    v2c(v: Vec2D): Vec2D;
    c2s(x: number, y: number): [number, number];
    c2v(x: number, y: number): [number, number];
    add(name: string, mobj: MObject): void;
    remove(name: string): void;
    group(names: string[], group_name: string): void;
    ungroup(group_name: string): void;
    clear(): void;
    has_mobj(name: string): boolean;
    get_mobj(name: string): MObject;
    draw(args?: any): void;
    _draw(): void;
    draw_mobject(mobj: MObject): void;
    draw_background(ctx: CanvasRenderingContext2D): void;
    draw_border(ctx: CanvasRenderingContext2D): void;
}
export declare function prepare_canvas(width: number, height: number, name: string): HTMLCanvasElement;
export declare function prepareCanvasForMobile(canvas: HTMLCanvasElement): void;
export declare function mouse_event_coords(event: MouseEvent): Vec2D;
export declare function touch_event_coords(event: TouchEvent): Vec2D;
//# sourceMappingURL=base.d.ts.map