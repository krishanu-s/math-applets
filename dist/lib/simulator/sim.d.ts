import { Scene, MObject } from "../base";
import { ThreeDScene } from "../three_d/scene.js";
export declare abstract class Simulator {
    time: number;
    dt: number;
    constructor(dt: number);
    reset(): void;
    step(): void;
    set_attr(name: string, val: any): void;
    get_drawable(): number[];
    get_uValues(): number[];
    get_time(): number;
    get_dt(): number;
}
export declare abstract class InteractivePlayingThreeDScene extends ThreeDScene {
    simulators: Record<number, Simulator>;
    num_simulators: number;
    action_queue: Array<CallableFunction>;
    paused: boolean;
    time: number;
    dt: number;
    end_time: number | undefined;
    linked_scenes: Array<SceneFromSimulator | ThreeDSceneFromSimulator>;
    constructor(canvas: HTMLCanvasElement, simulators: Array<Simulator>);
    add_linked_scene(scene: SceneFromSimulator | ThreeDSceneFromSimulator): void;
    add_pause_button(container: HTMLElement): HTMLButtonElement;
    get_simulator(ind?: number): Simulator;
    set_simulator_attr(simulator_ind: number, attr_name: string, attr_val: number): void;
    update_and_draw_linked_scenes(): void;
    reset(): void;
    toggle_pause(): void;
    add_to_queue(callback: () => void): void;
    play(until: number | undefined): void;
    update_mobjects(): void;
    draw(): void;
    draw_mobject(mobj: MObject): void;
}
export declare class SceneFromSimulator extends Scene {
    constructor(canvas: HTMLCanvasElement);
    reset(): void;
    update_mobjects_from_simulator(simulator: Simulator): void;
    toggle_pause(): void;
    toggle_unpause(): void;
}
export declare class ThreeDSceneFromSimulator extends ThreeDScene {
    constructor(canvas: HTMLCanvasElement);
    reset(): void;
    update_mobjects_from_simulator(simulator: Simulator): void;
    toggle_pause(): void;
    toggle_unpause(): void;
}
export declare class InteractiveHandler {
    simulator: Simulator;
    scenes: Array<SceneFromSimulator | ThreeDSceneFromSimulator>;
    action_queue: Array<CallableFunction>;
    paused: boolean;
    time: number;
    dt: number;
    end_time: number | undefined;
    num_steps_per_frame: number;
    constructor(simulator: Simulator);
    add_scene(scene: SceneFromSimulator | ThreeDSceneFromSimulator): void;
    draw(): void;
    get_simulator(): Simulator;
    set_simulator_attr(simulator_ind: number, attr_name: string, attr_val: number): void;
    set_num_steps_per_frame(num_steps: number): this;
    add_pause_button(container: HTMLElement): HTMLButtonElement;
    reset(): void;
    toggle_pause(): void;
    add_to_queue(callback: () => void): void;
    play(until: number | undefined): Promise<void>;
}
//# sourceMappingURL=sim.d.ts.map