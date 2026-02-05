// src/lib/base.ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var MObject = class {
  // Opacity for drawing
  constructor() {
    this.alpha = 1;
  }
  set_alpha(alpha) {
    this.alpha = alpha;
  }
  add(scene) {
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    this._draw(ctx, scene, args);
  }
  _draw(ctx, scene, args) {
  }
};
var Scene = class {
  constructor(canvas) {
    this.border_thickness = 4;
    this.border_color = "black";
    // Zoom ratio
    this.zoom_ratio = 1;
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
    this.view_xlims = [0, canvas.width];
    this.view_ylims = [0, canvas.height];
  }
  // Sets the coordinates for the borders of the scene. This also resets
  // the current viewing window to match the scene size.
  set_frame_lims(xlims, ylims) {
    this.xlims = xlims;
    this.ylims = ylims;
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Sets the current viewing window
  set_view_lims(xlims, ylims) {
    this.zoom_ratio = (this.xlims[1] - this.xlims[0]) / (xlims[1] - xlims[0]);
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Sets the current zoom level
  set_zoom(value) {
    this.zoom_ratio = value;
    this.view_xlims = [this.xlims[0] / value, this.xlims[1] / value];
    this.view_ylims = [this.ylims[0] / value, this.ylims[1] / value];
  }
  // Converts scene coordinates to canvas coordinates
  s2c(x, y) {
    return [
      this.canvas.width * (x - this.xlims[0]) / (this.xlims[1] - this.xlims[0]),
      this.canvas.height * (this.ylims[1] - y) / (this.ylims[1] - this.ylims[0])
    ];
  }
  // Converts viewing coordinates to canvas coordinates
  v2c(v) {
    return [
      this.canvas.width * (v[0] - this.view_xlims[0]) / (this.view_xlims[1] - this.view_xlims[0]),
      this.canvas.height * (this.view_ylims[1] - v[1]) / (this.view_ylims[1] - this.view_ylims[0])
    ];
  }
  // Converts canvas coordinates to scene coordinates
  c2s(x, y) {
    return [
      this.xlims[0] + x * (this.xlims[1] - this.xlims[0]) / this.canvas.width,
      this.ylims[1] - y * (this.ylims[1] - this.ylims[0]) / this.canvas.height
    ];
  }
  // Converts canvas coordinates to viewing coordinates
  c2v(x, y) {
    return [
      this.view_xlims[0] + x * (this.view_xlims[1] - this.view_xlims[0]) / this.canvas.width,
      this.view_ylims[1] - y * (this.view_ylims[1] - this.view_ylims[0]) / this.canvas.height
    ];
  }
  // Adds a mobject to the scene
  add(name, mobj) {
    this.mobjects[name] = mobj;
    let self = this;
    mobj.add(self);
  }
  // Removes the mobject from the scene
  remove(name) {
    delete this.mobjects[name];
  }
  // Removes all mobjects from the scene
  clear() {
    this.mobjects = {};
  }
  // Gets the mobject by name
  get_mobj(name) {
    let mobj = this.mobjects[name];
    if (mobj == void 0) throw new Error(`${name} not found`);
    return mobj;
  }
  // Draws the scene
  draw(args) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
};
function prepare_canvas(width, height, name) {
  const container = document.getElementById(name);
  if (container == null) throw new Error(`${name} not found`);
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  let wrapper = document.createElement("div");
  wrapper.classList.add("canvas_container");
  wrapper.classList.add("non_selectable");
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  let canvas = document.createElement("canvas");
  canvas.classList.add("non_selectable");
  canvas.style.position = "relative";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.height = height;
  canvas.width = width;
  wrapper.appendChild(canvas);
  container.appendChild(wrapper);
  prepareCanvasForMobile(canvas);
  return canvas;
}
function prepareCanvasForMobile(canvas) {
  canvas.ontouchstart = function(e) {
    e.preventDefault();
  };
  canvas.ontouchend = function(e) {
    e.preventDefault();
  };
  canvas.ontouchmove = function(e) {
    e.preventDefault();
  };
}

// src/lib/base_geom.ts
function vec2_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
function vec2_normalize(x) {
  let n = vec2_norm(x);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec2_scale(x, 1 / n);
  }
}
function vec2_scale(x, factor) {
  return [x[0] * factor, x[1] * factor];
}
function vec2_sum(x, y) {
  return [x[0] + y[0], x[1] + y[1]];
}
function vec2_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
}
function vec2_rot(v, angle) {
  const [x, y] = v;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - y * sin, x * sin + y * cos];
}

