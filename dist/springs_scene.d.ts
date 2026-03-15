import { MObject, Scene } from "./lib/base";
import { Simulator, SceneFromSimulator, ThreeDSceneFromSimulator } from "./lib/simulator/sim";
export declare abstract class InteractivePlayingScene extends Scene {
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
    reset(): void;
    toggle_pause(): void;
    add_to_queue(callback: () => void): void;
    play(until: number | undefined): void;
    update_mobjects(): void;
    _draw(): void;
    draw_mobject(mobj: MObject): void;
}
//# sourceMappingURL=springs_scene.d.ts.map