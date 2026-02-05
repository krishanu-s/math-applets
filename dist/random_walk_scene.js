// src/lib/base.ts
function gaussianRandom(mean, stdev) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return z * stdev + mean;
}
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
var LineLikeMObject = class extends MObject {
  constructor() {
    super(...arguments);
    this.stroke_width = 0.08;
    this.stroke_color = "black";
    this.stroke_style = "solid";
  }
  set_stroke_color(color) {
    this.stroke_color = color;
    return this;
  }
  set_stroke_width(width) {
    this.stroke_width = width;
    return this;
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
var FillLikeMObject = class extends MObject {
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
    return this;
  }
  set_stroke_width(width) {
    this.stroke_width = width;
    return this;
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
var Dot = class extends FillLikeMObject {
  constructor(center, radius) {
    super();
    this.radius = 0.1;
    this.center = center;
    this.radius = radius;
  }
  // Get the center coordinates
  get_center() {
    return this.center;
  }
  // Move the center of the dot to a desired location
  move_to(p) {
    this.center = p;
  }
  move_by(p) {
    this.center[0] += p[0];
    this.center[1] += p[1];
  }
  // Change the dot radius
  set_radius(radius) {
    this.radius = radius;
    return this;
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [x, y] = scene.v2c(this.center);
    let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
};
var Rectangle = class extends FillLikeMObject {
  constructor(center, size_x, size_y) {
    super();
    this.center = center;
    this.size_x = size_x;
    this.size_y = size_y;
  }
  move_to(center) {
    this.center = center;
  }
  move_by(p) {
    this.center[0] += p[0];
    this.center[1] += p[1];
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] - this.size_y / 2
    ]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] + this.size_x / 2,
      this.center[1] - this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] + this.size_x / 2,
      this.center[1] + this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] + this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] - this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
};
var Line = class extends LineLikeMObject {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
  // Moves the start and end points
  move_start(p) {
    this.start = p;
  }
  move_end(p) {
    this.end = p;
  }
  length() {
    return vec2_norm(vec2_sub(this.start, this.end));
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
};
var LineSequence = class extends LineLikeMObject {
  constructor(points) {
    super();
    this.points = points;
  }
  add_point(point) {
    this.points.push(point);
  }
  move_point(i, new_point) {
    this.points[i] = new_point;
  }
  get_point(i) {
    return this.points[i];
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [x, y] = scene.v2c(this.points[0]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.points.length; i++) {
      [x, y] = scene.v2c(this.points[i]);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
};
var TwoHeadedArrow = class extends Line {
  constructor() {
    super(...arguments);
    this.arrow_size = 0.3;
  }
  set_arrow_size(size) {
    this.arrow_size = size;
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    super._draw(ctx, scene);
    ctx.fillStyle = this.stroke_color;
    let [end_x, end_y] = scene.v2c(this.end);
    let [start_x, start_y] = scene.v2c(this.start);
    let v;
    let ax;
    let ay;
    let bx;
    let by;
    v = vec2_scale(
      vec2_sub(this.start, this.end),
      this.arrow_size / this.length()
    );
    [ax, ay] = scene.v2c(vec2_sum(this.end, vec2_rot(v, Math.PI / 6)));
    [bx, by] = scene.v2c(vec2_sum(this.end, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();
    ctx.moveTo(end_x, end_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(end_x, end_y);
    ctx.closePath();
    ctx.fill();
    v = vec2_scale(
      vec2_sub(this.end, this.start),
      this.arrow_size / this.length()
    );
    [ax, ay] = scene.v2c(vec2_sum(this.start, vec2_rot(v, Math.PI / 6)));
    [bx, by] = scene.v2c(vec2_sum(this.start, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(start_x, start_y);
    ctx.closePath();
    ctx.fill();
  }
};

// src/lib/stats.ts
var Histogram = class extends MObject {
  constructor() {
    super(...arguments);
    this.hist = {};
    this.fill_color = "red";
    // Min/max bin values
    this.bin_min = 0;
    this.bin_max = 100;
    // Min/max counts
    this.count_min = 0;
    this.count_max = 100;
  }
  set_count_limits(min, max) {
    this.count_min = min;
    this.count_max = max;
  }
  set_bin_limits(min, max) {
    this.bin_min = min;
    this.bin_max = max;
  }
  set_hist(hist) {
    this.hist = hist;
  }
  // Create a bunch of rectangles
  draw(canvas, scene) {
    let [xmin, xmax] = scene.xlims;
    let [ymin, ymax] = scene.ylims;
    let bin_width = (xmax - xmin) / (this.bin_max - this.bin_min);
    let ct_height = (ymax - ymin) / (this.count_max - this.count_min);
    let bin;
    let rect_center, rect_height, rect_width;
    for (let i = 0; i < Object.keys(this.hist).length; i++) {
      bin = Object.keys(this.hist)[i];
      rect_center = [
        xmin + (bin - this.bin_min + 0.5) * bin_width,
        ymin + this.hist[bin] * 0.5 * ct_height
      ];
      rect_height = this.hist[bin] * ct_height;
      rect_width = bin_width;
      let rect = new Rectangle(rect_center, rect_width, rect_height);
      rect.fill_color = this.fill_color;
      rect.draw(canvas, scene);
    }
  }
};

// src/lib/interactive.ts
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
      let view_center = scene.orthographic_view(this.center);
      let view_radius = this.radius * scene.zoom_ratio;
      let view_dist = vec2_norm(vec2_sub(view_point, view_center)) * scene.zoom_ratio;
      if (view_dist > view_radius) {
        return Infinity;
      } else {
        let depth_adjustment = Math.sqrt(
          Math.max(0, view_radius ** 2 - view_dist ** 2)
        );
        return scene.depth(this.center) - depth_adjustment / scene.zoom_ratio;
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
var LineSequence3D = class extends ThreeDLineLikeMObject {
  constructor(points) {
    super();
    this.points = points;
  }
  add_point(point) {
    this.points.push(point);
  }
  move_point(i, new_point) {
    this.points[i] = new_point;
  }
  get_point(i) {
    return this.points[i];
  }
  depth(scene) {
    if (this.points.length == 0) {
      return 0;
    } else if (this.points.length == 1) {
      return scene.depth(this.points[0]);
    } else {
      return scene.depth(
        vec3_scale(vec3_sum(this.points[0], this.points[1]), 0.5)
      );
    }
  }
  _draw(ctx, scene) {
    ctx.beginPath();
    let in_frame = false;
    let p;
    let x, y;
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

// src/random_walk_scene.ts
function pick_random_step(dim) {
  const x = 2 * dim * Math.random();
  let output = new Array(dim).fill(0);
  for (let i = 0; i < dim; i++) {
    if (x < 2 * i + 1) {
      output[i] = 1;
      return output;
    } else if (x < 2 * i + 2) {
      output[i] = -1;
      return output;
    }
  }
  throw new Error("Invalid dimension");
}
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (async function two_dim_random_walk_basic() {
      let canvas = prepare_canvas(300, 300, "2d-random-walk");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-10, 10];
      let [ymin, ymax] = [-10, 10];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      let tick_size = 0.1;
      let x_axis = new TwoHeadedArrow([xmin, 0], [xmax, 0]);
      x_axis.set_stroke_width(0.02);
      scene.add("x-axis", x_axis);
      scene.add(
        `x-tick-(${0})`,
        new Line([0, -2 * tick_size], [0, 2 * tick_size]).set_stroke_width(
          0.04
        )
      );
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line([x, -tick_size], [x, tick_size]).set_stroke_width(0.02)
        );
        let xline = new Line([x, ymin], [x, ymax]).set_stroke_width(0.01);
        xline.set_alpha(0.3);
        scene.add(`x-line-(${x})`, xline);
      }
      scene.add(
        "y-axis",
        new TwoHeadedArrow([0, ymin], [0, ymax], { stroke_width: 0.02 })
      );
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y})`,
          new Line([-tick_size, y], [tick_size, y]).set_stroke_width(0.02)
        );
        let yline = new Line([xmin, y], [xmax, y]).set_stroke_width(0.01);
        yline.set_alpha(0.3);
        scene.add(`y-line-(${y})`, yline);
      }
      scene.draw();
      let playing = false;
      let pauseButton = Button(
        document.getElementById("2d-random-walk-pause-button"),
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
      async function do_simulation() {
        let [x, y] = [0, 0];
        let dx, dy;
        let line = new LineSequence([[x, y]], {});
        line.set_stroke_color("red");
        line.set_alpha(1);
        line.set_stroke_width(0.1);
        scene.add("line", line);
        let p = new Dot([x, y], 0.3);
        p.set_color("blue");
        scene.add("point", p);
        while (true) {
          if (playing) {
            [dx, dy] = pick_random_step(2);
            [x, y] = [x + dx, y + dy];
            line = scene.get_mobj("line");
            line.add_point([x, y]);
            p = scene.get_mobj("point");
            p.move_to([x, y]);
            scene.draw();
            if (x == 0 && y == 0) {
              await delay(1e3);
              scene.remove("line");
              scene.remove("dot");
              return true;
            }
          }
          await delay(100);
        }
      }
      while (true) {
        await do_simulation();
      }
    })();
    (async function one_dim_random_walk_basic() {
      let canvas = prepare_canvas(300, 300, "1d-random-walk");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-10, 10];
      let [ymin, ymax] = [-10, 10];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      let tick_size = 0.2;
      scene.add(
        "x-axis",
        new TwoHeadedArrow([xmin, 0], [xmax, 0], { stroke_width: 0.02 })
      );
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x})`,
          new Line([x, -tick_size], [x, tick_size]).set_stroke_width(0.02)
        );
      }
      scene.draw();
      let playing = false;
      let pauseButton = Button(
        document.getElementById("1d-random-walk-pause-button"),
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
      async function do_simulation() {
        let x = 0;
        let dx;
        let p = new Dot([x, 0], 0.3);
        p.set_color("blue");
        scene.add("point", p);
        let line = new LineSequence([[x, 0]], {});
        line.set_stroke_color("red");
        line.set_alpha(1);
        line.set_stroke_width(0.1);
        scene.add("line", line);
        while (true) {
          if (playing) {
            [dx] = pick_random_step(1);
            x += dx;
            line = scene.get_mobj("line");
            line.add_point([x, 0]);
            p = scene.get_mobj("point");
            p.move_to([x, 0]);
            scene.draw();
            if (x == 0) {
              await delay(1e3);
              scene.remove("line");
              scene.remove("dot");
              return true;
            }
          }
          await delay(100);
        }
      }
      while (true) {
        await do_simulation();
      }
    })();
    (async function graph_random_walk(num_walks, num_steps) {
      let canvas2 = prepare_canvas(300, 300, "histogram-dim-two");
      let canvas3 = prepare_canvas(300, 300, "histogram-dim-three");
      let scene2 = new Scene(canvas2);
      let histogram2 = new Histogram();
      histogram2.set_count_limits(0, num_walks);
      histogram2.set_bin_limits(0, 100);
      scene2.add("histogram", histogram2);
      let scene3 = new Scene(canvas3);
      let histogram3 = new Histogram();
      histogram3.set_count_limits(0, num_walks);
      histogram3.set_bin_limits(0, 100);
      scene3.add("histogram", histogram3);
      let points2 = [];
      for (let i = 0; i < num_walks; i++) {
        points2.push([0, 0]);
      }
      let points3 = [];
      for (let i = 0; i < num_walks; i++) {
        points3.push([0, 0, 0]);
      }
      let playing = false;
      let pauseButton = Button(
        document.getElementById("random-walk-pause-button"),
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
      let x, y, z;
      let dx, dy, dz;
      let dist;
      let hist_data2 = {};
      let hist_data3 = {};
      let step = 0;
      scene2.draw();
      scene3.draw();
      while (step < num_steps) {
        if (playing) {
          hist_data2 = { 0: num_walks };
          hist_data3 = { 0: num_walks };
          for (let i = 0; i < num_walks; i++) {
            [x, y, z] = points3[i];
            if (x == 0 && y == 0 && z == 0 && step > 0) {
              continue;
            } else {
              [dx, dy, dz] = pick_random_step(3);
              points3[i] = [x + dx, y + dy, z + dz];
              dist = Math.abs(x + dx) + Math.abs(y + dy) + Math.abs(z + dz);
              hist_data3[dist] = hist_data3[dist] ? hist_data3[dist] + 1 : 1;
              hist_data3[0] = hist_data3[0] - 1;
            }
          }
          for (let i = 0; i < num_walks; i++) {
            [x, y] = points2[i];
            if (x == 0 && y == 0 && step > 0) {
              continue;
            } else {
              [dx, dy] = pick_random_step(2);
              points2[i] = [x + dx, y + dy];
              dist = Math.abs(x + dx) + Math.abs(y + dy);
              hist_data2[dist] = hist_data2[dist] ? hist_data2[dist] + 1 : 1;
              hist_data2[0] = hist_data2[0] - 1;
            }
          }
          if (step % 2 === 0) {
            scene2.get_mobj("histogram").set_hist(hist_data2);
            scene2.draw();
            scene3.get_mobj("histogram").set_hist(hist_data3);
            scene3.draw();
          }
          step += 1;
        }
        await delay(1);
      }
    })(5e4, 1e3);
    (async function brownian_motion_2d() {
      let canvas = prepare_canvas(300, 300, "brownian-motion-2d");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      let tick_size = 0.1;
      scene.add(
        "x-axis",
        new TwoHeadedArrow([xmin, 0], [xmax, 0], { stroke_width: 0.02 })
      );
      for (let x2 = Math.floor(xmin) + 1; x2 <= Math.ceil(xmax) - 1; x2++) {
        if (x2 == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x2})`,
          new Line([x2, -tick_size], [x2, tick_size]).set_stroke_width(0.02)
        );
      }
      scene.add(
        "y-axis",
        new TwoHeadedArrow([0, ymin], [0, ymax], { stroke_width: 0.02 })
      );
      for (let y2 = Math.floor(ymin) + 1; y2 <= Math.ceil(ymax) - 1; y2++) {
        if (y2 == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y2})`,
          new Line([-tick_size, y2], [tick_size, y2]).set_stroke_width(0.02)
        );
      }
      scene.draw();
      let [x, y] = [0, 0];
      let p = new Dot([x, y], 0.05);
      p.set_color("blue");
      scene.add("point", p);
      let line = new LineSequence([[x, y]], {});
      line.set_stroke_color("red");
      line.set_alpha(0.5);
      line.set_stroke_width(0.01);
      scene.add("line", line);
      let dx, dy;
      let dt = 0.01;
      let sqrt_dt = Math.sqrt(dt);
      let playing = false;
      let pauseButton = Button(
        document.getElementById(
          "brownian-motion-2d-pause-button"
        ),
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";
      while (true) {
        if (playing) {
          dx = gaussianRandom(0, sqrt_dt);
          dy = gaussianRandom(0, sqrt_dt);
          [x, y] = [x + dx, y + dy];
          line = scene.get_mobj("line");
          line.add_point([x, y]);
          p = scene.get_mobj("point");
          p.move_to([x, y]);
          scene.draw();
        }
        await delay(1);
      }
    })();
    (async function brownian_motion_3d() {
      let canvas = prepare_canvas(300, 300, "brownian-motion-3d");
      let ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D context");
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];
      let zoom_ratio = 1;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 3);
      scene.set_camera_position([0, 0, -8]);
      scene.camera_position = rot(
        scene.camera_position,
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3
      );
      let tick_size = 0.1;
      scene.add("x-axis", new TwoHeadedArrow3D([xmin, 0, 0], [xmax, 0, 0]));
      for (let x2 = Math.floor(xmin) + 1; x2 <= Math.ceil(xmax) - 1; x2++) {
        if (x2 == 0) {
          continue;
        }
        scene.add(
          `x-tick-(${x2})`,
          new Line3D([x2, 0, -tick_size], [x2, 0, tick_size])
        );
      }
      scene.add("y-axis", new TwoHeadedArrow3D([0, ymin, 0], [0, ymax, 0]));
      for (let y2 = Math.floor(ymin) + 1; y2 <= Math.ceil(ymax) - 1; y2++) {
        if (y2 == 0) {
          continue;
        }
        scene.add(
          `y-tick-(${y2})`,
          new Line3D([-tick_size, y2, 0], [tick_size, y2, 0])
        );
      }
      scene.add("z-axis", new TwoHeadedArrow3D([0, 0, zmin], [0, 0, zmax]));
      for (let z2 = Math.floor(zmin) + 1; z2 <= Math.ceil(zmax) - 1; z2++) {
        if (z2 == 0) {
          continue;
        }
        scene.add(
          `z-tick-(${z2})`,
          new Line3D([0, -tick_size, z2], [0, tick_size, z2])
        );
      }
      scene.draw();
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();
      let [x, y, z] = [0, 0, 0];
      let p = new Dot3D([x, y, z], 0.05);
      p.set_color("blue");
      scene.add("point", p);
      let line = new LineSequence3D([[x, y, z]]);
      line.set_stroke_color("red");
      line.set_stroke_width(0.02);
      scene.add("line", line);
      let dx, dy, dz;
      let dt = 0.01;
      let sqrt_dt = Math.sqrt(dt);
      let playing = false;
      let pauseButton = Button(
        document.getElementById(
          "brownian-motion-3d-pause-button"
        ),
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";
      while (true) {
        if (playing) {
          dx = gaussianRandom(0, sqrt_dt);
          dy = gaussianRandom(0, sqrt_dt);
          dz = gaussianRandom(0, sqrt_dt);
          [x, y, z] = [x + dx, y + dy, z + dz];
          line = scene.get_mobj("line");
          line.get_point(5);
          line.add_point([x, y, z]);
          p = scene.get_mobj("point");
          p.move_to([x, y, z]);
          scene.rot_z(Math.PI / 1e3);
          scene.camera_position = rot_z(scene.camera_position, Math.PI / 1e3);
          scene.draw();
        }
        await delay(10);
      }
    })();
  });
})();
export {
  pick_random_step
};
