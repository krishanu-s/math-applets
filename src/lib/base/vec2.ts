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

// Performs a homothety centered around the first point, acting on the second point
export function vec2_homothety(p1: Vec2D, p2: Vec2D, scale: number): Vec2D {
  return vec2_sum(p1, vec2_scale(vec2_sub(p2, p1), scale));
}
