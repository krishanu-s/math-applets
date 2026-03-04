import { ColorMap, TwoDimColorMap } from "./color";
import { MObject, Scene } from ".";
export declare class HeatMap extends MObject {
    width: number;
    height: number;
    min_val: number;
    max_val: number;
    valArray: Array<number>;
    colorMap: ColorMap;
    constructor(width: number, height: number, min_val: number, max_val: number, valArray: Array<number>);
    set_color_map(colorMap: ColorMap): void;
    set_vals(vals: Array<number>): void;
    get_vals(): Array<number>;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene, imageData: ImageData): void;
}
export declare class TwoDimHeatMap extends MObject {
    width: number;
    height: number;
    valArray_1: Array<number>;
    valArray_2: Array<number>;
    colorMap: TwoDimColorMap;
    constructor(width: number, height: number, valArray_1: Array<number>, valArray_2: Array<number>);
    set_vals_1(vals: Array<number>): void;
    get_vals_1(): Array<number>;
    set_vals_2(vals: Array<number>): void;
    get_vals_2(): Array<number>;
    draw(canvas: HTMLCanvasElement, scene: Scene, imageData: ImageData): void;
}
//# sourceMappingURL=heatmap.d.ts.map