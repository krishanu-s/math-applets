export function vec2_cis(theta) {
    return vec2_polar_form(1, theta);
}
export function vec2_polar_form(r, theta) {
    return [r * Math.cos(theta), r * Math.sin(theta)];
}
export function vec2_norm(x) {
    return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
export function vec2_angle(v) {
    return Math.atan2(v[1], v[0]);
}
export function vec2_normalize(x) {
    let n = vec2_norm(x);
    if (n == 0) {
        throw new Error("Can't normalize the zero vector");
    }
    else {
        return vec2_scale(x, 1 / n);
    }
}
export function vec2_scale(x, factor) {
    return [x[0] * factor, x[1] * factor];
}
export function vec2_sum(x, y) {
    return [x[0] + y[0], x[1] + y[1]];
}
export function vec2_sum_list(xs) {
    return xs.reduce((acc, x) => vec2_sum(acc, x), [0, 0]);
}
export function vec2_sub(x, y) {
    return [x[0] - y[0], x[1] - y[1]];
}
export function vec2_rot(v, angle) {
    const [x, y] = v;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos - y * sin, x * sin + y * cos];
}
// Performs a homothety centered around the first point, acting on the second point
export function vec2_homothety(p1, p2, scale) {
    return vec2_sum(p1, vec2_scale(vec2_sub(p2, p1), scale));
}
//# sourceMappingURL=vec2.js.map