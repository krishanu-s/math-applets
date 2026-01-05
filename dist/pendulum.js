// src/point.ts
var dist_tolerance = 1e-5;
function isclose(a, b) {
  return Math.abs(a - b) < dist_tolerance;
}
var Point2D = class {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  translate_x(a) {
    this.x += a;
  }
  translate_y(a) {
    this.y += a;
  }
  rotate(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    this.x = c * this.x - s * this.y;
    this.y = s * this.x + c * this.y;
  }
  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  scale(n) {
    this.x *= n;
    this.y *= n;
  }
  isclose(other) {
    return isclose(this.x, other.x) && isclose(this.y, other.y);
  }
  to_projective() {
    return new ProjectivePoint(this.x, this.y, 1);
  }
};
var ProjectivePoint = class {
  constructor(x = 0, y = 0, z = 1) {
    this.x = x;
    this.y = y;
    this.z = 1;
  }
  translate_x(a) {
    if (this.z != 0) {
      this.x += a * this.z;
    }
  }
  translate_y(a) {
    if (this.z != 0) {
      this.y += a * this.z;
    }
  }
  rotate(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    this.x = c * this.x - s * this.y;
    this.y = s * this.x + c * this.y;
  }
  isclose(other) {
    let scale;
    if (this.x != 0) {
      scale = other.x / this.x;
    } else if (this.y != 0) {
      scale = other.y / this.y;
    } else {
      scale = other.z / this.z;
    }
    return isclose(scale * this.x, other.x) && isclose(scale * this.y, other.y) && isclose(scale * this.z, other.z);
  }
  to_2d() {
    if (this.z == 0)
      throw new Error(
        "Cannot convert the point at infinity to Cartesian coordinates."
      );
    return new Point2D(this.x / this.z, this.y / this.z);
  }
};

// src/pendulum.ts
var RungeKutta2 = class {
  // The function f(t, x)
  constructor(t, val, f) {
    this.t = t;
    this.val = val;
    this.f = f;
  }
  // Step forward in time by dt
  step(dt) {
    let k1 = [this.val.y, this.f(this.t, this.val.x)];
    let k2 = [
      this.val.y + k1[1] * dt / 2,
      this.f(this.t + dt / 2, this.val.x + k1[0] * dt / 2)
    ];
    let k3 = [
      this.val.y + k2[1] * dt / 2,
      this.f(this.t + dt / 2, this.val.x + k2[0] * dt / 2)
    ];
    let k4 = [
      this.val.y + k3[1] * dt,
      this.f(this.t + dt, this.val.x + k3[0] * dt)
    ];
    this.t += dt;
    this.val.translate_x((k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt / 6);
    this.val.translate_y((k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt / 6);
  }
};
var PendulumSolver = class {
  // Runge-Kutta 2nd order solver
  constructor(l) {
    this.l = l;
    this.x = 0;
    this.v = 0;
    let diff_eq = (t, x) => -Math.sin(x) / this.l;
    this.solver = new RungeKutta2(0, new Point2D(this.x, this.v), diff_eq);
    console.log(
      `Starting position: ${this.solver.val.x}, ${this.solver.val.y}`
    );
    this.set_initial_conditions(0, 0);
  }
  // Sets the initial conditions for the pendulum and initializes the solver.
  set_initial_conditions(x0, v0) {
    this.x = x0;
    this.v = v0;
    let diff_eq = (t, x) => -Math.sin(x) / this.l;
    this.solver = new RungeKutta2(0, new Point2D(this.x, this.v), diff_eq);
    console.log(
      `Starting position: ${this.solver.val.x}, ${this.solver.val.y}`
    );
  }
  // Kinetic energy / (mg^2)
  kinetic_energy(v) {
    return 0.5 * (this.l * v) ** 2;
  }
  // Potential energy / (mg^2)
  potential_energy(x) {
    return this.l * (1 - Math.cos(x));
  }
  // Draw the pendulum on a canvas with angle theta
  // TODO Add option to keep or not keep the pendulum string.
  draw(canvas, scale) {
    let ctx = canvas.getContext("2d");
    if (ctx == null) throw new Error("No canvas.");
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "rgba(255, 0, 0, 1.0)";
    ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
    let offset = 10;
    let length = Math.min(canvas.height, canvas.width / 2);
    let theta = this.solver.val.x;
    let x = canvas.width / 2 + length * Math.sin(theta);
    let y = offset + length * Math.cos(theta);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, offset);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  // Advance the simulation by one frame
  step(dt) {
    let num_iterations = 10;
    let total_energy = this.kinetic_energy(this.v) + this.potential_energy(this.x);
    for (let i = 0; i < num_iterations; i++) {
      this.solver.step(dt / num_iterations);
    }
    let diff = total_energy - this.kinetic_energy(this.solver.val.y);
    this.solver.val.x = Math.acos(1 - diff / this.l);
    console.log(`New position: ${this.solver.val.x}, ${this.solver.val.y}`);
  }
};
var Drawer = class {
  constructor(container, canvas) {
    this.container = container;
    this.canvas = canvas;
    this.element = new PendulumSolver(1);
    this.requested_repaint = false;
    this.paused = true;
    this.repaint();
  }
  // Sets the pendulum position
  set_initial_conditions(x, v) {
    this.element.set_initial_conditions(x, v);
    this.request_repaint();
  }
  // Toggles pause/resume state
  set_paused(pause) {
    this.paused = pause;
  }
  switch_mode() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.tick();
    }
    console.log("Switched mode");
  }
  // Ticks the simulation forward by one frame
  tick() {
    this.element.step(0.05);
    this.repaint();
    if (this.paused) {
      return;
    } else {
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }
  request_repaint() {
    if (!this.requested_repaint) {
      this.requested_repaint = true;
      let self = this;
      window.requestAnimationFrame(function() {
        self.repaint();
      });
    } else {
    }
  }
  repaint() {
    this.requested_repaint = false;
    this.element.draw(this.canvas, 1);
  }
};
export {
  Drawer
};
