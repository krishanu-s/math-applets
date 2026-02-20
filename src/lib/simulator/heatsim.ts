// Heat equation simulator

import {
  StateSimulator,
  TwoDimDrawable,
  SphericalDrawable,
  TwoDimState,
  SphericalState,
} from "./statesim.js";

// Heat equation simulation in rectilinear coordinates, using TwoDimState.
// TODO Set boundary conditions in subclasses.
export class HeatSimTwoDim extends StateSimulator implements TwoDimDrawable {
  width: number;
  height: number;
  heat_propagation_speed: number = 20.0; // Speed of wave propagation
  _two_dim_state: TwoDimState;
  constructor(width: number, height: number, dt: number) {
    super(width * height, dt);
    this.width = width;
    this.height = height;
    this._two_dim_state = new TwoDimState(width, height);
  }
  size(): number {
    return this.width * this.height;
  }
  index(x: number, y: number): number {
    return this._two_dim_state.index(x, y);
  }
  set_heat_propagation_speed(speed: number) {
    this.heat_propagation_speed = speed;
  }
  // Named portions of the state values
  get_uValues(): Array<number> {
    return this._get_uValues(this.vals);
  }
  _get_uValues(vals: Array<number>): Array<number> {
    return vals.slice(0, this.size());
  }
  // Sets the initial conditions of the simulation
  set_init_conditions(u0: Array<number>): void {
    for (let i = 0; i < this.size(); i++) {
      this.vals[i] = u0[i] as number;
    }
    this.time = 0;
    this.set_boundary_conditions(this.vals, this.time);
  }
  laplacian_entry(vals: Array<number>, x: number, y: number): number {
    return (
      this._two_dim_state.l_x_entry(vals, x, y) +
      this._two_dim_state.l_y_entry(vals, x, y)
    );
  }
  dot(vals: Array<number>, time: number): Array<number> {
    let dS = new Array(this.state_size);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        dS[this.index(x, y)] =
          this.heat_propagation_speed * this.laplacian_entry(vals, x, y);
      }
    }
    return dS;
  }
}

// Heat equation simulation in spherical coordinates, using SphericalState.
// TODO Set boundary conditions in subclasses.
export class HeatSimSpherical
  extends StateSimulator
  implements SphericalDrawable
{
  num_theta: number;
  num_phi: number;
  heat_propagation_speed: number = 20.0; // Speed of heat propagation
  _spherical_state: SphericalState;
  constructor(num_theta: number, num_phi: number, dt: number) {
    super((num_theta + 1) * num_phi, dt);
    this.num_theta = num_theta;
    this.num_phi = num_phi;
    this._spherical_state = new SphericalState(num_theta, num_phi);
  }
  // Size of the 2D grid
  size(): number {
    return this.num_theta * this.num_phi;
  }
  index(x: number, y: number): number {
    return this._spherical_state.index(x, y);
  }
  set_heat_propagation_speed(speed: number) {
    this.heat_propagation_speed = speed;
  }
  // Named portions of the state values
  get_uValues(): Array<number> {
    return this._get_uValues(this.vals);
  }
  _get_uValues(vals: Array<number>): Array<number> {
    return vals.slice(0, this.size());
  }
  // Downshifts the value array from shape (num_theta + 1, num_phi) to (num_theta, num_phi)
  // by averaging adjacent rows.
  get_drawable(): Array<number> {
    return this._spherical_state.downshift_values(this.get_uValues());
  }
  // Sets the initial conditions of the simulation
  set_init_conditions(u0: Array<number>): void {
    for (let i = 0; i < this.size(); i++) {
      this.vals[i] = u0[i] as number;
    }
    this.time = 0;
    this.set_boundary_conditions(this.vals, this.time);
  }
  laplacian_entry(vals: Array<number>, theta: number, phi: number): number {
    return this._spherical_state.l_entry(vals, theta, phi);
  }
  dot(vals: Array<number>, time: number): Array<number> {
    let dS = new Array(this.state_size).fill(0);
    for (let theta = 0; theta <= this.num_theta; theta++) {
      for (let phi = 0; phi < this.num_phi; phi++) {
        dS[this.index(theta, phi)] = this.laplacian_entry(vals, theta, phi);
      }
    }
    // console.log(dS);
    return dS;
  }
}
