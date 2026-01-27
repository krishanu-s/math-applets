import { MObject, Scene, sigmoid } from "./base.js";

type ColorVal = [number, number, number, number];
type ColorMap = (z: number) => ColorVal;
type TwoDimColorMap = (z: number, w: number) => ColorVal;

// Given a value in (-inf, inf), produces a color from
// red-to-blue where +inf is red and -inf is blue.
function rb_colormap(z: number): ColorVal {
  const gray = sigmoid(z);
  if (gray < 0.5) {
    return [512 * gray, 512 * gray, 255, 255];
  } else {
    return [255, 512 * (1 - gray), 512 * (1 - gray), 255];
  }
}

// Given a pair of spherical coordinates (theta, phi) where
// phi is between 0 and 2pi (wrapping around) and theta is
// between 0 and pi, yields a color. The theta value should
// correspond to the brightness
function spherical_colormap(theta: number, phi: number): ColorVal {
  let a;
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid longitude");
  } else if (phi < (2 * Math.PI) / 3) {
    a = phi / ((2 * Math.PI) / 3);
    // return [256 * (1 - a), 256 * a, 0, (512 * theta) / Math.PI];
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else if (phi < (4 * Math.PI) / 3) {
    a = phi / ((2 * Math.PI) / 3) - 1;
    // return [0, 256 * (1 - a), 256 * a, (512 * theta) / Math.PI];
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else {
    a = phi / ((2 * Math.PI) / 3) - 2;
    // return [256 * a, 0, 256 * (1 - a), (512 * theta) / Math.PI];
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  }
}

// A pixel heatmap. Values are assumed to be in (-inf, inf) and are
// mapped to colors according
export class HeatMap extends MObject {
  width: number;
  height: number;
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  valArray: Array<number>;
  colorMap: ColorMap;
  constructor(
    width: number,
    height: number,
    min_val: number,
    max_val: number,
    valArray: Array<number>,
  ) {
    super();
    this.width = width;
    this.height = height;
    this.min_val = min_val;
    this.max_val = max_val;
    this.valArray = valArray;
    this.colorMap = rb_colormap;
  }
  // Gets/sets values
  set_vals(vals: Array<number>) {
    this.valArray = vals;
  }
  get_vals(): Array<number> {
    return this.valArray;
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene, imageData: ImageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.valArray[i] as number;
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] =
        this.colorMap(px_val);
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.putImageData(imageData, 0, 0);
  }
}

export class TwoDimHeatMap extends MObject {
  width: number;
  height: number;
  valArray_1: Array<number>;
  valArray_2: Array<number>;
  colorMap: TwoDimColorMap;
  constructor(
    width: number,
    height: number,
    valArray_1: Array<number>,
    valArray_2: Array<number>,
  ) {
    super();
    this.width = width;
    this.height = height;
    this.valArray_1 = valArray_1;
    this.valArray_2 = valArray_2;
    this.colorMap = spherical_colormap;
  }
  // Gets/sets values
  set_vals_1(vals: Array<number>) {
    this.valArray_1 = vals;
  }
  get_vals_1(): Array<number> {
    return this.valArray_1;
  }
  set_vals_2(vals: Array<number>) {
    this.valArray_2 = vals;
  }
  get_vals_2(): Array<number> {
    return this.valArray_2;
  } // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene, imageData: ImageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val_1 = this.valArray_1[i] as number;
      const px_val_2 = this.valArray_2[i] as number;
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(
        px_val_1,
        px_val_2,
      );
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.putImageData(imageData, 0, 0);
  }
}
