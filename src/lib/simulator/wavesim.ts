import {
  MObject,
  clamp,
  Dot,
  Line,
  LineSpring,
  Arrow,
  DraggableDot,
  Vec2D,
  vec2_norm,
  vec2_sum,
  vec2_sub,
  vec2_scale,
  vec2_rot,
  vec2_normalize,
  vec2_angle,
  vec2_sum_list,
  rb_colormap_2,
  colorval_to_rgba,
} from "../base";
import { BezierSpline } from "../base/bezier.js";
import { HeatMap } from "../base/heatmap";
import { SceneFromSimulator } from "../simulator/sim";
import { StateSimulator, TwoDimDrawable, TwoDimState } from "./statesim.js";
import { Dot3D, Line3D, DraggableDot3D } from "../three_d/mobjects.js";
import { InteractivePlayingThreeDScene } from "./sim.js";
import { Vec3D } from "../three_d/matvec.js";

// A one-dimensional point source.
export class PointSourceOneDim {
  x: number; // X-coordinate
  w: number; // Frequency
  a: number; // Amplitude
  p: number; // Phase
  turn_on_time: number; // Time at which the source turns on
  constructor(x: number, w: number, a: number, p: number) {
    this.x = x;
    this.w = w;
    this.a = a;
    this.p = p;
    this.turn_on_time = 0.0;
  }
  set_x(x: number) {
    this.x = x;
  }
  set_w(w: number) {
    this.w = w;
  }
  set_a(a: number) {
    this.a = a;
  }
  set_p(p: number) {
    this.p = p;
  }
  set_turn_on_time(time: number) {
    this.turn_on_time = time;
  }
}

// A two-dimensional point source.
export class PointSource {
  x: number; // X-coordinate
  y: number; // Y-coordinate
  w: number; // Frequency
  a: number; // Amplitude
  p: number; // Phase
  turn_on_time: number; // Time at which the source turns on
  constructor(x: number, y: number, w: number, a: number, p: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.a = a;
    this.p = p;
    this.turn_on_time = 0.0;
  }
  set_x(x: number) {
    this.x = x;
  }
  set_y(y: number) {
    this.y = y;
  }
  set_w(w: number) {
    this.w = w;
  }
  set_a(a: number) {
    this.a = a;
  }
  set_p(p: number) {
    this.p = p;
  }
  set_turn_on_time(time: number) {
    this.turn_on_time = time;
  }
}

// *** One dimensional ***
// Wave equation simulation for a function R -> R, bounded at ends.
export class WaveSimOneDim extends StateSimulator {
  width: number;
  // Perfectly-matched layers in 1D are implemented as increasing friction coefficients at the boundaries.
  pml_layers: Record<number, [number, number]> = {}; //
  wave_propagation_speed: number = 20.0; // Speed of wave propagation
  damping: number = 0.0; // Damping coefficient
  left_endpoint: number = 0.0; // Left boundary condition
  right_endpoint: number = 0.0; // Left boundary condition
  point_sources: Record<number, PointSourceOneDim> = {};
  constructor(width: number, dt: number) {
    // Store position and velocity at each point.
    super(2 * width, dt);
    this.width = width;
  }
  remove_pml_layers() {
    this.pml_layers = { 0: [0, 0], 1: [0, 0] };
  }
  set_pml_layer(positive: boolean, pml_width: number, pml_strength: number) {
    let ind;
    if (positive) {
      ind = 0;
    } else {
      ind = 1;
    }
    this.pml_layers[ind] = [pml_width, pml_strength];
  }
  // Damping contribution from PML layers
  sigma_x(arr_x: number): number {
    let ind, pml_thickness, pml_strength;
    // Find the right PML layer
    if (arr_x - this.width / 2 >= 0) {
      ind = 0;
    } else {
      ind = 1;
    }
    // Calculate the damping factor
    if (this.pml_layers.hasOwnProperty(ind)) {
      [pml_thickness, pml_strength] = this.pml_layers[ind] as [number, number];
      let relative_distance_from_center = Math.abs(
        -1 + arr_x / (this.width / 2),
      );
      return (
        pml_strength *
        Math.max(0, relative_distance_from_center + pml_thickness - 1) ** 2
      );
    } else {
      return 0;
    }
  }
  // Damping contribution globally
  set_damping(damping: number) {
    this.damping = damping;
  }
  damping_at(arr_x: number): number {
    return this.damping + this.sigma_x(arr_x);
  }
  set_wave_propagation_speed(speed: number) {
    this.wave_propagation_speed = speed;
  }
  add_point_source(source: PointSourceOneDim) {
    let ind = Object.keys(this.point_sources).length;
    this.point_sources[ind] = source;
  }
  remove_point_source(id: number) {
    delete this.point_sources[id];
  }
  set_left_endpoint(endpoint: number) {
    this.left_endpoint = endpoint;
  }
  set_right_endpoint(endpoint: number) {
    this.right_endpoint = endpoint;
  }
  get_uValues(): Array<number> {
    return this._get_uValues(this.vals);
  }
  set_uValues(vals: Array<number>) {
    for (let i = 0; i < this.width; i++) {
      this.vals[i] = vals[i] as number;
    }
  }
  _get_uValues(vals: Array<number>): Array<number> {
    return vals.slice(0, this.width);
  }
  set_vValues(vals: Array<number>) {
    for (let i = 0; i < this.width; i++) {
      this.vals[i + this.width] = vals[i] as number;
    }
  }
  _get_vValues(vals: Array<number>): Array<number> {
    return vals.slice(this.width, 2 * this.width);
  }
  laplacian_entry(vals: Array<number>, x: number): number {
    if (x == 0) {
      return 2 * this.laplacian_entry(vals, 1) - this.laplacian_entry(vals, 2);
    } else if (x == this.width - 1) {
      return (
        2 * this.laplacian_entry(vals, this.width - 2) -
        this.laplacian_entry(vals, this.width - 3)
      );
    } else {
      return (
        (vals[x - 1] as number) -
        2 * (vals[x] as number) +
        (vals[x + 1] as number)
      );
    }
  }
  // Constructs the time-derivative of the entire state array. Here is where
  // the wave equation is used.
  dot(vals: Array<number>, time: number): Array<number> {
    let u = this._get_uValues(vals);

    // u dot
    let dS = vals.slice(this.width, 2 * this.width);

    // v dot
    for (let x = 0; x < this.width; x++) {
      dS.push(
        this.wave_propagation_speed ** 2 * this.laplacian_entry(u, x) -
          this.damping_at(x) * (vals[x + this.width] as number),
      );
    }

    return dS;
  }
  set_boundary_conditions(vals: Array<number>) {
    // Clamp to zero at the endpoints.
    vals[0] = this.left_endpoint;
    vals[this.width - 1] = this.right_endpoint;
    vals[this.width] = 0;
    vals[2 * this.width - 1] = 0;
    Object.entries(this.point_sources).forEach(([key, elem]) => {
      if (this.time >= elem.turn_on_time) {
        vals[elem.x] = elem.a * Math.sin(elem.w * (this.time - elem.p));
        vals[elem.x + this.width] =
          elem.a * elem.w * Math.cos(elem.w * (this.time - elem.p));
      }
    });
  }
}

