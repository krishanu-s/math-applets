import { ThreeDMObjectGroup, PolygonPanel3D } from "./mobjects";
import { FillOptions } from "../base";
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
//# sourceMappingURL=surfaces.d.ts.map