import { Polygon } from "./Polygon";
import { vec4 } from 'gl-matrix';
import { LVec } from "../utils/lvec";
import { TriangleBuilder } from "../builder/triangle.builder";
import { TexCoords } from "./TexCoords";

export class Triangle extends Polygon {
  private d_t: Array<number>;
  private d_l: Array<number>;
  private d_r: Array<number>;
  private _t: LVec | undefined;
  private _l: LVec | undefined;
  private _r: LVec | undefined;

  get t() {
    if (!this._t) this._t = new LVec(this.d_t);
    return this._t;
  }

  get l() {
    if (!this._l) this._l = new LVec(this.d_l);
    return this._l;
  }

  get r() {
    if (!this._r) this._r = new LVec(this.d_r);
    return this._r;
  }

  constructor(t: LVec | Array<number>, l: LVec | Array<number>, r: LVec | Array<number>) {
    super();
    this.d_t = t instanceof LVec ? t.data.slice() : t.slice();
    this.d_l = l instanceof LVec ? l.data.slice() : l.slice();
    this.d_r = r instanceof LVec ? r.data.slice() : r.slice();
    this.points = [  this.d_t,   this.d_l,   this.d_r];
  }

  add(x: number, y: number, z: number) {
    this.t.add(x, y, z);
    this.l.add(x, y, z);
    this.r.add(x, y, z);
    return this;
  }

  calcUv(x: number, y: number, s: number) {
    this.t.calcUv(x, y, s);
    this.l.calcUv(x, y, s);
    this.r.calcUv(x, y, s);
    return this;
  }

  clone() {
      return new Triangle(this.d_t, this.d_l, this.d_r);
  }

  appendTo(triBuilder: TriangleBuilder, color: vec4, textC: TexCoords) {
    triBuilder.append(this.d_t,this.d_l,this.d_r,color, textC);
  }
}