// Drawer for the wave equation simulation, where displacement is orthogonal
// to the line of dots.
export class WaveSimOneDimScene extends SceneFromSimulator {
  mode: "curve" | "dots" = "dots";
  arrow_length_scale: number = 1.5;
  include_arrows: boolean = true;
  width: number;
  constructor(canvas: HTMLCanvasElement, width: number) {
    super(canvas);
    this.width = width;

    let pos: Vec2D, next_pos: Vec2D;

    // Add a line representing the equilibrium position
    let eq_line = new Line(this.eq_position(1), this.eq_position(width))
      .set_stroke_width(0.05)
      .set_stroke_style("dashed")
      .set_stroke_color("gray");
    this.add("eq_line", eq_line);

    // Add boundary lines
    let [ymin, ymax] = this.ylims;
    pos = this.eq_position(1);
    let b0 = new Line([pos[0], ymin / 2], [pos[0], ymax / 2]);
    b0.set_stroke_width(0.1);
    this.add("b0", b0);

    pos = this.eq_position(width);
    let b1 = new Line([pos[0], ymin / 2], [pos[0], ymax / 2]);
    b1.set_stroke_width(0.1);
    this.add("b1", b1);

    // Add lines/springs which connect dots
    let eq_length;
    for (let i = 1; i < width; i++) {
      pos = this.eq_position(i);
      next_pos = this.eq_position(i + 1);
      let line = new LineSpring(pos, next_pos).set_stroke_width(
        0.2 / Math.sqrt(width),
      );
      eq_length = vec2_norm(vec2_sub(pos, next_pos));
      line.set_eq_length(eq_length);
      this.add(`l_${i}`, line);
    }

    // Add force arrows
    for (let i = 1; i < width - 1; i++) {
      pos = this.eq_position(i + 1);
      let arrow = new Arrow(
        [pos[0], pos[1]],
        [pos[0], pos[1]],
      ).set_stroke_width(0.05);
      arrow.set_stroke_color("red");
      arrow.set_arrow_size(0.0);
      this.add(`arr${i + 1}`, arrow);
    }

    // Add dots which track with uValues in simulator
    for (let i = 0; i < width; i++) {
      pos = this.eq_position(i + 1);
      let mass = new DraggableDot(pos, 0.5 / Math.sqrt(width));
      mass.draggable_x = false;
      mass.draggable_y = true;
      // TODO Add these in the _scene file.
      if (i == 0) {
        mass.add_callback(() => {
          (this.get_mobj("eq_line") as Line).move_start([
            this.eq_position(1)[0],
            mass.get_center()[1],
          ]);
        });
      }
      if (i == width - 1) {
        mass.add_callback(() => {
          (this.get_mobj("eq_line") as Line).move_end([
            this.eq_position(width)[0],
            mass.get_center()[1],
          ]);
        });
      }
      this.add(`p_${i + 1}`, mass);
    }

    // Add a Bezier curve which tracks with uValues in simulator
    let curve = new BezierSpline(width - 1).set_stroke_width(0.02);
    this.add("curve", curve);
  }
  set_mode(mode: "curve" | "dots") {
    this.mode = mode;
  }
  set_arrow_length_scale(scale: number) {
    this.arrow_length_scale = scale;
  }
  set_dot_radius(radius: number) {
    for (let i = 0; i < this.width; i++) {
      let mass = this.get_mobj(`p_${i + 1}`) as Dot;
      mass.set_radius(radius);
    }
  }
  set_frame_lims(xlims: [number, number], ylims: [number, number]): void {
    super.set_frame_lims(xlims, ylims);
    // Reset positions of objects
    let mobj, pos, next_pos;
    let [ymin, ymax] = this.ylims;

    pos = this.eq_position(1);
    mobj = this.get_mobj("b0") as Line;
    mobj.move_start([pos[0], ymin / 2]);
    mobj.move_end([pos[0], ymax / 2]);

    pos = this.eq_position(this.width);
    mobj = this.get_mobj("b1") as Line;
    mobj.move_start([pos[0], ymin / 2]);
    mobj.move_end([pos[0], ymax / 2]);

    mobj = this.get_mobj("eq_line") as Line;
    mobj.move_start(this.eq_position(1));
    mobj.move_end(this.eq_position(this.width));

    // Reset equilibrium lengths of lines
    let eq_length;
    for (let i = 1; i < this.width; i++) {
      pos = this.eq_position(i);
      next_pos = this.eq_position(i + 1);
      let line = this.get_mobj(`l_${i}`) as LineSpring;
      eq_length = vec2_norm(vec2_sub(pos, next_pos));
      line.set_eq_length(eq_length);
    }
  }
  // Returns the equilibrium position in the scene of the i-th dot.
  eq_position(i: number): Vec2D {
    return [
      this.xlims[0] +
        ((i - 0.5) * (this.xlims[1] - this.xlims[0])) / this.width,
      0,
    ];
  }
  // Turns draggability on/off
  toggle_pause(): void {
    for (let i = 0; i < this.width; i++) {
      let dot = this.get_mobj(`p_${i + 1}`) as DraggableDot;
      dot.draggable_y = true;
    }
  }
  toggle_unpause(): void {
    for (let i = 0; i < this.width; i++) {
      let dot = this.get_mobj(`p_${i + 1}`) as DraggableDot;
      dot.draggable_y = false;
    }
  }
  // Moves the dots and curve in the scene to the positions dictated by the wave simulation.
  update_mobjects_from_simulator(sim: WaveSimOneDim) {
    let pos: Vec2D, next_pos: Vec2D;
    let disp: number, next_disp: number;
    let u = sim.get_uValues();
    let deriv = sim._get_vValues(sim.dot(sim.vals, sim.time));

    // Update the relevant mobjects
    if (this.mode == "dots") {
      let dot, line, arrow;
      for (let i = 0; i < this.width; i++) {
        pos = this.eq_position(i + 1);
        disp = u[i] as number;

        // Update dots
        dot = this.get_mobj(`p_${i + 1}`) as Dot;
        dot.move_to([pos[0], pos[1] + disp]);

        // Update arrows
        if (i != 0 && i != this.width - 1 && this.include_arrows) {
          arrow = this.get_mobj(`arr${i + 1}`) as Arrow;
          arrow.move_start([pos[0], pos[1] + disp]);
          arrow.move_end([
            pos[0],
            pos[1] +
              disp +
              (this.arrow_length_scale * (deriv[i] as number)) / 5,
          ]);
          arrow.set_arrow_size(
            Math.sqrt(this.arrow_length_scale * Math.abs(deriv[i] as number)) /
              10,
          );
        }
        // Update connecting lines
        if (i < this.width - 1) {
          next_pos = this.eq_position(i + 2);
          next_disp = u[i + 1] as number;
          line = this.get_mobj(`l_${i + 1}`) as LineSpring;
          line.move_start([pos[0], pos[1] + disp]);
          line.move_end([next_pos[0], next_pos[1] + next_disp]);
        }
      }
    } else if (this.mode == "curve") {
      let anchors: Vec2D[] = [];
      for (let i = 0; i < this.width; i++) {
        pos = this.eq_position(i + 1);
        disp = u[i] as number;
        anchors.push([pos[0], pos[1] + disp]);
      }
      // Update curve
      let curve = this.get_mobj("curve") as BezierSpline;
      curve.set_anchors(anchors);
    }
  }
  _draw() {
    // Draw the mobjects
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == undefined) throw new Error(`${name} not found`);
      this.draw_mobject(mobj);
    });
  }
  // Draw based on mode
  draw_mobject(mobj: MObject) {
    if (mobj instanceof BezierSpline) {
      if (this.mode == "curve") {
        mobj.draw(this.canvas, this);
      }
    } else if (mobj instanceof Dot) {
      if (this.mode == "dots") {
        mobj.draw(this.canvas, this);
      }
    } else if (mobj instanceof LineSpring) {
      if (this.mode == "dots") {
        mobj.draw(this.canvas, this);
      }
    } else if (mobj instanceof Arrow) {
      if (this.include_arrows && this.mode == "dots") {
        mobj.draw(this.canvas, this);
      }
    } else {
      mobj.draw(this.canvas, this);
    }
  }
}

