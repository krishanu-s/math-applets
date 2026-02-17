// MObjects associated with Cartesian coordinates

import {
  LineLikeMObject,
  MObjectGroup,
  LineLikeMObjectGroup,
  StrokeOptions,
  Scene,
} from "./base";
import { Vec2D } from "./vec2";
import { TwoHeadedArrow, Line, Polygon } from "./geometry";
import {
  ThreeDMObject,
  ThreeDMObjectGroup,
  ThreeDLineLikeMObjectGroup,
  Line3D,
  TwoHeadedArrow3D,
  ThreeDLineLikeMObject,
} from "../three_d/mobjects";

// An axis with evenly-spaced ticks, in 2D space.
// Consists of a double-headed arrow, and a group of ticks.
export class Axis extends MObjectGroup {
  lims: Vec2D;
  type: "x" | "y";
  tick_size: number = 0.1;
  stroke_options: StrokeOptions = new StrokeOptions();
  constructor(lims: Vec2D, type: "x" | "y") {
    super();
    this.lims = lims;
    this.type = type;

    let [cmin, cmax] = lims;
    let axis;
    if (type === "x") {
      axis = new TwoHeadedArrow([cmin, 0], [cmax, 0]);
    } else {
      axis = new TwoHeadedArrow([0, cmin], [0, cmax]);
    }
    axis.set_arrow_size(0.2);
    this.add_mobj("axis", axis);

    let ticks = new LineLikeMObjectGroup().set_alpha(0.3);
    for (let c = Math.floor(cmin) + 1; c <= Math.ceil(cmax) - 1; c++) {
      if (type == "x") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line([c, -this.tick_size / 2], [c, this.tick_size / 2]),
        );
      } else {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line([-this.tick_size / 2, c], [this.tick_size / 2, c]),
        );
      }
    }
    this.add_mobj("ticks", ticks);
  }
  axis() {
    return this.get_mobj("axis") as TwoHeadedArrow;
  }
  ticks() {
    return this.get_mobj("ticks") as LineLikeMObjectGroup;
  }
  set_tick_size(size: number) {
    this.tick_size = size;
    let ticks = this.get_mobj("ticks") as MObjectGroup;
    Object.values(ticks.children).forEach((child) => {
      if (child instanceof Line) {
        if (this.type == "x") {
          child.move_start([child.start[0], -size / 2]);
          child.move_end([child.end[0], size / 2]);
        } else {
          child.move_start([-size / 2, child.start[1]]);
          child.move_end([size / 2, child.end[1]]);
        }
      }
    });
  }
}

// A pair of axes forming a 2D coordinate system, plus two groups of grid lines.
export class CoordinateAxes2d extends MObjectGroup {
  xlims: Vec2D;
  ylims: Vec2D;
  tick_size: number = 0.1;
  constructor(xlims: Vec2D, ylims: Vec2D) {
    super();
    this.xlims = xlims;
    this.ylims = ylims;
    this.add_mobj("x-axis", new Axis(xlims, "x"));
    this.add_mobj("y-axis", new Axis(ylims, "y"));

    // Add grid lines
    let [xmin, xmax] = xlims;
    let [ymin, ymax] = ylims;

    let x_grid = new LineLikeMObjectGroup().set_alpha(0.2);
    for (let x = Math.floor(xmin) + 1; x <= Math.ceil(xmax) - 1; x++) {
      x_grid.add_mobj(`line-(${x})`, new Line([x, ymin], [x, ymax]));
    }
    this.add_mobj("x-grid", x_grid);

    let y_grid = new LineLikeMObjectGroup().set_alpha(0.2);
    for (let y = Math.floor(ymin) + 1; y <= Math.ceil(ymax) - 1; y++) {
      y_grid.add_mobj(`line-(${y})`, new Line([xmin, y], [xmax, y]));
    }
    this.add_mobj("y-grid", y_grid);
  }
  x_axis(): Axis {
    return this.get_mobj("x-axis") as Axis;
  }
  y_axis(): Axis {
    return this.get_mobj("y-axis") as Axis;
  }
  x_grid(): LineLikeMObjectGroup {
    return this.get_mobj("x-grid") as LineLikeMObjectGroup;
  }
  y_grid(): LineLikeMObjectGroup {
    return this.get_mobj("y-grid") as LineLikeMObjectGroup;
  }
  set_tick_size(size: number) {
    Object.values(this.children).forEach((child) => {
      if (child instanceof Axis) {
        child.set_tick_size(size);
      }
    });
  }
}

