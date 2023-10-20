import { ExtendedStates, SideType, States } from "../constants/states";
import { IVector3 } from "../data/Vector3";
import { VoxelState } from "../data/voxels/voxel.state";

export class AOCalculater {

  public side = 0;
  public state: VoxelState | undefined;

  public getLightLevel(defaultValue = 0) {
    if (!this.state) return defaultValue;
    const s = this.state.sides[this.side];
    return s? s.light : defaultValue;
  }

  public calculateOcclusion(vertex: IVector3): number {
    if (!this.state) return 0;
    switch(this.side){
      case States.front:
        return this.calculateFront(vertex, this.state);
      case States.back:
        return this.calculateBack(vertex, this.state);
      case States.left:
        return this.calculateLeft(vertex, this.state);
      case States.right:
        return this.calculateRight(vertex, this.state);
      case States.top:
        return this.calculateTop(vertex, this.state);
      case States.bottom:
        return this.calculateBottom(vertex, this.state);
    }
    return 0;
  }

  private vertexAO(side1: number, side2: number, corner: number): number {
    if(side1 && side2) return 0;
    return 3 - (side1 + side2 + corner);
  }

  private voxelAO(state: VoxelState, side1: SideType,
    side2: SideType,
    corner: SideType): number {
    const v1 = state.calcSide(side1)?.voxel;
    const v2 = state.calcSide(side2)?.voxel;
    const v3 = state.calcSide(corner)?.voxel;
    return this.vertexAO(v1 === undefined ? 0 : 1, v2 === undefined ? 0 : 1, v3 === undefined ? 0 : 1)
  }

  private calculateBottom(vertex: IVector3, state: VoxelState): number {
    if (vertex.z > 0) {
      if (vertex.x > 0) {
        return this.voxelAO(state, ExtendedStates.DF, ExtendedStates.DR, ExtendedStates.DRF);
      }
      return this.voxelAO(state, ExtendedStates.DF, ExtendedStates.DL, ExtendedStates.DLF);
    }
    if (vertex.x > 0) {
      return this.voxelAO(state, ExtendedStates.DB, ExtendedStates.DR, ExtendedStates.DRB);
    }
    return this.voxelAO(state, ExtendedStates.DB, ExtendedStates.DL, ExtendedStates.DLB);
  }

  private calculateTop(vertex: IVector3, state: VoxelState): number {
    if (vertex.z > 0) {
      if (vertex.x > 0) {
        return this.voxelAO(state, ExtendedStates.UF, ExtendedStates.UR, ExtendedStates.URF);
      }
      return this.voxelAO(state, ExtendedStates.UF, ExtendedStates.UL, ExtendedStates.ULF);
    }
    if (vertex.x > 0) {
      return this.voxelAO(state, ExtendedStates.UB, ExtendedStates.UR, ExtendedStates.URB);
    }
    return this.voxelAO(state, ExtendedStates.UB, ExtendedStates.UL, ExtendedStates.ULB);
  }

  private calculateRight(vertex: IVector3, state: VoxelState): number {
    if (vertex.y > 0) {
      if (vertex.z > 0) {
        return this.voxelAO(state, ExtendedStates.UR, ExtendedStates.RF, ExtendedStates.URF);
      }
      return this.voxelAO(state, ExtendedStates.UR, ExtendedStates.RB, ExtendedStates.URB);
    }
    if (vertex.z > 0) {
      return this.voxelAO(state, ExtendedStates.DR, ExtendedStates.RF, ExtendedStates.DRF);
    }
    return this.voxelAO(state, ExtendedStates.DR, ExtendedStates.RB, ExtendedStates.DRB);
  }

  private calculateLeft(vertex: IVector3, state: VoxelState): number {
    if (vertex.y > 0) {
      if (vertex.z > 0) {
        return this.voxelAO(state, ExtendedStates.UL, ExtendedStates.LF, ExtendedStates.ULF);
      }
      return this.voxelAO(state, ExtendedStates.UL, ExtendedStates.LB, ExtendedStates.ULB);
    }
    if (vertex.z > 0) {
      return this.voxelAO(state, ExtendedStates.DL, ExtendedStates.LF, ExtendedStates.DLF);
    }
    return this.voxelAO(state, ExtendedStates.DL, ExtendedStates.LB, ExtendedStates.DLB);
  }

  private calculateBack(vertex: IVector3, state: VoxelState): number {
    if (vertex.y > 0) {
      if (vertex.x > 0) {
        // topright
        return this.voxelAO(state, ExtendedStates.UB, ExtendedStates.RB, ExtendedStates.URB);

      } else {
        //topleft
        return this.voxelAO(state, ExtendedStates.UB, ExtendedStates.LB, ExtendedStates.ULB);
      }
    } else {
      if (vertex.x > 0) {
        //botright
        return this.voxelAO(state, ExtendedStates.DB, ExtendedStates.RB, ExtendedStates.DRB);
      } else {
        //botleft
        return this.voxelAO(state, ExtendedStates.DB, ExtendedStates.LB, ExtendedStates.DLB);
      }
    }
  }

  private calculateFront(vertex: IVector3, state: VoxelState): number {
    if (vertex.y > 0) {
      if (vertex.x > 0) {
        // topright
        // voxels: frontup, frontright, frontrightup.
        return this.voxelAO(state, ExtendedStates.UF, ExtendedStates.RF, ExtendedStates.URF);

      } else {
        //topleft
        // voxels: frontup, frontleft, frontleftup
        return this.voxelAO(state, ExtendedStates.UF, ExtendedStates.LF, ExtendedStates.ULF);
      }
    } else {
      if (vertex.x > 0) {
        //botright
        // frontbot, frontright, frontbotright
        return this.voxelAO(state, ExtendedStates.DF, ExtendedStates.RF, ExtendedStates.DRF);
      } else {
        //botleft
        return this.voxelAO(state, ExtendedStates.DF, ExtendedStates.LF, ExtendedStates.DLF);
      }
    }
  }
}
