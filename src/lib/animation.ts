// Animations which can be played in a scene with a click
import {
  Scene,
  MObject,
  linspace,
  Vec2D,
  delay,
  vec2_scale,
  funspace,
  linear,
  smooth,
  Line,
  vec2_sub,
  vec2_sum,
  Dot,
  quadratic_bump,
  vec2_polar_form,
  HasCenterAndRadius,
} from "./base";
import { SVGPathMObject } from "./vectorized";
import { Parameter } from "./interactive";
import { Vec3D, vec3_scale } from "./three_d";

// Checks for a vector object to determine its dimensionality
export const isVec2D = (v: Vec2D | Vec3D): v is Vec2D => v.length == 2;
export const isVec3D = (v: Vec2D | Vec3D): v is Vec3D => v.length == 3;

// Length of one frame in milliseconds
export const DEFAULT_FRAME_LENGTH = 30;

// A rate function maps [0, 1] to [0, 1]
export type RateFunc = (t: number) => number;
export const DEFAULT_RATE_FUNC = smooth;

// Base class for animations.
abstract class Animation {
  frame_length: number = DEFAULT_FRAME_LENGTH;
  set_frame_length(frame_length: number) {
    this.frame_length = frame_length;
    return this;
  }
  async play(scene: Scene): Promise<void> {
    await this._play(scene);
  }
  async _play(scene: Scene): Promise<void> {}
}

// A sequence of animations, played serially with each one starting after
// the previous one ends.
export class AnimationSequence extends Animation {
  animations: Animation[];

  constructor(...animations: Animation[]) {
    super();
    this.animations = animations;
  }
  add(animation: Animation) {
    this.animations.push(animation);
  }

  async play(scene: Scene): Promise<void> {
    for (let i = 0; i < this.animations.length; i++) {
      let anim = this.animations[i] as Animation;
      await anim.play(scene);
    }
  }
}

// A collection of animations, played in parallel with frames synchronized, starting at the same time.
export class AnimationCollection extends Animation {
  animations: Animation[];

  constructor(...animations: Animation[]) {
    super();
    this.animations = animations;
  }
  add(animation: Animation) {
    this.animations.push(animation);
  }

  async play(scene: Scene): Promise<void> {
    let promises = this.animations.map((anim) => anim.play(scene));
    await Promise.all(promises);
    console.log("All animations done");
  }
}

// Animations where the number of frames is known at initialization.
class FixedLengthAnimation extends Animation {
  num_frames: number;
  constructor(num_frames: number) {
    super();
    this.num_frames = num_frames;
  }
  async _play(scene: Scene): Promise<void> {
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(this.frame_length);
      scene.draw();
    }
  }
  async _play_frame(scene: Scene, i: number) {}
}

// Does nothing for a number of frames. Equal to the trivial animation.
export class Wait extends FixedLengthAnimation {}

// Zooms in or out of a point of the scene.
export class Zoom extends FixedLengthAnimation {
  zoom_point: Vec2D;
  zoom_ratio: number;
  constructor(zoom_point: Vec2D, zoom_ratio: number, num_frames: number) {
    super(num_frames);
    this.zoom_point = zoom_point;
    this.zoom_ratio = zoom_ratio;
  }
  async _play_frame(scene: Scene, i: number) {
    scene.zoom_in_on(
      Math.pow(
        this.zoom_ratio,
        DEFAULT_RATE_FUNC(i / this.num_frames) -
          DEFAULT_RATE_FUNC((i - 1) / this.num_frames),
      ),
      this.zoom_point,
    );
  }
}

// Fades in a collection of mobjects simultaneously.
export class FadeIn extends FixedLengthAnimation {
  mobjects: Record<string, MObject>;
  base_alphas: Record<string, number> = {};
  constructor(mobjects: Record<string, MObject>, num_frames: number) {
    super(num_frames);
    this.mobjects = mobjects;
    Object.entries(mobjects).forEach(([key, elem]) => {
      this.base_alphas[key] = Number(elem.alpha);
    });
  }
  // Animates the fade in.
  async _play(scene: Scene): Promise<void> {
    Object.entries(this.mobjects).forEach(([key, elem]) => {
      scene.add(key, elem);
    });
    await super._play(scene);
  }
  async _play_frame(scene: Scene, i: number) {
    Object.entries(this.mobjects).forEach(([key, elem]) => {
      let alpha = (i / this.num_frames) * (this.base_alphas[key] as number);
      scene.get_mobj(key).set_alpha(alpha);
    });
  }
}