// An axis with evenly-spaced ticks, in 3D space.
export class Axis3D extends ThreeDMObjectGroup {
  lims: Vec2D;
  type: "x" | "y" | "z";
  tick_size: number = 0.1;
  constructor(lims: Vec2D, type: "x" | "y" | "z") {
    super();
    this.lims = lims;
    this.type = type;

    let [cmin, cmax] = lims;
    let axis;
    if (type === "x") {
      axis = new TwoHeadedArrow3D([cmin, 0, 0], [cmax, 0, 0]);
    } else if (type === "y") {
      axis = new TwoHeadedArrow3D([0, cmin, 0], [0, cmax, 0]);
    } else {
      axis = new TwoHeadedArrow3D([0, 0, cmin], [0, 0, cmax]);
    }
    axis.set_arrow_size(0.2);
    this.add_mobj("axis", axis);

    let ticks = new ThreeDLineLikeMObjectGroup().set_alpha(0.3);
    for (let c = Math.floor(cmin) + 1; c <= Math.ceil(cmax) - 1; c++) {
      if (type == "x") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D([c, -this.tick_size / 2, 0], [c, this.tick_size / 2, 0]),
        );
      } else if (type == "y") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D([0, c, -this.tick_size / 2], [0, c, this.tick_size / 2]),
        );
      } else if (type == "z") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D([-this.tick_size / 2, 0, c], [this.tick_size / 2, 0, c]),
        );
      }
    }
    this.add_mobj("ticks", ticks);
  }
  axis() {
    return this.get_mobj("axis") as TwoHeadedArrow3D;
  }
  ticks() {
    return this.get_mobj("ticks") as ThreeDLineLikeMObjectGroup;
  }
  set_tick_size(size: number) {
    let ticks = this.get_mobj("ticks") as ThreeDMObjectGroup;
    Object.values(ticks.children).forEach((child) => {
      if (child instanceof Line3D) {
        if (this.type == "x") {
          child.move_start([child.start[0], -size / 2, 0]);
          child.move_end([child.end[0], size / 2, 0]);
        } else if (this.type == "y") {
          child.move_start([0, child.start[1], -size / 2]);
          child.move_end([0, child.end[1], size / 2]);
        } else if (this.type == "z") {
          child.move_start([-size / 2, 0, child.start[1]]);
          child.move_end([size / 2, 0, child.end[1]]);
        }
      }
    });
  }
}

// A triple of axes forming a 3D coordinate system.
export class CoordinateAxes3d extends ThreeDMObjectGroup {
  xlims: Vec2D;
  ylims: Vec2D;
  zlims: Vec2D;
  tick_size: number = 0.1;
  constructor(xlims: Vec2D, ylims: Vec2D, zlims: Vec2D) {
    super();
    this.xlims = xlims;
    this.ylims = ylims;
    this.zlims = zlims;
    this.add_mobj("x-axis", new Axis3D(xlims, "x"));
    this.add_mobj("y-axis", new Axis3D(ylims, "y"));
    this.add_mobj("z-axis", new Axis3D(zlims, "z"));
  }
  x_axis() {
    return this.get_mobj("x-axis") as Axis3D;
  }
  y_axis() {
    return this.get_mobj("y-axis") as Axis3D;
  }
  z_axis() {
    return this.get_mobj("z-axis") as Axis3D;
  }
  set_tick_size(size: number) {
    Object.values(this.children).forEach((child) => {
      if (child instanceof Axis3D) {
        child.set_tick_size(size);
      }
    });
  }
}

// A polygon representing the integral of a function over an interval.
export class Integral extends Polygon {
  f: (t: number) => number;
  left_endpoint: number;
  right_endpoint: number;
  num_points: number;
  constructor(
    f: (t: number) => number,
    left_endpoint: number,
    right_endpoint: number,
    num_points: number,
  ) {
    const points: Vec2D[] = [];
    for (let i = 0; i <= num_points; i++) {
      const t =
        left_endpoint + ((right_endpoint - left_endpoint) * i) / num_points;
      points.push([t, f(t)]);
    }
    points.push([right_endpoint, 0]);
    points.push([left_endpoint, 0]);
    super(points);

    this.f = f;
    this.left_endpoint = left_endpoint;
    this.right_endpoint = right_endpoint;
    this.num_points = num_points;
  }
  _recompute_points() {
    this.points = [];
    for (let i = 0; i <= this.num_points; i++) {
      const t =
        this.left_endpoint +
        ((this.right_endpoint - this.left_endpoint) * i) / this.num_points;
      this.points.push([t, this.f(t)]);
    }
    this.points.push([this.right_endpoint, 0]);
    this.points.push([this.left_endpoint, 0]);
  }
  set_left_endpoint(left_endpoint: number) {
    this.left_endpoint = left_endpoint;
    this._recompute_points();
  }
  set_right_endpoint(right_endpoint: number) {
    this.right_endpoint = right_endpoint;
    this._recompute_points();
  }
  set_num_points(num_points: number) {
    this.num_points = num_points;
    this._recompute_points();
  }
  set_func(f: (t: number) => number) {
    this.f = f;
    this._recompute_points();
  }
}
