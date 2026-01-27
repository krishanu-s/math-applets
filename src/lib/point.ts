// Points in the plane

export interface PlaneObj {
  translate_x(a: number): void;
  translate_y(a: number): void;
  rotate(theta: number): void;
}

let dist_tolerance = 0.00001;

// Returns whether two numbers are within the allowed tolerance
export function isclose(a: number, b: number): boolean {
  return Math.abs(a - b) < dist_tolerance;
}

// A point in 2D space
export class Point2D implements PlaneObj {
  public x: number;
  public y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  translate_x(a: number): void {
    this.x += a;
  }
  translate_y(a: number): void {
    this.y += a;
  }
  rotate(theta: number): void {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    this.x = c * this.x - s * this.y;
    this.y = s * this.x + c * this.y;
  }
  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
  isclose(other: Point2D): boolean {
    return isclose(this.x, other.x) && isclose(this.y, other.y);
  }
  to_projective(): ProjectivePoint {
    return new ProjectivePoint(this.x, this.y, 1);
  }
}

// A point in the projective plane
export class ProjectivePoint implements PlaneObj {
  public x: number;
  public y: number;
  public z: number;
  constructor(x = 0, y = 0, z = 1) {
    this.x = x;
    this.y = y;
    this.z = 1;
  }
  translate_x(a: number): void {
    if (this.z != 0) {
      this.x += a * this.z;
    }
  }
  translate_y(a: number): void {
    if (this.z != 0) {
      this.y += a * this.z;
    }
  }
  rotate(theta: number): void {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    this.x = c * this.x - s * this.y;
    this.y = s * this.x + c * this.y;
  }
  isclose(other: ProjectivePoint): boolean {
    let scale;
    if (this.x != 0) {
      scale = other.x / this.x;
    } else if (this.y != 0) {
      scale = other.y / this.y;
    } else {
      scale = other.z / this.z;
    }
    return (
      isclose(scale * this.x, other.x) &&
      isclose(scale * this.y, other.y) &&
      isclose(scale * this.z, other.z)
    );
  }
  to_2d(): Point2D {
    if (this.z == 0)
      throw new Error(
        "Cannot convert the point at infinity to Cartesian coordinates.",
      );
    return new Point2D(this.x / this.z, this.y / this.z);
  }
}

// A point or vector in 3D space
export class Point3D {
  public x: number;
  public y: number;
  public z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }
  scale(n: number): void {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }
  translate(vector: Point3D): void {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
  }
  add(other: Point3D): Point3D {
    return new Point3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }
  dot(other: Point3D): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }
  sq_norm(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }
  normalize(): void {
    let s = this.sq_norm();
    if (s == 0) {
      throw new Error("Cannot normalize the zero vector");
    } else {
      this.scale(1 / Math.sqrt(s));
    }
  }
  clone(): Point3D {
    return new Point3D(this.x, this.y, this.z);
  }
}
