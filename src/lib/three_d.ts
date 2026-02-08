// Three-dimensional geometry and transformations.
// TODO Depth of ThreeDMObjects

import {
  MObject,
  LineLikeMObject,
  FillLikeMObject,
  Scene,
  mouse_event_coords,
  touch_event_coords,
} from "./base.js";
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
  rot_z,
  rot_y,
  rot_x,
  rot,
} from "./matvec.js";
import { vec2_sum, vec2_sub, vec2_scale, vec2_rot } from "./base_geom.js";
import { Simulator } from "./statesim.js";

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
  blocked_depth_tolerance: number = 0.01;
  linked_mobjects: ThreeDFillLikeMObject[] = [];
  stroke_width: number = 0.08;
  stroke_color: string = "black";
  stroke_style: "solid" | "dashed" | "dotted" = "solid";
  set_stroke_color(color: string) {
    this.stroke_color = color;
    return this;
  }
  set_stroke_width(width: number) {
    this.stroke_width = width;
    return this;
  }
  set_stroke_style(style: "solid" | "dashed" | "dotted") {
    this.stroke_style = style;
    return this;
  }
  // Return the depth of the object in the scene. Used for sorting.
  depth(scene: ThreeDScene): number {
    return 0;
  }
  // Return the depth of the nearest point on the object that lies along the
  // given ray. Used for relative depth-testing between 3D objects, to determine
  // how to draw them.
  depth_at(scene: ThreeDScene, view_point: Vec2D): number {
    return 0;
  }
  // Add a linked Mobject. These are fill-like MObjects in the scene which might obstruct the view
  // of the curve, and are used internally to _draw() for depth-testing.
  link_mobject(mobject: ThreeDFillLikeMObject) {
    this.linked_mobjects.push(mobject);
  }
  // Calculates the minimum depth value among linked FillLike objects at the given 2D scene view point.
  blocked_depth_at(scene: ThreeDScene, view_point: Vec2D): number {
    return Math.min(
      ...this.linked_mobjects.map((m) =>
        m.depth_at(scene, view_point as Vec2D),
      ),
    );
  }
  // Calculates whether the given 3D scene point is either obstructed by any linked FillLike objects
  // or is out of scene
  is_blocked(scene: ThreeDScene, point: Vec3D): boolean {
    let vp = scene.camera_view(point);
    if (vp == null) {
      return true;
    } else {
      return (
        scene.depth(point) >
        this.blocked_depth_at(scene, vp) + this.blocked_depth_tolerance
      );
    }
  }
}

// Identical extension as MObject -> LineLikeMObject
export class ThreeDLineLikeMObject extends ThreeDMObject {
  // Sets the context drawer settings for drawing behind linked FillLike objects.
  set_behind_linked_mobjects(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha /= 2;
    ctx.setLineDash([5, 5]);
  }
  unset_behind_linked_mobjects(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha *= 2;
    ctx.setLineDash([]);
  }
  draw(
    canvas: HTMLCanvasElement,
    scene: ThreeDScene,
    simple: boolean = false,
    args?: any,
  ): void {
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
    if (this instanceof Line3D && simple) {
      this._draw_simple(ctx, scene);
    } else {
      this._draw(ctx, scene, args);
    }
    ctx.setLineDash([]);
  }
}

