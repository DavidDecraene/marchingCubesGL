import { vec3 } from 'gl-matrix';
import { VoxelModel } from './voxel.model';

export class VoxelSet {
  public readonly values: Array<{v: vec3, d: any}> = [];
  constructor() {
    this.values = [];
  }

  translate(x?: number, y?: number, z?: number) {
    this.values.forEach(v => {
      v.v[0] += x ? x : 0;
      v.v[1] += y ? y : 0;
      v.v[2] += z ? z : 0;
    });
  }

  setVoxel(vector: vec3, data: any) {
    this.values.push({ v: vector, d: data});
  }

  appendTo(model: VoxelModel) {
    this.values.forEach(v => {
      model.setVoxel(v.v, v.d);
    });
  }
}
