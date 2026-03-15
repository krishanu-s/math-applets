import { ThreeDMObjectGroup, PolygonPanel3D, LineSequence3D, } from "./mobjects";
import { spherical_to_cartesian } from "./matvec";
import { FillOptions } from "../base";
import { vec3_normalize, vec3_sub, vec3_dot, vec3_scale, } from "./matvec";
import { rb_colormap, colorval_to_rgba } from "../base/color";
import { SphericalState } from "../simulator/statesim";
import { ThreeDSceneFromSimulator } from "../simulator/sim";
import { BezierSpline3D } from "./bezier";
// A sphere composed of an array of rectangular panels, whose colors can be
// changed using the output of SphericalDrawable.
// TODO Change this to a single MObject which draws all of the panels in sequence.
export class SphereHeatMap extends ThreeDMObjectGroup {
    constructor(radius, num_theta, num_phi) {
        super();
        this.colormap = rb_colormap;
        this.radius = radius;
        this.num_theta = num_theta;
        this.num_phi = num_phi;
        this._spherical_state = new SphericalState(num_theta - 1, num_phi);
        this._make_panels();
    }
    // Sets the colormap for the MObject
    set_colormap(colormap) {
        this.colormap = colormap;
    }
    // Re-makes the panels
    _make_panels() {
        this.clear();
        let theta_rad, next_theta_rad;
        let phi_rad, next_phi_rad;
        for (let theta = 0; theta < this.num_theta; theta++) {
            theta_rad = (Math.PI * theta) / this.num_theta;
            next_theta_rad = (Math.PI * (theta + 1)) / this.num_theta;
            for (let phi = 0; phi < this.num_phi; phi++) {
                phi_rad = (2 * Math.PI * phi) / this.num_phi;
                next_phi_rad = (2 * Math.PI * (phi + 1)) / this.num_phi;
                this.add_mobj(`p_${theta}_${phi}`, new PolygonPanel3D([
                    spherical_to_cartesian(this.radius, theta_rad, phi_rad),
                    spherical_to_cartesian(this.radius, theta_rad, next_phi_rad),
                    spherical_to_cartesian(this.radius, next_theta_rad, next_phi_rad),
                    spherical_to_cartesian(this.radius, next_theta_rad, phi_rad),
                ])
                    .set_fill_color("red")
                    .set_fill_alpha(0.3)
                    .set_stroke_width(0.001));
            }
        }
    }
    // Get the panel at the given theta and phi angles
    get_panel(theta, phi) {
        return this.get_mobj(`p_${theta}_${phi}`);
    }
    // Loads the colors from an array of values with shape (num_theta + 1, num_phi)
    load_colors_from_array(vals) {
        for (let theta = 0; theta < this.num_theta; theta++) {
            for (let phi = 0; phi < this.num_phi; phi++) {
                let val = vals[this._spherical_state.index(theta, phi)];
                this.get_panel(theta, phi).set_fill_color(colorval_to_rgba(this.colormap(val)));
            }
        }
    }
}
// A 3D scene containing a sphere which updates colors from the simulator
export class SphereHeatMapScene extends ThreeDSceneFromSimulator {
    constructor(canvas, radius, num_theta, num_phi) {
        super(canvas);
        let sphere = new SphereHeatMap(radius, num_theta, num_phi);
        this.add("sphere", sphere);
    }
    set_colormap(colormap) {
        let sphere = this.get_mobj("sphere");
        sphere.set_colormap(colormap);
    }
    // Load new colors from the simulator
    update_mobjects_from_simulator(simulator) {
        // This array has shape (num_theta, num_phi).
        let vals = simulator.get_drawable();
        let sphere = this.get_mobj("sphere");
        sphere.load_colors_from_array(vals);
    }
}
// A torus composed of rectangular panels.
export class Torus extends ThreeDMObjectGroup {
    constructor(outer_radius, inner_radius, num_phi, num_theta) {
        super();
        this.fill_options = new FillOptions();
        this.do_stroke = false;
        this.outer_radius = outer_radius;
        this.inner_radius = inner_radius;
        this.num_phi = num_phi;
        this.num_theta = num_theta;
        this.clear();
        this._make_skeleton();
        this._make_panels();
    }
    // Normal vector to the panel parametrized by (phi, theta)
    _normal_vector(phi, theta) {
        let phi_rad = (2 * Math.PI * phi) / this.num_phi;
        let theta_rad = (2 * Math.PI * theta) / this.num_theta;
        return [
            Math.cos(theta_rad) * Math.cos(phi_rad),
            Math.cos(theta_rad) * Math.sin(phi_rad),
            Math.sin(theta_rad),
        ];
    }
    // Sets the brightness of the individual panels according to light coming from a direction.
    _update_panel_brightness(light_source_vec, camera_depth_vec) {
        // Assert light source vector and camera depth vector are normalized to length 1.
        let _light_source_vec = vec3_normalize(light_source_vec);
        let _camera_depth_vec = vec3_normalize(camera_depth_vec);
        // For each panel
        // - Let n be its normal vector
        // - Reflect the light source vector across n to get r
        // - Take the dot product of r with depth_dir to set the brightness of the panel.
        let brightness_val;
        let b;
        let colorval_rgba_string;
        let normal_vector;
        let reflected_vector;
        for (let phi = 0; phi < this.num_phi; phi++) {
            for (let theta = 0; theta < this.num_theta; theta++) {
                let mobj = this.get_mobj(`p_${phi}_${theta}`);
                normal_vector = mobj.normal_vec;
                reflected_vector = vec3_sub(vec3_scale(normal_vector, 2 * vec3_dot(_light_source_vec, normal_vector)), _light_source_vec);
                b = -vec3_dot(reflected_vector, _camera_depth_vec);
                brightness_val = Math.max(0, 128 + 128 * b);
                colorval_rgba_string = `rgba(${brightness_val}, ${brightness_val}, ${brightness_val}, 1.0)`;
                mobj.set_fill_color(colorval_rgba_string);
                mobj.set_stroke_color(colorval_rgba_string);
            }
        }
        return this;
    }
    set_fill_alpha(alpha) {
        this.fill_options.set_fill_alpha(alpha);
        for (let theta = 0; theta < this.num_theta; theta++) {
            for (let phi = 0; phi < this.num_phi; phi++) {
                this.get_mobj(`p_${phi}_${theta}`).set_fill_alpha(alpha);
            }
        }
        return this;
    }
    set_fill_color(color) {
        this.fill_options.set_fill_color(color);
        for (let theta = 0; theta < this.num_theta; theta++) {
            for (let phi = 0; phi < this.num_phi; phi++) {
                this.get_mobj(`p_${phi}_${theta}`).set_fill_color(color);
            }
        }
        return this;
    }
    _param(phi_rad, theta_rad) {
        return [
            (this.outer_radius + this.inner_radius * Math.cos(theta_rad)) *
                Math.cos(phi_rad),
            (this.outer_radius + this.inner_radius * Math.cos(theta_rad)) *
                Math.sin(phi_rad),
            this.inner_radius * Math.sin(theta_rad),
        ];
    }
    _make_panels() {
        let theta_rad, next_theta_rad;
        let phi_rad, next_phi_rad;
        for (let theta = 0; theta < this.num_theta; theta++) {
            theta_rad = (2 * Math.PI * (theta - 0.5)) / this.num_theta;
            next_theta_rad = (2 * Math.PI * (theta + 0.5)) / this.num_theta;
            for (let phi = 0; phi < this.num_phi; phi++) {
                phi_rad = (2 * Math.PI * (phi - 0.5)) / this.num_phi;
                next_phi_rad = (2 * Math.PI * (phi + 0.5)) / this.num_phi;
                this.add_mobj(`p_${phi}_${theta}`, new PolygonPanel3D([
                    this._param(phi_rad, theta_rad),
                    this._param(phi_rad, next_theta_rad),
                    this._param(next_phi_rad, next_theta_rad),
                    this._param(next_phi_rad, theta_rad),
                ])
                    .set_fill_color(this.fill_options.fill_color)
                    .set_fill_alpha(this.fill_options.fill_alpha)
                    .set_stroke_color("black")
                    .set_stroke_width(0.01)
                    .set_stroke(true)
                    .set_normal_vector(this._normal_vector(phi, theta)));
            }
        }
    }
    _make_skeleton() {
        let theta_rad;
        let phi_rad;
        for (let phi = 0; phi < this.num_phi; phi++) {
            phi_rad = (2 * Math.PI * (phi - 0.5)) / this.num_phi;
            let l = new LineSequence3D([]).set_stroke_width(0.01);
            if (!this.do_stroke) {
                l.set_alpha(0.0);
            }
            for (let i = 0; i < 100; i++) {
                l.add_point(this._param(phi_rad, (2 * Math.PI * i) / 100));
            }
            this.add_mobj(`l_outer_${phi}`, l);
        }
        for (let theta = 0; theta < this.num_theta; theta++) {
            theta_rad = (2 * Math.PI * (theta - 0.5)) / this.num_theta;
            let l = new LineSequence3D([]).set_stroke_width(0.01);
            if (!this.do_stroke) {
                l.set_alpha(0.0);
            }
            for (let i = 0; i < 100; i++) {
                l.add_point(this._param((2 * Math.PI * i) / 100, theta_rad));
            }
            this.add_mobj(`l_inner_${theta}`, l);
        }
    }
}
// TODO A general surface, composed of n x n rectangular panels
export class Surface extends ThreeDMObjectGroup {
    constructor(f, xlims, ylims, num_x, num_y, solver_x, solver_y) {
        super();
        this.grad_f = (_x, _y) => [0, 0, 1]; // Used for getting normal vectors for panels
        this.fill_options = new FillOptions();
        this.do_stroke = false;
        this.f = f;
        this.xlims = xlims;
        this.ylims = ylims;
        this.num_x = num_x;
        this.num_y = num_y;
        this.solver_x = solver_x;
        this.solver_y = solver_y;
        this.clear();
        this._make_skeleton();
        this._make_panels();
        this._set_normal_vectors();
    }
    set_grad_f(grad_f) {
        this.grad_f = grad_f;
        this._set_normal_vectors();
        return this;
    }
    set_fill_alpha(alpha) {
        this.fill_options.set_fill_alpha(alpha);
        for (let y = 0; y < this.num_y; y++) {
            for (let x = 0; x < this.num_x; x++) {
                this.get_mobj(`p_${x}_${y}`).set_fill_alpha(alpha);
            }
        }
        return this;
    }
    set_fill_color(color) {
        this.fill_options.set_fill_color(color);
        for (let y = 0; y < this.num_y; y++) {
            for (let x = 0; x < this.num_x; x++) {
                this.get_mobj(`p_${x}_${y}`).set_fill_color(color);
            }
        }
        return this;
    }
    set_do_stroke(d) {
        this.do_stroke = d;
        let alpha;
        if (d) {
            alpha = 1.0;
        }
        else {
            alpha = 0.0;
        }
        for (let y = 0; y <= this.num_y; y++) {
            this.get_mobj(`l_x_${y}`).set_alpha(alpha);
        }
        for (let x = 0; x <= this.num_x; x++) {
            this.get_mobj(`l_y_${x}`).set_alpha(alpha);
        }
        return this;
    }
    _param(x_val, y_val) {
        return [x_val, y_val, this.f(x_val, y_val)];
    }
    // Sets the brightness of the individual panels according to light coming from a direction.
    _update_panel_brightness(light_source_vec, camera_depth_vec) {
        // Assert light source vector and camera depth vector are normalized to length 1.
        let _light_source_vec = vec3_normalize(light_source_vec);
        let _camera_depth_vec = vec3_normalize(camera_depth_vec);
        // For each panel
        // - Let n be its normal vector
        // - Reflect the light source vector across n to get r
        // - Take the dot product of r with depth_dir to set the brightness of the panel.
        let brightness_val;
        let b;
        let colorval_rgba_string;
        let normal_vector;
        let reflected_vector;
        for (let x = 0; x < this.num_x; x++) {
            for (let y = 0; y < this.num_y; y++) {
                let mobj = this.get_mobj(`p_${x}_${y}`);
                normal_vector = mobj.normal_vec;
                reflected_vector = vec3_sub(vec3_scale(normal_vector, 2 * vec3_dot(_light_source_vec, normal_vector)), _light_source_vec);
                b = -vec3_dot(reflected_vector, _camera_depth_vec);
                brightness_val = Math.max(0, 128 + 128 * b);
                colorval_rgba_string = `rgba(${brightness_val}, ${brightness_val}, ${brightness_val}, 1.0)`;
                mobj.set_fill_color(colorval_rgba_string);
                mobj.set_stroke_color(colorval_rgba_string);
            }
        }
        return this;
    }
    // Manually sets the normal vector for the panel at (x, y)
    set_normal_vector(x, y, v) {
        this.get_mobj(`p_${x}_${y}`).set_normal_vector(v);
    }
    _set_normal_vectors() {
        let xval, yval;
        for (let x = 0; x < this.num_x; x++) {
            xval =
                this.xlims[0] +
                    ((this.xlims[1] - this.xlims[0]) * (x + 0.5)) / this.num_x;
            for (let y = 0; y < this.num_y; y++) {
                yval =
                    this.ylims[0] +
                        ((this.ylims[1] - this.ylims[0]) * (y + 0.5)) / this.num_y;
                console.log("Normal vector at", x, y, ":", vec3_normalize(this.grad_f(xval, yval)));
                this.get_mobj(`p_${x}_${y}`).set_normal_vector(vec3_normalize(this.grad_f(xval, yval)));
            }
        }
    }
    _make_panels() {
        let xval, next_xval;
        let yval, next_yval;
        for (let x = 0; x < this.num_x; x++) {
            xval = this.xlims[0] + ((this.xlims[1] - this.xlims[0]) * x) / this.num_x;
            next_xval =
                this.xlims[0] +
                    ((this.xlims[1] - this.xlims[0]) * (x + 1)) / this.num_x;
            for (let y = 0; y < this.num_y; y++) {
                yval =
                    this.ylims[0] + ((this.ylims[1] - this.ylims[0]) * y) / this.num_y;
                next_yval =
                    this.ylims[0] +
                        ((this.ylims[1] - this.ylims[0]) * (y + 1)) / this.num_y;
                this.add_mobj(`p_${x}_${y}`, new PolygonPanel3D([
                    this._param(xval, yval),
                    this._param(xval, next_yval),
                    this._param(next_xval, next_yval),
                    this._param(next_xval, yval),
                ])
                    .set_fill_color(this.fill_options.fill_color)
                    .set_fill_alpha(this.fill_options.fill_alpha)
                    .set_stroke_color("black")
                    .set_stroke_width(0.01)
                    .set_stroke(true));
            }
        }
    }
    _make_skeleton() {
        let xval, yval;
        for (let y = 0; y <= this.num_y; y++) {
            yval = this.ylims[0] + ((this.ylims[1] - this.ylims[0]) * y) / this.num_y;
            let anchors = [];
            for (let x = 0; x <= this.num_x; x++) {
                xval =
                    this.xlims[0] + ((this.xlims[1] - this.xlims[0]) * x) / this.num_x;
                anchors.push([xval, yval, this.f(xval, yval)]);
            }
            let l = new BezierSpline3D(this.num_x, this.solver_x)
                .set_anchors(anchors)
                .set_stroke_width(0.01);
            if (!this.do_stroke) {
                l.set_alpha(0.0);
            }
            this.add_mobj(`l_x_${y}`, l);
        }
        for (let x = 0; x <= this.num_x; x++) {
            xval = this.xlims[0] + ((this.xlims[1] - this.xlims[0]) * x) / this.num_x;
            let anchors = [];
            for (let y = 0; y <= this.num_y; y++) {
                yval =
                    this.ylims[0] + ((this.ylims[1] - this.ylims[0]) * y) / this.num_y;
                anchors.push([xval, yval, this.f(xval, yval)]);
            }
            let l = new BezierSpline3D(this.num_y, this.solver_y)
                .set_anchors(anchors)
                .set_stroke_width(0.01);
            if (!this.do_stroke) {
                l.set_alpha(0.0);
            }
            this.add_mobj(`l_y_${x}`, l);
        }
    }
}
//# sourceMappingURL=surfaces.js.map