// Identical extension as MObject -> FillLikeMObject
export class ThreeDFillLikeMObject extends ThreeDMObject {
  fill_color: string = "black";
  fill_alpha: number = 1.0;
  fill: boolean = true;
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
  // Sets the context drawer settings for drawing behind linked FillLike objects.
  set_behind_linked_mobjects(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha /= 2;
  }
  unset_behind_linked_mobjects(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha *= 2;
  }
  draw(
    canvas: HTMLCanvasElement,
    scene: ThreeDScene,
    simple: boolean = false,
    args?: any,
  ): void {
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
    if (this instanceof Dot3D && simple) {
      this._draw_simple(ctx, scene);
    } else {
      this._draw(ctx, scene, args);
    }
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
  get_center(): Vec3D {
    return this.center;
  }
  get_radius(): number {
    return this.radius;
  }
  depth(scene: ThreeDScene): number {
    return scene.depth(this.center);
  }
  depth_at(scene: ThreeDScene, view_point: Vec2D): number {
    if (scene.mode == "perspective") {
      // TODO
      return 0;
    } else if (scene.mode == "orthographic") {
      let dist = vec2_norm(
        vec2_sub(view_point, scene.orthographic_view(this.center)),
      );
      if (dist > this.radius) {
        return Infinity;
      } else {
        let depth_adjustment = Math.sqrt(
          Math.max(0, this.radius ** 2 - dist ** 2),
        );
        return scene.depth(this.center) - depth_adjustment;
      }
    }
    return 0;
  }
  move_to(new_center: Vec3D) {
    this.center = new_center;
  }
  move_by(p: Vec3D) {
    this.center[0] += p[0];
    this.center[1] += p[1];
    this.center[2] += p[2];
  }
  _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    let p = scene.camera_view(this.center);
    let pr = scene.camera_view(
      vec3_sum(
        this.center,
        vec3_scale(get_column(scene.get_camera_frame(), 0), this.radius),
      ),
    );
    let state;
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
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    // TODO Make this more efficient.
    let p = scene.camera_view(this.center);
    let pr = scene.camera_view(
      vec3_sum(
        this.center,
        vec3_scale(get_column(scene.get_camera_frame(), 0), this.radius),
      ),
    );
    let state;
    if (p != null && pr != null) {
      let depth = scene.depth(this.center);
      if (
        depth >
        this.blocked_depth_at(scene, p) + this.blocked_depth_tolerance
      ) {
        state = "blocked";
      } else {
        state = "unblocked";
      }
      let [cx, cy] = scene.v2c(p as Vec2D);
      let [rx, ry] = scene.v2c(pr as Vec2D);
      let rc = vec2_norm(vec2_sub([rx, ry], [cx, cy]));
      ctx.beginPath();
      if (state == "blocked") {
        this.set_behind_linked_mobjects(ctx);
      }
      ctx.arc(cx, cy, rc, 0, 2 * Math.PI);
      ctx.stroke();
      if (this.fill) {
        ctx.globalAlpha = ctx.globalAlpha * this.fill_alpha;
        ctx.fill();
        ctx.globalAlpha = ctx.globalAlpha / this.fill_alpha;
      }
      if (state == "blocked") {
        this.unset_behind_linked_mobjects(ctx);
      }
    }
  }
  toDraggableDot3D(): DraggableDot3D {
    return new DraggableDot3D(this.center, this.radius);
  }
  toDraggableDotZ3D(): DraggableDotZ3D {
    return new DraggableDotZ3D(this.center, this.radius);
  }
}

