import { LineLikeMObject } from ".";
import { LineLikeMObjectGroup } from "./base";
// TODO Make the curve function store calculated handles, and avoid re-calculating unless necessary.
// A sequence of Bezier curves passing through a sequence of points P_0, P_1, ..., P_n.
export class BezierSpline extends LineLikeMObject {
    constructor(num_steps, solver) {
        super();
        this.num_steps = num_steps;
        this.solver = solver;
        this.anchors = [];
        for (let i = 0; i < num_steps + 1; i++) {
            this.anchors.push([0, 0]);
        }
    }
    set_anchors(new_anchors) {
        this.anchors = new_anchors;
    }
    set_anchor(index, new_anchor) {
        this.anchors[index] = new_anchor;
    }
    get_anchor(index) {
        return this.anchors[index];
    }
    // Draw the Bezier curve using the solver
    _draw(ctx, scene) {
        // If solver is null, draw a piecewise linear
        if (!this.solver) {
            this._drawFallback(ctx, scene);
            return;
        }
        let a_x, a_y, a;
        a = this.get_anchor(0);
        [a_x, a_y] = scene.v2c(a);
        ctx.beginPath();
        ctx.moveTo(a_x, a_y);
        // Generate handles
        let anchors_flat = this.anchors.reduce((acc, val) => acc.concat(val), []);
        try {
            // Generate handles
            // TODO store these
            let handles_flat = this.solver.get_bezier_handles(anchors_flat);
            let handles = [];
            for (let i = 0; i < handles_flat.length; i += 2) {
                handles.push([handles_flat[i], handles_flat[i + 1]]);
            }
            // Draw
            let h1_x, h1_y, h2_x, h2_y;
            for (let i = 0; i < this.num_steps; i++) {
                [h1_x, h1_y] = scene.v2c(handles[i]);
                [h2_x, h2_y] = scene.v2c(handles[i + this.num_steps]);
                a = this.get_anchor(i + 1);
                [a_x, a_y] = scene.v2c(a);
                ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
            }
            ctx.stroke();
        }
        catch (error) {
            console.warn("Error with solver, drawing with fallback method.");
            this._drawFallback(ctx, scene);
        }
    }
    // Draw a simple piecewise linear as fallback
    _drawFallback(ctx, scene) {
        if (this.anchors.length === 0)
            return;
        let [x, y] = scene.v2c(this.get_anchor(0));
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 1; i < this.anchors.length; i++) {
            [x, y] = scene.v2c(this.get_anchor(i));
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}
// Graph of a parametric function, drawn either piecewise-linear or as a Bezier spline.
export class ParametricFunction extends BezierSpline {
    constructor(f, tmin, tmax, num_steps, solver) {
        super(num_steps, solver);
        this.mode = "smooth";
        this.function = f;
        this.tmin = tmin;
        this.tmax = tmax;
        this._make_anchors();
    }
    _make_anchors() {
        let anchors = [this.function(this.tmin)];
        for (let i = 1; i <= this.num_steps; i++) {
            anchors.push(this.function(this.tmin + (i / this.num_steps) * (this.tmax - this.tmin)));
        }
        this.set_anchors(anchors);
    }
    // Jagged doesn't use Bezier curves. It is faster to compute and render.
    set_mode(mode) {
        this.mode = mode;
    }
    set_function(new_f) {
        this.function = new_f;
        this._make_anchors();
    }
    set_lims(tmin, tmax) {
        this.tmin = tmin;
        this.tmax = tmax;
        this._make_anchors();
    }
    _draw(ctx, scene) {
        if (this.mode == "jagged") {
            this._drawFallback(ctx, scene);
        }
        else {
            super._draw(ctx, scene);
        }
    }
}
// A disconnected sequence of Bezier splines, each having the same number of points
// A parametric function with multiple branches. Useful for drawing functions with discontinuities,
// where the function may be changed over time and the number of discontinuities may change.
export class MultipleBranchParametricFunction extends LineLikeMObjectGroup {
    constructor(num_steps, solver) {
        super();
        this.num_branches = 0;
        this.mode = "smooth";
        this.num_steps = num_steps;
        this.solver = solver;
    }
    add_branch(f, tlims) {
        this.add_mobj(`f_${this.num_branches}`, new ParametricFunction(f, tlims[0], tlims[1], this.num_steps, this.solver));
        this.num_branches += 1;
    }
    del_branch(i) {
        this.remove_mobj(`f_${i}`);
        for (let j = i; j < this.num_branches - 1; j++) {
            let mobj = this.get_mobj(`f_${j + 1}`);
            this.add_mobj(`f_${j}`, mobj);
        }
        this.remove_mobj(`f_${this.num_branches - 1}`);
        this.num_branches -= 1;
    }
    set_mode(mode, i) {
        this.get_mobj(`f_${i}`).set_mode(mode);
    }
    set_function(new_f, i) {
        this.get_mobj(`f_${i}`).set_function(new_f);
    }
    set_lims(tmin, tmax, i) {
        this.get_mobj(`f_${i}`).set_lims(tmin, tmax);
    }
    // TODO
    // - Search for discontinuities in the domain
    // - Break the function piecewise
    set_global_function(f, tlims) { }
}
//# sourceMappingURL=bezier.js.map