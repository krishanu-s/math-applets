import { ThreeDMObjectGroup, PolygonPanel3D } from "./mobjects";
import { spherical_to_cartesian } from "./matvec";
import { ColorMap, rb_colormap, colorval_to_rgba } from "../base/color";
import { SphericalState } from "../simulator/statesim";
import { Simulator, ThreeDSceneFromSimulator } from "../simulator/sim";

// A sphere composed of an array of rectangular panels, whose colors can be
// changed using the output of SphericalDrawable.
// TODO Change this to a single MObject which draws all of the panels in sequence.
export class SphereHeatMap extends ThreeDMObjectGroup {
  radius: number;
  num_theta: number;
  num_phi: number;
  _spherical_state: SphericalState;
  colormap: ColorMap = rb_colormap;
  constructor(radius: number, num_theta: number, num_phi: number) {
    super();
    this.radius = radius;
    this.num_theta = num_theta;
    this.num_phi = num_phi;
    this._spherical_state = new SphericalState(num_theta - 1, num_phi);
    this._make_panels();
  }
  // Sets the colormap for the MObject
  set_colormap(colormap: ColorMap) {
    this.colormap = colormap;
  }
  // Re-makes the panels
  _make_panels() {
    this.clear();
    let theta_rad: number, next_theta_rad: number;
    let phi_rad: number, next_phi_rad: number;
    for (let theta = 0; theta < this.num_theta; theta++) {
      theta_rad = (Math.PI * theta) / this.num_theta;
      next_theta_rad = (Math.PI * (theta + 1)) / this.num_theta;
      for (let phi = 0; phi < this.num_phi; phi++) {
        phi_rad = (2 * Math.PI * phi) / this.num_phi;
        next_phi_rad = (2 * Math.PI * (phi + 1)) / this.num_phi;
        this.add_mobj(
          `p_${theta}_${phi}`,
          new PolygonPanel3D([
            spherical_to_cartesian(this.radius, theta_rad, phi_rad),
            spherical_to_cartesian(this.radius, theta_rad, next_phi_rad),
            spherical_to_cartesian(this.radius, next_theta_rad, next_phi_rad),
            spherical_to_cartesian(this.radius, next_theta_rad, phi_rad),
          ])
            .set_fill_color("red")
            .set_fill_alpha(0.3)
            .set_stroke_width(0.001),
        );
      }
    }
  }
  // Get the panel at the given theta and phi angles
  get_panel(theta: number, phi: number) {
    return this.get_mobj(`p_${theta}_${phi}`) as PolygonPanel3D;
  }
  // Loads the colors from an array of values with shape (num_theta + 1, num_phi)
  load_colors_from_array(vals: number[]) {
    for (let theta = 0; theta < this.num_theta; theta++) {
      for (let phi = 0; phi < this.num_phi; phi++) {
        let val = vals[this._spherical_state.index(theta, phi)] as number;
        this.get_panel(theta, phi).set_fill_color(
          colorval_to_rgba(this.colormap(val)),
        );
      }
    }
  }
}

// A 3D scene containing a sphere which updates colors from the simulator
export class SphereHeatMapScene extends ThreeDSceneFromSimulator {
  constructor(
    canvas: HTMLCanvasElement,
    radius: number,
    num_theta: number,
    num_phi: number,
  ) {
    super(canvas);
    let sphere = new SphereHeatMap(radius, num_theta, num_phi);
    this.add("sphere", sphere);
  }
  set_colormap(colormap: ColorMap) {
    let sphere = this.get_mobj("sphere") as SphereHeatMap;
    sphere.set_colormap(colormap);
  }
  // Load new colors from the simulator
  update_mobjects_from_simulator(simulator: Simulator) {
    // This array has shape (num_theta, num_phi).
    let vals = simulator.get_drawable();
    let sphere = this.get_mobj("sphere") as SphereHeatMap;
    sphere.load_colors_from_array(vals);
  }
}
