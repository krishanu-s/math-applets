import { Scene, MObject, Vec2D, smooth, Line, Dot } from "./base";
import { Parameter } from "./interactive";
import { Vec3D } from "./three_d";
export declare const FRAME_LENGTH = 30;
export declare const DEFAULT_RATE_FUNC: typeof smooth;
export type RateFunc = (t: number) => number;
declare abstract class Animation {
    play(scene: Scene): Promise<void>;
}
export declare class AnimationSequence extends Animation {
    animations: Animation[];
    constructor(...animations: Animation[]);
    add(animation: Animation): void;
    play(scene: Scene): Promise<void>;
}
export declare class AnimationCollection extends Animation {
    animations: Animation[];
    constructor(...animations: Animation[]);
    add(animation: Animation): void;
    play(scene: Scene): Promise<void>;
}
export declare class Wait extends Animation {
    num_frames: number;
    constructor(num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export declare class Zoom extends Animation {
    zoom_point: Vec2D;
    zoom_ratio: number;
    num_frames: number;
    constructor(zoom_point: Vec2D, zoom_ratio: number, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export declare class FadeIn extends Animation {
    mobjects: Record<string, MObject>;
    base_alphas: Record<string, number>;
    num_frames: number;
    constructor(mobjects: Record<string, MObject>, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export declare class FadeOut extends Animation {
    mobj_names: string[];
    num_frames: number;
    constructor(mobj_names: string[], num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number, mobjects: MObject[], base_alphas: number[]): Promise<void>;
}
export declare class MoveBy extends Animation {
    mobj_name: string;
    translate_vec: Vec2D | Vec3D;
    num_frames: number;
    constructor(mobj_name: string, translate_vec: Vec2D | Vec3D, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, tv: Vec2D | Vec3D): Promise<void>;
}
export declare class Homothety extends Animation {
    mobj_name: string;
    mobj: MObject;
    center: Vec2D;
    scales: number[];
    num_frames: number;
    constructor(mobj_name: string, mobj: MObject, center: Vec2D, scale: number, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _get_scale_factor(i: number): number;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export declare class ChangeParameterSmoothly extends Animation {
    parameter: Parameter;
    to_val: number;
    num_frames: number;
    rate_func: RateFunc;
    constructor(parameter: Parameter, to_val: number, num_frames: number);
    set_rate_func(rate_func: RateFunc): this;
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
}
interface HasCenterAndRadius extends MObject {
    get_center(): Vec2D;
    get_radius(): number;
}
export declare class Emphasize extends Animation {
    mobj_name: string;
    mobj: HasCenterAndRadius;
    center: Vec2D;
    radius: number;
    num_lines: number;
    num_frames: number;
    constructor(mobj_name: string, mobj: HasCenterAndRadius, num_frames: number);
    set_num_lines(n: number): this;
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export declare class GrowShrinkDot extends Animation {
    mobj_name: string;
    mobj: Dot;
    radius: number;
    num_frames: number;
    constructor(mobj_name: string, mobj: Dot, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export declare class GrowLineFromMidpoint extends Animation {
    mobj_name: string;
    mobj: Line;
    start: Vec2D;
    end: Vec2D;
    num_frames: number;
    constructor(mobj_name: string, mobj: Line, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export {};
//# sourceMappingURL=animation.d.ts.map