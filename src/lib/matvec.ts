// 3D and 4D matrix operations

import { Vec3D, vec3_dot, vec3_norm, vec3_scale } from "./three_d.js";

export type SphericalVec3D = [number, number];
export type Mat3by3 = [Vec3D, Vec3D, Vec3D];

// Projects a nonzero 3D vector to the unit sphere
export function normalize(v: Vec3D): Vec3D {
  let n = vec3_norm(v);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec3_scale(v, n);
  }
}

// Converts a vector from spherical coordinates to Cartesian coordinates
export function spherical_to_cartesian(c: SphericalVec3D): Vec3D {
  return [
    Math.cos(c[0]) * Math.cos(c[1]),
    Math.cos(c[0]) * Math.sin(c[1]),
    Math.sin(c[0]),
  ];
}

// Converts a vector from Cartesian coordinates to spherical coordinates
export function cartesian_to_spherical(v: Vec3D): SphericalVec3D {
  let nv = normalize(v);
  let theta = Math.asin(nv[2]);
  let phi = Math.acos(nv[0] / Math.cos(theta));
  if (nv[1] / Math.cos(theta) > 0) {
    return [theta, phi];
  } else {
    return [theta, 2 * Math.PI - phi];
  }
}

// Multiplies a 3x3 matrix by a vector to produce another vector
export function matmul_vec(m: Mat3by3, v: Vec3D): Vec3D {
  let result: Vec3D = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    result[i] = vec3_dot(m[i] as Vec3D, v);
  }
  return result;
}

// Rotation around the positive z-axis by angle theta
export function rot_z(theta: number): Mat3by3 {
  return [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1],
  ];
}

// Rotation around the positive y-axis by angle theta
export function rot_y(theta: number): Mat3by3 {
  return [
    [Math.cos(theta), 0, Math.sin(theta)],
    [0, 1, 0],
    [-Math.sin(theta), 0, Math.cos(theta)],
  ];
}

// Rotation around the positive x-axis by angle theta
export function rot_x(theta: number): Mat3by3 {
  return [
    [1, 0, 0],
    [0, Math.cos(theta), -Math.sin(theta)],
    [0, Math.sin(theta), Math.cos(theta)],
  ];
}