// *** Two dimensional ***

// Wave equation simulation for a function R^2 -> R
// Ref: https://arxiv.org/pdf/1001.0319, equation (2.14).
// A scalar field in (2+1)-D, u(x, y, t), evolving according to the wave equation formulated as
// du/dt   = v
// dv/dt   = (c**2) * (Lu) - (\sigma_x + \sigma_y) * v - \sigma_x * \sigma_y * u + (dp_x/dx + dp_y / dy)
// dp_x/dt = -\sigma_x * p_x + (c**2) * (\sigma_y - \sigma_x) * du/dx
// dp_y/dt = -\sigma_y * p_y + (c**2) * (\sigma_x - \sigma_y) * du/dy
//
// where p = (p_x, p_y) is an auxiliary field introduced to handle PML at the boundaries.
// When the functions \sigma_x and \sigma_y are both 0, we retrieve the undamped wave equation.
// TODO Add friction terms to DE
// TODO Add the capability to set the wave propagation constant
// differently in different regions.
export class WaveSimTwoDim extends StateSimulator implements TwoDimDrawable {
  width: number;
  height: number;
  pml_layers: Record<number, [number, number]> = {};
  wave_propagation_speed: number = 10.0; // Speed of wave propagation
  _two_dim_state: TwoDimState;
  point_sources: Record<number, PointSource> = {};
  clamp_value: number = Infinity;
  constructor(width: number, height: number, dt: number) {
    super(4 * width * height, dt);
    this.width = width;
    this.height = height;
    this._two_dim_state = new TwoDimState(width, height);
    // Default PML settings.
    this.set_pml_layer(true, true, 0.2, 200.0);
    this.set_pml_layer(true, false, 0.2, 200.0);
    this.set_pml_layer(false, true, 0.2, 200.0);
    this.set_pml_layer(false, false, 0.2, 200.0);
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
    this.set_boundary_conditions(this.vals, this.time);
  }
  add_point_source(source: PointSource) {
    let ind = Object.keys(this.point_sources).length;
    this.point_sources[ind] = source;
  }
  modify_point_source_x(index: number, x: number) {
    if (this.point_sources[index]) {
      this.point_sources[index].x = x;
    }
  }
  modify_point_source_y(index: number, y: number) {
    if (this.point_sources[index]) {
      this.point_sources[index].y = y;
    }
  }
  modify_point_source_amplitude(index: number, amplitude: number) {
    if (this.point_sources[index]) {
      this.point_sources[index].a = amplitude;
    }
  }
  modify_point_source_frequency(index: number, frequency: number) {
    if (this.point_sources[index]) {
      this.point_sources[index].w = frequency;
    }
  }
  modify_point_source_phase(index: number, phase: number) {
    if (this.point_sources[index]) {
      this.point_sources[index].p = phase;
    }
  }
  remove_point_source(id: number) {
    delete this.point_sources[id];
  }
  // *** HELPER FUNCTIONS ***
  // Size of the 2D grid
  size(): number {
    return this.width * this.height;
  }
  index(x: number, y: number): number {
    return this._two_dim_state.index(x, y);
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
  // PML-related TODO Split these off into their own config object?
  // Adds a perfectly matched layer to the specified border of the domain. The magnitude of damping
  // grows as max(0, C(L - x))^2, where C is the pml_strength parameter, L is the pml_width parameter,
  // and x represents the ratio distance(point, border) / distance(center, border). That is, x = 1
  // at the center of the grid, and x = 0 at the border of the grid.
  remove_pml_layers() {
    this.pml_layers = { 0: [0, 0], 1: [0, 0], 2: [0, 0], 3: [0, 0] };
  }
  set_pml_layer(
    x_direction: boolean,
    positive: boolean,
    pml_width: number,
    pml_strength: number,
  ) {
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
  sigma_x(arr_x: number): number {
    let ind, pml_thickness, pml_strength;
    // Find the right PML layer
    if (arr_x - this.width / 2 >= 0) {
      ind = 0;
    } else {
      ind = 1;
    }
    // Calculate the damping factor
    if (this.pml_layers.hasOwnProperty(ind)) {
      [pml_thickness, pml_strength] = this.pml_layers[ind] as [number, number];
      let relative_distance_from_center = Math.abs(
        -1 + arr_x / (this.width / 2),
      );
      return (
        pml_strength *
        Math.max(0, relative_distance_from_center + pml_thickness - 1) ** 2
      );
    } else {
      return 0;
    }
  }
  sigma_y(arr_y: number): number {
    let ind, pml_thickness, pml_strength;
    // Find the right PML layer
    if (arr_y - this.height / 2 >= 0) {
      ind = 2;
    } else {
      ind = 3;
    }
    // Calculate the damping factor
    if (this.pml_layers.hasOwnProperty(ind)) {
      [pml_thickness, pml_strength] = this.pml_layers[ind] as [number, number];
      let relative_distance_from_center = Math.abs(
        -1 + arr_y / (this.height / 2),
      );
      return (
        pml_strength *
        Math.max(0, relative_distance_from_center + pml_thickness - 1) ** 2
      );
    } else {
      return 0;
    }
  }
  // NOTE: All methods below apply to any function f: R^2 -> R. Put them into their own class,
  // which has width and height attributes, and a "index" function. Maybe part of the same
  // interface for TwoDimDrawable? Or TwoDimState?
  d_x_plus(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.d_x_plus(arr, x, y);
  }
  d_x_minus(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.d_x_minus(arr, x, y);
  }
  d_y_plus(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.d_y_plus(arr, x, y);
  }
  d_y_minus(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.d_y_minus(arr, x, y);
  }
  d_x_entry(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.d_x_entry(arr, x, y);
  }
  d_y_entry(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.d_y_entry(arr, x, y);
  }
  l_x_entry(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.l_x_entry(arr, x, y);
  }
  l_y_entry(arr: Array<number>, x: number, y: number): number {
    return this._two_dim_state.l_y_entry(arr, x, y);
  }
  // (d/dx)^2 + (d/dy)^2
  laplacian_entry(vals: Array<number>, x: number, y: number): number {
    return this.l_x_entry(vals, x, y) + this.l_y_entry(vals, x, y);
  }
  wps(x: number, y: number): number {
    return this.wave_propagation_speed;
  }
  // Constructs the time-derivative of the entire state array. Here is where
  // the wave equation is used.
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
          this.wps(x, y) ** 2 * this.laplacian_entry(u, x, y) +
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
          this.wps(x, y) ** 2 *
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
          this.wps(x, y) ** 2 *
            (this.sigma_x(x) - sy) *
            this.d_y_entry(u, x, y);
      }
    }

