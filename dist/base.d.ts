export declare class MObject {
    constructor();
    draw(canvas: HTMLCanvasElement, scene: Scene): void;
}
export declare class Dot extends MObject {
    center: [number, number];
    radius: number;
    constructor(center_x: number, center_y: number, radius: number);
    get_center(): [number, number];
    move_to(x: number, y: number): void;
    set_radius(radius: number): void;
    draw(canvas: HTMLCanvasElement, scene: Scene): void;
}
export declare class Line extends MObject {
    start: [number, number];
    end: [number, number];
    width: number;
    constructor(start: [number, number], end: [number, number], width: number);
    move_start(x: number, y: number): void;
    move_end(x: number, y: number): void;
    draw(canvas: HTMLCanvasElement, scene: Scene): void;
}
export declare class Scene {
    canvas: HTMLCanvasElement;
    mobjects: Record<string, MObject>;
    xlims: [number, number];
    ylims: [number, number];
    constructor(canvas: HTMLCanvasElement);
    set_frame_lims(xlims: [number, number], ylims: [number, number]): void;
    s2c(x: number, y: number): [number, number];
    c2s(x: number, y: number): [number, number];
    add(name: string, mobj: MObject): void;
    get_mobj(name: string): MObject;
    draw(): void;
    tick(): void;
    start_playing(): void;
}
export declare function Slider(container: HTMLElement, callback: Function, initial_value: string): HTMLInputElement;
//# sourceMappingURL=base.d.ts.map