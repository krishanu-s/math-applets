import { Vec3D, Mat3by3 } from "./matvec.js";
import { Scene, Vec2D } from "../base";
import { ThreeDMObject } from "./mobjects.js";
export declare class Camera3D {
    pos: Vec3D;
    camera_frame_inv: Mat3by3;
    mode: "perspective" | "orthographic";
    move_to(pos: Vec3D): void;
    move_by(v: Vec3D): void;
    get_camera_frame_inv(): Mat3by3;
    set_camera_frame_inv(frame_inv: Mat3by3): void;
    get_camera_frame(): Mat3by3;
    _to_camera_space(p: Vec3D): Vec3D;
    rot_view_z(angle: number): void;
    rot_view_y(angle: number): void;
    rot_view_x(angle: number): void;
    rot_view(axis: Vec3D, angle: number): void;
    rot_pos_and_view_z(angle: number): void;
    rot_pos_and_view_y(angle: number): void;
    rot_pos_and_view_x(angle: number): void;
    rot_pos_and_view(axis: Vec3D, angle: number): void;
    orthographic_view(p: Vec3D): Vec2D;
    perspective_view(p: Vec3D): Vec2D | null;
    depth(p: Vec3D): number;
}
export declare class ThreeDScene extends Scene {
    mobjects: Record<string, ThreeDMObject>;
    camera: Camera3D;
    mode: "perspective" | "orthographic";
    group(names: string[], group_name: string): void;
    ungroup(group_name: string): void;
    scale(): number;
    set_view_mode(mode: "perspective" | "orthographic"): void;
    camera_view(p: Vec3D): Vec2D | null;
    v2w(v: Vec2D): Vec3D;
    draw(args?: any): void;
}
//# sourceMappingURL=scene.d.ts.map