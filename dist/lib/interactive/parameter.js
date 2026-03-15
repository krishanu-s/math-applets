// Same function as ValueTracker in Manim. A MObject which stores a value, with
// a collection of callbacks which trigger when that value is changed. Useful
// for defining a parameter which controls a number of MObjects.
import { MObject } from "../base";
export class Parameter extends MObject {
    constructor() {
        super();
        this._value = 0.0;
        this.callbacks = []; // Callbacks which trigger when the value is changed
    }
    set_value(x) {
        this._value = x;
        this.do_callbacks();
        return this;
    }
    get_value() {
        return this._value;
    }
    // Adds a callback which triggers when the object is dragged
    add_callback(callback) {
        this.callbacks.push(callback);
        return this;
    }
    // Removes all callbacks, unbinding the parameter
    clear() {
        this.callbacks = [];
        return this;
    }
    // Performs all callbacks (called when the value is changed)
    do_callbacks() {
        for (const callback of this.callbacks) {
            callback(this._value);
        }
    }
}
//# sourceMappingURL=parameter.js.map