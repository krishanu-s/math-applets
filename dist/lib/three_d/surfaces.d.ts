import { ThreeDMObjectGroup, PolygonPanel3D } from "./mobjects";
import { FillOptions, Vec2D } from "../base";
import { Vec3D } from "./matvec";
import { ColorMap } from "../base/color";
import { SphericalState } from "../simulator/statesim";
import { Simulator, ThreeDSceneFromSimulator } from "../simulator/sim";
export declare class SphereHeatMap extends ThreeDMObjectGroup {
    radius: number;
    num_theta: number;
    num_phi: number;
    _spherical_state: SphericalState;
    colormap: ColorMap;
    constructor(radius: number, num_theta: number, num_phi: number);
    set_colormap(colormap: ColorMap): void;
    _make_panels(): void;
    get_panel(theta: number, phi: number): PolygonPanel3D;
    load_colors_from_array(vals: number[]): void;
}
export declare class SphereHeatMapScene extends ThreeDSceneFromSimulator {
    constructor(canvas: HTMLCanvasElement, radius: number, num_theta: number, num_phi: number);
    set_colormap(colormap: ColorMap): void;
    update_mobjects_from_simulator(simulator: Simulator): void;
}
export declare class Torus extends ThreeDMObjectGroup {
    outer_radius: number;
    inner_radius: number;
    num_phi: number;
    num_theta: number;
    fill_options: FillOptions;
    do_stroke: boolean;
    constructor(outer_radius: number, inner_radius: number, num_phi: number, num_theta: number);
    _normal_vector(phi: number, theta: number): Vec3D;
    _update_panel_brightness(light_source_vec: Vec3D, camera_depth_vec: Vec3D): this;
    set_fill_alpha(alpha: number): this;
    set_fill_color(color: string): this;
    _param(phi_rad: number, theta_rad: number): Vec3D;
    _make_panels(): void;
    _make_skeleton(): void;
}
export declare class Surface extends ThreeDMObjectGroup {
    f: (x: number, y: number) => number;
    grad_f: (x: number, y: number) => Vec3D;
    xlims: Vec2D;
    ylims: Vec2D;
    num_x: number;
    num_y: number;
    solver_x: any;
    solver_y: any;
    fill_options: FillOptions;
    do_stroke: boolean;
    constructor(f: (x: number, y: number) => number, xlims: Vec2D, ylims: Vec2D, num_x: number, num_y: number, solver_x: any, solver_y: any);
    set_grad_f(grad_f: (x: number, y: number) => Vec3D): this;
    set_fill_alpha(alpha: number): this;
    set_fill_color(color: string): this;
    set_do_stroke(d: boolean): this;
    _param(x_val: number, y_val: number): Vec3D;
    _update_panel_brightness(light_source_vec: Vec3D, camera_depth_vec: Vec3D): this;
    set_normal_vector(x: number, y: number, v: Vec3D): void;
    _set_normal_vectors(): void;
    _make_panels(): void;
    _make_skeleton(): void;
}
//# sourceMappingURL=surfaces.d.ts.map