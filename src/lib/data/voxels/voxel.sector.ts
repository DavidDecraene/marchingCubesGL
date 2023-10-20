import { FlattenUtils } from "../../utils/flatten.utils";
import { IVoxel } from "./voxel";
import { IVector3, Vector3 } from "../Vector3";


export interface VoxelData {
  voxel: IVoxel;
  position: IVector3;
}

export class VoxelSector {
  public readonly values = new Map<number, VoxelData>();

  public lightData: Array<number> = [];

  public get worldPosition(): IVector3 {
    return Vector3.multiply(this.index, this.sectorSize);
  }

  public get voxelCount(): number {
    return this.values.size;
  }


  constructor(public readonly key: any,
    public readonly index: IVector3,
    public readonly sectorSize: IVector3) {
  }



  public getLightLevel(localVector: IVector3, defaultValue = 0): number {
    const index = FlattenUtils.toIndex(localVector, this.sectorSize);
    if (index < 0 ) return defaultValue;
    return this.lightData[index];
  }




  public setData(indexV: IVector3, data: VoxelData | undefined) {
    const index = FlattenUtils.toIndex(indexV, this.sectorSize);
    if (index < 0 ) return false;
    if (!data){
      this.values.delete(index);
      return;
    }
    this.values.set(index, data);
    return true;
  }

  public getVoxel(vector: IVector3): IVoxel | undefined {
    const index = FlattenUtils.toIndex(vector, this.sectorSize);
    if (index < 0 ) return undefined;
    return this.values.get(index)?.voxel;
  }
}
