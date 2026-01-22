// src/base.ts
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
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
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
    for (let ind2 = 0; ind2 < this.state_size; ind2++) {
      this.vals[ind2] = clamp(
        this.vals[ind2],
        -this.clamp_value,
        this.clamp_value
      );
    }
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
var WaveSimTwoDimDipole = class extends WaveSimTwoDim {
};
var WaveSimTwoDimReflector = class extends WaveSimTwoDim {
  constructor(width, height, dt) {
    super(width, height, dt);
    // For each point p in the domain, and each possible direction N, S, E, W,
    // if the adjacent grid point to p in the chosen direction lies outside
    // of the domain, then we note down the distance to the region boundary in that direction.
    // Otherwise, we note the number 1 (which is the maximum possible value).
    this.x_pos_mask = new Array(this.size()).fill(1);
    this.x_neg_mask = new Array(this.size()).fill(1);
    this.y_pos_mask = new Array(this.size()).fill(1);
    this.y_neg_mask = new Array(this.size()).fill(1);
    this._recalculate_masks();
  }
  set_attr(name, val) {
    super.set_attr(name, val);
    this._recalculate_masks();
    this.zero_outside_region();
  }
  // *** Encodes geometry ***
  // Returns whether the point (x, y) in array coordinates is inside the domain.
  inside_region(x, y) {
    return true;
  }
  // Helper functions which return the fraction of leeway right, left, up and down
  // from the given array lattice point to the boundary.
  _x_plus(x, y) {
    return 1;
  }
  _x_minus(x, y) {
    return 1;
  }
  _y_plus(x, y) {
    return 1;
  }
  _y_minus(x, y) {
    return 1;
  }
  // Recalculate mask arrays based on current geometry
  _recalculate_masks() {
    let ind;
    for (let y_arr = 0; y_arr < this.height; y_arr++) {
      for (let x_arr = 0; x_arr < this.width; x_arr++) {
        ind = this.index(x_arr, y_arr);
        [this.x_pos_mask[ind], this.x_neg_mask[ind]] = this._calc_bdy_dists_x(
          x_arr,
          y_arr
        );
        [this.y_pos_mask[ind], this.y_neg_mask[ind]] = this._calc_bdy_dists_y(
          x_arr,
          y_arr
        );
      }
    }
  }
  // [0, 0] / [1, 1] means an exterior / interior point
  // A value between 0 and 1 in the first coordinate means moving to the right crosses the boundary
  // A value between 0 and 1 in the second coordinate means moving to the left crosses the boundary
  _calc_bdy_dists_x(x_arr, y_arr) {
    if (!this.inside_region(x_arr, y_arr)) {
      return [0, 0];
    } else {
      let a_pos, a_neg;
      if (!this.inside_region(x_arr + 1, y_arr)) {
        a_pos = this._x_plus(x_arr, y_arr);
      } else {
        a_pos = 1;
      }
      if (!this.inside_region(x_arr - 1, y_arr)) {
        a_neg = this._x_minus(x_arr, y_arr);
      } else {
        a_neg = 1;
      }
      return [a_pos, a_neg];
    }
  }
  _calc_bdy_dists_y(x_arr, y_arr) {
    if (!this.inside_region(x_arr, y_arr)) {
      return [0, 0];
    } else {
      let a_plus, a_minus;
      if (!this.inside_region(x_arr, y_arr + 1)) {
        a_plus = this._y_plus(x_arr, y_arr);
      } else {
        a_plus = 1;
      }
      if (!this.inside_region(x_arr, y_arr - 1)) {
        a_minus = this._y_minus(x_arr, y_arr);
      } else {
        a_minus = 1;
      }
      return [a_plus, a_minus];
    }
  }
  // Sets all points outside the region to 0
  zero_outside_region() {
    let ind;
    for (let y_arr = 0; y_arr < this.height; y_arr++) {
      for (let x_arr = 0; x_arr < this.width; x_arr++) {
        if (!this.inside_region(x_arr, y_arr)) {
          ind = this.index(x_arr, y_arr);
          this.vals[ind] = 0;
          this.vals[ind + this.size()] = 0;
          this.vals[ind + 2 * this.size()] = 0;
          this.vals[ind + 3 * this.size()] = 0;
        }
      }
    }
  }
  // *** Called during simulation ***
  get_bdy_dists_x(x_arr, y_arr) {
    return [
      this.x_pos_mask[this.index(x_arr, y_arr)],
      this.x_neg_mask[this.index(x_arr, y_arr)]
    ];
  }
  get_bdy_dists_y(x_arr, y_arr) {
    return [
      this.y_pos_mask[this.index(x_arr, y_arr)],
      this.y_neg_mask[this.index(x_arr, y_arr)]
    ];
  }
  d_x_entry(arr, x, y) {
    let [a_plus, a_minus] = this.get_bdy_dists_x(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.d_x_entry(arr, x, y);
    } else {
      return (a_minus * this._two_dim_state.d_x_plus(arr, x, y) / a_plus + a_plus * this._two_dim_state.d_x_minus(arr, x, y) / a_minus) / (a_minus + a_plus);
    }
  }
  d_y_entry(arr, x, y) {
    let [a_plus, a_minus] = this.get_bdy_dists_y(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.d_y_entry(arr, x, y);
    } else {
      return (a_minus * this._two_dim_state.d_y_plus(arr, x, y) / a_plus + a_plus * this._two_dim_state.d_y_minus(arr, x, y) / a_minus) / (a_minus + a_plus);
    }
  }
  // Calculates an entry of (d/dx)(d/dx)(array)
  l_x_entry(arr, x, y) {
    let [a_plus, a_minus] = this.get_bdy_dists_x(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.l_x_entry(arr, x, y);
    } else {
      return (this._two_dim_state.d_x_plus(arr, x, y) / a_plus - this._two_dim_state.d_x_minus(arr, x, y) / a_minus) / ((a_minus + a_plus) / 2);
    }
  }
  // Calculates an entry of (d/dy)(d/dy)(array)
  l_y_entry(arr, x, y) {
    let [a_plus, a_minus] = this.get_bdy_dists_y(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.l_y_entry(arr, x, y);
    } else {
      return (this._two_dim_state.d_y_plus(arr, x, y) / a_plus - this._two_dim_state.d_y_minus(arr, x, y) / a_minus) / ((a_minus + a_plus) / 2);
    }
  }
};
var WaveSimTwoDimEllipticReflector = class extends WaveSimTwoDimReflector {
  constructor(width, height, dt) {
    super(width, height, dt);
    // TODO: Ensure PML layer doesn't interfere with the region.
    this.semimajor_axis = 80;
    this.semiminor_axis = 60;
    this.w = 5;
    // Frequency
    this.a = 5;
    // Amplitude
    this.foci = [
      [
        Math.floor(
          this.width / 2 + Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2)
        ),
        Math.floor(this.height / 2)
      ],
      [
        Math.floor(
          this.width / 2 - Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2)
        ),
        Math.floor(this.height / 2)
      ]
    ];
    let [x, y] = this.foci[0];
    this.point_sources = [new PointSource(x, y, 5, 5)];
  }
  _recalculate_foci() {
    let [focus_1_x, focus_1_y] = [
      Math.floor(
        this.width / 2 + Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2)
      ),
      Math.floor(this.height / 2)
    ];
    let [focus_2_x, focus_2_y] = [
      Math.floor(
        this.width / 2 - Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2)
      ),
      Math.floor(this.height / 2)
    ];
    this.point_sources = [new PointSource(focus_1_x, focus_1_y, 5, 5)];
    this.foci = [
      [focus_1_x, focus_1_y],
      [focus_2_x, focus_2_y]
    ];
  }
  set_attr(name, val) {
    let p = this.point_sources[0];
    if (name == "w") {
      p.set_w(val);
    } else if (name == "a") {
      p.set_a(val);
    } else {
      this._recalculate_foci();
    }
    super.set_attr(name, val);
  }
  inside_region(x_arr, y_arr) {
    return ((x_arr - this.width / 2) / this.semimajor_axis) ** 2 + ((y_arr - this.height / 2) / this.semiminor_axis) ** 2 < 1;
  }
  _x_plus(x, y) {
    return Math.abs(
      this.semimajor_axis * Math.sqrt(1 - ((y - this.height / 2) / this.semiminor_axis) ** 2) - x + this.width / 2
    );
  }
  _x_minus(x, y) {
    return Math.abs(
      this.semimajor_axis * Math.sqrt(1 - ((y - this.height / 2) / this.semiminor_axis) ** 2) + x - this.width / 2
    );
  }
  _y_plus(x, y) {
    return Math.abs(
      this.semiminor_axis * Math.sqrt(1 - ((x - this.width / 2) / this.semimajor_axis) ** 2) - y + this.height / 2
    );
  }
  _y_minus(x, y) {
    return Math.abs(
      this.semiminor_axis * Math.sqrt(1 - ((x - this.width / 2) / this.semimajor_axis) ** 2) + y - this.height / 2
    );
  }
};
var WaveSimTwoDimParabolaReflector = class extends WaveSimTwoDimReflector {
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
var WaveSimTwoDimDotsScene = class extends InteractivePlayingScene {
  constructor(canvas, simulators, imageData) {
    super(canvas, simulators);
    this.simulators = simulators;
    if (simulators[0].width != simulators[1].width) {
      throw new Error("Simulators have different width.");
    }
    if (simulators[0].height != simulators[1].height) {
      throw new Error("Simulators have different height.");
    }
    console.log(this.xlims[1], this.xlims[0]);
    let w = simulators[0].width;
    let h = simulators[0].height;
    let x_eq, y_eq;
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        [x_eq, y_eq] = this.eq_position(x, y);
        this.add(`p_{${x}, ${y}}`, new Dot(x_eq, y_eq, 2 / w));
      }
    }
  }
  // Returns the equilibrium position of the dot at position (x, y)
  eq_position(x, y) {
    return [
      this.xlims[0] + (x + 0.5) * (this.xlims[1] - this.xlims[0]) / this.width(),
      this.ylims[0] + (y + 0.5) * (this.ylims[1] - this.ylims[0]) / this.height()
    ];
  }
  get_simulator(ind) {
    return super.get_simulator(ind);
  }
  width() {
    return this.get_simulator(0).width;
  }
  height() {
    return this.get_simulator(0).height;
  }
  // Move all of the dots, where the two simulators control
  // the x-coordinates and y-coordinates, respectively.
  update_mobjects() {
    let w = this.width();
    let h = this.height();
    let dot;
    let ind;
    let x_eq;
    let y_eq;
    let sim_0 = this.get_simulator(0);
    let u_0 = sim_0.get_uValues();
    let u_1 = this.get_simulator(1).get_uValues();
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        dot = this.get_mobj(`p_{${x}, ${y}}`);
        ind = sim_0.index(x, y);
        [x_eq, y_eq] = this.eq_position(x, y);
        dot.move_to(x_eq + u_0[ind], y_eq + u_1[ind]);
      }
    }
  }
  draw_mobject(mobj) {
    mobj.draw(this.canvas, this);
  }
};
export {
  WaveSimTwoDim,
  WaveSimTwoDimDipole,
  WaveSimTwoDimDotsScene,
  WaveSimTwoDimEllipticReflector,
  WaveSimTwoDimHeatMapScene,
  WaveSimTwoDimParabolaReflector,
  WaveSimTwoDimPointSource,
  WaveSimTwoDimReflector
};
