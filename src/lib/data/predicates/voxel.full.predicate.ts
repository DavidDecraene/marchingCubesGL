import { IVoxel } from "../voxels/voxel";
import { VoxelTypes } from "../voxels/voxel.types";
import { Predicate } from "./Predicate";

export class VoxelLayerPredicate implements Predicate<IVoxel> {

  constructor(public readonly voxelTypes: VoxelTypes,
    public readonly layer: number){

  }

  public filter(voxel: IVoxel): IVoxel | undefined {
    if(!this.test(voxel)) return undefined;
    return voxel;
  }

  public test(voxel: IVoxel  | undefined): boolean {
    if(!voxel) return false;
    const type = this.voxelTypes.getType(voxel.type);
    if (!type) return false;
    return type.layer === this.layer;
  }
}
