import { vec3 } from 'gl-matrix';

export const LVecs = {
  add: function(result: vec3, target: vec3) {
      result[0] += target[0];
      result[1] += target[1];
      result[2] += target[2];
      return result;
  },
  rescale: function(value: number, fromRange: Array<number>, toRange: Array<number>) {
    if (!value) { value = 0; }
    const a = (value - fromRange[0]) / (fromRange[1] - fromRange[0]);
    const b = toRange[1] - toRange[0];
    return a * b + toRange[0];
  }
};

export class LVec {
  constructor(public data: Array<number>) {
    this.data = data;
  }

  add(x?: number, y?: number, z?: number) {
    if(x) this.data[0] += x;
    if(y) this.data[1] += y;
    if(z) this.data[2] += z;
    return this;
  }

  calcUv(x: number, y: number, s: number) {
    this.data[3] =  (this.data[x] + s) / (2 * s);
    // problem is: bot left is zero, so 1 becomes zero and zero becomes one
    this.data[4] =  1 - (this.data[y] + s) / (2 * s);
    return this;
  }

  public x(): number;
  public x(y: number): this;
  x(x?: number) {
    if (x === undefined) return this.data[0];
    this.data[0] = x;
    return this;
  }

  public y(): number;
  public y(y: number): this;
  y(y?: number) {
    if (y === undefined) return this.data[1];
    this.data[1] = y;
    return this;
  }


  public z(): number;
  public z(y: number): this;
  z(z?: number) {
    if (z === undefined) return this.data[2];
    this.data[2] = z;
    return this;
  }


  public u(): number;
  public u(y: number): this;
  u(u?: number) {
    if (u === undefined) return this.data[3];
    this.data[3] = u;
    return this;
  }


  public v(): number;
  public v(y: number): this;
  v(v?: number) {
    if (v === undefined) return this.data[4];
    this.data[4] = v;
    return this;
  }

  copy(other: LVec) {
    this.data = other.data.slice();
    return this;
  }

  clone() {
    const data = this.data.slice();
    return new LVec(data);
  }


}
