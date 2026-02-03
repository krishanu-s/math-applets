import { Scene } from "./lib/base.js";
import { Dot } from "./lib/base_geom.js";
// An orbiting body
const GRAV_CONSTANT = 1.0;
class OrbitScene extends Scene {
  center: [number, number];

  state: [[number, number], [number, number]];

  constructor(canvas: HTMLCanvasElement, center: [number, number]) {
    super(canvas);

    this.center = center;
    this.add("center", new Dot(center, { radius: 0.2 }));

    this.add("orbiter", new Dot(center, { radius: 0.1 }));
    this.state = [center, [0, 0]];
  }
  // Set the position of the orbiter
  set_position(x: [number, number]) {
    this.state[0] = x;
    let orbiter = this.get_mobj("orbiter") as Dot;
    orbiter.move_to(x[0], x[1]);
  }
  get_position(): [number, number] {
    return this.state[0];
  }
  // Set the linear velocity. Used by the scene evolution engine.
  set_velocity(v: [number, number]) {
    this.state[1] = v;
  }
  get_velocity(): [number, number] {
    return this.state[1];
  }
  // [d2x/dt2, d2y/dt2] in terms of [x, y]
  d2x(pos: [number, number]): [number, number] {
    let r = Math.sqrt(
      (pos[0] - this.center[0]) ** 2 + (pos[1] - this.center[1]) ** 2,
    );
    return [
      (-GRAV_CONSTANT * (pos[0] - this.center[0])) / r ** 3,
      (-GRAV_CONSTANT * (pos[1] - this.center[1])) / r ** 3,
    ];
  }
  // Evolves the simulation forward by time dt
  step(dt: number) {
    let k1: [[number, number], [number, number]] = [
      this.state[1],
      this.d2x(this.state[0]),
    ];
    let k2: [[number, number], [number, number]] = [
      [
        this.state[1][0] + (k1[1][0] * dt) / 2,
        this.state[1][1] + (k1[1][1] * dt) / 2,
      ],
      this.d2x([
        this.state[0][0] + (k1[0][0] * dt) / 2,
        this.state[0][1] + (k1[0][1] * dt) / 2,
      ]),
    ];
    let k3: [[number, number], [number, number]] = [
      [
        this.state[1][0] + (k2[1][0] * dt) / 2,
        this.state[1][1] + (k2[1][1] * dt) / 2,
      ],
      this.d2x([
        this.state[0][0] + (k2[0][0] * dt) / 2,
        this.state[0][1] + (k2[0][1] * dt) / 2,
      ]),
    ];
    let k4: [[number, number], [number, number]] = [
      [this.state[1][0] + k3[1][0] * dt, this.state[1][1] + k3[1][1] * dt],
      this.d2x([
        this.state[0][0] + k3[0][0] * dt,
        this.state[0][1] + k3[0][1] * dt,
      ]),
    ];
    this.set_position([
      this.state[0][0] +
        ((k1[0][0] + 2 * k2[0][0] + 2 * k3[0][0] + k4[0][0]) * dt) / 6,
      this.state[0][1] +
        ((k1[0][1] + 2 * k2[0][1] + 2 * k3[0][1] + k4[0][1]) * dt) / 6,
    ]);
    this.set_velocity([
      this.state[1][0] +
        ((k1[1][0] + 2 * k2[1][0] + 2 * k3[1][0] + k4[1][0]) * dt) / 6,
      this.state[1][1] +
        ((k1[1][1] + 2 * k2[1][1] + 2 * k3[1][1] + k4[1][1]) * dt) / 6,
    ]);
  }
  // Starts animation
  start_playing() {
    // TODO First check if any MObjects have been modified and need to be
    // redrawn before advancing
    this.step(0.05);
    this.draw();
    window.requestAnimationFrame(this.start_playing.bind(this));
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    function prepare_canvas(
      width: number,
      height: number,
      name: string,
    ): HTMLCanvasElement {
      const container = document.getElementById(name);
      if (container == null) throw new Error(`${name} not found`);

      // Set size to 300 pixels by 300 pixels
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;

      // Make a visual element
      let wrapper = document.createElement("div");
      wrapper.classList.add("canvas_container");
      wrapper.classList.add("non_selectable");
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;

      let canvas = document.createElement("canvas");
      canvas.classList.add("non_selectable");
      canvas.style.position = "relative";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.height = height;
      canvas.width = width;

      wrapper.appendChild(canvas);
      container.appendChild(wrapper);

      console.log("Canvas made");

      return canvas;
    }

    // Prepare the canvas and scene
    let width = 300;
    let height = 300;
    let canvas = prepare_canvas(width, height, "scene-container");

    // Define the pendulum scene
    let scene = new OrbitScene(canvas, [0.0, 0.0]);

    // Sets the initial parameters
    scene.set_position([1.0, 0.0]);
    scene.set_velocity([0.0, 1.2]);

    // Sets the coordinates for the scene
    let xlims: [number, number] = [-5.0, 5.0];
    let ylims: [number, number] = [-5.0, 5.0];
    scene.set_frame_lims(xlims, ylims);

    // TODO Modify the trajectory directly

    // // Make a slider which can be used to modify the mobject
    // // It should send a message to the owning scene
    // let length_slider = Slider(
    //   document.getElementById("slider-length-container") as HTMLElement,
    //   function (l: number) {
    //     scene.set_length(l);
    //   },
    //   "6.0",
    // );
    // length_slider.min = "0.0";
    // length_slider.max = "8.0";
    // length_slider.width = 200;

    // let angle_slider = Slider(
    //   document.getElementById("slider-energy-container") as HTMLElement,
    //   function (t: number) {
    //     scene.set_max_angle(t);
    //   },
    //   "0.2",
    // );
    // angle_slider.min = "0.0";
    // angle_slider.max = "1.5";
    // angle_slider.width = 200;

    // Start animations
    scene.draw();

    scene.start_playing();
  });
})();
