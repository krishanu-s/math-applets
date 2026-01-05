import { Drawer } from "./pendulum.js";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    let scale = 1.0;

    // Prepare canvas
    function prepare_canvas(container: HTMLElement): HTMLCanvasElement {
      container.style.width = "300px";
      container.style.height = "300px";

      // ********** Drawing and repainting logic
      let wrapper = document.createElement("div");
      wrapper.classList.add("canvas_container");
      wrapper.classList.add("non_selectable");
      wrapper.style.width = "300px";
      wrapper.style.height = "300px";

      let canvas = document.createElement("canvas");
      canvas.classList.add("non_selectable");
      canvas.style.position = "relative";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.height = 300;
      canvas.width = 300;

      let width, height;

      wrapper.appendChild(canvas);
      container.appendChild(wrapper);
      return canvas;
    }

    // Get container for pendulum simulation
    const pendulum_container = document.getElementById("pendulum-container");
    if (pendulum_container == null)
      throw new Error("No container found for pendulum.");

    pendulum_container.style.width = "300px";
    pendulum_container.style.height = "300px";

    // Make visual element
    let wrapper = document.createElement("div");
    wrapper.classList.add("canvas_container");
    wrapper.classList.add("non_selectable");
    wrapper.style.width = "300px";
    wrapper.style.height = "300px";

    let canvas = document.createElement("canvas");
    canvas.classList.add("non_selectable");
    canvas.style.position = "relative";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.height = 300;
    canvas.width = 300;

    let width, height;

    wrapper.appendChild(canvas);
    pendulum_container.appendChild(wrapper);

    // let canvas = prepare_canvas(pendulum_container);

    // Make the drawing element
    let drawer = new Drawer(pendulum_container, canvas);
    drawer.set_initial_conditions(0.5, 0);

    // Add pause button
    // TODO Set location
    let play = document.createElement("button");
    play.style.height = "100px";
    play.style.width = "100px";
    play.onclick = function () {
      drawer.switch_mode();
    };
    wrapper.appendChild(play);

    // TODO Add slider for initial conditions

    drawer.set_paused(true);
  });
})();
