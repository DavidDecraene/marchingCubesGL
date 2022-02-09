import { vec3 } from 'gl-matrix';
import { Faces, States } from './constants/states';
import { VoxelModel } from './data/voxel.model';
import { BitFlags } from './utils/BitFlag';

export class VoxelState {
  public voxel: any;
  public sides: Array<any>;
  public flag: number;
  private _diagonals: Array<vec3> | undefined;
  private _diagonalVoxels: Array<any> | undefined;

  constructor(public vector: vec3, public readonly model: VoxelModel) {
    this.voxel = this.model.getVoxel(vector);
    const front = this.model.getRelative(vector, Faces.FRONT.vector);
    const back = this.model.getRelative(vector, Faces.BACK.vector);
    const top = this.model.getRelative(vector, Faces.TOP.vector);
    const bottom = this.model.getRelative(vector, Faces.BOTTOM.vector);
    const right = this.model.getRelative(vector, Faces.RIGHT.vector);
    const left = this.model.getRelative(vector, Faces.LEFT.vector);
    this.sides = [front, back, top, bottom, right, left];
    let flag = 0;
    this.sides.forEach((side, i) => {
      if (side) { flag = BitFlags.set(flag, 1 << i); }
    });
    this.flag = flag;
  }

  diagonal(a: number, b: number, voxels: boolean) {
    const dia = this.diagonals(voxels);
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


  diagonals(voxels: boolean) {
    if (this._diagonals) {
      return voxels ? this._diagonalVoxels : this._diagonals;
    }
    const vector = this.vector;
    this._diagonals = [
      vec3.fromValues(vector[0] + 1, vector[1], vector[2] + 1), // Front Right 0
      vec3.fromValues(vector[0] + 1, vector[1], vector[2] - 1), // right back 1
      vec3.fromValues(vector[0] - 1, vector[1], vector[2] - 1), // back left 2
      vec3.fromValues(vector[0] - 1, vector[1], vector[2] + 1), // left front 3
      vec3.fromValues(vector[0], vector[1] + 1, vector[2] + 1), // Front top 4
      vec3.fromValues(vector[0], vector[1] + 1, vector[2] - 1), // top back 5
      vec3.fromValues(vector[0], vector[1] - 1, vector[2] - 1), // back bot 6
      vec3.fromValues(vector[0], vector[1] - 1, vector[2] + 1), // bot front 7
      vec3.fromValues(vector[0] + 1, vector[1] + 1, vector[2]), // right top 8
      vec3.fromValues(vector[0] - 1, vector[1] + 1, vector[2]), // top left 9
      vec3.fromValues(vector[0] - 1, vector[1] - 1, vector[2]), // left bot 10
      vec3.fromValues(vector[0] + 1, vector[1] - 1, vector[2]), // bot right 11
      ];
    let dflag = 0;
    this._diagonalVoxels= this._diagonals.map((v, i) => {
      const side = this.model.getVoxel(v);
      if (side) { dflag = BitFlags.set(dflag, 1 << i); }
      return side;
    });
    // br, brb, blb, bl
    return voxels ? this._diagonalVoxels : this._diagonals;
  }
}
