import * as np from "numpy-ts";
import { Line, Dot, BezierCurve, Scene, Slider, MObject } from "./base.js";
import {
  Vec2D,
  vec_scale,
  vec_sum,
  vec_sub,
  vec_norm,
  vec_sum_list,
} from "./base.js";

// Slider 1: Controls latitude
// Slider 2: Controls time of year
//
// Scene 1: Shows the position on earth and the position around the sun.
// Will probably require shaders.
// Scene 2: Heatmap of sun declination against day of year and time of day
// Scene 3: Geometric derivation

// Stores a 2D array of values as a numpy array of shape (W, H).
// Contains convenience methods for drawing to a canvas, including features e.g.
// - centered in the scene
// - scaling size
// - changing colors
// - identifying contour lines?
class HeatMap extends MObject {
  //
}
