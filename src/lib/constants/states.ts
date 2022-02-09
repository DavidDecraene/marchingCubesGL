import { IVector3, Vector3 } from "../data/Vector3";

export const States = {
    front: 0,
    back: 1,
    top: 2,
    bottom: 3,
    right: 4,
    left: 5

};

export const StateFlag = {
  FRONT: 1 << 0,
  BACK: 1 << 1,
  TOP: 1 << 2,
  BOTTOM: 1 << 3,
  LEFT: 1 << 4,
  RIGHT: 1 << 5
};

export interface FaceType {
  side: number;
  flag: number;
  vector: IVector3;
  flanks: Array<number>;
}

export const Faces = {
  FRONT: {
    side: States.front,
    flag: StateFlag.FRONT,
    vector: Vector3.of(0, 0, 1),
    flanks: [2, 3, 4, 5], // top, bot, right, left,
  },
  BACK: {
    side: States.back,
    flag: StateFlag.BACK,
    vector: Vector3.of(0, 0, -1),
    flanks: [2, 3, 5, 4], // top, bot, right, left,
  },
  TOP: {
    side: States.top,
    flag: StateFlag.TOP,
    vector: Vector3.of(0, 1, 0),
    flanks: [1, 0, 4, 5], // top, bot, right, left,
  },
  BOTTOM: {
    side: States.bottom,
    flag: StateFlag.BOTTOM,
    vector: Vector3.of(0, -1, 0),
    flanks: [0, 1, 4, 5], // top, bot, right, left,
  },
  RIGHT: {
    side: States.right,
    flag: StateFlag.RIGHT,
    vector: Vector3.of(1, 0, 0),
    flanks: [2, 3, 1, 0], // top, bot, right, left,
  },
  LEFT: {
    side: States.left,
    flag: StateFlag.LEFT,
    vector: Vector3.of(-1, 0, 0),
    flanks: [2, 3, 0, 1], // top, bot, right, left,
  }
}


export const voxels = {
  FRONT: 1 << 0,
  BACK: 1 << 1,
  TOP: 1 << 2,
  BOTTOM: 1 << 3,
  LEFT: 1 << 4,
  RIGHT: 1 << 5
};
