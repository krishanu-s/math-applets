// src/lib/base.ts
var MObject = class {
  // Opacity for drawing
  constructor() {
    this.alpha = 1;
  }
  set_alpha(alpha) {
    this.alpha = alpha;
  }
  draw(canvas, scene, args) {
  }
};
var Scene = class {
  constructor(canvas) {
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

// src/lib/base_geom.ts
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
    ctx.fillStyle = this.fill_color;
    ctx.globalAlpha = this.alpha;
    let [x, y] = scene.v2c(this.center);
    let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
};

// src/orbit_scene.ts
var GRAV_CONSTANT = 1;
var OrbitScene = class extends Scene {
  constructor(canvas, center) {
    super(canvas);
    this.center = center;
    this.add("center", new Dot(center[0], center[1], { radius: 0.2 }));
    this.add("orbiter", new Dot(center[0], center[1], { radius: 0.1 }));
    this.state = [
      [center[0], center[1]],
      [0, 0]
    ];
  }
  // Set the position of the orbiter
  set_position(x) {
    this.state[0] = x;
    let orbiter = this.get_mobj("orbiter");
    orbiter.move_to(x[0], x[1]);
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
