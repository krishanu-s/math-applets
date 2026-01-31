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
function vec3_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
}
var ThreeDMObject = class extends MObject {
};
var Dot3D = class extends ThreeDMObject {
  constructor(center, radius) {
    super();
    this.fill_color = "black";
    this.center = center;
    this.radius = radius;
  }
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.fillStyle = this.fill_color;
    ctx.globalAlpha = this.alpha;
    let p = scene.camera_view(this.center);
    if (p != null) {
      let [cx, cy] = scene.v2c(p);
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        this.radius * canvas.width / (scene.view_xlims[1] - scene.view_xlims[0]),
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }
};
var Line3D = class extends ThreeDMObject {
  constructor(start, end) {
    super();
    this.stroke_width = 0.04;
    this.stroke_color = "black";
    this.start = start;
    this.end = end;
  }
  // Moves the start and end points
  move_start(v) {
    this.start = v;
  }
  move_end(v) {
    this.end = v;
  }
  draw(canvas, scene) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    let [xmin, xmax] = scene.xlims;
    ctx.lineWidth = this.stroke_width * canvas.width / (xmax - xmin);
    ctx.strokeStyle = this.stroke_color;
    ctx.globalAlpha = this.alpha;
    let s = scene.camera_view(this.start);
    let e = scene.camera_view(this.end);
    if (s == null || e == null) return;
    let [start_x, start_y] = scene.v2c(s);
    let [end_x, end_y] = scene.v2c(e);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
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
      projected_vertices.push(scene.camera_view(vertices[i]));
    }
    let v;
    const canvas_vertices = [];
    for (let i = 0; i < vertices.length; i++) {
      let v2 = projected_vertices[i];
      if (v2 == null) {
        canvas_vertices.push(v2);
      } else {
        canvas_vertices.push(scene.v2c(v2));
      }
    }
    let start_x, start_y, end_x, end_y;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < i; j++) {
        if ((i ^ j) == 1 || (i ^ j) == 2 || (i ^ j) == 4) {
          if (canvas_vertices[i] == null || canvas_vertices[j] == null) {
            continue;
          } else {
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
  }
};
var ThreeDScene = class extends Scene {
  constructor() {
    super(...arguments);
    // Inverse of the camera matrix
    // TODO Also give the camera a position vector
    this.camera_frame_inv = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    this.camera_position = [0, 0, 0];
    this.mode = "perspective";
  }
  // Set the camera position
  set_camera_position(position) {
    this.camera_position = position;
  }
  // Translate the camera matrix by a given vector
  translate(vec) {
    this.camera_position = vec3_sum(this.camera_position, vec);
  }
  // Set the camera frame inverse
  set_camera_frame_inv(frame_inv) {
    this.camera_frame_inv = frame_inv;
  }
  // Get the camera frame matrix
  get_camera_frame() {
    return mat_inv(this.camera_frame_inv);
  }
  // Rotate the camera matrix around the z-axis.
  rot_z(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_z_matrix(-angle)
    );
  }
  // Rotate the camera matrix around the y-axis.
  rot_y(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_y_matrix(-angle)
    );
  }
  // Rotate the camera matrix around the x-axis.
  rot_x(angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_x_matrix(-angle)
    );
  }
  // Rotate the camera matrix around a given axis
  rot(axis, angle) {
    this.camera_frame_inv = matmul_mat(
      this.camera_frame_inv,
      rot_matrix(axis, -angle)
    );
  }
  // Modes of viewing/drawing
  set_view_mode(mode) {
    this.mode = mode;
  }
  camera_view(p) {
    if (this.mode == "perspective") {
      return this.perspective_view(p);
    } else {
      return this.projection_view(p);
    }
  }
  // Projects a 3D point onto the camera view plane. Does not include perspective.
  projection_view(p) {
    let [vx, vy, vz] = matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position)
    );
    return [vx, vy];
  }
  // Projects a 3D point onto the camera view plane, and then divides by the third coordinate.
  // Returns null if the third coordinate is nonpositive (i.e., the point is behind the camera).
  perspective_view(p) {
    let [vx, vy, vz] = matmul_vec(
      this.camera_frame_inv,
      vec3_sub(p, this.camera_position)
    );
    if (vz <= 0) {
      return null;
    } else {
      return [vx / vz, vy / vz];
    }
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
function mat_inv(m) {
  let det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  if (det == 0) {
    throw new Error("Can't invert a singular matrix");
  }
  let inv_det = 1 / det;
  return [
    [
      inv_det * (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
      inv_det * (m[0][2] * m[2][1] - m[0][1] * m[2][2]),
      inv_det * (m[0][1] * m[1][2] - m[0][2] * m[1][1])
    ],
    [
      inv_det * (m[1][2] * m[2][0] - m[1][0] * m[2][2]),
      inv_det * (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
      inv_det * (m[0][2] * m[1][0] - m[0][0] * m[1][2])
    ],
    [
      inv_det * (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
      inv_det * (m[0][1] * m[2][0] - m[0][0] * m[2][1]),
      inv_det * (m[0][0] * m[1][1] - m[0][1] * m[1][0])
    ]
  ];
}
function get_column(m, i) {
  return [m[0][i], m[1][i], m[2][i]];
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
function rot_x_matrix(theta) {
  return [
    [1, 0, 0],
    [0, Math.cos(theta), -Math.sin(theta)],
    [0, Math.sin(theta), Math.cos(theta)]
  ];
}
function rot_matrix(axis, angle) {
  let [x, y, z] = normalize(axis);
  let theta = Math.acos(z);
  let phi = Math.acos(x / Math.sin(theta));
  if (y / Math.sin(theta) < 0) {
    phi = 2 * Math.PI - phi;
  }
  let result = rot_z_matrix(-phi);
  result = matmul_mat(rot_y_matrix(-theta), result);
  result = matmul_mat(rot_z_matrix(angle), result);
  result = matmul_mat(rot_y_matrix(theta), result);
  result = matmul_mat(rot_z_matrix(phi), result);
  return result;
}
function rot(v, axis, angle) {
  let [x, y, z] = normalize(axis);
  let theta = Math.acos(z);
  let phi = Math.acos(x / Math.sin(theta));
  if (y / Math.sin(theta) < 0) {
    phi = 2 * Math.PI - phi;
  }
  let result = rot_z(v, -phi);
  result = rot_y(result, -theta);
  result = rot_z(result, angle);
  result = rot_y(result, theta);
  result = rot_z(result, phi);
  return result;
}

// src/lib/interactive.ts
function Button(container, callback) {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "interactiveButton";
  container.appendChild(button);
  button.addEventListener("click", (event) => {
    callback();
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 100);
  });
  return button;
}

// src/lib/base_geom.ts
function vec_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
function vec2_normalize(x) {
  let n = vec_norm(x);
  if (n == 0) {
    throw new Error("Can't normalize the zero vector");
  } else {
    return vec_scale(x, 1 / n);
  }
}
function vec_scale(x, factor) {
  return [x[0] * factor, x[1] * factor];
}
function vec_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
}

// src/lib/arcball.ts
var Arcball = class {
  constructor(scene) {
    this.drag = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.dragDiff = [0, 0];
    this.mode = "Translate";
    this.scene = scene;
  }
  set_mode(mode) {
    this.mode = mode;
  }
  switch_mode() {
    this.mode = this.mode == "Translate" ? "Rotate" : "Translate";
  }
  click(event) {
    this.dragStart = [
      event.pageX - this.scene.canvas.offsetLeft,
      event.pageY - this.scene.canvas.offsetTop
    ];
    this.drag = true;
  }
  unclick(event) {
    this.drag = false;
  }
  drag_cursor(event) {
    if (this.drag) {
      this.dragEnd = [
        event.pageX - this.scene.canvas.offsetLeft,
        event.pageY - this.scene.canvas.offsetTop
      ];
      this.dragDiff = vec_sub(
        this.scene.c2s(this.dragStart[0], this.dragStart[1]),
        this.scene.c2s(this.dragEnd[0], this.dragEnd[1])
      );
      if (this.dragDiff[0] == 0 && this.dragDiff[1] == 0) {
        return;
      }
      if (this.mode == "Translate") {
        let camera_frame = this.scene.get_camera_frame();
        this.scene.translate(
          vec3_sum(
            vec3_scale(get_column(camera_frame, 0), this.dragDiff[0]),
            vec3_scale(get_column(camera_frame, 1), this.dragDiff[1])
          )
        );
      } else if (this.mode == "Rotate") {
        let v = vec2_normalize([this.dragDiff[1], -this.dragDiff[0]]);
        let camera_frame = this.scene.get_camera_frame();
        let rot_axis = vec3_sum(
          vec3_scale(get_column(camera_frame, 0), v[0]),
          vec3_scale(get_column(camera_frame, 1), v[1])
        );
        let n = vec_norm(this.dragDiff);
        this.scene.rot(rot_axis, n);
        this.scene.set_camera_position(
          rot(this.scene.camera_position, rot_axis, n)
        );
      }
      this.scene.draw();
      this.dragStart = this.dragEnd;
    }
  }
  add() {
    let self = this;
    this.scene.canvas.addEventListener("mousedown", self.click.bind(self));
    this.scene.canvas.addEventListener("mouseup", self.unclick.bind(self));
    this.scene.canvas.addEventListener(
      "mousemove",
      self.drag_cursor.bind(self)
    );
    console.log("Arcball added");
  }
  remove() {
    let self = this;
    this.scene.canvas.removeEventListener("mousedown", self.click);
    this.scene.canvas.removeEventListener("mouseup", self.unclick);
    this.scene.canvas.removeEventListener("mousemove", self.drag_cursor);
  }
};

// src/three_d_scene.ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (async function three_d_cube(width, height) {
      let canvas = prepare_canvas(width, height, "three-d-cube");
      let zoom_ratio = 3.5;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_view_lims(
        [-5 / zoom_ratio, 5 / zoom_ratio],
        [-5 / zoom_ratio, 5 / zoom_ratio]
      );
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4)
      );
      scene.add("cube", new Cube([0, 0, 0], 3));
      scene.add("dot", new Dot3D([0, 0, 0], 0.05));
      scene.draw();
      let arcball = new Arcball(scene);
      arcball.add();
      let playing = true;
      let pauseButton = Button(
        document.getElementById("three-d-cube-pause-button"),
        function() {
          playing = !playing;
          if (pauseButton.textContent == "Pause simulation") {
            pauseButton.textContent = "Unpause simulation";
          } else if (pauseButton.textContent == "Unpause simulation") {
            pauseButton.textContent = "Pause simulation";
          } else {
            throw new Error();
          }
        }
      );
      pauseButton.textContent = "Pause simulation";
      pauseButton.style.padding = "15px";
      let modeButton = Button(
        document.getElementById("three-d-cube-mode-button"),
        function() {
          if (arcball.mode == "Translate") {
            arcball.mode = "Rotate";
          } else if (arcball.mode == "Rotate") {
            arcball.mode = "Translate";
          } else {
            throw new Error();
          }
          modeButton.textContent = `Mode = ${arcball.mode}`;
        }
      );
      modeButton.textContent = `Mode = ${arcball.mode}`;
      modeButton.style.padding = "15px";
      let axis = [1, 0, 0];
      let perturb_angle = Math.PI / 200;
      let perturb_axis = [0, 1, 0];
      let perturb_axis_angle = Math.PI / 50;
      while (true) {
        if (playing) {
          perturb_axis = rot(perturb_axis, axis, Math.random() * Math.PI * 2);
          axis = rot(axis, perturb_axis, perturb_axis_angle);
          scene.rot(axis, perturb_angle);
          scene.camera_position = rot(
            scene.camera_position,
            axis,
            perturb_angle
          );
          scene.draw();
        }
        await delay(10);
      }
    })(300, 300);
    (function three_d_graph(width, height) {
      let canvas = prepare_canvas(width, height, "three-d-graph");
      let zoom_ratio = 1;
      let scene = new ThreeDScene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      scene.set_view_lims(
        [-5 / zoom_ratio, 5 / zoom_ratio],
        [-5 / zoom_ratio, 5 / zoom_ratio]
      );
      scene.set_view_mode("projection");
      scene.rot_z(Math.PI / 4);
      scene.rot([1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4);
      scene.set_camera_position(
        rot([0, 0, -8], [1 / Math.sqrt(2), 1 / Math.sqrt(2), 0], Math.PI / 4)
      );
      scene.add("x-axis", new Line3D([-5, 0, 0], [5, 0, 0]));
      scene.add("y-axis", new Line3D([0, -5, 0], [0, 5, 0]));
      scene.add("z-axis", new Line3D([0, 0, -5], [0, 0, 5]));
      let arcball = new Arcball(scene);
      arcball.add();
      let modeButton = Button(
        document.getElementById("three-d-graph-mode-button"),
        function() {
          arcball.switch_mode();
          modeButton.textContent = `Mode = ${arcball.mode}`;
        }
      );
      modeButton.textContent = `Mode = ${arcball.mode}`;
      modeButton.style.padding = "15px";
      scene.draw();
    })(300, 300);
  });
})();