    return dS;
  }
  // Add point sources
  set_boundary_conditions(s: Array<number>, t: number): void {
    let ind;
    Object.entries(this.point_sources).forEach(([key, elem]) => {
      if (t >= elem.turn_on_time) {
        ind = this.index(elem.x, elem.y);
        s[ind] = elem.a * Math.sin(elem.w * (t - elem.p));
        s[ind + this.size()] =
          elem.a * elem.w * Math.cos(elem.w * (t - elem.p));
      }
    });
    // Clamp for numerical stability
    for (let ind = 0; ind < this.state_size; ind++) {
      this.vals[ind] = clamp(
        this.vals[ind] as number,
        -this.clamp_value,
        this.clamp_value,
      );
    }
  }
}

// A simulation of the wave equation whose domain is a subset of the grid points, circumscribed by
// a "reflective surface" which is described as the zero-set of an equation f(x, y).
// TODO No reason not to use Mixins here to inherit point sources and reflectors independently.
interface Reflector {
  x_pos_mask: Array<number>;
  x_neg_mask: Array<number>;
  y_pos_mask: Array<number>;
  y_neg_mask: Array<number>;
  inside_region(x: number, y: number): boolean;
  _recalculate_masks(): void;
  _calc_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
  _calc_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
  get_bdy_dists_x(x_arr: number, y_arr: number): Vec2D;
  get_bdy_dists_y(x_arr: number, y_arr: number): Vec2D;
}

