import { Vec2D } from "../base";
import { MultipleBranchParametricFunction } from "../base";
export declare class CartEq {
    c_xx: number;
    c_xy: number;
    c_yy: number;
    c_x: number;
    c_y: number;
    c: number;
    constructor(c_xx: number, c_xy: number, c_yy: number, c_x: number, c_y: number, c: number);
    clone(): CartEq;
    set_c_xx(c: number): this;
    set_c_xy(c: number): this;
    set_c_yy(c: number): this;
    set_c_x(c: number): this;
    set_c_y(c: number): this;
    set_c(c: number): this;
    rotate(theta: number): void;
    translate_x(a: number): void;
    translate_y(a: number): void;
    to_polar(): PolarEq;
}
export declare class PolarEq {
    focus: Vec2D;
    e: number;
    c: number;
    theta_0: number;
    constructor(focus: Vec2D, e: number, c: number, theta_0: number);
    param(t: number): Vec2D;
    set_focus(f: Vec2D): this;
    set_e(e: number): this;
    set_c(c: number): this;
    set_theta_0(theta_0: number): this;
    rotate(theta: number): void;
    translate_x(a: number): void;
    translate_y(a: number): void;
}
export declare class ConicSection extends MultipleBranchParametricFunction {
    cart_eq: CartEq;
    polar_eq: PolarEq;
    constructor(cart_eq: CartEq, polar_eq: PolarEq, num_steps: number, solver: any);
    _update(): void;
    set_coeffs(c_xx: number, c_xy: number, c_yy: number, c_x: number, c_y: number, c: number): void;
}
//# sourceMappingURL=conics.d.ts.map