import { MObject, Scene, Dot, Line, prepare_canvas } from "./base.js";
import { Slider, Button } from "./interactive.js";
import { Vec2D, clamp, sigmoid } from "./base.js";
import { ParametricFunction } from "./parametric.js";
import { HeatMap } from "./heatmap.js";

// The state S of a generic dynamical system evolving under a differential equation.
// The underlying state contains the logic for calculating time derivatives
// via laplacians of arrays and so forth. Wave equation formulas will be here,
// for example. In the case of reflective surfaces, masks will be here too
// and the Simulator has to pass the message downward.
class State {
  state_size: number; // Literal size of the array of values.
  vals: Array<number>; // Array of values
  constructor(state_size: number) {
    this.state_size = state_size;
    this.vals = new Array(this.state_size).fill(0);
  }
  // Time-derivative of the current state. Overwritten in subclasses.
  dot(s: Array<number>): Array<number> {
    return new Array(this.state_size).fill(0);
  }
  get_values(): Array<number> {
    return this.vals;
  }
  set_values(vals: Array<number>) {
    this.vals = vals;
  }
}

class WaveSimStateOneDim extends State {}
class WaveSimStateTwoDim extends State {}
class WaveSimStateTwoDimPML extends State {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    super(width * height);
    this.width = width;
    this.height = height;
  }
  // PML parameters
  sigma_x(arr_x: number): number {
    let l = Math.abs(arr_x / (this.width / 2) - 1);
    if (l > 0.8) {
      return 5.0 * l ** 2;
    } else {
      return 0;
    }
  }
  sigma_y(arr_y: number): number {
    let l = Math.abs(arr_y / (this.height / 2) - 1);
    if (l > 0.8) {
      return 5.0 * l ** 2;
    } else {
      return 0;
    }
  }
  // Used in conjunction with the masks, which have to be calculated
  d_x_plus(arr: Array<number>, x: number, y: number, a_plus: number) {}
  d_x_minus(arr: Array<number>, x: number, y: number, a_minus: number) {}
  d_y_plus(arr: Array<number>, x: number, y: number, a_plus: number) {}
  d_y_minus(arr: Array<number>, x: number, y: number, a_minus: number) {}
  // Used for generating entries of the spacelike derivative of an array
  d_x_entry(arr: Array<number>, x: number, y: number) {}
  d_y_entry(arr: Array<number>, x: number, y: number) {}
  l_x_entry(arr: Array<number>, x: number, y: number) {}
  l_y_entry(arr: Array<number>, x: number, y: number) {}
  // Calculate the timelike derivative
  dot(arr: Array<number>): Array<number> {}
}

