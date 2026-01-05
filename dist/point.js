// src/point.ts
var dist_tolerance = 1e-5;
function isclose(a, b) {
  return Math.abs(a - b) < dist_tolerance;
}
var Point2D = class {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  translate_x(a) {
    this.x += a;
  }
  translate_y(a) {
    this.y += a;
  }
  rotate(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    this.x = c * this.x - s * this.y;
    this.y = s * this.x + c * this.y;
  }
  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  scale(n) {
    this.x *= n;
    this.y *= n;
  }
  isclose(other) {
    return isclose(this.x, other.x) && isclose(this.y, other.y);
  }
  to_projective() {
    return new ProjectivePoint(this.x, this.y, 1);
  }
};
var ProjectivePoint = class {
  constructor(x = 0, y = 0, z = 1) {
    this.x = x;
    this.y = y;
    this.z = 1;
  }
  translate_x(a) {
    if (this.z != 0) {
      this.x += a * this.z;
    }
  }
  translate_y(a) {
    if (this.z != 0) {
      this.y += a * this.z;
    }
  }
  rotate(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    this.x = c * this.x - s * this.y;
    this.y = s * this.x + c * this.y;
  }
  isclose(other) {
    let scale;
    if (this.x != 0) {
      scale = other.x / this.x;
    } else if (this.y != 0) {
      scale = other.y / this.y;
    } else {
      scale = other.z / this.z;
    }
    return isclose(scale * this.x, other.x) && isclose(scale * this.y, other.y) && isclose(scale * this.z, other.z);
  }
  to_2d() {
    if (this.z == 0)
      throw new Error(
        "Cannot convert the point at infinity to Cartesian coordinates."
      );
    return new Point2D(this.x / this.z, this.y / this.z);
  }
};
var Point3D = class _Point3D {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }
  scale(n) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }
  translate(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
  }
  add(other) {
    return new _Point3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }
  sq_norm() {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }
  normalize() {
    let s = this.sq_norm();
    if (s == 0) {
      throw new Error("Cannot normalize the zero vector");
    } else {
      this.scale(1 / Math.sqrt(s));
    }
  }
  clone() {
    return new _Point3D(this.x, this.y, this.z);
  }
};
export {
  Point2D,
  Point3D,
  ProjectivePoint,
  isclose
};
