import { MObject, Scene } from "./base.js";
import {
  ColorMap,
  TwoDimColorMap,
  rb_colormap,
  spherical_colormap,
} from "./color.js";

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
  _draw(ctx: CanvasRenderingContext2D, scene: Scene, imageData: ImageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.valArray[i] as number;
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] =
        this.colorMap(px_val);
    }
    // Put the image data
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
    ctx.globalAlpha = this.alpha;
    ctx.putImageData(imageData, 0, 0);
  }
}