// Fades out a collection of mobjects simultaneously.
export class FadeOut extends Animation {
  mobj_names: string[];
  num_frames: number;
  constructor(mobj_names: string[], num_frames: number) {
    super();
    this.mobj_names = mobj_names;
    this.num_frames = num_frames;
  }
  async play(scene: Scene): Promise<void> {
    await this._play(scene);
  }
  // Animates the fade out.
  async _play(scene: Scene): Promise<void> {
    let base_alphas: number[] = [];
    let mobjects: MObject[] = [];
    for (let j = 0; j < this.mobj_names.length; j++) {
      let mobj = scene.get_mobj(this.mobj_names[j] as string) as MObject;
      mobjects.push(mobj);
      base_alphas.push(Number(mobj.alpha));
    }
    for (let i = 1; i <= this.num_frames; i++) {
      this._play_frame(scene, i, mobjects, base_alphas);
      await delay(this.frame_length);
      scene.draw();
    }
    for (let m of this.mobj_names) {
      scene.remove(m);
    }
  }
  async _play_frame(
    scene: Scene,
    i: number,
    mobjects: MObject[],
    base_alphas: number[],
  ) {
    for (let j = 0; j < this.mobj_names.length; j++) {
      let alpha = (1 - i / this.num_frames) * (base_alphas[j] as number);
      (mobjects[j] as MObject).set_alpha(alpha);
    }
  }
}

// A mobject which can be progressively drawn.
export interface Drawable {
  set_progress(t: number): void;
}

// Progressively draw a collection of MObjects in parallel.
export class Write extends FixedLengthAnimation {
  mobjects: Record<string, MObject & Drawable>;
  constructor(
    svg_mobjects: Record<string, MObject & Drawable>,
    num_frames: number,
  ) {
    super(num_frames);
    this.mobjects = svg_mobjects;
  }
  // Animates the fade in.
  async _play(scene: Scene): Promise<void> {
    Object.entries(this.mobjects).forEach(([key, elem]) => {
      scene.add(key, elem);
    });
    await super._play(scene);
  }
  async _play_frame(scene: Scene, i: number) {
    Object.entries(this.mobjects).forEach(([key, elem]) => {
      scene.get_mobj(key).set_progress(i / this.num_frames);
    });
  }
}

// Write a collection of SVGPathMObjects simultaneously
export class WriteGroup extends FixedLengthAnimation {
  svg_mobjects: Record<string, SVGPathMObject>;
  constructor(
    svg_mobjects: Record<string, SVGPathMObject>,
    num_frames: number,
  ) {
    super(num_frames);
    this.svg_mobjects = svg_mobjects;
  }
  async _play(scene: Scene): Promise<void> {
    Object.entries(this.svg_mobjects).forEach(([key, elem]) => {
      scene.add(key, elem);
    });
    await super._play(scene);
  }
  async _play_frame(scene: Scene, i: number) {
    Object.entries(this.svg_mobjects).forEach(([key, elem]) => {
      elem.set_progress(i / this.num_frames);
    });
  }
}

// Unwrite an SVGPathMObject, character-by-character
// TODO
export class Unwrite extends Animation {}

// Unwrite a group of SVGPathMObjects simultaneously.
// TODO
export class UnwriteGroup extends Animation {}

// Translate the mobject or MObjectGroup
export class MoveBy extends FixedLengthAnimation {
  mobj_name: string;
  translate_vec: Vec2D | Vec3D;
  constructor(
    mobj_name: string,
    translate_vec: Vec2D | Vec3D,
    num_frames: number,
  ) {
    super(num_frames);
    this.mobj_name = mobj_name;
    this.translate_vec = translate_vec;
  }
  async _play_frame(scene: Scene, i: number) {
    let tv: Vec2D | Vec3D;
    let s =
      DEFAULT_RATE_FUNC(i / this.num_frames) -
      DEFAULT_RATE_FUNC((i - 1) / this.num_frames);
    if (isVec2D(this.translate_vec)) {
      tv = vec2_scale(this.translate_vec, s);
    } else if (isVec3D(this.translate_vec)) {
      tv = vec3_scale(this.translate_vec, s);
    } else {
      throw new Error("Invalid translation vector");
    }
    (scene.get_mobj(this.mobj_name) as MObject).move_by(tv);
  }
}

// Performs a homothety of the mobject or MObjectGroup with respect to a center point.
export class Homothety extends FixedLengthAnimation {
  mobj_name: string;
  mobj: MObject;
  center: Vec2D;
  scales: number[];
  constructor(
    mobj_name: string,
    mobj: MObject,
    center: Vec2D,
    scale: number,
    num_frames: number,
  ) {
    super(num_frames);
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.center = center;
    this.scales = funspace(
      (x) => Math.exp(Math.log(scale) * DEFAULT_RATE_FUNC(x)),
      0,
      1,
      this.num_frames + 1,
    );
  }
  // Animates the fade in.
  async _play(scene: Scene): Promise<void> {
    scene.add(this.mobj_name, this.mobj);
    await super._play(scene);
  }
  _get_scale_factor(i: number): number {
    return (this.scales[i] as number) / (this.scales[i - 1] as number);
  }
  async _play_frame(scene: Scene, i: number) {
    scene
      .get_mobj(this.mobj_name)
      .homothety_around(this.center, this._get_scale_factor(i));
  }
}

