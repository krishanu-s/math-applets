// import * as np from "numpy-ts";
import { Slider } from "./lib/interactive";
import { SmoothOpenPathBezierHandleCalculator } from "./lib/bezier.js";
import {
  Scene,
  Dot,
  Line,
  Vec2D,
  vec2_norm,
  vec2_sum,
  vec2_sub,
  vec2_scale,
  vec2_rot,
  vec2_normalize,
  vec2_angle,
  vec2_sum_list,
} from "./lib/base";

// TODO Make a function F which, given vectors v1, v2, ..., vn,
// converts to a sequence w1, w2, ..., wn such that
// 1. The sum of the vectors is equal to v.
// 2. The length of each vector is equal to L/n.
// Do this by repeatedly projecting onto these two conditions.

// A pair of 2D vectors
type State2D = [[number, number], [number, number]];
function zero_state(): State2D {
  return [
    [0, 0],
    [0, 0],
  ];
}
function state_scale(x: State2D, factor: number): State2D {
  return [vec2_scale(x[0], factor), vec2_scale(x[1], factor)];
}

function state_sum(x: State2D, y: State2D): State2D {
  return [vec2_sum(x[0], y[0]), vec2_sum(x[1], y[1])];
}

let GRAVITATIONAL_CONSTANT = 1.0;

// Models a spring which exerts no force when compressed, but
// exerts a force when stretched, and experiences friction under all circumstances.
// Toy model for CatenaryScene.
class OneSidedSpringScene extends Scene {
  state: State2D; // Position and velocity of the mass
  length: number; // Equilibrium length of the spring
  spring_constant: number; // Spring constant
  friction_constant: number; // Friction constant
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.state = [
      [0.5, 0],
      [0, 0],
    ];
    this.length = 2.0;
    this.spring_constant = 1.0;
    this.friction_constant = 0.2;

    this.add("base", new Dot([0, 0], 0.2));
    this.add("mass", new Dot([0, 0], 0.2));
    let spring = new Line([0, 0], [0, 0]);
    spring.set_stroke_width(0.08);
    this.add("spring", spring);
  }
  set_position(x: Vec2D) {
    this.state[0] = x;
    let mass = this.get_mobj("mass") as Dot;
    mass.move_to(x);
    let spring = this.get_mobj("spring") as Line;
    spring.move_end(x);
  }
  get_position(): Vec2D {
    return this.state[0];
  }
  set_velocity(v: Vec2D) {
    this.state[1] = v;
  }
  get_velocity(): Vec2D {
    return this.state[1];
  }
  spring_term(state: State2D): Vec2D {
    let rel_pos = vec2_sub(state[0], [0, 0]);
    let disp = vec2_norm(rel_pos);
    return vec2_scale(
      rel_pos,
      (-this.spring_constant * Math.max(disp - this.length, 0)) / disp,
    );
  }
  friction_term(state: State2D): Vec2D {
    return vec2_scale(state[1], -this.friction_constant);
  }
  gravity_term(): Vec2D {
    return [0, GRAVITATIONAL_CONSTANT];
  }
  // |x''| = -k * max(|x| - length, 0) - c*|x'|
  d2x(state: State2D): Vec2D {
    let spring_term = this.spring_term(state);
    let friction_term = this.friction_term(state);
    let gravity_term = this.gravity_term();
    return vec2_sum_list([spring_term, friction_term, gravity_term]);
  }
  // Evolves the simulation forward by time dt
  step(dt: number) {
    let k1: State2D = [this.state[1], this.d2x(this.state)];
    let k2: State2D = [
      [
        this.state[1][0] + (k1[1][0] * dt) / 2,
        this.state[1][1] + (k1[1][1] * dt) / 2,
      ],
      this.d2x(state_sum(this.state, state_scale(k1, dt / 2))),
    ];
    let k3: State2D = [
      [
        this.state[1][0] + (k2[1][0] * dt) / 2,
        this.state[1][1] + (k2[1][1] * dt) / 2,
      ],
      this.d2x(state_sum(this.state, state_scale(k2, dt / 2))),
    ];
    let k4: State2D = [
      [this.state[1][0] + k3[1][0] * dt, this.state[1][1] + k3[1][1] * dt],
      this.d2x(state_sum(this.state, state_scale(k3, dt))),
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
    this.step(0.05);
    this.draw();
    window.requestAnimationFrame(this.start_playing.bind(this));
  }
}

