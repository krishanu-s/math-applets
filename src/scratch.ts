import { MObject, Scene, Dot, Line, prepare_canvas } from "./base.js";
import { Slider, Button } from "./interactive.js";
import { Vec2D, clamp, sigmoid } from "./base.js";
import { ParametricFunction } from "./parametric.js";
import { HeatMap } from "./heatmap.js";

// Aspirational structure for interactive, animated simulations, with several layers:
//
// "State": The lowest level. Encodes the state of the system being simulated. This contains
// - dynamically-evolving quantities such as positions, velocities, etc. as an array of numbers.
// - time value
// - a method ("dot") to calculate the time-derivative of said quantities
// - a method to add boundary conditions afterward
// - parameters such as gravity, material properties, etc. as attributes which can be set interactively
// A key method is the differential equation
//
// "Simulator": This is a thin layer which implements different finite-element ways of solving
// a differential equation (such as finite-difference and Runge-Kutta) and contains the
// user-settable elements of the State (such as gravity strength, energy, etc).
// (TO BE IMPLEMENTED IN FUTURE, CURRENTLY PART OF BOTH STATE AND SCENE)
//
// "InteractivePlayingScene": Contains logic for pausing/playing, drawing, and taking commands
// (from e.g. the user) which are queued up for execution. Extends "Scene".
// Note that execution of a user-command might involve setting values at the lower level.
//
// "Renderer": This is the portion which interacts with the canvas. Takes commands from the Scene.
// (TO BE IMPLEMENTED IN FUTURE, CURRENTLY PART OF SCENE)

// TODO Figure out how to use this new type which is an array of size state_size.
type StateVals<T, ALength extends number> = [T, ...T[]] & { length: ALength };

// *** STATE/SIMULATOR ***

