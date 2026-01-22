import { MObject, Scene, Dot, Line, prepare_canvas } from "./base.js";
import { Slider, Button } from "./interactive.js";
import { Vec2D, clamp, sigmoid } from "./base.js";
import { ParametricFunction } from "./parametric.js";
import { HeatMap } from "./heatmap.js";
import {
  Simulator,
  TwoDimDrawable,
  InteractivePlayingScene,
  TwoDimState,
} from "./statesim.js";

class PointSource {
  x: number; // X-coordinate
  y: number; // Y-coordinate
  w: number; // Frequency
  a: number; // Amplitude
  constructor(x: number, y: number, w: number, a: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.a = a;
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
}

// *** SIMULATORS ***

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
export class WaveSimTwoDim extends Simulator implements TwoDimDrawable {
  width: number;
  height: number;
  pml_layers: Record<number, [number, number]> = {};
  wave_propagation_speed: number = 20.0; // Speed of wave propagation
  _two_dim_state: TwoDimState;
  point_sources: Array<PointSource> = [];
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
    this.add_boundary_conditions(this.vals, this.time);
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
  // Add point sources
  add_boundary_conditions(s: Array<number>, t: number): void {
    let ind;
    this.point_sources.forEach((elem) => {
      ind = this.index(elem.x, elem.y);
      s[ind] = elem.a * Math.sin(elem.w * t);
      s[ind + this.size()] = elem.a * elem.w * Math.cos(elem.w * t);
    });
  }
}

// TODO Allow multiple sources, of the form {ind => (p_x, p_y, a, w, phase)}
// TODO Allow this interface to stack with others. Perhaps make "point sources" into
// a subobject of WaveSimTwoDim, and these are added during the boundary conditions.
// This would solve both problems.
export class WaveSimTwoDimPointSource extends WaveSimTwoDim {
  constructor(width: number, height: number, dt: number) {
    super(width, height, dt);
    this.point_sources = [
      new PointSource(
        Math.floor(this.width / 2),
        Math.floor(this.height / 2),
        2.0,
        5.0,
      ),
    ];
  }
  set_attr(name: string, val: any) {
    let p = this.point_sources[0] as PointSource;
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
}

// TODO
export class WaveSimTwoDimDipole extends WaveSimTwoDim {}

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
  clamp_value: number = 10.0;
  constructor(width: number, height: number, dt: number) {
    super(width, height, dt);
    let [x, y] = this.foci[0];
    this.point_sources = [new PointSource(x, y, 5.0, 5.0)];
  }
  _recalculate_foci() {
    let [focus_1_x, focus_1_y] = [
      Math.floor(
        this.width / 2 +
          Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      ),
      Math.floor(this.height / 2),
    ];
    let [focus_2_x, focus_2_y] = [
      Math.floor(
        this.width / 2 -
          Math.sqrt(this.semimajor_axis ** 2 - this.semiminor_axis ** 2),
      ),
      Math.floor(this.height / 2),
    ];
    this.point_sources = [new PointSource(focus_1_x, focus_1_y, 5.0, 5.0)];
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
  add_boundary_conditions(s: Array<number>, t: number): void {
    super.add_boundary_conditions(s, t);

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

// TODO
export class WaveSimTwoDimParabolaReflector extends WaveSimTwoDimReflector {}

// TODO Do parabolic reflector case

// *** SCENES ***

// Heatmap version of a 2D input wave equation scene
// TODO Make this written for any Simulator satisfying HeatMapDrawable.
export class WaveSimTwoDimHeatMapScene extends InteractivePlayingScene {
  simulator: WaveSimTwoDim;
  imageData: ImageData; // Target for heatmap data
  constructor(
    canvas: HTMLCanvasElement,
    simulator: WaveSimTwoDim,
    imageData: ImageData,
  ) {
    super(canvas, [simulator]);
    this.simulator = simulator;
    simulator satisfies TwoDimDrawable;
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
// TODO In this case, there are two simulators at play. One for the x-coordinate of the output,
// and one for the y-coordinate of the output.
export class WaveSimTwoDimDotsScene extends InteractivePlayingScene {
  constructor(
    canvas: HTMLCanvasElement,
    simulators: [WaveSimTwoDim, WaveSimTwoDim],
    imageData: ImageData,
  ) {
    super(canvas, simulators);
    this.simulators = simulators;

    if (simulators[0].width != simulators[1].width) {
      throw new Error("Simulators have different width.");
    }
    if (simulators[0].height != simulators[1].height) {
      throw new Error("Simulators have different height.");
    }

    // Add Mobjects
    // TODO Add connecting lines
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
  eq_position(x: number, y: number): [number, number] {
    return [
      this.xlims[0] +
        ((x + 0.5) * (this.xlims[1] - this.xlims[0])) / this.width(),
      this.ylims[0] +
        ((y + 0.5) * (this.ylims[1] - this.ylims[0])) / this.height(),
    ];
  }
  get_simulator(ind: number): WaveSimTwoDim {
    return super.get_simulator(ind) as WaveSimTwoDim;
  }
  width(): number {
    return this.get_simulator(0).width;
  }
  height(): number {
    return this.get_simulator(0).height;
  }
  // Move all of the dots, where the two simulators control
  // the x-coordinates and y-coordinates, respectively.
  update_mobjects() {
    let w = this.width();
    let h = this.height();
    let dot: Dot;
    let ind: number;
    let x_eq: number;
    let y_eq: number;
    let sim_0 = this.get_simulator(0);
    let u_0 = sim_0.get_uValues();
    let u_1 = this.get_simulator(1).get_uValues();
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        dot = this.get_mobj(`p_{${x}, ${y}}`) as Dot;
        ind = sim_0.index(x, y);
        [x_eq, y_eq] = this.eq_position(x, y);
        dot.move_to(x_eq + (u_0[ind] as number), y_eq + (u_1[ind] as number));
      }
    }
  }
  draw_mobject(mobj: MObject) {
    mobj.draw(this.canvas, this);
  }
}
