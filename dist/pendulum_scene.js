// src/base.ts
var MObject = class {
  constructor() {
  }
  draw(canvas, scene) {
  }
};
var Dot = class extends MObject {
  constructor(center_x, center_y, radius) {
    super();
    this.center = [center_x, center_y];
    this.radius = radius;
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
    ctx.arc(x, y, xr - x, 0, 2 * Math.PI);
    ctx.fill();
  }
};
var Line = class extends MObject {
  constructor(start, end, width) {
    super();
    this.start = start;
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
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.s2c(this.start[0], this.start[1]);
    let [end_x, end_y] = scene.s2c(this.end[0], this.end[1]);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.width * canvas.width / (xmax - xmin);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
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
      this.canvas.height * (y - this.ylims[0]) / (this.ylims[1] - this.ylims[0])
    ];
  }
  // Converts canvas coordinates to scene coordinates
  c2s(x, y) {
    return [
      this.xlims[0] + x * (this.xlims[1] - this.xlims[0]) / this.canvas.width,
      this.ylims[0] + y * (this.ylims[1] - this.ylims[0]) / this.canvas.height
    ];
  }
  // Adds a mobject to the scene
  add(name, mobj) {
    this.mobjects[name] = mobj;
  }
  // Gets the mobject by name
  get_mobj(name) {
    let mobj = this.mobjects[name];
    if (mobj == void 0) throw new Error(`${name} not found`);
    return mobj;
  }
  // Draws the scene
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
  }
  // Ticks the animation forward by one step
  tick() {
  }
  // Start animation
  start_playing() {
  }
};
function Slider(container, callback, initial_value) {
  let slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "10";
  slider.step = "0.001";
  slider.value = initial_value;
  slider.classList.add("slider");
  slider.id = "floatSlider";
  container.appendChild(slider);
  let valueDisplay = document.createElement("span");
  valueDisplay.classList.add("value-display");
  valueDisplay.id = "sliderValue";
  valueDisplay.textContent = slider.value;
  container.appendChild(valueDisplay);
  function updateDisplay() {
    callback(slider.value);
    valueDisplay.textContent = slider.value;
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

// src/pendulum_scene.ts
var GRAV_CONSTANT = 1;
var PendulumScene = class extends Scene {
  // Displacement from equilibrium and linear velocity, measured by arc-length
  constructor(canvas, length, top, stroke_width, radius) {
    super(canvas);
    this.length = length;
    this.top = top;
    this.add("string", new Line(top, [top[0], top[1] + length], stroke_width));
    this.add("bob", new Dot(top[0], top[1] + length, radius));
    this.state = [0, 0];
  }
  // Set the arc-length position. Used by the scene evolution engine and by user input.
  set_position(s) {
    this.state[0] = s;
    let theta = s / this.length;
    let sx = this.top[0] + this.length * Math.sin(theta);
    let sy = this.top[1] + this.length * Math.cos(theta);
    let string = this.get_mobj("string");
    string.move_end(sx, sy);
    let bob = this.get_mobj("bob");
    bob.move_to(sx, sy);
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
  // Set the total energy by increasing/decreasing the velocity
  set_max_angle(t) {
    this.set_energy(GRAV_CONSTANT * this.length * (1 - Math.cos(t)));
  }
  // Set the total energy by increasing/decreasing the velocity
  set_energy(e) {
    let pe = GRAV_CONSTANT * this.length * (1 - Math.cos(this.state[0] / this.length));
    this.set_velocity(Math.sqrt(2 * (e - pe)) * Math.sign(this.state[1]));
  }
  get_energy() {
    let pe = GRAV_CONSTANT * this.length * (1 - Math.cos(this.state[0] / this.length));
    let ke = 0.5 * this.state[1] ** 2;
    return pe + ke;
  }
  // Change the length of the string without changing the pendulum angular position or
  // max angle. Used by user input
  set_length(new_length) {
    let e = this.get_energy();
    let old_length = this.length;
    this.length = new_length;
    this.set_position(this.state[0] * new_length / old_length);
    this.set_energy(e * new_length / old_length);
  }
  // x'' in terms of x
  d2x(x) {
    return -GRAV_CONSTANT * Math.sin(x / this.length);
  }
  // Evolves the simulation forward by time dt
  step(dt) {
    let k1 = [this.state[1], this.d2x(this.state[0])];
    let k2 = [
      this.state[1] + k1[1] * dt / 2,
      this.d2x(this.state[0] + k1[0] * dt / 2)
    ];
    let k3 = [
      this.state[1] + k2[1] * dt / 2,
      this.d2x(this.state[0] + k2[0] * dt / 2)
    ];
    let k4 = [
      this.state[1] + k3[1] * dt,
      this.d2x(this.state[0] + k3[0] * dt)
    ];
    this.set_position(
      this.state[0] + (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt / 6
    );
    this.set_velocity(
      this.state[1] + (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt / 6
    );
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
    let length = 6;
    let top = [0, -4];
    let scene = new PendulumScene(canvas, length, top, 0.05, 0.3);
    scene.set_position(0);
    scene.set_velocity(1);
    let xlims = [-5, 5];
    let ylims = [-5, 5];
    scene.set_frame_lims(xlims, ylims);
    let length_slider = Slider(
      document.getElementById("slider-length-container"),
      function(l) {
        scene.set_length(l);
      },
      "6.0"
    );
    length_slider.min = "0.0";
    length_slider.max = "8.0";
    length_slider.width = 200;
    let angle_slider = Slider(
      document.getElementById("slider-energy-container"),
      function(t) {
        scene.set_max_angle(t);
      },
      "0.2"
    );
    angle_slider.min = "0.0";
    angle_slider.max = "1.5";
    angle_slider.width = 200;
    scene.draw();
    scene.start_playing();
  });
})();
