import { IVector3, Vector3 } from "../../Vector3";
import { IVoxel } from "../voxel";
import { VoxelModel } from "../voxel.model";

export class TreeBuilder  {
  constructor(private readonly leaves: () => IVoxel,
  private readonly trunk: () => IVoxel){

  }

  public buildAt(basePosition: IVector3, model: VoxelModel) {
    model.setVoxel(basePosition, this.trunk());
    basePosition = Vector3.add(basePosition, Vector3.UP);
    model.setVoxel(basePosition, this.trunk());
    basePosition = Vector3.add(basePosition, Vector3.UP);
    model.setVoxel(basePosition, this.trunk());


    model.setVoxel(Vector3.relative(basePosition, -1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, -2), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 2), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 0, 0, -1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 0, 0, -2), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 0, 0, 1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 0, 0, 2), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 1, 0, -1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, -1, 0, -1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 1, 0, 1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, -1, 0, 1), this.leaves());

    model.setVoxel(Vector3.relative(basePosition, -1, 1, 0), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 0, 1, 0), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 1, 1, 0), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 0, 1, -1), this.leaves());
    model.setVoxel(Vector3.relative(basePosition, 0, 1, 1), this.leaves());

    model.setVoxel(Vector3.relative(basePosition, 0, 2, 0), this.leaves());

  }
}
