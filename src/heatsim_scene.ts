import {
  prepare_canvas,
  Scene,
  HeatMap,
  colorval_to_rgba,
  grayscale_colormap,
  rb_colormap,
  rb_colormap_2,
  MObject,
  Vec2D,
  CoordinateAxes3d,
  gaussian_normal_pdf,
  delay,
} from "./lib/base";
import { ColorMap } from "./lib/base/color";
import { Slider, Button } from "./lib/interactive";
import { HeatSimTwoDim, HeatSimSpherical } from "./lib/simulator";
import {
  InteractiveHandler,
  SceneFromSimulator,
  ThreeDSceneFromSimulator,
  Simulator,
} from "./lib/simulator/sim";
import { SphericalState } from "./lib/simulator/statesim";
import {
  ThreeDScene,
  Vec3D,
  vec3_scale,
  vec3_sum,
  vec3_sum_list,
  Arcball,
  ThreeDMObject,
  ThreeDFillLikeMObject,
  ThreeDMObjectGroup,
  Dot3D,
  vec3_normalize,
  rot,
} from "./lib/three_d";
import {
  SphericalFunctionZeroOrder,
  legendre_polynomial,
  spherical_harmonic_0,
  factorial,
  calculate_legendre_polynomial_coefficients,
} from "./lib/base/spherical_harmonics";

// A polygon in 3D where the points are assumed to be coplanar.
class Polygon3D extends ThreeDFillLikeMObject {
  points: Vec3D[];
  constructor(points: Vec3D[]) {
    super();
    this.points = points;
  }
  // TODO Fix this and fix visibility condition
  depth(scene: ThreeDScene): number {
    return scene.camera.depth(
      vec3_scale(vec3_sum_list(this.points), 1 / this.points.length),
    );
  }
  _draw(ctx: CanvasRenderingContext2D, scene: ThreeDScene) {
    let current_point = this.points[0] as Vec3D;
    let current_point_camera_view = scene.camera_view(current_point) as Vec2D;
    let [cp_x, cp_y] = scene.v2c(current_point_camera_view);
    ctx.moveTo(cp_x, cp_y);
    ctx.beginPath();
    for (let i = 1; i < this.points.length; i++) {
      current_point = this.points[i] as Vec3D;
      current_point_camera_view = scene.camera_view(current_point) as Vec2D;
      [cp_x, cp_y] = scene.v2c(current_point_camera_view);
      ctx.lineTo(cp_x, cp_y);
    }
    current_point = this.points[0] as Vec3D;
    current_point_camera_view = scene.camera_view(current_point) as Vec2D;
    [cp_x, cp_y] = scene.v2c(current_point_camera_view);
    ctx.lineTo(cp_x, cp_y);

    ctx.closePath();
    // ctx.stroke();

    if (this.fill_options.fill) {
      ctx.globalAlpha = ctx.globalAlpha * this.fill_options.fill_alpha;
      ctx.fill();
      ctx.globalAlpha = ctx.globalAlpha / this.fill_options.fill_alpha;
    }
  }
}

