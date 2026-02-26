import { Scene, prepare_canvas, Line } from "./lib/base";
import { Slider } from "./lib/interactive";
import {
  Vec3D,
  vec3_sum,
  vec3_sum_list,
  vec3_scale,
  SphericalVec3D,
  matmul_vec,
  rot_y,
  rot_z,
  rot_x,
  cartesian_to_spherical,
  spherical_to_cartesian,
  rot,
} from "./lib/three_d/matvec.js";
import { ColorMap } from "./lib/base/color.js";
import {
  ThreeDMObject,
  Cube,
  Dot3D,
  Line3D,
  LineSequence3D,
  Arrow3D,
  TwoHeadedArrow3D,
  ParametrizedCurve3D,
} from "./lib/three_d/mobjects.js";

import { ThreeDScene } from "./lib/three_d/scene.js";
import { HeatMap, TwoDimHeatMap } from "./lib/base/heatmap";
import { Arcball } from "./lib/interactive/arcball.js";

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
  v = rot_y(v, year_angle);
  v = rot_z(v, -tilt);
  v = rot_y(v, day_angle - year_angle);
  v = rot_z(v, latitude);
  // Correct for different coordinate systems.
  v = rot_y(v, -Math.PI / 2);
  v = rot_z(v, -Math.PI / 2);
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
    this._add_heatmap();
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
        )
          .set_stroke_width(0.2)
          .set_stroke_color(`rgb(0, 150, 0)`),
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
        )
          .set_stroke_width(0.2)
          .set_stroke_color(`rgb(0, 150, 0)`),
      );
    }
  }
  set_color_map(color_map: ColorMap) {
    let mobj = this.get_mobj("heatmap") as HeatMap;
    mobj.set_color_map(color_map);
  }
  _add_heatmap() {}
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
    mobj = this.get_mobj("heatmap") as HeatMap;
    mobj.draw(this.canvas, this, this.imageData);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.get_mobj(name);
      if (mobj == undefined) throw new Error(`${name} not found`);
      if (!(mobj instanceof HeatMap)) {
        mobj.draw(this.canvas, this);
      }
    });

    // Draw a border around the canvas
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class SunriseSceneZenith extends SunriseScene {
  _add_heatmap() {
    this.add(
      "heatmap",
      new HeatMap(this.width, this.height, 0, 2 * Math.PI, this.zenith_values),
    );
  }
}
class SunriseSceneAzimuth extends SunriseScene {
  _add_heatmap() {
    this.add(
      "heatmap",
      new HeatMap(this.width, this.height, 0, 2 * Math.PI, this.azimuth_values),
    );
  }
}