// The basic state/simulator class. The state s(t) advances according to the differential equation
// s'(t) = dot(s(t), t)
class Simulator {
  vals: Array<number>; // Array of values storing the state
  state_size: number; // Size of the array of values storing the state
  time: number; // Timestamp in the worldline of the simulator
  dt: number; // Length of time in each simulation step
  constructor(state_size: number, dt: number) {
    this.state_size = state_size;
    this.vals = new Array(this.state_size).fill(0);
    this.time = 0;
    this.dt = dt;
  }
  // Getter and setter for state.
  get_values(): Array<number> {
    return this.vals;
  }
  set_values(vals: Array<number>) {
    this.vals = vals;
  }
  // Time-derivative of a given state and time. Overwritten in subclasses.
  dot(vals: Array<number>, time: number): Array<number> {
    return new Array(this.state_size).fill(0);
  }
  // Subroutine for adding any time-evolution calculation
  // which does not adhere to the differential equation. Used in step().
  add_boundary_conditions(s: Array<number>, t: number): void {}
  // Advances the simulation using the differential equation with
  // s(t + dt) = s(t) + dt * s'(t)
  step_finite_diff() {
    let newS = new Array(this.state_size).fill(0);
    let dS = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS[i] as number);
    }
    this.add_boundary_conditions(newS, this.time);
    this.set_values(newS);
  }
  // Advances the simulation using the differential equation with the Runge-Kutta method.
  step_runge_kutta() {
    let newS = new Array(this.state_size).fill(0);

    let dS_1 = this.dot(this.vals, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (this.dt / 2) * (dS_1[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_2 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + (this.dt / 2) * (dS_2[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_3 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] = (this.vals[i] as number) + this.dt * (dS_3[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);

    let dS_4 = this.dot(newS, this.time);
    for (let i = 0; i < this.state_size; i++) {
      newS[i] =
        (this.vals[i] as number) +
        (this.dt / 6) * (dS_1[i] as number) +
        (this.dt / 3) * (dS_2[i] as number) +
        (this.dt / 3) * (dS_3[i] as number) +
        (this.dt / 6) * (dS_4[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
    this.set_values(newS);
    this.time += this.dt;
  }
  step() {
    return this.step_runge_kutta();
  }
}

// Example: Wave equation simulation in two dimensions.
// Ref: https://arxiv.org/pdf/1001.0319, equation (2.14).
// A scalar field in (2+1)-D, u(x, y, t), evolving according to the wave equation formulated as
// du/dt   = v
// dv/dt   = (c**2) * (Lu) - (\sigma_x + \sigma_y) * v - \sigma_x * \sigma_y * u + (dp_x/dx + dp_y / dy)
// dp_x/dt = -\sigma_x * p_x + (c**2) * (\sigma_y - \sigma_x) * du/dx
// dp_y/dt = -\sigma_y * p_y + (c**2) * (\sigma_x - \sigma_y) * du/dy
//
// where p = (p_x, p_y) is an auxiliary field introduced to handle PML at the boundaries.
// When the functions \sigma_x and \sigma_y are both 0, we retrieve the undamped wave equation.
class WaveSimTwoDim extends Simulator {
  width: number;
  height: number;
  pml_strength: number; // PML strength scales as this value times a quadratic
  pml_width: number; // Thickness of PML layer on one side, divided by half of the region width
  wave_propagation_speed: number; // Speed of wave propagation
  constructor(width: number, height: number, dt: number) {
    super(4 * width * height, dt);
    this.width = width;
    this.height = height;

    // TODO Add setters for the attributes below
    this.pml_strength = 5.0;
    this.pml_width = 0.2;
    this.wave_propagation_speed = 30.0;
  }
  // Sets the initial conditions of the simulation
  set_init_conditions(x0: Array<number>, v0: Array<number>): void {
    for (let i = 0; i < this.size(); i++) {
      this.vals[i] = x0[i] as number;
      this.vals[i + this.size()] = v0[i] as number;
      this.vals[i + 2 * this.size()] = 0;
      this.vals[i + 3 * this.size()] = 0;
    }
    this.time = 0;
    this.add_boundary_conditions(this.vals, this.time);
  }
  // *** HELPER FUNCTIONS ***
  // Size of the 2D grid
  size(): number {
    return this.width * this.height;
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Named portions of the state values
  get_uValues(): Array<number> {
    return this._get_uValues(this.vals);
  }
  _get_uValues(vals: Array<number>): Array<number> {
    return vals.slice(0, this.size());
  }
  _get_vValues(vals: Array<number>): Array<number> {
    return vals.slice(this.size(), 2 * this.size());
  }
  _get_pxValues(vals: Array<number>): Array<number> {
    return vals.slice(2 * this.size(), 3 * this.size());
  }
  _get_pyValues(vals: Array<number>): Array<number> {
    return vals.slice(3 * this.size(), 4 * this.size());
  }
  // *** ARRAY FUNCTIONS USED IN SIMULATION, NOT TO BE CHANGED ***
  // PML damping functions
  sigma_x(arr_x: number): number {
    return this._sigma(arr_x, this.width);
  }
  sigma_y(arr_y: number): number {
    return this._sigma(arr_y, this.height);
  }
  _sigma(arr_val: number, arr_size: number): number {
    let l = Math.abs(arr_val / (arr_size / 2) - 1);
    if (l > 1 - this.pml_width) {
      return this.pml_strength * l ** 2;
    } else {
      return 0;
    }
  }
  // *** TODO Move these into the "reflector" class
  // One-sided derivative (f(x + a) - f(x)) / a
  d_x_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (x == this.width - 1) {
      return -(arr[this.index(x, y)] as number) / a_plus;
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x, y)] as number)) /
        a_plus
      );
    }
  }
  // One-sided derivative (f(x) - f(x - a)) / a
  d_x_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (x == 0) {
      return (arr[this.index(x, y)] as number) / a_minus;
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        a_minus
      );
    }
  }
  // One-sided derivative (f(y + a) - f(y)) / a
  d_y_plus(arr: Array<number>, x: number, y: number, a_plus: number): number {
    if (y == this.height - 1) {
      return -(arr[this.index(x, y)] as number) / a_plus;
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y)] as number)) /
        a_plus
      );
    }
  }
  // One-sided derivative (f(y) - f(y - a)) / a
  d_y_minus(arr: Array<number>, x: number, y: number, a_minus: number): number {
    if (y == 0) {
      return (arr[this.index(x, y)] as number) / a_minus;
    } else {
      return (
        ((arr[this.index(x, y)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        a_minus
      );
    }
  }
  // ***
  // d/dx.
  d_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        (2 * (arr[this.index(2, y)] as number) -
          2 * (arr[this.index(0, y)] as number) -
          (arr[this.index(3, y)] as number) +
          (arr[this.index(1, y)] as number)) /
        2
      );
    } else if (x == this.width - 1) {
      return (
        (2 * (arr[this.index(this.width - 1, y)] as number) -
          2 * (arr[this.index(this.width - 3, y)] as number) -
          (arr[this.index(this.width - 2, y)] as number) +
          (arr[this.index(this.width - 4, y)] as number)) /
        2
      );
    } else {
      return (
        ((arr[this.index(x + 1, y)] as number) -
          (arr[this.index(x - 1, y)] as number)) /
        2
      );
    }
  }
  // d/dy.
  d_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        (2 * (arr[this.index(x, 2)] as number) -
          2 * (arr[this.index(x, 0)] as number) -
          (arr[this.index(x, 3)] as number) +
          (arr[this.index(x, 1)] as number)) /
        2
      );
    } else if (y == this.height - 1) {
      return (
        (2 * (arr[this.index(x, this.height - 1)] as number) -
          2 * (arr[this.index(x, this.height - 3)] as number) -
          (arr[this.index(x, this.height - 2)] as number) +
          (arr[this.index(x, this.height - 4)] as number)) /
        2
      );
    } else {
      return (
        ((arr[this.index(x, y + 1)] as number) -
          (arr[this.index(x, y - 1)] as number)) /
        2
      );
    }
  }
  // (d/dx)^2.
  l_x_entry(arr: Array<number>, x: number, y: number): number {
    if (x == 0) {
      return (
        2 * (arr[this.index(0, y)] as number) -
        5 * (arr[this.index(1, y)] as number) +
        4 * (arr[this.index(2, y)] as number) -
        (arr[this.index(3, y)] as number)
      );
    } else if (x == this.width - 1) {
      return (
        2 * (arr[this.index(this.width - 1, y)] as number) -
        5 * (arr[this.index(this.width - 2, y)] as number) +
        4 * (arr[this.index(this.width - 3, y)] as number) -
        (arr[this.index(this.width - 4, y)] as number)
      );
    } else {
      return (
        (arr[this.index(x + 1, y)] as number) -
        2 * (arr[this.index(x, y)] as number) +
        (arr[this.index(x - 1, y)] as number)
      );
    }
  }
  // (d/dy)^2.
  l_y_entry(arr: Array<number>, x: number, y: number): number {
    if (y == 0) {
      return (
        2 * (arr[this.index(x, 0)] as number) -
        5 * (arr[this.index(x, 1)] as number) +
        4 * (arr[this.index(x, 2)] as number) -
        (arr[this.index(x, 3)] as number)
      );
    } else if (y == this.height - 1) {
      return (
        2 * (arr[this.index(x, this.height - 1)] as number) -
        5 * (arr[this.index(x, this.height - 2)] as number) +
        4 * (arr[this.index(x, this.height - 3)] as number) -
        (arr[this.index(x, this.height - 4)] as number)
      );
    } else {
      return (
        (arr[this.index(x, y + 1)] as number) -
        2 * (arr[this.index(x, y)] as number) +
        (arr[this.index(x, y - 1)] as number)
      );
    }
  }
  // (d/dx)^2 + (d/dy)^2
  laplacian_entry(vals: Array<number>, x: number, y: number): number {
    return this.l_x_entry(vals, x, y) + this.l_y_entry(vals, x, y);
  }
  // Constructs the time-derivative of the entire state array.
  dot(vals: Array<number>, time: number): Array<number> {
    let dS = new Array(this.state_size);
    let ind, sx, sy;
    let u = this._get_uValues(vals);
    let px = this._get_pxValues(vals);
    let py = this._get_pyValues(vals);

    // u dot
    for (let ind = 0; ind < this.size(); ind++) {
      dS[ind] = vals[ind + this.size()] as number;
    }

    // v dot
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        dS[ind + this.size()] =
          this.wave_propagation_speed ** 2 * this.laplacian_entry(u, x, y) +
          this.d_x_entry(px, x, y) +
          this.d_y_entry(py, x, y) -
          (this.sigma_x(x) + this.sigma_y(y)) *
            (vals[ind + this.size()] as number) -
          this.sigma_x(x) * this.sigma_y(y) * (vals[ind] as number);
      }
    }

    // px dot
    for (let x = 0; x < this.width; x++) {
      sx = this.sigma_x(x);
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        dS[ind + 2 * this.size()] =
          -sx * (px[ind] as number) +
          this.wave_propagation_speed ** 2 *
            (this.sigma_y(y) - sx) *
            this.d_x_entry(u, x, y);
      }
    }

    // py dot
    for (let y = 0; y < this.height; y++) {
      sy = this.sigma_y(y);
      for (let x = 0; x < this.width; x++) {
        ind = this.index(x, y);
        dS[ind + 3 * this.size()] =
          -sy * (py[ind] as number) +
          this.wave_propagation_speed ** 2 *
            (this.sigma_x(x) - sy) *
            this.d_y_entry(u, x, y);
      }
    }

    return dS;
  }
}

