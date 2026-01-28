import { InteractivePlayingScene } from "./statesim";

export function Slider(
  container: HTMLElement,
  callback: Function,
  kwargs: Record<string, any>,
  // initial_value: string,
  // min?: number,
  // max?: number,
  // step?: number,
): HTMLInputElement {
  // Make slider object
  let slider = document.createElement("input");
  slider.type = "range";
  slider.value = kwargs.initial_value;
  slider.classList.add("slider");
  slider.id = "floatSlider";

  // Default values
  let name = kwargs.name;
  if (name == undefined) {
    slider.name = "Value";
  } else {
    slider.name = name;
  }

  let min = kwargs.min;
  if (min == undefined) {
    slider.min = "0";
  } else {
    slider.min = `${min}`;
  }

  let max = kwargs.max;
  if (max == undefined) {
    slider.max = "10";
  } else {
    slider.max = `${max}`;
  }

  let step = kwargs.step;
  if (step == undefined) {
    slider.step = ".01";
  } else {
    slider.step = `${step}`;
  }
  container.appendChild(slider);

  // Make value display
  let valueDisplay = document.createElement("span");
  valueDisplay.classList.add("value-display");
  valueDisplay.id = "sliderValue";
  valueDisplay.textContent = `${slider.name} = ${slider.value}`;
  container.appendChild(valueDisplay);

  // Update display with float value
  function updateDisplay() {
    callback(slider.value);
    valueDisplay.textContent = `${slider.name} = ${slider.value}`;
    updateSliderColor(slider);
  }

  // Update slider visual appearance
  function updateSliderColor(sliderElement: HTMLInputElement) {
    const value = 100 * parseFloat(sliderElement.value);
    sliderElement.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${value}%, #ddd ${value}%, #ddd 100%)`;
  }

  // Initialize
  updateDisplay();

  // Update when slider moves
  slider.addEventListener("input", updateDisplay);
  return slider;
}

export function Button(
  container: HTMLElement,
  callback: () => void,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "interactiveButton";
  container.appendChild(button);

  button.addEventListener("click", (event: MouseEvent) => {
    callback();
    // Visual feedback
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 100);
  });

  return button;
}

export function PauseButton(
  container: HTMLElement,
  scene: InteractivePlayingScene,
): HTMLButtonElement {
  const pauseButton = Button(
    document.getElementById("line-source-heatmap-pause-button") as HTMLElement,
    function () {
      scene.add_to_queue(scene.toggle_pause.bind(scene));
      if (pauseButton.textContent == "Pause simulation") {
        pauseButton.textContent = "Unpause simulation";
      } else if (pauseButton.textContent == "Unpause simulation") {
        pauseButton.textContent = "Pause simulation";
      } else {
        throw new Error();
      }
    },
  );
  pauseButton.textContent = "Unpause simulation";
  pauseButton.style.padding = "15px";
  return pauseButton;
}