// src/lib/three_d.ts
function vec3_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2 + x[2] ** 2);
}
function vec3_dot(v, w) {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += v[i] * w[i];
  }
  return result;
}
function vec3_scale(x, factor) {
  return [x[0] * factor, x[1] * factor, x[2] * factor];
}
function vec3_sum(x, y) {
  return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
}
function vec3_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
}
var ThreeDMObject = class extends MObject {
  // Return the depth of the object in the scene. Used for sorting.
  depth(scene) {
    return 0;
  }
  // Return the depth of the nearest point on the object that lies along the
  // given ray. Used for relative depth-testing between 3D objects, to determine
  // how to draw them.
  depth_at(scene, view_point) {
    return 0;
  }
};
var ThreeDLineLikeMObject = class extends ThreeDMObject {
  constructor() {
    super(...arguments);
    this.stroke_width = 0.08;
    this.stroke_color = "black";
    this.stroke_style = "solid";
  }
  set_stroke_color(color) {
    this.stroke_color = color;
  }
  set_stroke_width(width) {
    this.stroke_width = width;
  }
  set_stroke_style(style) {
    this.stroke_style = style;
    return this;
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.stroke_width * canvas.width / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    if (this.stroke_style == "dashed") {
      ctx.setLineDash([5, 5]);
    } else if (this.stroke_style == "dotted") {
      ctx.setLineDash([2, 2]);
    }
    this._draw(ctx, scene, args);
    ctx.setLineDash([]);
  }
};
var ThreeDFillLikeMObject = class extends ThreeDMObject {
  constructor() {
    super(...arguments);
    this.stroke_width = 0.08;
    this.stroke_color = "black";
    this.stroke_style = "solid";
    this.fill_color = "black";
    this.fill_alpha = 1;
    this.fill = true;
  }
  set_stroke_color(color) {
    this.stroke_color = color;
  }
  set_stroke_width(width) {
    this.stroke_width = width;
  }
  set_stroke_style(style) {
    this.stroke_style = style;
    return this;
  }
  set_fill_color(color) {
    this.fill_color = color;
  }
  set_color(color) {
    this.stroke_color = color;
    this.fill_color = color;
  }
  set_fill_alpha(alpha) {
    this.fill_alpha = alpha;
  }
  set_fill(fill) {
    this.fill = fill;
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.stroke_width * canvas.width / (xmax - xmin);
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
};
var Dot3D = class extends ThreeDFillLikeMObject {
  constructor(center, radius) {
    super();
    this.center = center;
    this.radius = radius;
  }
  depth(scene) {
    return scene.depth(this.center);
  }
  depth_at(scene, view_point) {
    if (scene.mode == "perspective") {
      return 0;
    } else if (scene.mode == "orthographic") {
      let dist = vec2_norm(
        vec2_sub(view_point, scene.orthographic_view(this.center))
      );
      if (dist > this.radius) {
        return Infinity;
      } else {
        let depth_adjustment = Math.sqrt(
          Math.max(0, this.radius ** 2 - dist ** 2)
        );
        return scene.depth(this.center) - depth_adjustment;
      }
    }
    return 0;
  }
  move_to(new_center) {
    this.center = new_center;
  }
  _draw(ctx, scene) {
    let p = scene.camera_view(this.center);
    let pr = scene.camera_view(
      vec3_sum(
        this.center,
        vec3_scale(get_column(scene.get_camera_frame(), 0), this.radius)
      )
    );
    if (p != null && pr != null) {
      let [cx, cy] = scene.v2c(p);
      let [rx, ry] = scene.v2c(pr);
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
};
var Line3D = class extends ThreeDLineLikeMObject {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
  // Moves the start and end points
  move_start(v) {
    this.start = v;
  }
  move_end(v) {
    this.end = v;
  }
  depth(scene) {
    return scene.depth(vec3_scale(vec3_sum(this.end, this.start), 0.5));
  }
  _draw(ctx, scene) {
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
};
var TwoHeadedArrow3D = class extends Line3D {
  constructor(start, end) {
    super(start, end);
    this.arrow_size = 0.3;
    this.fill_color = this.stroke_color;
  }
  set_arrow_size(size) {
    this.arrow_size = size;
  }
  _draw(ctx, scene) {
    super._draw(ctx, scene);
    ctx.fillStyle = this.fill_color;
    let s = scene.camera_view(this.start);
    let e = scene.camera_view(this.end);
    if (s == null || e == null) return;
    let [end_x, end_y] = scene.v2c(e);
    let [start_x, start_y] = scene.v2c(s);
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
};
var Cube = class extends ThreeDLineLikeMObject {
  constructor(center, size) {
    super();
    this.center = center;
    this.size = size;
  }
  depth(scene) {
    return scene.depth(this.center);
  }
  _draw(ctx, scene) {
    const vertices = [
      vec3_sum(this.center, vec3_scale([1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, -1], this.size / 2))
    ];
    const projected_vertices = [];
    for (let i = 0; i < vertices.length; i++) {
      projected_vertices.push(scene.camera_view(vertices[i]));
    }
    let v;
    const canvas_vertices = [];
    for (let i = 0; i < vertices.length; i++) {
      let v2 = projected_vertices[i];
      if (v2 == null) {
        canvas_vertices.push(v2);
      } else {
        canvas_vertices.push(scene.v2c(v2));
      }
    }
    let start_x;
    let start_y;
    let end_x;
    let end_y;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < i; j++) {
        if ((i ^ j) == 1 || (i ^ j) == 2 || (i ^ j) == 4) {
          if (canvas_vertices[i] == null || canvas_vertices[j] == null) {
            continue;
          } else {
            [start_x, start_y] = canvas_vertices[i];
            [end_x, end_y] = canvas_vertices[j];
            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(end_x, end_y);
            ctx.stroke();
          }
        }
      }
    }
  }
};
var ParametrizedCurve3D = class extends ThreeDLineLikeMObject {
  constructor(f, tmin, tmax, num_steps) {
    super();
    this.points = [];
    this.mode = "jagged";
    this.linked_mobjects = [];
    this.function = f;
    this.tmin = tmin;
    this.tmax = tmax;
    this.num_steps = num_steps;
    this.calculatePoints();
  }
  // Jagged doesn't use Bezier curves. It is faster to compute and render.
  // TODO Implement Bezier curve for smoother rendering.
  set_mode(mode) {
    this.mode = mode;
  }
  set_function(new_f) {
    this.function = new_f;
    this.calculatePoints();
  }
  // Add a linked Mobject. These are fill-like MObjects in the scene which might obstruct the view
  // of the curve, and are used internally to _draw() for depth-testing.
  link_mobject(mobject) {
    this.linked_mobjects.push(mobject);
  }
  // Sets the context drawer settings for drawing behind linked FillLike objects.
  set_behind_linked_mobjects(ctx) {
    ctx.setLineDash([5, 10]);
  }
  unset_behind_linked_mobjects(ctx) {
    ctx.setLineDash([]);
  }
  // Calculates the points for the curve.
  calculatePoints() {
    this.points = [];
    for (let i = 0; i <= this.num_steps; i++) {
      this.points.push(
        this.function(
          this.tmin + i / this.num_steps * (this.tmax - this.tmin)
        )
      );
    }
  }
  // Calculates the minimum depth value among linked FillLike objects at the given scene view point.
  blocked_depth_at(scene, view_point) {
    return Math.min(
      ...this.linked_mobjects.map(
        (m) => m.depth_at(scene, view_point)
      )
    );
  }
  _draw(ctx, scene) {
    let state = "out_of_frame";
    let next_state = "out_of_frame";
    let p;
    let x, y;
    let last_x = 0;
    let last_y = 0;
    let depth;
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
          if (depth > this.blocked_depth_at(scene, p) + 0.01) {
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
    if (state == "blocked" || state == "unblocked") {
      ctx.stroke();
    }
    if (state == "blocked") {
      this.unset_behind_linked_mobjects(ctx);
    }
  }
};
var ThreeDScene = class extends Scene {
  constructor() {
    super(...arguments);
    // Inverse of the camera matrix
    this.camera_frame_inv = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    this.camera_position = [0, 0, 0];
    this.mode = "perspective";
  }
  // Set the camera position
  set_camera_position(position) {
    this.camera_position = position;
  }
  // Translate the camera matrix by a given vector
  translate(vec) {
    this.camera_position = vec3_sum(this.camera_position, vec);
  }
  // Set the camera frame inverse
  set_camera_frame_inv(frame_inv) {
    this.camera_frame_inv = frame_inv;
  }
  // Get the camera frame matrix
  get_camera_frame() {
    return mat_inv(this.camera_frame_inv);
  }
  // Rotate the camera matrix around the z-axis.
  rot_z(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_z_matrix(-angle)
    );
  }
  // Rotate the camera matrix around the y-axis.
  rot_y(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_y_matrix(-angle)
    );
  }
  // Rotate the camera matrix around the x-axis.
  rot_x(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_x_matrix(-angle)
    );
  }
  // Rotate the camera matrix around a given axis
  rot(axis, angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_matrix(axis, -angle)
    );
  }
  // Modes of viewing/drawing
  set_view_mode(mode) {
    this.mode = mode;
  }
  camera_view(p) {
    if (this.mode == "perspective") {
      return this.perspective_view(p);
    } else {
      return this.orthographic_view(p);
    }
  }
  depth(p) {
    return matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position)
    )[2];
  }
  // Projects a 3D point onto the camera view plane. Does not include perspective.
  orthographic_view(p) {
    let [vx, vy, vz] = matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position)
    );
    return [vx, vy];
  }
  // Projects a 3D point onto the camera view plane, and then divides by the third coordinate.
  // Returns null if the third coordinate is nonpositive (i.e., the point is behind the camera).
  perspective_view(p) {
    let [vx, vy, vz] = matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position)
    );
    if (vz <= 0) {
      return null;
    } else {
      return [vx / vz, vy / vz];
    }
  }
  // Draw
  draw(args) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let ordered_names = Object.keys(this.mobjects).sort((a, b) => {
      let depth_a = this.mobjects[a].depth(this);
      let depth_b = this.mobjects[b].depth(this);
      return depth_a - depth_b;
    });
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    }
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

