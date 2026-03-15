import { LineLikeMObject, Scene, Vec2D } from ".";
import { LineLikeMObjectGroup } from "./base";
export declare class BezierSpline extends LineLikeMObject {
    num_steps: number;
    solver: any;
    anchors: Vec2D[];
    constructor(num_steps: number, solver: any);
    set_anchors(new_anchors: Vec2D[]): void;
    set_anchor(index: number, new_anchor: Vec2D): void;
    get_anchor(index: number): Vec2D;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
    _drawFallback(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class ParametricFunction extends BezierSpline {
    function: (t: number) => Vec2D;
    tmin: number;
    tmax: number;
    mode: "smooth" | "jagged";
    constructor(f: (t: number) => Vec2D, tmin: number, tmax: number, num_steps: number, solver: any);
    _make_anchors(): void;
    set_mode(mode: "smooth" | "jagged"): void;
    set_function(new_f: (t: number) => Vec2D): void;
    set_lims(tmin: number, tmax: number): void;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
}
export declare class MultipleBranchParametricFunction extends LineLikeMObjectGroup {
    num_branches: number;
    mode: "smooth" | "jagged";
    num_steps: number;
    solver: any;
    constructor(num_steps: number, solver: any);
    add_branch(f: (t: number) => Vec2D, tlims: Vec2D): void;
    del_branch(i: number): void;
    set_mode(mode: "smooth" | "jagged", i: number): void;
    set_function(new_f: (t: number) => Vec2D, i: number): void;
    set_lims(tmin: number, tmax: number, i: number): void;
    set_global_function(f: (t: number) => Vec2D, tlims: Vec2D): void;
}
//# sourceMappingURL=bezier.d.ts.map