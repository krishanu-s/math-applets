// Animations which can be played in a scene with a click
import { delay, vec2_scale, funspace, smooth, Line, vec2_sub, vec2_sum, quadratic_bump, vec2_polar_form, } from "./base";
import { vec3_scale } from "./three_d";
// Length of one frame in milliseconds
export const FRAME_LENGTH = 30;
// Default rate function for animations
export const DEFAULT_RATE_FUNC = smooth;
// Base class for animations
class Animation {
    async play(scene) { }
}
// A sequence of animations, played serially with each one starting after
// the previous one ends.
export class AnimationSequence extends Animation {
    constructor(...animations) {
        super();
        this.animations = animations;
    }
    add(animation) {
        this.animations.push(animation);
    }
    async play(scene) {
        for (let i = 0; i < this.animations.length; i++) {
            let anim = this.animations[i];
            await anim.play(scene);
        }
    }
}
// A collection of animations, played in parallel with frames synchronized, starting at the same time.
export class AnimationCollection extends Animation {
    constructor(...animations) {
        super();
        this.animations = animations;
    }
    add(animation) {
        this.animations.push(animation);
    }
    async play(scene) {
        let promises = this.animations.map((anim) => anim.play(scene));
        await Promise.all(promises);
        console.log("All animations done");
    }
}
// Does nothing for a number of frames.
export class Wait extends Animation {
    constructor(num_frames) {
        super();
        this.num_frames = num_frames;
    }
    async play(scene) {
        await this._play(scene);
    }
    async _play(scene) {
        for (let i = 1; i <= this.num_frames; i++) {
            await this._play_frame(scene, i);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
    async _play_frame(scene, i) { }
}
// Zooms in or out of a point of the scene.
export class Zoom extends Animation {
    constructor(zoom_point, zoom_ratio, num_frames) {
        super();
        this.zoom_point = zoom_point;
        this.zoom_ratio = zoom_ratio;
        this.num_frames = num_frames;
    }
    async play(scene) {
        await this._play(scene);
    }
    async _play(scene) {
        for (let i = 1; i <= this.num_frames; i++) {
            await this._play_frame(scene, i);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
    async _play_frame(scene, i) {
        scene.zoom_in_on(Math.pow(this.zoom_ratio, DEFAULT_RATE_FUNC(i / this.num_frames) -
            DEFAULT_RATE_FUNC((i - 1) / this.num_frames)), this.zoom_point);
    }
}
// Fades in a collection of mobjects simultaneously.
export class FadeIn extends Animation {
    constructor(mobjects, num_frames) {
        super();
        this.base_alphas = {};
        this.mobjects = mobjects;
        Object.entries(mobjects).forEach(([key, elem]) => {
            this.base_alphas[key] = Number(elem.alpha);
        });
        this.num_frames = num_frames;
    }
    async play(scene) {
        await this._play(scene);
    }
    // Animates the fade in.
    async _play(scene) {
        Object.entries(this.mobjects).forEach(([key, elem]) => {
            scene.add(key, elem);
        });
        for (let i = 1; i <= this.num_frames; i++) {
            await this._play_frame(scene, i);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
    async _play_frame(scene, i) {
        Object.entries(this.mobjects).forEach(([key, elem]) => {
            let alpha = (i / this.num_frames) * this.base_alphas[key];
            scene.get_mobj(key).set_alpha(alpha);
        });
    }
}
// Fades out a collection of mobjects simultaneously.
export class FadeOut extends Animation {
    constructor(mobj_names, num_frames) {
        super();
        this.mobj_names = mobj_names;
        this.num_frames = num_frames;
    }
    async play(scene) {
        await this._play(scene);
    }
    // Animates the fade out.
    async _play(scene) {
        let base_alphas = [];
        let mobjects = [];
        for (let j = 0; j < this.mobj_names.length; j++) {
            let mobj = scene.get_mobj(this.mobj_names[j]);
            mobjects.push(mobj);
            base_alphas.push(Number(mobj.alpha));
        }
        for (let i = 1; i <= this.num_frames; i++) {
            this._play_frame(scene, i, mobjects, base_alphas);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
        for (let m of this.mobj_names) {
            scene.remove(m);
        }
    }
    async _play_frame(scene, i, mobjects, base_alphas) {
        for (let j = 0; j < this.mobj_names.length; j++) {
            let alpha = (1 - i / this.num_frames) * base_alphas[j];
            mobjects[j].set_alpha(alpha);
        }
    }
}
const isVec2D = (v) => v.length == 2;
const isVec3D = (v) => v.length == 3;
// Move the mobject or MObjectGroup by a certain amount
export class MoveBy extends Animation {
    constructor(mobj_name, translate_vec, num_frames) {
        super();
        this.mobj_name = mobj_name;
        this.translate_vec = translate_vec;
        this.num_frames = num_frames;
    }
    async play(scene) {
        await this._play(scene);
    }
    // Animates the movement.
    async _play(scene) {
        let tv;
        let s;
        for (let i = 1; i <= this.num_frames; i++) {
            s =
                DEFAULT_RATE_FUNC(i / this.num_frames) -
                    DEFAULT_RATE_FUNC((i - 1) / this.num_frames);
            if (isVec2D(this.translate_vec)) {
                tv = vec2_scale(this.translate_vec, s);
            }
            else if (isVec3D(this.translate_vec)) {
                tv = vec3_scale(this.translate_vec, s);
            }
            else {
                throw new Error("Invalid translation vector");
            }
            await this._play_frame(scene, tv);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
    async _play_frame(scene, tv) {
        scene.get_mobj(this.mobj_name).move_by(tv);
    }
}
// Performs a homothety of the mobject or MObjectGroup to a
export class Homothety extends Animation {
    constructor(mobj_name, mobj, center, scale, num_frames) {
        super();
        this.mobj_name = mobj_name;
        this.mobj = mobj;
        this.center = center;
        this.num_frames = num_frames;
        this.scales = funspace((x) => Math.exp(Math.log(scale) * DEFAULT_RATE_FUNC(x)), 0, 1, this.num_frames + 1);
    }
    async play(scene) {
        await this._play(scene);
    }
    // Animates the fade in.
    async _play(scene) {
        scene.add(this.mobj_name, this.mobj);
        for (let i = 1; i <= this.num_frames; i++) {
            await this._play_frame(scene, i);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
    _get_scale_factor(i) {
        return this.scales[i] / this.scales[i - 1];
    }
    async _play_frame(scene, i) {
        scene
            .get_mobj(this.mobj_name)
            .homothety_around(this.center, this._get_scale_factor(i));
    }
}
// Varies a parameter continuously
export class ChangeParameterSmoothly extends Animation {
    constructor(parameter, to_val, num_frames) {
        super();
        this.rate_func = DEFAULT_RATE_FUNC;
        this.parameter = parameter;
        this.to_val = to_val;
        this.num_frames = num_frames;
    }
    set_rate_func(rate_func) {
        this.rate_func = rate_func;
        return this;
    }
    async play(scene) {
        await this._play(scene);
    }
    // Animates the transformation.
    async _play(scene) {
        let init_val = this.parameter.get_value();
        let intermediate_vals = funspace((x) => init_val + DEFAULT_RATE_FUNC(x) * (this.to_val - init_val), 0, 1, this.num_frames + 1);
        for (let i = 1; i <= this.num_frames; i++) {
            this.parameter.set_value(intermediate_vals[i]);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
}
export class Emphasize extends Animation {
    constructor(mobj_name, mobj, num_frames) {
        super();
        this.num_lines = 8;
        this.mobj_name = mobj_name;
        this.mobj = mobj;
        this.center = mobj.get_center();
        this.radius = mobj.get_radius();
        this.num_frames = num_frames;
    }
    set_num_lines(n) {
        this.num_lines = n;
        return this;
    }
    async play(scene) {
        await this._play(scene);
    }
    async _play(scene) {
        for (let theta = 0; theta < this.num_lines; theta++) {
            scene.add(`l_${theta}`, new Line(this.center, vec2_sum(this.center, vec2_polar_form(this.radius, (theta / this.num_lines) * 2 * Math.PI))).set_stroke_width(0.02));
        }
        for (let i = 1; i <= this.num_frames; i++) {
            await this._play_frame(scene, i);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
        for (let theta = 0; theta < this.num_lines; theta++) {
            scene.remove(`l_${theta}`);
        }
    }
    async _play_frame(scene, i) {
        for (let theta = 0; theta < this.num_lines; theta++) {
            scene.get_mobj(`l_${theta}`)
                .move_start(vec2_sum(this.center, vec2_polar_form(3 * this.radius * Math.max(0, 1.5 * (i / this.num_frames) - 0.5), (theta / this.num_lines) * 2 * Math.PI)))
                .move_end(vec2_sum(this.center, vec2_polar_form(3 * this.radius * Math.min(1, 1.5 * (i / this.num_frames)), (theta / this.num_lines) * 2 * Math.PI)));
        }
    }
}
// Emphasize a point by temporarily growing and shrinking it
export class GrowShrinkDot extends Animation {
    constructor(mobj_name, mobj, num_frames) {
        super();
        this.mobj_name = mobj_name;
        this.mobj = mobj;
        this.radius = mobj.radius;
        this.num_frames = num_frames;
    }
    async play(scene) {
        await this._play(scene);
    }
    async _play(scene) {
        scene.add(this.mobj_name, this.mobj);
        for (let i = 1; i <= this.num_frames; i++) {
            await this._play_frame(scene, i);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
    async _play_frame(scene, i) {
        let dot = scene.get_mobj(this.mobj_name);
        dot.set_radius(this.radius * (1 + quadratic_bump(i / this.num_frames)));
    }
}
// Grow a line from its midpoint
export class GrowLineFromMidpoint extends Animation {
    constructor(mobj_name, mobj, num_frames) {
        super();
        this.mobj_name = mobj_name;
        this.mobj = mobj;
        this.start = mobj.start;
        this.end = mobj.end;
        this.num_frames = num_frames;
    }
    async play(scene) {
        await this._play(scene);
    }
    async _play(scene) {
        scene.add(this.mobj_name, this.mobj);
        for (let i = 1; i <= this.num_frames; i++) {
            await this._play_frame(scene, i);
            await delay(FRAME_LENGTH);
            scene.draw();
        }
    }
    async _play_frame(scene, i) {
        let line = scene.get_mobj(this.mobj_name);
        line.move_end(vec2_sum(this.start, vec2_scale(vec2_sub(this.end, this.start), 0.5 * (1 + DEFAULT_RATE_FUNC(i / this.num_frames)))));
        line.move_start(vec2_sum(this.start, vec2_scale(vec2_sub(this.end, this.start), 0.5 * (1 - DEFAULT_RATE_FUNC(i / this.num_frames)))));
    }
}
// Grow a line from its starting point TODO
// // Rotate the mobject around a point
// export class Rotate extends Animation {
//   mobj_name: string;
//   center: Vector;
//   angle: number;
//   num_frames: number;
//   constructor(
//     mobj_name: string,
//     center: Vector,
//     angle: number,
//     num_frames: number,
//   ) {
//     super();
//     this.mobj_name = mobj_name;
//     this.center = center;
//     this.angle = angle;
//     this.num_frames = num_frames;
//   }
//   async play(scene: Scene): Promise<void> {
//     await this._play(scene);
//   }
//   // Animates the rotation.
//   async _play(scene: Scene): Promise<void> {
//     let mobj = scene.get_mobj(this.mobj_name) as MObject;
//     let base_angle = mobj.angle;
//     for (let i = 1; i <= this.num_frames; i++) {
//       await this._play_frame(scene, i, mobj, base_angle);
//       await delay(FRAME_LENGTH);
//       scene.draw();
//     }
//   }
//   async _play_frame(
//     scene: Scene,
//     i: number,
//     mobj: MObject,
//     base_angle: number,
//   ) {
//     let angle = base_angle + (this.angle * i) / this.num_frames;
//     mobj.set_angle(angle);
//   }
// }
//# sourceMappingURL=animation.js.map