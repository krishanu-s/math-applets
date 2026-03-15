// A point in 2D space.
export type Vec2D = [number, number];

export function vec2_cis(theta: number): Vec2D {
  return vec2_polar_form(1, theta);
}

export function vec2_polar_form(r: number, theta: number): Vec2D {
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

export function vec2_norm(x: Vec2D): number {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}

export function vec2_angle(v: Vec2D): number {
  return Math.atan2(v[1], v[0]);
}

export function vec2_normalize(x: Vec2D) {
  let n = vec2_norm(x);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec2_scale(x, 1 / n);
  }
}

export function vec2_scale(x: Vec2D, factor: number): Vec2D {
  return [x[0] * factor, x[1] * factor];
}

export function vec2_sum(x: Vec2D, y: Vec2D): Vec2D {
  return [x[0] + y[0], x[1] + y[1]];
}

export function vec2_sum_list(xs: Vec2D[]): Vec2D {
  return xs.reduce((acc, x) => vec2_sum(acc, x), [0, 0]);
}

export function vec2_sub(x: Vec2D, y: Vec2D): Vec2D {
  return [x[0] - y[0], x[1] - y[1]];
}

export function vec2_rot(v: Vec2D, angle: number): Vec2D {
  const [x, y] = v;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - y * sin, x * sin + y * cos];
}

export function vec2_dot(x: Vec2D, y: Vec2D): number {
  return x[0] * y[0] + x[1] * y[1];
}

// Performs a homothety centered around the first point, acting on the second point
export function vec2_homothety(p1: Vec2D, p2: Vec2D, scale: number): Vec2D {
  return vec2_sum(p1, vec2_scale(vec2_sub(p2, p1), scale));
}

export type Mat2by2 = [Vec2D, Vec2D];

// Transposes a 2x2 matrix
export function transpose(m: Mat2by2): Mat2by2 {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ];
}

// Retrieves the given column of a 2x2 matrix
export function get_column(m: Mat2by2, i: number): Vec2D {
  return [m[0][i], m[1][i]] as Vec2D;
}

// Multiplies a 2x2 matrix by a vector to produce another vector
export function matmul_vec2(m: Mat2by2, v: Vec2D): Vec2D {
  let result: Vec2D = [0, 0];
  for (let i = 0; i < 2; i++) {
    result[i] = vec2_dot(m[i] as Vec2D, v);
  }
  return result;
}

// Multiplies a 2x2 matrix by another 2x2 matrix
export function matmul_mat2(m1: Mat2by2, m2: Mat2by2): Mat2by2 {
  let result: Vec2D[] = [];
  for (let i = 0; i < 2; i++) {
    result.push(matmul_vec2(m1, [m2[0][i], m2[1][i]] as Vec2D));
  }
  return transpose(result as Mat2by2);
}
