import { Simulator } from "./sim.js";
export declare class StateSimulator extends Simulator {
    vals: Array<number>;
    state_size: number;
    constructor(state_size: number, dt: number);
    reset(): void;
    get_vals(): Array<number>;
    set_vals(vals: Array<number>): void;
    set_val(index: number, value: number): void;
    dot(vals: Array<number>, time: number): Array<number>;
    set_boundary_conditions(s: Array<number>, t: number): void;
    step_finite_diff(): void;
    step_runge_kutta(): void;
    step(): void;
}
export declare class SpringSimulator extends StateSimulator {
    stiffness: number;
    friction: number;
    constructor(stiffness: number, dt: number);
    set_stiffness(stiffness: number): void;
    set_friction(friction: number): void;
    dot(vals: Array<number>, time: number): Array<number>;
}
export interface OneDimDrawable {
    width: number;
    get_uValues(): Array<number>;
}
export interface TwoDimDrawable {
    width: number;
    height: number;
    get_uValues(): Array<number>;
}
export declare class TwoDimState {
    width: number;
    height: number;
    constructor(width: number, height: number);
    index(x: number, y: number): number;
    d_x_plus(arr: Array<number>, x: number, y: number): number;
    d_x_minus(arr: Array<number>, x: number, y: number): number;
    d_y_plus(arr: Array<number>, x: number, y: number): number;
    d_y_minus(arr: Array<number>, x: number, y: number): number;
    d_x_entry(arr: Array<number>, x: number, y: number): number;
    d_y_entry(arr: Array<number>, x: number, y: number): number;
    l_x_entry(arr: Array<number>, x: number, y: number): number;
    l_y_entry(arr: Array<number>, x: number, y: number): number;
}
export interface SphericalDrawable {
    num_theta: number;
    num_phi: number;
    get_uValues(): Array<number>;
    get_drawable(): Array<number>;
}
export declare class SphericalState {
    num_theta: number;
    num_phi: number;
    constructor(num_theta: number, num_phi: number);
    index(theta: number, phi: number): number;
    new_arr(): Array<number>;
    downshift_values(vals: Array<number>): Array<number>;
    dtheta(): number;
    dphi(): number;
    get_val(arr: Array<number>, theta: number, phi: number): number;
    l_entry(arr: Array<number>, theta: number, phi: number): number;
}
//# sourceMappingURL=statesim.d.ts.map