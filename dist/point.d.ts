export interface PlaneObj {
    translate_x(a: number): void;
    translate_y(a: number): void;
    rotate(theta: number): void;
}
export declare function isclose(a: number, b: number): boolean;
export declare class Point2D implements PlaneObj {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    translate_x(a: number): void;
    translate_y(a: number): void;
    rotate(theta: number): void;
    length(): number;
    scale(n: number): void;
    isclose(other: Point2D): boolean;
    to_projective(): ProjectivePoint;
}
export declare class ProjectivePoint implements PlaneObj {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    translate_x(a: number): void;
    translate_y(a: number): void;
    rotate(theta: number): void;
    isclose(other: ProjectivePoint): boolean;
    to_2d(): Point2D;
}
export declare class Point3D {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    length(): number;
    scale(n: number): void;
    translate(vector: Point3D): void;
    add(other: Point3D): Point3D;
    dot(other: Point3D): number;
    sq_norm(): number;
    normalize(): void;
    clone(): Point3D;
}
//# sourceMappingURL=point.d.ts.map