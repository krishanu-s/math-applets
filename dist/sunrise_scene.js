// src/lib/base.ts
var MObject = class {
  // Opacity for drawing
  constructor() {
    this.alpha = 1;
  }
  set_alpha(alpha) {
    this.alpha = alpha;
  }
  draw(canvas, scene, args) {
  }
};
var Scene = class {
  constructor(canvas) {
    this.border_thickness = 4;
    this.border_color = "black";
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
    this.view_xlims = [0, canvas.width];
    this.view_ylims = [0, canvas.height];
  }
  // Sets the coordinates for the borders of the scene. This also resets
  // the current viewing window to match the scene size.
  set_frame_lims(xlims, ylims) {
    this.xlims = xlims;
    this.ylims = ylims;
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Sets the current viewing window
  set_view_lims(xlims, ylims) {
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Sets the current zoom level
  set_zoom(value) {
    this.view_xlims = [this.xlims[0] / value, this.xlims[1] / value];
    this.view_ylims = [this.ylims[0] / value, this.ylims[1] / value];
  }
  // Converts scene coordinates to canvas coordinates
  s2c(x, y) {
    return [
      this.canvas.width * (x - this.xlims[0]) / (this.xlims[1] - this.xlims[0]),
      this.canvas.height * (this.ylims[1] - y) / (this.ylims[1] - this.ylims[0])
    ];
  }
  // Converts viewing coordinates to canvas coordinates
  v2c(v) {
    return [
      this.canvas.width * (v[0] - this.view_xlims[0]) / (this.view_xlims[1] - this.view_xlims[0]),
      this.canvas.height * (this.view_ylims[1] - v[1]) / (this.view_ylims[1] - this.view_ylims[0])
    ];
  }
  // Converts canvas coordinates to scene coordinates
  c2s(x, y) {
    return [
      this.xlims[0] + x * (this.xlims[1] - this.xlims[0]) / this.canvas.width,
      this.ylims[1] - y * (this.ylims[1] - this.ylims[0]) / this.canvas.height
    ];
  }
  // Converts canvas coordinates to viewing coordinates
  c2v(x, y) {
    return [
      this.view_xlims[0] + x * (this.view_xlims[1] - this.view_xlims[0]) / this.canvas.width,
      this.view_ylims[1] - y * (this.view_ylims[1] - this.view_ylims[0]) / this.canvas.height
    ];
  }
  // Adds a mobject to the scene
  add(name, mobj) {
    this.mobjects[name] = mobj;
  }
  // Removes the mobject from the scene
  remove(name) {
    delete this.mobjects[name];
  }
  // Removes all mobjects from the scene
  clear() {
    this.mobjects = {};
  }
  // Gets the mobject by name
  get_mobj(name) {
    let mobj = this.mobjects[name];
    if (mobj == void 0) throw new Error(`${name} not found`);
    return mobj;
  }
  // Draws the scene
  draw(args) {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

// src/lib/base_geom.ts
function vec2_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
function vec2_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
}
var Line = class extends MObject {
  constructor(start, end, kwargs) {
    super();
    this.start = start;
    this.end = end;
    let stroke_width = kwargs.stroke_width;
    if (stroke_width == void 0) {
      this.stroke_width = 0.08;
    } else {
      this.stroke_width = stroke_width;
    }
    let stroke_color = kwargs.stroke_color;
    if (stroke_color == void 0) {
      this.stroke_color = `rgb(0, 0, 0)`;
    } else {
      this.stroke_color = stroke_color;
    }
  }
  // Moves the start and end points
  move_start(x, y) {
    this.start = [x, y];
  }
  move_end(x, y) {
    this.end = [x, y];
  }
  length() {
    return vec2_norm(vec2_sub(this.start, this.end));
  }
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.stroke_width * canvas.width / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
};

// src/lib/interactive.ts
function Slider(container, callback, kwargs) {
  let slider = document.createElement("input");
  slider.type = "range";
  slider.value = kwargs.initial_value;
  slider.classList.add("slider");
  slider.id = "floatSlider";
  let name = kwargs.name;
  if (name == void 0) {
    slider.name = "Value";
  } else {
    slider.name = name;
  }
  let min = kwargs.min;
  if (min == void 0) {
    slider.min = "0";
  } else {
    slider.min = `${min}`;
  }
  let max = kwargs.max;
  if (max == void 0) {
    slider.max = "10";
  } else {
    slider.max = `${max}`;
  }
  let step = kwargs.step;
  if (step == void 0) {
    slider.step = ".01";
  } else {
    slider.step = `${step}`;
  }
  container.appendChild(slider);
  let valueDisplay = document.createElement("span");
  valueDisplay.classList.add("value-display");
  valueDisplay.id = "sliderValue";
  valueDisplay.textContent = `${slider.name} = ${slider.value}`;
  container.appendChild(valueDisplay);
  function updateDisplay() {
    callback(slider.value);
    valueDisplay.textContent = `${slider.name} = ${slider.value}`;
    updateSliderColor(slider);
  }
  function updateSliderColor(sliderElement) {
    const value = 100 * parseFloat(sliderElement.value);
    sliderElement.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${value}%, #ddd ${value}%, #ddd 100%)`;
  }
  updateDisplay();
  slider.addEventListener("input", updateDisplay);
  return slider;
}

// src/lib/three_d.ts
function vec3_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2 + x[2] ** 2);
}
function vec3_dot(v, w) {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    result += v[i] * w[i];
  }
  return result;
}
function vec3_scale(x, factor) {
  return [x[0] * factor, x[1] * factor, x[2] * factor];
}

