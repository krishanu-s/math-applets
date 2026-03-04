// Heat equation simulator
import { gaussian_normal_pdf } from "../base";
import { StateSimulator, TwoDimState, SphericalState, } from "./statesim.js";
// Heat equation simulation in rectilinear coordinates, using TwoDimState.
// TODO Set boundary conditions in subclasses.
export class HeatSimTwoDim extends StateSimulator {
    constructor(width, height, dt) {
        super(width * height, dt);
        this.heat_propagation_speed = 20.0; // Speed of wave propagation
        this.width = width;
        this.height = height;
        this._two_dim_state = new TwoDimState(width, height);
    }
    size() {
        return this.width * this.height;
    }
    index(x, y) {
        return this._two_dim_state.index(x, y);
    }
    set_heat_propagation_speed(speed) {
        this.heat_propagation_speed = speed;
    }
    // Named portions of the state values
    get_uValues() {
        return this._get_uValues(this.vals);
    }
    _get_uValues(vals) {
        return vals.slice(0, this.size());
    }
    // Sets the initial conditions of the simulation
    set_init_conditions(u0) {
        for (let i = 0; i < this.size(); i++) {
            this.vals[i] = u0[i];
        }
        this.time = 0;
        this.set_boundary_conditions(this.vals, this.time);
    }
    laplacian_entry(vals, x, y) {
        return (this._two_dim_state.l_x_entry(vals, x, y) +
            this._two_dim_state.l_y_entry(vals, x, y));
    }
    dot(vals, time) {
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
export class HeatSimSpherical extends StateSimulator {
    constructor(num_theta, num_phi, dt) {
        super((num_theta + 1) * num_phi, dt);
        this.heat_propagation_speed = 20.0; // Speed of heat propagation
        this.num_theta = num_theta;
        this.num_phi = num_phi;
        this._spherical_state = new SphericalState(num_theta, num_phi);
    }
    // Size of the 2D grid
    size() {
        return this.num_theta * this.num_phi;
    }
    index(x, y) {
        return this._spherical_state.index(x, y);
    }
    set_heat_propagation_speed(speed) {
        this.heat_propagation_speed = speed;
    }
    // Named portions of the state values
    get_uValues() {
        return this._get_uValues(this.vals);
    }
    _get_uValues(vals) {
        return vals.slice(0, this.size());
    }
    // Downshifts the value array from shape (num_theta + 1, num_phi) to (num_theta, num_phi)
    // by averaging adjacent rows.
    get_drawable() {
        return this._spherical_state.downshift_values(this.get_uValues());
    }
    // Sets the initial conditions of the simulation
    set_init_conditions(u0) {
        for (let i = 0; i < this.size(); i++) {
            this.vals[i] = u0[i];
        }
        this.time = 0;
        this.set_boundary_conditions(this.vals, this.time);
    }
    laplacian_entry(vals, theta, phi) {
        return this._spherical_state.l_entry(vals, theta, phi);
    }
    dot(vals, time) {
        let dS = new Array(this.state_size).fill(0);
        for (let theta = 0; theta <= this.num_theta; theta++) {
            for (let phi = 0; phi < this.num_phi; phi++) {
                dS[this.index(theta, phi)] =
                    this.heat_propagation_speed * this.laplacian_entry(vals, theta, phi);
            }
        }
        return dS;
    }
}
// A heat equation simulation on the surface of a sphere where each pole is
// held at a different, constant temperature.
export class HeatSimPoles extends HeatSimSpherical {
    constructor(num_theta, num_phi, dt) {
        super(num_theta, num_phi, dt);
        this.n_pole_temp = 20;
        this.s_pole_temp = -20;
        // Heat/cold sources are modeled locally using a normal distribution, to avoid sharp edges
        this.bump_std = 0.05;
        this.bump_vals = [];
        this._make_bump_vals();
    }
    _make_bump_vals() {
        let i = 0;
        let bump_val = gaussian_normal_pdf(0, this.bump_std, (i * Math.PI) / this.num_theta);
        this.bump_vals = [];
        while (bump_val > 0.2) {
            this.bump_vals.push(bump_val);
            i++;
            bump_val = gaussian_normal_pdf(0, this.bump_std, (i * Math.PI) / this.num_theta);
        }
    }
    set_n_pole_temp(temp) {
        this.n_pole_temp = temp;
    }
    set_s_pole_temp(temp) {
        this.s_pole_temp = temp;
    }
    set_boundary_conditions(s, t) {
        for (let phi = 0; phi < this.num_phi; phi++) {
            for (let j = 0; j < this.bump_vals.length; j++) {
                let bump_val = this.bump_vals[j];
                s[this.index(j, phi)] = this.n_pole_temp * bump_val;
                s[this.index(this.num_theta - j, phi)] = this.s_pole_temp * bump_val;
            }
        }
    }
}
//# sourceMappingURL=heatsim.js.map