export class WaveSimTwoDimReflector extends WaveSimTwoDim implements Reflector {
  // For each point p in the domain, and each possible direction N, S, E, W,
  // if the adjacent grid point to p in the chosen direction lies outside
  // of the domain, then we note down the distance to the region boundary in that direction.
  // Otherwise, we note the number 1 (which is the maximum possible value).
  x_pos_mask: Array<number> = new Array(this.size()).fill(1);
  x_neg_mask: Array<number> = new Array(this.size()).fill(1);
  y_pos_mask: Array<number> = new Array(this.size()).fill(1);
  y_neg_mask: Array<number> = new Array(this.size()).fill(1);
  constructor(width: number, height: number, dt: number) {
    super(width, height, dt);
    this._recalculate_masks();
  }
  set_attr(name: string, val: any) {
    super.set_attr(name, val);
    this._recalculate_masks();
    this.zero_outside_region();
  }
  // *** Encodes geometry ***
  // Returns whether the point (x, y) in array coordinates is inside the domain.
  inside_region(x: number, y: number): boolean {
    return true;
  }
  // Helper functions which return the fraction of leeway right, left, up and down
  // from the given array lattice point to the boundary.
  _x_plus(x: number, y: number): number {
    return 1;
  }
  _x_minus(x: number, y: number): number {
    return 1;
  }
  _y_plus(x: number, y: number): number {
    return 1;
  }
  _y_minus(x: number, y: number): number {
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
          y_arr,
        );
        [this.y_pos_mask[ind], this.y_neg_mask[ind]] = this._calc_bdy_dists_y(
          x_arr,
          y_arr,
        );
      }
    }
  }
  // [0, 0] / [1, 1] means an exterior / interior point
  // A value between 0 and 1 in the first coordinate means moving to the right crosses the boundary
  // A value between 0 and 1 in the second coordinate means moving to the left crosses the boundary
  _calc_bdy_dists_x(x_arr: number, y_arr: number): Vec2D {
    if (!this.inside_region(x_arr, y_arr)) {
      // Exterior case
      return [0, 0];
    } else {
      let a_pos, a_neg;
      if (!this.inside_region(x_arr + 1, y_arr)) {
        // Near right boundary case, and x is positive
        a_pos = this._x_plus(x_arr, y_arr);
      } else {
        a_pos = 1;
      }
      if (!this.inside_region(x_arr - 1, y_arr)) {
        // Near left boundary case, and x is negative
        a_neg = this._x_minus(x_arr, y_arr);
      } else {
        a_neg = 1;
      }
      return [a_pos, a_neg];
    }
  }
  _calc_bdy_dists_y(x_arr: number, y_arr: number): Vec2D {
    if (!this.inside_region(x_arr, y_arr)) {
      // Exterior case
      return [0, 0];
    } else {
      let a_plus, a_minus;
      if (!this.inside_region(x_arr, y_arr + 1)) {
        // Near boundary case
        a_plus = this._y_plus(x_arr, y_arr);
      } else {
        a_plus = 1;
      }
      if (!this.inside_region(x_arr, y_arr - 1)) {
        // Near boundary case
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
  get_bdy_dists_x(x_arr: number, y_arr: number): Vec2D {
    return [
      this.x_pos_mask[this.index(x_arr, y_arr)] as number,
      this.x_neg_mask[this.index(x_arr, y_arr)] as number,
    ];
  }
  get_bdy_dists_y(x_arr: number, y_arr: number): Vec2D {
    return [
      this.y_pos_mask[this.index(x_arr, y_arr)] as number,
      this.y_neg_mask[this.index(x_arr, y_arr)] as number,
    ];
  }
  d_x_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_x(x, y);
    if (a_plus == 0 && a_minus == 0) {
      // If the point is in the exterior, return 0
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      // If the point is in the interior, calculate normally.
      return super.d_x_entry(arr, x, y);
    } else {
      return (
        ((a_minus * this._two_dim_state.d_x_plus(arr, x, y)) / a_plus +
          (a_plus * this._two_dim_state.d_x_minus(arr, x, y)) / a_minus) /
        (a_minus + a_plus)
      );
    }
  }
  d_y_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_y(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.d_y_entry(arr, x, y);
    } else {
      return (
        ((a_minus * this._two_dim_state.d_y_plus(arr, x, y)) / a_plus +
          (a_plus * this._two_dim_state.d_y_minus(arr, x, y)) / a_minus) /
        (a_minus + a_plus)
      );
    }
  }
  // Calculates an entry of (d/dx)(d/dx)(array)
  l_x_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_x(x, y);
    if (a_plus == 0 && a_minus == 0) {
      // If the point is in the exterior, return 0
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      // If the point is in the interior, calculate normally.
      return super.l_x_entry(arr, x, y);
    } else {
      return (
        (this._two_dim_state.d_x_plus(arr, x, y) / a_plus -
          this._two_dim_state.d_x_minus(arr, x, y) / a_minus) /
        ((a_minus + a_plus) / 2)
      );
    }
  }
  // Calculates an entry of (d/dy)(d/dy)(array)
  l_y_entry(arr: Array<number>, x: number, y: number): number {
    let [a_plus, a_minus] = this.get_bdy_dists_y(x, y);
    if (a_plus == 0 && a_minus == 0) {
      return 0;
    } else if (a_plus == 1 && a_minus == 1) {
      return super.l_y_entry(arr, x, y);
    } else {
      return (
        (this._two_dim_state.d_y_plus(arr, x, y) / a_plus -
          this._two_dim_state.d_y_minus(arr, x, y) / a_minus) /
        ((a_minus + a_plus) / 2)
      );
    }
  }
}

