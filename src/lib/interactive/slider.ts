// A simple slider.

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
  slider.width = 200;

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
