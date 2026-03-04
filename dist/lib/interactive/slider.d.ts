export declare class CSlider {
    container: HTMLElement;
    callback: Function;
    name: string;
    val: number;
    min: number;
    max: number;
    step: number;
    _slider: HTMLInputElement;
    _valueDisplay: HTMLSpanElement;
    constructor(container: HTMLElement, callback: Function);
    set_name(name: string): this;
    set_min(x: number): this;
    set_max(x: number): this;
    set_val(x: number): this;
    set_step(x: number): this;
    _update_slider(): void;
    updateDisplay(): this;
    updateSliderColor(sliderElement: HTMLInputElement): void;
}
export declare function Slider(container: HTMLElement, callback: Function, kwargs: Record<string, any>): HTMLInputElement;
//# sourceMappingURL=slider.d.ts.map