// A spherical heatmap. Receptacle of values from SphericalDrawable.
class SphereHeatMap extends ThreeDMObjectGroup {
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
          new Polygon3D([
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
    return this.get_mobj(`p_${theta}_${phi}`) as Polygon3D;
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

// Spherical coordinates to cartesian
function spherical_to_cartesian(
  radius: number,
  theta_rad: number,
  phi_rad: number,
): Vec3D {
  return [
    radius * Math.sin(theta_rad) * Math.cos(phi_rad),
    radius * Math.sin(theta_rad) * Math.sin(phi_rad),
    radius * Math.cos(theta_rad),
  ];
}

// A heat equation simulation on the surface of a sphere where each pole is
// held at a different, constant temperature.
class HeatSimPoles extends HeatSimSpherical {
  n_pole_temp: number = 20;
  s_pole_temp: number = -20;
  // Heat/cold sources are modeled locally using a normal distribution, to avoid sharp edges
  bump_std: number = 0.05;
  bump_vals: number[] = [];
  constructor(num_theta: number, num_phi: number, dt: number) {
    super(num_theta, num_phi, dt);
    this._make_bump_vals();
  }
  _make_bump_vals(): void {
    let i = 0;
    let bump_val = gaussian_normal_pdf(
      0,
      this.bump_std,
      (i * Math.PI) / this.num_theta,
    );
    this.bump_vals = [];
    while (bump_val > 0.2) {
      this.bump_vals.push(bump_val);
      i++;
      bump_val = gaussian_normal_pdf(
        0,
        this.bump_std,
        (i * Math.PI) / this.num_theta,
      );
    }
  }
  set_n_pole_temp(temp: number): void {
    this.n_pole_temp = temp;
  }
  set_s_pole_temp(temp: number): void {
    this.s_pole_temp = temp;
  }
  set_boundary_conditions(s: Array<number>, t: number): void {
    for (let phi = 0; phi < this.num_phi; phi++) {
      for (let j = 0; j < this.bump_vals.length; j++) {
        let bump_val = this.bump_vals[j] as number;
        s[this.index(j, phi)] = this.n_pole_temp * bump_val;
        s[this.index(this.num_theta - j, phi)] = this.s_pole_temp * bump_val;
      }
    }
  }
}

// A heat equation simulation on the surface of a sphere which is initialized
// with value 1 at the north pole and 0 elsewhere, and then allowed to evolve
// without any heat sources or sinks. Simulates decoherence of a qubit.
//
// TODO This sharp peak causes a singularity in the simulation. So this should instead be simulated
// as a decay in the coefficients of the spherical harmonics.
class HeatSimSphericalDecoherence extends HeatSimSpherical {
  reset() {
    super.reset();
    let init_vals = this._spherical_state.new_arr();
    for (let phi = 0; phi < this.num_phi; phi++) {
      init_vals[this.index(0, phi)] = 1.0;
    }
    this.set_init_conditions(init_vals);
  }
}

// A heat equation simulator on the sphere which assumes a function that's
// independent of phi and stores its decomposition into spherical harmonics.
class SphericalFunctionSimulator extends Simulator {
  num_theta: number;
  num_phi: number;
  heat_propagation_speed: number = 1.0; // Speed of heat propagation
  sph_fun: SphericalFunctionZeroOrder;
  max_degree: number = 50;
  constructor(num_theta: number, num_phi: number, dt: number) {
    super(dt);
    this.num_theta = num_theta;
    this.num_phi = num_phi;
    this.sph_fun = new SphericalFunctionZeroOrder();
    this._init();
  }
  // Set initial values to mimic the delta function
  _init() {
    // Pre-compute the legendre polynomials, and use them to efficiently compute during step process.
    this.sph_fun.clear();
    this.sph_fun._precompute_legendrePolynomials(this.max_degree);

    // As computed, the coefficients below have sum of squares equal to (d+1)^2 / 4π, so we normalize this.
    // const normalization = (this.max_degree + 1) / Math.sqrt(4 * Math.PI);
    for (let l = 0; l <= this.max_degree; l++) {
      this.sph_fun.set_coefficient(
        l,
        this.sph_fun._eval_spherical_harmonic(l, 0),
      );
    }
  }
  set_heat_propagation_speed(speed: number) {
    this.heat_propagation_speed = speed;
  }
  reset() {
    super.reset();
    this._init();
  }
  // Decay according to the heat equation
  step() {
    super.step();
    this.sph_fun.evolve_heat_eq(this.heat_propagation_speed * this.dt);
  }
  get_drawable(): number[] {
    return this.sph_fun.get_drawable(this.num_theta, this.num_phi);
  }
}
// A 3D scene containing a sphere which updates colors from the simulator
class SphereHeatMapScene extends ThreeDSceneFromSimulator {
  constructor(
    canvas: HTMLCanvasElement,
    radius: number,
    num_theta: number,
    num_phi: number,
  ) {
    super(canvas);
    // Add a sphere.
    let sphere = new SphereHeatMap(radius, num_theta, num_phi);
    this.add("sphere", sphere);
  }
  set_colormap(colormap: ColorMap) {
    let sphere = this.get_mobj("sphere") as SphereHeatMap;
    sphere.set_colormap(colormap);
  }
  // Load new colors from the simulator
  update_mobjects_from_simulator(
    simulator: HeatSimSpherical | SphericalFunctionSimulator,
  ) {
    // This array has shape (num_theta, num_phi).
    let vals = simulator.get_drawable();
    let sphere = this.get_mobj("sphere") as SphereHeatMap;
    sphere.load_colors_from_array(vals);
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // A heatmap scene in 2D
    (function heatsim_2d(width: number, height: number) {
      const name = "heatsim-2d";
      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Create ImageData object
      const imageData = ctx.createImageData(width, height);

      let dt = 0.01;

      class Sim extends HeatSimTwoDim {
        center_temperature: number = 10;
        boundary_temperature: number = 0;
        set_center_temperature(temp: number): void {
          this.center_temperature = temp;
        }
        set_boundary_temperature(temp: number): void {
          this.boundary_temperature = temp;
        }
        set_boundary_conditions(s: Array<number>, t: number): void {
          // Puts a source in the middle
          let [center_x, center_y] = [
            Math.floor(this.width / 2),
            Math.floor(this.height / 2),
          ];
          for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
              s[this.index(center_x + i, center_y + j)] =
                this.center_temperature;
            }
          }

          // Cools the outside
          for (let x = 0; x < this.width; x++) {
            s[this.index(x, 0)] = this.boundary_temperature;
            s[this.index(x, this.height - 1)] = this.boundary_temperature;
          }
          for (let y = 0; y < this.height; y++) {
            s[this.index(0, y)] = this.boundary_temperature;
            s[this.index(this.width - 1, y)] = this.boundary_temperature;
          }
        }
      }
      let sim = new Sim(width, height, dt);
      sim.set_heat_propagation_speed(20);
      let handler = new InteractiveHandler(sim);

      class S extends SceneFromSimulator {
        imageData: ImageData;
        width: number;
        height: number;
        constructor(
          canvas: HTMLCanvasElement,
          width: number,
          height: number,
          imageData: ImageData,
        ) {
          super(canvas);
          this.width = width;
          this.height = height;
          this.imageData = imageData;
          let heatmap = new HeatMap(
            width,
            height,
            -100,
            100,
            new Array(width * height).fill(0),
          );
          this.add("heatmap", heatmap);
        }
        update_mobjects_from_simulator(simulator: HeatSimTwoDim) {
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

      let scene = new S(canvas, width, height, imageData);
      handler.add_scene(scene);
      handler.draw();

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
        },
      );
      clearButton.textContent = "Clear";

      // Sliders which control center and boundary temperature
      let c_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_center_temperature(Number(t));
          });
        },
        {
          name: "Center temperature",
          initial_value: "10",
          min: -10,
          max: 10,
          step: 0.05,
        },
      );
      let b_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_boundary_temperature(Number(t));
          });
        },
        {
          name: "Boundary temperature",
          initial_value: "0",
          min: -10,
          max: 10,
          step: 0.05,
        },
      );

      handler.play(undefined);
    })(300, 300);

    // A heatmap scene in 3D on the surface of a sphere
    (function heatsim_sphere(width: number, height: number) {
      const name = "heatsim-sphere";
      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Set parameters
      let num_theta = 50;
      let num_phi = 100;

      // Make a simulator
      let dt = 0.001;
      let sim = new HeatSimPoles(num_theta, num_phi, dt);

      // let sim = new SphericalFunctionSimulator(num_theta, num_phi, dt);
      // Initial steps to warm up the simulation
      // for (let i = 0; i < 0; i++) {
      //   sim.step();
      // }

      // let sim = new HeatSimSphericalDecoherence(num_theta, num_phi, dt);
      // sim.reset();

      // Make a handler to link the simulator to the sphere object
      let handler = new InteractiveHandler(sim);

      // Prepare the scene
      let radius = 1;
      let zoom_ratio = 1.0;
      let scene = new SphereHeatMapScene(canvas, radius, num_theta, num_phi);
      scene.set_colormap(grayscale_colormap);
      scene.set_frame_lims([-2, 2], [-2, 2]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");

      // Move the camera
      scene.camera.move_to([0, 0, -2]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3,
      );

      // Add an arcball for interactivity
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      // Add axes
      let [xmin, xmax] = [-2, 2];
      let [ymin, ymax] = [-2, 2];
      let [zmin, zmax] = [-2, 2];
      let axes = new CoordinateAxes3d([xmin, xmax], [ymin, ymax], [zmin, zmax]);
      axes.set_tick_size(0.1);
      axes.set_alpha(0.5);
      axes.set_axis_stroke_width(0.01);
      scene.add("axes", axes);

      // Add the scene to the handler
      handler.add_scene(scene);

      // Button which pauses/unpauses the simulation
      let pauseButton = handler.add_pause_button(
        document.getElementById(name + "-button-1") as HTMLElement,
      );

      // Button which clears the scene
      let clearButton = Button(
        document.getElementById(name + "-button-2") as HTMLElement,
        function () {
          handler.add_to_queue(sim.reset.bind(sim));
          handler.add_to_queue(handler.draw.bind(handler));
        },
      );
      clearButton.textContent = "Clear";

      // Sliders which control north and south temperature
      let n_slider = Slider(
        document.getElementById(name + "-slider-1") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_n_pole_temp(Number(t));
          });
        },
        {
          name: "North pole temperature",
          initial_value: "20",
          min: -50,
          max: 50,
          step: 0.05,
        },
      );
      let s_slider = Slider(
        document.getElementById(name + "-slider-2") as HTMLElement,
        function (t: number) {
          handler.add_to_queue(() => {
            sim.set_s_pole_temp(Number(t));
          });
        },
        {
          name: "South pole temperature",
          initial_value: "-20",
          min: -50,
          max: 50,
          step: 0.05,
        },
      );

      // Run the simulation
      handler.draw();
      handler.play(undefined);
    })(300, 300);

    (async function random_walk_sphere(width: number, height: number) {
      const name = "random-walk-sphere";
      let canvas = prepare_canvas(width, height, name);

      // Get the context for drawing
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // Prepare the scene
      let zoom_ratio = 1.0;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-2, 2], [-2, 2]);
      scene.set_zoom(zoom_ratio);
      scene.set_view_mode("orthographic");

      // Move the camera
      scene.camera.move_to([0, 0, -8]);
      scene.camera.rot_pos_and_view_z(Math.PI / 4);
      scene.camera.rot_pos_and_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        Math.PI / 3,
      );

      // Add axes
      let [xmin, xmax] = [-2, 2];
      let [ymin, ymax] = [-2, 2];
      let [zmin, zmax] = [-2, 2];
      let axes = new CoordinateAxes3d([xmin, xmax], [ymin, ymax], [zmin, zmax]);
      axes.set_tick_size(0.1);
      axes.set_alpha(0.5);
      axes.set_axis_stroke_width(0.01);
      scene.add("axes", axes);

      // Make a point
      let radius = 1;
      let point: Vec3D = [0, 0, radius];
      scene.add("point", new Dot3D(point, 0.01).set_color("red"));

      // Make arcball
      let arcball = new Arcball(scene);
      arcball.set_mode("Rotate");
      arcball.add();

      scene.draw();

      // Run simulation
      let dtheta = 0.01;
      let dt = 0.001;
      let axis: Vec3D;

      for (let t = 0; t < 10; t += dt) {
        // Pick a random axis
        // NOTE: This is not totally random: it skews towards the diagonals. Fix this.
        axis = vec3_normalize([
          2 * Math.random() - 1,
          2 * Math.random() - 1,
          2 * Math.random() - 1,
        ]);

        // Rotate the point around the random axis
        point = rot(point, axis, dtheta);
        (scene.get_mobj("point") as Dot3D).move_to(point);

        // Rotate the scene view
        scene.camera.rot_pos_and_view_z((dt * Math.PI) / 10);
        scene.draw();
        await delay(1);
      }
    })(300, 300);
  });
})();
