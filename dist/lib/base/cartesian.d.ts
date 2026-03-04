import { MObjectGroup, LineLikeMObjectGroup } from "./base";
import { Vec2D } from "./vec2";
import { TwoHeadedArrow, Polygon } from "./geometry";
import { ThreeDMObjectGroup, ThreeDLineLikeMObjectGroup, TwoHeadedArrow3D } from "../three_d/mobjects";
declare class AxisOptions {
    stroke_width: number;
    alpha: number;
    arrow_size: number;
    update(options: Partial<AxisOptions>): void;
}
declare class TickOptions {
    distance: number;
    size: number;
    alpha: number;
    stroke_width: number;
    update(options: Partial<TickOptions>): void;
}
declare class GridOptions {
    x_distance: number;
    y_distance: number;
    alpha: number;
    stroke_width: number;
    update(options: Partial<GridOptions>): void;
}
export declare class Axis extends MObjectGroup {
    lims: Vec2D;
    type: "x" | "y";
    axis_options: AxisOptions;
    tick_options: TickOptions;
    constructor(lims: Vec2D, type: "x" | "y");
    _make_axis(): void;
    _make_ticks(): void;
    axis(): TwoHeadedArrow;
    ticks(): LineLikeMObjectGroup;
    set_lims(lims: Vec2D): void;
    set_axis_options(options: Record<string, any>): void;
    set_tick_options(options: Record<string, any>): this;
    set_tick_distance(distance: number): this;
    set_tick_size(size: number): this;
}
export declare class CoordinateAxes2d extends MObjectGroup {
    xlims: Vec2D;
    ylims: Vec2D;
    axis_options: AxisOptions;
    tick_options: TickOptions;
    grid_options: GridOptions;
    constructor(xlims: Vec2D, ylims: Vec2D);
    _make_axes(): void;
    _make_x_grid_lines(): void;
    _make_y_grid_lines(): void;
    x_axis(): Axis;
    y_axis(): Axis;
    x_grid(): LineLikeMObjectGroup;
    y_grid(): LineLikeMObjectGroup;
    set_axis_options(options: Record<string, any>): this;
    set_axis_stroke_width(width: number): this;
    set_tick_options(options: Record<string, any>): this;
    set_tick_size(size: number): this;
    set_tick_distance(distance: number): this;
    set_grid_options(options: Record<string, any>): this;
    set_grid_distance(distance: number): this;
    set_grid_alpha(alpha: number): this;
    set_grid_stroke_width(width: number): this;
    set_lims(xlims: Vec2D, ylims: Vec2D): this;
}
export declare class Axis3D extends ThreeDMObjectGroup {
    lims: Vec2D;
    type: "x" | "y" | "z";
    axis_options: AxisOptions;
    tick_options: TickOptions;
    constructor(lims: Vec2D, type: "x" | "y" | "z");
    _make_axis(): void;
    _make_ticks(): void;
    axis(): TwoHeadedArrow3D;
    ticks(): ThreeDLineLikeMObjectGroup;
    set_lims(lims: Vec2D): void;
    set_axis_options(options: Record<string, any>): void;
    set_tick_options(options: Record<string, any>): void;
    set_tick_distance(distance: number): void;
    set_tick_size(size: number): void;
}
export declare class CoordinateAxes3d extends ThreeDMObjectGroup {
    xlims: Vec2D;
    ylims: Vec2D;
    zlims: Vec2D;
    axis_options: AxisOptions;
    tick_options: TickOptions;
    constructor(xlims: Vec2D, ylims: Vec2D, zlims: Vec2D);
    _make_axes(): void;
    x_axis(): Axis3D;
    y_axis(): Axis3D;
    z_axis(): Axis3D;
    set_axis_options(options: Record<string, any>): this;
    set_axis_stroke_width(width: number): void;
    set_tick_options(options: Record<string, any>): this;
    set_tick_size(size: number): void;
    set_tick_distance(distance: number): void;
}
export declare class Integral extends Polygon {
    f: (t: number) => number;
    left_endpoint: number;
    right_endpoint: number;
    num_points: number;
    constructor(f: (t: number) => number, left_endpoint: number, right_endpoint: number, num_points: number);
    _recompute_points(): void;
    set_left_endpoint(left_endpoint: number): void;
    set_right_endpoint(right_endpoint: number): void;
    set_lims(left_endpoint: number, right_endpoint: number): this;
    set_num_points(num_points: number): void;
    set_func(f: (t: number) => number): void;
}
export declare class IntegralBetween extends Polygon {
    f: (t: number) => number;
    g: (t: number) => number;
    left_endpoint: number;
    right_endpoint: number;
    num_points: number;
    constructor(f: (t: number) => number, g: (t: number) => number, left_endpoint: number, right_endpoint: number, num_points: number);
    _recompute_points(): void;
    set_left_endpoint(left_endpoint: number): this;
    set_right_endpoint(right_endpoint: number): this;
    set_lims(left_endpoint: number, right_endpoint: number): this;
    set_num_points(num_points: number): this;
    set_f(f: (t: number) => number): this;
    set_g(g: (t: number) => number): this;
}
export {};
//# sourceMappingURL=cartesian.d.ts.map