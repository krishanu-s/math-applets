import { Line, Dot, BezierCurve, Scene, MObject } from "./base.js";
import { Slider } from "./interactive.js";
import {
  SphericalVec3D,
  Vec3D,
  matmul_vec,
  rot_y,
  rot_z,
  rot_x,
  cartesian_to_spherical,
  spherical_to_cartesian,
} from "./matvec.js";
import { HeatMap, TwoDimHeatMap } from "./heatmap.js";

const DEGREE = Math.PI / 180;
const EARTH_TILT = 23 * DEGREE;

// Slider 1: Controls latitude
// Slider 2: Controls time of year
//
// Scene 1: Shows the position on earth and the position around the sun.
// Will probably require shaders.
// Scene 2: Heatmap of sun declination against day of year and time of day
// Scene 3: Geometric derivation

// This function computes the sun zenith and azimuth in terms of
// - latitude and longitude of the reference point on the earth
// - tilt angle of the earth
// - year_angle, which is 2pi times the fraction of the year which has passed
//   (starting from midnight on winter solstice)
// - day_angle, which is the orientation of the earth relative to midnight.
//   This is assuming that the Earth rotates in the same direction as it orbits.
function sun_zenith_and_azimuth(
  year_angle: number,
  day_angle: number,
  tilt: number,
  latitude: number,
): SphericalVec3D {
  let v: Vec3D = [-1, 0, 0];
  v = matmul_vec(rot_y(year_angle), v);
  v = matmul_vec(rot_z(-tilt), v);
  v = matmul_vec(rot_y(day_angle - year_angle), v);
  v = matmul_vec(rot_z(latitude), v);
  // Correct for different coordinate systems.
  v = matmul_vec(rot_y(-Math.PI / 2), v);
  v = matmul_vec(rot_z(-Math.PI / 2), v);
  let [theta, phi] = cartesian_to_spherical(v);
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid azimuth");
  }
  return [Math.PI / 2 - theta, phi];
}

class SunriseScene extends Scene {
  imageData: ImageData;
  width: number;
  height: number;
  latitude: number; // Latitude value, in degrees
  zenith_values: Array<number>;
  azimuth_values: Array<number>;
  constructor(
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    width: number,
    height: number,
  ) {
    super(canvas);
    this.imageData = imageData;
    this.width = width;
    this.height = height;
    this.zenith_values = new Array(this.width * this.height).fill(0);
    this.azimuth_values = new Array(this.width * this.height).fill(0);
    this.latitude = 0;
    this.add(
      "heatmap",
      new TwoDimHeatMap(
        width,
        height,
        this.zenith_values,
        this.azimuth_values,
        {},
      ),
    );
    // Lines for months
    let num_year_steps = 12;
    for (let i = 0; i < num_year_steps; i++) {
      this.add(
        `year_step_${i + 1}`,
        new Line(
          [
            (i / num_year_steps) * (this.xlims[1] - this.xlims[0]) +
              this.xlims[0],
            this.ylims[0],
          ],
          [
            (i / num_year_steps) * (this.xlims[1] - this.xlims[0]) +
              this.xlims[0],
            this.ylims[1],
          ],
          { stroke_width: 0.2, stroke_color: `rgb(0, 150, 0)` },
        ),
      );
    }
    // Lines for day timestamps
    let num_day_steps = 8;
    for (let i = 0; i < num_day_steps; i++) {
      this.add(
        `day_step_${i + 1}`,
        new Line(
          [
            this.xlims[0],
            (i / num_day_steps) * (this.ylims[1] - this.ylims[0]) +
              this.ylims[0],
          ],
          [
            this.xlims[1],
            (i / num_day_steps) * (this.ylims[1] - this.ylims[0]) +
              this.ylims[0],
          ],
          { stroke_width: 0.2, stroke_color: `rgb(0, 150, 0)` },
        ),
      );
    }
  }
  // Sets the latitude
  set_latitude(l: number) {
    this.latitude = l;
    this._update_values();
  }
  // Converts xy-coordinates to linear array coordinates
  index(x: number, y: number): number {
    return y * this.width + x;
  }
  _update_values() {
    let ind;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        [this.zenith_values[ind], this.azimuth_values[ind]] =
          sun_zenith_and_azimuth(
            (x / this.width) * 2 * Math.PI,
            (y / this.height) * 2 * Math.PI,
            EARTH_TILT,
            DEGREE * this.latitude,
          );
      }
    }
  }
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let mobj;
    mobj = this.get_mobj("heatmap") as TwoDimHeatMap;
    mobj.draw(this.canvas, this, this.imageData);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (!(mobj instanceof TwoDimHeatMap)) {
        mobj.draw(this.canvas, this);
      }
    });
  }
}

// TODO Make an interactive heatmap
(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    // Prepare the canvas
    function prepare_canvas(
      width: number,
      height: number,
      name: string,
    ): HTMLCanvasElement {
      const container = document.getElementById(name);
      if (container == null) throw new Error(`${name} not found`);

      // Set size to 300 pixels by 300 pixels
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;

      // Make a visual element
      let wrapper = document.createElement("div");
      wrapper.classList.add("canvas_container");
      wrapper.classList.add("non_selectable");
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;

      let canvas = document.createElement("canvas");
      canvas.classList.add("non_selectable");
      canvas.style.position = "relative";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.height = height;
      canvas.width = width;

      wrapper.appendChild(canvas);
      container.appendChild(wrapper);

      console.log("Canvas made");

      return canvas;
    }

    // Prepare the canvas and scene
    let width = 300;
    let height = 300;

    let canvas = prepare_canvas(width, height, "scene-container-1");

    // Get the context for drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Create ImageData object
    const imageData = ctx.createImageData(width, height);

    let sunriseScene = new SunriseScene(canvas, imageData, width, height);

    // Slider which controls the latitude
    let latitude_slider = Slider(
      document.getElementById("slider-container-1") as HTMLElement,
      function (l: number) {
        sunriseScene.set_latitude(l);
        sunriseScene.draw();
      },
      `0`,
      -90,
      90,
      0.01,
    );
    latitude_slider.width = 200;
  });
})();
