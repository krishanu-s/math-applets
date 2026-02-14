import { Scene } from "./base/base.js";
import { ThreeDScene } from "./three_d/scene.js";
import { Simulator } from "./simulator/sim.js";

// Generic for a scene whose state can be drawn from a simulator state
export class SceneFromSimulator extends Scene {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }
  update_mobjects_from_simulator(simulator: Simulator) {
    // Implement update logic, calling from the simulator
  }
}
export class ThreeDSceneFromSimulator extends ThreeDScene {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }
  update_mobjects_from_simulator(simulator: Simulator) {
    // Implement update logic, calling from the simulator
  }
}

// Manages an interactive applet where multiple scenes depend on a single underlying simulator.
// TODO Extend to the multi-simulator case.
export class InteractiveHandler {
  simulator: Simulator;
  scenes: Array<SceneFromSimulator | ThreeDSceneFromSimulator> = [];
  action_queue: Array<CallableFunction> = [];
  paused: boolean = true;
  time: number = 0;
  dt: number = 0.01;
  end_time: number | undefined; // Store a known end-time in case the simulation is paused and unpaused
  constructor(simulator: Simulator) {
    this.simulator = simulator;
  }
  // Adds a scene
  add_scene(scene: SceneFromSimulator | ThreeDSceneFromSimulator) {
    this.scenes.push(scene);
  }
  // Set and modify the simulator
  get_simulator(): Simulator {
    return this.simulator;
  }
  set_simulator_attr(
    simulator_ind: number,
    attr_name: string,
    attr_val: number,
  ) {
    this.simulator.set_attr(attr_name, attr_val);
  }
  // Restarts the simulator
  reset(): void {
    this.simulator.reset();
    this.time = 0;
    for (let i = 0; i < this.scenes.length; i++) {
      this.scenes[i].update_mobjects(this.simulator);
      this.scenes[i].draw();
    }
  }
  // Switches from paused to unpaused and vice-versa.
  toggle_pause() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.play(this.end_time);
    }
  }
  // Adds to the action queue if the scene is currently playing,
  // otherwise execute the callback immediately
  add_to_queue(callback: () => void) {
    if (this.paused) {
      callback();
    } else {
      this.action_queue.push(callback);
    }
  }
  // Starts animation
  play(until: number | undefined) {
    // If paused, record the end time and stop the loop
    if (this.paused) {
      this.end_time = until;
      return;
    }
    // Otherwise, loop
    else {
      // If there are outstanding actions, perform them first
      if (this.action_queue.length > 0) {
        let callback = this.action_queue.shift() as () => void;
        callback();
      }
      // If we have reached the end-time, stop.
      else if (this.time > (until as number)) {
        return;
      } else {
        this.simulator.step();
        this.time += this.simulator.dt;
        for (let i = 0; i < this.scenes.length; i++) {
          this.scenes[i].update_mobjects(this.simulator);
          this.scenes[i].draw();
        }
      }
      window.requestAnimationFrame(this.play.bind(this, until));
    }
  }
}