// Varies a parameter continuously
export class ChangeParameterSmoothly extends FixedLengthAnimation {
  parameter: Parameter;
  init_val: number;
  to_val: number;
  rate_func: RateFunc = DEFAULT_RATE_FUNC;
  constructor(parameter: Parameter, to_val: number, num_frames: number) {
    super(num_frames);
    this.parameter = parameter;
    this.init_val = parameter.get_value();
    this.to_val = to_val;
  }
  set_rate_func(rate_func: RateFunc) {
    this.rate_func = rate_func;
    return this;
  }
  async _play_frame(scene: Scene, i: number) {
    this.parameter.set_value(
      this.init_val +
        this.rate_func(i / this.num_frames) * (this.to_val - this.init_val),
    );
  }
}

export class Emphasize extends Animation {
  mobj_name: string;
  mobj: HasCenterAndRadius;
  center: Vec2D;
  radius: number;
  num_lines: number = 8;
  num_frames: number;
  constructor(mobj_name: string, mobj: HasCenterAndRadius, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.center = mobj.get_center();
    this.radius = mobj.get_radius();
    this.num_frames = num_frames;
  }
  set_num_lines(n: number) {
    this.num_lines = n;
    return this;
  }
  async _play(scene: Scene): Promise<void> {
    for (let theta = 0; theta < this.num_lines; theta++) {
      scene.add(
        `l_${theta}`,
        new Line(
          this.center,
          vec2_sum(
            this.center,
            vec2_polar_form(
              this.radius,
              (theta / this.num_lines) * 2 * Math.PI,
            ),
          ),
        ).set_stroke_width(0.02),
      );
    }
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(this.frame_length);
      scene.draw();
    }
    for (let theta = 0; theta < this.num_lines; theta++) {
      scene.remove(`l_${theta}`);
    }
  }
  async _play_frame(scene: Scene, i: number) {
    for (let theta = 0; theta < this.num_lines; theta++) {
      (scene.get_mobj(`l_${theta}`) as Line)
        .move_start(
          vec2_sum(
            this.center,
            vec2_polar_form(
              3 * this.radius * Math.max(0, 1.5 * (i / this.num_frames) - 0.5),
              (theta / this.num_lines) * 2 * Math.PI,
            ),
          ),
        )
        .move_end(
          vec2_sum(
            this.center,
            vec2_polar_form(
              3 * this.radius * Math.min(1, 1.5 * (i / this.num_frames)),
              (theta / this.num_lines) * 2 * Math.PI,
            ),
          ),
        );
    }
  }
}

// Emphasize a point by temporarily growing and shrinking it
export class GrowShrinkDot extends Animation {
  mobj_name: string;
  mobj: Dot;
  radius: number;
  num_frames: number;
  constructor(mobj_name: string, mobj: Dot, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.radius = mobj.radius;
    this.num_frames = num_frames;
  }
  async _play(scene: Scene): Promise<void> {
    scene.add(this.mobj_name, this.mobj);
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(this.frame_length);
      scene.draw();
    }
  }
  async _play_frame(scene: Scene, i: number) {
    let dot = scene.get_mobj(this.mobj_name) as Dot;
    dot.set_radius(this.radius * (1 + quadratic_bump(i / this.num_frames)));
  }
}

// Grow a line from its midpoint
export class GrowLineFromMidpoint extends Animation {
  mobj_name: string;
  mobj: Line;
  start: Vec2D;
  end: Vec2D;
  num_frames: number;
  constructor(mobj_name: string, mobj: Line, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.start = mobj.start;
    this.end = mobj.end;
    this.num_frames = num_frames;
  }
  async _play(scene: Scene): Promise<void> {
    scene.add(this.mobj_name, this.mobj);
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(this.frame_length);
      scene.draw();
    }
  }
  async _play_frame(scene: Scene, i: number) {
    let line = scene.get_mobj(this.mobj_name) as Line;
    line.move_end(
      vec2_sum(
        this.start,
        vec2_scale(
          vec2_sub(this.end, this.start),
          0.5 * (1 + DEFAULT_RATE_FUNC(i / this.num_frames)),
        ),
      ),
    );
    line.move_start(
      vec2_sum(
        this.start,
        vec2_scale(
          vec2_sub(this.end, this.start),
          0.5 * (1 - DEFAULT_RATE_FUNC(i / this.num_frames)),
        ),
      ),
    );
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

// Transform one vectorized MObject to another
export class Transform extends Animation {
  mobj_name: string;
  target: MObject;
  num_frames: number;
  constructor(mobj_name: string, target: MObject, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.target = target;
    this.num_frames = num_frames;
  }
  async _play(scene: Scene): Promise<void> {
    let mobj = scene.get_mobj(this.mobj_name) as MObject;
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i, mobj);
      await delay(this.frame_length);
      scene.draw();
    }
  }
  async _play_frame(scene: Scene, i: number, mobj: MObject) {
    // TODO
  }
}
