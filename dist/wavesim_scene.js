var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/base/vec2.ts
function vec2_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
function vec2_angle(v) {
  return Math.atan2(v[1], v[0]);
}
function vec2_scale(x, factor) {
  return [x[0] * factor, x[1] * factor];
}
function vec2_sum(x, y) {
  return [x[0] + y[0], x[1] + y[1]];
}
function vec2_sum_list(xs) {
  return xs.reduce((acc, x) => vec2_sum(acc, x), [0, 0]);
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
function rb_colormap_2(z) {
  const gray = sigmoid(z);
  if (gray < 0.5) {
    return [0, 0, 512 * (0.5 - gray), 255];
  } else {
    return [512 * (gray - 0.5), 0, 0, 255];
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
var Sector = class extends FillLikeMObject {
  constructor(center, radius, start_angle, end_angle) {
    super();
    this.center = center;
    this.radius = radius;
    this.start_angle = start_angle;
    this.end_angle = end_angle;
  }
  // Get the center coordinates
  get_center() {
    return this.center;
  }
  // Move the center of the dot to a desired location
  move_to(center) {
    this.center = center;
  }
  move_by(p) {
    this.center[0] += p[0];
    this.center[1] += p[1];
  }
  // Change the dot radius
  set_radius(radius) {
    this.radius = radius;
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
var LineSpring = class extends Line {
  constructor(start, end) {
    super(start, end);
    this.mode = "color";
    this.eq_length = 2;
  }
  set_mode(mode) {
    this.mode = mode;
  }
  set_eq_length(length) {
    this.eq_length = length;
  }
  length() {
    let [start_x, start_y] = this.start;
    let [end_x, end_y] = this.end;
    return Math.sqrt((end_x - start_x) ** 2 + (end_y - start_y) ** 2);
  }
  // alpha_scaling(): number {
  //   return Math.min(1.0, this.eq_length / this.length());
  // }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    if (this.mode == "color") {
      ctx.strokeStyle = colorval_to_rgba(
        rb_colormap_2(10 * Math.log(this.eq_length / this.length()))
      );
      ctx.beginPath();
      ctx.moveTo(start_x, start_y);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
    } else {
      let v = [end_x - start_x, end_y - start_y];
      let num_turns = 5;
      let r = 1 - 0.4 * this.eq_length / this.length();
      let theta = Math.atan(8 * (2 * num_turns) / (vec2_norm(v) * r));
      let scaled_v = vec2_scale(v, r / (2 * Math.cos(theta) * num_turns));
      let current_p = [
        start_x + 0.5 * (1 - r) * (end_x - start_x),
        start_y + 0.5 * (1 - r) * (end_y - start_y)
      ];
      ctx.beginPath();
      ctx.moveTo(start_x, start_y);
      ctx.lineTo(current_p[0], current_p[1]);
      current_p = vec2_sum(
        current_p,
        vec2_rot(vec2_scale(scaled_v, 0.5), theta)
      );
      ctx.lineTo(current_p[0], current_p[1]);
      for (let i = 0; i < num_turns - 1; i++) {
        current_p = vec2_sum(current_p, vec2_rot(scaled_v, -theta));
        ctx.lineTo(current_p[0], current_p[1]);
        current_p = vec2_sum(current_p, vec2_rot(scaled_v, theta));
        ctx.lineTo(current_p[0], current_p[1]);
      }
      current_p = vec2_sum(
        current_p,
        vec2_rot(vec2_scale(scaled_v, 0.5), -theta)
      );
      ctx.lineTo(current_p[0], current_p[1]);
      ctx.lineTo(end_x, end_y);
      ctx.stroke();
    }
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
var GridOptions = class {
  constructor() {
    this.distance = 1;
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
    this.add_mobj("axis", axis);
  }
  _make_ticks() {
    let [cmin, cmax] = this.lims;
    let ticks = new LineLikeMObjectGroup().set_alpha(this.tick_options.alpha).set_stroke_width(this.tick_options.stroke_width);
    for (let c = this.tick_options.distance * Math.floor(cmin / this.tick_options.distance + 1); c < this.tick_options.distance * Math.ceil(cmax / this.tick_options.distance); c += this.tick_options.distance) {
      if (this.type == "x") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line(
            [c, -this.tick_options.size / 2],
            [c, this.tick_options.size / 2]
          )
        );
      } else {
        ticks.add_mobj(
          `tick-(${c})`,
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
    for (let x = this.grid_options.distance * Math.floor(xmin / this.grid_options.distance + 1); x < this.grid_options.distance * Math.ceil(xmax / this.grid_options.distance); x += this.grid_options.distance) {
      x_grid.add_mobj(`line-(${x})`, new Line([x, ymin], [x, ymax]));
    }
    this.add_mobj("x-grid", x_grid);
  }
  _make_y_grid_lines() {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;
    let y_grid = new LineLikeMObjectGroup().set_alpha(this.grid_options.alpha).set_stroke_width(this.grid_options.stroke_width);
    for (let y = this.grid_options.distance * Math.floor(ymin / this.grid_options.distance + 1); y < this.grid_options.distance * Math.ceil(ymax / this.grid_options.distance); y += this.grid_options.distance) {
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
    this.grid_options.distance = distance;
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
async function createWaveSimTwoDim(width, height, dt) {
  await initWasm();
  if (!WaveSimTwoDim) {
    throw new Error("WaveSimTwoDim not found in rust-calc exports");
  }
  const WaveSimTwoDim3 = WaveSimTwoDim;
  let instance;
  try {
    instance = new WaveSimTwoDim3(width, height, dt);
    console.log("WaveSimTwoDim instance created:", instance);
  } catch (error) {
    console.error(
      "Failed to create or initialize WaveSimOneDimRust instance:",
      error
    );
    throw error;
  }
  return instance;
}
async function createWaveSimTwoDimElliptical(width, height, dt) {
  await initWasm();
  if (!WaveSimTwoDimElliptical) {
    throw new Error("WaveSimTwoDimElliptical not found in rust-calc exports");
  }
  const WaveSimTwoDimElliptical2 = WaveSimTwoDimElliptical;
  let instance;
  try {
    instance = new WaveSimTwoDimElliptical2(width, height, dt);
    console.log("WaveSimTwoDimElliptical instance created:", instance);
  } catch (error) {
    console.error(
      "Failed to create or initialize WaveSimTwoDimElliptical instance:",
      error
    );
    throw error;
  }
  return instance;
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

// src/lib/interactive/scene_view_translator.ts
var SceneViewTranslator = class {
  // Callbacks which trigger when the object is dragged.
  constructor(scene) {
    this.drag = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.callbacks = [];
    this.scene = scene;
  }
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
  _draw(ctx, scene) {
    if (this.mode == "jagged") {
      this._drawFallback(ctx, scene);
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
var InteractivePlayingThreeDScene = class extends ThreeDScene {
  constructor(canvas, simulators) {
    super(canvas);
    // Store a known end-time in case the simulation is paused and unpaused
    this.linked_scenes = [];
    [this.num_simulators, this.simulators] = simulators.reduce(
      ([ind, acc], item) => (acc[ind] = item, [ind + 1, acc]),
      [0, {}]
    );
    this.action_queue = [];
    this.paused = true;
    this.time = 0;
    this.dt = simulators[0].dt;
    this.linked_scenes = [];
  }
  add_linked_scene(scene) {
    this.linked_scenes.push(scene);
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
  get_simulator(ind = 0) {
    return this.simulators[ind];
  }
  set_simulator_attr(simulator_ind, attr_name, attr_val) {
    this.get_simulator(simulator_ind).set_attr(attr_name, attr_val);
  }
  update_and_draw_linked_scenes() {
    for (let scene of this.linked_scenes) {
      scene.update_mobjects_from_simulator(this.get_simulator(0));
      scene.draw();
    }
  }
  // Restarts the simulator
  reset() {
    for (let ind = 0; ind < this.num_simulators; ind++) {
      this.get_simulator(ind).reset();
    }
    this.time = 0;
    this.draw();
    this.update_and_draw_linked_scenes();
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
  add_to_queue(callback) {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Starts animation
  play(until) {
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
        for (let ind = 0; ind < this.num_simulators; ind++) {
          this.get_simulator(ind).step();
        }
        this.time += this.get_simulator(0).dt;
        this.draw();
        this.update_and_draw_linked_scenes();
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates all mobjects to account for the new simulator state
  update_mobjects() {
  }
  // Draws the scene without worrying about depth-sensing.
  // TODO Sort this out later.
  draw() {
    this.update_mobjects();
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == void 0) throw new Error(`${name} not found`);
      this.draw_mobject(mobj);
    });
  }
  // Add drawing instructions in the subclass.
  draw_mobject(mobj) {
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
var SpringSimulator = class extends StateSimulator {
  constructor(stiffness, dt) {
    super(2, dt);
    this.friction = 0;
    this.stiffness = stiffness;
  }
  set_stiffness(stiffness) {
    this.stiffness = stiffness;
  }
  set_friction(friction) {
    this.friction = friction;
  }
  // Time-derivative of a given state and time. Overwritten in subclasses.
  dot(vals, time) {
    return [
      vals[1],
      -this.stiffness * vals[0] - this.friction * vals[1]
    ];
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

// src/lib/simulator/wavesim.ts
var PointSourceOneDim = class {
  // Time at which the source turns on
  constructor(x, w, a, p) {
    this.x = x;
    this.w = w;
    this.a = a;
    this.p = p;
    this.turn_on_time = 0;
  }
  set_x(x) {
    this.x = x;
  }
  set_w(w) {
    this.w = w;
  }
  set_a(a) {
    this.a = a;
  }
  set_p(p) {
    this.p = p;
  }
  set_turn_on_time(time) {
    this.turn_on_time = time;
  }
};
var PointSource = class {
  // Time at which the source turns on
  constructor(x, y, w, a, p) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.a = a;
    this.p = p;
    this.turn_on_time = 0;
  }
  set_x(x) {
    this.x = x;
  }
  set_y(y) {
    this.y = y;
  }
  set_w(w) {
    this.w = w;
  }
  set_a(a) {
    this.a = a;
  }
  set_p(p) {
    this.p = p;
  }
  set_turn_on_time(time) {
    this.turn_on_time = time;
  }
};
var WaveSimOneDim2 = class extends StateSimulator {
  constructor(width, dt) {
    super(2 * width, dt);
    // Perfectly-matched layers in 1D are implemented as increasing friction coefficients at the boundaries.
    this.pml_layers = {};
    //
    this.wave_propagation_speed = 20;
    // Speed of wave propagation
    this.damping = 0;
    // Damping coefficient
    this.left_endpoint = 0;
    // Left boundary condition
    this.right_endpoint = 0;
    // Left boundary condition
    this.point_sources = {};
    this.width = width;
  }
  remove_pml_layers() {
    this.pml_layers = { 0: [0, 0], 1: [0, 0] };
  }
  set_pml_layer(positive, pml_width, pml_strength) {
    let ind;
    if (positive) {
      ind = 0;
    } else {
      ind = 1;
    }
    this.pml_layers[ind] = [pml_width, pml_strength];
  }
  // Damping contribution from PML layers
  sigma_x(arr_x) {
    let ind, pml_thickness, pml_strength;
    if (arr_x - this.width / 2 >= 0) {
      ind = 0;
    } else {
      ind = 1;
    }
    if (this.pml_layers.hasOwnProperty(ind)) {
      [pml_thickness, pml_strength] = this.pml_layers[ind];
      let relative_distance_from_center = Math.abs(
        -1 + arr_x / (this.width / 2)
      );
      return pml_strength * Math.max(0, relative_distance_from_center + pml_thickness - 1) ** 2;
    } else {
      return 0;
    }
  }
  // Damping contribution globally
  set_damping(damping) {
    this.damping = damping;
  }
  damping_at(arr_x) {
    return this.damping + this.sigma_x(arr_x);
  }
  set_wave_propagation_speed(speed) {
    this.wave_propagation_speed = speed;
  }
  add_point_source(source) {
    let ind = Object.keys(this.point_sources).length;
    this.point_sources[ind] = source;
  }
  remove_point_source(id) {
    delete this.point_sources[id];
  }
  set_left_endpoint(endpoint) {
    this.left_endpoint = endpoint;
  }
  set_right_endpoint(endpoint) {
    this.right_endpoint = endpoint;
  }
  get_uValues() {
    return this._get_uValues(this.vals);
  }
  set_uValues(vals) {
    for (let i = 0; i < this.width; i++) {
      this.vals[i] = vals[i];
    }
  }
  _get_uValues(vals) {
    return vals.slice(0, this.width);
  }
  set_vValues(vals) {
    for (let i = 0; i < this.width; i++) {
      this.vals[i + this.width] = vals[i];
    }
  }
  _get_vValues(vals) {
    return vals.slice(this.width, 2 * this.width);
  }
  laplacian_entry(vals, x) {
    if (x == 0) {
      return 2 * this.laplacian_entry(vals, 1) - this.laplacian_entry(vals, 2);
    } else if (x == this.width - 1) {
      return 2 * this.laplacian_entry(vals, this.width - 2) - this.laplacian_entry(vals, this.width - 3);
    } else {
      return vals[x - 1] - 2 * vals[x] + vals[x + 1];
    }
  }
  // Constructs the time-derivative of the entire state array. Here is where
  // the wave equation is used.
  dot(vals, time) {
    let u = this._get_uValues(vals);
    let dS = vals.slice(this.width, 2 * this.width);
    for (let x = 0; x < this.width; x++) {
      dS.push(
        this.wave_propagation_speed ** 2 * this.laplacian_entry(u, x) - this.damping_at(x) * vals[x + this.width]
      );
    }
    return dS;
  }
  set_boundary_conditions(vals) {
    vals[0] = this.left_endpoint;
    vals[this.width - 1] = this.right_endpoint;
    vals[this.width] = 0;
    vals[2 * this.width - 1] = 0;
    Object.entries(this.point_sources).forEach(([key, elem]) => {
      if (this.time >= elem.turn_on_time) {
        vals[elem.x] = elem.a * Math.sin(elem.w * (this.time - elem.p));
        vals[elem.x + this.width] = elem.a * elem.w * Math.cos(elem.w * (this.time - elem.p));
      }
    });
  }
};
var WaveSimOneDimScene = class extends SceneFromSimulator {
  constructor(canvas, width) {
    super(canvas);
    this.mode = "dots";
    this.arrow_length_scale = 1.5;
    this.include_arrows = true;
    this.width = width;
    let pos, next_pos;
    let eq_line = new Line(this.eq_position(1), this.eq_position(width)).set_stroke_width(0.05).set_stroke_style("dashed").set_stroke_color("gray");
    this.add("eq_line", eq_line);
    let [ymin, ymax] = this.ylims;
    pos = this.eq_position(1);
    let b0 = new Line([pos[0], ymin / 2], [pos[0], ymax / 2]);
    b0.set_stroke_width(0.1);
    this.add("b0", b0);
    pos = this.eq_position(width);
    let b1 = new Line([pos[0], ymin / 2], [pos[0], ymax / 2]);
    b1.set_stroke_width(0.1);
    this.add("b1", b1);
    let eq_length;
    for (let i = 1; i < width; i++) {
      pos = this.eq_position(i);
      next_pos = this.eq_position(i + 1);
      let line = new LineSpring(pos, next_pos).set_stroke_width(
        0.2 / Math.sqrt(width)
      );
      eq_length = vec2_norm(vec2_sub(pos, next_pos));
      line.set_eq_length(eq_length);
      this.add(`l_${i}`, line);
    }
    for (let i = 1; i < width - 1; i++) {
      pos = this.eq_position(i + 1);
      let arrow = new Arrow(
        [pos[0], pos[1]],
        [pos[0], pos[1]]
      ).set_stroke_width(0.05);
      arrow.set_stroke_color("red");
      arrow.set_arrow_size(0);
      this.add(`arr${i + 1}`, arrow);
    }
    for (let i = 0; i < width; i++) {
      pos = this.eq_position(i + 1);
      let mass = new DraggableDot(pos, 0.5 / Math.sqrt(width));
      mass.draggable_x = false;
      mass.draggable_y = true;
      if (i == 0) {
        mass.add_callback(() => {
          this.get_mobj("eq_line").move_start([
            this.eq_position(1)[0],
            mass.get_center()[1]
          ]);
        });
      }
      if (i == width - 1) {
        mass.add_callback(() => {
          this.get_mobj("eq_line").move_end([
            this.eq_position(width)[0],
            mass.get_center()[1]
          ]);
        });
      }
      this.add(`p_${i + 1}`, mass);
    }
  }
  // Add a Bezier curve which tracks with uValues in simulator
  // This step has to be async and therefore cannot be in the constructor.
  async add_curve() {
    let solver = await createSmoothOpenPathBezier(this.width - 1);
    let curve = new BezierSpline(this.width - 1, solver).set_stroke_width(0.02);
    this.add("curve", curve);
  }
  set_mode(mode) {
    this.mode = mode;
  }
  set_arrow_length_scale(scale) {
    this.arrow_length_scale = scale;
  }
  set_dot_radius(radius) {
    for (let i = 0; i < this.width; i++) {
      let mass = this.get_mobj(`p_${i + 1}`);
      mass.set_radius(radius);
    }
  }
  set_frame_lims(xlims, ylims) {
    super.set_frame_lims(xlims, ylims);
    let mobj, pos, next_pos;
    let [ymin, ymax] = this.ylims;
    pos = this.eq_position(1);
    mobj = this.get_mobj("b0");
    mobj.move_start([pos[0], ymin / 2]);
    mobj.move_end([pos[0], ymax / 2]);
    pos = this.eq_position(this.width);
    mobj = this.get_mobj("b1");
    mobj.move_start([pos[0], ymin / 2]);
    mobj.move_end([pos[0], ymax / 2]);
    mobj = this.get_mobj("eq_line");
    mobj.move_start(this.eq_position(1));
    mobj.move_end(this.eq_position(this.width));
    let eq_length;
    for (let i = 1; i < this.width; i++) {
      pos = this.eq_position(i);
      next_pos = this.eq_position(i + 1);
      let line = this.get_mobj(`l_${i}`);
      eq_length = vec2_norm(vec2_sub(pos, next_pos));
      line.set_eq_length(eq_length);
    }
  }
  // Returns the equilibrium position in the scene of the i-th dot.
  eq_position(i) {
    return [
      this.xlims[0] + (i - 0.5) * (this.xlims[1] - this.xlims[0]) / this.width,
      0
    ];
  }
  // Turns draggability on/off
  toggle_pause() {
    for (let i = 0; i < this.width; i++) {
      let dot = this.get_mobj(`p_${i + 1}`);
      dot.draggable_y = true;
    }
  }
  toggle_unpause() {
    for (let i = 0; i < this.width; i++) {
      let dot = this.get_mobj(`p_${i + 1}`);
      dot.draggable_y = false;
    }
  }
  // Moves the dots and curve in the scene to the positions dictated by the wave simulation.
  update_mobjects_from_simulator(sim) {
    let pos, next_pos;
    let disp, next_disp;
    let u = sim.get_uValues();
    let deriv = sim._get_vValues(sim.dot(sim.vals, sim.time));
    if (this.mode == "dots") {
      let dot, line, arrow;
      for (let i = 0; i < this.width; i++) {
        pos = this.eq_position(i + 1);
        disp = u[i];
        dot = this.get_mobj(`p_${i + 1}`);
        dot.move_to([pos[0], pos[1] + disp]);
        if (i != 0 && i != this.width - 1 && this.include_arrows) {
          arrow = this.get_mobj(`arr${i + 1}`);
          arrow.move_start([pos[0], pos[1] + disp]);
          arrow.move_end([
            pos[0],
            pos[1] + disp + this.arrow_length_scale * deriv[i] / 5
          ]);
          arrow.set_arrow_size(
            Math.sqrt(this.arrow_length_scale * Math.abs(deriv[i])) / 10
          );
        }
        if (i < this.width - 1) {
          next_pos = this.eq_position(i + 2);
          next_disp = u[i + 1];
          line = this.get_mobj(`l_${i + 1}`);
          line.move_start([pos[0], pos[1] + disp]);
          line.move_end([next_pos[0], next_pos[1] + next_disp]);
        }
      }
    } else if (this.mode == "curve") {
      let anchors = [];
      for (let i = 0; i < this.width; i++) {
        pos = this.eq_position(i + 1);
        disp = u[i];
        anchors.push([pos[0], pos[1] + disp]);
      }
      let curve = this.get_mobj("curve");
      curve.set_anchors(anchors);
    }
  }
  _draw() {
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      this.draw_mobject(mobj);
    });
  }
  // Draw based on mode
  draw_mobject(mobj) {
    if (mobj instanceof BezierSpline) {
      if (this.mode == "curve") {
        mobj.draw(this.canvas, this);
      }
    } else if (mobj instanceof Dot) {
      if (this.mode == "dots") {
        mobj.draw(this.canvas, this);
      }
    } else if (mobj instanceof LineSpring) {
      if (this.mode == "dots") {
        mobj.draw(this.canvas, this);
      }
    } else if (mobj instanceof Arrow) {
      if (this.include_arrows && this.mode == "dots") {
        mobj.draw(this.canvas, this);
      }
    } else {
      mobj.draw(this.canvas, this);
    }
  }
};
var WaveSimTwoDim2 = class extends StateSimulator {
  constructor(width, height, dt) {
    super(4 * width * height, dt);
    this.pml_layers = {};
    this.wave_propagation_speed = 10;
    this.point_sources = {};
    this.clamp_value = Infinity;
    this.width = width;
    this.height = height;
    this._two_dim_state = new TwoDimState(width, height);
    this.set_pml_layer(true, true, 0.2, 200);
    this.set_pml_layer(true, false, 0.2, 200);
    this.set_pml_layer(false, true, 0.2, 200);
    this.set_pml_layer(false, false, 0.2, 200);
  }
  // Sets the initial conditions of the simulation
  set_init_conditions(x0, v0) {
    for (let i = 0; i < this.size(); i++) {
      this.vals[i] = x0[i];
      this.vals[i + this.size()] = v0[i];
      this.vals[i + 2 * this.size()] = 0;
      this.vals[i + 3 * this.size()] = 0;
    }
    this.time = 0;
    this.set_boundary_conditions(this.vals, this.time);
  }
  add_point_source(source) {
    let ind = Object.keys(this.point_sources).length;
    this.point_sources[ind] = source;
  }
  modify_point_source_x(index, x) {
    if (this.point_sources[index]) {
      this.point_sources[index].x = x;
    }
  }
  modify_point_source_y(index, y) {
    if (this.point_sources[index]) {
      this.point_sources[index].y = y;
    }
  }
  modify_point_source_amplitude(index, amplitude) {
    if (this.point_sources[index]) {
      this.point_sources[index].a = amplitude;
    }
  }
  modify_point_source_frequency(index, frequency) {
    if (this.point_sources[index]) {
      this.point_sources[index].w = frequency;
    }
  }
  modify_point_source_phase(index, phase) {
    if (this.point_sources[index]) {
      this.point_sources[index].p = phase;
    }
  }
  remove_point_source(id) {
    delete this.point_sources[id];
  }
  // *** HELPER FUNCTIONS ***
  // Size of the 2D grid
  size() {
    return this.width * this.height;
  }
  index(x, y) {
    return this._two_dim_state.index(x, y);
  }
  // Named portions of the state values
  get_uValues() {
    return this._get_uValues(this.vals);
  }
  _get_uValues(vals) {
    return vals.slice(0, this.size());
  }
  _get_vValues(vals) {
    return vals.slice(this.size(), 2 * this.size());
  }
  _get_pxValues(vals) {
    return vals.slice(2 * this.size(), 3 * this.size());
  }
  _get_pyValues(vals) {
    return vals.slice(3 * this.size(), 4 * this.size());
  }
  // PML-related TODO Split these off into their own config object?
  // Adds a perfectly matched layer to the specified border of the domain. The magnitude of damping
  // grows as max(0, C(L - x))^2, where C is the pml_strength parameter, L is the pml_width parameter,
  // and x represents the ratio distance(point, border) / distance(center, border). That is, x = 1
  // at the center of the grid, and x = 0 at the border of the grid.
  remove_pml_layers() {
    this.pml_layers = { 0: [0, 0], 1: [0, 0], 2: [0, 0], 3: [0, 0] };
  }
  set_pml_layer(x_direction, positive, pml_width, pml_strength) {
    let ind;
    if (x_direction && positive) {
      ind = 0;
    } else if (x_direction && !positive) {
      ind = 1;
    } else if (!x_direction && positive) {
      ind = 2;
    } else if (!x_direction && !positive) {
      ind = 3;
    } else {
      throw new Error("Invalid PML specification.");
    }
    this.pml_layers[ind] = [pml_width, pml_strength];
  }
  sigma_x(arr_x) {
    let ind, pml_thickness, pml_strength;
    if (arr_x - this.width / 2 >= 0) {
      ind = 0;
    } else {
      ind = 1;
    }
    if (this.pml_layers.hasOwnProperty(ind)) {
      [pml_thickness, pml_strength] = this.pml_layers[ind];
      let relative_distance_from_center = Math.abs(
        -1 + arr_x / (this.width / 2)
      );
      return pml_strength * Math.max(0, relative_distance_from_center + pml_thickness - 1) ** 2;
    } else {
      return 0;
    }
  }
  sigma_y(arr_y) {
    let ind, pml_thickness, pml_strength;
    if (arr_y - this.height / 2 >= 0) {
      ind = 2;
    } else {
      ind = 3;
    }
    if (this.pml_layers.hasOwnProperty(ind)) {
      [pml_thickness, pml_strength] = this.pml_layers[ind];
      let relative_distance_from_center = Math.abs(
        -1 + arr_y / (this.height / 2)
      );
      return pml_strength * Math.max(0, relative_distance_from_center + pml_thickness - 1) ** 2;
    } else {
      return 0;
    }
  }
  // NOTE: All methods below apply to any function f: R^2 -> R. Put them into their own class,
  // which has width and height attributes, and a "index" function. Maybe part of the same
  // interface for TwoDimDrawable? Or TwoDimState?
  d_x_plus(arr, x, y) {
    return this._two_dim_state.d_x_plus(arr, x, y);
  }
  d_x_minus(arr, x, y) {
    return this._two_dim_state.d_x_minus(arr, x, y);
  }
  d_y_plus(arr, x, y) {
    return this._two_dim_state.d_y_plus(arr, x, y);
  }
  d_y_minus(arr, x, y) {
    return this._two_dim_state.d_y_minus(arr, x, y);
  }
  d_x_entry(arr, x, y) {
    return this._two_dim_state.d_x_entry(arr, x, y);
  }
  d_y_entry(arr, x, y) {
    return this._two_dim_state.d_y_entry(arr, x, y);
  }
  l_x_entry(arr, x, y) {
    return this._two_dim_state.l_x_entry(arr, x, y);
  }
  l_y_entry(arr, x, y) {
    return this._two_dim_state.l_y_entry(arr, x, y);
  }
  // (d/dx)^2 + (d/dy)^2
  laplacian_entry(vals, x, y) {
    return this.l_x_entry(vals, x, y) + this.l_y_entry(vals, x, y);
  }
  wps(x, y) {
    return this.wave_propagation_speed;
  }
  // Constructs the time-derivative of the entire state array. Here is where
  // the wave equation is used.
  dot(vals, time) {
    let dS = new Array(this.state_size);
    let ind, sx, sy;
    let u = this._get_uValues(vals);
    let px = this._get_pxValues(vals);
    let py = this._get_pyValues(vals);
    for (let ind2 = 0; ind2 < this.size(); ind2++) {
      dS[ind2] = vals[ind2 + this.size()];
    }
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        dS[ind + this.size()] = this.wps(x, y) ** 2 * this.laplacian_entry(u, x, y) + this.d_x_entry(px, x, y) + this.d_y_entry(py, x, y) - (this.sigma_x(x) + this.sigma_y(y)) * vals[ind + this.size()] - this.sigma_x(x) * this.sigma_y(y) * vals[ind];
      }
    }
    for (let x = 0; x < this.width; x++) {
      sx = this.sigma_x(x);
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        dS[ind + 2 * this.size()] = -sx * px[ind] + this.wps(x, y) ** 2 * (this.sigma_y(y) - sx) * this.d_x_entry(u, x, y);
      }
    }
    for (let y = 0; y < this.height; y++) {
      sy = this.sigma_y(y);
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        dS[ind + 3 * this.size()] = -sy * py[ind] + this.wps(x, y) ** 2 * (this.sigma_x(x) - sy) * this.d_y_entry(u, x, y);
      }
    }
    return dS;
  }
  // Add point sources
  set_boundary_conditions(s, t) {
    let ind;
    Object.entries(this.point_sources).forEach(([key, elem]) => {
      if (t >= elem.turn_on_time) {
        ind = this.index(elem.x, elem.y);
        s[ind] = elem.a * Math.sin(elem.w * (t - elem.p));
        s[ind + this.size()] = elem.a * elem.w * Math.cos(elem.w * (t - elem.p));
      }
    });
    for (let ind2 = 0; ind2 < this.state_size; ind2++) {
      this.vals[ind2] = clamp(
        this.vals[ind2],
        -this.clamp_value,
        this.clamp_value
      );
    }
  }
};
var WaveSimTwoDimPointsHeatmapScene = class extends SceneFromSimulator {
  constructor(canvas, width, height) {
    super(canvas);
    this.width = width;
    this.height = height;
    this.construct_scene();
  }
  // Populates the mobjects in the scene
  construct_scene() {
    for (let i = 0; i < this.width - 1; i++) {
      for (let j = 0; j < this.height; j++) {
        this.add(
          `l(${i},${j})(${i + 1},${j})`,
          new Line(this.eq_position(i, j), this.eq_position(i + 1, j)).set_stroke_width(0.05).set_alpha(0.6)
        );
      }
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height - 1; j++) {
        this.add(
          `l(${i},${j})(${i},${j + 1})`,
          new Line(this.eq_position(i, j), this.eq_position(i, j + 1)).set_stroke_width(0.05).set_alpha(0.6)
        );
      }
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let dot = new Dot(this.eq_position(i, j), 0.15);
        this.add(`p(${i},${j})`, dot);
      }
    }
  }
  // Resets the mobjects in the scene.
  set_frame_lims(xlims, ylims) {
    super.set_frame_lims(xlims, ylims);
    this.clear();
    this.construct_scene();
  }
  eq_position(i, j) {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;
    return [
      xmin + (i + 0.5) * (xmax - xmin) / this.width,
      ymin + (j + 0.5) * (ymax - ymin) / this.height
    ];
  }
  update_mobjects_from_simulator(sim) {
    let vals = sim.get_uValues();
    let new_z, new_color;
    let dot;
    let width_buffer = Math.floor((sim.width - this.width) / 2);
    let height_buffer = Math.floor((sim.height - this.height) / 2);
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        new_z = vals[sim.index(i + width_buffer, j + height_buffer)];
        let new_color2 = colorval_to_rgba(rb_colormap_2(2 * new_z));
        dot = this.get_mobj(`p(${i},${j})`);
        dot.set_color(new_color2);
      }
    }
  }
};
var WaveSimTwoDimHeatMapScene = class extends SceneFromSimulator {
  // Target for heatmap data
  constructor(canvas, imageData, width, height) {
    super(canvas);
    this.add(
      "heatmap",
      new HeatMap(width, height, -1, 1, new Array(width * height).fill(0))
    );
    this.imageData = imageData;
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
};
var WaveSimTwoDimThreeDScene = class extends InteractivePlayingThreeDScene {
  constructor(canvas, simulator, width, height) {
    super(canvas, [simulator]);
    this.rotation_speed = 0.01;
    this.simulator = simulator;
    this.width = width;
    this.height = height;
    this.construct_scene();
  }
  width_buffer() {
    return Math.floor((this.simulator.width - this.width) / 2);
  }
  height_buffer() {
    return Math.floor((this.simulator.height - this.height) / 2);
  }
  // Populates the mobjects in the scene
  construct_scene() {
    for (let i = 0; i < this.width - 1; i++) {
      for (let j = 0; j < this.height; j++) {
        this.add(
          `l(${i},${j})(${i + 1},${j})`,
          new Line3D(this.eq_position(i, j), this.eq_position(i + 1, j)).set_stroke_width(0.05).set_alpha(0.3)
        );
      }
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height - 1; j++) {
        this.add(
          `l(${i},${j})(${i},${j + 1})`,
          new Line3D(this.eq_position(i, j), this.eq_position(i, j + 1)).set_stroke_width(0.05).set_alpha(0.3)
        );
      }
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let dot = new DraggableDot3D(this.eq_position(i, j), 0.1);
        dot.draggable_x = false;
        dot.draggable_y = false;
        dot.draggable_z = true;
        this.add_callbacks(i, j, dot);
        this.add(`p(${i},${j})`, dot);
      }
    }
  }
  // Resets the mobjects in the scene.
  set_frame_lims(xlims, ylims) {
    super.set_frame_lims(xlims, ylims);
    this.clear();
    this.construct_scene();
  }
  set_rotation_speed(speed) {
    this.rotation_speed = speed;
  }
  eq_position(i, j) {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;
    return [
      xmin + (i + 0.5) * (xmax - xmin) / this.width,
      ymin + (j + 0.5) * (ymax - ymin) / this.height,
      0
    ];
  }
  add_callbacks(i, j, dot) {
    dot.add_callback(
      () => this.simulator.set_val(
        this.simulator.index(i + this.width_buffer(), j + this.height_buffer()),
        dot.get_center()[2]
      )
    );
    if (i < this.width - 1) {
      dot.add_callback(
        () => this.get_mobj(`l(${i},${j})(${i + 1},${j})`).move_start(
          dot.get_center()
        )
      );
    }
    if (i > 0) {
      dot.add_callback(
        () => this.get_mobj(`l(${i - 1},${j})(${i},${j})`).move_end(
          dot.get_center()
        )
      );
    }
    if (j < this.height - 1) {
      dot.add_callback(
        () => this.get_mobj(`l(${i},${j})(${i},${j + 1})`).move_start(
          dot.get_center()
        )
      );
    }
    if (j > 0) {
      dot.add_callback(
        () => this.get_mobj(`l(${i},${j - 1})(${i},${j})`).move_end(
          dot.get_center()
        )
      );
    }
    dot.add_callback(() => {
      this.draw();
      this.update_and_draw_linked_scenes();
    });
  }
  get_simulator(ind = 0) {
    return super.get_simulator(ind);
  }
  toggle_pause() {
    if (this.paused) {
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          let dot = this.get_mobj(`p(${i},${j})`);
          dot.draggable_z = false;
        }
      }
    } else {
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          let dot = this.get_mobj(`p(${i},${j})`);
          dot.draggable_z = true;
        }
      }
    }
    super.toggle_pause();
  }
  update_mobjects() {
    let vals = this.simulator.get_uValues();
    let new_z;
    let x, y, z;
    let dot, line;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        new_z = vals[this.simulator.index(
          i + this.width_buffer(),
          j + this.height_buffer()
        )];
        dot = this.get_mobj(`p(${i},${j})`);
        [x, y, z] = dot.get_center();
        dot.move_to([x, y, new_z]);
        if (i < this.width - 1) {
          line = this.get_mobj(`l(${i},${j})(${i + 1},${j})`);
          line.move_start([x, y, new_z]);
        }
        if (j < this.height - 1) {
          line = this.get_mobj(`l(${i},${j})(${i},${j + 1})`);
          line.move_start([x, y, new_z]);
        }
        if (i > 0) {
          line = this.get_mobj(`l(${i - 1},${j})(${i},${j})`);
          line.move_end([x, y, new_z]);
        }
        if (j > 0) {
          line = this.get_mobj(`l(${i},${j - 1})(${i},${j})`);
          line.move_end([x, y, new_z]);
        }
      }
    }
    if (!this.paused) {
      this.camera.rot_pos_and_view_z(this.dt * this.rotation_speed);
    }
  }
  draw_mobject(mobj) {
    mobj.draw(this.canvas, this, true);
  }
};

