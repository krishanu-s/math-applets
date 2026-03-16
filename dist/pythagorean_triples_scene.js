var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/base/vec2.ts
function vec2_polar_form(r, theta) {
  return [r * Math.cos(theta), r * Math.sin(theta)];
}
function vec2_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
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
function vec2_dot(x, y) {
  return x[0] * y[0] + x[1] * y[1];
}
function vec2_homothety(p1, p2, scale) {
  return vec2_sum(p1, vec2_scale(vec2_sub(p2, p1), scale));
}
function transpose(m) {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]]
  ];
}
function matmul_vec2(m, v) {
  let result = [0, 0];
  for (let i = 0; i < 2; i++) {
    result[i] = vec2_dot(m[i], v);
  }
  return result;
}
function matmul_mat2(m1, m2) {
  let result = [];
  for (let i = 0; i < 2; i++) {
    result.push(matmul_vec2(m1, [m2[0][i], m2[1][i]]));
  }
  return transpose(result);
}

// src/lib/base/style_options.ts
var DEFAULT_BACKGROUND_COLOR = "white";
var DEFAULT_BORDER_COLOR = "black";
var DEFAULT_BORDER_WIDTH = 4;
var DEFAULT_STROKE_COLOR = "black";
var DEFAULT_STROKE_WIDTH = 0.08;
var DEFAULT_FILL_COLOR = "black";