// Models a string connecting two points P and Q as a sequence
// of point masses connected by friction-ful one-sided springs
class CatenaryScene extends Scene {
  p0: Vec2D;
  p1: Vec2D;
  state: Array<State2D>; // Shape (N + 1, 2, 2)
  length: number; // Total length
  num_segments: number;
  solver: SmoothOpenPathBezierHandleCalculator;
  smooth: boolean;
  spring_constant: number;
  friction_constant: number;
  gravity: number;
  dt: number;
  constructor(
    canvas: HTMLCanvasElement,
    p0: Vec2D,
    p1: Vec2D,
    length: number,
    num_segments: number,
  ) {
    super(canvas);
    this.p0 = p0;
    this.p1 = p1;
    this.length = length;

    this.num_segments = num_segments;
    this.solver = new SmoothOpenPathBezierHandleCalculator(num_segments);
    this.smooth = true;

    this.spring_constant = 1.0;
    this.friction_constant = 0.4;
    this.gravity = 1.0;
    this.dt = 0.1;

    // Set intermediate points, shape (N + 1, 2).
    this.state = [];
    for (let i = 0; i <= num_segments; i++) {
      this.state.push([
        [
          p0[0] + ((p1[0] - p0[0]) * i) / num_segments,
          p0[1] + ((p1[1] - p0[1]) * i) / num_segments,
        ],
        [0, 0],
      ]);
    }
    // Add objects
    // TODO: Make these invisible
    // for (let i = 0; i <= num_segments; i++) {
    //   this.add(
    //     `p${i}`,
    //     new Dot(this.get_position(i)[0], this.get_position(i)[1], 0.08),
    //   );
    // }

    // TODO: Use a sequence of BezierCurve objects instead
    // for (let i = 1; i <= num_segments; i++) {
    //   this.add(
    //     `v${i}`,
    //     new Line(this.get_position(i - 1), this.get_position(i), {
    //       stroke_width: 0.05,
    //     }),
    //   );
    // }
    // this.solver.get_bezier_handles(this.state)
    for (let i = 1; i <= num_segments; i++) {
      this.add(
        `v${i}`,
        new Line(this.get_position(i - 1), this.get_position(i)),
      );
    }
  }
  set_gravity(g: number) {
    this.gravity = g;
  }
  set_friction(c: number) {
    this.friction_constant = c;
  }
  set_spring(k: number) {
    this.spring_constant = k;
  }
  set_dt(dt: number) {
    this.dt = dt;
  }
  move_start(p: Vec2D) {
    this.p0 = p;
  }
  move_end(p: Vec2D) {
    this.p1 = p;
  }
  set_num_segments(n: number) {
    // TODO. This is done by constructing a piecewise-linear function from the current
    // state and then interpolating to generate a new state.
    this.num_segments = n;
    this.solver = new SmoothOpenPathBezierHandleCalculator(n);
  }
  get_state(index: number): State2D {
    return this.state[index] as State2D;
  }
  set_position(index: number, position: Vec2D) {
    let s = this.state[index] as State2D;
    s[0] = position;
    let p = this.get_mobj(`p${index}`) as Dot;
    p.move_to(position);
    if (index > 0) {
      let v = this.get_mobj(`v${index}`) as Line;
      v.move_end(position);
    }
    if (index < this.num_segments) {
      let v = this.get_mobj(`v${index + 1}`) as Line;
      v.move_start(position);
    }
  }
  get_position(index: number): Vec2D {
    return this._get_position(index, this.state);
  }
  _get_position(index: number, state: Array<State2D>): Vec2D {
    let s = state[index] as State2D;
    return s[0];
  }
  set_velocity(index: number, velocity: Vec2D) {
    let s = this.state[index] as State2D;
    s[1] = velocity;
  }
  get_velocity(index: number): Vec2D {
    return this._get_velocity(index, this.state);
  }
  _get_velocity(index: number, state: Array<State2D>): Vec2D {
    let s = state[index] as State2D;
    return s[1];
  }
  d2x(index: number, state: Array<State2D>): Vec2D {
    let rel_pos, disp;

    rel_pos = vec2_sub(
      (state[index] as State2D)[0],
      (state[index - 1] as State2D)[0],
    );
    disp = vec2_norm(rel_pos);
    let spring_term_1 = vec2_scale(
      rel_pos,
      (-this.spring_constant *
        Math.max(disp - this.length / this.num_segments, 0)) /
        disp,
    );

    rel_pos = vec2_sub(
      (state[index] as State2D)[0],
      (state[index + 1] as State2D)[0],
    );
    disp = vec2_norm(rel_pos);
    let spring_term_2 = vec2_scale(
      rel_pos,
      (-this.spring_constant *
        Math.max(disp - this.length / this.num_segments, 0)) /
        disp,
    );

    return vec2_sum_list([
      [0, -this.gravity / this.num_segments],
      vec2_scale(this._get_velocity(index, state), -this.friction_constant),
      spring_term_1,
      spring_term_2,
    ]);
  }
  // Evolves the simulation forward by time dt
  step(dt: number) {
    let k1: Array<State2D> = [];
    k1.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k1.push([this.get_velocity(i), this.d2x(i, this.state)]);
    }
    k1.push(zero_state());

