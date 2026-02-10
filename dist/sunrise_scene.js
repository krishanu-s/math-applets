// src/lib/base.ts
var MObject = class {
  // Opacity for drawing
  constructor() {
    this.alpha = 1;
  }
  set_alpha(alpha) {
    this.alpha = alpha;
    return this;
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
    let [xmin, xmax] = scene.view_xlims;
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
var Scene = class {
  constructor(canvas) {
    this.border_thickness = 4;
    this.border_color = "black";
    // Zoom ratio
    this.zoom_ratio = 1;
    // Determines whether any draggable object in the scene is clicked
    this.is_dragging = false;
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
    this.view_xlims = [0, canvas.width];
    this.view_ylims = [0, canvas.height];
  }
  click() {
    this.is_dragging = true;
  }
  unclick() {
    this.is_dragging = false;
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
  // Returns the center of the viewing window
  get_view_center() {
    return [
      (this.view_xlims[0] + this.view_xlims[1]) / 2,
      (this.view_ylims[0] + this.view_ylims[1]) / 2
    ];
  }
  // Sets the current zoom level
  set_zoom(value) {
    this.zoom_ratio = value;
    this.view_xlims = [this.xlims[0] / value, this.xlims[1] / value];
    this.view_ylims = [this.ylims[0] / value, this.ylims[1] / value];
  }
  // Performs a homothety around the specified center point of the viewing window, with the given factor
  zoom_in_on(ratio, center) {
    this.zoom_ratio *= ratio;
    this.view_xlims = [
      center[0] + (this.view_xlims[0] - center[0]) / ratio,
      center[0] + (this.view_xlims[1] - center[0]) / ratio
    ];
    this.view_ylims = [
      center[1] + (this.view_ylims[0] - center[1]) / ratio,
      center[1] + (this.view_ylims[1] - center[1]) / ratio
    ];
  }
  // Moves the viewing window by the specified vector
  move_view(v) {
    this.view_xlims = [this.view_xlims[0] + v[0], this.view_xlims[1] + v[0]];
    this.view_ylims = [this.view_ylims[0] + v[1], this.view_ylims[1] + v[1]];
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
  // Checks if a mobject exists in the scene
  has_mobj(name) {
    return this.mobjects.hasOwnProperty(name);
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
    this._draw();
    this.draw_border(ctx);
  }
  _draw() {
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
  }
  // Draw a border around the canvas
  draw_border(ctx) {
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
function mouse_event_coords(event) {
  return [event.pageX, event.pageY];
}
function touch_event_coords(event) {
  return [event.touches[0].pageX, event.touches[0].pageY];
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
function vec2_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
}
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
  constructor() {
    super(...arguments);
    this.blocked_depth_tolerance = 0.01;
    this.linked_mobjects = [];
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
  // Add a linked Mobject. These are fill-like MObjects in the scene which might obstruct the view
  // of the curve, and are used internally to _draw() for depth-testing.
  link_mobject(mobject) {
    this.linked_mobjects.push(mobject);
  }
  // Calculates the minimum depth value among linked FillLike objects at the given 2D scene view point.
  blocked_depth_at(scene, view_point) {
    return Math.min(
      ...this.linked_mobjects.map(
        (m) => m.depth_at(scene, view_point)
      )
    );
  }
  // Calculates whether the given 3D scene point is either obstructed by any linked FillLike objects
  // or is out of scene
  is_blocked(scene, point) {
    let vp = scene.camera_view(point);
    if (vp == null) {
      return true;
    } else {
      return scene.depth(point) > this.blocked_depth_at(scene, vp) + this.blocked_depth_tolerance;
    }
  }
};
var ThreeDLineLikeMObject = class extends ThreeDMObject {
  // Sets the context drawer settings for drawing behind linked FillLike objects.
  set_behind_linked_mobjects(ctx) {
    ctx.globalAlpha /= 2;
    ctx.setLineDash([5, 5]);
  }
  unset_behind_linked_mobjects(ctx) {
    ctx.globalAlpha *= 2;
    ctx.setLineDash([]);
  }
  draw(canvas, scene, simple = false, args) {
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
    if (this instanceof Line3D && simple) {
      this._draw_simple(ctx, scene);
    } else {
      this._draw(ctx, scene, args);
    }
    ctx.setLineDash([]);
  }
};
var ThreeDFillLikeMObject = class extends ThreeDMObject {
  constructor() {
    super(...arguments);
    this.fill_color = "black";
    this.fill_alpha = 1;
    this.fill = true;
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
  // Sets the context drawer settings for drawing behind linked FillLike objects.
  set_behind_linked_mobjects(ctx) {
    ctx.globalAlpha /= 2;
  }
  unset_behind_linked_mobjects(ctx) {
    ctx.globalAlpha *= 2;
  }
  draw(canvas, scene, simple = false, args) {
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
    if (this instanceof Dot3D && simple) {
      this._draw_simple(ctx, scene);
    } else {
      this._draw(ctx, scene, args);
    }
    ctx.setLineDash([]);
  }
};
var Dot3D = class extends ThreeDFillLikeMObject {
  constructor(center, radius) {
    super();
    this.center = center;
    this.radius = radius;
  }
  get_center() {
    return this.center;
  }
  get_radius() {
    return this.radius;
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
  move_by(p) {
    this.center[0] += p[0];
    this.center[1] += p[1];
    this.center[2] += p[2];
  }
  _draw_simple(ctx, scene) {
    let p = scene.camera_view(this.center);
    let pr = scene.camera_view(
      vec3_sum(
        this.center,
        vec3_scale(get_column(scene.get_camera_frame(), 0), this.radius)
      )
    );
    let state;
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
  _draw(ctx, scene) {
    let p = scene.camera_view(this.center);
    let pr = scene.camera_view(
      vec3_sum(
        this.center,
        vec3_scale(get_column(scene.get_camera_frame(), 0), this.radius)
      )
    );
    let state;
    if (p != null && pr != null) {
      let depth = scene.depth(this.center);
      if (depth > this.blocked_depth_at(scene, p) + this.blocked_depth_tolerance) {
        state = "blocked";
      } else {
        state = "unblocked";
      }
      let [cx, cy] = scene.v2c(p);
      let [rx, ry] = scene.v2c(pr);
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
  toDraggableDot3D() {
    return new DraggableDot3D(this.center, this.radius);
  }
  toDraggableDotZ3D() {
    return new DraggableDotZ3D(this.center, this.radius);
  }
};
var DraggableDot3D = class extends Dot3D {
  constructor() {
    super(...arguments);
    this.isClicked = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.touch_tolerance = 2;
    this.callbacks = [];
  }
  // Tests whether a chosen view point lies inside the shape. Used for click-detection.
  is_inside(scene, view_point) {
    let center_view = scene.camera_view(this.center);
    let edge_view = scene.camera_view(
      vec3_sum(this.center, [0, 0, this.radius])
    );
    if (center_view == null || edge_view == null) {
      return false;
    } else {
      return vec2_norm(vec2_sub(view_point, center_view)) < vec2_norm(vec2_sub(edge_view, center_view));
    }
  }
  // Tests whether a chosen vector lies within an enlarged version of the dot.
  // Used for touch-detection on mobile devices, and for use by small children.
  is_almost_inside(scene, view_point, tolerance) {
    let center_view = scene.camera_view(this.center);
    let edge_view = scene.camera_view(
      vec3_sum(this.center, [0, 0, this.radius])
    );
    if (center_view == null || edge_view == null) {
      return false;
    } else {
      return vec2_norm(vec2_sub(view_point, center_view)) < vec2_norm(vec2_sub(edge_view, center_view)) * tolerance;
    }
  }
  // Adds a callback which triggers when the dot is dragged
  add_callback(callback) {
    this.callbacks.push(callback);
  }
  do_callbacks() {
    for (const callback of this.callbacks) {
      callback();
    }
  }
  // Triggers when the canvas is clicked.
  click(scene, event) {
    this.dragStart = vec2_sub(mouse_event_coords(event), [
      scene.canvas.offsetLeft,
      scene.canvas.offsetTop
    ]);
    if (!scene.is_dragging) {
      this.isClicked = this.is_inside(
        scene,
        scene.c2v(this.dragStart[0], this.dragStart[1])
      );
      if (this.isClicked) {
        scene.click();
      }
    }
  }
  touch(scene, event) {
    this.dragStart = [
      event.touches[0].pageX - scene.canvas.offsetLeft,
      event.touches[0].pageY - scene.canvas.offsetTop
    ];
    if (!scene.is_dragging) {
      this.isClicked = this.is_almost_inside(
        scene,
        scene.c2v(this.dragStart[0], this.dragStart[1]),
        this.touch_tolerance
      );
      if (this.isClicked) {
        scene.click();
      }
    }
  }
  // Triggers when the canvas is unclicked.
  unclick(scene, event) {
    if (this.isClicked) {
      scene.unclick();
    }
    this.isClicked = false;
  }
  untouch(scene, event) {
    if (this.isClicked) {
      scene.unclick();
    }
    scene.unclick();
  }
  // Triggers when the mouse is dragged over the canvas.
  mouse_drag_cursor(scene, event) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop
      ]);
      this._drag_cursor(scene);
    }
  }
  touch_drag_cursor(scene, event) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(touch_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop
      ]);
      this._drag_cursor(scene);
    }
  }
  _drag_cursor(scene) {
    let translate_vec = vec2_sub(
      scene.c2v(this.dragEnd[0], this.dragEnd[1]),
      scene.c2v(this.dragStart[0], this.dragStart[1])
    );
    this.move_by(scene.v2w(translate_vec));
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
  add(scene) {
    let self = this;
    scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
    scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
    scene.canvas.addEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self, scene)
    );
    scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
    scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
    scene.canvas.addEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self, scene)
    );
  }
  remove(scene) {
    let self = this;
    scene.canvas.removeEventListener("mousedown", this.click.bind(self, scene));
    scene.canvas.removeEventListener("mouseup", this.unclick.bind(self, scene));
    scene.canvas.removeEventListener(
      "mousemove",
      this.mouse_drag_cursor.bind(self, scene)
    );
    scene.canvas.removeEventListener(
      "touchstart",
      this.click.bind(self, scene)
    );
    scene.canvas.removeEventListener(
      "touchend",
      this.unclick.bind(self, scene)
    );
    scene.canvas.removeEventListener(
      "touchmove",
      self.mouse_drag_cursor.bind(self, scene)
    );
  }
  toDot3D() {
    return new Dot3D(this.center, this.radius);
  }
};
var DraggableDotZ3D = class extends DraggableDot3D {
  _drag_cursor(scene) {
    let translate_vec = vec2_sub(
      scene.c2v(this.dragEnd[0], this.dragEnd[1]),
      scene.c2v(this.dragStart[0], this.dragStart[1])
    );
    let [mx, my, mz] = scene.v2w(translate_vec);
    this.move_by([0, 0, mz]);
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
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
    let start_blocked = this.is_blocked(scene, this.start);
    let end_blocked = this.is_blocked(scene, this.end);
    if (!start_blocked && !end_blocked) {
      ctx.beginPath();
      ctx.moveTo(start_x, start_y);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
    } else if (start_blocked && end_blocked) {
      ctx.beginPath();
      this.set_behind_linked_mobjects(ctx);
      ctx.moveTo(start_x, start_y);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
      this.unset_behind_linked_mobjects(ctx);
    } else {
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
      let [p_x, p_y] = scene.v2c(scene.camera_view(p));
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
  _draw_simple(ctx, scene) {
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
    let current_point = this.points[0];
    let current_point_camera_view = scene.camera_view(current_point);
    let cp_x = 0, cp_y = 0;
    if (current_point_camera_view != null) {
      [cp_x, cp_y] = scene.v2c(current_point_camera_view);
    }
    let current_point_blocked = this.is_blocked(scene, current_point);
    let midpoint;
    let mp_x, mp_y;
    let next_point;
    let next_point_camera_view;
    let np_x, np_y;
    let next_point_blocked;
    let v;
    let n;
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
        [mp_x, mp_y] = scene.v2c(scene.camera_view(midpoint));
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
  _draw_simple(ctx, scene) {
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
          if (depth > this.blocked_depth_at(scene, p) + this.blocked_depth_tolerance) {
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
  // Simpler drawing routine which doesn't use local depth testing or test against FillLike objects
  _draw_simple(ctx, scene) {
    let points = [this.function(this.tmin)];
    for (let i = 1; i <= this.num_steps; i++) {
      points.push(
        this.function(
          this.tmin + i / this.num_steps * (this.tmax - this.tmin)
        )
      );
    }
    let points2D = points.map((p) => {
      let r = scene.camera_view(p);
      if (r == null) {
        return null;
      }
      return scene.v2c(r);
    });
    let [px, py] = points2D[0];
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let i = 1; i <= this.num_steps; i++) {
      [px, py] = points2D[i];
      ctx.lineTo(px, py);
    }
    ctx.stroke();
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
  // Converts a 2D vector in the view to world coordinates
  v2w(v) {
    let frame = this.get_camera_frame();
    return vec3_sum(
      vec3_scale(get_column(frame, 0), v[0]),
      vec3_scale(get_column(frame, 1), v[1])
    );
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
  // Rotates the camera view around various axes
  rot_camera_z(angle) {
    this.rot_z(angle);
    this.set_camera_position(rot_z(this.camera_position, angle));
  }
  rot_camera_y(angle) {
    this.rot_y(angle);
    this.set_camera_position(rot_y(this.camera_position, angle));
  }
  rot_camera_x(angle) {
    this.rot_x(angle);
    this.set_camera_position(rot_x(this.camera_position, angle));
  }
  rot_camera(axis, angle) {
    this.rot(axis, angle);
    this.set_camera_position(rot(this.camera_position, axis, angle));
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
      return depth_b - depth_a;
    });
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      if (mobj instanceof ThreeDFillLikeMObject) {
        mobj.draw(this.canvas, this);
      }
    }
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      if (mobj instanceof ThreeDLineLikeMObject) {
        mobj.draw(this.canvas, this);
      }
    }
    for (let name of ordered_names) {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      if (!(mobj instanceof ThreeDFillLikeMObject) && !(mobj instanceof ThreeDLineLikeMObject)) {
        mobj.draw(this.canvas, this);
      }
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
function cartesian_to_spherical(v) {
  let nv = normalize(v);
  let theta = Math.asin(nv[2]);
  let phi = Math.acos(nv[0] / Math.cos(theta));
  if (nv[1] / Math.cos(theta) > 0) {
    return [theta, phi];
  } else {
    return [theta, 2 * Math.PI - phi];
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
function rot_x(v, theta) {
  return matmul_vec(rot_x_matrix(theta), v);
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

// src/lib/color.ts
function spherical_colormap(theta, phi) {
  let a;
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid longitude");
  } else if (phi < 2 * Math.PI / 3) {
    a = phi / (2 * Math.PI / 3);
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else if (phi < 4 * Math.PI / 3) {
    a = phi / (2 * Math.PI / 3) - 1;
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else {
    a = phi / (2 * Math.PI / 3) - 2;
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  }
}

// src/lib/heatmap.ts
var TwoDimHeatMap = class extends MObject {
  constructor(width, height, valArray_1, valArray_2) {
    super();
    this.width = width;
    this.height = height;
    this.valArray_1 = valArray_1;
    this.valArray_2 = valArray_2;
    this.colorMap = spherical_colormap;
  }
  // Gets/sets values
  set_vals_1(vals) {
    this.valArray_1 = vals;
  }
  get_vals_1() {
    return this.valArray_1;
  }
  set_vals_2(vals) {
    this.valArray_2 = vals;
  }
  get_vals_2() {
    return this.valArray_2;
  }
  // Draws on the canvas
  draw(canvas, scene, imageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val_1 = this.valArray_1[i];
      const px_val_2 = this.valArray_2[i];
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(
        px_val_1,
        px_val_2
      );
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    ctx.putImageData(imageData, 0, 0);
  }
};

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
    if (!this.scene.is_dragging) {
      this.drag = true;
      this.scene.click();
    }
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
    this.scene.unclick();
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
      this.scene.c2v(this.dragStart[0], this.dragStart[1]),
      this.scene.c2v(this.dragEnd[0], this.dragEnd[1])
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

// src/sunrise_scene.ts
var DEGREE = Math.PI / 180;
var EARTH_TILT = 23 * DEGREE;
function sun_zenith_and_azimuth(year_angle, day_angle, tilt, latitude) {
  let v = [-1, 0, 0];
  v = rot_y(v, year_angle);
  v = rot_z(v, -tilt);
  v = rot_y(v, day_angle - year_angle);
  v = rot_z(v, latitude);
  v = rot_y(v, -Math.PI / 2);
  v = rot_z(v, -Math.PI / 2);
  let [theta, phi] = cartesian_to_spherical(v);
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid azimuth");
  }
  return [Math.PI / 2 - theta, phi];
}
var SunriseScene = class extends Scene {
  constructor(canvas, imageData, width, height) {
    super(canvas);
    this.imageData = imageData;
    this.width = width;
    this.height = height;
    this.zenith_values = new Array(this.width * this.height).fill(0);
    this.azimuth_values = new Array(this.width * this.height).fill(0);
    this.latitude = 0;
    this.add(
      "heatmap",
      new TwoDimHeatMap(width, height, this.zenith_values, this.azimuth_values)
    );
    let num_year_steps = 12;
    for (let i = 0; i < num_year_steps; i++) {
      this.add(
        `year_step_${i + 1}`,
        new Line(
          [
            i / num_year_steps * (this.xlims[1] - this.xlims[0]) + this.xlims[0],
            this.ylims[0]
          ],
          [
            i / num_year_steps * (this.xlims[1] - this.xlims[0]) + this.xlims[0],
            this.ylims[1]
          ]
        ).set_stroke_width(0.2).set_stroke_color(`rgb(0, 150, 0)`)
      );
    }
    let num_day_steps = 8;
    for (let i = 0; i < num_day_steps; i++) {
      this.add(
        `day_step_${i + 1}`,
        new Line(
          [
            this.xlims[0],
            i / num_day_steps * (this.ylims[1] - this.ylims[0]) + this.ylims[0]
          ],
          [
            this.xlims[1],
            i / num_day_steps * (this.ylims[1] - this.ylims[0]) + this.ylims[0]
          ]
        ).set_stroke_width(0.2).set_stroke_color(`rgb(0, 150, 0)`)
      );
    }
  }
  // Sets the latitude
  set_latitude(l) {
    this.latitude = l;
    this._update_values();
  }
  // Converts xy-coordinates to linear array coordinates
  index(x, y) {
    return y * this.width + x;
  }
  _update_values() {
    let ind;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        [this.zenith_values[ind], this.azimuth_values[ind]] = sun_zenith_and_azimuth(
          x / this.width * 2 * Math.PI,
          y / this.height * 2 * Math.PI,
          EARTH_TILT,
          DEGREE * this.latitude
        );
      }
    }
  }
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let mobj;
    mobj = this.get_mobj("heatmap");
    mobj.draw(this.canvas, this, this.imageData);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj2 = this.get_mobj(name);
      if (mobj2 == void 0) throw new Error(`${name} not found`);
      if (!(mobj2 instanceof TwoDimHeatMap)) {
        mobj2.draw(this.canvas, this);
      }
    });
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
};
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (function sunrise_heatmap(width, height) {
      let canvas_1 = prepare_canvas(width, height, "sunrise-heatmap");
      const ctx = canvas_1.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      let sunriseScene = new SunriseScene(canvas_1, imageData, width, height);
      let canvas_2 = prepare_canvas(width, height, "three-d-globe");
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];
      let zoom_ratio = 1;
      let globeScene = new ThreeDScene(canvas_2);
      globeScene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      globeScene.set_zoom(zoom_ratio);
      globeScene.set_view_mode("orthographic");
      globeScene.rot_z(Math.PI / 4);
      globeScene.rot(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        2 * Math.PI / 3
      );
      globeScene.rot([1 / Math.sqrt(2), -1 / Math.sqrt(2), 0], EARTH_TILT);
      globeScene.set_camera_position(
        rot(
          [1 / Math.sqrt(2), -1 / Math.sqrt(2), 0],
          rot(
            [0, 0, -5],
            [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
            2 * Math.PI / 3
          ),
          EARTH_TILT
        )
      );
      let arcball = new Arcball(globeScene);
      arcball.set_mode("Translate");
      arcball.add();
      let radius = 2;
      let globe = new Dot3D([0, 0, 0], radius);
      globe.set_fill_color("rgb(200 200 200)");
      globe.set_fill_alpha(0.3);
      globeScene.add("globe", globe);
      let equator = new ParametrizedCurve3D(
        (t) => [radius * Math.cos(t), radius * Math.sin(t), 0],
        -Math.PI,
        Math.PI,
        100
      );
      equator.set_stroke_style("solid");
      equator.set_stroke_width(0.04);
      equator.link_mobject(globe);
      globeScene.add("equator", equator);
      let polar_axis = new LineSequence3D([
        [0, 0, -1.5 * radius],
        [0, 0, -radius],
        [0, 0, radius],
        [0, 0, 1.5 * radius]
      ]);
      polar_axis.link_mobject(globe);
      let n_pole = new Dot3D([0, 0, radius], 0.1);
      n_pole.set_fill_alpha(1);
      n_pole.link_mobject(globe);
      let s_pole = new Dot3D([0, 0, -radius], 0.1);
      s_pole.set_fill_alpha(1);
      s_pole.link_mobject(globe);
      globeScene.add("polar_axis", polar_axis);
      globeScene.add("n_pole", n_pole);
      globeScene.add("s_pole", s_pole);
      let theta = Math.PI / 6;
      let latitude_line = new ParametrizedCurve3D(
        (t) => [
          radius * Math.cos(t) * Math.cos(theta),
          radius * Math.sin(t) * Math.cos(theta),
          radius * Math.sin(theta)
        ],
        -Math.PI,
        Math.PI,
        100
      );
      latitude_line.set_stroke_color("red");
      latitude_line.set_stroke_width(0.04);
      latitude_line.link_mobject(globe);
      globeScene.add("latitude_line", latitude_line);
      globeScene.draw();
      let latitudeSlider = Slider(
        document.getElementById("three-d-globe-slider-1"),
        function(l) {
          sunriseScene.set_latitude(l);
          sunriseScene.draw();
          theta = Math.PI * l / 180;
          latitude_line = globeScene.get_mobj(
            "latitude_line"
          );
          latitude_line.set_function((t) => [
            radius * Math.cos(t) * Math.cos(theta),
            radius * Math.sin(t) * Math.cos(theta),
            radius * Math.sin(theta)
          ]);
          globeScene.draw();
        },
        {
          name: "Latitude (degrees)",
          initial_value: "0",
          min: -90,
          max: 90,
          step: 1
        }
      );
      latitudeSlider.width = 200;
    })(300, 300);
  });
})();
