import { SideType } from "../../constants/states";
import { IVector3 } from "../Vector3";
import { IVoxel } from "./voxel";
import { VoxelType } from "./voxel.type";

export interface VoxelSide {
  side: SideType;
  voxel: IVoxel | undefined;
  position: IVector3;
  type: VoxelType | undefined;
  light: number;
}
