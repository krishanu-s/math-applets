import { Scene, MObject, Vec2D } from "./base";
import { Vec3D } from "./three_d";
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
    mobj_name: string;
    mobj: MObject;
    base_alpha: number;
    num_frames: number;
    constructor(mobj_name: string, mobj: MObject, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number): Promise<void>;
}
export declare class FadeOut extends Animation {
    mobj_name: string;
    num_frames: number;
    constructor(mobj_name: string, num_frames: number);
    play(scene: Scene): Promise<void>;
    _play(scene: Scene): Promise<void>;
    _play_frame(scene: Scene, i: number, mobj: MObject, base_alpha: number): Promise<void>;
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
export {};
//# sourceMappingURL=animation.d.ts.map