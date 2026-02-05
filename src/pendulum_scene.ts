import { Scene } from "./lib/base.js";
import { Slider } from "./lib/interactive.js";
import { Dot, Line } from "./lib/base_geom.js";

// A pendulum
const GRAV_CONSTANT = 1.0;
class PendulumScene extends Scene {
  top: [number, number]; // Top suspension point of the pendulum string
  length: number; // Length of the pendulum string
  state: [number, number]; // Displacement from equilibrium and linear velocity, measured by arc-length
  constructor(
    canvas: HTMLCanvasElement,
    length: number,
    top: [number, number],
    stroke_width: number,
    radius: number,
  ) {
    super(canvas);
    this.length = length;
    this.top = top;
    // TODO Width is 1.0, but make it modifiable
    let string = new Line(top, [top[0], top[1] - length], {});
    string.set_stroke_width(stroke_width);
    this.add("string", string);

    // TODO Radius is 0.3, but make it modifiable
    this.add("bob", new Dot([top[0], top[1] - length], { radius: radius }));

    // Position and velocity
    this.state = [0.0, 0.0];
  }
  // Set the arc-length position. Used by the scene evolution engine and by user input.
  set_position(s: number) {
    this.state[0] = s;

    // Get the xy coordinates of the new position
    let theta = s / this.length;
    let sx = this.top[0] - this.length * Math.sin(theta);
    let sy = this.top[1] - this.length * Math.cos(theta);

    // Set the string
    let string = this.get_mobj("string") as Line;
    string.move_end([sx, sy]);

    // Set the bob
    let bob = this.get_mobj("bob") as Dot;
    bob.move_to([sx, sy]);
  }
  get_position(): number {
    return this.state[0];
  }
  // Set the linear velocity. Used by the scene evolution engine.
  set_velocity(v: number) {
    this.state[1] = v;
  }
  get_velocity(): number {
    return this.state[1];
  }
  // Set the total energy by increasing/decreasing the velocity
  set_max_angle(t: number) {
    this.set_energy(GRAV_CONSTANT * this.length * (1 - Math.cos(t)));
  }
  // Set the total energy by increasing/decreasing the velocity
  set_energy(e: number) {
    let pe =
      GRAV_CONSTANT * this.length * (1 - Math.cos(this.state[0] / this.length));
    this.set_velocity(Math.sqrt(2 * (e - pe)) * Math.sign(this.state[1]));
  }
  get_energy(): number {
    let pe =
      GRAV_CONSTANT * this.length * (1 - Math.cos(this.state[0] / this.length));
    let ke = 0.5 * this.state[1] ** 2;
    return pe + ke;
  }
  // Change the length of the string without changing the pendulum angular position or
  // max angle. Used by user input
  set_length(new_length: number) {
    let e = this.get_energy();
    let old_length = this.length;
    this.length = new_length;
    this.set_position((this.state[0] * new_length) / old_length);
    this.set_energy((e * new_length) / old_length);
    // this.set_velocity((this.state[1] * new_length) / old_length);
  }
  // x'' in terms of x
  d2x(x: number): number {
    return -GRAV_CONSTANT * Math.sin(x / this.length);
  }
  // Evolves the simulation forward by time dt
  step(dt: number) {
    let k1: [number, number] = [this.state[1], this.d2x(this.state[0])];
    let k2: [number, number] = [
      this.state[1] + (k1[1] * dt) / 2,
      this.d2x(this.state[0] + (k1[0] * dt) / 2),
    ];
    let k3: [number, number] = [
      this.state[1] + (k2[1] * dt) / 2,
      this.d2x(this.state[0] + (k2[0] * dt) / 2),
    ];
    let k4: [number, number] = [
      this.state[1] + k3[1] * dt,
      this.d2x(this.state[0] + k3[0] * dt),
    ];
    this.set_position(
      this.state[0] + ((k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt) / 6,
    );
    this.set_velocity(
      this.state[1] + ((k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt) / 6,
    );
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
    let length = 6.0;
    let top: [number, number] = [0.0, 4.0];
    let scene = new PendulumScene(canvas, length, top, 0.05, 0.3);

    // Sets the initial parameters
    scene.set_position(1.0);
    scene.set_velocity(0.0);

    // Sets the coordinates for the scene
    let xlims: [number, number] = [-5.0, 5.0];
    let ylims: [number, number] = [-5.0, 5.0];
    scene.set_frame_lims(xlims, ylims);

    // Make a slider which can be used to modify the mobject
    // It should send a message to the owning scene
    let length_slider = Slider(
      document.getElementById("slider-length-container") as HTMLElement,
      function (l: number) {
        scene.set_length(l);
      },

      { initial_value: "6.0", min: 0.0, max: 8.0, step: 0.01 },
    );
    length_slider.width = 200;

    let angle_slider = Slider(
      document.getElementById("slider-energy-container") as HTMLElement,
      function (t: number) {
        scene.set_max_angle(t);
      },
      { initial_value: "0.2", min: 0.1, max: 1.5, step: 0.05 },
    );
    angle_slider.width = 200;

    // Start animations
    scene.draw();

    scene.start_playing();
  });
})();
