import { MObject, Scene } from ".";
export declare class Histogram extends MObject {
    hist: Record<number, number>;
    fill_color: string;
    bin_min: number;
    bin_max: number;
    count_min: number;
    count_max: number;
    set_count_limits(min: number, max: number): void;
    set_bin_limits(min: number, max: number): void;
    set_hist(hist: Record<number, number>): void;
    draw(canvas: HTMLCanvasElement, scene: Scene): void;
}
//# sourceMappingURL=stats.d.ts.map