function three_d_globe(width: number, height: number) {
  let canvas = prepare_canvas(width, height, "three-d-globe");
  let [xmin, xmax] = [-5, 5];
  let [ymin, ymax] = [-5, 5];
  let [zmin, zmax] = [-5, 5];

  // Initialize three-dimensional scene, zoomed in
  let zoom_ratio = 1.0;
  let scene = new ThreeDScene(canvas);
  scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
  scene.set_zoom(zoom_ratio);
  scene.set_view_mode("orthographic");

  // Rotate the camera angle and set the camera position
  scene.camera.move_to([0, 0, -5]);
  scene.camera.rot_pos_and_view_z(Math.PI / 4);
  scene.camera.rot_pos_and_view(
    [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
    (2 * Math.PI) / 3,
  );

  // Adding click-and-drag interactivity to the canvas
  let arcball = new Arcball(scene);
  arcball.set_mode("Rotate");
  arcball.add();

  // Add a sphere to the scene
  let radius = 1.0;
  let globe = new Dot3D([0, 0, 0], radius);
  // globe.fill = false;
  globe.set_fill_color("rgb(200 200 200)");
  globe.set_fill_alpha(0.3);
  scene.add("globe", globe);

  // Add an equator
  //
  // TODO Part of this equator should be dotted. One possible solution is to build a "link" to the globe object,
  // and then any piece (i.e. BezierCurve) of the curve whose depth is *greater* than that of the globe
  // will be drawn as dotted.
  //
  // TODO For now, use depth of the globe as a global function, but we can make this more robust by giving
  // the globe a *local* depth function which indicates its depth at a given 2D point in the camera view.
  let equator = new ParametrizedCurve3D(
    (t) => [radius * Math.cos(t), radius * Math.sin(t), 0],
    -Math.PI,
    Math.PI,
    100,
  );
  equator.set_stroke_style("solid");
  equator.set_stroke_width(0.04);
  equator.link_mobject(globe);
  scene.add("equator", equator);

  // Add a polar axis
  let polar_axis = new LineSequence3D([
    [0, 0, -1.5 * radius],
    [0, 0, -radius],
    [0, 0, radius],
    [0, 0, 1.5 * radius],
  ]);
  polar_axis.link_mobject(globe);

  let n_pole = new Dot3D([0, 0, radius], 0.1);
  n_pole.set_fill_alpha(1.0);
  n_pole.link_mobject(globe);
  let s_pole = new Dot3D([0, 0, -radius], 0.1);
  s_pole.set_fill_alpha(1.0);
  s_pole.link_mobject(globe);
  scene.add("polar_axis", polar_axis);
  scene.add("n_pole", n_pole);
  scene.add("s_pole", s_pole);

  // Add a latitude line
  let theta: number = Math.PI / 6;
  let latitude_line = new ParametrizedCurve3D(
    (t) => [
      radius * Math.cos(t) * Math.cos(theta),
      radius * Math.sin(t) * Math.cos(theta),
      radius * Math.sin(theta),
    ],
    -Math.PI,
    Math.PI,
    100,
  );
  latitude_line.set_stroke_color("red");
  latitude_line.set_stroke_width(0.04);
  latitude_line.link_mobject(globe);
  scene.add("latitude_line", latitude_line);

  // Add a slider to control the zoom level
  let zoomSlider = Slider(
    document.getElementById("three-d-globe-slider-1") as HTMLElement,
    function (value: number) {
      zoom_ratio = value;
      scene.set_zoom(value);
      scene.draw();
    },
    {
      name: "Zoom",
      initialValue: `${zoom_ratio}`,
      min: 0.3,
      max: 3,
      step: 0.02,
    },
  );
  zoomSlider.value = `1.0`;

  // Add a slider to control the latitude level
  let latitudeSlider = Slider(
    document.getElementById("three-d-globe-slider-2") as HTMLElement,
    function (value: number) {
      theta = (Math.PI * value) / 180;
      latitude_line = scene.get_mobj("latitude_line") as ParametrizedCurve3D;
      latitude_line.set_function((t) => [
        radius * Math.cos(t) * Math.cos(theta),
        radius * Math.sin(t) * Math.cos(theta),
        radius * Math.sin(theta),
      ]);
      scene.draw();
    },
    {
      name: "Latitude (degrees)",
      initialValue: `${(theta * 180) / Math.PI}`,
      min: -90,
      max: 90,
      step: 1,
    },
  );
  zoomSlider.value = `1.0`;

  scene.draw();
}

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (function sunrise_heatmap(width: number, height: number) {
      // *** Make the sunrise heatmap scene
      let canvas_zenith = prepare_canvas(
        width,
        height,
        "sunrise-heatmap-zenith",
      );
      let canvas_azimuth = prepare_canvas(
        width,
        height,
        "sunrise-heatmap-azimuth",
      );

      // Get the context for drawing
      const ctx_zenith = canvas_zenith.getContext("2d");
      if (!ctx_zenith) {
        throw new Error("Failed to get 2D context");
      }
      const ctx_azimuth = canvas_azimuth.getContext("2d");
      if (!ctx_azimuth) {
        throw new Error("Failed to get 2D context");
      }

      // Create ImageData object
      const imageData_zenith = ctx_zenith.createImageData(width, height);
      const imageData_azimuth = ctx_azimuth.createImageData(width, height);

      // Make the heatmap scenes
      let sunriseSceneZenith = new SunriseSceneZenith(
        canvas_zenith,
        imageData_zenith,
        width,
        height,
      );
      let sunriseSceneAzimuth = new SunriseSceneAzimuth(
        canvas_azimuth,
        imageData_azimuth,
        width,
        height,
      );
      sunriseSceneZenith.set_color_map((theta) => {
        return [0, 0, 0, 128 * (1 - Math.cos(theta))];
      });
      sunriseSceneAzimuth.set_color_map((phi) => {
        let a;
        if (phi < (2 * Math.PI) / 3) {
          a = phi / ((2 * Math.PI) / 3);
          return [256 * (1 - a), 256 * a, 0, 255];
        } else if (phi < (4 * Math.PI) / 3) {
          a = phi / ((2 * Math.PI) / 3) - 1;
          return [0, 256 * (1 - a), 256 * a, 255];
        } else {
          a = phi / ((2 * Math.PI) / 3) - 2;
          return [256 * a, 0, 256 * (1 - a), 255];
        }
      });

      // *** Make the 3D globe scene
      let canvas_globe = prepare_canvas(width, height, "three-d-globe");
      let [xmin, xmax] = [-5, 5];
      let [ymin, ymax] = [-5, 5];
      let [zmin, zmax] = [-5, 5];

      // Initialize three-dimensional scene, zoomed in
      let zoom_ratio = 1.0;
      let globeScene = new ThreeDScene(canvas_globe);
      globeScene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      globeScene.set_zoom(zoom_ratio);
      globeScene.set_view_mode("orthographic");

      // Rotate the camera angle and set the camera position
      globeScene.camera.rot_view_z(Math.PI / 4);
      globeScene.camera.rot_view(
        [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
        (2 * Math.PI) / 3,
      );
      globeScene.camera.rot_view(
        [1 / Math.sqrt(2), -1 / Math.sqrt(2), 0],
        EARTH_TILT,
      );
      globeScene.camera.move_to(
        rot(
          [1 / Math.sqrt(2), -1 / Math.sqrt(2), 0],
          rot(
            [0, 0, -5],
            [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0],
            (2 * Math.PI) / 3,
          ),
          EARTH_TILT,
        ),
      );

      // Adding click-and-drag interactivity to the canvas
      let arcball = new Arcball(globeScene);
      arcball.set_mode("Rotate");
      arcball.add();

      // Add a sphere to the scene
      let radius = 2.0;
      let globe = new Dot3D([0, 0, 0], radius);
      // globe.fill = false;
      globe.set_fill_color("rgb(200 200 200)");
      globe.set_fill_alpha(0.3);
      globeScene.add("globe", globe);

      // Add an equator
      //
      // TODO Part of this equator should be dotted. One possible solution is to build a "link" to the globe object,
      // and then any piece (i.e. BezierCurve) of the curve whose depth is *greater* than that of the globe
      // will be drawn as dotted.
      //
      // TODO For now, use depth of the globe as a global function, but we can make this more robust by giving
      // the globe a *local* depth function which indicates its depth at a given 2D point in the camera view.
      let equator = new ParametrizedCurve3D(
        (t) => [radius * Math.cos(t), radius * Math.sin(t), 0],
        -Math.PI,
        Math.PI,
        100,
      );
      equator.set_stroke_style("solid");
      equator.set_stroke_width(0.04);
      equator.link_mobject(globe);
      globeScene.add("equator", equator);

      // Add a polar axis
      let polar_axis = new LineSequence3D([
        [0, 0, -1.5 * radius],
        [0, 0, -radius],
        [0, 0, radius],
        [0, 0, 1.5 * radius],
      ]);
      polar_axis.link_mobject(globe);

      let n_pole = new Dot3D([0, 0, radius], 0.1);
      n_pole.set_fill_alpha(1.0);
      n_pole.link_mobject(globe);
      let s_pole = new Dot3D([0, 0, -radius], 0.1);
      s_pole.set_fill_alpha(1.0);
      s_pole.link_mobject(globe);
      globeScene.add("polar_axis", polar_axis);
      globeScene.add("n_pole", n_pole);
      globeScene.add("s_pole", s_pole);

      // Add a latitude line
      let theta: number = Math.PI / 6;
      let latitude_line = new ParametrizedCurve3D(
        (t) => [
          radius * Math.cos(t) * Math.cos(theta),
          radius * Math.sin(t) * Math.cos(theta),
          radius * Math.sin(theta),
        ],
        -Math.PI,
        Math.PI,
        100,
      );
      latitude_line.set_stroke_color("red");
      latitude_line.set_stroke_width(0.04);
      latitude_line.link_mobject(globe);
      globeScene.add("latitude_line", latitude_line);

      // // Add a slider to control the zoom level on the globe scene
      // let zoomSlider = Slider(
      //   document.getElementById("three-d-globe-zoom-slider") as HTMLElement,
      //   function (value: number) {
      //     zoom_ratio = value;
      //     globeScene.set_zoom(value);
      //     globeScene.draw();
      //   },
      //   {
      //     name: "Zoom",
      //     initialValue: `${zoom_ratio}`,
      //     min: 0.3,
      //     max: 3,
      //     step: 0.02,
      //   },
      // );
      // zoomSlider.value = `1.0`;

      globeScene.draw();

      // Slider which controls the latitude on both
      let latitudeSlider = Slider(
        document.getElementById("three-d-globe-slider-1") as HTMLElement,
        function (l: number) {
          sunriseSceneZenith.set_latitude(l);
          sunriseSceneZenith.draw();

          sunriseSceneAzimuth.set_latitude(l);
          sunriseSceneAzimuth.draw();

          theta = (Math.PI * l) / 180;
          latitude_line = globeScene.get_mobj(
            "latitude_line",
          ) as ParametrizedCurve3D;
          latitude_line.set_function((t) => [
            radius * Math.cos(t) * Math.cos(theta),
            radius * Math.sin(t) * Math.cos(theta),
            radius * Math.sin(theta),
          ]);
          globeScene.draw();
        },
        {
          name: "Latitude (degrees)",
          initial_value: "0",
          min: -90,
          max: 90,
          step: 1,
        },
      );
      latitudeSlider.width = 200;
    })(300, 300);
  });
})();
