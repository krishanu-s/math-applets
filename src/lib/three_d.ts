// Three-dimensional geometry and transformations.
// TODO Depth of ThreeDMObjects

import { MObject, LineLikeMObject, Scene } from "./base.js";
import { vec2_norm, Vec2D } from "./base_geom.js";
import {
  Mat3by3,
  matmul_vec,
  matmul_mat,
  rot_z_matrix,
  rot_y_matrix,
  rot_x_matrix,
  rot_matrix,
  mat_inv,
  get_column,
} from "./matvec.js";
import { vec2_sum, vec2_sub, vec2_scale, vec2_rot } from "./base_geom.js";

export type Vec3D = [number, number, number];

export function vec3_norm(x: Vec3D): number {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2 + x[2] ** 2);
}

export function vec3_dot(v: Vec3D, w: Vec3D): number {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += (v[i] as number) * (w[i] as number);
  }
  return result;
}

export function vec3_scale(x: Vec3D, factor: number): Vec3D {
  return [x[0] * factor, x[1] * factor, x[2] * factor];
}

export function vec3_sum(x: Vec3D, y: Vec3D): Vec3D {
  return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
}

export function vec3_sum_list(xs: Vec3D[]): Vec3D {
  return xs.reduce((acc, x) => vec3_sum(acc, x), [0, 0, 0]);
}

export function vec3_sub(x: Vec3D, y: Vec3D): Vec3D {
  return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
}

// Three-dimensional objects.
export class ThreeDMObject extends MObject {
  // Return the depth of the object in the scene. Used for sorting.
  depth(scene: ThreeDScene): number {
    return 0;
  }
  // Return the depth of the nearest point on the object that lies along the
  // given ray. Used for relative depth-testing between 3D objects, to determine
  // how to draw them.
  depth_point(scene: ThreeDScene, view_point: Vec2D): number {
    return 0;
  }
}

// Identical extension as MObject -> LineLikeMObject
export class ThreeDLineLikeMObject extends ThreeDMObject {
  stroke_width: number = 0.08;
  stroke_color: string = "black";
  stroke_style: "solid" | "dashed" | "dotted" = "solid";
  set_stroke_color(color: string) {
    this.stroke_color = color;
  }
  set_stroke_width(width: number) {
    this.stroke_width = width;
  }
  set_stroke_style(style: "solid" | "dashed" | "dotted") {
    this.stroke_style = style;
    return this;
  }
  draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    if (this.stroke_style == "dashed") {
      ctx.setLineDash([5, 5]);
    } else if (this.stroke_style == "dotted") {
      ctx.setLineDash([2, 2]);
    }
    this._draw(ctx, scene, args);
    ctx.setLineDash([]);
  }
}

// Identical extension as MObject -> FillLikeMObject
export class ThreeDFillLikeMObject extends ThreeDMObject {
  stroke_width: number = 0.08;
  stroke_color: string = "black";
  stroke_style: "solid" | "dashed" | "dotted" = "solid";
  fill_color: string = "black";
  fill_alpha: number = 1.0;
  fill: boolean = true;
  set_stroke_color(color: string) {
    this.stroke_color = color;
  }
  set_stroke_width(width: number) {
    this.stroke_width = width;
  }
  set_stroke_style(style: "solid" | "dashed" | "dotted") {
    this.stroke_style = style;
    return this;
  }
  set_fill_color(color: string) {
    this.fill_color = color;
  }
  set_color(color: string) {
    this.stroke_color = color;
    this.fill_color = color;
  }
  set_fill_alpha(alpha: number) {
    this.fill_alpha = alpha;
  }
  set_fill(fill: boolean) {
    this.fill = fill;
  }
  draw(canvas: HTMLCanvasElement, scene: Scene, args?: any): void {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = (this.stroke_width * canvas.width) / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    if (this.stroke_style == "dashed") {
      ctx.setLineDash([5, 5]);
    } else if (this.stroke_style == "dotted") {
      ctx.setLineDash([2, 2]);
    }
    ctx.fillStyle = this.fill_color;
    this._draw(ctx, scene, args);
    ctx.setLineDash([]);
  }
}

