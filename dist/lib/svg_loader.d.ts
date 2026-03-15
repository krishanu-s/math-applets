/**
 * Simple interface for a 2D point
 */
export interface Point2D {
    x: number;
    y: number;
}
/**
 * Extended path information including style and transformation
 */
export interface PathInfo {
    /** SVG path data (d attribute) */
    data: string;
    /** Fill color or style */
    fill: string;
    /** Stroke color or style */
    stroke: string;
    /** Stroke width */
    strokeWidth: string;
    /** Transformation matrix as string */
    transform: string;
    /** Parsed transformation matrix (if available) */
    transformMatrix?: DOMMatrix;
    /** Translation vector extracted from transform */
    translation?: Point2D;
    /** Bounding box of the path */
    bbox?: DOMRect;
}
export interface ParsedPathInfo {
    /** SVG path commands (d attribute) */
    commands: Array<{
        type: string;
        values: number[];
    }>;
    /** Fill color or style */
    fill: string;
    /** Stroke color or style */
    stroke: string;
    /** Stroke width */
    strokeWidth: string;
    /** Transformation matrix as string */
    transform: string;
    /** Parsed transformation matrix (if available) */
    transformMatrix?: DOMMatrix;
    /** Translation vector extracted from transform */
    translation?: Point2D;
    /** Bounding box of the path */
    bbox?: DOMRect;
}
export declare function applyPathInfo(ctx: CanvasRenderingContext2D, pathInfo: ParsedPathInfo): void;
export declare function unapplyPathInfo(ctx: CanvasRenderingContext2D, pathInfo: ParsedPathInfo): void;
/**
 * Simple SVG loader utility
 */
export declare class SimpleSVGLoader {
    /**
     * Load SVG from a URL
     */
    static loadFromURL(url: string): Promise<string>;
    /**
     * Load SVG from a File object (from file input)
     */
    static loadFromFile(file: File): Promise<string>;
    /**
     * Parse SVG string to DOM element
     */
    static parseSVG(svgString: string): SVGElement;
    /**
     * Extract all path data from SVG
     */
    static extractPaths(svgElement: SVGElement): PathInfo[];
    static drawPartial(ctx: CanvasRenderingContext2D, parsedPathInfoAll: Array<ParsedPathInfo>, numCommands: number): void;
    /**
     * Convert SVG path to points (simplified - only handles M, L, H, V, Z commands)
     */
    static pathToPoints(pathData: string): Point2D[];
    /**
     * Parse SVG path commands
     */
    private static parsePathCommands;
    private static parsePathInfo;
    /**
     * Draw SVG to canvas
     */
    static drawToCanvas(canvas: HTMLCanvasElement, svgString: string, x?: number, y?: number): Promise<void>;
}
/**
 * Example usage: Load SVG and get points
 */
export declare function loadSVGAndGetPoints(url: string): Promise<Point2D[]>;
/**
 * Example usage: Create file input for SVG
 */
export declare function createSVGFileInput(onLoad: (svgString: string, points: Point2D[]) => void): HTMLInputElement;
//# sourceMappingURL=svg_loader.d.ts.map