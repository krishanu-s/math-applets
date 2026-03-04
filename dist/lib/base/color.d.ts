export type ColorVal = [number, number, number, number];
export type ColorMap = (z: number) => ColorVal;
export type TwoDimColorMap = (z: number, w: number) => ColorVal;
export declare function colorval_to_rgba(color: ColorVal): string;
export declare function rb_colormap(z: number): ColorVal;
export declare function grayscale_colormap(z: number): ColorVal;
export declare function grayscale_colormap_logarithmic(z: number, d: number): ColorVal;
export declare function rb_colormap_2(z: number): ColorVal;
export declare function spherical_colormap(theta: number, phi: number): ColorVal;
//# sourceMappingURL=color.d.ts.map