import { FlattenUtils } from '../../utils/flatten.utils';
import { IVector3, Vector3 } from '../Vector3';
import { IVoxel } from './voxel';
import { VoxelSector } from './voxel.sector';
import { VoxelTypes } from './voxel.types';

export class VoxelModel {
  public readonly sectors = new Map<string, VoxelSector>();
  public readonly minBounds = Vector3.of(0, 0, 0);
  public readonly maxBounds = Vector3.of(0, 0, 0);
  constructor(public readonly sectorSize: IVector3, public readonly types: VoxelTypes) {
  }

  public getSectors(): Array<VoxelSector> {
    return Array.from(this.sectors.values());
  }

  public getSector(sectorPos: IVector3, create = false): VoxelSector | undefined {
    const sectorKey = Vector3.toString(sectorPos);
    let sector =  this.sectors.get(Vector3.toString(sectorPos));
    if (!sector && create) {
      sector = new VoxelSector(sectorKey, sectorPos, this.sectorSize);
      this.sectors.set(sectorKey, sector);
    }
    return sector;
  }

  public setVoxel(position: IVector3, voxel: IVoxel) {
    Vector3.min(this.minBounds, position, this.minBounds);
    Vector3.max(this.maxBounds, position, this.maxBounds);
    const spl = FlattenUtils.split(position, this.sectorSize);
    const sector = this.getSector(spl.outer, true);
    if(sector) sector.setData(spl.inner, { position, voxel });
  }

  public getVoxel(vector: IVector3): IVoxel | undefined {
    const spl = FlattenUtils.split(vector, this.sectorSize);
    const sector = this.getSector(spl.outer);
    if(!sector) return undefined;
    // console.log(Object.keys(sector.values.values));
    return sector.getVoxel(spl.inner);
  }

  public getRelative(v: IVector3, offset: IVector3): IVoxel | undefined {
    return this.getVoxel(Vector3.add(v, offset));
  }
}