// src/lib/matvec.ts
function normalize(v) {
  let n = vec3_norm(v);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec3_scale(v, 1 / n);
  }
}
function cartesian_to_spherical(v) {
  let nv = normalize(v);
  let theta = Math.asin(nv[2]);
  let phi = Math.acos(nv[0] / Math.cos(theta));
  if (nv[1] / Math.cos(theta) > 0) {
    return [theta, phi];
  } else {
    return [theta, 2 * Math.PI - phi];
  }
}
function matmul_vec(m, v) {
  let result = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    result[i] = vec3_dot(m[i], v);
  }
  return result;
}
function rot_z_matrix(theta) {
  return [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ];
}
function rot_z(v, theta) {
  return matmul_vec(rot_z_matrix(theta), v);
}
function rot_y_matrix(theta) {
  return [
    [Math.cos(theta), 0, Math.sin(theta)],
    [0, 1, 0],
    [-Math.sin(theta), 0, Math.cos(theta)]
  ];
}
function rot_y(v, theta) {
  return matmul_vec(rot_y_matrix(theta), v);
}

// src/lib/color.ts
function spherical_colormap(theta, phi) {
  let a;
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid longitude");
  } else if (phi < 2 * Math.PI / 3) {
    a = phi / (2 * Math.PI / 3);
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else if (phi < 4 * Math.PI / 3) {
    a = phi / (2 * Math.PI / 3) - 1;
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  } else {
    a = phi / (2 * Math.PI / 3) - 2;
    return [0, 0, 0, 256 * (1 - Math.cos(theta))];
  }
}

// src/lib/heatmap.ts
var TwoDimHeatMap = class extends MObject {
  constructor(width, height, valArray_1, valArray_2) {
    super();
    this.width = width;
    this.height = height;
    this.valArray_1 = valArray_1;
    this.valArray_2 = valArray_2;
    this.colorMap = spherical_colormap;
  }
  // Gets/sets values
  set_vals_1(vals) {
    this.valArray_1 = vals;
  }
  get_vals_1() {
    return this.valArray_1;
  }
  set_vals_2(vals) {
    this.valArray_2 = vals;
  }
  get_vals_2() {
    return this.valArray_2;
  }
  // Draws on the canvas
  draw(canvas, scene, imageData) {
    let data = imageData.data;
    for (let i = 0; i < this.width * this.height; i++) {
      const px_val_1 = this.valArray_1[i];
      const px_val_2 = this.valArray_2[i];
      const idx = i * 4;
      [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]] = this.colorMap(
        px_val_1,
        px_val_2
      );
    }
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    ctx.putImageData(imageData, 0, 0);
  }
};

