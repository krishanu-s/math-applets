// Three-dimensional Mobjects
import { MObject, StrokeOptions, FillOptions, vec2_norm, vec2_sum, vec2_sub, vec2_scale, vec2_rot, } from "../base";
import { vec3_scale, vec3_sum, vec3_sub, vec3_sum_list, get_column, } from "./matvec";
import { makeDraggable3D } from "../interactive/draggable";
// TODO Turn these into class-extenders similar to what's done for makeDraggable.
// Base class for three-dimensional Mobjects
export class ThreeDMObject extends MObject {
    constructor() {
        super(...arguments);
        this.blocked_depth_tolerance = 0.01;
        this.linked_mobjects = [];
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
    // Return the depth of the object in the scene. Used for sorting.
    depth(scene) {
        return 0;
    }
    // Return the depth of the nearest point on the object that lies along the
    // given ray. Used for relative depth-testing between 3D objects, to determine
    // how to draw them.
    depth_at(scene, view_point) {
        return 0;
    }
    // Add a linked Mobject. These are fill-like MObjects in the scene which might obstruct the view
    // of the curve, and are used internally to _draw() for depth-testing.
    link_mobject(mobject) {
        this.linked_mobjects.push(mobject);
    }
    // Calculates the minimum depth value among linked FillLike objects at the given 2D scene view point.
    blocked_depth_at(scene, view_point) {
        return Math.min(...this.linked_mobjects.map((m) => m.depth_at(scene, view_point)));
    }
    // Calculates whether the given 3D scene point is either obstructed by any linked FillLike objects
    // or is out of scene
    is_blocked(scene, point) {
        let vp = scene.camera_view(point);
        if (vp == null) {
            return true;
        }
        else {
            return (scene.camera.depth(point) >
                this.blocked_depth_at(scene, vp) + this.blocked_depth_tolerance);
        }
    }
    draw(canvas, scene, simple = false, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this.stroke_options.apply_to(ctx, scene);
        if (this instanceof Line3D && simple) {
            this._draw_simple(ctx, scene);
        }
        else {
            this._draw(ctx, scene, args);
        }
    }
    // Simpler drawing method for 3D scenes which doesn't use local depth testing, for speed purposes.
    _draw_simple(ctx, scene) { }
}
// Identical extension as MObject -> MObjectGroup
export class ThreeDMObjectGroup extends ThreeDMObject {
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
    // TODO Depth-calculation should be done object-by-object.
    depth(scene) {
        return Math.max(...Object.values(this.children).map((child) => child.depth(scene)));
    }
    // TODO Sort by depth first.
    draw(canvas, scene, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        // Order children by depth
        let ordered_names = Object.keys(this.children).sort((a, b) => {
            let depth_a = this.children[a].depth(scene);
            let depth_b = this.children[b].depth(scene);
            return depth_b - depth_a;
        });
        // Then draw
        for (let name of ordered_names) {
            this.children[name].draw(canvas, scene, args);
        }
        // Object.values(this.children).forEach((child) => {
        //   child.draw(canvas, scene, args);
        // });
    }
}
// Identical extension as MObject -> LineLikeMObject
export class ThreeDLineLikeMObject extends ThreeDMObject {
    // Sets the context drawer settings for drawing behind linked FillLike objects.
    set_behind_linked_mobjects(ctx) {
        ctx.globalAlpha /= 2;
        ctx.setLineDash([5, 5]);
    }
    unset_behind_linked_mobjects(ctx) {
        ctx.globalAlpha *= 2;
        ctx.setLineDash([]);
    }
    draw(canvas, scene, simple = false, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this.stroke_options.apply_to(ctx, scene);
        if (this instanceof Line3D && simple) {
            this._draw_simple(ctx, scene);
        }
        else {
            this._draw(ctx, scene, args);
        }
    }
}
// Identical extension as MObjectGroup -> LineLikeMObjectGroup
export class ThreeDLineLikeMObjectGroup extends ThreeDMObjectGroup {
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
// Identical extension as MObject -> FillLikeMObject
export class ThreeDFillLikeMObject extends ThreeDMObject {
    constructor() {
        super(...arguments);
        this.fill_options = new FillOptions();
    }
    set_fill_color(color) {
        this.fill_options.fill_color = color;
        return this;
    }
    set_color(color) {
        this.stroke_options.stroke_color = color;
        this.fill_options.fill_color = color;
        return this;
    }
    set_fill_alpha(alpha) {
        this.fill_options.fill_alpha = alpha;
        return this;
    }
    set_fill(fill) {
        this.fill_options.fill = fill;
        return this;
    }
    // Sets the context drawer settings for drawing behind linked FillLike objects.
    set_behind_linked_mobjects(ctx) {
        ctx.globalAlpha /= 2;
    }
    unset_behind_linked_mobjects(ctx) {
        ctx.globalAlpha *= 2;
    }
    draw(canvas, scene, simple = false, args) {
        let ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get 2D context");
        ctx.globalAlpha = this.alpha;
        this.stroke_options.apply_to(ctx, scene);
        this.fill_options.apply_to(ctx);
        if (this instanceof Dot3D && simple) {
            this._draw_simple(ctx, scene);
        }
        else {
            this._draw(ctx, scene, args);
        }
    }
}
// Identical extension as MObjectGroup -> FillLikeMObjectGroup
export class ThreeDFillLikeMObjectGroup extends ThreeDMObjectGroup {
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
// A dot.
export class Dot3D extends ThreeDFillLikeMObject {
    constructor(center, radius) {
        super();
        this.center = center;
        this.radius = radius;
    }
    get_center() {
        return this.center;
    }
    get_radius() {
        return this.radius;
    }
    // Tests whether a chosen view point lies inside the shape. Used for click-detection.
    is_inside(scene, view_point) {
        let center_view = scene.camera_view(this.center);
        let edge_view = scene.camera_view(vec3_sum(this.center, [0, 0, this.radius]));
        if (center_view == null || edge_view == null) {
            return false;
        }
        else {
            return (vec2_norm(vec2_sub(view_point, center_view)) <
                vec2_norm(vec2_sub(edge_view, center_view)));
        }
    }
    // Tests whether a chosen vector lies within an enlarged version of the dot.
    // Used for touch-detection on mobile devices, and for use by small children.
    is_almost_inside(scene, view_point, tolerance) {
        let center_view = scene.camera_view(this.center);
        let edge_view = scene.camera_view(vec3_sum(this.center, [0, 0, this.radius]));
        if (center_view == null || edge_view == null) {
            return false;
        }
        else {
            return (vec2_norm(vec2_sub(view_point, center_view)) <
                vec2_norm(vec2_sub(edge_view, center_view)) * tolerance);
        }
    }
    depth(scene) {
        return scene.camera.depth(this.center);
    }
    depth_at(scene, view_point) {
        if (scene.mode == "perspective") {
            // TODO
            return 0;
        }
        else if (scene.mode == "orthographic") {
            let dist = vec2_norm(vec2_sub(view_point, scene.camera.orthographic_view(this.center)));
            if (dist > this.radius) {
                return Infinity;
            }
            else {
                let depth_adjustment = Math.sqrt(Math.max(0, this.radius ** 2 - dist ** 2));
                return scene.camera.depth(this.center) - depth_adjustment;
            }
        }
        return 0;
    }
    move_to(new_center) {
        this.center = new_center;
    }
    move_by(p) {
        this.center[0] += p[0];
        this.center[1] += p[1];
        this.center[2] += p[2];
    }
    _draw_simple(ctx, scene) {
        let p = scene.camera_view(this.center);
        let pr = scene.camera_view(vec3_sum(this.center, vec3_scale(get_column(scene.camera.get_camera_frame(), 0), this.radius)));
        let state;
        if (p != null && pr != null) {
            let [cx, cy] = scene.v2c(p);
            let [rx, ry] = scene.v2c(pr);
            let rc = vec2_norm(vec2_sub([rx, ry], [cx, cy]));
            ctx.beginPath();
            ctx.arc(cx, cy, rc, 0, 2 * Math.PI);
            ctx.stroke();
            if (this.fill_options.fill) {
                ctx.globalAlpha = ctx.globalAlpha * this.fill_options.fill_alpha;
                ctx.fill();
                ctx.globalAlpha = ctx.globalAlpha / this.fill_options.fill_alpha;
            }
        }
    }
    _draw(ctx, scene) {
        // TODO Make this more efficient.
        let p = scene.camera_view(this.center);
        let pr = scene.camera_view(vec3_sum(this.center, vec3_scale(get_column(scene.camera.get_camera_frame(), 0), this.radius)));
        let state;
        if (p != null && pr != null) {
            let depth = scene.camera.depth(this.center);
            if (depth >
                this.blocked_depth_at(scene, p) + this.blocked_depth_tolerance) {
                state = "blocked";
            }
            else {
                state = "unblocked";
            }
            let [cx, cy] = scene.v2c(p);
            let [rx, ry] = scene.v2c(pr);
            let rc = vec2_norm(vec2_sub([rx, ry], [cx, cy]));
            ctx.beginPath();
            if (state == "blocked") {
                this.set_behind_linked_mobjects(ctx);
            }
            ctx.arc(cx, cy, rc, 0, 2 * Math.PI);
            ctx.stroke();
            if (this.fill_options.fill) {
                ctx.globalAlpha = ctx.globalAlpha * this.fill_options.fill_alpha;
                ctx.fill();
                ctx.globalAlpha = ctx.globalAlpha / this.fill_options.fill_alpha;
            }
            if (state == "blocked") {
                this.unset_behind_linked_mobjects(ctx);
            }
        }
    }
}
// A draggable 3D dot.
export const DraggableDot3D = makeDraggable3D(Dot3D);
// A line
export class Line3D extends ThreeDLineLikeMObject {
    constructor(start, end) {
        super();
        this.start = start;
        this.end = end;
    }
    // Moves the start and end points
    move_start(v) {
        this.start = v;
    }
    move_end(v) {
        this.end = v;
    }
    depth(scene) {
        return scene.camera.depth(vec3_scale(vec3_sum(this.end, this.start), 0.5));
    }
    _draw(ctx, scene) {
        let s = scene.camera_view(this.start);
        let e = scene.camera_view(this.end);
        if (s == null || e == null)
            return;
        let [start_x, start_y] = scene.v2c(s);
        let [end_x, end_y] = scene.v2c(e);
        // Check if they are blocked.
        let start_blocked = this.is_blocked(scene, this.start);
        let end_blocked = this.is_blocked(scene, this.end);
        // If both points are unblocked, draw the whole line in unblocked style.
        if (!start_blocked && !end_blocked) {
            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(end_x, end_y);
            ctx.stroke();
        }
        // If both points are blocked, draw the whole line in blocked style.
        else if (start_blocked && end_blocked) {
            ctx.beginPath();
            this.set_behind_linked_mobjects(ctx);
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(end_x, end_y);
            ctx.stroke();
            this.unset_behind_linked_mobjects(ctx);
        }
        // If one point is unblocked and the other is blocked, binary-search for a point between them
        // where the transition happens. Then draw part of the line in unblocked style and part in blocked style.
        else {
            // Binary search for the point where the line segment changes from unblocked to blocked
            let n = 1;
            let v = vec3_sub(this.end, this.start);
            let p = vec3_scale(vec3_sum(this.start, this.end), 0.5);
            while (n < 6) {
                n += 1;
                if (this.is_blocked(scene, p) == start_blocked) {
                    p = vec3_sum(p, vec3_scale(v, 1 / 2 ** n));
                }
                else {
                    p = vec3_sub(p, vec3_scale(v, 1 / 2 ** n));
                }
            }
            let [p_x, p_y] = scene.v2c(scene.camera_view(p));
            if (start_blocked) {
                ctx.beginPath();
                ctx.moveTo(start_x, start_y);
                this.set_behind_linked_mobjects(ctx);
                ctx.lineTo(p_x, p_y);
                ctx.stroke();
                ctx.beginPath();
                this.unset_behind_linked_mobjects(ctx);
                ctx.moveTo(p_x, p_y);
                ctx.lineTo(end_x, end_y);
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.moveTo(end_x, end_y);
                this.set_behind_linked_mobjects(ctx);
                ctx.lineTo(p_x, p_y);
                ctx.stroke();
                ctx.beginPath();
                this.unset_behind_linked_mobjects(ctx);
                ctx.moveTo(p_x, p_y);
                ctx.lineTo(start_x, start_y);
                ctx.stroke();
            }
        }
    }
    // Simpler drawing routine which doesn't use local depth testing or test against FillLike objects
    _draw_simple(ctx, scene) {
        let s = scene.camera_view(this.start);
        let e = scene.camera_view(this.end);
        if (s == null || e == null)
            return;
        let [start_x, start_y] = scene.v2c(s);
        let [end_x, end_y] = scene.v2c(e);
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(end_x, end_y);
        ctx.stroke();
    }
}
// A sequence of line segments with joined endpoints.
export class LineSequence3D extends ThreeDLineLikeMObject {
    constructor(points) {
        super();
        this.points = points;
    }
    add_point(point) {
        this.points.push(point);
    }
    remove_point(index) {
        this.points.splice(index, 1);
    }
    move_point(i, new_point) {
        this.points[i] = new_point;
    }
    get_point(i) {
        return this.points[i];
    }
    depth(scene) {
        if (this.points.length == 0) {
            return 0;
        }
        else if (this.points.length == 1) {
            return scene.camera.depth(this.points[0]);
        }
        else {
            return scene.camera.depth(vec3_scale(vec3_sum(this.points[0], this.points[1]), 0.5));
        }
    }
    _draw(ctx, scene) {
        ctx.beginPath();
        let current_point = this.points[0];
        let current_point_camera_view = scene.camera_view(current_point);
        let cp_x = 0, cp_y = 0;
        if (current_point_camera_view != null) {
            [cp_x, cp_y] = scene.v2c(current_point_camera_view);
        }
        let current_point_blocked = this.is_blocked(scene, current_point);
        let midpoint;
        let mp_x, mp_y;
        let next_point;
        let next_point_camera_view;
        let np_x, np_y;
        let next_point_blocked;
        let v;
        let n;
        for (let i = 1; i < this.points.length; i++) {
            next_point = this.points[i];
            next_point_camera_view = scene.camera_view(next_point);
            if (current_point_camera_view == null || next_point_camera_view == null) {
                continue;
            }
            [np_x, np_y] = scene.v2c(next_point_camera_view);
            next_point_blocked = this.is_blocked(scene, next_point);
            if (!current_point_blocked && !next_point_blocked) {
                ctx.beginPath();
                ctx.moveTo(cp_x, cp_y);
                ctx.lineTo(np_x, np_y);
                ctx.stroke();
            }
            else if (current_point_blocked && next_point_blocked) {
                ctx.beginPath();
                this.set_behind_linked_mobjects(ctx);
                ctx.moveTo(cp_x, cp_y);
                ctx.lineTo(np_x, np_y);
                ctx.stroke();
                this.unset_behind_linked_mobjects(ctx);
            }
            else {
                n = 1;
                v = vec3_sub(next_point, current_point);
                midpoint = vec3_scale(vec3_sum(next_point, current_point), 0.5);
                while (n < 6) {
                    n += 1;
                    if (this.is_blocked(scene, midpoint) == current_point_blocked) {
                        midpoint = vec3_sum(midpoint, vec3_scale(v, 1 / 2 ** n));
                    }
                    else {
                        midpoint = vec3_sub(midpoint, vec3_scale(v, 1 / 2 ** n));
                    }
                }
                [mp_x, mp_y] = scene.v2c(scene.camera_view(midpoint));
                if (current_point_blocked) {
                    ctx.beginPath();
                    ctx.moveTo(cp_x, cp_y);
                    this.set_behind_linked_mobjects(ctx);
                    ctx.lineTo(mp_x, mp_y);
                    ctx.stroke();
                    ctx.beginPath();
                    this.unset_behind_linked_mobjects(ctx);
                    ctx.moveTo(mp_x, mp_y);
                    ctx.lineTo(np_x, np_y);
                    ctx.stroke();
                }
                else {
                    ctx.beginPath();
                    ctx.moveTo(np_x, np_y);
                    this.set_behind_linked_mobjects(ctx);
                    ctx.lineTo(mp_x, mp_y);
                    ctx.stroke();
                    ctx.beginPath();
                    this.unset_behind_linked_mobjects(ctx);
                    ctx.moveTo(mp_x, mp_y);
                    ctx.lineTo(cp_x, cp_y);
                    ctx.stroke();
                }
            }
            current_point = next_point;
            current_point_camera_view = next_point_camera_view;
            [cp_x, cp_y] = [np_x, np_y];
            current_point_blocked = next_point_blocked;
        }
    }
    // Simpler drawing routine which doesn't use local depth testing or test against FillLike objects
    _draw_simple(ctx, scene) {
        ctx.beginPath();
        let in_frame = false;
        let p;
        let x, y;
        for (let i = 0; i < this.points.length; i++) {
            p = scene.camera_view(this.points[i]);
            if (p == null) {
                in_frame = false;
            }
            else {
                [x, y] = scene.v2c(p);
                if (in_frame) {
                    // TODO Do a depth-test at this point with any linked FillLike objects to determine
                    // whether to draw dashed or solid.
                    ctx.lineTo(x, y);
                }
                else {
                    ctx.moveTo(x, y);
                }
                in_frame = true;
            }
        }
        ctx.stroke();
    }
}
// An arrow
export class Arrow3D extends Line3D {
    constructor(start, end) {
        super(start, end);
        this.arrow_size = 0.3;
        this.fill_color = this.stroke_options.stroke_color;
    }
    set_arrow_size(size) {
        this.arrow_size = size;
    }
    _draw(ctx, scene) {
        super._draw(ctx, scene);
        ctx.fillStyle = this.fill_color;
        // TODO This can surely be refactored with Line3D.
        let s = scene.camera_view(this.start);
        let e = scene.camera_view(this.end);
        if (s == null || e == null)
            return;
        let [end_x, end_y] = scene.v2c(e);
        let length = vec2_norm(vec2_sub(s, e));
        let v = vec2_scale(vec2_sub(s, e), this.arrow_size / length);
        let [ax, ay] = scene.v2c(vec2_sum(e, vec2_rot(v, Math.PI / 6)));
        let [bx, by] = scene.v2c(vec2_sum(e, vec2_rot(v, -Math.PI / 6)));
        ctx.beginPath();
        ctx.moveTo(end_x, end_y);
        ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(end_x, end_y);
        ctx.closePath();
        ctx.fill();
    }
}
// A double-headed arrow
export class TwoHeadedArrow3D extends Line3D {
    constructor(start, end) {
        super(start, end);
        this.arrow_size = 0.3;
        this.fill_color = this.stroke_options.stroke_color;
    }
    set_arrow_size(size) {
        this.arrow_size = size;
    }
    _draw(ctx, scene) {
        super._draw(ctx, scene);
        ctx.fillStyle = this.fill_color;
        // TODO This can surely be refactored with Line3D.
        let s = scene.camera_view(this.start);
        let e = scene.camera_view(this.end);
        if (s == null || e == null)
            return;
        let [end_x, end_y] = scene.v2c(e);
        let [start_x, start_y] = scene.v2c(s);
        // Arrow head
        let length = vec2_norm(vec2_sub(s, e));
        let v = vec2_scale(vec2_sub(s, e), this.arrow_size / length);
        let [ax, ay] = scene.v2c(vec2_sum(e, vec2_rot(v, Math.PI / 6)));
        let [bx, by] = scene.v2c(vec2_sum(e, vec2_rot(v, -Math.PI / 6)));
        ctx.beginPath();
        ctx.moveTo(end_x, end_y);
        ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(end_x, end_y);
        ctx.closePath();
        ctx.fill();
        // Arrow tail
        v = vec2_scale(vec2_sub(e, s), this.arrow_size / length);
        [ax, ay] = scene.v2c(vec2_sum(s, vec2_rot(v, Math.PI / 6)));
        [bx, by] = scene.v2c(vec2_sum(s, vec2_rot(v, -Math.PI / 6)));
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(start_x, start_y);
        ctx.closePath();
        ctx.fill();
    }
}
// A cube.
export class Cube extends ThreeDLineLikeMObject {
    constructor(center, size) {
        super();
        this.center = center;
        this.size = size;
    }
    depth(scene) {
        return scene.camera.depth(this.center);
    }
    _draw(ctx, scene) {
        // First, generate all of the vertices of the cube as Vec3D's.
        const vertices = [
            vec3_sum(this.center, vec3_scale([1, 1, 1], this.size / 2)),
            vec3_sum(this.center, vec3_scale([1, -1, 1], this.size / 2)),
            vec3_sum(this.center, vec3_scale([-1, 1, 1], this.size / 2)),
            vec3_sum(this.center, vec3_scale([-1, -1, 1], this.size / 2)),
            vec3_sum(this.center, vec3_scale([1, 1, -1], this.size / 2)),
            vec3_sum(this.center, vec3_scale([1, -1, -1], this.size / 2)),
            vec3_sum(this.center, vec3_scale([-1, 1, -1], this.size / 2)),
            vec3_sum(this.center, vec3_scale([-1, -1, -1], this.size / 2)),
        ];
        // Second, project the vertices of the cube onto the camera's view plane to get Vec2D's.
        const projected_vertices = [];
        for (let i = 0; i < vertices.length; i++) {
            projected_vertices.push(scene.camera_view(vertices[i]));
        }
        // Third, convert these Vec2D's to canvas coordinates.
        let v;
        const canvas_vertices = [];
        for (let i = 0; i < vertices.length; i++) {
            let v = projected_vertices[i];
            if (v == null) {
                canvas_vertices.push(v);
            }
            else {
                canvas_vertices.push(scene.v2c(v));
            }
        }
        // TODO Finally, draw all of the edges.
        // i and j in {0, 1, ..., 6, 7} are connected if i ^ j has a single 1, i.e. is 1, 2, or 4.
        let start_x;
        let start_y;
        let end_x;
        let end_y;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < i; j++) {
                if ((i ^ j) == 1 || (i ^ j) == 2 || (i ^ j) == 4) {
                    if (canvas_vertices[i] == null || canvas_vertices[j] == null) {
                        continue;
                    }
                    else {
                        [start_x, start_y] = canvas_vertices[i];
                        [end_x, end_y] = canvas_vertices[j];
                        ctx.beginPath();
                        ctx.moveTo(start_x, start_y);
                        ctx.lineTo(end_x, end_y);
                        ctx.stroke();
                    }
                }
            }
        }
    }
}
// A parametrized curve
export class ParametrizedCurve3D extends ThreeDLineLikeMObject {
    constructor(f, tmin, tmax, num_steps) {
        super();
        this.points = [];
        this.mode = "jagged";
        this.linked_mobjects = [];
        this.function = f;
        this.tmin = tmin;
        this.tmax = tmax;
        this.num_steps = num_steps;
        this.calculatePoints();
    }
    // Jagged doesn't use Bezier curves. It is faster to compute and render.
    // TODO Implement Bezier curve for smoother rendering.
    set_mode(mode) {
        this.mode = mode;
    }
    set_function(new_f) {
        this.function = new_f;
        this.calculatePoints();
    }
    // Calculates the points for the curve.
    calculatePoints() {
        this.points = [];
        for (let i = 0; i <= this.num_steps; i++) {
            this.points.push(this.function(this.tmin + (i / this.num_steps) * (this.tmax - this.tmin)));
        }
    }
    _draw(ctx, scene) {
        // TODO Use a Bezier curve for smoother rendering.
        let state = "out_of_frame";
        let next_state = "out_of_frame";
        // TODO This variant of rendering with piecewise depth-testing is more computationally expensive.
        // Build in the option to use simple, global depth-testing.
        let p;
        let x, y;
        let last_x = 0;
        let last_y = 0;
        let depth;
        for (let pt of this.points) {
            p = scene.camera_view(pt);
            depth = scene.camera.depth(pt);
            if (p == null) {
                next_state = "out_of_frame";
                if (state == "unblocked") {
                    ctx.stroke();
                }
                else if (state == "blocked") {
                    ctx.stroke();
                    this.unset_behind_linked_mobjects(ctx);
                }
                state = next_state;
            }
            else {
                [x, y] = scene.v2c(p);
                if (state == "out_of_frame") {
                    next_state = "in_frame";
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    state = next_state;
                }
                else {
                    // Do a depth-test at this point with any linked FillLike objects to determine
                    // whether to switch to blocked or unblocked
                    if (depth >
                        this.blocked_depth_at(scene, p) + this.blocked_depth_tolerance) {
                        next_state = "blocked";
                    }
                    else {
                        next_state = "unblocked";
                    }
                    if (state == "in_frame" && next_state == "blocked") {
                        ctx.beginPath();
                        this.set_behind_linked_mobjects(ctx);
                        ctx.lineTo(x, y);
                    }
                    else if (state == "in_frame" && next_state == "unblocked") {
                        ctx.beginPath();
                        ctx.moveTo(last_x, last_y);
                        ctx.lineTo(x, y);
                    }
                    else if (state == "blocked" && next_state == "unblocked") {
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(last_x, last_y);
                        this.unset_behind_linked_mobjects(ctx);
                        ctx.lineTo(x, y);
                    }
                    else if (state == "unblocked" && next_state == "blocked") {
                        ctx.stroke();
                        ctx.beginPath();
                        this.set_behind_linked_mobjects(ctx);
                        ctx.moveTo(last_x, last_y);
                        ctx.lineTo(x, y);
                    }
                    else {
                        ctx.lineTo(x, y);
                    }
                    state = next_state;
                }
                [last_x, last_y] = [x, y];
            }
        }
        // Finish the path
        if (state == "blocked" || state == "unblocked") {
            ctx.stroke();
        }
        if (state == "blocked") {
            this.unset_behind_linked_mobjects(ctx);
        }
    }
    // Simpler drawing routine which doesn't use local depth testing or test against FillLike objects
    _draw_simple(ctx, scene) {
        // Generate points to draw
        // TODO Use a Bezier curve for smoother rendering.
        let points = [this.function(this.tmin)];
        for (let i = 1; i <= this.num_steps; i++) {
            points.push(this.function(this.tmin + (i / this.num_steps) * (this.tmax - this.tmin)));
        }
        let points2D = points.map((p) => {
            let r = scene.camera_view(p);
            if (r == null) {
                return null;
            }
            return scene.v2c(r);
        });
        let [px, py] = points2D[0];
        ctx.beginPath();
        ctx.moveTo(px, py);
        for (let i = 1; i <= this.num_steps; i++) {
            [px, py] = points2D[i];
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}
// A polygon in 3D where the points are assumed to be coplanar.
export class PolygonPanel3D extends ThreeDFillLikeMObject {
    constructor(points) {
        super();
        this.do_stroke = false;
        this.points = points;
    }
    // TODO Fix this and fix visibility condition
    depth(scene) {
        return scene.camera.depth(vec3_scale(vec3_sum_list(this.points), 1 / this.points.length));
    }
    set_stroke(x) {
        this.do_stroke = x;
        return this;
    }
    _draw(ctx, scene) {
        let current_point = this.points[0];
        let current_point_camera_view = scene.camera_view(current_point);
        let [cp_x, cp_y] = scene.v2c(current_point_camera_view);
        ctx.moveTo(cp_x, cp_y);
        ctx.beginPath();
        for (let i = 1; i < this.points.length; i++) {
            current_point = this.points[i];
            current_point_camera_view = scene.camera_view(current_point);
            [cp_x, cp_y] = scene.v2c(current_point_camera_view);
            ctx.lineTo(cp_x, cp_y);
        }
        current_point = this.points[0];
        current_point_camera_view = scene.camera_view(current_point);
        [cp_x, cp_y] = scene.v2c(current_point_camera_view);
        ctx.lineTo(cp_x, cp_y);
        ctx.closePath();
        if (this.do_stroke) {
            ctx.stroke();
        }
        if (this.fill_options.fill) {
            ctx.globalAlpha = ctx.globalAlpha * this.fill_options.fill_alpha;
            ctx.fill();
            ctx.globalAlpha = ctx.globalAlpha / this.fill_options.fill_alpha;
        }
    }
}
//# sourceMappingURL=mobjects.js.map