// Three-dimensional geometry and transformations.

// Three-dimensional objects are specified by points in 3D space.
// Drawing three-dimensional objects begins with projecting them onto
// the two-dimensional plane orthogonal to the camera's view direction.

import { MObject, Scene } from "./base.js";

export type Vec3D = [number, number, number];

export function vec3_norm(x: Vec3D): number {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2 + x[2] ** 2);
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

// Rendering three-dimensional scenes.
export class ThreeDScene extends Scene {
  // Camera angle in spherical coordinates.
  theta: number;
  phi: number;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.theta = 0;
    this.phi = 0;
  }
}
