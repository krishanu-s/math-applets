// Animations which can be played in a scene
import { Scene, MObject, linspace } from "./base.js";
import { Vec2D } from "./base_geom.js";

abstract class Anim {}

// Zooms in on a point of the scene over a given number of frames,
// by linearly scaling the view limits.
class ZoomIn extends Anim {
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
class FadeIn extends Anim {
  mobj_name: string;
  mobj: MObject;
  num_frames: number;
  constructor(mobj_name: string, mobj: MObject, num_frames: number) {
    super();
    this.mobj_name = mobj_name;
    this.mobj = mobj;
    this.num_frames = num_frames;
  }
  // Animates the fade in.
  play(scene: Scene): void {
    scene.add(this.mobj_name, this.mobj);
    let alpha = 0;
    for (let i = 1; i <= this.num_frames; i++) {
      alpha = i / this.num_frames;
      this.mobj.set_alpha(alpha);
      scene.draw();
    }
  }
}
