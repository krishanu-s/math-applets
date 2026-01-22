// src/base.ts
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
var MObject = class {
  constructor() {
  }
  draw(canvas, scene, args) {
  }
};

// src/heatmap.ts
function rb_colormap(z) {
  const gray = sigmoid(z);
  if (gray < 0.5) {
    return [512 * gray, 512 * gray, 255, 255];
  } else {
    return [255, 512 * (1 - gray), 512 * (1 - gray), 255];
  }
}
function spherical_colormap(theta, phi) {
  let a;
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid longitude");
  } else if (phi < 2 * Math.PI / 3) {
    a = phi / (2 * Math.PI / 3);
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else if (phi < 4 * Math.PI / 3) {
    a = phi / (2 * Math.PI / 3) - 1;
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else {
    a = phi / (2 * Math.PI / 3) - 2;
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  }
}
var HeatMap = class extends MObject {
  constructor(width, height, min_val, max_val, valArray) {
    super();
    this.width = width;
    this.height = height;
    this.min_val = min_val;
    this.max_val = max_val;
    this.valArray = valArray;
    this.colorMap = rb_colormap;
  }
  // Gets/sets values
  set_vals(vals) {
    this.valArray = vals;
  }
  get_vals() {
    return this.valArray;
  }
  // Draws on the canvas
  draw(canvas, scene, imageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val = this.valArray[i];
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(px_val);
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.putImageData(imageData, 0, 0);
  }
};
var TwoDimHeatMap = class extends MObject {
  constructor(width, height, valArray_1, valArray_2) {
    super();
    this.width = width;
    this.height = height;
    this.valArray_1 = valArray_1;
    this.valArray_2 = valArray_2;
    this.colorMap = spherical_colormap;
  }
  // Gets/sets values
  set_vals_1(vals) {
    this.valArray_1 = vals;
  }
  get_vals_1() {
    return this.valArray_1;
  }
  set_vals_2(vals) {
    this.valArray_2 = vals;
  }
  get_vals_2() {
    return this.valArray_2;
  }
  // Draws on the canvas
  draw(canvas, scene, imageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val_1 = this.valArray_1[i];
      const px_val_2 = this.valArray_2[i];
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(
        px_val_1,
        px_val_2
      );
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.putImageData(imageData, 0, 0);
  }
};
export {
  HeatMap,
  TwoDimHeatMap
};
