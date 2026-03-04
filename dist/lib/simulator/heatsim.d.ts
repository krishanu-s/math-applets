import { StateSimulator, TwoDimDrawable, SphericalDrawable, TwoDimState, SphericalState } from "./statesim.js";
export declare class HeatSimTwoDim extends StateSimulator implements TwoDimDrawable {
    width: number;
    height: number;
    heat_propagation_speed: number;
    _two_dim_state: TwoDimState;
    constructor(width: number, height: number, dt: number);
    size(): number;
    index(x: number, y: number): number;
    set_heat_propagation_speed(speed: number): void;
    get_uValues(): Array<number>;
    _get_uValues(vals: Array<number>): Array<number>;
    set_init_conditions(u0: Array<number>): void;
    laplacian_entry(vals: Array<number>, x: number, y: number): number;
    dot(vals: Array<number>, time: number): Array<number>;
}
export declare class HeatSimSpherical extends StateSimulator implements SphericalDrawable {
    num_theta: number;
    num_phi: number;
    heat_propagation_speed: number;
    _spherical_state: SphericalState;
    constructor(num_theta: number, num_phi: number, dt: number);
    size(): number;
    index(x: number, y: number): number;
    set_heat_propagation_speed(speed: number): void;
    get_uValues(): Array<number>;
    _get_uValues(vals: Array<number>): Array<number>;
    get_drawable(): Array<number>;
    set_init_conditions(u0: Array<number>): void;
    laplacian_entry(vals: Array<number>, theta: number, phi: number): number;
    dot(vals: Array<number>, time: number): Array<number>;
}
export declare class HeatSimPoles extends HeatSimSpherical {
    n_pole_temp: number;
    s_pole_temp: number;
    bump_std: number;
    bump_vals: number[];
    constructor(num_theta: number, num_phi: number, dt: number);
    _make_bump_vals(): void;
    set_n_pole_temp(temp: number): void;
    set_s_pole_temp(temp: number): void;
    set_boundary_conditions(s: Array<number>, t: number): void;
}
//# sourceMappingURL=heatsim.d.ts.map