import { rb_colormap, spherical_colormap, } from "./color";
import { MObject } from ".";
// A two-dimensional heatmap. Receptacle of values from TwoDimDrawable.
export class HeatMap extends MObject {
    constructor(width, height, min_val, max_val, valArray) {
        super();
        this.width = width;
        this.height = height;
        this.min_val = min_val;
        this.max_val = max_val;
        this.valArray = valArray;
        this.colorMap = rb_colormap;
    }
    set_color_map(colorMap) {
        this.colorMap = colorMap;
    }
    // Gets/sets values
    set_vals(vals) {
        this.valArray = vals;
    }
    get_vals() {
        return this.valArray;
    }
    // Draws on the canvas
    _draw(ctx, scene, imageData) {
        let data = imageData.data;
        for (let i = 0; i < this.width * this.height; i++) {
            const px_val = this.valArray[i];
            const idx = i * 4;
            [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] =
                this.colorMap(px_val);
        }
        // Put the image data
        ctx.putImageData(imageData, 0, 0);
    }
}
export class TwoDimHeatMap extends MObject {
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
    } // Draws on the canvas
    draw(canvas, scene, imageData) {
        let data = imageData.data;
        for (let i = 0; i < this.width * this.height; i++) {
            const px_val_1 = this.valArray_1[i];
            const px_val_2 = this.valArray_2[i];
            const idx = i * 4;
            [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(px_val_1, px_val_2);
        }
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        ctx.putImageData(imageData, 0, 0);
    }
}
//# sourceMappingURL=heatmap.js.map