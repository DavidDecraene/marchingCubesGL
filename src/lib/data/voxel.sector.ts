import { FlatArray } from "../utils/flat.array";
import { FlattenUtils } from "../utils/flatten.utils";
import { vec3 } from 'gl-matrix';

export class VoxelSector {
  public readonly values: FlatArray;
  public get sectorSize(): vec3 {
    return this.values.dimensions;
  }
  constructor(public readonly key: any, public readonly index: vec3, sectorSize: vec3) {
    this.values = new FlatArray(sectorSize);
  }

  getVoxels() {
    return this.values.values.map((_k, i) => {
      const idx = FlattenUtils.fromIndex(i, this.sectorSize);
      return FlattenUtils.unsplit(this.index, idx as vec3, this.sectorSize);
    });
  }
}
