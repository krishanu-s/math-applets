var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/base/vec2.ts
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

// src/lib/base/style_options.ts
var DEFAULT_BACKGROUND_COLOR = "white";
var DEFAULT_BORDER_COLOR = "black";
var DEFAULT_BORDER_WIDTH = 4;
var DEFAULT_STROKE_COLOR = "black";
var DEFAULT_STROKE_WIDTH = 0.08;
var DEFAULT_FILL_COLOR = "black";

// src/lib/base/base.ts
function gaussianRandom(mean, stdev) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return z * stdev + mean;
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
var MObjectGroup = class extends MObject {
  constructor() {
    super(...arguments);
    this.children = {};
  }
  add_mobj(name, child) {
    this.children[name] = child;
  }
  remove_mobj(name) {
    delete this.children[name];
  }
  move_by(p) {
    Object.values(this.children).forEach((child) => child.move_by(p));
  }
  clear() {
    Object.keys(this.children).forEach((key) => {
      delete this.children[key];
    });
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
    ctx.globalAlpha = this.alpha;
    Object.values(this.children).forEach(
      (child) => child.draw(canvas, scene, args)
    );
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
    ctx.globalAlpha = this.alpha;
    this.stroke_options.apply_to(ctx, scene);
    this._draw(ctx, scene, args);
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
    ctx.globalAlpha = this.alpha;
    this.stroke_options.apply_to(ctx, scene);
    Object.values(this.children).forEach((child) => {
      child._draw(ctx, scene, args);
    });
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
    ctx.globalAlpha = this.alpha;
    this.stroke_options.apply_to(ctx, scene);
    this.fill_options.apply_to(ctx);
    this._draw(ctx, scene, args);
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
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
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
var Dot = class extends FillLikeMObject {
  constructor(center, radius) {
    super();
    this.radius = 0.1;
    this.center = center;
    this.radius = radius;
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
  move_by(p) {
    this.start = vec2_sum(this.start, p);
    this.end = vec2_sum(this.end, p);
    return this;
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
          )
        );
      } else {
        ticks.add_mobj(
          `tick-y-(${c})`,
          new Line(
            [-this.tick_options.size / 2, c],
            [this.tick_options.size / 2, c]
          )
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

// src/lib/interactive/scene_view_translator.ts
var SceneViewTranslator = class {
  // Callbacks which trigger when the object is dragged.
  constructor(scene) {
    this.drag = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.callbacks = [];
    this.scene = scene;
    this.add_callback(() => {
      if (scene.has_mobj("axes")) {
        scene.get_mobj("axes").set_lims(
          scene.view_xlims,
          scene.view_ylims
        );
      }
    });
  }
  // Adds a callback which triggers when the object is dragged
  add_callback(callback) {
    this.callbacks.push(callback);
    return this;
  }
  // Performs all callbacks (called when the object is dragged)
  do_callbacks() {
    for (const callback of this.callbacks) {
      callback();
    }
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
    let touch = event.touches[0];
    this.dragStart = [
      touch.pageX - this.scene.canvas.offsetLeft,
      touch.pageY - this.scene.canvas.offsetTop
    ];
    if (!this.scene.is_dragging) {
      this.drag = true;
      this.scene.click();
    }
  }
  unclick(event) {
    this.drag = false;
    this.scene.unclick();
  }
  untouch(event) {
    this.drag = false;
    this.scene.unclick();
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
      let touch = event.touches[0];
      this.dragEnd = [
        touch.pageX - this.scene.canvas.offsetLeft,
        touch.pageY - this.scene.canvas.offsetTop
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
    this.scene.move_view(dragDiff);
    this.scene.draw();
    this.dragStart = this.dragEnd;
    this.do_callbacks();
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

// src/ergodic_scene.ts
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    await (async function gauss_map_iterates(width, height) {
      let num_pts = 100;
      let solver = await createSmoothOpenPathBezier(num_pts);
      const name = "gauss-map";
      let canvas = prepare_canvas(width, height, name);
      let scene = new Scene(canvas);
      let xmin = -0.5;
      let xmax = 1.5;
      let ymin = -0.5;
      let ymax = 1.5;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.add(
        "axes",
        new CoordinateAxes2d([xmin, xmax], [ymin, ymax]).set_axis_options({ arrow_size: 0.1, stroke_width: 0.03, alpha: 0.6 }).set_tick_options({ stroke_width: 0.04, size: 0.08, alpha: 0.6 }).set_grid_options({
          stroke_width: 0.01,
          x_distance: 0.5,
          y_distance: 0.5
        })
      );
      let gauss_region = new Polygon([
        [1, 0],
        [0, 0],
        [0, 1]
      ]).set_stroke_width(0.02).set_fill_alpha(0);
      for (let i = 1; i <= 50; i++) {
        gauss_region.add_point([i / 50, 1 / (1 + i / 50)]);
      }
      scene.add("gauss_region", gauss_region);
      function f(y) {
        if (y == 0) {
          let r = gaussianRandom(0, 1e-3);
          return r - Math.floor(r);
        } else if (y < 0) {
          throw new Error(`Invalid y-value ${y}, less than 0`);
        } else if (y > 1) {
          throw new Error(`Invalid y-value ${y}, greater than 1`);
        } else {
          return 1 / y - Math.floor(1 / y);
        }
      }
      function T(y, z) {
        return [f(y), y * (1 - y * z)];
      }
      const num_iterates = 100;
      let dot = new DraggableDot([0.5, 0.5], 0.02).set_color("red");
      let py, pz;
      [py, pz] = dot.get_center();
      for (let i = 1; i < num_iterates; i++) {
        [py, pz] = T(py, pz);
        scene.add(
          `p_${i}`,
          new Dot([py, pz], 0.02).set_alpha((1 - i / num_iterates) ** 2)
        );
      }
      dot.add_callback(() => {
        [py, pz] = dot.get_center();
        for (let i = 1; i < num_iterates; i++) {
          [py, pz] = T(py, pz);
          scene.get_mobj(`p_${i}`).move_to([py, pz]);
        }
      });
      scene.add("p_0", dot);
      let view_translator = new SceneViewTranslator(scene);
      view_translator.add();
      scene.draw();
    })(300, 300);
  });
})();
