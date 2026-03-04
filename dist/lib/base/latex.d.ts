import * as katex from "katex";
import * as html2canvas from "html2canvas";
import { MObject, Scene } from "./base.js";
import { Vec2D } from "../base/vec2.js";
declare global {
    interface Window {
        katex: typeof katex;
        html2canvas: typeof html2canvas;
    }
}
export declare class LaTeXMObject extends MObject {
    latex: string;
    pos: Vec2D;
    rotation: number;
    color: string;
    fontSize: number;
    katexOptions: katex.KatexOptions;
    latex_cache: LatexCache;
    constructor(latex: string, pos: Vec2D, latex_cache: LatexCache, katexOptions?: katex.KatexOptions);
    set_tex(latex: string): this;
    set_fontSize(size: number): this;
    set_rotation(rotation: number): this;
    set_color(color: string): this;
    move_to(pos: Vec2D): this;
    _drawRendered(ctx: CanvasRenderingContext2D, scene: Scene, renderedImage: HTMLImageElement): void;
    _render(): Promise<[HTMLDivElement, HTMLImageElement]>;
    _draw(ctx: CanvasRenderingContext2D, scene: Scene): Promise<void>;
    add_to_cache(): Promise<this | undefined>;
}
interface CacheEntry {
    image: HTMLImageElement;
    timestamp: number;
    hits: number;
}
export declare class LatexCache {
    cache: Map<string, CacheEntry>;
    maxSize: number;
    ttl: number;
    is_cached(latex: string, color: string, fontSize: number): [boolean, HTMLImageElement | undefined];
    add(latex: string, color: string, fontSize: number, image: HTMLImageElement): void;
    private generateKey;
    private cleanup;
}
export {};
//# sourceMappingURL=latex.d.ts.map