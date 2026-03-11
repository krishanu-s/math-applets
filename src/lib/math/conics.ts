import {
  Vec2D,
  vec2_sum,
  vec2_scale,
  vec2_rot,
  ParametricFunction,
  vec2_polar_form,
} from "../base";
import { MultipleBranchParametricFunction } from "../base";

// The equation for a conic section in Cartesian form. Equivalently, a quadratic equation in two variables.
export class CartEq {
  c_xx: number = 1;
  c_xy: number = 0;
  c_yy: number = 1;
  c_x: number = 0;
  c_y: number = 0;
  c: number = -1;
  constructor(
    c_xx: number,
    c_xy: number,
    c_yy: number,
    c_x: number,
    c_y: number,
    c: number,
  ) {
    this.c_xx = c_xx;
    this.c_xy = c_xy;
    this.c_yy = c_yy;
    this.c_x = c_x;
    this.c_y = c_y;
    this.c = c;
  }
  clone(): CartEq {
    return new CartEq(
      this.c_xx,
      this.c_xy,
      this.c_yy,
      this.c_x,
      this.c_y,
      this.c,
    );
  }
  set_c_xx(c: number) {
    this.c_xx = c;
    return this;
  }
  set_c_xy(c: number) {
    this.c_xy = c;
    return this;
  }
  set_c_yy(c: number) {
    this.c_yy = c;
    return this;
  }
  set_c_x(c: number) {
    this.c_x = c;
    return this;
  }
  set_c_y(c: number) {
    this.c_y = c;
    return this;
  }
  set_c(c: number) {
    this.c = c;
    return this;
  }
  rotate(theta: number) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);

    let c_xx = this.c_xx * c ** 2 + this.c_yy * s ** 2 - this.c_xy * c * s;
    let c_yy = this.c_yy * c ** 2 + this.c_xx * s ** 2 + this.c_xy * c * s;
    let c_xy =
      (this.c_xx - this.c_yy) * Math.sin(2 * theta) +
      this.c_xy * Math.cos(2 * theta);
    [this.c_xx, this.c_xy, this.c_yy] = [c_xx, c_xy, c_yy];

    let c_x = this.c_x * c - this.c_y * s;
    let c_y = this.c_x * s + this.c_y * c;
    [this.c_x, this.c_y] = [c_x, c_y];
  }
  translate_x(a: number) {
    let c = this.c - a * this.c_x + a ** 2 * this.c_xx;
    let c_x = this.c_x - 2 * a * this.c_xx;
    let c_y = this.c_y - a * this.c_xy;
    this.c = c;
    this.c_x = c_x;
    this.c_y = c_y;
  }
  translate_y(a: number) {
    let c = this.c - a * this.c_y + a ** 2 * this.c_yy;
    let c_y = this.c_y - 2 * a * this.c_yy;
    let c_x = this.c_x - a * this.c_xy;
    this.c = c;
    this.c_x = c_x;
    this.c_y = c_y;
  }
  // Converts the Cartesian form to polar form.
  // TODO There is an error in here somewhere. Trace through carefully.
  to_polar(): PolarEq {
    let cart_eq = this.clone();
    let ax: number, ay: number;
    let polar_eq: PolarEq;
    let theta: number;

    // First apply a rotation by θ to eliminate the c_xy term, using
    // tan(2θ) = c_xy / (c_xx - c_yy)
    if (cart_eq.c_xx == cart_eq.c_yy) {
      theta = Math.PI / 4;
    } else {
      theta = 0.5 * Math.atan(cart_eq.c_xy / (cart_eq.c_xx - cart_eq.c_yy));
    }
    cart_eq.rotate(theta);
    if (Math.abs(cart_eq.c_xy) > 0.01) {
      throw new Error(`c_xy is nonzero, ${cart_eq.c_xy}`);
    }

    // At this point, either c_xx is nonzero or c_yy is nonzero.
    // Rotate by π/2 if necessary to ensure |c_yy| >= |c_xx|,
    if (Math.abs(cart_eq.c_yy) < Math.abs(cart_eq.c_xx)) {
      cart_eq.rotate(Math.PI / 2);
      theta += Math.PI / 2;
    }
    if (Math.abs(cart_eq.c_xx) > Math.abs(cart_eq.c_yy)) {
      throw new Error(
        `|c_xx| is greater than |c_yy|, ${cart_eq.c_xx}, ${cart_eq.c_yy}`,
      );
    }

    // Translate vertically to eliminate the c_y term
    ay = cart_eq.c_y / (2 * cart_eq.c_yy);
    cart_eq.translate_y(ay);
    if (Math.abs(cart_eq.c_y) > 0.01) {
      throw new Error(`c_y is nonzero, ${cart_eq.c_y}`);
    }

    // Case 1: If c_xx == 0, then the result is a parabola Cy^2 + Dx + F = 0.
    if (cart_eq.c_xx == 0) {
      // Parabola

      // Translate x to eliminate the constant term F, and thus vertex at (0, 0)
      ax = cart_eq.c / cart_eq.c_x;
      cart_eq.translate_x(ax);
      if (Math.abs(cart_eq.c) > 0.01) {
        throw new Error(`c is nonzero, ${cart_eq.c}`);
      }

      // Now the equation is (-C/D)y^2 = x, so retrieve the equation
      let m = -cart_eq.c_yy / cart_eq.c_x;
      if (m > 0) {
        polar_eq = new PolarEq([0.25 / m, 0], 1, 0.5 / m, Math.PI);
      } else {
        polar_eq = new PolarEq([0.25 / m, 0], 1, -0.5 / m, 0);
      }
    }
    // Case 2: If c_xx != 0, then the result is an ellipse or hyperbola Ax^2 + Cy^2 + Dx + F = 0.
    else {
      // Translate x to eliminate the c_x term and thus center at (0, 0).
      ax = cart_eq.c_x / (2 * cart_eq.c_xx);
      cart_eq.translate_x(ax);
      if (Math.abs(cart_eq.c_x) > 0.01) {
        throw new Error(`c_x is nonzero, ${cart_eq.c_x}`);
      }

      // Now the equation is Ax^2 + Cy^2 + F = 0 with |C| >= |A|
      if (cart_eq.c_xx * cart_eq.c_yy > 0) {
        // Trivial case of a conic with no real points
        if (cart_eq.c_xx * cart_eq.c > 0) {
          return new PolarEq([1000, 1000], 0, 0, 0);
        }

        // Ellipse (x/a)^2 + (y/b)^2 = 1 with a >= b
        let a = Math.sqrt(-cart_eq.c / cart_eq.c_xx);
        let b = Math.sqrt(-cart_eq.c / cart_eq.c_yy);
        if (a == b) {
          polar_eq = new PolarEq([0, 0], 0, a, 0);
        } else {
          let half_focal_length = Math.sqrt(a ** 2 - b ** 2);
          polar_eq = new PolarEq(
            [half_focal_length, 0],
            half_focal_length / a,
            b ** 2 / a,
            0,
          );
        }
      } else {
        // Hyperbola (x/a)^2 - (y/b)^2 = 1
        if (cart_eq.c_xx < 0) {
          cart_eq.rotate(Math.PI / 2);
          theta += Math.PI / 2;
        }
        if (cart_eq.c_xx < 0) {
          throw new Error(`c_xx is negative, ${cart_eq.c_xx}`);
        }

        let a = Math.sqrt(-cart_eq.c / cart_eq.c_xx);
        let b = Math.sqrt(cart_eq.c / cart_eq.c_yy);
        let half_focal_length = Math.sqrt(a ** 2 + b ** 2);
        polar_eq = new PolarEq(
          [-half_focal_length, 0],
          half_focal_length / a,
          b ** 2 / a,
          0,
        );
      }
    }
    polar_eq.translate_x(-ax);
    polar_eq.translate_y(-ay);
    polar_eq.rotate(-theta);
    return polar_eq;
  }
}

