export interface IVector2 {
  x: number;
  y: number;
}

class Vector2Specs  {
  public of(x = 0, y = 0): IVector2 {
    return {x, y };
  }

  public from(arr: Array<number>): IVector2 {
    let [x, y] = arr;
    return {x : x || 0, y: y || 0 };
  }

  public clone(v: IVector2){
    return {x: v.x, y: v.y };
  }
}

export const Vector2 = new Vector2Specs();
