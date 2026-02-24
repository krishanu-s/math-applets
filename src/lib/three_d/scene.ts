import {
  Vec3D,
  vec3_sum,
  vec3_sub,
  matmul_vec,
  matmul_mat,
  mat_inv,
  Mat3by3,
  rot_z_matrix,
  rot_y_matrix,
  rot_x_matrix,
  rot_matrix,
  rot,
  rot_x,
  rot_y,
  rot_z,
} from "./matvec.js";
import { Scene, Vec2D } from "../base";
import {
  ThreeDMObject,
  ThreeDLineLikeMObject,
  ThreeDFillLikeMObject,
  ThreeDMObjectGroup,
} from "./mobjects.js";

// Functionality related to the 3D scene camera
export class Camera3D {
  // Position of the camera in 3D space
  pos: Vec3D = [0, 0, 0];
  // The 0th, 1st, and 2nd columns of the camera frame matrix are the
  // x-direction, y-direction, and z-direction of the camera view, respectively.
  // The inverse of the camera frame matrix is the main object that is manipulated.
  camera_frame_inv: Mat3by3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  // Determines whether retrieval of the 2D view is perspective or orthographic.
  mode: "perspective" | "orthographic" = "perspective";
  // Set the camera position
  move_to(pos: Vec3D) {
    this.pos = pos;
  }
  // Translate the camera matrix by a given vector
  move_by(v: Vec3D) {
    this.pos = vec3_sum(this.pos, v);
  }
  // Get the camera frame inverse matrix
  get_camera_frame_inv() {
    return this.camera_frame_inv;
  }
  // Set the camera frame inverse matrix
  set_camera_frame_inv(frame_inv: Mat3by3) {
    this.camera_frame_inv = frame_inv;
  }
  // Get the camera frame matrix
  get_camera_frame() {
    return mat_inv(this.camera_frame_inv);
  }
  // Converts a point to camera space
  _to_camera_space(p: Vec3D): Vec3D {
    return matmul_vec(this.camera_frame_inv, vec3_sub(p, this.pos));
  }

  // Rotate the camera matrix around the z-axis.
  rot_view_z(angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_z_matrix(-angle),
    );
  }
  // Rotate the camera matrix around the y-axis.
  rot_view_y(angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_y_matrix(-angle),
    );
  }
  // Rotate the camera matrix around the x-axis.
  rot_view_x(angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_x_matrix(-angle),
    );
  }
  // Rotate the camera matrix around a given axis
  rot_view(axis: Vec3D, angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_matrix(axis, -angle),
    );
  }
  // Rotates the camera view around various axes
  rot_pos_and_view_z(angle: number) {
    this.rot_view_z(angle);
    this.move_to(rot_z(this.pos, angle));
  }
  rot_pos_and_view_y(angle: number) {
    this.rot_view_y(angle);
    this.move_to(rot_y(this.pos, angle));
  }
  rot_pos_and_view_x(angle: number) {
    this.rot_view_x(angle);
    this.move_to(rot_x(this.pos, angle));
  }
  rot_pos_and_view(axis: Vec3D, angle: number) {
    this.rot_view(axis, angle);
    this.move_to(rot(this.pos, axis, angle));
  }
  // Projects a 3D point onto the camera view plane. Does not include perspective.
  orthographic_view(p: Vec3D): Vec2D {
    let [vx, vy, vz] = this._to_camera_space(p);
    return [vx, vy];
  }
  // Projects a 3D point onto the camera view plane, and then divides by the third coordinate.
  // Returns null if the third coordinate is nonpositive (i.e., the point is behind the camera).
  perspective_view(p: Vec3D): Vec2D | null {
    let [vx, vy, vz] = this._to_camera_space(p);
    if (vz <= 0) {
      return null;
    } else {
      return [vx / vz, vy / vz];
    }
  }
  // Returns the depth of a point in camera space
  depth(p: Vec3D): number {
    let [vx, vy, vz] = this._to_camera_space(p);
    return vz;
  }
}

// Rendering three-dimensional scenes.
// Drawing three-dimensional objects begins with projecting them onto
// the two-dimensional plane orthogonal to the camera's view direction.
//
// The camera position is given by a vector v0, and its
// view frame is given by an orthogonal matrix A = [v1, v2, v3].
// Here, v3 is the direction in which the camera is pointing.
//
// Rendering a point v first consists of computing A^{-1}(v - v0). Then the first two coordinates
// of Av are the 2D coordinates of the rendering, while the third coordinate is the depth.
export class ThreeDScene extends Scene {
  mobjects: Record<string, ThreeDMObject> = {};
  camera: Camera3D = new Camera3D();
  mode: "perspective" | "orthographic" = "perspective";
  // Groups a collection of mobjects as a MObjectGroup
  group(names: string[], group_name: string) {
    let group = new ThreeDMObjectGroup();
    names.forEach((name) => {
      group.add_mobj(name, this.get_mobj(name) as ThreeDMObject);
      delete this.mobjects[name];
    });
    this.add(group_name, group);
  }
  // Ungroups a MObjectGroup
  ungroup(group_name: string) {
    let group = this.mobjects[group_name] as ThreeDMObjectGroup;
    if (group == undefined) throw new Error(`${group_name} not found`);
    Object.entries(group.children).forEach(([mobj_name, mobj]) => {
      this.add(mobj_name, mobj as ThreeDMObject);
    });
    delete this.mobjects[group_name];
  }
  // Number of canvas pixels occupied by a horizontal shift of 1 in scene coordinates
  scale() {
    let [xmin, xmax] = this.xlims;
    return this.canvas.width / (xmax - xmin);
  }
  // Modes of viewing/drawing
  set_view_mode(mode: "perspective" | "orthographic") {
    this.mode = mode;
  }
  camera_view(p: Vec3D): Vec2D | null {
    if (this.mode == "perspective") {
      return this.camera.perspective_view(p);
    } else {
      return this.camera.orthographic_view(p);
    }
  }
  // Converts a 2D vector in the view to world coordinates
  v2w(v: Vec2D): Vec3D {
    let frame = this.camera.get_camera_frame();
    return matmul_vec(frame, [v[0], v[1], 0]);
  }
  // Draw
  draw(args?: any) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.draw_background(ctx);

    let ordered_names = Object.keys(this.mobjects).sort((a, b) => {
      let depth_a = (this.mobjects[a] as ThreeDMObject).depth(this);
      let depth_b = (this.mobjects[b] as ThreeDMObject).depth(this);
      return depth_b - depth_a;
    });

    // Then draw them in order: first the FillLike objects, then the LineLike objects, then others.
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (mobj instanceof ThreeDFillLikeMObject) {
        mobj.draw(this.canvas, this);
      }
    }
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (mobj instanceof ThreeDLineLikeMObject) {
        mobj.draw(this.canvas, this);
      }
    }
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (
        !(mobj instanceof ThreeDFillLikeMObject) &&
        !(mobj instanceof ThreeDLineLikeMObject)
      ) {
        mobj.draw(this.canvas, this);
      }
    }

    this.draw_border(ctx);
  }
}
