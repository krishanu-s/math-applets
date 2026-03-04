// A simple slider.
export class CSlider {
    constructor(container, callback) {
        this.name = "Slider";
        this.val = 0.0;
        this.min = 0.0;
        this.max = 1.0;
        this.step = 0.01;
        this.container = container;
        this.callback = callback;
        // Make slider
        this._slider = document.createElement("input");
        this._slider.type = "range";
        this._slider.value = `${this.val}`;
        this._slider.classList.add("slider");
        this._slider.id = "floatSlider";
        this._slider.width = 200;
        // Make value display
        this._valueDisplay = document.createElement("span");
        this._valueDisplay.classList.add("value-display");
        this._valueDisplay.id = "sliderValue";
        this._valueDisplay.textContent = `${this.name} = ${this.val}`;
        container.appendChild(this._valueDisplay);
        // Initialize
        this.updateDisplay();
        // Update when slider moves
        this._slider.addEventListener("input", this.updateDisplay.bind(this));
    }
    set_name(name) {
        this.name = name;
        return this;
    }
    set_min(x) {
        this.min = x;
        return this;
    }
    set_max(x) {
        this.max = x;
        return this;
    }
    set_val(x) {
        this.val = x;
        this._slider.value = `${this.val}`;
        return this;
    }
    set_step(x) {
        this.step = x;
        return this;
    }
    _update_slider() {
        this._slider.name = this.name;
        this._slider.min = `${this.min}`;
        this._slider.max = `${this.max}`;
        this._slider.step = `${this.step}`;
        this._slider.value = `${this.val}`;
    }
    // Update display with float value
    updateDisplay() {
        this.callback(this.val);
        this._valueDisplay.textContent = `${this.name} = ${this.val}`;
        this.updateSliderColor(this._slider);
        return this;
    }
    // Update slider visual appearance
    updateSliderColor(sliderElement) {
        const value = 100 * parseFloat(sliderElement.value);
        sliderElement.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${value}%, #ddd ${value}%, #ddd 100%)`;
    }
}
export function Slider(container, callback, kwargs) {
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
    }
    else {
        slider.name = name;
    }
    let min = kwargs.min;
    if (min == undefined) {
        slider.min = "0";
    }
    else {
        slider.min = `${min}`;
    }
    let max = kwargs.max;
    if (max == undefined) {
        slider.max = "10";
    }
    else {
        slider.max = `${max}`;
    }
    let step = kwargs.step;
    if (step == undefined) {
        slider.step = ".01";
    }
    else {
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
    function updateSliderColor(sliderElement) {
        const value = 100 * parseFloat(sliderElement.value);
        sliderElement.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${value}%, #ddd ${value}%, #ddd 100%)`;
    }
    // Initialize
    updateDisplay();
    // Update when slider moves
    slider.addEventListener("input", updateDisplay);
    return slider;
}
//# sourceMappingURL=slider.js.map