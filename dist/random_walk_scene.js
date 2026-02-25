var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/base/vec2.ts
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

// src/lib/base/style_options.ts
var DEFAULT_BACKGROUND_COLOR = "white";
var DEFAULT_BORDER_COLOR = "black";
var DEFAULT_BORDER_WIDTH = 4;
var DEFAULT_STROKE_COLOR = "black";
var DEFAULT_STROKE_WIDTH = 0.08;
var DEFAULT_FILL_COLOR = "black";

// src/lib/base/base.ts
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

// src/lib/base/color.ts
function rb_colormap(z) {
  const gray = sigmoid(z);
  if (gray < 0.5) {
    return [512 * gray, 512 * gray, 255, 255];
  } else {
    return [255, 512 * (1 - gray), 512 * (1 - gray), 255];
  }
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
  }
  move_end(p) {
    this.end = p;
  }
  move_by(p) {
    this.start = vec2_sum(this.start, p);
    this.end = vec2_sum(this.end, p);
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
  remove_point(index) {
    this.points.splice(index, 1);
  }
  move_point(i, new_point) {
    this.points[i] = new_point;
  }
  get_point(i) {
    return this.points[i];
  }
  move_by(p) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = vec2_sum(this.points[i], p);
    }
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [x, y] = scene.v2c(this.points[0]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.points.length; i++) {
      [x, y] = scene.v2c(this.points[i]);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};
