import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_STROKE_COLOR, DEFAULT_STROKE_WIDTH, DEFAULT_FILL_COLOR, } from "./style_options";
// *** FUNCTIONS ***
// Clamps a number to the interval [xmin, xmax].
export function clamp(x, xmin, xmax) {
    return Math.min(xmax, Math.max(xmin, x));
}
// The function 1 / (1 + e^{-x}). Used to map (-inf, inf) to (0, 1).
export function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}
// Same as np.linspace. Generates an arithmetic sequence.
export function linspace(start, stop, num) {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + i * step);
}
// Generates an arithmetic sequence and then applies the function to each element.
export function funspace(func, start, stop, num) {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => func(start + i * step));
}
// Generate a single number according to a Gaussian distribution
export function gaussianRandom(mean, stdev) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}
// Normal distribution
export function gaussian_normal_pdf(mean, stdev, x) {
    return (Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdev, 2))) /
        (stdev * Math.sqrt(2 * Math.PI)));
}
// Delays for the given number of milliseconds. Useful for visibility in test animations.
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// Smooth function [0, 1] -> [0, 1], for animation
export function smooth(t, inflection = 10.0) {
    let error = sigmoid(-inflection / 2);
    return Math.min(Math.max((sigmoid(inflection * (t - 0.5)) - error) / (1 - 2 * error), 0), 1);
}
// *** CTX OPTIONS ***
// Options for ctx.stroke() drawing.
export class StrokeOptions {
    constructor() {
        this.stroke_width = DEFAULT_STROKE_WIDTH;
        this.stroke_color = DEFAULT_STROKE_COLOR;
        this.stroke_style = "solid";
    }
    set_stroke_color(color) {
        this.stroke_color = color;
        return this;
    }
    set_stroke_width(width) {
        this.stroke_width = width;
        return this;
    }
    set_stroke_style(style) {
        this.stroke_style = style;
        return this;
    }
    apply_to(ctx, scene) {
        ctx.lineWidth = this.stroke_width * scene.scale();
        ctx.strokeStyle = this.stroke_color;
        if (this.stroke_style == "solid") {
            ctx.setLineDash([]);
        }
        else if (this.stroke_style == "dashed") {
            ctx.setLineDash([5, 5]);
        }
        else if (this.stroke_style == "dotted") {
            ctx.setLineDash([2, 2]);
        }
    }
}
// Options for ctx.fill() drawing.
export class FillOptions {
    constructor() {
        this.fill_color = DEFAULT_FILL_COLOR;
        this.fill_alpha = 1.0;
        this.fill = true;
    }
    set_fill_color(color) {
        this.fill_color = color;
        return this;
    }
    set_fill_alpha(alpha) {
        this.fill_alpha = alpha;
        return this;
    }
    set_fill(fill) {
        this.fill = fill;
        return this;
    }
    apply_to(ctx) {
        ctx.fillStyle = this.fill_color;
    }
}
// *** MATH OBJECTS ***
// Base class for mathematical objects
export class MObject {
    constructor() {
        this.alpha = 1;
    }
    set_alpha(alpha) {
        this.alpha = alpha;
        return this;
    }
    move_by(p) { }
    add(scene) { }
    draw(canvas, scene, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this._draw(ctx, scene, args);
    }
    _draw(ctx, scene, args) { }
}
// A MObject which is formed as a group of simpler MObjects.
// NOTE: In Manim, this is called "MGroup". We deviate from Manim's
// naming convention here to avoid confusion with groups from mathematical group theory.
export class MObjectGroup extends MObject {
    constructor() {
        super(...arguments);
        this.children = {};
    }
    add_mobj(name, child) {
        this.children[name] = child;
    }
    remove_mobj(name) {
        delete this.children[name];
    }
    move_by(p) {
        Object.values(this.children).forEach((child) => child.move_by(p));
    }
    clear() {
        Object.keys(this.children).forEach((key) => {
            delete this.children[key];
        });
    }
    get_mobj(name) {
        if (!this.children[name]) {
            throw new Error(`Child with name ${name} not found`);
        }
        return this.children[name];
    }
    draw(canvas, scene, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        Object.values(this.children).forEach((child) => child.draw(canvas, scene, args));
    }
}
// A MObject that is drawn using the ctx.stroke() command.
export class LineLikeMObject extends MObject {
    constructor() {
        super(...arguments);
        this.stroke_options = new StrokeOptions();
    }
    set_stroke_color(color) {
        this.stroke_options.set_stroke_color(color);
        return this;
    }
    set_stroke_width(width) {
        this.stroke_options.set_stroke_width(width);
        return this;
    }
    set_stroke_style(style) {
        this.stroke_options.set_stroke_style(style);
        return this;
    }
    draw(canvas, scene, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this.stroke_options.apply_to(ctx, scene);
        this._draw(ctx, scene, args);
    }
}
// Line-like mobjects all using the same stroke options.
export class LineLikeMObjectGroup extends MObjectGroup {
    constructor() {
        super(...arguments);
        this.stroke_options = new StrokeOptions();
    }
    set_stroke_color(color) {
        this.stroke_options.set_stroke_color(color);
        return this;
    }
    set_stroke_width(width) {
        this.stroke_options.set_stroke_width(width);
        return this;
    }
    set_stroke_style(style) {
        this.stroke_options.set_stroke_style(style);
        return this;
    }
    draw(canvas, scene, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this.stroke_options.apply_to(ctx, scene);
        Object.values(this.children).forEach((child) => {
            child._draw(ctx, scene, args);
        });
    }
}
// A MObject that is drawn using the ctx.stroke() and ctx.fill() commands.
export class FillLikeMObject extends MObject {
    constructor() {
        super(...arguments);
        this.stroke_options = new StrokeOptions();
        this.fill_options = new FillOptions();
    }
    set_stroke_color(color) {
        this.stroke_options.set_stroke_color(color);
        return this;
    }
    set_stroke_width(width) {
        this.stroke_options.set_stroke_width(width);
        return this;
    }
    set_stroke_style(style) {
        this.stroke_options.set_stroke_style(style);
        return this;
    }
    set_fill_color(color) {
        this.fill_options.set_fill_color(color);
        return this;
    }
    set_color(color) {
        this.stroke_options.set_stroke_color(color);
        this.fill_options.set_fill_color(color);
        return this;
    }
    set_fill_alpha(alpha) {
        this.fill_options.set_fill_alpha(alpha);
        return this;
    }
    set_fill(fill) {
        this.fill_options.set_fill(fill);
        return this;
    }
    draw(canvas, scene, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this.stroke_options.apply_to(ctx, scene);
        this.fill_options.apply_to(ctx);
        this._draw(ctx, scene, args);
    }
}
// Fill-like mobjects all using the same fill options.
export class FillLikeMObjectGroup extends MObjectGroup {
    constructor() {
        super(...arguments);
        this.stroke_options = new StrokeOptions();
        this.fill_options = new FillOptions();
    }
    set_stroke_color(color) {
        this.stroke_options.set_stroke_color(color);
        return this;
    }
    set_stroke_width(width) {
        this.stroke_options.set_stroke_width(width);
        return this;
    }
    set_stroke_style(style) {
        this.stroke_options.set_stroke_style(style);
        return this;
    }
    set_fill_color(color) {
        this.fill_options.set_fill_color(color);
        return this;
    }
    set_color(color) {
        this.stroke_options.set_stroke_color(color);
        this.fill_options.set_fill_color(color);
        return this;
    }
    set_fill_alpha(alpha) {
        this.fill_options.set_fill_alpha(alpha);
        return this;
    }
    set_fill(fill) {
        this.fill_options.set_fill(fill);
        return this;
    }
    draw(canvas, scene, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this.stroke_options.apply_to(ctx, scene);
        this.fill_options.apply_to(ctx);
        Object.values(this.children).forEach((child) => child._draw(ctx, scene, args));
    }
}
// *** SCENES ***
// A Scene is an abstract class which houses mathematical objects defined by some set of parameters.
// It includes frameworks for
// - drawing to a canvas, or multiple separate canvases (TODO, in this case it may be better to have separate linked scenes)
// - making available to the user interactive elements, such as buttons or sliders, which change parameters
// - running autonomous simulations which evolve these mathematical objects
// - running user-defined animations
// TODO Incorporate the ability to add interactive elements to the scene.
// - Sliders
// - Buttons
// -
export class Scene {
    constructor(canvas) {
        this.background_color = DEFAULT_BACKGROUND_COLOR;
        this.border_width = DEFAULT_BORDER_WIDTH;
        this.border_color = DEFAULT_BORDER_COLOR;
        // Zoom ratio
        this.zoom_ratio = 1.0;
        // Determines whether any draggable object in the scene is clicked
        this.is_dragging = false;
        this.canvas = canvas;
        this.mobjects = {};
        this.xlims = [0, canvas.width];
        this.ylims = [0, canvas.height];
        this.view_xlims = [0, canvas.width];
        this.view_ylims = [0, canvas.height];
    }
    click() {
        this.is_dragging = true;
    }
    unclick() {
        this.is_dragging = false;
    }
    // Sets the coordinates for the borders of the scene. This also resets
    // the current viewing window to match the scene size.
    set_frame_lims(xlims, ylims) {
        this.xlims = xlims;
        this.ylims = ylims;
        this.view_xlims = xlims;
        this.view_ylims = ylims;
    }
    // Sets the current viewing window
    set_view_lims(xlims, ylims) {
        this.zoom_ratio = (this.xlims[1] - this.xlims[0]) / (xlims[1] - xlims[0]);
        this.view_xlims = xlims;
        this.view_ylims = ylims;
    }
    // Returns the center of the viewing window
    get_view_center() {
        return [
            (this.view_xlims[0] + this.view_xlims[1]) / 2,
            (this.view_ylims[0] + this.view_ylims[1]) / 2,
        ];
    }
    // Sets the current zoom level
    set_zoom(value) {
        this.zoom_ratio = value;
        this.view_xlims = [this.xlims[0] / value, this.xlims[1] / value];
        this.view_ylims = [this.ylims[0] / value, this.ylims[1] / value];
    }
    // Performs a homothety around the specified center point of the viewing window, with the given factor
    zoom_in_on(ratio, center) {
        this.zoom_ratio *= ratio;
        this.view_xlims = [
            center[0] + (this.view_xlims[0] - center[0]) / ratio,
            center[0] + (this.view_xlims[1] - center[0]) / ratio,
        ];
        this.view_ylims = [
            center[1] + (this.view_ylims[0] - center[1]) / ratio,
            center[1] + (this.view_ylims[1] - center[1]) / ratio,
        ];
    }
    // Moves the viewing window by the specified vector
    move_view(v) {
        this.view_xlims = [this.view_xlims[0] + v[0], this.view_xlims[1] + v[0]];
        this.view_ylims = [this.view_ylims[0] + v[1], this.view_ylims[1] + v[1]];
    }
    // Number of canvas pixels occupied by a horizontal shift of 1 in scene coordinates
    scale() {
        let [xmin, xmax] = this.view_xlims;
        return this.canvas.width / (xmax - xmin);
    }
    // Converts scene coordinates to canvas coordinates
    s2c(x, y) {
        return [
            (this.canvas.width * (x - this.xlims[0])) /
                (this.xlims[1] - this.xlims[0]),
            (this.canvas.height * (this.ylims[1] - y)) /
                (this.ylims[1] - this.ylims[0]),
        ];
    }
    // Converts viewing coordinates to canvas coordinates
    v2c(v) {
        return [
            (this.canvas.width * (v[0] - this.view_xlims[0])) /
                (this.view_xlims[1] - this.view_xlims[0]),
            (this.canvas.height * (this.view_ylims[1] - v[1])) /
                (this.view_ylims[1] - this.view_ylims[0]),
        ];
    }
    // Converts canvas coordinates to scene coordinates
    c2s(x, y) {
        return [
            this.xlims[0] + (x * (this.xlims[1] - this.xlims[0])) / this.canvas.width,
            this.ylims[1] -
                (y * (this.ylims[1] - this.ylims[0])) / this.canvas.height,
        ];
    }
    // Converts canvas coordinates to viewing coordinates
    c2v(x, y) {
        return [
            this.view_xlims[0] +
                (x * (this.view_xlims[1] - this.view_xlims[0])) / this.canvas.width,
            this.view_ylims[1] -
                (y * (this.view_ylims[1] - this.view_ylims[0])) / this.canvas.height,
        ];
    }
    // Adds a mobject to the scene
    add(name, mobj) {
        this.mobjects[name] = mobj;
        let self = this;
        mobj.add(self);
    }
    // Removes the mobject from the scene
    remove(name) {
        delete this.mobjects[name];
    }
    // Groups a collection of mobjects as a MObjectGroup
    group(names, group_name) {
        let group = new MObjectGroup();
        names.forEach((name) => {
            let mobj = this.get_mobj(name);
            group.add_mobj(name, mobj);
            delete this.mobjects[name];
        });
        this.add(group_name, group);
    }
    // Ungroups a MObjectGroup
    ungroup(group_name) {
        let group = this.mobjects[group_name];
        if (group == undefined)
            throw new Error(`${group_name} not found`);
        Object.entries(group.children).forEach(([mobj_name, mobj]) => {
            this.add(mobj_name, mobj);
        });
        delete this.mobjects[group_name];
    }
    // Removes all mobjects from the scene
    clear() {
        this.mobjects = {};
    }
    // Checks if a mobject exists in the scene
    has_mobj(name) {
        return this.mobjects.hasOwnProperty(name);
    }
    // Gets the mobject by name
    get_mobj(name) {
        let mobj = this.mobjects[name];
        if (mobj == undefined)
            throw new Error(`${name} not found`);
        return mobj;
    }
    // Draws the scene
    draw(args) {
        let ctx = this.canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw_background(ctx);
        this._draw();
        this.draw_border(ctx);
    }
    _draw() {
        // Draw the mobjects
        Object.keys(this.mobjects).forEach((name) => {
            let mobj = this.mobjects[name];
            if (mobj == undefined)
                throw new Error(`${name} not found`);
            this.draw_mobject(mobj);
        });
    }
    draw_mobject(mobj) {
        mobj.draw(this.canvas, this);
    }
    // Draw a background
    draw_background(ctx) {
        ctx.fillStyle = this.background_color;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // Draw a border around the canvas
    draw_border(ctx) {
        ctx.strokeStyle = this.border_color;
        ctx.lineWidth = this.border_width;
        ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
// Prepares a named element of the document to be a drawing canvas
// of the desired size.
export function prepare_canvas(width, height, name) {
    const container = document.getElementById(name);
    if (container == null)
        throw new Error(`${name} not found`);
    // Set size
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    // Make a visual element
    let wrapper = document.createElement("div");
    wrapper.classList.add("canvas_container");
    wrapper.classList.add("non_selectable");
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    let canvas = document.createElement("canvas");
    canvas.classList.add("non_selectable");
    canvas.style.position = "relative";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.height = height;
    canvas.width = width;
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);
    prepareCanvasForMobile(canvas);
    return canvas;
}
// Prepares a canvas for interactive elements on mobile by removing all other touch interactivity
export function prepareCanvasForMobile(canvas) {
    canvas.ontouchstart = function (e) {
        e.preventDefault();
    };
    canvas.ontouchend = function (e) {
        e.preventDefault();
    };
    canvas.ontouchmove = function (e) {
        e.preventDefault();
    };
}
export function mouse_event_coords(event) {
    return [event.pageX, event.pageY];
}
export function touch_event_coords(event) {
    let touch = event.touches[0];
    return [touch.pageX, touch.pageY];
}
//# sourceMappingURL=base.js.map