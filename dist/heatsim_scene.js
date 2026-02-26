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
function gaussian_normal_pdf(mean, stdev, x) {
  return Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdev, 2))) / (stdev * Math.sqrt(2 * Math.PI));
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
function colorval_to_rgba(color) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
}
function rb_colormap(z) {
  const gray = sigmoid(z);
  if (gray < 0.5) {
    return [512 * gray, 512 * gray, 255, 255];
  } else {
    return [255, 512 * (1 - gray), 512 * (1 - gray), 255];
  }
}
function grayscale_colormap(z) {
  return grayscale_colormap_logarithmic(z, 1);
}
function grayscale_colormap_logarithmic(z, d) {
  let zc = Math.pow(z, 1 / d);
  return [255 * (1 - zc), 255 * (1 - zc), 255 * (1 - zc), 255];
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
function vec3_sum_list(xs) {
  return xs.reduce((acc, x) => vec3_sum(acc, x), [0, 0, 0]);
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
function spherical_to_cartesian(radius, theta_rad, phi_rad) {
  return [
    radius * Math.sin(theta_rad) * Math.cos(phi_rad),
    radius * Math.sin(theta_rad) * Math.sin(phi_rad),
    radius * Math.cos(theta_rad)
  ];
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
var ThreeDLineLikeMObjectGroup = class extends ThreeDMObjectGroup {
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
var PolygonPanel3D = class extends ThreeDFillLikeMObject {
  constructor(points) {
    super();
    this.points = points;
  }
  // TODO Fix this and fix visibility condition
  depth(scene) {
    return scene.camera.depth(
      vec3_scale(vec3_sum_list(this.points), 1 / this.points.length)
    );
  }
  _draw(ctx, scene) {
    let current_point = this.points[0];
    let current_point_camera_view = scene.camera_view(current_point);
    let [cp_x, cp_y] = scene.v2c(current_point_camera_view);
    ctx.moveTo(cp_x, cp_y);
    ctx.beginPath();
    for (let i = 1; i < this.points.length; i++) {
      current_point = this.points[i];
      current_point_camera_view = scene.camera_view(current_point);
      [cp_x, cp_y] = scene.v2c(current_point_camera_view);
      ctx.lineTo(cp_x, cp_y);
    }
    current_point = this.points[0];
    current_point_camera_view = scene.camera_view(current_point);
    [cp_x, cp_y] = scene.v2c(current_point_camera_view);
    ctx.lineTo(cp_x, cp_y);
    ctx.closePath();
    if (this.fill_options.fill) {
      ctx.globalAlpha = ctx.globalAlpha * this.fill_options.fill_alpha;
      ctx.fill();
      ctx.globalAlpha = ctx.globalAlpha / this.fill_options.fill_alpha;
    }
  }
};

// src/lib/base/cartesian.ts
var AxisOptions = class {
  constructor() {
    this.stroke_width = 0.1;
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
var Axis3D = class extends ThreeDMObjectGroup {
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
      axis = new TwoHeadedArrow3D([cmin, 0, 0], [cmax, 0, 0]);
    } else if (this.type === "y") {
      axis = new TwoHeadedArrow3D([0, cmin, 0], [0, cmax, 0]);
    } else {
      axis = new TwoHeadedArrow3D([0, 0, cmin], [0, 0, cmax]);
    }
    axis.set_arrow_size(0.2);
    axis.set_stroke_width(this.axis_options.stroke_width);
    this.add_mobj("axis", axis);
  }
  _make_ticks() {
    let [cmin, cmax] = this.lims;
    let ticks = new ThreeDLineLikeMObjectGroup().set_alpha(0.3);
    for (let c = this.tick_options.distance * Math.floor(cmin / this.tick_options.distance + 1); c < this.tick_options.distance * Math.ceil(cmax / this.tick_options.distance); c += this.tick_options.distance) {
      if (this.type == "x") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D(
            [c, -this.tick_options.size / 2, 0],
            [c, this.tick_options.size / 2, 0]
          )
        );
      } else if (this.type == "y") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D(
            [0, c, -this.tick_options.size / 2],
            [0, c, this.tick_options.size / 2]
          )
        );
      } else if (this.type == "z") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D(
            [-this.tick_options.size / 2, 0, c],
            [this.tick_options.size / 2, 0, c]
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
  }
  set_tick_distance(distance) {
    this.tick_options.distance = distance;
    this.set_tick_options(this.tick_options);
  }
  set_tick_size(size) {
    this.tick_options.size = size;
    this.set_tick_options(this.tick_options);
  }
};
var CoordinateAxes3d = class extends ThreeDMObjectGroup {
  constructor(xlims, ylims, zlims) {
    super();
    this.axis_options = new AxisOptions();
    this.tick_options = new TickOptions();
    this.xlims = xlims;
    this.ylims = ylims;
    this.zlims = zlims;
    this._make_axes();
  }
  _make_axes() {
    let x_axis = new Axis3D(this.xlims, "x");
    x_axis.set_axis_options(this.axis_options);
    x_axis.set_tick_options(this.tick_options);
    this.add_mobj("x-axis", x_axis);
    let y_axis = new Axis3D(this.ylims, "y");
    y_axis.set_axis_options(this.axis_options);
    y_axis.set_tick_options(this.tick_options);
    this.add_mobj("y-axis", y_axis);
    let z_axis = new Axis3D(this.zlims, "z");
    z_axis.set_axis_options(this.axis_options);
    z_axis.set_tick_options(this.tick_options);
    this.add_mobj("z-axis", z_axis);
  }
  x_axis() {
    return this.get_mobj("x-axis");
  }
  y_axis() {
    return this.get_mobj("y-axis");
  }
  z_axis() {
    return this.get_mobj("z-axis");
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
  }
  set_tick_distance(distance) {
    this.tick_options.distance = distance;
    this.set_tick_options(this.tick_options);
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

// src/lib/interactive/slider.ts
function Slider(container, callback, kwargs) {
  let slider = document.createElement("input");
  slider.type = "range";
  slider.value = kwargs.initial_value;
  slider.classList.add("slider");
  slider.id = "floatSlider";
  slider.width = 200;
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

// src/lib/simulator/sim.ts
var Simulator = class {
  // Length of time in each simulation step
  constructor(dt) {
    this.time = 0;
    this.dt = dt;
  }
  reset() {
    this.time = 0;
  }
  step() {
    this.time += this.dt;
  }
  // Generic setter.
  set_attr(name, val) {
    if (name in this) {
      this[name] = val;
    }
  }
  // Reveals version of internal state for drawing purposes
  get_drawable() {
    return this.get_uValues();
  }
  // Returns full internal state
  get_uValues() {
    return [];
  }
  get_time() {
    return this.time;
  }
  get_dt() {
    return this.dt;
  }
};
var SceneFromSimulator = class extends Scene {
  constructor(canvas) {
    super(canvas);
  }
  reset() {
  }
  update_mobjects_from_simulator(simulator) {
  }
  toggle_pause() {
  }
  toggle_unpause() {
  }
};
var ThreeDSceneFromSimulator = class extends ThreeDScene {
  constructor(canvas) {
    super(canvas);
  }
  reset() {
  }
  update_mobjects_from_simulator(simulator) {
  }
  toggle_pause() {
  }
  toggle_unpause() {
  }
};
var InteractiveHandler = class {
  // Number of simulator steps before updating scenes
  constructor(simulator) {
    this.scenes = [];
    this.action_queue = [];
    this.paused = true;
    this.time = 0;
    this.dt = 0.01;
    // Store a known end-time in case the simulation is paused and unpaused
    this.num_steps_per_frame = 1;
    this.simulator = simulator;
  }
  // Adds a scene
  add_scene(scene) {
    scene.update_mobjects_from_simulator(this.simulator);
    this.scenes.push(scene);
  }
  // Draws all scenes
  draw() {
    for (let scene of this.scenes) {
      scene.draw();
    }
  }
  // Set and modify the simulator
  get_simulator() {
    return this.simulator;
  }
  set_simulator_attr(simulator_ind, attr_name, attr_val) {
    this.simulator.set_attr(attr_name, attr_val);
  }
  set_num_steps_per_frame(num_steps) {
    this.num_steps_per_frame = num_steps;
    return this;
  }
  add_pause_button(container) {
    let self = this;
    let pauseButton = Button(container, function() {
      self.add_to_queue(self.toggle_pause.bind(self));
      pauseButton.textContent = pauseButton.textContent == "Pause simulation" ? "Unpause simulation" : "Pause simulation";
    });
    pauseButton.textContent = this.paused ? "Unpause simulation" : "Pause simulation";
    return pauseButton;
  }
  // Restarts the simulator
  reset() {
    this.simulator.reset();
    this.time = 0;
    for (let scene of this.scenes) {
      scene.reset();
      scene.update_mobjects_from_simulator(this.simulator);
      scene.draw();
    }
  }
  // Switches from paused to unpaused and vice-versa.
  toggle_pause() {
    this.paused = !this.paused;
    if (!this.paused) {
      for (let scene of this.scenes) {
        scene.toggle_unpause();
      }
      this.play(this.end_time);
    } else {
      for (let scene of this.scenes) {
        scene.toggle_pause();
      }
    }
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback) {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Starts animation
  async play(until) {
    if (this.paused) {
      this.end_time = until;
      return;
    } else {
      if (this.action_queue.length > 0) {
        let callback = this.action_queue.shift();
        callback();
      } else if (this.time > until) {
        return;
      } else {
        for (let i = 0; i < this.num_steps_per_frame; i++) {
          this.simulator.step();
        }
        this.time = this.simulator.get_time();
        for (let scene of this.scenes) {
          scene.update_mobjects_from_simulator(this.simulator);
          scene.draw();
        }
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
};

// src/lib/simulator/statesim.ts
var StateSimulator = class extends Simulator {
  // Size of the array of values storing the state
  constructor(state_size, dt) {
    super(dt);
    this.state_size = state_size;
    this.vals = new Array(this.state_size).fill(0);
  }
  // Resets the simulation
  reset() {
    super.reset();
    this.vals = new Array(this.state_size).fill(0);
    this.set_boundary_conditions(this.vals, 0);
  }
  // Getter and setter for state.
  get_vals() {
    return this.vals;
  }
  set_vals(vals) {
    this.vals = vals;
  }
  set_val(index, value) {
    this.vals[index] = value;
  }
  // Time-derivative of a given state and time. Overwritten in subclasses.
  dot(vals, time) {
    return new Array(this.state_size).fill(0);
  }
  // Subroutine for adding any time-evolution calculation
  // which does not adhere to the differential equation. Used in step().
  set_boundary_conditions(s, t) {
  }
  // Advances the simulation using the differential equation with
  // s(t + dt) = s(t) + dt * s'(t)
  step_finite_diff() {
    let newS = new Array(this.state_size).fill(0);
    let dS = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt * dS[i];
    }
    this.set_boundary_conditions(newS, this.time + this.dt);
    this.set_vals(newS);
    this.time += this.dt;
  }
  // Advances the simulation using the differential equation with the Runge-Kutta method.
  step_runge_kutta() {
    let newS = new Array(this.state_size).fill(0);
    let dS_1 = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt / 2 * dS_1[i];
    }
    this.set_boundary_conditions(newS, this.time + this.dt / 2);
    let dS_2 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt / 2 * dS_2[i];
    }
    this.set_boundary_conditions(newS, this.time + this.dt / 2);
    let dS_3 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt * dS_3[i];
    }
    this.set_boundary_conditions(newS, this.time + this.dt);
    let dS_4 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt / 6 * dS_1[i] + this.dt / 3 * dS_2[i] + this.dt / 3 * dS_3[i] + this.dt / 6 * dS_4[i];
    }
    this.set_boundary_conditions(newS, this.time + this.dt);
    this.set_vals(newS);
    this.time += this.dt;
  }
  step() {
    return this.step_runge_kutta();
  }
};
var TwoDimState = class {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  index(x, y) {
    return y * this.width + x;
  }
  // One-sided derivative f(x + 1) - f(x)
  d_x_plus(arr, x, y) {
    if (x == this.width - 1) {
      return -arr[this.index(x, y)];
    } else {
      return arr[this.index(x + 1, y)] - arr[this.index(x, y)];
    }
  }
  // One-sided derivative f(x) - f(x - 1)
  d_x_minus(arr, x, y) {
    if (x == 0) {
      return arr[this.index(x, y)];
    } else {
      return arr[this.index(x, y)] - arr[this.index(x - 1, y)];
    }
  }
  // One-sided derivative f(y + 1) - f(y)
  d_y_plus(arr, x, y) {
    if (y == this.height - 1) {
      return -arr[this.index(x, y)];
    } else {
      return arr[this.index(x, y + 1)] - arr[this.index(x, y)];
    }
  }
  // One-sided derivative f(y) - f(y - 1)
  d_y_minus(arr, x, y) {
    if (y == 0) {
      return arr[this.index(x, y)];
    } else {
      return arr[this.index(x, y)] - arr[this.index(x, y - 1)];
    }
  }
  // d/dx, computed as (f(x + 1) - f(x - 1)) / 2.
  d_x_entry(arr, x, y) {
    if (x == 0) {
      return (2 * arr[this.index(2, y)] - 2 * arr[this.index(0, y)] - arr[this.index(3, y)] + arr[this.index(1, y)]) / 2;
    } else if (x == this.width - 1) {
      return (2 * arr[this.index(this.width - 1, y)] - 2 * arr[this.index(this.width - 3, y)] - arr[this.index(this.width - 2, y)] + arr[this.index(this.width - 4, y)]) / 2;
    } else {
      return (arr[this.index(x + 1, y)] - arr[this.index(x - 1, y)]) / 2;
    }
  }
  // d/dy, computed as (f(y + 1) - f(y - 1)) / 2.
  d_y_entry(arr, x, y) {
    if (y == 0) {
      return (2 * arr[this.index(x, 2)] - 2 * arr[this.index(x, 0)] - arr[this.index(x, 3)] + arr[this.index(x, 1)]) / 2;
    } else if (y == this.height - 1) {
      return (2 * arr[this.index(x, this.height - 1)] - 2 * arr[this.index(x, this.height - 3)] - arr[this.index(x, this.height - 2)] + arr[this.index(x, this.height - 4)]) / 2;
    } else {
      return (arr[this.index(x, y + 1)] - arr[this.index(x, y - 1)]) / 2;
    }
  }
  // (d/dx)^2, computed as f(x + 1) - 2f(x) + f(x - 1).
  // At the boundaries, use a linear extrapolation.
  // TODO Maybe better to assume zero outside of the array.
  l_x_entry(arr, x, y) {
    if (x == 0) {
      return 2 * arr[this.index(0, y)] - 5 * arr[this.index(1, y)] + 4 * arr[this.index(2, y)] - arr[this.index(3, y)];
    } else if (x == this.width - 1) {
      return 2 * arr[this.index(this.width - 1, y)] - 5 * arr[this.index(this.width - 2, y)] + 4 * arr[this.index(this.width - 3, y)] - arr[this.index(this.width - 4, y)];
    } else {
      return arr[this.index(x + 1, y)] - 2 * arr[this.index(x, y)] + arr[this.index(x - 1, y)];
    }
  }
  // (d/dy)^2, computed as f(y + 1) - 2f(y) + f(y - 1).
  l_y_entry(arr, x, y) {
    if (y == 0) {
      return 2 * arr[this.index(x, 0)] - 5 * arr[this.index(x, 1)] + 4 * arr[this.index(x, 2)] - arr[this.index(x, 3)];
    } else if (y == this.height - 1) {
      return 2 * arr[this.index(x, this.height - 1)] - 5 * arr[this.index(x, this.height - 2)] + 4 * arr[this.index(x, this.height - 3)] - arr[this.index(x, this.height - 4)];
    } else {
      return arr[this.index(x, y + 1)] - 2 * arr[this.index(x, y)] + arr[this.index(x, y - 1)];
    }
  }
};
var SphericalState = class {
  constructor(num_theta, num_phi) {
    if (num_phi % 2 !== 0) {
      throw new Error("num_phi must be even");
    }
    this.num_theta = num_theta;
    this.num_phi = num_phi;
  }
  index(theta, phi) {
    return theta + phi * (this.num_theta + 1);
  }
  new_arr() {
    return new Array((this.num_theta + 1) * this.num_phi).fill(0);
  }
  // Takes an array of shape (num_theta + 1, num_phi) and downshifts it to shape (num_theta, num_phi)
  // by averaging adjacent rows.
  downshift_values(vals) {
    let downshifted_vals = new Array(this.num_theta * this.num_phi);
    let ind;
    for (let phi = 0; phi < this.num_phi; phi++) {
      for (let theta = 0; theta < this.num_theta; theta++) {
        ind = phi * this.num_theta + theta;
        let val = (vals[this.index(theta, phi)] + vals[this.index(theta + 1, phi)]) / 2;
        downshifted_vals[ind] = val;
      }
    }
    return downshifted_vals;
  }
  dtheta() {
    return Math.PI / this.num_theta;
  }
  dphi() {
    return 2 * Math.PI / this.num_phi;
  }
  get_val(arr, theta, phi) {
    return arr[this.index(theta, phi)];
  }
  l_entry(arr, theta, phi) {
    let theta_val = theta * Math.PI / this.num_theta;
    let l_theta, l_phi;
    if (theta == 0) {
      l_theta = -this.num_phi * this.get_val(arr, 0, phi);
      for (let p = 0; p < this.num_phi; p++) {
        l_theta += this.get_val(arr, 1, p);
      }
      l_theta *= 2 / this.num_phi;
      l_theta *= 1 / this.dtheta() ** 2;
      return l_theta;
    } else if (theta == this.num_theta) {
      l_theta = -this.num_phi * this.get_val(arr, this.num_theta, phi);
      for (let p = 0; p < this.num_phi; p++) {
        l_theta += this.get_val(arr, this.num_theta - 1, p);
      }
      l_theta *= 2 / this.num_phi;
      l_theta *= 1 / this.dtheta() ** 2;
      return l_theta;
    } else {
      l_theta = (this.get_val(arr, theta + 1, phi) + this.get_val(arr, theta - 1, phi) - 2 * this.get_val(arr, theta, phi)) / this.dtheta() ** 2;
      l_theta += (this.get_val(arr, theta + 1, phi) - this.get_val(arr, theta - 1, phi)) / (2 * this.dtheta() * Math.tan(theta_val));
      l_phi = (this.get_val(arr, theta, (phi + 1) % this.num_phi) + this.get_val(arr, theta, (phi + this.num_phi - 1) % this.num_phi) - 2 * this.get_val(arr, theta, phi)) / (this.dphi() * Math.sin(theta_val)) ** 2;
      return l_theta + l_phi;
    }
  }
};

// src/lib/simulator/heatsim.ts
var HeatSimTwoDim = class extends StateSimulator {
  constructor(width, height, dt) {
    super(width * height, dt);
    this.heat_propagation_speed = 20;
    this.width = width;
    this.height = height;
    this._two_dim_state = new TwoDimState(width, height);
  }
  size() {
    return this.width * this.height;
  }
  index(x, y) {
    return this._two_dim_state.index(x, y);
  }
  set_heat_propagation_speed(speed) {
    this.heat_propagation_speed = speed;
  }
  // Named portions of the state values
  get_uValues() {
    return this._get_uValues(this.vals);
  }
  _get_uValues(vals) {
    return vals.slice(0, this.size());
  }
  // Sets the initial conditions of the simulation
  set_init_conditions(u0) {
    for (let i = 0; i < this.size(); i++) {
      this.vals[i] = u0[i];
    }
    this.time = 0;
    this.set_boundary_conditions(this.vals, this.time);
  }
  laplacian_entry(vals, x, y) {
    return this._two_dim_state.l_x_entry(vals, x, y) + this._two_dim_state.l_y_entry(vals, x, y);
  }
  dot(vals, time) {
    let dS = new Array(this.state_size);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        dS[this.index(x, y)] = this.heat_propagation_speed * this.laplacian_entry(vals, x, y);
      }
    }
    return dS;
  }
};
var HeatSimSpherical = class extends StateSimulator {
  constructor(num_theta, num_phi, dt) {
    super((num_theta + 1) * num_phi, dt);
    this.heat_propagation_speed = 20;
    this.num_theta = num_theta;
    this.num_phi = num_phi;
    this._spherical_state = new SphericalState(num_theta, num_phi);
  }
  // Size of the 2D grid
  size() {
    return this.num_theta * this.num_phi;
  }
  index(x, y) {
    return this._spherical_state.index(x, y);
  }
  set_heat_propagation_speed(speed) {
    this.heat_propagation_speed = speed;
  }
  // Named portions of the state values
  get_uValues() {
    return this._get_uValues(this.vals);
  }
  _get_uValues(vals) {
    return vals.slice(0, this.size());
  }
  // Downshifts the value array from shape (num_theta + 1, num_phi) to (num_theta, num_phi)
  // by averaging adjacent rows.
  get_drawable() {
    return this._spherical_state.downshift_values(this.get_uValues());
  }
  // Sets the initial conditions of the simulation
  set_init_conditions(u0) {
    for (let i = 0; i < this.size(); i++) {
      this.vals[i] = u0[i];
    }
    this.time = 0;
    this.set_boundary_conditions(this.vals, this.time);
  }
  laplacian_entry(vals, theta, phi) {
    return this._spherical_state.l_entry(vals, theta, phi);
  }
  dot(vals, time) {
    let dS = new Array(this.state_size).fill(0);
    for (let theta = 0; theta <= this.num_theta; theta++) {
      for (let phi = 0; phi < this.num_phi; phi++) {
        dS[this.index(theta, phi)] = this.heat_propagation_speed * this.laplacian_entry(vals, theta, phi);
      }
    }
    return dS;
  }
};
var HeatSimPoles = class extends HeatSimSpherical {
  constructor(num_theta, num_phi, dt) {
    super(num_theta, num_phi, dt);
    this.n_pole_temp = 20;
    this.s_pole_temp = -20;
    // Heat/cold sources are modeled locally using a normal distribution, to avoid sharp edges
    this.bump_std = 0.05;
    this.bump_vals = [];
    this._make_bump_vals();
  }
  _make_bump_vals() {
    let i = 0;
    let bump_val = gaussian_normal_pdf(
      0,
      this.bump_std,
      i * Math.PI / this.num_theta
    );
    this.bump_vals = [];
    while (bump_val > 0.2) {
      this.bump_vals.push(bump_val);
      i++;
      bump_val = gaussian_normal_pdf(
        0,
        this.bump_std,
        i * Math.PI / this.num_theta
      );
    }
  }
  set_n_pole_temp(temp) {
    this.n_pole_temp = temp;
  }
  set_s_pole_temp(temp) {
    this.s_pole_temp = temp;
  }
  set_boundary_conditions(s, t) {
    for (let phi = 0; phi < this.num_phi; phi++) {
      for (let j = 0; j < this.bump_vals.length; j++) {
        let bump_val = this.bump_vals[j];
        s[this.index(j, phi)] = this.n_pole_temp * bump_val;
        s[this.index(this.num_theta - j, phi)] = this.s_pole_temp * bump_val;
      }
    }
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

// src/lib/three_d/surfaces.ts
var SphereHeatMap = class extends ThreeDMObjectGroup {
  constructor(radius, num_theta, num_phi) {
    super();
    this.colormap = rb_colormap;
    this.radius = radius;
    this.num_theta = num_theta;
    this.num_phi = num_phi;
    this._spherical_state = new SphericalState(num_theta - 1, num_phi);
    this._make_panels();
  }
  // Sets the colormap for the MObject
  set_colormap(colormap) {
    this.colormap = colormap;
  }
  // Re-makes the panels
  _make_panels() {
    this.clear();
    let theta_rad, next_theta_rad;
    let phi_rad, next_phi_rad;
    for (let theta = 0; theta < this.num_theta; theta++) {
      theta_rad = Math.PI * theta / this.num_theta;
      next_theta_rad = Math.PI * (theta + 1) / this.num_theta;
      for (let phi = 0; phi < this.num_phi; phi++) {
        phi_rad = 2 * Math.PI * phi / this.num_phi;
        next_phi_rad = 2 * Math.PI * (phi + 1) / this.num_phi;
        this.add_mobj(
          `p_${theta}_${phi}`,
          new PolygonPanel3D([
            spherical_to_cartesian(this.radius, theta_rad, phi_rad),
            spherical_to_cartesian(this.radius, theta_rad, next_phi_rad),
            spherical_to_cartesian(this.radius, next_theta_rad, next_phi_rad),
            spherical_to_cartesian(this.radius, next_theta_rad, phi_rad)
          ]).set_fill_color("red").set_fill_alpha(0.3).set_stroke_width(1e-3)
        );
      }
    }
  }
  // Get the panel at the given theta and phi angles
  get_panel(theta, phi) {
    return this.get_mobj(`p_${theta}_${phi}`);
  }
  // Loads the colors from an array of values with shape (num_theta + 1, num_phi)
  load_colors_from_array(vals) {
    for (let theta = 0; theta < this.num_theta; theta++) {
      for (let phi = 0; phi < this.num_phi; phi++) {
        let val = vals[this._spherical_state.index(theta, phi)];
        this.get_panel(theta, phi).set_fill_color(
          colorval_to_rgba(this.colormap(val))
        );
      }
    }
  }
};
var SphereHeatMapScene = class extends ThreeDSceneFromSimulator {
  constructor(canvas, radius, num_theta, num_phi) {
    super(canvas);
    let sphere = new SphereHeatMap(radius, num_theta, num_phi);
    this.add("sphere", sphere);
  }
  set_colormap(colormap) {
    let sphere = this.get_mobj("sphere");
    sphere.set_colormap(colormap);
  }
  // Load new colors from the simulator
  update_mobjects_from_simulator(simulator) {
    let vals = simulator.get_drawable();
    let sphere = this.get_mobj("sphere");
    sphere.load_colors_from_array(vals);
  }
};

// rust-calc/pkg/rust_calc.js
var rust_calc_exports = {};
__export(rust_calc_exports, {
  HeatSimSphere: () => HeatSimSphere,
  HeatSimTwoDim: () => HeatSimTwoDim2,
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
var HeatSimTwoDim2 = class {
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
if (Symbol.dispose) HeatSimTwoDim2.prototype[Symbol.dispose] = HeatSimTwoDim2.prototype.free;
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
async function createHeatSimTwoDim(width, height, dt) {
  await initWasm();
  if (!HeatSimTwoDim2) {
    throw new Error("HeatSimTwoDim not found in rust-calc exports");
  }
  const HeatSimTwoDim3 = HeatSimTwoDim2;
  let instance;
  try {
    instance = new HeatSimTwoDim3(width, height, dt);
    console.log("HeatSimTwoDim instance created:", instance);
  } catch (error) {
    console.error(
      "Failed to create or initialize HeatSimTwoDimRust instance:",
      error
    );
    throw error;
  }
  return instance;
}
console.log("rust-calc exports:", Object.keys(rust_calc_exports));

// src/heatsim_scene.ts
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    await (async function heatsim_2d(width, height) {
      const name = "heatsim-2d";
      let canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      let dt = 0.01;
      class Sim extends HeatSimTwoDim {
        constructor() {
          super(...arguments);
          this.center_temperature = 10;
          this.boundary_temperature = 0;
        }
        set_center_temperature(temp) {
          this.center_temperature = temp;
        }
        set_boundary_temperature(temp) {
          this.boundary_temperature = temp;
        }
        set_boundary_conditions(s, t) {
          let [center_x2, center_y2] = [
            Math.floor(this.width / 2),
            Math.floor(this.height / 2)
          ];
          for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
              s[this.index(center_x2 + i, center_y2 + j)] = this.center_temperature;
            }
          }
          for (let x = 0; x < this.width; x++) {
            s[this.index(x, 0)] = this.boundary_temperature;
            s[this.index(x, this.height - 1)] = this.boundary_temperature;
          }
          for (let y = 0; y < this.height; y++) {
            s[this.index(0, y)] = this.boundary_temperature;
            s[this.index(this.width - 1, y)] = this.boundary_temperature;
          }
        }
      }
      let sim = await createHeatSimTwoDim(width, height, dt);
      sim.set_attr("heat_propagation_speed", 20);
      sim.reset();
      let [center_x, center_y] = [
        Math.floor(width / 2),
        Math.floor(height / 2)
      ];
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          sim.add_point_source(center_x + i, center_y + j, 10);
        }
      }
      for (let x = 0; x < width; x++) {
        sim.add_point_source(x, 0, -10);
        sim.add_point_source(x, height - 1, -10);
      }
      for (let y = 1; y < height - 1; y++) {
        sim.add_point_source(0, y, -10);
        sim.add_point_source(width - 1, y, -10);
      }
      let handler = new InteractiveHandler(sim);
      class S extends SceneFromSimulator {
        constructor(canvas2, width2, height2, imageData2) {
          super(canvas2);
          this.width = width2;
          this.height = height2;
          this.imageData = imageData2;
          let heatmap = new HeatMap(
            width2,
            height2,
            -100,
            100,
            new Array(width2 * height2).fill(0)
          );
          this.add("heatmap", heatmap);
        }
        update_mobjects_from_simulator(simulator) {
          let mobj = this.get_mobj("heatmap");
          mobj.set_vals(simulator.get_uValues());
        }
        draw_mobject(mobj) {
          if (mobj instanceof HeatMap) {
            mobj.draw(this.canvas, this, this.imageData);
          } else {
            mobj.draw(this.canvas, this);
          }
        }
      }
      let scene = new S(canvas, width, height, imageData);
      handler.add_scene(scene);
      handler.draw();
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1")
      );
      let clearButton = Button(
        document.getElementById(name + "-button-2"),
        function() {
          handler.add_to_queue(sim.reset.bind(sim));
        }
      );
      clearButton.textContent = "Clear";
      let c_slider = Slider(
        document.getElementById(name + "-slider-1"),
        function(t) {
          handler.add_to_queue(() => {
            for (let i = 0; i < 25; i++) {
              sim.modify_point_source_amplitude(i, Number(t));
            }
          });
        },
        {
          name: "Center temperature",
          initial_value: "10",
          min: -10,
          max: 10,
          step: 0.05
        }
      );
      let b_slider = Slider(
        document.getElementById(name + "-slider-2"),
        function(t) {
          handler.add_to_queue(() => {
            for (let i = 0; i < 2 * (width + height - 2); i++) {
              sim.modify_point_source_amplitude(i + 25, Number(t));
            }
          });
        },
        {
          name: "Boundary temperature",
          initial_value: "0",
          min: -10,
          max: 10,
          step: 0.05
        }
      );
      handler.play(void 0);
    })(300, 300);
    (function heatsim_sphere(width, height) {
      const name = "heatsim-sphere";
      let canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      let num_theta = 50;
      let num_phi = 100;
      let dt = 1e-3;
      let sim = new HeatSimPoles(num_theta, num_phi, dt);
      let handler = new InteractiveHandler(sim);
      let radius = 1;
      let zoom_ratio = 1;
      let scene = new SphereHeatMapScene(canvas, radius, num_theta, num_phi);
      scene.set_colormap(grayscale_colormap);
      scene.set_frame_lims([-2, 2], [-2, 2]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.camera.move_to([0, 0, -2]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3
      );
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();
      let [xmin, xmax] = [-2, 2];
      let [ymin, ymax] = [-2, 2];
      let [zmin, zmax] = [-2, 2];
      let axes = new CoordinateAxes3d([xmin, xmax], [ymin, ymax], [zmin, zmax]);
      axes.set_tick_size(0.1);
      axes.set_alpha(0.5);
      axes.set_axis_stroke_width(0.01);
      scene.add("axes", axes);
      handler.add_scene(scene);
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1")
      );
      let clearButton = Button(
        document.getElementById(name + "-button-2"),
        function() {
          handler.add_to_queue(sim.reset.bind(sim));
          handler.add_to_queue(handler.draw.bind(handler));
        }
      );
      clearButton.textContent = "Clear";
      let n_slider = Slider(
        document.getElementById(name + "-slider-1"),
        function(t) {
          handler.add_to_queue(() => {
            sim.set_n_pole_temp(Number(t));
          });
        },
        {
          name: "North pole temperature",
          initial_value: "20",
          min: -50,
          max: 50,
          step: 0.05
        }
      );
      let s_slider = Slider(
        document.getElementById(name + "-slider-2"),
        function(t) {
          handler.add_to_queue(() => {
            sim.set_s_pole_temp(Number(t));
          });
        },
        {
          name: "South pole temperature",
          initial_value: "-20",
          min: -50,
          max: 50,
          step: 0.05
        }
      );
      handler.draw();
      handler.play(void 0);
    })(300, 300);
    (async function random_walk_sphere(width, height) {
      const name = "random-walk-sphere";
      let canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      let zoom_ratio = 1;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-2, 2], [-2, 2]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3
      );
      let [xmin, xmax] = [-2, 2];
      let [ymin, ymax] = [-2, 2];
      let [zmin, zmax] = [-2, 2];
      let axes = new CoordinateAxes3d([xmin, xmax], [ymin, ymax], [zmin, zmax]);
      axes.set_tick_size(0.1);
      axes.set_alpha(0.5);
      axes.set_axis_stroke_width(0.01);
      scene.add("axes", axes);
      let radius = 1;
      let point = [0, 0, radius];
      scene.add("point", new Dot3D(point, 0.01).set_color("red"));
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();
      scene.draw();
      let dtheta = 0.01;
      let dt = 1e-3;
      let axis;
      for (let t = 0; t < 10; t += dt) {
        axis = vec3_normalize([
          2 * Math.random() - 1,
          2 * Math.random() - 1,
          2 * Math.random() - 1
        ]);
        point = rot(point, axis, dtheta);
        scene.get_mobj("point").move_to(point);
        scene.camera.rot_pos_and_view_z(dt * Math.PI / 10);
        scene.draw();
        await delay(1);
      }
    })(300, 300);
  });
})();
