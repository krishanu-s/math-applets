// src/lib/base.ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
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
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
  }
};
function prepare_canvas(width, height, name) {
  const container = document.getElementById(name);
  if (container == null) throw new Error(`${name} not found`);
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
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

// src/lib/base_geom.ts
var Rectangle = class extends MObject {
  constructor(center, size_x, size_y) {
    super();
    this.fill_color = "black";
    this.center = center;
    this.size_x = size_x;
    this.size_y = size_y;
  }
  move_to(x, y) {
    this.center = [x, y];
  }
  // Draws on the canvas
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.fillStyle = this.fill_color;
    ctx.globalAlpha = this.alpha;
    let [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] - this.size_y / 2
    ]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] + this.size_x / 2,
      this.center[1] - this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] + this.size_x / 2,
      this.center[1] + this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] + this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    [px, py] = scene.v2c([
      this.center[0] - this.size_x / 2,
      this.center[1] - this.size_y / 2
    ]);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
  }
};

// src/random_walk_scene.ts
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    function pick_random_step(dim) {
      const x = 2 * dim * Math.random();
      let output = new Array(dim).fill(0);
      for (let i = 0; i < dim; i++) {
        if (x < 2 * i + 1) {
          output[i] = 1;
          return output;
        } else if (x < 2 * i + 2) {
          output[i] = -1;
          return output;
        }
      }
      throw new Error("Invalid dimension");
    }
    class Histogram extends MObject {
      constructor() {
        super(...arguments);
        this.hist = {};
        this.fill_color = "black";
        // Min/max bin values
        this.bin_min = 0;
        this.bin_max = 100;
        // Min/max counts
        this.count_min = 0;
        this.count_max = 100;
      }
      set_count_limits(min, max) {
        this.count_min = min;
        this.count_max = max;
      }
      set_bin_limits(min, max) {
        this.bin_min = min;
        this.bin_max = max;
      }
      set_hist(hist) {
        this.hist = hist;
      }
      // Create a bunch of rectangles
      draw(canvas, scene) {
        let [xmin, xmax] = scene.xlims;
        let [ymin, ymax] = scene.ylims;
        let bin_width = (xmax - xmin) / (this.bin_max - this.bin_min);
        let ct_height = (ymax - ymin) / (this.count_max - this.count_min);
        let bin;
        let rect_center, rect_height, rect_width;
        for (let i = 0; i < Object.keys(this.hist).length; i++) {
          bin = Object.keys(this.hist)[i];
          rect_center = [
            xmin + (bin - this.bin_min + 0.5) * bin_width,
            ymin + this.hist[bin] * 0.5 * ct_height
          ];
          rect_height = this.hist[bin] * ct_height;
          rect_width = bin_width;
          new Rectangle(rect_center, rect_width, rect_height).draw(
            canvas,
            scene
          );
        }
      }
    }
    (async function graph_random_walk(num_walks, num_steps) {
      let canvas2 = prepare_canvas(300, 300, "histogram-dim-two");
      let canvas3 = prepare_canvas(300, 300, "histogram-dim-three");
      let scene2 = new Scene(canvas2);
      let histogram2 = new Histogram();
      histogram2.set_count_limits(0, num_walks);
      histogram2.set_bin_limits(0, 100);
      scene2.add("histogram", histogram2);
      let scene3 = new Scene(canvas3);
      let histogram3 = new Histogram();
      histogram3.set_count_limits(0, num_walks);
      histogram3.set_bin_limits(0, 100);
      scene3.add("histogram", histogram3);
      let points2 = [];
      for (let i = 0; i < num_walks; i++) {
        points2.push([0, 0]);
      }
      let points3 = [];
      for (let i = 0; i < num_walks; i++) {
        points3.push([0, 0, 0]);
      }
      let x, y, z;
      let dx, dy, dz;
      let dist;
      let hist_data2 = {};
      let hist_data3 = {};
      for (let step = 0; step < num_steps; step++) {
        hist_data2 = { 0: num_walks };
        hist_data3 = { 0: num_walks };
        for (let i = 0; i < num_walks; i++) {
          [x, y, z] = points3[i];
          if (x == 0 && y == 0 && z == 0 && step > 0) {
            continue;
          } else {
            [dx, dy, dz] = pick_random_step(3);
            points3[i] = [x + dx, y + dy, z + dz];
            dist = Math.abs(x + dx) + Math.abs(y + dy) + Math.abs(z + dz);
            hist_data3[dist] = hist_data3[dist] ? hist_data3[dist] + 1 : 1;
            hist_data3[0] = hist_data3[0] - 1;
          }
        }
        for (let i = 0; i < num_walks; i++) {
          [x, y] = points2[i];
          if (x == 0 && y == 0 && step > 0) {
            continue;
          } else {
            [dx, dy] = pick_random_step(2);
            points2[i] = [x + dx, y + dy];
            dist = Math.abs(x + dx) + Math.abs(y + dy);
            hist_data2[dist] = hist_data2[dist] ? hist_data2[dist] + 1 : 1;
            hist_data2[0] = hist_data2[0] - 1;
          }
        }
        if (step % 2 === 0) {
          scene2.get_mobj("histogram").set_hist(hist_data2);
          scene2.draw();
          scene3.get_mobj("histogram").set_hist(hist_data3);
          scene3.draw();
          await delay(1);
        }
        console.log("Step", step);
      }
    })(5e4, 1e3);
  });
})();