// A dot.
export class Dot3D extends ThreeDFillLikeMObject {
  center: Vec3D;
  radius: number;
  constructor(center: Vec3D, radius: number) {
    super();
    this.center = center;
    this.radius = radius;
  }
  depth(scene: ThreeDScene): number {
    return scene.depth(this.center);
  }
  move_to(new_center: Vec3D) {
    this.center = new_center;
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    // TODO Make this more efficient.
    let p = scene.camera_view(this.center);
    let pr = scene.camera_view(
      vec3_sum(
        this.center,
        vec3_scale(
          get_column(scene.get_camera_frame(), 0),
          this.radius * scene.zoom_ratio,
        ),
      ),
    );
    if (p != null && pr != null) {
      let [cx, cy] = scene.v2c(p as Vec2D);
      let [rx, ry] = scene.v2c(pr as Vec2D);
      let rc = vec2_norm(vec2_sub([rx, ry], [cx, cy]));
      ctx.beginPath();
      ctx.arc(cx, cy, rc, 0, 2 * Math.PI);
      ctx.stroke();
      if (this.fill) {
        ctx.globalAlpha = ctx.globalAlpha * this.fill_alpha;
        ctx.fill();
        ctx.globalAlpha = ctx.globalAlpha / this.fill_alpha;
      }
    }
  }
}

