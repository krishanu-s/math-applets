import { MObject, Vec2D } from "../base";
import { SceneFromSimulator } from "../simulator/sim";
import { StateSimulator, TwoDimDrawable, TwoDimState } from "./statesim.js";
import { InteractivePlayingThreeDScene } from "./sim.js";
import { Vec3D } from "../three_d/matvec.js";
export declare class PointSourceOneDim {
    x: number;
    w: number;
    a: number;
    p: number;
    turn_on_time: number;
    constructor(x: number, w: number, a: number, p: number);
    set_x(x: number): void;
    set_w(w: number): void;
    set_a(a: number): void;
    set_p(p: number): void;
    set_turn_on_time(time: number): void;
}
export declare class PointSource {
    x: number;
    y: number;
    w: number;
    a: number;
    p: number;
    turn_on_time: number;
    constructor(x: number, y: number, w: number, a: number, p: number);
    set_x(x: number): void;
    set_y(y: number): void;
    set_w(w: number): void;
    set_a(a: number): void;
    set_p(p: number): void;
    set_turn_on_time(time: number): void;
}
export declare class WaveSimOneDim extends StateSimulator {
    width: number;
    pml_layers: Record<number, [number, number]>;
    wave_propagation_speed: number;
    damping: number;
    left_endpoint: number;
    right_endpoint: number;
    point_sources: Record<number, PointSourceOneDim>;
    constructor(width: number, dt: number);
    remove_pml_layers(): void;
    set_pml_layer(positive: boolean, pml_width: number, pml_strength: number): void;
    sigma_x(arr_x: number): number;
    set_damping(damping: number): void;
    damping_at(arr_x: number): number;
    set_wave_propagation_speed(speed: number): void;
    add_point_source(source: PointSourceOneDim): void;
    remove_point_source(id: number): void;
    set_left_endpoint(endpoint: number): void;
    set_right_endpoint(endpoint: number): void;
    get_uValues(): Array<number>;
    set_uValues(vals: Array<number>): void;
    _get_uValues(vals: Array<number>): Array<number>;
    set_vValues(vals: Array<number>): void;
    _get_vValues(vals: Array<number>): Array<number>;
    laplacian_entry(vals: Array<number>, x: number): number;
    dot(vals: Array<number>, time: number): Array<number>;
    set_boundary_conditions(vals: Array<number>): void;
}
export declare class WaveSimOneDimScene extends SceneFromSimulator {
    mode: "curve" | "dots";
    arrow_length_scale: number;
    include_arrows: boolean;
    width: number;
    constructor(canvas: HTMLCanvasElement, width: number);
    add_curve(): Promise<void>;
    set_mode(mode: "curve" | "dots"): void;
    set_arrow_length_scale(scale: number): void;
    set_dot_radius(radius: number): void;
    set_frame_lims(xlims: [number, number], ylims: [number, number]): void;
    eq_position(i: number): Vec2D;
    toggle_pause(): void;
    toggle_unpause(): void;
    update_mobjects_from_simulator(sim: WaveSimOneDim): void;
    _draw(): void;
    draw_mobject(mobj: MObject): void;
}
export declare class WaveSimTwoDim extends StateSimulator implements TwoDimDrawable {
    width: number;
    height: number;
    pml_layers: Record<number, [number, number]>;
    wave_propagation_speed: number;
    _two_dim_state: TwoDimState;
    point_sources: Record<number, PointSource>;
    clamp_value: number;
    constructor(width: number, height: number, dt: number);
    set_init_conditions(x0: Array<number>, v0: Array<number>): void;
    add_point_source(source: PointSource): void;
    modify_point_source_x(index: number, x: number): void;
    modify_point_source_y(index: number, y: number): void;
    modify_point_source_amplitude(index: number, amplitude: number): void;
    modify_point_source_frequency(index: number, frequency: number): void;
    modify_point_source_phase(index: number, phase: number): void;
    remove_point_source(id: number): void;
    size(): number;
    index(x: number, y: number): number;
    get_uValues(): Array<number>;
    _get_uValues(vals: Array<number>): Array<number>;
    _get_vValues(vals: Array<number>): Array<number>;
    _get_pxValues(vals: Array<number>): Array<number>;
    _get_pyValues(vals: Array<number>): Array<number>;
    remove_pml_layers(): void;
    set_pml_layer(x_direction: boolean, positive: boolean, pml_width: number, pml_strength: number): void;
    sigma_x(arr_x: number): number;
    sigma_y(arr_y: number): number;
    d_x_plus(arr: Array<number>, x: number, y: number): number;
    d_x_minus(arr: Array<number>, x: number, y: number): number;
    d_y_plus(arr: Array<number>, x: number, y: number): number;
    d_y_minus(arr: Array<number>, x: number, y: number): number;
    d_x_entry(arr: Array<number>, x: number, y: number): number;
    d_y_entry(arr: Array<number>, x: number, y: number): number;
    l_x_entry(arr: Array<number>, x: number, y: number): number;
    l_y_entry(arr: Array<number>, x: number, y: number): number;
    laplacian_entry(vals: Array<number>, x: number, y: number): number;
    wps(x: number, y: number): number;
    dot(vals: Array<number>, time: number): Array<number>;
    set_boundary_conditions(s: Array<number>, t: number): void;
}
interface Reflector {
    x_pos_mask: Array<number>;
    x_neg_mask: Array<number>;
    y_pos_mask: Array<number>;
    y_neg_mask: Array<number>;
    inside_region(x: number, y: number): boolean;
    _recalculate_masks(): void;
    _calc_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
    _calc_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
    get_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
    get_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
}
export declare class WaveSimTwoDimReflector extends WaveSimTwoDim implements Reflector {
    x_pos_mask: Array<number>;
    x_neg_mask: Array<number>;
    y_pos_mask: Array<number>;
    y_neg_mask: Array<number>;
    constructor(width: number, height: number, dt: number);
    set_attr(name: string, val: any): void;
    inside_region(x: number, y: number): boolean;
    _x_plus(x: number, y: number): number;
    _x_minus(x: number, y: number): number;
    _y_plus(x: number, y: number): number;
    _y_minus(x: number, y: number): number;
    _recalculate_masks(): void;
    _calc_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
    _calc_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
    zero_outside_region(): void;
    get_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
    get_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
    d_x_entry(arr: Array<number>, x: number, y: number): number;
    d_y_entry(arr: Array<number>, x: number, y: number): number;
    l_x_entry(arr: Array<number>, x: number, y: number): number;
    l_y_entry(arr: Array<number>, x: number, y: number): number;
}
export declare class WaveSimTwoDimEllipticReflector extends WaveSimTwoDimReflector {
    semimajor_axis: number;
    semiminor_axis: number;
    w: number;
    a: number;
    foci: [Vec2D, Vec2D];
    constructor(width: number, height: number, dt: number);
    _recalculate_foci(): void;
    set_attr(name: string, val: any): void;
    inside_region(x_arr: number, y_arr: number): boolean;
    _x_plus(x: number, y: number): number;
    _x_minus(x: number, y: number): number;
    _y_plus(x: number, y: number): number;
    _y_minus(x: number, y: number): number;
}
export declare class WaveSimTwoDimParabolaReflector extends WaveSimTwoDimReflector {
}
export declare class WaveSimTwoDimPointsHeatmapScene extends SceneFromSimulator {
    width: number;
    height: number;
    constructor(canvas: HTMLCanvasElement, width: number, height: number);
    construct_scene(): void;
    set_frame_lims(xlims: Vec2D, ylims: Vec2D): void;
    eq_position(i: number, j: number): Vec2D;
    update_mobjects_from_simulator(sim: WaveSimTwoDim): void;
}
export declare class WaveSimTwoDimHeatMapScene extends SceneFromSimulator {
    imageData: ImageData;
    constructor(canvas: HTMLCanvasElement, imageData: ImageData, width: number, height: number);
    update_mobjects_from_simulator(simulator: WaveSimTwoDim): void;
    draw_mobject(mobj: MObject): void;
}
export declare class WaveSimTwoDimThreeDScene extends InteractivePlayingThreeDScene {
    rotation_speed: number;
    width: number;
    height: number;
    simulator: WaveSimTwoDim;
    constructor(canvas: HTMLCanvasElement, simulator: WaveSimTwoDim, width: number, height: number);
    width_buffer(): number;
    height_buffer(): number;
    construct_scene(): void;
    set_frame_lims(xlims: Vec2D, ylims: Vec2D): void;
    set_rotation_speed(speed: number): void;
    eq_position(i: number, j: number): Vec3D;
    add_callbacks(i: number, j: number, dot: DraggableDot3D): void;
    get_simulator(ind?: number): WaveSimTwoDim;
    toggle_pause(): void;
    update_mobjects(): void;
    draw_mobject(mobj: MObject): void;
}
export {};
//# sourceMappingURL=wavesim.d.ts.map