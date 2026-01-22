// src/base.ts
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
var MObject = class {
  constructor() {
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

// src/interactive.ts
function Slider(container, callback, initial_value, min, max, step) {
  let slider = document.createElement("input");
  slider.type = "range";
  if (min == void 0) {
    slider.min = "0";
  } else {
    slider.min = `${min}`;
  }
  if (max == void 0) {
    slider.max = "10";
  } else {
    slider.max = `${max}`;
  }
  if (step == void 0) {
    slider.step = ".01";
  } else {
    slider.step = `${step}`;
  }
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
function Button(container, callback) {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "interactiveButton";
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

// src/heatmap.ts
function rb_colormap(z) {
  const gray = sigmoid(z);
  if (gray < 0.5) {
    return [512 * gray, 512 * gray, 255, 255];
  } else {
    return [255, 512 * (1 - gray), 512 * (1 - gray), 255];
  }
}
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
  // Gets/sets values
  set_vals(vals) {
    this.valArray = vals;
  }
  get_vals() {
    return this.valArray;
  }
  // Draws on the canvas
  draw(canvas, scene, imageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.valArray[i];
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(px_val);
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.putImageData(imageData, 0, 0);
  }
};

// src/statesim.ts
var Simulator = class {
  // Length of time in each simulation step
  constructor(state_size, dt) {
    // Size of the array of values storing the state
    this.time = 0;
    this.state_size = state_size;
    this.vals = new Array(this.state_size).fill(0);
    this.dt = dt;
  }
  // Resets the simulation
  reset() {
    this.vals = new Array(this.state_size).fill(0);
    this.time = 0;
    this.add_boundary_conditions(this.vals, 0);
  }
  // Generic setter.
  set_attr(name, val) {
    if (name in this) {
      this[name] = val;
    }
  }
  // Getter and setter for state.
  get_vals() {
    return this.vals;
  }
  set_vals(vals) {
    this.vals = vals;
  }
  // Time-derivative of a given state and time. Overwritten in subclasses.
  dot(vals, time) {
    return new Array(this.state_size).fill(0);
  }
  // Subroutine for adding any time-evolution calculation
  // which does not adhere to the differential equation. Used in step().
  add_boundary_conditions(s, t) {
  }
  // Advances the simulation using the differential equation with
  // s(t + dt) = s(t) + dt * s'(t)
  step_finite_diff() {
    let newS = new Array(this.state_size).fill(0);
    let dS = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt * dS[i];
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
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
    this.add_boundary_conditions(newS, this.time + this.dt / 2);
    let dS_2 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt / 2 * dS_2[i];
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);
    let dS_3 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt * dS_3[i];
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
    let dS_4 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = this.vals[i] + this.dt / 6 * dS_1[i] + this.dt / 3 * dS_2[i] + this.dt / 3 * dS_3[i] + this.dt / 6 * dS_4[i];
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
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
var InteractivePlayingScene = class extends Scene {
  // Store a known end-time in case the simulation is paused and unpaused
  constructor(canvas, simulators) {
    super(canvas);
    [this.num_simulators, this.simulators] = simulators.reduce(
      ([ind, acc], item) => (acc[ind] = item, [ind + 1, acc]),
      [0, {}]
    );
    this.action_queue = [];
    this.paused = true;
    this.time = 0;
    this.dt = simulators[0].dt;
  }
  get_simulator(ind) {
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
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates all mobjects to account for the new simulator state
  update_mobjects() {
  }
  // Draws the scene.
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

// src/wavesim.ts
var PointSource = class {
  // Amplitude
  constructor(x, y, w, a) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.a = a;
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
};
var WaveSimTwoDim = class extends Simulator {
  constructor(width, height, dt) {
    super(4 * width * height, dt);
    this.pml_layers = {};
    this.wave_propagation_speed = 20;
    this.point_sources = [];
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
    this.add_boundary_conditions(this.vals, this.time);
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
        dS[ind + this.size()] = this.wave_propagation_speed ** 2 * this.laplacian_entry(u, x, y) + this.d_x_entry(px, x, y) + this.d_y_entry(py, x, y) - (this.sigma_x(x) + this.sigma_y(y)) * vals[ind + this.size()] - this.sigma_x(x) * this.sigma_y(y) * vals[ind];
      }
    }
    for (let x = 0; x < this.width; x++) {
      sx = this.sigma_x(x);
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        dS[ind + 2 * this.size()] = -sx * px[ind] + this.wave_propagation_speed ** 2 * (this.sigma_y(y) - sx) * this.d_x_entry(u, x, y);
      }
    }
    for (let y = 0; y < this.height; y++) {
      sy = this.sigma_y(y);
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        dS[ind + 3 * this.size()] = -sy * py[ind] + this.wave_propagation_speed ** 2 * (this.sigma_x(x) - sy) * this.d_y_entry(u, x, y);
      }
    }
    return dS;
  }
  // Add point sources
  add_boundary_conditions(s, t) {
    let ind;
    this.point_sources.forEach((elem) => {
      ind = this.index(elem.x, elem.y);
      s[ind] = elem.a * Math.sin(elem.w * t);
      s[ind + this.size()] = elem.a * elem.w * Math.cos(elem.w * t);
    });
  }
};
var WaveSimTwoDimPointSource = class extends WaveSimTwoDim {
  constructor(width, height, dt) {
    super(width, height, dt);
    this.point_sources = [
      new PointSource(
        Math.floor(this.width / 2),
        Math.floor(this.height / 2),
        2,
        5
      )
    ];
  }
  set_attr(name, val) {
    let p = this.point_sources[0];
    if (name == "w") {
      p.set_w(val);
    } else if (name == "a") {
      p.set_a(val);
    } else if (name == "source_x") {
      p.set_x(val);
    } else if (name == "source_y") {
      p.set_y(val);
    } else {
      super.set_attr(name, val);
    }
  }
};
var WaveSimTwoDimHeatMapScene = class extends InteractivePlayingScene {
  // Target for heatmap data
  constructor(canvas, simulator, imageData) {
    super(canvas, [simulator]);
    this.simulator = simulator;
    simulator;
    this.add(
      "heatmap",
      new HeatMap(
        simulator.width,
        simulator.height,
        -1,
        1,
        this.simulator.get_uValues()
      )
    );
    this.imageData = imageData;
  }
  update_mobjects() {
    let mobj = this.get_mobj("heatmap");
    mobj.set_vals(this.simulator.get_uValues());
  }
  draw_mobject(mobj) {
    if (mobj instanceof HeatMap) {
      mobj.draw(this.canvas, this, this.imageData);
    } else {
      mobj.draw(this.canvas, this);
    }
  }
};

// src/wavesim_scene.ts
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    const xmin = -5;
    const xmax = 5;
    const ymin = -5;
    const ymax = 5;
    const clamp_value = 10;
    let width = 200;
    let height = 200;
    const dt = 0.01;
    let canvas = prepare_canvas(width, height, "scene-container");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }
    const imageData = ctx.createImageData(width, height);
    let waveSim = new WaveSimTwoDimPointSource(width, height, dt);
    waveSim.wave_propagation_speed = width / 10;
    waveSim.set_attr("a", 5);
    waveSim.set_pml_layer(true, true, 0.2, 200);
    waveSim.set_pml_layer(true, false, 0.2, 200);
    waveSim.set_pml_layer(false, true, 0.2, 200);
    waveSim.set_pml_layer(false, false, 0.2, 200);
    waveSim.add_boundary_conditions(waveSim.vals, 0);
    let waveEquationScene = new WaveSimTwoDimHeatMapScene(
      canvas,
      waveSim,
      imageData
    );
    waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    let w_slider = Slider(
      document.getElementById("slider-container-1"),
      function(w) {
        waveEquationScene.add_to_queue(
          waveEquationScene.set_simulator_attr.bind(
            waveEquationScene,
            0,
            "w",
            w
          )
        );
      },
      `5.0`,
      0,
      20,
      0.05
    );
    w_slider.width = 200;
    let pauseButton = Button(
      document.getElementById("button-container-1"),
      function() {
        waveEquationScene.add_to_queue(
          waveEquationScene.toggle_pause.bind(waveEquationScene)
        );
        if (pauseButton.textContent == "Pause simulation") {
          pauseButton.textContent = "Unpause simulation";
        } else if (pauseButton.textContent == "Unpause simulation") {
          pauseButton.textContent = "Pause simulation";
        } else {
          throw new Error();
        }
      }
    );
    pauseButton.textContent = "Pause simulation";
    pauseButton.style.padding = "15px";
    let a_slider = Slider(
      document.getElementById("slider-container-1"),
      function(a) {
        waveEquationScene.add_to_queue(
          waveEquationScene.set_simulator_attr.bind(
            waveEquationScene,
            0,
            "a",
            a
          )
        );
      },
      `5.0`,
      0,
      10,
      0.05
    );
    a_slider.width = 200;
    let clearButton = Button(
      document.getElementById("button-container-3"),
      function() {
        waveEquationScene.add_to_queue(
          waveEquationScene.reset.bind(waveEquationScene)
        );
      }
    );
    clearButton.textContent = "Clear";
    clearButton.style.padding = "15px";
    console.log("Ready to play");
    waveEquationScene.toggle_pause();
    waveEquationScene.play(void 0);
  });
})();
