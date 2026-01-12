export function Slider(
  container: HTMLElement,
  callback: Function,
  initial_value: string,
  min?: number,
  max?: number,
  step?: number,
): HTMLInputElement {
  // Make slider object
  let slider = document.createElement("input");
  slider.type = "range";
  if (min == undefined) {
    slider.min = "0";
  } else {
    slider.min = `${min}`;
  }
  if (max == undefined) {
    slider.max = "10";
  } else {
    slider.max = `${max}`;
  }
  if (step == undefined) {
    slider.step = ".01";
  } else {
    slider.step = `${step}`;
  }
  slider.value = initial_value;
  slider.classList.add("slider");
  slider.id = "floatSlider";
  container.appendChild(slider);

  // Make value display
  let valueDisplay = document.createElement("span");
  valueDisplay.classList.add("value-display");
  valueDisplay.id = "sliderValue";
  valueDisplay.textContent = slider.value;
  container.appendChild(valueDisplay);

  // Update display with float value
  function updateDisplay() {
    callback(slider.value);
    valueDisplay.textContent = slider.value;
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