// TODO the equation of the ellipse needs to be known in canvas-coordinates here, and in
// scene-coordinates one level above (to define the ParametricFunction MObject).
// Find some way to derive both of these from a single source of truth.
export class WaveSimTwoDimEllipticReflector extends WaveSimTwoDimReflector {
  // TODO: Ensure PML layer doesn't interfere with the region.
  semimajor_axis: number = 80.0;
  semiminor_axis: number = 60.0;
  w: number = 5.0; // Frequency
  a: number = 5.0; // Amplitude
  foci: [Vec2D, Vec2D] = [
    [
      Math.floor(
        this.width / 2 +
          Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      ),
      Math.floor(this.height / 2),
    ],
    [
      Math.floor(
        this.width / 2 -
          Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      ),
      Math.floor(this.height / 2),
    ],
  ];
  constructor(width: number, height: number, dt: number) {
    super(width, height, dt);
    let [x, y] = this.foci[0];
    this.point_sources = [new PointSource(x, y, 5.0, 5.0, 0.0)];
  }
  _recalculate_foci() {
    let focus_1_x: number, focus_1_y: number;
    let focus_2_x: number, focus_2_y: number;
    if (this.semimajor_axis > this.semiminor_axis) {
      [focus_1_x, focus_1_y] = [
        Math.floor(
          this.width / 2 +
            Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
        ),
        Math.floor(this.height / 2),
      ];
      [focus_2_x, focus_2_y] = [
        Math.floor(
          this.width / 2 -
            Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
        ),
        Math.floor(this.height / 2),
      ];
    } else {
      [focus_1_x, focus_1_y] = [
        Math.floor(this.width / 2),
        Math.floor(
          this.height / 2 +
            Math.sqrt(this.semiminor_axis ** 2 - this.semimajor_axis ** 2),
        ),
      ];
      [focus_2_x, focus_2_y] = [
        Math.floor(this.width / 2),
        Math.floor(
          this.height / 2 -
            Math.sqrt(this.semiminor_axis ** 2 - this.semimajor_axis ** 2),
        ),
      ];
    }
    this.point_sources = {
      0: new PointSource(focus_1_x, focus_1_y, 5.0, 5.0, 0.0),
    };
    this.foci = [
      [focus_1_x, focus_1_y],
      [focus_2_x, focus_2_y],
    ];
  }
  set_attr(name: string, val: any) {
    let p = this.point_sources[0] as PointSource;
    if (name == "w") {
      p.set_w(val);
    } else if (name == "a") {
      p.set_a(val);
    } else {
      this._recalculate_foci();
    }
    super.set_attr(name, val);
  }
  inside_region(x_arr: number, y_arr: number): boolean {
    return (
      ((x_arr - this.width / 2) / this.semimajor_axis) ** 2 +
        ((y_arr - this.height / 2) / this.semiminor_axis) ** 2 <
      1
    );
  }
  _x_plus(x: number, y: number): number {
    return Math.abs(
      this.semimajor_axis *
        Math.sqrt(1 - ((y - this.height / 2) / this.semiminor_axis) ** 2) -
        x +
        this.width / 2,
    );
  }
  _x_minus(x: number, y: number): number {
    return Math.abs(
      this.semimajor_axis *
        Math.sqrt(1 - ((y - this.height / 2) / this.semiminor_axis) ** 2) +
        x -
        this.width / 2,
    );
  }
  _y_plus(x: number, y: number): number {
    return Math.abs(
      this.semiminor_axis *
        Math.sqrt(1 - ((x - this.width / 2) / this.semimajor_axis) ** 2) -
        y +
        this.height / 2,
    );
  }
  _y_minus(x: number, y: number): number {
    return Math.abs(
      this.semiminor_axis *
        Math.sqrt(1 - ((x - this.width / 2) / this.semimajor_axis) ** 2) +
        y -
        this.height / 2,
    );
  }
}

