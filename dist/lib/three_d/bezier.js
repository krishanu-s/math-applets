import { ThreeDMObject } from "./mobjects";
// A sequence of Bezier curves passing through a sequence of points P_0, P_1, ..., P_n.
export class BezierSpline3D extends ThreeDMObject {
    constructor(num_steps, solver) {
        super();
        this.num_steps = num_steps;
        this.solver = solver;
        this.anchors = [];
        for (let i = 0; i < num_steps + 1; i++) {
            this.anchors.push([0, 0, 0]);
        }
    }
    set_anchors(new_anchors) {
        this.anchors = new_anchors;
        return this;
    }
    set_anchor(index, new_anchor) {
        this.anchors[index] = new_anchor;
        return this;
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
        a = scene.camera_view(this.get_anchor(0));
        if (a == null) {
            return;
        }
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
            for (let i = 0; i < handles_flat.length; i += 3) {
                handles.push([
                    handles_flat[i],
                    handles_flat[i + 1],
                    handles_flat[i + 2],
                ]);
            }
            // Draw
            let h1_x, h1_y, h2_x, h2_y;
            let h1, h2;
            for (let i = 0; i < this.num_steps; i++) {
                h1 = scene.camera_view(handles[i]);
                if (h1 == null) {
                    return;
                }
                [h1_x, h1_y] = scene.v2c(h1);
                h2 = scene.camera_view(handles[i + this.num_steps]);
                if (h2 == null) {
                    return;
                }
                [h2_x, h2_y] = scene.v2c(h2);
                a = scene.camera_view(this.get_anchor(i + 1));
                if (a == null) {
                    return;
                }
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
        let [x, y] = scene.v2c(scene.camera_view(this.get_anchor(0)));
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 1; i < this.anchors.length; i++) {
            [x, y] = scene.v2c(scene.camera_view(this.get_anchor(i)));
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}
// Graph of a parametric function, drawn either piecewise-linear or as a Bezier spline.
export class ParametricFunction3D extends BezierSpline3D {
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
//# sourceMappingURL=bezier.js.map