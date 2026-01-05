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

// src/catenary_scene.ts
function zero_state() {
  return [
    [0, 0],
    [0, 0]
  ];
}
function state_scale(x, factor) {
  return [vec_scale(x[0], factor), vec_scale(x[1], factor)];
}
function state_sum(x, y) {
  return [vec_sum(x[0], y[0]), vec_sum(x[1], y[1])];
}
var CatenaryScene = class extends Scene {
  constructor(canvas, p0, p1, length, num_segments) {
    super(canvas);
    this.p0 = p0;
    this.p1 = p1;
    this.length = length;
    this.num_segments = num_segments;
    this.spring_constant = 1;
    this.friction_constant = 0.4;
    this.gravity = 1;
    this.state = [];
    for (let i = 0; i <= num_segments; i++) {
      this.state.push([
        [
          p0[0] + (p1[0] - p0[0]) * i / num_segments,
          p0[1] + (p1[1] - p0[1]) * i / num_segments
        ],
        [0, 0]
      ]);
    }
    for (let i = 0; i <= num_segments; i++) {
      this.add(
        `p${i}`,
        new Dot(this.get_position(i)[0], this.get_position(i)[1], 0.08)
      );
    }
    for (let i = 1; i <= num_segments; i++) {
      this.add(
        `v${i}`,
        new Line(this.get_position(i - 1), this.get_position(i), 0.05)
      );
    }
  }
  set_gravity(g) {
    this.gravity = g;
  }
  set_friction(c) {
    this.friction_constant = c;
  }
  set_spring(k) {
    this.spring_constant = k;
  }
  move_start(p) {
    this.p0 = p;
  }
  move_end(p) {
    this.p1 = p;
  }
  set_num_segments(n) {
  }
  get_state(index) {
    return this.state[index];
  }
  set_position(index, position) {
    let s = this.state[index];
    s[0] = position;
    let p = this.get_mobj(`p${index}`);
    p.move_to(position[0], position[1]);
    if (index > 0) {
      let v = this.get_mobj(`v${index}`);
      v.move_end(position[0], position[1]);
    }
    if (index < this.num_segments) {
      let v = this.get_mobj(`v${index + 1}`);
      v.move_start(position[0], position[1]);
    }
  }
  get_position(index) {
    return this._get_position(index, this.state);
  }
  _get_position(index, state) {
    let s = state[index];
    return s[0];
  }
  set_velocity(index, velocity) {
    let s = this.state[index];
    s[1] = velocity;
  }
  get_velocity(index) {
    return this._get_velocity(index, this.state);
  }
  _get_velocity(index, state) {
    let s = state[index];
    return s[1];
  }
  d2x(index, state) {
    let rel_pos, disp;
    rel_pos = vec_sub(
      state[index][0],
      state[index - 1][0]
    );
    disp = vec_norm(rel_pos);
    let spring_term_1 = vec_scale(
      rel_pos,
      -this.spring_constant * Math.max(disp - this.length / this.num_segments, 0) / disp
    );
    rel_pos = vec_sub(
      state[index][0],
      state[index + 1][0]
    );
    disp = vec_norm(rel_pos);
    let spring_term_2 = vec_scale(
      rel_pos,
      -this.spring_constant * Math.max(disp - this.length / this.num_segments, 0) / disp
    );
    return vec_sum_list([
      [0, this.gravity / this.num_segments],
      vec_scale(this._get_velocity(index, state), -this.friction_constant),
      spring_term_1,
      spring_term_2
    ]);
  }
  // Evolves the simulation forward by time dt
  step(dt) {
    let k1 = [];
    k1.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k1.push([this.get_velocity(i), this.d2x(i, this.state)]);
    }
    k1.push(zero_state());
    let p2 = [];
    p2.push(this.get_state(0));
    for (let i = 1; i < this.num_segments; i++) {
      p2.push(
        state_sum(this.get_state(i), state_scale(k1[i], dt / 2))
      );
    }
    p2.push(this.get_state(this.num_segments));
    let k2 = [];
    k2.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k2.push([this._get_velocity(i, p2), this.d2x(i, p2)]);
    }
    k2.push(zero_state());
    let p3 = [];
    p3.push(this.get_state(0));
    for (let i = 1; i < this.num_segments; i++) {
      p3.push(
        state_sum(this.get_state(i), state_scale(k2[i], dt / 2))
      );
    }
    p3.push(this.get_state(this.num_segments));
    let k3 = [];
    k3.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k3.push([this._get_velocity(i, p3), this.d2x(i, p3)]);
    }
    k3.push(zero_state());
    let p4 = [];
    p4.push(this.get_state(0));
    for (let i = 1; i < this.num_segments; i++) {
      p4.push(state_sum(this.get_state(i), state_scale(k2[i], dt)));
    }
    p4.push(this.get_state(this.num_segments));
    let k4 = [];
    k4.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k4.push([this._get_velocity(i, p4), this.d2x(i, p4)]);
    }
    k4.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      this.set_position(
        i,
        vec_sum_list([
          this.get_position(i),
          vec_scale(this._get_position(i, k1), dt / 6),
          vec_scale(this._get_position(i, k2), dt / 3),
          vec_scale(this._get_position(i, k3), dt / 3),
          vec_scale(this._get_position(i, k4), dt / 6)
        ])
      );
      this.set_velocity(
        i,
        vec_sum_list([
          this.get_velocity(i),
          vec_scale(this._get_velocity(i, k1), dt / 6),
          vec_scale(this._get_velocity(i, k2), dt / 3),
          vec_scale(this._get_velocity(i, k3), dt / 3),
          vec_scale(this._get_velocity(i, k4), dt / 6)
        ])
      );
    }
  }
  // Starts animation
  start_playing() {
    this.step(0.1);
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
    let p0 = [-2, -2];
    let p1 = [2, -3];
    let length = 6;
    let num_segments = 20;
    let scene = new CatenaryScene(canvas, p0, p1, length, num_segments);
    let xlims = [-5, 5];
    let ylims = [-5, 5];
    scene.set_frame_lims(xlims, ylims);
    let gravity_slider = Slider(
      document.getElementById("slider-gravity-container"),
      function(g) {
        scene.set_gravity(g);
      },
      "1.0"
    );
    gravity_slider.min = "0.0";
    gravity_slider.max = "8.0";
    gravity_slider.width = 200;
    scene.draw();
    scene.start_playing();
  });
})();
