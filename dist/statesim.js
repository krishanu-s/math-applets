// src/base.ts
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
export {
  InteractivePlayingScene,
  Simulator,
  TwoDimState
};
