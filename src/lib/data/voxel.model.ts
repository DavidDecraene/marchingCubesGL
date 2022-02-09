import { vec3 } from 'gl-matrix';
import { FlattenUtils } from '../utils/flatten.utils';
import { IVector3 } from './Vector3';
import { VoxelSector } from './voxel.sector';

export class VoxelModel {
  public readonly sectors = new Map<string, VoxelSector>();
  constructor(public readonly sectorSize: vec3) {
  }

  public getSectors(): Array<VoxelSector> {
    return Array.from(this.sectors.values());
  }

  public vectorKey(vector: vec3) {
    return vector[0]+ '_' + vector[1] + '_' + vector[2];
  }

  public setVoxel(vector: vec3, data: any) {
    const spl = FlattenUtils.split(vector, this.sectorSize);
    const sectorKey = this.vectorKey(spl.outer);
    let sector = this.sectors.get(sectorKey);
    if(!sector) {
      sector = new VoxelSector(sectorKey, spl.outer, this.sectorSize);
      this.sectors.set(sectorKey, sector);
    }
    return sector.values.setData(spl.inner, data);
  }

  public getVoxel(vector: vec3) {
    const spl = FlattenUtils.split(vector, this.sectorSize);
    const sectorKey = this.vectorKey(spl.outer);
    const sector = this.sectors.get(sectorKey);
    if(!sector) return undefined;
    // console.log(Object.keys(sector.values.values));
    return sector.values.getData(spl.inner);
    // Outer => from sectors
    // Inner => from retrieval
  }

  public getRelative(v: vec3, offset: IVector3) {
    return this.getVoxel(vec3.fromValues(v[0] + offset.x, v[1] + offset.y, v[2] + offset.z));
  }
}
