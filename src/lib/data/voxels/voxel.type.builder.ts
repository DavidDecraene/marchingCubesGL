import { Layers, States } from "../../constants/states";
import { ArrayCoord } from "../TexCoords";
import { ITypeFilter, SolidFilter, TransparencyFilter } from "./builders/side.filter";
import { VoxelType } from "./voxel.type";

export class ArrayTypeBuilder {
  private values: Array<number>;
  private _filter: ITypeFilter | undefined;
  private _layer = 0;
  constructor(baseTexture: number){
    this.values = [
      baseTexture,// front
      baseTexture,//back
      baseTexture,//top
      baseTexture,//bot
      baseTexture,//right
      baseTexture//left
    ]
  }

  private set(i: number, v: number): this {
    this.values[i] = v;
    return this;
  }

  transparent(): this {
    this._layer = Layers.transparent;
    this._filter =  new TransparencyFilter();
    return this;
  }

  bottom(texture: number): this {
    this.set(States.bottom, texture);
    return this;
  }


  top(texture: number): this {
    this.set(States.top, texture);
    return this;
  }

  sides(texture: number): this {
    this.set(States.front, texture);
    this.set(States.back, texture);
    this.set(States.left, texture);
    this.set(States.right, texture);
    return this;
  }

  build(type: number): VoxelType {
    const filter = this._filter || new SolidFilter();
    return new VoxelType(type,
      this.values.map(v => new ArrayCoord(v)),
      this._layer,
      filter);
  }

}