// src/sunrise_scene.ts
var DEGREE = Math.PI / 180;
var EARTH_TILT = 23 * DEGREE;
function sun_zenith_and_azimuth(year_angle, day_angle, tilt, latitude) {
  let v = [-1, 0, 0];
  v = matmul_vec(rot_y(year_angle), v);
  v = matmul_vec(rot_z(-tilt), v);
  v = matmul_vec(rot_y(day_angle - year_angle), v);
  v = matmul_vec(rot_z(latitude), v);
  v = matmul_vec(rot_y(-Math.PI / 2), v);
  v = matmul_vec(rot_z(-Math.PI / 2), v);
  let [theta, phi] = cartesian_to_spherical(v);
  if (phi < 0 || phi > 2 * Math.PI) {
    console.log(phi);
    throw new Error("Invalid azimuth");
  }
  return [Math.PI / 2 - theta, phi];
}
var SunriseScene = class extends Scene {
  constructor(canvas, imageData, width, height) {
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
        {}
      )
    );
    let num_year_steps = 12;
    for (let i = 0; i < num_year_steps; i++) {
      this.add(
        `year_step_${i + 1}`,
        new Line(
          [
            i / num_year_steps * (this.xlims[1] - this.xlims[0]) + this.xlims[0],
            this.ylims[0]
          ],
          [
            i / num_year_steps * (this.xlims[1] - this.xlims[0]) + this.xlims[0],
            this.ylims[1]
          ],
          { stroke_width: 0.2, stroke_color: `rgb(0, 150, 0)` }
        )
      );
    }
    let num_day_steps = 8;
    for (let i = 0; i < num_day_steps; i++) {
      this.add(
        `day_step_${i + 1}`,
        new Line(
          [
            this.xlims[0],
            i / num_day_steps * (this.ylims[1] - this.ylims[0]) + this.ylims[0]
          ],
          [
            this.xlims[1],
            i / num_day_steps * (this.ylims[1] - this.ylims[0]) + this.ylims[0]
          ],
          { stroke_width: 0.2, stroke_color: `rgb(0, 150, 0)` }
        )
      );
    }
  }
  // Sets the latitude
  set_latitude(l) {
    this.latitude = l;
    this._update_values();
  }
  // Converts xy-coordinates to linear array coordinates
  index(x, y) {
    return y * this.width + x;
  }
  _update_values() {
    let ind;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        ind = this.index(x, y);
        [this.zenith_values[ind], this.azimuth_values[ind]] = sun_zenith_and_azimuth(
          x / this.width * 2 * Math.PI,
          y / this.height * 2 * Math.PI,
          EARTH_TILT,
          DEGREE * this.latitude
        );
      }
    }
  }
  draw() {
    let ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let mobj;
    mobj = this.get_mobj("heatmap");
    mobj.draw(this.canvas, this, this.imageData);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj2 = this.get_mobj(name);
      if (mobj2 == void 0) throw new Error(`${name} not found`);
      if (!(mobj2 instanceof TwoDimHeatMap)) {
        mobj2.draw(this.canvas, this);
      }
    });
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
};
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    function prepare_canvas(width2, height2, name) {
      const container = document.getElementById(name);
      if (container == null) throw new Error(`${name} not found`);
      container.style.width = `${width2}px`;
      container.style.height = `${height2}px`;
      let wrapper = document.createElement("div");
      wrapper.classList.add("canvas_container");
      wrapper.classList.add("non_selectable");
      wrapper.style.width = `${width2}px`;
      wrapper.style.height = `${height2}px`;
      let canvas2 = document.createElement("canvas");
      canvas2.classList.add("non_selectable");
      canvas2.style.position = "relative";
      canvas2.style.top = "0";
      canvas2.style.left = "0";
      canvas2.height = height2;
      canvas2.width = width2;
      wrapper.appendChild(canvas2);
      container.appendChild(wrapper);
      console.log("Canvas made");
      return canvas2;
    }
    let width = 300;
    let height = 300;
    let canvas = prepare_canvas(width, height, "scene-container-1");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }
    const imageData = ctx.createImageData(width, height);
    let sunriseScene = new SunriseScene(canvas, imageData, width, height);
    let latitude_slider = Slider(
      document.getElementById("slider-container-1"),
      function(l) {
        sunriseScene.set_latitude(l);
        sunriseScene.draw();
      },
      { initial_value: "0", min: -90, max: 90, step: 0.01 }
    );
    latitude_slider.width = 200;
  });
})();
