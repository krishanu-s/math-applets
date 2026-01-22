// src/matvec.ts
function vecdot(v, w) {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += v[i] * w[i];
  }
  return result;
}
function vecnorm(v) {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += v[i] ** 2;
  }
  return result;
}
function vecscale(v, c) {
  return [c * v[0], c * v[1], c * v[2]];
}
function normalize(v) {
  let n = vecnorm(v);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vecscale(v, n);
  }
}
function spherical_to_cartesian(c) {
  return [
    Math.cos(c[0]) * Math.cos(c[1]),
    Math.cos(c[0]) * Math.sin(c[1]),
    Math.sin(c[0])
  ];
}
function cartesian_to_spherical(v) {
  let nv = normalize(v);
  let theta = Math.asin(nv[2]);
  let phi = Math.acos(nv[0] / Math.cos(theta));
  if (nv[1] / Math.cos(theta) > 0) {
    return [theta, phi];
  } else {
    return [theta, 2 * Math.PI - phi];
  }
}
function matmul_vec(m, v) {
  let result = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    result[i] = vecdot(m[i], v);
  }
  return result;
}
function rot_z(theta) {
  return [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ];
}
function rot_y(theta) {
  return [
    [Math.cos(theta), 0, Math.sin(theta)],
    [0, 1, 0],
    [-Math.sin(theta), 0, Math.cos(theta)]
  ];
}
function rot_x(theta) {
  return [
    [1, 0, 0],
    [0, Math.cos(theta), -Math.sin(theta)],
    [0, Math.sin(theta), Math.cos(theta)]
  ];
}
export {
  cartesian_to_spherical,
  matmul_vec,
  normalize,
  rot_x,
  rot_y,
  rot_z,
  spherical_to_cartesian,
  vecdot,
  vecnorm,
  vecscale
};
