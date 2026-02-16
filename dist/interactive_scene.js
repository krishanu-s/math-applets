var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// node_modules/numpy-ts/dist/numpy-ts.node.cjs
var require_numpy_ts_node = __commonJS({
  "node_modules/numpy-ts/dist/numpy-ts.node.cjs"(exports, module) {
    "use strict";
    var te = Object.defineProperty;
    var ry = Object.getOwnPropertyDescriptor;
    var ty = Object.getOwnPropertyNames;
    var ey = Object.prototype.hasOwnProperty;
    var ny = (r, t) => {
      for (var e in t) te(r, e, { get: t[e], enumerable: true });
    };
    var oy = (r, t, e, n) => {
      if (t && typeof t == "object" || typeof t == "function") for (let o of ty(t)) !ey.call(r, o) && o !== e && te(r, o, { get: () => t[o], enumerable: !(n = ry(t, o)) || n.enumerable });
      return r;
    };
    var ay = (r) => oy(te({}, "__esModule", { value: true }), r);
    var Ng = {};
    ny(Ng, { Complex: () => E, DTYPE_TO_DESCR: () => At, InvalidNpyError: () => ir, NDArray: () => _, SUPPORTED_DTYPES: () => kt, UnsupportedDTypeError: () => Ir, __version__: () => Dg, abs: () => gn, absolute: () => gn, acos: () => hn, acosh: () => xn, amax: () => Mn, amin: () => Fn, angle: () => hf, append: () => $c, apply_along_axis: () => Gm, apply_over_axes: () => Wm, arange: () => Wi, arccos: () => hn, arccosh: () => xn, arcsin: () => bn, arcsinh: () => Nn, arctan: () => Sn, arctan2: () => Dn, arctanh: () => wn, argpartition: () => om, argsort: () => tm, argwhere: () => im, around: () => Rt, array: () => G, array_equal: () => Xc, array_equiv: () => Jc, array_split: () => uc, asanyarray: () => ou, asarray: () => Hr, asarray_chkfinite: () => Ji, ascontiguousarray: () => au, asfortranarray: () => su, asin: () => bn, asinh: () => Nn, atan: () => Sn, atan2: () => Dn, atanh: () => wn, atleast_1d: () => vc, atleast_2d: () => Bc, atleast_3d: () => Ec, average: () => el, bincount: () => Om, bindex: () => Zc, bitwise_and: () => ql, bitwise_count: () => Hl, bitwise_invert: () => Xl, bitwise_left_shift: () => Jl, bitwise_not: () => Pl, bitwise_or: () => Vl, bitwise_right_shift: () => Ql, bitwise_xor: () => jl, block: () => sc, broadcast_arrays: () => jc, broadcast_shapes: () => Pc, broadcast_to: () => Vc, byteswap: () => hc, can_cast: () => Jm, cbrt: () => Al, ceil: () => pm, choose: () => Hc, clip: () => vl, column_stack: () => Oc, common_type: () => Qm, compress: () => kf, concat: () => oc, concatenate: () => Tr, conj: () => vn, conjugate: () => bf, convolve: () => qm, copy: () => Ki, copysign: () => uf, copyto: () => Yc, corrcoef: () => jm, correlate: () => km, cos: () => Pu, cosh: () => Ju, count_nonzero: () => mm, cov: () => Vm, cross: () => Tm, cumprod: () => _n, cumsum: () => zn, cumulative_prod: () => _n, cumulative_sum: () => zn, deg2rad: () => Yu, degrees: () => Wu, delete: () => Rc, diag: () => yn, diag_indices: () => Pf, diag_indices_from: () => Lf, diagflat: () => iu, diagonal: () => Uu, diff: () => vm, digitize: () => Cm, divide: () => An, divmod: () => hl, dot: () => Ou, dsplit: () => Tc, dstack: () => nc, ediff1d: () => Bm, einsum: () => Mf, empty: () => mn, empty_like: () => eu, exp: () => hu, exp2: () => Su, expand_dims: () => wc, expm1: () => Du, extract: () => fm, eye: () => fn, fabs: () => bl, fill: () => dc, fill_diagonal: () => jf, fix: () => ym, flatnonzero: () => um, flatten: () => yc, flip: () => $t, fliplr: () => Ic, flipud: () => zc, float_power: () => xl, floor: () => dm, floor_divide: () => Bu, fmax: () => Tl, fmin: () => Ol, fmod: () => wl, frexp: () => Il, frombuffer: () => yu, fromfile: () => du, fromfunction: () => uu, fromiter: () => gu, fromstring: () => Au, full: () => pn, full_like: () => nu, gcd: () => zl, geomspace: () => Hi, geterr: () => Et, gradient: () => Em, heaviside: () => Nl, histogram: () => Um, histogram2d: () => $m, histogram_bin_edges: () => Pm, histogramdd: () => Rm, hsplit: () => lc, hstack: () => ec, hypot: () => Gu, i0: () => kl, identity: () => Xi, iindex: () => Wc, imag: () => Af, in1d: () => hm, indices: () => Xf, inner: () => ku, insert: () => kc, interp: () => Ul, intersect1d: () => Sm, invert: () => Ll, iscomplex: () => mf, iscomplexobj: () => pf, isdtype: () => zf, isfinite: () => nf, isfortran: () => Nf, isin: () => Dm, isinf: () => of, isnan: () => af, isnat: () => sf, isneginf: () => Sf, isposinf: () => Df, isreal: () => yf, isrealobj: () => df, isscalar: () => wf, issubdtype: () => ep, item: () => gc, iterable: () => If, ix_: () => Jf, kron: () => $u, lcm: () => _l, ldexp: () => Ml, left_shift: () => Gl, lexsort: () => em, linalg: () => Cf, linspace: () => Zi, loadNpz: () => Un, loadNpzSync: () => $n, log: () => Nu, log10: () => wu, log1p: () => Iu, log2: () => xu, logaddexp: () => zu, logaddexp2: () => _u, logical_and: () => Kl, logical_not: () => tf, logical_or: () => rf, logical_xor: () => ef, logspace: () => Yi, mask_indices: () => Hf, matrix_transpose: () => Bf, matvec: () => Tf, max: () => Mn, maximum: () => Bl, may_share_memory: () => Zm, median: () => Kc, meshgrid: () => cu, min: () => Fn, min_scalar_type: () => tp, minimum: () => El, mintypecode: () => op, mod: () => vu, modf: () => Fl, moveaxis: () => rc, nan_to_num: () => Cl, nanargmax: () => fl, nanargmin: () => ll, nancumprod: () => pl, nancumsum: () => ml, nanmax: () => cl, nanmean: () => al, nanmedian: () => yl, nanmin: () => ul, nanpercentile: () => gl, nanprod: () => ol, nanquantile: () => dl, nanstd: () => il, nansum: () => nl, nanvar: () => sl, ndim: () => Hm, negative: () => Mu, nextafter: () => lf, nonzero: () => sm, ones: () => ln, ones_like: () => tu, outer: () => qu, packbits: () => Zl, pad: () => qc, parseNpy: () => bt, parseNpyData: () => Vt, parseNpyHeader: () => qt, parseNpz: () => jt, parseNpzSync: () => Pt, partition: () => nm, percentile: () => rl, permute_dims: () => Ef, place: () => Vf, poly: () => ap, polyadd: () => sp, polyder: () => ip, polydiv: () => up, polyfit: () => cp, polyint: () => fp, polymul: () => mp, polysub: () => pp, polyval: () => yp, positive: () => Eu, pow: () => dn, power: () => dn, promote_types: () => _f, ptp: () => Qc, put: () => Gc, put_along_axis: () => $f, putmask: () => Rf, quantile: () => tl, rad2deg: () => Hu, radians: () => Zu, random: () => Sg, ravel: () => pc, ravel_multi_index: () => Qf, real: () => gf, real_if_close: () => xf, reciprocal: () => Tu, remainder: () => Dl, repeat: () => mc, require: () => Qi, reshape: () => Nc, resize: () => Uc, result_type: () => Km, right_shift: () => Wl, rint: () => gm, roll: () => Mc, rollaxis: () => Fc, roots: () => dp, rot90: () => _c, round: () => Rt, round_: () => Rt, row_stack: () => Cc, searchsorted: () => lm, select: () => qf, serializeNpy: () => Xr, serializeNpz: () => Rn, serializeNpzSync: () => kn, setdiff1d: () => Nm, seterr: () => Ve, setxor1d: () => xm, shape: () => Bn, shares_memory: () => Ym, sign: () => Fu, signbit: () => cf, sin: () => ju, sinc: () => Rl, sinh: () => Xu, size: () => Xm, sort: () => rm, sort_complex: () => am, spacing: () => ff, split: () => ic, sqrt: () => bu, square: () => Sl, squeeze: () => xc, stack: () => tc, swapaxes: () => Ku, take: () => Lc, take_along_axis: () => Uf, tan: () => Lu, tanh: () => Qu, tensordot: () => Vu, tile: () => fc, tobytes: () => bc, tofile: () => Dc, tolist: () => Ac, trace: () => Cu, transpose: () => Ru, trapezoid: () => Lm, tri: () => lu, tril: () => fu, tril_indices: () => Gf, tril_indices_from: () => Wf, trim_zeros: () => Im, triu: () => mu, triu_indices: () => Zf, triu_indices_from: () => Yf, true_divide: () => An, trunc: () => Am, typename: () => np2, union1d: () => wm, unique: () => bm, unique_all: () => zm, unique_counts: () => _m, unique_inverse: () => Mm, unique_values: () => Fm, unpackbits: () => Yl, unravel_index: () => Kf, unstack: () => ac, unwrap: () => $l, vander: () => pu, vdot: () => Ff, vecdot: () => vf, vecmat: () => Of, view: () => Sc, vsplit: () => cc, vstack: () => In, where: () => cm, zeros: () => wr, zeros_like: () => ru });
    module.exports = ay(Ng);
    var E = class r {
      constructor(t, e = 0) {
        this.re = t, this.im = e;
      }
      abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
      }
      angle() {
        return Math.atan2(this.im, this.re);
      }
      conj() {
        return new r(this.re, -this.im);
      }
      add(t) {
        return typeof t == "number" ? new r(this.re + t, this.im) : new r(this.re + t.re, this.im + t.im);
      }
      sub(t) {
        return typeof t == "number" ? new r(this.re - t, this.im) : new r(this.re - t.re, this.im - t.im);
      }
      mul(t) {
        return typeof t == "number" ? new r(this.re * t, this.im * t) : new r(this.re * t.re - this.im * t.im, this.re * t.im + this.im * t.re);
      }
      div(t) {
        if (typeof t == "number") return new r(this.re / t, this.im / t);
        let e = t.re * t.re + t.im * t.im;
        return new r((this.re * t.re + this.im * t.im) / e, (this.im * t.re - this.re * t.im) / e);
      }
      neg() {
        return new r(-this.re, -this.im);
      }
      equals(t) {
        return this.re === t.re && this.im === t.im;
      }
      toString() {
        return this.im === 0 ? `(${this.re}+0j)` : this.im < 0 ? `(${this.re}${this.im}j)` : `(${this.re}+${this.im}j)`;
      }
      static from(t) {
        if (t instanceof r) return t;
        if (typeof t == "number") return new r(t, 0);
        if (Array.isArray(t)) return new r(t[0] ?? 0, t[1] ?? 0);
        if (typeof t == "object" && t !== null && "re" in t) return new r(t.re ?? 0, t.im ?? 0);
        throw new Error(`Cannot convert ${t} to Complex`);
      }
      static isComplex(t) {
        return t instanceof r || typeof t == "object" && t !== null && "re" in t && "im" in t;
      }
    };
    function Zn(r) {
      if (!r.includes(":")) {
        if (r.includes(".")) throw new Error(`Invalid slice index: "${r}" (must be integer)`);
        let a = parseInt(r, 10);
        if (isNaN(a)) throw new Error(`Invalid slice index: "${r}"`);
        return { start: a, stop: null, step: 1, isIndex: true };
      }
      let t = r.split(":");
      if (t.length > 3) throw new Error(`Invalid slice notation: "${r}" (too many colons)`);
      let e = t[0] === "" ? null : parseInt(t[0], 10), n = t[1] === "" || t[1] === void 0 ? null : parseInt(t[1], 10), o = t[2] === "" || t[2] === void 0 ? 1 : parseInt(t[2], 10);
      if (e !== null && isNaN(e)) throw new Error(`Invalid start index in slice: "${r}"`);
      if (n !== null && isNaN(n)) throw new Error(`Invalid stop index in slice: "${r}"`);
      if (isNaN(o)) throw new Error(`Invalid step in slice: "${r}"`);
      if (o === 0) throw new Error("Slice step cannot be zero");
      return { start: e, stop: n, step: o, isIndex: false };
    }
    function Yn(r, t) {
      let { start: e, stop: n } = r, { step: o, isIndex: a } = r;
      if (a) {
        if (e === null) throw new Error("Index cannot be null");
        let i = e < 0 ? t + e : e;
        if (i < 0 || i >= t) throw new Error(`Index ${e} is out of bounds for size ${t}`);
        return { start: i, stop: i + 1, step: 1, isIndex: true };
      }
      return o > 0 ? (e === null && (e = 0), n === null && (n = t)) : (e === null && (e = t - 1), n === null && (n = -t - 1)), e < 0 && (e = t + e), n < 0 && (n = t + n), e = Math.max(0, Math.min(e, t)), n = Math.max(-1, Math.min(n, t)), { start: e, stop: n, step: o, isIndex: false };
    }
    var Q = "float64";
    function P(r) {
      switch (r) {
        case "float64":
          return Float64Array;
        case "float32":
          return Float32Array;
        case "complex128":
          return Float64Array;
        case "complex64":
          return Float32Array;
        case "int64":
          return BigInt64Array;
        case "int32":
          return Int32Array;
        case "int16":
          return Int16Array;
        case "int8":
          return Int8Array;
        case "uint64":
          return BigUint64Array;
        case "uint32":
          return Uint32Array;
        case "uint16":
          return Uint16Array;
        case "uint8":
          return Uint8Array;
        case "bool":
          return Uint8Array;
        default:
          throw new Error(`Unknown dtype: ${r}`);
      }
    }
    function Rr(r) {
      switch (r) {
        case "complex128":
          return 16;
        case "float64":
        case "int64":
        case "uint64":
        case "complex64":
          return 8;
        case "float32":
        case "int32":
        case "uint32":
          return 4;
        case "int16":
        case "uint16":
          return 2;
        case "int8":
        case "uint8":
        case "bool":
          return 1;
        default:
          throw new Error(`Unknown dtype: ${r}`);
      }
    }
    function Xn(r) {
      return r === "int64" || r === "int32" || r === "int16" || r === "int8" || r === "uint64" || r === "uint32" || r === "uint16" || r === "uint8";
    }
    function Hn(r) {
      return r === "float64" || r === "float32";
    }
    function B(r) {
      return r === "int64" || r === "uint64";
    }
    function v(r) {
      return r === "complex64" || r === "complex128";
    }
    function U(r, t, e) {
      if (v(r)) {
        let n = e ? ` ${e}` : "";
        throw new TypeError(`ufunc '${t}' not supported for complex dtype '${r}'.${n}`);
      }
    }
    function Qr(r) {
      if (r === "complex128") return "float64";
      if (r === "complex64") return "float32";
      throw new Error(`${r} is not a complex dtype`);
    }
    function Jn(r) {
      return typeof r == "object" && r !== null && "re" in r && "im" in r;
    }
    function W(r, t) {
      if (r === t) return r;
      if (r === "bool") return t;
      if (t === "bool") return r;
      if (v(r) || v(t)) {
        if (v(r) && v(t)) return r === "complex128" || t === "complex128" ? "complex128" : "complex64";
        let c = v(r) ? r : t, l = v(r) ? t : r;
        return c === "complex128" || l === "float64" || l === "int64" || l === "uint64" || l === "int32" || l === "uint32" ? "complex128" : "complex64";
      }
      if (Hn(r) || Hn(t)) {
        if (r === "float64" || t === "float64") return "float64";
        if (r === "float32") {
          let c = t;
          return c === "int32" || c === "int64" || c === "uint32" || c === "uint64" ? "float64" : "float32";
        }
        if (t === "float32") {
          let c = r;
          return c === "int32" || c === "int64" || c === "uint32" || c === "uint64" ? "float64" : "float32";
        }
        return "float32";
      }
      let e = r.startsWith("int"), n = t.startsWith("int"), o = r.startsWith("uint"), a = t.startsWith("uint"), i = (c) => c.includes("64") ? 64 : c.includes("32") ? 32 : c.includes("16") ? 16 : c.includes("8") ? 8 : 0, s = i(r), u = i(t);
      if (r === "int64" && t === "uint64" || r === "uint64" && t === "int64") return "float64";
      if (e && a && s === u) {
        if (s === 8) return "int16";
        if (s === 16) return "int32";
        if (s === 32) return "int64";
      }
      if (o && n && s === u) {
        if (u === 8) return "int16";
        if (u === 16) return "int32";
        if (u === 32) return "int64";
      }
      if (e && n || o && a) {
        let c = Math.max(s, u);
        return e ? c === 64 ? "int64" : c === 32 ? "int32" : c === 16 ? "int16" : "int8" : c === 64 ? "uint64" : c === 32 ? "uint32" : c === 16 ? "uint16" : "uint8";
      }
      return e && a ? s > u ? r : u === 8 ? "int16" : u === 16 ? "int32" : u === 32 ? "int64" : "float64" : o && n ? u > s ? t : s === 8 ? "int16" : s === 16 ? "int32" : s === 32 ? "int64" : "float64" : "float64";
    }
    var N = class r {
      constructor(t, e, n, o, a) {
        this._data = t, this._shape = e, this._strides = n, this._offset = o, this._dtype = a;
      }
      get shape() {
        return this._shape;
      }
      get ndim() {
        return this._shape.length;
      }
      get size() {
        return this._shape.reduce((t, e) => t * e, 1);
      }
      get dtype() {
        return this._dtype;
      }
      get data() {
        return this._data;
      }
      get strides() {
        return this._strides;
      }
      get offset() {
        return this._offset;
      }
      get isCContiguous() {
        let t = this._shape, e = this._strides, n = t.length;
        if (n === 0) return true;
        if (n === 1) return e[0] === 1;
        let o = 1;
        for (let a = n - 1; a >= 0; a--) {
          if (e[a] !== o) return false;
          o *= t[a];
        }
        return true;
      }
      get isFContiguous() {
        let t = this._shape, e = this._strides, n = t.length;
        if (n === 0) return true;
        if (n === 1) return e[0] === 1;
        let o = 1;
        for (let a = 0; a < n; a++) {
          if (e[a] !== o) return false;
          o *= t[a];
        }
        return true;
      }
      iget(t) {
        let e = this._shape, n = this._strides, o = e.length, a = v(this._dtype), i;
        if (o === 0) i = this._offset;
        else {
          let s = t;
          i = this._offset;
          for (let u = 0; u < o; u++) {
            let c = 1;
            for (let m = u + 1; m < o; m++) c *= e[m];
            let l = Math.floor(s / c);
            s = s % c, i += l * n[u];
          }
        }
        if (a) {
          let s = i * 2, u = this._data[s], c = this._data[s + 1];
          return new E(u, c);
        }
        return this._data[i];
      }
      iset(t, e) {
        let n = this._shape, o = this._strides, a = n.length, i = v(this._dtype), s;
        if (a === 0) s = this._offset;
        else {
          let u = t;
          s = this._offset;
          for (let c = 0; c < a; c++) {
            let l = 1;
            for (let d = c + 1; d < a; d++) l *= n[d];
            let m = Math.floor(u / l);
            u = u % l, s += m * o[c];
          }
        }
        if (i) {
          let u = s * 2, c, l;
          e instanceof E ? (c = e.re, l = e.im) : typeof e == "object" && e !== null && "re" in e ? (c = e.re, l = e.im ?? 0) : (c = Number(e), l = 0), this._data[u] = c, this._data[u + 1] = l;
        } else this._data[s] = e;
      }
      get(...t) {
        let e = this._strides, n = this._offset;
        for (let o = 0; o < t.length; o++) n += t[o] * e[o];
        if (v(this._dtype)) {
          let o = n * 2, a = this._data[o], i = this._data[o + 1];
          return new E(a, i);
        }
        return this._data[n];
      }
      set(t, e) {
        let n = this._strides, o = this._offset;
        for (let a = 0; a < t.length; a++) o += t[a] * n[a];
        if (v(this._dtype)) {
          let a = o * 2, i, s;
          e instanceof E ? (i = e.re, s = e.im) : typeof e == "object" && e !== null && "re" in e ? (i = e.re, s = e.im ?? 0) : (i = Number(e), s = 0), this._data[a] = i, this._data[a + 1] = s;
        } else this._data[o] = e;
      }
      copy() {
        let t = Array.from(this._shape), e = this._dtype, n = this.size, o = v(e), a = P(e);
        if (!a) throw new Error(`Cannot copy array with dtype ${e}`);
        let i = o ? n * 2 : n, s = new a(i);
        if (this.isCContiguous && this._offset === 0) if (B(e)) {
          let u = this._data, c = s;
          for (let l = 0; l < i; l++) c[l] = u[l];
        } else s.set(this._data.subarray(0, i));
        else if (B(e)) {
          let u = s;
          for (let c = 0; c < n; c++) u[c] = this.iget(c);
        } else if (o) {
          let u = s;
          for (let c = 0; c < n; c++) {
            let l = this.iget(c);
            u[c * 2] = l.re, u[c * 2 + 1] = l.im;
          }
        } else for (let u = 0; u < n; u++) s[u] = this.iget(u);
        return new r(s, t, r._computeStrides(t), 0, e);
      }
      static fromData(t, e, n, o, a) {
        let i = o ?? r._computeStrides(e), s = a ?? 0;
        return new r(t, e, i, s, n);
      }
      static zeros(t, e = Q) {
        let n = t.reduce((u, c) => u * c, 1), o = v(e), a = P(e);
        if (!a) throw new Error(`Cannot create array with dtype ${e}`);
        let i = o ? n * 2 : n, s = new a(i);
        return new r(s, t, r._computeStrides(t), 0, e);
      }
      static ones(t, e = Q) {
        let n = t.reduce((u, c) => u * c, 1), o = v(e), a = P(e);
        if (!a) throw new Error(`Cannot create array with dtype ${e}`);
        let i = o ? n * 2 : n, s = new a(i);
        if (B(e)) s.fill(BigInt(1));
        else if (o) {
          let u = s;
          for (let c = 0; c < n; c++) u[c * 2] = 1, u[c * 2 + 1] = 0;
        } else s.fill(1);
        return new r(s, t, r._computeStrides(t), 0, e);
      }
      static _computeStrides(t) {
        let e = new Array(t.length), n = 1;
        for (let o = t.length - 1; o >= 0; o--) e[o] = n, n *= t[o];
        return e;
      }
    };
    function ar(r) {
      let t = new Array(r.length), e = 1;
      for (let n = r.length - 1; n >= 0; n--) t[n] = e, e *= r[n];
      return t;
    }
    function Ar(r) {
      if (r.length === 0) return [];
      if (r.length === 1) return Array.from(r[0]);
      let t = Math.max(...r.map((n) => n.length)), e = new Array(t);
      for (let n = 0; n < t; n++) {
        let o = 1;
        for (let a of r) {
          let i = a.length - t + n, s = i < 0 ? 1 : a[i];
          if (s !== 1) {
            if (o === 1) o = s;
            else if (o !== s) return null;
          }
        }
        e[n] = o;
      }
      return e;
    }
    function sy(r, t, e) {
      let n = r.length, o = e.length, a = new Array(o).fill(0);
      for (let i = 0; i < n; i++) {
        let s = o - n + i, u = r[i], c = e[s];
        if (u === c) a[s] = t[i];
        else if (u === 1) a[s] = 0;
        else throw new Error("Invalid broadcast");
      }
      return a;
    }
    function pr(r, t) {
      let e = sy(r.shape, r.strides, t);
      return N.fromData(r.data, Array.from(t), r.dtype, e, r.offset);
    }
    function ee(...r) {
      let t = Ar(r);
      if (t === null) {
        let e = r.map((n) => `(${n.join(",")})`).join(" ");
        throw new Error(`shape mismatch: objects cannot be broadcast to a single shape. Mismatch is between ${e}`);
      }
      return t;
    }
    function Mr(r, t) {
      let e = r.length, n = t.length, o = Math.max(e, n), a = new Array(o);
      for (let i = 0; i < o; i++) {
        let s = i < o - e ? 1 : r[i - (o - e)], u = i < o - n ? 1 : t[i - (o - n)];
        if (s === u) a[i] = s;
        else if (s === 1) a[i] = u;
        else if (u === 1) a[i] = s;
        else throw new Error(`operands could not be broadcast together with shapes ${JSON.stringify(Array.from(r))} ${JSON.stringify(Array.from(t))}`);
      }
      return a;
    }
    function iy(r, t, e) {
      let n = r.length, o = e.length, a = new Array(o).fill(0);
      for (let i = 0; i < n; i++) {
        let s = o - n + i, u = r[i], c = e[s];
        if (u === c) a[s] = t[i];
        else if (u === 1) a[s] = 0;
        else throw new Error("Invalid broadcast");
      }
      return a;
    }
    function Nt(r, t) {
      let e = iy(r.shape, r.strides, t);
      return N.fromData(r.data, Array.from(t), r.dtype, e, r.offset);
    }
    function H(r, t, e, n) {
      let o = W(r.dtype, t.dtype), a = r.shape, i = t.shape;
      if (a.length === i.length && a.every((f, p) => f === i[p]) && r.isCContiguous && t.isCContiguous && !B(r.dtype) && !B(t.dtype) && !B(o)) {
        let f = r.size, p = N.zeros(Array.from(a), o), g = p.data, h = r.data, b = t.data;
        for (let A = 0; A < f; A++) g[A] = e(h[A], b[A]);
        return p;
      }
      let u = Mr(r.shape, t.shape), c = Nt(r, u), l = Nt(t, u), m = N.zeros(u, o), d = m.data, y = m.size;
      if (B(o)) {
        let f = d;
        for (let p = 0; p < y; p++) {
          let g = c.iget(p), h = l.iget(p), b = g instanceof E ? g.re : g, A = h instanceof E ? h.re : h, S = typeof b == "bigint" ? b : BigInt(Math.round(b)), D = typeof A == "bigint" ? A : BigInt(Math.round(A));
          n === "add" ? f[p] = S + D : n === "subtract" ? f[p] = S - D : n === "multiply" ? f[p] = S * D : n === "divide" ? f[p] = S / D : f[p] = BigInt(Math.round(e(Number(S), Number(D))));
        }
      } else {
        let f = B(r.dtype) || B(t.dtype);
        for (let p = 0; p < y; p++) {
          let g = c.iget(p), h = l.iget(p), b = Number(g), A = Number(h);
          d[p] = e(b, A);
        }
      }
      return m;
    }
    function yr(r, t, e) {
      let n = Mr(r.shape, t.shape), o = Nt(r, n), a = Nt(t, n), i = n.reduce((c, l) => c * l, 1), s = new Uint8Array(i), u = B(r.dtype) || B(t.dtype);
      for (let c = 0; c < i; c++) {
        let l = o.iget(c), m = a.iget(c), d = Number(l), y = Number(m);
        s[c] = e(d, y) ? 1 : 0;
      }
      return N.fromData(s, n, "bool");
    }
    function X(r, t, e = true) {
      let n = r.dtype, o = Array.from(r.shape), a = r.size, s = e ? n : n !== "float32" && n !== "float64" ? "float64" : n, u = N.zeros(o, s), c = u.data, l = r.data;
      if (B(n)) if (B(s)) {
        let m = c;
        for (let d = 0; d < a; d++) {
          let y = Number(l[d]);
          m[d] = BigInt(Math.round(t(y)));
        }
      } else for (let m = 0; m < a; m++) c[m] = t(Number(l[m]));
      else for (let m = 0; m < a; m++) c[m] = t(Number(l[m]));
      return u;
    }
    function ne(r, t) {
      return r.isCContiguous && t.isCContiguous && r.shape.length === t.shape.length && r.shape.every((e, n) => e === t.shape[n]);
    }
    function lr(r, t) {
      return [r[t * 2], r[t * 2 + 1]];
    }
    function zr(r, t, e, n) {
      r[t * 2] = e, r[t * 2 + 1] = n;
    }
    function Qn(r, t) {
      return typeof t == "number" ? fy(r, t) : ne(r, t) ? uy(r, t) : H(r, t, (e, n) => e + n, "add");
    }
    function uy(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (v(e)) {
        let u = s, c = v(r.dtype), l = v(t.dtype);
        for (let m = 0; m < o; m++) {
          let [d, y] = c ? lr(a, m) : [Number(a[m]), 0], [f, p] = l ? lr(i, m) : [Number(i[m]), 0];
          zr(u, m, d + f, y + p);
        }
        return n;
      }
      if (B(e)) {
        let u = s;
        if (!B(r.dtype) || !B(t.dtype)) for (let l = 0; l < o; l++) {
          let m = typeof a[l] == "bigint" ? a[l] : BigInt(Math.round(Number(a[l]))), d = typeof i[l] == "bigint" ? i[l] : BigInt(Math.round(Number(i[l])));
          u[l] = m + d;
        }
        else {
          let l = a, m = i;
          for (let d = 0; d < o; d++) u[d] = l[d] + m[d];
        }
      } else if (B(r.dtype) || B(t.dtype)) for (let c = 0; c < o; c++) {
        let l = typeof a[c] == "bigint" ? Number(a[c]) : a[c], m = typeof i[c] == "bigint" ? Number(i[c]) : i[c];
        s[c] = l + m;
      }
      else for (let c = 0; c < o; c++) s[c] = a[c] + i[c];
      return n;
    }
    function Kn(r, t) {
      return typeof t == "number" ? my(r, t) : ne(r, t) ? cy(r, t) : H(r, t, (e, n) => e - n, "subtract");
    }
    function cy(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (v(e)) {
        let u = s, c = v(r.dtype), l = v(t.dtype);
        for (let m = 0; m < o; m++) {
          let [d, y] = c ? lr(a, m) : [Number(a[m]), 0], [f, p] = l ? lr(i, m) : [Number(i[m]), 0];
          zr(u, m, d - f, y - p);
        }
        return n;
      }
      if (B(e)) {
        let u = s;
        if (!B(r.dtype) || !B(t.dtype)) for (let l = 0; l < o; l++) {
          let m = typeof a[l] == "bigint" ? a[l] : BigInt(Math.round(Number(a[l]))), d = typeof i[l] == "bigint" ? i[l] : BigInt(Math.round(Number(i[l])));
          u[l] = m - d;
        }
        else {
          let l = a, m = i;
          for (let d = 0; d < o; d++) u[d] = l[d] - m[d];
        }
      } else if (B(r.dtype) || B(t.dtype)) for (let c = 0; c < o; c++) {
        let l = typeof a[c] == "bigint" ? Number(a[c]) : a[c], m = typeof i[c] == "bigint" ? Number(i[c]) : i[c];
        s[c] = l - m;
      }
      else for (let c = 0; c < o; c++) s[c] = a[c] - i[c];
      return n;
    }
    function ro(r, t) {
      return typeof t == "number" ? py(r, t) : ne(r, t) ? ly(r, t) : H(r, t, (e, n) => e * n, "multiply");
    }
    function ly(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (v(e)) {
        let u = s, c = v(r.dtype), l = v(t.dtype);
        for (let m = 0; m < o; m++) {
          let [d, y] = c ? lr(a, m) : [Number(a[m]), 0], [f, p] = l ? lr(i, m) : [Number(i[m]), 0], g = d * f - y * p, h = d * p + y * f;
          zr(u, m, g, h);
        }
        return n;
      }
      if (B(e)) {
        let u = s;
        if (!B(r.dtype) || !B(t.dtype)) for (let l = 0; l < o; l++) {
          let m = typeof a[l] == "bigint" ? a[l] : BigInt(Math.round(Number(a[l]))), d = typeof i[l] == "bigint" ? i[l] : BigInt(Math.round(Number(i[l])));
          u[l] = m * d;
        }
        else {
          let l = a, m = i;
          for (let d = 0; d < o; d++) u[d] = l[d] * m[d];
        }
      } else if (B(r.dtype) || B(t.dtype)) for (let c = 0; c < o; c++) {
        let l = typeof a[c] == "bigint" ? Number(a[c]) : a[c], m = typeof i[c] == "bigint" ? Number(i[c]) : i[c];
        s[c] = l * m;
      }
      else for (let c = 0; c < o; c++) s[c] = a[c] * i[c];
      return n;
    }
    function to(r, t) {
      if (typeof t == "number") return yy(r, t);
      let e = v(r.dtype), n = v(t.dtype);
      if (e || n) {
        let l = W(r.dtype, t.dtype), m = N.zeros(Array.from(r.shape), l), d = m.data, y = r.size, f = r.data, p = t.data;
        for (let g = 0; g < y; g++) {
          let [h, b] = e ? lr(f, g) : [Number(f[g]), 0], [A, S] = n ? lr(p, g) : [Number(p[g]), 0], D = A * A + S * S, w = (h * A + b * S) / D, x = (b * A - h * S) / D;
          zr(d, g, w, x);
        }
        return m;
      }
      let o = r.dtype === "float64", a = t.dtype === "float64", i = r.dtype === "float32", s = t.dtype === "float32";
      if (o || a) {
        let l = o ? r : kr(r, "float64"), m = a ? t : kr(t, "float64");
        return H(l, m, (d, y) => d / y, "divide");
      }
      if (i || s) {
        let l = i ? r : kr(r, "float32"), m = s ? t : kr(t, "float32");
        return H(l, m, (d, y) => d / y, "divide");
      }
      let u = kr(r, "float64"), c = kr(t, "float64");
      return H(u, c, (l, m) => l / m, "divide");
    }
    function kr(r, t) {
      let e = N.zeros(Array.from(r.shape), t), n = r.size, o = r.data, a = e.data;
      for (let i = 0; i < n; i++) a[i] = Number(o[i]);
      return e;
    }
    function fy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (v(e)) {
        let u = o, c = s;
        for (let l = 0; l < a; l++) {
          let [m, d] = lr(u, l);
          zr(c, l, m + t, d);
        }
      } else if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] + l;
      } else for (let u = 0; u < a; u++) s[u] = Number(o[u]) + t;
      return i;
    }
    function my(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (v(e)) {
        let u = o, c = s;
        for (let l = 0; l < a; l++) {
          let [m, d] = lr(u, l);
          zr(c, l, m - t, d);
        }
      } else if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] - l;
      } else for (let u = 0; u < a; u++) s[u] = Number(o[u]) - t;
      return i;
    }
    function py(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (v(e)) {
        let u = o, c = s;
        for (let l = 0; l < a; l++) {
          let [m, d] = lr(u, l);
          zr(c, l, m * t, d * t);
        }
      } else if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] * l;
      } else for (let u = 0; u < a; u++) s[u] = Number(o[u]) * t;
      return i;
    }
    function yy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size;
      if (v(e)) {
        let l = N.zeros(n, e), m = o, d = l.data;
        for (let y = 0; y < a; y++) {
          let [f, p] = lr(m, y);
          zr(d, y, f / t, p / t);
        }
        return l;
      }
      let s = e !== "float32" && e !== "float64" ? "float64" : e, u = N.zeros(n, s), c = u.data;
      if (B(e)) for (let l = 0; l < a; l++) c[l] = Number(o[l]) / t;
      else for (let l = 0; l < a; l++) c[l] = Number(o[l]) / t;
      return u;
    }
    function eo(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size;
      if (v(t)) {
        let s = Qr(t), u = N.zeros(e, s), c = u.data, l = n;
        for (let m = 0; m < o; m++) {
          let d = l[m * 2], y = l[m * 2 + 1];
          c[m] = Math.sqrt(d * d + y * y);
        }
        return u;
      }
      let a = N.zeros(e, t), i = a.data;
      if (B(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) {
          let l = s[c];
          u[c] = l < 0n ? -l : l;
        }
      } else for (let s = 0; s < o; s++) i[s] = Math.abs(Number(n[s]));
      return a;
    }
    function no(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = N.zeros(e, t), i = a.data;
      if (v(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) {
          let [l, m] = lr(s, c);
          zr(u, c, -l, -m);
        }
      } else if (B(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) u[c] = -s[c];
      } else for (let s = 0; s < o; s++) i[s] = -Number(n[s]);
      return a;
    }
    function oo(r) {
      U(r.dtype, "sign", "Sign is not defined for complex numbers.");
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = N.zeros(e, t), i = a.data;
      if (B(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) {
          let l = s[c];
          u[c] = l > 0n ? 1n : l < 0n ? -1n : 0n;
        }
      } else for (let s = 0; s < o; s++) {
        let u = Number(n[s]);
        i[s] = u > 0 ? 1 : u < 0 ? -1 : 0;
      }
      return a;
    }
    function xt(r, t) {
      return U(r.dtype, "mod", "Modulo is not defined for complex numbers."), typeof t != "number" && U(t.dtype, "mod", "Modulo is not defined for complex numbers."), typeof t == "number" ? dy(r, t) : H(r, t, (e, n) => (e % n + n) % n, "mod");
    }
    function dy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) {
          let d = u[m];
          c[m] = (d % l + l) % l;
        }
      } else for (let u = 0; u < a; u++) {
        let c = Number(o[u]);
        s[u] = (c % t + t) % t;
      }
      return i;
    }
    function oe(r, t) {
      return U(r.dtype, "floor_divide", "Floor division is not defined for complex numbers."), typeof t != "number" && U(t.dtype, "floor_divide", "Floor division is not defined for complex numbers."), typeof t == "number" ? gy(r, t) : H(r, t, (e, n) => Math.floor(e / n), "floor_divide");
    }
    function gy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] / l;
      } else for (let u = 0; u < a; u++) s[u] = Math.floor(Number(o[u]) / t);
      return i;
    }
    function ao(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = N.zeros(e, t), i = a.data;
      if (v(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) u[c * 2] = s[c * 2], u[c * 2 + 1] = s[c * 2 + 1];
      } else for (let s = 0; s < o; s++) i[s] = n[s];
      return a;
    }
    function so(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size;
      if (v(t)) {
        let c = N.zeros(e, t), l = n, m = c.data;
        for (let d = 0; d < o; d++) {
          let y = l[d * 2], f = l[d * 2 + 1], p = y * y + f * f;
          m[d * 2] = y / p, m[d * 2 + 1] = -f / p;
        }
        return c;
      }
      let i = t !== "float32" && t !== "float64" ? "float64" : t, s = N.zeros(e, i), u = s.data;
      if (B(t)) for (let c = 0; c < o; c++) u[c] = 1 / Number(n[c]);
      else for (let c = 0; c < o; c++) u[c] = 1 / Number(n[c]);
      return s;
    }
    function io(r) {
      let t = r.dtype;
      U(t, "cbrt", "cbrt is not supported for complex numbers.");
      let e = Array.from(r.shape), n = r.data, o = r.size, i = t !== "float32" && t !== "float64" ? "float64" : t, s = N.zeros(e, i), u = s.data;
      for (let c = 0; c < o; c++) u[c] = Math.cbrt(Number(n[c]));
      return s;
    }
    function uo(r) {
      let t = r.dtype;
      U(t, "fabs", "fabs is only for real numbers. Use absolute() for complex.");
      let e = Array.from(r.shape), n = r.data, o = r.size, a = t === "float32" ? "float32" : "float64", i = N.zeros(e, a), s = i.data;
      for (let u = 0; u < o; u++) s[u] = Math.abs(Number(n[u]));
      return i;
    }
    function co(r, t) {
      let e = oe(r, t), n = xt(r, t);
      return [e, n];
    }
    function lo(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = N.zeros(e, t), i = a.data;
      if (v(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) {
          let l = s[c * 2], m = s[c * 2 + 1];
          u[c * 2] = l * l - m * m, u[c * 2 + 1] = 2 * l * m;
        }
      } else if (B(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) u[c] = s[c] * s[c];
      } else for (let s = 0; s < o; s++) {
        let u = Number(n[s]);
        i[s] = u * u;
      }
      return a;
    }
    function fo(r, t) {
      return xt(r, t);
    }
    function mo(r, t) {
      U(r.dtype, "heaviside", "Heaviside step function is not defined for complex numbers."), typeof t != "number" && U(t.dtype, "heaviside", "Heaviside step function is not defined for complex numbers.");
      let e = r.dtype, n = Array.from(r.shape), o = r.size, a = e === "float32" ? "float32" : "float64", i = N.zeros(n, a), s = i.data;
      if (typeof t == "number") for (let u = 0; u < o; u++) {
        let c = Number(r.data[u]);
        c < 0 ? s[u] = 0 : c === 0 ? s[u] = t : s[u] = 1;
      }
      else {
        let u = t.data, c = t.shape;
        if (n.every((l, m) => l === c[m])) for (let l = 0; l < o; l++) {
          let m = Number(r.data[l]);
          m < 0 ? s[l] = 0 : m === 0 ? s[l] = Number(u[l]) : s[l] = 1;
        }
        else for (let l = 0; l < o; l++) {
          let m = Number(r.data[l]), d = l % t.size;
          m < 0 ? s[l] = 0 : m === 0 ? s[l] = Number(u[d]) : s[l] = 1;
        }
      }
      return i;
    }
    function po(r, t) {
      let e = r.dtype;
      if (v(e)) {
        let n = r.data, o = r.size, a = N.zeros(Array.from(r.shape), e), i = a.data;
        if (typeof t == "number") for (let s = 0; s < o; s++) {
          let u = n[s * 2], c = n[s * 2 + 1], l = Math.hypot(u, c), m = Math.atan2(c, u), d = Math.pow(l, t), y = m * t;
          i[s * 2] = d * Math.cos(y), i[s * 2 + 1] = d * Math.sin(y);
        }
        else {
          let s = t.data, u = v(t.dtype);
          for (let c = 0; c < o; c++) {
            let l = n[c * 2], m = n[c * 2 + 1], d, y;
            u ? (d = s[c * 2], y = s[c * 2 + 1]) : (d = Number(s[c]), y = 0);
            let f = Math.hypot(l, m), p = Math.atan2(m, l), g = Math.log(f), h = p, b = d * g - y * h, A = d * h + y * g, S = Math.exp(b);
            i[c * 2] = S * Math.cos(A), i[c * 2 + 1] = S * Math.sin(A);
          }
        }
        return a;
      }
      if (typeof t == "number") {
        let n = N.zeros(Array.from(r.shape), "float64"), o = n.data, a = r.data, i = r.size;
        for (let s = 0; s < i; s++) o[s] = Math.pow(Number(a[s]), t);
        return n;
      }
      return H(r, t, (n, o) => Math.pow(n, o), "float_power");
    }
    function yo(r, t) {
      if (U(r.dtype, "fmod", "fmod is not defined for complex numbers."), typeof t != "number" && U(t.dtype, "fmod", "fmod is not defined for complex numbers."), typeof t == "number") {
        let e = r.copy(), n = e.data, o = r.size;
        for (let a = 0; a < o; a++) {
          let i = Number(n[a]);
          n[a] = i - Math.trunc(i / t) * t;
        }
        return e;
      }
      return H(r, t, (e, n) => e - Math.trunc(e / n) * n, "fmod");
    }
    function go(r) {
      U(r.dtype, "frexp", "frexp is not defined for complex numbers.");
      let t = N.zeros(Array.from(r.shape), "float64"), e = N.zeros(Array.from(r.shape), "int32"), n = t.data, o = e.data, a = r.data, i = r.size;
      for (let s = 0; s < i; s++) {
        let u = Number(a[s]);
        if (u === 0 || !isFinite(u)) n[s] = u, o[s] = 0;
        else {
          let c = Math.floor(Math.log2(Math.abs(u))) + 1, l = u / Math.pow(2, c);
          n[s] = l, o[s] = c;
        }
      }
      return [t, e];
    }
    function Ao(r, t) {
      U(r.dtype, "gcd", "GCD is only defined for integers."), typeof t != "number" && U(t.dtype, "gcd", "GCD is only defined for integers.");
      let e = (u, c) => {
        for (u = Math.abs(Math.trunc(u)), c = Math.abs(Math.trunc(c)); c !== 0; ) {
          let l = c;
          c = u % c, u = l;
        }
        return u;
      };
      if (typeof t == "number") {
        let u = N.zeros(Array.from(r.shape), "int32"), c = u.data, l = r.data, m = r.size, d = Math.abs(Math.trunc(t));
        for (let y = 0; y < m; y++) c[y] = e(Number(l[y]), d);
        return u;
      }
      let n = H(r, t, e, "gcd"), o = N.zeros(Array.from(n.shape), "int32"), a = o.data, i = n.data, s = n.size;
      for (let u = 0; u < s; u++) a[u] = Math.round(Number(i[u]));
      return o;
    }
    function bo(r, t) {
      U(r.dtype, "lcm", "LCM is only defined for integers."), typeof t != "number" && U(t.dtype, "lcm", "LCM is only defined for integers.");
      let e = (c, l) => {
        for (c = Math.abs(Math.trunc(c)), l = Math.abs(Math.trunc(l)); l !== 0; ) {
          let m = l;
          l = c % l, c = m;
        }
        return c;
      }, n = (c, l) => (c = Math.abs(Math.trunc(c)), l = Math.abs(Math.trunc(l)), c === 0 || l === 0 ? 0 : c * l / e(c, l));
      if (typeof t == "number") {
        let c = N.zeros(Array.from(r.shape), "int32"), l = c.data, m = r.data, d = r.size, y = Math.abs(Math.trunc(t));
        for (let f = 0; f < d; f++) l[f] = n(Number(m[f]), y);
        return c;
      }
      let o = H(r, t, n, "lcm"), a = N.zeros(Array.from(o.shape), "int32"), i = a.data, s = o.data, u = o.size;
      for (let c = 0; c < u; c++) i[c] = Math.round(Number(s[c]));
      return a;
    }
    function ho(r, t) {
      if (U(r.dtype, "ldexp", "ldexp is not defined for complex numbers."), typeof t != "number" && U(t.dtype, "ldexp", "ldexp is not defined for complex numbers."), typeof t == "number") {
        let e = N.zeros(Array.from(r.shape), "float64"), n = e.data, o = r.data, a = r.size, i = Math.pow(2, t);
        for (let s = 0; s < a; s++) n[s] = Number(o[s]) * i;
        return e;
      }
      return H(r, t, (e, n) => e * Math.pow(2, n), "ldexp");
    }
    function So(r) {
      U(r.dtype, "modf", "modf is not defined for complex numbers.");
      let t = N.zeros(Array.from(r.shape), "float64"), e = N.zeros(Array.from(r.shape), "float64"), n = t.data, o = e.data, a = r.data, i = r.size;
      for (let s = 0; s < i; s++) {
        let u = Number(a[s]), c = Math.trunc(u);
        o[s] = c, n[s] = u - c;
      }
      return [t, e];
    }
    function Do(r, t, e) {
      U(r.dtype, "clip", "clip is not supported for complex numbers.");
      let n = r.dtype, o = Array.from(r.shape), a = r.size, i = N.zeros(o, n), s = i.data, u = r.data, c = t === null || typeof t == "number", l = e === null || typeof e == "number", m = t === null ? -1 / 0 : typeof t == "number" ? t : null, d = e === null ? 1 / 0 : typeof e == "number" ? e : null;
      if (B(n)) {
        let y = s, f = u;
        for (let p = 0; p < a; p++) {
          let g = f[p], h = c ? m === -1 / 0 ? g : BigInt(Math.round(m)) : t.data[p % t.size], b = l ? d === 1 / 0 ? g : BigInt(Math.round(d)) : e.data[p % e.size];
          g < h && (g = h), g > b && (g = b), y[p] = g;
        }
      } else for (let y = 0; y < a; y++) {
        let f = Number(u[y]), p = c ? m : Number(t.data[y % t.size]), g = l ? d : Number(e.data[y % e.size]);
        f < p && (f = p), f > g && (f = g), s[y] = f;
      }
      return i;
    }
    function No(r, t) {
      if (U(r.dtype, "maximum", "maximum is not supported for complex numbers."), typeof t != "number" && U(t.dtype, "maximum", "maximum is not supported for complex numbers."), typeof t == "number") {
        let e = r.dtype, n = Array.from(r.shape), o = r.size, a = N.zeros(n, e), i = a.data, s = r.data;
        if (B(e)) {
          let u = i, c = s, l = BigInt(Math.round(t));
          for (let m = 0; m < o; m++) u[m] = c[m] > l ? c[m] : l;
        } else for (let u = 0; u < o; u++) {
          let c = Number(s[u]);
          i[u] = isNaN(c) || isNaN(t) ? NaN : Math.max(c, t);
        }
        return a;
      }
      return H(r, t, (e, n) => isNaN(e) || isNaN(n) ? NaN : Math.max(e, n), "maximum");
    }
    function xo(r, t) {
      if (U(r.dtype, "minimum", "minimum is not supported for complex numbers."), typeof t != "number" && U(t.dtype, "minimum", "minimum is not supported for complex numbers."), typeof t == "number") {
        let e = r.dtype, n = Array.from(r.shape), o = r.size, a = N.zeros(n, e), i = a.data, s = r.data;
        if (B(e)) {
          let u = i, c = s, l = BigInt(Math.round(t));
          for (let m = 0; m < o; m++) u[m] = c[m] < l ? c[m] : l;
        } else for (let u = 0; u < o; u++) {
          let c = Number(s[u]);
          i[u] = isNaN(c) || isNaN(t) ? NaN : Math.min(c, t);
        }
        return a;
      }
      return H(r, t, (e, n) => isNaN(e) || isNaN(n) ? NaN : Math.min(e, n), "minimum");
    }
    function wo(r, t) {
      if (U(r.dtype, "fmax", "fmax is not supported for complex numbers."), typeof t != "number" && U(t.dtype, "fmax", "fmax is not supported for complex numbers."), typeof t == "number") {
        let e = r.dtype, n = Array.from(r.shape), o = r.size, a = N.zeros(n, e), i = a.data, s = r.data;
        if (B(e)) {
          let u = i, c = s, l = BigInt(Math.round(t));
          for (let m = 0; m < o; m++) u[m] = c[m] > l ? c[m] : l;
        } else for (let u = 0; u < o; u++) {
          let c = Number(s[u]);
          isNaN(c) ? i[u] = t : isNaN(t) ? i[u] = c : i[u] = Math.max(c, t);
        }
        return a;
      }
      return H(r, t, (e, n) => isNaN(e) ? n : isNaN(n) ? e : Math.max(e, n), "fmax");
    }
    function Io(r, t) {
      if (U(r.dtype, "fmin", "fmin is not supported for complex numbers."), typeof t != "number" && U(t.dtype, "fmin", "fmin is not supported for complex numbers."), typeof t == "number") {
        let e = r.dtype, n = Array.from(r.shape), o = r.size, a = N.zeros(n, e), i = a.data, s = r.data;
        if (B(e)) {
          let u = i, c = s, l = BigInt(Math.round(t));
          for (let m = 0; m < o; m++) u[m] = c[m] < l ? c[m] : l;
        } else for (let u = 0; u < o; u++) {
          let c = Number(s[u]);
          isNaN(c) ? i[u] = t : isNaN(t) ? i[u] = c : i[u] = Math.min(c, t);
        }
        return a;
      }
      return H(r, t, (e, n) => isNaN(e) ? n : isNaN(n) ? e : Math.min(e, n), "fmin");
    }
    function zo(r, t = 0, e, n) {
      U(r.dtype, "nan_to_num", "nan_to_num is not supported for complex numbers.");
      let o = r.dtype, a = Array.from(r.shape), i = r.size, s = e !== void 0 ? e : Number.MAX_VALUE, u = n !== void 0 ? n : -Number.MAX_VALUE, c = N.zeros(a, o), l = c.data, m = r.data;
      if (B(o)) {
        let d = l, y = m;
        for (let f = 0; f < i; f++) d[f] = y[f];
      } else for (let d = 0; d < i; d++) {
        let y = Number(m[d]);
        isNaN(y) ? l[d] = t : y === 1 / 0 ? l[d] = s : y === -1 / 0 ? l[d] = u : l[d] = y;
      }
      return c;
    }
    function _o(r, t, e, n, o) {
      U(r.dtype, "interp", "interp is not supported for complex numbers."), U(t.dtype, "interp", "interp is not supported for complex numbers."), U(e.dtype, "interp", "interp is not supported for complex numbers.");
      let a = Array.from(r.shape), i = r.size, s = N.zeros(a, "float64"), u = s.data, c = r.data, l = t.data, m = e.data, d = t.size, y = n !== void 0 ? n : Number(m[0]), f = o !== void 0 ? o : Number(m[d - 1]);
      for (let p = 0; p < i; p++) {
        let g = Number(c[p]);
        if (g <= Number(l[0])) {
          u[p] = y;
          continue;
        }
        if (g >= Number(l[d - 1])) {
          u[p] = f;
          continue;
        }
        let h = 0, b = d - 1;
        for (; b - h > 1; ) {
          let I = Math.floor((h + b) / 2);
          Number(l[I]) <= g ? h = I : b = I;
        }
        let A = Number(l[h]), S = Number(l[b]), D = Number(m[h]), w = Number(m[b]), x = (g - A) / (S - A);
        u[p] = D + x * (w - D);
      }
      return s;
    }
    function Mo(r, t = Math.PI, e = -1, n = 2 * Math.PI) {
      U(r.dtype, "unwrap", "unwrap is not supported for complex numbers.");
      let o = Array.from(r.shape), a = o.length;
      if (e < 0 && (e += a), e < 0 || e >= a) throw new Error(`axis ${e} is out of bounds for array of dimension ${a}`);
      if (a === 1) {
        let c = r.size, l = N.zeros(o, "float64"), m = l.data, d = r.data;
        if (c === 0) return l;
        m[0] = Number(d[0]);
        let y = 0;
        for (let f = 1; f < c; f++) {
          let p = Number(d[f - 1]), g = Number(d[f]), h = g - p;
          h = (h + n / 2) % n - n / 2, h === -n / 2 && g - p > 0 && (h = n / 2), Math.abs(h) > t && (y -= Math.round((g - p - h) / n) * n), m[f] = g + y;
        }
        return l;
      }
      let i = N.zeros(o, "float64"), s = i.data, u = r.data;
      for (let c = 0; c < r.size; c++) s[c] = Number(u[c]);
      if (a === 2) {
        let [c, l] = o;
        if (e === 0) for (let m = 0; m < l; m++) {
          let d = 0;
          for (let y = 1; y < c; y++) {
            let f = (y - 1) * l + m, p = y * l + m, g = s[f], h = s[p], b = h - g;
            b = (b + n / 2) % n - n / 2, b === -n / 2 && h - g > 0 && (b = n / 2), Math.abs(b) > t && (d -= Math.round((h - g - b) / n) * n), s[p] = h + d;
          }
        }
        else for (let m = 0; m < c; m++) {
          let d = 0;
          for (let y = 1; y < l; y++) {
            let f = m * l + (y - 1), p = m * l + y, g = s[f], h = s[p], b = h - g;
            b = (b + n / 2) % n - n / 2, b === -n / 2 && h - g > 0 && (b = n / 2), Math.abs(b) > t && (d -= Math.round((h - g - b) / n) * n), s[p] = h + d;
          }
        }
      }
      return i;
    }
    function Fo(r) {
      U(r.dtype, "sinc", "sinc is not supported for complex numbers.");
      let t = Array.from(r.shape), e = r.size, n = N.zeros(t, "float64"), o = n.data, a = r.data;
      for (let i = 0; i < e; i++) {
        let s = Number(a[i]);
        if (s === 0) o[i] = 1;
        else {
          let u = Math.PI * s;
          o[i] = Math.sin(u) / u;
        }
      }
      return n;
    }
    function vo(r) {
      U(r.dtype, "i0", "i0 is not supported for complex numbers.");
      let t = Array.from(r.shape), e = r.size, n = N.zeros(t, "float64"), o = n.data, a = r.data;
      for (let i = 0; i < e; i++) {
        let s = Math.abs(Number(a[i]));
        o[i] = Ay(s);
      }
      return n;
    }
    function Ay(r) {
      let t = Math.abs(r);
      if (t < 3.75) {
        let e = r / 3.75, n = e * e;
        return 1 + n * (3.5156229 + n * (3.0899424 + n * (1.2067492 + n * (0.2659732 + n * (0.0360768 + n * 45813e-7)))));
      } else {
        let e = 3.75 / t;
        return Math.exp(t) / Math.sqrt(t) * (0.39894228 + e * (0.01328592 + e * (225319e-8 + e * (-157565e-8 + e * (916281e-8 + e * (-0.02057706 + e * (0.02635537 + e * (-0.01647633 + e * 392377e-8))))))));
      }
    }
    function Or(r, t) {
      return [r[t * 2], r[t * 2 + 1]];
    }
    function Bo(r, t) {
      if (v(r.dtype)) return Or(r.data, t);
      let e = r.iget(t);
      return e instanceof E ? [e.re, e.im] : [Number(e), 0];
    }
    function qr(r, t, e) {
      let n = Ar([Array.from(r.shape), Array.from(t.shape)]);
      if (!n) throw new Error("Cannot broadcast arrays together");
      let o = pr(r, n), a = pr(t, n), i = n.reduce((u, c) => u * c, 1), s = new Uint8Array(i);
      for (let u = 0; u < i; u++) {
        let [c, l] = Bo(o, u), [m, d] = Bo(a, u);
        s[u] = e(c, l, m, d) ? 1 : 0;
      }
      return N.fromData(s, n, "bool");
    }
    function Eo(r, t) {
      return typeof t == "number" ? hy(r, t) : v(r.dtype) || v(t.dtype) ? qr(r, t, (e, n, o, a) => e !== o ? e > o : n > a) : yr(r, t, (e, n) => e > n);
    }
    function To(r, t) {
      return typeof t == "number" ? Sy(r, t) : v(r.dtype) || v(t.dtype) ? qr(r, t, (e, n, o, a) => e !== o ? e >= o : n >= a) : yr(r, t, (e, n) => e >= n);
    }
    function Oo(r, t) {
      return typeof t == "number" ? Dy(r, t) : v(r.dtype) || v(t.dtype) ? qr(r, t, (e, n, o, a) => e !== o ? e < o : n < a) : yr(r, t, (e, n) => e < n);
    }
    function Co(r, t) {
      return typeof t == "number" ? Ny(r, t) : v(r.dtype) || v(t.dtype) ? qr(r, t, (e, n, o, a) => e !== o ? e <= o : n <= a) : yr(r, t, (e, n) => e <= n);
    }
    function Uo(r, t) {
      return typeof t == "number" ? xy(r, t) : v(r.dtype) || v(t.dtype) ? qr(r, t, (e, n, o, a) => e === o && n === a) : yr(r, t, (e, n) => e === n);
    }
    function $o(r, t) {
      return typeof t == "number" ? wy(r, t) : v(r.dtype) || v(t.dtype) ? qr(r, t, (e, n, o, a) => e !== o || n !== a) : yr(r, t, (e, n) => e !== n);
    }
    function ae(r, t, e = 1e-5, n = 1e-8) {
      return typeof t == "number" ? Iy(r, t, e, n) : yr(r, t, (o, a) => {
        let i = Math.abs(o - a), s = n + e * Math.abs(a);
        return i <= s;
      });
    }
    function Ro(r, t, e = 1e-5, n = 1e-8) {
      let o = ae(r, t, e, n), a = o.data;
      for (let i = 0; i < o.size; i++) if (a[i] === 0) return false;
      return true;
    }
    function ko(r, t) {
      let e = [Array.from(r.shape), Array.from(t.shape)], n = Ar(e);
      if (n === null) return false;
      let o = pr(r, n), a = pr(t, n), i = n.length, s = n.reduce((l, m) => l * m, 1), u = B(o.dtype), c = B(a.dtype);
      for (let l = 0; l < s; l++) {
        let m = l, d = new Array(i);
        for (let p = i - 1; p >= 0; p--) d[p] = m % n[p], m = Math.floor(m / n[p]);
        let y = o.get(...d), f = a.get(...d);
        if (u || c) {
          let p = typeof y == "bigint" ? y : BigInt(Number(y)), g = typeof f == "bigint" ? f : BigInt(Number(f));
          if (p !== g) return false;
        } else if (y !== f) return false;
      }
      return true;
    }
    function hy(r, t) {
      let e = new Uint8Array(r.size), n = r.data;
      if (v(r.dtype)) {
        let o = n;
        for (let a = 0; a < r.size; a++) {
          let [i, s] = Or(o, a);
          e[a] = (i !== t ? i > t : s > 0) ? 1 : 0;
        }
      } else for (let o = 0; o < r.size; o++) e[o] = n[o] > t ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function Sy(r, t) {
      let e = new Uint8Array(r.size), n = r.data;
      if (v(r.dtype)) {
        let o = n;
        for (let a = 0; a < r.size; a++) {
          let [i, s] = Or(o, a);
          e[a] = (i !== t ? i >= t : s >= 0) ? 1 : 0;
        }
      } else for (let o = 0; o < r.size; o++) e[o] = n[o] >= t ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function Dy(r, t) {
      let e = new Uint8Array(r.size), n = r.data;
      if (v(r.dtype)) {
        let o = n;
        for (let a = 0; a < r.size; a++) {
          let [i, s] = Or(o, a);
          e[a] = (i !== t ? i < t : s < 0) ? 1 : 0;
        }
      } else for (let o = 0; o < r.size; o++) e[o] = n[o] < t ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function Ny(r, t) {
      let e = new Uint8Array(r.size), n = r.data;
      if (v(r.dtype)) {
        let o = n;
        for (let a = 0; a < r.size; a++) {
          let [i, s] = Or(o, a);
          e[a] = (i !== t ? i <= t : s <= 0) ? 1 : 0;
        }
      } else for (let o = 0; o < r.size; o++) e[o] = n[o] <= t ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function xy(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = r.dtype;
      if (v(o)) {
        let a = n;
        for (let i = 0; i < r.size; i++) {
          let [s, u] = Or(a, i);
          e[i] = s === t && u === 0 ? 1 : 0;
        }
      } else if (B(o)) {
        let a = BigInt(Math.round(t)), i = n;
        for (let s = 0; s < r.size; s++) e[s] = i[s] === a ? 1 : 0;
      } else for (let a = 0; a < r.size; a++) e[a] = n[a] === t ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function wy(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = r.dtype;
      if (v(o)) {
        let a = n;
        for (let i = 0; i < r.size; i++) {
          let [s, u] = Or(a, i);
          e[i] = s !== t || u !== 0 ? 1 : 0;
        }
      } else for (let a = 0; a < r.size; a++) e[a] = n[a] !== t ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function Iy(r, t, e, n) {
      let o = new Uint8Array(r.size), a = r.data, i = r.dtype;
      if (B(i)) {
        let s = a;
        for (let u = 0; u < r.size; u++) {
          let c = Number(s[u]), l = Math.abs(c - t), m = n + e * Math.abs(t);
          o[u] = l <= m ? 1 : 0;
        }
      } else for (let s = 0; s < r.size; s++) {
        let u = Number(a[s]), c = Math.abs(u - t), l = n + e * Math.abs(t);
        o[s] = c <= l ? 1 : 0;
      }
      return N.fromData(o, Array.from(r.shape), "bool");
    }
    function $(r, t) {
      let e = 0, n = 1;
      for (let o = r.length - 1; o >= 0; o--) e += r[o] * n, n *= t[o];
      return e;
    }
    function R(r, t, e, n) {
      let o = n.length, a = new Array(o), i = Array.from(n).filter((u, c) => c !== t), s = r;
      for (let u = i.length - 1; u >= 0; u--) a[u >= t ? u + 1 : u] = s % i[u], s = Math.floor(s / i[u]);
      return a[t] = e, a;
    }
    function Kr(r, t, e = false) {
      let n = r.dtype, o = r.shape, a = o.length, i = r.size, s = r.data;
      if (t === void 0) if (v(n)) {
        let f = s, p = 0, g = 0;
        for (let h = 0; h < i; h++) p += f[h * 2], g += f[h * 2 + 1];
        return new E(p, g);
      } else if (B(n)) {
        let f = s, p = BigInt(0);
        for (let g = 0; g < i; g++) p += f[g];
        return Number(p);
      } else {
        let f = 0;
        for (let p = 0; p < i; p++) f += Number(s[p]);
        return f;
      }
      let u = t;
      if (u < 0 && (u = a + u), u < 0 || u >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let c = Array.from(o).filter((f, p) => p !== u);
      if (c.length === 0) return Kr(r);
      let l = N.zeros(c, n), m = l.data, d = o[u], y = c.reduce((f, p) => f * p, 1);
      if (v(n)) {
        let f = s, p = m;
        for (let g = 0; g < y; g++) {
          let h = 0, b = 0;
          for (let A = 0; A < d; A++) {
            let S = R(g, u, A, o), D = $(S, o);
            h += f[D * 2], b += f[D * 2 + 1];
          }
          p[g * 2] = h, p[g * 2 + 1] = b;
        }
      } else if (B(n)) {
        let f = s, p = m;
        for (let g = 0; g < y; g++) {
          let h = BigInt(0);
          for (let b = 0; b < d; b++) {
            let A = R(g, u, b, o), S = $(A, o);
            h += f[S];
          }
          p[g] = h;
        }
      } else for (let f = 0; f < y; f++) {
        let p = 0;
        for (let g = 0; g < d; g++) {
          let h = R(f, u, g, o), b = $(h, o);
          p += Number(s[b]);
        }
        m[f] = p;
      }
      if (e) {
        let f = [...o];
        return f[u] = 1, N.fromData(m, f, n);
      }
      return l;
    }
    function wt(r, t, e = false) {
      let n = r.dtype, o = r.shape;
      if (t === void 0) {
        let d = Kr(r);
        return d instanceof E ? new E(d.re / r.size, d.im / r.size) : d / r.size;
      }
      let a = t;
      if (a < 0 && (a = o.length + a), a < 0 || a >= o.length) throw new Error(`axis ${t} is out of bounds for array of dimension ${o.length}`);
      let i = Kr(r, t, e);
      if (typeof i == "number") return i / o[a];
      if (i instanceof E) return new E(i.re / o[a], i.im / o[a]);
      let s = o[a], u = n;
      v(n) ? u = n : (B(n) || n.startsWith("int") || n.startsWith("uint")) && (u = "float64");
      let c = N.zeros(Array.from(i.shape), u), l = c.data, m = i.data;
      if (v(n)) {
        let d = m, y = l, f = i.size;
        for (let p = 0; p < f; p++) y[p * 2] = d[p * 2] / s, y[p * 2 + 1] = d[p * 2 + 1] / s;
      } else if (B(n)) {
        let d = m;
        for (let y = 0; y < l.length; y++) l[y] = Number(d[y]) / s;
      } else for (let d = 0; d < l.length; d++) l[d] = Number(m[d]) / s;
      return c;
    }
    function Vr(r, t, e = false) {
      let n = r.dtype, o = r.shape, a = o.length, i = r.size, s = r.data;
      if (v(n)) {
        let f = s;
        if (t === void 0) {
          if (i === 0) throw new Error("max of empty array");
          let D = f[0], w = f[1];
          for (let x = 1; x < i; x++) {
            let I = f[x * 2], z = f[x * 2 + 1];
            if (isNaN(I) || isNaN(z)) return new E(NaN, NaN);
            (I > D || I === D && z > w) && (D = I, w = z);
          }
          return isNaN(D) || isNaN(w) ? new E(NaN, NaN) : new E(D, w);
        }
        let p = t;
        if (p < 0 && (p = a + p), p < 0 || p >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
        let g = Array.from(o).filter((D, w) => w !== p);
        if (g.length === 0) return Vr(r);
        let h = N.zeros(g, n), b = h.data, A = o[p], S = g.reduce((D, w) => D * w, 1);
        for (let D = 0; D < S; D++) {
          let w = R(D, p, 0, o), x = $(w, o), I = f[x * 2], z = f[x * 2 + 1];
          for (let F = 1; F < A; F++) {
            let M = R(D, p, F, o), T = $(M, o), O = f[T * 2], C = f[T * 2 + 1];
            if (isNaN(O) || isNaN(C)) {
              I = NaN, z = NaN;
              break;
            }
            (O > I || O === I && C > z) && (I = O, z = C);
          }
          b[D * 2] = I, b[D * 2 + 1] = z;
        }
        if (e) {
          let D = [...o];
          return D[p] = 1, N.fromData(b, D, n);
        }
        return h;
      }
      if (t === void 0) {
        if (i === 0) throw new Error("max of empty array");
        let f = s[0];
        for (let p = 1; p < i; p++) s[p] > f && (f = s[p]);
        return Number(f);
      }
      let u = t;
      if (u < 0 && (u = a + u), u < 0 || u >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let c = Array.from(o).filter((f, p) => p !== u);
      if (c.length === 0) return Vr(r);
      let l = N.zeros(c, n), m = l.data, d = o[u], y = c.reduce((f, p) => f * p, 1);
      if (B(n)) {
        let f = s, p = m;
        for (let g = 0; g < y; g++) {
          let h = R(g, u, 0, o), b = $(h, o), A = f[b];
          for (let S = 1; S < d; S++) {
            let D = R(g, u, S, o), w = $(D, o), x = f[w];
            x > A && (A = x);
          }
          p[g] = A;
        }
      } else for (let f = 0; f < y; f++) {
        let p = -1 / 0;
        for (let g = 0; g < d; g++) {
          let h = R(f, u, g, o), b = $(h, o), A = Number(s[b]);
          A > p && (p = A);
        }
        m[f] = p;
      }
      if (e) {
        let f = [...o];
        return f[u] = 1, N.fromData(m, f, n);
      }
      return l;
    }
    function se(r, t, e = false) {
      let n = r.dtype, o = r.shape, a = o.length, i = r.size, s = r.data;
      if (t === void 0) if (v(n)) {
        let f = s, p = 1, g = 0;
        for (let h = 0; h < i; h++) {
          let b = f[h * 2], A = f[h * 2 + 1], S = p * b - g * A, D = p * A + g * b;
          p = S, g = D;
        }
        return new E(p, g);
      } else if (B(n)) {
        let f = s, p = BigInt(1);
        for (let g = 0; g < i; g++) p *= f[g];
        return Number(p);
      } else {
        let f = 1;
        for (let p = 0; p < i; p++) f *= Number(s[p]);
        return f;
      }
      let u = t;
      if (u < 0 && (u = a + u), u < 0 || u >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let c = Array.from(o).filter((f, p) => p !== u);
      if (c.length === 0) return se(r);
      let l = N.zeros(c, n), m = l.data, d = o[u], y = c.reduce((f, p) => f * p, 1);
      if (v(n)) {
        let f = s, p = m;
        for (let g = 0; g < y; g++) {
          let h = 1, b = 0;
          for (let A = 0; A < d; A++) {
            let S = R(g, u, A, o), D = $(S, o), w = f[D * 2], x = f[D * 2 + 1], I = h * w - b * x, z = h * x + b * w;
            h = I, b = z;
          }
          p[g * 2] = h, p[g * 2 + 1] = b;
        }
      } else if (B(n)) {
        let f = s, p = m;
        for (let g = 0; g < y; g++) {
          let h = BigInt(1);
          for (let b = 0; b < d; b++) {
            let A = R(g, u, b, o), S = $(A, o);
            h *= f[S];
          }
          p[g] = h;
        }
      } else for (let f = 0; f < y; f++) {
        let p = 1;
        for (let g = 0; g < d; g++) {
          let h = R(f, u, g, o), b = $(h, o);
          p *= Number(s[b]);
        }
        m[f] = p;
      }
      if (e) {
        let f = [...o];
        return f[u] = 1, N.fromData(m, f, n);
      }
      return l;
    }
    function jr(r, t, e = false) {
      let n = r.dtype, o = r.shape, a = o.length, i = r.size, s = r.data;
      if (v(n)) {
        let f = s;
        if (t === void 0) {
          if (i === 0) throw new Error("min of empty array");
          let D = f[0], w = f[1];
          for (let x = 1; x < i; x++) {
            let I = f[x * 2], z = f[x * 2 + 1];
            if (isNaN(I) || isNaN(z)) return new E(NaN, NaN);
            (I < D || I === D && z < w) && (D = I, w = z);
          }
          return isNaN(D) || isNaN(w) ? new E(NaN, NaN) : new E(D, w);
        }
        let p = t;
        if (p < 0 && (p = a + p), p < 0 || p >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
        let g = Array.from(o).filter((D, w) => w !== p);
        if (g.length === 0) return jr(r);
        let h = N.zeros(g, n), b = h.data, A = o[p], S = g.reduce((D, w) => D * w, 1);
        for (let D = 0; D < S; D++) {
          let w = R(D, p, 0, o), x = $(w, o), I = f[x * 2], z = f[x * 2 + 1];
          for (let F = 1; F < A; F++) {
            let M = R(D, p, F, o), T = $(M, o), O = f[T * 2], C = f[T * 2 + 1];
            if (isNaN(O) || isNaN(C)) {
              I = NaN, z = NaN;
              break;
            }
            (O < I || O === I && C < z) && (I = O, z = C);
          }
          b[D * 2] = I, b[D * 2 + 1] = z;
        }
        if (e) {
          let D = [...o];
          return D[p] = 1, N.fromData(b, D, n);
        }
        return h;
      }
      if (t === void 0) {
        if (i === 0) throw new Error("min of empty array");
        let f = s[0];
        for (let p = 1; p < i; p++) s[p] < f && (f = s[p]);
        return Number(f);
      }
      let u = t;
      if (u < 0 && (u = a + u), u < 0 || u >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let c = Array.from(o).filter((f, p) => p !== u);
      if (c.length === 0) return jr(r);
      let l = N.zeros(c, n), m = l.data, d = o[u], y = c.reduce((f, p) => f * p, 1);
      if (B(n)) {
        let f = s, p = m;
        for (let g = 0; g < y; g++) {
          let h = R(g, u, 0, o), b = $(h, o), A = f[b];
          for (let S = 1; S < d; S++) {
            let D = R(g, u, S, o), w = $(D, o), x = f[w];
            x < A && (A = x);
          }
          p[g] = A;
        }
      } else for (let f = 0; f < y; f++) {
        let p = 1 / 0;
        for (let g = 0; g < d; g++) {
          let h = R(f, u, g, o), b = $(h, o), A = Number(s[b]);
          A < p && (p = A);
        }
        m[f] = p;
      }
      if (e) {
        let f = [...o];
        return f[u] = 1, N.fromData(m, f, n);
      }
      return l;
    }
    function Fr(r, t, e, n) {
      return r < e ? -1 : r > e ? 1 : t < n ? -1 : t > n ? 1 : 0;
    }
    function ie(r, t) {
      let e = r.dtype, n = v(e), o = r.shape, a = o.length, i = r.size, s = r.data;
      if (t === void 0) {
        if (i === 0) throw new Error("argmin of empty array");
        if (n) {
          let g = s, h = g[0], b = g[1], A = 0;
          for (let S = 1; S < i; S++) {
            let D = g[S * 2], w = g[S * 2 + 1];
            Fr(D, w, h, b) < 0 && (h = D, b = w, A = S);
          }
          return A;
        }
        let f = s[0], p = 0;
        for (let g = 1; g < i; g++) s[g] < f && (f = s[g], p = g);
        return p;
      }
      let u = t;
      if (u < 0 && (u = a + u), u < 0 || u >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let c = Array.from(o).filter((f, p) => p !== u);
      if (c.length === 0) return ie(r);
      let l = N.zeros(c, "int32"), m = l.data, d = o[u], y = c.reduce((f, p) => f * p, 1);
      if (n) {
        let f = s;
        for (let p = 0; p < y; p++) {
          let g = R(p, u, 0, o), h = $(g, o), b = f[h * 2], A = f[h * 2 + 1], S = 0;
          for (let D = 1; D < d; D++) {
            let w = R(p, u, D, o), x = $(w, o), I = f[x * 2], z = f[x * 2 + 1];
            Fr(I, z, b, A) < 0 && (b = I, A = z, S = D);
          }
          m[p] = S;
        }
      } else if (B(e)) {
        let f = s;
        for (let p = 0; p < y; p++) {
          let g = R(p, u, 0, o), h = $(g, o), b = f[h], A = 0;
          for (let S = 1; S < d; S++) {
            let D = R(p, u, S, o), w = $(D, o), x = f[w];
            x < b && (b = x, A = S);
          }
          m[p] = A;
        }
      } else for (let f = 0; f < y; f++) {
        let p = 1 / 0, g = 0;
        for (let h = 0; h < d; h++) {
          let b = R(f, u, h, o), A = $(b, o), S = Number(s[A]);
          S < p && (p = S, g = h);
        }
        m[f] = g;
      }
      return l;
    }
    function ue(r, t) {
      let e = r.dtype, n = v(e), o = r.shape, a = o.length, i = r.size, s = r.data;
      if (t === void 0) {
        if (i === 0) throw new Error("argmax of empty array");
        if (n) {
          let g = s, h = g[0], b = g[1], A = 0;
          for (let S = 1; S < i; S++) {
            let D = g[S * 2], w = g[S * 2 + 1];
            Fr(D, w, h, b) > 0 && (h = D, b = w, A = S);
          }
          return A;
        }
        let f = s[0], p = 0;
        for (let g = 1; g < i; g++) s[g] > f && (f = s[g], p = g);
        return p;
      }
      let u = t;
      if (u < 0 && (u = a + u), u < 0 || u >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let c = Array.from(o).filter((f, p) => p !== u);
      if (c.length === 0) return ue(r);
      let l = N.zeros(c, "int32"), m = l.data, d = o[u], y = c.reduce((f, p) => f * p, 1);
      if (n) {
        let f = s;
        for (let p = 0; p < y; p++) {
          let g = R(p, u, 0, o), h = $(g, o), b = f[h * 2], A = f[h * 2 + 1], S = 0;
          for (let D = 1; D < d; D++) {
            let w = R(p, u, D, o), x = $(w, o), I = f[x * 2], z = f[x * 2 + 1];
            Fr(I, z, b, A) > 0 && (b = I, A = z, S = D);
          }
          m[p] = S;
        }
      } else if (B(e)) {
        let f = s;
        for (let p = 0; p < y; p++) {
          let g = R(p, u, 0, o), h = $(g, o), b = f[h], A = 0;
          for (let S = 1; S < d; S++) {
            let D = R(p, u, S, o), w = $(D, o), x = f[w];
            x > b && (b = x, A = S);
          }
          m[p] = A;
        }
      } else for (let f = 0; f < y; f++) {
        let p = -1 / 0, g = 0;
        for (let h = 0; h < d; h++) {
          let b = R(f, u, h, o), A = $(b, o), S = Number(s[A]);
          S > p && (p = S, g = h);
        }
        m[f] = g;
      }
      return l;
    }
    function ce(r, t, e = 0, n = false) {
      let o = r.dtype, a = r.shape, i = a.length, s = r.size, u = r.data, c = wt(r, t, n);
      if (t === void 0) {
        if (v(o)) {
          let S = u, D = c, w = 0;
          for (let x = 0; x < s; x++) {
            let I = S[x * 2], z = S[x * 2 + 1], F = I - D.re, M = z - D.im;
            w += F * F + M * M;
          }
          return w / (s - e);
        }
        let b = c, A = 0;
        for (let S = 0; S < s; S++) {
          let D = Number(u[S]) - b;
          A += D * D;
        }
        return A / (s - e);
      }
      let l = t;
      if (l < 0 && (l = i + l), l < 0 || l >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
      let m = a[l], d = c, y = d.data, f = n ? d.shape : Array.from(a).filter((b, A) => A !== l), p = N.zeros(Array.from(f), "float64"), g = p.data, h = f.reduce((b, A) => b * A, 1);
      if (v(o)) {
        let b = u, A = y;
        for (let S = 0; S < h; S++) {
          let D = 0, w = A[S * 2], x = A[S * 2 + 1];
          for (let I = 0; I < m; I++) {
            let z = R(S, l, I, a), F = $(z, a), M = b[F * 2], T = b[F * 2 + 1], O = M - w, C = T - x;
            D += O * O + C * C;
          }
          g[S] = D / (m - e);
        }
      } else for (let b = 0; b < h; b++) {
        let A = 0, S = Number(y[b]);
        for (let D = 0; D < m; D++) {
          let w = R(b, l, D, a), x = $(w, a), I = Number(u[x]) - S;
          A += I * I;
        }
        g[b] = A / (m - e);
      }
      return p;
    }
    function qo(r, t, e = 0, n = false) {
      let o = ce(r, t, e, n);
      if (typeof o == "number") return Math.sqrt(o);
      let a = N.zeros(Array.from(o.shape), "float64"), i = o.data, s = a.data;
      for (let u = 0; u < i.length; u++) s[u] = Math.sqrt(Number(i[u]));
      return a;
    }
    function le(r, t, e = false) {
      let n = r.shape, o = n.length, a = r.size, i = r.data;
      if (t === void 0) {
        for (let y = 0; y < a; y++) if (!i[y]) return false;
        return true;
      }
      let s = t;
      if (s < 0 && (s = o + s), s < 0 || s >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let u = Array.from(n).filter((y, f) => f !== s);
      if (u.length === 0) return le(r);
      let c = N.zeros(u, "bool"), l = c.data, m = n[s], d = u.reduce((y, f) => y * f, 1);
      for (let y = 0; y < d; y++) {
        let f = true;
        for (let p = 0; p < m; p++) {
          let g = R(y, s, p, n), h = $(g, n);
          if (!i[h]) {
            f = false;
            break;
          }
        }
        l[y] = f ? 1 : 0;
      }
      if (e) {
        let y = [...n];
        return y[s] = 1, N.fromData(l, y, "bool");
      }
      return c;
    }
    function fe(r, t, e = false) {
      let n = r.shape, o = n.length, a = r.size, i = r.data;
      if (t === void 0) {
        for (let y = 0; y < a; y++) if (i[y]) return true;
        return false;
      }
      let s = t;
      if (s < 0 && (s = o + s), s < 0 || s >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let u = Array.from(n).filter((y, f) => f !== s);
      if (u.length === 0) return fe(r);
      let c = N.zeros(u, "bool"), l = c.data, m = n[s], d = u.reduce((y, f) => y * f, 1);
      for (let y = 0; y < d; y++) {
        let f = false;
        for (let p = 0; p < m; p++) {
          let g = R(y, s, p, n), h = $(g, n);
          if (i[h]) {
            f = true;
            break;
          }
        }
        l[y] = f ? 1 : 0;
      }
      if (e) {
        let y = [...n];
        return y[s] = 1, N.fromData(l, y, "bool");
      }
      return c;
    }
    function me(r, t) {
      let e = r.dtype, n = r.shape, o = n.length, a = r.data;
      if (v(e)) {
        let y = a, f = r.size;
        if (t === void 0) {
          let x = N.zeros([f], e), I = x.data, z = 0, F = 0;
          for (let M = 0; M < f; M++) z += y[M * 2], F += y[M * 2 + 1], I[M * 2] = z, I[M * 2 + 1] = F;
          return x;
        }
        let p = t;
        if (p < 0 && (p = o + p), p < 0 || p >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
        let g = N.zeros([...n], e), h = g.data, b = n[p], A = [], S = 1;
        for (let x = o - 1; x >= 0; x--) A.unshift(S), S *= n[x];
        let D = r.size, w = A[p];
        for (let x = 0; x < D; x++) Math.floor(x / w) % b === 0 ? (h[x * 2] = y[x * 2], h[x * 2 + 1] = y[x * 2 + 1]) : (h[x * 2] = h[(x - w) * 2] + y[x * 2], h[x * 2 + 1] = h[(x - w) * 2 + 1] + y[x * 2 + 1]);
        return g;
      }
      if (t === void 0) {
        let y = r.size, f = new Float64Array(y), p = 0;
        for (let g = 0; g < y; g++) p += Number(a[g]), f[g] = p;
        return N.fromData(f, [y], "float64");
      }
      let i = t;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let s = new Float64Array(r.size), u = n[i], c = [], l = 1;
      for (let y = o - 1; y >= 0; y--) c.unshift(l), l *= n[y];
      let m = r.size, d = c[i];
      for (let y = 0; y < m; y++) Math.floor(y / d) % u === 0 ? s[y] = Number(a[y]) : s[y] = s[y - d] + Number(a[y]);
      return N.fromData(s, [...n], "float64");
    }
    function pe(r, t) {
      let e = r.dtype, n = r.shape, o = n.length, a = r.data;
      if (v(e)) {
        let y = a, f = r.size;
        if (t === void 0) {
          let x = N.zeros([f], e), I = x.data, z = 1, F = 0;
          for (let M = 0; M < f; M++) {
            let T = y[M * 2], O = y[M * 2 + 1], C = z * T - F * O, q = z * O + F * T;
            z = C, F = q, I[M * 2] = z, I[M * 2 + 1] = F;
          }
          return x;
        }
        let p = t;
        if (p < 0 && (p = o + p), p < 0 || p >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
        let g = N.zeros([...n], e), h = g.data, b = n[p], A = [], S = 1;
        for (let x = o - 1; x >= 0; x--) A.unshift(S), S *= n[x];
        let D = r.size, w = A[p];
        for (let x = 0; x < D; x++) if (Math.floor(x / w) % b === 0) h[x * 2] = y[x * 2], h[x * 2 + 1] = y[x * 2 + 1];
        else {
          let z = h[(x - w) * 2], F = h[(x - w) * 2 + 1], M = y[x * 2], T = y[x * 2 + 1];
          h[x * 2] = z * M - F * T, h[x * 2 + 1] = z * T + F * M;
        }
        return g;
      }
      if (t === void 0) {
        let y = r.size, f = new Float64Array(y), p = 1;
        for (let g = 0; g < y; g++) p *= Number(a[g]), f[g] = p;
        return N.fromData(f, [y], "float64");
      }
      let i = t;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let s = new Float64Array(r.size), u = n[i], c = [], l = 1;
      for (let y = o - 1; y >= 0; y--) c.unshift(l), l *= n[y];
      let m = r.size, d = c[i];
      for (let y = 0; y < m; y++) Math.floor(y / d) % u === 0 ? s[y] = Number(a[y]) : s[y] = s[y - d] * Number(a[y]);
      return N.fromData(s, [...n], "float64");
    }
    function ye(r, t, e = false) {
      let n = r.dtype;
      if (v(n)) {
        let m = Vr(r, t, e), d = jr(r, t, e);
        if (m instanceof E && d instanceof E) return new E(m.re - d.re, m.im - d.im);
        let y = m, f = d, p = y.data, g = f.data, h = new Float64Array(y.size * 2);
        for (let b = 0; b < y.size; b++) h[b * 2] = p[b * 2] - g[b * 2], h[b * 2 + 1] = p[b * 2 + 1] - g[b * 2 + 1];
        return N.fromData(h, [...y.shape], n);
      }
      let o = Vr(r, t, e), a = jr(r, t, e);
      if (typeof o == "number" && typeof a == "number") return o - a;
      let i = o, s = a, u = i.data, c = s.data, l = new Float64Array(i.size);
      for (let m = 0; m < i.size; m++) l[m] = Number(u[m]) - Number(c[m]);
      return N.fromData(l, [...i.shape], "float64");
    }
    function de(r, t, e = false) {
      return Lr(r, 0.5, t, e);
    }
    function ge(r, t, e, n = false) {
      return Lr(r, t / 100, e, n);
    }
    function Lr(r, t, e, n = false) {
      if (U(r.dtype, "quantile", "Complex numbers are not orderable."), t < 0 || t > 1) throw new Error("Quantile must be between 0 and 1");
      let o = r.shape, a = o.length, i = r.data;
      if (e === void 0) {
        let y = [];
        for (let A = 0; A < r.size; A++) y.push(Number(i[A]));
        y.sort((A, S) => A - S);
        let f = y.length, p = t * (f - 1), g = Math.floor(p), h = Math.ceil(p);
        if (g === h) return y[g];
        let b = p - g;
        return y[g] * (1 - b) + y[h] * b;
      }
      let s = e;
      if (s < 0 && (s = a + s), s < 0 || s >= a) throw new Error(`axis ${e} is out of bounds for array of dimension ${a}`);
      let u = Array.from(o).filter((y, f) => f !== s);
      if (u.length === 0) return Lr(r, t);
      let c = u.reduce((y, f) => y * f, 1), l = o[s], m = new Float64Array(c);
      for (let y = 0; y < c; y++) {
        let f = [];
        for (let A = 0; A < l; A++) {
          let S = R(y, s, A, o), D = $(S, o);
          f.push(Number(i[D]));
        }
        f.sort((A, S) => A - S);
        let p = f.length, g = t * (p - 1), h = Math.floor(g), b = Math.ceil(g);
        if (h === b) m[y] = f[h];
        else {
          let A = g - h;
          m[y] = f[h] * (1 - A) + f[b] * A;
        }
      }
      let d = N.fromData(m, u, "float64");
      if (n) {
        let y = [...o];
        return y[s] = 1, N.fromData(m, y, "float64");
      }
      return d;
    }
    function rt(r, t, e, n = false) {
      let o = r.dtype, a = r.shape, i = a.length, s = r.data;
      if (e === void 0) return wt(r, t, n);
      if (v(o)) {
        let p = s, g = e.data;
        if (t === void 0) {
          let x = 0, I = 0, z = 0;
          for (let F = 0; F < r.size; F++) {
            let M = Number(g[F % e.size]), T = p[F * 2], O = p[F * 2 + 1];
            x += T * M, I += O * M, z += M;
          }
          return z === 0 ? new E(NaN, NaN) : new E(x / z, I / z);
        }
        let h = t;
        if (h < 0 && (h = i + h), h < 0 || h >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
        let b = Array.from(a).filter((x, I) => I !== h);
        if (b.length === 0) return rt(r, void 0, e);
        let A = b.reduce((x, I) => x * I, 1), S = a[h], D = N.zeros(b, o), w = D.data;
        for (let x = 0; x < A; x++) {
          let I = 0, z = 0, F = 0;
          for (let M = 0; M < S; M++) {
            let T = R(x, h, M, a), O = $(T, a), C = Number(g[M % e.size]), q = p[O * 2], V = p[O * 2 + 1];
            I += q * C, z += V * C, F += C;
          }
          F === 0 ? (w[x * 2] = NaN, w[x * 2 + 1] = NaN) : (w[x * 2] = I / F, w[x * 2 + 1] = z / F);
        }
        if (n) {
          let x = [...a];
          return x[h] = 1, N.fromData(w, x, o);
        }
        return D;
      }
      if (t === void 0) {
        let p = 0, g = 0, h = e.data;
        for (let b = 0; b < r.size; b++) {
          let A = Number(h[b % e.size]);
          p += Number(s[b]) * A, g += A;
        }
        return g === 0 ? NaN : p / g;
      }
      let u = t;
      if (u < 0 && (u = i + u), u < 0 || u >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
      let c = Array.from(a).filter((p, g) => g !== u);
      if (c.length === 0) return rt(r, void 0, e);
      let l = c.reduce((p, g) => p * g, 1), m = a[u], d = e.data, y = new Float64Array(l);
      for (let p = 0; p < l; p++) {
        let g = 0, h = 0;
        for (let b = 0; b < m; b++) {
          let A = R(p, u, b, a), S = $(A, a), D = Number(d[b % e.size]);
          g += Number(s[S]) * D, h += D;
        }
        y[p] = h === 0 ? NaN : g / h;
      }
      let f = N.fromData(y, c, "float64");
      if (n) {
        let p = [...a];
        return p[u] = 1, N.fromData(y, p, "float64");
      }
      return f;
    }
    function tr(r, t) {
      return isNaN(r) || isNaN(t);
    }
    function It(r, t, e = false) {
      let n = r.dtype, o = v(n), a = r.shape, i = a.length, s = r.data;
      if (t === void 0) {
        if (o) {
          let p = s, g = 0, h = 0;
          for (let b = 0; b < r.size; b++) {
            let A = p[b * 2], S = p[b * 2 + 1];
            tr(A, S) || (g += A, h += S);
          }
          return new E(g, h);
        }
        let f = 0;
        for (let p = 0; p < r.size; p++) {
          let g = Number(s[p]);
          isNaN(g) || (f += g);
        }
        return f;
      }
      let u = t;
      if (u < 0 && (u = i + u), u < 0 || u >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
      let c = Array.from(a).filter((f, p) => p !== u);
      if (c.length === 0) return It(r);
      let l = c.reduce((f, p) => f * p, 1), m = a[u];
      if (o) {
        let f = s, p = new Float64Array(l * 2);
        for (let g = 0; g < l; g++) {
          let h = 0, b = 0;
          for (let A = 0; A < m; A++) {
            let S = R(g, u, A, a), D = $(S, a), w = f[D * 2], x = f[D * 2 + 1];
            tr(w, x) || (h += w, b += x);
          }
          p[g * 2] = h, p[g * 2 + 1] = b;
        }
        if (e) {
          let g = [...a];
          return g[u] = 1, N.fromData(p, g, n);
        }
        return N.fromData(p, c, n);
      }
      let d = new Float64Array(l);
      for (let f = 0; f < l; f++) {
        let p = 0;
        for (let g = 0; g < m; g++) {
          let h = R(f, u, g, a), b = $(h, a), A = Number(s[b]);
          isNaN(A) || (p += A);
        }
        d[f] = p;
      }
      let y = N.fromData(d, c, "float64");
      if (e) {
        let f = [...a];
        return f[u] = 1, N.fromData(d, f, "float64");
      }
      return y;
    }
    function zt(r, t, e = false) {
      let n = r.dtype, o = v(n), a = r.shape, i = a.length, s = r.data;
      if (t === void 0) {
        if (o) {
          let p = s, g = 1, h = 0;
          for (let b = 0; b < r.size; b++) {
            let A = p[b * 2], S = p[b * 2 + 1];
            if (!tr(A, S)) {
              let D = g * A - h * S, w = g * S + h * A;
              g = D, h = w;
            }
          }
          return new E(g, h);
        }
        let f = 1;
        for (let p = 0; p < r.size; p++) {
          let g = Number(s[p]);
          isNaN(g) || (f *= g);
        }
        return f;
      }
      let u = t;
      if (u < 0 && (u = i + u), u < 0 || u >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
      let c = Array.from(a).filter((f, p) => p !== u);
      if (c.length === 0) return zt(r);
      let l = c.reduce((f, p) => f * p, 1), m = a[u];
      if (o) {
        let f = s, p = new Float64Array(l * 2);
        for (let g = 0; g < l; g++) {
          let h = 1, b = 0;
          for (let A = 0; A < m; A++) {
            let S = R(g, u, A, a), D = $(S, a), w = f[D * 2], x = f[D * 2 + 1];
            if (!tr(w, x)) {
              let I = h * w - b * x, z = h * x + b * w;
              h = I, b = z;
            }
          }
          p[g * 2] = h, p[g * 2 + 1] = b;
        }
        if (e) {
          let g = [...a];
          return g[u] = 1, N.fromData(p, g, n);
        }
        return N.fromData(p, c, n);
      }
      let d = new Float64Array(l);
      for (let f = 0; f < l; f++) {
        let p = 1;
        for (let g = 0; g < m; g++) {
          let h = R(f, u, g, a), b = $(h, a), A = Number(s[b]);
          isNaN(A) || (p *= A);
        }
        d[f] = p;
      }
      let y = N.fromData(d, c, "float64");
      if (e) {
        let f = [...a];
        return f[u] = 1, N.fromData(d, f, "float64");
      }
      return y;
    }
    function _t(r, t, e = false) {
      let n = r.dtype, o = v(n), a = r.shape, i = a.length, s = r.data;
      if (t === void 0) {
        if (o) {
          let g = s, h = 0, b = 0, A = 0;
          for (let S = 0; S < r.size; S++) {
            let D = g[S * 2], w = g[S * 2 + 1];
            tr(D, w) || (h += D, b += w, A++);
          }
          return A === 0 ? new E(NaN, NaN) : new E(h / A, b / A);
        }
        let f = 0, p = 0;
        for (let g = 0; g < r.size; g++) {
          let h = Number(s[g]);
          isNaN(h) || (f += h, p++);
        }
        return p === 0 ? NaN : f / p;
      }
      let u = t;
      if (u < 0 && (u = i + u), u < 0 || u >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
      let c = Array.from(a).filter((f, p) => p !== u);
      if (c.length === 0) return _t(r);
      let l = c.reduce((f, p) => f * p, 1), m = a[u];
      if (o) {
        let f = s, p = new Float64Array(l * 2);
        for (let g = 0; g < l; g++) {
          let h = 0, b = 0, A = 0;
          for (let S = 0; S < m; S++) {
            let D = R(g, u, S, a), w = $(D, a), x = f[w * 2], I = f[w * 2 + 1];
            tr(x, I) || (h += x, b += I, A++);
          }
          A === 0 ? (p[g * 2] = NaN, p[g * 2 + 1] = NaN) : (p[g * 2] = h / A, p[g * 2 + 1] = b / A);
        }
        if (e) {
          let g = [...a];
          return g[u] = 1, N.fromData(p, g, n);
        }
        return N.fromData(p, c, n);
      }
      let d = new Float64Array(l);
      for (let f = 0; f < l; f++) {
        let p = 0, g = 0;
        for (let h = 0; h < m; h++) {
          let b = R(f, u, h, a), A = $(b, a), S = Number(s[A]);
          isNaN(S) || (p += S, g++);
        }
        d[f] = g === 0 ? NaN : p / g;
      }
      let y = N.fromData(d, c, "float64");
      if (e) {
        let f = [...a];
        return f[u] = 1, N.fromData(d, f, "float64");
      }
      return y;
    }
    function Pr(r, t, e = 0, n = false) {
      let o = r.dtype, a = r.shape, i = a.length, s = r.data;
      if (v(o)) {
        let f = s;
        if (t === void 0) {
          let D = 0, w = 0, x = 0;
          for (let M = 0; M < r.size; M++) {
            let T = f[M * 2], O = f[M * 2 + 1];
            tr(T, O) || (D += T, w += O, x++);
          }
          if (x - e <= 0) return NaN;
          let I = D / x, z = w / x, F = 0;
          for (let M = 0; M < r.size; M++) {
            let T = f[M * 2], O = f[M * 2 + 1];
            if (!tr(T, O)) {
              let C = T - I, q = O - z;
              F += C * C + q * q;
            }
          }
          return F / (x - e);
        }
        let p = t;
        if (p < 0 && (p = i + p), p < 0 || p >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
        let g = Array.from(a).filter((D, w) => w !== p);
        if (g.length === 0) return Pr(r, void 0, e);
        let h = g.reduce((D, w) => D * w, 1), b = a[p], A = new Float64Array(h);
        for (let D = 0; D < h; D++) {
          let w = 0, x = 0, I = 0;
          for (let T = 0; T < b; T++) {
            let O = R(D, p, T, a), C = $(O, a), q = f[C * 2], V = f[C * 2 + 1];
            tr(q, V) || (w += q, x += V, I++);
          }
          if (I - e <= 0) {
            A[D] = NaN;
            continue;
          }
          let z = w / I, F = x / I, M = 0;
          for (let T = 0; T < b; T++) {
            let O = R(D, p, T, a), C = $(O, a), q = f[C * 2], V = f[C * 2 + 1];
            if (!tr(q, V)) {
              let k = q - z, L = V - F;
              M += k * k + L * L;
            }
          }
          A[D] = M / (I - e);
        }
        let S = N.fromData(A, g, "float64");
        if (n) {
          let D = [...a];
          return D[p] = 1, N.fromData(A, D, "float64");
        }
        return S;
      }
      if (t === void 0) {
        let f = 0, p = 0;
        for (let b = 0; b < r.size; b++) {
          let A = Number(s[b]);
          isNaN(A) || (f += A, p++);
        }
        if (p - e <= 0) return NaN;
        let g = f / p, h = 0;
        for (let b = 0; b < r.size; b++) {
          let A = Number(s[b]);
          isNaN(A) || (h += (A - g) ** 2);
        }
        return h / (p - e);
      }
      let u = t;
      if (u < 0 && (u = i + u), u < 0 || u >= i) throw new Error(`axis ${t} is out of bounds for array of dimension ${i}`);
      let c = Array.from(a).filter((f, p) => p !== u);
      if (c.length === 0) return Pr(r, void 0, e);
      let l = c.reduce((f, p) => f * p, 1), m = a[u], d = new Float64Array(l);
      for (let f = 0; f < l; f++) {
        let p = 0, g = 0;
        for (let A = 0; A < m; A++) {
          let S = R(f, u, A, a), D = $(S, a), w = Number(s[D]);
          isNaN(w) || (p += w, g++);
        }
        if (g - e <= 0) {
          d[f] = NaN;
          continue;
        }
        let h = p / g, b = 0;
        for (let A = 0; A < m; A++) {
          let S = R(f, u, A, a), D = $(S, a), w = Number(s[D]);
          isNaN(w) || (b += (w - h) ** 2);
        }
        d[f] = b / (g - e);
      }
      let y = N.fromData(d, c, "float64");
      if (n) {
        let f = [...a];
        return f[u] = 1, N.fromData(d, f, "float64");
      }
      return y;
    }
    function Ae(r, t, e = 0, n = false) {
      let o = Pr(r, t, e, n);
      if (typeof o == "number") return Math.sqrt(o);
      let a = o, i = new Float64Array(a.size);
      for (let s = 0; s < a.size; s++) i[s] = Math.sqrt(Number(a.data[s]));
      return N.fromData(i, [...a.shape], "float64");
    }
    function tt(r, t, e = false) {
      let n = r.dtype, o = r.shape, a = o.length, i = r.data;
      if (v(n)) {
        let y = i;
        if (t === void 0) {
          let S = 1 / 0, D = 1 / 0, w = false;
          for (let x = 0; x < r.size; x++) {
            let I = y[x * 2], z = y[x * 2 + 1];
            isNaN(I) || isNaN(z) || (w ? (I < S || I === S && z < D) && (S = I, D = z) : (S = I, D = z, w = true));
          }
          return w ? new E(S, D) : new E(NaN, NaN);
        }
        let f = t;
        if (f < 0 && (f = a + f), f < 0 || f >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
        let p = Array.from(o).filter((S, D) => D !== f);
        if (p.length === 0) return tt(r);
        let g = p.reduce((S, D) => S * D, 1), h = o[f], b = new Float64Array(g * 2);
        for (let S = 0; S < g; S++) {
          let D = 1 / 0, w = 1 / 0, x = false;
          for (let I = 0; I < h; I++) {
            let z = R(S, f, I, o), F = $(z, o), M = y[F * 2], T = y[F * 2 + 1];
            isNaN(M) || isNaN(T) || (x ? (M < D || M === D && T < w) && (D = M, w = T) : (D = M, w = T, x = true));
          }
          b[S * 2] = x ? D : NaN, b[S * 2 + 1] = x ? w : NaN;
        }
        let A = N.fromData(b, p, n);
        if (e) {
          let S = [...o];
          return S[f] = 1, N.fromData(b, S, n);
        }
        return A;
      }
      if (t === void 0) {
        let y = 1 / 0;
        for (let f = 0; f < r.size; f++) {
          let p = Number(i[f]);
          !isNaN(p) && p < y && (y = p);
        }
        return y === 1 / 0 ? NaN : y;
      }
      let s = t;
      if (s < 0 && (s = a + s), s < 0 || s >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let u = Array.from(o).filter((y, f) => f !== s);
      if (u.length === 0) return tt(r);
      let c = u.reduce((y, f) => y * f, 1), l = o[s], m = new Float64Array(c);
      for (let y = 0; y < c; y++) {
        let f = 1 / 0;
        for (let p = 0; p < l; p++) {
          let g = R(y, s, p, o), h = $(g, o), b = Number(i[h]);
          !isNaN(b) && b < f && (f = b);
        }
        m[y] = f === 1 / 0 ? NaN : f;
      }
      let d = N.fromData(m, u, "float64");
      if (e) {
        let y = [...o];
        return y[s] = 1, N.fromData(m, y, "float64");
      }
      return d;
    }
    function et(r, t, e = false) {
      let n = r.dtype, o = r.shape, a = o.length, i = r.data;
      if (v(n)) {
        let y = i;
        if (t === void 0) {
          let S = -1 / 0, D = -1 / 0, w = false;
          for (let x = 0; x < r.size; x++) {
            let I = y[x * 2], z = y[x * 2 + 1];
            isNaN(I) || isNaN(z) || (w ? (I > S || I === S && z > D) && (S = I, D = z) : (S = I, D = z, w = true));
          }
          return w ? new E(S, D) : new E(NaN, NaN);
        }
        let f = t;
        if (f < 0 && (f = a + f), f < 0 || f >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
        let p = Array.from(o).filter((S, D) => D !== f);
        if (p.length === 0) return et(r);
        let g = p.reduce((S, D) => S * D, 1), h = o[f], b = new Float64Array(g * 2);
        for (let S = 0; S < g; S++) {
          let D = -1 / 0, w = -1 / 0, x = false;
          for (let I = 0; I < h; I++) {
            let z = R(S, f, I, o), F = $(z, o), M = y[F * 2], T = y[F * 2 + 1];
            isNaN(M) || isNaN(T) || (x ? (M > D || M === D && T > w) && (D = M, w = T) : (D = M, w = T, x = true));
          }
          b[S * 2] = x ? D : NaN, b[S * 2 + 1] = x ? w : NaN;
        }
        let A = N.fromData(b, p, n);
        if (e) {
          let S = [...o];
          return S[f] = 1, N.fromData(b, S, n);
        }
        return A;
      }
      if (t === void 0) {
        let y = -1 / 0;
        for (let f = 0; f < r.size; f++) {
          let p = Number(i[f]);
          !isNaN(p) && p > y && (y = p);
        }
        return y === -1 / 0 ? NaN : y;
      }
      let s = t;
      if (s < 0 && (s = a + s), s < 0 || s >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let u = Array.from(o).filter((y, f) => f !== s);
      if (u.length === 0) return et(r);
      let c = u.reduce((y, f) => y * f, 1), l = o[s], m = new Float64Array(c);
      for (let y = 0; y < c; y++) {
        let f = -1 / 0;
        for (let p = 0; p < l; p++) {
          let g = R(y, s, p, o), h = $(g, o), b = Number(i[h]);
          !isNaN(b) && b > f && (f = b);
        }
        m[y] = f === -1 / 0 ? NaN : f;
      }
      let d = N.fromData(m, u, "float64");
      if (e) {
        let y = [...o];
        return y[s] = 1, N.fromData(m, y, "float64");
      }
      return d;
    }
    function nt(r, t) {
      let e = r.dtype, n = r.shape, o = n.length, a = r.data;
      if (v(e)) {
        let m = a;
        if (t === void 0) {
          let h = 1 / 0, b = 1 / 0, A = -1;
          for (let S = 0; S < r.size; S++) {
            let D = m[S * 2], w = m[S * 2 + 1];
            !tr(D, w) && Fr(D, w, h, b) < 0 && (h = D, b = w, A = S);
          }
          return A;
        }
        let d = t;
        if (d < 0 && (d = o + d), d < 0 || d >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
        let y = Array.from(n).filter((h, b) => b !== d);
        if (y.length === 0) return nt(r);
        let f = y.reduce((h, b) => h * b, 1), p = n[d], g = new Int32Array(f);
        for (let h = 0; h < f; h++) {
          let b = 1 / 0, A = 1 / 0, S = 0;
          for (let D = 0; D < p; D++) {
            let w = R(h, d, D, n), x = $(w, n), I = m[x * 2], z = m[x * 2 + 1];
            !tr(I, z) && Fr(I, z, b, A) < 0 && (b = I, A = z, S = D);
          }
          g[h] = S;
        }
        return N.fromData(g, y, "int32");
      }
      if (t === void 0) {
        let m = 1 / 0, d = -1;
        for (let y = 0; y < r.size; y++) {
          let f = Number(a[y]);
          !isNaN(f) && f < m && (m = f, d = y);
        }
        return d;
      }
      let i = t;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let s = Array.from(n).filter((m, d) => d !== i);
      if (s.length === 0) return nt(r);
      let u = s.reduce((m, d) => m * d, 1), c = n[i], l = new Int32Array(u);
      for (let m = 0; m < u; m++) {
        let d = 1 / 0, y = 0;
        for (let f = 0; f < c; f++) {
          let p = R(m, i, f, n), g = $(p, n), h = Number(a[g]);
          !isNaN(h) && h < d && (d = h, y = f);
        }
        l[m] = y;
      }
      return N.fromData(l, s, "int32");
    }
    function ot(r, t) {
      let e = r.dtype, n = r.shape, o = n.length, a = r.data;
      if (v(e)) {
        let m = a;
        if (t === void 0) {
          let h = -1 / 0, b = -1 / 0, A = -1;
          for (let S = 0; S < r.size; S++) {
            let D = m[S * 2], w = m[S * 2 + 1];
            !tr(D, w) && Fr(D, w, h, b) > 0 && (h = D, b = w, A = S);
          }
          return A;
        }
        let d = t;
        if (d < 0 && (d = o + d), d < 0 || d >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
        let y = Array.from(n).filter((h, b) => b !== d);
        if (y.length === 0) return ot(r);
        let f = y.reduce((h, b) => h * b, 1), p = n[d], g = new Int32Array(f);
        for (let h = 0; h < f; h++) {
          let b = -1 / 0, A = -1 / 0, S = 0;
          for (let D = 0; D < p; D++) {
            let w = R(h, d, D, n), x = $(w, n), I = m[x * 2], z = m[x * 2 + 1];
            !tr(I, z) && Fr(I, z, b, A) > 0 && (b = I, A = z, S = D);
          }
          g[h] = S;
        }
        return N.fromData(g, y, "int32");
      }
      if (t === void 0) {
        let m = -1 / 0, d = -1;
        for (let y = 0; y < r.size; y++) {
          let f = Number(a[y]);
          !isNaN(f) && f > m && (m = f, d = y);
        }
        return d;
      }
      let i = t;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let s = Array.from(n).filter((m, d) => d !== i);
      if (s.length === 0) return ot(r);
      let u = s.reduce((m, d) => m * d, 1), c = n[i], l = new Int32Array(u);
      for (let m = 0; m < u; m++) {
        let d = -1 / 0, y = 0;
        for (let f = 0; f < c; f++) {
          let p = R(m, i, f, n), g = $(p, n), h = Number(a[g]);
          !isNaN(h) && h > d && (d = h, y = f);
        }
        l[m] = y;
      }
      return N.fromData(l, s, "int32");
    }
    function be(r, t) {
      let e = r.dtype, n = r.shape, o = n.length, a = r.data;
      if (v(e)) {
        let y = a, f = r.size;
        if (t === void 0) {
          let x = N.zeros([f], e), I = x.data, z = 0, F = 0;
          for (let M = 0; M < f; M++) {
            let T = y[M * 2], O = y[M * 2 + 1];
            tr(T, O) || (z += T, F += O), I[M * 2] = z, I[M * 2 + 1] = F;
          }
          return x;
        }
        let p = t;
        if (p < 0 && (p = o + p), p < 0 || p >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
        let g = N.zeros([...n], e), h = g.data, b = n[p], A = [], S = 1;
        for (let x = o - 1; x >= 0; x--) A.unshift(S), S *= n[x];
        let D = r.size, w = A[p];
        for (let x = 0; x < D; x++) {
          let I = y[x * 2], z = y[x * 2 + 1], F = Math.floor(x / w) % b, M = tr(I, z);
          F === 0 ? (h[x * 2] = M ? 0 : I, h[x * 2 + 1] = M ? 0 : z) : (h[x * 2] = h[(x - w) * 2] + (M ? 0 : I), h[x * 2 + 1] = h[(x - w) * 2 + 1] + (M ? 0 : z));
        }
        return g;
      }
      if (t === void 0) {
        let y = r.size, f = new Float64Array(y), p = 0;
        for (let g = 0; g < y; g++) {
          let h = Number(a[g]);
          isNaN(h) || (p += h), f[g] = p;
        }
        return N.fromData(f, [y], "float64");
      }
      let i = t;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let s = new Float64Array(r.size), u = n[i], c = [], l = 1;
      for (let y = o - 1; y >= 0; y--) c.unshift(l), l *= n[y];
      let m = r.size, d = c[i];
      for (let y = 0; y < m; y++) {
        let f = Number(a[y]);
        Math.floor(y / d) % u === 0 ? s[y] = isNaN(f) ? 0 : f : s[y] = s[y - d] + (isNaN(f) ? 0 : f);
      }
      return N.fromData(s, [...n], "float64");
    }
    function he(r, t) {
      let e = r.dtype, n = r.shape, o = n.length, a = r.data;
      if (v(e)) {
        let y = a, f = r.size;
        if (t === void 0) {
          let x = N.zeros([f], e), I = x.data, z = 1, F = 0;
          for (let M = 0; M < f; M++) {
            let T = y[M * 2], O = y[M * 2 + 1];
            if (!tr(T, O)) {
              let C = z * T - F * O, q = z * O + F * T;
              z = C, F = q;
            }
            I[M * 2] = z, I[M * 2 + 1] = F;
          }
          return x;
        }
        let p = t;
        if (p < 0 && (p = o + p), p < 0 || p >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
        let g = N.zeros([...n], e), h = g.data, b = n[p], A = [], S = 1;
        for (let x = o - 1; x >= 0; x--) A.unshift(S), S *= n[x];
        let D = r.size, w = A[p];
        for (let x = 0; x < D; x++) {
          let I = y[x * 2], z = y[x * 2 + 1], F = Math.floor(x / w) % b, M = tr(I, z);
          if (F === 0) h[x * 2] = M ? 1 : I, h[x * 2 + 1] = M ? 0 : z;
          else {
            let T = h[(x - w) * 2], O = h[(x - w) * 2 + 1];
            M ? (h[x * 2] = T, h[x * 2 + 1] = O) : (h[x * 2] = T * I - O * z, h[x * 2 + 1] = T * z + O * I);
          }
        }
        return g;
      }
      if (t === void 0) {
        let y = r.size, f = new Float64Array(y), p = 1;
        for (let g = 0; g < y; g++) {
          let h = Number(a[g]);
          isNaN(h) || (p *= h), f[g] = p;
        }
        return N.fromData(f, [y], "float64");
      }
      let i = t;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let s = new Float64Array(r.size), u = n[i], c = [], l = 1;
      for (let y = o - 1; y >= 0; y--) c.unshift(l), l *= n[y];
      let m = r.size, d = c[i];
      for (let y = 0; y < m; y++) {
        let f = Number(a[y]);
        Math.floor(y / d) % u === 0 ? s[y] = isNaN(f) ? 1 : f : s[y] = s[y - d] * (isNaN(f) ? 1 : f);
      }
      return N.fromData(s, [...n], "float64");
    }
    function Mt(r, t, e = false) {
      U(r.dtype, "nanmedian", "Complex numbers are not orderable.");
      let n = r.shape, o = n.length, a = r.data;
      if (t === void 0) {
        let d = [];
        for (let p = 0; p < r.size; p++) {
          let g = Number(a[p]);
          isNaN(g) || d.push(g);
        }
        if (d.length === 0) return NaN;
        d.sort((p, g) => p - g);
        let y = d.length, f = Math.floor(y / 2);
        return y % 2 === 0 ? (d[f - 1] + d[f]) / 2 : d[f];
      }
      let i = t;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let s = Array.from(n).filter((d, y) => y !== i);
      if (s.length === 0) return Mt(r);
      let u = s.reduce((d, y) => d * y, 1), c = n[i], l = new Float64Array(u);
      for (let d = 0; d < u; d++) {
        let y = [];
        for (let g = 0; g < c; g++) {
          let h = R(d, i, g, n), b = $(h, n), A = Number(a[b]);
          isNaN(A) || y.push(A);
        }
        if (y.length === 0) {
          l[d] = NaN;
          continue;
        }
        y.sort((g, h) => g - h);
        let f = y.length, p = Math.floor(f / 2);
        f % 2 === 0 ? l[d] = (y[p - 1] + y[p]) / 2 : l[d] = y[p];
      }
      let m = N.fromData(l, s, "float64");
      if (e) {
        let d = [...n];
        return d[i] = 1, N.fromData(l, d, "float64");
      }
      return m;
    }
    function at(r, t, e, n = false) {
      if (U(r.dtype, "nanquantile", "Complex numbers are not orderable."), t < 0 || t > 1) throw new Error("Quantile must be between 0 and 1");
      let o = r.shape, a = o.length, i = r.data;
      if (e === void 0) {
        let y = [];
        for (let A = 0; A < r.size; A++) {
          let S = Number(i[A]);
          isNaN(S) || y.push(S);
        }
        if (y.length === 0) return NaN;
        y.sort((A, S) => A - S);
        let f = y.length, p = t * (f - 1), g = Math.floor(p), h = Math.ceil(p);
        if (g === h) return y[g];
        let b = p - g;
        return y[g] * (1 - b) + y[h] * b;
      }
      let s = e;
      if (s < 0 && (s = a + s), s < 0 || s >= a) throw new Error(`axis ${e} is out of bounds for array of dimension ${a}`);
      let u = Array.from(o).filter((y, f) => f !== s);
      if (u.length === 0) return at(r, t);
      let c = u.reduce((y, f) => y * f, 1), l = o[s], m = new Float64Array(c);
      for (let y = 0; y < c; y++) {
        let f = [];
        for (let A = 0; A < l; A++) {
          let S = R(y, s, A, o), D = $(S, o), w = Number(i[D]);
          isNaN(w) || f.push(w);
        }
        if (f.length === 0) {
          m[y] = NaN;
          continue;
        }
        f.sort((A, S) => A - S);
        let p = f.length, g = t * (p - 1), h = Math.floor(g), b = Math.ceil(g);
        if (h === b) m[y] = f[h];
        else {
          let A = g - h;
          m[y] = f[h] * (1 - A) + f[b] * A;
        }
      }
      let d = N.fromData(m, u, "float64");
      if (n) {
        let y = [...o];
        return y[s] = 1, N.fromData(m, y, "float64");
      }
      return d;
    }
    function Se(r, t, e, n = false) {
      return at(r, t / 100, e, n);
    }
    function K(r, t) {
      let e = r.size, n = r.dtype, o = t.indexOf(-1), a;
      if (o !== -1) {
        let c = t.reduce((m, d, y) => y === o ? m : m * d, 1), l = e / c;
        if (!Number.isInteger(l)) throw new Error(`cannot reshape array of size ${e} into shape ${JSON.stringify(t)}`);
        a = t.map((m, d) => d === o ? l : m);
      } else a = t;
      if (a.reduce((c, l) => c * l, 1) !== e) throw new Error(`cannot reshape array of size ${e} into shape ${JSON.stringify(a)}`);
      if (r.isCContiguous) {
        let c = r.data;
        return N.fromData(c, a, n, ar(a), 0);
      }
      let u = r.copy().data;
      return N.fromData(u, a, n, ar(a), 0);
    }
    function Cr(r) {
      let t = r.size, e = r.dtype, n = P(e);
      if (!n) throw new Error(`Cannot flatten array with dtype ${e}`);
      if (r.isCContiguous) {
        let s = r.data.slice(r.offset, r.offset + t);
        return N.fromData(s, [t], e, [1], 0);
      }
      let o = new n(t), a = B(e);
      for (let i = 0; i < t; i++) {
        let s = r.iget(i);
        o[i] = s;
      }
      return N.fromData(o, [t], e, [1], 0);
    }
    function Gr(r) {
      let t = r.size, e = r.dtype;
      if (r.isCContiguous) {
        let n = r.data;
        return N.fromData(n, [t], e, [1], 0);
      }
      return Cr(r);
    }
    function it(r, t) {
      let e = r.shape, n = e.length, o = r.strides, a = r.data, i = r.dtype, s;
      if (t === void 0) s = Array.from({ length: n }, (m, d) => n - 1 - d);
      else {
        if (t.length !== n) throw new Error(`axes must have length ${n}, got ${t.length}`);
        let m = /* @__PURE__ */ new Set();
        for (let d of t) {
          let y = d < 0 ? n + d : d;
          if (y < 0 || y >= n) throw new Error(`axis ${d} is out of bounds for array of dimension ${n}`);
          if (m.has(y)) throw new Error("repeated axis in transpose");
          m.add(y);
        }
        s = t.map((d) => d < 0 ? n + d : d);
      }
      let u = s.map((m) => e[m]), c = Array.from(o), l = s.map((m) => c[m]);
      return N.fromData(a, u, i, l, r.offset);
    }
    function De(r, t) {
      let e = r.shape, n = e.length, o = r.strides, a = r.data, i = r.dtype;
      if (t === void 0) {
        let s = [], u = [];
        for (let c = 0; c < n; c++) e[c] !== 1 && (s.push(e[c]), u.push(o[c]));
        return s.length === 0 && (s.push(1), u.push(1)), N.fromData(a, s, i, u, r.offset);
      } else {
        let s = t < 0 ? n + t : t;
        if (s < 0 || s >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
        if (e[s] !== 1) throw new Error(`cannot select an axis which has size not equal to one (axis ${t} has size ${e[s]})`);
        let u = [], c = [];
        for (let l = 0; l < n; l++) l !== s && (u.push(e[l]), c.push(o[l]));
        return N.fromData(a, u, i, c, r.offset);
      }
    }
    function st(r, t) {
      let e = r.shape, n = e.length, o = r.strides, a = r.data, i = r.dtype, s = t;
      if (s < 0 && (s = n + t + 1), s < 0 || s > n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n + 1}`);
      let u = [...Array.from(e)];
      u.splice(s, 0, 1);
      let c = [...Array.from(o)], l = s < n ? o[s] * (e[s] || 1) : 1;
      return c.splice(s, 0, l), N.fromData(a, u, i, c, r.offset);
    }
    function Vo(r, t, e) {
      let n = r.shape, o = n.length, a = r.strides, i = r.data, s = r.dtype, u = t < 0 ? o + t : t, c = e < 0 ? o + e : e;
      if (u < 0 || u >= o) throw new Error(`axis1 ${t} is out of bounds for array of dimension ${o}`);
      if (c < 0 || c >= o) throw new Error(`axis2 ${e} is out of bounds for array of dimension ${o}`);
      if (u === c) return N.fromData(i, Array.from(n), s, Array.from(a), r.offset);
      let l = Array.from(n), m = Array.from(a);
      return [l[u], l[c]] = [l[c], l[u]], [m[u], m[c]] = [m[c], m[u]], N.fromData(i, l, s, m, r.offset);
    }
    function Ne(r, t, e) {
      let n = r.ndim, o = Array.isArray(t) ? t : [t], a = Array.isArray(e) ? e : [e];
      if (o.length !== a.length) throw new Error("source and destination must have the same number of elements");
      let i = o.map((c) => {
        let l = c < 0 ? n + c : c;
        if (l < 0 || l >= n) throw new Error(`source axis ${c} is out of bounds for array of dimension ${n}`);
        return l;
      }), s = a.map((c) => {
        let l = c < 0 ? n + c : c;
        if (l < 0 || l >= n) throw new Error(`destination axis ${c} is out of bounds for array of dimension ${n}`);
        return l;
      });
      if (new Set(i).size !== i.length) throw new Error("repeated axis in source");
      if (new Set(s).size !== s.length) throw new Error("repeated axis in destination");
      let u = [];
      for (let c = 0; c < n; c++) i.includes(c) || u.push(c);
      for (let c = 0; c < i.length; c++) {
        let l = s[c];
        u.splice(l, 0, i[c]);
      }
      return it(r, u);
    }
    function vr(r, t = 0) {
      if (r.length === 0) throw new Error("need at least one array to concatenate");
      if (r.length === 1) return r[0].copy();
      let e = r[0], n = e.ndim, o = e.dtype, a = t < 0 ? n + t : t;
      if (a < 0 || a >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
      for (let y = 1; y < r.length; y++) {
        let f = r[y];
        if (f.ndim !== n) throw new Error("all the input arrays must have same number of dimensions");
        for (let p = 0; p < n; p++) if (p !== a && f.shape[p] !== e.shape[p]) throw new Error("all the input array dimensions except for the concatenation axis must match exactly");
      }
      let i = Array.from(e.shape), s = e.shape[a];
      for (let y = 1; y < r.length; y++) s += r[y].shape[a];
      i[a] = s;
      let u = i.reduce((y, f) => y * f, 1), c = P(o);
      if (!c) throw new Error(`Cannot concatenate arrays with dtype ${o}`);
      let l = new c(u), m = ar(i), d = 0;
      for (let y of r) {
        let f = y.shape[a];
        My(y, l, i, m, a, d, o), d += f;
      }
      return N.fromData(l, i, o);
    }
    function My(r, t, e, n, o, a, i) {
      let s = r.shape, u = s.length, c = r.size, l = i === "int64" || i === "uint64";
      if (o === 0 && r.isCContiguous && u > 0) {
        let y = a * n[0], f = r.data, p = r.offset, g = p + c;
        t.set(f.subarray(p, g), y);
        return;
      }
      if (o === 1 && u === 2 && r.isCContiguous) {
        let y = s[0], f = s[1], p = e[1], g = r.data, h = r.offset;
        for (let b = 0; b < y; b++) {
          let A = h + b * f, S = b * p + a;
          t.set(g.subarray(A, A + f), S);
        }
        return;
      }
      let m = new Array(u).fill(0), d = a * n[o];
      for (let y = 0; y < c; y++) {
        let f = r.iget(y), p = d;
        for (let g = 0; g < u; g++) p += m[g] * n[g];
        t[p] = f;
        for (let g = u - 1; g >= 0 && (m[g]++, !(m[g] < s[g])); g--) m[g] = 0;
      }
    }
    function jo(r, t = 0) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let e = r[0], n = e.shape, o = e.ndim, a = t < 0 ? o + 1 + t : t;
      if (a < 0 || a > o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o + 1}`);
      for (let s = 1; s < r.length; s++) {
        let u = r[s];
        if (u.ndim !== o) throw new Error("all input arrays must have the same shape");
        for (let c = 0; c < o; c++) if (u.shape[c] !== n[c]) throw new Error("all input arrays must have the same shape");
      }
      let i = r.map((s) => st(s, a));
      return vr(i, a);
    }
    function Po(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let t = r.map((e) => e.ndim === 1 ? K(e, [1, e.shape[0]]) : e);
      return vr(t, 0);
    }
    function xe(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      return r.every((e) => e.ndim === 1) ? vr(r, 0) : vr(r, 1);
    }
    function Lo(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let t = r.map((e) => e.ndim === 1 ? K(st(K(e, [1, e.shape[0]]), 2), [1, e.shape[0], 1]) : e.ndim === 2 ? st(e, 2) : e);
      return vr(t, 2);
    }
    function Go(r, t, e = 0) {
      let n = r.shape, o = n.length, a = e < 0 ? o + e : e;
      if (a < 0 || a >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let i = n[a], s;
      if (typeof t == "number") {
        if (i % t !== 0) throw new Error("array split does not result in an equal division");
        let u = i / t;
        s = [];
        for (let c = 1; c < t; c++) s.push(c * u);
      } else s = t;
      return Wo(r, s, a);
    }
    function ut(r, t, e = 0) {
      let n = r.shape, o = n.length, a = e < 0 ? o + e : e;
      if (a < 0 || a >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let i = n[a], s;
      if (typeof t == "number") {
        let u = t, c = Math.floor(i / u), l = i % u;
        s = [];
        let m = 0;
        for (let d = 0; d < u - 1; d++) m += c + (d < l ? 1 : 0), s.push(m);
      } else s = t;
      return Wo(r, s, a);
    }
    function Wo(r, t, e) {
      let n = r.shape, o = n[e], a = [0, ...t, o], i = [];
      for (let s = 0; s < a.length - 1; s++) {
        let u = a[s], c = a[s + 1];
        if (u > c) throw new Error("split indices must be in ascending order");
        let l = Array.from(n);
        l[e] = c - u;
        let m = r.offset + u * r.strides[e];
        i.push(N.fromData(r.data, l, r.dtype, Array.from(r.strides), m));
      }
      return i;
    }
    function Zo(r, t) {
      if (r.ndim < 2) throw new Error("vsplit only works on arrays of 2 or more dimensions");
      return ut(r, t, 0);
    }
    function Yo(r, t) {
      if (r.ndim < 1) throw new Error("hsplit only works on arrays of 1 or more dimensions");
      let e = r.ndim === 1 ? 0 : 1;
      return ut(r, t, e);
    }
    function Ho(r, t) {
      let e = r.shape, n = e.length, o = r.dtype, a = Array.isArray(t) ? t : [t], i = Math.max(n, a.length), s = new Array(i).fill(1), u = new Array(i).fill(1);
      for (let b = 0; b < n; b++) s[i - n + b] = e[b];
      for (let b = 0; b < a.length; b++) u[i - a.length + b] = a[b];
      let c = s.map((b, A) => b * u[A]), l = c.reduce((b, A) => b * A, 1), m = P(o);
      if (!m) throw new Error(`Cannot tile array with dtype ${o}`);
      let d = new m(l), y = ar(c), f = r;
      n < i && (f = K(r, s));
      let p = o === "int64" || o === "uint64", g = f.strides, h = new Array(i).fill(0);
      for (let b = 0; b < l; b++) {
        let A = f.offset;
        for (let w = 0; w < i; w++) {
          let x = h[w] % s[w];
          A += x * g[w];
        }
        let S = f.data[A], D = 0;
        for (let w = 0; w < i; w++) D += h[w] * y[w];
        d[D] = S;
        for (let w = i - 1; w >= 0 && (h[w]++, !(h[w] < c[w])); w--) h[w] = 0;
      }
      return N.fromData(d, c, o);
    }
    function Xo(r, t, e) {
      let n = r.shape, o = n.length, a = r.dtype, i = r.size;
      if (e === void 0) {
        let b = i, A = Array.isArray(t) ? t : new Array(b).fill(t);
        if (A.length !== b) throw new Error(`operands could not be broadcast together with shape (${b},) (${A.length},)`);
        let S = A.reduce((I, z) => I + z, 0), D = P(a);
        if (!D) throw new Error(`Cannot repeat array with dtype ${a}`);
        let w = new D(S), x = 0;
        for (let I = 0; I < b; I++) {
          let z = r.iget(I), F = A[I];
          for (let M = 0; M < F; M++) w[x++] = z;
        }
        return N.fromData(w, [S], a);
      }
      let s = e < 0 ? o + e : e;
      if (s < 0 || s >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let u = n[s], c = Array.isArray(t) ? t : new Array(u).fill(t);
      if (c.length !== u) throw new Error(`operands could not be broadcast together with shape (${u},) (${c.length},)`);
      let l = Array.from(n);
      l[s] = c.reduce((b, A) => b + A, 0);
      let m = l.reduce((b, A) => b * A, 1), d = P(a);
      if (!d) throw new Error(`Cannot repeat array with dtype ${a}`);
      let y = new d(m), f = ar(l), p = new Array(o).fill(0), g = a === "int64" || a === "uint64", h = [0];
      for (let b = 0; b < u; b++) h.push(h[b] + c[b]);
      for (let b = 0; b < i; b++) {
        let A = r.iget(b), S = p[s], D = c[S], w = 0;
        for (let z = 0; z < o; z++) z !== s && (w += p[z] * f[z]);
        let x = f[s], I = h[S];
        for (let z = 0; z < D; z++) {
          let F = w + (I + z) * x;
          y[F] = A;
        }
        for (let z = o - 1; z >= 0 && (p[z]++, !(p[z] < n[z])); z--) p[z] = 0;
      }
      return N.fromData(y, l, a);
    }
    function Jo(r, t) {
      let e = r.shape, n = e.length, o = r.dtype, a = r.size, i;
      if (t === void 0) i = new Set(Array.from({ length: n }, (d, y) => y));
      else if (typeof t == "number") {
        let d = t < 0 ? n + t : t;
        if (d < 0 || d >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
        i = /* @__PURE__ */ new Set([d]);
      } else i = new Set(t.map((d) => {
        let y = d < 0 ? n + d : d;
        if (y < 0 || y >= n) throw new Error(`axis ${d} is out of bounds for array of dimension ${n}`);
        return y;
      }));
      let s = P(o);
      if (!s) throw new Error(`Cannot flip array with dtype ${o}`);
      let u = new s(a), c = B(o);
      if (n === 1 && r.isCContiguous) {
        let d = r.data, y = r.offset;
        for (let f = 0; f < a; f++) u[f] = d[y + a - 1 - f];
        return N.fromData(u, [...e], o);
      }
      if (n === 2 && r.isCContiguous) {
        let d = e[0], y = e[1], f = r.data, p = r.offset;
        if (i.size === 2) {
          for (let g = 0; g < a; g++) u[g] = f[p + a - 1 - g];
          return N.fromData(u, [...e], o);
        }
        if (i.size === 1) {
          if (i.has(0)) {
            for (let g = 0; g < d; g++) {
              let h = p + (d - 1 - g) * y, b = g * y;
              for (let A = 0; A < y; A++) u[b + A] = f[h + A];
            }
            return N.fromData(u, [...e], o);
          } else if (i.has(1)) {
            for (let g = 0; g < d; g++) {
              let h = p + g * y, b = g * y;
              for (let A = 0; A < y; A++) u[b + A] = f[h + y - 1 - A];
            }
            return N.fromData(u, [...e], o);
          }
        }
      }
      let l = new Array(n), m = new Array(n).fill(0);
      for (let d = 0; d < a; d++) {
        for (let p = 0; p < n; p++) l[p] = i.has(p) ? e[p] - 1 - m[p] : m[p];
        let y = r.offset;
        for (let p = 0; p < n; p++) y += l[p] * r.strides[p];
        let f = r.data[y];
        u[d] = f;
        for (let p = n - 1; p >= 0 && (m[p]++, !(m[p] < e[p])); p--) m[p] = 0;
      }
      return N.fromData(u, [...e], o);
    }
    function Qo(r, t = 1, e = [0, 1]) {
      let n = r.shape, o = n.length, a = r.dtype;
      if (o < 2) throw new Error("Input must be at least 2-D");
      let i = e[0] < 0 ? o + e[0] : e[0], s = e[1] < 0 ? o + e[1] : e[1];
      if (i < 0 || i >= o || s < 0 || s >= o) throw new Error(`Axes are out of bounds for array of dimension ${o}`);
      if (i === s) throw new Error("Axes must be different");
      if (t = (t % 4 + 4) % 4, t === 0) return r.copy();
      let u = P(a);
      if (!u) throw new Error(`Cannot rotate array with dtype ${a}`);
      let c = [...n];
      (t === 1 || t === 3) && ([c[i], c[s]] = [c[s], c[i]]);
      let l = c.reduce((g, h) => g * h, 1), m = new u(l), d = ar(c), y = B(a), f = new Array(o).fill(0), p = new Array(o);
      for (let g = 0; g < r.size; g++) {
        for (let D = 0; D < o; D++) p[D] = f[D];
        let h, b;
        t === 1 ? (h = n[s] - 1 - f[s], b = f[i]) : t === 2 ? (h = n[i] - 1 - f[i], b = n[s] - 1 - f[s], p[i] = h, p[s] = b) : (h = f[s], b = n[i] - 1 - f[i]), t !== 2 && (p[i] = h, p[s] = b);
        let A = 0;
        for (let D = 0; D < o; D++) A += p[D] * d[D];
        let S = r.iget(g);
        m[A] = S;
        for (let D = o - 1; D >= 0 && (f[D]++, !(f[D] < n[D])); D--) f[D] = 0;
      }
      return N.fromData(m, c, a);
    }
    function Ko(r, t, e) {
      let n = r.shape, o = n.length, a = r.dtype, i = r.size;
      if (e === void 0) {
        let f = Array.isArray(t) ? t.reduce((A, S) => A + S, 0) : t, p = Cr(r), g = P(a);
        if (!g) throw new Error(`Cannot roll array with dtype ${a}`);
        let h = new g(i), b = B(a);
        for (let A = 0; A < i; A++) {
          let S = ((A - f) % i + i) % i, D = p.iget(S);
          h[A] = D;
        }
        return N.fromData(h, [...n], a);
      }
      let s = Array.isArray(t) ? t : [t], u = Array.isArray(e) ? e : [e];
      if (s.length !== u.length) throw new Error("shift and axis must have the same length");
      let c = u.map((f) => {
        let p = f < 0 ? o + f : f;
        if (p < 0 || p >= o) throw new Error(`axis ${f} is out of bounds for array of dimension ${o}`);
        return p;
      }), l = P(a);
      if (!l) throw new Error(`Cannot roll array with dtype ${a}`);
      let m = new l(i), d = B(a), y = new Array(o).fill(0);
      for (let f = 0; f < i; f++) {
        let p = [...y];
        for (let b = 0; b < c.length; b++) {
          let A = c[b], S = n[A], D = s[b];
          p[A] = ((p[A] - D) % S + S) % S;
        }
        let g = r.offset;
        for (let b = 0; b < o; b++) g += p[b] * r.strides[b];
        let h = r.data[g];
        m[f] = h;
        for (let b = o - 1; b >= 0 && (y[b]++, !(y[b] < n[b])); b--) y[b] = 0;
      }
      return N.fromData(m, [...n], a);
    }
    function ra(r, t, e = 0) {
      let n = r.ndim, o = t < 0 ? n + t : t;
      if (o < 0 || o >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
      let a = e < 0 ? n + e : e;
      if (a < 0 || a > n) throw new Error(`start ${e} is out of bounds`);
      return o < a && a--, o === a ? N.fromData(r.data, Array.from(r.shape), r.dtype, Array.from(r.strides), r.offset) : Ne(r, o, a);
    }
    function ta(r, t) {
      if (r.ndim < 3) throw new Error("dsplit only works on arrays of 3 or more dimensions");
      return ut(r, t, 2);
    }
    function ea(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let t = r.map((e) => e.ndim === 1 ? K(e, [e.shape[0], 1]) : e);
      return xe(t);
    }
    function na(r, t) {
      let e = r.dtype, n = t.reduce((u, c) => u * c, 1), o = r.size, a = P(e);
      if (!a) throw new Error(`Cannot resize array with dtype ${e}`);
      let i = new a(n), s = B(e);
      for (let u = 0; u < n; u++) {
        let c = u % o, l = r.iget(c);
        i[u] = l;
      }
      return N.fromData(i, t, e);
    }
    function oa(r) {
      return r.map((t) => t.ndim === 0 ? K(t, [1]) : t);
    }
    function aa(r) {
      return r.map((t) => t.ndim === 0 ? K(t, [1, 1]) : t.ndim === 1 ? K(t, [1, t.shape[0]]) : t);
    }
    function sa(r) {
      return r.map((t) => t.ndim === 0 ? K(t, [1, 1, 1]) : t.ndim === 1 ? K(t, [1, t.shape[0], 1]) : t.ndim === 2 ? K(t, [t.shape[0], t.shape[1], 1]) : t);
    }
    function ia(r, t = 0) {
      let e = r.shape, n = e.length, o = t < 0 ? n + t : t;
      if (o < 0 || o >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
      let a = e[o], i = [];
      for (let s = 0; s < a; s++) {
        let u = [];
        for (let m = 0; m < n; m++) m === o ? u.push({ start: s, stop: s + 1, step: 1 }) : u.push({ start: 0, stop: e[m], step: 1 });
        let c = Fy(r, u), l = De(c, o);
        i.push(l);
      }
      return i;
    }
    function ua(r, t = 1) {
      if (r.length === 0) throw new Error("need at least one array to block");
      return r.length === 1 ? r[0].copy() : vr(r, -1);
    }
    function Fy(r, t) {
      let e = r.shape, n = r.strides, o = r.offset, a = r.dtype, i = r.data, s = [], u = [];
      for (let c = 0; c < e.length; c++) {
        let l = t[c], { start: m, stop: d, step: y } = l, f = Math.ceil((d - m) / y);
        s.push(f), u.push(n[c] * y), o += m * n[c];
      }
      return N.fromData(i, s, a, u, o);
    }
    function Sr(r, t) {
      if (r instanceof E || t instanceof E) {
        let e = r instanceof E ? r : new E(Number(r), 0), n = t instanceof E ? t : new E(Number(t), 0);
        return e.mul(n);
      }
      return typeof r == "bigint" && typeof t == "bigint" ? Number(r * t) : Number(r) * Number(t);
    }
    function vy(r, t, e, n, o, a, i, s, u, c, l, m, d, y) {
      if (m === 0) for (let h = 0; h < n * o; h++) d[h] = 0;
      else if (m !== 1) for (let h = 0; h < n * o; h++) d[h] = (d[h] ?? 0) * m;
      let f = r === "row-major", p = t === "transpose", g = e === "transpose";
      if (f && !p && !g) for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[h * u + S] ?? 0) * (c[S * l + b] ?? 0);
        d[h * y + b] = (d[h * y + b] ?? 0) + i * A;
      }
      else if (f && p && !g) for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[S * u + h] ?? 0) * (c[S * l + b] ?? 0);
        d[h * y + b] = (d[h * y + b] ?? 0) + i * A;
      }
      else if (f && !p && g) for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[h * u + S] ?? 0) * (c[b * l + S] ?? 0);
        d[h * y + b] = (d[h * y + b] ?? 0) + i * A;
      }
      else if (f && p && g) for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[S * u + h] ?? 0) * (c[b * l + S] ?? 0);
        d[h * y + b] = (d[h * y + b] ?? 0) + i * A;
      }
      else if (!f && !p && !g) for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[S * u + h] ?? 0) * (c[b * l + S] ?? 0);
        d[b * y + h] = (d[b * y + h] ?? 0) + i * A;
      }
      else if (!f && p && !g) for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[h * u + S] ?? 0) * (c[b * l + S] ?? 0);
        d[b * y + h] = (d[b * y + h] ?? 0) + i * A;
      }
      else if (!f && !p && g) for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[S * u + h] ?? 0) * (c[S * l + b] ?? 0);
        d[b * y + h] = (d[b * y + h] ?? 0) + i * A;
      }
      else for (let h = 0; h < n; h++) for (let b = 0; b < o; b++) {
        let A = 0;
        for (let S = 0; S < a; S++) A += (s[h * u + S] ?? 0) * (c[S * l + b] ?? 0);
        d[b * y + h] = (d[b * y + h] ?? 0) + i * A;
      }
    }
    function Zr(r, t) {
      let e = r.ndim, n = t.ndim, o = v(r.dtype) || v(t.dtype);
      if (e === 0 || n === 0) {
        let a = e === 0 ? r.get() : null, i = n === 0 ? t.get() : null;
        if (e === 0 && n === 0) return Sr(a, i);
        if (e === 0) {
          let s = W(r.dtype, t.dtype), u = N.zeros([...t.shape], s), c = (l, m) => {
            let d = new Array(m.length), y = l;
            for (let f = m.length - 1; f >= 0; f--) d[f] = y % m[f], y = Math.floor(y / m[f]);
            return d;
          };
          for (let l = 0; l < t.size; l++) {
            let m = c(l, t.shape), d = t.get(...m);
            u.set(m, Sr(a, d));
          }
          return u;
        } else {
          let s = W(r.dtype, t.dtype), u = N.zeros([...r.shape], s), c = (l, m) => {
            let d = new Array(m.length), y = l;
            for (let f = m.length - 1; f >= 0; f--) d[f] = y % m[f], y = Math.floor(y / m[f]);
            return d;
          };
          for (let l = 0; l < r.size; l++) {
            let m = c(l, r.shape), d = r.get(...m);
            u.set(m, Sr(d, i));
          }
          return u;
        }
      }
      if (e === 1 && n === 1) {
        if (r.shape[0] !== t.shape[0]) throw new Error(`dot: incompatible shapes (${r.shape[0]},) and (${t.shape[0]},)`);
        let a = r.shape[0];
        if (o) {
          let s = 0, u = 0;
          for (let c = 0; c < a; c++) {
            let l = r.get(c), m = t.get(c), d = Sr(l, m);
            d instanceof E ? (s += d.re, u += d.im) : s += d;
          }
          return new E(s, u);
        }
        let i = 0;
        for (let s = 0; s < a; s++) {
          let u = r.get(s), c = t.get(s);
          typeof u == "bigint" && typeof c == "bigint" ? i = Number(i) + Number(u * c) : i += Number(u) * Number(c);
        }
        return i;
      }
      if (e === 2 && n === 2) return cr(r, t);
      if (e === 2 && n === 1) {
        let [a, i] = r.shape, s = t.shape[0];
        if (i !== s) throw new Error(`dot: incompatible shapes (${a},${i}) and (${s},)`);
        let u = W(r.dtype, t.dtype), c = N.zeros([a], u);
        if (o) for (let l = 0; l < a; l++) {
          let m = 0, d = 0;
          for (let y = 0; y < i; y++) {
            let f = r.get(l, y), p = t.get(y), g = f instanceof E ? f : new E(Number(f), 0), h = p instanceof E ? p : new E(Number(p), 0);
            m += g.re * h.re - g.im * h.im, d += g.re * h.im + g.im * h.re;
          }
          c.set([l], new E(m, d));
        }
        else for (let l = 0; l < a; l++) {
          let m = 0;
          for (let d = 0; d < i; d++) {
            let y = r.get(l, d), f = t.get(d);
            typeof y == "bigint" && typeof f == "bigint" ? m = Number(m) + Number(y * f) : m += Number(y) * Number(f);
          }
          c.set([l], m);
        }
        return c;
      }
      if (e === 1 && n === 2) {
        let a = r.shape[0], [i, s] = t.shape;
        if (a !== i) throw new Error(`dot: incompatible shapes (${a},) and (${i},${s})`);
        let u = W(r.dtype, t.dtype), c = N.zeros([s], u);
        if (o) for (let l = 0; l < s; l++) {
          let m = 0, d = 0;
          for (let y = 0; y < a; y++) {
            let f = r.get(y), p = t.get(y, l), g = f instanceof E ? f : new E(Number(f), 0), h = p instanceof E ? p : new E(Number(p), 0);
            m += g.re * h.re - g.im * h.im, d += g.re * h.im + g.im * h.re;
          }
          c.set([l], new E(m, d));
        }
        else for (let l = 0; l < s; l++) {
          let m = 0;
          for (let d = 0; d < a; d++) {
            let y = r.get(d), f = t.get(d, l);
            typeof y == "bigint" && typeof f == "bigint" ? m = Number(m) + Number(y * f) : m += Number(y) * Number(f);
          }
          c.set([l], m);
        }
        return c;
      }
      if (e > 2 && n === 1) {
        let a = r.shape[e - 1], i = t.shape[0];
        if (a !== i) throw new Error(`dot: incompatible shapes ${JSON.stringify(r.shape)} and (${i},)`);
        let s = [...r.shape.slice(0, -1)], u = W(r.dtype, t.dtype), c = N.zeros(s, u), l = s.reduce((m, d) => m * d, 1);
        if (o) for (let m = 0; m < l; m++) {
          let d = 0, y = 0, f = m, p = [];
          for (let g = s.length - 1; g >= 0; g--) p[g] = f % s[g], f = Math.floor(f / s[g]);
          for (let g = 0; g < a; g++) {
            let h = [...p, g], b = r.get(...h), A = t.get(g), S = b instanceof E ? b : new E(Number(b), 0), D = A instanceof E ? A : new E(Number(A), 0);
            d += S.re * D.re - S.im * D.im, y += S.re * D.im + S.im * D.re;
          }
          c.set(p, new E(d, y));
        }
        else for (let m = 0; m < l; m++) {
          let d = 0, y = m, f = [];
          for (let p = s.length - 1; p >= 0; p--) f[p] = y % s[p], y = Math.floor(y / s[p]);
          for (let p = 0; p < a; p++) {
            let g = [...f, p], h = r.get(...g), b = t.get(p);
            typeof h == "bigint" && typeof b == "bigint" ? d = Number(d) + Number(h * b) : d += Number(h) * Number(b);
          }
          c.set(f, d);
        }
        return c;
      }
      if (e === 1 && n > 2) {
        let a = r.shape[0], i = 1, s = t.shape[i];
        if (a !== s) throw new Error(`dot: incompatible shapes (${a},) and ${JSON.stringify(t.shape)}`);
        let u = [...t.shape.slice(0, i), ...t.shape.slice(i + 1)], c = W(r.dtype, t.dtype), l = N.zeros(u, c), m = u.reduce((d, y) => d * y, 1);
        if (o) for (let d = 0; d < m; d++) {
          let y = d, f = [];
          for (let A = u.length - 1; A >= 0; A--) f[A] = y % u[A], y = Math.floor(y / u[A]);
          let p = f.slice(0, i), g = f.slice(i), h = 0, b = 0;
          for (let A = 0; A < a; A++) {
            let S = r.get(A), D = [...p, A, ...g], w = t.get(...D), x = S instanceof E ? S : new E(Number(S), 0), I = w instanceof E ? w : new E(Number(w), 0);
            h += x.re * I.re - x.im * I.im, b += x.re * I.im + x.im * I.re;
          }
          l.set(f, new E(h, b));
        }
        else for (let d = 0; d < m; d++) {
          let y = d, f = [];
          for (let b = u.length - 1; b >= 0; b--) f[b] = y % u[b], y = Math.floor(y / u[b]);
          let p = f.slice(0, i), g = f.slice(i), h = 0;
          for (let b = 0; b < a; b++) {
            let A = r.get(b), S = [...p, b, ...g], D = t.get(...S);
            typeof A == "bigint" && typeof D == "bigint" ? h = Number(h) + Number(A * D) : h += Number(A) * Number(D);
          }
          l.set(f, h);
        }
        return l;
      }
      if (e >= 2 && n >= 2 && !(e === 2 && n === 2)) {
        let a = r.shape[e - 1], i = t.shape[n - 2];
        if (a !== i) throw new Error(`dot: incompatible shapes ${JSON.stringify(r.shape)} and ${JSON.stringify(t.shape)}`);
        let s = [...r.shape.slice(0, -1), ...t.shape.slice(0, -2), t.shape[n - 1]], u = W(r.dtype, t.dtype), c = N.zeros(s, u), l = r.shape.slice(0, -1).reduce((f, p) => f * p, 1), m = t.shape.slice(0, -2).reduce((f, p) => f * p, 1), d = t.shape[n - 1], y = a;
        if (o) for (let f = 0; f < l; f++) for (let p = 0; p < m; p++) for (let g = 0; g < d; g++) {
          let h = 0, b = 0;
          for (let D = 0; D < y; D++) {
            let w = [], x = f;
            for (let C = r.shape.length - 2; C >= 0; C--) w.unshift(x % r.shape[C]), x = Math.floor(x / r.shape[C]);
            w.push(D);
            let I = r.get(...w), z = [], F = p;
            for (let C = t.shape.length - 3; C >= 0; C--) z.unshift(F % t.shape[C]), F = Math.floor(F / t.shape[C]);
            z.push(D, g);
            let M = t.get(...z), T = I instanceof E ? I : new E(Number(I), 0), O = M instanceof E ? M : new E(Number(M), 0);
            h += T.re * O.re - T.im * O.im, b += T.re * O.im + T.im * O.re;
          }
          let A = f * m * d + p * d + g, S = c.data;
          S[A * 2] = h, S[A * 2 + 1] = b;
        }
        else for (let f = 0; f < l; f++) for (let p = 0; p < m; p++) for (let g = 0; g < d; g++) {
          let h = 0;
          for (let A = 0; A < y; A++) {
            let S = f * y + A, D = p * y * d + A * d + g, w = r.data[S + r.offset], x = t.data[D + t.offset];
            typeof w == "bigint" && typeof x == "bigint" ? h = Number(h) + Number(w * x) : h += Number(w) * Number(x);
          }
          let b = f * m * d + p * d + g;
          c.data[b] = h;
        }
        return c;
      }
      throw new Error(`dot: unexpected combination of dimensions ${e}D \xB7 ${n}D`);
    }
    function cr(r, t) {
      if (r.ndim !== 2 || t.ndim !== 2) throw new Error("matmul requires 2D arrays");
      let [e = 0, n = 0] = r.shape, [o = 0, a = 0] = t.shape;
      if (n !== o) throw new Error(`matmul shape mismatch: (${e},${n}) @ (${o},${a})`);
      let i = W(r.dtype, t.dtype);
      if (v(i)) {
        let D = N.zeros([e, a], i), w = D.data, x = r.data, I = t.data;
        for (let z = 0; z < e; z++) for (let F = 0; F < a; F++) {
          let M = 0, T = 0;
          for (let C = 0; C < n; C++) {
            let q = (z * n + C) * 2, V = (C * a + F) * 2, k = x[q], L = x[q + 1], j = I[V], J = I[V + 1];
            M += k * j - L * J, T += k * J + L * j;
          }
          let O = z * a + F;
          w[O * 2] = M, w[O * 2 + 1] = T;
        }
        return D;
      }
      let s = i.startsWith("int") || i.startsWith("uint") || i === "bool" ? "float64" : i;
      if (s !== "float64") throw new Error(`matmul currently only supports float64, got ${s}`);
      let u = r.dtype === "float64" ? r.data : Float64Array.from(Array.from(r.data).map(Number)), c = t.dtype === "float64" ? t.data : Float64Array.from(Array.from(t.data).map(Number));
      r.offset > 0 && (u = u.subarray(r.offset)), t.offset > 0 && (c = c.subarray(t.offset));
      let [l = 0, m = 0] = r.strides, [d = 0, y = 0] = t.strides, f = m > l, p = y > d, g = f ? "transpose" : "no-transpose", h = p ? "transpose" : "no-transpose", b, A;
      f ? b = m : b = l, p ? A = y : A = d;
      let S = N.zeros([e, a], "float64");
      return vy("row-major", g, h, e, a, n, 1, u, b, c, A, 0, S.data, a), S;
    }
    function Ie(r) {
      if (r.ndim !== 2) throw new Error(`trace requires 2D array, got ${r.ndim}D`);
      let [t = 0, e = 0] = r.shape, n = Math.min(t, e);
      if (v(r.dtype)) {
        let a = 0, i = 0;
        for (let s = 0; s < n; s++) {
          let u = r.get(s, s);
          a += u.re, i += u.im;
        }
        return new E(a, i);
      }
      let o = 0;
      for (let a = 0; a < n; a++) {
        let i = r.get(a, a);
        typeof i == "bigint" ? o = (typeof o == "bigint" ? o : BigInt(o)) + i : o = (typeof o == "bigint" ? Number(o) : o) + i;
      }
      return o;
    }
    function ct(r, t) {
      return it(r, t);
    }
    function fa(r, t) {
      let e = r.ndim, n = t.ndim, o = v(r.dtype) || v(t.dtype), a = r.shape[e - 1], i = t.shape[n - 1];
      if (a !== i) throw new Error(`inner: incompatible shapes - last dimensions ${a} and ${i} don't match`);
      if (e === 1 && n === 1) return Zr(r, t);
      let s = [...r.shape.slice(0, -1), ...t.shape.slice(0, -1)], u = W(r.dtype, t.dtype), c = N.zeros(s, u), l = e === 1 ? 1 : r.shape.slice(0, -1).reduce((y, f) => y * f, 1), m = n === 1 ? 1 : t.shape.slice(0, -1).reduce((y, f) => y * f, 1), d = a;
      if (o) for (let y = 0; y < l; y++) for (let f = 0; f < m; f++) {
        let p = 0, g = 0;
        for (let A = 0; A < d; A++) {
          let S, D;
          if (e === 1) S = r.get(A);
          else {
            let I = [], z = y, F = r.shape.slice(0, -1);
            for (let M = F.length - 1; M >= 0; M--) I.unshift(z % F[M]), z = Math.floor(z / F[M]);
            I.push(A), S = r.get(...I);
          }
          if (n === 1) D = t.get(A);
          else {
            let I = [], z = f, F = t.shape.slice(0, -1);
            for (let M = F.length - 1; M >= 0; M--) I.unshift(z % F[M]), z = Math.floor(z / F[M]);
            I.push(A), D = t.get(...I);
          }
          let w = S instanceof E ? S : new E(Number(S), 0), x = D instanceof E ? D : new E(Number(D), 0);
          p += w.re * x.re - w.im * x.im, g += w.re * x.im + w.im * x.re;
        }
        if (s.length === 0) return new E(p, g);
        let h = l === 1 ? f : y * m + f, b = c.data;
        b[h * 2] = p, b[h * 2 + 1] = g;
      }
      else for (let y = 0; y < l; y++) for (let f = 0; f < m; f++) {
        let p = 0;
        for (let h = 0; h < d; h++) {
          let b = e === 1 ? h : y * d + h, A = n === 1 ? h : f * d + h, S = r.data[b + r.offset], D = t.data[A + t.offset];
          typeof S == "bigint" && typeof D == "bigint" ? p = Number(p) + Number(S * D) : p += Number(S) * Number(D);
        }
        if (s.length === 0) return p;
        let g = l === 1 ? f : y * m + f;
        c.data[g] = p;
      }
      return c;
    }
    function Ft(r, t) {
      let e = r.ndim === 1 ? r : Gr(r), n = t.ndim === 1 ? t : Gr(t), o = e.size, a = n.size, i = W(r.dtype, t.dtype), s = N.zeros([o, a], i);
      for (let u = 0; u < o; u++) for (let c = 0; c < a; c++) {
        let l = e.get(u), m = n.get(c), d = Sr(l, m);
        s.set([u, c], d);
      }
      return s;
    }
    function ze(r, t, e) {
      let n, o;
      if (typeof e == "number") {
        let f = e;
        if (f < 0) throw new Error("tensordot: axes must be non-negative");
        if (f > r.ndim || f > t.ndim) throw new Error("tensordot: axes exceeds array dimensions");
        n = Array.from({ length: f }, (p, g) => r.ndim - f + g), o = Array.from({ length: f }, (p, g) => g);
      } else if ([n, o] = e, n.length !== o.length) throw new Error("tensordot: axes lists must have same length");
      for (let f = 0; f < n.length; f++) {
        let p = n[f], g = o[f];
        if (p < 0 || p >= r.ndim || g < 0 || g >= t.ndim) throw new Error("tensordot: axis out of bounds");
        if (r.shape[p] !== t.shape[g]) throw new Error(`tensordot: shape mismatch on axes ${p} and ${g}: ${r.shape[p]} != ${t.shape[g]}`);
      }
      let a = [], i = [];
      for (let f = 0; f < r.ndim; f++) n.includes(f) || a.push(f);
      for (let f = 0; f < t.ndim; f++) o.includes(f) || i.push(f);
      let s = [...a.map((f) => r.shape[f]), ...i.map((f) => t.shape[f])], u = W(r.dtype, t.dtype), c = v(u), l = (f) => f instanceof E ? { re: f.re, im: f.im } : { re: Number(f), im: 0 };
      if (s.length === 0) {
        let f = 0, p = 0, g = n.map((h) => r.shape[h]).reduce((h, b) => h * b, 1);
        for (let h = 0; h < g; h++) {
          let b = h, A = new Array(n.length);
          for (let I = n.length - 1; I >= 0; I--) {
            let z = n[I];
            A[I] = b % r.shape[z], b = Math.floor(b / r.shape[z]);
          }
          let S = new Array(r.ndim), D = new Array(t.ndim);
          for (let I = 0; I < n.length; I++) S[n[I]] = A[I];
          for (let I = 0; I < o.length; I++) D[o[I]] = A[I];
          let w = r.get(...S), x = t.get(...D);
          if (c) {
            let I = l(w), z = l(x);
            f += I.re * z.re - I.im * z.im, p += I.re * z.im + I.im * z.re;
          } else typeof w == "bigint" && typeof x == "bigint" ? f += Number(w * x) : f += Number(w) * Number(x);
        }
        return c ? new E(f, p) : f;
      }
      let m = N.zeros(s, u), d = s.reduce((f, p) => f * p, 1), y = n.map((f) => r.shape[f]).reduce((f, p) => f * p, 1);
      for (let f = 0; f < d; f++) {
        let p = f, g = [];
        for (let D = s.length - 1; D >= 0; D--) g[D] = p % s[D], p = Math.floor(p / s[D]);
        let h = g.slice(0, a.length), b = g.slice(a.length), A = 0, S = 0;
        for (let D = 0; D < y; D++) {
          p = D;
          let w = [];
          for (let M = n.length - 1; M >= 0; M--) {
            let T = n[M];
            w[M] = p % r.shape[T], p = Math.floor(p / r.shape[T]);
          }
          let x = new Array(r.ndim), I = new Array(t.ndim);
          for (let M = 0; M < a.length; M++) x[a[M]] = h[M];
          for (let M = 0; M < i.length; M++) I[i[M]] = b[M];
          for (let M = 0; M < n.length; M++) x[n[M]] = w[M], I[o[M]] = w[M];
          let z = r.get(...x), F = t.get(...I);
          if (c) {
            let M = l(z), T = l(F);
            A += M.re * T.re - M.im * T.im, S += M.re * T.im + M.im * T.re;
          } else typeof z == "bigint" && typeof F == "bigint" ? A += Number(z * F) : A += Number(z) * Number(F);
        }
        c ? m.set(g, new E(A, S)) : m.set(g, A);
      }
      return m;
    }
    function _e(r, t = 0, e = 0, n = 1) {
      let o = r.shape, a = o.length;
      if (a < 2) throw new Error("diagonal requires an array of at least two dimensions");
      let i = e < 0 ? a + e : e, s = n < 0 ? a + n : n;
      if (i < 0 || i >= a || s < 0 || s >= a) throw new Error("axis out of bounds");
      if (i === s) throw new Error("axis1 and axis2 cannot be the same");
      let u = o[i], c = o[s], l;
      t >= 0 ? l = Math.max(0, Math.min(u, c - t)) : l = Math.max(0, Math.min(u + t, c));
      let m = [];
      for (let p = 0; p < a; p++) p !== i && p !== s && m.push(o[p]);
      m.push(l);
      let d = N.zeros(m, r.dtype), y = o.filter((p, g) => g !== i && g !== s), f = y.reduce((p, g) => p * g, 1);
      for (let p = 0; p < f; p++) {
        let g = p, h = [];
        for (let b = y.length - 1; b >= 0; b--) h.unshift(g % y[b]), g = Math.floor(g / y[b]);
        for (let b = 0; b < l; b++) {
          let A = new Array(a), S = 0;
          for (let x = 0; x < a; x++) x === i ? A[x] = t >= 0 ? b : b - t : x === s ? A[x] = t >= 0 ? b + t : b : A[x] = h[S++];
          let D = [...h, b], w = r.get(...A);
          d.set(D, w);
        }
      }
      return d;
    }
    function ma(r, ...t) {
      let e = r.indexOf("->"), n, o;
      e === -1 ? (n = r, o = By(n)) : (n = r.slice(0, e), o = r.slice(e + 2));
      let a = n.split(",").map((p) => p.trim());
      if (a.length !== t.length) throw new Error(`einsum: expected ${a.length} operands, got ${t.length}`);
      let i = /* @__PURE__ */ new Map();
      for (let p = 0; p < t.length; p++) {
        let g = a[p], h = t[p];
        if (g.length !== h.ndim) throw new Error(`einsum: operand ${p} has ${h.ndim} dimensions but subscript '${g}' has ${g.length} indices`);
        for (let b = 0; b < g.length; b++) {
          let A = g[b], S = h.shape[b];
          if (i.has(A)) {
            if (i.get(A) !== S) throw new Error(`einsum: size mismatch for index '${A}': ${i.get(A)} vs ${S}`);
          } else i.set(A, S);
        }
      }
      for (let p of o) if (!i.has(p)) throw new Error(`einsum: output subscript contains unknown index '${p}'`);
      let s = new Set(o), u = /* @__PURE__ */ new Set();
      for (let p of a) for (let g of p) u.add(g);
      let c = [];
      for (let p of u) s.has(p) || c.push(p);
      if (t.length === 2 && a.length === 2) {
        let [p, g] = a, [h, b] = t;
        if (p.length === 2 && g.length === 2 && o.length === 2 && h.ndim === 2 && b.ndim === 2) {
          let [A, S] = [p[0], p[1]], [D, w] = [g[0], g[1]], [x, I] = [o[0], o[1]];
          if (A === x && w === I && S === D && c.length === 1 && c[0] === S || A === x && w === I && S === D && c.length === 1 && c[0] === S) return cr(h, b);
          if (S === x && w === I && A === D && c.length === 1 && c[0] === A) {
            let z = ct(h);
            return cr(z, b);
          }
          if (A === x && D === I && S === w && c.length === 1 && c[0] === S) {
            let z = ct(b);
            return cr(h, z);
          }
        }
        if (p.length === 1 && g.length === 1 && p === g && o.length === 0 && h.ndim === 1 && b.ndim === 1) return we(t, a, c, i);
        if (p && g && p.length === 1 && g.length === 1 && o.length === 2 && o === p + g && c.length === 0 && h.ndim === 1 && b.ndim === 1) return Ft(h, b);
      }
      if (t.length === 1 && a[0].length === 2 && o.length === 0) {
        let p = a[0];
        if (p[0] === p[1] && t[0].ndim === 2) return we(t, a, c, i);
      }
      let l = Array.from(o).map((p) => i.get(p));
      if (l.length === 0) return we(t, a, c, i);
      let m = t[0].dtype;
      for (let p = 1; p < t.length; p++) m = W(m, t[p].dtype);
      let d = N.zeros(l, m), y = l.reduce((p, g) => p * g, 1), f = 1;
      for (let p of c) f *= i.get(p);
      for (let p = 0; p < y; p++) {
        let g = Ey(p, l), h = /* @__PURE__ */ new Map();
        for (let A = 0; A < o.length; A++) h.set(o[A], g[A]);
        let b = 0;
        for (let A = 0; A < f; A++) {
          let S = A;
          for (let w = c.length - 1; w >= 0; w--) {
            let x = c[w], I = i.get(x);
            h.set(x, S % I), S = Math.floor(S / I);
          }
          let D = 1;
          for (let w = 0; w < t.length; w++) {
            let x = t[w], I = a[w], z = [];
            for (let M of I) z.push(h.get(M));
            let F = x.get(...z);
            D *= Number(F);
          }
          b += D;
        }
        d.set(g, b);
      }
      return d;
    }
    function By(r) {
      let t = /* @__PURE__ */ new Map(), e = r.split(",");
      for (let o of e) for (let a of o.trim()) t.set(a, (t.get(a) || 0) + 1);
      let n = [];
      for (let [o, a] of t) a === 1 && n.push(o);
      return n.sort().join("");
    }
    function we(r, t, e, n) {
      let o = false;
      for (let c of r) if (v(c.dtype)) {
        o = true;
        break;
      }
      let a = (c) => c instanceof E ? { re: c.re, im: c.im } : { re: Number(c), im: 0 }, i = 1;
      for (let c of e) i *= n.get(c);
      let s = 0, u = 0;
      for (let c = 0; c < i; c++) {
        let l = /* @__PURE__ */ new Map(), m = c;
        for (let f = e.length - 1; f >= 0; f--) {
          let p = e[f], g = n.get(p);
          l.set(p, m % g), m = Math.floor(m / g);
        }
        let d = 1, y = 0;
        for (let f = 0; f < r.length; f++) {
          let p = r[f], g = t[f], h = [];
          for (let A of g) h.push(l.get(A));
          let b = p.get(...h);
          if (o) {
            let A = a(b), S = d * A.re - y * A.im, D = d * A.im + y * A.re;
            d = S, y = D;
          } else d *= Number(b);
        }
        s += d, u += y;
      }
      return o ? new E(s, u) : s;
    }
    function Ey(r, t) {
      let e = new Array(t.length), n = r;
      for (let o = t.length - 1; o >= 0; o--) e[o] = n % t[o], n = Math.floor(n / t[o]);
      return e;
    }
    function pa(r, t) {
      let e = r.shape, n = t.shape, o = e.length, a = n.length, i = W(r.dtype, t.dtype), s = Math.max(o, a), u = new Array(s), c = new Array(s).fill(1), l = new Array(s).fill(1);
      for (let f = 0; f < o; f++) c[s - o + f] = e[f];
      for (let f = 0; f < a; f++) l[s - a + f] = n[f];
      for (let f = 0; f < s; f++) u[f] = c[f] * l[f];
      let m = N.zeros(u, i), d = e.reduce((f, p) => f * p, 1), y = n.reduce((f, p) => f * p, 1);
      for (let f = 0; f < d; f++) {
        let p = f, g = new Array(o);
        for (let A = o - 1; A >= 0; A--) g[A] = p % e[A], p = Math.floor(p / e[A]);
        let h = new Array(s).fill(0);
        for (let A = 0; A < o; A++) h[s - o + A] = g[A];
        let b = r.get(...g);
        for (let A = 0; A < y; A++) {
          let S = A, D = new Array(a);
          for (let F = a - 1; F >= 0; F--) D[F] = S % n[F], S = Math.floor(S / n[F]);
          let w = new Array(s).fill(0);
          for (let F = 0; F < a; F++) w[s - a + F] = D[F];
          let x = t.get(...D), I = new Array(s);
          for (let F = 0; F < s; F++) I[F] = h[F] * l[F] + w[F];
          let z = Sr(b, x);
          m.set(I, z);
        }
      }
      return m;
    }
    function ya(r, t, e = -1, n = -1, o = -1, a) {
      a !== void 0 && (e = a, n = a, o = a);
      let i = (A, S) => A < 0 ? S + A : A, s = i(e, r.ndim), u = i(n, t.ndim);
      if (r.ndim === 1 && t.ndim === 1) {
        let A = r.shape[0], S = t.shape[0];
        if (A === 3 && S === 3) {
          let D = Number(r.get(0)), w = Number(r.get(1)), x = Number(r.get(2)), I = Number(t.get(0)), z = Number(t.get(1)), F = Number(t.get(2)), M = N.zeros([3], "float64");
          return M.set([0], w * F - x * z), M.set([1], x * I - D * F), M.set([2], D * z - w * I), M;
        } else if (A === 2 && S === 2) {
          let D = Number(r.get(0)), w = Number(r.get(1)), x = Number(t.get(0)), I = Number(t.get(1));
          return D * I - w * x;
        } else if (A === 2 && S === 3 || A === 3 && S === 2) {
          let D = Number(r.get(0)), w = Number(r.get(1)), x = A === 3 ? Number(r.get(2)) : 0, I = Number(t.get(0)), z = Number(t.get(1)), F = S === 3 ? Number(t.get(2)) : 0, M = N.zeros([3], "float64");
          return M.set([0], w * F - x * z), M.set([1], x * I - D * F), M.set([2], D * z - w * I), M;
        } else throw new Error(`cross: incompatible dimensions for cross product: ${A} and ${S}`);
      }
      let c = r.shape[s], l = t.shape[u];
      if (c !== 2 && c !== 3 || l !== 2 && l !== 3) throw new Error(`cross: incompatible dimensions for cross product: ${c} and ${l}`);
      let m = c === 2 && l === 2 ? 0 : 3, d = [...r.shape.slice(0, s), ...r.shape.slice(s + 1)], y = [...t.shape.slice(0, u), ...t.shape.slice(u + 1)];
      if (d.length !== y.length) throw new Error("cross: incompatible shapes for cross product");
      for (let A = 0; A < d.length; A++) if (d[A] !== y[A]) throw new Error("cross: incompatible shapes for cross product");
      let f = d, p = o < 0 ? f.length + 1 + o : o, g;
      if (m === 0 ? g = f : g = [...f.slice(0, p), m, ...f.slice(p)], g.length === 0) throw new Error("cross: unexpected scalar result from higher-dimensional input");
      let h = N.zeros(g, "float64"), b = f.reduce((A, S) => A * S, 1);
      for (let A = 0; A < b; A++) {
        let S = A, D = [];
        for (let V = f.length - 1; V >= 0; V--) D[V] = S % f[V], S = Math.floor(S / f[V]);
        let w = [...D.slice(0, s), 0, ...D.slice(s)], x = [...D.slice(0, u), 0, ...D.slice(u)], I = (V) => (w[s] = V, Number(r.get(...w))), z = (V) => (x[u] = V, Number(t.get(...x))), F = I(0), M = I(1), T = c === 3 ? I(2) : 0, O = z(0), C = z(1), q = l === 3 ? z(2) : 0;
        if (m === 0) h.set(D, F * C - M * O);
        else {
          let V = M * q - T * C, k = T * O - F * q, L = F * C - M * O, j = (J, rr) => {
            let Z = [...D.slice(0, p), J, ...D.slice(p)];
            h.set(Z, rr);
          };
          j(0, V), j(1, k), j(2, L);
        }
      }
      return h;
    }
    function Wr(r, t = 2, e, n = false) {
      if (typeof t != "number") throw new Error("vector_norm: ord must be a number");
      if (e == null) {
        let c = r.ndim === 1 ? r : Gr(r), l = c.size, m;
        if (t === 1 / 0) {
          m = 0;
          for (let d = 0; d < l; d++) m = Math.max(m, Math.abs(Number(c.get(d))));
        } else if (t === -1 / 0) {
          m = 1 / 0;
          for (let d = 0; d < l; d++) m = Math.min(m, Math.abs(Number(c.get(d))));
        } else if (t === 0) {
          m = 0;
          for (let d = 0; d < l; d++) Number(c.get(d)) !== 0 && m++;
        } else if (t === 1) {
          m = 0;
          for (let d = 0; d < l; d++) m += Math.abs(Number(c.get(d)));
        } else if (t === 2) {
          m = 0;
          for (let d = 0; d < l; d++) {
            let y = Number(c.get(d));
            m += y * y;
          }
          m = Math.sqrt(m);
        } else {
          m = 0;
          for (let d = 0; d < l; d++) m += Math.pow(Math.abs(Number(c.get(d))), t);
          m = Math.pow(m, 1 / t);
        }
        if (n) {
          let d = new Array(r.ndim).fill(1), y = N.zeros(d, "float64");
          return y.set(new Array(r.ndim).fill(0), m), y;
        }
        return m;
      }
      let o = e < 0 ? r.ndim + e : e;
      if (o < 0 || o >= r.ndim) throw new Error(`vector_norm: axis ${e} out of bounds for array with ${r.ndim} dimensions`);
      let a = n ? [...r.shape.slice(0, o), 1, ...r.shape.slice(o + 1)] : [...r.shape.slice(0, o), ...r.shape.slice(o + 1)];
      if (a.length === 0) return Wr(r, t, null, false);
      let i = N.zeros(a, "float64"), s = r.shape[o], u = a.reduce((c, l) => c * l, 1);
      for (let c = 0; c < u; c++) {
        let l = c, m = [];
        for (let f = a.length - 1; f >= 0; f--) m[f] = l % a[f], l = Math.floor(l / a[f]);
        let d = n ? [...m.slice(0, o), 0, ...m.slice(o + 1)] : [...m.slice(0, o), 0, ...m.slice(o)], y;
        if (t === 1 / 0) {
          y = 0;
          for (let f = 0; f < s; f++) d[o] = f, y = Math.max(y, Math.abs(Number(r.get(...d))));
        } else if (t === -1 / 0) {
          y = 1 / 0;
          for (let f = 0; f < s; f++) d[o] = f, y = Math.min(y, Math.abs(Number(r.get(...d))));
        } else if (t === 0) {
          y = 0;
          for (let f = 0; f < s; f++) d[o] = f, Number(r.get(...d)) !== 0 && y++;
        } else if (t === 1) {
          y = 0;
          for (let f = 0; f < s; f++) d[o] = f, y += Math.abs(Number(r.get(...d)));
        } else if (t === 2) {
          y = 0;
          for (let f = 0; f < s; f++) {
            d[o] = f;
            let p = Number(r.get(...d));
            y += p * p;
          }
          y = Math.sqrt(y);
        } else {
          y = 0;
          for (let f = 0; f < s; f++) d[o] = f, y += Math.pow(Math.abs(Number(r.get(...d))), t);
          y = Math.pow(y, 1 / t);
        }
        i.set(m, y);
      }
      return i;
    }
    function Ur(r, t = "fro", e = false) {
      if (r.ndim !== 2) throw new Error(`matrix_norm: input must be 2D, got ${r.ndim}D`);
      let [n, o] = r.shape, a;
      if (t === "fro") {
        a = 0;
        for (let i = 0; i < n; i++) for (let s = 0; s < o; s++) {
          let u = Number(r.get(i, s));
          a += u * u;
        }
        a = Math.sqrt(a);
      } else if (t === "nuc") {
        let { s: i } = Br(r);
        a = 0;
        for (let s = 0; s < i.size; s++) a += Number(i.get(s));
      } else if (t === 1) {
        a = 0;
        for (let i = 0; i < o; i++) {
          let s = 0;
          for (let u = 0; u < n; u++) s += Math.abs(Number(r.get(u, i)));
          a = Math.max(a, s);
        }
      } else if (t === -1) {
        a = 1 / 0;
        for (let i = 0; i < o; i++) {
          let s = 0;
          for (let u = 0; u < n; u++) s += Math.abs(Number(r.get(u, i)));
          a = Math.min(a, s);
        }
      } else if (t === 1 / 0) {
        a = 0;
        for (let i = 0; i < n; i++) {
          let s = 0;
          for (let u = 0; u < o; u++) s += Math.abs(Number(r.get(i, u)));
          a = Math.max(a, s);
        }
      } else if (t === -1 / 0) {
        a = 1 / 0;
        for (let i = 0; i < n; i++) {
          let s = 0;
          for (let u = 0; u < o; u++) s += Math.abs(Number(r.get(i, u)));
          a = Math.min(a, s);
        }
      } else if (t === 2) {
        let { s: i } = Br(r);
        a = Number(i.get(0));
      } else if (t === -2) {
        let { s: i } = Br(r);
        a = Number(i.get(i.size - 1));
      } else throw new Error(`matrix_norm: invalid ord value: ${t}`);
      if (e) {
        let i = N.zeros([1, 1], "float64");
        return i.set([0, 0], a), i;
      }
      return a;
    }
    function da(r, t = null, e = null, n = false) {
      if (t === null) return e === null ? Wr(r, 2, null, n) : typeof e == "number" ? Wr(r, 2, e, n) : Ur(r, "fro", n);
      if (Array.isArray(e)) {
        if (e.length !== 2) throw new Error("norm: axis must be a 2-tuple for matrix norms");
        let o = e[0] < 0 ? r.ndim + e[0] : e[0], a = e[1] < 0 ? r.ndim + e[1] : e[1];
        if (r.ndim !== 2 || o !== 0 && o !== 1 || a !== 0 && a !== 1 || o === a) throw new Error("norm: complex axis specification not yet supported");
        return Ur(r, t, n);
      }
      if (r.ndim === 2 && e === null && (t === "fro" || t === "nuc")) return Ur(r, t, n);
      if (typeof t != "number" && t !== null) throw new Error(`norm: ord '${t}' not valid for vector norm`);
      return Wr(r, t ?? 2, e, n);
    }
    function Me(r, t = "reduced") {
      if (r.ndim !== 2) throw new Error(`qr: input must be 2D, got ${r.ndim}D`);
      let [e, n] = r.shape, o = Math.min(e, n), a = N.zeros([e, n], "float64");
      for (let y = 0; y < e; y++) for (let f = 0; f < n; f++) a.set([y, f], Number(r.get(y, f)));
      let i = [], s = [];
      for (let y = 0; y < o; y++) {
        let f = e - y, p = [];
        for (let D = y; D < e; D++) p.push(Number(a.get(D, y)));
        let g = 0;
        for (let D = 0; D < f; D++) g += p[D] * p[D];
        if (g = Math.sqrt(g), g < 1e-15) {
          i.push(p), s.push(0);
          continue;
        }
        let h = p[0] >= 0 ? 1 : -1, b = p[0] + h * g, A = [1];
        for (let D = 1; D < f; D++) A.push(p[D] / b);
        let S = h * b / g;
        s.push(S), i.push(A);
        for (let D = y; D < n; D++) {
          let w = 0;
          for (let x = 0; x < f; x++) w += A[x] * Number(a.get(y + x, D));
          for (let x = 0; x < f; x++) a.set([y + x, D], Number(a.get(y + x, D)) - S * A[x] * w);
        }
      }
      if (t === "raw") {
        let y = N.zeros([e, n], "float64");
        for (let p = 0; p < e; p++) for (let g = 0; g < n; g++) y.set([p, g], Number(a.get(p, g)));
        let f = N.zeros([o], "float64");
        for (let p = 0; p < o; p++) f.set([p], s[p]);
        return { h: y, tau: f };
      }
      if (t === "r") {
        let y = N.zeros([o, n], "float64");
        for (let f = 0; f < o; f++) for (let p = f; p < n; p++) y.set([f, p], Number(a.get(f, p)));
        return y;
      }
      let u = t === "complete" ? e : o, c = N.zeros([e, u], "float64");
      for (let y = 0; y < Math.min(e, u); y++) c.set([y, y], 1);
      for (let y = o - 1; y >= 0; y--) {
        let f = i[y], p = s[y], g = e - y;
        for (let h = y; h < u; h++) {
          let b = 0;
          for (let A = 0; A < g; A++) b += f[A] * Number(c.get(y + A, h));
          for (let A = 0; A < g; A++) c.set([y + A, h], Number(c.get(y + A, h)) - p * f[A] * b);
        }
      }
      let l = N.zeros([e, u], "float64");
      for (let y = 0; y < e; y++) for (let f = 0; f < u; f++) l.set([y, f], Number(c.get(y, f)));
      let m = t === "complete" ? e : o, d = N.zeros([m, n], "float64");
      for (let y = 0; y < m; y++) for (let f = 0; f < n; f++) f >= y && d.set([y, f], Number(a.get(y, f)));
      return { q: l, r: d };
    }
    function ga(r, t = false) {
      if (r.ndim !== 2) throw new Error(`cholesky: input must be 2D, got ${r.ndim}D`);
      let [e, n] = r.shape;
      if (e !== n) throw new Error(`cholesky: matrix must be square, got ${e}x${n}`);
      let o = e, a = N.zeros([o, o], "float64");
      for (let i = 0; i < o; i++) for (let s = 0; s <= i; s++) {
        let u = 0;
        if (i === s) {
          for (let l = 0; l < s; l++) u += Number(a.get(s, l)) ** 2;
          let c = Number(r.get(s, s)) - u;
          if (c < 0) throw new Error("cholesky: matrix is not positive definite");
          a.set([s, s], Math.sqrt(c));
        } else {
          for (let l = 0; l < s; l++) u += Number(a.get(i, l)) * Number(a.get(s, l));
          let c = Number(a.get(s, s));
          if (Math.abs(c) < 1e-15) throw new Error("cholesky: matrix is not positive definite");
          a.set([i, s], (Number(r.get(i, s)) - u) / c);
        }
      }
      if (t) {
        let i = N.zeros([o, o], "float64");
        for (let s = 0; s < o; s++) for (let u = s; u < o; u++) i.set([s, u], Number(a.get(u, s)));
        return i;
      }
      return a;
    }
    function Br(r) {
      if (r.ndim !== 2) throw new Error(`svd: input must be 2D, got ${r.ndim}D`);
      let [t, e] = r.shape, n = Math.min(t, e), o = N.zeros([e, e], "float64");
      for (let m = 0; m < e; m++) for (let d = 0; d < e; d++) {
        let y = 0;
        for (let f = 0; f < t; f++) y += Number(r.get(f, m)) * Number(r.get(f, d));
        o.set([m, d], y);
      }
      let { values: a, vectors: i } = Fe(o), s = Array.from({ length: e }, (m, d) => d);
      s.sort((m, d) => a[d] - a[m]);
      let u = N.zeros([n], "float64");
      for (let m = 0; m < n; m++) {
        let d = a[s[m]];
        u.set([m], Math.sqrt(Math.max(0, d)));
      }
      let c = N.zeros([e, e], "float64");
      for (let m = 0; m < e; m++) for (let d = 0; d < e; d++) c.set([m, d], i[d][s[m]]);
      let l = N.zeros([t, t], "float64");
      for (let m = 0; m < t; m++) for (let d = 0; d < n; d++) {
        let y = Number(u.get(d));
        if (y > 1e-10) {
          let f = 0;
          for (let p = 0; p < e; p++) f += Number(r.get(m, p)) * Number(c.get(d, p));
          l.set([m, d], f / y);
        }
      }
      if (t > n) for (let m = n; m < t; m++) {
        let d = new Array(t).fill(0);
        d[m] = 1;
        for (let f = 0; f < m; f++) {
          let p = 0;
          for (let g = 0; g < t; g++) p += d[g] * Number(l.get(g, f));
          for (let g = 0; g < t; g++) d[g] = d[g] - p * Number(l.get(g, f));
        }
        let y = 0;
        for (let f = 0; f < t; f++) y += d[f] * d[f];
        if (y = Math.sqrt(y), y > 1e-10) for (let f = 0; f < t; f++) l.set([f, m], d[f] / y);
      }
      return { u: l, s: u, vt: c };
    }
    function Fe(r) {
      let t = r.shape[0], e = 100 * t * t, n = 1e-10, o = [];
      for (let s = 0; s < t; s++) {
        o.push([]);
        for (let u = 0; u < t; u++) o[s].push(Number(r.get(s, u)));
      }
      let a = [];
      for (let s = 0; s < t; s++) {
        a.push([]);
        for (let u = 0; u < t; u++) a[s].push(s === u ? 1 : 0);
      }
      for (let s = 0; s < e; s++) {
        let u = 0, c = 0, l = 1;
        for (let A = 0; A < t; A++) for (let S = A + 1; S < t; S++) Math.abs(o[A][S]) > u && (u = Math.abs(o[A][S]), c = A, l = S);
        if (u < n) break;
        let m = o[c][c], d = o[l][l], y = o[c][l], f;
        Math.abs(m - d) < 1e-15 ? f = Math.PI / 4 : f = 0.5 * Math.atan2(2 * y, d - m);
        let p = Math.cos(f), g = Math.sin(f), h = p * p * m + g * g * d - 2 * g * p * y, b = g * g * m + p * p * d + 2 * g * p * y;
        o[c][c] = h, o[l][l] = b, o[c][l] = 0, o[l][c] = 0;
        for (let A = 0; A < t; A++) if (A !== c && A !== l) {
          let S = o[A][c], D = o[A][l];
          o[A][c] = p * S - g * D, o[c][A] = o[A][c], o[A][l] = g * S + p * D, o[l][A] = o[A][l];
        }
        for (let A = 0; A < t; A++) {
          let S = a[A][c], D = a[A][l];
          a[A][c] = p * S - g * D, a[A][l] = g * S + p * D;
        }
      }
      let i = [];
      for (let s = 0; s < t; s++) i.push(o[s][s]);
      return { values: i, vectors: a };
    }
    function ve(r, t = true, e = true) {
      let n = Br(r);
      if (!e) return n.s;
      if (!t) {
        let [o, a] = r.shape, i = Math.min(o, a), s = N.zeros([o, i], "float64");
        for (let c = 0; c < o; c++) for (let l = 0; l < i; l++) s.set([c, l], Number(n.u.get(c, l)));
        let u = N.zeros([i, a], "float64");
        for (let c = 0; c < i; c++) for (let l = 0; l < a; l++) u.set([c, l], Number(n.vt.get(c, l)));
        return { u: s, s: n.s, vt: u };
      }
      return n;
    }
    function Aa(r) {
      if (r.ndim !== 2) throw new Error(`det: input must be 2D, got ${r.ndim}D`);
      let [t, e] = r.shape;
      if (t !== e) throw new Error(`det: matrix must be square, got ${t}x${e}`);
      let n = t;
      if (n === 0) return 1;
      let o = r.data;
      if (n === 1) return Number(o[0]);
      if (n === 2) return Number(o[0]) * Number(o[3]) - Number(o[1]) * Number(o[2]);
      let { lu: a, sign: i } = vt(r), s = a.data, u = i;
      for (let c = 0; c < n; c++) u *= s[c * n + c];
      return u;
    }
    function vt(r) {
      let [t, e] = r.shape, n = t, o = e, a = N.zeros([n, o], "float64"), i = a.data, s = r.data;
      for (let l = 0; l < n * o; l++) i[l] = Number(s[l]);
      let u = Array.from({ length: n }, (l, m) => m), c = 1;
      for (let l = 0; l < Math.min(n, o); l++) {
        let m = Math.abs(i[l * o + l]), d = l;
        for (let f = l + 1; f < n; f++) {
          let p = Math.abs(i[f * o + l]);
          p > m && (m = p, d = f);
        }
        if (d !== l) {
          for (let p = 0; p < o; p++) {
            let g = i[l * o + p];
            i[l * o + p] = i[d * o + p], i[d * o + p] = g;
          }
          let f = u[l];
          u[l] = u[d], u[d] = f, c = -c;
        }
        let y = i[l * o + l];
        if (Math.abs(y) > 1e-15) for (let f = l + 1; f < n; f++) {
          let p = i[f * o + l] / y;
          i[f * o + l] = p;
          for (let g = l + 1; g < o; g++) i[f * o + g] = i[f * o + g] - p * i[l * o + g];
        }
      }
      return { lu: a, piv: u, sign: c };
    }
    function lt(r) {
      if (r.ndim !== 2) throw new Error(`inv: input must be 2D, got ${r.ndim}D`);
      let [t, e] = r.shape;
      if (t !== e) throw new Error(`inv: matrix must be square, got ${t}x${e}`);
      let n = t, { lu: o, piv: a } = vt(r), i = o.data, s = N.zeros([n, n], "float64"), u = s.data;
      for (let c = 0; c < n; c++) {
        let l = new Float64Array(n);
        for (let m = 0; m < n; m++) {
          let d = a[m] === c ? 1 : 0;
          for (let y = 0; y < m; y++) d -= i[m * n + y] * l[y];
          l[m] = d;
        }
        for (let m = n - 1; m >= 0; m--) {
          let d = l[m];
          for (let f = m + 1; f < n; f++) d -= i[m * n + f] * u[f * n + c];
          let y = i[m * n + m];
          if (Math.abs(y) < 1e-15) throw new Error("inv: singular matrix");
          u[m * n + c] = d / y;
        }
      }
      return s;
    }
    function la(r, t) {
      let [e] = r.shape, n = e, { lu: o, piv: a } = vt(r), i = o.data, s = t.data, u = new Float64Array(n);
      for (let d = 0; d < n; d++) u[d] = Number(s[a[d]]);
      let c = new Float64Array(n);
      for (let d = 0; d < n; d++) {
        let y = u[d];
        for (let f = 0; f < d; f++) y -= i[d * n + f] * c[f];
        c[d] = y;
      }
      let l = N.zeros([n], "float64"), m = l.data;
      for (let d = n - 1; d >= 0; d--) {
        let y = c[d];
        for (let p = d + 1; p < n; p++) y -= i[d * n + p] * m[p];
        let f = i[d * n + d];
        if (Math.abs(f) < 1e-15) throw new Error("solve: singular matrix");
        m[d] = y / f;
      }
      return l;
    }
    function Be(r, t) {
      if (r.ndim !== 2) throw new Error(`solve: coefficient matrix must be 2D, got ${r.ndim}D`);
      let [e, n] = r.shape;
      if (e !== n) throw new Error(`solve: coefficient matrix must be square, got ${e}x${n}`);
      let o = e;
      if (t.ndim === 1) {
        if (t.shape[0] !== o) throw new Error(`solve: incompatible shapes (${e},${n}) and (${t.shape[0]},)`);
        return la(r, t);
      }
      if (t.ndim === 2) {
        if (t.shape[0] !== o) throw new Error(`solve: incompatible shapes (${e},${n}) and (${t.shape[0]},${t.shape[1]})`);
        let a = t.shape[1], i = N.zeros([o, a], "float64");
        for (let s = 0; s < a; s++) {
          let u = N.zeros([o], "float64");
          for (let l = 0; l < o; l++) u.set([l], Number(t.get(l, s)));
          let c = la(r, u);
          for (let l = 0; l < o; l++) i.set([l, s], Number(c.get(l)));
        }
        return i;
      }
      throw new Error(`solve: b must be 1D or 2D, got ${t.ndim}D`);
    }
    function ba(r, t, e = null) {
      if (r.ndim !== 2) throw new Error(`lstsq: coefficient matrix must be 2D, got ${r.ndim}D`);
      let [n, o] = r.shape, { u: a, s: i, vt: s } = Br(r), u = Math.min(n, o), c = e ?? Math.max(n, o) * Number.EPSILON, m = Number(i.get(0)) * c, d = 0;
      for (let b = 0; b < u; b++) Number(i.get(b)) > m && d++;
      let y = t.ndim === 1 ? K(t, [t.size, 1]) : t, f = y.shape[1];
      if (y.shape[0] !== n) throw new Error(`lstsq: incompatible shapes (${n},${o}) and (${t.shape.join(",")})`);
      let p = N.zeros([o, f], "float64");
      for (let b = 0; b < f; b++) {
        let A = new Array(n).fill(0);
        for (let S = 0; S < n; S++) for (let D = 0; D < n; D++) A[S] += Number(a.get(D, S)) * Number(y.get(D, b));
        for (let S = 0; S < o; S++) {
          let D = 0;
          for (let w = 0; w < u; w++) {
            let x = Number(i.get(w));
            x > m && (D += Number(s.get(w, S)) * A[w] / x);
          }
          p.set([S, b], D);
        }
      }
      let g;
      if (n > o) {
        g = N.zeros([f], "float64");
        for (let b = 0; b < f; b++) {
          let A = 0;
          for (let S = 0; S < n; S++) {
            let D = 0;
            for (let x = 0; x < o; x++) D += Number(r.get(S, x)) * Number(p.get(x, b));
            let w = D - Number(y.get(S, b));
            A += w * w;
          }
          g.set([b], A);
        }
      } else g = N.zeros([0], "float64");
      return { x: t.ndim === 1 ? K(p, [o]) : p, residuals: g, rank: d, s: i };
    }
    function ha(r, t = 2) {
      if (r.ndim !== 2) throw new Error(`cond: input must be 2D, got ${r.ndim}D`);
      let [e, n] = r.shape;
      if (t === 2 || t === -2) {
        let { s } = Br(r), u = Math.min(e, n), c = Number(s.get(0)), l = Number(s.get(u - 1));
        return t === 2 ? l > 0 ? c / l : 1 / 0 : c > 0 ? l / c : 0;
      }
      if (e !== n) throw new Error(`cond: matrix must be square for p=${t}`);
      let o = Ur(r, t), a = lt(r), i = Ur(a, t);
      return o * i;
    }
    function Sa(r, t) {
      if (r.ndim === 0) return Number(r.get()) !== 0 ? 1 : 0;
      if (r.ndim === 1) {
        for (let i = 0; i < r.size; i++) if (Number(r.get(i)) !== 0) return 1;
        return 0;
      }
      if (r.ndim !== 2) throw new Error(`matrix_rank: input must be at most 2D, got ${r.ndim}D`);
      let { s: e } = Br(r), n = Number(e.get(0)), o = t ?? n * Math.max(r.shape[0], r.shape[1]) * Number.EPSILON, a = 0;
      for (let i = 0; i < e.size; i++) Number(e.get(i)) > o && a++;
      return a;
    }
    function Da(r, t) {
      if (r.ndim !== 2) throw new Error(`matrix_power: input must be 2D, got ${r.ndim}D`);
      let [e, n] = r.shape;
      if (e !== n) throw new Error(`matrix_power: matrix must be square, got ${e}x${n}`);
      let o = e;
      if (!Number.isInteger(t)) throw new Error("matrix_power: exponent must be an integer");
      if (t === 0) {
        let c = N.zeros([o, o], "float64");
        for (let l = 0; l < o; l++) c.set([l, l], 1);
        return c;
      }
      let a = r, i = t;
      t < 0 && (a = lt(r), i = -t);
      let s = N.zeros([o, o], "float64");
      for (let c = 0; c < o; c++) s.set([c, c], 1);
      let u = N.zeros([o, o], "float64");
      for (let c = 0; c < o; c++) for (let l = 0; l < o; l++) u.set([c, l], Number(a.get(c, l)));
      for (; i > 0; ) i & 1 && (s = cr(s, u)), u = cr(u, u), i >>= 1;
      return s;
    }
    function Na(r, t = 1e-15) {
      if (r.ndim !== 2) throw new Error(`pinv: input must be 2D, got ${r.ndim}D`);
      let [e, n] = r.shape, { u: o, s: a, vt: i } = Br(r), s = Math.min(e, n), c = Number(a.get(0)) * t, l = N.zeros([n, e], "float64");
      for (let m = 0; m < n; m++) for (let d = 0; d < e; d++) {
        let y = 0;
        for (let f = 0; f < s; f++) {
          let p = Number(a.get(f));
          p > c && (y += Number(i.get(f, m)) * Number(o.get(d, f)) / p);
        }
        l.set([m, d], y);
      }
      return l;
    }
    function Ee(r) {
      if (r.ndim !== 2) throw new Error(`eig: input must be 2D, got ${r.ndim}D`);
      let [t, e] = r.shape;
      if (t !== e) throw new Error(`eig: matrix must be square, got ${t}x${e}`);
      let n = t, o = true;
      r: for (let c = 0; c < n; c++) for (let l = c + 1; l < n; l++) if (Math.abs(Number(r.get(c, l)) - Number(r.get(l, c))) > 1e-10) {
        o = false;
        break r;
      }
      if (o) {
        let { values: c, vectors: l } = Fe(r), m = N.zeros([n], "float64"), d = N.zeros([n, n], "float64");
        for (let y = 0; y < n; y++) {
          m.set([y], c[y]);
          for (let f = 0; f < n; f++) d.set([f, y], l[f][y]);
        }
        return { w: m, v: d };
      }
      console.warn("numpy-ts: eig() called on non-symmetric matrix. Complex eigenvalues are not supported; results may be inaccurate. For symmetric matrices, use eigh() instead.");
      let { values: a, vectors: i } = Ty(r), s = N.zeros([n], "float64"), u = N.zeros([n, n], "float64");
      for (let c = 0; c < n; c++) {
        s.set([c], a[c]);
        for (let l = 0; l < n; l++) u.set([l, c], i[l][c]);
      }
      return { w: s, v: u };
    }
    function Ty(r) {
      let t = r.shape[0], e = 1e3, n = 1e-10, o = N.zeros([t, t], "float64");
      for (let u = 0; u < t; u++) for (let c = 0; c < t; c++) o.set([u, c], Number(r.get(u, c)));
      let a = N.zeros([t, t], "float64");
      for (let u = 0; u < t; u++) a.set([u, u], 1);
      for (let u = 0; u < e; u++) {
        let c = 0;
        for (let y = 0; y < t; y++) for (let f = 0; f < t; f++) y !== f && (c += Number(o.get(y, f)) ** 2);
        if (Math.sqrt(c) < n * t) break;
        let l = Me(o, "reduced"), m = l.q, d = l.r;
        o = cr(d, m), a = cr(a, m);
      }
      let i = [];
      for (let u = 0; u < t; u++) i.push(Number(o.get(u, u)));
      let s = [];
      for (let u = 0; u < t; u++) {
        s.push([]);
        for (let c = 0; c < t; c++) s[u].push(Number(a.get(u, c)));
      }
      return { values: i, vectors: s };
    }
    function Te(r, t = "L") {
      if (r.ndim !== 2) throw new Error(`eigh: input must be 2D, got ${r.ndim}D`);
      let [e, n] = r.shape;
      if (e !== n) throw new Error(`eigh: matrix must be square, got ${e}x${n}`);
      let o = e, a = N.zeros([o, o], "float64");
      for (let m = 0; m < o; m++) for (let d = 0; d < o; d++) t === "L" ? m >= d && (a.set([m, d], Number(r.get(m, d))), a.set([d, m], Number(r.get(m, d)))) : d >= m && (a.set([m, d], Number(r.get(m, d))), a.set([d, m], Number(r.get(m, d))));
      let { values: i, vectors: s } = Fe(a), u = Array.from({ length: o }, (m, d) => d);
      u.sort((m, d) => i[m] - i[d]);
      let c = N.zeros([o], "float64"), l = N.zeros([o, o], "float64");
      for (let m = 0; m < o; m++) {
        c.set([m], i[u[m]]);
        for (let d = 0; d < o; d++) l.set([d, m], s[d][u[m]]);
      }
      return { w: c, v: l };
    }
    function xa(r) {
      let { w: t } = Ee(r);
      return t;
    }
    function wa(r, t = "L") {
      let { w: e } = Te(r, t);
      return e;
    }
    function Ia(r, t) {
      let e = Cr(r), n = Cr(t), o = e.shape[0], a = n.shape[0];
      if (o !== a) throw new Error(`vdot: arrays must have same number of elements, got ${o} and ${a}`);
      if (v(r.dtype) || v(t.dtype)) {
        let u = 0, c = 0;
        for (let l = 0; l < o; l++) {
          let m = e.get(l), d = n.get(l), y = m instanceof E ? m.re : Number(m), f = m instanceof E ? -m.im : 0, p = d instanceof E ? d.re : Number(d), g = d instanceof E ? d.im : 0;
          u += y * p + f * g, c += y * g - f * p;
        }
        return Math.abs(c) < 1e-15 ? u : new E(u, c);
      }
      let s = 0;
      for (let u = 0; u < o; u++) {
        let c = e.get(u), l = n.get(u);
        typeof c == "bigint" && typeof l == "bigint" ? s = (typeof s == "bigint" ? s : BigInt(s)) + c * l : s = (typeof s == "bigint" ? Number(s) : s) + Number(c) * Number(l);
      }
      return s;
    }
    function Oe(r, t, e = -1) {
      let n = r.ndim, o = t.ndim, a = e < 0 ? n + e : e, i = e < 0 ? o + e : e;
      if (a < 0 || a >= n) throw new Error(`vecdot: axis ${e} out of bounds for array with ${n} dimensions`);
      if (i < 0 || i >= o) throw new Error(`vecdot: axis ${e} out of bounds for array with ${o} dimensions`);
      let s = r.shape[a], u = t.shape[i];
      if (s !== u) throw new Error(`vecdot: axis dimensions must match, got ${s} and ${u}`);
      if (n === 1 && o === 1) return Zr(r, t);
      let c = [...r.shape.slice(0, a), ...r.shape.slice(a + 1)], l = [...t.shape.slice(0, i), ...t.shape.slice(i + 1)], m = s, d = v(r.dtype) || v(t.dtype), y = W(r.dtype, t.dtype), f = c.length > l.length ? c : l;
      if (f.length === 0) {
        let h = d ? new E(0, 0) : 0;
        for (let b = 0; b < m; b++) {
          let A = r.get(b), S = t.get(b), D = Sr(A, S);
          if (h instanceof E || D instanceof E) {
            let w = h instanceof E ? h : new E(Number(h), 0), x = D instanceof E ? D : new E(Number(D), 0);
            h = w.add(x);
          } else typeof h == "bigint" || typeof D == "bigint" ? h = BigInt(h) + BigInt(D) : h = h + D;
        }
        return h;
      }
      let p = N.zeros(f, y), g = f.reduce((h, b) => h * b, 1);
      for (let h = 0; h < g; h++) {
        let b = [], A = h;
        for (let x = f.length - 1; x >= 0; x--) b.unshift(A % f[x]), A = Math.floor(A / f[x]);
        let S = [...b.slice(0, a), 0, ...b.slice(a)], D = [...b.slice(0, i), 0, ...b.slice(i)], w = d ? new E(0, 0) : 0;
        for (let x = 0; x < m; x++) {
          S[a] = x, D[i] = x;
          let I = r.get(...S), z = t.get(...D), F = Sr(I, z);
          if (w instanceof E || F instanceof E) {
            let M = w instanceof E ? w : new E(Number(w), 0), T = F instanceof E ? F : new E(Number(F), 0);
            w = M.add(T);
          } else typeof w == "bigint" || typeof F == "bigint" ? w = BigInt(w) + BigInt(F) : w = w + F;
        }
        p.set(b, w);
      }
      return p;
    }
    function Ce(r) {
      if (r.ndim < 2) throw new Error(`matrix_transpose: input must have at least 2 dimensions, got ${r.ndim}D`);
      let t = Array.from({ length: r.ndim }, (n, o) => o), e = t.length - 1;
      return t[e] = e - 1, t[e - 1] = e, ct(r, t);
    }
    function za(r, t) {
      return ct(r, t);
    }
    function _a(r, t) {
      if (r.ndim < 2) throw new Error(`matvec: x1 must have at least 2 dimensions, got ${r.ndim}D`);
      if (t.ndim < 1) throw new Error(`matvec: x2 must have at least 1 dimension, got ${t.ndim}D`);
      let e = r.shape[r.ndim - 2], n = r.shape[r.ndim - 1], o = t.shape[t.ndim - 1];
      if (n !== o) throw new Error(`matvec: last axis of x1 (${n}) must match last axis of x2 (${o})`);
      if (r.ndim === 2 && t.ndim === 1) return Zr(r, t);
      let a = r.shape.slice(0, -2), i = t.shape.slice(0, -1), s = Math.max(a.length, i.length), u = [...Array(s - a.length).fill(1), ...a], c = [...Array(s - i.length).fill(1), ...i], l = [];
      for (let g = 0; g < s; g++) {
        let h = u[g], b = c[g];
        if (h !== 1 && b !== 1 && h !== b) throw new Error(`matvec: batch dimensions not broadcastable: ${a} vs ${i}`);
        l.push(Math.max(h, b));
      }
      let m = [...l, e], d = W(r.dtype, t.dtype), y = N.zeros(m, d), f = v(d), p = l.reduce((g, h) => g * h, 1);
      for (let g = 0; g < p; g++) {
        let h = [], b = g;
        for (let D = l.length - 1; D >= 0; D--) h.unshift(b % l[D]), b = Math.floor(b / l[D]);
        let A = h.slice(-(a.length || 1)).map((D, w) => (a[w] ?? 1) === 1 ? 0 : D), S = h.slice(-(i.length || 1)).map((D, w) => (i[w] ?? 1) === 1 ? 0 : D);
        for (let D = 0; D < e; D++) {
          let w = f ? new E(0, 0) : 0;
          for (let I = 0; I < n; I++) {
            let z = [...A, D, I], F = [...S, I], M = r.get(...z), T = t.get(...F), O = Sr(M, T);
            if (w instanceof E || O instanceof E) {
              let C = w instanceof E ? w : new E(Number(w), 0), q = O instanceof E ? O : new E(Number(O), 0);
              w = C.add(q);
            } else typeof w == "bigint" || typeof O == "bigint" ? w = BigInt(w) + BigInt(O) : w = w + O;
          }
          let x = [...h, D];
          y.set(x, w);
        }
      }
      return y;
    }
    function Ma(r, t) {
      if (r.ndim < 1) throw new Error(`vecmat: x1 must have at least 1 dimension, got ${r.ndim}D`);
      if (t.ndim < 2) throw new Error(`vecmat: x2 must have at least 2 dimensions, got ${t.ndim}D`);
      let e = r.shape[r.ndim - 1], n = t.shape[t.ndim - 2], o = t.shape[t.ndim - 1];
      if (e !== n) throw new Error(`vecmat: last axis of x1 (${e}) must match second-to-last axis of x2 (${n})`);
      if (r.ndim === 1 && t.ndim === 2) return Zr(r, t);
      let a = r.shape.slice(0, -1), i = t.shape.slice(0, -2), s = Math.max(a.length, i.length), u = [...Array(s - a.length).fill(1), ...a], c = [...Array(s - i.length).fill(1), ...i], l = [];
      for (let g = 0; g < s; g++) {
        let h = u[g], b = c[g];
        if (h !== 1 && b !== 1 && h !== b) throw new Error(`vecmat: batch dimensions not broadcastable: ${a} vs ${i}`);
        l.push(Math.max(h, b));
      }
      let m = [...l, o], d = W(r.dtype, t.dtype), y = N.zeros(m, d), f = v(d), p = l.reduce((g, h) => g * h, 1);
      for (let g = 0; g < p; g++) {
        let h = [], b = g;
        for (let D = l.length - 1; D >= 0; D--) h.unshift(b % l[D]), b = Math.floor(b / l[D]);
        let A = h.slice(-(a.length || 1)).map((D, w) => (a[w] ?? 1) === 1 ? 0 : D), S = h.slice(-(i.length || 1)).map((D, w) => (i[w] ?? 1) === 1 ? 0 : D);
        for (let D = 0; D < o; D++) {
          let w = f ? new E(0, 0) : 0;
          for (let I = 0; I < e; I++) {
            let z = [...A, I], F = [...S, I, D], M = r.get(...z), T = t.get(...F), O = Sr(M, T);
            if (w instanceof E || O instanceof E) {
              let C = w instanceof E ? w : new E(Number(w), 0), q = O instanceof E ? O : new E(Number(O), 0);
              w = C.add(q);
            } else typeof w == "bigint" || typeof O == "bigint" ? w = BigInt(w) + BigInt(O) : w = w + O;
          }
          let x = [...h, D];
          y.set(x, w);
        }
      }
      return y;
    }
    function Fa(r) {
      if (r.ndim !== 2) throw new Error(`slogdet: input must be 2D, got ${r.ndim}D`);
      let [t, e] = r.shape;
      if (t !== e) throw new Error(`slogdet: matrix must be square, got ${t}x${e}`);
      let n = t;
      if (n === 0) return { sign: 1, logabsdet: 0 };
      let { lu: o, sign: a } = vt(r), i = o.data, s = 0, u = a;
      for (let c = 0; c < n; c++) {
        let l = i[c * n + c];
        if (l === 0) return { sign: 0, logabsdet: -1 / 0 };
        l < 0 && (u = -u), s += Math.log(Math.abs(l));
      }
      return { sign: u, logabsdet: s };
    }
    function va(r) {
      return ve(r, true, false);
    }
    function Ba(r) {
      if (r.length < 2) throw new Error("multi_dot: need at least 2 arrays");
      if (r.length === 2) return cr(r[0], r[1]);
      let t = r[0];
      for (let e = 1; e < r.length; e++) t = cr(t, r[e]);
      return t;
    }
    function Ea(r, t = 2) {
      if (t <= 0) throw new Error(`tensorinv: ind must be positive, got ${t}`);
      let e = r.shape, n = r.ndim;
      if (n < t) throw new Error(`tensorinv: array has ${n} dimensions, ind=${t} is too large`);
      let o = 1;
      for (let c = 0; c < t; c++) o *= e[c];
      let a = 1;
      for (let c = t; c < n; c++) a *= e[c];
      if (o !== a) throw new Error(`tensorinv: product of first ${t} dimensions (${o}) must equal product of remaining dimensions (${a})`);
      let i = K(r, [o, a]), s = lt(i), u = [...e.slice(t), ...e.slice(0, t)];
      return K(s, u);
    }
    function Ta(r, t, e) {
      let n = r.shape, o = t.shape, a = r.ndim, i = t.ndim, s;
      e == null ? s = Array.from({ length: i }, (A, S) => a - i + S) : s = e.map((A) => A < 0 ? a + A : A);
      let u = [];
      for (let A = 0; A < a; A++) s.includes(A) || u.push(A);
      let c = [...u, ...s], l = ct(r, c), d = s.map((A) => n[A]).reduce((A, S) => A * S, 1), f = u.map((A) => n[A]).reduce((A, S) => A * S, 1), p = o.reduce((A, S) => A * S, 1);
      if (d !== p) throw new Error(`tensorsolve: dimensions don't match - sum dimensions product (${d}) != b total elements (${p})`);
      if (f !== d) throw new Error(`tensorsolve: non-square problem - other dimensions product (${f}) != sum dimensions product (${d})`);
      let g = K(l, [f, d]), h = K(t, [d]), b = Be(g, h);
      return K(b, [...o]);
    }
    function Oa(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = Math.sqrt(u * u + c * c), m = Math.sqrt((l + u) / 2), d = (c >= 0 ? 1 : -1) * Math.sqrt((l - u) / 2);
          i[s * 2] = m, i[s * 2 + 1] = d;
        }
        return a;
      }
      return X(r, Math.sqrt, false);
    }
    function Ca(r, t) {
      if (typeof t == "number") return Uy(r, t);
      let e = v(r.dtype), n = v(t.dtype);
      return e || n ? Cy(r, t) : H(r, t, Math.pow, "power");
    }
    function Cy(r, t) {
      let e = v(r.dtype), n = v(t.dtype), o = r.dtype === "complex128" || t.dtype === "complex128" || t.dtype === "float64" ? "complex128" : "complex64", a = Array.from(r.shape), i = r.size, s = N.zeros(a, o), u = s.data;
      for (let c = 0; c < i; c++) {
        let l, m;
        if (e) {
          let S = r.data;
          l = S[c * 2], m = S[c * 2 + 1];
        } else l = Number(r.iget(c)), m = 0;
        let d, y;
        if (n) {
          let S = t.data;
          d = S[c * 2], y = S[c * 2 + 1];
        } else d = Number(t.iget(c)), y = 0;
        let f = Math.sqrt(l * l + m * m), p = Math.atan2(m, l), g = Math.log(f), h = d * g - y * p, b = d * p + y * g, A = Math.exp(h);
        u[c * 2] = A * Math.cos(b), u[c * 2 + 1] = A * Math.sin(b);
      }
      return s;
    }
    function Uy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size;
      if (v(e)) {
        let m = N.zeros(n, e), d = o, y = m.data;
        for (let f = 0; f < a; f++) {
          let p = d[f * 2], g = d[f * 2 + 1], h = Math.sqrt(p * p + g * g), b = Math.atan2(g, p), A = Math.pow(h, t), S = b * t;
          y[f * 2] = A * Math.cos(S), y[f * 2 + 1] = A * Math.sin(S);
        }
        return m;
      }
      let u = e !== "float32" && e !== "float64" && (t < 0 || !Number.isInteger(t)) ? "float64" : e, c = N.zeros(n, u), l = c.data;
      if (B(e)) if (B(u) && Number.isInteger(t) && t >= 0) {
        let m = o, d = l;
        for (let y = 0; y < a; y++) d[y] = m[y] ** BigInt(t);
      } else for (let m = 0; m < a; m++) l[m] = Math.pow(Number(o[m]), t);
      else for (let m = 0; m < a; m++) l[m] = Math.pow(Number(o[m]), t);
      return c;
    }
    function Ua(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = Math.exp(u);
          i[s * 2] = l * Math.cos(c), i[s * 2 + 1] = l * Math.sin(c);
        }
        return a;
      }
      return X(r, Math.exp, false);
    }
    function $a(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = Math.LN2, i = N.zeros(e, t), s = i.data;
        for (let u = 0; u < n; u++) {
          let c = o[u * 2], l = o[u * 2 + 1], m = Math.exp(c * a), d = l * a;
          s[u * 2] = m * Math.cos(d), s[u * 2 + 1] = m * Math.sin(d);
        }
        return i;
      }
      return X(r, (e) => Math.pow(2, e), false);
    }
    function Ra(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = Math.exp(u);
          i[s * 2] = l * Math.cos(c) - 1, i[s * 2 + 1] = l * Math.sin(c);
        }
        return a;
      }
      return X(r, Math.expm1, false);
    }
    function ka(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = Math.sqrt(u * u + c * c), m = Math.atan2(c, u);
          i[s * 2] = Math.log(l), i[s * 2 + 1] = m;
        }
        return a;
      }
      return X(r, Math.log, false);
    }
    function qa(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = 1 / Math.LN2, i = N.zeros(e, t), s = i.data;
        for (let u = 0; u < n; u++) {
          let c = o[u * 2], l = o[u * 2 + 1], m = Math.sqrt(c * c + l * l), d = Math.atan2(l, c);
          s[u * 2] = Math.log(m) * a, s[u * 2 + 1] = d * a;
        }
        return i;
      }
      return X(r, Math.log2, false);
    }
    function Va(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = 1 / Math.LN10, i = N.zeros(e, t), s = i.data;
        for (let u = 0; u < n; u++) {
          let c = o[u * 2], l = o[u * 2 + 1], m = Math.sqrt(c * c + l * l), d = Math.atan2(l, c);
          s[u * 2] = Math.log(m) * a, s[u * 2 + 1] = d * a;
        }
        return i;
      }
      return X(r, Math.log10, false);
    }
    function ja(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = 1 + u, m = Math.sqrt(l * l + c * c), d = Math.atan2(c, l);
          i[s * 2] = Math.log(m), i[s * 2 + 1] = d;
        }
        return a;
      }
      return X(r, Math.log1p, false);
    }
    function Pa(r, t) {
      return U(r.dtype, "logaddexp", "logaddexp is not supported for complex numbers."), typeof t != "number" && U(t.dtype, "logaddexp", "logaddexp is not supported for complex numbers."), typeof t == "number" ? Ry(r, t) : $y(r, t);
    }
    function $y(r, t) {
      let e = Mr(r.shape, t.shape), n = e.reduce((c, l) => c * l, 1), o = r.dtype, a = t.dtype, i = o === "float32" && a === "float32" ? "float32" : "float64", s = N.zeros(e, i), u = s.data;
      for (let c = 0; c < n; c++) {
        let l = (B(o), Number(r.iget(c))), m = (B(a), Number(t.iget(c))), d = Math.max(l, m), y = Math.min(l, m);
        u[c] = d + Math.log1p(Math.exp(y - d));
      }
      return s;
    }
    function Ry(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.size, a = e === "float32" ? "float32" : "float64", i = N.zeros(n, a), s = i.data;
      for (let u = 0; u < o; u++) {
        let c = (B(e), Number(r.data[u])), l = Math.max(c, t), m = Math.min(c, t);
        s[u] = l + Math.log1p(Math.exp(m - l));
      }
      return i;
    }
    function La(r, t) {
      return U(r.dtype, "logaddexp2", "logaddexp2 is not supported for complex numbers."), typeof t != "number" && U(t.dtype, "logaddexp2", "logaddexp2 is not supported for complex numbers."), typeof t == "number" ? qy(r, t) : ky(r, t);
    }
    function ky(r, t) {
      let e = Mr(r.shape, t.shape), n = e.reduce((l, m) => l * m, 1), o = r.dtype, a = t.dtype, i = o === "float32" && a === "float32" ? "float32" : "float64", s = N.zeros(e, i), u = s.data, c = Math.LOG2E;
      for (let l = 0; l < n; l++) {
        let m = (B(o), Number(r.iget(l))), d = (B(a), Number(t.iget(l))), y = Math.max(m, d), f = Math.min(m, d);
        u[l] = y + Math.log1p(Math.pow(2, f - y)) * c;
      }
      return s;
    }
    function qy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.size, a = e === "float32" ? "float32" : "float64", i = N.zeros(n, a), s = i.data, u = Math.LOG2E;
      for (let c = 0; c < o; c++) {
        let l = (B(e), Number(r.data[c])), m = Math.max(l, t), d = Math.min(l, t);
        s[c] = m + Math.log1p(Math.pow(2, d - m)) * u;
      }
      return i;
    }
    function Ga(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1];
          i[s * 2] = Math.sin(u) * Math.cosh(c), i[s * 2 + 1] = Math.cos(u) * Math.sinh(c);
        }
        return a;
      }
      return X(r, Math.sin, false);
    }
    function Wa(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1];
          i[s * 2] = Math.cos(u) * Math.cosh(c), i[s * 2 + 1] = -Math.sin(u) * Math.sinh(c);
        }
        return a;
      }
      return X(r, Math.cos, false);
    }
    function Za(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = Math.cos(2 * u) + Math.cosh(2 * c);
          i[s * 2] = Math.sin(2 * u) / l, i[s * 2 + 1] = Math.sinh(2 * c) / l;
        }
        return a;
      }
      return X(r, Math.tan, false);
    }
    function Ya(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = -c, m = u, d = u * u - c * c, y = 2 * u * c, f = 1 - d, p = -y, g = Math.sqrt(f * f + p * p), h = Math.sqrt((g + f) / 2), b = (p >= 0 ? 1 : -1) * Math.sqrt((g - f) / 2), A = l + h, S = m + b, D = Math.sqrt(A * A + S * S), w = Math.log(D), I = Math.atan2(S, A), z = -w;
          Math.abs(c) < 1e-15 && u > 1 && (z = -z), i[s * 2] = I, i[s * 2 + 1] = z;
        }
        return a;
      }
      return X(r, Math.asin, false);
    }
    function Ha(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = u * u - c * c, m = 2 * u * c, d = 1 - l, y = -m, f = Math.sqrt(d * d + y * y), p = Math.sqrt((f + d) / 2), h = -((y >= 0 ? 1 : -1) * Math.sqrt((f - d) / 2)), b = p, A = u + h, S = c + b, D = Math.sqrt(A * A + S * S), w = Math.log(D), I = Math.atan2(S, A), z = -w;
          Math.abs(c) < 1e-15 && u > 1 && (z = -z), i[s * 2] = I, i[s * 2 + 1] = z;
        }
        return a;
      }
      return X(r, Math.acos, false);
    }
    function Xa(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], l = -o[s * 2 + 1], m = u, d = 1 - l, y = -m, f = 1 + l, p = m, g = f * f + p * p, h = (d * f + y * p) / g, b = (y * f - d * p) / g, A = Math.sqrt(h * h + b * b), S = Math.log(A), D = Math.atan2(b, h);
          i[s * 2] = -D / 2, i[s * 2 + 1] = S / 2;
        }
        return a;
      }
      return X(r, Math.atan, false);
    }
    function Ja(r, t) {
      return U(r.dtype, "arctan2", "arctan2 is only defined for real numbers."), typeof t != "number" && U(t.dtype, "arctan2", "arctan2 is only defined for real numbers."), typeof t == "number" ? Py(r, t) : jy(r, t);
    }
    function jy(r, t) {
      let e = Array.from(r.shape), n = r.size, o = r.dtype, a = t.dtype, i = o === "float32" && a === "float32" ? "float32" : "float64", s = N.zeros(e, i), u = s.data;
      for (let c = 0; c < n; c++) {
        let l = (B(o), Number(r.data[c])), m = (B(a), Number(t.data[c]));
        u[c] = Math.atan2(l, m);
      }
      return s;
    }
    function Py(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = e === "float32" ? "float32" : "float64", s = N.zeros(n, i), u = s.data;
      if (B(e)) for (let c = 0; c < a; c++) u[c] = Math.atan2(Number(o[c]), t);
      else for (let c = 0; c < a; c++) u[c] = Math.atan2(Number(o[c]), t);
      return s;
    }
    function Qa(r, t) {
      return U(r.dtype, "hypot", "hypot is only defined for real numbers."), typeof t != "number" && U(t.dtype, "hypot", "hypot is only defined for real numbers."), typeof t == "number" ? Gy(r, t) : Ly(r, t);
    }
    function Ly(r, t) {
      let e = Array.from(r.shape), n = r.size, o = r.dtype, a = t.dtype, i = o === "float32" && a === "float32" ? "float32" : "float64", s = N.zeros(e, i), u = s.data;
      for (let c = 0; c < n; c++) {
        let l = (B(o), Number(r.data[c])), m = (B(a), Number(t.data[c]));
        u[c] = Math.hypot(l, m);
      }
      return s;
    }
    function Gy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = e === "float32" ? "float32" : "float64", s = N.zeros(n, i), u = s.data;
      if (B(e)) for (let c = 0; c < a; c++) u[c] = Math.hypot(Number(o[c]), t);
      else for (let c = 0; c < a; c++) u[c] = Math.hypot(Number(o[c]), t);
      return s;
    }
    function Ka(r) {
      U(r.dtype, "degrees", "degrees is only defined for real numbers.");
      let t = 180 / Math.PI;
      return X(r, (e) => e * t, false);
    }
    function rs(r) {
      U(r.dtype, "radians", "radians is only defined for real numbers.");
      let t = Math.PI / 180;
      return X(r, (e) => e * t, false);
    }
    function ts(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1];
          i[s * 2] = Math.sinh(u) * Math.cos(c), i[s * 2 + 1] = Math.cosh(u) * Math.sin(c);
        }
        return a;
      }
      return X(r, Math.sinh, false);
    }
    function es(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1];
          i[s * 2] = Math.cosh(u) * Math.cos(c), i[s * 2 + 1] = Math.sinh(u) * Math.sin(c);
        }
        return a;
      }
      return X(r, Math.cosh, false);
    }
    function ns(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = Math.cosh(2 * u) + Math.cos(2 * c);
          i[s * 2] = Math.sinh(2 * u) / l, i[s * 2 + 1] = Math.sin(2 * c) / l;
        }
        return a;
      }
      return X(r, Math.tanh, false);
    }
    function os(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = u * u - c * c, m = 2 * u * c, d = l + 1, y = m, f = Math.sqrt(d * d + y * y), p = Math.sqrt((f + d) / 2), g = (y >= 0 ? 1 : -1) * Math.sqrt((f - d) / 2), h = u + p, b = c + g, A = Math.sqrt(h * h + b * b);
          i[s * 2] = Math.log(A), i[s * 2 + 1] = Math.atan2(b, h);
        }
        return a;
      }
      return X(r, Math.asinh, false);
    }
    function as(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = u * u - c * c, m = 2 * u * c, d = l - 1, y = m, f = Math.sqrt(d * d + y * y), p = Math.sqrt((f + d) / 2), g = (y >= 0 ? 1 : -1) * Math.sqrt((f - d) / 2), h = u + p, b = c + g, A = Math.sqrt(h * h + b * b), S = Math.log(A), D = Math.atan2(b, h);
          Math.abs(c) < 1e-15 && u < 1 && (D = -D), i[s * 2] = S, i[s * 2 + 1] = D;
        }
        return a;
      }
      return X(r, Math.acosh, false);
    }
    function ss(r) {
      let t = r.dtype;
      if (v(t)) {
        let e = Array.from(r.shape), n = r.size, o = r.data, a = N.zeros(e, t), i = a.data;
        for (let s = 0; s < n; s++) {
          let u = o[s * 2], c = o[s * 2 + 1], l = 1 + u, m = c, d = 1 - u, y = -c, f = d * d + y * y, p = (l * d + m * y) / f, g = (m * d - l * y) / f, h = Math.sqrt(p * p + g * g), b = Math.log(h), A = Math.atan2(g, p);
          i[s * 2] = b / 2, i[s * 2 + 1] = A / 2;
        }
        return a;
      }
      return X(r, Math.atanh, false);
    }
    function Bt(r, t) {
      let e = r.shape, n = e.length, o = t.length;
      if (o < n) throw new Error("input operand has more dimensions than allowed by the axis remapping");
      let a = Ar([Array.from(e), t]);
      if (a === null) throw new Error(`operands could not be broadcast together with shape (${e.join(",")}) (${t.join(",")})`);
      for (let i = 0; i < o; i++) if (a[i] !== t[i]) throw new Error(`operands could not be broadcast together with shape (${e.join(",")}) (${t.join(",")})`);
      return pr(r, t);
    }
    function is(r) {
      if (r.length === 0) return [];
      if (r.length === 1) return [r[0]];
      let t = r.map((n) => Array.from(n.shape)), e = Ar(t);
      if (e === null) throw new Error(`operands could not be broadcast together with shapes ${t.map((n) => `(${n.join(",")})`).join(" ")}`);
      return r.map((n) => pr(n, e));
    }
    function us(r, t, e) {
      let n = r.shape, o = n.length, a = r.dtype;
      if (e === void 0) {
        let f = r.size;
        for (let b of t) {
          let A = b < 0 ? f + b : b;
          if (A < 0 || A >= f) throw new Error(`index ${b} is out of bounds for axis 0 with size ${f}`);
        }
        let p = t.length, g = P(a);
        if (!g) throw new Error(`Cannot take from array with dtype ${a}`);
        let h = new g(p);
        for (let b = 0; b < p; b++) {
          let A = t[b];
          A < 0 && (A = f + A);
          let S = r.iget(A);
          B(a), h[b] = S;
        }
        return N.fromData(h, [p], a);
      }
      let i = e < 0 ? o + e : e;
      if (i < 0 || i >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let s = n[i];
      for (let f of t) {
        let p = f < 0 ? s + f : f;
        if (p < 0 || p >= s) throw new Error(`index ${f} is out of bounds for axis ${i} with size ${s}`);
      }
      let u = Array.from(n);
      u[i] = t.length;
      let c = u.reduce((f, p) => f * p, 1), l = P(a);
      if (!l) throw new Error(`Cannot take from array with dtype ${a}`);
      let m = new l(c), d = ar(u), y = new Array(o).fill(0);
      for (let f = 0; f < c; f++) {
        let p = [...y], g = y[i], h = t[g];
        h < 0 && (h = s + h), p[i] = h;
        let b = r.get(...p), A = 0;
        for (let S = 0; S < o; S++) A += y[S] * d[S];
        B(a), m[A] = b;
        for (let S = o - 1; S >= 0 && (y[S]++, !(y[S] < u[S])); S--) y[S] = 0;
      }
      return N.fromData(m, u, a);
    }
    function cs(r, t, e) {
      let n = r.size, o = r.dtype, a;
      if (typeof e == "number" || typeof e == "bigint") a = new Array(t.length).fill(e);
      else {
        a = [];
        for (let i = 0; i < e.size; i++) {
          let s = e.iget(i);
          a.push(s instanceof E ? s.re : s);
        }
        if (a.length === 1) a = new Array(t.length).fill(a[0]);
        else if (a.length !== t.length) {
          let i = [...a];
          a = [];
          for (let s = 0; s < t.length; s++) a.push(i[s % i.length]);
        }
      }
      for (let i = 0; i < t.length; i++) {
        let s = t[i];
        if (s < 0 && (s = n + s), s < 0 || s >= n) throw new Error(`index ${t[i]} is out of bounds for axis 0 with size ${n}`);
        let u = a[i];
        B(o) ? typeof u != "bigint" && (u = BigInt(Math.round(Number(u)))) : typeof u == "bigint" && (u = Number(u)), r.iset(s, u);
      }
    }
    function ls(r, t) {
      if (t.length === 0) throw new Error("choices cannot be empty");
      let e = r.shape, n = t.length, o = t[0].dtype, a = t.map((d) => Array.from(d.shape));
      a.unshift(Array.from(e));
      let i = Ar(a);
      if (i === null) throw new Error("operands could not be broadcast together");
      let s = pr(r, i), u = t.map((d) => pr(d, i)), c = i.reduce((d, y) => d * y, 1), l = P(o);
      if (!l) throw new Error(`Cannot choose with dtype ${o}`);
      let m = new l(c);
      for (let d = 0; d < c; d++) {
        let y = Number(s.iget(d));
        if (y < 0 || y >= n) throw new Error(`index ${y} is out of bounds for axis 0 with size ${n}`);
        let f = u[y].iget(d);
        B(o), m[d] = f;
      }
      return N.fromData(m, i, o);
    }
    function fs(r, t, e = false) {
      if (r.ndim !== t.ndim) return false;
      for (let o = 0; o < r.ndim; o++) if (r.shape[o] !== t.shape[o]) return false;
      let n = r.size;
      for (let o = 0; o < n; o++) {
        let a = r.iget(o), i = t.iget(o);
        if (e) {
          let s = typeof a == "number" && Number.isNaN(a), u = typeof i == "number" && Number.isNaN(i);
          if (s && u) continue;
        }
        if (a !== i) return false;
      }
      return true;
    }
    function ms(r, t, e) {
      let n = r.shape, o = n.length, a = r.dtype, i = e < 0 ? o + e : e;
      if (i < 0 || i >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let s = t.shape;
      if (s.length !== o) throw new Error(`indices and arr must have the same number of dimensions, got ${s.length} vs ${o}`);
      for (let p = 0; p < o; p++) if (p !== i && s[p] !== n[p] && s[p] !== 1 && n[p] !== 1) throw new Error(`index ${s[p]} is out of bounds for size ${n[p]} in dimension ${p}`);
      let u = Array.from(s), c = u.reduce((p, g) => p * g, 1), l = P(a);
      if (!l) throw new Error(`Cannot take_along_axis with dtype ${a}`);
      let m = new l(c), d = ar(n), y = ar(s), f = n[i];
      for (let p = 0; p < c; p++) {
        let g = new Array(o), h = p;
        for (let x = o - 1; x >= 0; x--) g[x] = h % u[x], h = Math.floor(h / u[x]);
        let b = 0;
        for (let x = 0; x < o; x++) {
          let I = s[x] === 1 ? 0 : g[x];
          b += I * y[x];
        }
        let A = Number(t.iget(b));
        if (A < 0 && (A = f + A), A < 0 || A >= f) throw new Error(`index ${A} is out of bounds for axis ${i} with size ${f}`);
        let S = [...g];
        S[i] = A;
        let D = 0;
        for (let x = 0; x < o; x++) {
          let I = n[x] === 1 ? 0 : S[x];
          D += I * d[x];
        }
        let w = r.iget(D);
        B(a), m[p] = w;
      }
      return N.fromData(m, u, a);
    }
    function ps(r, t, e, n) {
      let o = r.shape, a = o.length, i = r.dtype, s = n < 0 ? a + n : n;
      if (s < 0 || s >= a) throw new Error(`axis ${n} is out of bounds for array of dimension ${a}`);
      let u = t.shape, c = e.shape;
      if (u.length !== a || c.length !== a) throw new Error("indices, arr, and values must have same ndim");
      let l = o[s], m = ar(o), d = ar(u), y = ar(c), f = u.reduce((p, g) => p * g, 1);
      for (let p = 0; p < f; p++) {
        let g = new Array(a), h = p;
        for (let I = a - 1; I >= 0; I--) g[I] = h % u[I], h = Math.floor(h / u[I]);
        let b = 0;
        for (let I = 0; I < a; I++) b += g[I] * d[I];
        let A = Number(t.iget(b));
        if (A < 0 && (A = l + A), A < 0 || A >= l) throw new Error(`index ${A} is out of bounds for axis ${s} with size ${l}`);
        let S = 0;
        for (let I = 0; I < a; I++) {
          let z = c[I] === 1 ? 0 : g[I];
          S += z * y[I];
        }
        let D = e.iget(S), w = [...g];
        w[s] = A;
        let x = 0;
        for (let I = 0; I < a; I++) x += w[I] * m[I];
        B(i) ? typeof D != "bigint" && (D = BigInt(Math.round(Number(D)))) : typeof D == "bigint" && (D = Number(D)), r.iset(x, D);
      }
    }
    function ys(r, t, e) {
      let n = r.size, o = r.dtype, a;
      if (typeof e == "number" || typeof e == "bigint") a = [e];
      else {
        a = [];
        for (let s = 0; s < e.size; s++) {
          let u = e.iget(s);
          a.push(u instanceof E ? u.re : u);
        }
      }
      let i = 0;
      for (let s = 0; s < n; s++) if (t.iget(s)) {
        let c = a[i % a.length];
        B(o) ? typeof c != "bigint" && (c = BigInt(Math.round(Number(c)))) : typeof c == "bigint" && (c = Number(c)), r.iset(s, c), i++;
      }
    }
    function Ue(r, t, e) {
      let n = t.shape, o = n.length, a = t.dtype, i = t.data, s = B(a);
      if (e === void 0) {
        let b = 0, A = Math.min(r.size, t.size);
        for (let x = 0; x < A; x++) r.iget(x) && b++;
        let S = P(a);
        if (!S) throw new Error(`Cannot compress with dtype ${a}`);
        let D = new S(b), w = 0;
        for (let x = 0; x < A; x++) r.iget(x) && (D[w] = i[x], w++);
        return N.fromData(D, [b], a);
      }
      let u = e < 0 ? o + e : e;
      if (u < 0 || u >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let c = n[u], l = Math.min(r.size, c), m = [];
      for (let b = 0; b < l; b++) r.iget(b) && m.push(b);
      let d = m.length, y = [...n];
      y[u] = d;
      let f = y.reduce((b, A) => b * A, 1), p = P(a);
      if (!p) throw new Error(`Cannot compress with dtype ${a}`);
      let g = new p(f), h = ar(n);
      if (u === 0) {
        let b = h[0], A = n.slice(1).reduce((D, w) => D * w, 1), S = 0;
        for (let D = 0; D < d; D++) {
          let x = m[D] * b;
          if (s) {
            let I = i, z = g;
            for (let F = 0; F < A; F++) z[S++] = I[x + F];
          } else {
            let I = i, z = g;
            for (let F = 0; F < A; F++) z[S++] = I[x + F];
          }
        }
      } else {
        let b = n.slice(0, u).reduce((D, w) => D * w, 1), A = n.slice(u + 1).reduce((D, w) => D * w, 1), S = 0;
        for (let D = 0; D < b; D++) for (let w = 0; w < d; w++) {
          let x = m[w], I = 0, z = D;
          for (let F = u - 1; F >= 0; F--) {
            let M = z % n[F];
            z = Math.floor(z / n[F]), I += M * h[F];
          }
          if (I += x * h[u], s) {
            let F = i, M = g;
            for (let T = 0; T < A; T++) M[S++] = F[I + T];
          } else {
            let F = i, M = g;
            for (let T = 0; T < A; T++) M[S++] = F[I + T];
          }
        }
      }
      return N.fromData(g, y, a);
    }
    function ds(r, t, e = 0) {
      if (r.length !== t.length) throw new Error("condlist and choicelist must have same length");
      if (r.length === 0) throw new Error("condlist and choicelist cannot be empty");
      let n = [...r.map((d) => Array.from(d.shape)), ...t.map((d) => Array.from(d.shape))], o = Ar(n);
      if (o === null) throw new Error("condlist and choicelist arrays could not be broadcast together");
      let a = t[0].dtype, i = o.reduce((d, y) => d * y, 1), s = P(a);
      if (!s) throw new Error(`Cannot select with dtype ${a}`);
      let u = e;
      B(a) ? u = typeof e == "bigint" ? e : BigInt(e) : u = typeof e == "bigint" ? Number(e) : e;
      let c = new s(i);
      for (let d = 0; d < i; d++) B(a), c[d] = u;
      let l = r.map((d) => pr(d, o)), m = t.map((d) => pr(d, o));
      for (let d = 0; d < i; d++) for (let y = 0; y < r.length; y++) if (l[y].iget(d)) {
        let f = m[y].iget(d);
        B(a), c[d] = f;
        break;
      }
      return N.fromData(c, o, a);
    }
    function gs(r, t, e) {
      let n = r.size, o = r.dtype, a = [];
      for (let s = 0; s < e.size; s++) {
        let u = e.iget(s);
        a.push(u instanceof E ? u.re : u);
      }
      if (a.length === 0) return;
      let i = 0;
      for (let s = 0; s < n; s++) if (t.iget(s)) {
        let c = a[i % a.length];
        B(o) ? typeof c != "bigint" && (c = BigInt(Math.round(Number(c)))) : typeof c == "bigint" && (c = Number(c)), r.iset(s, c), i++;
      }
    }
    function $e(r, t = 2) {
      if (t < 1) throw new Error("ndim must be at least 1");
      let e = new Int32Array(r);
      for (let o = 0; o < r; o++) e[o] = o;
      let n = [];
      for (let o = 0; o < t; o++) n.push(N.fromData(new Int32Array(e), [r], "int32"));
      return n;
    }
    function As(r) {
      let t = r.shape, e = t.length;
      if (e < 2) throw new Error("array must be at least 2-D");
      let n = t[0];
      for (let o = 1; o < e; o++) if (t[o] !== n) throw new Error("All dimensions of input must be equal");
      return $e(n, e);
    }
    function Re(r, t = 0, e) {
      let n = e ?? r, o = [], a = [];
      for (let i = 0; i < r; i++) for (let s = 0; s <= Math.min(i + t, n - 1); s++) s >= 0 && (o.push(i), a.push(s));
      return [N.fromData(new Int32Array(o), [o.length], "int32"), N.fromData(new Int32Array(a), [a.length], "int32")];
    }
    function bs(r, t = 0) {
      let e = r.shape;
      if (e.length !== 2) throw new Error("array must be 2-D");
      return Re(e[0], t, e[1]);
    }
    function ke(r, t = 0, e) {
      let n = e ?? r, o = [], a = [];
      for (let i = 0; i < r; i++) for (let s = Math.max(i + t, 0); s < n; s++) o.push(i), a.push(s);
      return [N.fromData(new Int32Array(o), [o.length], "int32"), N.fromData(new Int32Array(a), [a.length], "int32")];
    }
    function hs(r, t = 0) {
      let e = r.shape;
      if (e.length !== 2) throw new Error("array must be 2-D");
      return ke(e[0], t, e[1]);
    }
    function Ss(r, t, e = 0) {
      let n = t(r, e), o = n.shape;
      if (o.length !== 2 || o[0] !== r || o[1] !== r) throw new Error("mask_func must return n x n array");
      let a = [], i = [];
      for (let s = 0; s < r; s++) for (let u = 0; u < r; u++) n.get(s, u) && (a.push(s), i.push(u));
      return [N.fromData(new Int32Array(a), [a.length], "int32"), N.fromData(new Int32Array(i), [i.length], "int32")];
    }
    function Ds(r, t = "int32") {
      let e = r.length, n = [e, ...r], o = n.reduce((u, c) => u * c, 1), a = P(t);
      if (!a) throw new Error(`Cannot create indices with dtype ${t}`);
      let i = new a(o), s = r.reduce((u, c) => u * c, 1);
      for (let u = 0; u < e; u++) {
        let c = u * s;
        for (let l = 0; l < s; l++) {
          let m = new Array(e), d = l;
          for (let f = e - 1; f >= 0; f--) m[f] = d % r[f], d = Math.floor(d / r[f]);
          let y = m[u];
          t === "int64" ? i[c + l] = BigInt(y) : i[c + l] = y;
        }
      }
      return N.fromData(i, n, t);
    }
    function Ns(...r) {
      let t = r.length, e = [];
      for (let n = 0; n < t; n++) {
        let o = r[n], a = o.size, i = o.dtype, s = new Array(t).fill(1);
        s[n] = a;
        let u = P(i);
        if (!u) throw new Error(`Cannot create ix_ with dtype ${i}`);
        let c = new u(a);
        for (let l = 0; l < a; l++) {
          let m = o.iget(l);
          B(i), c[l] = m;
        }
        e.push(N.fromData(c, s, i));
      }
      return e;
    }
    function xs(r, t, e = "raise") {
      if (r.length !== t.length) throw new Error("multi_index length must equal dims length");
      if (r.length === 0) throw new Error("multi_index cannot be empty");
      let n = r[0].size, o = t.length, a = new Int32Array(n), i = new Array(o), s = 1;
      for (let u = o - 1; u >= 0; u--) i[u] = s, s *= t[u];
      for (let u = 0; u < n; u++) {
        let c = 0;
        for (let l = 0; l < o; l++) {
          let m = Number(r[l].iget(u)), d = t[l];
          if (e === "wrap") m = (m % d + d) % d;
          else if (e === "clip") m = Math.max(0, Math.min(m, d - 1));
          else if (m < 0 || m >= d) throw new Error(`index ${m} is out of bounds for axis ${l} with size ${d}`);
          c += m * i[l];
        }
        a[u] = c;
      }
      return N.fromData(a, [n], "int32");
    }
    function ws(r, t, e = "C") {
      let n = t.length, o, a;
      if (typeof r == "number") o = [r], a = [];
      else {
        o = [];
        for (let l = 0; l < r.size; l++) o.push(Number(r.iget(l)));
        a = Array.from(r.shape);
      }
      let i = o.length, s = t.reduce((l, m) => l * m, 1), u = new Array(n);
      if (e === "C") {
        let l = 1;
        for (let m = n - 1; m >= 0; m--) u[m] = l, l *= t[m];
      } else {
        let l = 1;
        for (let m = 0; m < n; m++) u[m] = l, l *= t[m];
      }
      let c = [];
      for (let l = 0; l < n; l++) {
        let m = new Int32Array(i);
        c.push(N.fromData(m, a.length ? a : [1], "int32"));
      }
      for (let l = 0; l < i; l++) {
        let m = o[l];
        if (m < 0 || m >= s) throw new Error(`index ${m} is out of bounds for array with size ${s}`);
        if (e === "C") for (let d = 0; d < n; d++) {
          let y = Math.floor(m / u[d]);
          m = m % u[d], c[d].data[l] = y % t[d];
        }
        else for (let d = n - 1; d >= 0; d--) {
          let y = Math.floor(m / u[d]);
          m = m % u[d], c[d].data[l] = y % t[d];
        }
      }
      return typeof r == "number" ? c.map((l) => {
        let m = l.iget(0);
        return N.fromData(new Int32Array([Number(m)]), [], "int32");
      }) : c;
    }
    function Is(r, t, e = false) {
      let n = r.shape, o = n.length;
      if (o < 2) throw new Error("array must be at least 2-d");
      let a;
      if (o === 2) a = n[1] + 1;
      else {
        a = 1;
        for (let c = 1; c < o; c++) {
          let l = 1;
          for (let m = c; m < o; m++) l *= n[m];
          a += l;
        }
      }
      let i = r.data, s = r.size, u = Math.min(...n);
      if (e && o === 2 && (u = Math.max(n[0], n[1])), typeof t == "number") for (let c = 0; c < u && c * a < s; c++) {
        let l = c * a;
        if (l < s) i[l] = t;
        else break;
      }
      else {
        let c = t.data, l = t.size;
        for (let m = 0; m < u && m * a < s; m++) {
          let d = m * a;
          if (d < s) i[d] = c[m % l];
          else break;
        }
      }
    }
    function zs(r, t, e) {
      let n = Array.from(r.shape), o = n.length;
      if (t < 0 && (t += o), t < 0 || t >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let a = [];
      for (let i = 0; i < o; i++) i !== t && a.push(n[i]);
      if (a.length === 0) {
        let i = e(r);
        if (typeof i == "number") {
          let s = N.zeros([1], r.dtype);
          return s.data[0] = i, s;
        }
        return i;
      }
      if (o === 2) {
        let [i, s] = n;
        if (t === 0) {
          let u = [];
          for (let l = 0; l < s; l++) {
            let m = new Float64Array(i);
            for (let y = 0; y < i; y++) m[y] = Number(r.data[y * s + l]);
            let d = N.fromData(m, [i], "float64");
            u.push(e(d));
          }
          let c = u[0];
          if (c === void 0) return N.zeros([0], "float64");
          if (typeof c == "number") {
            let l = N.zeros([s], "float64");
            for (let m = 0; m < s; m++) l.data[m] = u[m];
            return l;
          } else {
            let l = [c.size, s], m = N.zeros(l, "float64");
            for (let d = 0; d < s; d++) {
              let y = u[d];
              for (let f = 0; f < y.size; f++) m.data[f * s + d] = Number(y.data[f]);
            }
            return m;
          }
        } else {
          let u = [];
          for (let l = 0; l < i; l++) {
            let m = new Float64Array(s);
            for (let y = 0; y < s; y++) m[y] = Number(r.data[l * s + y]);
            let d = N.fromData(m, [s], "float64");
            u.push(e(d));
          }
          let c = u[0];
          if (c === void 0) return N.zeros([0], "float64");
          if (typeof c == "number") {
            let l = N.zeros([i], "float64");
            for (let m = 0; m < i; m++) l.data[m] = u[m];
            return l;
          } else {
            let l = [i, c.size], m = N.zeros(l, "float64");
            for (let d = 0; d < i; d++) {
              let y = u[d];
              for (let f = 0; f < y.size; f++) m.data[d * y.size + f] = Number(y.data[f]);
            }
            return m;
          }
        }
      }
      if (o === 1) {
        let i = e(r);
        if (typeof i == "number") {
          let s = N.zeros([1], "float64");
          return s.data[0] = i, s;
        }
        return i;
      }
      throw new Error(`apply_along_axis not fully implemented for ${o}D arrays. Only 1D and 2D arrays are supported.`);
    }
    function _s(r, t, e) {
      let n = r, o = r.shape.length;
      for (let a of e) {
        let i = a < 0 ? a + o : a;
        if (i < 0 || i >= o) throw new Error(`axis ${a} is out of bounds for array of dimension ${o}`);
        if (n = t(n, i), n.shape.length < o) {
          let s = Array.from(n.shape);
          s.splice(i, 0, 1);
          let u = ar(s);
          n = new N(n.data, s, u, 0, n.dtype);
        }
      }
      return n;
    }
    function qe(r, t) {
      return r.data.buffer === t.data.buffer;
    }
    function Ms(r, t) {
      return qe(r, t);
    }
    var _r = { divide: "warn", over: "warn", under: "ignore", invalid: "warn" };
    function Et() {
      return { ..._r };
    }
    function Ve(r, t, e, n, o) {
      let a = Et();
      return r !== void 0 && (_r.divide = r, _r.over = r, _r.under = r, _r.invalid = r), t !== void 0 && (_r.divide = t), e !== void 0 && (_r.over = e), n !== void 0 && (_r.under = n), o !== void 0 && (_r.invalid = o), a;
    }
    function dr(r, t) {
      if (!Xn(r) && r !== "bool") throw new TypeError(`ufunc '${t}' not supported for the input types, and the inputs could not be safely coerced to any supported types`);
    }
    function ft(r, t) {
      return r.isCContiguous && t.isCContiguous && r.shape.length === t.shape.length && r.shape.every((e, n) => e === t.shape[n]);
    }
    function Bs(r, t) {
      return dr(r.dtype, "bitwise_and"), typeof t == "number" ? Xy(r, t) : (dr(t.dtype, "bitwise_and"), ft(r, t) ? Hy(r, t) : H(r, t, (e, n) => e & n, "bitwise_and"));
    }
    function Hy(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (B(e)) {
        let u = s;
        if (!B(r.dtype) || !B(t.dtype)) for (let l = 0; l < o; l++) {
          let m = typeof a[l] == "bigint" ? a[l] : BigInt(Math.round(Number(a[l]))), d = typeof i[l] == "bigint" ? i[l] : BigInt(Math.round(Number(i[l])));
          u[l] = m & d;
        }
        else {
          let l = a, m = i;
          for (let d = 0; d < o; d++) u[d] = l[d] & m[d];
        }
      } else for (let u = 0; u < o; u++) s[u] = a[u] & i[u];
      return n;
    }
    function Xy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] & l;
      } else for (let u = 0; u < a; u++) s[u] = o[u] & t;
      return i;
    }
    function Es(r, t) {
      return dr(r.dtype, "bitwise_or"), typeof t == "number" ? Qy(r, t) : (dr(t.dtype, "bitwise_or"), ft(r, t) ? Jy(r, t) : H(r, t, (e, n) => e | n, "bitwise_or"));
    }
    function Jy(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (B(e)) {
        let u = s;
        if (!B(r.dtype) || !B(t.dtype)) for (let l = 0; l < o; l++) {
          let m = typeof a[l] == "bigint" ? a[l] : BigInt(Math.round(Number(a[l]))), d = typeof i[l] == "bigint" ? i[l] : BigInt(Math.round(Number(i[l])));
          u[l] = m | d;
        }
        else {
          let l = a, m = i;
          for (let d = 0; d < o; d++) u[d] = l[d] | m[d];
        }
      } else for (let u = 0; u < o; u++) s[u] = a[u] | i[u];
      return n;
    }
    function Qy(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] | l;
      } else for (let u = 0; u < a; u++) s[u] = o[u] | t;
      return i;
    }
    function Ts(r, t) {
      return dr(r.dtype, "bitwise_xor"), typeof t == "number" ? rd(r, t) : (dr(t.dtype, "bitwise_xor"), ft(r, t) ? Ky(r, t) : H(r, t, (e, n) => e ^ n, "bitwise_xor"));
    }
    function Ky(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (B(e)) {
        let u = s;
        if (!B(r.dtype) || !B(t.dtype)) for (let l = 0; l < o; l++) {
          let m = typeof a[l] == "bigint" ? a[l] : BigInt(Math.round(Number(a[l]))), d = typeof i[l] == "bigint" ? i[l] : BigInt(Math.round(Number(i[l])));
          u[l] = m ^ d;
        }
        else {
          let l = a, m = i;
          for (let d = 0; d < o; d++) u[d] = l[d] ^ m[d];
        }
      } else for (let u = 0; u < o; u++) s[u] = a[u] ^ i[u];
      return n;
    }
    function rd(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] ^ l;
      } else for (let u = 0; u < a; u++) s[u] = o[u] ^ t;
      return i;
    }
    function Ot(r) {
      dr(r.dtype, "bitwise_not");
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = N.zeros(e, t), i = a.data;
      if (B(t)) {
        let s = n, u = i;
        for (let c = 0; c < o; c++) u[c] = ~s[c];
      } else for (let s = 0; s < o; s++) i[s] = ~n[s];
      return a;
    }
    function Os(r) {
      return Ot(r);
    }
    function je(r, t) {
      if (dr(r.dtype, "left_shift"), typeof t == "number") return Fs(r, t);
      if (dr(t.dtype, "left_shift"), t.size === 1 || t.ndim === 1 && t.shape[0] === 1) {
        let e = B(t.dtype) ? Number(t.data[0]) : t.data[0];
        return Fs(r, e);
      }
      return ft(r, t) ? td(r, t) : H(r, t, (e, n) => e << n, "left_shift");
    }
    function td(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (B(e)) {
        let u = s;
        for (let c = 0; c < o; c++) {
          let l = typeof a[c] == "bigint" ? a[c] : BigInt(Math.round(Number(a[c]))), m = typeof i[c] == "bigint" ? i[c] : BigInt(Math.round(Number(i[c])));
          u[c] = l << m;
        }
      } else for (let u = 0; u < o; u++) s[u] = a[u] << i[u];
      return n;
    }
    function Fs(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] << l;
      } else for (let u = 0; u < a; u++) s[u] = o[u] << t;
      return i;
    }
    function Pe(r, t) {
      if (dr(r.dtype, "right_shift"), typeof t == "number") return vs(r, t);
      if (dr(t.dtype, "right_shift"), t.size === 1 || t.ndim === 1 && t.shape[0] === 1) {
        let e = B(t.dtype) ? Number(t.data[0]) : t.data[0];
        return vs(r, e);
      }
      return ft(r, t) ? ed(r, t) : H(r, t, (e, n) => e >> n, "right_shift");
    }
    function ed(r, t) {
      let e = W(r.dtype, t.dtype), n = N.zeros(Array.from(r.shape), e), o = r.size, a = r.data, i = t.data, s = n.data;
      if (B(e)) {
        let u = s;
        for (let c = 0; c < o; c++) {
          let l = typeof a[c] == "bigint" ? a[c] : BigInt(Math.round(Number(a[c]))), m = typeof i[c] == "bigint" ? i[c] : BigInt(Math.round(Number(i[c])));
          u[c] = l >> m;
        }
      } else for (let u = 0; u < o; u++) s[u] = a[u] >> i[u];
      return n;
    }
    function vs(r, t) {
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = N.zeros(n, e), s = i.data;
      if (B(e)) {
        let u = o, c = s, l = BigInt(Math.round(t));
        for (let m = 0; m < a; m++) c[m] = u[m] >> l;
      } else for (let u = 0; u < a; u++) s[u] = o[u] >> t;
      return i;
    }
    function Cs(r, t = -1, e = "big") {
      let n = Array.from(r.shape), o = n.length;
      if (t < 0 && (t = o + t), t < 0 || t >= o) throw new Error(`axis ${t} is out of bounds for array of dimension ${o}`);
      let a = n[t], i = Math.ceil(a / 8), s = [...n];
      s[t] = i;
      let u = N.zeros(s, "uint8"), c = u.data;
      if (o === 1) {
        for (let g = 0; g < i; g++) {
          let h = 0;
          for (let b = 0; b < 8; b++) {
            let A = g * 8 + b;
            if (A < a) {
              let S = Number(r.data[A]) !== 0 ? 1 : 0;
              e === "big" ? h |= S << 7 - b : h |= S << b;
            }
          }
          c[g] = h;
        }
        return u;
      }
      let l = n.slice(0, t), m = n.slice(t + 1), d = l.reduce((g, h) => g * h, 1), y = m.reduce((g, h) => g * h, 1), f = Tt(n), p = Tt(s);
      for (let g = 0; g < d; g++) for (let h = 0; h < y; h++) for (let b = 0; b < i; b++) {
        let A = 0;
        for (let x = 0; x < 8; x++) {
          let I = b * 8 + x;
          if (I < a) {
            let z = 0, F = g;
            for (let O = 0; O < t; O++) {
              let C = O < t - 1 ? l.slice(O + 1).reduce((V, k) => V * k, 1) : 1, q = Math.floor(F / C);
              F %= C, z += q * f[O];
            }
            z += I * f[t];
            let M = h;
            for (let O = t + 1; O < o; O++) {
              let C = O < o - 1 ? m.slice(O - t).reduce((V, k) => V * k, 1) : 1, q = Math.floor(M / C);
              M %= C, z += q * f[O];
            }
            let T = Number(r.data[z]) !== 0 ? 1 : 0;
            e === "big" ? A |= T << 7 - x : A |= T << x;
          }
        }
        let S = 0, D = g;
        for (let x = 0; x < t; x++) {
          let I = x < t - 1 ? l.slice(x + 1).reduce((F, M) => F * M, 1) : 1, z = Math.floor(D / I);
          D %= I, S += z * p[x];
        }
        S += b * p[t];
        let w = h;
        for (let x = t + 1; x < o; x++) {
          let I = x < o - 1 ? m.slice(x - t).reduce((F, M) => F * M, 1) : 1, z = Math.floor(w / I);
          w %= I, S += z * p[x];
        }
        c[S] = A;
      }
      return u;
    }
    function Us(r, t = -1, e = -1, n = "big") {
      if (r.dtype !== "uint8") throw new TypeError("Expected an input array of unsigned byte data type");
      let o = Array.from(r.shape), a = o.length;
      if (t < 0 && (t = a + t), t < 0 || t >= a) throw new Error(`axis ${t} is out of bounds for array of dimension ${a}`);
      let i = o[t], s = i * 8;
      e >= 0 && (s = e);
      let u = [...o];
      u[t] = s;
      let c = N.zeros(u, "uint8"), l = c.data;
      if (a === 1) {
        for (let h = 0; h < i; h++) {
          let b = Number(r.data[h]);
          for (let A = 0; A < 8; A++) {
            let S = h * 8 + A;
            if (S >= s) break;
            n === "big" ? l[S] = b >> 7 - A & 1 : l[S] = b >> A & 1;
          }
        }
        return c;
      }
      let m = o.slice(0, t), d = o.slice(t + 1), y = m.reduce((h, b) => h * b, 1), f = d.reduce((h, b) => h * b, 1), p = Tt(o), g = Tt(u);
      for (let h = 0; h < y; h++) for (let b = 0; b < f; b++) for (let A = 0; A < i; A++) {
        let S = 0, D = h;
        for (let I = 0; I < t; I++) {
          let z = I < t - 1 ? m.slice(I + 1).reduce((M, T) => M * T, 1) : 1, F = Math.floor(D / z);
          D %= z, S += F * p[I];
        }
        S += A * p[t];
        let w = b;
        for (let I = t + 1; I < a; I++) {
          let z = I < a - 1 ? d.slice(I - t).reduce((M, T) => M * T, 1) : 1, F = Math.floor(w / z);
          w %= z, S += F * p[I];
        }
        let x = Number(r.data[S]);
        for (let I = 0; I < 8; I++) {
          let z = A * 8 + I;
          if (z >= s) break;
          let F = 0;
          D = h;
          for (let M = 0; M < t; M++) {
            let T = M < t - 1 ? m.slice(M + 1).reduce((C, q) => C * q, 1) : 1, O = Math.floor(D / T);
            D %= T, F += O * g[M];
          }
          F += z * g[t], w = b;
          for (let M = t + 1; M < a; M++) {
            let T = M < a - 1 ? d.slice(M - t).reduce((C, q) => C * q, 1) : 1, O = Math.floor(w / T);
            w %= T, F += O * g[M];
          }
          n === "big" ? l[F] = x >> 7 - I & 1 : l[F] = x >> I & 1;
        }
      }
      return c;
    }
    function Tt(r) {
      let t = r.length, e = new Array(t), n = 1;
      for (let o = t - 1; o >= 0; o--) e[o] = n, n *= r[o];
      return e;
    }
    function $s(r) {
      let t = r.dtype;
      dr(t, "bitwise_count");
      let e = Array.from(r.shape), n = r.data, o = r.size, a = N.zeros(e, "uint8"), i = a.data;
      if (B(t)) {
        let s = n;
        for (let u = 0; u < o; u++) i[u] = od(s[u]);
      } else for (let s = 0; s < o; s++) {
        let u = n[s];
        i[s] = nd(u);
      }
      return a;
    }
    function nd(r) {
      r = r >>> 0;
      let t = 0;
      for (; r !== 0; ) r = r & r - 1, t++;
      return t;
    }
    function od(r) {
      r < 0n && (r = BigInt.asUintN(64, r));
      let t = 0;
      for (; r !== 0n; ) r = r & r - 1n, t++;
      return t;
    }
    function Rs(r) {
      return Ot(r);
    }
    function ks(r, t) {
      return je(r, t);
    }
    function qs(r, t) {
      return Pe(r, t);
    }
    function Yr(r) {
      return r !== 0 && r !== 0n;
    }
    function Dr(r, t) {
      let e = r[t * 2], n = r[t * 2 + 1];
      return e !== 0 || n !== 0;
    }
    function pt(r, t) {
      return r.isCContiguous && t.isCContiguous && r.shape.length === t.shape.length && r.shape.every((e, n) => e === t.shape[n]);
    }
    function js(r, t) {
      return typeof t == "number" ? id(r, t) : pt(r, t) ? sd(r, t) : yr(r, t, (e, n) => Yr(e) && Yr(n));
    }
    function sd(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = t.data, a = r.size, i = B(r.dtype), s = B(t.dtype), u = v(r.dtype), c = v(t.dtype);
      if (u || c) for (let l = 0; l < a; l++) {
        let m = u ? Dr(n, l) : n[l] !== 0, d = c ? Dr(o, l) : o[l] !== 0;
        e[l] = m && d ? 1 : 0;
      }
      else if (i || s) for (let l = 0; l < a; l++) {
        let m = i ? n[l] !== 0n : n[l] !== 0, d = s ? o[l] !== 0n : o[l] !== 0;
        e[l] = m && d ? 1 : 0;
      }
      else for (let l = 0; l < a; l++) e[l] = n[l] !== 0 && o[l] !== 0 ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function id(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = t !== 0, a = r.size;
      if (v(r.dtype)) {
        let i = n;
        for (let s = 0; s < a; s++) e[s] = Dr(i, s) && o ? 1 : 0;
      } else if (B(r.dtype)) {
        let i = n;
        for (let s = 0; s < a; s++) e[s] = i[s] !== 0n && o ? 1 : 0;
      } else for (let i = 0; i < a; i++) e[i] = n[i] !== 0 && o ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function Ps(r, t) {
      return typeof t == "number" ? cd(r, t) : pt(r, t) ? ud(r, t) : yr(r, t, (e, n) => Yr(e) || Yr(n));
    }
    function ud(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = t.data, a = r.size, i = B(r.dtype), s = B(t.dtype), u = v(r.dtype), c = v(t.dtype);
      if (u || c) for (let l = 0; l < a; l++) {
        let m = u ? Dr(n, l) : n[l] !== 0, d = c ? Dr(o, l) : o[l] !== 0;
        e[l] = m || d ? 1 : 0;
      }
      else if (i || s) for (let l = 0; l < a; l++) {
        let m = i ? n[l] !== 0n : n[l] !== 0, d = s ? o[l] !== 0n : o[l] !== 0;
        e[l] = m || d ? 1 : 0;
      }
      else for (let l = 0; l < a; l++) e[l] = n[l] !== 0 || o[l] !== 0 ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function cd(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = t !== 0, a = r.size;
      if (v(r.dtype)) {
        let i = n;
        for (let s = 0; s < a; s++) e[s] = Dr(i, s) || o ? 1 : 0;
      } else if (B(r.dtype)) {
        let i = n;
        for (let s = 0; s < a; s++) e[s] = i[s] !== 0n || o ? 1 : 0;
      } else for (let i = 0; i < a; i++) e[i] = n[i] !== 0 || o ? 1 : 0;
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function Ls(r) {
      let t = new Uint8Array(r.size), e = r.data, n = r.size;
      if (v(r.dtype)) {
        let o = e;
        for (let a = 0; a < n; a++) t[a] = Dr(o, a) ? 0 : 1;
      } else if (B(r.dtype)) {
        let o = e;
        for (let a = 0; a < n; a++) t[a] = o[a] === 0n ? 1 : 0;
      } else for (let o = 0; o < n; o++) t[o] = e[o] === 0 ? 1 : 0;
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function Gs(r, t) {
      return typeof t == "number" ? fd(r, t) : pt(r, t) ? ld(r, t) : yr(r, t, (e, n) => Yr(e) !== Yr(n));
    }
    function ld(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = t.data, a = r.size, i = B(r.dtype), s = B(t.dtype), u = v(r.dtype), c = v(t.dtype);
      if (u || c) for (let l = 0; l < a; l++) {
        let m = u ? Dr(n, l) : n[l] !== 0, d = c ? Dr(o, l) : o[l] !== 0;
        e[l] = m !== d ? 1 : 0;
      }
      else if (i || s) for (let l = 0; l < a; l++) {
        let m = i ? n[l] !== 0n : n[l] !== 0, d = s ? o[l] !== 0n : o[l] !== 0;
        e[l] = m !== d ? 1 : 0;
      }
      else for (let l = 0; l < a; l++) {
        let m = n[l] !== 0, d = o[l] !== 0;
        e[l] = m !== d ? 1 : 0;
      }
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function fd(r, t) {
      let e = new Uint8Array(r.size), n = r.data, o = t !== 0, a = r.size;
      if (v(r.dtype)) {
        let i = n;
        for (let s = 0; s < a; s++) {
          let u = Dr(i, s);
          e[s] = u !== o ? 1 : 0;
        }
      } else if (B(r.dtype)) {
        let i = n;
        for (let s = 0; s < a; s++) {
          let u = i[s] !== 0n;
          e[s] = u !== o ? 1 : 0;
        }
      } else for (let i = 0; i < a; i++) {
        let s = n[i] !== 0;
        e[i] = s !== o ? 1 : 0;
      }
      return N.fromData(e, Array.from(r.shape), "bool");
    }
    function Ws(r) {
      let t = new Uint8Array(r.size), e = r.data, n = r.size;
      if (v(r.dtype)) {
        let o = e;
        for (let a = 0; a < n; a++) {
          let i = o[a * 2], s = o[a * 2 + 1];
          t[a] = Number.isFinite(i) && Number.isFinite(s) ? 1 : 0;
        }
      } else if (B(r.dtype)) for (let o = 0; o < n; o++) t[o] = 1;
      else for (let o = 0; o < n; o++) {
        let a = e[o];
        t[o] = Number.isFinite(a) ? 1 : 0;
      }
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function Zs(r) {
      let t = new Uint8Array(r.size), e = r.data, n = r.size;
      if (v(r.dtype)) {
        let o = e;
        for (let a = 0; a < n; a++) {
          let i = o[a * 2], s = o[a * 2 + 1], u = !Number.isFinite(i) && !Number.isNaN(i), c = !Number.isFinite(s) && !Number.isNaN(s);
          t[a] = u || c ? 1 : 0;
        }
      } else if (B(r.dtype)) for (let o = 0; o < n; o++) t[o] = 0;
      else for (let o = 0; o < n; o++) {
        let a = e[o];
        t[o] = !Number.isFinite(a) && !Number.isNaN(a) ? 1 : 0;
      }
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function Ys(r) {
      let t = new Uint8Array(r.size), e = r.data, n = r.size;
      if (v(r.dtype)) {
        let o = e;
        for (let a = 0; a < n; a++) {
          let i = o[a * 2], s = o[a * 2 + 1];
          t[a] = Number.isNaN(i) || Number.isNaN(s) ? 1 : 0;
        }
      } else if (B(r.dtype)) for (let o = 0; o < n; o++) t[o] = 0;
      else for (let o = 0; o < n; o++) t[o] = Number.isNaN(e[o]) ? 1 : 0;
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function Hs(r) {
      let t = new Uint8Array(r.size);
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function Xs(r, t) {
      if (U(r.dtype, "copysign", "copysign is only defined for real numbers."), typeof t != "number" && U(t.dtype, "copysign", "copysign is only defined for real numbers."), typeof t == "number") return pd(r, t);
      if (pt(r, t)) return md(r, t);
      let e = Mr(r.shape, t.shape), n = e.reduce((u, c) => u * c, 1), o = N.zeros(e, "float64"), a = o.data, i = Ct(r, e), s = Ct(t, e);
      for (let u = 0; u < n; u++) {
        let c = Number(i.iget(u)), l = Number(s.iget(u));
        a[u] = Math.sign(l) * Math.abs(c);
      }
      return o;
    }
    function md(r, t) {
      let e = N.zeros(Array.from(r.shape), "float64"), n = e.data, o = r.size, a = r.data, i = t.data, s = B(r.dtype), u = B(t.dtype);
      for (let c = 0; c < o; c++) {
        let l = s ? Number(a[c]) : a[c], m = u ? Number(i[c]) : i[c];
        n[c] = Math.sign(m) * Math.abs(l);
      }
      return e;
    }
    function pd(r, t) {
      let e = N.zeros(Array.from(r.shape), "float64"), n = e.data, o = r.data, a = r.size, i = Math.sign(t);
      if (B(r.dtype)) {
        let s = o;
        for (let u = 0; u < a; u++) n[u] = i * Math.abs(Number(s[u]));
      } else for (let s = 0; s < a; s++) n[s] = i * Math.abs(o[s]);
      return e;
    }
    function Js(r) {
      U(r.dtype, "signbit", "signbit is only defined for real numbers.");
      let t = new Uint8Array(r.size), e = r.data, n = r.size;
      if (B(r.dtype)) {
        let o = e;
        for (let a = 0; a < n; a++) t[a] = o[a] < 0n ? 1 : 0;
      } else for (let o = 0; o < n; o++) {
        let a = e[o];
        t[o] = a < 0 || Object.is(a, -0) ? 1 : 0;
      }
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function Qs(r, t) {
      if (U(r.dtype, "nextafter", "nextafter is only defined for real numbers."), typeof t != "number" && U(t.dtype, "nextafter", "nextafter is only defined for real numbers."), typeof t == "number") return dd(r, t);
      if (pt(r, t)) return yd(r, t);
      let e = Mr(r.shape, t.shape), n = e.reduce((u, c) => u * c, 1), o = N.zeros(e, "float64"), a = o.data, i = Ct(r, e), s = Ct(t, e);
      for (let u = 0; u < n; u++) {
        let c = Number(i.iget(u)), l = Number(s.iget(u));
        a[u] = mt(c, l);
      }
      return o;
    }
    function yd(r, t) {
      let e = N.zeros(Array.from(r.shape), "float64"), n = e.data, o = r.size, a = r.data, i = t.data, s = B(r.dtype), u = B(t.dtype);
      for (let c = 0; c < o; c++) {
        let l = s ? Number(a[c]) : a[c], m = u ? Number(i[c]) : i[c];
        n[c] = mt(l, m);
      }
      return e;
    }
    function dd(r, t) {
      let e = N.zeros(Array.from(r.shape), "float64"), n = e.data, o = r.data, a = r.size;
      if (B(r.dtype)) {
        let i = o;
        for (let s = 0; s < a; s++) n[s] = mt(Number(i[s]), t);
      } else for (let i = 0; i < a; i++) n[i] = mt(o[i], t);
      return e;
    }
    function mt(r, t) {
      if (Number.isNaN(r) || Number.isNaN(t)) return NaN;
      if (r === t) return t;
      if (r === 0) return t > 0 ? Number.MIN_VALUE : -Number.MIN_VALUE;
      let e = new ArrayBuffer(8), n = new Float64Array(e), o = new BigInt64Array(e);
      n[0] = r;
      let a = o[0];
      return r > 0 && t > r || r < 0 && t > r ? a = a + 1n : a = a - 1n, o[0] = a, n[0];
    }
    function Ks(r) {
      U(r.dtype, "spacing", "spacing is only defined for real numbers.");
      let t = N.zeros(Array.from(r.shape), "float64"), e = t.data, n = r.data, o = r.size;
      if (B(r.dtype)) {
        let a = n;
        for (let i = 0; i < o; i++) e[i] = Vs(Number(a[i]));
      } else for (let a = 0; a < o; a++) e[a] = Vs(n[a]);
      return t;
    }
    function Vs(r) {
      if (Number.isNaN(r)) return NaN;
      if (!Number.isFinite(r)) return NaN;
      if (Math.abs(r) === 0) return Number.MIN_VALUE;
      let e = mt(r, 1 / 0);
      return Math.abs(e - r);
    }
    function Ct(r, t) {
      let e = r.shape.length, n = t.length, o = new Array(n).fill(0);
      for (let a = 0; a < e; a++) {
        let i = n - e + a, s = r.shape[a], u = t[i];
        if (s === u) o[i] = r.strides[a];
        else if (s === 1) o[i] = 0;
        else throw new Error("Invalid broadcast");
      }
      return N.fromData(r.data, Array.from(t), r.dtype, o, r.offset);
    }
    function ri(r) {
      let t = r.dtype, e = r.size, n = new Uint8Array(e);
      if (v(t)) {
        let o = r.data;
        for (let a = 0; a < e; a++) n[a] = o[a * 2 + 1] !== 0 ? 1 : 0;
      }
      return N.fromData(n, Array.from(r.shape), "bool");
    }
    function ti(r) {
      return v(r.dtype);
    }
    function ei(r) {
      let t = r.dtype, e = r.size, n = new Uint8Array(e);
      if (v(t)) {
        let o = r.data;
        for (let a = 0; a < e; a++) n[a] = o[a * 2 + 1] === 0 ? 1 : 0;
      } else n.fill(1);
      return N.fromData(n, Array.from(r.shape), "bool");
    }
    function ni(r) {
      return !v(r.dtype);
    }
    function oi(r) {
      U(r.dtype, "isneginf", "This operation is not supported for complex values because it would be ambiguous.");
      let t = new Uint8Array(r.size), e = r.data, n = r.size;
      if (!B(r.dtype)) for (let o = 0; o < n; o++) {
        let a = e[o];
        t[o] = a === -1 / 0 ? 1 : 0;
      }
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function ai(r) {
      U(r.dtype, "isposinf", "This operation is not supported for complex values because it would be ambiguous.");
      let t = new Uint8Array(r.size), e = r.data, n = r.size;
      if (!B(r.dtype)) for (let o = 0; o < n; o++) {
        let a = e[o];
        t[o] = a === 1 / 0 ? 1 : 0;
      }
      return N.fromData(t, Array.from(r.shape), "bool");
    }
    function si(r) {
      return r.isFContiguous;
    }
    function ii(r, t = 100) {
      let e = r.dtype;
      if (v(e)) {
        let n = r.data, o = r.size, i = t * (e === "complex64" ? 11920929e-14 : 2220446049250313e-31), s = true;
        for (let u = 0; u < o; u++) {
          let c = n[u * 2 + 1];
          if (Math.abs(c) > i) {
            s = false;
            break;
          }
        }
        if (s) {
          let u = e === "complex64" ? "float32" : "float64", c = N.zeros(Array.from(r.shape), u), l = c.data;
          for (let m = 0; m < o; m++) l[m] = n[m * 2];
          return c;
        }
        return r.copy();
      }
      return r.copy();
    }
    function ui(r) {
      return typeof r == "number" || typeof r == "bigint" || typeof r == "boolean" || typeof r == "string";
    }
    function ci(r) {
      return r == null ? false : typeof r[Symbol.iterator] == "function";
    }
    function li(r, t) {
      let n = { b: ["bool"], i: ["int8", "int16", "int32", "int64"], u: ["uint8", "uint16", "uint32", "uint64"], f: ["float32", "float64"] }[t];
      return n ? n.includes(r) : false;
    }
    function fi(r, t) {
      let e = ["float64", "float32", "int64", "int32", "int16", "int8", "uint64", "uint32", "uint16", "uint8", "bool"], n = e.indexOf(r), o = e.indexOf(t);
      return n <= o ? r : t;
    }
    function mi(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.size;
      if (v(t)) {
        let o = Qr(t), a = N.zeros(e, o), i = a.data, s = r.data;
        for (let u = 0; u < n; u++) i[u] = s[u * 2];
        return a;
      }
      return r.copy();
    }
    function pi(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.size;
      if (v(t)) {
        let a = Qr(t), i = N.zeros(e, a), s = i.data, u = r.data;
        for (let c = 0; c < n; c++) s[c] = u[c * 2 + 1];
        return i;
      }
      let o = t === "float32" ? "float32" : "float64";
      return N.zeros(e, o);
    }
    function yi(r) {
      let t = r.dtype, e = Array.from(r.shape), n = r.size;
      if (v(t)) {
        let o = P(t), a = n * 2, i = new o(a), s = r.data;
        for (let u = 0; u < n; u++) i[u * 2] = s[u * 2], i[u * 2 + 1] = -s[u * 2 + 1];
        return N.fromData(i, e, t);
      }
      return r.copy();
    }
    function di(r, t = false) {
      let e = r.dtype, n = Array.from(r.shape), o = r.size, a = N.zeros(n, "float64"), i = a.data;
      if (v(e)) {
        let s = r.data;
        for (let u = 0; u < o; u++) {
          let c = s[u * 2], l = s[u * 2 + 1], m = Math.atan2(l, c);
          t && (m = m * 180 / Math.PI), i[u] = m;
        }
      } else for (let s = 0; s < o; s++) {
        let u = r.iget(s), l = (u instanceof E ? u.re : Number(u)) >= 0 ? 0 : Math.PI;
        t && (l = l * 180 / Math.PI), i[s] = l;
      }
      return a;
    }
    function Nr(r, t, e) {
      if (e) {
        let n = r[t * 2], o = r[t * 2 + 1];
        return n !== 0 || o !== 0;
      }
      return !!r[t];
    }
    function yt(r, t, e, n) {
      let o = isNaN(r) || isNaN(t), a = isNaN(e) || isNaN(n);
      return o && a ? 0 : o ? 1 : a || r < e ? -1 : r > e ? 1 : t < n ? -1 : t > n ? 1 : 0;
    }
    function Le(r, t = -1) {
      let e = r.shape, n = e.length, o = r.dtype, a = r.data;
      if (n === 0) return r.copy();
      let i = t;
      if (i < 0 && (i = n + i), i < 0 || i >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
      let s = r.copy(), u = s.data, c = e[i], l = Array.from(e).filter((d, y) => y !== i), m = l.length === 0 ? 1 : l.reduce((d, y) => d * y, 1);
      if (v(o)) {
        let d = a, y = u;
        for (let f = 0; f < m; f++) {
          let p = [];
          for (let g = 0; g < c; g++) {
            let h = R(f, i, g, e), b = $(h, e);
            p.push({ re: d[b * 2], im: d[b * 2 + 1], idx: g });
          }
          p.sort((g, h) => yt(g.re, g.im, h.re, h.im));
          for (let g = 0; g < c; g++) {
            let h = R(f, i, g, e), b = $(h, e);
            y[b * 2] = p[g].re, y[b * 2 + 1] = p[g].im;
          }
        }
      } else if (B(o)) {
        let d = a, y = u;
        for (let f = 0; f < m; f++) {
          let p = [];
          for (let g = 0; g < c; g++) {
            let h = R(f, i, g, e), b = $(h, e);
            p.push({ value: d[b], idx: g });
          }
          p.sort((g, h) => g.value < h.value ? -1 : g.value > h.value ? 1 : 0);
          for (let g = 0; g < c; g++) {
            let h = R(f, i, g, e), b = $(h, e);
            y[b] = p[g].value;
          }
        }
      } else for (let d = 0; d < m; d++) {
        let y = [];
        for (let f = 0; f < c; f++) {
          let p = R(d, i, f, e), g = $(p, e);
          y.push(Number(a[g]));
        }
        y.sort((f, p) => isNaN(f) && isNaN(p) ? 0 : isNaN(f) ? 1 : isNaN(p) ? -1 : f - p);
        for (let f = 0; f < c; f++) {
          let p = R(d, i, f, e), g = $(p, e);
          u[g] = y[f];
        }
      }
      return s;
    }
    function Ge(r, t = -1) {
      let e = r.shape, n = e.length, o = r.dtype, a = r.data;
      if (n === 0) return N.zeros([0], "int32");
      let i = t;
      if (i < 0 && (i = n + i), i < 0 || i >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
      let s = N.zeros(Array.from(e), "int32"), u = s.data, c = e[i], l = Array.from(e).filter((d, y) => y !== i), m = l.length === 0 ? 1 : l.reduce((d, y) => d * y, 1);
      if (v(o)) {
        let d = a;
        for (let y = 0; y < m; y++) {
          let f = [];
          for (let p = 0; p < c; p++) {
            let g = R(y, i, p, e), h = $(g, e);
            f.push({ re: d[h * 2], im: d[h * 2 + 1], idx: p });
          }
          f.sort((p, g) => yt(p.re, p.im, g.re, g.im));
          for (let p = 0; p < c; p++) {
            let g = R(y, i, p, e), h = $(g, e);
            u[h] = f[p].idx;
          }
        }
      } else if (B(o)) {
        let d = a;
        for (let y = 0; y < m; y++) {
          let f = [];
          for (let p = 0; p < c; p++) {
            let g = R(y, i, p, e), h = $(g, e);
            f.push({ value: d[h], idx: p });
          }
          f.sort((p, g) => p.value < g.value ? -1 : p.value > g.value ? 1 : 0);
          for (let p = 0; p < c; p++) {
            let g = R(y, i, p, e), h = $(g, e);
            u[h] = f[p].idx;
          }
        }
      } else for (let d = 0; d < m; d++) {
        let y = [];
        for (let f = 0; f < c; f++) {
          let p = R(d, i, f, e), g = $(p, e);
          y.push({ value: Number(a[g]), idx: f });
        }
        y.sort((f, p) => isNaN(f.value) && isNaN(p.value) ? 0 : isNaN(f.value) ? 1 : isNaN(p.value) ? -1 : f.value - p.value);
        for (let f = 0; f < c; f++) {
          let p = R(d, i, f, e), g = $(p, e);
          u[g] = y[f].idx;
        }
      }
      return s;
    }
    function gi(r) {
      if (r.length === 0) return N.zeros([0], "int32");
      let e = r[0].size;
      for (let i of r) {
        if (i.ndim !== 1) throw new Error("keys must be 1D arrays");
        if (i.size !== e) throw new Error("all keys must have the same length");
      }
      let n = [];
      for (let i = 0; i < e; i++) n.push(i);
      n.sort((i, s) => {
        for (let u = r.length - 1; u >= 0; u--) {
          let l = r[u].data, m = Number(l[i]), d = Number(l[s]);
          if (!(isNaN(m) && isNaN(d))) {
            if (isNaN(m)) return 1;
            if (isNaN(d) || m < d) return -1;
            if (m > d) return 1;
          }
        }
        return 0;
      });
      let o = N.zeros([e], "int32"), a = o.data;
      for (let i = 0; i < e; i++) a[i] = n[i];
      return o;
    }
    function bd(r, t) {
      let e = 0, n = r.length - 1;
      for (; e < n; ) {
        let o = Math.floor((e + n) / 2), a = r[e], i = r[o], s = r[n], u;
        a <= i && i <= s || s <= i && i <= a ? u = o : i <= a && a <= s || s <= a && a <= i ? u = e : u = n;
        let c = r[u];
        [r[u], r[n]] = [r[n], r[u]];
        let l = e;
        for (let m = e; m < n; m++) {
          let d = r[m], y = isNaN(d), f = isNaN(c);
          !y && (f || d <= c) && ([r[l], r[m]] = [r[m], r[l]], l++);
        }
        if ([r[l], r[n]] = [r[n], r[l]], l === t) return;
        l < t ? e = l + 1 : n = l - 1;
      }
    }
    function hd(r, t) {
      let e = 0, n = r.length - 1;
      for (; e < n; ) {
        let o = Math.floor((e + n) / 2), a = r[e], i = r[o], s = r[n], u;
        a <= i && i <= s || s <= i && i <= a ? u = o : i <= a && a <= s || s <= a && a <= i ? u = e : u = n;
        let c = r[u];
        [r[u], r[n]] = [r[n], r[u]];
        let l = e;
        for (let m = e; m < n; m++) r[m] <= c && ([r[l], r[m]] = [r[m], r[l]], l++);
        if ([r[l], r[n]] = [r[n], r[l]], l === t) return;
        l < t ? e = l + 1 : n = l - 1;
      }
    }
    function Sd(r, t) {
      let e = 0, n = r.length - 1;
      for (; e < n; ) {
        let o = Math.floor((e + n) / 2), a = r[e].value, i = r[o].value, s = r[n].value, u;
        a <= i && i <= s || s <= i && i <= a ? u = o : i <= a && a <= s || s <= a && a <= i ? u = e : u = n;
        let c = r[u].value;
        [r[u], r[n]] = [r[n], r[u]];
        let l = e;
        for (let m = e; m < n; m++) {
          let d = r[m].value, y = isNaN(d), f = isNaN(c);
          !y && (f || d <= c) && ([r[l], r[m]] = [r[m], r[l]], l++);
        }
        if ([r[l], r[n]] = [r[n], r[l]], l === t) return;
        l < t ? e = l + 1 : n = l - 1;
      }
    }
    function Dd(r, t) {
      let e = 0, n = r.length - 1;
      for (; e < n; ) {
        let o = Math.floor((e + n) / 2), a = r[e].value, i = r[o].value, s = r[n].value, u;
        a <= i && i <= s || s <= i && i <= a ? u = o : i <= a && a <= s || s <= a && a <= i ? u = e : u = n;
        let c = r[u].value;
        [r[u], r[n]] = [r[n], r[u]];
        let l = e;
        for (let m = e; m < n; m++) r[m].value <= c && ([r[l], r[m]] = [r[m], r[l]], l++);
        if ([r[l], r[n]] = [r[n], r[l]], l === t) return;
        l < t ? e = l + 1 : n = l - 1;
      }
    }
    function We(r, t, e = -1) {
      let n = r.shape, o = n.length, a = r.dtype;
      if (o === 0) return r.copy();
      let i = e;
      if (i < 0 && (i = o + i), i < 0 || i >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let s = n[i], u = t;
      if (u < 0 && (u = s + u), u < 0 || u >= s) throw new Error(`kth(=${t}) out of bounds (${s})`);
      let c = r.copy(), l = c.data, m = Array.from(n).filter((y, f) => f !== i), d = m.length === 0 ? 1 : m.reduce((y, f) => y * f, 1);
      if (B(a)) {
        let y = l;
        for (let f = 0; f < d; f++) {
          let p = [];
          for (let g = 0; g < s; g++) {
            let h = R(f, i, g, n), b = $(h, n);
            p.push(y[b]);
          }
          hd(p, u);
          for (let g = 0; g < s; g++) {
            let h = R(f, i, g, n), b = $(h, n);
            y[b] = p[g];
          }
        }
      } else for (let y = 0; y < d; y++) {
        let f = [];
        for (let p = 0; p < s; p++) {
          let g = R(y, i, p, n), h = $(g, n);
          f.push(Number(l[h]));
        }
        bd(f, u);
        for (let p = 0; p < s; p++) {
          let g = R(y, i, p, n), h = $(g, n);
          l[h] = f[p];
        }
      }
      return c;
    }
    function Ze(r, t, e = -1) {
      let n = r.shape, o = n.length, a = r.dtype, i = r.data;
      if (o === 0) return N.zeros([0], "int32");
      let s = e;
      if (s < 0 && (s = o + s), s < 0 || s >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      let u = n[s], c = t;
      if (c < 0 && (c = u + c), c < 0 || c >= u) throw new Error(`kth(=${t}) out of bounds (${u})`);
      let l = N.zeros(Array.from(n), "int32"), m = l.data, d = Array.from(n).filter((f, p) => p !== s), y = d.length === 0 ? 1 : d.reduce((f, p) => f * p, 1);
      if (B(a)) {
        let f = i;
        for (let p = 0; p < y; p++) {
          let g = [];
          for (let h = 0; h < u; h++) {
            let b = R(p, s, h, n), A = $(b, n);
            g.push({ value: f[A], idx: h });
          }
          Dd(g, c);
          for (let h = 0; h < u; h++) {
            let b = R(p, s, h, n), A = $(b, n);
            m[A] = g[h].idx;
          }
        }
      } else for (let f = 0; f < y; f++) {
        let p = [];
        for (let g = 0; g < u; g++) {
          let h = R(f, s, g, n), b = $(h, n);
          p.push({ value: Number(i[b]), idx: g });
        }
        Sd(p, c);
        for (let g = 0; g < u; g++) {
          let h = R(f, s, g, n), b = $(h, n);
          m[b] = p[g].idx;
        }
      }
      return l;
    }
    function Ai(r) {
      let t = r.dtype, e = r.size, n = r.data;
      if (v(t)) {
        let o = n, a = [];
        for (let u = 0; u < e; u++) a.push({ re: o[u * 2], im: o[u * 2 + 1] });
        a.sort((u, c) => yt(u.re, u.im, c.re, c.im));
        let i = N.zeros([e], "complex128"), s = i.data;
        for (let u = 0; u < e; u++) s[u * 2] = a[u].re, s[u * 2 + 1] = a[u].im;
        return i;
      } else {
        let o = [];
        for (let s = 0; s < e; s++) o.push(Number(n[s]));
        o.sort((s, u) => isNaN(s) && isNaN(u) ? 0 : isNaN(s) ? 1 : isNaN(u) ? -1 : s - u);
        let a = N.zeros([e], "complex128"), i = a.data;
        for (let s = 0; s < e; s++) i[s * 2] = o[s], i[s * 2 + 1] = 0;
        return a;
      }
    }
    function Ut(r) {
      let t = r.shape, e = t.length, n = r.data, o = r.size, a = v(r.dtype), i = [];
      for (let m = 0; m < e; m++) i.push([]);
      let s = [], u = 1;
      for (let m = e - 1; m >= 0; m--) s.unshift(u), u *= t[m];
      for (let m = 0; m < o; m++) if (Nr(n, m, a)) {
        let d = m;
        for (let y = 0; y < e; y++) {
          let f = Math.floor(d / s[y]);
          d = d % s[y], i[y].push(f);
        }
      }
      let c = i[0]?.length ?? 0, l = [];
      for (let m = 0; m < e; m++) {
        let d = N.zeros([c], "int32"), y = d.data;
        for (let f = 0; f < c; f++) y[f] = i[m][f];
        l.push(d);
      }
      return l;
    }
    function Ye(r) {
      let t = r.shape, e = t.length, n = r.data, o = r.size, a = v(r.dtype), i = [], s = [], u = 1;
      for (let y = e - 1; y >= 0; y--) s.unshift(u), u *= t[y];
      for (let y = 0; y < o; y++) if (Nr(n, y, a)) {
        let f = [], p = y;
        for (let g = 0; g < e; g++) {
          let h = Math.floor(p / s[g]);
          p = p % s[g], f.push(h);
        }
        i.push(f);
      }
      let c = i.length, l = e === 0 ? [c, 1] : [c, e], m = N.zeros(l, "int32"), d = m.data;
      for (let y = 0; y < c; y++) {
        let f = i[y];
        for (let p = 0; p < (e === 0 ? 1 : e); p++) d[y * (e === 0 ? 1 : e) + p] = f[p] ?? 0;
      }
      return m;
    }
    function bi(r) {
      let t = r.data, e = r.size, n = v(r.dtype), o = [];
      for (let s = 0; s < e; s++) Nr(t, s, n) && o.push(s);
      let a = N.zeros([o.length], "int32"), i = a.data;
      for (let s = 0; s < o.length; s++) i[s] = o[s];
      return a;
    }
    function hi(r, t, e) {
      if (t === void 0 && e === void 0) return Ut(r);
      if (t === void 0 || e === void 0) throw new Error("either both or neither of x and y should be given");
      let n = r.shape, o = t.shape, a = e.shape, i = Math.max(n.length, o.length, a.length), s = (M) => {
        let T = Array(i).fill(1);
        for (let O = 0; O < M.length; O++) T[i - M.length + O] = M[O];
        return T;
      }, u = s(n), c = s(o), l = s(a), m = [];
      for (let M = 0; M < i; M++) {
        let T = [u[M], c[M], l[M]], O = Math.max(...T);
        for (let C of T) if (C !== 1 && C !== O) throw new Error("operands could not be broadcast together");
        m.push(O);
      }
      let d = t.dtype, y = N.zeros(m, d), f = y.data, p = r.data, g = t.data, h = e.data, b = (M, T) => {
        let O = [], C = 1;
        for (let q = M.length - 1; q >= 0; q--) O.unshift(C), C *= M[q];
        for (; O.length < T.length; ) O.unshift(0);
        for (let q = 0; q < T.length; q++) T[q] === 1 && m[q] !== 1 && (O[q] = 0);
        return O;
      }, A = b(n, u), S = b(o, c), D = b(a, l), w = [], x = 1;
      for (let M = m.length - 1; M >= 0; M--) w.unshift(x), x *= m[M];
      let I = m.reduce((M, T) => M * T, 1), z = v(r.dtype), F = v(d);
      for (let M = 0; M < I; M++) {
        let T = M, O = 0, C = 0, q = 0;
        for (let V = 0; V < i; V++) {
          let k = Math.floor(T / w[V]);
          T = T % w[V], O += k * A[V], C += k * S[V], q += k * D[V];
        }
        Nr(p, O, z) ? F ? (f[M * 2] = g[C * 2], f[M * 2 + 1] = g[C * 2 + 1]) : f[M] = g[C] : F ? (f[M * 2] = h[q * 2], f[M * 2 + 1] = h[q * 2 + 1]) : f[M] = h[q];
      }
      return y;
    }
    function He(r, t, e = "left") {
      if (r.ndim !== 1) throw new Error("storage must be 1D");
      let n = r.data, o = r.size, a = t.data, i = t.size, s = v(r.dtype), u = N.zeros([i], "int32"), c = u.data;
      if (s) {
        let l = n, m = a;
        for (let d = 0; d < i; d++) {
          let y = m[d * 2], f = m[d * 2 + 1], p = 0, g = o;
          if (e === "left") for (; p < g; ) {
            let h = Math.floor((p + g) / 2), b = l[h * 2], A = l[h * 2 + 1];
            yt(b, A, y, f) < 0 ? p = h + 1 : g = h;
          }
          else for (; p < g; ) {
            let h = Math.floor((p + g) / 2), b = l[h * 2], A = l[h * 2 + 1];
            yt(b, A, y, f) <= 0 ? p = h + 1 : g = h;
          }
          c[d] = p;
        }
      } else for (let l = 0; l < i; l++) {
        let m = Number(a[l]), d = 0, y = o;
        if (e === "left") for (; d < y; ) {
          let f = Math.floor((d + y) / 2);
          Number(n[f]) < m ? d = f + 1 : y = f;
        }
        else for (; d < y; ) {
          let f = Math.floor((d + y) / 2);
          Number(n[f]) <= m ? d = f + 1 : y = f;
        }
        c[l] = d;
      }
      return u;
    }
    function Si(r, t) {
      let e = r.data, n = t.data, o = t.dtype, a = v(r.dtype), i = v(o), s = Math.min(r.size, t.size), u = 0;
      for (let d = 0; d < s; d++) Nr(e, d, a) && u++;
      let c = N.zeros([u], o), l = c.data, m = 0;
      if (B(o)) {
        let d = n, y = l;
        for (let f = 0; f < s; f++) Nr(e, f, a) && (y[m++] = d[f]);
      } else if (i) {
        let d = n, y = l;
        for (let f = 0; f < s; f++) Nr(e, f, a) && (y[m * 2] = d[f * 2], y[m * 2 + 1] = d[f * 2 + 1], m++);
      } else for (let d = 0; d < s; d++) Nr(e, d, a) && (l[m++] = n[d]);
      return c;
    }
    function Xe(r, t) {
      let e = r.shape, n = e.length, o = r.data, a = r.size, i = v(r.dtype);
      if (t === void 0) {
        let y = 0;
        for (let f = 0; f < a; f++) Nr(o, f, i) && y++;
        return y;
      }
      let s = t;
      if (s < 0 && (s = n + s), s < 0 || s >= n) throw new Error(`axis ${t} is out of bounds for array of dimension ${n}`);
      let u = Array.from(e).filter((y, f) => f !== s);
      if (u.length === 0) return Xe(r);
      let c = N.zeros(u, "int32"), l = c.data, m = e[s], d = u.reduce((y, f) => y * f, 1);
      for (let y = 0; y < d; y++) {
        let f = 0;
        for (let p = 0; p < m; p++) {
          let g = R(y, s, p, e), h = $(g, e);
          Nr(o, h, i) && f++;
        }
        l[y] = f;
      }
      return c;
    }
    function Di(r) {
      if (!isFinite(r)) return r;
      let t = Math.floor(r), e = r - t;
      return Math.abs(e - 0.5) < 1e-10 ? t % 2 === 0 ? t : t + 1 : Math.round(r);
    }
    function Je(r, t = 0) {
      U(r.dtype, "around", "Rounding is not defined for complex numbers.");
      let e = r.dtype, n = Array.from(r.shape), o = r.data, a = r.size, i = e === "float32" ? "float32" : "float64", s = N.zeros(n, i), u = s.data, c = Math.pow(10, t);
      for (let l = 0; l < a; l++) {
        let m = Number(o[l]);
        u[l] = Di(m * c) / c;
      }
      return s;
    }
    function Qe(r) {
      U(r.dtype, "ceil", "Rounding is not defined for complex numbers.");
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = t === "float32" ? "float32" : "float64", i = N.zeros(e, a), s = i.data;
      for (let u = 0; u < o; u++) s[u] = Math.ceil(Number(n[u]));
      return i;
    }
    function Ke(r) {
      U(r.dtype, "fix", "Rounding is not defined for complex numbers.");
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = t === "float32" ? "float32" : "float64", i = N.zeros(e, a), s = i.data;
      for (let u = 0; u < o; u++) s[u] = Math.trunc(Number(n[u]));
      return i;
    }
    function rn(r) {
      U(r.dtype, "floor", "Rounding is not defined for complex numbers.");
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = t === "float32" ? "float32" : "float64", i = N.zeros(e, a), s = i.data;
      for (let u = 0; u < o; u++) s[u] = Math.floor(Number(n[u]));
      return i;
    }
    function tn(r) {
      U(r.dtype, "rint", "Rounding is not defined for complex numbers.");
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = t === "float32" ? "float32" : "float64", i = N.zeros(e, a), s = i.data;
      for (let u = 0; u < o; u++) s[u] = Di(Number(n[u]));
      return i;
    }
    function en(r) {
      U(r.dtype, "trunc", "Rounding is not defined for complex numbers.");
      let t = r.dtype, e = Array.from(r.shape), n = r.data, o = r.size, a = t === "float32" ? "float32" : "float64", i = N.zeros(e, a), s = i.data;
      for (let u = 0; u < o; u++) s[u] = Math.trunc(Number(n[u]));
      return i;
    }
    function nn(r, t, e, n) {
      let o = isNaN(r) || isNaN(t), a = isNaN(e) || isNaN(n);
      return o && a ? 0 : o ? 1 : a || r < e ? -1 : r > e ? 1 : t < n ? -1 : t > n ? 1 : 0;
    }
    function wd(r, t, e, n) {
      let o = isNaN(r) || isNaN(t), a = isNaN(e) || isNaN(n);
      return o && a ? true : o || a ? false : r === e && t === n;
    }
    function fr(r, t = false, e = false, n = false) {
      let o = r.dtype, a = r.size, i = r.data;
      if (v(o)) {
        let A = i, S = [];
        for (let k = 0; k < a; k++) S.push({ re: A[k * 2], im: A[k * 2 + 1], index: k });
        S.sort((k, L) => nn(k.re, k.im, L.re, L.im));
        let D = [], w = [], x = new Array(a), I = [], z, F, M = 0;
        for (let k = 0; k < S.length; k++) {
          let { re: L, im: j, index: J } = S[k];
          z === void 0 || !wd(L, j, z, F) ? (z !== void 0 && I.push(M), D.push({ re: L, im: j }), w.push(J), M = 1, z = L, F = j) : M++;
        }
        M > 0 && I.push(M);
        let T = /* @__PURE__ */ new Map(), O = -1;
        for (let k = 0; k < D.length; k++) {
          let { re: L, im: j } = D[k];
          isNaN(L) || isNaN(j) ? O = k : T.set(`${L},${j}`, k);
        }
        for (let k = 0; k < a; k++) {
          let L = A[k * 2], j = A[k * 2 + 1];
          isNaN(L) || isNaN(j) ? x[k] = O : x[k] = T.get(`${L},${j}`);
        }
        let C = N.zeros([D.length], o), q = C.data;
        for (let k = 0; k < D.length; k++) q[k * 2] = D[k].re, q[k * 2 + 1] = D[k].im;
        if (!t && !e && !n) return C;
        let V = { values: C };
        if (t) {
          let k = N.zeros([w.length], "int32"), L = k.data;
          for (let j = 0; j < w.length; j++) L[j] = w[j];
          V.indices = k;
        }
        if (e) {
          let k = N.zeros([x.length], "int32"), L = k.data;
          for (let j = 0; j < x.length; j++) L[j] = x[j];
          V.inverse = k;
        }
        if (n) {
          let k = N.zeros([I.length], "int32"), L = k.data;
          for (let j = 0; j < I.length; j++) L[j] = I[j];
          V.counts = k;
        }
        return V;
      }
      let s = [];
      for (let A = 0; A < a; A++) s.push({ value: Number(i[A]), index: A });
      s.sort((A, S) => isNaN(A.value) && isNaN(S.value) ? 0 : isNaN(A.value) ? 1 : isNaN(S.value) ? -1 : A.value - S.value);
      let u = [], c = [], l = new Array(a), m = [], d, y = 0;
      for (let A = 0; A < s.length; A++) {
        let { value: S, index: D } = s[A];
        d === void 0 || isNaN(S) && !isNaN(d) || !isNaN(S) && isNaN(d) || !isNaN(S) && !isNaN(d) && S !== d ? (d !== void 0 && m.push(y), u.push(S), c.push(D), y = 1, d = S) : y++;
      }
      y > 0 && m.push(y);
      let f = /* @__PURE__ */ new Map(), p = -1;
      for (let A = 0; A < u.length; A++) {
        let S = u[A];
        isNaN(S) ? p = A : f.set(S, A);
      }
      for (let A = 0; A < a; A++) {
        let S = Number(i[A]);
        isNaN(S) ? l[A] = p : l[A] = f.get(S);
      }
      let g = N.zeros([u.length], o), h = g.data;
      for (let A = 0; A < u.length; A++) h[A] = u[A];
      if (!t && !e && !n) return g;
      let b = { values: g };
      if (t) {
        let A = N.zeros([c.length], "int32"), S = A.data;
        for (let D = 0; D < c.length; D++) S[D] = c[D];
        b.indices = A;
      }
      if (e) {
        let A = N.zeros([l.length], "int32"), S = A.data;
        for (let D = 0; D < l.length; D++) S[D] = l[D];
        b.inverse = A;
      }
      if (n) {
        let A = N.zeros([m.length], "int32"), S = A.data;
        for (let D = 0; D < m.length; D++) S[D] = m[D];
        b.counts = A;
      }
      return b;
    }
    function xr(r, t, e) {
      if (e) {
        let n = Number(r[t * 2]), o = Number(r[t * 2 + 1]);
        return `${n},${o}`;
      }
      return String(Number(r[t]));
    }
    function Ni(r, t) {
      return on(r, t);
    }
    function xi(r, t) {
      let e = r.dtype, n = v(e), o = fr(r), a = fr(t), i = /* @__PURE__ */ new Set();
      for (let l = 0; l < a.size; l++) i.add(xr(a.data, l, n));
      let s = [];
      for (let l = 0; l < o.size; l++) {
        let m = xr(o.data, l, n);
        i.has(m) && s.push(l);
      }
      if (n) {
        let l = N.zeros([s.length], e), m = l.data, d = o.data;
        for (let y = 0; y < s.length; y++) {
          let f = s[y];
          m[y * 2] = d[f * 2], m[y * 2 + 1] = d[f * 2 + 1];
        }
        return l;
      }
      let u = N.zeros([s.length], e), c = u.data;
      for (let l = 0; l < s.length; l++) c[l] = o.data[s[l]];
      return u;
    }
    function on(r, t) {
      let e = Array.from(r.shape), n = r.size, o = v(r.dtype), a = /* @__PURE__ */ new Set();
      for (let u = 0; u < t.size; u++) a.add(xr(t.data, u, o));
      let i = N.zeros(e, "bool"), s = i.data;
      for (let u = 0; u < n; u++) {
        let c = xr(r.data, u, o);
        s[u] = a.has(c) ? 1 : 0;
      }
      return i;
    }
    function wi(r, t) {
      let e = r.dtype, n = v(e), o = fr(r), a = /* @__PURE__ */ new Set();
      for (let c = 0; c < t.size; c++) a.add(xr(t.data, c, n));
      let i = [];
      for (let c = 0; c < o.size; c++) {
        let l = xr(o.data, c, n);
        a.has(l) || i.push(c);
      }
      if (n) {
        let c = N.zeros([i.length], e), l = c.data, m = o.data;
        for (let d = 0; d < i.length; d++) {
          let y = i[d];
          l[d * 2] = m[y * 2], l[d * 2 + 1] = m[y * 2 + 1];
        }
        return c;
      }
      let s = N.zeros([i.length], e), u = s.data;
      for (let c = 0; c < i.length; c++) u[c] = o.data[i[c]];
      return s;
    }
    function Ii(r, t) {
      let e = r.dtype, n = v(e), o = fr(r), a = fr(t), i = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
      for (let y = 0; y < o.size; y++) i.add(xr(o.data, y, n));
      for (let y = 0; y < a.size; y++) s.add(xr(a.data, y, n));
      let u = [], c = [];
      for (let y = 0; y < o.size; y++) {
        let f = xr(o.data, y, n);
        s.has(f) || u.push(y);
      }
      for (let y = 0; y < a.size; y++) {
        let f = xr(a.data, y, n);
        i.has(f) || c.push(y);
      }
      if (n) {
        let y = [], f = o.data, p = a.data;
        for (let b of u) y.push({ re: f[b * 2], im: f[b * 2 + 1] });
        for (let b of c) y.push({ re: p[b * 2], im: p[b * 2 + 1] });
        y.sort((b, A) => nn(b.re, b.im, A.re, A.im));
        let g = N.zeros([y.length], e), h = g.data;
        for (let b = 0; b < y.length; b++) h[b * 2] = y[b].re, h[b * 2 + 1] = y[b].im;
        return g;
      }
      let l = [];
      for (let y of u) l.push(Number(o.data[y]));
      for (let y of c) l.push(Number(a.data[y]));
      l.sort((y, f) => isNaN(y) && isNaN(f) ? 0 : isNaN(y) ? 1 : isNaN(f) ? -1 : y - f);
      let m = N.zeros([l.length], e), d = m.data;
      for (let y = 0; y < l.length; y++) d[y] = l[y];
      return m;
    }
    function zi(r, t) {
      let e = r.dtype, n = v(e), o = fr(r), a = fr(t), i = /* @__PURE__ */ new Set(), s = [];
      if (n) {
        let m = o.data, d = a.data;
        for (let p = 0; p < o.size; p++) {
          let g = m[p * 2], h = m[p * 2 + 1], b = `${g},${h}`;
          i.has(b) || (i.add(b), s.push({ re: g, im: h }));
        }
        for (let p = 0; p < a.size; p++) {
          let g = d[p * 2], h = d[p * 2 + 1], b = `${g},${h}`;
          i.has(b) || (i.add(b), s.push({ re: g, im: h }));
        }
        s.sort((p, g) => nn(p.re, p.im, g.re, g.im));
        let y = N.zeros([s.length], e), f = y.data;
        for (let p = 0; p < s.length; p++) f[p * 2] = s[p].re, f[p * 2 + 1] = s[p].im;
        return y;
      }
      let u = [];
      for (let m = 0; m < o.size; m++) {
        let d = Number(o.data[m]), y = String(d);
        i.has(y) || (i.add(y), u.push(d));
      }
      for (let m = 0; m < a.size; m++) {
        let d = Number(a.data[m]), y = String(d);
        i.has(y) || (i.add(y), u.push(d));
      }
      u.sort((m, d) => isNaN(m) && isNaN(d) ? 0 : isNaN(m) ? 1 : isNaN(d) ? -1 : m - d);
      let c = N.zeros([u.length], e), l = c.data;
      for (let m = 0; m < u.length; m++) l[m] = u[m];
      return c;
    }
    function _i(r, t = "fb") {
      let e = r.dtype, n = r.data, o = r.size, a = v(e);
      if (o === 0) return N.zeros([0], e);
      let i = (d) => {
        if (a) {
          let y = n[d * 2], f = n[d * 2 + 1];
          return y === 0 && f === 0;
        }
        return Number(n[d]) === 0;
      }, s = 0;
      if (t === "f" || t === "fb") for (; s < o && i(s); ) s++;
      let u = o - 1;
      if (t === "b" || t === "fb") for (; u >= s && i(u); ) u--;
      if (s > u) return N.zeros([0], e);
      let c = u - s + 1;
      if (a) {
        let d = N.zeros([c], e), y = d.data;
        for (let f = 0; f < c; f++) y[f * 2] = n[(s + f) * 2], y[f * 2 + 1] = n[(s + f) * 2 + 1];
        return d;
      }
      let l = N.zeros([c], e), m = l.data;
      for (let d = 0; d < c; d++) m[d] = n[s + d];
      return l;
    }
    function Mi(r) {
      let e = fr(r, true, true, true);
      return { values: e.values, indices: e.indices, inverse_indices: e.inverse, counts: e.counts };
    }
    function Fi(r) {
      let e = fr(r, false, false, true);
      return { values: e.values, counts: e.counts };
    }
    function vi(r) {
      let e = fr(r, false, true, false);
      return { values: e.values, inverse_indices: e.inverse };
    }
    function Bi(r) {
      return fr(r);
    }
    function an(r, t = 1, e = -1) {
      if (t < 0) throw new Error(`order must be non-negative but got ${t}`);
      if (t === 0) return r.copy();
      let n = Array.from(r.shape), o = n.length, a = e < 0 ? o + e : e;
      if (a < 0 || a >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
      if (n[a] < t + 1) throw new Error(`diff requires at least ${t + 1} elements along axis ${e}, but got ${n[a]}`);
      let i = r;
      for (let s = 0; s < t; s++) i = zd(i, a);
      return i;
    }
    function zd(r, t) {
      let e = Array.from(r.shape), n = e.length, o = e[t], a = [...e];
      a[t] = o - 1;
      let i = r.dtype, s = v(i), u = B(i) ? "float64" : i, c = N.zeros(a, u), l = c.data, m = r.strides, d = c.size;
      for (let y = 0; y < d; y++) {
        let f = y, p = new Array(n);
        for (let S = n - 1; S >= 0; S--) p[S] = f % a[S], f = Math.floor(f / a[S]);
        let g = [...p], h = [...p];
        h[t] = g[t] + 1;
        let b = 0, A = 0;
        for (let S = 0; S < n; S++) b += g[S] * m[S], A += h[S] * m[S];
        if (s) {
          let S = r.data, D = S[b * 2], w = S[b * 2 + 1], x = S[A * 2], I = S[A * 2 + 1];
          l[y * 2] = x - D, l[y * 2 + 1] = I - w;
        } else {
          let S = (B(i), Number(r.data[b])), D = (B(i), Number(r.data[A]));
          l[y] = D - S;
        }
      }
      return c;
    }
    function Ei(r, t = null, e = null) {
      let n = r.size, o = r.dtype, a = v(o), i = B(o) ? "float64" : o, s = Math.max(0, n - 1), u = e ? e.length : 0, c = t ? t.length : 0, l = u + s + c, m = N.zeros([l], i), d = m.data, y = 0;
      if (e) if (a) for (let f of e) d[y * 2] = f, d[y * 2 + 1] = 0, y++;
      else for (let f of e) d[y++] = f;
      if (a) {
        let f = r.data;
        for (let p = 0; p < s; p++) {
          let g = f[p * 2], h = f[p * 2 + 1], b = f[(p + 1) * 2], A = f[(p + 1) * 2 + 1];
          d[y * 2] = b - g, d[y * 2 + 1] = A - h, y++;
        }
      } else for (let f = 0; f < s; f++) {
        let p = (B(o), Number(r.iget(f))), g = (B(o), Number(r.iget(f + 1)));
        d[y++] = g - p;
      }
      if (t) if (a) for (let f of t) d[y * 2] = f, d[y * 2 + 1] = 0, y++;
      else for (let f of t) d[y++] = f;
      return m;
    }
    function Ti(r, t = 1, e = null) {
      let o = Array.from(r.shape).length, a;
      if (e === null) a = Array.from({ length: o }, (u, c) => c);
      else if (typeof e == "number") {
        let u = e < 0 ? o + e : e;
        if (u < 0 || u >= o) throw new Error(`axis ${e} is out of bounds for array of dimension ${o}`);
        a = [u];
      } else a = e.map((u) => {
        let c = u < 0 ? o + u : u;
        if (c < 0 || c >= o) throw new Error(`axis ${u} is out of bounds for array of dimension ${o}`);
        return c;
      });
      let i;
      if (typeof t == "number") i = a.map(() => t);
      else {
        if (t.length !== a.length) throw new Error("Number of spacings must match number of axes");
        i = t;
      }
      let s = [];
      for (let u = 0; u < a.length; u++) s.push(_d(r, a[u], i[u]));
      return s.length === 1 ? s[0] : s;
    }
    function _d(r, t, e) {
      let n = Array.from(r.shape), o = n.length, a = n[t];
      if (a < 2) throw new Error(`Shape of array along axis ${t} must be at least 2, but got ${a}`);
      let i = r.dtype, s = v(i), u = B(i) ? "float64" : i === "float32" ? "float32" : s ? i : "float64", c = N.zeros(n, u), l = c.data, m = r.strides, d = e, y = 2 * d, f = r.size;
      for (let p = 0; p < f; p++) {
        let g = p, h = new Array(o);
        for (let A = o - 1; A >= 0; A--) h[A] = g % n[A], g = Math.floor(g / n[A]);
        let b = h[t];
        if (s) {
          let A = r.data, S = l, D, w;
          if (b === 0) {
            let x = [...h];
            x[t] = 1;
            let I = 0;
            for (let O = 0; O < o; O++) I += x[O] * m[O];
            let z = A[p * 2], F = A[p * 2 + 1], M = A[I * 2], T = A[I * 2 + 1];
            D = (M - z) / d, w = (T - F) / d;
          } else if (b === a - 1) {
            let x = [...h];
            x[t] = a - 2;
            let I = 0;
            for (let O = 0; O < o; O++) I += x[O] * m[O];
            let z = A[p * 2], F = A[p * 2 + 1], M = A[I * 2], T = A[I * 2 + 1];
            D = (z - M) / d, w = (F - T) / d;
          } else {
            let x = [...h], I = [...h];
            x[t] = b + 1, I[t] = b - 1;
            let z = 0, F = 0;
            for (let q = 0; q < o; q++) z += x[q] * m[q], F += I[q] * m[q];
            let M = A[z * 2], T = A[z * 2 + 1], O = A[F * 2], C = A[F * 2 + 1];
            D = (M - O) / y, w = (T - C) / y;
          }
          S[p * 2] = D, S[p * 2 + 1] = w;
        } else {
          let A;
          if (b === 0) {
            let S = [...h];
            S[t] = 1;
            let D = 0;
            for (let I = 0; I < o; I++) D += S[I] * m[I];
            let w = (B(i), Number(r.data[p]));
            A = ((B(i), Number(r.data[D])) - w) / d;
          } else if (b === a - 1) {
            let S = [...h];
            S[t] = a - 2;
            let D = 0;
            for (let I = 0; I < o; I++) D += S[I] * m[I];
            let w = (B(i), Number(r.data[p])), x = (B(i), Number(r.data[D]));
            A = (w - x) / d;
          } else {
            let S = [...h], D = [...h];
            S[t] = b + 1, D[t] = b - 1;
            let w = 0, x = 0;
            for (let F = 0; F < o; F++) w += S[F] * m[F], x += D[F] * m[F];
            let I = (B(i), Number(r.data[w])), z = (B(i), Number(r.data[x]));
            A = (I - z) / y;
          }
          l[p] = A;
        }
      }
      return c;
    }
    function Oi(r, t, e = -1, n = -1, o = -1) {
      let a = Array.from(r.shape), i = Array.from(t.shape), s = a.length, u = i.length, c = e < 0 ? s + e : e, l = n < 0 ? u + n : n;
      if (c < 0 || c >= s) throw new Error(`axisa ${e} is out of bounds for array of dimension ${s}`);
      if (l < 0 || l >= u) throw new Error(`axisb ${n} is out of bounds for array of dimension ${u}`);
      let m = a[c], d = i[l];
      if (m !== 2 && m !== 3) throw new Error(`incompatible dimensions for cross product (dimension must be 2 or 3, got ${m})`);
      if (d !== 2 && d !== 3) throw new Error(`incompatible dimensions for cross product (dimension must be 2 or 3, got ${d})`);
      let y = W(r.dtype, t.dtype), f = v(y), p = (b, A) => {
        if (v(b.dtype)) {
          let S = b.data;
          return [S[A * 2], S[A * 2 + 1]];
        }
        return [Number(b.iget(A)), 0];
      }, g = (b, A, S, D) => [b * S - A * D, b * D + A * S], h = (b, A, S, D) => [b - S, A - D];
      if (s === 1 && u === 1 && m === 3 && d === 3) {
        let b = N.zeros([3], y);
        if (f) {
          let A = b.data, [S, D] = p(r, 0), [w, x] = p(r, 1), [I, z] = p(r, 2), [F, M] = p(t, 0), [T, O] = p(t, 1), [C, q] = p(t, 2), [V, k] = g(w, x, C, q), [L, j] = g(I, z, T, O), [J, rr] = h(V, k, L, j), [Z, er] = g(I, z, F, M), [nr, or] = g(S, D, C, q), [mr, Yt] = h(Z, er, nr, or), [Ht, Xt] = g(S, D, T, O), [Jt, Qt] = g(w, x, F, M), [Kt, re] = h(Ht, Xt, Jt, Qt);
          A[0] = J, A[1] = rr, A[2] = mr, A[3] = Yt, A[4] = Kt, A[5] = re;
        } else {
          let A = b.data, S = Number(r.iget(0)), D = Number(r.iget(1)), w = Number(r.iget(2)), x = Number(t.iget(0)), I = Number(t.iget(1)), z = Number(t.iget(2));
          A[0] = D * z - w * I, A[1] = w * x - S * z, A[2] = S * I - D * x;
        }
        return b;
      }
      if (s === 1 && u === 1 && m === 2 && d === 2) {
        let b = N.zeros([], y);
        if (f) {
          let A = b.data, [S, D] = p(r, 0), [w, x] = p(r, 1), [I, z] = p(t, 0), [F, M] = p(t, 1), [T, O] = g(S, D, F, M), [C, q] = g(w, x, I, z), [V, k] = h(T, O, C, q);
          A[0] = V, A[1] = k;
        } else {
          let A = Number(r.iget(0)), S = Number(r.iget(1)), D = Number(t.iget(0)), w = Number(t.iget(1));
          b.data[0] = A * w - S * D;
        }
        return b;
      }
      if (s === 1 && u === 1) {
        if (m === 2 && d === 3) {
          let b = N.zeros([3], y);
          if (f) {
            let A = b.data, [S, D] = p(r, 0), [w, x] = p(r, 1), [I, z] = p(t, 0), [F, M] = p(t, 1), [T, O] = p(t, 2), [C, q] = g(w, x, T, O), [V, k] = g(S, D, T, O), L = -V, j = -k, [J, rr] = g(S, D, F, M), [Z, er] = g(w, x, I, z), [nr, or] = h(J, rr, Z, er);
            A[0] = C, A[1] = q, A[2] = L, A[3] = j, A[4] = nr, A[5] = or;
          } else {
            let A = b.data, S = Number(r.iget(0)), D = Number(r.iget(1)), w = Number(t.iget(0)), x = Number(t.iget(1)), I = Number(t.iget(2));
            A[0] = D * I, A[1] = -S * I, A[2] = S * x - D * w;
          }
          return b;
        } else if (m === 3 && d === 2) {
          let b = N.zeros([3], y);
          if (f) {
            let A = b.data, [S, D] = p(r, 0), [w, x] = p(r, 1), [I, z] = p(r, 2), [F, M] = p(t, 0), [T, O] = p(t, 1), [C, q] = g(I, z, T, O), V = -C, k = -q, [L, j] = g(I, z, F, M), [J, rr] = g(S, D, T, O), [Z, er] = g(w, x, F, M), [nr, or] = h(J, rr, Z, er);
            A[0] = V, A[1] = k, A[2] = L, A[3] = j, A[4] = nr, A[5] = or;
          } else {
            let A = b.data, S = Number(r.iget(0)), D = Number(r.iget(1)), w = Number(r.iget(2)), x = Number(t.iget(0)), I = Number(t.iget(1));
            A[0] = -w * I, A[1] = w * x, A[2] = S * I - D * x;
          }
          return b;
        }
      }
      if (s === 2 && u === 2 && c === 1 && l === 1) {
        let b = a[0];
        if (i[0] !== b) throw new Error(`Shape mismatch: a has ${b} vectors, b has ${i[0]} vectors`);
        if (m === 3 && d === 3) {
          let A = N.zeros([b, 3], y);
          if (f) {
            let S = A.data;
            for (let D = 0; D < b; D++) {
              let [w, x] = p(r, D * 3), [I, z] = p(r, D * 3 + 1), [F, M] = p(r, D * 3 + 2), [T, O] = p(t, D * 3), [C, q] = p(t, D * 3 + 1), [V, k] = p(t, D * 3 + 2), [L, j] = g(I, z, V, k), [J, rr] = g(F, M, C, q), [Z, er] = h(L, j, J, rr), [nr, or] = g(F, M, T, O), [mr, Yt] = g(w, x, V, k), [Ht, Xt] = h(nr, or, mr, Yt), [Jt, Qt] = g(w, x, C, q), [Kt, re] = g(I, z, T, O), [Qp, Kp] = h(Jt, Qt, Kt, re);
              S[D * 3 * 2] = Z, S[D * 3 * 2 + 1] = er, S[(D * 3 + 1) * 2] = Ht, S[(D * 3 + 1) * 2 + 1] = Xt, S[(D * 3 + 2) * 2] = Qp, S[(D * 3 + 2) * 2 + 1] = Kp;
            }
          } else {
            let S = A.data;
            for (let D = 0; D < b; D++) {
              let w = Number(r.iget(D * 3)), x = Number(r.iget(D * 3 + 1)), I = Number(r.iget(D * 3 + 2)), z = Number(t.iget(D * 3)), F = Number(t.iget(D * 3 + 1)), M = Number(t.iget(D * 3 + 2));
              S[D * 3] = x * M - I * F, S[D * 3 + 1] = I * z - w * M, S[D * 3 + 2] = w * F - x * z;
            }
          }
          return A;
        }
        if (m === 2 && d === 2) {
          let A = N.zeros([b], y);
          if (f) {
            let S = A.data;
            for (let D = 0; D < b; D++) {
              let [w, x] = p(r, D * 2), [I, z] = p(r, D * 2 + 1), [F, M] = p(t, D * 2), [T, O] = p(t, D * 2 + 1), [C, q] = g(w, x, T, O), [V, k] = g(I, z, F, M), [L, j] = h(C, q, V, k);
              S[D * 2] = L, S[D * 2 + 1] = j;
            }
          } else {
            let S = A.data;
            for (let D = 0; D < b; D++) {
              let w = Number(r.iget(D * 2)), x = Number(r.iget(D * 2 + 1)), I = Number(t.iget(D * 2)), z = Number(t.iget(D * 2 + 1));
              S[D] = w * z - x * I;
            }
          }
          return A;
        }
      }
      throw new Error(`cross product not implemented for arrays with shapes ${JSON.stringify(a)} and ${JSON.stringify(i)}`);
    }
    function Ci(r, t, e = 0) {
      U(r.dtype, "bincount", "bincount requires integer input.");
      let n = r.data, o = r.size, a = 0;
      for (let s = 0; s < o; s++) {
        let u = Number(n[s]);
        if (u < 0 || !Number.isInteger(u)) throw new Error("'x' argument must contain non-negative integers");
        u > a && (a = u);
      }
      let i = Math.max(a + 1, e);
      if (t !== void 0) {
        if (t.size !== o) throw new Error("weights array must have same length as x");
        let s = t.data, u = new Float64Array(i);
        for (let c = 0; c < o; c++) {
          let l = Number(n[c]);
          u[l] += Number(s[c]);
        }
        return N.fromData(u, [i], "float64");
      } else {
        let s = new Float64Array(i);
        for (let u = 0; u < o; u++) {
          let c = Number(n[u]);
          s[c]++;
        }
        return N.fromData(s, [i], "float64");
      }
    }
    function Ui(r, t, e = false) {
      U(r.dtype, "digitize", "digitize requires real numbers."), U(t.dtype, "digitize", "digitize requires real numbers.");
      let n = r.data, o = t.data, a = r.size, i = t.size, s = new Float64Array(a), u = true;
      i > 1 && (u = Number(o[1]) >= Number(o[0]));
      for (let c = 0; c < a; c++) {
        let l = Number(n[c]), m;
        if (u) e ? m = Fd(o, i, l) : m = dt(o, i, l);
        else if (e) for (m = 0; m < i && Number(o[m]) >= l; ) m++;
        else for (m = 0; m < i && Number(o[m]) > l; ) m++;
        s[c] = m;
      }
      return N.fromData(s, [...r.shape], "float64");
    }
    function Fd(r, t, e) {
      let n = 0, o = t;
      for (; n < o; ) {
        let a = n + o >>> 1;
        Number(r[a]) < e ? n = a + 1 : o = a;
      }
      return n;
    }
    function dt(r, t, e) {
      let n = 0, o = t;
      for (; n < o; ) {
        let a = n + o >>> 1;
        Number(r[a]) <= e ? n = a + 1 : o = a;
      }
      return n;
    }
    function $i(r, t = 10, e, n = false, o) {
      U(r.dtype, "histogram", "histogram requires real numbers."), typeof t != "number" && U(t.dtype, "histogram", "histogram requires real numbers.");
      let a = r.data, i = r.size, s;
      if (typeof t == "number") {
        let m, d;
        if (e) [m, d] = e;
        else {
          m = 1 / 0, d = -1 / 0;
          for (let f = 0; f < i; f++) {
            let p = Number(a[f]);
            p < m && (m = p), p > d && (d = p);
          }
          m === d && (m = m - 0.5, d = d + 0.5);
        }
        s = [];
        let y = (d - m) / t;
        for (let f = 0; f <= t; f++) s.push(m + f * y);
      } else {
        let m = t.data;
        s = [];
        for (let d = 0; d < t.size; d++) s.push(Number(m[d]));
      }
      let u = s.length - 1, c = new Float64Array(u), l = o?.data;
      for (let m = 0; m < i; m++) {
        let d = Number(a[m]), y = l ? Number(l[m]) : 1, f = dt(s, s.length, d) - 1;
        if (!(f < 0)) {
          if (f >= u) if (d === s[u]) f = u - 1;
          else continue;
          c[f] += y;
        }
      }
      if (n) {
        let m = 0;
        for (let d = 0; d < u; d++) m += c[d];
        for (let d = 0; d < u; d++) {
          let y = s[d + 1] - s[d];
          c[d] = c[d] / (m * y);
        }
      }
      return { hist: N.fromData(c, [u], "float64"), bin_edges: N.fromData(new Float64Array(s), [s.length], "float64") };
    }
    function Ri(r, t, e = 10, n, o = false, a) {
      U(r.dtype, "histogram2d", "histogram2d requires real numbers."), U(t.dtype, "histogram2d", "histogram2d requires real numbers.");
      let i = r.data, s = t.data, u = r.size;
      if (t.size !== u) throw new Error("x and y must have the same length");
      let c, l, m, d;
      if (typeof e == "number" ? (m = e, d = e) : Array.isArray(e) && e.length === 2 ? (e[0], m = e[0], d = e[1]) : (m = 10, d = 10), typeof m == "number") {
        let h, b;
        if (n) [h, b] = n[0];
        else {
          h = 1 / 0, b = -1 / 0;
          for (let S = 0; S < u; S++) {
            let D = Number(i[S]);
            D < h && (h = D), D > b && (b = D);
          }
          h === b && (h -= 0.5, b += 0.5);
        }
        c = [];
        let A = (b - h) / m;
        for (let S = 0; S <= m; S++) c.push(h + S * A);
      } else {
        let h = m.data;
        c = [];
        for (let b = 0; b < m.size; b++) c.push(Number(h[b]));
      }
      if (typeof d == "number") {
        let h, b;
        if (n) [h, b] = n[1];
        else {
          h = 1 / 0, b = -1 / 0;
          for (let S = 0; S < u; S++) {
            let D = Number(s[S]);
            D < h && (h = D), D > b && (b = D);
          }
          h === b && (h -= 0.5, b += 0.5);
        }
        l = [];
        let A = (b - h) / d;
        for (let S = 0; S <= d; S++) l.push(h + S * A);
      } else {
        let h = d.data;
        l = [];
        for (let b = 0; b < d.size; b++) l.push(Number(h[b]));
      }
      let y = c.length - 1, f = l.length - 1, p = new Float64Array(y * f), g = a?.data;
      for (let h = 0; h < u; h++) {
        let b = Number(i[h]), A = Number(s[h]), S = g ? Number(g[h]) : 1, D = dt(c, c.length, b) - 1, w = dt(l, l.length, A) - 1;
        if (D < 0 || D >= y) if (b === c[y] && D === y) D = y - 1;
        else continue;
        if (w < 0 || w >= f) if (A === l[f] && w === f) w = f - 1;
        else continue;
        p[D * f + w] += S;
      }
      if (o) {
        let h = 0;
        for (let b = 0; b < p.length; b++) h += p[b];
        for (let b = 0; b < y; b++) for (let A = 0; A < f; A++) {
          let S = c[b + 1] - c[b], D = l[A + 1] - l[A], w = S * D;
          p[b * f + A] = p[b * f + A] / (h * w);
        }
      }
      return { hist: N.fromData(p, [y, f], "float64"), x_edges: N.fromData(new Float64Array(c), [c.length], "float64"), y_edges: N.fromData(new Float64Array(l), [l.length], "float64") };
    }
    function ki(r, t = 10, e, n = false, o) {
      U(r.dtype, "histogramdd", "histogramdd requires real numbers.");
      let a = r.shape, i = r.data, s, u;
      if (a.length === 1) s = a[0], u = 1;
      else if (a.length === 2) s = a[0], u = a[1];
      else throw new Error("sample must be 1D or 2D array");
      let c;
      if (typeof t == "number") c = new Array(u).fill(t);
      else if (c = t, c.length !== u) throw new Error("bins array length must match number of dimensions");
      let l = [];
      for (let h = 0; h < u; h++) {
        let b, A;
        if (e && e[h]) [b, A] = e[h];
        else {
          b = 1 / 0, A = -1 / 0;
          for (let x = 0; x < s; x++) {
            let I = Number(u === 1 ? i[x] : i[x * u + h]);
            I < b && (b = I), I > A && (A = I);
          }
          b === A && (b -= 0.5, A += 0.5);
        }
        let S = c[h], D = [], w = (A - b) / S;
        for (let x = 0; x <= S; x++) D.push(b + x * w);
        l.push(D);
      }
      let m = c.slice(), d = m.reduce((h, b) => h * b, 1), y = new Float64Array(d), f = new Array(u);
      f[u - 1] = 1;
      for (let h = u - 2; h >= 0; h--) f[h] = f[h + 1] * c[h + 1];
      let p = o?.data;
      for (let h = 0; h < s; h++) {
        let b = p ? Number(p[h]) : 1, A = 0, S = false;
        for (let D = 0; D < u; D++) {
          let w = Number(u === 1 ? i[h] : i[h * u + D]), x = l[D], I = c[D], z = dt(x, x.length, w) - 1;
          if (z < 0 || z >= I) if (w === x[I] && z === I) z = I - 1;
          else {
            S = true;
            break;
          }
          A += z * f[D];
        }
        S || (y[A] += b);
      }
      if (n) {
        let h = 0;
        for (let A = 0; A < d; A++) h += y[A];
        let b = new Float64Array(d);
        for (let A = 0; A < d; A++) {
          let S = 1, D = A;
          for (let w = 0; w < u; w++) {
            let x = Math.floor(D / f[w]) % c[w], I = l[w];
            S *= I[x + 1] - I[x];
          }
          b[A] = S;
        }
        for (let A = 0; A < d; A++) y[A] = y[A] / (h * b[A]);
      }
      let g = l.map((h) => N.fromData(new Float64Array(h), [h.length], "float64"));
      return { hist: N.fromData(y, m, "float64"), edges: g };
    }
    function un(r, t, e = "full") {
      let n = r.data, o = t.data, a = r.size, i = t.size, s = v(r.dtype) || v(t.dtype), u = a + i - 1;
      if (s) {
        let l = new Float64Array(u), m = new Float64Array(u), d = v(r.dtype), y = v(t.dtype);
        for (let p = 0; p < u; p++) {
          let g = 0, h = 0, b = p - i + 1;
          for (let A = 0; A < a; A++) {
            let S = A - b;
            if (S >= 0 && S < i) {
              let D, w, x, I;
              d ? (D = n[A * 2], w = n[A * 2 + 1]) : (D = Number(n[A]), w = 0), y ? (x = o[S * 2], I = o[S * 2 + 1]) : (x = Number(o[S]), I = 0), g += D * x + w * I, h += w * x - D * I;
            }
          }
          l[p] = g, m[p] = h;
        }
        let f = (p, g, h, b = 0) => {
          let A = new Float64Array(h * 2);
          for (let S = 0; S < h; S++) A[S * 2] = p[b + S], A[S * 2 + 1] = g[b + S];
          return N.fromData(A, [h], "complex128");
        };
        if (e === "full") return f(l, m, u);
        if (e === "same") {
          let p = Math.floor((u - a) / 2);
          return f(l, m, a, p);
        } else {
          let p = Math.max(a, i) - Math.min(a, i) + 1, g = Math.min(a, i) - 1;
          return f(l, m, p, g);
        }
      }
      let c = new Float64Array(u);
      for (let l = 0; l < u; l++) {
        let m = 0, d = l - i + 1;
        for (let y = 0; y < a; y++) {
          let f = y - d;
          f >= 0 && f < i && (m += Number(n[y]) * Number(o[f]));
        }
        c[l] = m;
      }
      if (e === "full") return N.fromData(c, [u], "float64");
      if (e === "same") {
        let l = Math.floor((u - a) / 2), m = new Float64Array(a);
        for (let d = 0; d < a; d++) m[d] = c[l + d];
        return N.fromData(m, [a], "float64");
      } else {
        let l = Math.max(a, i) - Math.min(a, i) + 1, m = Math.min(a, i) - 1, d = new Float64Array(l);
        for (let y = 0; y < l; y++) d[y] = c[m + y];
        return N.fromData(d, [l], "float64");
      }
    }
    function qi(r, t, e = "full") {
      let n = t.data, o = t.size, a = v(t.dtype), i;
      if (a) {
        let s = new Float64Array(o * 2);
        for (let u = 0; u < o; u++) {
          let c = o - 1 - u;
          s[u * 2] = n[c * 2], s[u * 2 + 1] = n[c * 2 + 1];
        }
        i = N.fromData(s, [o], t.dtype);
      } else {
        let s = new Float64Array(o);
        for (let u = 0; u < o; u++) s[u] = Number(n[o - 1 - u]);
        i = N.fromData(s, [o], "float64");
      }
      if (a) {
        let s = i.data;
        for (let u = 0; u < o; u++) s[u * 2 + 1] = -s[u * 2 + 1];
      }
      return un(r, i, e);
    }
    function cn(r, t, e = true, n = false, o) {
      let a = r.shape, i = r.data, s = v(r.dtype) || t !== void 0 && v(t.dtype), u;
      if (o !== void 0 ? u = o : u = n ? 0 : 1, a.length === 1) if (t !== void 0) {
        let f = t.data, p = r.size, g = v(r.dtype), h = v(t.dtype);
        if (t.size !== p) throw new Error("m and y must have same length");
        if (s) {
          let I = 0, z = 0, F = 0, M = 0;
          for (let Z = 0; Z < p; Z++) g ? (I += i[Z * 2], z += i[Z * 2 + 1]) : I += Number(i[Z]), h ? (F += f[Z * 2], M += f[Z * 2 + 1]) : F += Number(f[Z]);
          I /= p, z /= p, F /= p, M /= p;
          let T = 0, O = 0, C = 0, q = 0, V = 0, k = 0, L = 0, j = 0;
          for (let Z = 0; Z < p; Z++) {
            let er, nr, or, mr;
            g ? (er = i[Z * 2] - I, nr = i[Z * 2 + 1] - z) : (er = Number(i[Z]) - I, nr = 0), h ? (or = f[Z * 2] - F, mr = f[Z * 2 + 1] - M) : (or = Number(f[Z]) - F, mr = 0), T += er * er + nr * nr, C += or * or + mr * mr, V += er * or + nr * mr, k += nr * or - er * mr, L += or * er + mr * nr, j += mr * er - or * nr;
          }
          let J = p - u;
          if (J <= 0) {
            let Z = new Float64Array(8);
            return Z.fill(NaN), N.fromData(Z, [2, 2], "complex128");
          }
          T /= J, C /= J, V /= J, k /= J, L /= J, j /= J;
          let rr = new Float64Array(8);
          return rr[0] = T, rr[1] = O, rr[2] = V, rr[3] = k, rr[4] = L, rr[5] = j, rr[6] = C, rr[7] = q, N.fromData(rr, [2, 2], "complex128");
        }
        let b = 0, A = 0;
        for (let I = 0; I < p; I++) b += Number(i[I]), A += Number(f[I]);
        b /= p, A /= p;
        let S = 0, D = 0, w = 0;
        for (let I = 0; I < p; I++) {
          let z = Number(i[I]) - b, F = Number(f[I]) - A;
          S += z * z, D += F * F, w += z * F;
        }
        let x = p - u;
        return x <= 0 ? N.fromData(new Float64Array([NaN, NaN, NaN, NaN]), [2, 2], "float64") : (S /= x, D /= x, w /= x, N.fromData(new Float64Array([S, w, w, D]), [2, 2], "float64"));
      } else {
        let f = r.size;
        if (s) {
          let b = 0, A = 0;
          for (let w = 0; w < f; w++) b += i[w * 2], A += i[w * 2 + 1];
          b /= f, A /= f;
          let S = 0;
          for (let w = 0; w < f; w++) {
            let x = i[w * 2] - b, I = i[w * 2 + 1] - A;
            S += x * x + I * I;
          }
          let D = f - u;
          return D <= 0 ? N.fromData(new Float64Array([NaN, 0]), [], "complex128") : (S /= D, N.fromData(new Float64Array([S, 0]), [], "complex128"));
        }
        let p = 0;
        for (let b = 0; b < f; b++) p += Number(i[b]);
        p /= f;
        let g = 0;
        for (let b = 0; b < f; b++) {
          let A = Number(i[b]) - p;
          g += A * A;
        }
        let h = f - u;
        return h <= 0 ? N.fromData(new Float64Array([NaN]), [], "float64") : (g /= h, N.fromData(new Float64Array([g]), [], "float64"));
      }
      let c, l;
      e ? (c = a[0], l = a[1]) : (c = a[1], l = a[0]);
      let m = l - u;
      if (s) {
        let f = new Float64Array(c), p = new Float64Array(c);
        for (let h = 0; h < c; h++) {
          let b = 0, A = 0;
          for (let S = 0; S < l; S++) {
            let D = e ? h * l + S : S * c + h;
            b += i[D * 2], A += i[D * 2 + 1];
          }
          f[h] = b / l, p[h] = A / l;
        }
        let g = new Float64Array(c * c * 2);
        if (m <= 0) return g.fill(NaN), N.fromData(g, [c, c], "complex128");
        for (let h = 0; h < c; h++) for (let b = 0; b < c; b++) {
          let A = 0, S = 0;
          for (let w = 0; w < l; w++) {
            let x = e ? h * l + w : w * c + h, I = e ? b * l + w : w * c + b, z = i[x * 2] - f[h], F = i[x * 2 + 1] - p[h], M = i[I * 2] - f[b], T = i[I * 2 + 1] - p[b];
            A += z * M + F * T, S += F * M - z * T;
          }
          let D = (h * c + b) * 2;
          g[D] = A / m, g[D + 1] = S / m;
        }
        return N.fromData(g, [c, c], "complex128");
      }
      let d = new Float64Array(c);
      for (let f = 0; f < c; f++) {
        let p = 0;
        for (let g = 0; g < l; g++) {
          let h = e ? f * l + g : g * c + f;
          p += Number(i[h]);
        }
        d[f] = p / l;
      }
      let y = new Float64Array(c * c);
      if (m <= 0) return y.fill(NaN), N.fromData(y, [c, c], "float64");
      for (let f = 0; f < c; f++) for (let p = f; p < c; p++) {
        let g = 0;
        for (let b = 0; b < l; b++) {
          let A = e ? f * l + b : b * c + f, S = e ? p * l + b : b * c + p, D = Number(i[A]) - d[f], w = Number(i[S]) - d[p];
          g += D * w;
        }
        let h = g / m;
        y[f * c + p] = h, y[p * c + f] = h;
      }
      return N.fromData(y, [c, c], "float64");
    }
    function Vi(r, t, e = true) {
      let n = v(r.dtype) || t !== void 0 && v(t.dtype);
      if (r.shape.length === 1 && t === void 0) return n ? N.fromData(new Float64Array([1, 0]), [], "complex128") : N.fromData(new Float64Array([1]), [], "float64");
      let o = cn(r, t, e, false), a = o.data, s = o.shape[0];
      if (n) {
        let c = new Float64Array(s * s * 2);
        for (let l = 0; l < s; l++) for (let m = 0; m < s; m++) {
          let d = a[(l * s + m) * 2], y = a[(l * s + m) * 2 + 1], f = a[(l * s + l) * 2], p = a[(m * s + m) * 2], g = (l * s + m) * 2;
          if (f <= 0 || p <= 0) c[g] = NaN, c[g + 1] = NaN;
          else {
            let h = Math.sqrt(f * p);
            c[g] = d / h, c[g + 1] = y / h;
          }
        }
        return N.fromData(c, [s, s], "complex128");
      }
      let u = new Float64Array(s * s);
      for (let c = 0; c < s; c++) for (let l = 0; l < s; l++) {
        let m = Number(a[c * s + l]), d = Number(a[c * s + c]), y = Number(a[l * s + l]);
        d <= 0 || y <= 0 ? u[c * s + l] = NaN : u[c * s + l] = m / Math.sqrt(d * y);
      }
      return N.fromData(u, [s, s], "float64");
    }
    function ji(r, t = 10, e, n) {
      U(r.dtype, "histogram_bin_edges", "histogram_bin_edges requires real numbers.");
      let o = r.data, a = r.size, i, s;
      if (e) [i, s] = e;
      else {
        i = 1 / 0, s = -1 / 0;
        for (let m = 0; m < a; m++) {
          let d = Number(o[m]);
          isNaN(d) || (d < i && (i = d), d > s && (s = d));
        }
        !isFinite(i) || !isFinite(s) ? (i = 0, s = 1) : i === s && (i = i - 0.5, s = s + 0.5);
      }
      let u;
      typeof t == "number" ? u = t : u = sn(o, a, i, s, t), u = Math.max(1, Math.round(u));
      let c = new Float64Array(u + 1), l = (s - i) / u;
      for (let m = 0; m <= u; m++) c[m] = i + m * l;
      return N.fromData(c, [u + 1], "float64");
    }
    function sn(r, t, e, n, o) {
      if (t === 0) return 1;
      let a = n - e;
      if (a === 0) return 1;
      let i = [], s = 0;
      for (let p = 0; p < t; p++) {
        let g = Number(r[p]);
        isNaN(g) || (i.push(g), s += g);
      }
      let u = i.length;
      if (u === 0) return 1;
      let c = s / u, l = 0;
      for (let p = 0; p < u; p++) {
        let g = i[p] - c;
        l += g * g;
      }
      let m = Math.sqrt(l / u);
      i.sort((p, g) => p - g);
      let d = i[Math.floor(u * 0.25)] ?? 0, f = (i[Math.floor(u * 0.75)] ?? 0) - d;
      switch (o) {
        case "sqrt":
          return Math.ceil(Math.sqrt(u));
        case "sturges":
          return Math.ceil(Math.log2(u) + 1);
        case "rice":
          return Math.ceil(2 * Math.pow(u, 1 / 3));
        case "scott": {
          if (m === 0) return 1;
          let p = 3.5 * m / Math.pow(u, 1 / 3);
          return Math.ceil(a / p);
        }
        case "fd": {
          if (f === 0) return sn(r, t, e, n, "sturges");
          let p = 2 * f / Math.pow(u, 1 / 3);
          return Math.ceil(a / p);
        }
        case "doane": {
          let p = vd(i, c, m), g = Math.sqrt(6 * (u - 2) / ((u + 1) * (u + 3)));
          return Math.ceil(1 + Math.log2(u) + Math.log2(1 + Math.abs(p) / g));
        }
        case "stone":
          return sn(r, t, e, n, "sturges");
        default: {
          let p = Math.ceil(Math.log2(u) + 1), g = f === 0 ? p : Math.ceil(a / (2 * f / Math.pow(u, 1 / 3)));
          return Math.max(p, g);
        }
      }
    }
    function vd(r, t, e) {
      if (e === 0) return 0;
      let n = r.length, o = 0;
      for (let a = 0; a < n; a++) o += Math.pow((r[a] - t) / e, 3);
      return o / n;
    }
    function Pi(r, t, e = 1, n = -1) {
      U(r.dtype, "trapezoid", "trapezoid requires real numbers."), t !== void 0 && U(t.dtype, "trapezoid", "trapezoid requires real numbers.");
      let o = Array.from(r.shape), a = o.length;
      if (n < 0 && (n = a + n), n < 0 || n >= a) throw new Error(`axis ${n} is out of bounds for array of dimension ${a}`);
      let i = o[n];
      if (i < 2) throw new Error("trapezoid requires at least 2 samples along axis");
      let s;
      if (t !== void 0) {
        if (t.size !== i) throw new Error(`x array size (${t.size}) must match y axis size (${i})`);
        let p = t.data;
        s = new Float64Array(i);
        for (let g = 0; g < i; g++) s[g] = Number(p[g]);
      } else {
        s = new Float64Array(i);
        for (let p = 0; p < i; p++) s[p] = p * e;
      }
      let u = [...o];
      if (u.splice(n, 1), a === 1) {
        let p = r.data, g = 0;
        for (let h = 0; h < i - 1; h++) {
          let b = Number(p[h]), A = Number(p[h + 1]), S = s[h + 1] - s[h];
          g += 0.5 * (b + A) * S;
        }
        return g;
      }
      let c = u.reduce((p, g) => p * g, 1), l = new Float64Array(c), m = new Array(a), d = 1;
      for (let p = a - 1; p >= 0; p--) m[p] = d, d *= o[p];
      let y = new Array(u.length);
      d = 1;
      for (let p = u.length - 1; p >= 0; p--) y[p] = d, d *= u[p];
      let f = r.data;
      for (let p = 0; p < c; p++) {
        let g = [], h = p;
        for (let D = 0; D < u.length; D++) {
          let w = Math.floor(h / y[D]);
          h %= y[D], g.push(w);
        }
        let b = [], A = 0;
        for (let D = 0; D < a; D++) D === n ? b.push(0) : (b.push(g[A]), A++);
        let S = 0;
        for (let D = 0; D < i - 1; D++) {
          b[n] = D;
          let w = 0;
          for (let M = 0; M < a; M++) w += b[M] * m[M];
          b[n] = D + 1;
          let x = 0;
          for (let M = 0; M < a; M++) x += b[M] * m[M];
          let I = Number(f[w]), z = Number(f[x]), F = s[D + 1] - s[D];
          S += 0.5 * (I + z) * F;
        }
        l[p] = S;
      }
      return u.length === 0 ? l[0] : N.fromData(l, u, "float64");
    }
    var _ = class r {
      constructor(t, e) {
        this._storage = t, this._base = e;
      }
      get storage() {
        return this._storage;
      }
      static _fromStorage(t, e) {
        return new r(t, e);
      }
      get shape() {
        return this._storage.shape;
      }
      get ndim() {
        return this._storage.ndim;
      }
      get size() {
        return this._storage.size;
      }
      get dtype() {
        return this._storage.dtype;
      }
      get data() {
        return this._storage.data;
      }
      get strides() {
        return this._storage.strides;
      }
      get flags() {
        return { C_CONTIGUOUS: this._storage.isCContiguous, F_CONTIGUOUS: this._storage.isFContiguous, OWNDATA: this._base === void 0 };
      }
      get base() {
        return this._base ?? null;
      }
      get T() {
        return this.transpose();
      }
      get itemsize() {
        return Rr(this._storage.dtype);
      }
      get nbytes() {
        return this.size * this.itemsize;
      }
      fill(t) {
        let e = this._storage.dtype, n = this.size;
        if (B(e)) {
          let o = typeof t == "bigint" ? t : BigInt(Math.round(Number(t)));
          for (let a = 0; a < n; a++) this._storage.iset(a, o);
        } else if (e === "bool") {
          let o = t ? 1 : 0;
          for (let a = 0; a < n; a++) this._storage.iset(a, o);
        } else {
          let o = Number(t);
          for (let a = 0; a < n; a++) this._storage.iset(a, o);
        }
      }
      *[Symbol.iterator]() {
        if (this.ndim === 0) yield this._storage.iget(0);
        else if (this.ndim === 1) for (let t = 0; t < this.shape[0]; t++) yield this._storage.iget(t);
        else for (let t = 0; t < this.shape[0]; t++) yield this.slice(String(t));
      }
      get(t) {
        if (t.length !== this.ndim) throw new Error(`Index has ${t.length} dimensions, but array has ${this.ndim} dimensions`);
        let e = t.map((n, o) => {
          let a = n;
          if (a < 0 && (a = this.shape[o] + a), a < 0 || a >= this.shape[o]) throw new Error(`Index ${n} is out of bounds for axis ${o} with size ${this.shape[o]}`);
          return a;
        });
        return this._storage.get(...e);
      }
      set(t, e) {
        if (t.length !== this.ndim) throw new Error(`Index has ${t.length} dimensions, but array has ${this.ndim} dimensions`);
        let n = t.map((a, i) => {
          let s = a;
          if (s < 0 && (s = this.shape[i] + s), s < 0 || s >= this.shape[i]) throw new Error(`Index ${a} is out of bounds for axis ${i} with size ${this.shape[i]}`);
          return s;
        }), o = this.dtype;
        if (v(o)) this._storage.set(n, e);
        else if (B(o)) {
          let a = e instanceof E ? e.re : Number(e), i = typeof e == "bigint" ? e : BigInt(Math.round(a));
          this._storage.set(n, i);
        } else if (o === "bool") {
          let i = (e instanceof E ? e.re : Number(e)) ? 1 : 0;
          this._storage.set(n, i);
        } else {
          let a = e instanceof E ? e.re : Number(e);
          this._storage.set(n, a);
        }
      }
      copy() {
        return new r(this._storage.copy());
      }
      astype(t, e = true) {
        let n = this.dtype;
        if (n === t && !e) return this;
        if (n === t && e) return this.copy();
        let o = Array.from(this.shape), a = this.size, i = P(t);
        if (!i) throw new Error(`Cannot convert to dtype ${t}`);
        let s = new i(a), u = this.data;
        if (B(n) && !B(t)) {
          let l = u;
          if (t === "bool") for (let m = 0; m < a; m++) s[m] = l[m] !== BigInt(0) ? 1 : 0;
          else for (let m = 0; m < a; m++) s[m] = Number(l[m]);
        } else if (!B(n) && B(t)) {
          let l = u;
          for (let m = 0; m < a; m++) s[m] = BigInt(Math.round(Number(l[m])));
        } else if (t === "bool") {
          let l = u;
          for (let m = 0; m < a; m++) s[m] = l[m] !== 0 ? 1 : 0;
        } else if (n === "bool" && !B(t)) {
          let l = u;
          for (let m = 0; m < a; m++) s[m] = l[m];
        } else if (!B(n) && !B(t)) {
          let l = u;
          for (let m = 0; m < a; m++) s[m] = l[m];
        } else {
          let l = u;
          for (let m = 0; m < a; m++) s[m] = l[m];
        }
        let c = N.fromData(s, o, t);
        return new r(c);
      }
      add(t) {
        let e = typeof t == "number" ? t : t._storage, n = Qn(this._storage, e);
        return r._fromStorage(n);
      }
      subtract(t) {
        let e = typeof t == "number" ? t : t._storage, n = Kn(this._storage, e);
        return r._fromStorage(n);
      }
      multiply(t) {
        let e = typeof t == "number" ? t : t._storage, n = ro(this._storage, e);
        return r._fromStorage(n);
      }
      divide(t) {
        let e = typeof t == "number" ? t : t._storage, n = to(this._storage, e);
        return r._fromStorage(n);
      }
      mod(t) {
        let e = typeof t == "number" ? t : t._storage, n = xt(this._storage, e);
        return r._fromStorage(n);
      }
      floor_divide(t) {
        let e = typeof t == "number" ? t : t._storage, n = oe(this._storage, e);
        return r._fromStorage(n);
      }
      positive() {
        let t = ao(this._storage);
        return r._fromStorage(t);
      }
      reciprocal() {
        let t = so(this._storage);
        return r._fromStorage(t);
      }
      sqrt() {
        let t = Oa(this._storage);
        return r._fromStorage(t);
      }
      power(t) {
        let e = typeof t == "number" ? t : t._storage, n = Ca(this._storage, e);
        return r._fromStorage(n);
      }
      exp() {
        let t = Ua(this._storage);
        return r._fromStorage(t);
      }
      exp2() {
        let t = $a(this._storage);
        return r._fromStorage(t);
      }
      expm1() {
        let t = Ra(this._storage);
        return r._fromStorage(t);
      }
      log() {
        let t = ka(this._storage);
        return r._fromStorage(t);
      }
      log2() {
        let t = qa(this._storage);
        return r._fromStorage(t);
      }
      log10() {
        let t = Va(this._storage);
        return r._fromStorage(t);
      }
      log1p() {
        let t = ja(this._storage);
        return r._fromStorage(t);
      }
      logaddexp(t) {
        let e = typeof t == "number" ? t : t._storage, n = Pa(this._storage, e);
        return r._fromStorage(n);
      }
      logaddexp2(t) {
        let e = typeof t == "number" ? t : t._storage, n = La(this._storage, e);
        return r._fromStorage(n);
      }
      absolute() {
        let t = eo(this._storage);
        return r._fromStorage(t);
      }
      negative() {
        let t = no(this._storage);
        return r._fromStorage(t);
      }
      sign() {
        let t = oo(this._storage);
        return r._fromStorage(t);
      }
      around(t = 0) {
        let e = Je(this._storage, t);
        return r._fromStorage(e);
      }
      round(t = 0) {
        return this.around(t);
      }
      ceil() {
        let t = Qe(this._storage);
        return r._fromStorage(t);
      }
      fix() {
        let t = Ke(this._storage);
        return r._fromStorage(t);
      }
      floor() {
        let t = rn(this._storage);
        return r._fromStorage(t);
      }
      rint() {
        let t = tn(this._storage);
        return r._fromStorage(t);
      }
      trunc() {
        let t = en(this._storage);
        return r._fromStorage(t);
      }
      sin() {
        let t = Ga(this._storage);
        return r._fromStorage(t);
      }
      cos() {
        let t = Wa(this._storage);
        return r._fromStorage(t);
      }
      tan() {
        let t = Za(this._storage);
        return r._fromStorage(t);
      }
      arcsin() {
        let t = Ya(this._storage);
        return r._fromStorage(t);
      }
      arccos() {
        let t = Ha(this._storage);
        return r._fromStorage(t);
      }
      arctan() {
        let t = Xa(this._storage);
        return r._fromStorage(t);
      }
      arctan2(t) {
        let e = typeof t == "number" ? t : t._storage, n = Ja(this._storage, e);
        return r._fromStorage(n);
      }
      hypot(t) {
        let e = typeof t == "number" ? t : t._storage, n = Qa(this._storage, e);
        return r._fromStorage(n);
      }
      degrees() {
        let t = Ka(this._storage);
        return r._fromStorage(t);
      }
      radians() {
        let t = rs(this._storage);
        return r._fromStorage(t);
      }
      sinh() {
        let t = ts(this._storage);
        return r._fromStorage(t);
      }
      cosh() {
        let t = es(this._storage);
        return r._fromStorage(t);
      }
      tanh() {
        let t = ns(this._storage);
        return r._fromStorage(t);
      }
      arcsinh() {
        let t = os(this._storage);
        return r._fromStorage(t);
      }
      arccosh() {
        let t = as(this._storage);
        return r._fromStorage(t);
      }
      arctanh() {
        let t = ss(this._storage);
        return r._fromStorage(t);
      }
      greater(t) {
        let e = typeof t == "number" ? t : t._storage, n = Eo(this._storage, e);
        return r._fromStorage(n);
      }
      greater_equal(t) {
        let e = typeof t == "number" ? t : t._storage, n = To(this._storage, e);
        return r._fromStorage(n);
      }
      less(t) {
        let e = typeof t == "number" ? t : t._storage, n = Oo(this._storage, e);
        return r._fromStorage(n);
      }
      less_equal(t) {
        let e = typeof t == "number" ? t : t._storage, n = Co(this._storage, e);
        return r._fromStorage(n);
      }
      equal(t) {
        let e = typeof t == "number" ? t : t._storage, n = Uo(this._storage, e);
        return r._fromStorage(n);
      }
      not_equal(t) {
        let e = typeof t == "number" ? t : t._storage, n = $o(this._storage, e);
        return r._fromStorage(n);
      }
      isclose(t, e = 1e-5, n = 1e-8) {
        let o = typeof t == "number" ? t : t._storage, a = ae(this._storage, o, e, n);
        return r._fromStorage(a);
      }
      allclose(t, e = 1e-5, n = 1e-8) {
        let o = typeof t == "number" ? t : t._storage;
        return Ro(this._storage, o, e, n);
      }
      bitwise_and(t) {
        let e = typeof t == "number" ? t : t._storage, n = Bs(this._storage, e);
        return r._fromStorage(n);
      }
      bitwise_or(t) {
        let e = typeof t == "number" ? t : t._storage, n = Es(this._storage, e);
        return r._fromStorage(n);
      }
      bitwise_xor(t) {
        let e = typeof t == "number" ? t : t._storage, n = Ts(this._storage, e);
        return r._fromStorage(n);
      }
      bitwise_not() {
        let t = Ot(this._storage);
        return r._fromStorage(t);
      }
      invert() {
        let t = Os(this._storage);
        return r._fromStorage(t);
      }
      left_shift(t) {
        let e = typeof t == "number" ? t : t._storage, n = je(this._storage, e);
        return r._fromStorage(n);
      }
      right_shift(t) {
        let e = typeof t == "number" ? t : t._storage, n = Pe(this._storage, e);
        return r._fromStorage(n);
      }
      logical_and(t) {
        let e = typeof t == "number" ? t : t._storage, n = js(this._storage, e);
        return r._fromStorage(n);
      }
      logical_or(t) {
        let e = typeof t == "number" ? t : t._storage, n = Ps(this._storage, e);
        return r._fromStorage(n);
      }
      logical_not() {
        let t = Ls(this._storage);
        return r._fromStorage(t);
      }
      logical_xor(t) {
        let e = typeof t == "number" ? t : t._storage, n = Gs(this._storage, e);
        return r._fromStorage(n);
      }
      isfinite() {
        let t = Ws(this._storage);
        return r._fromStorage(t);
      }
      isinf() {
        let t = Zs(this._storage);
        return r._fromStorage(t);
      }
      isnan() {
        let t = Ys(this._storage);
        return r._fromStorage(t);
      }
      isnat() {
        let t = Hs(this._storage);
        return r._fromStorage(t);
      }
      copysign(t) {
        let e = typeof t == "number" ? t : t._storage, n = Xs(this._storage, e);
        return r._fromStorage(n);
      }
      signbit() {
        let t = Js(this._storage);
        return r._fromStorage(t);
      }
      nextafter(t) {
        let e = typeof t == "number" ? t : t._storage, n = Qs(this._storage, e);
        return r._fromStorage(n);
      }
      spacing() {
        let t = Ks(this._storage);
        return r._fromStorage(t);
      }
      sum(t, e = false) {
        let n = Kr(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      mean(t, e = false) {
        let n = wt(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      max(t, e = false) {
        let n = Vr(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      min(t, e = false) {
        let n = jr(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      prod(t, e = false) {
        let n = se(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      argmin(t) {
        let e = ie(this._storage, t);
        return typeof e == "number" ? e : r._fromStorage(e);
      }
      argmax(t) {
        let e = ue(this._storage, t);
        return typeof e == "number" ? e : r._fromStorage(e);
      }
      var(t, e = 0, n = false) {
        let o = ce(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      std(t, e = 0, n = false) {
        let o = qo(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      all(t, e = false) {
        let n = le(this._storage, t, e);
        return typeof n == "boolean" ? n : r._fromStorage(n);
      }
      any(t, e = false) {
        let n = fe(this._storage, t, e);
        return typeof n == "boolean" ? n : r._fromStorage(n);
      }
      cumsum(t) {
        return r._fromStorage(me(this._storage, t));
      }
      cumprod(t) {
        return r._fromStorage(pe(this._storage, t));
      }
      ptp(t, e = false) {
        let n = ye(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      median(t, e = false) {
        let n = de(this._storage, t, e);
        return typeof n == "number" ? n : r._fromStorage(n);
      }
      percentile(t, e, n = false) {
        let o = ge(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      quantile(t, e, n = false) {
        let o = Lr(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      average(t, e) {
        let n = rt(this._storage, e, t?.storage);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      nansum(t, e = false) {
        let n = It(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      nanprod(t, e = false) {
        let n = zt(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      nanmean(t, e = false) {
        let n = _t(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      nanvar(t, e = 0, n = false) {
        let o = Pr(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      nanstd(t, e = 0, n = false) {
        let o = Ae(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      nanmin(t, e = false) {
        let n = tt(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      nanmax(t, e = false) {
        let n = et(this._storage, t, e);
        return typeof n == "number" || n instanceof E ? n : r._fromStorage(n);
      }
      nanquantile(t, e, n = false) {
        let o = at(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      nanpercentile(t, e, n = false) {
        let o = Se(this._storage, t, e, n);
        return typeof o == "number" ? o : r._fromStorage(o);
      }
      nanargmin(t) {
        let e = nt(this._storage, t);
        return typeof e == "number" ? e : r._fromStorage(e);
      }
      nanargmax(t) {
        let e = ot(this._storage, t);
        return typeof e == "number" ? e : r._fromStorage(e);
      }
      nancumsum(t) {
        return r._fromStorage(be(this._storage, t));
      }
      nancumprod(t) {
        return r._fromStorage(he(this._storage, t));
      }
      nanmedian(t, e = false) {
        let n = Mt(this._storage, t, e);
        return typeof n == "number" ? n : r._fromStorage(n);
      }
      sort(t = -1) {
        return r._fromStorage(Le(this._storage, t));
      }
      argsort(t = -1) {
        return r._fromStorage(Ge(this._storage, t));
      }
      partition(t, e = -1) {
        return r._fromStorage(We(this._storage, t, e));
      }
      argpartition(t, e = -1) {
        return r._fromStorage(Ze(this._storage, t, e));
      }
      nonzero() {
        return Ut(this._storage).map((e) => r._fromStorage(e));
      }
      argwhere() {
        return r._fromStorage(Ye(this._storage));
      }
      searchsorted(t, e = "left") {
        return r._fromStorage(He(this._storage, t._storage, e));
      }
      diff(t = 1, e = -1) {
        return r._fromStorage(an(this._storage, t, e));
      }
      reshape(...t) {
        let e = t.length === 1 && Array.isArray(t[0]) ? t[0] : t, n = K(this._storage, e), a = n.data === this.data ? this._base ?? this : void 0;
        return r._fromStorage(n, a);
      }
      flatten() {
        let t = Cr(this._storage);
        return r._fromStorage(t);
      }
      ravel() {
        let t = Gr(this._storage), n = t.data === this.data ? this._base ?? this : void 0;
        return r._fromStorage(t, n);
      }
      transpose(t) {
        let e = it(this._storage, t), n = this._base ?? this;
        return r._fromStorage(e, n);
      }
      squeeze(t) {
        let e = De(this._storage, t), n = this._base ?? this;
        return r._fromStorage(e, n);
      }
      expand_dims(t) {
        let e = st(this._storage, t), n = this._base ?? this;
        return r._fromStorage(e, n);
      }
      swapaxes(t, e) {
        let n = Vo(this._storage, t, e), o = this._base ?? this;
        return r._fromStorage(n, o);
      }
      moveaxis(t, e) {
        let n = Ne(this._storage, t, e), o = this._base ?? this;
        return r._fromStorage(n, o);
      }
      repeat(t, e) {
        let n = Xo(this._storage, t, e);
        return r._fromStorage(n);
      }
      take(t, e) {
        let n = us(this._storage, t, e);
        return r._fromStorage(n);
      }
      put(t, e) {
        let n = e instanceof r ? e._storage : e;
        cs(this._storage, t, n);
      }
      iindex(t, e = 0) {
        let n;
        if (t instanceof r) {
          n = [];
          for (let o = 0; o < t.size; o++) {
            let a = t.storage.iget(o), i = typeof a == "bigint" ? Number(a) : a instanceof E ? a.re : a;
            n.push(i);
          }
        } else Array.isArray(t) && t.length > 0 && Array.isArray(t[0]) ? n = t.flat() : n = t;
        return this.take(n, e);
      }
      bindex(t, e) {
        return r._fromStorage(Ue(t._storage, this._storage, e));
      }
      matmul(t) {
        let e = cr(this._storage, t._storage);
        return r._fromStorage(e);
      }
      dot(t) {
        let e = Zr(this._storage, t._storage);
        return typeof e == "number" || typeof e == "bigint" || e instanceof E ? e : r._fromStorage(e);
      }
      trace() {
        return Ie(this._storage);
      }
      inner(t) {
        let e = fa(this._storage, t._storage);
        return typeof e == "number" || typeof e == "bigint" || e instanceof E ? e : r._fromStorage(e);
      }
      outer(t) {
        let e = Ft(this._storage, t._storage);
        return r._fromStorage(e);
      }
      tensordot(t, e = 2) {
        let n = ze(this._storage, t._storage, e);
        return typeof n == "number" || typeof n == "bigint" || n instanceof E ? n : r._fromStorage(n);
      }
      cbrt() {
        let t = io(this._storage);
        return r._fromStorage(t);
      }
      fabs() {
        let t = uo(this._storage);
        return r._fromStorage(t);
      }
      divmod(t) {
        let e = typeof t == "number" ? t : t._storage, [n, o] = co(this._storage, e);
        return [r._fromStorage(n), r._fromStorage(o)];
      }
      square() {
        let t = lo(this._storage);
        return r._fromStorage(t);
      }
      remainder(t) {
        let e = typeof t == "number" ? t : t._storage, n = fo(this._storage, e);
        return r._fromStorage(n);
      }
      heaviside(t) {
        let e = typeof t == "number" ? t : t._storage, n = mo(this._storage, e);
        return r._fromStorage(n);
      }
      slice(...t) {
        if (t.length === 0) return this;
        if (t.length > this.ndim) throw new Error(`Too many indices for array: array is ${this.ndim}-dimensional, but ${t.length} were indexed`);
        let e = t.map((u, c) => {
          let l = Zn(u);
          return Yn(l, this.shape[c]);
        });
        for (; e.length < this.ndim; ) e.push({ start: 0, stop: this.shape[e.length], step: 1, isIndex: false });
        let n = [], o = [], a = this._storage.offset;
        for (let u = 0; u < e.length; u++) {
          let c = e[u], l = this._storage.strides[u];
          if (a += c.start * l, !c.isIndex) {
            let m;
            c.step > 0 ? m = Math.max(0, Math.ceil((c.stop - c.start) / c.step)) : m = Math.max(0, Math.ceil((c.start - c.stop) / Math.abs(c.step))), n.push(m), o.push(l * c.step);
          }
        }
        let i = N.fromData(this._storage.data, n, this._storage.dtype, o, a), s = this._base ?? this;
        return new r(i, s);
      }
      row(t) {
        if (this.ndim < 2) throw new Error("row() requires at least 2 dimensions");
        return this.slice(String(t), ":");
      }
      col(t) {
        if (this.ndim < 2) throw new Error("col() requires at least 2 dimensions");
        return this.slice(":", String(t));
      }
      rows(t, e) {
        if (this.ndim < 2) throw new Error("rows() requires at least 2 dimensions");
        return this.slice(`${t}:${e}`, ":");
      }
      cols(t, e) {
        if (this.ndim < 2) throw new Error("cols() requires at least 2 dimensions");
        return this.slice(":", `${t}:${e}`);
      }
      toString() {
        return `NDArray(shape=${JSON.stringify(this.shape)}, dtype=${this.dtype})`;
      }
      toArray() {
        if (this.ndim === 0) return this._storage.iget(0);
        let t = this.shape, e = t.length, n = (o, a) => {
          if (a === e) return this._storage.get(...o);
          let i = [];
          for (let s = 0; s < t[a]; s++) o[a] = s, i.push(n(o, a + 1));
          return i;
        };
        return n(new Array(e), 0);
      }
      tolist() {
        return this.toArray();
      }
      tobytes() {
        if (this._storage.isCContiguous) {
          let n = this._storage.data, o = n.BYTES_PER_ELEMENT, a = this._storage.offset * o, i = this.size * o;
          return n.buffer.slice(a, a + i);
        }
        let e = this.copy()._storage.data;
        return e.buffer.slice(0, this.size * e.BYTES_PER_ELEMENT);
      }
      item(...t) {
        if (t.length === 0) {
          if (this.size !== 1) throw new Error("can only convert an array of size 1 to a Python scalar");
          return this._storage.iget(0);
        }
        if (t.length === 1) {
          let e = t[0];
          if (e < 0 || e >= this.size) throw new Error(`index ${e} is out of bounds for size ${this.size}`);
          return this._storage.iget(e);
        }
        return this.get(t);
      }
      byteswap(t = false) {
        let e = t ? this : this.copy(), n = e._storage.data, o = n.BYTES_PER_ELEMENT;
        if (o === 1) return e;
        let a = n.buffer, i = new DataView(a);
        for (let s = 0; s < n.length; s++) {
          let u = s * o;
          if (o === 2) {
            let c = i.getUint8(u), l = i.getUint8(u + 1);
            i.setUint8(u, l), i.setUint8(u + 1, c);
          } else if (o === 4) {
            let c = i.getUint8(u), l = i.getUint8(u + 1), m = i.getUint8(u + 2), d = i.getUint8(u + 3);
            i.setUint8(u, d), i.setUint8(u + 1, m), i.setUint8(u + 2, l), i.setUint8(u + 3, c);
          } else if (o === 8) {
            let c = i.getUint8(u), l = i.getUint8(u + 1), m = i.getUint8(u + 2), d = i.getUint8(u + 3), y = i.getUint8(u + 4), f = i.getUint8(u + 5), p = i.getUint8(u + 6), g = i.getUint8(u + 7);
            i.setUint8(u, g), i.setUint8(u + 1, p), i.setUint8(u + 2, f), i.setUint8(u + 3, y), i.setUint8(u + 4, d), i.setUint8(u + 5, m), i.setUint8(u + 6, l), i.setUint8(u + 7, c);
          }
        }
        return e;
      }
      view(t) {
        if (!t || t === this.dtype) return r._fromStorage(this._storage, this._base ?? this);
        let e = Rr(this.dtype), n = Rr(t);
        if (e !== n) throw new Error("When changing to a larger dtype, its size must be a divisor of the total size in bytes of the last axis of the array.");
        let o = P(t);
        if (!o) throw new Error(`Unsupported dtype: ${t}`);
        let a = this._storage.data, i = a.byteOffset + this._storage.offset * e, s = new o(a.buffer, i, this.size), u = N.fromData(s, [...this.shape], t, [...this._storage.strides], 0);
        return r._fromStorage(u, this._base ?? this);
      }
      tofile(t, e = "", n = "") {
        throw new Error('tofile() requires file system access. Use the node module: import { save } from "numpy-ts/node"');
      }
    };
    function wr(r, t = Q) {
      let e = N.zeros(r, t);
      return new _(e);
    }
    function ln(r, t = Q) {
      let e = N.ones(r, t);
      return new _(e);
    }
    function Ed(r) {
      let t = [], e = r;
      for (; Array.isArray(e); ) t.push(e.length), e = e[0];
      return t;
    }
    function Li(r) {
      return typeof r == "bigint" ? true : Array.isArray(r) ? r.some((t) => Li(t)) : false;
    }
    function Gi(r) {
      return Jn(r) ? true : Array.isArray(r) ? r.some((t) => Gi(t)) : false;
    }
    function Td(r) {
      let t = [];
      function e(n) {
        Array.isArray(n) ? n.forEach((o) => e(o)) : t.push(n);
      }
      return e(r), t;
    }
    function G(r, t) {
      if (r instanceof _) return !t || r.dtype === t ? r.copy() : r.astype(t);
      let e = Li(r), n = Gi(r), o = Ed(r), a = o.reduce((y, f) => y * f, 1), i = t;
      i || (n ? i = "complex128" : e ? i = "int64" : i = Q);
      let s = v(i), u = P(i);
      if (!u) throw new Error(`Cannot create array with dtype ${i}`);
      let c = s ? a * 2 : a, l = new u(c), m = Td(r);
      if (B(i)) {
        let y = l;
        for (let f = 0; f < a; f++) {
          let p = m[f];
          y[f] = typeof p == "bigint" ? p : BigInt(Math.round(Number(p)));
        }
      } else if (i === "bool") {
        let y = l;
        for (let f = 0; f < a; f++) y[f] = m[f] ? 1 : 0;
      } else if (s) {
        let y = l;
        for (let f = 0; f < a; f++) {
          let p = m[f], g, h;
          p instanceof E ? (g = p.re, h = p.im) : typeof p == "object" && p !== null && "re" in p ? (g = p.re, h = p.im ?? 0) : (g = Number(p), h = 0), y[f * 2] = g, y[f * 2 + 1] = h;
        }
      } else {
        let y = l;
        for (let f = 0; f < a; f++) {
          let p = m[f];
          y[f] = Number(p);
        }
      }
      let d = N.fromData(l, o, i);
      return new _(d);
    }
    function Wi(r, t, e = 1, n = Q) {
      let o = r, a = t;
      if (t === void 0 && (o = 0, a = r), a === void 0) throw new Error("stop is required");
      let i = Math.max(0, Math.ceil((a - o) / e)), s = P(n);
      if (!s) throw new Error(`Cannot create arange array with dtype ${n}`);
      let u = new s(i);
      if (B(n)) for (let l = 0; l < i; l++) u[l] = BigInt(Math.round(o + l * e));
      else if (n === "bool") for (let l = 0; l < i; l++) u[l] = o + l * e !== 0 ? 1 : 0;
      else for (let l = 0; l < i; l++) u[l] = o + l * e;
      let c = N.fromData(u, [i], n);
      return new _(c);
    }
    function Zi(r, t, e = 50, n = Q) {
      if (e < 0) throw new Error("num must be non-negative");
      if (e === 0) return G([], n);
      if (e === 1) return G([r], n);
      let o = P(n);
      if (!o) throw new Error(`Cannot create linspace array with dtype ${n}`);
      let a = new o(e), i = (t - r) / (e - 1);
      if (B(n)) for (let u = 0; u < e; u++) a[u] = BigInt(Math.round(r + u * i));
      else if (n === "bool") for (let u = 0; u < e; u++) a[u] = r + u * i !== 0 ? 1 : 0;
      else for (let u = 0; u < e; u++) a[u] = r + u * i;
      let s = N.fromData(a, [e], n);
      return new _(s);
    }
    function Yi(r, t, e = 50, n = 10, o = Q) {
      if (e < 0) throw new Error("num must be non-negative");
      if (e === 0) return G([], o);
      if (e === 1) return G([Math.pow(n, r)], o);
      let a = P(o);
      if (!a) throw new Error(`Cannot create logspace array with dtype ${o}`);
      let i = new a(e), s = (t - r) / (e - 1);
      if (B(o)) for (let c = 0; c < e; c++) {
        let l = r + c * s;
        i[c] = BigInt(Math.round(Math.pow(n, l)));
      }
      else if (o === "bool") for (let c = 0; c < e; c++) {
        let l = r + c * s;
        i[c] = Math.pow(n, l) !== 0 ? 1 : 0;
      }
      else for (let c = 0; c < e; c++) {
        let l = r + c * s;
        i[c] = Math.pow(n, l);
      }
      let u = N.fromData(i, [e], o);
      return new _(u);
    }
    function Hi(r, t, e = 50, n = Q) {
      if (e < 0) throw new Error("num must be non-negative");
      if (r === 0 || t === 0) throw new Error("Geometric sequence cannot include zero");
      if (e === 0) return G([], n);
      if (e === 1) return G([r], n);
      let o = Math.sign(r), a = Math.sign(t);
      if (o !== a) throw new Error("Geometric sequence cannot contain both positive and negative values");
      let i = P(n);
      if (!i) throw new Error(`Cannot create geomspace array with dtype ${n}`);
      let s = new i(e), u = Math.log(Math.abs(r)), l = (Math.log(Math.abs(t)) - u) / (e - 1);
      if (B(n)) for (let d = 0; d < e; d++) {
        let y = o * Math.exp(u + d * l);
        s[d] = BigInt(Math.round(y));
      }
      else if (n === "bool") for (let d = 0; d < e; d++) {
        let y = o * Math.exp(u + d * l);
        s[d] = y !== 0 ? 1 : 0;
      }
      else for (let d = 0; d < e; d++) {
        let y = o * Math.exp(u + d * l);
        s[d] = y;
      }
      let m = N.fromData(s, [e], n);
      return new _(m);
    }
    function fn(r, t, e = 0, n = Q) {
      let o = t ?? r, a = wr([r, o], n), i = a.data;
      if (B(n)) {
        let s = i;
        for (let u = 0; u < r; u++) {
          let c = u + e;
          c >= 0 && c < o && (s[u * o + c] = BigInt(1));
        }
      } else {
        let s = i;
        for (let u = 0; u < r; u++) {
          let c = u + e;
          c >= 0 && c < o && (s[u * o + c] = 1);
        }
      }
      return a;
    }
    function mn(r, t = Q) {
      return wr(r, t);
    }
    function pn(r, t, e) {
      let n = e;
      n || (typeof t == "bigint" ? n = "int64" : typeof t == "boolean" ? n = "bool" : Number.isInteger(t) ? n = "int32" : n = Q);
      let o = P(n);
      if (!o) throw new Error(`Cannot create full array with dtype ${n}`);
      let a = r.reduce((u, c) => u * c, 1), i = new o(a);
      if (B(n)) {
        let u = typeof t == "bigint" ? t : BigInt(Math.round(Number(t)));
        i.fill(u);
      } else n === "bool" ? i.fill(t ? 1 : 0) : i.fill(Number(t));
      let s = N.fromData(i, r, n);
      return new _(s);
    }
    function Xi(r, t = Q) {
      return fn(r, r, 0, t);
    }
    function Hr(r, t) {
      return r instanceof _ ? !t || r.dtype === t ? r : r.astype(t) : G(r, t);
    }
    function Ji(r, t) {
      let e = Hr(r, t);
      for (let n = 0; n < e.size; n++) if (!isFinite(Number(e.data[n]))) throw new Error("array must not contain infs or NaNs");
      return e;
    }
    function Qi(r, t, e) {
      let n = Array.isArray(e) ? e : e ? [e] : [], o = new Set(n.map((i) => {
        let s = i.toUpperCase();
        return s === "C_CONTIGUOUS" || s === "CONTIGUOUS" ? "C" : s === "F_CONTIGUOUS" || s === "FORTRAN" ? "F" : s === "WRITEABLE" ? "W" : s === "ENSUREARRAY" ? "E" : s === "OWNDATA" ? "O" : s;
      })), a = r;
      return t && r.dtype !== t && (a = r.astype(t)), (o.has("C") || o.has("W") || o.has("O")) && a === r && (a = r.copy()), a;
    }
    function Ki(r) {
      return r.copy();
    }
    function ru(r, t) {
      return wr(Array.from(r.shape), t ?? r.dtype);
    }
    function tu(r, t) {
      return ln(Array.from(r.shape), t ?? r.dtype);
    }
    function eu(r, t) {
      return mn(Array.from(r.shape), t ?? r.dtype);
    }
    function nu(r, t, e) {
      return pn(Array.from(r.shape), t, e ?? r.dtype);
    }
    function ou(r, t) {
      return Hr(r, t);
    }
    function au(r, t) {
      let e = Hr(r, t);
      return e.flags.C_CONTIGUOUS ? e : e.copy();
    }
    function su(r, t) {
      return Hr(r, t).copy();
    }
    function yn(r, t = 0) {
      if (r.ndim === 1) {
        let e = r.size, n = e + Math.abs(t), o = wr([n, n], r.dtype);
        for (let a = 0; a < e; a++) {
          let i = t >= 0 ? a : a - t, s = t >= 0 ? a + t : a;
          o.set([i, s], r.get([a]));
        }
        return o;
      } else if (r.ndim === 2) {
        let [e, n] = r.shape, o, a, i;
        if (t >= 0 ? (o = 0, a = t, i = Math.min(e, n - t)) : (o = -t, a = 0, i = Math.min(e + t, n)), i <= 0) return wr([0], r.dtype);
        let s = P(r.dtype), u = new s(i);
        for (let l = 0; l < i; l++) {
          let m = r.get([o + l, a + l]);
          B(r.dtype) ? u[l] = typeof m == "bigint" ? m : BigInt(m) : u[l] = m;
        }
        let c = N.fromData(u, [i], r.dtype);
        return new _(c);
      } else throw new Error("Input must be 1-D or 2-D");
    }
    function iu(r, t = 0) {
      let e = r.flatten();
      return yn(e, t);
    }
    function uu(r, t, e = Q) {
      let n = t.reduce((c, l) => c * l, 1), o = P(e);
      if (!o) throw new Error(`Cannot create array with dtype ${e}`);
      let a = new o(n), i = t.length, s = new Array(i).fill(0);
      for (let c = 0; c < n; c++) {
        let l = r(...s);
        B(e) ? a[c] = typeof l == "bigint" ? l : BigInt(Number(l)) : e === "bool" ? a[c] = l ? 1 : 0 : a[c] = Number(l);
        for (let m = i - 1; m >= 0 && (s[m]++, !(s[m] < t[m])); m--) s[m] = 0;
      }
      let u = N.fromData(a, t, e);
      return new _(u);
    }
    function cu(...r) {
      let t = [], e = "xy";
      for (let s of r) s instanceof _ ? t.push(s) : typeof s == "object" && "indexing" in s && (e = s.indexing || "xy");
      if (t.length === 0) return [];
      if (t.length === 1) return [t[0].copy()];
      let n = t.map((s) => s.size);
      e === "xy" && t.length >= 2 && (t = [t[1], t[0], ...t.slice(2)], [n[0], n[1]] = [n[1], n[0]]);
      let o = n, a = o.length, i = [];
      for (let s = 0; s < t.length; s++) {
        let u = t[s], c = u.size, l = new Array(a).fill(1);
        l[s] = c;
        let m = u.reshape(...l), d = Bt(m.storage, o), y = _._fromStorage(d.copy());
        i.push(y);
      }
      return e === "xy" && i.length >= 2 && ([i[0], i[1]] = [i[1], i[0]]), i;
    }
    function lu(r, t, e = 0, n = Q) {
      let o = t ?? r, a = wr([r, o], n);
      for (let i = 0; i < r; i++) for (let s = 0; s <= i + e && s < o; s++) s >= 0 && a.set([i, s], 1);
      return a;
    }
    function fu(r, t = 0) {
      if (r.ndim < 2) throw new Error("Input must have at least 2 dimensions");
      let e = r.copy(), n = e.shape, o = n[n.length - 2], a = n[n.length - 1], i = n.slice(0, -2).reduce((s, u) => s * u, 1);
      for (let s = 0; s < i; s++) for (let u = 0; u < o; u++) for (let c = 0; c < a; c++) if (c > u + t) {
        let l = [], m = s;
        for (let d = n.length - 3; d >= 0; d--) l.unshift(m % n[d]), m = Math.floor(m / n[d]);
        l.push(u, c), e.set(l, 0);
      }
      return e;
    }
    function mu(r, t = 0) {
      if (r.ndim < 2) throw new Error("Input must have at least 2 dimensions");
      let e = r.copy(), n = e.shape, o = n[n.length - 2], a = n[n.length - 1], i = n.slice(0, -2).reduce((s, u) => s * u, 1);
      for (let s = 0; s < i; s++) for (let u = 0; u < o; u++) for (let c = 0; c < a; c++) if (c < u + t) {
        let l = [], m = s;
        for (let d = n.length - 3; d >= 0; d--) l.unshift(m % n[d]), m = Math.floor(m / n[d]);
        l.push(u, c), e.set(l, 0);
      }
      return e;
    }
    function pu(r, t, e = false) {
      if (r.ndim !== 1) throw new Error("Input must be 1-D");
      let n = r.size, o = t ?? n;
      if (o < 0) throw new Error("N must be non-negative");
      let a = wr([n, o], r.dtype);
      for (let i = 0; i < n; i++) {
        let s = r.get([i]);
        for (let u = 0; u < o; u++) {
          let c = e ? u : o - 1 - u;
          a.set([i, u], Math.pow(s, c));
        }
      }
      return a;
    }
    function yu(r, t = Q, e = -1, n = 0) {
      let o, a = n;
      r instanceof ArrayBuffer ? o = r : (o = r.buffer, a += r.byteOffset);
      let i = Od(t), s = o.byteLength - a, u = Math.floor(s / i), c = e < 0 ? u : Math.min(e, u);
      if (c <= 0) return G([], t);
      let l = P(t);
      if (!l) throw new Error(`Unsupported dtype: ${t}`);
      let m = new l(o, a, c), d = N.fromData(m, [c], t);
      return new _(d);
    }
    function du(r, t = Q, e = -1) {
      let n = [], o = 0;
      for (let a of r) {
        if (e >= 0 && o >= e) break;
        n.push(a), o++;
      }
      return G(n, t);
    }
    function gu(r, t = Q, e = -1) {
      let n = [], o = 0;
      for (let a of r) {
        if (e >= 0 && o >= e) break;
        n.push(a), o++;
      }
      return G(n, t);
    }
    function Au(r, t = Q, e = -1, n = "") {
      let o;
      n === "" ? o = r.trim().split(/\s+/) : o = r.split(n);
      let a = [], i = 0;
      for (let s of o) {
        if (e >= 0 && i >= e) break;
        let u = s.trim();
        u !== "" && (B(t) ? a.push(BigInt(u)) : a.push(parseFloat(u)), i++);
      }
      return G(a, t);
    }
    function Od(r) {
      switch (r) {
        case "int8":
        case "uint8":
        case "bool":
          return 1;
        case "int16":
        case "uint16":
          return 2;
        case "int32":
        case "uint32":
        case "float32":
          return 4;
        case "int64":
        case "uint64":
        case "float64":
          return 8;
        default:
          return 8;
      }
    }
    function bu(r) {
      return r.sqrt();
    }
    function dn(r, t) {
      return r.power(t);
    }
    function hu(r) {
      return r.exp();
    }
    function Su(r) {
      return r.exp2();
    }
    function Du(r) {
      return r.expm1();
    }
    function Nu(r) {
      return r.log();
    }
    function xu(r) {
      return r.log2();
    }
    function wu(r) {
      return r.log10();
    }
    function Iu(r) {
      return r.log1p();
    }
    function zu(r, t) {
      return r.logaddexp(t);
    }
    function _u(r, t) {
      return r.logaddexp2(t);
    }
    function gn(r) {
      return r.absolute();
    }
    function Mu(r) {
      return r.negative();
    }
    function Fu(r) {
      return r.sign();
    }
    function vu(r, t) {
      return r.mod(t);
    }
    function An(r, t) {
      return r.divide(t);
    }
    function Bu(r, t) {
      return r.floor_divide(t);
    }
    function Eu(r) {
      return r.positive();
    }
    function Tu(r) {
      return r.reciprocal();
    }
    function Ou(r, t) {
      return r.dot(t);
    }
    function Cu(r) {
      return r.trace();
    }
    function Uu(r, t = 0, e = 0, n = 1) {
      let o = _e(r.storage, t, e, n);
      return _._fromStorage(o);
    }
    function $u(r, t) {
      let e = pa(r.storage, t.storage);
      return _._fromStorage(e);
    }
    function Ru(r, t) {
      return r.transpose(t);
    }
    function ku(r, t) {
      return r.inner(t);
    }
    function qu(r, t) {
      return r.outer(t);
    }
    function Vu(r, t, e = 2) {
      return r.tensordot(t, e);
    }
    function ju(r) {
      return r.sin();
    }
    function Pu(r) {
      return r.cos();
    }
    function Lu(r) {
      return r.tan();
    }
    function bn(r) {
      return r.arcsin();
    }
    function hn(r) {
      return r.arccos();
    }
    function Sn(r) {
      return r.arctan();
    }
    function Dn(r, t) {
      return r.arctan2(t);
    }
    function Gu(r, t) {
      return r.hypot(t);
    }
    function Wu(r) {
      return r.degrees();
    }
    function Zu(r) {
      return r.radians();
    }
    function Yu(r) {
      return r.radians();
    }
    function Hu(r) {
      return r.degrees();
    }
    function Xu(r) {
      return r.sinh();
    }
    function Ju(r) {
      return r.cosh();
    }
    function Qu(r) {
      return r.tanh();
    }
    function Nn(r) {
      return r.arcsinh();
    }
    function xn(r) {
      return r.arccosh();
    }
    function wn(r) {
      return r.arctanh();
    }
    function Ku(r, t, e) {
      return r.swapaxes(t, e);
    }
    function rc(r, t, e) {
      return r.moveaxis(t, e);
    }
    function Tr(r, t = 0) {
      if (r.length === 0) throw new Error("need at least one array to concatenate");
      let e = r.map((o) => o.storage), n = vr(e, t);
      return _._fromStorage(n);
    }
    function tc(r, t = 0) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let e = r.map((o) => o.storage), n = jo(e, t);
      return _._fromStorage(n);
    }
    function In(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let t = r.map((n) => n.storage), e = Po(t);
      return _._fromStorage(e);
    }
    function ec(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let t = r.map((n) => n.storage), e = xe(t);
      return _._fromStorage(e);
    }
    function nc(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let t = r.map((n) => n.storage), e = Lo(t);
      return _._fromStorage(e);
    }
    function oc(r, t = 0) {
      return Tr(r, t);
    }
    function ac(r, t = 0) {
      return ia(r.storage, t).map((n) => _._fromStorage(n));
    }
    function sc(r) {
      let t = r.map((n) => n.storage), e = ua(t);
      return _._fromStorage(e);
    }
    function ic(r, t, e = 0) {
      return Go(r.storage, t, e).map((o) => _._fromStorage(o, r.base ?? r));
    }
    function uc(r, t, e = 0) {
      return ut(r.storage, t, e).map((o) => _._fromStorage(o, r.base ?? r));
    }
    function cc(r, t) {
      return Zo(r.storage, t).map((n) => _._fromStorage(n, r.base ?? r));
    }
    function lc(r, t) {
      return Yo(r.storage, t).map((n) => _._fromStorage(n, r.base ?? r));
    }
    function fc(r, t) {
      let e = Ho(r.storage, t);
      return _._fromStorage(e);
    }
    function mc(r, t, e) {
      return r.repeat(t, e);
    }
    function pc(r) {
      return r.ravel();
    }
    function yc(r) {
      return r.flatten();
    }
    function dc(r, t) {
      r.fill(t);
    }
    function gc(r, ...t) {
      return r.item(...t);
    }
    function Ac(r) {
      return r.tolist();
    }
    function bc(r) {
      return r.tobytes();
    }
    function hc(r, t = false) {
      return r.byteswap(t);
    }
    function Sc(r, t) {
      return r.view(t);
    }
    function Dc(r, t, e = "", n = "") {
      r.tofile(t, e, n);
    }
    function Nc(r, t) {
      return r.reshape(...t);
    }
    function xc(r, t) {
      return r.squeeze(t);
    }
    function wc(r, t) {
      return r.expand_dims(t);
    }
    function $t(r, t) {
      let e = Jo(r.storage, t);
      return _._fromStorage(e);
    }
    function Ic(r) {
      if (r.ndim < 2) throw new Error("Input must be at least 2-D");
      return $t(r, 1);
    }
    function zc(r) {
      if (r.ndim < 2) throw new Error("Input must be at least 2-D");
      return $t(r, 0);
    }
    function _c(r, t = 1, e = [0, 1]) {
      let n = Qo(r.storage, t, e);
      return _._fromStorage(n);
    }
    function Mc(r, t, e) {
      let n = Ko(r.storage, t, e);
      return _._fromStorage(n);
    }
    function Fc(r, t, e = 0) {
      let n = ra(r.storage, t, e);
      return _._fromStorage(n, r.base ?? r);
    }
    function vc(...r) {
      let t = r.map((o) => o.storage), n = oa(t).map((o, a) => o === t[a] ? r[a] : _._fromStorage(o));
      return n.length === 1 ? n[0] : n;
    }
    function Bc(...r) {
      let t = r.map((o) => o.storage), n = aa(t).map((o, a) => o === t[a] ? r[a] : _._fromStorage(o));
      return n.length === 1 ? n[0] : n;
    }
    function Ec(...r) {
      let t = r.map((o) => o.storage), n = sa(t).map((o, a) => o === t[a] ? r[a] : _._fromStorage(o));
      return n.length === 1 ? n[0] : n;
    }
    function Tc(r, t) {
      return ta(r.storage, t).map((n) => _._fromStorage(n, r.base ?? r));
    }
    function Oc(r) {
      if (r.length === 0) throw new Error("need at least one array to stack");
      let t = r.map((n) => n.storage), e = ea(t);
      return _._fromStorage(e);
    }
    function Cc(r) {
      return In(r);
    }
    function Uc(r, t) {
      let e = na(r.storage, t);
      return _._fromStorage(e);
    }
    function $c(r, t, e) {
      let n = t instanceof _ ? t : G(t, r.dtype);
      if (e === void 0) {
        let o = r.flatten(), a = n.flatten();
        return Tr([o, a]);
      }
      return Tr([r, n], e);
    }
    function Rc(r, t, e) {
      let n = r.dtype;
      if (e === void 0) {
        let y = r.flatten(), p = (Array.isArray(t) ? t : [t]).map((S) => S < 0 ? y.size + S : S), g = [];
        for (let S = 0; S < y.size; S++) p.includes(S) || g.push(S);
        let h = P(n), b = new h(g.length);
        for (let S = 0; S < g.length; S++) {
          let D = y.get([g[S]]);
          B(n) ? b[S] = typeof D == "bigint" ? D : BigInt(D) : b[S] = D;
        }
        let A = N.fromData(b, [g.length], n);
        return new _(A);
      }
      let o = r.shape, a = o.length, i = e < 0 ? a + e : e;
      if (i < 0 || i >= a) throw new Error(`axis ${e} is out of bounds for array of dimension ${a}`);
      let s = o[i], u = Array.isArray(t) ? t : [t], c = new Set(u.map((y) => y < 0 ? s + y : y)), l = [], m = 0;
      for (let y = 0; y <= s; y++) (c.has(y) || y === s) && (y > m && l.push([m, y]), m = y + 1);
      if (l.length === 0) {
        let y = [...o];
        return y[i] = 0, wr(y, n);
      }
      let d = [];
      for (let [y, f] of l) {
        let p = o.map(() => ":");
        p[i] = `${y}:${f}`, d.push(r.slice(...p));
      }
      return Tr(d, i);
    }
    function kc(r, t, e, n) {
      let o = e instanceof _ ? e : G(e, r.dtype);
      if (n === void 0) {
        let m = r.flatten(), d = o.flatten(), y = t < 0 ? m.size + t : t;
        if (y < 0 || y > m.size) throw new Error(`index ${t} is out of bounds for array of size ${m.size}`);
        let f = y > 0 ? m.slice(`0:${y}`) : null, p = y < m.size ? m.slice(`${y}:`) : null, g = [];
        return f && g.push(f), g.push(d), p && g.push(p), Tr(g);
      }
      let a = r.shape, i = a.length, s = n < 0 ? i + n : n;
      if (s < 0 || s >= i) throw new Error(`axis ${n} is out of bounds for array of dimension ${i}`);
      let u = a[s], c = t < 0 ? u + t : t;
      if (c < 0 || c > u) throw new Error(`index ${t} is out of bounds for axis ${n} with size ${u}`);
      let l = [];
      if (c > 0) {
        let m = a.map(() => ":");
        m[s] = `0:${c}`, l.push(r.slice(...m));
      }
      if (l.push(o), c < u) {
        let m = a.map(() => ":");
        m[s] = `${c}:`, l.push(r.slice(...m));
      }
      return Tr(l, s);
    }
    function qc(r, t, e = "constant", n = 0) {
      let o = r.shape, a = o.length, i = r.dtype, s;
      if (typeof t == "number" ? s = o.map(() => [t, t]) : Array.isArray(t) && typeof t[0] == "number" ? s = o.map(() => t) : s = t, s.length !== a) throw new Error(`pad_width must have ${a} elements`);
      let u = o.map((p, g) => p + s[g][0] + s[g][1]), c = u.reduce((p, g) => p * g, 1), l = P(i), m = new l(c), d = B(i);
      e === "constant" && (d ? m.fill(BigInt(n)) : m.fill(n));
      let y = new Array(a).fill(0);
      for (let p = 0; p < c; p++) {
        let g = true, h = [];
        for (let A = 0; A < a; A++) {
          let [S] = s[A], D = y[A] - S;
          if (D < 0 || D >= o[A]) {
            g = false;
            break;
          }
          h.push(D);
        }
        let b;
        if (g) b = r.get(h);
        else if (e === "constant") {
          for (let A = a - 1; A >= 0 && (y[A]++, !(y[A] < u[A])); A--) y[A] = 0;
          continue;
        } else {
          let A = [];
          for (let S = 0; S < a; S++) {
            let [D] = s[S], w = y[S] - D, x = o[S];
            w < 0 ? e === "edge" ? w = 0 : e === "reflect" ? (w = -w, w >= x && (w = x - 1)) : e === "symmetric" ? (w = -w - 1, w >= x && (w = x - 1), w < 0 && (w = 0)) : e === "wrap" && (w = (w % x + x) % x) : w >= x && (e === "edge" ? w = x - 1 : e === "reflect" ? (w = 2 * x - w - 2, w < 0 && (w = 0)) : e === "symmetric" ? (w = 2 * x - w - 1, w < 0 && (w = 0)) : e === "wrap" && (w = w % x)), A.push(Math.max(0, Math.min(x - 1, w)));
          }
          b = r.get(A);
        }
        d ? m[p] = typeof b == "bigint" ? b : BigInt(Number(b)) : m[p] = Number(b);
        for (let A = a - 1; A >= 0 && (y[A]++, !(y[A] < u[A])); A--) y[A] = 0;
      }
      let f = N.fromData(m, u, i);
      return new _(f);
    }
    function Vc(r, t) {
      let e = Bt(r.storage, t);
      return _._fromStorage(e, r.base ?? r);
    }
    function jc(...r) {
      let t = r.map((n) => n.storage);
      return is(t).map((n, o) => _._fromStorage(n, r[o].base ?? r[o]));
    }
    function Pc(...r) {
      return ee(...r);
    }
    function Lc(r, t, e) {
      return r.take(t, e);
    }
    function Gc(r, t, e) {
      r.put(t, e);
    }
    function Wc(r, t, e = 0) {
      return r.iindex(t, e);
    }
    function Zc(r, t, e) {
      return r.bindex(t, e);
    }
    function Yc(r, t, e) {
      if (e !== void 0) throw new Error("copyto with where parameter is not yet implemented");
      let n = r.storage, o = r.shape, a = r.size, i = r.dtype;
      if (typeof t == "number" || typeof t == "bigint") {
        r.fill(t);
        return;
      }
      let s = t.storage, u = t.shape, c = Ar([u, o]);
      if (!c) throw new Error(`could not broadcast input array from shape (${u.join(",")}) into shape (${o.join(",")})`);
      if (c.length !== o.length || !c.every((m, d) => m === o[d])) throw new Error(`could not broadcast input array from shape (${u.join(",")}) into shape (${o.join(",")})`);
      let l = Bt(s, o);
      if (B(i)) for (let m = 0; m < a; m++) {
        let d = l.iget(m), y = typeof d == "bigint" ? d : BigInt(Math.round(Number(d)));
        n.iset(m, y);
      }
      else if (i === "bool") for (let m = 0; m < a; m++) {
        let d = l.iget(m);
        n.iset(m, d ? 1 : 0);
      }
      else for (let m = 0; m < a; m++) {
        let d = l.iget(m);
        n.iset(m, Number(d));
      }
    }
    function Hc(r, t) {
      let e = t.map((o) => o.storage), n = ls(r.storage, e);
      return _._fromStorage(n);
    }
    function Xc(r, t, e = false) {
      return fs(r.storage, t.storage, e);
    }
    function Jc(r, t) {
      return ko(r.storage, t.storage);
    }
    function zn(r, t) {
      return _._fromStorage(me(r.storage, t));
    }
    function _n(r, t) {
      return _._fromStorage(pe(r.storage, t));
    }
    function Mn(r, t, e = false) {
      return r.max(t, e);
    }
    function Fn(r, t, e = false) {
      return r.min(t, e);
    }
    function Qc(r, t, e = false) {
      let n = ye(r.storage, t, e);
      return typeof n == "number" || n instanceof E ? n : _._fromStorage(n);
    }
    function Kc(r, t, e = false) {
      let n = de(r.storage, t, e);
      return typeof n == "number" ? n : _._fromStorage(n);
    }
    function rl(r, t, e, n = false) {
      let o = ge(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }
    function tl(r, t, e, n = false) {
      let o = Lr(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }
    function el(r, t, e, n = false) {
      let o = e ? e.storage : void 0, a = rt(r.storage, t, o, n);
      return typeof a == "number" || a instanceof E ? a : _._fromStorage(a);
    }
    function nl(r, t, e = false) {
      let n = It(r.storage, t, e);
      return typeof n == "number" || n instanceof E ? n : _._fromStorage(n);
    }
    function ol(r, t, e = false) {
      let n = zt(r.storage, t, e);
      return typeof n == "number" || n instanceof E ? n : _._fromStorage(n);
    }
    function al(r, t, e = false) {
      let n = _t(r.storage, t, e);
      return typeof n == "number" || n instanceof E ? n : _._fromStorage(n);
    }
    function sl(r, t, e = 0, n = false) {
      let o = Pr(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }
    function il(r, t, e = 0, n = false) {
      let o = Ae(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }
    function ul(r, t, e = false) {
      let n = tt(r.storage, t, e);
      return typeof n == "number" || n instanceof E ? n : _._fromStorage(n);
    }
    function cl(r, t, e = false) {
      let n = et(r.storage, t, e);
      return typeof n == "number" || n instanceof E ? n : _._fromStorage(n);
    }
    function ll(r, t) {
      let e = nt(r.storage, t);
      return typeof e == "number" ? e : _._fromStorage(e);
    }
    function fl(r, t) {
      let e = ot(r.storage, t);
      return typeof e == "number" ? e : _._fromStorage(e);
    }
    function ml(r, t) {
      return _._fromStorage(be(r.storage, t));
    }
    function pl(r, t) {
      return _._fromStorage(he(r.storage, t));
    }
    function yl(r, t, e = false) {
      let n = Mt(r.storage, t, e);
      return typeof n == "number" ? n : _._fromStorage(n);
    }
    function dl(r, t, e, n = false) {
      let o = at(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }
    function gl(r, t, e, n = false) {
      let o = Se(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }
    function Al(r) {
      return r.cbrt();
    }
    function bl(r) {
      return r.fabs();
    }
    function hl(r, t) {
      return r.divmod(t);
    }
    function Sl(r) {
      return r.square();
    }
    function Dl(r, t) {
      return r.remainder(t);
    }
    function Nl(r, t) {
      return r.heaviside(t);
    }
    function xl(r, t) {
      let e = typeof t == "number" ? t : t.storage;
      return _._fromStorage(po(r.storage, e));
    }
    function wl(r, t) {
      let e = typeof t == "number" ? t : t.storage;
      return _._fromStorage(yo(r.storage, e));
    }
    function Il(r) {
      let [t, e] = go(r.storage);
      return [_._fromStorage(t), _._fromStorage(e)];
    }
    function zl(r, t) {
      let e = typeof t == "number" ? t : t.storage;
      return _._fromStorage(Ao(r.storage, e));
    }
    function _l(r, t) {
      let e = typeof t == "number" ? t : t.storage;
      return _._fromStorage(bo(r.storage, e));
    }
    function Ml(r, t) {
      let e = typeof t == "number" ? t : t.storage;
      return _._fromStorage(ho(r.storage, e));
    }
    function Fl(r) {
      let [t, e] = So(r.storage);
      return [_._fromStorage(t), _._fromStorage(e)];
    }
    function vl(r, t, e) {
      let n = t instanceof _ ? t.storage : t, o = e instanceof _ ? e.storage : e;
      return _._fromStorage(Do(r.storage, n, o));
    }
    function Bl(r, t) {
      let e = t instanceof _ ? t.storage : t;
      return _._fromStorage(No(r.storage, e));
    }
    function El(r, t) {
      let e = t instanceof _ ? t.storage : t;
      return _._fromStorage(xo(r.storage, e));
    }
    function Tl(r, t) {
      let e = t instanceof _ ? t.storage : t;
      return _._fromStorage(wo(r.storage, e));
    }
    function Ol(r, t) {
      let e = t instanceof _ ? t.storage : t;
      return _._fromStorage(Io(r.storage, e));
    }
    function Cl(r, t = 0, e, n) {
      return _._fromStorage(zo(r.storage, t, e, n));
    }
    function Ul(r, t, e, n, o) {
      return _._fromStorage(_o(r.storage, t.storage, e.storage, n, o));
    }
    function $l(r, t = Math.PI, e = -1, n = 2 * Math.PI) {
      return _._fromStorage(Mo(r.storage, t, e, n));
    }
    function Rl(r) {
      return _._fromStorage(Fo(r.storage));
    }
    function kl(r) {
      return _._fromStorage(vo(r.storage));
    }
    function ql(r, t) {
      return r.bitwise_and(t);
    }
    function Vl(r, t) {
      return r.bitwise_or(t);
    }
    function jl(r, t) {
      return r.bitwise_xor(t);
    }
    function Pl(r) {
      return r.bitwise_not();
    }
    function Ll(r) {
      return r.invert();
    }
    function Gl(r, t) {
      return r.left_shift(t);
    }
    function Wl(r, t) {
      return r.right_shift(t);
    }
    function Zl(r, t = -1, e = "big") {
      let n = Cs(r.storage, t, e);
      return _._fromStorage(n);
    }
    function Yl(r, t = -1, e = -1, n = "big") {
      let o = Us(r.storage, t, e, n);
      return _._fromStorage(o);
    }
    function Hl(r) {
      return _._fromStorage($s(r.storage));
    }
    function Xl(r) {
      return _._fromStorage(Rs(r.storage));
    }
    function Jl(r, t) {
      let e = typeof t == "number" ? t : t.storage;
      return _._fromStorage(ks(r.storage, e));
    }
    function Ql(r, t) {
      let e = typeof t == "number" ? t : t.storage;
      return _._fromStorage(qs(r.storage, e));
    }
    function Kl(r, t) {
      return r.logical_and(t);
    }
    function rf(r, t) {
      return r.logical_or(t);
    }
    function tf(r) {
      return r.logical_not();
    }
    function ef(r, t) {
      return r.logical_xor(t);
    }
    function nf(r) {
      return r.isfinite();
    }
    function of(r) {
      return r.isinf();
    }
    function af(r) {
      return r.isnan();
    }
    function sf(r) {
      return r.isnat();
    }
    function uf(r, t) {
      return r.copysign(t);
    }
    function cf(r) {
      return r.signbit();
    }
    function lf(r, t) {
      return r.nextafter(t);
    }
    function ff(r) {
      return r.spacing();
    }
    function mf(r) {
      return _._fromStorage(ri(r.storage));
    }
    function pf(r) {
      return ti(r.storage);
    }
    function yf(r) {
      return _._fromStorage(ei(r.storage));
    }
    function df(r) {
      return ni(r.storage);
    }
    function gf(r) {
      return _._fromStorage(mi(r.storage));
    }
    function Af(r) {
      return _._fromStorage(pi(r.storage));
    }
    function vn(r) {
      return _._fromStorage(yi(r.storage));
    }
    var bf = vn;
    function hf(r, t = false) {
      return _._fromStorage(di(r.storage, t));
    }
    function Sf(r) {
      return _._fromStorage(oi(r.storage));
    }
    function Df(r) {
      return _._fromStorage(ai(r.storage));
    }
    function Nf(r) {
      return si(r.storage);
    }
    function xf(r, t = 100) {
      return _._fromStorage(ii(r.storage, t));
    }
    function wf(r) {
      return ui(r);
    }
    function If(r) {
      return ci(r);
    }
    function zf(r, t) {
      return li(r, t);
    }
    function _f(r, t) {
      return fi(r, t);
    }
    function Mf(r, ...t) {
      let e = t.map((o) => o.storage), n = ma(r, ...e);
      return typeof n == "number" || typeof n == "bigint" || n instanceof E ? n : _._fromStorage(n);
    }
    function Ff(r, t) {
      return Ia(r.storage, t.storage);
    }
    function vf(r, t, e = -1) {
      let n = Oe(r.storage, t.storage, e);
      return typeof n == "number" || typeof n == "bigint" || n instanceof E ? n : _._fromStorage(n);
    }
    function Bf(r) {
      return _._fromStorage(Ce(r.storage));
    }
    function Ef(r, t) {
      return _._fromStorage(za(r.storage, t));
    }
    function Tf(r, t) {
      return _._fromStorage(_a(r.storage, t.storage));
    }
    function Of(r, t) {
      return _._fromStorage(Ma(r.storage, t.storage));
    }
    var Cf = { cross: (r, t, e = -1, n = -1, o = -1, a) => {
      let i = ya(r.storage, t.storage, e, n, o, a);
      return typeof i == "number" ? i : _._fromStorage(i);
    }, norm: (r, t = null, e = null, n = false) => {
      let o = da(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }, vector_norm: (r, t = 2, e, n = false) => {
      let o = Wr(r.storage, t, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }, matrix_norm: (r, t = "fro", e = false) => {
      let n = Ur(r.storage, t, e);
      return typeof n == "number" ? n : _._fromStorage(n);
    }, qr: (r, t = "reduced") => {
      let e = Me(r.storage, t);
      return e instanceof N ? _._fromStorage(e) : "q" in e && "r" in e ? { q: _._fromStorage(e.q), r: _._fromStorage(e.r) } : { h: _._fromStorage(e.h), tau: _._fromStorage(e.tau) };
    }, cholesky: (r, t = false) => _._fromStorage(ga(r.storage, t)), svd: (r, t = true, e = true) => {
      let n = ve(r.storage, t, e);
      return "u" in n ? { u: _._fromStorage(n.u), s: _._fromStorage(n.s), vt: _._fromStorage(n.vt) } : _._fromStorage(n);
    }, det: (r) => Aa(r.storage), inv: (r) => _._fromStorage(lt(r.storage)), solve: (r, t) => _._fromStorage(Be(r.storage, t.storage)), lstsq: (r, t, e = null) => {
      let n = ba(r.storage, t.storage, e);
      return { x: _._fromStorage(n.x), residuals: _._fromStorage(n.residuals), rank: n.rank, s: _._fromStorage(n.s) };
    }, cond: (r, t = 2) => ha(r.storage, t), matrix_rank: (r, t) => Sa(r.storage, t), matrix_power: (r, t) => _._fromStorage(Da(r.storage, t)), pinv: (r, t = 1e-15) => _._fromStorage(Na(r.storage, t)), eig: (r) => {
      let t = Ee(r.storage);
      return { w: _._fromStorage(t.w), v: _._fromStorage(t.v) };
    }, eigh: (r, t = "L") => {
      let e = Te(r.storage, t);
      return { w: _._fromStorage(e.w), v: _._fromStorage(e.v) };
    }, eigvals: (r) => _._fromStorage(xa(r.storage)), eigvalsh: (r, t = "L") => _._fromStorage(wa(r.storage, t)), diagonal: (r, t = 0, e = 0, n = 1) => _._fromStorage(_e(r.storage, t, e, n)), matmul: (r, t) => _._fromStorage(cr(r.storage, t.storage)), matrix_transpose: (r) => _._fromStorage(Ce(r.storage)), multi_dot: (r) => {
      let t = r.map((e) => e.storage);
      return _._fromStorage(Ba(t));
    }, outer: (r, t) => _._fromStorage(Ft(r.storage, t.storage)), slogdet: (r) => Fa(r.storage), svdvals: (r) => _._fromStorage(va(r.storage)), tensordot: (r, t, e = 2) => {
      let n = ze(r.storage, t.storage, e);
      return typeof n == "number" || typeof n == "bigint" || n instanceof E ? n : _._fromStorage(n);
    }, tensorinv: (r, t = 2) => _._fromStorage(Ea(r.storage, t)), tensorsolve: (r, t, e) => _._fromStorage(Ta(r.storage, t.storage, e)), trace: (r) => Ie(r.storage), vecdot: (r, t, e = -1) => {
      let n = Oe(r.storage, t.storage, e);
      return typeof n == "number" || typeof n == "bigint" || n instanceof E ? n : _._fromStorage(n);
    } };
    function Uf(r, t, e) {
      return _._fromStorage(ms(r.storage, t.storage, e));
    }
    function $f(r, t, e, n) {
      ps(r.storage, t.storage, e.storage, n);
    }
    function Rf(r, t, e) {
      let n = e instanceof _ ? e.storage : e;
      ys(r.storage, t.storage, n);
    }
    function kf(r, t, e) {
      return _._fromStorage(Ue(r.storage, t.storage, e));
    }
    function qf(r, t, e = 0) {
      let n = r.map((a) => a.storage), o = t.map((a) => a.storage);
      return _._fromStorage(ds(n, o, e));
    }
    function Vf(r, t, e) {
      gs(r.storage, t.storage, e.storage);
    }
    function jf(r, t, e = false) {
      let n = typeof t == "number" ? t : t.storage;
      Is(r.storage, n, e);
    }
    function Pf(r, t = 2) {
      return $e(r, t).map((n) => _._fromStorage(n));
    }
    function Lf(r) {
      return As(r.storage).map((e) => _._fromStorage(e));
    }
    function Gf(r, t = 0, e) {
      return Re(r, t, e).map((o) => _._fromStorage(o));
    }
    function Wf(r, t = 0) {
      return bs(r.storage, t).map((n) => _._fromStorage(n));
    }
    function Zf(r, t = 0, e) {
      return ke(r, t, e).map((o) => _._fromStorage(o));
    }
    function Yf(r, t = 0) {
      return hs(r.storage, t).map((n) => _._fromStorage(n));
    }
    function Hf(r, t, e = 0) {
      return Ss(r, (a, i) => t(a, i).storage, e).map((a) => _._fromStorage(a));
    }
    function Xf(r, t = "int32") {
      return _._fromStorage(Ds(r, t));
    }
    function Jf(...r) {
      return Ns(...r.map((e) => e.storage)).map((e) => _._fromStorage(e));
    }
    function Qf(r, t, e = "raise") {
      let n = r.map((o) => o.storage);
      return _._fromStorage(xs(n, t, e));
    }
    function Kf(r, t, e = "C") {
      let n = r instanceof _ ? r.storage : r;
      return ws(n, t, e).map((a) => _._fromStorage(a));
    }
    function rm(r, t = -1) {
      return _._fromStorage(Le(r.storage, t));
    }
    function tm(r, t = -1) {
      return _._fromStorage(Ge(r.storage, t));
    }
    function em(r) {
      let t = r.map((e) => e.storage);
      return _._fromStorage(gi(t));
    }
    function nm(r, t, e = -1) {
      return _._fromStorage(We(r.storage, t, e));
    }
    function om(r, t, e = -1) {
      return _._fromStorage(Ze(r.storage, t, e));
    }
    function am(r) {
      return _._fromStorage(Ai(r.storage));
    }
    function sm(r) {
      return Ut(r.storage).map((e) => _._fromStorage(e));
    }
    function im(r) {
      return _._fromStorage(Ye(r.storage));
    }
    function um(r) {
      return _._fromStorage(bi(r.storage));
    }
    function cm(r, t, e) {
      let n = hi(r.storage, t?.storage, e?.storage);
      return Array.isArray(n) ? n.map((o) => _._fromStorage(o)) : _._fromStorage(n);
    }
    function lm(r, t, e = "left") {
      return _._fromStorage(He(r.storage, t.storage, e));
    }
    function fm(r, t) {
      return _._fromStorage(Si(r.storage, t.storage));
    }
    function mm(r, t) {
      let e = Xe(r.storage, t);
      return typeof e == "number" ? e : _._fromStorage(e);
    }
    function Rt(r, t = 0) {
      return _._fromStorage(Je(r.storage, t));
    }
    function pm(r) {
      return _._fromStorage(Qe(r.storage));
    }
    function ym(r) {
      return _._fromStorage(Ke(r.storage));
    }
    function dm(r) {
      return _._fromStorage(rn(r.storage));
    }
    function gm(r) {
      return _._fromStorage(tn(r.storage));
    }
    function Am(r) {
      return _._fromStorage(en(r.storage));
    }
    function bm(r, t = false, e = false, n = false) {
      let o = fr(r.storage, t, e, n);
      if (o instanceof N) return _._fromStorage(o);
      let a = { values: _._fromStorage(o.values) };
      return o.indices && (a.indices = _._fromStorage(o.indices)), o.inverse && (a.inverse = _._fromStorage(o.inverse)), o.counts && (a.counts = _._fromStorage(o.counts)), a;
    }
    function hm(r, t) {
      return _._fromStorage(Ni(r.storage, t.storage));
    }
    function Sm(r, t) {
      return _._fromStorage(xi(r.storage, t.storage));
    }
    function Dm(r, t) {
      return _._fromStorage(on(r.storage, t.storage));
    }
    function Nm(r, t) {
      return _._fromStorage(wi(r.storage, t.storage));
    }
    function xm(r, t) {
      return _._fromStorage(Ii(r.storage, t.storage));
    }
    function wm(r, t) {
      return _._fromStorage(zi(r.storage, t.storage));
    }
    function Im(r, t = "fb") {
      return _._fromStorage(_i(r.storage, t));
    }
    function zm(r) {
      let t = Mi(r.storage);
      return { values: _._fromStorage(t.values), indices: _._fromStorage(t.indices), inverse_indices: _._fromStorage(t.inverse_indices), counts: _._fromStorage(t.counts) };
    }
    function _m(r) {
      let t = Fi(r.storage);
      return { values: _._fromStorage(t.values), counts: _._fromStorage(t.counts) };
    }
    function Mm(r) {
      let t = vi(r.storage);
      return { values: _._fromStorage(t.values), inverse_indices: _._fromStorage(t.inverse_indices) };
    }
    function Fm(r) {
      return _._fromStorage(Bi(r.storage));
    }
    function vm(r, t = 1, e = -1) {
      return _._fromStorage(an(r.storage, t, e));
    }
    function Bm(r, t = null, e = null) {
      return _._fromStorage(Ei(r.storage, t, e));
    }
    function Em(r, t = 1, e = null) {
      let n = Ti(r.storage, t, e);
      return Array.isArray(n) ? n.map((o) => _._fromStorage(o)) : _._fromStorage(n);
    }
    function Tm(r, t, e = -1, n = -1, o = -1) {
      return _._fromStorage(Oi(r.storage, t.storage, e, n, o));
    }
    function Om(r, t, e = 0) {
      return _._fromStorage(Ci(r.storage, t?.storage, e));
    }
    function Cm(r, t, e = false) {
      return _._fromStorage(Ui(r.storage, t.storage, e));
    }
    function Um(r, t = 10, e, n = false, o) {
      let a = $i(r.storage, typeof t == "number" ? t : t.storage, e, n, o?.storage);
      return [_._fromStorage(a.hist), _._fromStorage(a.bin_edges)];
    }
    function $m(r, t, e = 10, n, o = false, a) {
      let i;
      typeof e == "number" ? i = e : Array.isArray(e) && e.length === 2 ? typeof e[0] == "number" ? i = e : i = [e[0].storage, e[1].storage] : i = 10;
      let s = Ri(r.storage, t.storage, i, n, o, a?.storage);
      return [_._fromStorage(s.hist), _._fromStorage(s.x_edges), _._fromStorage(s.y_edges)];
    }
    function Rm(r, t = 10, e, n = false, o) {
      let a = ki(r.storage, t, e, n, o?.storage);
      return [_._fromStorage(a.hist), a.edges.map((i) => _._fromStorage(i))];
    }
    function km(r, t, e = "full") {
      return _._fromStorage(un(r.storage, t.storage, e));
    }
    function qm(r, t, e = "full") {
      return _._fromStorage(qi(r.storage, t.storage, e));
    }
    function Vm(r, t, e = true, n = false, o) {
      return _._fromStorage(cn(r.storage, t?.storage, e, n, o));
    }
    function jm(r, t, e = true) {
      return _._fromStorage(Vi(r.storage, t?.storage, e));
    }
    function Pm(r, t = 10, e, n) {
      return _._fromStorage(ji(r.storage, t, e, n?.storage));
    }
    function Lm(r, t, e = 1, n = -1) {
      let o = Pi(r.storage, t?.storage, e, n);
      return typeof o == "number" ? o : _._fromStorage(o);
    }
    function Gm(r, t, e) {
      let n = (o) => {
        let a = r(_._fromStorage(o));
        return a instanceof _ ? a.storage : a;
      };
      return _._fromStorage(zs(e.storage, t, n));
    }
    function Wm(r, t, e) {
      let n = (o, a) => r(_._fromStorage(o), a).storage;
      return _._fromStorage(_s(t.storage, n, e));
    }
    function Zm(r, t) {
      return qe(r.storage, t.storage);
    }
    function Ym(r, t) {
      return Ms(r.storage, t.storage);
    }
    function Hm(r) {
      if (typeof r == "number") return 0;
      if (r instanceof _) return r.ndim;
      let t = 0, e = r;
      for (; Array.isArray(e); ) t++, e = e[0];
      return t;
    }
    function Bn(r) {
      if (typeof r == "number") return [];
      if (r instanceof _) return Array.from(r.shape);
      let t = [], e = r;
      for (; Array.isArray(e); ) t.push(e.length), e = e[0];
      return t;
    }
    function Xm(r) {
      return typeof r == "number" ? 1 : r instanceof _ ? r.size : Bn(r).reduce((e, n) => e * n, 1);
    }
    var Er = { bool: 0, uint8: 1, int8: 2, uint16: 3, int16: 4, uint32: 5, int32: 6, uint64: 7, int64: 8, float32: 9, float64: 10, complex64: 11, complex128: 12 };
    var sr = { bool: "b", uint8: "u", uint16: "u", uint32: "u", uint64: "u", int8: "i", int16: "i", int32: "i", int64: "i", float32: "f", float64: "f", complex64: "c", complex128: "c" };
    function Jm(r, t, e = "safe") {
      let n = r instanceof _ ? r.dtype : r;
      if (n === t) return true;
      switch (e) {
        case "no":
          return false;
        case "equiv":
          return n === t;
        case "safe":
          return n === "bool" ? true : v(n) ? v(t) ? Er[n] <= Er[t] : false : v(t) ? true : (sr[n] === "i" || sr[n] === "u") && sr[t] === "f" ? t === "float32" ? ["int8", "int16", "uint8", "uint16"].includes(n) : t === "float64" : sr[n] === "f" && sr[t] === "f" || (sr[n] === "i" || sr[n] === "u") && (sr[t] === "i" || sr[t] === "u") ? Er[n] <= Er[t] : false;
        case "same_kind": {
          let o = sr[n], a = sr[t];
          return n === "bool" && (a === "i" || a === "u" || a === "b") || o === a || (o === "i" || o === "u") && (a === "i" || a === "u") || o === "f" && a === "c";
        }
        case "unsafe":
          return true;
        default:
          return false;
      }
    }
    function Qm(...r) {
      if (r.length === 0) return "float64";
      let t = false, e = 32;
      for (let n of r) {
        let o = n.dtype;
        v(o) ? (t = true, o === "complex128" && (e = 64)) : (o === "float64" || o === "int64" || o === "uint64") && (e = 64);
      }
      return t ? e === 64 ? "complex128" : "complex64" : e === 64 ? "float64" : "float32";
    }
    function Km(...r) {
      if (r.length === 0) return "float64";
      let t = r.map((n) => n instanceof _ ? n.dtype : n), e = t[0];
      for (let n = 1; n < t.length; n++) e = rp(e, t[n]);
      return e;
    }
    function rp(r, t) {
      if (r === t) return r;
      if (r === "bool") return t;
      if (t === "bool") return r;
      if (v(r) || v(t)) {
        if (v(r) && v(t)) return r === "complex128" || t === "complex128" ? "complex128" : "complex64";
        let i = v(r) ? r : t, s = v(r) ? t : r;
        return i === "complex128" || s === "float64" || s === "int64" || s === "uint64" ? "complex128" : "complex64";
      }
      let e = sr[r] === "f", n = sr[t] === "f";
      if (e || n) {
        if (r === "float64" || t === "float64") return "float64";
        if (r === "float32" || t === "float32") {
          let i = e ? t : r;
          return ["int32", "int64", "uint32", "uint64"].includes(i) ? "float64" : "float32";
        }
      }
      let o = sr[r], a = sr[t];
      if (o === "i" && a === "u" || o === "u" && a === "i") {
        let i = o === "u" ? r : t;
        if (i === "uint64") return "float64";
        if (i === "uint32") return "int64";
        if (i === "uint16") return "int32";
        if (i === "uint8") return "int16";
      }
      return Er[r] >= Er[t] ? r : t;
    }
    function tp(r) {
      return typeof r == "boolean" ? "bool" : typeof r == "bigint" ? r >= 0n ? r <= 255n ? "uint8" : r <= 65535n ? "uint16" : r <= 4294967295n ? "uint32" : "uint64" : r >= -128n && r <= 127n ? "int8" : r >= -32768n && r <= 32767n ? "int16" : r >= -2147483648n && r <= 2147483647n ? "int32" : "int64" : !Number.isFinite(r) || !Number.isInteger(r) ? "float64" : r >= 0 ? r <= 255 ? "uint8" : r <= 65535 ? "uint16" : r <= 4294967295 ? "uint32" : "float64" : r >= -128 && r <= 127 ? "int8" : r >= -32768 && r <= 32767 ? "int16" : r >= -2147483648 && r <= 2147483647 ? "int32" : "float64";
    }
    function ep(r, t) {
      let e = r instanceof _ ? r.dtype : r;
      return t === "integer" ? ["int8", "int16", "int32", "int64", "uint8", "uint16", "uint32", "uint64"].includes(e) : t === "signedinteger" ? ["int8", "int16", "int32", "int64"].includes(e) : t === "unsignedinteger" ? ["uint8", "uint16", "uint32", "uint64"].includes(e) : t === "floating" ? ["float32", "float64"].includes(e) : t === "complexfloating" ? ["complex64", "complex128"].includes(e) : t === "number" || t === "numeric" ? !["bool"].includes(e) : t === "inexact" ? ["float32", "float64", "complex64", "complex128"].includes(e) : e === t;
    }
    function np2(r) {
      return { bool: "bool", uint8: "uint8", uint16: "uint16", uint32: "uint32", uint64: "uint64", int8: "int8", int16: "int16", int32: "int32", int64: "int64", float32: "float32", float64: "float64", complex64: "complex64", complex128: "complex128" }[r] || r;
    }
    function op(r, t = "GDFgdf", e = "d") {
      let n = { b: "int8", B: "uint8", h: "int16", H: "uint16", i: "int32", I: "uint32", l: "int64", L: "uint64", f: "float32", d: "float64", F: "complex64", D: "complex128", g: "float64", G: "complex128", "?": "bool" }, o = { int8: "b", uint8: "B", int16: "h", uint16: "H", int32: "i", uint32: "I", int64: "l", uint64: "L", float32: "f", float64: "d", complex64: "F", complex128: "D", bool: "?" }, a = [];
      for (let l of r) n[l] && a.push(n[l]);
      if (a.length === 0) return e;
      let i = a[0];
      for (let l = 1; l < a.length; l++) i = rp(i, a[l]);
      let s = new Set(t), u = o[i] || e;
      if (s.has(u) || s.size === 0) return u;
      let c = "gfdGFD";
      for (let l of c) if (s.has(l)) return l;
      return e;
    }
    function ap(r) {
      let t = r instanceof _ ? r.toArray().flat() : r;
      if (t.length === 0) return G([1]);
      let e = [1];
      for (let n of t) {
        let o = new Array(e.length + 1).fill(0);
        for (let a = 0; a < e.length; a++) o[a] += e[a], o[a + 1] -= e[a] * n;
        e = o;
      }
      return G(e);
    }
    function sp(r, t) {
      let e = r instanceof _ ? r.toArray().flat() : r, n = t instanceof _ ? t.toArray().flat() : t, o = Math.max(e.length, n.length), a = new Array(o).fill(0);
      for (let i = 0; i < e.length; i++) a[o - e.length + i] += e[i];
      for (let i = 0; i < n.length; i++) a[o - n.length + i] += n[i];
      return G(a);
    }
    function ip(r, t = 1) {
      let e = r instanceof _ ? r.toArray().flat() : [...r];
      for (let n = 0; n < t; n++) {
        if (e.length <= 1) return G([0]);
        let o = new Array(e.length - 1), a = e.length - 1;
        for (let i = 0; i < a; i++) o[i] = e[i] * (a - i);
        e = o;
      }
      return G(e);
    }
    function up(r, t) {
      let e = r instanceof _ ? r.toArray().flat() : [...r], n = t instanceof _ ? t.toArray().flat() : [...t];
      if (n.length === 0 || n.length === 1 && n[0] === 0) throw new Error("Division by zero polynomial");
      for (; e.length > 1 && e[0] === 0; ) e.shift();
      for (; n.length > 1 && n[0] === 0; ) n.shift();
      if (e.length < n.length) return [G([0]), G(e)];
      let o = [], a = [...e];
      for (; a.length >= n.length; ) {
        let i = a[0] / n[0];
        o.push(i);
        for (let s = 0; s < n.length; s++) a[s] = a[s] - i * n[s];
        a.shift();
      }
      return a.length === 0 || a.every((i) => Math.abs(i) < 1e-14) ? [G(o.length > 0 ? o : [0]), G([0])] : [G(o.length > 0 ? o : [0]), G(a)];
    }
    function cp(r, t, e) {
      let n = r.toArray().flat(), o = t.toArray().flat(), a = n.length;
      if (a !== o.length) throw new Error("x and y must have the same length");
      if (e < 0) throw new Error("Degree must be non-negative");
      if (a <= e) throw new Error("Need more data points than degree");
      let i = [];
      for (let m = 0; m < a; m++) {
        let d = [];
        for (let y = e; y >= 0; y--) d.push(Math.pow(n[m], y));
        i.push(d);
      }
      let s = Cd(i), u = lp(s, i), c = Ud(s, o), l = $d(u, c);
      return G(l);
    }
    function Cd(r) {
      let t = r.length, e = r[0].length, n = [];
      for (let o = 0; o < e; o++) {
        let a = [];
        for (let i = 0; i < t; i++) a.push(r[i][o]);
        n.push(a);
      }
      return n;
    }
    function lp(r, t) {
      let e = r.length, n = r[0].length, o = t[0].length, a = [];
      for (let i = 0; i < e; i++) {
        let s = [];
        for (let u = 0; u < o; u++) {
          let c = 0;
          for (let l = 0; l < n; l++) c += r[i][l] * t[l][u];
          s.push(c);
        }
        a.push(s);
      }
      return a;
    }
    function Ud(r, t) {
      let e = [];
      for (let n = 0; n < r.length; n++) {
        let o = 0;
        for (let a = 0; a < r[n].length; a++) o += r[n][a] * t[a];
        e.push(o);
      }
      return e;
    }
    function $d(r, t) {
      let e = r.length, n = r.map((a, i) => [...a, t[i]]);
      for (let a = 0; a < e; a++) {
        let i = a;
        for (let s = a + 1; s < e; s++) Math.abs(n[s][a]) > Math.abs(n[i][a]) && (i = s);
        [n[a], n[i]] = [n[i], n[a]];
        for (let s = a + 1; s < e; s++) {
          let u = n[s][a] / n[a][a];
          for (let c = a; c <= e; c++) n[s][c] = n[s][c] - u * n[a][c];
        }
      }
      let o = new Array(e).fill(0);
      for (let a = e - 1; a >= 0; a--) {
        o[a] = n[a][e];
        for (let i = a + 1; i < e; i++) o[a] -= n[a][i] * o[i];
        o[a] /= n[a][a];
      }
      return o;
    }
    function fp(r, t = 1, e = 0) {
      let n = r instanceof _ ? r.toArray().flat() : [...r], o = Array.isArray(e) ? e : [e];
      for (let a = 0; a < t; a++) {
        let i = n.length, s = new Array(i + 1);
        for (let u = 0; u < i; u++) s[u] = n[u] / (i - u);
        s[i] = o[a] !== void 0 ? o[a] : 0, n = s;
      }
      return G(n);
    }
    function mp(r, t) {
      let e = r instanceof _ ? r.toArray().flat() : r, n = t instanceof _ ? t.toArray().flat() : t, o = e.length + n.length - 1, a = new Array(o).fill(0);
      for (let i = 0; i < e.length; i++) for (let s = 0; s < n.length; s++) a[i + s] += e[i] * n[s];
      return G(a);
    }
    function pp(r, t) {
      let e = r instanceof _ ? r.toArray().flat() : r, n = t instanceof _ ? t.toArray().flat() : t, o = Math.max(e.length, n.length), a = new Array(o).fill(0);
      for (let i = 0; i < e.length; i++) a[o - e.length + i] += e[i];
      for (let i = 0; i < n.length; i++) a[o - n.length + i] -= n[i];
      return G(a);
    }
    function yp(r, t) {
      let e = r instanceof _ ? r.toArray().flat() : r, n = (i) => {
        let s = 0;
        for (let u of e) s = s * i + u;
        return s;
      };
      if (typeof t == "number") return n(t);
      let a = (t instanceof _ ? t.toArray().flat() : t).map(n);
      return G(a);
    }
    function dp(r) {
      let t = r instanceof _ ? r.toArray().flat() : [...r];
      for (; t.length > 1 && t[0] === 0; ) t.shift();
      let e = t.length - 1;
      if (e <= 0) return G([]);
      let n = t[0], o = t.map((u) => u / n);
      if (e === 1) return G([-o[1]]);
      if (e === 2) {
        let c = o[1], l = o[2], m = c * c - 4 * l;
        if (m >= 0) {
          let d = Math.sqrt(m);
          return G([(-c + d) / 2, (-c - d) / 2]);
        } else {
          let d = -c / 2;
          return G([d, d]);
        }
      }
      let a = e, i = [];
      for (let u = 0; u < a; u++) {
        let c = new Array(a).fill(0);
        u < a - 1 && (c[u + 1] = 1), i.push(c);
      }
      for (let u = 0; u < a; u++) i[a - 1][u] = -o[a - u];
      let s = Rd(i);
      return G(s);
    }
    function Rd(r) {
      let t = r.length, e = [...r.map((i) => [...i])], n = 100, o = 1e-10;
      for (let i = 0; i < n; i++) {
        let { Q: s, R: u } = kd(e);
        e = lp(u, s);
        let c = 0;
        for (let l = 1; l < t; l++) c = Math.max(c, Math.abs(e[l][l - 1]));
        if (c < o) break;
      }
      let a = [];
      for (let i = 0; i < t; i++) a.push(e[i][i]);
      return a;
    }
    function kd(r) {
      let t = r.length, e = r.map((o) => [...o]), n = Array.from({ length: t }, () => new Array(t).fill(0));
      for (let o = 0; o < t; o++) {
        for (let i = 0; i < o; i++) {
          let s = 0;
          for (let u = 0; u < t; u++) s += e[u][i] * r[u][o];
          n[i][o] = s;
          for (let u = 0; u < t; u++) e[u][o] = e[u][o] - s * e[u][i];
        }
        let a = 0;
        for (let i = 0; i < t; i++) a += e[i][o] * e[i][o];
        if (a = Math.sqrt(a), n[o][o] = a, a > 1e-14) for (let i = 0; i < t; i++) e[i][o] = e[i][o] / a;
      }
      return { Q: e, R: n };
    }
    var gt = new Uint8Array([147, 78, 85, 77, 80, 89]);
    var kt = ["float64", "float32", "complex128", "complex64", "int64", "int32", "int16", "int8", "uint64", "uint32", "uint16", "uint8", "bool"];
    function En() {
      let r = new ArrayBuffer(2);
      return new DataView(r).setInt16(0, 256, true), new Int16Array(r)[0] === 256;
    }
    var qd = { f8: "float64", f4: "float32", c16: "complex128", c8: "complex64", i8: "int64", i4: "int32", i2: "int16", i1: "int8", u8: "uint64", u4: "uint32", u2: "uint16", u1: "uint8", b1: "bool" };
    var At = { float64: "<f8", float32: "<f4", complex128: "<c16", complex64: "<c8", int64: "<i8", int32: "<i4", int16: "<i2", int8: "|i1", uint64: "<u8", uint32: "<u4", uint16: "<u2", uint8: "|u1", bool: "|b1" };
    var gp = { S: "byte strings", U: "Unicode strings", O: "Python objects", V: "structured arrays (void)", M: "datetime64", m: "timedelta64" };
    function Ap(r) {
      if (r.startsWith("[") || r.startsWith("(")) throw new Ir(`Structured/compound dtypes are not supported: ${r}`);
      let t = "", e = r;
      (r[0] === "<" || r[0] === ">" || r[0] === "=" || r[0] === "|") && (t = r[0], e = r.slice(1));
      let n = e[0];
      if (n && n in gp) throw new Ir(`Unsupported dtype: ${gp[n]} (${r}). Use the 'force' parameter to skip arrays with unsupported dtypes.`);
      let o = qd[e];
      if (!o) throw new Ir(`Unknown or unsupported dtype descriptor: ${r}. Supported types: ${kt.join(", ")}. Use the 'force' parameter to skip arrays with unsupported dtypes.`);
      let a = En(), i = t === "<" || t === "|" || t === "=" && a, s = t === ">" || t === "=" && !a, u = parseInt(e.slice(1), 10), c = u > 1 && (s && a || i && !a);
      return { dtype: o, needsByteSwap: c, itemsize: u };
    }
    var Ir = class extends Error {
      constructor(t) {
        super(t), this.name = "UnsupportedDTypeError";
      }
    };
    var ir = class extends Error {
      constructor(t) {
        super(t), this.name = "InvalidNpyError";
      }
    };
    function bt(r) {
      let t = r instanceof ArrayBuffer ? new Uint8Array(r) : r, e = qt(t);
      return Vt(t, e);
    }
    function qt(r) {
      if (r.length < 10) throw new ir("File too small to be a valid NPY file");
      for (let c = 0; c < gt.length; c++) if (r[c] !== gt[c]) throw new ir("Invalid NPY magic number");
      let t = r[6], e = r[7];
      if (t !== 1 && t !== 2 && t !== 3) throw new ir(`Unsupported NPY version: ${t}.${e}`);
      let n, o;
      t === 1 ? (n = r[8] | r[9] << 8, o = 10) : (n = r[8] | r[9] << 8 | r[10] << 16 | r[11] << 24, o = 12);
      let a = o + n;
      if (r.length < a) throw new ir("File truncated: header extends beyond file");
      let i = r.slice(o, a), s = new TextDecoder("utf-8").decode(i).trim(), u = Vd(s);
      return { version: { major: t, minor: e }, header: u, dataOffset: a };
    }
    function Vt(r, t) {
      let { header: e, dataOffset: n } = t, { dtype: o, needsByteSwap: a, itemsize: i } = Ap(e.descr), s = e.shape.reduce((p, g) => p * g, 1), u = s * i, c = r.length - n;
      if (c < u) throw new ir(`File truncated: expected ${u} bytes of data, got ${c}`);
      let l = new ArrayBuffer(u);
      new Uint8Array(l).set(r.subarray(n, n + u));
      let d = jd(l, o, s, a, i), y = e.shape, f;
      if (e.fortran_order && y.length > 1) {
        let p = [...y].reverse(), g = N.fromData(d, p, o);
        f = Pd(g, p), y = e.shape;
      } else f = N.fromData(d, [...y], o);
      return new _(f);
    }
    function Vd(r) {
      let t = r.match(/'descr'\s*:\s*'([^']+)'/), e = r.match(/'fortran_order'\s*:\s*(True|False)/), n = r.match(/'shape'\s*:\s*\(([^)]*)\)/);
      if (!t || !e || !n) throw new ir(`Failed to parse NPY header: ${r}`);
      let o = t[1], a = e[1] === "True", i = n[1].trim(), s;
      return i === "" ? s = [] : s = i.split(",").map((u) => u.trim()).filter((u) => u !== "").map((u) => {
        let c = parseInt(u, 10);
        if (isNaN(c)) throw new ir(`Invalid shape value: ${u}`);
        return c;
      }), { descr: o, fortran_order: a, shape: s };
    }
    function jd(r, t, e, n, o) {
      let a = P(t);
      if (!a) throw new ir(`Cannot create array for dtype: ${t}`);
      let i = v(t), s = i ? e * 2 : e;
      if (!n) return new a(r, 0, s);
      let u = new Uint8Array(r), c = new Uint8Array(r.byteLength);
      if (i) {
        let l = o / 2;
        for (let m = 0; m < e * 2; m++) {
          let d = m * l;
          for (let y = 0; y < l; y++) c[d + y] = u[d + l - 1 - y];
        }
      } else for (let l = 0; l < e; l++) {
        let m = l * o;
        for (let d = 0; d < o; d++) c[m + d] = u[m + o - 1 - d];
      }
      return new a(c.buffer, 0, s);
    }
    function Pd(r, t) {
      let e = t.length, n = r.size, o = r.dtype, a = P(o);
      if (!a) throw new ir(`Cannot create array for dtype: ${o}`);
      let i = new a(n), s = [...t].reverse(), u = bp(t), c = bp(s), l = new Array(e).fill(0);
      for (let m = 0; m < n; m++) {
        let d = m;
        for (let f = 0; f < e; f++) {
          let p = u[f];
          l[f] = Math.floor(d / p), d = d % p;
        }
        let y = 0;
        for (let f = 0; f < e; f++) y += l[e - 1 - f] * c[f];
        B(o), i[y] = r.iget(m);
      }
      return N.fromData(i, s, o);
    }
    function bp(r) {
      let t = new Array(r.length), e = 1;
      for (let n = r.length - 1; n >= 0; n--) t[n] = e, e *= r[n];
      return t;
    }
    function Xr(r) {
      let t = r.shape, e = r.dtype, n = At[e], o = t.length === 0 ? "()" : t.length === 1 ? `(${t[0]},)` : `(${t.join(", ")})`, a = `{'descr': '${n}', 'fortran_order': False, 'shape': ${o}, }`, i = 12, u = (64 - (i + a.length + 1) % 64) % 64;
      a = a + " ".repeat(u) + `
`;
      let c = new TextEncoder().encode(a), l = c.length, m = r.size, d = Rr(e), y = m * d, f = i + l + y, p = new Uint8Array(f);
      p.set(gt, 0), p[6] = 3, p[7] = 0, p[8] = l & 255, p[9] = l >> 8 & 255, p[10] = l >> 16 & 255, p[11] = l >> 24 & 255, p.set(c, i);
      let g = i + l;
      return Ld(r, p.subarray(g), d), p;
    }
    function Ld(r, t, e) {
      let n = r.dtype, o = r.size, a = En(), i = B(n), s = v(n), u = r._storage;
      if (u.isCContiguous && u.offset === 0 && a) {
        let l = u.data, m = new Uint8Array(l.buffer, l.byteOffset, o * e);
        t.set(m);
      } else {
        let l = new DataView(t.buffer, t.byteOffset, t.byteLength);
        for (let m = 0; m < o; m++) {
          let d = u.iget(m), y = m * e;
          i ? Gd(l, y, d, n === "uint64") : s ? Wd(l, y, d, n) : Zd(l, y, d, n);
        }
      }
    }
    function Gd(r, t, e, n) {
      n ? r.setBigUint64(t, e, true) : r.setBigInt64(t, e, true);
    }
    function Wd(r, t, e, n) {
      n === "complex128" ? (r.setFloat64(t, e.re, true), r.setFloat64(t + 8, e.im, true)) : (r.setFloat32(t, e.re, true), r.setFloat32(t + 4, e.im, true));
    }
    function Zd(r, t, e, n) {
      switch (n) {
        case "float64":
          r.setFloat64(t, e, true);
          break;
        case "float32":
          r.setFloat32(t, e, true);
          break;
        case "int32":
          r.setInt32(t, e, true);
          break;
        case "int16":
          r.setInt16(t, e, true);
          break;
        case "int8":
          r.setInt8(t, e);
          break;
        case "uint32":
          r.setUint32(t, e, true);
          break;
        case "uint16":
          r.setUint16(t, e, true);
          break;
        case "uint8":
        case "bool":
          r.setUint8(t, e);
          break;
        default:
          throw new Error(`Unsupported dtype for serialization: ${n}`);
      }
    }
    var Yd = (() => {
      let r = new Uint32Array(256);
      for (let t = 0; t < 256; t++) {
        let e = t;
        for (let n = 0; n < 8; n++) e = e & 1 ? 3988292384 ^ e >>> 1 : e >>> 1;
        r[t] = e;
      }
      return r;
    })();
    function Tn(r) {
      let t = 4294967295;
      for (let e = 0; e < r.length; e++) t = Yd[(t ^ r[e]) & 255] ^ t >>> 8;
      return (t ^ 4294967295) >>> 0;
    }
    async function hp(r) {
      let t = Dp(r), e = /* @__PURE__ */ new Map();
      for (let n of t) {
        let o = await Hd(n);
        e.set(n.name, o);
      }
      return e;
    }
    function Sp(r) {
      let t = Dp(r), e = /* @__PURE__ */ new Map();
      for (let n of t) {
        if (n.compressionMethod !== 0) throw new Error(`Cannot read compressed entry synchronously: ${n.name}. Use readZip() (async) for DEFLATE-compressed files.`);
        e.set(n.name, n.compressedData);
      }
      return e;
    }
    function Dp(r) {
      let t = r instanceof ArrayBuffer ? new Uint8Array(r) : r, e = new DataView(t.buffer, t.byteOffset, t.byteLength), n = [], o = -1;
      for (let c = t.length - 22; c >= 0; c--) if (e.getUint32(c, true) === 101010256) {
        o = c;
        break;
      }
      if (o === -1) throw new Error("Invalid ZIP file: end of central directory not found");
      let a = e.getUint32(o + 16, true), i = e.getUint16(o + 10, true), s = [], u = a;
      for (let c = 0; c < i && e.getUint32(u, true) === 33639248; c++) {
        let m = e.getUint16(u + 10, true), d = e.getUint32(u + 16, true), y = e.getUint32(u + 20, true), f = e.getUint32(u + 24, true), p = e.getUint16(u + 28, true), g = e.getUint16(u + 30, true), h = e.getUint16(u + 32, true), b = e.getUint32(u + 42, true), A = t.slice(u + 46, u + 46 + p), S = new TextDecoder("utf-8").decode(A);
        s.push({ name: S, compressionMethod: m, crc32: d, compressedSize: y, uncompressedSize: f, localHeaderOffset: b }), u = u + 46 + p + g + h;
      }
      for (let c of s) {
        let l = c.localHeaderOffset;
        if (e.getUint32(l, true) !== 67324752) throw new Error(`Invalid local file header at offset ${l}`);
        let d = e.getUint16(l + 26, true), y = e.getUint16(l + 28, true), f = l + 30 + d + y, p = t.slice(f, f + c.compressedSize);
        n.push({ name: c.name, compressedData: p, compressionMethod: c.compressionMethod, crc32: c.crc32, compressedSize: c.compressedSize, uncompressedSize: c.uncompressedSize });
      }
      return n;
    }
    async function Hd(r) {
      if (r.compressionMethod === 0) return r.compressedData;
      if (r.compressionMethod === 8) return await Xd(r.compressedData);
      throw new Error(`Unsupported compression method: ${r.compressionMethod}`);
    }
    async function Xd(r) {
      if (typeof DecompressionStream > "u") throw new Error("DecompressionStream is not available. This environment does not support the Compression Streams API. Please use a modern browser or Node.js 18+.");
      let t = new DecompressionStream("deflate-raw"), e = new Uint8Array(r.length);
      e.set(r);
      let n = t.writable.getWriter();
      n.write(e), n.close();
      let o = t.readable.getReader(), a = [];
      for (; ; ) {
        let { done: c, value: l } = await o.read();
        if (c) break;
        a.push(l);
      }
      let i = a.reduce((c, l) => c + l.length, 0), s = new Uint8Array(i), u = 0;
      for (let c of a) s.set(c, u), u += c.length;
      return s;
    }
    async function jt(r, t = {}) {
      let e = t.force ?? false, n = await hp(r);
      return Np(n, e);
    }
    function Pt(r, t = {}) {
      let e = t.force ?? false, n = Sp(r);
      return Np(n, e);
    }
    function Np(r, t) {
      let e = /* @__PURE__ */ new Map(), n = [], o = /* @__PURE__ */ new Map();
      for (let [a, i] of r) {
        if (!a.endsWith(".npy")) continue;
        let s = a.slice(0, -4);
        try {
          let u = bt(i);
          e.set(s, u);
        } catch (u) {
          if (u instanceof Ir && t) n.push(s), o.set(s, u.message);
          else throw u;
        }
      }
      return { arrays: e, skipped: n, errors: o };
    }
    async function Un(r, t = {}) {
      let e = await jt(r, t);
      return Object.fromEntries(e.arrays);
    }
    function $n(r, t = {}) {
      let e = Pt(r, t);
      return Object.fromEntries(e.arrays);
    }
    async function xp(r, t = {}) {
      let e = t.compress ?? false, n = [];
      for (let [d, y] of r) {
        let f = Tn(y), p, g;
        e ? (p = await Qd(y), p.length < y.length ? g = 8 : (p = y, g = 0)) : (p = y, g = 0), n.push({ name: d, data: y, compressedData: p, crc: f, compressionMethod: g, offset: 0 });
      }
      let o = 0;
      for (let d of n) {
        let y = new TextEncoder().encode(d.name);
        o += 30 + y.length + d.compressedData.length;
      }
      let a = 0;
      for (let d of n) {
        let y = new TextEncoder().encode(d.name);
        a += 46 + y.length;
      }
      let s = o + a + 22, u = new Uint8Array(s), c = new DataView(u.buffer), l = 0;
      for (let d of n) d.offset = l, l = Ip(u, c, l, d);
      let m = l;
      for (let d of n) l = zp(u, c, l, d);
      return _p(c, l, n.length, a, m), u;
    }
    function wp(r) {
      let t = [];
      for (let [l, m] of r) {
        let d = Tn(m);
        t.push({ name: l, data: m, compressedData: m, crc: d, compressionMethod: 0, offset: 0 });
      }
      let e = 0;
      for (let l of t) {
        let m = new TextEncoder().encode(l.name);
        e += 30 + m.length + l.compressedData.length;
      }
      let n = 0;
      for (let l of t) {
        let m = new TextEncoder().encode(l.name);
        n += 46 + m.length;
      }
      let a = e + n + 22, i = new Uint8Array(a), s = new DataView(i.buffer), u = 0;
      for (let l of t) l.offset = u, u = Ip(i, s, u, l);
      let c = u;
      for (let l of t) u = zp(i, s, u, l);
      return _p(s, u, t.length, n, c), i;
    }
    function Ip(r, t, e, n) {
      let o = new TextEncoder().encode(n.name);
      return t.setUint32(e, 67324752, true), e += 4, t.setUint16(e, n.compressionMethod === 8 ? 20 : 10, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint16(e, n.compressionMethod, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint16(e, 33, true), e += 2, t.setUint32(e, n.crc, true), e += 4, t.setUint32(e, n.compressedData.length, true), e += 4, t.setUint32(e, n.data.length, true), e += 4, t.setUint16(e, o.length, true), e += 2, t.setUint16(e, 0, true), e += 2, r.set(o, e), e += o.length, r.set(n.compressedData, e), e += n.compressedData.length, e;
    }
    function zp(r, t, e, n) {
      let o = new TextEncoder().encode(n.name);
      return t.setUint32(e, 33639248, true), e += 4, t.setUint16(e, 20, true), e += 2, t.setUint16(e, n.compressionMethod === 8 ? 20 : 10, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint16(e, n.compressionMethod, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint16(e, 33, true), e += 2, t.setUint32(e, n.crc, true), e += 4, t.setUint32(e, n.compressedData.length, true), e += 4, t.setUint32(e, n.data.length, true), e += 4, t.setUint16(e, o.length, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint16(e, 0, true), e += 2, t.setUint32(e, 0, true), e += 4, t.setUint32(e, n.offset, true), e += 4, r.set(o, e), e += o.length, e;
    }
    function _p(r, t, e, n, o) {
      r.setUint32(t, 101010256, true), t += 4, r.setUint16(t, 0, true), t += 2, r.setUint16(t, 0, true), t += 2, r.setUint16(t, e, true), t += 2, r.setUint16(t, e, true), t += 2, r.setUint32(t, n, true), t += 4, r.setUint32(t, o, true), t += 4, r.setUint16(t, 0, true);
    }
    async function Qd(r) {
      if (typeof CompressionStream > "u") throw new Error("CompressionStream is not available. This environment does not support the Compression Streams API. Please use a modern browser or Node.js 18+.");
      let t = new CompressionStream("deflate-raw"), e = new Uint8Array(r.length);
      e.set(r);
      let n = t.writable.getWriter();
      n.write(e), n.close();
      let o = t.readable.getReader(), a = [];
      for (; ; ) {
        let { done: c, value: l } = await o.read();
        if (c) break;
        a.push(l);
      }
      let i = a.reduce((c, l) => c + l.length, 0), s = new Uint8Array(i), u = 0;
      for (let c of a) s.set(c, u), u += c.length;
      return s;
    }
    async function Rn(r, t = {}) {
      let e = Mp(r);
      return xp(e, { compress: t.compress ?? false });
    }
    function kn(r) {
      let t = Mp(r);
      return wp(t);
    }
    function Mp(r) {
      let t = /* @__PURE__ */ new Map();
      if (Array.isArray(r)) {
        for (let n = 0; n < r.length; n++) {
          let o = r[n], a = Xr(o);
          t.set(`arr_${n}.npy`, a);
        }
        return t;
      }
      let e = r instanceof Map ? r.entries() : Object.entries(r);
      for (let [n, o] of e) {
        if (typeof n != "string" || n.length === 0) throw new Error("Array names must be non-empty strings");
        let a = Xr(o), i = n.endsWith(".npy") ? n : `${n}.npy`;
        t.set(i, a);
      }
      return t;
    }
    var br = 624;
    var Lt = 397;
    var ng = 2567483615;
    var qn = 2147483648;
    var Vn = 2147483647;
    var hr = { mt: new Uint32Array(br), mti: br + 1 };
    function Bp(r) {
      let t = hr.mt;
      t[0] = r >>> 0;
      for (let e = 1; e < br; e++) {
        let n = t[e - 1] ^ t[e - 1] >>> 30;
        t[e] = Math.imul(1812433253, n) + e >>> 0;
      }
      hr.mti = br;
    }
    function Fp() {
      let r = hr.mt, t, e = [0, ng];
      if (hr.mti >= br) {
        let n;
        for (hr.mti === br + 1 && Bp(5489), n = 0; n < br - Lt; n++) t = r[n] & qn | r[n + 1] & Vn, r[n] = r[n + Lt] ^ t >>> 1 ^ e[t & 1];
        for (; n < br - 1; n++) t = r[n] & qn | r[n + 1] & Vn, r[n] = r[n + (Lt - br)] ^ t >>> 1 ^ e[t & 1];
        t = r[br - 1] & qn | r[0] & Vn, r[br - 1] = r[Lt - 1] ^ t >>> 1 ^ e[t & 1], hr.mti = 0;
      }
      return t = r[hr.mti++], t ^= t >>> 11, t ^= t << 7 & 2636928640, t ^= t << 15 & 4022730752, t ^= t >>> 18, t >>> 0;
    }
    function Y() {
      let r = Fp() >>> 5, t = Fp() >>> 6;
      return (r * 67108864 + t) / 9007199254740992;
    }
    var og = 2468251765;
    var ag = 1492356589;
    var sg = 1135663077;
    var ig = 2337405405;
    var ug = 3389127133;
    var cg = 1232336661;
    var Wn = 16;
    var Gt = 4;
    function ur(r) {
      return r >>> 0;
    }
    function jn(r, t) {
      return r = ur(ur(r) ^ t.val), t.val = ur(Math.imul(t.val, og)), r = ur(Math.imul(r, t.val)), r = ur(r ^ r >>> Wn), r;
    }
    function lg(r, t) {
      let e = ur(ur(Math.imul(ug, ur(r))) - ur(Math.imul(cg, ur(t))));
      return e = ur(e ^ e >>> Wn), e;
    }
    function fg(r) {
      let t = [0, 0, 0, 0], e = [r >>> 0], n = { val: sg };
      for (let o = 0; o < Gt; o++) o < e.length ? t[o] = jn(e[o], n) : t[o] = jn(0, n);
      for (let o = 0; o < Gt; o++) for (let a = 0; a < Gt; a++) if (o !== a) {
        let i = jn(t[o], n);
        t[a] = lg(t[a], i);
      }
      return t;
    }
    function mg(r, t) {
      let e = [], n = ig;
      for (let o = 0; o < t; o++) {
        let a = r[o % Gt], i = ur(a ^ n);
        n = ur(Math.imul(n, ag)), i = ur(Math.imul(i, n)), i = ur(i ^ i >>> Wn), e.push(i);
      }
      return e;
    }
    var pg = BigInt("4865540595714422341");
    var yg = BigInt("2549297995355413924");
    var dg = yg << BigInt(64) | pg;
    var Pn = BigInt("0xffffffffffffffff");
    var Ln = (BigInt(1) << BigInt(128)) - BigInt(1);
    function gg(r) {
      let t = r >> BigInt(64), e = r & Pn, n = (t ^ e) & Pn, o = Number(r >> BigInt(122));
      return (n >> BigInt(o) | n << BigInt(64 - o)) & Pn;
    }
    function Gn(r, t) {
      return r * dg + t & Ln;
    }
    function vp(r) {
      let t = fg(r), e = mg(t, 8), n = BigInt(e[0]) | BigInt(e[1]) << BigInt(32), o = BigInt(e[2]) | BigInt(e[3]) << BigInt(32), a = BigInt(e[4]) | BigInt(e[5]) << BigInt(32), i = BigInt(e[6]) | BigInt(e[7]) << BigInt(32), s = n << BigInt(64) | o, u = (a << BigInt(64) | i) << BigInt(1);
      u = (u | BigInt(1)) & Ln;
      let c = BigInt(0);
      return c = Gn(c, u), c = c + s & Ln, c = Gn(c, u), { state: c, inc: u };
    }
    function Ag(r) {
      return r.state = Gn(r.state, r.inc), gg(r.state);
    }
    function bg(r) {
      let e = Ag(r) >> BigInt(11);
      return Number(e) / 9007199254740992;
    }
    var St = class {
      constructor(t) {
        if (t !== void 0) this._pcgState = vp(t);
        else {
          let e = Math.floor(Math.random() * 4294967296);
          this._pcgState = vp(e);
        }
      }
      _randomFloat() {
        return bg(this._pcgState);
      }
      random(t) {
        if (t === void 0) return this._randomFloat();
        let e = Array.isArray(t) ? t : [t], n = e.reduce((i, s) => i * s, 1), o = N.zeros(e, "float64"), a = o.data;
        for (let i = 0; i < n; i++) a[i] = this._randomFloat();
        return o;
      }
      integers(t, e, n) {
        if (e === void 0 && (e = t, t = 0), n === void 0) return Math.floor(this._randomFloat() * (e - t)) + t;
        let o = Array.isArray(n) ? n : [n], a = o.reduce((c, l) => c * l, 1), i = N.zeros(o, "int64"), s = i.data, u = e - t;
        for (let c = 0; c < a; c++) s[c] = BigInt(Math.floor(this._randomFloat() * u) + t);
        return i;
      }
      standard_normal(t) {
        if (t === void 0) return $r(this._randomFloat.bind(this));
        let e = Array.isArray(t) ? t : [t], n = e.reduce((i, s) => i * s, 1), o = N.zeros(e, "float64"), a = o.data;
        for (let i = 0; i < n; i += 2) {
          let [s, u] = Dt(this._randomFloat.bind(this));
          a[i] = s, i + 1 < n && (a[i + 1] = u);
        }
        return o;
      }
      normal(t = 0, e = 1, n) {
        if (n === void 0) return $r(this._randomFloat.bind(this)) * e + t;
        let o = Array.isArray(n) ? n : [n], a = o.reduce((u, c) => u * c, 1), i = N.zeros(o, "float64"), s = i.data;
        for (let u = 0; u < a; u += 2) {
          let [c, l] = Dt(this._randomFloat.bind(this));
          s[u] = c * e + t, u + 1 < a && (s[u + 1] = l * e + t);
        }
        return i;
      }
      uniform(t = 0, e = 1, n) {
        if (n === void 0) return this._randomFloat() * (e - t) + t;
        let o = Array.isArray(n) ? n : [n], a = o.reduce((c, l) => c * l, 1), i = N.zeros(o, "float64"), s = i.data, u = e - t;
        for (let c = 0; c < a; c++) s[c] = this._randomFloat() * u + t;
        return i;
      }
      choice(t, e, n = true, o) {
        return Wp(t, e, n, o, this._randomFloat.bind(this));
      }
      permutation(t) {
        return Yp(t, this._randomFloat.bind(this));
      }
      shuffle(t) {
        Xp(t, this._randomFloat.bind(this));
      }
      exponential(t = 1, e) {
        if (e === void 0) return -Math.log(1 - this._randomFloat()) * t;
        let n = Array.isArray(e) ? e : [e], o = n.reduce((s, u) => s * u, 1), a = N.zeros(n, "float64"), i = a.data;
        for (let s = 0; s < o; s++) i[s] = -Math.log(1 - this._randomFloat()) * t;
        return a;
      }
      poisson(t = 1, e) {
        if (e === void 0) return Wt(t, this._randomFloat.bind(this));
        let n = Array.isArray(e) ? e : [e], o = n.reduce((s, u) => s * u, 1), a = N.zeros(n, "int64"), i = a.data;
        for (let s = 0; s < o; s++) i[s] = BigInt(Wt(t, this._randomFloat.bind(this)));
        return a;
      }
      binomial(t, e, n) {
        if (n === void 0) return Zt(t, e, this._randomFloat.bind(this));
        let o = Array.isArray(n) ? n : [n], a = o.reduce((u, c) => u * c, 1), i = N.zeros(o, "int64"), s = i.data;
        for (let u = 0; u < a; u++) s[u] = BigInt(Zt(t, e, this._randomFloat.bind(this)));
        return i;
      }
    };
    function Ep(r) {
      return new St(r);
    }
    function Tp(r) {
      r == null && (r = Math.floor(Date.now() ^ Math.random() * 4294967296)), Bp(r >>> 0);
    }
    function Op() {
      return { mt: Array.from(hr.mt), mti: hr.mti };
    }
    function Cp(r) {
      hr.mt = new Uint32Array(r.mt), hr.mti = r.mti;
    }
    function $r(r) {
      let t, e;
      do
        t = r(), e = r();
      while (t === 0);
      return Math.sqrt(-2 * Math.log(t)) * Math.cos(2 * Math.PI * e);
    }
    function Dt(r) {
      let t, e;
      do
        t = r(), e = r();
      while (t === 0);
      let n = Math.sqrt(-2 * Math.log(t)), o = 2 * Math.PI * e;
      return [n * Math.cos(o), n * Math.sin(o)];
    }
    function Wt(r, t) {
      if (r < 30) {
        let e = Math.exp(-r), n = 0, o = 1;
        do
          n++, o *= t();
        while (o > e);
        return n - 1;
      } else {
        let e = $r(t);
        return Math.max(0, Math.round(r + Math.sqrt(r) * e));
      }
    }
    function Zt(r, t, e) {
      if (r * t < 10 && r * (1 - t) < 10) {
        let n = 0;
        for (let o = 0; o < r; o++) e() < t && n++;
        return n;
      } else {
        let n = r * t, o = Math.sqrt(r * t * (1 - t)), a = $r(e);
        return Math.max(0, Math.min(r, Math.round(n + o * a)));
      }
    }
    function Up(r) {
      if (r === void 0) return Y();
      let t = Array.isArray(r) ? r : [r], e = t.reduce((a, i) => a * i, 1), n = N.zeros(t, "float64"), o = n.data;
      for (let a = 0; a < e; a++) o[a] = Y();
      return n;
    }
    function $p(...r) {
      if (r.length === 0) return Y();
      let t = r.reduce((o, a) => o * a, 1), e = N.zeros(r, "float64"), n = e.data;
      for (let o = 0; o < t; o++) n[o] = Y();
      return e;
    }
    function Rp(...r) {
      if (r.length === 0) return $r(Y);
      let t = r.reduce((o, a) => o * a, 1), e = N.zeros(r, "float64"), n = e.data;
      for (let o = 0; o < t; o += 2) {
        let [a, i] = Dt(Y);
        n[o] = a, o + 1 < t && (n[o + 1] = i);
      }
      return e;
    }
    function kp(r, t, e, n = "int64") {
      t == null && (t = r, r = 0);
      let o = t - r;
      if (e === void 0) return Math.floor(Y() * o) + r;
      let a = Array.isArray(e) ? e : [e], i = a.reduce((c, l) => c * l, 1), s = N.zeros(a, n), u = s.data;
      if (B(n)) {
        let c = u;
        for (let l = 0; l < i; l++) c[l] = BigInt(Math.floor(Y() * o) + r);
      } else {
        let c = u;
        for (let l = 0; l < i; l++) c[l] = Math.floor(Y() * o) + r;
      }
      return s;
    }
    function qp(r = 0, t = 1, e) {
      if (e === void 0) return Y() * (t - r) + r;
      let n = Array.isArray(e) ? e : [e], o = n.reduce((u, c) => u * c, 1), a = N.zeros(n, "float64"), i = a.data, s = t - r;
      for (let u = 0; u < o; u++) i[u] = Y() * s + r;
      return a;
    }
    function Vp(r = 0, t = 1, e) {
      if (e === void 0) return $r(Y) * t + r;
      let n = Array.isArray(e) ? e : [e], o = n.reduce((s, u) => s * u, 1), a = N.zeros(n, "float64"), i = a.data;
      for (let s = 0; s < o; s += 2) {
        let [u, c] = Dt(Y);
        i[s] = u * t + r, s + 1 < o && (i[s + 1] = c * t + r);
      }
      return a;
    }
    function jp(r) {
      if (r === void 0) return $r(Y);
      let t = Array.isArray(r) ? r : [r], e = t.reduce((a, i) => a * i, 1), n = N.zeros(t, "float64"), o = n.data;
      for (let a = 0; a < e; a += 2) {
        let [i, s] = Dt(Y);
        o[a] = i, a + 1 < e && (o[a + 1] = s);
      }
      return n;
    }
    function Pp(r = 1, t) {
      if (t === void 0) return -Math.log(1 - Y()) * r;
      let e = Array.isArray(t) ? t : [t], n = e.reduce((i, s) => i * s, 1), o = N.zeros(e, "float64"), a = o.data;
      for (let i = 0; i < n; i++) a[i] = -Math.log(1 - Y()) * r;
      return o;
    }
    function Lp(r = 1, t) {
      if (t === void 0) return Wt(r, Y);
      let e = Array.isArray(t) ? t : [t], n = e.reduce((i, s) => i * s, 1), o = N.zeros(e, "int64"), a = o.data;
      for (let i = 0; i < n; i++) a[i] = BigInt(Wt(r, Y));
      return o;
    }
    function Gp(r, t, e) {
      if (e === void 0) return Zt(r, t, Y);
      let n = Array.isArray(e) ? e : [e], o = n.reduce((s, u) => s * u, 1), a = N.zeros(n, "int64"), i = a.data;
      for (let s = 0; s < o; s++) i[s] = BigInt(Zt(r, t, Y));
      return a;
    }
    function Wp(r, t, e = true, n, o = Y) {
      let a;
      if (typeof r == "number") a = Array.from({ length: r }, (d, y) => y);
      else {
        let d = r.size;
        a = [];
        for (let y = 0; y < d; y++) a.push(Number(r.iget(y)));
      }
      let i = a.length;
      if (i === 0) throw new Error("cannot take a sample from an empty sequence");
      let s;
      if (n !== void 0) {
        if (Array.isArray(n)) s = n;
        else {
          let y = n.size;
          s = [];
          for (let f = 0; f < y; f++) s.push(Number(n.iget(f)));
        }
        if (s.length !== i) throw new Error("p and a must have the same size");
        let d = s.reduce((y, f) => y + f, 0);
        Math.abs(d - 1) > 1e-10 && (s = s.map((y) => y / d));
      }
      if (t === void 0) {
        if (s) {
          let d = o(), y = 0;
          for (let f = 0; f < i; f++) if (y += s[f], d < y) return a[f];
          return a[i - 1];
        }
        return a[Math.floor(o() * i)];
      }
      let u = Array.isArray(t) ? t : [t], c = u.reduce((d, y) => d * y, 1);
      if (!e && c > i) throw new Error("cannot take a larger sample than population when replace=false");
      let l = N.zeros(u, "float64"), m = l.data;
      if (e) if (s) {
        let d = new Array(i);
        d[0] = s[0];
        for (let y = 1; y < i; y++) d[y] = d[y - 1] + s[y];
        for (let y = 0; y < c; y++) {
          let f = o(), p = 0;
          for (; p < i - 1 && f >= d[p]; ) p++;
          m[y] = a[p];
        }
      } else for (let d = 0; d < c; d++) m[d] = a[Math.floor(o() * i)];
      else {
        let d = [...a], y = s ? [...s] : void 0;
        for (let f = 0; f < c; f++) {
          let p;
          if (y) {
            let g = y.reduce((A, S) => A + S, 0), h = o() * g, b = 0;
            p = 0;
            for (let A = 0; A < d.length; A++) if (b += y[A], h < b) {
              p = A;
              break;
            }
            p === 0 && h >= b && (p = d.length - 1);
          } else p = Math.floor(o() * d.length);
          m[f] = d[p], d.splice(p, 1), y && y.splice(p, 1);
        }
      }
      return l;
    }
    function Zp(r, t, e = true, n) {
      return Wp(r, t, e, n, Y);
    }
    function Yp(r, t = Y) {
      let e;
      if (typeof r == "number") {
        let o = new Float64Array(r);
        for (let a = 0; a < r; a++) o[a] = a;
        e = N.fromData(o, [r], "float64");
      } else e = r.copy();
      let n = e.size;
      for (let o = n - 1; o > 0; o--) {
        let a = Math.floor(t() * (o + 1)), i = e.iget(o);
        e.iset(o, e.iget(a)), e.iset(a, i);
      }
      return e;
    }
    function Hp(r) {
      return Yp(r, Y);
    }
    function Xp(r, t = Y) {
      let e = r.size;
      for (let n = e - 1; n > 0; n--) {
        let o = Math.floor(t() * (n + 1)), a = r.iget(n);
        r.iset(n, r.iget(o)), r.iset(o, a);
      }
    }
    function Jp(r) {
      Xp(r, Y);
    }
    function gr(r) {
      return r && typeof r == "object" && "_data" in r && "_shape" in r ? _._fromStorage(r) : r;
    }
    var Sg = { seed: Tp, random: (r) => gr(Up(r)), rand: (...r) => gr($p(...r)), randn: (...r) => gr(Rp(...r)), randint: (r, t, e, n) => gr(kp(r, t, e, n)), uniform: (r, t, e) => gr(qp(r, t, e)), normal: (r, t, e) => gr(Vp(r, t, e)), standard_normal: (r) => gr(jp(r)), exponential: (r, t) => gr(Pp(r, t)), poisson: (r, t) => gr(Lp(r, t)), binomial: (r, t, e) => gr(Gp(r, t, e)), choice: (r, t, e, n) => gr(Zp(r, t, e, n)), permutation: (r) => gr(Hp(r)), shuffle: Jp, get_state: Op, set_state: Cp, default_rng: Ep, Generator: St };
    var Dg = "0.12.0";
  }
});

// src/lib/base/vec2.ts
function vec2_norm(x) {
  return Math.sqrt(x[0] ** 2 + x[1] ** 2);
}
function vec2_sub(x, y) {
  return [x[0] - y[0], x[1] - y[1]];
}

// src/lib/base/base.ts
var StrokeOptions = class {
  constructor() {
    this.stroke_width = 0.08;
    this.stroke_color = "black";
    this.stroke_style = "solid";
  }
  set_stroke_color(color) {
    this.stroke_color = color;
    return this;
  }
  set_stroke_width(width) {
    this.stroke_width = width;
    return this;
  }
  set_stroke_style(style) {
    this.stroke_style = style;
    return this;
  }
  apply_to(ctx, scene) {
    ctx.lineWidth = this.stroke_width * scene.scale();
    ctx.strokeStyle = this.stroke_color;
    if (this.stroke_style == "solid") {
      ctx.setLineDash([]);
    } else if (this.stroke_style == "dashed") {
      ctx.setLineDash([5, 5]);
    } else if (this.stroke_style == "dotted") {
      ctx.setLineDash([2, 2]);
    }
  }
};
var FillOptions = class {
  constructor() {
    this.fill_color = "black";
    this.fill_alpha = 1;
    this.fill = true;
  }
  set_fill_color(color) {
    this.fill_color = color;
    return this;
  }
  set_fill_alpha(alpha) {
    this.fill_alpha = alpha;
    return this;
  }
  set_fill(fill2) {
    this.fill = fill2;
    return this;
  }
  apply_to(ctx) {
    ctx.fillStyle = this.fill_color;
  }
};
var MObject = class {
  // Opacity for drawing
  constructor() {
    this.alpha = 1;
  }
  set_alpha(alpha) {
    this.alpha = alpha;
    return this;
  }
  add(scene) {
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    this._draw(ctx, scene, args);
  }
  _draw(ctx, scene, args) {
  }
};
var LineLikeMObject = class extends MObject {
  constructor() {
    super(...arguments);
    this.stroke_options = new StrokeOptions();
  }
  set_stroke_color(color) {
    this.stroke_options.set_stroke_color(color);
    return this;
  }
  set_stroke_width(width) {
    this.stroke_options.set_stroke_width(width);
    return this;
  }
  set_stroke_style(style) {
    this.stroke_options.set_stroke_style(style);
    return this;
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    this.stroke_options.apply_to(ctx, scene);
    this._draw(ctx, scene, args);
  }
};
var FillLikeMObject = class extends MObject {
  constructor() {
    super(...arguments);
    this.stroke_options = new StrokeOptions();
    this.fill_options = new FillOptions();
  }
  set_stroke_color(color) {
    this.stroke_options.set_stroke_color(color);
    return this;
  }
  set_stroke_width(width) {
    this.stroke_options.set_stroke_width(width);
    return this;
  }
  set_stroke_style(style) {
    this.stroke_options.set_stroke_style(style);
    return this;
  }
  set_fill_color(color) {
    this.fill_options.set_fill_color(color);
    return this;
  }
  set_color(color) {
    this.stroke_options.set_stroke_color(color);
    this.fill_options.set_fill_color(color);
    return this;
  }
  set_fill_alpha(alpha) {
    this.fill_options.set_fill_alpha(alpha);
    return this;
  }
  set_fill(fill2) {
    this.fill_options.set_fill(fill2);
    return this;
  }
  draw(canvas, scene, args) {
    let ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.globalAlpha = this.alpha;
    this.stroke_options.apply_to(ctx, scene);
    this.fill_options.apply_to(ctx);
    this._draw(ctx, scene, args);
  }
};
var Scene = class {
  constructor(canvas) {
    this.border_thickness = 4;
    this.border_color = "black";
    // Zoom ratio
    this.zoom_ratio = 1;
    // Determines whether any draggable object in the scene is clicked
    this.is_dragging = false;
    this.canvas = canvas;
    this.mobjects = {};
    this.xlims = [0, canvas.width];
    this.ylims = [0, canvas.height];
    this.view_xlims = [0, canvas.width];
    this.view_ylims = [0, canvas.height];
  }
  click() {
    this.is_dragging = true;
  }
  unclick() {
    this.is_dragging = false;
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
    this.zoom_ratio = (this.xlims[1] - this.xlims[0]) / (xlims[1] - xlims[0]);
    this.view_xlims = xlims;
    this.view_ylims = ylims;
  }
  // Returns the center of the viewing window
  get_view_center() {
    return [
      (this.view_xlims[0] + this.view_xlims[1]) / 2,
      (this.view_ylims[0] + this.view_ylims[1]) / 2
    ];
  }
  // Sets the current zoom level
  set_zoom(value) {
    this.zoom_ratio = value;
    this.view_xlims = [this.xlims[0] / value, this.xlims[1] / value];
    this.view_ylims = [this.ylims[0] / value, this.ylims[1] / value];
  }
  // Performs a homothety around the specified center point of the viewing window, with the given factor
  zoom_in_on(ratio, center) {
    this.zoom_ratio *= ratio;
    this.view_xlims = [
      center[0] + (this.view_xlims[0] - center[0]) / ratio,
      center[0] + (this.view_xlims[1] - center[0]) / ratio
    ];
    this.view_ylims = [
      center[1] + (this.view_ylims[0] - center[1]) / ratio,
      center[1] + (this.view_ylims[1] - center[1]) / ratio
    ];
  }
  // Moves the viewing window by the specified vector
  move_view(v) {
    this.view_xlims = [this.view_xlims[0] + v[0], this.view_xlims[1] + v[0]];
    this.view_ylims = [this.view_ylims[0] + v[1], this.view_ylims[1] + v[1]];
  }
  // Number of canvas pixels occupied by a horizontal shift of 1 in scene coordinates
  scale() {
    let [xmin, xmax] = this.view_xlims;
    return this.canvas.width / (xmax - xmin);
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
    let self = this;
    mobj.add(self);
  }
  // Removes the mobject from the scene
  remove(name) {
    delete this.mobjects[name];
  }
  // Removes all mobjects from the scene
  clear() {
    this.mobjects = {};
  }
  // Checks if a mobject exists in the scene
  has_mobj(name) {
    return this.mobjects.hasOwnProperty(name);
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
    this._draw();
    this.draw_border(ctx);
  }
  _draw() {
    Object.keys(this.mobjects).forEach((name) => {
      let mobj = this.mobjects[name];
      if (mobj == void 0) throw new Error(`${name} not found`);
      mobj.draw(this.canvas, this);
    });
  }
  // Draw a border around the canvas
  draw_border(ctx) {
    ctx.strokeStyle = this.border_color;
    ctx.lineWidth = this.border_thickness;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
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
  prepareCanvasForMobile(canvas);
  return canvas;
}
function prepareCanvasForMobile(canvas) {
  canvas.ontouchstart = function(e) {
    e.preventDefault();
  };
  canvas.ontouchend = function(e) {
    e.preventDefault();
  };
  canvas.ontouchmove = function(e) {
    e.preventDefault();
  };
}
function mouse_event_coords(event) {
  return [event.pageX, event.pageY];
}
function touch_event_coords(event) {
  return [event.touches[0].pageX, event.touches[0].pageY];
}

// src/lib/base/geometry.ts
var Dot = class extends FillLikeMObject {
  constructor(center, radius) {
    super();
    this.radius = 0.1;
    this.center = center;
    this.radius = radius;
  }
  // Get the center coordinates
  get_center() {
    return this.center;
  }
  // Move the center of the dot to a desired location
  move_to(p) {
    this.center = p;
  }
  move_by(p) {
    this.center[0] += p[0];
    this.center[1] += p[1];
  }
  // Change the dot radius
  set_radius(radius) {
    this.radius = radius;
    return this;
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [x, y] = scene.v2c(this.center);
    let xr = scene.v2c([this.center[0] + this.radius, this.center[1]])[0];
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(xr - x), 0, 2 * Math.PI);
    ctx.fill();
  }
  // Convert to a draggable rectangle
  toDraggableDot() {
    return new DraggableDot(this.center, this.radius);
  }
  toDraggableDotX() {
    return new DraggableDotX(this.center, this.radius);
  }
  toDraggableDotY() {
    return new DraggableDotY(this.center, this.radius);
  }
};
var DraggableDot = class extends Dot {
  constructor() {
    super(...arguments);
    this.isClicked = false;
    this.dragStart = [0, 0];
    this.dragEnd = [0, 0];
    this.touch_tolerance = 2;
    this.callbacks = [];
  }
  // Tests whether a chosen vector lies inside the shape. Used for click-detection.
  is_inside(p) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius;
  }
  // Tests whether a chosen vector lies within an enlarged version of the dot.
  // Used for touch-detection on mobile devices, and for use by small children.
  is_almost_inside(p, tolerance) {
    return vec2_norm(vec2_sub(p, this.center)) < this.radius * tolerance;
  }
  // Adds a callback which triggers when the dot is dragged
  add_callback(callback) {
    this.callbacks.push(callback);
  }
  do_callbacks() {
    for (const callback of this.callbacks) {
      callback();
    }
  }
  // Triggers when the canvas is clicked.
  click(scene, event) {
    this.dragStart = vec2_sub(mouse_event_coords(event), [
      scene.canvas.offsetLeft,
      scene.canvas.offsetTop
    ]);
    if (!scene.is_dragging) {
      this.isClicked = this.is_inside(
        scene.c2v(this.dragStart[0], this.dragStart[1])
      );
      if (this.isClicked) {
        scene.click();
      }
    }
  }
  touch(scene, event) {
    this.dragStart = [
      event.touches[0].pageX - scene.canvas.offsetLeft,
      event.touches[0].pageY - scene.canvas.offsetTop
    ];
    if (!scene.is_dragging) {
      this.isClicked = this.is_almost_inside(
        scene.c2v(this.dragStart[0], this.dragStart[1]),
        this.touch_tolerance
      );
      if (this.isClicked) {
        scene.click();
      }
    }
  }
  // Triggers when the canvas is unclicked.
  unclick(scene, event) {
    if (this.isClicked) {
      scene.unclick();
    }
    this.isClicked = false;
  }
  untouch(scene, event) {
    if (this.isClicked) {
      scene.unclick();
    }
    scene.unclick();
  }
  // Triggers when the mouse is dragged over the canvas.
  mouse_drag_cursor(scene, event) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(mouse_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop
      ]);
      this._drag_cursor(scene);
    }
  }
  touch_drag_cursor(scene, event) {
    if (this.isClicked) {
      this.dragEnd = vec2_sub(touch_event_coords(event), [
        scene.canvas.offsetLeft,
        scene.canvas.offsetTop
      ]);
      this._drag_cursor(scene);
    }
  }
  _drag_cursor(scene) {
    this.move_by(
      vec2_sub(
        scene.c2v(this.dragEnd[0], this.dragEnd[1]),
        scene.c2v(this.dragStart[0], this.dragStart[1])
      )
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
  add(scene) {
    let self = this;
    scene.canvas.addEventListener("mousedown", self.click.bind(self, scene));
    scene.canvas.addEventListener("mouseup", self.unclick.bind(self, scene));
    scene.canvas.addEventListener(
      "mousemove",
      self.mouse_drag_cursor.bind(self, scene)
    );
    scene.canvas.addEventListener("touchstart", self.touch.bind(self, scene));
    scene.canvas.addEventListener("touchend", self.untouch.bind(self, scene));
    scene.canvas.addEventListener(
      "touchmove",
      self.touch_drag_cursor.bind(self, scene)
    );
  }
  remove(scene) {
    let self = this;
    scene.canvas.removeEventListener("mousedown", this.click.bind(self, scene));
    scene.canvas.removeEventListener("mouseup", this.unclick.bind(self, scene));
    scene.canvas.removeEventListener(
      "mousemove",
      this.mouse_drag_cursor.bind(self, scene)
    );
    scene.canvas.removeEventListener(
      "touchstart",
      this.click.bind(self, scene)
    );
    scene.canvas.removeEventListener(
      "touchend",
      this.unclick.bind(self, scene)
    );
    scene.canvas.removeEventListener(
      "touchmove",
      self.mouse_drag_cursor.bind(self, scene)
    );
  }
  // Remove draggability
  toDot() {
    return new Dot(this.center, this.radius);
  }
};
var DraggableDotX = class extends DraggableDot {
  _drag_cursor(scene) {
    this.move_by(
      vec2_sub(scene.c2s(this.dragEnd[0], 0), scene.c2s(this.dragStart[0], 0))
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
};
var DraggableDotY = class extends DraggableDot {
  _drag_cursor(scene) {
    this.move_by(
      vec2_sub(scene.c2s(0, this.dragEnd[1]), scene.c2s(0, this.dragStart[1]))
    );
    this.dragStart = this.dragEnd;
    this.do_callbacks();
    scene.draw();
  }
};
var Line = class extends LineLikeMObject {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
  // Moves the start and end points
  move_start(p) {
    this.start = p;
  }
  move_end(p) {
    this.end = p;
  }
  length() {
    return vec2_norm(vec2_sub(this.start, this.end));
  }
  // Draws on the canvas
  _draw(ctx, scene) {
    let [start_x, start_y] = scene.v2c(this.start);
    let [end_x, end_y] = scene.v2c(this.end);
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
  }
};

// src/lib/bezier.ts
var np = __toESM(require_numpy_ts_node(), 1);
var SmoothOpenPathBezierHandleCalculator = class {
  constructor(n) {
    this.n = n;
    let below_diag_list = [];
    for (let i = 0; i < n - 2; i++) {
      below_diag_list.push(1);
    }
    below_diag_list.push(2);
    let below_diag = np.array(below_diag_list);
    let diag_list = [2];
    for (let i = 0; i < n - 2; i++) {
      diag_list.push(4);
    }
    diag_list.push(7);
    let diag2 = np.array(diag_list);
    let above_diag_list = [];
    for (let i = 0; i < n - 1; i++) {
      above_diag_list.push(1);
    }
    let above_diag = np.array(above_diag_list);
    this.result = np.zeros([n, n + 1], "float32");
    this.result.set([0, 0], 1);
    this.result.set([0, 1], 2);
    for (let i = 1; i < n - 1; i++) {
      this.result.set([i, i], 4);
      this.result.set([i, i + 1], 2);
    }
    this.result.set([n - 1, n - 1], 8);
    this.result.set([n - 1, n], 1);
    for (let i = 0; i < n - 1; i++) {
      let scale = below_diag.get([i]) / diag2.get([i]);
      diag2.set(
        [i + 1],
        diag2.get([i + 1]) - above_diag.get([i]) * scale
      );
      below_diag.set(
        [i],
        below_diag.get([i]) - diag2.get([i]) * scale
      );
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i + 1, j],
          this.result.get([i + 1, j]) - this.result.get([i, j]) * scale
        );
      }
    }
    for (let i = n - 2; i >= 0; i--) {
      let scale = above_diag.get([i]) / diag2.get([i + 1]);
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i, j],
          this.result.get([i, j]) - this.result.get([i + 1, j]) * scale
        );
      }
    }
    for (let i = 0; i < n; i++) {
      let scale = 1 / diag2.get([i]);
      for (let j = 0; j < n + 1; j++) {
        this.result.set([i, j], this.result.get([i, j]) * scale);
      }
    }
  }
  // Given a sequence of n+1 anchors, produces the corresponding bezier handles
  get_bezier_handles(a) {
    if (a.shape[0] !== this.n + 1) {
      throw new Error("Invalid anchor array shape");
    }
    if (a.shape[1] !== 2) {
      throw new Error("Invalid anchor array shape");
    }
    let h1 = this.result.matmul(a);
    let h2 = np.zeros([this.n, 2]);
    for (let i = 0; i < this.n - 1; i++) {
      h2.set(
        [i, 0],
        2 * a.get([i + 1, 0]) - h1.get([i + 1, 0])
      );
      h2.set(
        [i, 1],
        2 * a.get([i + 1, 1]) - h1.get([i + 1, 1])
      );
    }
    h2.set(
      [this.n - 1, 0],
      0.5 * (a.get([this.n, 0]) + h1.get([this.n - 1, 0]))
    );
    h2.set(
      [this.n - 1, 1],
      0.5 * (a.get([this.n, 1]) + h1.get([this.n - 1, 1]))
    );
    return [h1, h2];
  }
};
var BezierSpline = class extends LineLikeMObject {
  constructor(num_steps, kwargs) {
    super();
    this.num_steps = num_steps;
    this.solver = new SmoothOpenPathBezierHandleCalculator(num_steps);
    this.anchors = [];
    for (let i = 0; i < num_steps + 1; i++) {
      this.anchors.push([0, 0]);
    }
    let stroke_width = kwargs.stroke_width;
    if (stroke_width == void 0) {
      this.stroke_options.stroke_width = 0.08;
    } else {
      this.stroke_options.stroke_width = stroke_width;
    }
    let stroke_color = kwargs.stroke_color;
    if (stroke_color == void 0) {
      this.stroke_options.stroke_color = `rgb(0, 0, 0)`;
    } else {
      this.stroke_options.stroke_color = stroke_color;
    }
  }
  set_anchors(new_anchors) {
    this.anchors = new_anchors;
  }
  set_anchor(index, new_anchor) {
    this.anchors[index] = new_anchor;
  }
  get_anchor(index) {
    return this.anchors[index];
  }
  _draw(ctx, scene) {
    let a_x, a_y, a;
    a = this.get_anchor(0);
    [a_x, a_y] = scene.v2c(a);
    ctx.beginPath();
    ctx.moveTo(a_x, a_y);
    let [handles_1, handles_2] = this.solver.get_bezier_handles(
      np.array(this.anchors)
    );
    let h1_x, h1_y, h2_x, h2_y;
    for (let i = 0; i < this.num_steps; i++) {
      [h1_x, h1_y] = scene.v2c([
        handles_1.get([i, 0]),
        handles_1.get([i, 1])
      ]);
      [h2_x, h2_y] = scene.v2c([
        handles_2.get([i, 0]),
        handles_2.get([i, 1])
      ]);
      a = this.get_anchor(i + 1);
      [a_x, a_y] = scene.v2c(a);
      ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, a_x, a_y);
      ctx.stroke();
    }
  }
};

// src/lib/interactive.ts
function Slider(container, callback, kwargs) {
  let slider = document.createElement("input");
  slider.type = "range";
  slider.value = kwargs.initial_value;
  slider.classList.add("slider");
  slider.id = "floatSlider";
  slider.width = 200;
  let name = kwargs.name;
  if (name == void 0) {
    slider.name = "Value";
  } else {
    slider.name = name;
  }
  let min2 = kwargs.min;
  if (min2 == void 0) {
    slider.min = "0";
  } else {
    slider.min = `${min2}`;
  }
  let max2 = kwargs.max;
  if (max2 == void 0) {
    slider.max = "10";
  } else {
    slider.max = `${max2}`;
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

// src/interactive_scene.ts
(async function() {
  document.addEventListener("DOMContentLoaded", async function() {
    (function draggable_dots(width, height) {
      let canvas = prepare_canvas(width, height, "draggable-dot");
      let scene = new Scene(canvas);
      scene.set_frame_lims([-5, 5], [-5, 5]);
      let dot_1 = new DraggableDot([1, 0], 0.3);
      let dot_2 = new DraggableDot([-1, 0], 0.3);
      let line = new Line([1, 0], [-1, 0]);
      dot_1.add_callback(() => {
        line.move_start(dot_1.get_center());
      });
      dot_2.add_callback(() => {
        line.move_end(dot_2.get_center());
      });
      scene.add("line", line);
      scene.add("p1", dot_1);
      scene.add("p2", dot_2);
      scene.draw();
    })(300, 300);
    (function draggable_dots_bezier(width, height) {
      let canvas = prepare_canvas(width, height, "draggable-dot-bezier");
      let scene = new Scene(canvas);
      let xmin = -5;
      let xmax = 5;
      let ymin = -5;
      let ymax = 5;
      scene.set_frame_lims([xmin, xmax], [ymin, ymax]);
      function make_scene(n) {
        scene.clear();
        let dots = [];
        for (let i = 0; i < n; i++) {
          let dot3 = new DraggableDot(
            [xmin + (xmax - xmin) * (i + 0.5) / n, 0],
            0.5 / Math.sqrt(n)
          );
          dot3.touch_tolerance = 2 + n / 10;
          dots.push(dot3);
          scene.add(`p${i}`, dot3);
        }
        let curve = new BezierSpline(n - 1, {
          stroke_width: 0.2 / Math.sqrt(n)
        });
        curve.set_anchors(dots.map((dot3) => dot3.get_center()));
        for (let i = 0; i < n; i++) {
          dots[i].add_callback(() => {
            curve.set_anchor(i, dots[i].get_center());
          });
        }
        scene.add("curve", curve);
        for (let i = 0; i < n; i++) {
          scene.add(`p${i}`, dots[i]);
        }
        scene.draw();
      }
      let n_slider = Slider(
        document.getElementById(
          "draggable-dot-bezier-num-slider"
        ),
        function(n) {
          make_scene(n);
        },
        {
          name: "Number of points",
          initial_value: "5.0",
          min: 3,
          max: 20,
          step: 1
        }
      );
      n_slider.width = 200;
      make_scene(5);
    })(300, 300);
  });
})();
