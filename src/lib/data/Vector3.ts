import { IVector2 } from "./Vector2";
import { vec3 } from 'gl-matrix';

export interface IVector3 extends IVector2 {
  z: number;
}

class Vector3Specs  {
  public of(x = 0, y = 0, z = 0): IVector3 {
    return {x, y , z};
  }

  public from(arr: Array<number> | vec3): IVector3 {
    const x = arr.length ? arr[0] : 0;
    const y = arr.length > 1 ? arr[1] : 0;
    const z = arr.length > 2 ? arr[2] : 0;
    return {x : x || 0, y: y || 0 , z: z || 0};
  }

  public clone(v: IVector3){
    return {x: v.x, y: v.y, z: v.z };
  }
}

export const Vector3 = new Vector3Specs();