// src/lib/matvec.ts
function transpose(m) {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]]
  ];
}
function mat_inv(m) {
  let det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  if (det == 0) {
    throw new Error("Can't invert a singular matrix");
  }
  let inv_det = 1 / det;
  return [
    [
      inv_det * (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
      inv_det * (m[0][2] * m[2][1] - m[0][1] * m[2][2]),
      inv_det * (m[0][1] * m[1][2] - m[0][2] * m[1][1])
    ],
    [
      inv_det * (m[1][2] * m[2][0] - m[1][0] * m[2][2]),
      inv_det * (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
      inv_det * (m[0][2] * m[1][0] - m[0][0] * m[1][2])
    ],
    [
      inv_det * (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
      inv_det * (m[0][1] * m[2][0] - m[0][0] * m[2][1]),
      inv_det * (m[0][0] * m[1][1] - m[0][1] * m[1][0])
    ]
  ];
}
function get_column(m, i) {
  return [m[0][i], m[1][i], m[2][i]];
}
function normalize(v) {
  let n = vec3_norm(v);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec3_scale(v, 1 / n);
  }
}
function matmul_vec(m, v) {
  let result = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    result[i] = vec3_dot(m[i], v);
  }
  return result;
}
function matmul_mat(m1, m2) {
  let result = [];
  for (let i = 0; i < 3; i++) {
    result.push(matmul_vec(m1, [m2[0][i], m2[1][i], m2[2][i]]));
  }
  return transpose(result);
}
function rot_z_matrix(theta) {
  return [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ];
}
function rot_z(v, theta) {
  return matmul_vec(rot_z_matrix(theta), v);
}
function rot_y_matrix(theta) {
  return [
    [Math.cos(theta), 0, Math.sin(theta)],
    [0, 1, 0],
    [-Math.sin(theta), 0, Math.cos(theta)]
  ];
}
function rot_y(v, theta) {
  return matmul_vec(rot_y_matrix(theta), v);
}
function rot_x_matrix(theta) {
  return [
    [1, 0, 0],
    [0, Math.cos(theta), -Math.sin(theta)],
    [0, Math.sin(theta), Math.cos(theta)]
  ];
}
function rot_matrix(axis, angle) {
  let [x, y, z] = normalize(axis);
  let theta = Math.acos(z);
  let phi = Math.acos(x / Math.sin(theta));
  if (y / Math.sin(theta) < 0) {
    phi = 2 * Math.PI - phi;
  }
  let result = rot_z_matrix(-phi);
  result = matmul_mat(rot_y_matrix(-theta), result);
  result = matmul_mat(rot_z_matrix(angle), result);
  result = matmul_mat(rot_y_matrix(theta), result);
  result = matmul_mat(rot_z_matrix(phi), result);
  return result;
}
function rot(v, axis, angle) {
  let [x, y, z] = normalize(axis);
  let theta = Math.acos(z);
  let phi = Math.acos(x / Math.sin(theta));
  if (y / Math.sin(theta) < 0) {
    phi = 2 * Math.PI - phi;
  }
  let result = rot_z(v, -phi);
  result = rot_y(result, -theta);
  result = rot_z(result, angle);
  result = rot_y(result, theta);
  result = rot_z(result, phi);
  return result;
}

// src/lib/interactive.ts
function Slider(container, callback, kwargs) {
  let slider = document.createElement("input");
  slider.type = "range";
  slider.value = kwargs.initial_value;
  slider.classList.add("slider");
  slider.id = "floatSlider";
  let name = kwargs.name;
  if (name == void 0) {
    slider.name = "Value";
  } else {
    slider.name = name;
  }
  let min = kwargs.min;
  if (min == void 0) {
    slider.min = "0";
  } else {
    slider.min = `${min}`;
  }
  let max = kwargs.max;
  if (max == void 0) {
    slider.max = "10";
  } else {
    slider.max = `${max}`;
  }
  let step = kwargs.step;
  if (step == void 0) {
    slider.step = ".01";
  } else {
    slider.step = `${step}`;
  }
  container.appendChild(slider);
  let valueDisplay = document.createElement("span");
  valueDisplay.classList.add("value-display");
  valueDisplay.id = "sliderValue";
  valueDisplay.textContent = `${slider.name} = ${slider.value}`;
  container.appendChild(valueDisplay);
  function updateDisplay() {
    callback(slider.value);
    valueDisplay.textContent = `${slider.name} = ${slider.value}`;
    updateSliderColor(slider);
  }
  function updateSliderColor(sliderElement) {
    const value = 100 * parseFloat(sliderElement.value);
    sliderElement.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${value}%, #ddd ${value}%, #ddd 100%)`;
  }
  updateDisplay();
  slider.addEventListener("input", updateDisplay);
  return slider;
}
function Button(container, callback) {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "interactiveButton";
  container.appendChild(button);
  button.addEventListener("click", (event) => {
    callback();
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 100);
  });
  return button;
}

