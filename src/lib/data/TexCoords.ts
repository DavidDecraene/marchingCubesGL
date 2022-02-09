import { IVector2 } from "./Vector2";

export class TexCoords {

  constructor(public readonly x: number,
    public readonly y: number, public readonly width: number){

  }

  public map(coords: IVector2): IVector2 {
    const x = this.rescale(coords.x, this.x, this.x + this.width);
    const y = this.rescale(coords.y, this.y, this.y + this.width);
    return {x, y};
  }


  private rescale(value: number, min: number, max: number): number {
    if (!value) { value = 0; }
    return value * ( max - min) + min;
  }

}
