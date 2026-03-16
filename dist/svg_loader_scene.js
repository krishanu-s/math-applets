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
var DraggableRectangle = makeDraggable(Rectangle);

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
var Write = class extends FixedLengthAnimation {
  constructor(svg_mobject_name, svg_mobject, num_frames) {
    super(num_frames);
    this.svg_mobject_name = svg_mobject_name;
    this.svg_mobject = svg_mobject;
  }
  // Animates the fade in.
  async _play(scene) {
    scene.add(this.svg_mobject_name, this.svg_mobject);
    await super._play(scene);
  }
  async _play_frame(scene, i) {
    this.svg_mobject.set_progress(i / this.num_frames);
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
function createSVGFileInput(onLoad) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".svg";
  input.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const svgString = await SVGLoader.loadFromFile(file);
      const svgElement = SVGLoader.parseSVG(svgString);
      const paths = SVGLoader.extractPaths(svgElement);
      const points = [];
      for (const path of paths) {
        points.push(...SVGLoader.pathToPoints(path));
      }
      onLoad(svgString, points);
    } catch (error) {
      console.error("Error loading SVG:", error);
    }
  });
  return input;
}
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
    console.log(div, svgElement);
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

// src/svg_loader_scene.ts
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (function svgLoaderDemo(width, height) {
      const name = "svg-loader-demo";
      const canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      async function mathJaxDemo() {
        let scene = new Scene(canvas);
        scene.set_frame_lims([-5, 5], [-5, 5]);
        try {
          const latex = "(x, y) = \\left( \\frac{m^2-1}{m^2+1}, -\\frac{2m}{m^2+1} \\right)";
          ctx.fillStyle = "#000000";
          ctx.font = "16px Arial";
          ctx.fillText(`LaTeX: ${latex}`, 50, 125);
          let latex_mobj = new TexMObject();
          await latex_mobj.from_latex(latex, scene.scale());
          latex_mobj.set_center([-2, 4]);
          latex_mobj.set_width(4);
          await new Write("latex_mobj", latex_mobj, 30).play(scene);
          await new MoveBy("latex_mobj", [2, -4], 20).play(scene);
        } catch (error) {
          console.error("Basic test failed:", error);
          ctx.fillStyle = "#ff0000";
          ctx.font = "14px Arial";
          ctx.fillText(`\u2717 Error: ${error.message}`, 50, 280);
          ctx.fillStyle = "#666";
          ctx.font = "12px Arial";
          ctx.fillText("Make sure MathJax is loaded in HTML:", 50, 310);
          ctx.fillText(
            '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js"><\/script>',
            50,
            330
          );
        }
      }
      async function svgMobjectDemo() {
        let scene = new Scene(canvas);
        scene.set_frame_lims([-5, 5], [-5, 5]);
        const svgString = await SVGLoader.loadFromURL("./svg_samples/ex_5.svg");
        const svgElement = SVGLoader.parseSVG(svgString);
        const pathInfoAll = SVGLoader.extractPaths(svgElement);
        let parsedPathInfoAll = [];
        let total_length = 0;
        let p;
        for (const pathInfo of pathInfoAll) {
          p = SVGLoader.parsePathInfo(pathInfo);
          parsedPathInfoAll.push(p);
          total_length += p.commands.length;
        }
        for (let i = 0; i < parsedPathInfoAll.length; i++) {
          let svg_mobject = new SVGPathMObject();
          svg_mobject.from_path(
            parsedPathInfoAll[i],
            scene.scale()
          );
          svg_mobject.homothety_around([0, 0], 0.5);
          svg_mobject.move_by([-4.5, 4.5]);
          await new Write(`obj_${i}`, svg_mobject, 30).play(scene);
        }
        scene.draw();
      }
      async function loadExampleSVG() {
        try {
          const svgString = await SVGLoader.loadFromURL(
            "./svg_samples/ex_3.svg"
          );
          console.log("SVG string:", svgString);
          await SVGLoader.drawToCanvas(canvas, svgString, 50, 50);
          const svgElement = SVGLoader.parseSVG(svgString);
          const paths = SVGLoader.extractPaths(svgElement);
          console.log("Paths:", paths);
          console.log(`Loaded SVG with ${paths.length} paths`);
        } catch (error) {
          console.error("Error loading example SVG:", error);
        }
      }
      function setupFileInput() {
        const container = document.getElementById(name);
        if (!container) return;
        const inputContainer = document.createElement("div");
        inputContainer.style.marginTop = "20px";
        inputContainer.style.padding = "10px";
        inputContainer.style.border = "1px solid #ccc";
        const label = document.createElement("div");
        label.textContent = "Load your own SVG:";
        label.style.marginBottom = "10px";
        const fileInput = createSVGFileInput((svgString, points) => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(300, 50, 400, 400);
          SVGLoader.drawToCanvas(canvas, svgString, 320, 70).then(() => {
            ctx.fillStyle = "#ff0000";
            for (const point of points) {
              ctx.beginPath();
              ctx.arc(point.x + 320, point.y + 70, 2, 0, Math.PI * 2);
              ctx.fill();
            }
            console.log(`Loaded ${points.length} points from SVG`);
          }).catch(console.error);
        });
        inputContainer.appendChild(label);
        inputContainer.appendChild(fileInput);
        container.appendChild(inputContainer);
      }
      async function loadMultipleSVGs() {
        const svgFiles = [
          // "./svg_samples/ex_1.svg",
          // "./svg_samples/ex_2.svg",
          // "./svg_samples/ex_3.svg",
          // "./svg_samples/ex_4.svg",
        ];
        let yOffset = 300;
        for (const file of svgFiles) {
          try {
            console.log("Filename:", file);
            const svgString = await SVGLoader.loadFromURL(file);
            console.log("Contents:", svgString);
            await SVGLoader.drawToCanvas(canvas, svgString, 50, yOffset);
            yOffset += 120;
          } catch (error) {
            console.error(`Error loading ${file}:`, error);
          }
        }
      }
      async function runExamples() {
        console.log("Starting SVG loader examples...");
        ctx.fillStyle = "#000000";
        ctx.font = "bold 16px Arial";
        ctx.font = "12px Arial";
        await svgMobjectDemo();
        await mathJaxDemo();
        console.log("SVG loader examples completed!");
      }
      runExamples().catch(console.error);
    })(500, 500);
  });
})();
