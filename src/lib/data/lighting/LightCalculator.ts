import { FlattenUtils } from "../../utils/flatten.utils";
import { IVector3, Vector3 } from "../Vector3";
import { VoxelSector } from "../voxels/voxel.sector";

interface StateData {
  sector: VoxelSector;
  lightData: Array<number>;
}

export class LightCalculator {


  private getIndex(sector: VoxelSector, v: IVector3): number | undefined {
    const idx = FlattenUtils.toIndex(v, sector.sectorSize);
    if (idx < 0) return undefined;
    return idx;
  }

  private spread(data:StateData, value: number, child: IVector3, parent?: IVector3) {
    if(value <= 0) return;
    const idx  = this.getIndex(data.sector, child);
    if (idx === undefined) return;
    const d = data.lightData[idx];
    if(d !== undefined && d >= value) return;
    data.lightData[idx] = value;

    if (value <= 1) return;

    const nvalue = value - 1;

    let v = Vector3.relative(child, 1, 0, 0);
    if (!parent || !Vector3.equals(v, parent)) {
      this.spread(data, nvalue, v, child);
    }
    v = Vector3.relative(child, -1, 0, 0);
    if (!parent || !Vector3.equals(v, parent)) {
      this.spread(data, nvalue, v, child);
    }
    v = Vector3.relative(child, 0, 0, 1);
    if (!parent || !Vector3.equals(v, parent)) {
      this.spread(data,nvalue, v, child);
    }
    v = Vector3.relative(child, 0, 0, -1);
    if (!parent || !Vector3.equals(v, parent)) {
      this.spread(data, nvalue, v, child);
    }
    v = Vector3.relative(child, 0, -1, 0); // down
    if (!parent || !Vector3.equals(v, parent)) {
      this.spread(data, value === 15 ? value : nvalue, v, child);
    }
    v = Vector3.relative(child, 0, 1, 0);
    if (!parent || !Vector3.equals(v, parent)) {
      this.spread(data, nvalue, v, child);
    }
  }


  public calculate(sector: VoxelSector): Array<number> {
    const lightData: Array<number> = [];
    // iterate over the sector boundaries.. (top, left, right, front back)
    const queue: Array<IVector3> = [];
    for(let x=0;x<sector.sectorSize.x; x++){
      for(let z=0;z<sector.sectorSize.z; z++){
        queue.push(Vector3.of(x, sector.sectorSize.y - 1, z));
      }
    }
    // front and back
    for(let x=0;x<sector.sectorSize.x; x++){
      for(let y=0;y<sector.sectorSize.y - 1; y++){
        //queue.push(Vector3.of(x, y, 0));
        queue.push(Vector3.of(x, y, sector.sectorSize.z - 1));
      }
    }
    // left and right
    for(let z=1;z<sector.sectorSize.z-1; z++){
      for(let y=0;y<sector.sectorSize.y - 1; y++){
        queue.push(Vector3.of(0, y, z));
        //queue.push(Vector3.of(sector.sectorSize.x - 1, y, z));
      }
    }

    while(queue.length) {
      const n = queue.shift() as IVector3;
      const idx = this.getIndex(sector, n);
      if(idx === undefined) continue;
      const voxel = sector.getVoxel(n);
      if (voxel) {
        // TODO: transparent
        lightData[idx] = 0;
        // dont spread
      } else {
        this.spread({ sector, lightData }, 15, n);
        // floodfill
      }

    }
    return lightData;

  }
}
