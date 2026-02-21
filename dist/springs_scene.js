var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// polyfill.js
if (typeof global === "undefined") {
  window.global = window;
}
if (typeof __dirname === "undefined") {
  global.__dirname = "";
}
if (typeof __require === "undefined") {
  let wasmCache = null;
  global.require = function(name) {
    if (name === "fs") {
      return {
        readFileSync: function(path) {
          console.log("readFileSync called with:", path);
          return new Uint8Array();
        }
      };
    }
    throw new Error(`Cannot find module: ${name}`);
  };
}

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
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
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
  return [event.touches[0].pageX, event.touches[0].pageY];
}

// src/lib/base/color.ts
function colorval_to_rgba(color) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
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
      this.dragStart = [
        event.touches[0].pageX - scene.canvas.offsetLeft,
        event.touches[0].pageY - scene.canvas.offsetTop
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
  // Store a known end-time in case the simulation is paused and unpaused
  constructor(simulator) {
    this.scenes = [];
    this.action_queue = [];
    this.paused = true;
    this.time = 0;
    this.dt = 0.01;
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
        this.simulator.step();
        this.time += this.simulator.dt;
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

// src/springs_scene.ts
var InteractivePlayingScene = class extends Scene {
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
  }
  // Adds another scene whose state is dependent on the simulation.
  // This scene acts as the "controller" through which the simulation can be paused and
  // interacted with.
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
  // Restarts the simulator
  reset() {
    for (let ind = 0; ind < this.num_simulators; ind++) {
      this.get_simulator(ind).reset();
    }
    this.time = 0;
    this.draw();
    for (let scene of this.linked_scenes) {
      scene.update_mobjects_from_simulator(this.get_simulator(0));
      scene.draw();
    }
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
        for (let scene of this.linked_scenes) {
          scene.update_mobjects_from_simulator(this.get_simulator(0));
          scene.draw();
        }
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates all mobjects to account for the new simulator state
  update_mobjects() {
  }
  // Draws the scene.
  _draw() {
    this.update_mobjects();
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
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
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
  });
})();
export {
  InteractivePlayingScene
};