// A line
export class Line3D extends ThreeDLineLikeMObject {
  start: Vec3D;
  end: Vec3D;
  constructor(start: Vec3D, end: Vec3D) {
    super();
    this.start = start;
    this.end = end;
  }
  // Moves the start and end points
  move_start(v: Vec3D) {
    this.start = v;
  }
  move_end(v: Vec3D) {
    this.end = v;
  }
  depth(scene: ThreeDScene): number {
    return scene.depth(vec3_scale(vec3_sum(this.end, this.start), 0.5));
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    let s = scene.camera_view(this.start);
    let e = scene.camera_view(this.end);
    if (s == null || e == null) return;

    let [start_x, start_y] = scene.v2c(s);
    let [end_x, end_y] = scene.v2c(e);

    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
}

// A sequence of line segments with joined endpoints.
export class LineSequence3D extends ThreeDLineLikeMObject {
  points: Vec3D[];
  constructor(points: Vec3D[]) {
    super();
    this.points = points;
  }
  add_point(point: Vec3D) {
    this.points.push(point);
  }
  move_point(i: number, new_point: Vec3D) {
    this.points[i] = new_point;
  }
  get_point(i: number): Vec3D {
    return this.points[i];
  }
  depth(scene: ThreeDScene): number {
    if (this.points.length == 0) {
      return 0;
    } else if (this.points.length == 1) {
      return scene.depth(this.points[0]);
    } else {
      return scene.depth(
        vec3_scale(vec3_sum(this.points[0], this.points[1]), 0.5),
      );
    }
    // return scene.depth(
    //   vec3_scale(vec3_sum_list(this.points), 1 / this.points.length),
    // );
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    ctx.beginPath();

    let in_frame: boolean = false;
    let p: Vec2D | null;
    let x: number, y: number;
    for (let i = 0; i < this.points.length; i++) {
      p = scene.camera_view(this.points[i]);
      if (p == null) {
        in_frame = false;
      } else {
        [x, y] = scene.v2c(p);
        if (in_frame) {
          ctx.lineTo(x, y);
        } else {
          ctx.moveTo(x, y);
        }
        in_frame = true;
      }
    }
    ctx.stroke();
  }
}

// An arrow
export class Arrow3D extends Line3D {
  arrow_size: number = 0.3;
  fill_color: string;
  constructor(start: Vec3D, end: Vec3D) {
    super(start, end);
    this.fill_color = this.stroke_color;
  }
  set_arrow_size(size: number) {
    this.arrow_size = size;
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    super._draw(ctx, scene);
    ctx.fillStyle = this.fill_color;

    // TODO This can surely be refactored with Line3D.
    let s = scene.camera_view(this.start);
    let e = scene.camera_view(this.end);
    if (s == null || e == null) return;

    let [end_x, end_y] = scene.v2c(e);

    let length = vec2_norm(vec2_sub(s, e));
    let v = vec2_scale(vec2_sub(s, e), this.arrow_size / length);
    let [ax, ay] = scene.v2c(vec2_sum(e, vec2_rot(v, Math.PI / 6)));
    let [bx, by] = scene.v2c(vec2_sum(e, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();

    ctx.moveTo(end_x, end_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(end_x, end_y);
    ctx.closePath();
    ctx.fill();
  }
}

// A double-headed arrow
export class TwoHeadedArrow3D extends Line3D {
  arrow_size: number = 0.3;
  fill_color: string;
  constructor(start: Vec3D, end: Vec3D) {
    super(start, end);
    this.fill_color = this.stroke_color;
  }
  set_arrow_size(size: number) {
    this.arrow_size = size;
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    super._draw(ctx, scene);
    ctx.fillStyle = this.fill_color;

    // TODO This can surely be refactored with Line3D.
    let s = scene.camera_view(this.start);
    let e = scene.camera_view(this.end);
    if (s == null || e == null) return;

    let [end_x, end_y] = scene.v2c(e);
    let [start_x, start_y] = scene.v2c(s);

    // Arrow head
    let length = vec2_norm(vec2_sub(s, e));
    let v = vec2_scale(vec2_sub(s, e), this.arrow_size / length);
    let [ax, ay] = scene.v2c(vec2_sum(e, vec2_rot(v, Math.PI / 6)));
    let [bx, by] = scene.v2c(vec2_sum(e, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();
    ctx.moveTo(end_x, end_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(end_x, end_y);
    ctx.closePath();
    ctx.fill();

    // Arrow tail
    v = vec2_scale(vec2_sub(e, s), this.arrow_size / length);
    [ax, ay] = scene.v2c(vec2_sum(s, vec2_rot(v, Math.PI / 6)));
    [bx, by] = scene.v2c(vec2_sum(s, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(start_x, start_y);
    ctx.closePath();
    ctx.fill();
  }
}

// A cube.
export class Cube extends ThreeDLineLikeMObject {
  center: Vec3D;
  size: number;
  constructor(center: Vec3D, size: number) {
    super();
    this.center = center;
    this.size = size;
  }
  depth(scene: ThreeDScene): number {
    return scene.depth(this.center);
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    // First, generate all of the vertices of the cube as Vec3D's.
    const vertices = [
      vec3_sum(this.center, vec3_scale([1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, -1], this.size / 2)),
    ];

    // Second, project the vertices of the cube onto the camera's view plane to get Vec2D's.
    const projected_vertices: (Vec2D | null)[] = [];
    for (let i = 0; i < vertices.length; i++) {
      projected_vertices.push(scene.camera_view(vertices[i] as Vec3D));
    }

    // Third, convert these Vec2D's to canvas coordinates.
    let v;
    const canvas_vertices: (Vec2D | null)[] = [];
    for (let i = 0; i < vertices.length; i++) {
      let v = projected_vertices[i];
      if (v == null) {
        canvas_vertices.push(v);
      } else {
        canvas_vertices.push(scene.v2c(v as Vec2D));
      }
    }

    // TODO Finally, draw all of the edges.
    // i and j in {0, 1, ..., 6, 7} are connected if i ^ j has a single 1, i.e. is 1, 2, or 4.
    let start_x: number;
    let start_y: number;
    let end_x: number;
    let end_y: number;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < i; j++) {
        if ((i ^ j) == 1 || (i ^ j) == 2 || (i ^ j) == 4) {
          if (canvas_vertices[i] == null || canvas_vertices[j] == null) {
            continue;
          } else {
            [start_x, start_y] = canvas_vertices[i] as Vec2D;
            [end_x, end_y] = canvas_vertices[j] as Vec2D;

            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(end_x, end_y);
            ctx.stroke();
          }
        }
      }
    }
  }
}

// A parametrized curve
export class ParametrizedCurve3D extends ThreeDLineLikeMObject {
  function: (t: number) => Vec3D;
  tmin: number;
  tmax: number;
  num_steps: number;
  mode: "smooth" | "jagged" = "jagged";
  constructor(
    f: (t: number) => Vec3D,
    tmin: number,
    tmax: number,
    num_steps: number,
  ) {
    super();
    this.function = f;
    this.tmin = tmin;
    this.tmax = tmax;
    this.num_steps = num_steps;
  }
  // Jagged doesn't use Bezier curves. It is faster to compute and render.
  set_mode(mode: "smooth" | "jagged") {
    this.mode = mode;
  }
  set_function(new_f: (t: number) => Vec3D) {
    this.function = new_f;
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    // Generate points to draw
    // TODO Use a Bezier curve for smoother rendering.
    let points: Vec3D[] = [this.function(this.tmin)];
    for (let i = 1; i <= this.num_steps; i++) {
      points.push(
        this.function(
          this.tmin + (i / this.num_steps) * (this.tmax - this.tmin),
        ),
      );
    }
    let points2D: (Vec2D | null)[] = points.map((p) => {
      let r = scene.camera_view(p);
      if (r == null) {
        return null;
      }
      return scene.v2c(r);
    });
    let [px, py] = points2D[0] as Vec2D;
    ctx.beginPath();
    ctx.moveTo(px, py);

    for (let i = 1; i <= this.num_steps; i++) {
      [px, py] = points2D[i] as Vec2D;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

// TODO Move all camera-related code from ThreeDScene into Camera3D class
class Camera3D {
  position: Vec3D = [0, 0, 0];
  camera_frame: Mat3by3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  camera_frame_inv: Mat3by3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

// Rendering three-dimensional scenes.
// Drawing three-dimensional objects begins with projecting them onto
// the two-dimensional plane orthogonal to the camera's view direction.
//
// The camera position is given by a vector v0, and its
// view frame is given by an orthogonal matrix A = [v1, v2, v3].
// Here, v3 is the direction in which the camera is pointing.
//
// Rendering a point v first consists of computing A^{-1}(v - v0). Then the first two coordinates
// of Av are the 2D coordinates of the rendering, while the third coordinate is the depth.
export class ThreeDScene extends Scene {
  mobjects: Record<string, ThreeDMObject>;
  // Inverse of the camera matrix
  camera_frame_inv: Mat3by3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  camera_position: Vec3D = [0, 0, 0];
  mode: "perspective" | "projection" = "perspective";
  // Set the camera position
  set_camera_position(position: Vec3D) {
    this.camera_position = position;
  }
  // Translate the camera matrix by a given vector
  translate(vec: Vec3D) {
    this.camera_position = vec3_sum(this.camera_position, vec);
  }
  // Set the camera frame inverse
  set_camera_frame_inv(frame_inv: Mat3by3) {
    this.camera_frame_inv = frame_inv;
  }
  // Get the camera frame matrix
  get_camera_frame() {
    return mat_inv(this.camera_frame_inv);
  }
  // Rotate the camera matrix around the z-axis.
  rot_z(angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_z_matrix(-angle),
    );
  }
  // Rotate the camera matrix around the y-axis.
  rot_y(angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_y_matrix(-angle),
    );
  }
  // Rotate the camera matrix around the x-axis.
  rot_x(angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_x_matrix(-angle),
    );
  }
  // Rotate the camera matrix around a given axis
  rot(axis: Vec3D, angle: number) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_matrix(axis, -angle),
    );
  }
  // Modes of viewing/drawing
  set_view_mode(mode: "perspective" | "projection") {
    this.mode = mode;
  }
  camera_view(p: Vec3D): Vec2D | null {
    if (this.mode == "perspective") {
      return this.perspective_view(p);
    } else {
      return this.projection_view(p);
    }
  }
  depth(p: Vec3D): number {
    return matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position),
    )[2];
  }
  // Projects a 3D point onto the camera view plane. Does not include perspective.
  projection_view(p: Vec3D): Vec2D {
    let [vx, vy, vz] = matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position),
    );
    return [vx, vy];
  }
  // Projects a 3D point onto the camera view plane, and then divides by the third coordinate.
  // Returns null if the third coordinate is nonpositive (i.e., the point is behind the camera).
  perspective_view(p: Vec3D): Vec2D | null {
    let [vx, vy, vz] = matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position),
    );
    if (vz <= 0) {
      return null;
    } else {
      return [vx / vz, vy / vz];
    }
  }
  // Draw
  draw(args?: any) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Objects come in two categories: those with fill and those without fill.
    // Objects without fill
    // First order the objects by depth
    let ordered_names = Object.keys(this.mobjects).sort((a, b) => {
      let depth_a = this.mobjects[a].depth(this);
      let depth_b = this.mobjects[b].depth(this);
      return depth_a - depth_b;
    });

    // Then draw them in order
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    }

    // Draw a border around the canvas
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
