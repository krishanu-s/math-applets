// src/lib/base.ts
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
    return this;
  }
  set_color(color) {
    this.stroke_color = color;
    this.fill_color = color;
    return this;
  }
  set_fill_alpha(alpha) {
    this.fill_alpha = alpha;
    return this;
  }
  set_fill(fill) {
    this.fill = fill;
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
function vec2_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
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
  // Convert to a draggable rectangle
  toDraggableDot() {
    return new DraggableDot(this.center, this.radius);
  }
  toDraggableDotX() {
    return new DraggableDotX(this.center, this.radius);
  }
  toDraggableDotY() {
    return new DraggableDotY(this.center, this.radius);
  }
};
var DraggableDot = class extends Dot {
  constructor() {
    super(...arguments);
    this.isClicked = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.touch_tolerance = 2;
    this.callbacks = [];
  }
  // Tests whether a chosen vector lies inside the shape. Used for click-detection.
  is_inside(p) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius;
  }
  // Tests whether a chosen vector lies within an enlarged version of the dot.
  // Used for touch-detection on mobile devices, and for use by small children.
  is_almost_inside_dot(p, tolerance) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius * tolerance;
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
    this.isClicked = this.is_inside(
      scene.c2v(this.dragStart[0], this.dragStart[1])
    );
  }
  touch(scene, event) {
    this.dragStart = vec2_sub(touch_event_coords(event), [
      scene.canvas.offsetLeft,
      scene.canvas.offsetTop
    ]);
    this.isClicked = this.is_almost_inside_dot(
      scene.c2v(this.dragStart[0], this.dragStart[1]),
      this.touch_tolerance
    );
  }
  // Triggers when the canvas is unclicked.
  unclick(scene, event) {
    this.isClicked = false;
  }
  untouch(scene, event) {
    this.isClicked = false;
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
    this.move_by(
      vec2_sub(
        scene.c2v(this.dragEnd[0], this.dragEnd[1]),
        scene.c2v(this.dragStart[0], this.dragStart[1])
      )
    );
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
  // Remove draggability
  toDot() {
    return new Dot(this.center, this.radius);
  }
};
var DraggableDotX = class extends DraggableDot {
  _drag_cursor(scene) {
    this.move_by(
      vec2_sub(scene.c2s(this.dragEnd[0], 0), scene.c2s(this.dragStart[0], 0))
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
};
var DraggableDotY = class extends DraggableDot {
  _drag_cursor(scene) {
    this.move_by(
      vec2_sub(scene.c2s(0, this.dragEnd[1]), scene.c2s(0, this.dragStart[1]))
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
};

// src/orbit_scene.ts
var GRAV_CONSTANT = 1;
var OrbitScene = class extends Scene {
  constructor(canvas, center) {
    super(canvas);
    this.center = center;
    this.add("center", new Dot(center, 0.2));
    this.add("orbiter", new Dot(center, 0.1));
    this.state = [center, [0, 0]];
  }
  // Set the position of the orbiter
  set_position(x) {
    this.state[0] = x;
    let orbiter = this.get_mobj("orbiter");
    orbiter.move_to(x);
  }
  get_position() {
    return this.state[0];
  }
  // Set the linear velocity. Used by the scene evolution engine.
  set_velocity(v) {
    this.state[1] = v;
  }
  get_velocity() {
    return this.state[1];
  }
  // [d2x/dt2, d2y/dt2] in terms of [x, y]
  d2x(pos) {
    let r = Math.sqrt(
      (pos[0] - this.center[0]) ** 2 + (pos[1] - this.center[1]) ** 2
    );
    return [
      -GRAV_CONSTANT * (pos[0] - this.center[0]) / r ** 3,
      -GRAV_CONSTANT * (pos[1] - this.center[1]) / r ** 3
    ];
  }
  // Evolves the simulation forward by time dt
  step(dt) {
    let k1 = [
      this.state[1],
      this.d2x(this.state[0])
    ];
    let k2 = [
      [
        this.state[1][0] + k1[1][0] * dt / 2,
        this.state[1][1] + k1[1][1] * dt / 2
      ],
      this.d2x([
        this.state[0][0] + k1[0][0] * dt / 2,
        this.state[0][1] + k1[0][1] * dt / 2
      ])
    ];
    let k3 = [
      [
        this.state[1][0] + k2[1][0] * dt / 2,
        this.state[1][1] + k2[1][1] * dt / 2
      ],
      this.d2x([
        this.state[0][0] + k2[0][0] * dt / 2,
        this.state[0][1] + k2[0][1] * dt / 2
      ])
    ];
    let k4 = [
      [this.state[1][0] + k3[1][0] * dt, this.state[1][1] + k3[1][1] * dt],
      this.d2x([
        this.state[0][0] + k3[0][0] * dt,
        this.state[0][1] + k3[0][1] * dt
      ])
    ];
    this.set_position([
      this.state[0][0] + (k1[0][0] + 2 * k2[0][0] + 2 * k3[0][0] + k4[0][0]) * dt / 6,
      this.state[0][1] + (k1[0][1] + 2 * k2[0][1] + 2 * k3[0][1] + k4[0][1]) * dt / 6
    ]);
    this.set_velocity([
      this.state[1][0] + (k1[1][0] + 2 * k2[1][0] + 2 * k3[1][0] + k4[1][0]) * dt / 6,
      this.state[1][1] + (k1[1][1] + 2 * k2[1][1] + 2 * k3[1][1] + k4[1][1]) * dt / 6
    ]);
  }
  // Starts animation
  start_playing() {
    this.step(0.05);
    this.draw();
    window.requestAnimationFrame(this.start_playing.bind(this));
  }
};
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    function prepare_canvas(width2, height2, name) {
      const container = document.getElementById(name);
      if (container == null) throw new Error(`${name} not found`);
      container.style.width = `${width2}px`;
      container.style.height = `${height2}px`;
      let wrapper = document.createElement("div");
      wrapper.classList.add("canvas_container");
      wrapper.classList.add("non_selectable");
      wrapper.style.width = `${width2}px`;
      wrapper.style.height = `${height2}px`;
      let canvas2 = document.createElement("canvas");
      canvas2.classList.add("non_selectable");
      canvas2.style.position = "relative";
      canvas2.style.top = "0";
      canvas2.style.left = "0";
      canvas2.height = height2;
      canvas2.width = width2;
      wrapper.appendChild(canvas2);
      container.appendChild(wrapper);
      console.log("Canvas made");
      return canvas2;
    }
    let width = 300;
    let height = 300;
    let canvas = prepare_canvas(width, height, "scene-container");
    let scene = new OrbitScene(canvas, [0, 0]);
    scene.set_position([1, 0]);
    scene.set_velocity([0, 1.2]);
    let xlims = [-5, 5];
    let ylims = [-5, 5];
    scene.set_frame_lims(xlims, ylims);
    scene.draw();
    scene.start_playing();
  });
})();
