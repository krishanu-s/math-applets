// Color mappings
import { sigmoid } from "./base.js";

export type ColorVal = [number, number, number, number];
export type ColorMap = (z: number) => ColorVal;
export type TwoDimColorMap = (z: number, w: number) => ColorVal;

// Given a value in (-inf, inf), produces a color from
// red-to-blue where +inf is red and -inf is blue.
export function rb_colormap(z: number): ColorVal {
  const gray = sigmoid(z);
  if (gray < 0.5) {
    return [512 * gray, 512 * gray, 255, 255];
  } else {
    return [255, 512 * (1 - gray), 512 * (1 - gray), 255];
  }
}

// Given a pair of spherical coordinates (theta, phi) where
// phi is between 0 and 2pi (wrapping around) and theta is
// between 0 and pi, yields a color. The theta value should
// correspond to the brightness
export function spherical_colormap(theta: number, phi: number): ColorVal {
  let a;
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid longitude");
  } else if (phi < (2 * Math.PI) / 3) {
    a = phi / ((2 * Math.PI) / 3);
    // return [256 * (1 - a), 256 * a, 0, (512 * theta) / Math.PI];
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else if (phi < (4 * Math.PI) / 3) {
    a = phi / ((2 * Math.PI) / 3) - 1;
    // return [0, 256 * (1 - a), 256 * a, (512 * theta) / Math.PI];
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else {
    a = phi / ((2 * Math.PI) / 3) - 2;
    // return [256 * a, 0, 256 * (1 - a), (512 * theta) / Math.PI];
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  }
}
