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
function vec3_sum(x, y) {
  return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
}
var ThreeDMObject = class extends MObject {
};
var Cube = class extends ThreeDMObject {
  constructor(center, size) {
    super();
    this.center = center;
    this.size = size;
    this.stroke_width = 0.05;
    this.stroke_color = "black";
  }
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.stroke_width * canvas.width / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;
    const vertices = [
      vec3_sum(this.center, vec3_scale([1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, 1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([1, -1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, 1, -1], this.size / 2)),
      vec3_sum(this.center, vec3_scale([-1, -1, -1], this.size / 2))
    ];
    const projected_vertices = [];
    for (let i = 0; i < vertices.length; i++) {
      projected_vertices.push(
        scene.project_to_camera_view(vertices[i])
      );
    }
    const canvas_vertices = [];
    for (let i = 0; i < vertices.length; i++) {
      canvas_vertices.push(scene.v2c(projected_vertices[i]));
    }
    let start_x, start_y, end_x, end_y;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < i; j++) {
        if ((i ^ j) == 1 || (i ^ j) == 2 || (i ^ j) == 4) {
          [start_x, start_y] = canvas_vertices[i];
          [end_x, end_y] = canvas_vertices[j];
          ctx.beginPath();
          ctx.moveTo(start_x, start_y);
          ctx.lineTo(end_x, end_y);
          ctx.stroke();
        }
      }
    }
  }
};
var ThreeDScene = class extends Scene {
  constructor(canvas) {
    super(canvas);
    this.camera_inv = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }
  // Rotate the camera matrix around the z-axis.
  rot_z(angle) {
    this.camera_inv = matmul_mat(this.camera_inv, rot_z(angle));
  }
  // Rotate the camera matrix around the y-axis.
  rot_y(angle) {
    this.camera_inv = matmul_mat(this.camera_inv, rot_y(angle));
  }
  // Rotate the camera matrix around the x-axis.
  rot_x(angle) {
    this.camera_inv = matmul_mat(this.camera_inv, rot_x(angle));
  }
  // Rotate the camera matrix around a given axis
  rot(axis, angle) {
    this.camera_inv = matmul_mat(this.camera_inv, rot(axis, angle));
  }
  // Projects a 3D point onto the camera view plane.
  project_to_camera_view(p) {
    let [vx, vy, vz] = matmul_vec(this.camera_inv, p);
    return [vx, vy];
  }
  // Draw
};

// src/lib/matvec.ts
function transpose(m) {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]]
  ];
}
function normalize(v) {
  let n = vec3_norm(v);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec3_scale(v, 1 / n);
  }
}
function matmul_vec(m, v) {
  let result = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    result[i] = vec3_dot(m[i], v);
  }
  return result;
}
function matmul_mat(m1, m2) {
  let result = [];
  for (let i = 0; i < 3; i++) {
    result.push(matmul_vec(m1, [m2[0][i], m2[1][i], m2[2][i]]));
  }
  return transpose(result);
}
function rot_z(theta) {
  return [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ];
}
function rot_y(theta) {
  return [
    [Math.cos(theta), 0, Math.sin(theta)],
    [0, 1, 0],
    [-Math.sin(theta), 0, Math.cos(theta)]
  ];
}
function rot_x(theta) {
  return [
    [1, 0, 0],
    [0, Math.cos(theta), -Math.sin(theta)],
    [0, Math.sin(theta), Math.cos(theta)]
  ];
}
function rot(axis, angle) {
  let [x, y, z] = normalize(axis);
  let theta = Math.acos(z);
  let phi = Math.acos(x / Math.sin(theta));
  if (y / Math.sin(theta) < 0) {
    phi = 2 * Math.PI - phi;
  }
  let result = rot_z(-phi);
  result = matmul_mat(rot_y(-theta), result);
  result = matmul_mat(rot_z(angle), result);
  result = matmul_mat(rot_y(theta), result);
  result = matmul_mat(rot_z(phi), result);
  return result;
}

// src/three_d_scene.ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
(function() {
  document.addEventListener("DOMContentLoaded", async function() {
    let width = 300;
    let height = 300;
    let canvas = prepare_canvas(width, height, "three-d-cube");
    let scene = new ThreeDScene(canvas);
    scene.set_frame_lims([-5, 5], [-5, 5]);
    scene.add("cube", new Cube([0, 0, 0], 2));
    scene.rot_z(Math.PI / 4);
    scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
    scene.draw();
    let axis = [1, 0, 0];
    let perturb_axis = [0, 1, 0];
    let perturb_axis_angle = Math.PI / 50;
    let perturb_angle = Math.PI / 100;
    for (let step = 0; step < 1e3; step++) {
      perturb_axis = matmul_vec(
        rot(axis, Math.random() * Math.PI * 2),
        perturb_axis
      );
      axis = matmul_vec(rot(perturb_axis, perturb_axis_angle), axis);
      scene.rot(axis, perturb_angle);
      scene.draw();
      await delay(30);
    }
  });
})();
