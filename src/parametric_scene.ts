// TODO Graph of a parametric function
import { MObject, Scene } from "./lib/base/base.js";
import { Slider } from "./lib/interactive.js";
import { ParametricFunction } from "./lib/bezier.js";

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Prepare the canvas
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

    const xmin = -5;
    const xmax = 5;
    const ymin = -5;
    const ymax = 5;

    // Prepare the canvas and scene
    let width = 300;
    let height = 300;

    let canvas = prepare_canvas(width, height, "scene-container");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Make the scene
    let parametric = new ParametricFunction(
      (t) => {
        let r = 1 / (1 + 0.5 * Math.cos(t));
        return [Math.cos(t) * r, Math.sin(t) * r];
      },
      0,
      2 * Math.PI,
      30,
    );
    let scene = new Scene(canvas);
    scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
    scene.add("parametric_fn", parametric);
    scene.draw();

    // Make a slider which can be used to modify the mobject
    // It should send a message to the owning scene
    let ecc_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (e: number) {
        parametric.set_function((t) => {
          let r = 1 / (1 + e * Math.cos(t));
          return [Math.cos(t) * r, Math.sin(t) * r];
        });
        scene.draw();
      },
      { initial_value: "0.5", min: 0, max: 1, step: 0.01 },
    );
    ecc_slider.width = 200;
  });
})();
