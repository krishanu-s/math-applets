// 3D matrices and vectors.
export function vec3_norm(x) {
    return Math.sqrt(x[0] ** 2 + x[1] ** 2 + x[2] ** 2);
}
export function vec3_dot(v, w) {
    let result = 0;
    for (let i = 0; i < 3; i++) {
        result += v[i] * w[i];
    }
    return result;
}
export function vec3_scale(x, factor) {
    return [x[0] * factor, x[1] * factor, x[2] * factor];
}
export function vec3_sum(x, y) {
    return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
}
export function vec3_sum_list(xs) {
    return xs.reduce((acc, x) => vec3_sum(acc, x), [0, 0, 0]);
}
export function vec3_sub(x, y) {
    return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
}
// Transposes a 3x3 matrix
export function transpose(m) {
    return [
        [m[0][0], m[1][0], m[2][0]],
        [m[0][1], m[1][1], m[2][1]],
        [m[0][2], m[1][2], m[2][2]],
    ];
}
// Inverts a 3x3 matrix
export function mat_inv(m) {
    let det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    if (det == 0) {
        throw new Error("Can't invert a singular matrix");
    }
    let inv_det = 1 / det;
    return [
        [
            inv_det * (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
            inv_det * (m[0][2] * m[2][1] - m[0][1] * m[2][2]),
            inv_det * (m[0][1] * m[1][2] - m[0][2] * m[1][1]),
        ],
        [
            inv_det * (m[1][2] * m[2][0] - m[1][0] * m[2][2]),
            inv_det * (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
            inv_det * (m[0][2] * m[1][0] - m[0][0] * m[1][2]),
        ],
        [
            inv_det * (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
            inv_det * (m[0][1] * m[2][0] - m[0][0] * m[2][1]),
            inv_det * (m[0][0] * m[1][1] - m[0][1] * m[1][0]),
        ],
    ];
}
// Retrieves the given column of a 3x3 matrix
export function get_column(m, i) {
    return [m[0][i], m[1][i], m[2][i]];
}
// Projects a nonzero 3D vector to the unit sphere
export function vec3_normalize(v) {
    let n = vec3_norm(v);
    if (n == 0) {
        throw new Error("Can't normalize the zero vector");
    }
    else {
        return vec3_scale(v, 1 / n);
    }
}
// Spherical coordinates to cartesian coordinates
export function spherical_to_cartesian(radius, theta_rad, phi_rad) {
    return [
        radius * Math.sin(theta_rad) * Math.cos(phi_rad),
        radius * Math.sin(theta_rad) * Math.sin(phi_rad),
        radius * Math.cos(theta_rad),
    ];
}
// Cartesian coordinates to spherical coordinates
export function cartesian_to_spherical(x, y, z) {
    let r = Math.sqrt(x * x + y * y + z * z);
    let theta = Math.acos(z / r);
    let phi = Math.atan2(y, x);
    return [r, theta, phi];
}
// Multiplies a 3x3 matrix by a vector to produce another vector
export function matmul_vec(m, v) {
    let result = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        result[i] = vec3_dot(m[i], v);
    }
    return result;
}
// Multiplies a 3x3 matrix by another 3x3 matrix
export function matmul_mat(m1, m2) {
    let result = [];
    for (let i = 0; i < 3; i++) {
        result.push(matmul_vec(m1, [m2[0][i], m2[1][i], m2[2][i]]));
    }
    return transpose(result);
}
// Rotation around the positive z-axis by angle theta
export function rot_z_matrix(theta) {
    return [
        [Math.cos(theta), -Math.sin(theta), 0],
        [Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 1],
    ];
}
export function rot_z(v, theta) {
    return matmul_vec(rot_z_matrix(theta), v);
}
// Rotation around the positive y-axis by angle theta
export function rot_y_matrix(theta) {
    return [
        [Math.cos(theta), 0, Math.sin(theta)],
        [0, 1, 0],
        [-Math.sin(theta), 0, Math.cos(theta)],
    ];
}
export function rot_y(v, theta) {
    return matmul_vec(rot_y_matrix(theta), v);
}
// Rotation around the positive x-axis by angle theta
export function rot_x_matrix(theta) {
    return [
        [1, 0, 0],
        [0, Math.cos(theta), -Math.sin(theta)],
        [0, Math.sin(theta), Math.cos(theta)],
    ];
}
export function rot_x(v, theta) {
    return matmul_vec(rot_x_matrix(theta), v);
}
// Rotation around an arbitrary axis by angle theta.
// This is done by first rotating the axis to align with the z-axis
export function rot_matrix(axis, angle) {
    // Get spherical coordinates
    let [x, y, z] = vec3_normalize(axis);
    let theta = Math.acos(z);
    let phi = Math.acos(x / Math.sin(theta));
    if (y / Math.sin(theta) < 0) {
        phi = 2 * Math.PI - phi;
    }
    // Rotate to align with z-axis
    let result = rot_z_matrix(-phi);
    result = matmul_mat(rot_y_matrix(-theta), result);
    result = matmul_mat(rot_z_matrix(angle), result);
    result = matmul_mat(rot_y_matrix(theta), result);
    result = matmul_mat(rot_z_matrix(phi), result);
    return result;
}
export function rot(v, axis, angle) {
    // Get spherical coordinates
    let [x, y, z] = vec3_normalize(axis);
    let theta = Math.acos(z);
    let phi = Math.acos(x / Math.sin(theta));
    if (y / Math.sin(theta) < 0) {
        phi = 2 * Math.PI - phi;
    }
    // Rotate to align with z-axis
    let result = rot_z(v, -phi);
    result = rot_y(result, -theta);
    result = rot_z(result, angle);
    result = rot_y(result, theta);
    result = rot_z(result, phi);
    return result;
}
//# sourceMappingURL=matvec.js.map