var Arrow = class extends Line {
  constructor() {
    super(...arguments);
    this.arrow_size = 0.1;
  }
  set_arrow_size(size) {
    this.arrow_size = size;
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    super._draw(ctx, scene);
    ctx.fillStyle = this.stroke_options.stroke_color;
    let [end_x, end_y] = scene.v2c(this.end);
    let v = vec2_scale(
      vec2_sub(this.start, this.end),
      this.arrow_size / this.length()
    );
    let [ax, ay] = scene.v2c(vec2_sum(this.end, vec2_rot(v, Math.PI / 6)));
    let [bx, by] = scene.v2c(vec2_sum(this.end, vec2_rot(v, -Math.PI / 6)));
    ctx.beginPath();
    ctx.moveTo(end_x, end_y);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(end_x, end_y);
    ctx.closePath();
    ctx.fill();
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
function vec3_normalize(v) {
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
function rot_x(v, theta) {
  return matmul_vec(rot_x_matrix(theta), v);
}
function rot_matrix(axis, angle) {
  let [x, y, z] = vec3_normalize(axis);
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
  let [x, y, z] = vec3_normalize(axis);
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
var ThreeDMObjectGroup = class extends ThreeDMObject {
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
  // TODO Depth-calculation should be done object-by-object.
  depth(scene) {
    return Math.max(
      ...Object.values(this.children).map((child) => child.depth(scene))
    );
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    Object.values(this.children).forEach((child) => {
      child.draw(canvas, scene, args);
    });
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
var LineSequence3D = class extends ThreeDLineLikeMObject {
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
  get_point(i) {
    return this.points[i];
  }
  depth(scene) {
    if (this.points.length == 0) {
      return 0;
    } else if (this.points.length == 1) {
      return scene.camera.depth(this.points[0]);
    } else {
      return scene.camera.depth(
        vec3_scale(
          vec3_sum(this.points[0], this.points[1]),
          0.5
        )
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
var TwoHeadedArrow3D = class extends Line3D {
  constructor(start, end) {
    super(start, end);
    this.arrow_size = 0.3;
    this.fill_color = this.stroke_options.stroke_color;
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

// src/lib/base/heatmap.ts
var HeatMap = class extends MObject {
  constructor(width, height, min_val, max_val, valArray) {
    super();
    this.width = width;
    this.height = height;
    this.min_val = min_val;
    this.max_val = max_val;
    this.valArray = valArray;
    this.colorMap = rb_colormap;
  }
  set_color_map(colorMap) {
    this.colorMap = colorMap;
  }
  // Gets/sets values
  set_vals(vals) {
    this.valArray = vals;
  }
  get_vals() {
    return this.valArray;
  }
  // Draws on the canvas
  _draw(ctx, scene, imageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.valArray[i];
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(px_val);
    }
    ctx.putImageData(imageData, 0, 0);
  }
};

// src/lib/base/stats.ts
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
    let [scene_xmin, scene_xmax] = scene.xlims;
    let [scene_ymin, scene_ymax] = scene.ylims;
    let xmin = scene_xmin + (scene_xmax - scene_xmin) * 0.05;
    let xmax = scene_xmax - (scene_xmax - scene_xmin) * 0.05;
    let ymin = scene_ymin + (scene_ymax - scene_ymin) * 0.05;
    let ymax = scene_ymax - (scene_ymax - scene_ymin) * 0.05;
    let x_axis = new Line([xmin, ymin], [xmax, ymin]).set_alpha(1).set_stroke_width(0.5);
    x_axis.draw(canvas, scene);
    let y_axis = new Line([xmin, ymin], [xmin, ymax]).set_alpha(1).set_stroke_width(0.5);
    y_axis.draw(canvas, scene);
    for (let i = 1; i <= 5; i++) {
      let line = new Line(
        [xmin, ymin + i * (ymax - ymin) / 5],
        [xmax, ymin + i * (ymax - ymin) / 5]
      ).set_alpha(1).set_stroke_width(0.5).set_stroke_color("gray");
      line.set_stroke_style("dashed");
      line.draw(canvas, scene);
    }
    let bin_width = (xmax - xmin) / (this.bin_max - this.bin_min);
    let ct_height = (ymax - ymin) / (this.count_max - this.count_min);
    let bin;
    let rect_center, rect_height, rect_width;
    for (let i = 0; i < Object.keys(this.hist).length; i++) {
      bin = Number(Object.keys(this.hist)[i]);
      rect_center = [
        xmin + (bin - this.bin_min + 0.5) * bin_width,
        ymin + this.hist[bin] * 0.5 * ct_height
      ];
      rect_height = this.hist[bin] * ct_height;
      rect_width = bin_width;
      let rect = new Rectangle(rect_center, rect_width, rect_height);
      rect.fill_options.fill_color = this.fill_color;
      rect.draw(canvas, scene);
    }
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

// rust-calc/pkg/rust_calc.js
var rust_calc_exports = {};
__export(rust_calc_exports, {
  PointSource: () => PointSource,
  SmoothOpenPathBezierHandleCalculator: () => SmoothOpenPathBezierHandleCalculator,
  WaveSimOneDim: () => WaveSimOneDim,
  WaveSimTwoDim: () => WaveSimTwoDim,
  default: () => __wbg_init,
  divide: () => divide,
  initSync: () => initSync,
  multiply: () => multiply,
  subtract: () => subtract,
  sum: () => sum
});
var PointSource = class _PointSource {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_PointSource.prototype);
    obj.__wbg_ptr = ptr;
    PointSourceFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PointSourceFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_pointsource_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get amplitude() {
    const ret = wasm.__wbg_get_pointsource_amplitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get frequency() {
    const ret = wasm.__wbg_get_pointsource_frequency(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get phase() {
    const ret = wasm.__wbg_get_pointsource_phase(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get x() {
    const ret = wasm.__wbg_get_pointsource_x(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @returns {number}
   */
  get y() {
    const ret = wasm.__wbg_get_pointsource_y(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} amplitude
   * @param {number} frequency
   * @param {number} phase
   * @returns {PointSource}
   */
  static new(x, y, amplitude, frequency, phase) {
    const ret = wasm.pointsource_new(x, y, amplitude, frequency, phase);
    return _PointSource.__wrap(ret);
  }
  /**
   * @param {number} arg0
   */
  set amplitude(arg0) {
    wasm.__wbg_set_pointsource_amplitude(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} arg0
   */
  set frequency(arg0) {
    wasm.__wbg_set_pointsource_frequency(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} arg0
   */
  set phase(arg0) {
    wasm.__wbg_set_pointsource_phase(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} arg0
   */
  set x(arg0) {
    wasm.__wbg_set_pointsource_x(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} arg0
   */
  set y(arg0) {
    wasm.__wbg_set_pointsource_y(this.__wbg_ptr, arg0);
  }
};
if (Symbol.dispose) PointSource.prototype[Symbol.dispose] = PointSource.prototype.free;
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
   * @returns {Float64Array}
   */
  get_uValues() {
    const ret = wasm.wavesimonedim_get_uValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_u_values() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.wavesimonedim_get_u_values(ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
  }
  /**
   * @returns {Float64Array}
   */
  get_vValues() {
    const ret = wasm.wavesimonedim_get_vValues(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get_v_values() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.wavesimonedim_get_v_values(ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
  }
  /**
   * @returns {Float64Array}
   */
  get_vals() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.wavesimonedim_get_vals(ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
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
  /**
   * @param {Float64Array} vals
   */
  set_u_vals(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedim_set_u_vals(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @param {Float64Array} vals
   */
  set_v_vals(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedim_set_v_vals(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @param {number} index
   * @param {number} val
   */
  set_val(index, val) {
    wasm.wavesimonedim_set_val(this.__wbg_ptr, index, val);
  }
  /**
   * @param {Float64Array} vals
   */
  set_vals(vals) {
    const ptr0 = passArrayF64ToWasm0(vals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.wavesimonedim_set_vals(this.__wbg_ptr, ptr0, len0);
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
function divide(left, right) {
  const ret = wasm.divide(left, right);
  return ret;
}
function multiply(left, right) {
  const ret = wasm.multiply(left, right);
  return ret;
}
function subtract(left, right) {
  const ret = wasm.subtract(left, right);
  return ret;
}
function sum(left, right) {
  const ret = wasm.sum(left, right);
  return ret;
}
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
var PointSourceFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_pointsource_free(ptr >>> 0, 1));
var SmoothOpenPathBezierHandleCalculatorFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_smoothopenpathbezierhandlecalculator_free(ptr >>> 0, 1));
var WaveSimOneDimFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_wavesimonedim_free(ptr >>> 0, 1));
var WaveSimTwoDimFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_wavesimtwodim_free(ptr >>> 0, 1));
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
function isWasmInitialized() {
  return isInitialized;
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

// src/lib/base/bezier.ts
var initializationStarted = false;
var initializationPromise = null;
async function ensureWasmInitialized() {
  if (isWasmInitialized()) {
    return;
  }
  if (!initializationStarted) {
    initializationStarted = true;
    initializationPromise = initWasm();
  }
  await initializationPromise;
}
var BezierSpline = class extends LineLikeMObject {
  constructor(num_steps, solver) {
    super();
    this.solverInitialized = true;
    this.solverInitializing = true;
    this.num_steps = num_steps;
    this.solver = solver;
    this.anchors = [];
    for (let i = 0; i < num_steps + 1; i++) {
      this.anchors.push([0, 0]);
    }
    this.initializeSolver();
  }
  async initializeSolver() {
    if (this.solverInitializing || this.solverInitialized) {
      console.log("Solver initialization already in progress or completed");
      return;
    }
    this.solverInitializing = true;
    console.log("Starting solver initialization...");
    try {
      console.log("Ensuring WebAssembly is initialized...");
      await ensureWasmInitialized();
      console.log("WebAssembly initialization complete");
      console.log("Creating SmoothOpenPathBezier with n =", this.num_steps);
      this.solver = await createSmoothOpenPathBezier(this.num_steps);
      console.log("Solver created:", this.solver);
      if (this.solver && typeof this.solver.get_bezier_handles === "function") {
        this.solverInitialized = true;
        console.log("Bezier solver initialized successfully");
      } else {
        console.error(
          "Bezier solver created but doesn't have get_bezier_handles method. Solver:",
          this.solver
        );
        this.solver = null;
      }
    } catch (error) {
      console.error("Failed to initialize Bezier solver:", error);
    } finally {
      this.solverInitializing = false;
      console.log(
        "Solver initialization attempt completed. solverInitialized =",
        this.solverInitialized
      );
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
    console.log(
      "BezierSpline._draw called. solverInitialized =",
      this.solverInitialized,
      "solver =",
      this.solver
    );
    if (!this.solverInitialized || !this.solver) {
      console.log("Using fallback drawing");
      this.drawFallback(ctx, scene);
      return;
    }
    console.log("Using solver for drawing");
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
      console.log("Getting bezier handles for ", anchors_flat);
      console.log("Solver:", this.solver);
      let handles_flat = this.solver.get_bezier_handles(anchors_flat);
      console.log("Gotten bezier handles");
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
      console.warn("Error drawing Bezier spline, using fallback:", error);
      this.drawFallback(ctx, scene);
    }
  }
  // Draw a simple piecewise linear as fallback
  drawFallback(ctx, scene) {
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
  _draw(ctx, scene) {
    if (this.mode == "jagged") {
      this.drawFallback(ctx, scene);
    } else {
      super._draw(ctx, scene);
    }
  }
};

// src/lib/three_d/scene.ts
var Camera3D = class {
  constructor() {
    // Position of the camera in 3D space
    this.pos = [0, 0, 0];
    // The 0th, 1st, and 2nd columns of the camera frame matrix are the
    // x-direction, y-direction, and z-direction of the camera view, respectively.
    // The inverse of the camera frame matrix is the main object that is manipulated.
    this.camera_frame_inv = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    // Determines whether retrieval of the 2D view is perspective or orthographic.
    this.mode = "perspective";
  }
  // Set the camera position
  move_to(pos) {
    this.pos = pos;
  }
  // Translate the camera matrix by a given vector
  move_by(v) {
    this.pos = vec3_sum(this.pos, v);
  }
  // Get the camera frame inverse matrix
  get_camera_frame_inv() {
    return this.camera_frame_inv;
  }
  // Set the camera frame inverse matrix
  set_camera_frame_inv(frame_inv) {
    this.camera_frame_inv = frame_inv;
  }
  // Get the camera frame matrix
  get_camera_frame() {
    return mat_inv(this.camera_frame_inv);
  }
  // Converts a point to camera space
  _to_camera_space(p) {
    return matmul_vec(this.camera_frame_inv, vec3_sub(p, this.pos));
  }
  // Rotate the camera matrix around the z-axis.
  rot_view_z(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_z_matrix(-angle)
    );
  }
  // Rotate the camera matrix around the y-axis.
  rot_view_y(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_y_matrix(-angle)
    );
  }
  // Rotate the camera matrix around the x-axis.
  rot_view_x(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_x_matrix(-angle)
    );
  }
  // Rotate the camera matrix around a given axis
  rot_view(axis, angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_matrix(axis, -angle)
    );
  }
  // Rotates the camera view around various axes
  rot_pos_and_view_z(angle) {
    this.rot_view_z(angle);
    this.move_to(rot_z(this.pos, angle));
  }
  rot_pos_and_view_y(angle) {
    this.rot_view_y(angle);
    this.move_to(rot_y(this.pos, angle));
  }
  rot_pos_and_view_x(angle) {
    this.rot_view_x(angle);
    this.move_to(rot_x(this.pos, angle));
  }
  rot_pos_and_view(axis, angle) {
    this.rot_view(axis, angle);
    this.move_to(rot(this.pos, axis, angle));
  }
  // Projects a 3D point onto the camera view plane. Does not include perspective.
  orthographic_view(p) {
    let [vx, vy, vz] = this._to_camera_space(p);
    return [vx, vy];
  }
  // Projects a 3D point onto the camera view plane, and then divides by the third coordinate.
  // Returns null if the third coordinate is nonpositive (i.e., the point is behind the camera).
  perspective_view(p) {
    let [vx, vy, vz] = this._to_camera_space(p);
    if (vz <= 0) {
      return null;
    } else {
      return [vx / vz, vy / vz];
    }
  }
  // Returns the depth of a point in camera space
  depth(p) {
    let [vx, vy, vz] = this._to_camera_space(p);
    return vz;
  }
};
var ThreeDScene = class extends Scene {
  constructor() {
    super(...arguments);
    this.mobjects = {};
    this.camera = new Camera3D();
    this.mode = "perspective";
  }
  // Groups a collection of mobjects as a MObjectGroup
  group(names, group_name) {
    let group = new ThreeDMObjectGroup();
    names.forEach((name) => {
      group.add_mobj(name, this.get_mobj(name));
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
  // Number of canvas pixels occupied by a horizontal shift of 1 in scene coordinates
  scale() {
    let [xmin, xmax] = this.xlims;
    return this.canvas.width / (xmax - xmin);
  }
  // Modes of viewing/drawing
  set_view_mode(mode) {
    this.mode = mode;
  }
  camera_view(p) {
    if (this.mode == "perspective") {
      return this.camera.perspective_view(p);
    } else {
      return this.camera.orthographic_view(p);
    }
  }
  // Converts a 2D vector in the view to world coordinates
  v2w(v) {
    let frame = this.camera.get_camera_frame();
    return matmul_vec(frame, [v[0], v[1], 0]);
  }
  // Draw
  draw(args) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw_background(ctx);
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
    this.draw_border(ctx);
  }
};

// src/lib/interactive/arcball.ts
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
    let touch = event.touches[0];
    this.dragStart = [
      touch.pageX - this.scene.canvas.offsetLeft,
      touch.pageY - this.scene.canvas.offsetTop
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
    if (this.mode == "Translate") {
      this.scene.camera.move_by(
        matmul_vec(this.scene.camera.get_camera_frame(), [
          dragDiff[0],
          dragDiff[1],
          0
        ])
      );
    } else if (this.mode == "Rotate") {
      let v = vec2_normalize([dragDiff[1], -dragDiff[0]]);
      let rot_axis = matmul_vec(this.scene.camera.get_camera_frame(), [
        v[0],
        v[1],
        0
      ]);
      let n = vec2_norm(dragDiff);
      this.scene.camera.rot_pos_and_view(rot_axis, n);
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
var HeatMapScene = class extends Scene {
  // Target for heatmap data
  constructor(canvas, imageData) {
    super(canvas);
    this.imageData = imageData;
  }
  _draw() {
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      if (mobj instanceof HeatMap) {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context");
        }
        mobj._draw(ctx, this, this.imageData);
      } else {
        mobj.draw(this.canvas, this);
      }
    });
  }
};
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (async function two_dim_random_walk_basic(width, height, num_points, delay_time = 25, trail_length = 10) {
      let canvas = prepare_canvas(width, height, "2d-random-walk");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-20, 20];
      let [ymin, ymax] = [-20, 20];
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
        new TwoHeadedArrow([0, ymin], [0, ymax]).set_stroke_width(0.02)
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";
      async function do_simulation() {
        let points = [];
        for (let i = 0; i < num_points; i++) {
          points.push([0, 0]);
        }
        let x, y;
        let dx, dy;
        let p;
        let line;
        for (let i = 0; i < num_points; i++) {
          let [x2, y2] = points[i];
          let line2 = new LineSequence([[x2, y2]]);
          line2.set_stroke_color("red");
          line2.set_alpha(0.3);
          line2.set_stroke_width(0.1);
          scene.add(`line${i}`, line2);
        }
        for (let i = 0; i < num_points; i++) {
          let [x2, y2] = points[i];
          let p2 = new Dot([x2, y2], 0.3);
          p2.set_color("blue");
          scene.add(`point${i}`, p2);
        }
        let step_number = 0;
        while (true) {
          if (playing) {
            scene.draw();
            let done = step_number > 0;
            for (let i = 0; i < num_points; i++) {
              let [x2, y2] = points[i];
              if (!(x2 == 0 && y2 == 0 && step_number > 0)) {
                done = false;
                [dx, dy] = pick_random_step(2);
                [x2, y2] = [x2 + dx, y2 + dy];
                points[i] = [x2, y2];
                let line2 = scene.get_mobj(`line${i}`);
                line2.add_point([x2, y2]);
                if (line2.points.length > trail_length) {
                  line2.remove_point(0);
                }
                let p2 = scene.get_mobj(`point${i}`);
                p2.move_to([x2, y2]);
                if (x2 == 0 && y2 == 0) {
                  scene.remove(`point${i}`);
                  scene.remove(`line${i}`);
                }
              }
            }
            step_number += 1;
            if (done) {
              await delay(1e3);
              return true;
            }
          }
          await delay(delay_time);
        }
      }
      while (true) {
        await do_simulation();
      }
    })(300, 300, 50);
    (async function one_dim_random_walk_basic(width, height) {
      let canvas = prepare_canvas(width, height, "1d-random-walk");
      let scene = new Scene(canvas);
      let [xmin, xmax] = [-10, 10];
      let [ymin, ymax] = [-10, 10];
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      let tick_size = 0.2;
      scene.add(
        "x-axis",
        new TwoHeadedArrow([xmin, 0], [xmax, 0]).set_stroke_width(0.02)
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";
      const max_path_length = 10;
      async function do_simulation() {
        let x = 0;
        let dx;
        let p = new Dot([x, 0], 0.3);
        p.set_color("blue");
        scene.add("point", p);
        let line = new LineSequence([[x, 0]]);
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
            if (line.points.length > max_path_length) {
              line.remove_point(0);
            }
            p = scene.get_mobj("point");
            p.move_to([x, 0]);
            scene.draw();
            if (x == 0) {
              await delay(500);
              scene.remove("line");
              scene.remove("dot");
              return true;
            }
          }
          await delay(20);
        }
      }
      while (true) {
        await do_simulation();
      }
    })(300, 300);
    (async function three_dim_random_walk_basic(width, height, num_points, delay_time = 25, trail_length = 10) {
      const name = "3d-random-walk";
      let canvas = prepare_canvas(width, height, name);
      let [xmin, xmax] = [-30, 30];
      let [ymin, ymax] = [-30, 30];
      let [zmin, zmax] = [-30, 30];
      let zoom_ratio = 1;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3
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
      scene.draw();
      let arcball = new Arcball(scene);
      arcball.set_mode("Translate");
      arcball.add();
      let playing = false;
      let pauseButton = Button(
        document.getElementById(name + "-pause-button"),
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
      async function do_simulation() {
        let points = [];
        for (let i = 0; i < num_points; i++) {
          points.push([0, 0, 0]);
        }
        let x, y, z;
        let dx, dy, dz;
        let p;
        let line;
        for (let i = 0; i < num_points; i++) {
          let [x2, y2, z2] = points[i];
          let line2 = new LineSequence3D([[x2, y2, z2]]);
          line2.set_stroke_color("red");
          line2.set_alpha(0.3);
          line2.set_stroke_width(0.1);
          scene.add(`line${i}`, line2);
        }
        for (let i = 0; i < num_points; i++) {
          let [x2, y2, z2] = points[i];
          let p2 = new Dot3D([x2, y2, z2], 0.3);
          p2.set_color("blue");
          scene.add(`point${i}`, p2);
        }
        let step_number = 0;
        while (true) {
          if (playing) {
            scene.draw();
            let done = step_number > 0;
            for (let i = 0; i < num_points; i++) {
              let [x2, y2, z2] = points[i];
              if (!(x2 == 0 && y2 == 0 && z2 == 0 && step_number > 0)) {
                done = false;
                [dx, dy, dz] = pick_random_step(3);
                [x2, y2, z2] = [x2 + dx, y2 + dy, z2 + dz];
                points[i] = [x2, y2, z2];
                let line2 = scene.get_mobj(`line${i}`);
                line2.add_point([x2, y2, z2]);
                if (line2.points.length > trail_length) {
                  line2.remove_point(0);
                }
                let p2 = scene.get_mobj(`point${i}`);
                p2.move_to([x2, y2, z2]);
                if (x2 == 0 && y2 == 0 && z2 == 0) {
                  scene.remove(`point${i}`);
                  scene.remove(`line${i}`);
                }
              }
            }
            step_number += 1;
            scene.camera.rot_pos_and_view_z(Math.PI / 1e3);
            if (done) {
              await delay(1e3);
              return true;
            }
          }
          await delay(delay_time);
        }
      }
      while (true) {
        await do_simulation();
      }
    })(300, 300, 50);
    (async function graph_random_walk(num_walks, num_steps) {
      let canvas1 = prepare_canvas(250, 250, "histogram-dim-one");
      let canvas2 = prepare_canvas(250, 250, "histogram-dim-two");
      let canvas3 = prepare_canvas(250, 250, "histogram-dim-three");
      let canvas4 = prepare_canvas(250, 250, "histogram-dim-four");
      let scene1 = new Scene(canvas1);
      let histogram1 = new Histogram();
      histogram1.set_count_limits(0, num_walks);
      histogram1.set_bin_limits(0, 100);
      scene1.add("histogram", histogram1);
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
      let scene4 = new Scene(canvas4);
      let histogram4 = new Histogram();
      histogram4.set_count_limits(0, num_walks);
      histogram4.set_bin_limits(0, 100);
      scene4.add("histogram", histogram4);
      let step = 0;
      let points1 = [];
      let points2 = [];
      let points3 = [];
      let points4 = [];
      let hist_data1 = {};
      let hist_data2 = {};
      let hist_data3 = {};
      let hist_data4 = {};
      function reset_simulation() {
        points1 = [];
        for (let i = 0; i < num_walks; i++) {
          points1.push([0]);
        }
        points2 = [];
        for (let i = 0; i < num_walks; i++) {
          points2.push([0, 0]);
        }
        points3 = [];
        for (let i = 0; i < num_walks; i++) {
          points3.push([0, 0, 0]);
        }
        points4 = [];
        for (let i = 0; i < num_walks; i++) {
          points4.push([0, 0, 0, 0]);
        }
        hist_data1 = {};
        hist_data2 = {};
        hist_data3 = {};
        hist_data4 = {};
        step = 0;
        scene1.get_mobj("histogram").set_hist(hist_data1);
        scene2.get_mobj("histogram").set_hist(hist_data2);
        scene3.get_mobj("histogram").set_hist(hist_data3);
        scene4.get_mobj("histogram").set_hist(hist_data4);
        scene1.draw();
        scene2.draw();
        scene3.draw();
        scene4.draw();
      }
      reset_simulation();
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
      pauseButton.textContent = "Unpause simulation";
      pauseButton.style.padding = "15px";
      let reset = false;
      let resetButton = Button(
        document.getElementById("random-walk-reset-button"),
        function() {
          reset = true;
        }
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";
      let displayButton = Button(
        document.getElementById("random-walk-display-button"),
        function() {
        }
      );
      displayButton.textContent = "Simulation time: 0";
      displayButton.style.padding = "15px";
      let counterButton1 = Button(
        document.getElementById("random-walk-count-button-1"),
        function() {
        }
      );
      counterButton1.textContent = "Fraction returned to origin: 0";
      counterButton1.style.padding = "15px";
      let counterButton2 = Button(
        document.getElementById("random-walk-count-button-2"),
        function() {
        }
      );
      counterButton2.textContent = "Fraction returned to origin: 0";
      counterButton2.style.padding = "15px";
      let counterButton3 = Button(
        document.getElementById("random-walk-count-button-3"),
        function() {
        }
      );
      counterButton3.textContent = "Fraction returned to origin: 0";
      counterButton3.style.padding = "15px";
      let counterButton4 = Button(
        document.getElementById("random-walk-count-button-4"),
        function() {
        }
      );
      counterButton4.textContent = "Fraction returned to origin: 0";
      counterButton4.style.padding = "15px";
      let x, y, z, w;
      let dx, dy, dz, dw;
      let dist;
      while (step < num_steps) {
        if (reset) {
          reset_simulation();
          reset = false;
        } else if (playing) {
          hist_data1 = { 0: num_walks };
          hist_data2 = { 0: num_walks };
          hist_data3 = { 0: num_walks };
          hist_data4 = { 0: num_walks };
          for (let i = 0; i < num_walks; i++) {
            [x] = points1[i];
            if (x == 0 && step > 0) {
              continue;
            } else {
              [dx] = pick_random_step(1);
              points1[i] = [x + dx];
              dist = Math.abs(x + dx);
              hist_data1[dist] = hist_data1[dist] ? hist_data1[dist] + 1 : 1;
              hist_data1[0] = hist_data1[0] - 1;
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
            [x, y, z, w] = points4[i];
            if (x == 0 && y == 0 && z == 0 && w == 0 && step > 0) {
              continue;
            } else {
              [dx, dy, dz, dw] = pick_random_step(4);
              points4[i] = [x + dx, y + dy, z + dz, w + dw];
              dist = Math.abs(x + dx) + Math.abs(y + dy) + Math.abs(z + dz) + Math.abs(w + dw);
              hist_data4[dist] = hist_data4[dist] ? hist_data4[dist] + 1 : 1;
              hist_data4[0] = hist_data4[0] - 1;
            }
          }
          counterButton1.textContent = `Fraction with distance 0: ${hist_data1[0] / num_walks}`;
          counterButton2.textContent = `Fraction with distance 0: ${hist_data2[0] / num_walks}`;
          counterButton3.textContent = `Fraction with distance 0: ${hist_data3[0] / num_walks}`;
          counterButton4.textContent = `Fraction with distance 0: ${hist_data4[0] / num_walks}`;
          if (step % 2 === 0) {
            scene1.get_mobj("histogram").set_hist(hist_data1);
            scene2.get_mobj("histogram").set_hist(hist_data2);
            scene3.get_mobj("histogram").set_hist(hist_data3);
            scene4.get_mobj("histogram").set_hist(hist_data4);
            scene1.draw();
            scene2.draw();
            scene3.draw();
            scene4.draw();
          }
          step += 1;
        }
        displayButton.textContent = `Simulation time: ${step}`;
        await delay(0.1);
      }
    })(1e4, Infinity);
    async function convolution_visualization(width, height, subpath_lengths) {
      const scene_name = "convolution-visualization";
      let canvas = prepare_canvas(
        width,
        height,
        scene_name + `-${subpath_lengths.length}`
      );
      let scene = new Scene(canvas);
      let type_b_lengths = subpath_lengths;
      let colors = ["red", "green", "blue", "orange"];
      let total_length = type_b_lengths.reduce((acc, val) => acc + val, 0);
      scene.set_frame_lims(
        [-1, 2 * total_length],
        [-total_length, total_length]
      );
      let t_axis = new Arrow([-1, 0], [2 * total_length, 0]).set_stroke_width(
        0.04
      );
      scene.add("t-axis", t_axis);
      let x_axis = new TwoHeadedArrow(
        [0, -total_length],
        [0, total_length]
      ).set_stroke_width(0.04);
      scene.add("x-axis", x_axis);
      function gen_type_a(n) {
        let seq = [];
        for (let i = 0; i < 2 * n; i++) {
          seq.push(1);
        }
        let k = n;
        while (k > 0) {
          let i = Math.floor(Math.random() * 2 * n);
          if (seq[i] == 1) {
            seq[i] = -1;
            k -= 1;
          }
        }
        return seq;
      }
      function gen_type_b(n) {
        if (n == 1) {
          return [1, -1];
        }
        let seq = gen_type_a(n - 1);
        let type_b_seqs = [];
        let subseq = [];
        let sum2 = 0;
        for (let i = 0; i < 2 * n - 2; i++) {
          subseq.push(seq[i]);
          sum2 += seq[i];
          if (sum2 == 0) {
            type_b_seqs.push(subseq);
            subseq = [];
            sum2 = 0;
          }
        }
        for (let i = 0; i < type_b_seqs.length; i++) {
          if (type_b_seqs[i][0] == -1) {
            type_b_seqs[i] = type_b_seqs[i].map((x) => -x);
          }
        }
        let result = [1];
        result = result.concat(
          type_b_seqs.reduce((acc, curr) => acc.concat(curr), [])
        );
        result.push(-1);
        return result;
      }
      while (true) {
        let current_point = [0, 0];
        let length;
        for (let j = 0; j < type_b_lengths.length; j++) {
          length = type_b_lengths[j];
          let type_b_path = gen_type_b(length);
          if (Math.random() < 0.5) {
            type_b_path = type_b_path.map((x) => -x);
          }
          let line = new LineSequence([[current_point[0], current_point[1]]]).set_stroke_color(colors[j % colors.length]).set_stroke_width(0.1);
          for (let i = 0; i < type_b_path.length; i++) {
            current_point[0] += 1;
            current_point[1] += type_b_path[i];
            line.add_point([current_point[0], current_point[1]]);
          }
          scene.add(`type-b-path-${j}`, line);
        }
        scene.draw();
        await delay(1e3);
        for (let j = 0; j < type_b_lengths.length; j++) {
          scene.remove(`type-b-path-${j}`);
        }
      }
    }
    convolution_visualization(250, 250, [20]);
    convolution_visualization(250, 250, [8, 12]);
    convolution_visualization(250, 250, [4, 9, 7]);
    convolution_visualization(250, 250, [5, 3, 8, 4]);
    (function one_dim_integral_graph(width, height) {
      const name = "1d-function-graph";
      const canvas = prepare_canvas(width, height, name);
      const scene = new Scene(canvas);
      let xmin = -Math.PI;
      let xmax = Math.PI;
      let ymin = -0.2;
      let ymax = 10;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      let tick_size = 0.1;
      let x_axis = new TwoHeadedArrow([xmin - 1, 0], [xmax + 1, 0]);
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
        new TwoHeadedArrow([0, ymin - 1], [0, ymax + 1]).set_stroke_width(0.02)
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
      const graph_1 = new ParametricFunction(
        (t) => {
          return [t, 1 / (1 - Math.cos(t))];
        },
        -Math.PI,
        -0.05,
        100,
        null
      ).set_stroke_width(0.03);
      graph_1.set_mode("jagged");
      const graph_2 = new ParametricFunction(
        (t) => {
          return [t, 1 / (1 - Math.cos(t))];
        },
        0.05,
        Math.PI,
        100,
        null
      ).set_stroke_width(0.03);
      graph_1.set_mode("jagged");
      scene.add("graph_1", graph_1);
      scene.add("graph_2", graph_2);
      scene.draw();
    })(300, 300);
    (function two_dim_integral_graph(width, height) {
      const name = "2d-function-heatmap";
      const canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      const scene = new HeatMapScene(canvas, imageData);
      let xmin = -Math.PI;
      let xmax = Math.PI;
      let ymin = -Math.PI;
      let ymax = Math.PI;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      let valArray = Array.from(
        { length: width },
        (_, x) => Array.from({ length: height }, (_2, y) => {
          const xVal = xmin + (xmax - xmin) * x / width;
          const yVal = ymin + (ymax - ymin) * y / height;
          if (xVal == 0 && yVal == 0) {
            return 100;
          } else {
            return Math.log(1 / (1 - (Math.cos(xVal) + Math.cos(yVal)) / 2));
          }
        })
      );
      let heatmap = new HeatMap(width, height, 0, 1e4, valArray.flat());
      scene.add("heatmap", heatmap);
      let x_axis = new TwoHeadedArrow([xmin - 0.5, 0], [xmax + 0.5, 0]);
      x_axis.set_stroke_width(0.02);
      scene.add("x-axis", x_axis);
      for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
        if (x == 0) {
          continue;
        }
        let xline = new Line([x, ymin], [x, ymax]).set_stroke_width(0.01);
        xline.set_alpha(0.3);
        scene.add(`x-line-(${x})`, xline);
      }
      scene.add(
        "y-axis",
        new TwoHeadedArrow([0, ymin - 0.5], [0, ymax + 0.5]).set_stroke_width(
          0.02
        )
      );
      for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
        if (y == 0) {
          continue;
        }
        let yline = new Line([xmin, y], [xmax, y]).set_stroke_width(0.01);
        yline.set_alpha(0.3);
        scene.add(`y-line-(${y})`, yline);
      }
      scene.draw();
    })(300, 300);
  });
})();
export {
  pick_random_step
};
