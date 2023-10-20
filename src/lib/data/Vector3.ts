import { Mathf } from "wombat-math";
import { IVector2 } from "./Vector2";


export const kEpsilon = 0.00001;
export const kEpsilonNormalSqrt = 1e-15;

export interface IVector3 extends IVector2 {
  z: number;
}

export class ReadonlyVector3 implements IVector3 {
  public get x(): number {
    return this._x;
  }
  public get y(): number {
    return this._y;
  }
  public get z(): number {
    return this._z;
  }
  constructor(private _x = 0, private _y = 0, private _z = 0) {

  }
}

class Vector3Specs  {

  public readonly UP = new ReadonlyVector3(0, 1, 0);


  public lerp(a: IVector3, b: IVector3, t: number, clamp = true): IVector3
  {
      if(clamp) { t = Mathf.clamp(t, 0, 1); }
      return {
          x: Mathf.lerp(a.x, b.x, t),
          y:   Mathf.lerp(a.y, b.y, t),
          z: Mathf.lerp(a.z, b.z, t)
      };
  }

  public angleRad(from: IVector3, to: IVector3): number
  {
      // sqrt(a) * sqrt(b) = sqrt(a * b) -- valid for real numbers
      const denominator = Math.sqrt(Vector3.sqrMagnitude(from) * Vector3.sqrMagnitude(to));
      if (Math.abs(denominator ) < kEpsilonNormalSqrt)
          return 0;

      const dot = Mathf.clamp(Vector3.dot(from, to) / denominator, -1, 1);
      return Math.acos(dot);
  }

  public angle(from: IVector3, to: IVector3): number
  {
      return this.angleRad(from, to) * (180/Math.PI);
  }

  public of(x = 0, y = 0, z = 0, out?: IVector3): IVector3 {
    if (out) {
      out.x = x;
      out.y = y;
      out.z = z;
      return out;
    }
    return {x, y , z};
  }

  public relative(v1: IVector3, x = 0, y = 0, z = 0): IVector3 {
    return {x: v1.x + x, y: v1.y + y, z: v1.z + z};
  }

  public asArray(v1: IVector3): [number, number, number] {
    return [v1.x, v1.y, v1.z];
  }

  public from(arr: Array<number> | Float32Array): IVector3 {
    const x = arr.length ? arr[0] : 0;
    const y = arr.length > 1 ? arr[1] : 0;
    const z = arr.length > 2 ? arr[2] : 0;
    return {x : x || 0, y: y || 0 , z: z || 0};
  }

  public copyTo(source: IVector3, target: IVector3){
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
  }

  public clone(v: IVector3){
    return {x: v.x, y: v.y, z: v.z };
  }

  public min(v1: IVector3, v2: IVector3, out: IVector3 = {x:0, y:0 , z:0}): IVector3 {
    out.x = Math.min(v1.x, v2.x);
    out.y = Math.min(v1.y, v2.y);
    out.z = Math.min(v1.z, v2.z);
    return out;
  }

  public max(v1: IVector3, v2: IVector3, out: IVector3 = {x:0, y:0 , z:0}): IVector3 {
    out.x = Math.max(v1.x, v2.x);
    out.y = Math.max(v1.y, v2.y);
    out.z = Math.max(v1.z, v2.z);
    return out;
  }

  public add(v1: IVector3, v2: IVector3, out: IVector3 = {x:0, y:0 , z:0}): IVector3 {
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
    out.z = v1.z + v2.z;
    return out;
  }

  public multiply(v1: IVector3, v2: IVector3, out: IVector3 = {x:0, y:0 , z:0}): IVector3 {
    out.x = v1.x * v2.x;
    out.y = v1.y * v2.y;
    out.z = v1.z * v2.z;
    return out;
  }

  public equals(v1: IVector3, v2: IVector3): boolean {
    if(v1.x != v2.x) return false;
    if(v1.y != v2.y) return false;
    if(v1.z != v2.z) return false;
    return true;
  }

  public subtract(v1: IVector3, v2: IVector3, out: IVector3 = {x:0, y:0 , z:0}): IVector3 {
    out.x = v1.x - v2.x;
    out.y = v1.y - v2.y;
    out.z = v1.z - v2.z;
    return out;
  }

  public sqrMagnitude(v1: IVector3): number {
    return v1.x * v1.x + v1.y * v1.y + v1.z * v1.z;
  }

  public magnitude(v1: IVector3): number {
    return Math.sqrt(this.sqrMagnitude(v1));
  }

  public toString(v1: IVector3): string {
    return v1.x + '_' + v1.y + '_' + v1.z;
  }

  public cross(v1: IVector3, v2: IVector3, out: IVector3 = {x:0, y:0 , z:0}): IVector3  {

      const lx = v1.y * v2.z - v1.z * v2.y;
      const ly = v1.z * v2.x - v1.x * v2.z;
      const lz = v1.x * v2.y - v1.y * v2.x;
      out.x = lx;
      out.y = ly;
      out.z = lz;
      return out;
  }


  public dot(v1: IVector3, v2: IVector3): number  {
      return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  public divide(v1: IVector3, v2: IVector3, out: IVector3 = {x:0, y:0 , z:0}): IVector3  {

      out.x = v2.x ? v1.x/v2.x : 0;
      out.y = v2.y ? v1.y/v2.y : 0;
      out.z = v2.z ? v1.z/v2.z : 0;
      return out;
  }

  public normalize(v1: IVector3, local = true): IVector3 {
      const mag = this.magnitude(v1);
      const target = local ? v1 : this.clone(v1);
      if (mag < kEpsilon){
        target.x = 0;
        target.y = 0;
        target.z = 0;
      } else {
        target.x /= mag;
        target.y /= mag;
        target.z /= mag;
      }
      return target;
  }

}

export const Vector3 = new Vector3Specs();

export class ObservableVector3 implements IVector3 {
  private vec: [number, number, number] ;

  public get x(): number {
    return this.vec[0];
  }

  public get y(): number {
    return this.vec[1];
  }

  public get z(): number {
    return this.vec[2];
  }

  public set x(v: number) {
    if (v === this.vec[0]) return;
    this.dirty = true;
    this.vec[0] = v;
  }

  public set y(v: number) {
    if (v === this.vec[1]) return;
    this.dirty = true;
    this.vec[1] = v;
  }

  public set z(v: number) {
    if (v === this.vec[2]) return;
    this.dirty = true;
    this.vec[2] = v;
  }

  constructor( x = 0,
    y = 0,
    z = 0,
    public dirty = true  ){
      this.vec = [x, y, z];

  }

  public consume(): boolean {
    if (!this.dirty) return false;
    this.dirty = false;
    return true;
  }

  public vec3(): [number, number, number] {
    return this.vec;
  }

}
