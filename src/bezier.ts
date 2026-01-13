import * as np from "numpy-ts";

// TODO Make a smooth Bezier spline class

// Given anchors points P_0, P_1, ..., P_n, computes handles
// B_1, B_2, ..., B_{2n} such that the sequence of Bezier splines
// (P_{i-1}, B_{2i-1}, B_{2i}, P_i) for i = 1, ..., n
// form a smooth curve.
export class SmoothOpenPathBezierHandleCalculator {
  n: number;
  result: np.NDArray;
  constructor(n: number) {
    this.n = n;
    // Calculate and stores the n-by-(n+1) transformation matrix used for
    // computing the first Bezier handles of a sequence of n+1 anchor points,
    // as a function of the n+1 anchor points. This is computed as A^{-1}B,
    // where A is an n-by-n tridiagonal matrix and B is an n-by-(n+1) matrix.

    // Tridiagonal matrix which is to be inverted
    let below_diag_list: number[] = [];
    for (let i = 0; i < n - 2; i++) {
      below_diag_list.push(1.0);
    }
    below_diag_list.push(2.0);
    let below_diag = np.array(below_diag_list);

    let diag_list = [2.0];
    for (let i = 0; i < n - 2; i++) {
      diag_list.push(4.0);
    }
    diag_list.push(7.0);
    let diag = np.array(diag_list);

    let above_diag_list = [];
    for (let i = 0; i < n - 1; i++) {
      above_diag_list.push(1.0);
    }
    let above_diag = np.array(above_diag_list);

    // n-by-(n+1) matrix
    this.result = np.zeros([n, n + 1], "float32");
    this.result.set([0, 0], 1.0);
    this.result.set([0, 1], 2.0);
    for (let i = 1; i < n - 1; i++) {
      this.result.set([i, i], 4.0);
      this.result.set([i, i + 1], 2.0);
    }
    this.result.set([n - 1, n - 1], 8.0);
    this.result.set([n - 1, n], 1.0);

    // Eliminate lower-triangular entries in tridiagonal matrix
    for (let i = 0; i < n - 1; i++) {
      let scale = (below_diag.get([i]) as number) / (diag.get([i]) as number);
      diag.set(
        [i + 1],
        (diag.get([i + 1]) as number) - (above_diag.get([i]) as number) * scale,
      );
      below_diag.set(
        [i],
        (below_diag.get([i]) as number) - (diag.get([i]) as number) * scale,
      );
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i + 1, j],
          (this.result.get([i + 1, j]) as number) -
            (this.result.get([i, j]) as number) * scale,
        );
      }
    }

    // Eliminate upper-triangular entries in tridiagonal matrix
    for (let i = n - 2; i >= 0; i--) {
      let scale =
        (above_diag.get([i]) as number) / (diag.get([i + 1]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i, j],
          (this.result.get([i, j]) as number) -
            (this.result.get([i + 1, j]) as number) * scale,
        );
      }
    }

    // Normalize by diagonal entries in tridiagonal matrix
    for (let i = 0; i < n; i++) {
      let scale = 1 / (diag.get([i]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set([i, j], (this.result.get([i, j]) as number) * scale);
      }
    }
  }
  // Given a sequence of n+1 anchors, produces the corresponding bezier handles
  get_bezier_handles(a: np.NDArray): [np.NDArray, np.NDArray] {
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
        2 * (a.get([i + 1, 0]) as number) - (h1.get([i + 1, 0]) as number),
      );
      h2.set(
        [i, 1],
        2 * (a.get([i + 1, 1]) as number) - (h1.get([i + 1, 1]) as number),
      );
    }
    h2.set(
      [this.n - 1, 0],
      0.5 *
        ((a.get([this.n, 0]) as number) + (h1.get([this.n - 1, 0]) as number)),
    );
    h2.set(
      [this.n - 1, 1],
      0.5 *
        ((a.get([this.n, 1]) as number) + (h1.get([this.n - 1, 1]) as number)),
    );

    return [h1, h2];
  }
}