// A draggable 3D dot.
export class DraggableDot3D extends Dot3D {
  isClicked: boolean = false;
  dragStart: Vec2D = [0, 0];
  dragEnd: Vec2D = [0, 0];
  touch_tolerance: number = 2.0;
  callbacks: (() => void)[] = [];
  // Tests whether a chosen view point lies inside the shape. Used for click-detection.
  is_inside(scene: ThreeDScene, view_point: Vec2D) {
    let center_view = scene.camera_view(this.center);
    let edge_view = scene.camera_view(
      vec3_sum(this.center, [0, 0, this.radius]),
    );
    if (center_view == null || edge_view == null) {
      return false;
    } else {
      return (
        vec2_norm(vec2_sub(view_point, center_view)) <
        vec2_norm(vec2_sub(edge_view, center_view))
      );
    }
  }
  // Tests whether a chosen vector lies within an enlarged version of the dot.
  // Used for touch-detection on mobile devices, and for use by small children.
  is_almost_inside(scene: ThreeDScene, view_point: Vec2D, tolerance: number) {
    let center_view = scene.camera_view(this.center);
    let edge_view = scene.camera_view(
      vec3_sum(this.center, [0, 0, this.radius]),
    );
    if (center_view == null || edge_view == null) {
      return false;
    } else {
      return (
        vec2_norm(vec2_sub(view_point, center_view)) <
        vec2_norm(vec2_sub(edge_view, center_view)) * tolerance
      );
    }
  }
  // Adds a callback which triggers when the dot is dragged
  add_callback(callback: () => void) {
    this.callbacks.push(callback);
  }
  do_callbacks() {
    for (const callback of this.callbacks) {
      callback();
    }
  }
  // Triggers when the canvas is clicked.
  click(scene: ThreeDScene, event: MouseEvent) {
    this.dragStart = vec2_sub(mouse_event_coords(event), [
      scene.canvas.offsetLeft,
      scene.canvas.offsetTop,
    ]);
    if (!scene.is_dragging) {
      this.isClicked = this.is_inside(
        scene,
        scene.c2v(this.dragStart[0], this.dragStart[1]),
      );
      if (this.isClicked) {
        scene.click();
      }
    }
  }
  touch(scene: ThreeDScene, event: TouchEvent) {
    this.dragStart = [
      event.touches[0].pageX - scene.canvas.offsetLeft,
      event.touches[0].pageY - scene.canvas.offsetTop,
    ];
    if (!scene.is_dragging) {
      this.isClicked = this.is_almost_inside(
        scene,
        scene.c2v(this.dragStart[0], this.dragStart[1]),
        this.touch_tolerance,
      );
      if (this.isClicked) {
        scene.click();
      }
    }
  }
  // Triggers when the canvas is unclicked.
  unclick(scene: Scene, event: MouseEvent) {
    if (this.isClicked) {
      scene.unclick();
    }
    this.isClicked = false;
  }
  untouch(scene: ThreeDScene, event: TouchEvent) {
    if (this.isClicked) {
      scene.unclick();
    }
    scene.unclick();
  }
  // Triggers when the mouse is dragged over the canvas.
  mouse_drag_cursor(scene: ThreeDScene, event: MouseEvent) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      this._drag_cursor(scene);
    }
  }
  touch_drag_cursor(scene: ThreeDScene, event: TouchEvent) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(touch_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop,
      ]);
      this._drag_cursor(scene);
    }
  }
  _drag_cursor(scene: ThreeDScene) {
    let translate_vec: Vec2D = vec2_sub(
      scene.c2v(this.dragEnd[0], this.dragEnd[1]),
      scene.c2v(this.dragStart[0], this.dragStart[1]),
    );
    this.move_by(scene.v2w(translate_vec));
    this.dragStart = this.dragEnd;
    // Perform any other MObject updates necessary.
    this.do_callbacks();
    scene.draw();
  }
  add(scene: Scene) {
    let self = this;
    // For desktop
    scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
    scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
    scene.canvas.addEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self, scene),
    );
    // For mobile
    scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
    scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
    scene.canvas.addEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self, scene),
    );
  }
  remove(scene: Scene) {
    let self = this;
    // For desktop
    scene.canvas.removeEventListener("mousedown", this.click.bind(self, scene));
    scene.canvas.removeEventListener("mouseup", this.unclick.bind(self, scene));
    scene.canvas.removeEventListener(
      "mousemove",
      this.mouse_drag_cursor.bind(self, scene),
    );
    // For mobile
    scene.canvas.removeEventListener(
      "touchstart",
      this.click.bind(self, scene),
    );
    scene.canvas.removeEventListener(
      "touchend",
      this.unclick.bind(self, scene),
    );
    scene.canvas.removeEventListener(
      "touchmove",
      self.mouse_drag_cursor.bind(self, scene),
    );
  }
  toDot3D(): Dot3D {
    return new Dot3D(this.center, this.radius);
  }
}

