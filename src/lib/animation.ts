// Animations which can be played in a scene with a click
import { Scene, MObject, linspace, Vec2D, delay } from "./base";

// Length of one frame in milliseconds
const FRAME_LENGTH = 10;

// Base class for animations
abstract class Animation {
  async play(scene: Scene) {}
}

// A group of animations, played in sequence with each starting after
// the last ends.
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
    for (let anim of this.animations) {
      await anim.play(scene);
      console.log("Animation done");
    }
  }
}

// Zooms in on a point of the scene over a given number of frames,
// by linearly scaling the view limits.
export class ZoomIn extends Animation {
  point: Vec2D;
  zoom_ratio: number; // A number greater than 1 which indicates the zoom ratio
  num_frames: number;
  constructor(point: Vec2D, zoom_ratio: number, num_frames: number) {
    super();
    this.point = point;
    this.zoom_ratio = zoom_ratio;
    this.num_frames = num_frames;
  }
  play(scene: Scene): void {
    let [init_xmin, init_xmax] = scene.view_xlims;
    let [init_ymin, init_ymax] = scene.view_ylims;
    let [px, py] = this.point;

    // Calculate intermediate view limits
    let intermediate_xmins = linspace(
      init_xmin,
      px - (px - init_xmin) / this.zoom_ratio,
      this.num_frames + 1,
    );
    let intermediate_xmaxs = linspace(
      init_xmax,
      px + (px - init_xmax) / this.zoom_ratio,
      this.num_frames + 1,
    );

    let intermediate_ymins = linspace(
      init_ymin,
      py - (py - init_ymin) / this.zoom_ratio,
      this.num_frames + 1,
    );
    let intermediate_ymaxs = linspace(
      init_ymax,
      py + (py - init_ymax) / this.zoom_ratio,
      this.num_frames + 1,
    );

    // Animate the zooming in
    // TODO This depends on framerate. Put pauses?
    for (let i = 1; i <= this.num_frames; i++) {
      scene.set_view_lims(
        [intermediate_xmins[i], intermediate_xmaxs[i]],
        [intermediate_ymins[i], intermediate_ymaxs[i]],
      );
      scene.draw();
    }
  }
}

// Fades in the mobject
export class FadeIn extends Animation {
  mobj_name: string;
  mobj: MObject;
  num_frames: number;
  constructor(mobj_name: string, mobj: MObject, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.mobj = mobj;
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
    }
  }
  async _play_frame(scene: Scene, i: number) {
    let alpha = i / this.num_frames;
    this.mobj.set_alpha(alpha);
    scene.draw();
    await delay(FRAME_LENGTH);
  }
}