// TODO Do reflector case
// TODO Do elliptic and parabolic reflector cases

// *** INTERACTIVE ANIMATION ***
// Base class which controls interactive simulations
class InteractivePlayingScene extends Scene {
  simulator: Simulator; // The internal simulator
  action_queue: Array<CallableFunction>;
  paused: boolean;
  end_time: number | undefined; // Store a known end-time in case the simulation is paused and unpaused
  constructor(canvas: HTMLCanvasElement, simulator: Simulator) {
    super(canvas);
    this.simulator = simulator;
    this.action_queue = [];
    this.paused = true;
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
  add_to_queue(callback: () => void) {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Starts animation
  play(until: number | undefined) {
    // If paused, record the end time and stop the loop
    if (this.paused) {
      this.end_time = until;
      return;
    }
    // Otherwise, loop
    else {
      // If there are outstanding actions, perform them first
      if (this.action_queue.length > 0) {
        let callback = this.action_queue.shift() as () => void;
        callback();
      }
      // If we have reached the end-time, stop.
      else if (this.simulator.time > (until as number)) {
        return;
      } else {
        this.simulator.step();
        this.draw();
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
  // Updates a mobject to account for the new simulator state
  update_mobjects() {}
  // Draws the scene by passing to the renderer.
  //
  draw() {
    // TODO Move canvas manipulation into the renderer.
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update_mobjects();
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      // TODO Move mobject-drawing into the renderer?
      this.draw_mobject(mobj);
    });
  }
  // Add drawing instructions in the subclass.
  draw_mobject(mobj: MObject) {}
}

// Heatmap version of a 2D wave equation scene
class WaveSimTwoDimHeatMap extends InteractivePlayingScene {
  simulator: WaveSimTwoDim;
  imageData: ImageData; // Target for heatmap data
  constructor(
    canvas: HTMLCanvasElement,
    simulator: WaveSimTwoDim,
    imageData: ImageData,
  ) {
    super(canvas, simulator);
    this.simulator = simulator;
    this.add(
      "heatmap",
      new HeatMap(
        simulator.width,
        simulator.height,
        -1,
        1,
        this.simulator.get_uValues(),
      ),
    );
    // TODO Move this part to renderer.
    this.imageData = imageData;
  }
  update_mobjects() {
    let mobj = this.get_mobj("heatmap") as HeatMap;
    mobj.set_vals(this.simulator.get_uValues());
  }
  draw_mobject(mobj: MObject) {
    if (mobj instanceof HeatMap) {
      mobj.draw(this.canvas, this, this.imageData);
    } else {
      mobj.draw(this.canvas, this);
    }
  }
}

// Dots-and-springs version of a 2D wave equation scene
class WaveSimTwoDimDots extends InteractivePlayingScene {
  simulator: WaveSimTwoDim;
  constructor(
    canvas: HTMLCanvasElement,
    simulator: WaveSimTwoDim,
    imageData: ImageData,
  ) {
    super(canvas, simulator);
    this.simulator = simulator;
    // TODO Add Mobjects. Dots and lines.
  }
  update_mobjects() {
    // TODO Update mobjects
  }
  draw_mobject(mobj: MObject) {
    mobj.draw(this.canvas, this);
  }
}

// *** RENDERER ***
class Renderer {
  canvas: HTMLCanvasElement;
  xlims: [number, number];
  ylims: [number, number];
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
  }
}