// The equation for a conic section in polar form, i.e.
// R(θ) = C / (1 + E * cos(θ - θ_0))
export class PolarEq {
  focus: Vec2D = [0, 0];
  e: number = 0;
  c: number = 1;
  theta_0: number = 0;
  constructor(focus: Vec2D, e: number, c: number, theta_0: number) {
    this.focus = focus;
    this.e = e;
    this.c = c;
    this.theta_0 = theta_0;
  }
  param(t: number): Vec2D {
    return vec2_sum(
      this.focus,
      vec2_polar_form(this.c / (1 + this.e * Math.cos(t - this.theta_0)), t),
    );
  }
  set_focus(f: Vec2D) {
    this.focus = f;
    return this;
  }
  set_e(e: number) {
    this.e = e;
    return this;
  }
  set_c(c: number) {
    this.c = c;
    return this;
  }
  set_theta_0(theta_0: number) {
    this.theta_0 = theta_0;
    return this;
  }
  // Rotate counterclockwise by theta around the origin
  rotate(theta: number) {
    this.theta_0 += theta;
    this.focus = vec2_rot(this.focus, theta);
  }
  translate_x(a: number) {
    this.focus = vec2_sum(this.focus, [a, 0]);
  }
  translate_y(a: number) {
    this.focus = vec2_sum(this.focus, [0, a]);
  }
}