// Given anchors points P_0, P_1, ..., P_n, computes handles
// B_1, B_2, ..., B_{2n} such that the sequence of Bezier splines
// (P_{i-1}, B_{2i-1}, B_{2i}, P_i) for i = 1, ..., n
// form a smooth curve.
export class SmoothClosedPathBezierHandleCalculator {
  n: number;
  result: np.NDArray;
  constructor(n: number) {
    this.n = n;
    // Calculate and stores the n-by-(n+1) transformation matrix used for
    // computing the first Bezier handles of a sequence of n+1 anchor points,
    // as a function of the n+1 anchor points. This is computed as A^{-1}B,
    // where A is an n-by-n tridiagonal matrix and B is an n-by-(n+1) matrix.

    // Tridiagonal matrix which is to be inverted
    let below_diag = np.ones([n - 1], "float32");

    let diag_list = [3.0];
    for (let i = 0; i < n - 2; i++) {
      diag_list.push(4.0);
    }
    diag_list.push(3.0);
    let diag = np.array(diag_list);

    let above_diag = np.ones([n - 1], "float32");

    // n-by-(n+1) matrix
    this.result = np.zeros([n, n + 1], "float32");
    for (let i = 0; i < n; i++) {
      this.result.set([i, i], 4.0);
      this.result.set([i, i + 1], 2.0);
    }

    // Computation of q, described in extra step below
    let v = np.zeros([n], "float32");
    v.set([0], 1.0);
    v.set([n - 1], 1.0);
    let q = np.zeros([n], "float32");
    q.set([0], 1.0);
    q.set([n - 1], 1.0);

    // Eliminate lower-triangular entries in tridiagonal matrix
    for (let i = 0; i < n - 1; i++) {
      let scale = (below_diag.get([i]) as number) / (diag.get([i]) as number);
      diag.set(
        [i + 1],
        (diag.get([i + 1]) as number) - (above_diag.get([i]) as number) * scale,
      );
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i + 1, j],
          (this.result.get([i + 1, j]) as number) -
            (this.result.get([i, j]) as number) * scale,
        );
      }
      q.set(
        [i + 1],
        (q.get([i + 1]) as number) - (q.get([i]) as number) * scale,
      );
    }

    // Eliminate upper-triangular entries in tridiagonal matrix
    for (let i = n - 2; i >= 0; i--) {
      let scale =
        (above_diag.get([i]) as number) / (diag.get([i + 1]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set(
          [i, j],
          (this.result.get([i, j]) as number) -
            (this.result.get([i + 1, j]) as number) * scale,
        );
      }
      q.set([i], (q.get([i]) as number) - (q.get([i + 1]) as number) * scale);
    }

    // Normalize by diagonal entries in tridiagonal matrix
    for (let i = 0; i < n; i++) {
      let scale = 1 / (diag.get([i]) as number);
      for (let j = 0; j < n + 1; j++) {
        this.result.set([i, j], (this.result.get([i, j]) as number) * scale);
      }
      q.set([i], (q.get([i]) as number) * scale);
    }

    // Extra step: left-multiply the result by (I + qv^t)^{-1} = I - \frac{1}{1 + v^tq} qv^t, where v = [1 0 0 ... 0 1] and q = T^{-1}v
    let m = np
      .eye(this.n)
      .subtract(np.outer(q, v).multiply(1 / (1 + (np.dot(v, q) as number))));
    this.result = m.matmul(this.result);
  }
  // Given a sequence of n+1 anchors, produces the corresponding bezier handles
  get_bezier_handles(a: np.NDArray): [np.NDArray, np.NDArray] {
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
        2 * (a.get([i + 1, 0]) as number) - (h1.get([i + 1, 0]) as number),
      );
      h2.set(
        [i, 1],
        2 * (a.get([i + 1, 1]) as number) - (h1.get([i + 1, 1]) as number),
      );
    }
    h2.set(
      [this.n - 1, 0],
      2.0 * (a.get([0, 0]) as number) - (h1.get([0, 0]) as number),
    );
    h2.set(
      [this.n - 1, 1],
      2.0 * (a.get([0, 1]) as number) - (h1.get([0, 1]) as number),
    );

    return [h1, h2];
  }
}
