import { IVector2 } from "./Vector2";
import { IVector3 } from "./Vector3";

export interface ITexCoord {
  map(coords: IVector2): IVector3;
}


export class ArrayCoord implements ITexCoord {
  constructor(public readonly index: number){

  }

  public map(coords: IVector2): IVector3 {
    const x = coords.x;
    const y = coords.y;
    return {x, y, z: this.index};
  }
}

export class TexCoord implements ITexCoord {

  constructor(public readonly x: number,
    public readonly y: number, public readonly width: number){

  }

  public map(coords: IVector2): IVector3 {
    const x = this.rescale(coords.x, this.x, this.x + this.width);
    const y = this.rescale(coords.y, this.y, this.y + this.width);
    return {x, y, z: 0};
  }


  private rescale(value: number, min: number, max: number): number {
    if (!value) { value = 0; }
    return value * ( max - min) + min;
  }

}
