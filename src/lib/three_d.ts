// Three-dimensional geometry and transformations.

// Three-dimensional objects are specified by points in 3D space.

import { MObject, Scene } from "./base.js";
import { Vec2D } from "./base_geom.js";
import {
  Mat3by3,
  matmul_vec,
  matmul_mat,
  rot_z,
  rot_y,
  rot_x,
  rot,
} from "./matvec.js";

export type Vec3D = [number, number, number];

export function vec3_norm(x: Vec3D): number {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2 + x[2] ** 2);
}

export function vec3_dot(v: Vec3D, w: Vec3D): number {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += (v[i] as number) * (w[i] as number);
  }
  return result;
}

export function vec3_scale(x: Vec3D, factor: number): Vec3D {
  return [x[0] * factor, x[1] * factor, x[2] * factor];
}

export function vec3_sum(x: Vec3D, y: Vec3D): Vec3D {
  return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
}

export function vec3_sum_list(xs: Vec3D[]): Vec3D {
  return xs.reduce((acc, x) => vec3_sum(acc, x), [0, 0, 0]);
}

export function vec3_sub(x: Vec3D, y: Vec3D): Vec3D {
  return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
}

// Three-dimensional objects.
export class ThreeDMObject extends MObject {}

// A cube.
export class Cube extends ThreeDMObject {
  center: Vec3D;
  size: number;
  stroke_width: number;
  stroke_color: string;
  constructor(center: Vec3D, size: number) {
    super();
    this.center = center;
    this.size = size;
    this.stroke_width = 0.05;
    this.stroke_color = "black";
  }
  draw(canvas: HTMLCanvasElement, scene: ThreeDScene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;

    // First, generate all of the vertices of the cube as Vec3D's.
    const vertices = [
      vec3_sum(this.center, vec3_scale([1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, -1], this.size / 2)),
    ];

    // Second, project the vertices of the cube onto the camera's view plane to get Vec2D's.
    const projected_vertices: Vec2D[] = [];
    for (let i = 0; i < vertices.length; i++) {
      projected_vertices.push(
        scene.project_to_camera_view(vertices[i] as Vec3D),
      );
    }

    // Third, convert these Vec2D's to canvas coordinates.
    const canvas_vertices: Vec2D[] = [];
    for (let i = 0; i < vertices.length; i++) {
      canvas_vertices.push(scene.v2c(projected_vertices[i] as Vec2D));
    }

    // TODO Finally, draw all of the edges.
    // i and j in {0, 1, ..., 6, 7} are connected if i ^ j has a single 1, i.e. is 1, 2, or 4.
    let start_x, start_y, end_x, end_y;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < i; j++) {
        if ((i ^ j) == 1 || (i ^ j) == 2 || (i ^ j) == 4) {
          [start_x, start_y] = canvas_vertices[i] as Vec2D;
          [end_x, end_y] = canvas_vertices[j] as Vec2D;

          ctx.beginPath();
          ctx.moveTo(start_x, start_y);
          ctx.lineTo(end_x, end_y);
          ctx.stroke();
        }
      }
    }
  }
}

// Rendering three-dimensional scenes.
// Drawing three-dimensional objects begins with projecting them onto
// the two-dimensional plane orthogonal to the camera's view direction.
//
// The camera frame is given by an orthogonal matrix A = [v1, v2, v3].
// Here, v3 is the direction in which the camera is pointing.
// Rendering a point v first consists of computing A^{-1}v. Then the first two coordinates
// of Av are the 2D coordinates of the rendering, while the third coordinate is the depth.
export class ThreeDScene extends Scene {
  // Inverse of the camera matrix
  camera_inv: Mat3by3;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.camera_inv = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }
  // Rotate the camera matrix around the z-axis.
  rot_z(angle: number) {
    this.camera_inv = matmul_mat(this.camera_inv, rot_z(angle));
  }
  // Rotate the camera matrix around the y-axis.
  rot_y(angle: number) {
    this.camera_inv = matmul_mat(this.camera_inv, rot_y(angle));
  }
  // Rotate the camera matrix around the x-axis.
  rot_x(angle: number) {
    this.camera_inv = matmul_mat(this.camera_inv, rot_x(angle));
  }
  // Rotate the camera matrix around a given axis
  rot(axis: Vec3D, angle: number) {
    this.camera_inv = matmul_mat(this.camera_inv, rot(axis, angle));
  }
  // Projects a 3D point onto the camera view plane.
  project_to_camera_view(p: Vec3D): Vec2D {
    let [vx, vy, vz] = matmul_vec(this.camera_inv, p);
    return [vx, vy];
  }
  // Draw
}
