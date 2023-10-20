import { Faces, FaceType, SideType, States } from '../../constants/states';
import { IVector3, Vector3 } from '../Vector3';
import { BitFlag } from "wombat-math";
import { IVoxel } from './voxel';
import { VoxelModel } from './voxel.model';
import { VoxelType } from './voxel.type';
import { VoxelSide } from './voxel.neighbour';
import { FlattenUtils } from '../../utils/flatten.utils';


const diagonals = [
  Vector3.of(1, 0, 1), // Front Right 0
  Vector3.of( 1, 0,  - 1), // right back 1
  Vector3.of( - 1, 0,  - 1), // back left 2
  Vector3.of( - 1, 0,   1), // left front 3
  Vector3.of(0,   1,   1), // Front top 4
  Vector3.of(0,   1,  - 1), // top back 5
  Vector3.of(0,  - 1,  - 1), // back bot 6
  Vector3.of(0 ,  - 1,   1), // bot front 7
  Vector3.of(   1,   1, 0), // right top 8
  Vector3.of(  - 1,   1, 0), // top left 9
  Vector3.of(  - 1,  - 1, 0), // left bot 10
  Vector3.of(   1,  - 1, 0), // bot right 11
  ];



export class VoxelState {
  public flag: number;
  private _diagonalVoxels: Array<IVoxel | undefined> | undefined;
  public readonly sides: Array<VoxelSide> = [];

  constructor(public vector: IVector3,
    public readonly model: VoxelModel,
    public voxelType: VoxelType) {
    this.calcSide(Faces.FRONT);
    this.calcSide(Faces.BACK);
    this.calcSide(Faces.TOP);
    this.calcSide(Faces.BOTTOM);
    this.calcSide(Faces.RIGHT);
    this.calcSide(Faces.LEFT);
    let flag = 0;
    this.sides.forEach((side) => {
      const accepted = voxelType.sideFilter.acceptSide(side);
      if (accepted) {
        flag = BitFlag.set(flag, side.side.flag);
      }
    });
    this.flag = flag;
  }

  public calcSide(side: SideType): VoxelSide {
    const existing = this.sides[side.side];
    if(existing) return existing;
    const position = Vector3.add(this.vector, side.vector);
    const spl = FlattenUtils.split(position, this.model.sectorSize);
    const sector = this.model.getSector(spl.outer);

    const voxel = sector ? sector.getVoxel(spl.inner) : undefined;
    const type = voxel ? this.model.types.getType(voxel.type) : undefined;
    const light = sector ? sector.getLightLevel(spl.inner) : 15;
    const data = { voxel, side, type, light, position};
    this.sides[side.side] = data;
    return data;

  }

  diagonal(a: number, b: number): IVoxel | undefined {
    const dia = this.diagonals();
    if(!dia) return;
    if (a === States.front) { // front [2, 3, 4, 5];  tbrl
      if (b === States.top) return dia[4];
      if (b === States.bottom) return dia[7];
      if (b === States.right) return dia[0];
      if (b === States.left) return dia[3];
      return undefined;
    }
    if (a === States.back) {
      if (b === States.top) return dia[5];
      if (b === States.bottom) return dia[6];
      if (b === States.right) return dia[1];
      if (b === States.left) return dia[2];
      return undefined;
    }
    if (a === States.top) {
      if (b === States.back) return dia[5];
      if (b === States.front) return dia[4];
      if (b === States.right) return dia[8];
      if (b === States.left) return dia[9];
      return undefined;
    }
    if (a === States.bottom) {
      if (b === States.back) return dia[6];
      if (b === States.front) return dia[7];
      if (b === States.right) return dia[11];
      if (b === States.left) return dia[10];
      return undefined;
    }
    if (a === States.right) {
      if (b === States.back) return dia[1];
      if (b === States.front) return dia[0];
      if (b === States.top) return dia[8];
      if (b === States.bottom) return dia[11];
      return undefined;
    }
    if (a === States.left) {
      if (b === States.back) return dia[2];
      if (b === States.front) return dia[3];
      if (b === States.top) return dia[9];
      if (b === States.bottom) return dia[10];
      return undefined;
    }
    return undefined;
  }


  diagonals(): Array<IVoxel | undefined> {
    if (this._diagonalVoxels) {
      return this._diagonalVoxels;
    }
    let dflag = 0;
    this._diagonalVoxels= diagonals.map((v, i) => {
      const side = this.model.getRelative(this.vector, v);
      if (side) { dflag = BitFlag.set(dflag, 1 << i); }
      return side;
    });
    // br, brb, blb, bl
    return this._diagonalVoxels;
  }
}