// src/wavesim_scene.ts
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    await (async function twodim_dipole_demo() {
      let name = "twodim-dipole-demo";
      let width = 200;
      let height = 200;
      const dt = 0.02;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;
      let canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      let sim = await createWaveSimTwoDim(width, height, dt);
      sim.set_attr("wave_propagation_speed", 0.1 * width);
      sim.reset();
      let a = 5;
      let w = 5;
      let distance = 2;
      sim.add_point_source(
        Math.floor(0.5 * (1 + distance / (xmax - xmin)) * width),
        Math.floor(height / 2),
        w,
        a,
        Math.PI / w
      );
      sim.add_point_source(
        Math.floor(0.5 * (1 - distance / (xmax - xmin)) * width),
        Math.floor(height / 2),
        w,
        a,
        0
      );
      sim.set_pml_layer(true, true, 0.2, 200);
      sim.set_pml_layer(true, false, 0.2, 200);
      sim.set_pml_layer(false, true, 0.2, 200);
      sim.set_pml_layer(false, false, 0.2, 200);
      let handler = new InteractiveHandler(sim);
      let scene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      handler.add_scene(scene);
      let w_slider = Slider(
        document.getElementById(name + "-slider-1"),
        function(d) {
          let r = d / (xmax - xmin);
          handler.add_to_queue(() => {
            sim.modify_point_source_x(0, Math.floor(0.5 * (1 + r) * width));
            sim.modify_point_source_x(1, Math.floor(0.5 * (1 - r) * width));
          });
        },
        {
          name: "Distance",
          initial_value: "1.0",
          min: 0.2,
          max: 8,
          step: 0.05
        }
      );
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button")
      );
      let clearButton = Button(
        document.getElementById(name + "-clear-button"),
        function() {
          handler.add_to_queue(sim.reset.bind(sim));
        }
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";
      handler.draw();
      handler.play(void 0);
    })();
    (async function conic_rays() {
      let canvas = prepare_canvas(200, 200, "conic-rays");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      let scene = new Scene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      class Conic {
        constructor(focus2, eccentricity2, scale2) {
          this.focus = focus2;
          this.eccentricity = eccentricity2;
          this.scale = scale2;
          this.other_focus = this.calculate_other_focus();
        }
        // Radius as a function of angle, i.e. polar parametrization
        polar_radius(t) {
          return this.scale / (1 + this.eccentricity * Math.cos(t));
        }
        // 2D parametrization in polar form
        polar_function(t) {
          let r = this.polar_radius(t);
          return [
            this.focus[0] + r * Math.cos(t),
            this.focus[1] + r * Math.sin(t)
          ];
        }
        // Calculates the other focus
        // TODO Return a PVec2D in projective space.
        calculate_other_focus() {
          if (this.eccentricity == 1) {
            return null;
          } else {
            return vec2_sum_list([
              [-this.focus[0], -this.focus[1]],
              this.polar_function(0),
              this.polar_function(Math.PI)
            ]);
          }
        }
        // Sets the eccentricity
        set_eccentricity(eccentricity2) {
          this.eccentricity = eccentricity2;
          this.other_focus = this.calculate_other_focus();
        }
        // Makes a conic section object
        // TODO Consider making the solver fixed.
        async make_curve() {
          let solver = await createSmoothOpenPathBezier(50);
          if (this.eccentricity < 1) {
            return new ParametricFunction(
              this.polar_function.bind(this),
              -Math.PI,
              Math.PI,
              50,
              solver
            );
          } else if (this.eccentricity == 1) {
            let curve = new ParametricFunction(
              this.polar_function.bind(this),
              -Math.PI + 0.01,
              Math.PI - 0.01,
              50,
              solver
            );
            curve.mode = "jagged";
            return curve;
          } else {
            return new MObject();
          }
        }
        // Makes dots for the foci
        make_focus() {
          return new Dot(this.focus, 0.2);
        }
        make_other_focus() {
          if (this.eccentricity >= 1) {
            return new MObject();
          } else {
            return new Dot(this.other_focus, 0.1);
          }
        }
        make_trajectory(t) {
          if (this.eccentricity >= 1) {
            return [new MObject(), new MObject()];
          } else {
            let intersection_point = this.polar_function(t);
            return [
              new Line(this.focus, intersection_point).set_stroke_width(0.04),
              new Line(
                intersection_point,
                this.other_focus
              ).set_stroke_width(0.04)
            ];
          }
        }
      }
      let focus = [2, 0];
      let eccentricity = 0.5;
      let scale = 3;
      let conic = new Conic(focus, eccentricity, scale);
      async function reset_scene_fixed_elements() {
        scene.remove("focus");
        scene.remove("other_focus");
        scene.remove("curve");
        scene.add("focus", conic.make_focus());
        scene.add("other_focus", conic.make_other_focus());
        scene.add("curve", await conic.make_curve());
      }
      let num_trajectories = 20;
      let thetas = [];
      for (let i = 0; i < num_trajectories; i++) {
        thetas.push(2 * Math.PI * i / num_trajectories);
      }
      let collision_times;
      function recalculate_collision_time(theta) {
        return conic.polar_radius(theta);
      }
      let eccentricity_slider = Slider(
        document.getElementById(
          "conic-rays-eccentricity-slider"
        ),
        async function(val) {
          conic.set_eccentricity(val);
          await reset_scene_fixed_elements();
          scene.draw();
          let collision_times2 = [];
          for (let i = 0; i < num_trajectories; i++) {
            collision_times2.push(recalculate_collision_time(thetas[i]));
          }
        },
        {
          name: "Eccentricity",
          min: 0,
          max: 1,
          initial_value: "0.5",
          step: 0.05
        }
      );
      scene.draw();
      let playing = false;
      let pauseButton = Button(
        document.getElementById("conic-rays-pause-button"),
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
      async function do_simulation(total_time, dt) {
        let current_thetas = [];
        let moving_points = [];
        let reflected = [];
        for (let i = 0; i < num_trajectories; i++) {
          current_thetas.push(2 * Math.PI * i / num_trajectories);
          reflected.push(false);
          moving_points.push([focus[0], focus[1]]);
          let dot = new Dot(focus, 0.05);
          dot.set_color("red");
          scene.add(`p_${i}`, dot);
        }
        let collision_times2 = [];
        for (let i = 0; i < num_trajectories; i++) {
          collision_times2.push(recalculate_collision_time(thetas[i]));
        }
        let t = 0;
        let x, y;
        let collision_indices = [];
        while (t < total_time) {
          if (playing) {
            for (let i = 0; i < num_trajectories; i++) {
              [x, y] = moving_points[i];
              if (t + dt > collision_times2[i] && !reflected[i]) {
                collision_indices.push(i);
                let s = collision_times2[i] - t;
                x += Math.cos(thetas[i]) * s;
                y += Math.sin(thetas[i]) * s;
                let effect = new Sector(
                  [x, y],
                  0.3,
                  thetas[i] - Math.PI / 2,
                  thetas[i] + Math.PI / 2
                );
                effect.set_color("red");
                scene.add(`c_${i}`, effect);
                if (conic.eccentricity == 1) {
                  current_thetas[i] = Math.PI;
                } else {
                  current_thetas[i] = vec2_angle(
                    vec2_sub(
                      conic.other_focus,
                      conic.polar_function(thetas[i])
                    )
                  );
                }
                x += Math.cos(current_thetas[i]) * (dt - s);
                y += Math.sin(current_thetas[i]) * (dt - s);
                reflected[i] = true;
              } else {
                x += Math.cos(current_thetas[i]) * dt;
                y += Math.sin(current_thetas[i]) * dt;
              }
              moving_points[i] = [x, y];
              scene.get_mobj(`p_${i}`).move_to([x, y]);
            }
            scene.draw();
            t += dt;
            while (collision_indices.length > 0) {
              let i = collision_indices.pop();
              scene.remove(`c_${i}`);
            }
          }
          await delay(10);
        }
        for (let i = 0; i < num_trajectories; i++) {
          scene.remove(`p_${i}`);
        }
        await delay(500);
      }
      while (true) {
        await do_simulation(10, 0.06);
      }
    })();
    (function point_mass_spring(width, height) {
      let canvas_spring = prepare_canvas(width, height, "point-mass-spring");
      let canvas_graph = prepare_canvas(width, height, "point-mass-graph");
      let xmin = -6;
      let xmax = 6;
      let tmin = 0;
      let tmax = 12;
      let ymin = -6;
      let ymax = 6;
      let w = 5;
      class SpringSim extends SpringSimulator {
        reset() {
          super.reset();
          sim.set_vals([1, 0]);
        }
      }
      let sim = new SpringSim(w, 0.01);
      sim.set_vals([1, 0]);
      let handler = new InteractiveHandler(sim);
      class GraphScene extends SceneFromSimulator {
        constructor(canvas) {
          super(canvas);
          this.step_counter = 0;
          this.set_frame_lims([tmin, tmax], [xmin, xmax]);
          let axes = new CoordinateAxes2d([tmin, tmax], [xmin, xmax]);
          this.add("axes", axes);
          this.add(
            "graph",
            new LineSequence([
              [0, sim.get_vals()[0]]
            ]).set_stroke_width(0.05)
          );
          this.draw();
        }
        reset() {
          this.remove("graph");
          this.add(
            "graph",
            new LineSequence([
              [0, sim.get_vals()[0]]
            ]).set_stroke_width(0.05)
          );
        }
        update_mobjects_from_simulator(simulator) {
          let vals = simulator.get_vals();
          let time = simulator.time;
          this.step_counter += 1;
          if (this.step_counter % 5 === 0 && time < this.xlims[1]) {
            this.get_mobj("graph").add_point([
              time,
              vals[0]
            ]);
          }
        }
      }
      let graph_scene = new GraphScene(canvas_graph);
      class SpringScene extends SceneFromSimulator {
        constructor(canvas) {
          super(canvas);
          this.arrow_length_scale = w / 3;
          this.arrow_height = 0;
          let eq_line = new Line([0, ymin], [0, ymax]).set_stroke_width(0.05).set_stroke_style("dashed").set_stroke_color("gray");
          let spring = new LineSpring([xmin * 0.7, 0], [0, 0]).set_stroke_width(
            0.08
          );
          spring.set_eq_length(3);
          let anchor = new Rectangle(
            [xmin * 0.7, 0],
            0.15,
            (ymax - ymin) * 0.7
          );
          let mass = new DraggableRectangle([0, 0], 0.8, 0.8);
          mass.draggable_x = true;
          mass.draggable_y = false;
          let force_arrow = new Arrow(
            [0, this.arrow_height],
            [0, this.arrow_height]
          ).set_stroke_width(0.1).set_stroke_color("red");
          this.add("eq_line", eq_line);
          this.add("spring", spring);
          this.add("anchor", anchor);
          this.add("mass", mass);
          this.add("force_arrow", force_arrow);
          this.add_callbacks();
        }
        // Callback which affects the simulator and is removed when simulation is paused
        add_callbacks() {
          let mass = this.get_mobj("mass");
          mass.add_callback(() => {
            sim.set_vals([mass.get_center()[0], 0]);
            this.update_mobjects_from_simulator(sim);
          });
        }
        set_spring_mode(mode) {
          let spring = this.get_mobj("spring");
          spring.set_mode(mode);
        }
        set_spring_stiffness(val) {
          this.arrow_length_scale = val / 3;
        }
        // TODO Add turn on/off of draggability.
        // Updates all mobjects to account for the new simulator state
        update_mobjects_from_simulator(simulator) {
          let vals = simulator.get_vals();
          this._update_mass(vals);
          this._update_spring(vals);
          this._update_force_arrow(vals);
        }
        // Specific to this scene and simulator
        _update_mass(vals) {
          this.get_mobj("mass").move_to([vals[0], 0]);
        }
        _update_spring(vals) {
          this.get_mobj("spring").move_end([vals[0], 0]);
        }
        _update_force_arrow(vals) {
          let force_arrow = this.get_mobj("force_arrow");
          force_arrow.move_start([vals[0], this.arrow_height]);
          force_arrow.move_end([
            vals[0] * (1 - this.arrow_length_scale),
            this.arrow_height
          ]);
          force_arrow.set_arrow_size(
            Math.min(0.5, Math.sqrt(Math.abs(vals[0])) / 2)
          );
        }
        // Enforce strict order on drawing mobjects, overriding subclass behavior
        _draw() {
          this.draw_mobject(this.get_mobj("eq_line"));
          this.draw_mobject(this.get_mobj("anchor"));
          this.draw_mobject(this.get_mobj("spring"));
          this.draw_mobject(this.get_mobj("mass"));
          this.draw_mobject(this.get_mobj("force_arrow"));
        }
        draw_mobject(mobj) {
          mobj.draw(this.canvas, this);
        }
      }
      let spring_scene = new SpringScene(canvas_spring);
      spring_scene.set_spring_mode("spring");
      spring_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      handler.add_scene(graph_scene);
      handler.add_scene(spring_scene);
      let pausebutton = handler.add_pause_button(
        document.getElementById(
          "point-mass-spring-pause-button"
        )
      );
      let resetButton = Button(
        document.getElementById(
          "point-mass-spring-reset-button"
        ),
        function() {
          handler.add_to_queue(handler.reset.bind(handler));
        }
      );
      resetButton.textContent = "Reset simulation";
      let w_slider = Slider(
        document.getElementById("point-mass-stiffness-slider"),
        function(val) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "stiffness", val)
          );
          handler.add_to_queue(
            spring_scene.set_spring_stiffness.bind(spring_scene, val)
          );
          handler.add_to_queue(
            spring_scene.update_mobjects_from_simulator.bind(
              spring_scene,
              handler.simulator
            )
          );
          handler.add_to_queue(handler.draw.bind(handler));
        },
        {
          name: "Spring stiffness",
          initial_value: `${sim.stiffness}`,
          min: 0,
          max: 20,
          step: 0.01
        }
      );
      let f_slider = Slider(
        document.getElementById("point-mass-damping-slider"),
        function(val) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "friction", val)
          );
        },
        {
          name: "Friction",
          initial_value: "0.0",
          min: 0,
          max: 5,
          step: 0.01
        }
      );
      handler.draw();
      handler.play(void 0);
    })(300, 300);
    (async function point_mass_discrete_sequence(width, height, num_points) {
      let canvas = prepare_canvas(
        width,
        height,
        "point-mass-discrete-sequence"
      );
      function foo(x) {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      class WaveSimulator extends WaveSimOneDim2 {
        reset() {
          super.reset();
          this.set_uValues(
            funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points)
          );
          this.set_vValues(funspace((x) => 0, 0, 1, num_points));
        }
      }
      let w = 3;
      let sim = new WaveSimOneDim2(num_points, 0.01);
      sim.set_attr("wave_propagation_speed", w);
      sim.reset = function() {
        this.time = 0;
        this.set_uValues(
          funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points)
        );
        this.set_vValues(funspace((x) => 0, 0, 1, num_points));
      };
      sim.reset();
      let handler = new InteractiveHandler(sim);
      class WaveScene extends WaveSimOneDimScene {
        constructor(canvas2, num_points2) {
          super(canvas2, num_points2);
          for (let i = 0; i < num_points2; i++) {
            let mass = this.get_mobj(`p_${i + 1}`);
            this.add_callback(i, mass);
          }
        }
        add_callback(i, mass) {
          let self = this;
          if (i == 0) {
            mass.add_callback(() => {
              sim.set_left_endpoint(mass.get_center()[1]);
            });
          }
          if (i == width - 1) {
            mass.add_callback(() => {
              sim.set_right_endpoint(mass.get_center()[1]);
            });
          }
          mass.add_callback(() => {
            let vals = sim.get_vals();
            vals[i] = mass.get_center()[1];
            vals[i + this.width] = 0;
            sim.set_vals(vals);
            self.update_mobjects_from_simulator(sim);
          });
        }
      }
      let scene = new WaveScene(canvas, num_points);
      await scene.add_curve();
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.1);
      handler.add_scene(scene);
      let pauseButton = handler.add_pause_button(
        document.getElementById(
          "point-mass-discrete-sequence-pause-button"
        )
      );
      let resetButton = Button(
        document.getElementById(
          "point-mass-discrete-sequence-reset-button"
        ),
        function() {
          handler.add_to_queue(handler.reset.bind(handler));
        }
      );
      resetButton.textContent = "Reset simulation";
      let f_slider = Slider(
        document.getElementById(
          "point-mass-discrete-sequence-friction-slider"
        ),
        function(val) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "damping", val)
          );
        },
        {
          name: "Friction",
          initial_value: "0.0",
          min: 0,
          max: 5,
          step: 0.01
        }
      );
      let w_slider = Slider(
        document.getElementById(
          "point-mass-discrete-sequence-stiffness-slider"
        ),
        function(val) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(
              handler,
              0,
              "wave_propagation_speed",
              val
            )
          );
          handler.add_to_queue(
            scene.set_arrow_length_scale.bind(scene, val / 2)
          );
          handler.add_to_queue(
            scene.update_mobjects_from_simulator.bind(
              scene,
              handler.simulator
            )
          );
          handler.add_to_queue(handler.draw.bind(handler));
        },
        {
          name: "Spring stiffness",
          initial_value: `${w}`,
          min: 0,
          max: 20,
          step: 0.05
        }
      );
      handler.draw();
      handler.play(void 0);
    })(300, 300, 10);
    (async function point_mass_continuous_sequence(width, height, num_points) {
      let canvas = prepare_canvas(
        width,
        height,
        "point-mass-continuous-sequence"
      );
      function foo(x) {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      class WaveSimulator extends WaveSimOneDim2 {
        reset() {
          super.reset();
          this.set_uValues(
            funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points)
          );
          this.set_vValues(funspace((x) => 0, 0, 1, num_points));
        }
      }
      let w = 3;
      let sim = new WaveSimOneDim2(num_points, 0.01);
      sim.reset();
      sim.set_attr("wave_propagation_speed", 3);
      sim.set_attr("damping", 0.05);
      sim.set_attr("dt", 0.05);
      sim.reset = function() {
        this.time = 0;
        this.set_uValues(
          funspace((x) => 5 * (foo(x) - foo(1)), 0, 1, num_points)
        );
        this.set_vValues(funspace((x) => 0, 0, 1, num_points));
      };
      sim.reset();
      let handler = new InteractiveHandler(sim);
      class WaveScene extends WaveSimOneDimScene {
        constructor(canvas2, num_points2) {
          super(canvas2, num_points2);
          for (let i = 0; i < num_points2; i++) {
            let mass = this.get_mobj(`p_${i + 1}`);
            this.add_callback(i, mass);
          }
        }
        add_callback(i, mass) {
          let self = this;
          if (i == 0) {
            mass.add_callback(() => {
              sim.set_left_endpoint(mass.get_center()[1]);
            });
          }
          if (i == width - 1) {
            mass.add_callback(() => {
              sim.set_right_endpoint(mass.get_center()[1]);
            });
          }
          mass.add_callback(() => {
            let vals = sim.get_vals();
            vals[i] = mass.get_center()[1];
            vals[i + this.width] = 0;
            sim.set_vals(vals);
            self.update_mobjects_from_simulator(sim);
          });
        }
      }
      let scene = new WaveScene(canvas, num_points);
      await scene.add_curve();
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.05);
      scene.set_arrow_length_scale(0.05);
      handler.add_scene(scene);
      let translator = new SceneViewTranslator(scene);
      translator.add();
      let zoom_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-zoom-slider"
        ),
        function(zr) {
          handler.add_to_queue(() => {
            scene.zoom_in_on(zr / scene.zoom_ratio, scene.get_view_center());
            if (zr > 3) {
              scene.set_mode("dots");
            } else {
              scene.set_mode("curve");
            }
            scene.update_mobjects_from_simulator(sim);
            scene.draw();
          });
        },
        {
          name: "Zoom ratio",
          initial_value: "1.0",
          min: 0.6,
          max: 5,
          step: 0.05
        }
      );
      let pauseButton = handler.add_pause_button(
        document.getElementById(
          "point-mass-continuous-sequence-pause-button"
        )
      );
      let resetButton = Button(
        document.getElementById(
          "point-mass-continuous-sequence-reset-button"
        ),
        function() {
          handler.add_to_queue(handler.reset.bind(handler));
        }
      );
      resetButton.textContent = "Reset simulation";
      let f_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-friction-slider"
        ),
        function(val) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(handler, 0, "damping", val)
          );
        },
        {
          name: "Friction",
          initial_value: "0.0",
          min: 0,
          max: 5,
          step: 0.01
        }
      );
      let w_slider = Slider(
        document.getElementById(
          "point-mass-continuous-sequence-stiffness-slider"
        ),
        function(val) {
          handler.add_to_queue(
            handler.set_simulator_attr.bind(
              handler,
              0,
              "wave_propagation_speed",
              val
            )
          );
          handler.add_to_queue(
            scene.set_arrow_length_scale.bind(scene, val / 2)
          );
          handler.add_to_queue(
            scene.update_mobjects_from_simulator.bind(
              scene,
              handler.simulator
            )
          );
          handler.add_to_queue(handler.draw.bind(handler));
        },
        {
          name: "Spring stiffness",
          initial_value: `${w}`,
          min: 0,
          max: 20,
          step: 0.05
        }
      );
      handler.draw();
      handler.play(void 0);
    })(300, 300, 50);
    (async function wavesim_one_dimensional_demo_impulse(width, height, num_points) {
      const name = "wavesim-1d-impulse";
      let canvas = prepare_canvas(width, height, name);
      const sigma = 0.1;
      const mu = 0.5;
      const a = 2;
      function pulse(x) {
        return a * Math.exp(-((x - mu) ** 2 / sigma ** 2));
      }
      function pulse_deriv(x) {
        return -2 * (x - mu) / sigma ** 2 * pulse(x);
      }
      let sim = new WaveSimOneDim2(num_points, 0.01);
      sim.set_attr("wave_propagation_speed", 5);
      sim.set_attr("damping", 0);
      sim.set_attr("dt", 0.02);
      sim.reset = function() {
        sim.time = 0;
        sim.set_uValues(funspace((x) => pulse(x) - pulse(1), 0, 1, num_points));
        sim.set_vValues(
          funspace((x) => -0.1 * pulse_deriv(x), 0, 1, num_points)
        );
      };
      sim.reset();
      let handler = new InteractiveHandler(sim);
      let scene = new WaveSimOneDimScene(canvas, num_points);
      await scene.add_curve();
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("dots");
      scene.set_dot_radius(0.05);
      scene.include_arrows = false;
      handler.add_scene(scene);
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button")
      );
      let resetButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          handler.add_to_queue(handler.reset.bind(handler));
        }
      );
      resetButton.textContent = "Reset simulation";
      handler.draw();
      handler.play(void 0);
    })(300, 300, 50);
    (async function wavesim_one_dimensional_demo_pml(width, height, num_points) {
      const name = "wavesim-1d-pml";
      let canvas = prepare_canvas(width, height, name);
      let sim = new WaveSimOneDim2(num_points, 0.01);
      sim.set_attr("wave_propagation_speed", 3);
      sim.set_attr("damping", 0);
      sim.set_pml_layer(true, 0.3, 100);
      sim.set_pml_layer(false, 0.3, 100);
      sim.set_attr("dt", 0.02);
      sim.add_point_source(new PointSourceOneDim(num_points / 2, 3, 1, 0));
      sim.reset = function() {
        sim.time = 0;
        sim.set_uValues(funspace((x) => 0, 0, 1, num_points));
        sim.set_vValues(funspace((x) => 0, 0, 1, num_points));
      };
      sim.reset();
      let handler = new InteractiveHandler(sim);
      let scene = new WaveSimOneDimScene(canvas, num_points);
      await scene.add_curve();
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_mode("curve");
      scene.set_dot_radius(0.05);
      scene.include_arrows = false;
      handler.add_scene(scene);
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button")
      );
      let resetButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          handler.add_to_queue(handler.reset.bind(handler));
        }
      );
      resetButton.textContent = "Reset simulation";
      handler.draw();
      handler.play(void 0);
    })(300, 300, 60);
    (function point_mass_discrete_lattice(width, height) {
      let canvas = prepare_canvas(width, height, "point-mass-discrete-lattice");
      let xmin = -5;
      let xmax = 5;
      let ymin = -5;
      let ymax = 5;
      let total_arr_width = 21;
      let total_arr_height = 21;
      let shown_arr_width = 15;
      let shown_arr_height = 15;
      let sim = new WaveSimTwoDim2(total_arr_width, total_arr_height, 0.01);
      sim.set_attr("wave_propagation_speed", 5);
      sim.remove_pml_layers();
      function foo(x) {
        return Math.exp(-(5 * (x - 0.5) ** 2));
      }
      function foo2(x, y) {
        return (foo(x) - foo(1)) * (foo(y) - foo(1));
      }
      function reset_simulation() {
        let vals = new Array(4 * total_arr_width * total_arr_height).fill(0);
        for (let i = 0; i < total_arr_width; i++) {
          for (let j = 0; j < total_arr_height; j++) {
            vals[sim.index(i, j)] = 5 * foo2(i / (total_arr_width - 1), j / (total_arr_height - 1));
          }
        }
        sim.set_vals(vals);
      }
      reset_simulation();
      for (let i = 0; i < total_arr_width; i++) {
        sim.add_point_source(new PointSource(i, 0, 0, 0, 0));
        sim.add_point_source(new PointSource(i, total_arr_height - 1, 0, 0, 0));
      }
      for (let j = 1; j < total_arr_height - 1; j++) {
        sim.add_point_source(new PointSource(0, j, 0, 0, 0));
        sim.add_point_source(new PointSource(total_arr_width - 1, j, 0, 0, 0));
      }
      let zoom_ratio = 1;
      let scene = new WaveSimTwoDimThreeDScene(
        canvas,
        sim,
        shown_arr_width,
        shown_arr_height
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");
      scene.camera.move_to([0, 0, -10]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        2 * Math.PI / 3
      );
      scene.set_rotation_speed(0.15);
      let second_canvas = prepare_canvas(
        width,
        height,
        "point-mass-discrete-lattice-heatmap"
      );
      let second_scene = new WaveSimTwoDimPointsHeatmapScene(
        second_canvas,
        shown_arr_width,
        shown_arr_height
      );
      second_scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      second_scene.update_mobjects_from_simulator(sim);
      scene.add_linked_scene(second_scene);
      let pauseButton = scene.add_pause_button(
        document.getElementById(
          "point-mass-discrete-lattice-pause-button"
        )
      );
      let resetButton = Button(
        document.getElementById(
          "point-mass-discrete-lattice-reset-button"
        ),
        function() {
          scene.add_to_queue(() => {
            reset_simulation();
            scene.update_and_draw_linked_scenes();
            scene.draw();
          });
        }
      );
      resetButton.textContent = "Reset simulation";
      resetButton.style.padding = "15px";
      scene.draw();
      second_scene.draw();
      scene.play(void 0);
    })(300, 300);
    await (async function wave_sim_2d_point_source(width, height) {
      const dt = 0.02;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;
      const name = "wavesim-2d-point-source";
      let canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      let sim = await createWaveSimTwoDim(width, height, dt);
      sim.set_attr("wave_propagation_speed", 0.1 * width);
      let a = 5;
      let w = 8;
      sim.add_point_source(
        Math.floor(0.5 * width),
        Math.floor(0.5 * height),
        w,
        a,
        0
      );
      let handler = new InteractiveHandler(sim);
      let scene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.draw();
      handler.add_scene(scene);
      let w_slider = Slider(
        document.getElementById(name + "-slider-1"),
        function(val) {
          handler.add_to_queue(() => {
            sim.modify_point_source_frequency(0, val);
          });
        },
        {
          name: "Frequency",
          initial_value: "5.0",
          min: 2,
          max: 20,
          step: 0.05
        }
      );
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button")
      );
      let clearButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          handler.add_to_queue(sim.reset.bind(sim));
        }
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";
      handler.draw();
      handler.play(void 0);
    })(250, 250);
    await (async function wave_sim_2d_point_source_conic(width, height) {
      const dt = 0.01;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;
      const name = "wavesim-2d-point-source-conic";
      let canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      let sim = await createWaveSimTwoDimElliptical(width, height, dt);
      sim.recalculate_masks();
      sim.set_attr("wave_propagation_speed", 0.1 * width);
      let a = 5;
      let w = 5;
      sim.add_point_source(sim.get_focus_x(0), sim.get_focus_y(0), w, a, 0);
      let handler = new InteractiveHandler(sim);
      let solver = await createSmoothOpenPathBezier(100);
      let conic = new ParametricFunction(
        (t) => [
          sim.get_semimajor_axis() / width * (xmax - xmin) * Math.cos(t),
          sim.get_semiminor_axis() / height * (ymax - ymin) * Math.sin(t)
        ],
        0,
        Math.PI * 2,
        100,
        solver
      ).set_stroke_width(0.03).set_alpha(0.5);
      let scene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.add("conic", conic);
      scene.draw();
      handler.add_scene(scene);
      let w_slider = Slider(
        document.getElementById(name + "-slider-2"),
        function(val) {
          handler.add_to_queue(() => {
            sim.modify_point_source_frequency(0, val);
          });
        },
        {
          name: "Frequency",
          initial_value: "6.0",
          min: 3,
          max: 10,
          step: 0.05
        }
      );
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button")
      );
      let clearButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          handler.add_to_queue(sim.reset.bind(sim));
        }
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";
      handler.draw();
      handler.play(void 0);
    })(250, 250);
    await (async function wave_sim_2d_doubleslit(width, height) {
      const dt = 0.02;
      const xmin = -5;
      const xmax = 5;
      const ymin = -5;
      const ymax = 5;
      const name = "wavesim-2d-doubleslit";
      let canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }
      const imageData = ctx.createImageData(width, height);
      let sim = await createWaveSimTwoDim(width, height, dt);
      sim.set_attr("wave_propagation_speed", 0.1 * width);
      sim.remove_pml_layers();
      sim.set_pml_layer(true, true, 0.2, 200);
      sim.set_pml_layer(true, false, 0.2, 200);
      sim.set_pml_layer(false, true, 0.2, 200);
      let a = 4;
      let w = 8;
      for (let x = 0; x < width; x++) {
        sim.add_point_source(x, 0, w, a, 0);
      }
      let slit_dist = 0.2;
      let slit_width = 0.02;
      let wall_height = 0.1;
      function make_apertures(slit_dist2, slit_width2) {
        let sources2 = [];
        for (let x = 0; x < width; x++) {
          if (Math.abs(x / width - (0.5 - slit_dist2 / 2)) < slit_width2) {
          } else if (Math.abs(x / width - (0.5 + slit_dist2 / 2)) < slit_width2) {
          } else {
            sources2.push([x, Math.floor(height * wall_height), 0, 0, 0]);
          }
        }
        return sources2;
      }
      let sources = make_apertures(slit_dist, slit_width);
      for (let source of sources) {
        sim.add_point_source(
          source[0],
          source[1],
          source[2],
          source[3],
          source[4]
        );
      }
      let handler = new InteractiveHandler(sim);
      let scene = new WaveSimTwoDimHeatMapScene(
        canvas,
        imageData,
        width,
        height
      );
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      scene.draw();
      handler.add_scene(scene);
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-pause-button")
      );
      let clearButton = Button(
        document.getElementById(name + "-reset-button"),
        function() {
          handler.add_to_queue(sim.reset.bind(sim));
        }
      );
      clearButton.textContent = "Clear";
      clearButton.style.padding = "15px";
      handler.draw();
      handler.play(void 0);
    })(250, 250);
  });
})();