// TODO
export class WaveSimTwoDimParabolaReflector extends WaveSimTwoDimReflector {}

// TODO Do parabolic reflector case

// *** SCENES ***

// A two-dimensional scene view of the two-dimensional wave equation, where dots are colored
export class WaveSimTwoDimPointsHeatmapScene extends SceneFromSimulator {
  width: number;
  height: number;
  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    super(canvas);

    this.width = width;
    this.height = height;
    this.construct_scene();
  }
  // Populates the mobjects in the scene
  construct_scene() {
    // Construct horizontal lines
    for (let i = 0; i < this.width - 1; i++) {
      for (let j = 0; j < this.height; j++) {
        this.add(
          `l(${i},${j})(${i + 1},${j})`,
          new Line(this.eq_position(i, j), this.eq_position(i + 1, j))
            .set_stroke_width(0.05)
            .set_alpha(0.6),
        );
      }
    }
    // Construct vertical lines
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height - 1; j++) {
        this.add(
          `l(${i},${j})(${i},${j + 1})`,
          new Line(this.eq_position(i, j), this.eq_position(i, j + 1))
            .set_stroke_width(0.05)
            .set_alpha(0.6),
        );
      }
    }
    // Construct dots
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let dot = new Dot(this.eq_position(i, j), 0.15);
        this.add(`p(${i},${j})`, dot);
      }
    }
  }
  // Resets the mobjects in the scene.
  set_frame_lims(xlims: Vec2D, ylims: Vec2D) {
    super.set_frame_lims(xlims, ylims);
    this.clear();
    this.construct_scene();
  }
  eq_position(i: number, j: number): Vec2D {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;
    return [
      xmin + ((i + 0.5) * (xmax - xmin)) / this.width,
      ymin + ((j + 0.5) * (ymax - ymin)) / this.height,
    ];
  }
  update_mobjects_from_simulator(sim: WaveSimTwoDim) {
    let vals = sim.get_uValues();
    let new_z, new_color;
    let dot;
    let width_buffer = Math.floor((sim.width - this.width) / 2);
    let height_buffer = Math.floor((sim.height - this.height) / 2);
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        new_z = vals[sim.index(i + width_buffer, j + height_buffer)] as number;
        // Map to a color
        let new_color = colorval_to_rgba(rb_colormap_2(2 * new_z));
        dot = this.get_mobj(`p(${i},${j})`) as Dot3D;
        dot.set_color(new_color);
      }
    }
  }
}

// Heatmap version of a 2D input wave equation scene
// TODO Make this written for any Simulator satisfying HeatMapDrawable.
export class WaveSimTwoDimHeatMapScene extends SceneFromSimulator {
  imageData: ImageData; // Target for heatmap data
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
  ) {
    super(canvas);
    this.add(
      "heatmap",
      new HeatMap(width, height, -1, 1, new Array(width * height).fill(0)),
    );
    // TODO Move this part to renderer.
    this.imageData = imageData;
  }
  update_mobjects_from_simulator(simulator: WaveSimTwoDim) {
    let mobj = this.get_mobj("heatmap") as HeatMap;
    mobj.set_vals(simulator.get_uValues());
  }
  draw_mobject(mobj: MObject) {
    if (mobj instanceof HeatMap) {
      mobj.draw(this.canvas, this, this.imageData);
    } else {
      mobj.draw(this.canvas, this);
    }
  }
}