// src/lib/arcball.ts
var Arcball = class {
  constructor(scene) {
    this.drag = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.dragDiff = [0, 0];
    this.mode = "Translate";
    this.scene = scene;
  }
  set_mode(mode) {
    this.mode = mode;
  }
  switch_mode() {
    this.mode = this.mode == "Translate" ? "Rotate" : "Translate";
  }
  click(event) {
    this.dragStart = [
      event.pageX - this.scene.canvas.offsetLeft,
      event.pageY - this.scene.canvas.offsetTop
    ];
    this.drag = true;
  }
  touch(event) {
    this.dragStart = [
      event.touches[0].pageX - this.scene.canvas.offsetLeft,
      event.touches[0].pageY - this.scene.canvas.offsetTop
    ];
    this.drag = true;
  }
  unclick(event) {
    this.drag = false;
  }
  untouch(event) {
    this.drag = false;
  }
  mouse_drag_cursor(event) {
    if (this.drag) {
      this.dragEnd = [
        event.pageX - this.scene.canvas.offsetLeft,
        event.pageY - this.scene.canvas.offsetTop
      ];
      this._drag_cursor();
    }
  }
  touch_drag_cursor(event) {
    if (this.drag) {
      this.dragEnd = [
        event.touches[0].pageX - this.scene.canvas.offsetLeft,
        event.touches[0].pageY - this.scene.canvas.offsetTop
      ];
      this._drag_cursor();
    }
  }
  // Updates the scene to account for a dragged cursor position
  _drag_cursor() {
    let dragDiff = vec2_sub(
      this.scene.c2s(this.dragStart[0], this.dragStart[1]),
      this.scene.c2s(this.dragEnd[0], this.dragEnd[1])
    );
    if (dragDiff[0] == 0 && dragDiff[1] == 0) {
      return;
    }
    if (this.mode == "Translate") {
      let camera_frame = this.scene.get_camera_frame();
      this.scene.translate(
        vec3_sum(
          vec3_scale(get_column(camera_frame, 0), dragDiff[0]),
          vec3_scale(get_column(camera_frame, 1), dragDiff[1])
        )
      );
    } else if (this.mode == "Rotate") {
      let v = vec2_normalize([dragDiff[1], -dragDiff[0]]);
      let camera_frame = this.scene.get_camera_frame();
      let rot_axis = vec3_sum(
        vec3_scale(get_column(camera_frame, 0), v[0]),
        vec3_scale(get_column(camera_frame, 1), v[1])
      );
      let n = vec2_norm(dragDiff);
      this.scene.rot(rot_axis, n);
      this.scene.set_camera_position(
        rot(this.scene.camera_position, rot_axis, n)
      );
    }
    this.scene.draw();
    this.dragStart = this.dragEnd;
  }
  add() {
    let self = this;
    this.scene.canvas.addEventListener("mousedown", self.click.bind(self));
    this.scene.canvas.addEventListener("mouseup", self.unclick.bind(self));
    this.scene.canvas.addEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self)
    );
    this.scene.canvas.addEventListener("touchstart", self.touch.bind(self));
    this.scene.canvas.addEventListener("touchend", self.untouch.bind(self));
    this.scene.canvas.addEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self)
    );
  }
  remove() {
    let self = this;
    this.scene.canvas.removeEventListener("mousedown", self.click.bind(self));
    this.scene.canvas.removeEventListener("mouseup", self.unclick.bind(self));
    this.scene.canvas.removeEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self)
    );
    this.scene.canvas.removeEventListener("touchstart", self.touch.bind(self));
    this.scene.canvas.removeEventListener("touchend", self.untouch.bind(self));
    this.scene.canvas.removeEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self)
    );
  }
};

