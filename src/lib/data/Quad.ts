import { Polygon } from "./Polygon";
import { vec4 } from 'gl-matrix';
import { LVec } from "../utils/lvec";
import { QuadBuilder } from "../builder/quad.builder";
import { ITexCoord } from "./TexCoords";

export class Quad extends Polygon {
  private d_bl: Array<number>;
  private d_br: Array<number>;
  private d_ur: Array<number>;
  private d_ul: Array<number>;
  private _ul: LVec | undefined;
  private _ur: LVec | undefined;
  private _bl: LVec | undefined;
  private _br: LVec | undefined;

  get ul() {
    if (!this._ul) this._ul = new LVec(this.d_ul);
    return this._ul;
  }

  get ur() {
    if (!this._ur) this._ur = new LVec(this.d_ur);
    return this._ur;
  }

  get br() {
    if (!this._br) this._br = new LVec(this.d_br);
    return this._br;
  }

  get bl() {
    if (!this._bl) this._bl = new LVec(this.d_bl);
    return this._bl;
  }

  constructor(public readonly s: number, other?: Quad) {
    super();
    this.d_bl = other ? other.d_bl.slice() : [-s, -s, s, 0, 0];
    this.d_br = other ? other.d_br.slice() : [s, -s, s, 0, 1];
    this.d_ur = other ? other.d_ur.slice() : [s, s, s, 1, 1];
    this.d_ul = other ? other.d_ul.slice() : [-s, s, s, 1, 0];
    this.points = [this.d_bl, this.d_br, this.d_ur, this.d_ul];
  }

  calcUv(x: number, y: number, s: number): this {
    //return this;
    this.ul.calcUv(x, y, s);
    this.ur.calcUv(x, y, s);
    this.bl.calcUv(x, y, s);
    this.br.calcUv(x, y, s);
    return this;
  }

  add(x?: number, y?: number, z?: number): this {
    this.ul.add(x, y, z);
    this.bl.add(x, y, z);
    this.br.add(x, y, z);
    this.ur.add(x, y, z);
    return this;
  }

  clone(cb?: (q: Quad) => void): Quad {
    const clone =  new Quad(this.s, this);
    if (cb) { cb(clone); }
    return clone;
  }

  appendTo(quadBuilder: QuadBuilder, color: vec4, textC: ITexCoord) {
    quadBuilder.append(this.d_bl,this.d_br,this.d_ur,this.d_ul, color, textC);
  }
}
