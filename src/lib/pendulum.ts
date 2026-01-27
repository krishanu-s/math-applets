// Plotting pendulum motion

// TODO Convert this to use "statesim.ts"
import { Point2D } from "./point.js";
type Vec2<T> = [T, T];
// Differential equation solvers
class RungeKutta {
  // Method for forward-stepping a differential equation of the form
  // dx/dt = f(t, x)
  t: number; // The current time
  x: number; // The current position
  f: (t: number, x: number) => number; // The function f(t, x)
  constructor(t: number, x: number, f: (t: number, x: number) => number) {
    this.t = t;
    this.x = x;
    this.f = f;
  }
  // Step forward in time by dt
  step(dt: number) {
    let k1 = this.f(this.t, this.x);
    let k2 = this.f(this.t + dt / 2, this.x + (k1 * dt) / 2);
    let k3 = this.f(this.t + dt / 2, this.x + (k2 * dt) / 2);
    let k4 = this.f(this.t + dt, this.x + k3 * dt);
    this.t += dt;
    this.x += ((k1 + 2 * k2 + 2 * k3 + k4) * dt) / 6;
  }
}

class RungeKutta2 {
  // Method for forward-stepping a differential equation of the form
  // (d/dt)^2(x) = f(t, x)
  t: number; // The current time
  val: Point2D; // The current position and derivative
  f: (t: number, x: number) => number; // The function f(t, x)
  constructor(t: number, val: Point2D, f: (t: number, val: number) => number) {
    this.t = t;
    this.val = val;
    this.f = f;
  }
  // Step forward in time by dt
  step(dt: number) {
    let k1: Vec2<number> = [this.val.y, this.f(this.t, this.val.x)];
    let k2: Vec2<number> = [
      this.val.y + (k1[1] * dt) / 2,
      this.f(this.t + dt / 2, this.val.x + (k1[0] * dt) / 2),
    ];
    let k3: Vec2<number> = [
      this.val.y + (k2[1] * dt) / 2,
      this.f(this.t + dt / 2, this.val.x + (k2[0] * dt) / 2),
    ];
    let k4: Vec2<number> = [
      this.val.y + k3[1] * dt,
      this.f(this.t + dt, this.val.x + k3[0] * dt),
    ];
    this.t += dt;
    this.val.translate_x(((k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt) / 6);
    this.val.translate_y(((k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt) / 6);
  }
}
// Pendulum differential equation solver
class PendulumSolver {
  // A simple pendulum under the influence of gravity.
  l: number; // Pendulum length divided by gravitational constant
  x: number; // Initial angle
  v: number; // Initial angular velocity
  solver: RungeKutta2; // Runge-Kutta 2nd order solver
  constructor(l: number) {
    this.l = l;
    this.x = 0;
    this.v = 0;
    let diff_eq = (t: number, x: number) => -Math.sin(x) / this.l;
    this.solver = new RungeKutta2(0, new Point2D(this.x, this.v), diff_eq);
    console.log(
      `Starting position: ${this.solver.val.x}, ${this.solver.val.y}`,
    );
    this.set_initial_conditions(0, 0);
  }
  // Sets the initial conditions for the pendulum and initializes the solver.
  set_initial_conditions(x0: number, v0: number) {
    this.x = x0;
    this.v = v0;
    let diff_eq = (t: number, x: number) => -Math.sin(x) / this.l;
    this.solver = new RungeKutta2(0, new Point2D(this.x, this.v), diff_eq);
    console.log(
      `Starting position: ${this.solver.val.x}, ${this.solver.val.y}`,
    );
  }
  // Kinetic energy / (mg^2)
  kinetic_energy(v: number): number {
    return 0.5 * (this.l * v) ** 2;
  }
  // Potential energy / (mg^2)
  potential_energy(x: number): number {
    return this.l * (1 - Math.cos(x));
  }
  // Draw the pendulum on a canvas with angle theta
  // TODO Add option to keep or not keep the pendulum string.
  draw(canvas: HTMLCanvasElement, scale: number) {
    // Retrieve the canvas and set it up
    let ctx = canvas.getContext("2d");
    if (ctx == null) throw new Error("No canvas.");

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = "rgba(255, 0, 0, 1.0)";
    ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";

    // Distance from top of canvas to top of pendulum
    let offset = 10;
    // Length of the pendulum string
    let length = Math.min(canvas.height, canvas.width / 2);
    // Current position of the pendulum bob
    let theta = this.solver.val.x;

    // Pendulum bob
    let x = canvas.width / 2 + length * Math.sin(theta);
    let y = offset + length * Math.cos(theta);

    ctx.beginPath();
    // Draw the pendulum string
    ctx.moveTo(canvas.width / 2, offset);
    ctx.lineTo(x, y);
    ctx.stroke();
    // Draw the pendulum bob
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  // Advance the simulation by one frame
  step(dt: number) {
    let num_iterations = 10; // Number of iterations of Runge-Kutta method per frame update

    // Total energy before update
    let total_energy =
      this.kinetic_energy(this.v) + this.potential_energy(this.x);

    // Iterate the solver forward num_iterations times
    for (let i = 0; i < num_iterations; i++) {
      this.solver.step(dt / num_iterations);
    }

    // TODO Modify position vector to ensure energy conservation holds
    // Make sure to deal with the cases where x is close to 0 or y is close to 0
    let diff = total_energy - this.kinetic_energy(this.solver.val.y);
    this.solver.val.x = Math.acos(1 - diff / this.l);

    // Print off the new position
    console.log(`New position: ${this.solver.val.x}, ${this.solver.val.y}`);
  }
}

class ConstrainedPendulum {
  // A simple pendulum under the influence of gravity, where the path of
  // the pendulum is constrained by a parametrized curve.
  // The drawing is also appropriately modified.
}

// Drawer
export class Drawer {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  element: PendulumSolver;
  requested_repaint: boolean;
  paused: boolean;
  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    // Assumes wrapper and canvas etc all set up
    this.container = container;
    this.canvas = canvas;
    this.element = new PendulumSolver(1.0);
    this.requested_repaint = false;
    this.paused = true;
    this.repaint();
  }
  // Sets the pendulum position
  set_initial_conditions(x: number, v: number) {
    this.element.set_initial_conditions(x, v);
    this.request_repaint();
  }
  // Toggles pause/resume state
  set_paused(pause: boolean) {
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
  tick(): void {
    // console.log("Ticking drawer");
    this.element.step(0.05);
    this.repaint();
    if (this.paused) {
      return;
    } else {
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }
  request_repaint(): void {
    if (!this.requested_repaint) {
      // console.log("Beginning repainting");
      this.requested_repaint = true;
      let self = this;
      window.requestAnimationFrame(function () {
        // console.log("Got animation frame");
        self.repaint();
      });
    } else {
      // console.log("Repaint already requested");
    }
  }
  repaint(): void {
    this.requested_repaint = false;
    this.element.draw(this.canvas, 1.0);
    // console.log("Repaint complete");
  }
}