// The simulator has attributes which are modified by the user via
// interactive elements, and is responsible for stepping the differential
// equation forward. For example, it has access to the boundary conditions,
// to masks and so forth.
class Simulator {
  state: State; // Underlying state array
  time: number; // Timestamp in the worldline of the simulator
  dt: number; // Length of time in each simulation step
  constructor(state: State, dt: number) {
    this.state = state;
    this.time = 0;
    this.dt = dt;
  }
  // TODO General method for setting a named attribute.
  set_attr() {}
  add_boundary_conditions(s: Array<number>, t: number): void {}
  step() {
    return this.step_rk();
  }
  step_finite_diff() {
    let newS = new Array(this.state.state_size).fill(0);
    let dS = this.state.dot(this.state.vals);
    for (let i = 0; i < this.state.state_size; i++) {
      newS[i] = (this.state.vals[i] as number) + this.dt * (dS[i] as number);
    }
    this.add_boundary_conditions(newS, this.time);
    this.state.set_values(newS);
  }
  // Step the differential equation forward using Runge-Kutta
  step_rk() {
    let newS = new Array(this.state.state_size).fill(0);

    let dS_1 = this.state.dot(this.state.vals);
    for (let i = 0; i < this.state.state_size; i++) {
      newS[i] =
        (this.state.vals[i] as number) + (this.dt / 2) * (dS_1[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_2 = this.state.dot(newS);
    for (let i = 0; i < this.state.state_size; i++) {
      newS[i] =
        (this.state.vals[i] as number) + (this.dt / 2) * (dS_2[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt / 2);

    let dS_3 = this.state.dot(newS);
    for (let i = 0; i < this.state.state_size; i++) {
      newS[i] = (this.state.vals[i] as number) + this.dt * (dS_3[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);

    let dS_4 = this.state.dot(newS);
    for (let i = 0; i < this.state.state_size; i++) {
      newS[i] =
        (this.state.vals[i] as number) +
        (this.dt / 6) * (dS_1[i] as number) +
        (this.dt / 3) * (dS_2[i] as number) +
        (this.dt / 3) * (dS_3[i] as number) +
        (this.dt / 6) * (dS_4[i] as number);
    }
    this.add_boundary_conditions(newS, this.time + this.dt);
    this.state.set_values(newS);
    this.time += this.dt;
  }
}

// The scene contains the simulator and handles both the interface
// to user input and the interface to the rendering engine.
class InteractivePlayingScene extends Scene {
  simulator: Simulator;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  constructor(canvas: HTMLCanvasElement, simulator: Simulator) {
    super(canvas);
    this.simulator = simulator;
    this.action_queue = [];
    this.paused = true;
  }
  toggle_pause() {
    this.paused = !this.paused;
    this.play(undefined); // Restart playing if this was paused TODO Get around this hack.
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback: () => void): void {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Starts animation
  play(until: number | undefined) {
    if (this.paused) {
      return;
    } else if (this.action_queue.length > 0) {
      let callback = this.action_queue.shift() as () => void;
      callback();
    } else if (this.simulator.time > (until as number)) {
      return;
    } else {
      this.simulator.step();
      this.draw();
    }
    window.requestAnimationFrame(this.play.bind(this, until));
  }
}
class WaveEquationScene1DSprings extends InteractivePlayingScene {
  // TODO Includes access to a canvas, and point masses / springs to draw
}
class WaveEquationScene2DSprings extends InteractivePlayingScene {
  // TODO Includes access to a canvas, and point masses / springs to draw
}
class WaveEquationScene2DHeatMap extends InteractivePlayingScene {
  // TODO Includes access to a canvas, and a heatmap mobjects to draw.
}

// The "state" for a wave equation simulation on a bounded domain consists of a pair
// $(\vec{u}, \vec{v})$ of array-valued functions, where $\vec{u}$ describes the wave
// surface position and $\vec{v}$ describes its velocity.
// To allow for the addition of damping layers which absorb waves, in 2 dimensions we
// would use a quadruple $(\vec{u}, \vec{v}, \vec{p}_x, \vec{p}_y)$.

// The state S of a generic dynamical system evolving under a differential equation.
// class State {
//   state_size: number;
//   vals: Array<number>;
//   time: number;
//   constructor(state_size: number) {
//     this.state_size = state_size;
//     this.vals = new Array(this.state_size).fill(0);
//     this.time = 0;
//   }
//   // Time-derivative of the current state. Overwritten in subclasses.
//   dot_entry(arr: Array<number>, i: number): number {
//     return 0;
//   }
//   dot(s: Array<number>): Array<number> {
//     let dS = new Array(this.state_size);
//     for (let i = 0; i < this.state_size; i++) {
//       dS[i] = this.dot_entry(s, i);
//     }
//     return dS;
//   }
//   // Adding any boundary conditions which override the differential equation
//   add_boundary_conditions(arr: Array<number>, t: number): void {}
//   // Step the differential equation forward
//   step(dt: number) {
//     return this.step_rk(dt);
//   }
//   // Step the differential equation forward using finite difference method
//   step_finite_diff(dt: number) {
//     let newS = new Array(this.state_size);
//     let dS = this.dot(this.vals);
//     for (let i = 0; i < this.state_size; i++) {
//       newS[i] = (this.vals[i] as number) + (dS[i] as number);
//     }
//     this.add_boundary_conditions(newS, this.time);
//     return newS;
//   }
//   // Step the differential equation forward using Runge-Kutta
//   step_rk(dt: number) {
//     let newS = new Array(this.state_size);
//     let v;

//     let dS_1 = this.dot(this.vals);
//     for (let i = 0; i < this.state_size; i++) {
//       newS[i] = (this.vals[i] as number) + (dt / 2) * (dS_1[i] as number);
//     }
//     this.add_boundary_conditions(newS, this.time + dt / 2);

//     let dS_2 = this.dot(newS);
//     for (let i = 0; i < this.state_size; i++) {
//       newS[i] = (this.vals[i] as number) + (dt / 2) * (dS_2[i] as number);
//     }
//     this.add_boundary_conditions(newS, this.time + dt / 2);

//     let dS_3 = this.dot(newS);
//     for (let i = 0; i < this.state_size; i++) {
//       newS[i] = (this.vals[i] as number) + dt * (dS_3[i] as number);
//     }
//     this.add_boundary_conditions(newS, this.time + dt);

//     let dS_4 = this.dot(newS);
//     for (let i = 0; i < this.state_size; i++) {
//       newS[i] =
//         (this.vals[i] as number) +
//         (dt / 6) * (dS_1[i] as number) +
//         (dt / 3) * (dS_2[i] as number) +
//         (dt / 3) * (dS_3[i] as number) +
//         (dt / 6) * (dS_4[i] as number);
//     }
//     this.add_boundary_conditions(newS, this.time + dt);
//     this.time += dt;
//     return newS;
//   }
// }

// One-dimensional wave equation simulator, with zeros (bounds) at the ends
class WaveSimStateOneDim extends State {
  wave_propagation_speed: number; // Optional spatial scaling
  constructor(width: number) {
    super(2 * width);
    this.wave_propagation_speed = 1;
  }
  set_wave_propagation_speed(w: number) {
    this.wave_propagation_speed = w;
  }
  width(): number {
    return this.state_size / 2;
  }
  get_uValues(): Array<number> {
    return this.vals.slice(0, this.width());
  }
  set_uValues(arr: Array<number>) {
    for (let i = 0; i < this.width(); i++) {
      this.vals[i] = arr[i] as number;
    }
  }
  get_vValues(): Array<number> {
    return this.vals.slice(this.width(), 2 * this.width());
  }
  set_vValues(arr: Array<number>) {
    for (let i = 0; i < this.width(); i++) {
      this.vals[i + this.width()] = arr[i] as number;
    }
  }
  // Entry of the Laplacian.
  laplacian_entry(arr: Array<number>, i: number): number {
    if (i == 0) {
      return (
        2 * (arr[0] as number) -
        5 * (arr[1] as number) +
        4 * (arr[2] as number) -
        (arr[3] as number)
      );
    } else if (i == this.width() - 1) {
      return (
        2 * (arr[this.width() - 1] as number) -
        5 * (arr[this.width() - 2] as number) +
        4 * (arr[this.width() - 3] as number) -
        (arr[this.width() - 4] as number)
      );
    } else {
      return (
        (arr[i + 1] as number) - 2 * (arr[i] as number) + (arr[i - 1] as number)
      );
    }
  }
  // (u, u') -> (u', (c**2) * L(u))
  dot(arr: Array<number>): Array<number> {
    let dS = new Array(this.state_size);
    for (let i = 0; i < this.width(); i++) {
      dS[i] = arr[i + this.width()];
      dS[i + this.width()] =
        this.wave_propagation_speed ** 2 * this.laplacian_entry(arr, i);
    }
    return dS;
  }
}

// Dynamic scene which includes drawer
class InteractiveSimulationScene extends Scene {
  state: State;
  dt: number;
  action_queue: Array<CallableFunction>;
  paused: boolean;
  constructor(canvas: HTMLCanvasElement, state: State, dt: number) {
    super(canvas);
    this.action_queue = [];
    this.paused = true;
    this.state = state;
    this.dt = dt;
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback: () => void): void {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Pauses or unpauses the simulation
  toggle_pause() {
    this.paused = !this.paused;
    this.play(undefined); // Restart playing if this was paused TODO Get around this hack.
  }
  // Starts animation, checking for interactions from the user as needed
  play(until: number | undefined) {
    if (this.paused) {
      return;
    } else if (this.action_queue.length > 0) {
      let callback = this.action_queue.shift() as () => void;
      callback();
    } else if (this.state.time > (until as number)) {
      return;
    } else {
      this.state.step(this.dt);
      this.draw();
    }
    window.requestAnimationFrame(this.play.bind(this, until));
  }
}

// Test: 1D wave equation
class WaveSimSceneOneDim extends InteractiveSimulationScene {
  constructor(canvas: HTMLCanvasElement, width: number, dt: number) {
    super(canvas, new WaveSimStateOneDim(width), dt);

    // Add mobjects to draw, with coordinates
    let xi, yi;
    for (let i = 0; i < width; i++) {
      [xi, yi] = this.dot_center(i);
      this.add(`p${i}`, new Dot(xi, yi, 0.05));
    }
  }
  dot_center(i: number): Vec2D {
    return [
      this.xlims[0] +
        ((i + 0.5) / (this.state as WaveSimStateOneDim).width()) *
          (this.xlims[1] - this.xlims[0]),
      this.ylims[0] +
        ((i + 0.5) / (this.state as WaveSimStateOneDim).width()) *
          (this.ylims[1] - this.ylims[0]),
    ];
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    const xmin = -5;
    const xmax = 5;
    const ymin = -5;
    const ymax = 5;
    const clamp_value = 30;

    // Prepare the canvas and scene
    let width = 200;
    let height = 200;
    // const dx = (xmax - xmin) / width;
    // const dy = (ymax - ymin) / height;
    const num_pts = 20;
    const dt = 0.03;

    let canvas = prepare_canvas(width, height, "scene-container");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Create ImageData object
    // const imageData = ctx.createImageData(width, height);

    let waveEquationScene = new WaveSimSceneOneDim(canvas, num_pts, dt);

    waveEquationScene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    // waveEquationScene.set_pml_strength(5.0);
    // waveEquationScene.set_pml_width(1.0);

    // // Slider which controls the eccentricity: specific to ellipse
    // let eccentricity_slider = Slider(
    //   document.getElementById("slider-container-1") as HTMLElement,
    //   function (e: number) {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.set_semiminor_axis.bind(
    //         waveEquationScene,
    //         Math.sqrt(1 - (+e) ** 2) * waveEquationScene.semimajor_axis,
    //       ),
    //     );
    //   },
    //   `0.5`,
    //   0,
    //   1,
    //   0.01,
    // );
    // eccentricity_slider.width = 200;

    // // Slider which controls the wave frequency
    // let frequency_slider = Slider(
    //   document.getElementById("slider-container-1") as HTMLElement,
    //   function (w: number) {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.set_frequency.bind(waveEquationScene, +w),
    //     );
    //   },
    //   `5.0`,
    //   1.0,
    //   10.0,
    //   0.01,
    // );
    // frequency_slider.width = 200;

    // Button which pauses/unpauses the simulation
    let pauseButton = Button(
      document.getElementById("button-container-1") as HTMLElement,
      function () {
        waveEquationScene.add_to_queue(
          waveEquationScene.toggle_pause.bind(waveEquationScene),
        );
        // TODO Make text change state on button press, not check simulator
        pauseButton.textContent = waveEquationScene.paused
          ? "Pause simulation"
          : "Unpause simulation";
      },
    );
    pauseButton.textContent = "Pause simulation";
    pauseButton.style.padding = "15px";

    // // Button which turns the point source on or off.
    // let pointSourceButton = Button(
    //   document.getElementById("button-container-2") as HTMLElement,
    //   function () {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.toggle_point_source.bind(waveEquationScene),
    //     );
    //     // TODO Make text change state on button press, not check simulator
    //     pointSourceButton.textContent = waveEquationScene.point_source_on
    //       ? "Turn on source"
    //       : "Turn off source";
    //   },
    // );
    // pointSourceButton.textContent = "Turn off source";
    // pointSourceButton.style.padding = "15px";

    // // Button which clears the scene
    // let clearButton = Button(
    //   document.getElementById("button-container-3") as HTMLElement,
    //   function () {
    //     waveEquationScene.add_to_queue(
    //       waveEquationScene.clear.bind(waveEquationScene),
    //     );
    //   },
    // );
    // clearButton.textContent = "Clear";
    // clearButton.style.padding = "15px";

    // Start the simulation
    waveEquationScene.init();
    waveEquationScene.toggle_pause();
    waveEquationScene.play(undefined);
  });
})();