// A conic section as a collection of branches
// TODO Calculate the discontinuity buffer based on the scene limits.
const DISCONTINUITY_BUFFER = 0.005;
function trivial_function(t: number): Vec2D {
  return [1000, 1000];
}
export class ConicSection extends MultipleBranchParametricFunction {
  cart_eq: CartEq;
  polar_eq: PolarEq;
  constructor(
    cart_eq: CartEq,
    polar_eq: PolarEq,
    num_steps: number,
    solver: any,
  ) {
    super(num_steps, solver);
    this.cart_eq = cart_eq;
    this.polar_eq = polar_eq;
    if (polar_eq.e < 1) {
      super.add_branch(polar_eq.param.bind(polar_eq), [0, 2 * Math.PI]);
      // Add a faraway trivial function
      super.add_branch(trivial_function, [0, 0]);
    } else {
      // Discontinuities at t = θ_0 \pm arccos(-1/e)
      let a = Math.acos(-1 / polar_eq.e);
      let d1 = polar_eq.theta_0 + a;
      let d0 = polar_eq.theta_0 - a;
      super.add_branch(polar_eq.param.bind(polar_eq), [
        d0 + DISCONTINUITY_BUFFER,
        d1 - DISCONTINUITY_BUFFER,
      ]);
      super.add_branch(polar_eq.param.bind(polar_eq), [
        d1 + DISCONTINUITY_BUFFER,
        d0 - DISCONTINUITY_BUFFER + 2 * Math.PI,
      ]);
    }
  }
  _update() {
    this.polar_eq = this.cart_eq.to_polar();
    if (this.polar_eq.e < 1) {
      super.set_function(this.polar_eq.param.bind(this.polar_eq), 0);
      super.set_lims(0, 2 * Math.PI, 0);
      super.set_function(trivial_function, 1);
      super.set_lims(0, 0, 1);
    } else {
      // Discontinuities at t = θ_0 \pm arccos(-1/e)
      let a = Math.acos(-1 / this.polar_eq.e);
      let d1 = this.polar_eq.theta_0 + a;
      let d0 = this.polar_eq.theta_0 - a;

      super.set_function(this.polar_eq.param.bind(this.polar_eq), 0);
      super.set_lims(d0 + DISCONTINUITY_BUFFER, d1 - DISCONTINUITY_BUFFER, 0);
      super.set_function(this.polar_eq.param.bind(this.polar_eq), 1);
      super.set_lims(
        d1 + DISCONTINUITY_BUFFER,
        d0 - DISCONTINUITY_BUFFER + 2 * Math.PI,
        1,
      );
    }
    this.set_function(this.polar_eq.param.bind(this.polar_eq), 0);
  }
  set_coeffs(
    c_xx: number,
    c_xy: number,
    c_yy: number,
    c_x: number,
    c_y: number,
    c: number,
  ) {
    this.cart_eq.set_c_xx(c_xx);
    this.cart_eq.set_c_xy(c_xy);
    this.cart_eq.set_c_yy(c_yy);
    this.cart_eq.set_c_x(c_x);
    this.cart_eq.set_c_y(c_y);
    this.cart_eq.set_c(c);
    this._update();
  }
}
