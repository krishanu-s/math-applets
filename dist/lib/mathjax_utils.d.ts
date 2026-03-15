/**
 * MathJax configuration options
 */
export interface MathJaxConfig {
    tex?: {
        inlineMath?: Array<[string, string]>;
        displayMath?: Array<[string, string]>;
        packages?: string[];
        tags?: "ams" | "all" | "none";
        tagSide?: "left" | "right";
        tagIndent?: string;
        useLabelIds?: boolean;
        multlineWidth?: string;
        maxMacros?: number;
        maxBuffer?: number;
        formatError?: (jax: any, err: any) => string;
    };
    svg?: {
        fontCache?: "local" | "global" | "none";
        scale?: number;
        minScale?: number;
        mtextInheritFont?: boolean;
        merrorInheritFont?: boolean;
        mathmlSpacing?: boolean;
        skipAttributes?: Record<string, boolean>;
        exFactor?: number;
        displayAlign?: "left" | "center" | "right";
        displayIndent?: string;
        localID?: string;
        internalSpeechTitles?: boolean;
        titleID?: number;
    };
    startup?: {
        typeset?: boolean;
        pageReady?: () => Promise<void>;
        ready?: () => Promise<void>;
    };
}
/**
 * MathJax utility class for rendering LaTeX to various formats
 */
export declare class MathJaxRenderer {
    private static initialized;
    /**
     * Initialize MathJax with configuration
     */
    static init(config?: MathJaxConfig): Promise<void>;
    /**
     * Load MathJax dynamically with configuration
     */
    private static loadMathJax;
    /**
     * Convert LaTeX to SVG string - FIXED VERSION
     * @param latex LaTeX expression
     * @param displayMode Whether to use display mode
     * @returns SVG string
     */
    static latexToSVG(latex: string, displayMode?: boolean): Promise<string>;
    /**
     * Alternative method using MathJax's direct API
     */
    static latexToSVGDirect(latex: string, displayMode?: boolean): Promise<string>;
    /**
     * Convert LaTeX to MathML string
     */
    static latexToMathML(latex: string, displayMode?: boolean): Promise<string>;
    /**
     * Convert LaTeX to HTML string
     */
    static latexToHTML(latex: string, displayMode?: boolean): Promise<string>;
    /**
     * Render LaTeX to canvas - IMPROVED VERSION
     */
    static renderToCanvas(canvas: HTMLCanvasElement, latex: string, x?: number, y?: number, displayMode?: boolean, scale?: number): Promise<void>;
    /**
     * Extract SVG path data from LaTeX
     */
    static latexToSVGPaths(latex: string, displayMode?: boolean): Promise<string[]>;
    /**
     * Extract paths from SVG element
     */
    private static extractPathsFromSVG;
    /**
     * Typeset math in elements
     */
    static typeset(elements: Element | Element[]): Promise<void>;
    /**
     * Typeset math in the entire document
     */
    static typesetDocument(): Promise<void>;
    /**
     * Deep merge utility
     */
    private static deepMerge;
    /**
     * Check if value is an object
     */
    private static isObject;
}
/**
 * Convenience functions
 */
export declare function latexToSVG(latex: string, displayMode?: boolean): Promise<string>;
export declare function latexToMathML(latex: string, displayMode?: boolean): Promise<string>;
export declare function latexToHTML(latex: string, displayMode?: boolean): Promise<string>;
export declare function renderLatexToCanvas(canvas: HTMLCanvasElement, latex: string, x?: number, y?: number, displayMode?: boolean, scale?: number): Promise<void>;
export declare function latexToSVGPaths(latex: string, displayMode?: boolean): Promise<string[]>;
//# sourceMappingURL=mathjax_utils.d.ts.map