// src/three_d_scene.ts
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (async function three_d_cube(width, height) {
      let canvas = prepare_canvas(width, height, "three-d-cube");
      let zoom_ratio = 5.5;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_zoom(zoom_ratio);
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4)
      );
      scene.add("cube", new Cube([0, 0, 0], 3));
      scene.add("dot", new Dot3D([0, 0, 0], 0.05));
      scene.draw();
      let arcball = new Arcball(scene);
      arcball.add();
      let playing = true;
      let pauseButton = Button(
        document.getElementById("three-d-cube-pause-button"),
        function() {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        }
      );
      pauseButton.textContent = "Pause simulation";
      pauseButton.style.padding = "15px";
      let modeButton = Button(
        document.getElementById("three-d-cube-mode-button"),
        function() {
          arcball.switch_mode();
          modeButton.textContent = `Mode: ${arcball.mode}`;
        }
      );
      modeButton.textContent = `Mode: ${arcball.mode}`;
      modeButton.style.padding = "15px";
      let axis = [1, 0, 0];
      let perturb_angle = Math.PI / 200;
      let perturb_axis = [0, 1, 0];
      let perturb_axis_angle = Math.PI / 50;
      while (true) {
        if (playing) {
          perturb_axis = rot(perturb_axis, axis, Math.random() * Math.PI * 2);
          axis = rot(axis, perturb_axis, perturb_axis_angle);
          scene.rot(axis, perturb_angle);
          scene.camera_position = rot(
            scene.camera_position,
            axis,
            perturb_angle
          );
          scene.draw();
        }
        await delay(10);
      }
    })(300, 300);
    (function three_d_graph(width, height) {
      let canvas = prepare_canvas(width, height, "three-d-graph");
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];
      let zoom_ratio = 1;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4)
      );
      let tick_size = 0.1;
      scene.add("x-axis", new TwoHeadedArrow3D([xmin, 0, 0], [xmax, 0, 0]));
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line3D([x, 0, -tick_size], [x, 0, tick_size])
        );
      }
      scene.add("y-axis", new TwoHeadedArrow3D([0, ymin, 0], [0, ymax, 0]));
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y})`,
          new Line3D([-tick_size, y, 0], [tick_size, y, 0])
        );
      }
      scene.add("z-axis", new TwoHeadedArrow3D([0, 0, zmin], [0, 0, zmax]));
      for (let z = Math.floor(zmin) + 1; z <= Math.ceil(zmax) - 1; z++) {
        if (z == 0) {
          continue;
        }
        scene.add(
          `z-tick-(${z})`,
          new Line3D([0, -tick_size, z], [0, tick_size, z])
        );
      }
      let curve = new ParametrizedCurve3D(
        (t) => [Math.cos(t), Math.sin(t), t / Math.PI],
        -3 * Math.PI,
        3 * Math.PI,
        100
      );
      curve.set_stroke_color("red");
      curve.set_stroke_width(0.04);
      curve.set_alpha(0.5);
      scene.add("curve", curve);
      let arcball = new Arcball(scene);
      arcball.add();
      let modeButton = Button(
        document.getElementById("three-d-graph-mode-button"),
        function() {
          arcball.switch_mode();
          modeButton.textContent = `Mode = ${arcball.mode}`;
        }
      );
      modeButton.textContent = `Mode = ${arcball.mode}`;
      modeButton.style.padding = "15px";
      let zoomSlider = Slider(
        document.getElementById("three-d-graph-zoom-slider"),
        function(value) {
          zoom_ratio = value;
          console.log(`Zoom ratio: ${zoom_ratio}`);
          scene.set_zoom(value);
          scene.draw();
        },
        {
          name: "Zoom",
          initialValue: `${zoom_ratio}`,
          min: 0.5,
          max: 5,
          step: 0.05
        }
      );
      zoomSlider.value = `1.0`;
      scene.draw();
    })(300, 300);
    (function three_d_globe(width, height) {
      let canvas = prepare_canvas(width, height, "three-d-globe");
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];
      let zoom_ratio = 1;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.set_camera_position([0, 0, -5]);
      let radius = 2;
      let globe = new Dot3D([0, 0, 0], radius);
      globe.set_fill_color("rgb(63, 63, 63)");
      globe.set_fill_alpha(0.3);
      scene.add("globe", globe);
      let equator = new ParametrizedCurve3D(
        (t) => [radius * Math.cos(t), radius * Math.sin(t), 0],
        -Math.PI,
        Math.PI,
        100
      );
      equator.set_stroke_style("solid");
      equator.set_stroke_width(0.04);
      equator.link_mobject(globe);
      scene.add("equator", equator);
      let polar_axis = new Line3D([0, 0, -1.5 * radius], [0, 0, 1.5 * radius]);
      let n_pole = new Dot3D([0, 0, radius], 0.1);
      n_pole.set_fill_alpha(1);
      let s_pole = new Dot3D([0, 0, -radius], 0.1);
      s_pole.set_fill_alpha(1);
      scene.add("polar_axis", polar_axis);
      scene.add("n_pole", n_pole);
      scene.add("s_pole", s_pole);
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();
      let zoomSlider = Slider(
        document.getElementById("three-d-globe-zoom-slider"),
        function(value) {
          zoom_ratio = value;
          scene.set_zoom(value);
          scene.draw();
        },
        {
          name: "Zoom",
          initialValue: `${zoom_ratio}`,
          min: 0.3,
          max: 3,
          step: 0.02
        }
      );
      zoomSlider.value = `1.0`;
      scene.draw();
    })(500, 500);
  });
})();
