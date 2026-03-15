import { Vec3D } from "./matvec";
import { ThreeDMObject } from "./mobjects";
import { ThreeDScene } from "./scene";
export declare class BezierSpline3D extends ThreeDMObject {
    num_steps: number;
    solver: any;
    anchors: Vec3D[];
    constructor(num_steps: number, solver: any);
    set_anchors(new_anchors: Vec3D[]): this;
    set_anchor(index: number, new_anchor: Vec3D): this;
    get_anchor(index: number): Vec3D;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
    _drawFallback(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
export declare class ParametricFunction3D extends BezierSpline3D {
    function: (t: number) => Vec3D;
    tmin: number;
    tmax: number;
    mode: "smooth" | "jagged";
    constructor(f: (t: number) => Vec3D, tmin: number, tmax: number, num_steps: number, solver: any);
    _make_anchors(): void;
    set_mode(mode: "smooth" | "jagged"): void;
    set_function(new_f: (t: number) => Vec3D): void;
    set_lims(tmin: number, tmax: number): void;
    _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene): void;
}
//# sourceMappingURL=bezier.d.ts.map