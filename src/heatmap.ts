import { MObject, Scene, sigmoid } from "./base";

// A pixel heatmap
export class HeatMap extends MObject {
  width: number;
  height: number;
  min_val: number; // Float value corresponding to 0 colorscale
  max_val: number; // Float value corresponding to 256 colorscale
  valArray: Array<number>;
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
  }
  // Makes a new array
  new_arr(): Array<number> {
    return new Array(this.width * this.height).fill(0);
  }
  // Gets/sets values
  set_vals(vals: Array<number>) {
    this.valArray = vals;
  }
  get_vals(): Array<number> {
    return this.valArray;
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  // Draws on the canvas
  draw(canvas: HTMLCanvasElement, scene: Scene, imageData: ImageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.valArray[i] as number;
      // Red-blue heatmap
      const gray = sigmoid(px_val);
      // const gray = (px_val - this.min_val) / (this.max_val - this.min_val);
      const idx = i * 4;
      // data[idx] = data[idx + 1] = data[idx + 2] = 256 * clamp(gray, 0, 1);
      if (gray < 0.5) {
        data[idx] = 512 * gray;
        data[idx + 1] = 512 * gray;
        data[idx + 2] = 255;
      } else {
        data[idx] = 255;
        data[idx + 1] = 512 * (1 - gray);
        data[idx + 2] = 512 * (1 - gray);
      }
      data[idx + 3] = 255;
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.putImageData(imageData, 0, 0);
  }
}
