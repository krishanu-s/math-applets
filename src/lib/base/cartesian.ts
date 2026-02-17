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

class AxisOptions {
  stroke_width: number = 0.1;
  arrow_size: number = 0.3;
  update(options: Partial<AxisOptions>) {
    Object.assign(this, options);
  }
}

class TickOptions {
  distance: number = 1;
  size: number = 0.5;
  alpha: number = 1.0;
  stroke_width: number = 0.08;
  update(options: Partial<AxisOptions>) {
    Object.assign(this, options);
  }
}

class GridOptions {
  distance: number = 1;
  alpha: number = 0.2;
  stroke_width: number = 0.05;
  update(options: Partial<AxisOptions>) {
    Object.assign(this, options);
  }
}

// An axis with evenly-spaced ticks, in 2D space.
// Consists of a double-headed arrow, and a group of ticks.
export class Axis extends MObjectGroup {
  lims: Vec2D;
  type: "x" | "y";
  axis_options: AxisOptions = new AxisOptions();
  tick_options: TickOptions = new TickOptions();
  constructor(lims: Vec2D, type: "x" | "y") {
    super();
    this.lims = lims;
    this.type = type;

    this._make_axis();
    this._make_ticks();
  }
  _make_axis() {
    let [cmin, cmax] = this.lims;
    let axis;
    if (this.type === "x") {
      axis = new TwoHeadedArrow([cmin, 0], [cmax, 0]);
    } else {
      axis = new TwoHeadedArrow([0, cmin], [0, cmax]);
    }
    axis.set_stroke_width(this.axis_options.stroke_width);
    axis.set_arrow_size(this.axis_options.arrow_size);
    this.add_mobj("axis", axis);
  }
  _make_ticks() {
    let [cmin, cmax] = this.lims;
    let ticks = new LineLikeMObjectGroup()
      .set_alpha(this.tick_options.alpha)
      .set_stroke_width(this.tick_options.stroke_width);
    for (
      let c =
        this.tick_options.distance *
        Math.ceil(cmin / this.tick_options.distance);
      c <
      this.tick_options.distance *
        Math.floor(cmax / this.tick_options.distance);
      c++
    ) {
      if (this.type == "x") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line(
            [c, -this.tick_options.size / 2],
            [c, this.tick_options.size / 2],
          ),
        );
      } else {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line(
            [-this.tick_options.size / 2, c],
            [this.tick_options.size / 2, c],
          ),
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
  set_lims(lims: Vec2D) {
    this.lims = lims;
    this.remove_mobj("axis");
    this.remove_mobj("ticks");
    this._make_axis();
    this._make_ticks();
  }
  set_axis_options(options: Record<string, any>) {
    this.axis_options.update(options);
    this.remove_mobj("axis");
    this._make_axis();
  }
  set_tick_options(options: Record<string, any>) {
    this.tick_options.update(options);
    this.remove_mobj("ticks");
    this._make_ticks();
  }
  set_tick_distance(distance: number) {
    this.tick_options.distance = distance;
    this.set_tick_options(this.tick_options);
  }
  set_tick_size(size: number) {
    this.tick_options.size = size;
    this.set_tick_options(this.tick_options);
  }
}

// A pair of axes forming a 2D coordinate system, plus two groups of grid lines.
export class CoordinateAxes2d extends MObjectGroup {
  xlims: Vec2D;
  ylims: Vec2D;
  axis_options: AxisOptions = new AxisOptions();
  tick_options: TickOptions = new TickOptions();
  grid_options: GridOptions = new GridOptions();
  constructor(xlims: Vec2D, ylims: Vec2D) {
    super();
    this.xlims = xlims;
    this.ylims = ylims;
    this._make_axes();
    this._make_x_grid_lines();
    this._make_y_grid_lines();
  }
  _make_axes() {
    let x_axis = new Axis(this.xlims, "x");
    x_axis.set_axis_options(this.axis_options);
    x_axis.set_tick_options(this.tick_options);
    this.add_mobj("x-axis", x_axis);

    let y_axis = new Axis(this.ylims, "y");
    y_axis.set_axis_options(this.axis_options);
    y_axis.set_tick_options(this.tick_options);
    this.add_mobj("y-axis", y_axis);
  }
  _make_x_grid_lines() {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;

    let x_grid = new LineLikeMObjectGroup()
      .set_alpha(this.grid_options.alpha)
      .set_stroke_width(this.grid_options.stroke_width);
    for (
      let x =
        this.grid_options.distance *
        Math.floor(xmin / this.grid_options.distance);
      x <
      this.grid_options.distance * Math.ceil(xmax / this.grid_options.distance);
      x += this.grid_options.distance
    ) {
      x_grid.add_mobj(`line-(${x})`, new Line([x, ymin], [x, ymax]));
    }
    this.add_mobj("x-grid", x_grid);
  }
  _make_y_grid_lines() {
    let [xmin, xmax] = this.xlims;
    let [ymin, ymax] = this.ylims;

    let y_grid = new LineLikeMObjectGroup()
      .set_alpha(this.grid_options.alpha)
      .set_stroke_width(this.grid_options.stroke_width);
    for (
      let y =
        this.grid_options.distance *
        Math.floor(ymin / this.grid_options.distance);
      y <
      this.grid_options.distance * Math.ceil(ymax / this.grid_options.distance);
      y += this.grid_options.distance
    ) {
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
  set_axis_options(options: Record<string, any>) {
    this.axis_options.update(options);
    this.remove_mobj("x-axis");
    this.remove_mobj("y-axis");
    this._make_axes();
  }
  set_axis_stroke_width(width: number) {
    this.axis_options.stroke_width = width;
    this.set_axis_options(this.axis_options);
  }
  set_tick_options(options: Record<string, any>) {
    this.tick_options.update(options);
    this.remove_mobj("x-axis");
    this.remove_mobj("y-axis");
    this._make_axes();
  }
  set_tick_size(size: number) {
    this.tick_options.size = size;
    this.set_tick_options(this.tick_options);
  }
  set_tick_distance(distance: number) {
    this.tick_options.distance = distance;
    this.set_tick_options(this.tick_options);
  }
  set_grid_options(options: Record<string, any>) {
    this.grid_options.update(options);
    this.remove_mobj("x-grid");
    this.remove_mobj("y-grid");
    this._make_x_grid_lines();
    this._make_y_grid_lines();
  }
  set_grid_distance(distance: number) {
    this.grid_options.distance = distance;
    this.set_grid_options(this.grid_options);
  }
  set_grid_alpha(alpha: number) {
    this.grid_options.alpha = alpha;
    this.set_grid_options(this.grid_options);
  }
  set_grid_stroke_width(width: number) {
    this.grid_options.stroke_width = width;
    this.set_grid_options(this.grid_options);
  }
  set_lims(xlims: Vec2D, ylims: Vec2D) {
    this.xlims = xlims;
    this.ylims = ylims;
    this.x_axis().set_lims(xlims);
    this.y_axis().set_lims(ylims);
    this.remove_mobj("x-grid");
    this.remove_mobj("y-grid");
    this._make_x_grid_lines();
    this._make_y_grid_lines();
  }
}

// An axis with evenly-spaced ticks, in 3D space.
export class Axis3D extends ThreeDMObjectGroup {
  lims: Vec2D;
  type: "x" | "y" | "z";
  tick_size: number = 0.1;
  tick_distance: number = 1;
  constructor(lims: Vec2D, type: "x" | "y" | "z") {
    super();
    this.lims = lims;
    this.type = type;
    this._make_axis();
    this._make_ticks();
  }

  _make_axis() {
    let [cmin, cmax] = this.lims;
    let axis;
    if (this.type === "x") {
      axis = new TwoHeadedArrow3D([cmin, 0, 0], [cmax, 0, 0]);
    } else if (this.type === "y") {
      axis = new TwoHeadedArrow3D([0, cmin, 0], [0, cmax, 0]);
    } else {
      axis = new TwoHeadedArrow3D([0, 0, cmin], [0, 0, cmax]);
    }
    axis.set_arrow_size(0.2);
    this.add_mobj("axis", axis);
  }
  _make_ticks() {
    let [cmin, cmax] = this.lims;
    let ticks = new ThreeDLineLikeMObjectGroup().set_alpha(0.3);
    for (
      let c = this.tick_distance * Math.ceil(cmin / this.tick_distance);
      c < this.tick_distance * Math.floor(cmax / this.tick_distance);
      c++
    ) {
      if (this.type == "x") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D([c, -this.tick_size / 2, 0], [c, this.tick_size / 2, 0]),
        );
      } else if (this.type == "y") {
        ticks.add_mobj(
          `tick-(${c})`,
          new Line3D([0, c, -this.tick_size / 2], [0, c, this.tick_size / 2]),
        );
      } else if (this.type == "z") {
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
  set_tick_distance(distance: number) {
    this.tick_distance = distance;
    this.remove_mobj("ticks");
    this._make_ticks();
  }
  set_tick_size(size: number) {
    this.tick_size = size;
    this.remove_mobj("ticks");
    this._make_ticks();
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
