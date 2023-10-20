import { Layers } from "../../../constants/states";
import { VoxelSide } from "../voxel.neighbour";

export interface ITypeFilter {
  acceptSide(voxelData: VoxelSide): boolean;
}

export class SolidFilter implements ITypeFilter {

  acceptSide(voxelData: VoxelSide): boolean {
    if(!voxelData.voxel || !voxelData.type) return false;
    return voxelData.type.layer === Layers.solid;
  }

}

export class TransparencyFilter implements ITypeFilter {

  acceptSide(voxelData: VoxelSide): boolean {
    if(!voxelData.voxel || !voxelData.type) return false;
    return true;
  }
}
