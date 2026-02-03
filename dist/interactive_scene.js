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
  }
};
var Scene = class {
  constructor(canvas) {
    this.border_thickness = 4;
    this.border_color = "black";
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
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Sets the current zoom level
  set_zoom(value) {
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
  console.log("Canvas made");
  return canvas;
}

// src/lib/base_geom.ts
function vec2_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
function vec2_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
}
var Dot = class extends MObject {
  constructor(center_x, center_y, kwargs) {
    super();
    this.fill_color = "black";
    this.center = [center_x, center_y];
    let radius = kwargs.radius;
    if (radius == void 0) {
      this.radius = 0.3;
    } else {
      this.radius = radius;
    }
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
  }
  // Change the dot color
  set_color(color) {
    this.fill_color = color;
  }
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.fillStyle = this.fill_color;
    ctx.globalAlpha = this.alpha;
    let [x, y] = scene.v2c(this.center);
    let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
};
var DraggableDot = class extends Dot {
  constructor() {
    super(...arguments);
    this.isClicked = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.dragDiff = [0, 0];
    this.callbacks = [];
  }
  // Tests whether a chosen vector lies inside the dot.
  is_inside_dot(p) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius;
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
    this.dragStart = [
      event.pageX - scene.canvas.offsetLeft,
      event.pageY - scene.canvas.offsetTop
    ];
    this.isClicked = this.is_inside_dot(
      scene.c2s(this.dragStart[0], this.dragStart[1])
    );
  }
  // Triggers when the canvas is unclicked.
  unclick(scene, event) {
    this.isClicked = false;
  }
  // Triggers when the mouse is dragged over the canvas.
  drag_cursor(scene, event) {
    if (this.isClicked) {
      this.dragEnd = [
        event.pageX - scene.canvas.offsetLeft,
        event.pageY - scene.canvas.offsetTop
      ];
      this.dragDiff = vec2_sub(
        scene.c2s(this.dragEnd[0], this.dragEnd[1]),
        scene.c2s(this.dragStart[0], this.dragStart[1])
      );
      this.move_by(this.dragDiff);
      this.dragStart = this.dragEnd;
      this.do_callbacks();
      scene.draw();
    }
  }
  add(scene) {
    let self = this;
    scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
    scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
    scene.canvas.addEventListener(
      "mousemove",
      self.drag_cursor.bind(self, scene)
    );
  }
};
var Line = class extends MObject {
  constructor(start, end, kwargs) {
    super();
    this.start = start;
    this.end = end;
    let stroke_width = kwargs.stroke_width;
    if (stroke_width == void 0) {
      this.stroke_width = 0.08;
    } else {
      this.stroke_width = stroke_width;
    }
    let stroke_color = kwargs.stroke_color;
    if (stroke_color == void 0) {
      this.stroke_color = `rgb(0, 0, 0)`;
    } else {
      this.stroke_color = stroke_color;
    }
  }
  // Moves the start and end points
  move_start(x, y) {
    this.start = [x, y];
  }
  move_end(x, y) {
    this.end = [x, y];
  }
  length() {
    return vec2_norm(vec2_sub(this.start, this.end));
  }
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.stroke_width * canvas.width / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
};

// src/interactive_scene.ts
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (function draggable_dots(width, height) {
      let canvas = prepare_canvas(width, height, "draggable-dot");
      let scene = new Scene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      let dot_1 = new DraggableDot(1, 0, {});
      dot_1.set_radius(0.3);
      let dot_2 = new DraggableDot(-1, 0, {});
      dot_2.set_radius(0.3);
      let line = new Line([1, 0], [-1, 0], {});
      dot_1.add_callback(() => {
        let [x, y] = dot_1.get_center();
        line.move_start(x, y);
      });
      dot_2.add_callback(() => {
        let [x, y] = dot_2.get_center();
        line.move_end(x, y);
      });
      scene.add("line", line);
      scene.add("p1", dot_1);
      scene.add("p2", dot_2);
      scene.draw();
    })(300, 300);
  });
})();
