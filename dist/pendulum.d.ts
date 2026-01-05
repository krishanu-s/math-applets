import { Point2D } from "./point.js";
declare class RungeKutta2 {
    t: number;
    val: Point2D;
    f: (t: number, x: number) => number;
    constructor(t: number, val: Point2D, f: (t: number, val: number) => number);
    step(dt: number): void;
}
declare class PendulumSolver {
    l: number;
    x: number;
    v: number;
    solver: RungeKutta2;
    constructor(l: number);
    set_initial_conditions(x0: number, v0: number): void;
    kinetic_energy(v: number): number;
    potential_energy(x: number): number;
    draw(canvas: HTMLCanvasElement, scale: number): void;
    step(dt: number): void;
}
export declare class Drawer {
    container: HTMLElement;
    canvas: HTMLCanvasElement;
    element: PendulumSolver;
    requested_repaint: boolean;
    paused: boolean;
    constructor(container: HTMLElement, canvas: HTMLCanvasElement);
    set_initial_conditions(x: number, v: number): void;
    set_paused(pause: boolean): void;
    switch_mode(): void;
    tick(): void;
    request_repaint(): void;
    repaint(): void;
}
export {};
//# sourceMappingURL=pendulum.d.ts.map