// src/lib/base/base.ts
function clamp(x, xmin, xmax) {
  return Math.min(xmax, Math.max(xmin, x));
}
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
function funspace(func, start, stop, num) {
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => func(start + i * step));
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function smooth(t, inflection = 10) {
  let error = sigmoid(-inflection / 2);
  return Math.min(
    Math.max((sigmoid(inflection * (t - 0.5)) - error) / (1 - 2 * error), 0),
    1
  );
}
var StrokeOptions = class {
  constructor() {
    this.stroke_width = DEFAULT_STROKE_WIDTH;
    this.stroke_color = DEFAULT_STROKE_COLOR;
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
  apply_to(ctx, scene) {
    ctx.lineWidth = this.stroke_width * scene.scale();
    ctx.strokeStyle = this.stroke_color;
    if (this.stroke_style == "solid") {
      ctx.setLineDash([]);
    } else if (this.stroke_style == "dashed") {
      ctx.setLineDash([5, 5]);
    } else if (this.stroke_style == "dotted") {
      ctx.setLineDash([2, 2]);
    }
  }
};
var FillOptions = class {
  constructor() {
    this.fill_color = DEFAULT_FILL_COLOR;
    this.fill_alpha = 1;
    this.fill = true;
  }
  set_fill_color(color) {
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
  apply_to(ctx) {
    ctx.fillStyle = this.fill_color;
  }
};
var MObject = class {
  // Opacity for drawing
  constructor() {
    this.alpha = 1;
  }
  set_alpha(alpha) {
    this.alpha = alpha;
    return this;
  }
  move_by(p) {
    return this;
  }
  homothety_around(p, scale) {
    return this;
  }
  add(scene) {
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = clamp(ctx.globalAlpha * this.alpha, 0, 1);
    this._draw(ctx, scene, args);
    ctx.globalAlpha = clamp(ctx.globalAlpha / this.alpha, 0, 1);
  }
  _draw(ctx, scene, args) {
  }
};
var MObjectGroup = class extends MObject {
  constructor() {
    super(...arguments);
    this.children = {};
  }
  add_mobj(name, child) {
    this.children[name] = child;
    return this;
  }
  remove_mobj(name) {
    delete this.children[name];
    return this;
  }
  move_by(p) {
    Object.values(this.children).forEach((child) => child.move_by(p));
    return this;
  }
  homothety_around(p, scale) {
    Object.values(this.children).forEach(
      (child) => child.homothety_around(p, scale)
    );
    return this;
  }
  clear() {
    Object.keys(this.children).forEach((key) => {
      delete this.children[key];
    });
  }
  has_mobj(name) {
    if (!this.children[name]) {
      return false;
    }
    return true;
  }
  get_mobj(name) {
    if (!this.children[name]) {
      throw new Error(`Child with name ${name} not found`);
    }
    return this.children[name];
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = clamp(ctx.globalAlpha * this.alpha, 0, 1);
    Object.values(this.children).forEach(
      (child) => child.draw(canvas, scene, args)
    );
    ctx.globalAlpha = clamp(ctx.globalAlpha / this.alpha, 0, 1);
  }
};
var LineLikeMObject = class extends MObject {
  constructor() {
    super(...arguments);
    this.stroke_options = new StrokeOptions();
  }
  set_stroke_color(color) {
    this.stroke_options.set_stroke_color(color);
    return this;
  }
  set_stroke_width(width) {
    this.stroke_options.set_stroke_width(width);
    return this;
  }
  set_stroke_style(style) {
    this.stroke_options.set_stroke_style(style);
    return this;
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.stroke_options.apply_to(ctx, scene);
    ctx.globalAlpha = clamp(ctx.globalAlpha * this.alpha, 0, 1);
    this._draw(ctx, scene, args);
    ctx.globalAlpha = clamp(ctx.globalAlpha / this.alpha, 0, 1);
  }
};
var LineLikeMObjectGroup = class extends MObjectGroup {
  constructor() {
    super(...arguments);
    this.stroke_options = new StrokeOptions();
  }
  set_stroke_color(color) {
    this.stroke_options.set_stroke_color(color);
    return this;
  }
  set_stroke_width(width) {
    this.stroke_options.set_stroke_width(width);
    return this;
  }
  set_stroke_style(style) {
    this.stroke_options.set_stroke_style(style);
    return this;
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.stroke_options.apply_to(ctx, scene);
    ctx.globalAlpha = clamp(ctx.globalAlpha * this.alpha, 0, 1);
    Object.values(this.children).forEach((child) => {
      ctx.globalAlpha = clamp(ctx.globalAlpha * child.alpha, 0, 1);
      child._draw(ctx, scene, args);
      ctx.globalAlpha = clamp(ctx.globalAlpha / child.alpha, 0, 1);
    });
    ctx.globalAlpha = clamp(ctx.globalAlpha / this.alpha, 0, 1);
  }
};
var FillLikeMObject = class extends MObject {
  constructor() {
    super(...arguments);
    this.stroke_options = new StrokeOptions();
    this.fill_options = new FillOptions();
  }
  set_stroke_color(color) {
    this.stroke_options.set_stroke_color(color);
    return this;
  }
  set_stroke_width(width) {
    this.stroke_options.set_stroke_width(width);
    return this;
  }
  set_stroke_style(style) {
    this.stroke_options.set_stroke_style(style);
    return this;
  }
  set_fill_color(color) {
    this.fill_options.set_fill_color(color);
    return this;
  }
  set_color(color) {
    this.stroke_options.set_stroke_color(color);
    this.fill_options.set_fill_color(color);
    return this;
  }
  set_fill_alpha(alpha) {
    this.fill_options.set_fill_alpha(alpha);
    return this;
  }
  set_fill(fill) {
    this.fill_options.set_fill(fill);
    return this;
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.stroke_options.apply_to(ctx, scene);
    this.fill_options.apply_to(ctx);
    ctx.globalAlpha = clamp(ctx.globalAlpha * this.alpha, 0, 1);
    this._draw(ctx, scene, args);
    ctx.globalAlpha = clamp(ctx.globalAlpha / this.alpha, 0, 1);
  }
};
var Scene = class {
  constructor(canvas) {
    this.background_color = DEFAULT_BACKGROUND_COLOR;
    this.border_width = DEFAULT_BORDER_WIDTH;
    this.border_color = DEFAULT_BORDER_COLOR;
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
  // Number of canvas pixels occupied by a horizontal shift of 1 in scene coordinates
  scale() {
    let [xmin, xmax] = this.view_xlims;
    return this.canvas.width / (xmax - xmin);
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
  // Groups a collection of mobjects as a MObjectGroup
  group(names, group_name) {
    let group = new MObjectGroup();
    names.forEach((name) => {
      let mobj = this.get_mobj(name);
      group.add_mobj(name, mobj);
      delete this.mobjects[name];
    });
    this.add(group_name, group);
  }
  // Ungroups a MObjectGroup
  ungroup(group_name) {
    let group = this.mobjects[group_name];
    if (group == void 0) throw new Error(`${group_name} not found`);
    Object.entries(group.children).forEach(([mobj_name, mobj]) => {
      this.add(mobj_name, mobj);
    });
    delete this.mobjects[group_name];
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
  // Moves a mobject to the front of the scene
  move_to_front(name) {
    let mobj = this.get_mobj(name);
    this.remove(name);
    this.add(name, mobj);
  }
  // Draws the scene
  draw(args) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw_background(ctx);
    this._draw();
    this.draw_border(ctx);
  }
  _draw() {
    Object.entries(this.mobjects).forEach(([name, mobj]) => {
      this.draw_mobject(mobj);
    });
  }
  draw_mobject(mobj) {
    mobj.draw(this.canvas, this);
  }
  // Draw a background
  draw_background(ctx) {
    ctx.fillStyle = this.background_color;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  // Draw a border around the canvas
  draw_border(ctx) {
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_width;
    ctx.globalAlpha = 1;
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
  let touch = event.touches[0];
  return [touch.pageX, touch.pageY];
}

// src/lib/interactive/draggable.ts
var makeDraggable = (Base) => {
  return class Draggable extends Base {
    constructor() {
      super(...arguments);
      this.draggable_x = true;
      // Whether the object is set as draggable in the X-direction.
      this.draggable_y = true;
      // Whether the object is set as draggable in the Y-direction.
      this.isClicked = false;
      // Whether the object is currently being clicked and dragged.
      this.dragStart = [0, 0];
      // The starting position of the drag.
      this.dragEnd = [0, 0];
      // The ending position of the drag.
      this.touch_tolerance = 2;
      // The extra tolerance provided for touch events.
      this.callbacks = [];
    }
    // Callbacks which trigger when the object is dragged.
    // Adds a callback which triggers when the object is dragged
    add_callback(callback) {
      this.callbacks.push(callback);
    }
    // Performs all callbacks (called when the object is dragged)
    do_callbacks() {
      for (const callback of this.callbacks) {
        callback();
      }
    }
    // Sets the draggable property of the object
    set_draggable_x(draggable) {
      this.draggable_x = draggable;
    }
    set_draggable_y(draggable) {
      this.draggable_y = draggable;
    }
    // Triggers when the canvas is clicked.
    click(scene, event) {
      this.dragStart = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop
      ]);
      if (!scene.is_dragging) {
        this.isClicked = this.is_inside(
          scene.c2v(this.dragStart[0], this.dragStart[1])
        );
        if (this.isClicked) {
          scene.click();
        }
      }
    }
    touch(scene, event) {
      if (event.touches.length == 0) throw new Error("No touch detected");
      let touch = event.touches[0];
      this.dragStart = [
        touch.pageX - scene.canvas.offsetLeft,
        touch.pageY - scene.canvas.offsetTop
      ];
      if (!scene.is_dragging) {
        this.isClicked = this.is_almost_inside(
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
      if (!this.draggable_x && !this.draggable_y) {
        return;
      }
      let translate_vec = vec2_sub(
        scene.c2s(
          this.dragEnd[0] * Number(this.draggable_x),
          this.dragEnd[1] * Number(this.draggable_y)
        ),
        scene.c2s(
          this.dragStart[0] * Number(this.draggable_x),
          this.dragStart[1] * Number(this.draggable_y)
        )
      );
      this.move_by(translate_vec);
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
      scene.canvas.removeEventListener(
        "mousedown",
        this.click.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "mouseup",
        this.unclick.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "mousemove",
        this.mouse_drag_cursor.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "touchstart",
        this.touch.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "touchend",
        this.untouch.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "touchmove",
        self.touch_drag_cursor.bind(self, scene)
      );
    }
  };
};
var makeDraggable3D = (Base) => {
  return class Draggable extends Base {
    constructor() {
      super(...arguments);
      this.draggable_x = true;
      // Whether the object is set as draggable in the X-direction.
      this.draggable_y = true;
      // Whether the object is set as draggable in the Y-direction.
      this.draggable_z = true;
      // Whether the object is set as draggable in the Z-direction.
      this.isClicked = false;
      // Whether the object is currently being clicked and dragged.
      this.dragStart = [0, 0];
      // The starting position of the drag.
      this.dragEnd = [0, 0];
      // The ending position of the drag.
      this.touch_tolerance = 2;
      // The extra tolerance provided for touch events.
      this.callbacks = [];
    }
    // Callbacks which trigger when the object is dragged.
    // Adds a callback which triggers when the object is dragged
    add_callback(callback) {
      this.callbacks.push(callback);
    }
    // Performs all callbacks (called when the object is dragged)
    do_callbacks() {
      for (const callback of this.callbacks) {
        callback();
      }
    }
    // Sets the draggable property of the object
    set_draggable_x(draggable) {
      this.draggable_x = draggable;
    }
    set_draggable_y(draggable) {
      this.draggable_y = draggable;
    }
    set_draggable_z(draggable) {
      this.draggable_z = draggable;
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
      let touch = event.touches[0];
      this.dragStart = [
        touch.pageX - scene.canvas.offsetLeft,
        touch.pageY - scene.canvas.offsetTop
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
      if (!this.draggable_x && !this.draggable_y && !this.draggable_z) return;
      let [mx, my, mz] = scene.v2w(
        vec2_sub(
          scene.c2s(this.dragEnd[0], this.dragEnd[1]),
          scene.c2s(this.dragStart[0], this.dragStart[1])
        )
      );
      this.move_by([
        mx * Number(this.draggable_x),
        my * Number(this.draggable_y),
        mz * Number(this.draggable_z)
      ]);
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
      scene.canvas.removeEventListener(
        "mousedown",
        this.click.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "mouseup",
        this.unclick.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "mousemove",
        this.mouse_drag_cursor.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "touchstart",
        this.touch.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "touchend",
        this.untouch.bind(self, scene)
      );
      scene.canvas.removeEventListener(
        "touchmove",
        self.touch_drag_cursor.bind(self, scene)
      );
    }
  };
};

// src/lib/base/geometry.ts
var Sector = class extends FillLikeMObject {
  constructor(center, radius, start_angle, end_angle) {
    super();
    this.center = center;
    this.radius = radius;
    this.start_angle = start_angle;
    this.end_angle = end_angle;
  }
  // Tests whether a chosen vector lies inside the shape. Used for click-detection.
  is_inside(p) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius;
  }
  // Tests whether a chosen vector lies within an enlarged version of the dot.
  // Used for touch-detection on mobile devices.
  is_almost_inside(p, tolerance) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius * tolerance;
  }
  // Get the center coordinates
  get_center() {
    return this.center;
  }
  get_radius() {
    return this.radius;
  }
  // Move the center of the dot to a desired location
  move_to(p) {
    this.center = p;
    return this;
  }
  move_by(p) {
    this.center[0] += p[0];
    this.center[1] += p[1];
    return this;
  }
  // Performs a homothety around the given point
  homothety_around(p, scale) {
    this.center = vec2_homothety(p, this.center, scale);
    this.radius *= scale;
    return this;
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
    ctx.arc(x, y, Math.abs(xr - x), this.start_angle, this.end_angle);
    if (this.fill_options.fill) {
      ctx.globalAlpha *= this.fill_options.fill_alpha;
      ctx.fill();
      ctx.globalAlpha /= this.fill_options.fill_alpha;
    }
  }
};
var Dot = class extends Sector {
  constructor(center, radius) {
    super(center, radius, 0, 2 * Math.PI);
  }
};
var DraggableDot = makeDraggable(Dot);
var Rectangle = class extends FillLikeMObject {
  constructor(center, size_x, size_y) {
    super();
    this.center = center;
    this.size_x = size_x;
    this.size_y = size_y;
  }
  // Tests whether a chosen vector lies inside the shape. Used for click-detection.
  is_inside(p) {
    return Math.abs(p[0] - this.center[0]) < this.size_x / 2 && Math.abs(p[1] - this.center[1]) < this.size_y / 2;
  }
  // Tests whether a chosen vector lies within an enlarged version of the shape.
  // Used for touch-detection on mobile devices, and for use by small children.
  is_almost_inside(p, tolerance) {
    return Math.abs(p[0] - this.center[0]) < this.size_x / 2 * tolerance && Math.abs(p[1] - this.center[1]) < this.size_y / 2 * tolerance;
  }
  get_center() {
    return this.center;
  }
  get_radius() {
    return Math.max(this.size_x, this.size_y) / 2;
  }
  move_to(center) {
    this.center = center;
    return this;
  }
  move_by(p) {
    this.center[0] += p[0];
    this.center[1] += p[1];
    return this;
  }
  // Performs a homothety around the given point
  homothety_around(p, scale) {
    this.center = vec2_homothety(p, this.center, scale);
    this.size_x *= scale;
    this.size_y *= scale;
    return this;
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
var Polygon = class extends FillLikeMObject {
  constructor(points) {
    super();
    this.points = points;
  }
  add_point(point) {
    this.points.push(point);
  }
  remove_point(index) {
    this.points.splice(index, 1);
  }
  move_point(i, new_point) {
    this.points[i] = new_point;
  }
  move_by(p) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = vec2_sum(this.points[i], p);
    }
    return this;
  }
  // Performs a homothety around the given point
  homothety_around(p, scale) {
    let new_points = [];
    for (let point of this.points) {
      new_points.push(vec2_homothety(p, point, scale));
    }
    this.points = new_points;
    return this;
  }
  _draw(ctx, scene) {
    let [x, y] = scene.v2c(this.points[0]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.points.length; i++) {
      [x, y] = scene.v2c(this.points[i]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    if (this.fill_options.fill) {
      ctx.globalAlpha *= this.fill_options.fill_alpha;
      ctx.fill();
      ctx.globalAlpha /= this.fill_options.fill_alpha;
    }
  }
};
var DraggableRectangle = makeDraggable(Rectangle);
var Line = class extends LineLikeMObject {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
  // Moves the start and end points
  move_start(p) {
    this.start = p;
    return this;
  }
  move_end(p) {
    this.end = p;
    return this;
  }
  move_midpoint_to(p) {
    this.move_by(vec2_sub(p, this.midpoint()));
    return this;
  }
  move_by(p) {
    this.start = vec2_sum(this.start, p);
    this.end = vec2_sum(this.end, p);
    return this;
  }
  // Convenience functions
  midpoint() {
    return [
      0.5 * (this.start[0] + this.end[0]),
      0.5 * (this.start[1] + this.end[1])
    ];
  }
  vec() {
    return vec2_sub(this.end, this.start);
  }
  length() {
    return vec2_norm(this.vec());
  }
  // Rotates the line around its midpoint to a given angle
  rotate_to(theta) {
    let new_start = vec2_sum(
      this.midpoint(),
      vec2_polar_form(this.length() / 2, theta)
    );
    let new_end = vec2_sum(
      this.midpoint(),
      vec2_polar_form(-this.length() / 2, theta)
    );
    [this.start, this.end] = [new_start, new_end];
    return this;
  }
  // Performs a homothety around the given point
  homothety_around(p, scale) {
    this.start = vec2_homothety(p, this.start, scale);
    this.end = vec2_homothety(p, this.end, scale);
    return this;
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
    ctx.fillStyle = this.stroke_options.stroke_color;
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

// src/lib/three_d/matvec.ts
function vec3_scale(x, factor) {
  return [x[0] * factor, x[1] * factor, x[2] * factor];
}
function vec3_sum(x, y) {
  return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
}
function vec3_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
}
function get_column(m, i) {
  return [m[0][i], m[1][i], m[2][i]];
}

// src/lib/three_d/mobjects.ts
var ThreeDMObject = class extends MObject {
  constructor() {
    super(...arguments);
    this.blocked_depth_tolerance = 0.01;
    this.linked_mobjects = [];
    this.stroke_options = new StrokeOptions();
  }
  set_stroke_color(color) {
    this.stroke_options.set_stroke_color(color);
    return this;
  }
  set_stroke_width(width) {
    this.stroke_options.set_stroke_width(width);
    return this;
  }
  set_stroke_style(style) {
    this.stroke_options.set_stroke_style(style);
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
      return scene.camera.depth(point) > this.blocked_depth_at(scene, vp) + this.blocked_depth_tolerance;
    }
  }
  draw(canvas, scene, simple = false, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    this.stroke_options.apply_to(ctx, scene);
    if (this instanceof Line3D && simple) {
      this._draw_simple(ctx, scene);
    } else {
      this._draw(ctx, scene, args);
    }
  }
  // Simpler drawing method for 3D scenes which doesn't use local depth testing, for speed purposes.
  _draw_simple(ctx, scene) {
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
    this.stroke_options.apply_to(ctx, scene);
    if (this instanceof Line3D && simple) {
      this._draw_simple(ctx, scene);
    } else {
      this._draw(ctx, scene, args);
    }
  }
};
var ThreeDFillLikeMObject = class extends ThreeDMObject {
  constructor() {
    super(...arguments);
    this.fill_options = new FillOptions();
  }
  set_fill_color(color) {
    this.fill_options.fill_color = color;
    return this;
  }
  set_color(color) {
    this.stroke_options.stroke_color = color;
    this.fill_options.fill_color = color;
    return this;
  }
  set_fill_alpha(alpha) {
    this.fill_options.fill_alpha = alpha;
    return this;
  }
  set_fill(fill) {
    this.fill_options.fill = fill;
    return this;
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
    this.stroke_options.apply_to(ctx, scene);
    this.fill_options.apply_to(ctx);
    if (this instanceof Dot3D && simple) {
      this._draw_simple(ctx, scene);
    } else {
      this._draw(ctx, scene, args);
    }
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
  depth(scene) {
    return scene.camera.depth(this.center);
  }
  depth_at(scene, view_point) {
    if (scene.mode == "perspective") {
      return 0;
    } else if (scene.mode == "orthographic") {
      let dist = vec2_norm(
        vec2_sub(view_point, scene.camera.orthographic_view(this.center))
      );
      if (dist > this.radius) {
        return Infinity;
      } else {
        let depth_adjustment = Math.sqrt(
          Math.max(0, this.radius ** 2 - dist ** 2)
        );
        return scene.camera.depth(this.center) - depth_adjustment;
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
        vec3_scale(get_column(scene.camera.get_camera_frame(), 0), this.radius)
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
      if (this.fill_options.fill) {
        ctx.globalAlpha = ctx.globalAlpha * this.fill_options.fill_alpha;
        ctx.fill();
        ctx.globalAlpha = ctx.globalAlpha / this.fill_options.fill_alpha;
      }
    }
  }
  _draw(ctx, scene) {
    let p = scene.camera_view(this.center);
    let pr = scene.camera_view(
      vec3_sum(
        this.center,
        vec3_scale(get_column(scene.camera.get_camera_frame(), 0), this.radius)
      )
    );
    let state;
    if (p != null && pr != null) {
      let depth = scene.camera.depth(this.center);
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
      if (this.fill_options.fill) {
        ctx.globalAlpha = ctx.globalAlpha * this.fill_options.fill_alpha;
        ctx.fill();
        ctx.globalAlpha = ctx.globalAlpha / this.fill_options.fill_alpha;
      }
      if (state == "blocked") {
        this.unset_behind_linked_mobjects(ctx);
      }
    }
  }
  // toDraggableDot3D(): DraggableDot3D {
  //   return new DraggableDot3D(this.center, this.radius);
  // }
  // toDraggableDotZ3D(): DraggableDotZ3D {
  //   return new DraggableDotZ3D(this.center, this.radius);
  // }
};
var DraggableDot3D = makeDraggable3D(Dot3D);
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
    return scene.camera.depth(vec3_scale(vec3_sum(this.end, this.start), 0.5));
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

// src/lib/base/cartesian.ts
var AxisOptions = class {
  constructor() {
    this.stroke_width = 0.1;
    this.alpha = 1;
    this.arrow_size = 0.3;
  }
  update(options) {
    Object.assign(this, options);
  }
};
var TickOptions = class {
  constructor() {
    this.distance = 1;
    this.size = 0.2;
    this.alpha = 1;
    this.stroke_width = 0.08;
  }
  update(options) {
    Object.assign(this, options);
  }
};
var GridOptions = class {
  constructor() {
    this.x_distance = 1;
    this.y_distance = 1;
    this.alpha = 0.2;
    this.stroke_width = 0.05;
  }
  update(options) {
    Object.assign(this, options);
  }
};
var Axis = class extends MObjectGroup {
  constructor(lims, type) {
    super();
    this.axis_options = new AxisOptions();
    this.tick_options = new TickOptions();
    this.lims = lims;
    this.type = type;
    this._make_axis();
    this._make_ticks();
  }
  _make_axis() {
    let [cmin, cmax] = this.lims;
    let axis;
    if (this.type === "x") {
      axis = new TwoHeadedArrow([cmin, 0], [cmax, 0]);
    } else {
      axis = new TwoHeadedArrow([0, cmin], [0, cmax]);
    }
    axis.set_stroke_width(this.axis_options.stroke_width);
    axis.set_arrow_size(this.axis_options.arrow_size);
    axis.set_alpha(this.axis_options.alpha);
    this.add_mobj("axis", axis);
  }
  _make_ticks() {
    let [cmin, cmax] = this.lims;
    let ticks = new LineLikeMObjectGroup().set_alpha(this.tick_options.alpha).set_stroke_width(this.tick_options.stroke_width);
    for (let c = this.tick_options.distance * Math.floor(cmin / this.tick_options.distance + 1); c < this.tick_options.distance * Math.ceil(cmax / this.tick_options.distance); c += this.tick_options.distance) {
      if (this.type == "x") {
        ticks.add_mobj(
          `tick-x-(${c})`,
          new Line(
            [c, -this.tick_options.size / 2],
            [c, this.tick_options.size / 2]
          ).set_stroke_width(this.tick_options.stroke_width)
        );
      } else {
        ticks.add_mobj(
          `tick-y-(${c})`,
          new Line(
            [-this.tick_options.size / 2, c],
            [this.tick_options.size / 2, c]
          ).set_stroke_width(this.tick_options.stroke_width)
        );
      }
    }
    this.add_mobj("ticks", ticks);
  }
  axis() {
    return this.get_mobj("axis");
  }
  ticks() {
    return this.get_mobj("ticks");
  }
  set_lims(lims) {
    this.lims = lims;
    this.remove_mobj("axis");
    this.remove_mobj("ticks");
    this._make_axis();
    this._make_ticks();
  }
  set_axis_options(options) {
    this.axis_options.update(options);
    this.remove_mobj("axis");
    this._make_axis();
  }
  set_tick_options(options) {
    this.tick_options.update(options);
    this.remove_mobj("ticks");
    this._make_ticks();
    return this;
  }
  set_tick_distance(distance) {
    this.tick_options.distance = distance;
    this.set_tick_options(this.tick_options);
    return this;
  }
  set_tick_size(size) {
    this.tick_options.size = size;
    this.set_tick_options(this.tick_options);
    return this;
  }
};
var CoordinateAxes2d = class extends MObjectGroup {
  constructor(xlims, ylims) {
    super();
    this.axis_options = new AxisOptions();
    this.tick_options = new TickOptions();
    this.grid_options = new GridOptions();
    this.xlims = xlims;
    this.ylims = ylims;
    this._make_axes();
    this._make_x_grid_lines();
    this._make_y_grid_lines();
  }
  remove_grid_lines() {
    if (this.has_mobj("x-grid")) {
      this.remove_mobj("x-grid");
    }
    if (this.has_mobj("y-grid")) {
      this.remove_mobj("y-grid");
    }
    return this;
  }
  add_grid_lines() {
    this.remove_grid_lines();
    this._make_x_grid_lines();
    this._make_y_grid_lines();
    return this;
  }
  _make_axes() {
    let x_axis = new Axis(this.xlims, "x");
    x_axis.set_axis_options(this.axis_options);
    x_axis.set_tick_options(this.tick_options);
    this.add_mobj("x-axis", x_axis);
    let y_axis = new Axis(this.ylims, "y");
    y_axis.set_axis_options(this.axis_options);
    y_axis.set_tick_options(this.tick_options);
    this.add_mobj("y-axis", y_axis);
  }
  _make_x_grid_lines() {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;
    let x_grid = new LineLikeMObjectGroup().set_alpha(this.grid_options.alpha).set_stroke_width(this.grid_options.stroke_width);
    for (let x = this.grid_options.x_distance * Math.floor(xmin / this.grid_options.x_distance + 1); x < this.grid_options.x_distance * Math.ceil(xmax / this.grid_options.x_distance); x += this.grid_options.x_distance) {
      x_grid.add_mobj(`line-(${x})`, new Line([x, ymin], [x, ymax]));
    }
    this.add_mobj("x-grid", x_grid);
  }
  _make_y_grid_lines() {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;
    let y_grid = new LineLikeMObjectGroup().set_alpha(this.grid_options.alpha).set_stroke_width(this.grid_options.stroke_width);
    for (let y = this.grid_options.y_distance * Math.floor(ymin / this.grid_options.y_distance + 1); y < this.grid_options.y_distance * Math.ceil(ymax / this.grid_options.y_distance); y += this.grid_options.y_distance) {
      y_grid.add_mobj(`line-(${y})`, new Line([xmin, y], [xmax, y]));
    }
    this.add_mobj("y-grid", y_grid);
  }
  x_axis() {
    return this.get_mobj("x-axis");
  }
  y_axis() {
    return this.get_mobj("y-axis");
  }
  x_grid() {
    return this.get_mobj("x-grid");
  }
  y_grid() {
    return this.get_mobj("y-grid");
  }
  set_axis_options(options) {
    this.axis_options.update(options);
    this.remove_mobj("x-axis");
    this.remove_mobj("y-axis");
    this._make_axes();
    return this;
  }
  set_axis_stroke_width(width) {
    this.axis_options.stroke_width = width;
    this.set_axis_options(this.axis_options);
    return this;
  }
  set_tick_options(options) {
    this.tick_options.update(options);
    this.remove_mobj("x-axis");
    this.remove_mobj("y-axis");
    this._make_axes();
    return this;
  }
  set_tick_size(size) {
    this.tick_options.size = size;
    this.set_tick_options(this.tick_options);
    return this;
  }
  set_tick_distance(distance) {
    this.tick_options.distance = distance;
    this.set_tick_options(this.tick_options);
    return this;
  }
  set_grid_options(options) {
    this.grid_options.update(options);
    this.remove_mobj("x-grid");
    this.remove_mobj("y-grid");
    this._make_x_grid_lines();
    this._make_y_grid_lines();
    return this;
  }
  set_grid_distance(distance) {
    this.grid_options.x_distance = distance;
    this.grid_options.y_distance = distance;
    this.set_grid_options(this.grid_options);
    return this;
  }
  set_grid_alpha(alpha) {
    this.grid_options.alpha = alpha;
    this.set_grid_options(this.grid_options);
    return this;
  }
  set_grid_stroke_width(width) {
    this.grid_options.stroke_width = width;
    this.set_grid_options(this.grid_options);
    return this;
  }
  set_lims(xlims, ylims) {
    this.xlims = xlims;
    this.ylims = ylims;
    this.x_axis().set_lims(xlims);
    this.y_axis().set_lims(ylims);
    this.remove_mobj("x-grid");
    this.remove_mobj("y-grid");
    this._make_x_grid_lines();
    this._make_y_grid_lines();
    return this;
  }
};

// src/lib/base/latex.ts
var LaTeXMObject = class extends MObject {
  // Cache for rendered LaTeX images.
  constructor(latex, pos, latex_cache, katexOptions) {
    super();
    // The position of the center of the LaTeX object.
    this.rotation = 0;
    this.color = "black";
    this.fontSize = 16;
    this.pos = pos;
    this.latex = latex;
    this.latex_cache = latex_cache;
    this.katexOptions = {
      throwOnError: false,
      displayMode: false,
      fleqn: true,
      ...katexOptions
    };
  }
  set_tex(latex) {
    this.latex = latex;
    return this;
  }
  set_fontSize(size) {
    this.fontSize = size;
    return this;
  }
  set_rotation(rotation) {
    this.rotation = rotation;
    return this;
  }
  set_color(color) {
    this.color = color;
    return this;
  }
  move_to(pos) {
    this.pos = pos;
    return this;
  }
  move_by(vec) {
    this.pos = vec2_sum(this.pos, vec);
    return this;
  }
  // Draw a rendered LaTeX image
  _drawRendered(ctx, scene, renderedImage) {
    let [cx, cy] = scene.v2c(this.pos);
    ctx.translate(-renderedImage.width / 2, -renderedImage.height / 2);
    if (this.rotation !== 0) {
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.drawImage(renderedImage, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(renderedImage, cx, cy);
    }
    ctx.translate(renderedImage.width / 2, renderedImage.height / 2);
  }
  // Renders a LaTeX expression and outputs an image.
  async _render() {
    if (!window.katex) {
      throw new Error("KaTeX is not loaded. Please include KaTeX library.");
    }
    if (!window.html2canvas) {
      throw new Error(
        "html2canvas is not loaded. Please include html2canvas library."
      );
    }
    const container = document.createElement("div");
    container.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            color: ${this.color};
            font-size: ${this.fontSize}px;
            display: inline-block;
            transform: translate(${this.pos[0]}px, ${this.pos[1]}px) rotate(${this.rotation}deg);
            transform-origin: 0 0;
            white-space: nowrap;
            z-index: 9999;
        `;
    container.style.backgroundColor = "white";
    container.style.padding = "2px 4px";
    container.style.borderRadius = "3px";
    document.body.appendChild(container);
    window.katex.render(this.latex, container, {
      ...this.katexOptions,
      fontSize: this.fontSize + "px"
    });
    let tempCanvas = await window.html2canvas(container, {
      backgroundColor: null,
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    return [container, tempCanvas];
  }
  // Draw the LaTeX object, either by using the cache (if it has been rendered before)
  // or by rendering it from scratch (if this is the first time).
  async _draw(ctx, scene) {
    let [isCached, cachedCanvas] = this.latex_cache.is_cached(
      this.latex,
      this.color,
      this.fontSize
    );
    if (isCached) {
      this._drawRendered(ctx, scene, cachedCanvas);
    } else {
      let [container, tempCanvas] = await this._render();
      this.latex_cache.add(this.latex, this.color, this.fontSize, tempCanvas);
      ctx.save();
      this._drawRendered(ctx, scene, tempCanvas);
      document.body.removeChild(container);
    }
  }
  // Adds this LaTeX object to the cache for faster rendering-on-demand in future.
  async add_to_cache() {
    let [isCached, cachedCanvas] = this.latex_cache.is_cached(
      this.latex,
      this.color,
      this.fontSize
    );
    if (isCached) {
      return;
    }
    let [container, tempCanvas] = await this._render();
    this.latex_cache.add(this.latex, this.color, this.fontSize, tempCanvas);
    return this;
  }
};

// src/lib/base/bezier.ts
var BezierSpline = class extends LineLikeMObject {
  constructor(num_steps, solver) {
    super();
    this.num_steps = num_steps;
    this.solver = solver;
    this.anchors = [];
    for (let i = 0; i < num_steps + 1; i++) {
      this.anchors.push([0, 0]);
    }
  }
  set_anchors(new_anchors) {
    this.anchors = new_anchors;
  }
  set_anchor(index, new_anchor) {
    this.anchors[index] = new_anchor;
  }
  get_anchor(index) {
    return this.anchors[index];
  }
  // Draw the Bezier curve using the solver
  _draw(ctx, scene) {
    if (!this.solver) {
      this._drawFallback(ctx, scene);
      return;
    }
    let a_x, a_y, a;
    a = this.get_anchor(0);
    [a_x, a_y] = scene.v2c(a);
    ctx.beginPath();
    ctx.moveTo(a_x, a_y);
    let anchors_flat = this.anchors.reduce(
      (acc, val) => acc.concat(val),
      []
    );
    try {
      let handles_flat = this.solver.get_bezier_handles(anchors_flat);
      let handles = [];
      for (let i = 0; i < handles_flat.length; i += 2) {
        handles.push([handles_flat[i], handles_flat[i + 1]]);
      }
      let h1_x, h1_y, h2_x, h2_y;
      for (let i = 0; i < this.num_steps; i++) {
        [h1_x, h1_y] = scene.v2c(handles[i]);
        [h2_x, h2_y] = scene.v2c(handles[i + this.num_steps]);
        a = this.get_anchor(i + 1);
        [a_x, a_y] = scene.v2c(a);
        ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
      }
      ctx.stroke();
    } catch (error) {
      console.warn("Error with solver, drawing with fallback method.");
      this._drawFallback(ctx, scene);
    }
  }
  // Draw a simple piecewise linear as fallback
  _drawFallback(ctx, scene) {
    if (this.anchors.length === 0) return;
    let [x, y] = scene.v2c(this.get_anchor(0));
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.anchors.length; i++) {
      [x, y] = scene.v2c(this.get_anchor(i));
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};
var ParametricFunction = class extends BezierSpline {
  constructor(f, tmin, tmax, num_steps, solver) {
    super(num_steps, solver);
    this.mode = "smooth";
    this.function = f;
    this.tmin = tmin;
    this.tmax = tmax;
    this._make_anchors();
  }
  _make_anchors() {
    let anchors = [this.function(this.tmin)];
    for (let i = 1; i <= this.num_steps; i++) {
      anchors.push(
        this.function(
          this.tmin + i / this.num_steps * (this.tmax - this.tmin)
        )
      );
    }
    this.set_anchors(anchors);
  }
  // Jagged doesn't use Bezier curves. It is faster to compute and render.
  set_mode(mode) {
    this.mode = mode;
  }
  set_function(new_f) {
    this.function = new_f;
    this._make_anchors();
  }
  set_lims(tmin, tmax) {
    this.tmin = tmin;
    this.tmax = tmax;
    this._make_anchors();
  }
  _draw(ctx, scene) {
    if (this.mode == "jagged") {
      this._drawFallback(ctx, scene);
    } else {
      super._draw(ctx, scene);
    }
  }
};
var MultipleBranchParametricFunction = class extends LineLikeMObjectGroup {
  constructor(num_steps, solver) {
    super();
    this.num_branches = 0;
    this.mode = "smooth";
    this.num_steps = num_steps;
    this.solver = solver;
  }
  add_branch(f, tlims) {
    this.add_mobj(
      `f_${this.num_branches}`,
      new ParametricFunction(
        f,
        tlims[0],
        tlims[1],
        this.num_steps,
        this.solver
      )
    );
    this.num_branches += 1;
  }
  del_branch(i) {
    this.remove_mobj(`f_${i}`);
    for (let j = i; j < this.num_branches - 1; j++) {
      let mobj = this.get_mobj(`f_${j + 1}`);
      this.add_mobj(`f_${j}`, mobj);
    }
    this.remove_mobj(`f_${this.num_branches - 1}`);
    this.num_branches -= 1;
  }
  set_mode(mode, i) {
    this.get_mobj(`f_${i}`).set_mode(mode);
  }
  set_function(new_f, i) {
    this.get_mobj(`f_${i}`).set_function(new_f);
  }
  set_lims(tmin, tmax, i) {
    this.get_mobj(`f_${i}`).set_lims(tmin, tmax);
  }
  // TODO
  // - Search for discontinuities in the domain
  // - Break the function piecewise
  set_global_function(f, tlims) {
  }
};

// src/lib/interactive/button.ts
function Button(container, callback) {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "interactiveButton";
  button.style.padding = "15px";
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

// src/lib/interactive/parameter.ts
var Parameter = class extends MObject {
  // Callbacks which trigger when the value is changed
  constructor() {
    super();
    this._value = 0;
    this.callbacks = [];
  }
  set_value(x) {
    this._value = x;
    this.do_callbacks();
    return this;
  }
  get_value() {
    return this._value;
  }
  // Adds a callback which triggers when the object is dragged
  add_callback(callback) {
    this.callbacks.push(callback);
    return this;
  }
  // Removes all callbacks, unbinding the parameter
  clear() {
    this.callbacks = [];
    return this;
  }
  // Performs all callbacks (called when the value is changed)
  do_callbacks() {
    for (const callback of this.callbacks) {
      callback(this._value);
    }
  }
};

// src/lib/animation.ts
var isVec2D = (v) => v.length == 2;
var isVec3D = (v) => v.length == 3;
var DEFAULT_FRAME_LENGTH = 30;
var DEFAULT_RATE_FUNC = smooth;
var Animation = class {
  constructor() {
    this.frame_length = DEFAULT_FRAME_LENGTH;
  }
  set_frame_length(frame_length) {
    this.frame_length = frame_length;
    return this;
  }
  async play(scene) {
    await this._play(scene);
  }
  async _play(scene) {
  }
};
var FixedLengthAnimation = class extends Animation {
  constructor(num_frames) {
    super();
    this.num_frames = num_frames;
  }
  async _play(scene) {
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(this.frame_length);
      scene.draw();
    }
  }
  async _play_frame(scene, i) {
  }
};
var Wait = class extends FixedLengthAnimation {
};
var Zoom = class extends FixedLengthAnimation {
  constructor(zoom_point, zoom_ratio, num_frames) {
    super(num_frames);
    this.zoom_point = zoom_point;
    this.zoom_ratio = zoom_ratio;
  }
  async _play_frame(scene, i) {
    scene.zoom_in_on(
      Math.pow(
        this.zoom_ratio,
        DEFAULT_RATE_FUNC(i / this.num_frames) - DEFAULT_RATE_FUNC((i - 1) / this.num_frames)
      ),
      this.zoom_point
    );
  }
};
var FadeIn = class extends FixedLengthAnimation {
  constructor(mobjects, num_frames) {
    super(num_frames);
    this.base_alphas = {};
    this.mobjects = mobjects;
    Object.entries(mobjects).forEach(([key, elem]) => {
      this.base_alphas[key] = Number(elem.alpha);
    });
  }
  // Animates the fade in.
  async _play(scene) {
    Object.entries(this.mobjects).forEach(([key, elem]) => {
      scene.add(key, elem);
    });
    await super._play(scene);
  }
  async _play_frame(scene, i) {
    Object.entries(this.mobjects).forEach(([key, elem]) => {
      let alpha = i / this.num_frames * this.base_alphas[key];
      scene.get_mobj(key).set_alpha(alpha);
    });
  }
};
var FadeOut = class extends Animation {
  constructor(mobj_names, num_frames) {
    super();
    this.mobj_names = mobj_names;
    this.num_frames = num_frames;
  }
  async play(scene) {
    await this._play(scene);
  }
  // Animates the fade out.
  async _play(scene) {
    let base_alphas = [];
    let mobjects = [];
    for (let j = 0; j < this.mobj_names.length; j++) {
      let mobj = scene.get_mobj(this.mobj_names[j]);
      mobjects.push(mobj);
      base_alphas.push(Number(mobj.alpha));
    }
    for (let i = 1; i <= this.num_frames; i++) {
      this._play_frame(scene, i, mobjects, base_alphas);
      await delay(this.frame_length);
      scene.draw();
    }
    for (let m of this.mobj_names) {
      scene.remove(m);
    }
  }
  async _play_frame(scene, i, mobjects, base_alphas) {
    for (let j = 0; j < this.mobj_names.length; j++) {
      let alpha = (1 - i / this.num_frames) * base_alphas[j];
      mobjects[j].set_alpha(alpha);
    }
  }
};
var MoveBy = class extends FixedLengthAnimation {
  constructor(mobj_name, translate_vec, num_frames) {
    super(num_frames);
    this.mobj_name = mobj_name;
    this.translate_vec = translate_vec;
  }
  async _play_frame(scene, i) {
    let tv;
    let s = DEFAULT_RATE_FUNC(i / this.num_frames) - DEFAULT_RATE_FUNC((i - 1) / this.num_frames);
    if (isVec2D(this.translate_vec)) {
      tv = vec2_scale(this.translate_vec, s);
    } else if (isVec3D(this.translate_vec)) {
      tv = vec3_scale(this.translate_vec, s);
    } else {
      throw new Error("Invalid translation vector");
    }
    scene.get_mobj(this.mobj_name).move_by(tv);
  }
};
var Homothety = class extends FixedLengthAnimation {
  constructor(mobj_name, mobj, center, scale, num_frames) {
    super(num_frames);
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.center = center;
    this.scales = funspace(
      (x) => Math.exp(Math.log(scale) * DEFAULT_RATE_FUNC(x)),
      0,
      1,
      this.num_frames + 1
    );
  }
  // Animates the fade in.
  async _play(scene) {
    scene.add(this.mobj_name, this.mobj);
    await super._play(scene);
  }
  _get_scale_factor(i) {
    return this.scales[i] / this.scales[i - 1];
  }
  async _play_frame(scene, i) {
    scene.get_mobj(this.mobj_name).homothety_around(this.center, this._get_scale_factor(i));
  }
};
var ChangeParameterSmoothly = class extends FixedLengthAnimation {
  constructor(parameter, to_val, num_frames) {
    super(num_frames);
    this.rate_func = DEFAULT_RATE_FUNC;
    this.parameter = parameter;
    this.init_val = parameter.get_value();
    this.to_val = to_val;
  }
  set_rate_func(rate_func) {
    this.rate_func = rate_func;
    return this;
  }
  async _play_frame(scene, i) {
    this.parameter.set_value(
      this.init_val + this.rate_func(i / this.num_frames) * (this.to_val - this.init_val)
    );
  }
};
var Emphasize = class extends Animation {
  constructor(mobj_name, mobj, num_frames) {
    super();
    this.num_lines = 8;
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.center = mobj.get_center();
    this.radius = mobj.get_radius();
    this.num_frames = num_frames;
  }
  set_num_lines(n) {
    this.num_lines = n;
    return this;
  }
  async _play(scene) {
    for (let theta = 0; theta < this.num_lines; theta++) {
      scene.add(
        `l_${theta}`,
        new Line(
          this.center,
          vec2_sum(
            this.center,
            vec2_polar_form(
              this.radius,
              theta / this.num_lines * 2 * Math.PI
            )
          )
        ).set_stroke_width(0.02)
      );
    }
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(this.frame_length);
      scene.draw();
    }
    for (let theta = 0; theta < this.num_lines; theta++) {
      scene.remove(`l_${theta}`);
    }
  }
  async _play_frame(scene, i) {
    for (let theta = 0; theta < this.num_lines; theta++) {
      scene.get_mobj(`l_${theta}`).move_start(
        vec2_sum(
          this.center,
          vec2_polar_form(
            3 * this.radius * Math.max(0, 1.5 * (i / this.num_frames) - 0.5),
            theta / this.num_lines * 2 * Math.PI
          )
        )
      ).move_end(
        vec2_sum(
          this.center,
          vec2_polar_form(
            3 * this.radius * Math.min(1, 1.5 * (i / this.num_frames)),
            theta / this.num_lines * 2 * Math.PI
          )
        )
      );
    }
  }
};
var GrowLineFromMidpoint = class extends Animation {
  constructor(mobj_name, mobj, num_frames) {
    super();
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.start = mobj.start;
    this.end = mobj.end;
    this.num_frames = num_frames;
  }
  async _play(scene) {
    scene.add(this.mobj_name, this.mobj);
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(this.frame_length);
      scene.draw();
    }
  }
  async _play_frame(scene, i) {
    let line = scene.get_mobj(this.mobj_name);
    line.move_end(
      vec2_sum(
        this.start,
        vec2_scale(
          vec2_sub(this.end, this.start),
          0.5 * (1 + DEFAULT_RATE_FUNC(i / this.num_frames))
        )
      )
    );
    line.move_start(
      vec2_sum(
        this.start,
        vec2_scale(
          vec2_sub(this.end, this.start),
          0.5 * (1 - DEFAULT_RATE_FUNC(i / this.num_frames))
        )
      )
    );
  }
};

// rust-calc/pkg/rust_calc.js
var rust_calc_exports = {};
__export(rust_calc_exports, {
  HeatSimSphere: () => HeatSimSphere,
  HeatSimTwoDim: () => HeatSimTwoDim,
  SmoothOpenPathBezierHandleCalculator: () => SmoothOpenPathBezierHandleCalculator,
  WaveSimOneDim: () => WaveSimOneDim,
  WaveSimTwoDim: () => WaveSimTwoDim,
  WaveSimTwoDimElliptical: () => WaveSimTwoDimElliptical,
  default: () => __wbg_init,
  initSync: () => initSync
});
var HeatSimSphere = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    HeatSimSphereFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_heatsimsphere_free(ptr, 0);
  }
  /**
   * @param {number} theta
   * @param {number} amplitude
   */
  add_latitude_source(theta, amplitude) {
    wasm.heatsimsphere_add_latitude_source(this.__wbg_ptr, theta, amplitude);
  }
  /**
   * @param {number} phi
   * @param {number} amplitude
   */
  add_longitude_source(phi, amplitude) {
    wasm.heatsimsphere_add_longitude_source(this.__wbg_ptr, phi, amplitude);
  }
  /**
   * @param {number} theta
   * @param {number} phi
   * @param {number} amplitude
   */
  add_point_source(theta, phi, amplitude) {
    wasm.heatsimsphere_add_point_source(this.__wbg_ptr, theta, phi, amplitude);
  }
  /**
   * @returns {Float64Array}
   */
  get_drawable() {
    const ret = wasm.heatsimsphere_get_drawable(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get_dt() {
    const ret = wasm.heatsimsphere_get_dt(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get_time() {
    const ret = wasm.heatsimsphere_get_time(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_uValues() {
    const ret = wasm.heatsimsphere_get_uValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} index
   * @param {number} amplitude
   */
  modify_latitude_source_amplitude(index, amplitude) {
    wasm.heatsimsphere_modify_latitude_source_amplitude(this.__wbg_ptr, index, amplitude);
  }
  /**
   * @param {number} index
   * @param {number} theta
   */
  modify_latitude_source_theta(index, theta) {
    wasm.heatsimsphere_modify_latitude_source_theta(this.__wbg_ptr, index, theta);
  }
  /**
   * @param {number} index
   * @param {number} amplitude
   */
  modify_longitude_source_amplitude(index, amplitude) {
    wasm.heatsimsphere_modify_longitude_source_amplitude(this.__wbg_ptr, index, amplitude);
  }
  /**
   * @param {number} index
   * @param {number} phi
   */
  modify_longitude_source_phi(index, phi) {
    wasm.heatsimsphere_modify_longitude_source_phi(this.__wbg_ptr, index, phi);
  }
  /**
   * @param {number} index
   * @param {number} amplitude
   */
  modify_point_source_amplitude(index, amplitude) {
    wasm.heatsimsphere_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
  }
  /**
   * @param {number} index
   * @param {number} phi
   */
  modify_point_source_phi(index, phi) {
    wasm.heatsimsphere_modify_point_source_phi(this.__wbg_ptr, index, phi);
  }
  /**
   * @param {number} index
   * @param {number} theta
   */
  modify_point_source_theta(index, theta) {
    wasm.heatsimsphere_modify_point_source_theta(this.__wbg_ptr, index, theta);
  }
  /**
   * @param {number} num_theta
   * @param {number} num_phi
   * @param {number} dt
   */
  constructor(num_theta, num_phi, dt) {
    const ret = wasm.heatsimsphere_new(num_theta, num_phi, dt);
    this.__wbg_ptr = ret >>> 0;
    HeatSimSphereFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  reset() {
    wasm.heatsimsphere_reset(this.__wbg_ptr);
  }
  /**
   * @param {string} name
   * @param {number} val
   */
  set_attr(name, val) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.heatsimsphere_set_attr(this.__wbg_ptr, ptr0, len0, val);
  }
  step() {
    wasm.heatsimsphere_step(this.__wbg_ptr);
  }
};
if (Symbol.dispose) HeatSimSphere.prototype[Symbol.dispose] = HeatSimSphere.prototype.free;
var HeatSimTwoDim = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    HeatSimTwoDimFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_heatsimtwodim_free(ptr, 0);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} amplitude
   */
  add_point_source(x, y, amplitude) {
    wasm.heatsimtwodim_add_point_source(this.__wbg_ptr, x, y, amplitude);
  }
  /**
   * @returns {number}
   */
  get_dt() {
    const ret = wasm.heatsimtwodim_get_dt(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get_time() {
    const ret = wasm.heatsimtwodim_get_time(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_uValues() {
    const ret = wasm.heatsimtwodim_get_uValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} index
   * @param {number} amplitude
   */
  modify_point_source_amplitude(index, amplitude) {
    wasm.heatsimtwodim_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
  }
  /**
   * @param {number} index
   * @param {number} x
   */
  modify_point_source_x(index, x) {
    wasm.heatsimtwodim_modify_point_source_x(this.__wbg_ptr, index, x);
  }
  /**
   * @param {number} index
   * @param {number} y
   */
  modify_point_source_y(index, y) {
    wasm.heatsimtwodim_modify_point_source_y(this.__wbg_ptr, index, y);
  }
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} dt
   */
  constructor(width, height, dt) {
    const ret = wasm.heatsimtwodim_new(width, height, dt);
    this.__wbg_ptr = ret >>> 0;
    HeatSimTwoDimFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  reset() {
    wasm.heatsimtwodim_reset(this.__wbg_ptr);
  }
  /**
   * @param {string} name
   * @param {number} val
   */
  set_attr(name, val) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.heatsimtwodim_set_attr(this.__wbg_ptr, ptr0, len0, val);
  }
  step() {
    wasm.heatsimtwodim_step(this.__wbg_ptr);
  }
};
if (Symbol.dispose) HeatSimTwoDim.prototype[Symbol.dispose] = HeatSimTwoDim.prototype.free;
var SmoothOpenPathBezierHandleCalculator = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SmoothOpenPathBezierHandleCalculatorFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_smoothopenpathbezierhandlecalculator_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get n() {
    const ret = wasm.__wbg_get_smoothopenpathbezierhandlecalculator_n(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @param {number} arg0
   */
  set n(arg0) {
    wasm.__wbg_set_smoothopenpathbezierhandlecalculator_n(this.__wbg_ptr, arg0);
  }
  /**
   * @param {Float64Array} anchors
   * @returns {Float64Array}
   */
  get_bezier_handles(anchors) {
    const ret = wasm.smoothopenpathbezierhandlecalculator_get_bezier_handles(this.__wbg_ptr, anchors);
    return ret;
  }
  /**
   * @param {number} n
   */
  constructor(n) {
    const ret = wasm.smoothopenpathbezierhandlecalculator_new(n);
    this.__wbg_ptr = ret >>> 0;
    SmoothOpenPathBezierHandleCalculatorFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
};
if (Symbol.dispose) SmoothOpenPathBezierHandleCalculator.prototype[Symbol.dispose] = SmoothOpenPathBezierHandleCalculator.prototype.free;
var WaveSimOneDim = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WaveSimOneDimFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wavesimonedim_free(ptr, 0);
  }
  /**
   * @param {number} x
   * @param {number} frequency
   * @param {number} amplitude
   * @param {number} phase
   */
  add_point_source(x, frequency, amplitude, phase) {
    wasm.wavesimonedim_add_point_source(this.__wbg_ptr, x, frequency, amplitude, phase);
  }
  /**
   * @returns {number}
   */
  get_dt() {
    const ret = wasm.wavesimonedim_get_dt(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get_time() {
    const ret = wasm.wavesimonedim_get_time(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_uValues() {
    const ret = wasm.wavesimonedim_get_uValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_vValues() {
    const ret = wasm.wavesimonedim_get_vValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} index
   * @param {number} amplitude
   */
  modify_point_source_amplitude(index, amplitude) {
    wasm.wavesimonedim_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
  }
  /**
   * @param {number} index
   * @param {number} frequency
   */
  modify_point_source_frequency(index, frequency) {
    wasm.wavesimonedim_modify_point_source_frequency(this.__wbg_ptr, index, frequency);
  }
  /**
   * @param {number} index
   * @param {number} phase
   */
  modify_point_source_phase(index, phase) {
    wasm.wavesimonedim_modify_point_source_phase(this.__wbg_ptr, index, phase);
  }
  /**
   * @param {number} index
   * @param {number} x
   */
  modify_point_source_x(index, x) {
    wasm.wavesimonedim_modify_point_source_x(this.__wbg_ptr, index, x);
  }
  /**
   * @param {number} width
   * @param {number} dt
   */
  constructor(width, dt) {
    const ret = wasm.wavesimonedim_new(width, dt);
    this.__wbg_ptr = ret >>> 0;
    WaveSimOneDimFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  reset() {
    wasm.wavesimonedim_reset(this.__wbg_ptr);
  }
  /**
   * @param {Float64Array} vals
   */
  reset_to(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedim_reset_to(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @param {string} name
   * @param {number} val
   */
  set_attr(name, val) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedim_set_attr(this.__wbg_ptr, ptr0, len0, val);
  }
  step() {
    wasm.wavesimonedim_step(this.__wbg_ptr);
  }
};
if (Symbol.dispose) WaveSimOneDim.prototype[Symbol.dispose] = WaveSimOneDim.prototype.free;
var WaveSimTwoDim = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WaveSimTwoDimFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wavesimtwodim_free(ptr, 0);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} frequency
   * @param {number} amplitude
   * @param {number} phase
   */
  add_point_source(x, y, frequency, amplitude, phase) {
    wasm.wavesimtwodim_add_point_source(this.__wbg_ptr, x, y, frequency, amplitude, phase);
  }
  /**
   * @returns {number}
   */
  get_dt() {
    const ret = wasm.wavesimtwodim_get_dt(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get_time() {
    const ret = wasm.wavesimtwodim_get_time(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_uValues() {
    const ret = wasm.wavesimtwodim_get_uValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_vValues() {
    const ret = wasm.wavesimtwodim_get_vValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} index
   * @param {number} amplitude
   */
  modify_point_source_amplitude(index, amplitude) {
    wasm.wavesimtwodim_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
  }
  /**
   * @param {number} index
   * @param {number} frequency
   */
  modify_point_source_frequency(index, frequency) {
    wasm.wavesimtwodim_modify_point_source_frequency(this.__wbg_ptr, index, frequency);
  }
  /**
   * @param {number} index
   * @param {number} phase
   */
  modify_point_source_phase(index, phase) {
    wasm.wavesimtwodim_modify_point_source_phase(this.__wbg_ptr, index, phase);
  }
  /**
   * @param {number} index
   * @param {number} x
   */
  modify_point_source_x(index, x) {
    wasm.wavesimtwodim_modify_point_source_x(this.__wbg_ptr, index, x);
  }
  /**
   * @param {number} index
   * @param {number} y
   */
  modify_point_source_y(index, y) {
    wasm.wavesimtwodim_modify_point_source_y(this.__wbg_ptr, index, y);
  }
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} dt
   */
  constructor(width, height, dt) {
    const ret = wasm.wavesimtwodim_new(width, height, dt);
    this.__wbg_ptr = ret >>> 0;
    WaveSimTwoDimFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  remove_pml_layers() {
    wasm.wavesimtwodim_remove_pml_layers(this.__wbg_ptr);
  }
  reset() {
    wasm.wavesimtwodim_reset(this.__wbg_ptr);
  }
  /**
   * @param {string} name
   * @param {number} val
   */
  set_attr(name, val) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimtwodim_set_attr(this.__wbg_ptr, ptr0, len0, val);
  }
  /**
   * @param {boolean} x_direction
   * @param {boolean} positive
   * @param {number} width
   * @param {number} strength
   */
  set_pml_layer(x_direction, positive, width, strength) {
    wasm.wavesimtwodim_set_pml_layer(this.__wbg_ptr, x_direction, positive, width, strength);
  }
  step() {
    wasm.wavesimtwodim_step(this.__wbg_ptr);
  }
};
if (Symbol.dispose) WaveSimTwoDim.prototype[Symbol.dispose] = WaveSimTwoDim.prototype.free;
var WaveSimTwoDimElliptical = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WaveSimTwoDimEllipticalFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wavesimtwodimelliptical_free(ptr, 0);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} frequency
   * @param {number} amplitude
   * @param {number} phase
   */
  add_point_source(x, y, frequency, amplitude, phase) {
    wasm.wavesimtwodimelliptical_add_point_source(this.__wbg_ptr, x, y, frequency, amplitude, phase);
  }
  /**
   * @returns {number}
   */
  get_dt() {
    const ret = wasm.wavesimtwodimelliptical_get_dt(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} index
   * @returns {number}
   */
  get_focus_x(index) {
    const ret = wasm.wavesimtwodimelliptical_get_focus_x(this.__wbg_ptr, index);
    return ret >>> 0;
  }
  /**
   * @param {number} index
   * @returns {number}
   */
  get_focus_y(index) {
    const ret = wasm.wavesimtwodimelliptical_get_focus_y(this.__wbg_ptr, index);
    return ret >>> 0;
  }
  /**
   * @returns {number}
   */
  get_semimajor_axis() {
    const ret = wasm.wavesimtwodimelliptical_get_semimajor_axis(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @returns {number}
   */
  get_semiminor_axis() {
    const ret = wasm.wavesimtwodimelliptical_get_semiminor_axis(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @returns {number}
   */
  get_time() {
    const ret = wasm.wavesimtwodimelliptical_get_time(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_uValues() {
    const ret = wasm.wavesimtwodimelliptical_get_uValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_vValues() {
    const ret = wasm.wavesimtwodimelliptical_get_vValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} index
   * @param {number} amplitude
   */
  modify_point_source_amplitude(index, amplitude) {
    wasm.wavesimtwodimelliptical_modify_point_source_amplitude(this.__wbg_ptr, index, amplitude);
  }
  /**
   * @param {number} index
   * @param {number} frequency
   */
  modify_point_source_frequency(index, frequency) {
    wasm.wavesimtwodimelliptical_modify_point_source_frequency(this.__wbg_ptr, index, frequency);
  }
  /**
   * @param {number} index
   * @param {number} phase
   */
  modify_point_source_phase(index, phase) {
    wasm.wavesimtwodimelliptical_modify_point_source_phase(this.__wbg_ptr, index, phase);
  }
  /**
   * @param {number} index
   * @param {number} x
   */
  modify_point_source_x(index, x) {
    wasm.wavesimtwodimelliptical_modify_point_source_x(this.__wbg_ptr, index, x);
  }
  /**
   * @param {number} index
   * @param {number} y
   */
  modify_point_source_y(index, y) {
    wasm.wavesimtwodimelliptical_modify_point_source_y(this.__wbg_ptr, index, y);
  }
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} dt
   */
  constructor(width, height, dt) {
    const ret = wasm.wavesimtwodimelliptical_new(width, height, dt);
    this.__wbg_ptr = ret >>> 0;
    WaveSimTwoDimEllipticalFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  recalculate_masks() {
    wasm.wavesimtwodimelliptical_recalculate_masks(this.__wbg_ptr);
  }
  remove_pml_layers() {
    wasm.wavesimtwodimelliptical_remove_pml_layers(this.__wbg_ptr);
  }
  reset() {
    wasm.wavesimtwodimelliptical_reset(this.__wbg_ptr);
  }
  /**
   * @param {string} name
   * @param {number} val
   */
  set_attr(name, val) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimtwodimelliptical_set_attr(this.__wbg_ptr, ptr0, len0, val);
  }
  /**
   * @param {boolean} x_direction
   * @param {boolean} positive
   * @param {number} width
   * @param {number} strength
   */
  set_pml_layer(x_direction, positive, width, strength) {
    wasm.wavesimtwodimelliptical_set_pml_layer(this.__wbg_ptr, x_direction, positive, width, strength);
  }
  step() {
    wasm.wavesimtwodimelliptical_step(this.__wbg_ptr);
  }
};
if (Symbol.dispose) WaveSimTwoDimElliptical.prototype[Symbol.dispose] = WaveSimTwoDimElliptical.prototype.free;
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg___wbindgen_throw_89ca9e2c67795ec1: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg_length_57aa70d8471ff229: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_new_from_slice_42c6e17e5e805f45: function(arg0, arg1) {
      const ret = new Float64Array(getArrayF64FromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_prototypesetcall_e26af6f1b2474b2b: function(arg0, arg1, arg2) {
      Float64Array.prototype.set.call(getArrayF64FromWasm0(arg0, arg1), arg2);
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    }
  };
  return {
    __proto__: null,
    "./rust_calc_bg.js": import0
  };
}
var HeatSimSphereFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_heatsimsphere_free(ptr >>> 0, 1));
var HeatSimTwoDimFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_heatsimtwodim_free(ptr >>> 0, 1));
var SmoothOpenPathBezierHandleCalculatorFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_smoothopenpathbezierhandlecalculator_free(ptr >>> 0, 1));
var WaveSimOneDimFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_wavesimonedim_free(ptr >>> 0, 1));
var WaveSimTwoDimFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_wavesimtwodim_free(ptr >>> 0, 1));
var WaveSimTwoDimEllipticalFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_wavesimtwodimelliptical_free(ptr >>> 0, 1));
function getArrayF64FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
var cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
  if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
    cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function passArrayF64ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 8, 8) >>> 0;
  getFloat64ArrayMemory0().set(arg, ptr / 8);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasm;
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  wasmModule = module;
  cachedFloat64ArrayMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("rust_calc_bg.wasm", "");
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}

// src/rust-calc-browser.ts
var isInitialized = false;
async function initWasm() {
  if (!isInitialized) {
    if (typeof __wbg_init === "function") {
      await __wbg_init("./rust_calc_bg.wasm");
    }
    isInitialized = true;
  }
}
async function createSmoothOpenPathBezier(n) {
  await initWasm();
  if (!SmoothOpenPathBezierHandleCalculator) {
    throw new Error(
      "SmoothOpenPathBezierHandleCalculator not found in rust-calc exports"
    );
  }
  const SmoothOpenPathBezierHandleCalculator2 = SmoothOpenPathBezierHandleCalculator;
  let instance;
  try {
    instance = new SmoothOpenPathBezierHandleCalculator2(n);
    console.log(
      "SmoothOpenPathBezierHandleCalculator instance created:",
      instance
    );
  } catch (error) {
    console.error(
      "Failed to create or initialize SmoothOpenPathBezierHandleCalculator instance:",
      error
    );
    throw error;
  }
  return instance;
}
console.log("rust-calc exports:", Object.keys(rust_calc_exports));

// src/lib/math/conics.ts
var CartEq = class _CartEq {
  constructor(c_xx, c_xy, c_yy, c_x, c_y, c) {
    this.c_xx = 1;
    this.c_xy = 0;
    this.c_yy = 1;
    this.c_x = 0;
    this.c_y = 0;
    this.c = -1;
    this.c_xx = c_xx;
    this.c_xy = c_xy;
    this.c_yy = c_yy;
    this.c_x = c_x;
    this.c_y = c_y;
    this.c = c;
  }
  clone() {
    return new _CartEq(
      this.c_xx,
      this.c_xy,
      this.c_yy,
      this.c_x,
      this.c_y,
      this.c
    );
  }
  set_c_xx(c) {
    this.c_xx = c;
    return this;
  }
  set_c_xy(c) {
    this.c_xy = c;
    return this;
  }
  set_c_yy(c) {
    this.c_yy = c;
    return this;
  }
  set_c_x(c) {
    this.c_x = c;
    return this;
  }
  set_c_y(c) {
    this.c_y = c;
    return this;
  }
  set_c(c) {
    this.c = c;
    return this;
  }
  rotate(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    let c_xx = this.c_xx * c ** 2 + this.c_yy * s ** 2 - this.c_xy * c * s;
    let c_yy = this.c_yy * c ** 2 + this.c_xx * s ** 2 + this.c_xy * c * s;
    let c_xy = (this.c_xx - this.c_yy) * Math.sin(2 * theta) + this.c_xy * Math.cos(2 * theta);
    [this.c_xx, this.c_xy, this.c_yy] = [c_xx, c_xy, c_yy];
    let c_x = this.c_x * c - this.c_y * s;
    let c_y = this.c_x * s + this.c_y * c;
    [this.c_x, this.c_y] = [c_x, c_y];
  }
  translate_x(a) {
    let c = this.c - a * this.c_x + a ** 2 * this.c_xx;
    let c_x = this.c_x - 2 * a * this.c_xx;
    let c_y = this.c_y - a * this.c_xy;
    this.c = c;
    this.c_x = c_x;
    this.c_y = c_y;
  }
  translate_y(a) {
    let c = this.c - a * this.c_y + a ** 2 * this.c_yy;
    let c_y = this.c_y - 2 * a * this.c_yy;
    let c_x = this.c_x - a * this.c_xy;
    this.c = c;
    this.c_x = c_x;
    this.c_y = c_y;
  }
  // Converts the Cartesian form to polar form.
  // TODO There is an error in here somewhere. Trace through carefully.
  to_polar() {
    let cart_eq = this.clone();
    let ax, ay;
    let polar_eq;
    let theta;
    if (cart_eq.c_xx == cart_eq.c_yy) {
      theta = Math.PI / 4;
    } else {
      theta = 0.5 * Math.atan(cart_eq.c_xy / (cart_eq.c_xx - cart_eq.c_yy));
    }
    cart_eq.rotate(theta);
    if (Math.abs(cart_eq.c_xy) > 0.01) {
      throw new Error(`c_xy is nonzero, ${cart_eq.c_xy}`);
    }
    if (Math.abs(cart_eq.c_yy) < Math.abs(cart_eq.c_xx)) {
      cart_eq.rotate(Math.PI / 2);
      theta += Math.PI / 2;
    }
    if (Math.abs(cart_eq.c_xx) > Math.abs(cart_eq.c_yy)) {
      throw new Error(
        `|c_xx| is greater than |c_yy|, ${cart_eq.c_xx}, ${cart_eq.c_yy}`
      );
    }
    ay = cart_eq.c_y / (2 * cart_eq.c_yy);
    cart_eq.translate_y(ay);
    if (Math.abs(cart_eq.c_y) > 0.01) {
      throw new Error(`c_y is nonzero, ${cart_eq.c_y}`);
    }
    if (cart_eq.c_xx == 0) {
      ax = cart_eq.c / cart_eq.c_x;
      cart_eq.translate_x(ax);
      if (Math.abs(cart_eq.c) > 0.01) {
        throw new Error(`c is nonzero, ${cart_eq.c}`);
      }
      let m = -cart_eq.c_yy / cart_eq.c_x;
      if (m > 0) {
        polar_eq = new PolarEq([0.25 / m, 0], 1, 0.5 / m, Math.PI);
      } else {
        polar_eq = new PolarEq([0.25 / m, 0], 1, -0.5 / m, 0);
      }
    } else {
      ax = cart_eq.c_x / (2 * cart_eq.c_xx);
      cart_eq.translate_x(ax);
      if (Math.abs(cart_eq.c_x) > 0.01) {
        throw new Error(`c_x is nonzero, ${cart_eq.c_x}`);
      }
      if (cart_eq.c_xx * cart_eq.c_yy > 0) {
        if (cart_eq.c_xx * cart_eq.c > 0) {
          return new PolarEq([1e3, 1e3], 0, 0, 0);
        }
        let a = Math.sqrt(-cart_eq.c / cart_eq.c_xx);
        let b = Math.sqrt(-cart_eq.c / cart_eq.c_yy);
        if (a == b) {
          polar_eq = new PolarEq([0, 0], 0, a, 0);
        } else {
          let half_focal_length = Math.sqrt(a ** 2 - b ** 2);
          polar_eq = new PolarEq(
            [half_focal_length, 0],
            half_focal_length / a,
            b ** 2 / a,
            0
          );
        }
      } else {
        if (cart_eq.c_xx < 0) {
          cart_eq.rotate(Math.PI / 2);
          theta += Math.PI / 2;
        }
        if (cart_eq.c_xx < 0) {
          throw new Error(`c_xx is negative, ${cart_eq.c_xx}`);
        }
        let a = Math.sqrt(-cart_eq.c / cart_eq.c_xx);
        let b = Math.sqrt(cart_eq.c / cart_eq.c_yy);
        let half_focal_length = Math.sqrt(a ** 2 + b ** 2);
        polar_eq = new PolarEq(
          [-half_focal_length, 0],
          half_focal_length / a,
          b ** 2 / a,
          0
        );
      }
    }
    polar_eq.translate_x(-ax);
    polar_eq.translate_y(-ay);
    polar_eq.rotate(-theta);
    return polar_eq;
  }
};
var PolarEq = class {
  constructor(focus, e, c, theta_0) {
    this.focus = [0, 0];
    this.e = 0;
    this.c = 1;
    this.theta_0 = 0;
    this.focus = focus;
    this.e = e;
    this.c = c;
    this.theta_0 = theta_0;
  }
  param(t) {
    return vec2_sum(
      this.focus,
      vec2_polar_form(this.c / (1 + this.e * Math.cos(t - this.theta_0)), t)
    );
  }
  set_focus(f) {
    this.focus = f;
    return this;
  }
  set_e(e) {
    this.e = e;
    return this;
  }
  set_c(c) {
    this.c = c;
    return this;
  }
  set_theta_0(theta_0) {
    this.theta_0 = theta_0;
    return this;
  }
  // Rotate counterclockwise by theta around the origin
  rotate(theta) {
    this.theta_0 += theta;
    this.focus = vec2_rot(this.focus, theta);
  }
  translate_x(a) {
    this.focus = vec2_sum(this.focus, [a, 0]);
  }
  translate_y(a) {
    this.focus = vec2_sum(this.focus, [0, a]);
  }
};
var DISCONTINUITY_BUFFER = 5e-3;
function trivial_function(t) {
  return [1e3, 1e3];
}
var ConicSection = class extends MultipleBranchParametricFunction {
  constructor(cart_eq, polar_eq, num_steps, solver) {
    super(num_steps, solver);
    this.cart_eq = cart_eq;
    this.polar_eq = polar_eq;
    if (polar_eq.e < 1) {
      super.add_branch(polar_eq.param.bind(polar_eq), [0, 2 * Math.PI]);
      super.add_branch(trivial_function, [0, 0]);
    } else {
      let a = Math.acos(-1 / polar_eq.e);
      let d1 = polar_eq.theta_0 + a;
      let d0 = polar_eq.theta_0 - a;
      super.add_branch(polar_eq.param.bind(polar_eq), [
        d0 + DISCONTINUITY_BUFFER,
        d1 - DISCONTINUITY_BUFFER
      ]);
      super.add_branch(polar_eq.param.bind(polar_eq), [
        d1 + DISCONTINUITY_BUFFER,
        d0 - DISCONTINUITY_BUFFER + 2 * Math.PI
      ]);
    }
  }
  _update() {
    this.polar_eq = this.cart_eq.to_polar();
    if (this.polar_eq.e < 1) {
      super.set_function(this.polar_eq.param.bind(this.polar_eq), 0);
      super.set_lims(0, 2 * Math.PI, 0);
      super.set_function(trivial_function, 1);
      super.set_lims(0, 0, 1);
    } else {
      let a = Math.acos(-1 / this.polar_eq.e);
      let d1 = this.polar_eq.theta_0 + a;
      let d0 = this.polar_eq.theta_0 - a;
      super.set_function(this.polar_eq.param.bind(this.polar_eq), 0);
      super.set_lims(d0 + DISCONTINUITY_BUFFER, d1 - DISCONTINUITY_BUFFER, 0);
      super.set_function(this.polar_eq.param.bind(this.polar_eq), 1);
      super.set_lims(
        d1 + DISCONTINUITY_BUFFER,
        d0 - DISCONTINUITY_BUFFER + 2 * Math.PI,
        1
      );
    }
    this.set_function(this.polar_eq.param.bind(this.polar_eq), 0);
  }
  set_coeffs(c_xx, c_xy, c_yy, c_x, c_y, c) {
    this.cart_eq.set_c_xx(c_xx);
    this.cart_eq.set_c_xy(c_xy);
    this.cart_eq.set_c_yy(c_yy);
    this.cart_eq.set_c_x(c_x);
    this.cart_eq.set_c_y(c_y);
    this.cart_eq.set_c(c);
    this._update();
  }
};

// src/lib/vectorized/svg_loader.ts
var SVGLoader = class {
  /**
   * Load SVG from a URL
   */
  static async loadFromURL(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.status}`);
    }
    return await response.text();
  }
  /**
   * Load SVG from a File object (from file input)
   */
  static async loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }
  /**
   * Parse SVG string to DOM element
   */
  static parseSVG(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const error = doc.querySelector("parsererror");
    if (error) {
      throw new Error("Failed to parse SVG");
    }
    return doc.documentElement;
  }
  /**
   * Extract all path data from SVG
   */
  static extractPaths(svgElement) {
    const paths = [];
    const getStyle = (element, property) => {
      const style = window.getComputedStyle(element);
      return style.getPropertyValue(property);
    };
    const parseTransform = (transform) => {
      if (!transform) return {};
      try {
        const svgNS = "http://www.w3.org/2000/svg";
        const tempSvg = document.createElementNS(svgNS, "svg");
        const tempPath = document.createElementNS(svgNS, "path");
        tempSvg.appendChild(tempPath);
        document.body.appendChild(tempSvg);
        tempPath.setAttribute("transform", transform);
        const matrix = tempPath.getCTM();
        document.body.removeChild(tempSvg);
        if (matrix) {
          return {
            matrix,
            translation: { x: matrix.e, y: matrix.f }
          };
        }
      } catch (error) {
        console.warn("Failed to parse transform:", transform, error);
      }
      return {};
    };
    const extractPathsFromElement = (element, parentTransform = "") => {
      const elementTransform = element.getAttribute("transform") || "";
      const combinedTransform = parentTransform ? elementTransform ? `${parentTransform} ${elementTransform}` : parentTransform : elementTransform;
      if (element.tagName === "path") {
        const pathData = element.getAttribute("d");
        if (pathData) {
          const fill = element.getAttribute("fill") || getStyle(element, "fill") || "black";
          const stroke = element.getAttribute("stroke") || getStyle(element, "stroke") || "black";
          let strokeWidth = element.getAttribute("stroke-width") || getStyle(element, "stroke-width") || "1";
          strokeWidth = strokeWidth.replace("px", "");
          const transformInfo = parseTransform(combinedTransform);
          let bbox;
          try {
            if (element instanceof SVGPathElement) {
              bbox = element.getBBox();
            }
          } catch (error) {
          }
          paths.push({
            data: pathData,
            fill,
            stroke,
            strokeWidth: Number(strokeWidth),
            transform: combinedTransform,
            transformMatrix: transformInfo.matrix,
            translation: transformInfo.translation,
            bbox
          });
        }
      }
      const children = element.children;
      for (let i = 0; i < children.length; i++) {
        extractPathsFromElement(children[i], combinedTransform);
      }
    };
    extractPathsFromElement(svgElement);
    return paths;
  }
  /**
   * Convert SVG path to points (simplified - only handles M, L, H, V, Z commands)
   */
  static pathToPoints(pathData) {
    const points = [];
    const commands = this.parsePathCommands(pathData);
    let x = 0;
    let y = 0;
    for (const cmd of commands) {
      switch (cmd.type.toUpperCase()) {
        case "M":
          if (cmd.values.length >= 2) {
            x = cmd.type === "M" ? cmd.values[0] : x + cmd.values[0];
            y = cmd.type === "M" ? cmd.values[1] : y + cmd.values[1];
            points.push({ x, y });
          }
          break;
        case "L":
          if (cmd.values.length >= 2) {
            x = cmd.type === "L" ? cmd.values[0] : x + cmd.values[0];
            y = cmd.type === "L" ? cmd.values[1] : y + cmd.values[1];
            points.push({ x, y });
          }
          break;
        case "H":
          if (cmd.values.length >= 1) {
            x = cmd.type === "H" ? cmd.values[0] : x + cmd.values[0];
            points.push({ x, y });
          }
          break;
        case "V":
          if (cmd.values.length >= 1) {
            y = cmd.type === "V" ? cmd.values[0] : y + cmd.values[0];
            points.push({ x, y });
          }
          break;
        case "Z":
          if (points.length > 0) {
            points.push({ ...points[0] });
          }
          break;
      }
    }
    return points;
  }
  /**
   * Parse SVG path commands
   */
  static parsePathCommands(pathData) {
    const commands = [];
    const regex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
    let match;
    while ((match = regex.exec(pathData)) !== null) {
      const type = match[1];
      const values = (match[2].trim().match(/-?\d+(?:\.\d+)?/g) || []).map(
        Number
      );
      commands.push({ type, values });
    }
    return commands;
  }
  static parsePathInfo(pathInfo) {
    return {
      commands: this.parsePathCommands(pathInfo.data),
      fill: pathInfo.fill,
      stroke: pathInfo.stroke,
      strokeWidth: pathInfo.strokeWidth,
      transform: pathInfo.transform,
      transformMatrix: pathInfo.transformMatrix,
      translation: pathInfo.translation,
      bbox: pathInfo.bbox
    };
  }
  /**
   * Draw SVG to canvas
   */
  static drawToCanvas(canvas, svgString, x = 0, y = 0) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No canvas context"));
          return;
        }
        ctx.drawImage(img, x, y);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG"));
      };
      img.src = url;
    });
  }
};
function extractMathJaxPaths(svgElement) {
  const paths = [];
  const defsMap = /* @__PURE__ */ new Map();
  const defs = svgElement.querySelector("defs");
  if (defs) {
    const defPaths = defs.querySelectorAll("path");
    defPaths.forEach((defPath) => {
      const id = defPath.getAttribute("id");
      const d = defPath.getAttribute("d");
      if (id && d) {
        defsMap.set(id, d);
      }
    });
  }
  const getStyle = (element, property) => {
    const style = window.getComputedStyle(element);
    return style.getPropertyValue(property);
  };
  const parseTransform = (transform) => {
    if (!transform) return {};
    try {
      const svgNS = "http://www.w3.org/2000/svg";
      const tempSvg = document.createElementNS(svgNS, "svg");
      const tempElement = document.createElementNS(svgNS, "g");
      tempSvg.appendChild(tempElement);
      document.body.appendChild(tempSvg);
      tempElement.setAttribute("transform", transform);
      const matrix = tempElement.getCTM();
      document.body.removeChild(tempSvg);
      if (matrix) {
        return {
          matrix,
          translation: { x: matrix.e, y: matrix.f }
        };
      }
    } catch (error) {
      console.warn("Failed to parse transform:", transform, error);
    }
    return {};
  };
  const extractElements = (element, parentTransform = "", depth = 0) => {
    const elementTransform = element.getAttribute("transform") || "";
    const combinedTransform = parentTransform ? elementTransform ? `${parentTransform} ${elementTransform}` : parentTransform : elementTransform;
    const semanticType = element.getAttribute("data-semantic-type");
    const semanticRole = element.getAttribute("data-semantic-role");
    const latex = element.getAttribute("data-latex");
    const tagName = element.tagName.toLowerCase();
    if (tagName === "use") {
      const href = element.getAttribute("xlink:href") || element.getAttribute("href");
      if (href && href.startsWith("#")) {
        const defId = href.substring(1);
        const pathData = defsMap.get(defId);
        if (pathData) {
          const parent = element.parentElement;
          const fill = element.getAttribute("fill") || (parent ? parent.getAttribute("fill") : "") || getStyle(element, "fill") || "black";
          const stroke = element.getAttribute("stroke") || (parent ? parent.getAttribute("stroke") : "") || getStyle(element, "stroke") || "black";
          let strokeWidth = element.getAttribute("stroke-width") || (parent ? parent.getAttribute("stroke-width") : "") || getStyle(element, "stroke-width") || "0";
          strokeWidth = strokeWidth.replace("px", "");
          const transformInfo = parseTransform(combinedTransform);
          paths.push({
            data: pathData,
            fill,
            stroke,
            strokeWidth: Number(strokeWidth),
            transform: combinedTransform,
            transformMatrix: transformInfo.matrix,
            translation: transformInfo.translation,
            elementType: "path",
            semanticType,
            semanticRole,
            latex
          });
        }
      }
    } else if (tagName === "path") {
      const pathData = element.getAttribute("d");
      if (pathData) {
        const fill = element.getAttribute("fill") || getStyle(element, "fill") || "black";
        const stroke = element.getAttribute("stroke") || getStyle(element, "stroke") || "black";
        let strokeWidth = element.getAttribute("stroke-width") || getStyle(element, "stroke-width") || "0";
        strokeWidth = strokeWidth.replace("px", "");
        const transformInfo = parseTransform(combinedTransform);
        let bbox;
        try {
          if (element instanceof SVGPathElement) {
            bbox = element.getBBox();
          }
        } catch (error) {
        }
        paths.push({
          data: pathData,
          fill,
          stroke,
          strokeWidth: Number(strokeWidth),
          transform: combinedTransform,
          transformMatrix: transformInfo.matrix,
          translation: transformInfo.translation,
          bbox,
          elementType: "path",
          semanticType,
          semanticRole,
          latex
        });
      }
    } else if (tagName === "rect") {
      const x = parseFloat(element.getAttribute("x") || "0");
      const y = parseFloat(element.getAttribute("y") || "0");
      const width = parseFloat(element.getAttribute("width") || "0");
      const height = parseFloat(element.getAttribute("height") || "0");
      if (width > 0 && height > 0) {
        const pathData = `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;
        const fill = element.getAttribute("fill") || getStyle(element, "fill") || "black";
        const stroke = element.getAttribute("stroke") || getStyle(element, "stroke") || "black";
        let strokeWidth = element.getAttribute("stroke-width") || getStyle(element, "stroke-width") || "0";
        strokeWidth = strokeWidth.replace("px", "");
        const transformInfo = parseTransform(combinedTransform);
        let bbox;
        try {
          if (element instanceof SVGRectElement) {
            bbox = element.getBBox();
          }
        } catch (error) {
          bbox = new DOMRect(x, y, width, height);
        }
        paths.push({
          data: pathData,
          fill,
          stroke,
          strokeWidth: Number(strokeWidth),
          transform: combinedTransform,
          transformMatrix: transformInfo.matrix,
          translation: transformInfo.translation,
          bbox,
          elementType: "rect",
          rectWidth: width,
          rectHeight: height,
          semanticType,
          semanticRole,
          latex
        });
      }
    } else if (tagName === "circle") {
      const cx = parseFloat(element.getAttribute("cx") || "0");
      const cy = parseFloat(element.getAttribute("cy") || "0");
      const r = parseFloat(element.getAttribute("r") || "0");
      if (r > 0) {
        const segments = 8;
        let pathData = `M${cx + r},${cy}`;
        for (let i = 1; i <= segments; i++) {
          const angle = i * 2 * Math.PI / segments;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          pathData += ` L${x},${y}`;
        }
        pathData += " Z";
        const fill = element.getAttribute("fill") || getStyle(element, "fill") || "black";
        const stroke = element.getAttribute("stroke") || getStyle(element, "stroke") || "black";
        let strokeWidth = element.getAttribute("stroke-width") || getStyle(element, "stroke-width") || "0";
        strokeWidth = strokeWidth.replace("px", "");
        const transformInfo = parseTransform(combinedTransform);
        paths.push({
          data: pathData,
          fill,
          stroke,
          strokeWidth: Number(strokeWidth),
          transform: combinedTransform,
          transformMatrix: transformInfo.matrix,
          translation: transformInfo.translation,
          elementType: "circle",
          radius: r,
          semanticType,
          semanticRole,
          latex
        });
      }
    }
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      extractElements(children[i], combinedTransform, depth + 1);
    }
  };
  const mainGroup = svgElement.querySelector("g[stroke][fill]") || svgElement;
  extractElements(mainGroup);
  return paths;
}

// src/lib/vectorized/svg_mobject.ts
var FILL_DELAY = 0.9;
var SVGMObject = class extends FillLikeMObject {
};
var SVGPath = class _SVGPath {
  constructor() {
    // Bezier segments that make up the path.
    this.bezier_segments = [];
    // Number between 0 and 1 indicating how far along the path to draw.
    this.progress = 1;
    // x limits and y limits of the path, used for setting a bounding box and sizing.
    this.xmin = Infinity;
    this.xmax = -Infinity;
    this.ymin = Infinity;
    this.ymax = -Infinity;
  }
  set_progress(p) {
    this.progress = p;
  }
  clone() {
    let clone = new _SVGPath();
    clone.bezier_segments = this.bezier_segments.slice();
    clone.progress = this.progress;
    clone.xmin = this.xmin;
    clone.xmax = this.xmax;
    clone.ymin = this.ymin;
    clone.ymax = this.ymax;
    return clone;
  }
  // Adds a new single cubic Bezier segment to the path. Typically the segment
  // will be given in ctx coordinates, and will be transformed to scene coordinates
  // here by x -> Ax + b
  add_segment(segment, transformMatrix, translate = [0, 0]) {
    const scaled_segment = segment.map(
      (p) => vec2_sum(matmul_vec2(transformMatrix, p), translate)
    );
    this.bezier_segments.push(scaled_segment);
    this.xmin = Math.min(
      this.xmin,
      scaled_segment[0][0],
      scaled_segment[1][0],
      scaled_segment[2][0],
      scaled_segment[3][0]
    );
    this.xmax = Math.max(
      this.xmax,
      scaled_segment[0][0],
      scaled_segment[1][0],
      scaled_segment[2][0],
      scaled_segment[3][0]
    );
    this.ymin = Math.min(
      this.ymin,
      scaled_segment[0][1],
      scaled_segment[1][1],
      scaled_segment[2][1],
      scaled_segment[3][1]
    );
    this.ymax = Math.max(
      this.ymax,
      scaled_segment[0][1],
      scaled_segment[1][1],
      scaled_segment[2][1],
      scaled_segment[3][1]
    );
  }
  // Translates the path by a given vector.
  move_by(p) {
    this.bezier_segments = this.bezier_segments.map((segment) => {
      return segment.map((v) => vec2_sum(v, p));
    });
    this.xmin += p[0];
    this.xmax += p[0];
    this.ymin += p[1];
    this.ymax += p[1];
    return this;
  }
  // Scales the path around a given point by a given scale factor.
  homothety_around(p, scale) {
    this.bezier_segments = this.bezier_segments.map((segment) => {
      return segment.map((v) => {
        const [x, y] = vec2_sub(v, p);
        return vec2_sum([x * scale, y * scale], p);
      });
    });
    this.xmin = (this.xmin - p[0]) * scale + p[0];
    this.xmax = (this.xmax - p[0]) * scale + p[0];
    this.ymin = (this.ymin - p[1]) * scale + p[1];
    this.ymax = (this.ymax - p[1]) * scale + p[1];
    return this;
  }
  // Partially draws the path with the given stroke and fill settings, where t is a parameter
  // between 0 and 1 controlling the progress.
  // - When 0 < t < FILL_DELAY, a partial outline is drawn.
  // - When FILL_DELAY < t < 1, the full outline is drawn with partial opacity.
  _drawPartial(ctx, scene, t, stroke, fill) {
    let num_segments = Math.min(
      Math.floor(this.bezier_segments.length * 2 * t),
      this.bezier_segments.length
    );
    ctx.beginPath();
    ctx.strokeStyle = "black";
    let [curr_x, curr_y] = scene.v2c(
      this.bezier_segments[0][0]
    );
    let cx, cy;
    let [h1_x, h1_y] = [0, 0];
    let [h2_x, h2_y] = [0, 0];
    let [x, y] = [0, 0];
    let segment;
    ctx.moveTo(curr_x, curr_y);
    for (let i = 0; i < num_segments; i++) {
      segment = this.bezier_segments[i];
      [cx, cy] = scene.v2c(segment[0]);
      if (cx != curr_x || cy != curr_y) {
        ctx.moveTo(cx, cy);
      }
      [h1_x, h1_y] = scene.v2c(segment[1]);
      [h2_x, h2_y] = scene.v2c(segment[2]);
      [x, y] = scene.v2c(segment[3]);
      ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, x, y);
      [curr_x, curr_y] = [x, y];
    }
    if (t <= FILL_DELAY) {
      ctx.stroke();
    } else {
      ctx.closePath();
      if (stroke) {
        ctx.stroke();
      }
      const fill_progress = (t - FILL_DELAY) / (1 - FILL_DELAY);
      if (fill) {
        ctx.globalAlpha = clamp(ctx.globalAlpha * fill_progress, 0, 1);
        ctx.fill();
        ctx.globalAlpha = clamp(ctx.globalAlpha / fill_progress, 0, 1);
      }
    }
  }
  // Draws the path with the given stroke and fill settings.
  _draw(ctx, scene, stroke, fill) {
    this._drawPartial(ctx, scene, this.progress, stroke, fill);
  }
};
var SVGPathMObject = class extends SVGMObject {
  constructor() {
    super(...arguments);
    // An SVGPathMObject is composed of an ordered sequence of SVGPaths, each representing a single SVG path.
    this.paths = [];
    // x limits and y limits of the MObject, used for setting a bounding box and sizing.
    this.xmin = Infinity;
    this.xmax = -Infinity;
    this.ymin = Infinity;
    this.ymax = -Infinity;
  }
  _recalculate_limits() {
    this.xmin = Math.min(...this.paths.map((path) => path.xmin));
    this.xmax = Math.max(...this.paths.map((path) => path.xmax));
    this.ymin = Math.min(...this.paths.map((path) => path.ymin));
    this.ymax = Math.max(...this.paths.map((path) => path.ymax));
  }
  // Sets the segments based on a parsed path. The parsed path is in ctx coordinates, while
  // this object's segments are in scene coordinates, so a scaling factor must be supplied.
  from_path(pathElement, scene_scale) {
    this.set_stroke_color(pathElement.stroke);
    this.set_stroke_width(pathElement.strokeWidth / scene_scale);
    this.set_fill_color(pathElement.fill);
    let transformMatrix = [
      [1 / scene_scale, 0],
      [0, -1 / scene_scale]
    ];
    let translate = pathElement.translation ? matmul_vec2(transformMatrix, [
      pathElement.translation.x,
      pathElement.translation.y
    ]) : [0, 0];
    if (pathElement.transformMatrix) {
      transformMatrix = matmul_mat2(
        [
          [pathElement.transformMatrix?.a, pathElement.transformMatrix?.b],
          [pathElement.transformMatrix?.c, pathElement.transformMatrix?.d]
        ],
        transformMatrix
      );
    }
    this.paths = [];
    let current_path = new SVGPath();
    let [curr_x, curr_y] = [0, 0];
    let [x, y] = [0, 0];
    let h1 = [0, 0];
    let h2 = [0, 0];
    let [hx, hy] = [0, 0];
    for (let i = 0; i < pathElement.commands.length; i++) {
      let cmd = pathElement.commands[i];
      if (cmd.type == "M") {
        [curr_x, curr_y] = cmd.values;
      } else if (cmd.type == "L") {
        [x, y] = cmd.values;
        h1 = [curr_x * 2 / 3 + x / 3, curr_y * 2 / 3 + y / 3];
        h2 = [curr_x / 3 + x * 2 / 3, curr_y / 3 + y * 2 / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate
        );
        [curr_x, curr_y] = [x, y];
      } else if (cmd.type == "V") {
        y = cmd.values[0];
        h1 = [curr_x, curr_y / 3 + x * 2 / 3];
        h2 = [curr_x, curr_y * 2 / 3 + x / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [curr_x, y]],
          transformMatrix,
          translate
        );
        curr_y = y;
      } else if (cmd.type == "H") {
        x = cmd.values[0];
        h1 = [curr_x * 2 / 3 + x / 3, curr_y];
        h2 = [curr_x / 3 + x * 2 / 3, curr_y];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, curr_y]],
          transformMatrix,
          translate
        );
        curr_x = x;
      } else if (cmd.type == "C") {
        h1 = [cmd.values[0], cmd.values[1]];
        h2 = [cmd.values[2], cmd.values[3]];
        [x, y] = [cmd.values[4], cmd.values[5]];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate
        );
        [curr_x, curr_y] = [x, y];
      } else if (cmd.type == "S") {
        h1 = vec2_sub(vec2_scale([curr_x, curr_y], 2), h2);
        h2 = [cmd.values[0], cmd.values[1]];
        [x, y] = [cmd.values[2], cmd.values[3]];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate
        );
        [curr_x, curr_y] = [x, y];
      } else if (cmd.type == "Q") {
        [hx, hy] = [cmd.values[0], cmd.values[1]];
        [x, y] = [cmd.values[2], cmd.values[3]];
        h1 = [curr_x / 3 + hx * 2 / 3, curr_y / 3 + hy * 2 / 3];
        h2 = [x / 3 + hx * 2 / 3, y / 3 + hy * 2 / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate
        );
        [curr_x, curr_y] = [x, y];
      } else if (cmd.type == "T") {
        [hx, hy] = vec2_sub(vec2_scale([curr_x, curr_y], 2), h2);
        [x, y] = [cmd.values[0], cmd.values[1]];
        h1 = [curr_x / 3 + hx * 2 / 3, curr_y / 3 + hy * 2 / 3];
        h2 = [x / 3 + hx * 2 / 3, y / 3 + hy * 2 / 3];
        current_path.add_segment(
          [[curr_x, curr_y], h1, h2, [x, y]],
          transformMatrix,
          translate
        );
        [curr_x, curr_y] = [x, y];
      } else if (cmd.type == "Z") {
        this.paths.push(current_path.clone());
        current_path = new SVGPath();
      } else {
        throw new Error(`Unknown command type: ${cmd.type}`);
      }
    }
    this._recalculate_limits();
    return this;
  }
  // Translates the path by a given vector.
  move_by(p) {
    for (let path of this.paths) {
      path.move_by(p);
    }
    this._recalculate_limits();
    return this;
  }
  // Scales the path around a given point by a given scale factor.
  homothety_around(p, scale) {
    for (let path of this.paths) {
      path.homothety_around(p, scale);
    }
    this._recalculate_limits();
    return this;
  }
  // Sets the progress of drawing the entire MObject
  set_progress(t) {
    let total_num_paths = this.paths.length;
    for (let i = 0; i < total_num_paths; i++) {
      this.paths[i].set_progress(
        clamp(t * total_num_paths - i, 0, 1)
      );
    }
    return this;
  }
  // Draw all paths.
  _draw(ctx, scene, args) {
    for (let path of this.paths) {
      path._draw(
        ctx,
        scene,
        this.stroke_options.stroke_color != "none",
        this.fill_options.fill
      );
    }
  }
};
var SVGPathMObjectGroup = class extends MObjectGroup {
  constructor() {
    super(...arguments);
    this.center = [0, 0];
    this.width = 0;
    this.height = 0;
  }
  _recalculate_size() {
    let xmin = Infinity;
    let xmax = -Infinity;
    let ymin = Infinity;
    let ymax = -Infinity;
    Object.values(this.children).forEach((child) => {
      xmin = Math.min(xmin, child.xmin);
      xmax = Math.max(xmax, child.xmax);
      ymin = Math.min(ymin, child.ymin);
      ymax = Math.max(ymax, child.ymax);
    });
    this.center = [(xmin + xmax) / 2, (ymin + ymax) / 2];
    this.width = xmax - xmin;
    this.height = ymax - ymin;
  }
  // Used for animation - sets the progress of drawing each character.
  set_progress(t) {
    Object.values(this.children).forEach(
      (child) => child.set_progress(t)
    );
  }
  get_center() {
    return this.center;
  }
  // Sets the total width of the MObjectGroup
  set_width(width) {
    let scale = width / this.width;
    Object.values(this.children).forEach((child) => {
      child.homothety_around(this.center, scale);
    });
    this.width *= scale;
    this.height *= scale;
    return this;
  }
  // Sets the total height of the MObjectGroup
  set_height(height) {
    let scale = height / this.height;
    Object.values(this.children).forEach((child) => {
      child.homothety_around(this.center, scale);
    });
    this.width *= scale;
    this.height *= scale;
    return this;
  }
  // Sets the center
  set_center(center) {
    Object.values(this.children).forEach(
      (child) => child.move_by(vec2_sub(center, this.center))
    );
    this.center = center;
    return this;
  }
};

// src/lib/vectorized/latex.ts
function ensureSVGNamespace(svgString) {
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return svgString;
}
function waitForMathJax() {
  return new Promise((resolve) => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      resolve();
      return;
    }
    const checkInterval = setInterval(() => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 5e3);
  });
}
async function renderLatexToSVG(latex, displayMode = true) {
  await waitForMathJax();
  if (!window.MathJax || !window.MathJax.typesetPromise) {
    throw new Error(
      "MathJax not loaded. Make sure MathJax script is included in HTML."
    );
  }
  const div = document.createElement("div");
  div.style.visibility = "hidden";
  div.style.position = "absolute";
  div.style.top = "-9999px";
  if (displayMode) {
    div.innerHTML = `\\[${latex}\\]`;
  } else {
    div.innerHTML = `\\(${latex}\\)`;
  }
  document.body.appendChild(div);
  try {
    await window.MathJax.typesetPromise([div]);
    const svgElement = div.querySelector("svg");
    if (!svgElement) {
      const svgs = div.getElementsByTagName("svg");
      if (svgs.length > 0) {
        return ensureSVGNamespace(svgs[0].outerHTML);
      }
      throw new Error("No SVG element found");
    }
    return ensureSVGNamespace(svgElement.outerHTML);
  } finally {
    document.body.removeChild(div);
  }
}
var TexMObject = class extends SVGPathMObjectGroup {
  async from_latex(latex, scale) {
    this.clear();
    const svgString = await renderLatexToSVG(latex, true);
    const svgElement = SVGLoader.parseSVG(svgString);
    const paths = extractMathJaxPaths(svgElement).map(
      (pathInfo) => SVGLoader.parsePathInfo(pathInfo)
    );
    for (let i = 0; i < paths.length; i++) {
      let mobj = new SVGPathMObject();
      mobj.from_path(paths[i], scale);
      this.add_mobj(`expr_${i}`, mobj);
    }
    this._recalculate_size();
    return this;
  }
};

// src/pythagorean_triples_scene.ts
function make_triangle(height, width, offset = [0, 0], scale = 1, add_grid_lines = true) {
  let t = new MObjectGroup();
  t.add_mobj(
    "triangle",
    new Polygon([
      [0, 0],
      [width, 0],
      [width, height]
    ]).set_fill(false)
  );
  if (add_grid_lines) {
    for (let i = 1; i < height; i++) {
      t.add_mobj(
        `grid_y_${i}`,
        new Line([width, i], [i * width / height, i]).set_alpha(0.3)
      );
    }
    for (let j = 1; j < width; j++) {
      t.add_mobj(
        `grid_x_${j}`,
        new Line([j, 0], [j, j * height / width]).set_alpha(0.3)
      );
    }
  }
  t.homothety_around([0, 0], scale);
  t.move_by(offset);
  return t;
}
function stereographic_projection(cart_eq, basepoint, slope) {
  let [x0, y0] = basepoint;
  let quadratic_coeff = cart_eq.c_xx + slope * cart_eq.c_xy + slope ** 2 * cart_eq.c_yy;
  let linear_coeff = cart_eq.c_x + slope * cart_eq.c_y - cart_eq.c_xy * (x0 * slope - y0) + 2 * slope * cart_eq.c_yy * (y0 - slope * x0);
  if (quadratic_coeff == 0) {
    return null;
  }
  let sum_of_roots = -linear_coeff / quadratic_coeff;
  let x1 = sum_of_roots - x0;
  let y1 = y0 + slope * (x1 - x0);
  return [x1, y1];
}
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    let num_pts = 200;
    let solver = await createSmoothOpenPathBezier(num_pts);
    await (async function scene_0(width, height) {
    })(400, 400);
    await (async function scene_1(width, height) {
      const name = "scene-1";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([0, 100], [0, 100]);
      scene.set_view_lims([0, 20], [-20, 0]);
      scene.draw();
      let playButton = Button(
        document.getElementById(name + "-play-button"),
        async function() {
          scene.clear();
          await new FadeIn(
            "3-4-5",
            make_triangle(3, 4).move_by([1, -1]),
            30
          ).play(scene);
          await new Wait(20).play(scene);
          await new FadeIn(
            "5-12-13",
            make_triangle(5, 12).move_by([1, -9]),
            30
          ).play(scene);
          await new Wait(20).play(scene);
          await new FadeIn(
            "6-8-10",
            make_triangle(6, 8).move_by([7, -1]),
            30
          ).play(scene);
          await new Homothety(
            "6-8-10",
            scene.get_mobj("6-8-10"),
            [7, -1],
            0.5,
            40
          ).play(scene);
        }
      );
      playButton.textContent = "Play next";
    })(300, 300);
    await (async function scene_2(width, height) {
      const name = "scene-2";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-2, 20], [-2, 20]);
      scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
      scene.draw();
      let resetButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          scene.clear();
          scene.set_frame_lims([-2, 20], [-2, 20]);
          scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
          scene.draw();
        }
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button"),
        async function() {
          scene.clear();
          let num_frames;
          let progress;
          let theta_slope;
          let theta_point;
          let slope;
          await new FadeIn(
            {
              axes: new CoordinateAxes2d([-2, 2], [-2.5, 2.5]).remove_grid_lines().set_axis_options({ stroke_width: 0.05, arrow_size: 0.2 }).set_tick_options({ stroke_width: 0.03, size: 0.1 })
            },
            10
          ).play(scene);
          await new FadeIn(
            {
              basepoint: new Dot([1, 0], 0.06),
              segment: new Line([0, 0], [1, 0]).set_stroke_width(0.05)
            },
            10
          ).play(scene);
          await new FadeIn(
            {
              circle: new ParametricFunction(
                (t2) => [Math.cos(t2), Math.sin(t2)],
                0,
                0,
                num_pts,
                solver
              ).set_stroke_width(0.04)
            },
            1
          ).play(scene);
          num_frames = 30;
          let t = new Parameter().set_value(0);
          t.add_callback((x) => {
            scene.get_mobj("circle").set_lims(0, x);
            scene.get_mobj("basepoint").move_to([
              Math.cos(x),
              Math.sin(x)
            ]);
            scene.get_mobj("segment").move_end([
              Math.cos(x),
              Math.sin(x)
            ]);
          });
          await new ChangeParameterSmoothly(t, 2 * Math.PI, 30).play(scene);
          scene.remove("segment");
          await new FadeIn(
            {
              eq_circle: (await new TexMObject().from_latex(
                "x^2 + y^2 = 1",
                scene.scale()
              )).set_height(0.3).set_center([1.5, 1.5])
            },
            10
          ).play(scene);
          slope = -2;
          theta_slope = Math.atan2(-slope, -1);
          theta_point = 2 * theta_slope - Math.PI;
          await new FadeIn(
            {
              width: new Line(
                [Math.cos(theta_point), Math.sin(theta_point)],
                [0, Math.sin(theta_point)]
              ).set_stroke_color("red").set_stroke_width(0.03),
              height: new Line(
                [Math.cos(theta_point), Math.sin(theta_point)],
                [Math.cos(theta_point), 0]
              ).set_stroke_color("blue").set_stroke_width(0.03),
              floating_point: new Dot(
                [Math.cos(theta_point), Math.sin(theta_point)],
                0.08
              ).set_fill_color("gray")
            },
            20
          ).play(scene);
          let length2 = 8;
          scene.add("line", new Line([1, 0], [1, 0]).set_stroke_width(0.04));
          scene.move_to_front("floating_point");
          num_frames = 30;
          for (let i = 1; i < num_frames; i++) {
            progress = smooth(i / num_frames);
            scene.get_mobj("line").move_start([
              1 + progress * length2 * Math.cos(theta_slope),
              progress * length2 * Math.sin(theta_slope)
            ]).move_end([
              1 - progress * length2 * Math.cos(theta_slope),
              -progress * length2 * Math.sin(theta_slope)
            ]);
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          await new FadeIn({ axis_point: new Dot([0, -slope], 0.08) }, 10).play(
            scene
          );
          let v = new Parameter();
          v.set_value(-2);
          v.add_callback((x) => {
            let t_slope = Math.atan2(-x, -1);
            let t_point = 2 * t_slope - Math.PI;
            scene.get_mobj("width").move_start([Math.cos(t_point), Math.sin(t_point)]).move_end([0, Math.sin(t_point)]);
            scene.get_mobj("height").move_start([Math.cos(t_point), Math.sin(t_point)]).move_end([Math.cos(t_point), 0]);
            scene.get_mobj("floating_point").move_to([
              Math.cos(t_point),
              Math.sin(t_point)
            ]);
            scene.get_mobj("line").move_start([
              1 + length2 * Math.cos(t_slope),
              length2 * Math.sin(t_slope)
            ]).move_end([
              1 - length2 * Math.cos(t_slope),
              -length2 * Math.sin(t_slope)
            ]);
            scene.get_mobj("axis_point").move_to([0, -x]);
          });
          await new FadeIn(
            {
              eq_line: (await new TexMObject().from_latex("y = -m(x-1)", scene.scale())).set_height(0.25).set_center([1.5, 1])
            },
            10
          ).play(scene);
          let new_slope = -2 / 3;
          let new_theta_slope = Math.atan2(-new_slope, -1);
          let theta, m, point_angle;
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          new_slope = -3;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          new_slope = -3 / 2;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          await new Zoom([0, 2], 1 / 3, 30).play(scene);
          await new FadeIn(
            {
              formula_1: (await new TexMObject().from_latex(
                "x^2 + (-m(x-1))^2 = 1",
                scene.scale()
              )).set_height(0.8).set_center([-2, -3])
            },
            10
          ).play(scene);
          await new FadeIn(
            {
              formula_2: (await new TexMObject().from_latex(
                "(m^2+1)x^2 - 2m^2x + (m^2-1) = 0",
                scene.scale()
              )).set_height(0.8).set_center([-2, -4])
            },
            10
          ).play(scene);
          await new FadeIn(
            {
              formula_3: (await new TexMObject().from_latex(
                "x = \\frac{2m^2 \\pm \\sqrt{(2m^2)^2 - 4(m^2+1)(m^2-1)}}{2(m^2+1)}",
                scene.scale()
              )).set_height(0.8).set_center([-2, -5])
            },
            10
          ).play(scene);
          await new FadeIn(
            {
              formula: (await new TexMObject().from_latex(
                "(x, y) = (\\frac{m^2-1}{m^2+1}, \\frac{2m}{m^2+1})",
                scene.scale()
              )).set_height(0.8).set_center([-2, -6])
            },
            10
          ).play(scene);
          await new FadeOut(["formula_1", "formula_2", "formula_3"], 30).play(
            scene
          );
          await new MoveBy("formula", [3, 8], 30).play(scene);
          await new Zoom([0, 2], 2, 30).play(scene);
          new_slope = -2;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_1",
            new Dot(
              scene.get_mobj("floating_point").get_center(),
              0.04
            ).set_color("green")
          );
          scene.add(
            "line_point_1",
            new Dot(
              scene.get_mobj("axis_point").get_center(),
              0.04
            ).set_color("green")
          );
          scene.move_to_front("circle_point_1");
          scene.move_to_front("line_point_1");
          new_slope = -3 / 2;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_2",
            new Dot(
              scene.get_mobj("floating_point").get_center(),
              0.04
            ).set_color("purple")
          );
          scene.add(
            "line_point_2",
            new Dot(
              scene.get_mobj("axis_point").get_center(),
              0.04
            ).set_color("purple")
          );
          scene.move_to_front("circle_point_2");
          scene.move_to_front("line_point_2");
          new_slope = -4 / 3;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_3",
            new Dot(
              scene.get_mobj("floating_point").get_center(),
              0.04
            ).set_color("yellow")
          );
          scene.add(
            "line_point_3",
            new Dot(
              scene.get_mobj("axis_point").get_center(),
              0.04
            ).set_color("yellow")
          );
          scene.move_to_front("circle_point_3");
          scene.move_to_front("line_point_3");
          new_slope = -5 / 3;
          new_theta_slope = Math.atan2(-new_slope, -1);
          num_frames = 40;
          for (let i = 1; i < num_frames; i++) {
            v.set_value(slope + smooth(i / num_frames) * (new_slope - slope));
            await delay(DEFAULT_FRAME_LENGTH);
            scene.draw();
          }
          slope = new_slope;
          theta_slope = new_theta_slope;
          theta_point = 2 * theta_slope - Math.PI;
          scene.add(
            "circle_point_4",
            new Dot(
              scene.get_mobj("floating_point").get_center(),
              0.04
            ).set_color("orange")
          );
          scene.add(
            "line_point_4",
            new Dot(
              scene.get_mobj("axis_point").get_center(),
              0.04
            ).set_color("orange")
          );
          scene.move_to_front("circle_point_4");
          scene.move_to_front("line_point_4");
        }
      );
      playButton.textContent = "Play";
    })(500, 500);
    await (async function scene_3(width, height) {
      const name = "scene-3";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-2, 20], [-2, 20]);
      scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
      scene.draw();
      let slides_played = 0;
      let resetButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          slides_played = 0;
          scene.clear();
          scene.set_frame_lims([-2, 20], [-2, 20]);
          scene.set_view_lims([-2.5, 2.5], [-2.5, 2.5]);
          scene.draw();
        }
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button"),
        async function() {
          await do_scene();
        }
      );
      playButton.textContent = "Play";
      async function do_scene() {
        let slope, theta_slope, num_frames;
        scene.add(
          "axes",
          new CoordinateAxes2d([-2, 2], [-2.5, 2.5]).remove_grid_lines().set_axis_options({ stroke_width: 0.05, arrow_size: 0.2 }).set_tick_options({ stroke_width: 0.03, size: 0.1 })
        );
        scene.add("basepoint", new Dot([1, 0], 0.06));
        scene.add(
          "circle",
          new ParametricFunction(
            (t) => [Math.cos(t), Math.sin(t)],
            0,
            2 * Math.PI,
            num_pts,
            solver
          ).set_stroke_width(0.04)
        );
        scene.add(
          "stereographic_line",
          new Line([1, 0], [1, 0]).set_stroke_width(0.04)
        );
        scene.add(
          "point_on_circle",
          new Dot([1, 0], 0.08).set_fill_color("gray")
        );
        scene.add("point_on_axis", new Dot([0, 0], 0.08));
        let l = new Parameter();
        let m = new Parameter();
        l.add_callback((x) => {
          slope = m.get_value();
          let direction = [
            1 / (slope ** 2 + 1),
            slope / (slope ** 2 + 1)
          ];
          scene.get_mobj("stereographic_line").move_start(vec2_sum([1, 0], vec2_scale(direction, x / 2))).move_end(vec2_sum([1, 0], vec2_scale(direction, -x / 2)));
        });
        m.add_callback((x) => {
          length = l.get_value();
          let direction = [
            1 / Math.sqrt(x ** 2 + 1),
            x / Math.sqrt(x ** 2 + 1)
          ];
          scene.get_mobj("point_on_circle").move_to([
            1 - 2 / (x ** 2 + 1),
            -2 * x / (x ** 2 + 1)
          ]);
          scene.get_mobj("point_on_axis").move_to([0, -x]);
          scene.get_mobj("stereographic_line").move_start(vec2_sum([1, 0], vec2_scale(direction, length / 2))).move_end(vec2_sum([1, 0], vec2_scale(direction, -length / 2)));
        });
        l.set_value(8);
        m.set_value(-1);
        scene.draw();
        scene.add("3-4-5", make_triangle(4, 3, [4, 0], 0.5));
        scene.add("5-12-13", make_triangle(12, 5, [6, 0], 0.4));
        scene.add("7-24-25", make_triangle(24, 7, [9, 0], 0.3));
        await new Zoom([-2, 0], 1 / 3, 20).play(scene);
        num_frames = 20;
        slope = m.get_value();
        for (let i = 1; i < num_frames; i++) {
          m.set_value(slope + smooth(i / num_frames) * (-2 - slope));
          await delay(DEFAULT_FRAME_LENGTH);
          scene.draw();
        }
        await new Homothety(
          "3-4-5",
          scene.get_mobj("3-4-5"),
          vec2_scale([4, 0], 1 / 5 / (1 / 5 - 0.5)),
          1 / 5 / 0.5,
          num_frames
        ).play(scene);
        await new FadeOut(["3-4-5"], 10).play(scene);
        scene.add("3-4-5-point", new Dot([0, 2], 0.06).set_color("red"));
        slope = m.get_value();
        for (let i = 1; i < num_frames; i++) {
          m.set_value(slope + smooth(i / num_frames) * (-3 / 2 - slope));
          await delay(DEFAULT_FRAME_LENGTH);
          scene.draw();
        }
        await new Homothety(
          "5-12-13",
          scene.get_mobj("5-12-13"),
          vec2_scale([6, 0], 1 / 13 / (1 / 13 - 0.4)),
          1 / 13 / 0.4,
          num_frames
        ).play(scene);
        await new FadeOut(["5-12-13"], 10).play(scene);
        scene.add("5-12-13-point", new Dot([0, 3 / 2], 0.06).set_color("blue"));
        slope = m.get_value();
        for (let i = 1; i < num_frames; i++) {
          m.set_value(slope + smooth(i / num_frames) * (-4 / 3 - slope));
          await delay(DEFAULT_FRAME_LENGTH);
          scene.draw();
        }
        await new Homothety(
          "7-24-25",
          scene.get_mobj("7-24-25"),
          vec2_scale([9, 0], 1 / 25 / (1 / 25 - 0.3)),
          1 / 25 / 0.3,
          num_frames
        ).play(scene);
        await new FadeOut(["7-24-25"], 10).play(scene);
        scene.add(
          "7-24-25-point",
          new Dot([0, 4 / 3], 0.06).set_color("orange")
        );
        await new FadeIn(
          {
            formula: new LaTeXMObject(
              "(x, y) = (\\frac{m^2-1}{m^2+1}, \\frac{2m}{m^2+1})",
              [0, -4],
              cache
            )
          },
          10
        ).play(scene);
      }
    })(500, 500);
    await (async function scene_4(width, height) {
      const name = "scene-4";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-3, 3], [-3, 3]);
      scene.set_view_lims([-3, 3], [-3, 3]);
      scene.draw();
      let resetButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          scene.clear();
          scene.set_frame_lims([-3, 3], [-3, 3]);
          scene.set_view_lims([-3, 3], [-3, 3]);
          scene.draw();
        }
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button"),
        async function() {
          await do_scene();
        }
      );
      playButton.textContent = "Play";
      async function do_scene() {
      }
    })(500, 500);
    await (async function scene_5(width, height) {
      const name = "scene-5";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-3, 3], [-3, 3]);
      scene.set_view_lims([-3, 3], [-3, 3]);
      scene.draw();
      let resetButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          scene.clear();
          scene.set_frame_lims([-3, 3], [-3, 3]);
          scene.set_view_lims([-3, 3], [-3, 3]);
          scene.draw();
        }
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button"),
        async function() {
          await do_scene();
        }
      );
      playButton.textContent = "Play";
      async function do_scene() {
        let cart_eq = new CartEq(1, 0, 1, 0, 0, -1);
        let polar_eq = cart_eq.to_polar();
        let conic = new ConicSection(
          cart_eq,
          polar_eq,
          num_pts,
          solver
        ).set_stroke_width(0.04);
        await new FadeIn(
          {
            axes: new CoordinateAxes2d([-3, 3], [-3, 3]).remove_grid_lines().set_axis_options({ stroke_width: 0.05, arrow_size: 0.2 }).set_tick_options({ stroke_width: 0.03, size: 0.1 }),
            basepoint: new Dot([1, 0], 0.06),
            conic
          },
          20
        ).play(scene);
        let a = new Parameter().set_value(0);
        a.add_callback((m2) => {
          scene.get_mobj("conic").set_coeffs(
            1,
            m2,
            1,
            0,
            0,
            -1
          );
        });
        await new ChangeParameterSmoothly(a, 1, 50).play(scene);
        await new Emphasize(
          "basepoint",
          scene.get_mobj("basepoint"),
          20
        ).play(scene);
        let m = new Parameter();
        m.set_value(-2 / 3);
        let length2 = 8;
        await new GrowLineFromMidpoint(
          "stereographic_line",
          new Line(
            vec2_sum(scene.get_mobj("basepoint").get_center(), [
              length2 / 2,
              0
            ]),
            vec2_sum(scene.get_mobj("basepoint").get_center(), [
              -length2 / 2,
              0
            ])
          ).set_stroke_width(0.04).rotate_to(Math.atan(m.get_value())),
          30
        ).play(scene);
        await new FadeIn(
          {
            point_on_curve: new Dot(
              stereographic_projection(
                cart_eq,
                scene.get_mobj("basepoint").get_center(),
                m.get_value()
              ),
              0.06
            ),
            point_on_line: new Dot([0, -m.get_value()], 0.06)
          },
          20
        ).play(scene);
        m.add_callback((s) => {
          scene.get_mobj("stereographic_line").rotate_to(
            Math.atan(s)
          );
          let bp = scene.get_mobj("basepoint").get_center();
          scene.get_mobj("point_on_line").move_to([
            0,
            bp[1] - s * bp[0]
          ]);
          let v = stereographic_projection(cart_eq, bp, s);
          if (v == null) {
            scene.get_mobj("point_on_curve").move_to([100, 100]);
          } else {
            scene.get_mobj("point_on_curve").move_to(v);
          }
        });
        await new ChangeParameterSmoothly(m, -1.5, 30).play(scene);
        a.clear().set_value(0);
        a.add_callback((x) => {
          let conic2 = scene.get_mobj("conic");
          conic2.set_coeffs(1, 1 + 3 * x, 1, 0, 0, -1);
          m.do_callbacks();
        });
        await new ChangeParameterSmoothly(a, 1, 50).play(scene);
      }
    })(500, 500);
    await (async function scene_6(width, height) {
      const name = "scene-6";
      const canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      scene.set_frame_lims([-3, 3], [-3, 3]);
      scene.set_view_lims([-3, 3], [-3, 3]);
      scene.draw();
      let resetButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          scene.clear();
          scene.set_frame_lims([-3, 3], [-3, 3]);
          scene.set_view_lims([-3, 3], [-3, 3]);
          scene.draw();
        }
      );
      resetButton.textContent = "Reset";
      let playButton = Button(
        document.getElementById(name + "-play-button"),
        async function() {
          await do_scene();
        }
      );
      playButton.textContent = "Play";
      async function do_scene() {
      }
    })(500, 500);
  });
})();
