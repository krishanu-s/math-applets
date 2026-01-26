// src/base.ts
function vec_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
function vec_scale(x, factor) {
  return [x[0] * factor, x[1] * factor];
}
function vec_sum(x, y) {
  return [x[0] + y[0], x[1] + y[1]];
}
function vec_sum_list(xs) {
  return xs.reduce((acc, x) => vec_sum(acc, x), [0, 0]);
}
function vec_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
}
function linspace(start, stop, num) {
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => start + i * step);
}
function clamp(x, xmin, xmax) {
  return Math.min(xmax, Math.max(xmin, x));
}
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
var MObject = class {
  constructor() {
  }
  draw(canvas, scene, args) {
  }
};
var Dot = class extends MObject {
  constructor(center_x, center_y, kwargs) {
    super();
    this.center = [center_x, center_y];
    let radius = kwargs["radius"];
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
  move_to(x, y) {
    this.center = [x, y];
  }
  // Change the dot radius
  set_radius(radius) {
    this.radius = radius;
  }
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [x, y] = scene.s2c(this.center[0], this.center[1]);
    let xr = scene.s2c(this.center[0] + this.radius, this.center[1])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
};
var Line = class extends MObject {
  constructor(start, end, kwargs) {
    super();
    this.start = start;
    this.end = end;
    let stroke_width = kwargs["stroke_width"];
    if (stroke_width == void 0) {
      this.stroke_width = 0.08;
    } else {
      this.stroke_width = stroke_width;
    }
    let stroke_color = kwargs["stroke_color"];
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
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.s2c(this.start[0], this.start[1]);
    let [end_x, end_y] = scene.s2c(this.end[0], this.end[1]);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.stroke_width * canvas.width / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
};
var BezierCurve = class extends MObject {
  constructor(start, h1, h2, end, width) {
    super();
    this.start = start;
    this.h1 = h1;
    this.h2 = h2;
    this.end = end;
    this.width = width;
  }
  // Moves the start and end points
  move_start(x, y) {
    this.start = [x, y];
  }
  move_end(x, y) {
    this.end = [x, y];
  }
  // Moves the handles
  move_h1(x, y) {
    this.h1 = [x, y];
  }
  move_h2(x, y) {
    this.h2 = [x, y];
  }
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.s2c(this.start[0], this.start[1]);
    let [h1_x, h1_y] = scene.s2c(this.h1[0], this.h1[1]);
    let [h2_x, h2_y] = scene.s2c(this.h2[0], this.h2[1]);
    let [end_x, end_y] = scene.s2c(this.end[0], this.end[1]);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.width * canvas.width / (xmax - xmin);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, end_x, end_y);
    ctx.stroke();
  }
};
var Scene = class {
  constructor(canvas) {
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
  }
  // Sets the coordinates for the borders of the frame
  set_frame_lims(xlims, ylims) {
    this.xlims = xlims;
    this.ylims = ylims;
  }
  // Converts scene coordinates to canvas coordinates
  s2c(x, y) {
    return [
      this.canvas.width * (x - this.xlims[0]) / (this.xlims[1] - this.xlims[0]),
      this.canvas.height * (this.ylims[1] - y) / (this.ylims[1] - this.ylims[0])
    ];
  }
  // Converts canvas coordinates to scene coordinates
  c2s(x, y) {
    return [
      this.xlims[0] + x * (this.xlims[1] - this.xlims[0]) / this.canvas.width,
      this.ylims[1] - y * (this.ylims[1] - this.ylims[0]) / this.canvas.height
    ];
  }
  // Adds a mobject to the scene
  add(name, mobj) {
    this.mobjects[name] = mobj;
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
export {
  BezierCurve,
  Dot,
  Line,
  MObject,
  Scene,
  clamp,
  linspace,
  prepare_canvas,
  sigmoid,
  vec_norm,
  vec_scale,
  vec_sub,
  vec_sum,
  vec_sum_list
};
