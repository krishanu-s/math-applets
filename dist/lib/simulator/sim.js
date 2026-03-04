// This file contains classes which are used to define a simulation running in
// real-time, with interactivity from the user. By "simulation", we mean
// dynamical systems governed by, e.g., a differential equation or
// repeated iteration of a map.
//
// The underlying state of such a system is represented by the "Simulator" class.
//
// Management of a scene being run with a simulator is handled by the "InteractiveHandler" class
import { Scene } from "../base";
import { Button } from "../interactive";
import { ThreeDScene } from "../three_d/scene.js";
// A generic simulator which can be used to simulate a system.
export class Simulator {
    constructor(dt) {
        this.time = 0; // Timestamp in the worldline of the simulator
        this.dt = dt;
    }
    reset() {
        this.time = 0;
    }
    step() {
        this.time += this.dt;
    }
    // Generic setter.
    set_attr(name, val) {
        if (name in this) {
            this[name] = val;
        }
    }
    // Reveals version of internal state for drawing purposes
    get_drawable() {
        return this.get_uValues();
    }
    // Returns full internal state
    get_uValues() {
        return [];
    }
    get_time() {
        return this.time;
    }
    get_dt() {
        return this.dt;
    }
}
// Identical extension of ThreeDScene as InteractivePlayingScene is of Scene
// TODO This is deprecated, now interactive scenes linked to a simulator are managed
// by a handler instead.
export class InteractivePlayingThreeDScene extends ThreeDScene {
    constructor(canvas, simulators) {
        super(canvas);
        this.linked_scenes = [];
        [this.num_simulators, this.simulators] = simulators.reduce(([ind, acc], item) => ((acc[ind] = item), [ind + 1, acc]), [0, {}]);
        this.action_queue = [];
        this.paused = true;
        this.time = 0;
        this.dt = simulators[0].dt;
        this.linked_scenes = [];
    }
    add_linked_scene(scene) {
        this.linked_scenes.push(scene);
    }
    add_pause_button(container) {
        let self = this;
        let pauseButton = Button(container, function () {
            self.add_to_queue(self.toggle_pause.bind(self));
            pauseButton.textContent =
                pauseButton.textContent == "Pause simulation"
                    ? "Unpause simulation"
                    : "Pause simulation";
        });
        pauseButton.textContent = this.paused
            ? "Unpause simulation"
            : "Pause simulation";
        return pauseButton;
    }
    get_simulator(ind = 0) {
        return this.simulators[ind];
    }
    set_simulator_attr(simulator_ind, attr_name, attr_val) {
        this.get_simulator(simulator_ind).set_attr(attr_name, attr_val);
    }
    update_and_draw_linked_scenes() {
        for (let scene of this.linked_scenes) {
            scene.update_mobjects_from_simulator(this.get_simulator(0));
            scene.draw();
        }
    }
    // Restarts the simulator
    reset() {
        for (let ind = 0; ind < this.num_simulators; ind++) {
            this.get_simulator(ind).reset();
        }
        this.time = 0;
        this.draw();
        this.update_and_draw_linked_scenes();
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
    add_to_queue(callback) {
        if (this.paused) {
            callback();
        }
        else {
            this.action_queue.push(callback);
        }
    }
    // Starts animation
    play(until) {
        // If paused, record the end time and stop the loop
        if (this.paused) {
            this.end_time = until;
            return;
        }
        // Otherwise, loop
        else {
            // If there are outstanding actions, perform them first
            if (this.action_queue.length > 0) {
                let callback = this.action_queue.shift();
                callback();
            }
            // If we have reached the end-time, stop.
            else if (this.time > until) {
                return;
            }
            else {
                for (let ind = 0; ind < this.num_simulators; ind++) {
                    this.get_simulator(ind).step();
                }
                this.time += this.get_simulator(0).dt;
                this.draw();
                this.update_and_draw_linked_scenes();
            }
            window.requestAnimationFrame(this.play.bind(this, until));
        }
    }
    // Updates all mobjects to account for the new simulator state
    update_mobjects() { }
    // Draws the scene without worrying about depth-sensing.
    // TODO Sort this out later.
    draw() {
        this.update_mobjects();
        let ctx = this.canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        Object.keys(this.mobjects).forEach((name) => {
            let mobj = this.get_mobj(name);
            if (mobj == undefined)
                throw new Error(`${name} not found`);
            this.draw_mobject(mobj);
        });
    }
    // Add drawing instructions in the subclass.
    draw_mobject(mobj) { }
}
// Generic for a scene whose mobjects can be updated from a simulator.
export class SceneFromSimulator extends Scene {
    constructor(canvas) {
        super(canvas);
    }
    reset() {
        // Implement reset logic
    }
    update_mobjects_from_simulator(simulator) {
        // Implement update logic, calling get_uValues() from the simulator
    }
    toggle_pause() { }
    toggle_unpause() { }
}
export class ThreeDSceneFromSimulator extends ThreeDScene {
    constructor(canvas) {
        super(canvas);
    }
    reset() {
        // Implement reset logic
    }
    update_mobjects_from_simulator(simulator) {
        // Implement update logic, calling from the simulator
    }
    toggle_pause() { }
    toggle_unpause() { }
}
// Manages an interactive applet where multiple scenes depend on a single underlying simulator.
// TODO Extend to the multi-simulator case.
export class InteractiveHandler {
    constructor(simulator) {
        this.scenes = [];
        this.action_queue = [];
        this.paused = true;
        this.time = 0;
        this.dt = 0.01;
        this.num_steps_per_frame = 1; // Number of simulator steps before updating scenes
        this.simulator = simulator;
    }
    // Adds a scene
    add_scene(scene) {
        scene.update_mobjects_from_simulator(this.simulator);
        this.scenes.push(scene);
    }
    // Draws all scenes
    draw() {
        for (let scene of this.scenes) {
            scene.draw();
        }
    }
    // Set and modify the simulator
    get_simulator() {
        return this.simulator;
    }
    set_simulator_attr(simulator_ind, attr_name, attr_val) {
        this.simulator.set_attr(attr_name, attr_val);
    }
    set_num_steps_per_frame(num_steps) {
        this.num_steps_per_frame = num_steps;
        return this;
    }
    add_pause_button(container) {
        let self = this;
        let pauseButton = Button(container, function () {
            self.add_to_queue(self.toggle_pause.bind(self));
            pauseButton.textContent =
                pauseButton.textContent == "Pause simulation"
                    ? "Unpause simulation"
                    : "Pause simulation";
        });
        pauseButton.textContent = this.paused
            ? "Unpause simulation"
            : "Pause simulation";
        return pauseButton;
    }
    // Restarts the simulator
    reset() {
        this.simulator.reset();
        this.time = 0;
        for (let scene of this.scenes) {
            scene.reset();
            scene.update_mobjects_from_simulator(this.simulator);
            scene.draw();
        }
    }
    // Switches from paused to unpaused and vice-versa.
    toggle_pause() {
        this.paused = !this.paused;
        if (!this.paused) {
            for (let scene of this.scenes) {
                scene.toggle_unpause();
            }
            this.play(this.end_time);
        }
        else {
            for (let scene of this.scenes) {
                scene.toggle_pause();
            }
        }
    }
    // Adds to the action queue if the scene is currently playing,
    // otherwise execute the callback immediately
    add_to_queue(callback) {
        if (this.paused) {
            callback();
        }
        else {
            this.action_queue.push(callback);
        }
    }
    // Starts animation
    async play(until) {
        // If paused, record the end time and stop the loop
        if (this.paused) {
            this.end_time = until;
            return;
        }
        // Otherwise, loop
        else {
            // If there are outstanding actions, perform them first
            if (this.action_queue.length > 0) {
                let callback = this.action_queue.shift();
                callback();
            }
            // If we have reached the end-time, stop.
            else if (this.time > until) {
                return;
            }
            else {
                for (let i = 0; i < this.num_steps_per_frame; i++) {
                    this.simulator.step();
                }
                this.time = this.simulator.get_time();
                for (let scene of this.scenes) {
                    scene.update_mobjects_from_simulator(this.simulator);
                    scene.draw();
                }
            }
            window.requestAnimationFrame(this.play.bind(this, until));
        }
    }
}
//# sourceMappingURL=sim.js.map