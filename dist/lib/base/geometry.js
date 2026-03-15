// MObjects representing 2D geometry. These are the "basic" ones.
import { LineLikeMObject, FillLikeMObject, } from "./base.js";
import { colorval_to_rgba, rb_colormap_2 } from "./color.js";
import { vec2_norm, vec2_sum, vec2_sub, vec2_scale, vec2_rot, vec2_homothety, vec2_polar_form, } from "./vec2.js";
import { makeDraggable } from "../interactive/draggable.js";
// A filled circle.
export class Dot extends FillLikeMObject {
    constructor(center, radius) {
        super();
        this.radius = 0.1;
        this.center = center;
        this.radius = radius;
    }
    // Tests whether a chosen vector lies inside the shape. Used for click-detection.
    is_inside(p) {
        return vec2_norm(vec2_sub(p, this.center)) < this.radius;
    }
    // Tests whether a chosen vector lies within an enlarged version of the dot.
    // Used for touch-detection on mobile devices.
    is_almost_inside(p, tolerance) {
        return vec2_norm(vec2_sub(p, this.center)) < this.radius * tolerance;
    }
    // Get the center coordinates
    get_center() {
        return this.center;
    }
    get_radius() {
        return this.radius;
    }
    // Move the center of the dot to a desired location
    move_to(p) {
        this.center = p;
        return this;
    }
    move_by(p) {
        this.center[0] += p[0];
        this.center[1] += p[1];
        return this;
    }
    // Performs a homothety around the given point
    homothety_around(p, scale) {
        this.center = vec2_homothety(p, this.center, scale);
        this.radius *= scale;
        return this;
    }
    // Change the dot radius
    set_radius(radius) {
        this.radius = radius;
        return this;
    }
    // Draws on the canvas
    _draw(ctx, scene) {
        let [x, y] = scene.v2c(this.center);
        let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
        ctx.beginPath();
        ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
        ctx.fill();
    }
}
// A filled circular sector
export class Sector extends FillLikeMObject {
    constructor(center, radius, start_angle, end_angle) {
        super();
        this.center = center;
        this.radius = radius;
        this.start_angle = start_angle;
        this.end_angle = end_angle;
    }
    // Get the center coordinates
    get_center() {
        return this.center;
    }
    // Move the center of the dot to a desired location
    move_to(center) {
        this.center = center;
        return this;
    }
    move_by(p) {
        this.center[0] += p[0];
        this.center[1] += p[1];
        return this;
    }
    // Performs a homothety around the given point
    homothety_around(p, scale) {
        this.center = vec2_homothety(p, this.center, scale);
        this.radius *= scale;
        return this;
    }
    // Change the dot radius
    set_radius(radius) {
        this.radius = radius;
    }
    // Draws on the canvas
    _draw(ctx, scene) {
        let [x, y] = scene.v2c(this.center);
        let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
        ctx.beginPath();
        ctx.arc(x, y, Math.abs(xr - x), this.start_angle, this.end_angle);
        if (this.fill_options.fill) {
            ctx.globalAlpha *= this.fill_options.fill_alpha;
            ctx.fill();
            ctx.globalAlpha /= this.fill_options.fill_alpha;
        }
    }
}
// A filled circle which can be clicked-and-dragged
export const DraggableDot = makeDraggable(Dot);
// A filled rectangle specified by its center, width, and height
export class Rectangle extends FillLikeMObject {
    constructor(center, size_x, size_y) {
        super();
        this.center = center;
        this.size_x = size_x;
        this.size_y = size_y;
    }
    // Tests whether a chosen vector lies inside the shape. Used for click-detection.
    is_inside(p) {
        return (Math.abs(p[0] - this.center[0]) < this.size_x / 2 &&
            Math.abs(p[1] - this.center[1]) < this.size_y / 2);
    }
    // Tests whether a chosen vector lies within an enlarged version of the shape.
    // Used for touch-detection on mobile devices, and for use by small children.
    is_almost_inside(p, tolerance) {
        return (Math.abs(p[0] - this.center[0]) < (this.size_x / 2) * tolerance &&
            Math.abs(p[1] - this.center[1]) < (this.size_y / 2) * tolerance);
    }
    get_center() {
        return this.center;
    }
    move_to(center) {
        this.center = center;
        return this;
    }
    move_by(p) {
        this.center[0] += p[0];
        this.center[1] += p[1];
        return this;
    }
    // Performs a homothety around the given point
    homothety_around(p, scale) {
        this.center = vec2_homothety(p, this.center, scale);
        this.size_x *= scale;
        this.size_y *= scale;
        return this;
    }
    // Draws on the canvas
    _draw(ctx, scene) {
        let [px, py] = scene.v2c([
            this.center[0] - this.size_x / 2,
            this.center[1] - this.size_y / 2,
        ]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        [px, py] = scene.v2c([
            this.center[0] + this.size_x / 2,
            this.center[1] - this.size_y / 2,
        ]);
        ctx.lineTo(px, py);
        [px, py] = scene.v2c([
            this.center[0] + this.size_x / 2,
            this.center[1] + this.size_y / 2,
        ]);
        ctx.lineTo(px, py);
        [px, py] = scene.v2c([
            this.center[0] - this.size_x / 2,
            this.center[1] + this.size_y / 2,
        ]);
        ctx.lineTo(px, py);
        [px, py] = scene.v2c([
            this.center[0] - this.size_x / 2,
            this.center[1] - this.size_y / 2,
        ]);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}
// A closed path of points.
export class Polygon extends FillLikeMObject {
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
    move_by(p) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i] = vec2_sum(this.points[i], p);
        }
        return this;
    }
    // Performs a homothety around the given point
    homothety_around(p, scale) {
        let new_points = [];
        for (let point of this.points) {
            new_points.push(vec2_homothety(p, point, scale));
        }
        this.points = new_points;
        return this;
    }
    _draw(ctx, scene) {
        let [x, y] = scene.v2c(this.points[0]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 1; i < this.points.length; i++) {
            [x, y] = scene.v2c(this.points[i]);
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        if (this.fill_options.fill) {
            ctx.globalAlpha *= this.fill_options.fill_alpha;
            ctx.fill();
            ctx.globalAlpha /= this.fill_options.fill_alpha;
        }
    }
}
// A filled rectangle which can be clicked-and-dragged
export const DraggableRectangle = makeDraggable(Rectangle);
// A line segment.
export class Line extends LineLikeMObject {
    constructor(start, end) {
        super();
        this.start = start;
        this.end = end;
    }
    // Moves the start and end points
    move_start(p) {
        this.start = p;
        return this;
    }
    move_end(p) {
        this.end = p;
        return this;
    }
    move_midpoint_to(p) {
        this.move_by(vec2_sub(p, this.midpoint()));
        return this;
    }
    move_by(p) {
        this.start = vec2_sum(this.start, p);
        this.end = vec2_sum(this.end, p);
        return this;
    }
    // Convenience functions
    midpoint() {
        return [
            0.5 * (this.start[0] + this.end[0]),
            0.5 * (this.start[1] + this.end[1]),
        ];
    }
    vec() {
        return vec2_sub(this.end, this.start);
    }
    length() {
        return vec2_norm(this.vec());
    }
    // Rotates the line around its midpoint to a given angle
    rotate_to(theta) {
        let new_start = vec2_sum(this.midpoint(), vec2_polar_form(this.length() / 2, theta));
        let new_end = vec2_sum(this.midpoint(), vec2_polar_form(-this.length() / 2, theta));
        [this.start, this.end] = [new_start, new_end];
        return this;
    }
    // Performs a homothety around the given point
    homothety_around(p, scale) {
        this.start = vec2_homothety(p, this.start, scale);
        this.end = vec2_homothety(p, this.end, scale);
        return this;
    }
    // Draws on the canvas
    _draw(ctx, scene) {
        let [start_x, start_y] = scene.v2c(this.start);
        let [end_x, end_y] = scene.v2c(this.end);
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(end_x, end_y);
        ctx.stroke();
    }
}
// A sequence of line segments with joined endpoints.
export class LineSequence extends LineLikeMObject {
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
    move_by(p) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i] = vec2_sum(this.points[i], p);
        }
        return this;
    }
    // Performs a homothety around the given point
    homothety_around(p, scale) {
        let new_points = [];
        for (let point of this.points) {
            new_points.push(vec2_homothety(p, point, scale));
        }
        this.points = new_points;
        return this;
    }
    // Draws on the canvas
    _draw(ctx, scene) {
        let [x, y] = scene.v2c(this.points[0]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 1; i < this.points.length; i++) {
            [x, y] = scene.v2c(this.points[i]);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}
// An arrow
export class Arrow extends Line {
    constructor() {
        super(...arguments);
        this.arrow_size = 0.1;
    }
    set_arrow_size(size) {
        this.arrow_size = size;
    }
    // Draws on the canvas
    _draw(ctx, scene) {
        super._draw(ctx, scene);
        ctx.fillStyle = this.stroke_options.stroke_color;
        let [end_x, end_y] = scene.v2c(this.end);
        let v = vec2_scale(vec2_sub(this.start, this.end), this.arrow_size / this.length());
        let [ax, ay] = scene.v2c(vec2_sum(this.end, vec2_rot(v, Math.PI / 6)));
        let [bx, by] = scene.v2c(vec2_sum(this.end, vec2_rot(v, -Math.PI / 6)));
        ctx.beginPath();
        ctx.moveTo(end_x, end_y);
        ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(end_x, end_y);
        ctx.closePath();
        ctx.fill();
    }
}
// A double-sided arrow
export class TwoHeadedArrow extends Line {
    constructor() {
        super(...arguments);
        this.arrow_size = 0.3;
    }
    set_arrow_size(size) {
        this.arrow_size = size;
    }
    // Draws on the canvas
    _draw(ctx, scene) {
        super._draw(ctx, scene);
        ctx.fillStyle = this.stroke_options.stroke_color;
        let [end_x, end_y] = scene.v2c(this.end);
        let [start_x, start_y] = scene.v2c(this.start);
        let v;
        let ax;
        let ay;
        let bx;
        let by;
        // Arrow head
        v = vec2_scale(vec2_sub(this.start, this.end), this.arrow_size / this.length());
        [ax, ay] = scene.v2c(vec2_sum(this.end, vec2_rot(v, Math.PI / 6)));
        [bx, by] = scene.v2c(vec2_sum(this.end, vec2_rot(v, -Math.PI / 6)));
        ctx.beginPath();
        ctx.moveTo(end_x, end_y);
        ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(end_x, end_y);
        ctx.closePath();
        ctx.fill();
        // Arrow tail
        v = vec2_scale(vec2_sub(this.end, this.start), this.arrow_size / this.length());
        [ax, ay] = scene.v2c(vec2_sum(this.start, vec2_rot(v, Math.PI / 6)));
        [bx, by] = scene.v2c(vec2_sum(this.start, vec2_rot(v, -Math.PI / 6)));
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(start_x, start_y);
        ctx.closePath();
        ctx.fill();
    }
}
// A stylized line segment representing a spring with an equilibrium length.
// - In "color" mode, the color changes in accordance with the length
// - In "spring" mode, the object is drawn as a coiled spiral.
export class LineSpring extends Line {
    constructor(start, end) {
        super(start, end);
        this.mode = "color";
        this.eq_length = 2.0;
    }
    set_mode(mode) {
        this.mode = mode;
    }
    set_eq_length(length) {
        this.eq_length = length;
    }
    length() {
        let [start_x, start_y] = this.start;
        let [end_x, end_y] = this.end;
        return Math.sqrt((end_x - start_x) ** 2 + (end_y - start_y) ** 2);
    }
    // alpha_scaling(): number {
    //   return Math.min(1.0, this.eq_length / this.length());
    // }
    // Draws on the canvas
    _draw(ctx, scene) {
        let [start_x, start_y] = scene.v2c(this.start);
        let [end_x, end_y] = scene.v2c(this.end);
        if (this.mode == "color") {
            ctx.strokeStyle = colorval_to_rgba(rb_colormap_2(10 * Math.log(this.eq_length / this.length())));
            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(end_x, end_y);
            ctx.stroke();
        }
        else {
            let v = [end_x - start_x, end_y - start_y];
            // Number of turns
            let num_turns = 5;
            // Ratio of length of spring taken up by zigzag part
            let r = 1 - (0.4 * this.eq_length) / this.length();
            // Decide the angle of each turn based on the current length
            // let theta = Math.PI / 3;
            let theta = Math.atan((8 * (2 * num_turns)) / (vec2_norm(v) * r));
            let scaled_v = vec2_scale(v, r / (2 * Math.cos(theta) * num_turns));
            let current_p = [
                start_x + 0.5 * (1 - r) * (end_x - start_x),
                start_y + 0.5 * (1 - r) * (end_y - start_y),
            ];
            // Draw as a zigzag
            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            // Do initial 10% of length
            ctx.lineTo(current_p[0], current_p[1]);
            current_p = vec2_sum(current_p, vec2_rot(vec2_scale(scaled_v, 0.5), theta));
            ctx.lineTo(current_p[0], current_p[1]);
            for (let i = 0; i < num_turns - 1; i++) {
                current_p = vec2_sum(current_p, vec2_rot(scaled_v, -theta));
                ctx.lineTo(current_p[0], current_p[1]);
                current_p = vec2_sum(current_p, vec2_rot(scaled_v, theta));
                ctx.lineTo(current_p[0], current_p[1]);
            }
            current_p = vec2_sum(current_p, vec2_rot(vec2_scale(scaled_v, 0.5), -theta));
            ctx.lineTo(current_p[0], current_p[1]);
            // Do final 10% of length
            ctx.lineTo(end_x, end_y);
            ctx.stroke();
        }
    }
}
//# sourceMappingURL=geometry.js.map