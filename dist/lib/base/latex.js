import { MObject } from "./base.js";
// A LaTeX object, defined by a string of latex code and a position.
// TODO Find some way to move the LaTeX cache into the background.
export class LaTeXMObject extends MObject {
    constructor(latex, pos, latex_cache, katexOptions) {
        super();
        this.rotation = 0;
        this.color = "black";
        this.fontSize = 16;
        this.pos = pos;
        this.latex = latex;
        this.latex_cache = latex_cache;
        this.katexOptions = Object.assign({ throwOnError: false, displayMode: false, fleqn: true }, katexOptions);
    }
    set_tex(latex) {
        this.latex = latex;
        return this;
    }
    set_fontSize(size) {
        this.fontSize = size;
        return this;
    }
    set_rotation(rotation) {
        this.rotation = rotation;
        return this;
    }
    set_color(color) {
        this.color = color;
        return this;
    }
    move_to(pos) {
        this.pos = pos;
        return this;
    }
    // Draw a rendered LaTeX image
    _drawRendered(ctx, scene, renderedImage) {
        let [cx, cy] = scene.v2c(this.pos);
        // Apply rotation if specified
        if (this.rotation !== 0) {
            ctx.translate(cx, cy);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.drawImage(renderedImage, 0, 0);
            ctx.restore();
        }
        else {
            ctx.drawImage(renderedImage, cx, cy);
        }
    }
    // Renders a LaTeX expression and outputs an image.
    async _render() {
        if (!window.katex) {
            throw new Error("KaTeX is not loaded. Please include KaTeX library.");
        }
        if (!window.html2canvas) {
            throw new Error("html2canvas is not loaded. Please include html2canvas library.");
        }
        // Create container for KaTeX
        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            color: ${this.color};
            font-size: ${this.fontSize}px;
            display: inline-block;
            transform: translate(${this.pos[0]}px, ${this.pos[1]}px) rotate(${this.rotation}deg);
            transform-origin: 0 0;
            white-space: nowrap;
            z-index: 9999;
        `;
        // Apply background for better rendering
        container.style.backgroundColor = "white";
        container.style.padding = "2px 4px";
        container.style.borderRadius = "3px";
        document.body.appendChild(container);
        // Render KaTeX
        window.katex.render(this.latex, container, Object.assign(Object.assign({}, this.katexOptions), { fontSize: this.fontSize + "px" }));
        // Convert to canvas using html2canvas
        let tempCanvas = await window.html2canvas(container, {
            backgroundColor: null,
            scale: 1,
            logging: false,
            useCORS: true,
            allowTaint: true,
        });
        return [container, tempCanvas];
    }
    // Draw the LaTeX object, either by using the cache (if it has been rendered before)
    // or by rendering it from scratch (if this is the first time).
    async _draw(ctx, scene) {
        // Check if the image is cached.
        let [isCached, cachedCanvas] = this.latex_cache.is_cached(this.latex, this.color, this.fontSize);
        if (isCached) {
            this._drawRendered(ctx, scene, cachedCanvas);
        }
        else {
            // If not, render it.
            let [container, tempCanvas] = await this._render();
            // Add to the cache
            this.latex_cache.add(this.latex, this.color, this.fontSize, tempCanvas);
            // Save current canvas state
            ctx.save();
            // Draw the rendered image.
            this._drawRendered(ctx, scene, tempCanvas);
            // Cleanup
            document.body.removeChild(container);
        }
    }
    // Adds this LaTeX object to the cache for faster rendering-on-demand in future.
    async add_to_cache() {
        // Check if the image is cached.
        let [isCached, cachedCanvas] = this.latex_cache.is_cached(this.latex, this.color, this.fontSize);
        if (isCached) {
            return;
        }
        // If not, render it.
        let [container, tempCanvas] = await this._render();
        // Add to the cache
        this.latex_cache.add(this.latex, this.color, this.fontSize, tempCanvas);
        return this;
    }
}
export class LatexCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
        this.ttl = 30 * 60 * 1000; // 30 minutes
    }
    // Returns a cache entry image if it exists and is not expired.
    is_cached(latex, color, fontSize) {
        // Clean up old entries if cache is full
        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }
        const key = this.generateKey(latex, color, fontSize);
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            cached.hits++;
            return [true, cached.image];
        }
        else {
            return [false, undefined];
        }
    }
    // Adds a new entry to the cache.
    add(latex, color, fontSize, image) {
        this.cache.set(this.generateKey(latex, color, fontSize), {
            image,
            timestamp: Date.now(),
            hits: 1,
        });
    }
    generateKey(latex, color, fontSize) {
        return `${latex}|${color}|${fontSize}`;
    }
    cleanup() {
        // Remove least recently used or expired entries
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => {
            // Sort by hits (ascending) then timestamp (oldest first)
            if (a[1].hits !== b[1].hits)
                return a[1].hits - b[1].hits;
            return a[1].timestamp - b[1].timestamp;
        });
        // Remove 20% of least used entries
        const toRemove = Math.max(1, Math.floor(this.cache.size * 0.2));
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(entries[i][0]);
        }
    }
}
//# sourceMappingURL=latex.js.map