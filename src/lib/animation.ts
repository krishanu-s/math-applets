// Animations which can be played in a scene with a click
import { Scene, MObject, linspace, Vec2D, delay, vec2_scale } from "./base";
import { Vec3D, vec3_scale } from "./three_d";

// Length of one frame in milliseconds
const FRAME_LENGTH = 10;

// Base class for animations
abstract class Animation {
  async play(scene: Scene) {}
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

// Zooms in or out of a point of the scene.
export class Zoom extends Animation {
  zoom_point: Vec2D;
  zoom_ratio: number;
  num_frames: number;
  constructor(zoom_point: Vec2D, zoom_ratio: number, num_frames: number) {
    super();
    this.zoom_point = zoom_point;
    this.zoom_ratio = zoom_ratio;
    this.num_frames = num_frames;
  }
  async play(scene: Scene): Promise<void> {
    await this._play(scene);
  }
  async _play(scene: Scene): Promise<void> {
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(FRAME_LENGTH);
      scene.draw();
    }
  }
  async _play_frame(scene: Scene, i: number) {
    scene.zoom_in_on(
      Math.pow(this.zoom_ratio, 1 / this.num_frames),
      this.zoom_point,
    );
  }
}

// Fades in the mobject
export class FadeIn extends Animation {
  mobj_name: string;
  mobj: MObject;
  base_alpha: number;
  num_frames: number;
  constructor(mobj_name: string, mobj: MObject, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.base_alpha = Number(this.mobj.alpha);
    this.num_frames = num_frames;
  }
  async play(scene: Scene): Promise<void> {
    await this._play(scene);
  }
  // Animates the fade in.
  async _play(scene: Scene): Promise<void> {
    scene.add(this.mobj_name, this.mobj);
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i);
      await delay(FRAME_LENGTH);
      scene.draw();
    }
  }
  async _play_frame(scene: Scene, i: number) {
    let alpha = (i / this.num_frames) * this.base_alpha;
    this.mobj.set_alpha(alpha);
  }
}

// Fades out the mobject
export class FadeOut extends Animation {
  mobj_name: string;
  num_frames: number;
  constructor(mobj_name: string, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.num_frames = num_frames;
  }
  async play(scene: Scene): Promise<void> {
    await this._play(scene);
  }
  // Animates the fade out.
  async _play(scene: Scene): Promise<void> {
    let mobj = scene.get_mobj(this.mobj_name) as MObject;
    let base_alpha = Number(mobj.alpha);
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, i, mobj, base_alpha);
      await delay(FRAME_LENGTH);
      scene.draw();
    }
  }
  async _play_frame(
    scene: Scene,
    i: number,
    mobj: MObject,
    base_alpha: number,
  ) {
    let alpha = (1 - i / this.num_frames) * base_alpha;
    mobj.set_alpha(alpha);
  }
}

const isVec2D = (v: any): v is Vec2D => v.length == 2;
const isVec3D = (v: Vec2D | Vec3D): v is Vec3D => v.length == 3;

// Move the mobject or MObjectGroup by a certain amount
export class MoveBy extends Animation {
  mobj_name: string;
  translate_vec: Vec2D | Vec3D;
  num_frames: number;
  constructor(
    mobj_name: string,
    translate_vec: Vec2D | Vec3D,
    num_frames: number,
  ) {
    super();
    this.mobj_name = mobj_name;
    this.translate_vec = translate_vec;
    this.num_frames = num_frames;
  }
  async play(scene: Scene): Promise<void> {
    await this._play(scene);
  }
  // Animates the movement.
  async _play(scene: Scene): Promise<void> {
    let tv: Vec2D | Vec3D;
    if (isVec2D(this.translate_vec)) {
      tv = vec2_scale(this.translate_vec, 1 / this.num_frames);
    } else if (isVec3D(this.translate_vec)) {
      tv = vec3_scale(this.translate_vec, 1 / this.num_frames);
    } else {
      throw new Error("Invalid translation vector");
    }
    for (let i = 1; i <= this.num_frames; i++) {
      await this._play_frame(scene, tv);
      await delay(FRAME_LENGTH);
      scene.draw();
    }
  }
  async _play_frame(scene: Scene, tv: Vec2D | Vec3D) {
    (scene.get_mobj(this.mobj_name) as MObject).move_by(tv);
  }
}

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