// A three-dimensional scene view of the two-dimensional wave equation.
// TODO Turn the below into a ThreeDSceneFromSimulator which is controlled by a handler.
export class WaveSimTwoDimThreeDScene extends InteractivePlayingThreeDScene {
  rotation_speed: number = 0.01;
  width: number;
  height: number;
  simulator: WaveSimTwoDim;
  constructor(
    canvas: HTMLCanvasElement,
    simulator: WaveSimTwoDim,
    width: number,
    height: number,
  ) {
    super(canvas, [simulator]);
    this.simulator = simulator;

    this.width = width;
    this.height = height;
    this.construct_scene();
  }
  width_buffer(): number {
    return Math.floor((this.simulator.width - this.width) / 2);
  }
  height_buffer(): number {
    return Math.floor((this.simulator.height - this.height) / 2);
  }
  // Populates the mobjects in the scene
  construct_scene() {
    // Construct horizontal lines
    for (let i = 0; i < this.width - 1; i++) {
      for (let j = 0; j < this.height; j++) {
        this.add(
          `l(${i},${j})(${i + 1},${j})`,
          new Line3D(this.eq_position(i, j), this.eq_position(i + 1, j))
            .set_stroke_width(0.05)
            .set_alpha(0.3),
        );
      }
    }
    // Construct vertical lines
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height - 1; j++) {
        this.add(
          `l(${i},${j})(${i},${j + 1})`,
          new Line3D(this.eq_position(i, j), this.eq_position(i, j + 1))
            .set_stroke_width(0.05)
            .set_alpha(0.3),
        );
      }
    }
    // Construct draggable dots
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let dot = new DraggableDot3D(this.eq_position(i, j), 0.1);
        dot.draggable_x = false;
        dot.draggable_y = false;
        dot.draggable_z = true;
        this.add_callbacks(i, j, dot);
        this.add(`p(${i},${j})`, dot);
      }
    }
  }
  // Resets the mobjects in the scene.
  set_frame_lims(xlims: Vec2D, ylims: Vec2D) {
    super.set_frame_lims(xlims, ylims);
    this.clear();
    this.construct_scene();
  }
  set_rotation_speed(speed: number) {
    this.rotation_speed = speed;
  }
  eq_position(i: number, j: number): Vec3D {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;
    return [
      xmin + ((i + 0.5) * (xmax - xmin)) / this.width,
      ymin + ((j + 0.5) * (ymax - ymin)) / this.height,
      0,
    ];
  }
  add_callbacks(i: number, j: number, dot: DraggableDot3D) {
    dot.add_callback(() =>
      this.simulator.set_val(
        this.simulator.index(i + this.width_buffer(), j + this.height_buffer()),
        dot.get_center()[2],
      ),
    );
    if (i < this.width - 1) {
      dot.add_callback(() =>
        (this.get_mobj(`l(${i},${j})(${i + 1},${j})`) as Line3D).move_start(
          dot.get_center(),
        ),
      );
    }
    if (i > 0) {
      dot.add_callback(() =>
        (this.get_mobj(`l(${i - 1},${j})(${i},${j})`) as Line3D).move_end(
          dot.get_center(),
        ),
      );
    }
    if (j < this.height - 1) {
      dot.add_callback(() =>
        (this.get_mobj(`l(${i},${j})(${i},${j + 1})`) as Line3D).move_start(
          dot.get_center(),
        ),
      );
    }
    if (j > 0) {
      dot.add_callback(() =>
        (this.get_mobj(`l(${i},${j - 1})(${i},${j})`) as Line3D).move_end(
          dot.get_center(),
        ),
      );
    }
    dot.add_callback(() => {
      this.draw();
      this.update_and_draw_linked_scenes();
    });
  }
  get_simulator(ind: number = 0): WaveSimTwoDim {
    return super.get_simulator(ind) as WaveSimTwoDim;
  }
  toggle_pause() {
    if (this.paused) {
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          let dot = this.get_mobj(`p(${i},${j})`) as DraggableDot3D;
          dot.draggable_z = false;
          // this.remove(`p(${i},${j})`);
          // this.add(`p(${i},${j})`, dot.toDot3D());
        }
      }
    } else {
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          let dot = this.get_mobj(`p(${i},${j})`) as DraggableDot3D;
          dot.draggable_z = true;
          // this.remove(`p(${i},${j})`);
          // let new_dot = dot.toDraggableDotZ3D();
          // this.add_callbacks(i, j, new_dot);
          // this.add(`p(${i},${j})`, new_dot);
        }
      }
    }
    super.toggle_pause();
  }
  update_mobjects() {
    let vals = this.simulator.get_uValues();
    let new_z: number;
    let x, y, z;
    let dot, line;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        new_z = vals[
          this.simulator.index(
            i + this.width_buffer(),
            j + this.height_buffer(),
          )
        ] as number;
        dot = this.get_mobj(`p(${i},${j})`) as Dot3D;
        [x, y, z] = dot.get_center();
        dot.move_to([x, y, new_z]);
        if (i < this.width - 1) {
          line = this.get_mobj(`l(${i},${j})(${i + 1},${j})`) as Line3D;
          line.move_start([x, y, new_z]);
        }
        if (j < this.height - 1) {
          line = this.get_mobj(`l(${i},${j})(${i},${j + 1})`) as Line3D;
          line.move_start([x, y, new_z]);
        }
        if (i > 0) {
          line = this.get_mobj(`l(${i - 1},${j})(${i},${j})`) as Line3D;
          line.move_end([x, y, new_z]);
        }
        if (j > 0) {
          line = this.get_mobj(`l(${i},${j - 1})(${i},${j})`) as Line3D;
          line.move_end([x, y, new_z]);
        }
      }
    }
    // Rotate the scene
    if (!this.paused) {
      this.camera.rot_pos_and_view_z(this.dt * this.rotation_speed);
    }
  }
  draw_mobject(mobj: MObject) {
    mobj.draw(this.canvas, this, true);
  }
}