// Dragging only affects the z-coordinate
export class DraggableDotZ3D extends DraggableDot3D {
  _drag_cursor(scene: ThreeDScene) {
    let translate_vec: Vec2D = vec2_sub(
      scene.c2v(this.dragEnd[0], this.dragEnd[1]),
      scene.c2v(this.dragStart[0], this.dragStart[1]),
    );
    let [mx, my, mz] = scene.v2w(translate_vec);
    this.move_by([0, 0, mz]);
    this.dragStart = this.dragEnd;
    // Perform any other MObject updates necessary.
    this.do_callbacks();
    scene.draw();
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

    // Check if they are blocked.
    let start_blocked = this.is_blocked(scene, this.start);
    let end_blocked = this.is_blocked(scene, this.end);

    // If both points are unblocked, draw the whole line in unblocked style.
    if (!start_blocked && !end_blocked) {
      ctx.beginPath();
      ctx.moveTo(start_x, start_y);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
    }
    // If both points are blocked, draw the whole line in blocked style.
    else if (start_blocked && end_blocked) {
      ctx.beginPath();
      this.set_behind_linked_mobjects(ctx);
      ctx.moveTo(start_x, start_y);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
      this.unset_behind_linked_mobjects(ctx);
    }
    // If one point is unblocked and the other is blocked, binary-search for a point between them
    // where the transition happens. Then draw part of the line in unblocked style and part in blocked style.
    else {
      // Binary search for the point where the line segment changes from unblocked to blocked
      let n = 1;
      let v = vec3_sub(this.end, this.start);
      let p = vec3_scale(vec3_sum(this.start, this.end), 0.5);
      while (n < 6) {
        n += 1;
        if (this.is_blocked(scene, p) == start_blocked) {
          p = vec3_sum(p, vec3_scale(v, 1 / 2 ** n));
        } else {
          p = vec3_sub(p, vec3_scale(v, 1 / 2 ** n));
        }
      }

      let [p_x, p_y] = scene.v2c(scene.camera_view(p) as Vec2D);

      if (start_blocked) {
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        this.set_behind_linked_mobjects(ctx);
        ctx.lineTo(p_x, p_y);
        ctx.stroke();

        ctx.beginPath();
        this.unset_behind_linked_mobjects(ctx);
        ctx.moveTo(p_x, p_y);
        ctx.lineTo(end_x, end_y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(end_x, end_y);
        this.set_behind_linked_mobjects(ctx);
        ctx.lineTo(p_x, p_y);
        ctx.stroke();

        ctx.beginPath();
        this.unset_behind_linked_mobjects(ctx);
        ctx.moveTo(p_x, p_y);
        ctx.lineTo(start_x, start_y);
        ctx.stroke();
      }
    }
  }
  // Simpler drawing routine which doesn't use local depth testing or test against FillLike objects
  _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
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
    let current_point: Vec3D = this.points[0];
    let current_point_camera_view: Vec2D | null =
      scene.camera_view(current_point);
    let cp_x: number = 0,
      cp_y: number = 0;
    if (current_point_camera_view != null) {
      [cp_x, cp_y] = scene.v2c(current_point_camera_view);
    }
    let current_point_blocked: boolean = this.is_blocked(scene, current_point);

    let midpoint: Vec3D;
    let mp_x: number, mp_y: number;

    let next_point: Vec3D;
    let next_point_camera_view: Vec2D | null;
    let np_x: number, np_y: number;
    let next_point_blocked: boolean;

    let v: Vec3D;
    let n: number;
    for (let i = 1; i < this.points.length; i++) {
      next_point = this.points[i];
      next_point_camera_view = scene.camera_view(next_point);
      if (current_point_camera_view == null || next_point_camera_view == null) {
        continue;
      }
      [np_x, np_y] = scene.v2c(next_point_camera_view);
      next_point_blocked = this.is_blocked(scene, next_point);

      if (!current_point_blocked && !next_point_blocked) {
        ctx.beginPath();
        ctx.moveTo(cp_x, cp_y);
        ctx.lineTo(np_x, np_y);
        ctx.stroke();
      } else if (current_point_blocked && next_point_blocked) {
        ctx.beginPath();
        this.set_behind_linked_mobjects(ctx);
        ctx.moveTo(cp_x, cp_y);
        ctx.lineTo(np_x, np_y);
        ctx.stroke();
        this.unset_behind_linked_mobjects(ctx);
      } else {
        n = 1;
        v = vec3_sub(next_point, current_point);
        midpoint = vec3_scale(vec3_sum(next_point, current_point), 0.5);
        while (n < 6) {
          n += 1;
          if (this.is_blocked(scene, midpoint) == current_point_blocked) {
            midpoint = vec3_sum(midpoint, vec3_scale(v, 1 / 2 ** n));
          } else {
            midpoint = vec3_sub(midpoint, vec3_scale(v, 1 / 2 ** n));
          }
        }
        [mp_x, mp_y] = scene.v2c(scene.camera_view(midpoint) as Vec2D);

        if (current_point_blocked) {
          ctx.beginPath();
          ctx.moveTo(cp_x, cp_y);
          this.set_behind_linked_mobjects(ctx);
          ctx.lineTo(mp_x, mp_y);
          ctx.stroke();

          ctx.beginPath();
          this.unset_behind_linked_mobjects(ctx);
          ctx.moveTo(mp_x, mp_y);
          ctx.lineTo(np_x, np_y);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(np_x, np_y);
          this.set_behind_linked_mobjects(ctx);
          ctx.lineTo(mp_x, mp_y);
          ctx.stroke();

          ctx.beginPath();
          this.unset_behind_linked_mobjects(ctx);
          ctx.moveTo(mp_x, mp_y);
          ctx.lineTo(cp_x, cp_y);
          ctx.stroke();
        }
      }
      current_point = next_point;
      current_point_camera_view = next_point_camera_view;
      [cp_x, cp_y] = [np_x, np_y];
      current_point_blocked = next_point_blocked;
    }
  }
  // Simpler drawing routine which doesn't use local depth testing or test against FillLike objects
  _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
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
          // TODO Do a depth-test at this point with any linked FillLike objects to determine
          // whether to draw dashed or solid.
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
  points: Vec3D[] = [];
  mode: "smooth" | "jagged" = "jagged";
  linked_mobjects: ThreeDFillLikeMObject[] = [];
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
    this.calculatePoints();
  }
  // Jagged doesn't use Bezier curves. It is faster to compute and render.
  // TODO Implement Bezier curve for smoother rendering.
  set_mode(mode: "smooth" | "jagged") {
    this.mode = mode;
  }
  set_function(new_f: (t: number) => Vec3D) {
    this.function = new_f;
    this.calculatePoints();
  }
  // Calculates the points for the curve.
  calculatePoints() {
    this.points = [];
    for (let i = 0; i <= this.num_steps; i++) {
      this.points.push(
        this.function(
          this.tmin + (i / this.num_steps) * (this.tmax - this.tmin),
        ),
      );
    }
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    // TODO Use a Bezier curve for smoother rendering.

    let state: "out_of_frame" | "in_frame" | "blocked" | "unblocked" =
      "out_of_frame";
    let next_state: "out_of_frame" | "in_frame" | "blocked" | "unblocked" =
      "out_of_frame";

    // TODO This variant of rendering with piecewise depth-testing is more computationally expensive.
    // Build in the option to use simple, global depth-testing.
    let p: Vec2D | null;
    let x: number, y: number;
    let last_x: number = 0;
    let last_y: number = 0;
    let depth: number;
    for (let i = 0; i < this.points.length; i++) {
      p = scene.camera_view(this.points[i]);
      depth = scene.depth(this.points[i]);
      if (p == null) {
        next_state = "out_of_frame";
        if (state == "unblocked") {
          ctx.stroke();
        } else if (state == "blocked") {
          ctx.stroke();
          this.unset_behind_linked_mobjects(ctx);
        }
        state = next_state;
      } else {
        [x, y] = scene.v2c(p);
        if (state == "out_of_frame") {
          next_state = "in_frame";
          ctx.beginPath();
          ctx.moveTo(x, y);
          state = next_state;
        } else {
          // Do a depth-test at this point with any linked FillLike objects to determine
          // whether to switch to blocked or unblocked
          if (
            depth >
            this.blocked_depth_at(scene, p) + this.blocked_depth_tolerance
          ) {
            next_state = "blocked";
          } else {
            next_state = "unblocked";
          }
          if (state == "in_frame" && next_state == "blocked") {
            ctx.beginPath();
            this.set_behind_linked_mobjects(ctx);
            ctx.lineTo(x, y);
          } else if (state == "in_frame" && next_state == "unblocked") {
            ctx.beginPath();
            ctx.moveTo(last_x, last_y);
            ctx.lineTo(x, y);
          } else if (state == "blocked" && next_state == "unblocked") {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(last_x, last_y);
            this.unset_behind_linked_mobjects(ctx);
            ctx.lineTo(x, y);
          } else if (state == "unblocked" && next_state == "blocked") {
            ctx.stroke();
            ctx.beginPath();
            this.set_behind_linked_mobjects(ctx);
            ctx.moveTo(last_x, last_y);
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          state = next_state;
        }
        [last_x, last_y] = [x, y];
      }
    }

    // Finish the path
    if (state == "blocked" || state == "unblocked") {
      ctx.stroke();
    }
    if (state == "blocked") {
      this.unset_behind_linked_mobjects(ctx);
    }
  }
  // Simpler drawing routine which doesn't use local depth testing or test against FillLike objects
  _draw_simple(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
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
  mode: "perspective" | "orthographic" = "perspective";
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
  // Converts a 2D vector in the view to world coordinates
  v2w(v: Vec2D): Vec3D {
    let frame = this.get_camera_frame();
    return vec3_sum(
      vec3_scale(get_column(frame, 0), v[0]),
      vec3_scale(get_column(frame, 1), v[1]),
    );
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
  // Rotates the camera view around various axes
  rot_camera_z(angle: number) {
    this.rot_z(angle);
    this.set_camera_position(rot_z(this.camera_position, angle));
  }
  rot_camera_y(angle: number) {
    this.rot_y(angle);
    this.set_camera_position(rot_y(this.camera_position, angle));
  }
  rot_camera_x(angle: number) {
    this.rot_x(angle);
    this.set_camera_position(rot_x(this.camera_position, angle));
  }
  rot_camera(axis: Vec3D, angle: number) {
    this.rot(axis, angle);
    this.set_camera_position(rot(this.camera_position, axis, angle));
  }
  // Modes of viewing/drawing
  set_view_mode(mode: "perspective" | "orthographic") {
    this.mode = mode;
  }
  camera_view(p: Vec3D): Vec2D | null {
    if (this.mode == "perspective") {
      return this.perspective_view(p);
    } else {
      return this.orthographic_view(p);
    }
  }
  depth(p: Vec3D): number {
    return matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position),
    )[2];
  }
  // Projects a 3D point onto the camera view plane. Does not include perspective.
  orthographic_view(p: Vec3D): Vec2D {
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

    // First order the objects by depth
    let ordered_names = Object.keys(this.mobjects).sort((a, b) => {
      let depth_a = this.mobjects[a].depth(this);
      let depth_b = this.mobjects[b].depth(this);
      return depth_b - depth_a;
    });

    // Then draw them in order: first the FillLike objects, then the LineLike objects, then others.
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (mobj instanceof ThreeDFillLikeMObject) {
        mobj.draw(this.canvas, this);
      }
    }
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (mobj instanceof ThreeDLineLikeMObject) {
        mobj.draw(this.canvas, this);
      }
    }
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (
        !(mobj instanceof ThreeDFillLikeMObject) &&
        !(mobj instanceof ThreeDLineLikeMObject)
      ) {
        mobj.draw(this.canvas, this);
      }
    }

    // Draw a border around the canvas
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Identical extension of ThreeDScene as InteractivePlayingScene is of Scene
export abstract class InteractivePlayingThreeDScene extends ThreeDScene {
  simulators: Record<number, Simulator>; // The internal simulator
  num_simulators: number;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  time: number;
  dt: number;
  end_time: number | undefined; // Store a known end-time in case the simulation is paused and unpaused
  constructor(canvas: HTMLCanvasElement, simulators: Array<Simulator>) {
    super(canvas);
    [this.num_simulators, this.simulators] = simulators.reduce(
      ([ind, acc], item) => ((acc[ind] = item), [ind + 1, acc]),
      [0, {}] as [number, Record<number, Simulator>],
    );
    this.action_queue = [];
    this.paused = true;
    this.time = 0;
    this.dt = (simulators[0] as Simulator).dt;
  }
  get_simulator(ind: number = 0): Simulator {
    return this.simulators[ind] as Simulator;
  }
  set_simulator_attr(
    simulator_ind: number,
    attr_name: string,
    attr_val: number,
  ) {
    this.get_simulator(simulator_ind).set_attr(attr_name, attr_val);
  }
  // Restarts the simulator
  reset(): void {
    for (let ind = 0; ind < this.num_simulators; ind++) {
      this.get_simulator(ind).reset();
    }
    this.time = 0;
    this.draw();
  }
  // Switches from paused to unpaused and vice-versa.
  toggle_pause() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.play(this.end_time);
    }
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback: () => void) {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Starts animation
  play(until: number | undefined) {
    // If paused, record the end time and stop the loop
    if (this.paused) {
      this.end_time = until;
      return;
    }
    // Otherwise, loop
    else {
      // If there are outstanding actions, perform them first
      if (this.action_queue.length > 0) {
        let callback = this.action_queue.shift() as () => void;
        callback();
      }
      // If we have reached the end-time, stop.
      else if (this.time > (until as number)) {
        return;
      } else {
        for (let ind = 0; ind < this.num_simulators; ind++) {
          this.get_simulator(ind).step();
        }
        this.time += this.get_simulator(0).dt;
        this.draw();
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates all mobjects to account for the new simulator state
  update_mobjects() {}
  // Draws the scene without worrying about depth-sensing.
  // TODO Sort this out later.
  draw() {
    this.update_mobjects();

    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      this.draw_mobject(mobj);
    });
  }
  // Add drawing instructions in the subclass.
  draw_mobject(mobj: MObject) {}
}
