// math-applets/src/lib/mathjax_utils.ts - Updated version
/**
 * MathJax utility class for rendering LaTeX to various formats
 */
export class MathJaxRenderer {
    /**
     * Initialize MathJax with configuration
     */
    static async init(config = {}) {
        if (this.initialized) {
            return;
        }
        // Default configuration for SVG output
        const defaultConfig = {
            tex: {
                inlineMath: [
                    ["$", "$"],
                    ["\\(", "\\)"],
                ],
                displayMath: [
                    ["$$", "$$"],
                    ["\\[", "\\]"],
                ],
                packages: ["base", "ams", "noerrors", "noundefined"],
            },
            svg: {
                fontCache: "local",
                scale: 1,
            },
            startup: {
                typeset: false,
            },
        };
        // Merge configurations
        const finalConfig = this.deepMerge(defaultConfig, config);
        // Check if MathJax is already loaded
        // @ts-ignore
        if (typeof window !== "undefined" && window.MathJax) {
            // @ts-ignore
            window.MathJax = Object.assign(Object.assign({}, window.MathJax), finalConfig);
            this.initialized = true;
            return;
        }
        // Load MathJax dynamically
        await this.loadMathJax(finalConfig);
        this.initialized = true;
    }
    /**
     * Load MathJax dynamically with configuration
     */
    static async loadMathJax(config) {
        return new Promise((resolve, reject) => {
            if (typeof window === "undefined") {
                reject(new Error("MathJax can only be used in browser environment"));
                return;
            }
            // Create script element for MathJax
            const script = document.createElement("script");
            // Use the version from package.json or latest
            script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
            script.async = true;
            script.onload = () => {
                // Configure MathJax after loading
                // @ts-ignore
                window.MathJax = {
                    tex: config.tex || {
                        inlineMath: [
                            ["$", "$"],
                            ["\\(", "\\)"],
                        ],
                        displayMath: [
                            ["$$", "$$"],
                            ["\\[", "\\]"],
                        ],
                    },
                    svg: config.svg || {
                        fontCache: "local",
                    },
                    startup: Object.assign(Object.assign({}, config.startup), { ready: () => {
                            console.log("MathJax is ready");
                            resolve();
                        } }),
                };
            };
            script.onerror = () => {
                reject(new Error("Failed to load MathJax"));
            };
            document.head.appendChild(script);
        });
    }
    /**
     * Convert LaTeX to SVG string - FIXED VERSION
     * @param latex LaTeX expression
     * @param displayMode Whether to use display mode
     * @returns SVG string
     */
    static async latexToSVG(latex, displayMode = false) {
        await this.init();
        // @ts-ignore
        const mathjax = window.MathJax;
        if (!mathjax) {
            throw new Error("MathJax not loaded");
        }
        // Create a temporary element
        const div = document.createElement("div");
        div.style.visibility = "hidden";
        div.style.position = "absolute";
        div.style.top = "-9999px";
        div.style.left = "-9999px";
        // Add proper MathJax delimiters
        if (displayMode) {
            div.innerHTML = `\\[${latex}\\]`;
        }
        else {
            div.innerHTML = `\\(${latex}\\)`;
        }
        document.body.appendChild(div);
        try {
            // Typeset the math
            await mathjax.typesetPromise([div]);
            // Debug: log what was generated
            console.log("MathJax generated HTML:", div.innerHTML);
            // Try different ways to find the SVG
            let svgElement = null;
            // Method 1: Direct SVG element
            svgElement = div.querySelector("svg");
            // Method 2: SVG inside mjx-container
            if (!svgElement) {
                const container = div.querySelector("mjx-container");
                if (container) {
                    svgElement = container.querySelector("svg");
                }
            }
            // Method 3: Any SVG in the subtree
            if (!svgElement) {
                const svgs = div.getElementsByTagName("svg");
                if (svgs.length > 0) {
                    svgElement = svgs[0];
                }
            }
            if (!svgElement) {
                // If no SVG found, create one from the generated content
                const content = div.innerHTML;
                throw new Error(`No SVG element found. Generated content: ${content.substring(0, 200)}...`);
            }
            // Clone the SVG to avoid modifying the original
            const clonedSvg = svgElement.cloneNode(true);
            // Ensure SVG has proper namespace
            if (!clonedSvg.getAttribute("xmlns")) {
                clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            }
            // Convert to string
            const svgString = clonedSvg.outerHTML;
            // Clean up
            document.body.removeChild(div);
            return svgString;
        }
        catch (error) {
            document.body.removeChild(div);
            console.error("Error generating SVG from LaTeX:", error);
            throw error;
        }
    }
    /**
     * Alternative method using MathJax's direct API
     */
    static async latexToSVGDirect(latex, displayMode = false) {
        await this.init();
        // @ts-ignore
        const mathjax = window.MathJax;
        if (!mathjax) {
            throw new Error("MathJax not loaded");
        }
        try {
            // Use MathJax's tex2svg function if available
            // @ts-ignore
            if (mathjax.tex2svg) {
                // @ts-ignore
                const { html: svgHtml } = mathjax.tex2svg(latex, {
                    display: displayMode,
                });
                return svgHtml;
            }
            // Fallback to the DOM method
            return this.latexToSVG(latex, displayMode);
        }
        catch (error) {
            console.error("Error in latexToSVGDirect:", error);
            throw error;
        }
    }
    /**
     * Convert LaTeX to MathML string
     */
    static async latexToMathML(latex, displayMode = false) {
        await this.init();
        // @ts-ignore
        const mathjax = window.MathJax;
        if (!mathjax) {
            throw new Error("MathJax not loaded");
        }
        const div = document.createElement("div");
        div.style.visibility = "hidden";
        div.style.position = "absolute";
        div.style.top = "-9999px";
        if (displayMode) {
            div.innerHTML = `\\[${latex}\\]`;
        }
        else {
            div.innerHTML = `\\(${latex}\\)`;
        }
        document.body.appendChild(div);
        try {
            await mathjax.typesetPromise([div]);
            // Find MathML element
            const mathmlElement = div.querySelector("math");
            if (!mathmlElement) {
                throw new Error("Failed to generate MathML");
            }
            const mathmlString = mathmlElement.outerHTML;
            document.body.removeChild(div);
            return mathmlString;
        }
        catch (error) {
            document.body.removeChild(div);
            throw error;
        }
    }
    /**
     * Convert LaTeX to HTML string
     */
    static async latexToHTML(latex, displayMode = false) {
        await this.init();
        // @ts-ignore
        const mathjax = window.MathJax;
        if (!mathjax) {
            throw new Error("MathJax not loaded");
        }
        const div = document.createElement("div");
        if (displayMode) {
            div.innerHTML = `\\[${latex}\\]`;
        }
        else {
            div.innerHTML = `\\(${latex}\\)`;
        }
        document.body.appendChild(div);
        try {
            await mathjax.typesetPromise([div]);
            const htmlString = div.innerHTML;
            document.body.removeChild(div);
            return htmlString;
        }
        catch (error) {
            document.body.removeChild(div);
            throw error;
        }
    }
    /**
     * Render LaTeX to canvas - IMPROVED VERSION
     */
    static async renderToCanvas(canvas, latex, x = 0, y = 0, displayMode = false, scale = 1) {
        try {
            // First try the direct SVG method
            const svgString = await this.latexToSVGDirect(latex, displayMode);
            // Create an image from SVG
            const img = new Image();
            const svgBlob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(svgBlob);
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Failed to get canvas context"));
                        return;
                    }
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.scale(scale, scale);
                    ctx.drawImage(img, 0, 0);
                    ctx.restore();
                    URL.revokeObjectURL(url);
                    resolve();
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error("Failed to load SVG image"));
                };
                img.src = url;
            });
        }
        catch (error) {
            console.error("Error in renderToCanvas, falling back to DOM method:", error);
            // Fallback: Use DOM rendering
            await this.init();
            // @ts-ignore
            const mathjax = window.MathJax;
            if (!mathjax) {
                throw new Error("MathJax not loaded");
            }
            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
            div.style.transform = `scale(${scale})`;
            div.style.transformOrigin = "top left";
            if (displayMode) {
                div.innerHTML = `\\[${latex}\\]`;
            }
            else {
                div.innerHTML = `\\(${latex}\\)`;
            }
            document.body.appendChild(div);
            try {
                await mathjax.typesetPromise([div]);
                // Use html2canvas if available
                // @ts-ignore
                if (window.html2canvas) {
                    // @ts-ignore
                    const canvasImg = await window.html2canvas(div);
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(canvasImg, x, y);
                    }
                }
                document.body.removeChild(div);
            }
            catch (fallbackError) {
                document.body.removeChild(div);
                throw fallbackError;
            }
        }
    }
    /**
     * Extract SVG path data from LaTeX
     */
    static async latexToSVGPaths(latex, displayMode = false) {
        const svgString = await this.latexToSVGDirect(latex, displayMode);
        // Parse SVG string
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = doc.documentElement;
        if (!svgElement || svgElement.tagName !== "svg") {
            // Try to find SVG in the string
            const svgMatch = svgString.match(/<svg[\s\S]*?<\/svg>/);
            if (svgMatch) {
                const fixedDoc = parser.parseFromString(svgMatch[0], "image/svg+xml");
                const fixedSvg = fixedDoc.documentElement;
                if (fixedSvg && fixedSvg.tagName === "svg") {
                    return this.extractPathsFromSVG(fixedSvg);
                }
            }
            throw new Error("Invalid SVG generated");
        }
        return this.extractPathsFromSVG(svgElement);
    }
    /**
     * Extract paths from SVG element
     */
    static extractPathsFromSVG(svgElement) {
        const paths = [];
        // Extract all path elements
        const pathElements = svgElement.querySelectorAll("path");
        pathElements.forEach((path) => {
            const d = path.getAttribute("d");
            if (d) {
                paths.push(d);
            }
        });
        // Also check for path data in other elements
        const gElements = svgElement.querySelectorAll("g");
        gElements.forEach((g) => {
            const gPaths = g.querySelectorAll("path");
            gPaths.forEach((path) => {
                const d = path.getAttribute("d");
                if (d) {
                    paths.push(d);
                }
            });
        });
        return paths;
    }
    /**
     * Typeset math in elements
     */
    static async typeset(elements) {
        await this.init();
        // @ts-ignore
        const mathjax = window.MathJax;
        if (!mathjax) {
            throw new Error("MathJax not loaded");
        }
        const elementArray = Array.isArray(elements) ? elements : [elements];
        await mathjax.typesetPromise(elementArray);
    }
    /**
     * Typeset math in the entire document
     */
    static async typesetDocument() {
        await this.init();
        // @ts-ignore
        const mathjax = window.MathJax;
        if (!mathjax) {
            throw new Error("MathJax not loaded");
        }
        await mathjax.typesetPromise();
    }
    /**
     * Deep merge utility
     */
    static deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    }
                    else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                }
                else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    }
    /**
     * Check if value is an object
     */
    static isObject(item) {
        return item && typeof item === "object" && !Array.isArray(item);
    }
}
MathJaxRenderer.initialized = false;
/**
 * Convenience functions
 */
export async function latexToSVG(latex, displayMode = false) {
    return MathJaxRenderer.latexToSVGDirect(latex, displayMode);
}
export async function latexToMathML(latex, displayMode = false) {
    return MathJaxRenderer.latexToMathML(latex, displayMode);
}
export async function latexToHTML(latex, displayMode = false) {
    return MathJaxRenderer.latexToHTML(latex, displayMode);
}
export async function renderLatexToCanvas(canvas, latex, x = 0, y = 0, displayMode = false, scale = 1) {
    return MathJaxRenderer.renderToCanvas(canvas, latex, x, y, displayMode, scale);
}
export async function latexToSVGPaths(latex, displayMode = false) {
    return MathJaxRenderer.latexToSVGPaths(latex, displayMode);
}
//# sourceMappingURL=mathjax_utils.js.map