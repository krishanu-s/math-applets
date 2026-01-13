// 3D and 4D matrix operations

export type Vec3D = [number, number, number];
export type SphericalVec3D = [number, number];
export type Mat3by3 = [Vec3D, Vec3D, Vec3D];

export function vecdot(v: Vec3D, w: Vec3D): number {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += (v[i] as number) * (w[i] as number);
  }
  return result;
}

export function vecnorm(v: Vec3D): number {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += (v[i] as number) ** 2;
  }
  return result;
}

export function vecscale(v: Vec3D, c: number): Vec3D {
  return [c * v[0], c * v[1], c * v[2]];
}

// Projects a nonzero 3D vector to the unit sphere
export function normalize(v: Vec3D): Vec3D {
  let n = vecnorm(v);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vecscale(v, n);
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
    result[i] = vecdot(m[i] as Vec3D, v);
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