    let p2: Array<State2D> = [];
    p2.push(this.get_state(0));
    for (let i = 1; i < this.num_segments; i++) {
      p2.push(
        state_sum(this.get_state(i), state_scale(k1[i] as State2D, dt / 2)),
      );
    }
    p2.push(this.get_state(this.num_segments));

    let k2: Array<State2D> = [];
    k2.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k2.push([this._get_velocity(i, p2), this.d2x(i, p2)]);
    }
    k2.push(zero_state());

    let p3: Array<State2D> = [];
    p3.push(this.get_state(0));
    for (let i = 1; i < this.num_segments; i++) {
      p3.push(
        state_sum(this.get_state(i), state_scale(k2[i] as State2D, dt / 2)),
      );
    }
    p3.push(this.get_state(this.num_segments));

    let k3: Array<State2D> = [];
    k3.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k3.push([this._get_velocity(i, p3), this.d2x(i, p3)]);
    }
    k3.push(zero_state());

    let p4: Array<State2D> = [];
    p4.push(this.get_state(0));
    for (let i = 1; i < this.num_segments; i++) {
      p4.push(state_sum(this.get_state(i), state_scale(k2[i] as State2D, dt)));
    }
    p4.push(this.get_state(this.num_segments));

    let k4: Array<State2D> = [];
    k4.push(zero_state());
    for (let i = 1; i < this.num_segments; i++) {
      k4.push([this._get_velocity(i, p4), this.d2x(i, p4)]);
    }
    k4.push(zero_state());

    for (let i = 1; i < this.num_segments; i++) {
      this.set_position(
        i,
        vec2_sum_list([
          this.get_position(i),
          vec2_scale(this._get_position(i, k1), dt / 6),
          vec2_scale(this._get_position(i, k2), dt / 3),
          vec2_scale(this._get_position(i, k3), dt / 3),
          vec2_scale(this._get_position(i, k4), dt / 6),
        ]),
      );
      this.set_velocity(
        i,
        vec2_sum_list([
          this.get_velocity(i),
          vec2_scale(this._get_velocity(i, k1), dt / 6),
          vec2_scale(this._get_velocity(i, k2), dt / 3),
          vec2_scale(this._get_velocity(i, k3), dt / 3),
          vec2_scale(this._get_velocity(i, k4), dt / 6),
        ]),
      );
    }
  }
  // Starts animation
  start_playing() {
    this.step(this.dt);
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

    // Define the catenary scene
    let p0: Vec2D = [-2, 2];
    let p1: Vec2D = [2, 3];
    let length = 6;
    let num_segments = 20;
    let scene = new CatenaryScene(canvas, p0, p1, length, num_segments);

    // Sets the initial parameters
    // scene.set_position([0.5, 0]);
    // scene.set_velocity([0, 0]);

    // Sets the coordinates for the scene
    let xlims: Vec2D = [-5.0, 5.0];
    let ylims: Vec2D = [-5.0, 5.0];
    scene.set_frame_lims(xlims, ylims);

    let spring_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (k: number) {
        scene.set_dt(0.5 / k ** 2);
        scene.set_spring(k ** 2);
      },
      { initial_value: "1.0", min: 0.1, max: 10.0, step: 0.01 },
    );
    spring_slider.width = 200;

    // TODO Make the two points in the scene movable
    // TODO Make the number of segments modifiable

    // Start animations
    scene.draw();

    scene.start_playing();
  });
})();
