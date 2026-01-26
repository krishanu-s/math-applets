// Setting up a scene for math animations

let FRAME_LENGTH = 1 / 60;

class Scene {
  // Represents a mathematical scene living in a single HTML element.
  // Generally has
  // - mathematical objects, called MObjects ;
  // - interactive elements which can modify the scene, e.g. by adding/removing
  //   a MObject or modifying parameters ;
  // - evolution in real-time of these MObjects, rendered in real-time.
  mobjects: MathObject[];
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  requested_repaint: boolean;
  paused: boolean; // For
  time: number;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    // Assumes wrapper and canvas etc all set up
    this.container = container;
    this.canvas = canvas;
    this.mobjects = [];
    this.requested_repaint = false;
    this.paused = true;
    this.time = 0;
    this.repaint();
  }

  add_mobject(mobj: MathObject) {
    this.mobjects.push(mobj);
  }
  // Pauses the animation if there is one
  set_paused(pause: boolean) {
    this.paused = pause;
  }
  switch_mode() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.tick();
    }
    console.log("Switched mode");
  }
  // Ticks the simulation forward by one frame
  tick(): void {
    // console.log("Ticking drawer");
    this.time += FRAME_LENGTH;
    this.repaint();
    if (this.paused) {
      return;
    } else {
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }
  request_repaint(): void {
    if (!this.requested_repaint) {
      // console.log("Beginning repainting");
      this.requested_repaint = true;
      let self = this;
      window.requestAnimationFrame(function () {
        // console.log("Got animation frame");
        self.repaint();
      });
    } else {
      // console.log("Repaint already requested");
    }
  }
  repaint(): void {
    this.requested_repaint = false;
    // TODO Repaint all mobjects.
    // console.log("Repaint complete");
  }
}

class MathObject {
  draw() {
    // Draw th
  }
}
