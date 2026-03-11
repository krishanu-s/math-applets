// Same function as ValueTracker in Manim. A MObject which stores a value, with
// a collection of callbacks which trigger when that value is changed. Useful
// for defining a parameter which controls a number of MObjects.

import { MObject } from "../base";

export class Parameter extends MObject {
  _value: number = 0.0;
  callbacks: ((x: number) => void)[] = []; // Callbacks which trigger when the value is changed
  constructor() {
    super();
  }
  set_value(x: number) {
    this._value = x;
    this.do_callbacks();
    return this;
  }
  get_value(): number {
    return this._value;
  }
  // Adds a callback which triggers when the object is dragged
  add_callback(callback: (x: number) => void) {
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
