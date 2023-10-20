import { VoxelType } from "./voxel.type";

export class VoxelTypes {

  private map = new Map<number, VoxelType>();

  public addType(t: VoxelType): void {
    if(this.map.has(t.type)) throw "duplicate type";
    this.map.set(t.type, t);
  }

  public getType(n: number): VoxelType | undefined {
    return this.map.get(n);
  }



}
